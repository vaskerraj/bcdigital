import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    brand: {
        type: String
    },
    price: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true
    },
    star: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        require: true,
        default: 0
    },
    review: [{
        userId: { type: String, require: true },
        review_title: { type: String, require: true },
        review_des: { type: String }
    }]

});

export default mongoose.models.Products || mongoose.model('Products', ProductSchema)

