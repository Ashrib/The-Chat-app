import express from "express"
import path from 'path';
import cors from 'cors';
import mongoose from "mongoose"
import cookieParser from "cookie-parser";
import authApis from './routes/auth.mjs'
import productApis from './routes/product.mjs';
import jwt from 'jsonwebtoken';
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi"
import { userModel,otpModel,tweetModel,messageModel } from './routes/dbmodels.mjs'
import { Server as socketIo } from 'socket.io';
import { createServer } from "http";
import cookie from 'cookie';



const SECRET = process.env.SECRET || "mySecret"
const app = express()
const port = process.env.PORT || 3000
const mongodbURI = process.env.mongodbURI || "mongodb+srv://dbuser1:123mypassword@cluster0.m20zxpk.mongodb.net/dbuser1?retryWrites=true&w=majority"
mongoose.connect(mongodbURI);
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3001', '*'],
    credentials: true

}));

app.use('/api/v1', authApis)
app.use('/api/v1',(req, res, next) => {

    console.log("req.cookies: ", req.cookies);

    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "include http-only credentials with every request"
        })
        return;
    }

    jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
        if (!err) {

            console.log("decodedData: ", decodedData);

            const nowDate = new Date().getTime() / 1000;

            if (decodedData.exp < nowDate) {

                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true
                });
                res.send({ message: "token expired" })

            } else {

                console.log("token approved");

                req.body.token = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})
app.use("/api/v1",productApis)

const getUser = async (req, res) => {

    let _id = "";
    if (req.params.id) {
        _id = req.params.id
    } else {
        _id = req.body.token._id
    }

    try {
        const user = await userModel.findOne({ _id: _id }).exec()
        if (!user) {
            res.status(404).send({})
            return;
        } else {
            res.status(200).send(user)
        }

    } catch (error) {

        console.log("error: ", error);
        res.status(500).send({
            message: "something went wrong on server",
        });
    }
}


app.get('/api/v1/profile', getUser)
app.get('/api/v1/profile/:id', getUser)

app.post('/api/v1/change-password', async (req, res) => {

    try {
        const body = req.body;
        const currentPassword = body.currentPassword;
        const newPassword = body.password;
        const _id = req.body.token._id

        // check if user exist
        const user = await userModel.findOne(
            { _id: _id },
            "password",
        ).exec()

        if (!user) throw new Error("User not found")

        const isMatched = await varifyHash(currentPassword, user.password)
        if (!isMatched) throw new Error("Invalid Password")

        const newHash = await stringToHash(newPassword);

        await userModel.updateOne({ _id: _id }, { password: newHash }).exec()

        // success
        res.send({
            message: "password changed success",
        });
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send(error.message)
    }

})

app.post("/api/v1/updateProfileImg", async (req, res) =>{
    try{
        const body = req.body;
        const _id = req.body.token._id;
        const profileImage = body.profileImage
        const email = req.body.token.email

        const user = await userModel.findOne(
            { _id: _id },
            "profileImage",
        ).exec()

        const userTweets = await userModel.findOne(
            { _id: _id },
            "profilePhoto",
        ).exec()

        if (!user && !userTweets) throw new Error("User not found")
        
        await userModel.updateOne({ _id: _id }, { profileImage: profileImage }).exec()
        await tweetModel.updateMany({ email: email }, { profilePhoto: profileImage }).exec()

        res.send({
            message: "profile image changed success",
        });
        return;

    }

    catch (error) {
        console.log("error: ", error);
        res.status(500).send(error.message)
    }


})

app.post("/api/v1/uploadCoverPhoto", async (req, res) =>{
    try{
        const body = req.body;
        const _id = req.body.token._id;
        const coverPhoto = body.coverPhoto

        const user = await userModel.findOne(
            { _id: _id },
            "coverPhoto",
        ).exec()
        if (!user) throw new Error("User not found")

        await userModel.updateOne({ _id: _id }, { coverPhoto: coverPhoto }).exec()
  
        res.send({
            message: "cover image changed success",
        });
      
        return;

    }

    catch (error) {
        console.log("error: ", error);
        res.status(500).send(error.message)
    }


})

app.put("/api/v1/deleteCoverPhoto", async (req, res) =>{
    try{
        const body = req.body;
        const _id = req.body.token._id;

        const user = await userModel.findOne(
            { _id: _id },
        ).exec()
        if (!user){
            throw new Error("User not found") 
            

        }
        else{
            let data = await userModel.findByIdAndUpdate(_id,
                {
                    coverPhoto: "",
                  
                },
                { new: true }
            ).exec();
    
            console.log('updated: ', data);
    
            res.send({
                message: "cover image remove success",
            });
        }



  
        
      
        return;

    }

    catch (error) {
        console.log("error: ", error);
        res.status(500).send(error.message)
    }


})

