const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chef',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
})

module.exports = mongoose.model('Menu', menuSchema)