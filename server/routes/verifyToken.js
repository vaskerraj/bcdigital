const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/verifyToken', async (req, res) => {
        try {
            const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);
            console.log(firebaseUser);
            const { name, email, firebase: { sign_in_provider }, uid } = firebaseUser;
            // on custom auth(phone number and password)
            if (sign_in_provider === 'custom') {
                const user = await User.findById(uid);
                return res.status(200).json({
                    user: {
                        name: user.name,
                        role: user.role,
                        method: user.method
                    },
                    token: req.headers.token
                });
            }

            // for social auth
            return res.status(200).json({
                user: {
                    name,
                    role: 'subscriber', // social auth always a 'subscriber'
                    method: sign_in_provider
                },
                token: req.headers.token
            });
        } catch (error) {
            res.status(401).json({
                err: "Invalid or expired token",
            });
        }
    });
};