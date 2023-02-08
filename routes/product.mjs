import express from 'express';
import {tweetModel } from './dbmodels.mjs'
import mongoose from 'mongoose';

const router = express.Router()

router.post('/tweet', (req, res) => {
    const body = req.body;
   
  if ( // validation
      !body.text
      
  ) {
      res.status(400).send({
          message: "required parameters missing",
      });
      return;
  }

  console.log(body)

    tweetModel.create({
        text:body.text,
        image:body.image,
        profilePhoto:body.profilePhoto,
        userFirstName:body.userFirstName,
        userLastName:body.userLastName,
        email:body.email,
        owner: new mongoose.Types.ObjectId(body.token._id)
    },
        (err, saved) => {
            if (!err) {
                console.log(saved);
                res.send({
                    message: "Tweet posted successfully"
                });
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })

})

router.get('/tweets', (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.body.token._id);

    tweetModel.find(
        { owner: userId },
        {},
        {
            sort: { "_id": -1 },
            limit: 50,
            skip: 0,
            populate:
            {
                path: "owner",
                select: 'firstName lastName email profileImage'
            }
        }
        , (err, data) => {
            if (!err) {
                res.send({
                    message: "got all tweets successfully",
                    data: data
                })
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        });
 
})

router.get('/tweetFeed', (req, res) => {
    const page = req.query.page || 0

    tweetModel.find(
        { isDeleted: false },
        {},
        {
            sort: { "_id": -1 },
            limit: 50,
            skip: 0,
            populate:
            {
                path: "owner",
                select: 'firstName lastName email'
            }
        }
        , (err, data) => {
            if (!err) {
                res.send({
                    message: "got all tweets successfully",
                    data: data
                })
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        });
})

router.get('/tweet/:id', (req, res) => {

    const id = req.params.id;

    tweetModel.findOne({ _id: id }, (err, data) => {
        if (!err) {
            if (data) {
                res.send({
                    message: `Get tweet by id: ${data._id} success`,
                    data: data
                });
            } else {
                res.status(404).send({
                    message: "Tweet not found",
                })
            }
        } else {
            res.status(500).send({
                message: "server error"
            })
        }
    });
})

router.delete('/tweet/:ids', (req, res) => {
    const id =req.params.ids;
    tweetModel.deleteOne({
        _id: id,
        owner: new mongoose.Types.ObjectId(req.body.token._id)

    }, (err, deletedData) => {
        console.log("deleted: ", deletedData);
        if (!err) {

            if (deletedData.deletedCount !== 0) {
                res.send({
                    message: "tweet has been deleted successfully",
                })
            } else {
                res.status(404);
                res.send({
                    message: "No tweet found with this id: " + id,
                });
            }
        } else {
            res.status(500).send({
                message: "server error"
            })
        }
    });


    
})

router.put('/tweet/:editId', async (req, res) => {

    const body = req.body;
    const id = req.params.editId;

    if ( // validation
        !body.text
     
    ) {
        res.status(400).send({
            message: "required parameters missing"
        });
        return;
    }

    try {
        let data = await tweetModel.findByIdAndUpdate(id,
            {
                text: body.text,
              
            },
            { new: true }
        ).exec();

        console.log('updated: ', data);

        res.send({
            message: "Tweet modified successfully"
        });

    } catch (error) {
        res.status(500).send({
            message: "server error"
        })
    }
})

export default router