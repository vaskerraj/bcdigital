const mongoose = require('mongoose');
const verifySms = require('../utils/verifySms');
const Users = mongoose.model('Users');
module.exports = function (server) {

    server.post('/api/signup', async (req, res) => {
        const { fullname, mobile, verificationCode, password } = req.body;
        try {
            // Note: checked mobile number at while sending sms so not check mobile number
            const { msg } = await verifySms(mobile, verificationCode, method = 'registration');
            if (msg !== 'verify') {
                return res.status(422).json({ error: 'Invalid SMS Verification Code' });
            }
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