const mongoose = require('mongoose');
const verifySms = require('../utils/verifySms');
const Users = mongoose.model('Users');
module.exports = function (server) {

    server.post('/api/signup', async (req, res) => {
        const { fullname, mobile, verificationCode, password } = req.body;
        try {
            // Note: checked mobile number at while sending sms so not check mobile number
            const smsData = verifySms(mobile, verificationCode, method = 'registration');
            if (!smsData) {
                return res.status(401).json({ error: 'Invalid SMS Verification Code' });
            }
            console.log(smsData);

            const user = new Users({ name: fullname, username: mobile, mobile, password, method: 'custom' });
            await user.save();

            return res.status(200).json(user);

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ? 'User already exists' : error.message
            });
        }
    });

};