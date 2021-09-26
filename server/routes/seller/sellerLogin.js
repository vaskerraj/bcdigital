const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/sellerlogin', async (req, res) => {
        const { mobile, password } = req.body;
        if (!mobile || !password) {
            return res.status(422).json({ error: 'Provide both mobile number and password' });
        }

        const user = await User.findOne({ username: mobile, mobile, method: 'custom', role: 'seller' });
        if (!user) {
            return res.status(422).json({ error: 'Invalid mobile number or password.' });
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
                        picture: user.picture,
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