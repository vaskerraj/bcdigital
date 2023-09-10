const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/social', async (req, res) => {
        const { isNewUser, phoneNumber, registerMethod } = req.body;

        // predefine password to prevent error(salt error on bcrypt)
        const password = 'social';

        if (isNewUser) {
            const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);
            const { name, picture, email, firebase: { sign_in_provider }, uid } = firebaseUser;

            await new User({
                username: email ? email : phoneNumber,
                email,
                password,
                name,
                picture,
                fireuid: uid,
                method: sign_in_provider,
                registerMethod
            }).save();
        }
    });

    server.get('/api/app/social', async (req, res) => {
        try {
            // predefine password to prevent error(salt error on bcrypt)
            const password = 'social';

            const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);
            const { name, picture, email, phoneNumber, firebase: { sign_in_provider }, uid } = firebaseUser;

            // check user is already registerd on database or not

            const currentUser = await User.findOne({ fireuid: uid }).lean();
            if (!currentUser) {
                await new User({
                    username: email ? email : phoneNumber,
                    email,
                    password,
                    name,
                    picture,
                    fireuid: uid,
                    method: sign_in_provider,
                    registerMethod: 'app'
                }).save();
            }
        } catch (error) {
            return res.status(401).json({ error: 'Some error occur. Please try again later.' });
        }
    });

};