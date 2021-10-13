const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: String,
        required: true
    },
    image: {type: String},
    likes:{
        type: Number,
        required: false,
        default: 0
    }
})

module.exports = mongoose.model('MenuItem', menuItemSchema)