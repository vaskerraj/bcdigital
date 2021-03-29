const mongoose = require('mongoose');
const User = mongoose.model('Users');

const admin = require('../../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../../middlewares/auth');
const adminSeeder = require('../../utils/seeder');

module.exports = function (server) {
    // init admin seeder
    adminSeeder();
    server.get('/api/isadmin', requiredAuth, checkRole(['admin']), async (req, res) => {
        return res.status(200).json({ msg: "OK" });
    });
};