const mongoose = require('mongoose');
const SMS = mongoose.model('Sms');

const verifySms = async (mobile, code, method) => {
    try {
        // check date also
        const sms = await SMS.findOne({ mobile, code, method, status: 'active' }, null, { sort: { createdAt: -1 } });
        if (sms) {
            return {
                msg: "verify",
                data: sms
            }
        }
    } catch (error) {
        return {
            msg: "error",
            data: error.message
        }
        return;
    }
}
module.exports = verifySms