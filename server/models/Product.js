const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const Products = new mongoose.Schema({
    size: { type: String, require: true },
    quantity: { type: Number, require: true },
    price: { type: Number, require: true },
    discount: Number,
    promoStartDate: Date,
    promoEndDate: Date,
    finalPrice: { type: Number, require: true },
    sold: { type: Number, require: true, default: 0 },
    approved: {
        status: { type: String, default: "pending" },
        approvedBy: { type: ObjectId, ref: 'Users' },
        approvedAt: { type: Date }
    },
    status: {
        type: String, // active, inactive , deleted
        default: "active"
    },
});

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
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    colour: [],
    size: [{
        type: String,
        require: true,
    }],
    products: [Products],
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
        status: {
            type: String,
            enum: ["yes", "no"],
            default: "no"
        },
        offeredBy: { type: ObjectId, ref: 'Users' },
    },
    attributes: {}, // leave empty object(filter and search)
    warranty: {
        warrantyType: { type: String, default: null },
        warrantyPeriod: { type: String, default: null }
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
}, { timestamps: true });

mongoose.models.Product || mongoose.model('Product', ProductSchema)


