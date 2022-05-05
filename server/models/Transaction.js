const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    packageId: {
        type: ObjectId,
        ref: "Package"
    },
    transType: {
        type: String,
        require: true,
        enum: [
            "orderTotal",
            "orderClam", // calm item price if seller's product loss or damage after handover to bcdigital or bcdigital hub or shipping partner
            "shippingFeePaidByCustomer",
            "shippingFeePaidBySeller",
            "shippingFeePaidByAdmin",
            "shippingClam",
            "paymentFee",
            "commission",
            "reversalCommission", // commission have to back to seller on product return
            "returnOrderTotal",
        ]
    },
    comment: {
        type: String
    },
    amount: {
        type: Number,
        require: true
    },
    createdBy: {  // paidby
        type: ObjectId,
        ref: "Users"
    },
    createdForUser: { // seller/admin(commission)
        type: ObjectId,
        ref: "Users"
    },
    createdForShippingAgent: { // shipping charge have to paid to shippingAgent
        type: ObjectId,
        ref: "ShippingAgent"
    },
    createdForString: {
        type: String,
    },
    returnId: {
        type: ObjectId,
        ref: "Return"
    },
    returnOrderStatus: {
        type: String,
        default: 'not_approved'
    },
    reversalCommissionStatus: {
        type: String,
        default: 'not_approved'
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
}, { timestamps: true });

mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)