const mongoose = require('mongoose');
const smsGetway = require('../utils/sms');
const SMS = mongoose.model('Sms');

module.exports = function (server) {

    server.post('/api/smscode', async (req, res) => {
        const { mobile, method } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000);
        try {

            const sms = new SMS({ mobile, code, method, staus: 'active' });
            await sms.save();

            const registerSMSText = code + process.env.SMS_REGISTER_TEMP
            const { msg } = await smsGetway(mobile, registerSMSText);
            if (msg === 'done') {
                return res.status(200).json(sms);
            } else {
                return res.status(422).json({ error: "Some error. Please try again later" });
            }

        } catch (error) {
            return res.status(422).json({
                error: error.message
            });
        }
    });

    server.post('/api/smsverify', async (req, res) => {
        const { mobile, smscode, method } = req.body;
        try {
            // check date also
            const smscodeat = await User.findOne({ mobile, code: smscode, method, status: 'active' }, null, { sort: { createdAt: -1 } }, { limit: 1 });
            if (!smscodeat) {
                return res.status(422).json({ error: 'Invalid SMS Code' });
            }
            return res.status(200).json({ msg: "match" });

        } catch (error) {
            return res.status(422).json({
                error: error.message
            });
        }
    });

};