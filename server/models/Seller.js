const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const addressSchema = mongoose.Schema({
    label: {
        type: String,
        enum: [
            "business",
            "warehouse",
            "return"
        ]
    },
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String
    },
    region: { type: ObjectId, ref: 'DefaultAddress' },
    city: { type: ObjectId, ref: 'DefaultAddress' },
    area: { type: ObjectId, ref: 'DefaultAddress' },
    street: String,
});

const sellerSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "Users"
    },
    step: {
        type: String,
        enum: [
            "company",
            "addresses",
            "bank",
        ]
    },
    stepComplete: {
        type: Boolean,
        default: false,
    },
    legalName: {
        type: String,
    },
    registrationType: {
        type: String,
        enum: [
            "VAT",
            "PAN",
        ]
    },
    registrationNumber: {
        type: Number,
    },
    documentFile: {
        type: String
    },
    documentVerify: {
        type: String,
        enum: [
            "pending",
            "verified",
            "not_verified",
            "re_uploaded"
        ],
        default: 'pending'
    },
    addresses: [addressSchema],
    account: {
        title: {
            type: String
        },
        number: {
            type: Number
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
        bankVerify: {
            type: String,
            enum: [
                "pending",
                "verified",
                "not_verified",
                "re_uploaded"
            ],
            default: 'pending'
        }
    },
    status: {
        title: {
            type: String,
            enum: [
                "deleted",
                "approved",
                "unapproved",
                "blocked"
            ],
            default: "approved"
        },
        reason: {
            type: String
        },
        actionBy: {
            type: ObjectId,
            ref: "Users"
        },
        actionDate: {
            type: Date
        }

    }

}, { timestamps: true });

mongoose.models.Seller || mongoose.model('Seller', sellerSchema)