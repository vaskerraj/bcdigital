const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema({
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
                "cancelled",
                "packed",
                "shipped",
                "for_delivery",
                "delivered"
            ]
        },
        orderStatusLog: [{
            status: {
                type: String
            },
            statusChangeBy: {
                type: ObjectId,
                ref: 'Users'
            }
        }],
        paymentStatus: {
            type: String,
            require: true,
            default: 'notpaid'
        },
        seller: {
            type: ObjectId,
            ref: "Users"
        },
        sellerRole: {
            type: String,
            require: true
        }
    }],
    total: {
        type: Number,
        require: true
    },
    shipping: {
        type: ObjectId,
        ref: "ShippingPlan"
    },
    shippingCharge: {
        type: Number
    },
    coupon: {
        type: ObjectId,
        ref: "Coupon"
    },
    couponDiscount: {
        type: Number
    },
    grandTotal: {
        type: Number,
        require: true
    },
    delivery: {
        type: ObjectId,
        ref: 'Users'
    },
    deliveryMobile: {
        type: String,
        require: true
    },
    paymentType: {
        type: String,
        require: true
    },
    orderedBy: {
        type: ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

mongoose.models.Order || mongoose.model('Order', orderSchema)