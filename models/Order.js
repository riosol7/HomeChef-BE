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
        total: {
            type: Number,
            required: true
        }
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
            street: String,
            apt: String,
            city: String,
            zip: String,
            state: String,
            lat: Number,
            lng: Number,
        },
    },
    chefs: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Chef'
    }],
    status:{
        type: String,
        default: 'Not Accepted'
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
    grandTotal: {
        type: Number
    },
    note: { type: String }
}, {timestamp:true})

module.exports = mongoose.model('Order', orderSchema)