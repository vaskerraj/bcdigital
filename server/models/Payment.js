const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    packageId: {
        type: ObjectId,
        ref: "Package" // for cash for delivery as per package 
    },
    amount: {
        type: Number,
        require: true
    },
    paymentType: {
        type: String,
        require: true
    },
    transactionId: {
        type: String,
        require: true
    },
    paidBy: {
        type: ObjectId,
        ref: 'Users',
        require: true
    },
    paymentStatus: {
        type: String,
        default: 'fair'
    }
}, { timestamps: true });

mongoose.models.Payment || mongoose.model('Payment', paymentSchema)