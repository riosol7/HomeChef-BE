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
        firstName: { type: String },
        lastName: { type: String },
        address: {
            street: String,
            apt: String,
            city: String,
            zip: String,
            state: String,
            lat: Number,
            lng: Number,
        },
        phone: { type: Number },
        deliveryInstructions: {type: String}
    },
    chefs: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Chef'
    }],
    status:{
        type: String,
        default: 'Pending'
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
    subTotal: {
        type: Number
    },
    tip: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number
    },
    note: { type: String }
}, {timestamp:true})

module.exports = mongoose.model('Order', orderSchema)