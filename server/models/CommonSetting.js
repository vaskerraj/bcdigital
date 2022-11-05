const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const commonSettingSchema = new mongoose.Schema({
    contactNumber: {
        type: String,
        require: true
    },
    facebookLink: {
        type: String,
    },
    twitterLink: {
        type: String,
    },
    andriodLink: {
        type: String
    },
    iosLink: {
        type: String
    },
    paymentMethod: {
        type: Array
    },
    updatedBy: {
        type: ObjectId,
        ref: "Users"
    },
    record:{
        type: Boolean,
    }
}, { timestamps: true });

mongoose.models.CommonSetting || mongoose.model('CommonSetting', commonSettingSchema)