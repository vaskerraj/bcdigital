const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const returnSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    packageId: {
        type: ObjectId,
        ref: "Package"
    },
    trackingId: {
        type: String,
        require: true
    },
    products: [{
        productId: {
            type: ObjectId,
            ref: "Product"
        },
        productQty: {
            type: Number,
            require: true
        },
        price: {
            type: Number,
            require: true
        },
        reason: {
            type: String,
            require: true
        }
    }],
    paymentId: {
        type: ObjectId,
        ref: "Payment"
    },
    totalReturnAmount: {
        type: Number,
        require: true
    },
    requestBy: {
        type: ObjectId,
        ref: 'Users'
    },
    status: {
        type: String,
        enum: [
            "progress",
            "complete",
            "denide"
        ]
    },
    statusLog: [{
        status: {
            type: String,
            enum: [
                "progress",
                "complete",
                "denide"
            ]
        },
        reason: {
            type: String
        },
        statusChangeBy: {
            type: ObjectId,
            ref: 'Users'
        },
        statusChangeDate: {
            type: Date
        }
    }],
}, { timestamps: true });

mongoose.models.Return || mongoose.model('Return', returnSchema)