app.delete('/api/v1/deleteAccount/:deleteAccountEmail', (req, res) => {
    const email = req.params.deleteAccountEmail
    userModel.deleteOne({
        email: email,
        owner: new mongoose.Types.ObjectId(req.body.token._id)

    }, (err, deletedData) => {
        console.log("deleted: ", deletedData);
        if (!err) {

            if (deletedData.deletedCount !== 0) {
                res.send({
                    message: "Account has been deleted successfully",
                })
            } else {
                res.status(404);
                res.send({
                    message: "No Account found with this email: " + email,
                });
            }
        } else {
            res.status(500).send({
                message: "server error"
            })
        }
    });
  

    
})


app.get('/api/v1/users', async (req, res) => {

    const myId = req.body.token._id

    try {
        const q = req.query.q;
        console.log("q: ", q);

        let query;

        if (q) {
            query = userModel.find({ $text: { $search: q } })
        } else {
            query = userModel.find({}).limit(20)
        }

        const users = await query.exec();

        const modifiedUserList = users.map(eachUser => {

            let user = {
                _id: eachUser._id,
                firstName: eachUser.firstName,
                lastName: eachUser.lastName,
                email: eachUser.email,
                profileImg:eachUser.profileImage,
                isOnline:eachUser.isOnline
            }

            if (eachUser._id.toString() === myId) {

                console.log("matched");
                user.me = true
                user.firstName = "Me"
                user.lastName = "(You)"

                return user;
            } else {
                return user;
            }
        })

        res.send(modifiedUserList);

    } catch (e) {
        console.log("Error: ", e);
        res.send([]);
    }
})

app.post('/api/v1/message', async (req, res) => {

    if (
        !req.body.text ||
        !req.body.to
    ) {
        res.status("400").send("invalid input")
        return;
    }

    const sent = await messageModel.create({
        from: req.body.token._id,
        to: req.body.to,
        text: req.body.text
    })

    console.log("sent: ", sent)
    
    const populatedMessage = await messageModel
        .findById(sent._id)
        .populate({ path: 'from', select: 'firstName lastName email' })
        .populate({ path: 'to', select: 'firstName lastName email' })
        .exec();


    io.emit(`${req.body.to}-${req.body.token._id}`, populatedMessage)
    io.emit(`personal-channel-${req.body.to}`, populatedMessage)

    console.log("populatedMessage: ", populatedMessage)

    res.send("message sent successfully");
})

app.get('/api/v1/messages/:id', async (req, res) => {

    const messages = await messageModel.find({
        $or: [
            {
                from: req.body.token._id,
                to: req.params.id
            },
            {
                from: req.params.id,
                to: req.body.token._id,
            }
        ]
    })
        .populate({ path: 'from', select: 'firstName lastName email' })
        .populate({ path: 'to', select: 'firstName lastName email' })
        .limit(100)
        .sort({ _id: -1 })
        .exec();

    res.send(messages);

})

app.post('/api/v1/deleteMsgForMe', async (req, res) => {
    try {
        const body = req.body;
        const _id = body._id;
        console.log("Msg ID " , _id)

        const messages = await messageModel.findOne(
            { _id: _id },
            "visibility",
        ).exec()
        if (!messages) throw new Error("Message not found")

        await messageModel.updateOne({ _id: _id }, { visibility: false }).exec()
  
        res.send({
            message: "Message Visibility Change Success",
        });
        return;

        
    } catch (error) {
        res.status(500).send(error.message)
        
    }

})



const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './product/build')))
app.use('*', express.static(path.join(__dirname, './product/build')))


// THIS IS THE ACTUAL SERVER WHICH IS RUNNING
const server = createServer(app);

// handing over server access to socket.io
const io = new socketIo(server, {
    cors: {
        origin: ["http://localhost:3001", "https://chat-app-with-socketio-production.up.railway.app"],
        credentials: true
    }
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

io.on("connection", (socket) => {
    console.log("New client connected with id: ", socket.id);

    if (typeof socket?.request?.headers?.cookie !== "string") {
        console.log("cookie was not found");
        socket.disconnect(true)
        return;
    }

    let cookieData = cookie.parse(socket?.request?.headers?.cookie);
    console.log("cookieData: ", cookieData);

    if (!cookieData?.Token) {
        console.log("Token not found in cookie");
        socket.disconnect(true)
        return;
    }

    jwt.verify(cookieData?.Token, SECRET, function (err, decodedData) {
        if (!err) {
            console.log("decodedData: ", decodedData);
            const nowDate = new Date().getTime() / 1000;
            if (decodedData.exp < nowDate) {
                socket.disconnect(true)
            }
        } else {
            socket.disconnect(true)
        }
    });


    // to emit data to a certain client
    socket.emit("topic 1", "some data")

    // collecting connected users in a array
    // connectedUsers.push(socket)

    socket.on("disconnect", (message) => {
        console.log("Client disconnected with id: ", message);
    });
});




