import express from 'express'
import {userModel,otpModel,otpModelViaSms} from './dbmodels.mjs'
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi"
import jwt from "jsonwebtoken"
import { nanoid, customAlphabet } from 'nanoid'
import moment from 'moment';
// import sgMail from "@sendgrid/mail"
// import postmark from "postmark"
import Mailjet from "node-mailjet"

const SECRET = process.env.SECRET || "mySecret"
const router = express.Router()
// const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ||"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"
// const API_KEY = "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"
// sgMail.setApiKey(SENDGRID_API_KEY)
const MJ_API_TOKEN = process.env.MJ_API_TOKEN || "b34352494fa04346a919d7fcd7419e9e"
let mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || '54c01c68b8569bb96670e48ce47cd866',
    apiSecret: process.env.MJ_APIKEY_PRIVATE || 'a4cbb09573f67cd7155f77fdd5e7e6f2'
  });

router.post("/signup", (req, res) => {

    let body = req.body;

    if (!body.firstName
        || !body.lastName
        || !body.email
        || !body.password
    ) {
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("user: ", user);

            if (user) { // user already exist
                console.log("user already exist: ", user);
                res.status(400).send({ message: "User already exist, Please try a different email" });
                return;

            } else { // user not already exist

                // bcrypt hash
                stringToHash(body.password).then(hashString => {

                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        profileImage:body?.profileImage,
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("data saved: ", result);
                                res.status(201).send({ message: "user is created" });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send({ message: "Internal server error" });
                            }
                        });
                })

            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })
});



router.post("/login",(req, res) => {

    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    // check if user exist
    userModel.findOne(
        { email: body.email},
        "firstName lastName email password isOnline",
        (err, data) => {
            if (!err) {
                console.log("data: ", data);

                if (data) { // user found
                    varifyHash(body.password, data.password).then(isMatched => {

                        console.log("isMatched: ", isMatched);

                        if (isMatched) {

                            const token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);

                            console.log("token: ", token);

                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true,
                                sameSite:"none",
                                secure:true,
                                
                            });
                            userModel.updateOne({ email: body?.email }, { isOnline: true }).exec()


                            res.send({
                                message: "login successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    _id: data._id,
                                }
                            });
                            return;
                        } else {
                            console.log("password did not match");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })

                } else { // user not already exist
                    console.log("user not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "login failed, please try later" });
                return;
            }
        })
})

router.post("/logout", async (req, res) => {

    try{
        const body = req.body
        console.log("user id ",body.email)
        const users = await userModel.findOne(
            { email: body.email },
            "isOnline",
        ).exec()
        if (!users) throw new Error("User not found") 
        await userModel.updateOne({ email: body.email }, { isOnline: false }).exec()

        res.clearCookie('Token',{
            httpOnly: true,
            sameSite:"none",
            secure:true,
        })
        res.send({ message: "Logout successful" });

        return

    }

    catch (error){
        res.status(500).send({
            message: error.message
        })

    }
   

})


