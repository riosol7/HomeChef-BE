const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [{
        item: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'Item',
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
    }],
    user: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        address: { 
            type: String,
            required: true
        },
    },
    chef: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Chef',
    },
    date: {
        type: String,
        default: Date.now,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    note: { type: String }
}, {timestamp:true})

module.exports = mongoose.model('Order', orderSchema)