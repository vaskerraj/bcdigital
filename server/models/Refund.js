const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    cancellationId: {
        type: ObjectId,
        ref: "Cancellation"
    },
    amount: {
        type: String,
        require: true
    },
    refundType: {
        type: String,
        enum: [
            "cancel",
            "return",
        ],
        require: true
    },
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
        require: true
    },
    refundTo: {
        type: ObjectId,
        ref: "Users"
    },
    esewaId: {
        type: String,
    },
    account: {
        title: {
            type: String
        },
        number: {
            type: String
        },
        bankName: {
            type: String,
        },
        branch: {
            type: String,
        },
        chequeFile: {
            type: String
        },
    },
    status: {
        type: String,
        enum: [
            "justin",
            "progress",
            "complete",
            "denide"
        ],
        default: "justin"
    },
    statusLog: [{
        status: {
            type: String,
            enum: [
                "justin",
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

mongoose.models.Refund || mongoose.model('Refund', orderSchema)