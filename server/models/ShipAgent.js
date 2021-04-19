const mongoose = require('mongoose');

const shipAgentSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    number: {
        type: String,
        require: true,
    },
    address: {
        type: String,
        require: true,
    },
    panNo: {
        type: String,
        require: true,
        unique: true
    },
    minDeliveryTime: {
        Type: String,
    },
    maxDeliveryTime: {
        Type: String,
    },
    status: {
        type: String,
    },
}, { timestamps: true });

mongoose.models.ShippingAgent || mongoose.model('ShippingAgent', shipAgentSchema)

