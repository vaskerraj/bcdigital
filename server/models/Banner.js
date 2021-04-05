const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const bannerSchema = new mongoose.Schema({
    bannerPostion: {
        type: String,
        require: true
    },
    bannerFor: {
        type: String,
    },
    sellerId: {
        type: ObjectId,
        ref: "Users"
    },
    categoryId: {
        type: ObjectId,
        ref: "Category"  // second level of category as categoryId
    },
    productId: {
        type: ObjectId,
        // ref: "Product" // not created product modal yet
    },
    validityStart: {
        type: Date
    },
    validityEnd: {
        type: Date
    },
    bannerName: {
        type: String,
        require: true,
        trim: true,
        maxlength: 32
    },
    slug: {
        type: String,
        unique: true,
        require: true,
        maxlength: 32
    },
    webImage: {
        type: String,
        require: true
    },
    mobileImage: {
        type: String,
        require: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

mongoose.models.Banner || mongoose.model('Banner', bannerSchema)