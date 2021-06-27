const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema({
    products: [{
        productId: {
            type: ObjectId,
            ref: "Product"
        },
        productQty: {
            type: Number,
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
    orderedBy: {
        type: ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

mongoose.models.Cart || mongoose.model('Cart', cartSchema)