const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        lat: Number,
        lng: Number
    },
    phone: {
        type: Number,
        required: false
    },
    image: {type: String},
    bio: {type: String},
    availability: {type: String},
    rating: {type: Number, default:0},
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }], 
}, {timestamps: true})

module.exports = mongoose.model('Chef', chefSchema)