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

};