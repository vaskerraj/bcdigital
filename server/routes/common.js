const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../middlewares/auth');
const verifySms = require('../utils/verifySms');

module.exports = function (server) {
    server.post('/api/changePwd', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { current, password, method, role } = req.body;
        try {
            const user = await Users.findOne({ _id: req.user._id, method, role });
            await user.comparePassword(current);

            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: 'Current password doesnt match.' });
        }
    });

    server.post('/api/recoverPassword', async (req, res) => {
        const { mobile, verificationCode, password, smsmethod, role } = req.body;
        try {
            // Note: checked mobile number at while sending sms so not check mobile number as username
            const { msg } = await verifySms(mobile, verificationCode, smsmethod);
            if (msg !== 'verify') {
                return res.status(422).json({ error: 'Invalid SMS Verification Code' });
            }

            const user = await Users.findOne({ username: mobile, method: 'custom', role });
            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}