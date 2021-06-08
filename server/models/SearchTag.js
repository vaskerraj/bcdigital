const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    tag: {
        type: String,
        require: true,
        trim: true,
        text: true
    },
    slug: {
        type: String,
        unique: true,
        require: true,
    },
    count: {
        type: Number,
        require: true,
        default: 0
    }
}, { timestamps: true });

mongoose.models.SearchTag || mongoose.model('SearchTag', couponSchema)