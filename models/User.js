const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user:{
        type: String,
        required:true,
        unique: true,
    },
    password: { 
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: false
    },
    firstName: { type: String },
    lastName: { type: String },
    address: {
        street: String,
        apt: String,
        city: String,
        zip: String,
        state: String,
        lat: Number,
        lng: Number,
    },
    phone: { type: Number },
    cart: [{
        _id: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Item'
        },
        item: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Item',
        },
        qty: {
            type: Number,
            default: 0  
        },
    }]
},
{
    toJSON: {
      virtuals: true,
      // ret is the returned Mongoose document
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    id: false,
},
 {timestamps:true}
)

module.exports = mongoose.model("User", userSchema);
