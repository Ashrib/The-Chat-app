import mongoose from "mongoose"


let twitterSchema = new mongoose.Schema({
    text: {type:String, required: true},
    createdOn: { type: Date, default: Date.now },
    owner: { type: mongoose.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
    image: { type: String },
    ownerName:{ type: String },
    profilePhoto: { type: String },
    userFirstName: {type:String},
    userLastName: {type:String},
    email:{type:String}

});
export const tweetModel = mongoose.model('Tweets', twitterSchema);


const messagesSchema = new mongoose.Schema({
    from: { type: mongoose.ObjectId, ref: 'Users', required: true },
    to: { type: mongoose.ObjectId, ref: 'Users', required: true },
    text: { type: String, required: true },
    imageUrl: { type: String },
    createdOn: { type: Date, default: Date.now },
    visibility:{type:Boolean, default:true}
});
messagesSchema.index({ text: 'text' });
export const messageModel = mongoose.model('Messages', messagesSchema);

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profileImage:{type:String},
    coverPhoto:{type:String},
    createdOn: { type: Date, default: Date.now },
    isOnline:{type:Boolean, default:false}

});
userSchema.index({ firstName: 'text', lastName: 'text' });
export const userModel = mongoose.model('Users', userSchema);

const otpSchema = new mongoose.Schema({
    otp: String,
    email: String,
    isUsed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model('Otps', otpSchema);

const otpSchemaViaSms = new mongoose.Schema({
    otp: String,
    email: String,
    number:Number,
    isUsed: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now },
});
export const otpModelViaSms = mongoose.model('Otps-with-SMS', otpSchemaViaSms);



/////////////////////////////////////////////////////////////////////////////////////////////////

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");

});

mongoose.set('strictQuery', true);


mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////