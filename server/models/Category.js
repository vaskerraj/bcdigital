const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
        unique: true
    },
    order: {
        Type: Number,
        default: 0
    },
    parentId: {
        type: String
    }
}, { timestamps: true });

mongoose.models.Category || mongoose.model('Category', categorySchema)

