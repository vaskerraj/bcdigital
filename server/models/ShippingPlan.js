const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const shippingPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    shipAgentId: {
        type: ObjectId,
        ref: "ShippingAgent"
    },
    cityId: {
        type: ObjectId,
        ref: "DefaultAddress"
    },
    amount: {
        type: String,
        require: true,
    },
    minDeliveryTime: {
        type: String,
    },
    maxDeliveryTime: {
        type: String,
    },
}, { timestamps: true });

mongoose.models.ShippingPlan || mongoose.model('ShippingPlan', shippingPlanSchema)

