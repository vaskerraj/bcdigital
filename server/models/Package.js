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
        returnProductQty: {
            type: Number,
            default: 0
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
                "not_delivered",
                "fail_delivery",
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
    rproducts: [{
        productId: {
            type: ObjectId,
            ref: "Product"
        },
        location: {
            type: ObjectId,
            ref: 'Users'
        },
        trackingId: {
            type: String
        },
        productQty: {
            type: Number
        },
        price: {
            type: Number,
            require: true
        },
        pointAmount: {
            type: Number,
        },
        reason: {
            type: String
        },
        orderStatus: {
            type: String,
            enum: [
                "return_request",
                "return_approve",
                "return_denide",
                "return_shipped",
                "return_atCity",
                "return_sameCity",
                "return_delivered",
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
    paymentDate: {
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
        ref: 'Users'
    },
    //  maturity date use at package delivery which is 7 days later then delivered date
    // this is used for return package or product
    maturityDate: {
        type: Date
    },
    // shipping agent have to try to delivery 3 time before cancel.
    notDelivered: [
        {
            reason: {
                type: String
            },
            date: {
                type: Date
            },
            attemptBy: {
                type: ObjectId,
                ref: "Users"
            }
        }
    ],
    failDeliveryStatus: {
        status: {
            type: String,
            enum: [
                'fd_dispatched',
                'fd_reachedSellerCity',
                'fd_sameCity',
                'fd_receivedBySeller',
            ]
        },
        location: {
            type: ObjectId,
            ref: 'Users'
        },
        statusLog: [{
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
        }]
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