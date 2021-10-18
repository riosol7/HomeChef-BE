const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chef',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true
    },
    image: {type: String},
    likes:{
        type: Number,
        required: false,
        default: 0
    },
    tags:String
}, {timestamp:true})

module.exports = mongoose.model('Item', itemSchema)