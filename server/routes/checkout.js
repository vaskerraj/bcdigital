const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {

    server.get('/api/checkout', requiredAuth, async (req, res) => {
        res.status(200).json({ msg: "OK" });
    });
};