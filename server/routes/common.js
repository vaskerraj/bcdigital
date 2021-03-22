const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/changePwd', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { current, password, method, role } = req.body;
        try {
            const user = await Users.findOne({ _id: req.user._id, method, role });
            await user.comparePassword(current);

            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: 'Current password doesnt match.' });
        }
    });
}