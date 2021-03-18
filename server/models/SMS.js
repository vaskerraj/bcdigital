const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
    mobile: {
        type: String,
        requred: true,
        index: true
    },
    code: {
        type: String,
        required: true,
    },
    method: String,
    isVerify: {
        type: String,
        default: false
    },
    status: {
        type: String,
        default: 'active'
    },
}, { timestamps: true });

mongoose.models.Sms || mongoose.model('Sms', smsSchema)

