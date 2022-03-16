const mongoose = require('mongoose');
const User = mongoose.model('Users');

const verifySms = require('../../utils/verifySms');
const admin = require('../../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/delivery/register', async (req, res) => {
        const { name, mobile, verificationCode, password, email, registerMethod } = req.body;

        // Note: checked mobile number at while sending sms so not checking(username) mobile number here
        const { msg } = await verifySms(mobile, verificationCode, method = 'seller_registration');
        if (msg !== 'verify') {
            return res.status(422).json({ error: 'Invalid SMS Verification Code' });
        }
        try {
            const user = new User({
                name,
                email,
                username: mobile,
                mobile,
                password,
                role: 'seller',
                method: 'custom',
                registerMethod
            });
            await user.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();

            await admin.auth().createCustomToken(uid)
                .then(function (token) {
                    return res.status(201).json({ msg: 'success' });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Seller already exists'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.post('/api/delivery/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ error: 'Provide both email and password' });
        }

        const user = await User.findOne({ username: email, email, method: 'custom', role: 'delivery' });
        if (!user) {
            return res.status(422).json({ error: 'Invalid email or password.' });
        }
        try {
            await user.comparePassword(password);

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();

            await admin.auth().createCustomToken(uid)
                .then(function (token) {
                    return res.status(200).json({
                        name: user.name,
                        deliveryRole: user.deliveryRole,
                        token
                    });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });

        } catch (err) {
            return res.status(422).json({ error: 'Invalid mobile number or password.' });
        }

    });

};