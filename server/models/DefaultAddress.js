const mongoose = require('mongoose');

const defaultAddressSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
    },
    parentId: {
        type: String
    }
}, { timestamps: true });

mongoose.models.DefaultAddress || mongoose.model('DefaultAddress', defaultAddressSchema)

