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
        unique: true
    },
    description: {
        type: String,
        required: false,
    },
    options: [mongoose.Schema.Types.Mixed],
    price: {
        type: Number,
        required: true
    },
    image: {type: String},
    timeDuration: {
        type: String,
        required: true
    },
    likeTotal:{
        type: Number,
        default: 0,
    },
    likes:[String],
    tags:[String],
    QA:[mongoose.Schema.Types.Mixed],
    reviews:[mongoose.Schema.Types.Mixed],
}, {timestamp:true})

module.exports = mongoose.model('Item', itemSchema)