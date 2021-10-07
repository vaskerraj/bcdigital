const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema({
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