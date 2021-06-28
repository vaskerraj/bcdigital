const mongoose = require('mongoose');
const User = mongoose.model('Users');
const Cart = mongoose.model('Cart');

const admin = require('../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.get('/api/checkout', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const cartDetails = await Cart.findOne({ orderedBy: req.user._id }).lean();
            return res.status(200).json(cartDetails);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};