const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        unique: true,
        require: true,
        maxlength: 32
    },
    availableFor: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    discountType: {
        type: String, // percentage or flat
        require: true
    },
    discountAmount: {
        type: String,
        require: true
    },
    minBasket: {
        type: Number,
        require: true
    },
    applicableOn: {
        type: String,
        require: true
    },
    totalVoucher: {
        type: Number,
        require: true
    },
    remainingVoucher: {
        type: Number,
    },
    redeemsPerUser: {
        type: Number,
        require: true
    },
    validityStart: {
        type: Date
    },
    validityEnd: {
        type: Date
    },
    couponUseIn: {
        type: String, // all/category
        require: true
    },
    categoryId: [{
        type: ObjectId,
        ref: "Category"
    }],
    createdBy: {
        type: ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)