const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [{
        item: {
            type: Object,
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
            type: Object,
            required: true
        },
    },
    chefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chef',
    },
    chefName: {
        type: String,
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