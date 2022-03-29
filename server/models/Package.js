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
        pointAmount: {
            type: Number,
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
    sellerTime: {
        type: Date
    },
    shippingCharge: {
        type: Number
    },
    packageTotal: {
        type: Number,
        require: true
    },
    totalPointAmount: {
        type: Number, //need to update at delivery  
    },
    // ship agent id as deliveryRole="main"
    shipping: {
        type: ObjectId,
        ref: 'ShippingAgent'
    },
    shipLocation: {
        type: ObjectId,
        ref: 'Users'
    },
    shipLocationString: {
        type: String,
        default: 'other',
        enum: [
            'main_office',
            'branch_office',
            'shipping_vendor',
            'other',
        ]
    },
    shipDate: {
        type: Date
    },
    // ship agent's branch id as deliveryRole="branch"
    reachedLocation: {
        type: ObjectId,
        ref: 'ShippingAgent'
    },
    reachedDate: {
        type: Date
    },
    totalAtDelivery: {
        type: Number,
    },
    deliveryDate: {
        type: Date
    },
    // ship agent'r rider id as deliveryRole="rider"
    deliveredBy: {
        type: ObjectId,
        ref: 'ShippingAgent'
    },
    shippingClam: {
        amount: {
            type: Number
        },
        reason: {
            type: String
        },
        clamedBy: { // `clam by` user who clam shipping
            type: ObjectId,
            ref: "Users"
        },
        clamedFor: { // `clam for` means clam to seller(seller have to pay)
            type: ObjectId,
            ref: "Users"
        },
        forAgent: {
            type: ObjectId,
            ref: "ShippingAgent"
        },
        clamedDate: {
            type: Date
        }
    }

}, { timestamps: true });

mongoose.models.Package || mongoose.model('Package', packageSchema)