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
    server.post('/api/addresses', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { name, mobile, label, region, city, street } = req.body;
        try {
            const userAddress = await Users.aggregate([
                { $match: { _id: req.user._id } },
                { $project: { addresses: { $size: '$addresses' } } }
            ]);

            // check address and make first address as default address
            var isDefault = false;
            if (userAddress[0].addresses === 0) {
                isDefault = true;
            }

            const addresses = { name, mobile, label, region, city, street, isDefault }
            const user = await Users.findByIdAndUpdate(req.user.id,
                {
                    $push: {
                        addresses: addresses
                    }
                }, {
                new: true
            });
            return res.status(200).json(user.addresses);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." })
        }
    });

    server.get('/api/address/:id', requiredAuth, checkRole('subscriber'), async (req, res) => {
        try {
            const user = await Users.findOne({ 'addresses._id': req.params.id });
            const address = user.addresses.id(req.params.id);
            return res.status(200).json(address);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." })
        }
    });

    server.delete('/api/address/:id', requiredAuth, checkRole('subscriber'), async (req, res) => {
        const addressId = req.params.id;
        try {
            await Users.findByIdAndUpdate(req.user.id,
                {
                    $pull: {
                        addresses: { _id: mongoose.Types.ObjectId(addressId) }
                    }
                }).exec();
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." })
        }
    });

    server.put('/api/address', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { id, name, mobile, label, region, city, street } = req.body;

        var update = { name, mobile, label, region, city, street };
        await Users.findOneAndUpdate({ 'addresses._id': id },
            {
                '$set': { 'addresses.$': update },
            }, { upsert: true }
        );
        return res.status(200).json({ msg: "success" });

    });
};