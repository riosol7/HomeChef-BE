const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false
    },
}, {timestamp:true})

module.exports = mongoose.model('Order', orderSchema)