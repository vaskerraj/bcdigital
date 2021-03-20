const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/isuser', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        return res.status(200).json({ msg: "OK" });
    });

    server.get('/api/profile', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        return res.status(200).json({ msg: "OK" });
    });
};