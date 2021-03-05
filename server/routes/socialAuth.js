const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/social', async (req, res) => {
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);
        console.log(firebaseUser);
    });

};