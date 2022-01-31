const mongoose = require('mongoose');
const Refund = mongoose.model('Refund');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.put('/api/refund/esewa', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { cancellationId, esewaId } = req.body;
        try {
            const updateEsewa = await Refund.findOneAndUpdate({
                cancellationId,
                paymentType: 'esewa',
                paymentStatus: 'paid'
            }, {
                $set: {
                    esewaId
                }
            });
            if (updateEsewa) {
                return res.status(200).json({ msg: 'success' });
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/refund/bank', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { cancellationId, accountName, accountNumber, bankName, branch } = req.body;
        try {
            const updateBank = await Refund.findOneAndUpdate({
                cancellationId,
                paymentType: 'card',
                paymentStatus: 'paid'
            }, {
                $set: {
                    'account.title': accountName,
                    'account.number': accountNumber,
                    'account.bankName': bankName,
                    'account.branch': branch
                }
            });
            if (updateBank) {
                return res.status(200).json({ msg: 'success' });
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};