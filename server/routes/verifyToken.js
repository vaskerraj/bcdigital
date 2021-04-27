const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.get('/api/verifytoken', async (req, res) => {
        try {

            const token = req.headers.token;
            if (!token) return res.status(400).json({ error: 'Invalid Authentication' })

            const firebaseUser = await admin.auth().verifyIdToken(token);

            const { firebase: { sign_in_provider }, uid } = firebaseUser;
            // on custom auth(phone number and password)
            if (sign_in_provider === 'custom') {
                const user = await User.findById(uid);
                return res.status(200).json({
                    user: user.name,
                    token
                });
            } else {
                // Check if user exists with refresh token (socail auth)
                const user = await User.findOne({ fireuid: firebaseUser.uid });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid Authentication' });
                }

                return res.status(200).json({
                    user: user.name,
                    token
                });

            }
        } catch (error) {
            res.status(401).json({ error: "Invalid or expired token" });
        }
    });
};