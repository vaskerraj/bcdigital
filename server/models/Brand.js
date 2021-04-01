const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const brandSchema = new mongoose.Schema({
    name: {
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
    image: {
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


mongoose.models.Brand || mongoose.model('Brand', brandSchema)