router.post('/forget-password', async (req, res) => {
    try {

        let body = req.body;
        body.email = body.email.toLowerCase();

        if (!body.email) { // null check - undefined, "", 0 , false, null , NaN
            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                }`
            );
            return;
        }

        // check if user exist
        const user = await userModel.findOne(
            { email: body.email },
            "firstName lastName email",
        ).exec()

        if (!user) throw new Error("User not found")

        const nanoid = customAlphabet('1234567890', 5)
        const OTP = nanoid();
        const otpHash = await stringToHash(OTP)

        console.log("OTP: ", OTP);
        console.log("otpHash: ", otpHash);

        otpModel.create({
            otp: otpHash,
            email: body.email, 
        });

        // TODO: send otp via email //sendGrid 
        // const msg = {
        //     to: body.email, // Change to your recipient
        //     from: 'cocobutter128@gmail.com', // Change to your verified sender
        //     subject: 'Verify your OTP',
        //     text: OTP,
        //     html: `<strong>${OTP}</strong>`,
        //   }
        //   sgMail
        //     .send(msg)
        //     .then(() => {
        //       console.log('Email sent')
        //       res.send({
        //         message: "OTP sent success"
        //     });

         
        //     })
        //     .catch((error) => {
        //       console.error(error)
        //     })

        // TODO: send otp via email // postmark
        // let serverToken = "a2e7934d-5a2b-4ba8-9fd6-19daeb9e6d4c";
        // let client = new postmark.ServerClient(serverToken);

        // client.sendEmail({
        //     "From": "c1h1r6@ebarg.net",
        //     "To": "c1h1r6@ebarg.net",
        //     "Subject": "Verify your OTP",
        //     "TextBody": OTP
        //     })  
        //         .then(() => {
        //             console.log('Email sent')
        //             res.send({
        //                 message: "OTP sent success"
        //             });
        //         })
        //         .catch((error) => {
        //             console.error(error)
        //         });

        

         // TODO: send otp via email // malijet
         const mailjet = Mailjet.apiConnect(
           "54c01c68b8569bb96670e48ce47cd866",
           "a4cbb09573f67cd7155f77fdd5e7e6f2",
        );
        
        const request = mailjet
                .post('send', { version: 'v3.1' })
                .request({
                  Messages: [
                    {
                      From: {
                        Email: "cocobutter128@gmail.com",
                        Name: "Twitter App"
                      },
                      To: [
                        {
                          Email: body.email,
                        }
                      ],
                      Subject: "Check Your OTP",
                      TextPart: "Your OTP Is:",
                      HTMLPart: `<h3>${OTP}</h3>`
                    }
                  ]
                })
        
        request
            .then((result) => {
                console.log(result.body)
                res.send({
                    message: "OTP sent success"
                 });
            })
            .catch((err) => {
                console.log(err.statusCode)
            })

    
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }


})
router.post('/forget-password-via-sms', async (req, res) => {
    try {

        let body = req.body;
        body.email = body.email.toLowerCase();
        

        if (!body.email || !body.number) { // null check - undefined, "", 0 , false, null , NaN
            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "number":"0000000000"
                }`
            );
            return;
        }

        // check if user exist
        const user = await userModel.findOne(
            { email: body.email },
            "firstName lastName email",
        ).exec()

        if (!user) throw new Error("User not found")

        const nanoid = customAlphabet('1234567890', 5)
        const OTP = nanoid();
        const otpHash = await stringToHash(OTP)

        console.log("OTP: ", OTP);
        console.log("otpHash: ", otpHash);

        otpModelViaSms.create({
            otp: otpHash,
            email: body.email, 
            number:body.number
        });

    
         // TODO: send otp via sms // malijet
//          const mailjet = Mailjet.smsConnect("b34352494fa04346a919d7fcd7419e9e", {
//             config: {
//               version: 'v4'
//             }
//           });
        
//           const request = mailjet
//           .post('sms-send')
//           .request({
//             Text: `Hey${user.firstName, user.lastName}! Please verify your OTP`,
//             To: body.number,
//             From: "Twitter Admin"
//           })
  
//   request
//           .then((result) => {
//             console.log(result.body)
//             res.send({
//                 message: "OTP sent success"
//              });
//           })
//           .catch((err) => {
//             console.log(err.statusCode)
//           })

    
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }


})


router.post('/forget-password-2', async (req, res) => {
    try {

        let body = req.body;
        body.email = body.email.toLowerCase();

        if (
            !body.email
            || !body.otp
            || !body.newPassword
        ) { // null check - undefined, "", 0 , false, null , NaN

            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "otp": "12345",
                    "newPassword": "someSecretString",
                }`
            );
            return;
        }

        // check if otp exist
        const otpRecord = await otpModel.findOne(
            {
                email: body.email,
            }
        )
            .sort({ _id: -1 })
            .exec()


        if (!otpRecord) throw new Error("Invalid Opt")
        if (otpRecord.isUsed) throw new Error("Invalid Otp")

        await otpRecord.update({ isUsed: true }).exec();

        console.log("otpRecord: ", otpRecord);
        console.log("otpRecord: ", moment(otpRecord.createdOn));

        const now = moment();
        const optCreatedTime = moment(otpRecord.createdOn);
        const diffInMinutes = now.diff(optCreatedTime, "minutes")

        console.log("diffInMinutes: ", diffInMinutes);
        if (diffInMinutes >= 5) throw new Error("Invalid Otp")



        const isMatched = await varifyHash(body.otp, otpRecord.otp)
        if (!isMatched) throw new Error("Invalid OTP")

        const newHash = await stringToHash(body.newPassword);

        await userModel.updateOne(
            { email: body.email },
            { password: newHash }
        ).exec()



        // success
        res.send({
            message: "password updated success",
        });
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }



})


export default router