const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    },
    shortDescription: {
        type: String, // highlights/ Product details
        require: true,
        trim: true
    },
    description: {
        type: String, // Specifications/ image list
        require: true,
        trim: true
    },
    brand: {
        type: ObjectId,
        ref: 'Brand'
    },
    price: {
        type: Number,
        require: true,
    },
    specialPrice: {
        price: { type: Number },
        validityStart: { type: Date },
        validityEnd: { type: Date },
        offeredBy: { type: String, enum: ["seller", "admin", "brand"] }
    },
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    quantity: {
        type: Number,
        require: true,
        default: 0
    },
    sold: {
        type: Number,
        require: true,
        default: 0
    },
    color: {
        type: String,
    },
    images: [{
        color: { type: String },
        images: [{
            type: String,
        }]
    }],
    rating: [{
        ratedBy: { type: ObjectId, ref: 'Users' },
        star: {
            type: Number,
            default: 0
        }
    }],
    review: [{
        postedBy: { type: ObjectId, ref: 'Users' },
        reviewTitle: { type: String, require: true },
        reviewDes: { type: String },
        createdAt: { type: Date }
    }],
    freeShipping: {
        type: String,
        enum: ["yes", "no"],
        default: "no"
    },
    filters: {
        electronic: {
            storage: { type: String },
            ram: { type: String }
        },
        other: {
            size: { type: String },
            enum: ["S", "L", "M", "XL", "XXL", "Free Style"],
        }
    },
    warranty: {
        warrantyType: { type: String },
        warrantyPeriod: { type: String }
    },
    package: {
        weight: { type: Number },
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
        dangerousMaterials: [{
            type: String,
            emum: ["Battery", "Liquid", "Flamable", "None"]
        }]
    },
    createdBy: {
        type: ObjectId,
        ref: 'Users'
    }

});

mongoose.models.Product || mongoose.model('Product', ProductSchema)


