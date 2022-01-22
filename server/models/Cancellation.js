const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cancellationSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    packages: [{
        packageId: {
            type: ObjectId,
            ref: "Package"
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
        shippingCharge: {
            type: Number
        },
        cancelAmount: {
            type: Number,
            require: true
        }
    }],
    paymentId: {
        type: ObjectId,
        ref: "Payment"
    },
    paymentType: {
        type: String,
        require: true
    },
    paymentStatus: {
        type: String,
        require: true,
        default: 'notpaid'
    },
    totalCancelAmount: {
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

mongoose.models.Cancellation || mongoose.model('Cancellation', cancellationSchema)