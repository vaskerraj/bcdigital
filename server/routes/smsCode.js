const mongoose = require('mongoose');
const smsGetway = require('../utils/sms');
const SMS = mongoose.model('Sms');
const Users = mongoose.model('Users');

module.exports = function (server) {

    server.post('/api/smscode', async (req, res) => {
        const { mobile, method } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000);
        var smsText = '';
        try {
            // reduce unnecessary sms if user is already registered with mobile number already
            if (method === 'registration') {
                const user = await Users.findOne({ username: mobile, method: 'custom', role: 'subscriber' });
                if (user) {
                    return res.status(422).json({ error: 'User alerady exists with this mobile number' });
                }
                smsText = process.env.SMS_REGISTER_TEMP
            } else if (method === 'password_recover') {
                const user = await Users.findOne({ username: mobile, method: 'custom' });
                if (!user) {
                    return res.status(422).json({ error: 'User not exists with this mobile number' });
                }
                smsText = process.env.SMS_PASS_RECOVER_TEMP
            }
            const sms = new SMS({ mobile, code, method, staus: 'active' });
            await sms.save();

            const registerSMSText = code + smsText;
            const { msg } = await smsGetway(mobile, registerSMSText);
            if (msg === 'done') {
                return res.status(200).json(sms);
            } else {
                return res.status(422).json({ error: "Some error. Please try again later" });
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error. Please try again later" });
        }
    });
};