const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = async (req, res, next) => {

    try {
        const token = req.headers.authorization;
        if (!token) return res.status(400).json({ error: 'Invalid Authentication' })

        const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);

        const method = firebaseUser.firebase.sign_in_provider;
        // custom = mobile
        if (method === 'custom') {
            // Check if user exists with refresh token
            const currentUser = await User.findById(firebaseUser.id);
            if (!currentUser) {
                return res.status(401).json({ error: 'Invalid Authentication' });
            }
            // Grant access to protected route
            req.user = currentUser;
            next();

        } else {
            // Check if user exists with refresh token
            const currentUser = await User.findOne({ fireuid: firebaseUser.id });
            if (!currentUser) {
                return res.status(401).json({ error: 'Invalid Authentication' });
            }
            // Grant access to protected route
            req.user = currentUser;
            next();
        }

    } catch (error) {
        return res.status(401).json({ error: 'Session expired. Please login again' });
    }

}