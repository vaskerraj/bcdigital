const mongoose = require('mongoose');
const Payment = mongoose.model('Payment');

const moment = require('moment');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/paymentissue', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { orderId, type, refId } = req.body;
        try {
            const payment = await Payment.findOne({ orderId, paymentType: type, transactionId: refId, paidBy: req.user._id });
            if (payment) {
                if (payment.paymentStatus === 'unfair') {
                    return res.status(200).json({ msg: 'issue' });
                } else if (payment.paymentStatus === 'fair') {
                    return res.status(200).json({ msg: 'fair_payment' });
                }
            } else {
                return res.status(200).json({ msg: 'non_issue' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })
}