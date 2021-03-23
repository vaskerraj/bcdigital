const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const admin = require('../../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/isuser', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        return res.status(200).json({ msg: "OK" });
    });

    server.get('/api/profile', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const user = await Users.findById(req.user._id);
        return res.status(200).json(user);
    });

    server.post('/api/edituser', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { name } = req.body;
        try {
            if (req.user.fireuid) {
                // social auth

                const firebaseUser = await admin.auth().getUser(req.user.id)
                const user = await Users.findOneAndUpdate({ fireuid: req.user.id }, { name }, {
                    new: true
                });
                // update displayName
                firebaseUser.updateProfile({
                    displayName: name,
                });
                return res.status(200).json(user);
            } else {
                // custom auth
                const user = await Users.findByIdAndUpdate({ _id: req.user.id }, { name }, {
                    new: true
                });

                return res.status(200).json(user);
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." })
        }

    });

    server.get('/api/addresses', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const user = await Users.findById(req.user._id);
            return res.status(200).json(user.addresses);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." })
        }
    });
};