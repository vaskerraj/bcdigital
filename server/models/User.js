import mongoose from 'mongoose'
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: String,
    mobile: {
        type: String,
        required: true,
        index: true
    },
    password: String,
    role: {
        type: String,
        default: 'subscriber'
    },
    cart: {
        type: Array,
        default: []
    },
    address: String,
    // wishlist: [{ type: ObjectId, ref: 'Products' }]
}, { timestamps: true });


export default mongoose.models.Users || mongoose.model('Users', userSchema)

