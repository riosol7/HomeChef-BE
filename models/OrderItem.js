const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    },
    note: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model('OrderItem', orderItemSchema)