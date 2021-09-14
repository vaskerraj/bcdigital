const mongoose = require('mongoose');
const verifySms = require('../utils/verifySms');
const Users = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/signup', async (req, res) => {
        const { fullname, mobile, verificationCode, password, registerMethod } = req.body;
        try {
            // Note: checked mobile number at while sending sms so not check mobile number
            const { msg } = await verifySms(mobile, verificationCode, method = 'registration');
            if (msg !== 'verify') {
                return res.status(422).json({ error: 'Invalid SMS Verification Code' });
            }
            const user = new Users({ name: fullname, username: mobile, mobile, password, method: 'custom', registerMethod });
            await user.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();

            await admin.auth().createCustomToken(uid)
                .then(function (token) {
                    return res.json({
                        name: user.name,
                        token
                    });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ? 'User already exists' : error.message
            });
        }
    });

};