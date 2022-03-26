const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const shipAgentSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "Users"
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    number: {
        type: String,
        require: true,
    },
    address: {
        type: String,
        require: true,
    },
    panNo: {
        type: String,
        require: true
    },
    minDeliveryTime: {
        type: Number,
        require: true,
    },
    maxDeliveryTime: {
        type: Number,
        require: true,
    },
    parentId: {
        type: ObjectId,
        ref: "Users"
    },
    branchName: {
        type: String,
    },
    relatedCity: {
        type: ObjectId,
        ref: 'DefaultAddress'
    },
    deliveryRole: {
        type: String  // main(shipping agent created by admin) / branch(branch head created by shipping agent) / rider 
    },
    status: {
        type: String,
    },
}, { timestamps: true });

mongoose.models.ShippingAgent || mongoose.model('ShippingAgent', shipAgentSchema)

