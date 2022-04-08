const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const inoviceSchema = new mongoose.Schema({
    sellerId: {
        type: ObjectId,
        ref: "Users"
    },
    dateFrom: {
        type: Date,
        require: true
    },
    dateTo: {
        type: Date,
        require: true
    },
    paymentStatus: {
        type: String,
        default: "not_paid"
    },
    paymentDate: {
        type: Date
    },
    paymentBy: {
        type: ObjectId,
        ref: "Users"
    },
    paymentAmount: {
        type: Number
    }

}, { timestamps: true });

mongoose.models.SellerInvoiceDates || mongoose.model('SellerInvoiceDates', inoviceSchema)