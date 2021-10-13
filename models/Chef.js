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
    phone: {
        type: String,
        required: false
    },
    image: {type: String},
    bio: {type: String},
    availability: {type: String},
    rating: {type: Number, default:0},
    points:{type: Number, default: 0} 
}, {timestamps: true})

module.exports = mongoose.model('Chef', chefSchema)