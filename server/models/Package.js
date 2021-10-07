const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const packageSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: "Order"
    },
    trackingId: {
        type: String
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
        orderStatus: {
            type: String,
            default: 'not_confirmed',
            enum: [
                "not_confirmed",
                "confirmed",
                "cancelled_by_user",
                "cancelled_by_seller",
                "cancelled_by_admin",
                "packed",
                "shipped",
                "reached_at_city",
                "for_delivery",
                "delivered",
                "return_request",
                "return_approve",
                "return_denide",
                "return_pick",
                "return_shipped",
                "return_delivered",
                "cancel_request",
                "cancel_approve",
                "cancel_denide",
            ]
        },
        orderStatusLog: [{
            status: {
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
    }],
    paymentType: {
        type: String,
        require: true
    },
    paymentStatus: {
        type: String,
        require: true,
        default: 'notpaid'
    },
    payementDate: {
        type: Date
    },
    seller: {
        type: ObjectId,
        ref: "Users"
    },
    sellerRole: {
        type: String,
        require: true
    },
    shippingCharge: {
        type: Number
    },
    packageTotal: {
        type: Number,
        require: true
    },
}, { timestamps: true });

mongoose.models.Package || mongoose.model('Package', packageSchema)