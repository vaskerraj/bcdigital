const mongoose = require('mongoose');
const moment = require('moment');

const SellerInvoiceDates = mongoose.model('SellerInvoiceDates');
const Transaction = mongoose.model('Transaction');


const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.post('/api/seller/finance', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { invoiceDate } = req.body;
        const currentUser = req.user._id;

        try {
            let invoiceDateFrom;
            let invoiceDateTo;
            let selectedInvoice;

            const sellerInvoiceDate = await SellerInvoiceDates.find({
                sellerId: currentUser
            }).sort({ $natural: -1 }).limit(20).lean();
            if (sellerInvoiceDate.length === 0) {
                return res.status(200).json({ dates: [] })
            }

            if (invoiceDate === 'current') {

                const currentSellerInvoiceDate = sellerInvoiceDate.slice(-1);
                selectedInvoice = currentSellerInvoiceDate[0];
                invoiceDateFrom = currentSellerInvoiceDate[0].dateFrom;
                invoiceDateTo = currentSellerInvoiceDate[0].dateTo;
            } else {
                const sellerInvoiceDatebYId = await SellerInvoiceDates.findById(invoiceDate).lean();
                selectedInvoice = sellerInvoiceDatebYId;
                invoiceDateFrom = sellerInvoiceDatebYId.dateFrom;
                invoiceDateTo = sellerInvoiceDatebYId.dateTo;
            }

            // calculate itemTotal(orderTotal)
            const transcations = await Transaction.find({
                createdForUser: currentUser,
                createdForString: 'seller',
                transType: 'orderTotal',
                createdAt: { $gte: invoiceDateFrom, $lte: invoiceDateTo }
            }).select('amount')
                .lean();
            const totalOfItemTotal = transcations.reduce((a, c) => a + c.amount, 0);

            // calculate commission
            const transcationsComm = await Transaction.find({
                createdBy: currentUser,
                createdForString: 'admin',
                transType: 'commission',
                createdAt: { $gte: invoiceDateFrom, $lte: invoiceDateTo }
            }).select('amount')
                .lean();

            const totalOfCommission = transcationsComm.reduce((a, c) => a + c.amount, 0);

            // calculate reversalCommission(at order return)
            //return order total and reversalCommission will be calculate at base on maturity period(7 days after delivery day)
            // so add 7 days to each from and to date to get amout
            const invoiceDateFromReturn = moment(invoiceDateFrom).add(7, 'days');
            const invoiceDateToReturn = moment(invoiceDateTo).add(7, 'days');
            const transcationsRevesalComm = await Transaction.find({
                createdForUser: currentUser,
                createdForString: 'seller',
                transType: 'reversalCommission',
                reversalCommissionStatus: 'approved',
                createdAt: { $gte: invoiceDateFromReturn, $lte: invoiceDateFromReturn }
            }).select('amount')
                .lean();

            const totalOfRevCommission = transcationsRevesalComm.reduce((a, c) => a + c.amount, 0);

            // returnOrderTotal

            const transcationsReturnItemTotal = await Transaction.find({
                createdForUser: currentUser,
                createdForString: 'seller',
                transType: 'returnOrderTotal',
                returnOrderTotal: 'approved',
                createdAt: { $gte: invoiceDateFromReturn, $lte: invoiceDateToReturn }
            }).select('amount')
                .lean();

            const totalOfReturnItems = transcationsReturnItemTotal.reduce((a, c) => a + c.amount, 0);
            const orderSubTotal = totalOfItemTotal - totalOfCommission;
            const returnSubTotal = -totalOfReturnItems - totalOfRevCommission;

            const closingBalance = orderSubTotal - returnSubTotal;

            return res.status(200).json({
                dates: sellerInvoiceDate,
                selectedInvoice,
                itemTotal: totalOfItemTotal,
                comission: totalOfCommission,
                orderSubTotal,
                revCommission: totalOfRevCommission,
                returnItems: totalOfReturnItems,
                returnSubTotal,
                closingBalance
            })

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })

    server.post('/api/seller/transcation', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { type, period } = req.body;
        const currentUser = req.user._id;

        const findByType = (type) => {
            switch (type) {
                case 'orderTotal':
                    return {
                        $and: [
                            { createdForUser: currentUser },
                            { transType: 'orderTotal' }
                        ]
                    }
                case 'commission':
                    return {
                        $and: [
                            { createdBy: currentUser },
                            { transType: 'commission' }
                        ]
                    }
                case 'returnOrderTotal':
                    return {
                        $and: [
                            { transType: 'returnOrderTotal' },
                            { createdForUser: currentUser },
                            { returnOrderStatus: 'approved' }
                        ]

                    }
                case 'reversalCommission':
                    return {
                        $and: [
                            { createdForUser: currentUser },
                            { transType: 'reversalCommission' },
                            { reversalCommissionStatus: 'approved' }
                        ]
                    }
                default:
                    return {
                        $or: [
                            {
                                $and: [
                                    { transType: 'orderTotal' },
                                    { createdForUser: currentUser }
                                ]
                            },
                            {
                                $and: [
                                    { transType: 'commission' },
                                    { createdBy: currentUser }
                                ]
                            },
                            {
                                $and: [
                                    { transType: 'returnOrderTotal' },
                                    { createdForUser: currentUser },
                                    { returnOrderStatus: 'approved' }
                                ]

                            },
                            {
                                $and: [
                                    { transType: 'reversalCommission' },
                                    { createdForUser: currentUser },
                                    { reversalCommissionStatus: 'approved' }
                                ]
                            }
                        ],
                    }
            }
        }
        const findByPeriod = (period, type) => {
            const invoiceDateFromReturn = moment(period.startDate).add(7, 'days');
            const invoiceDateToReturn = moment(period.endDate).add(7, 'days');
            if (type === 'returnOrderTotal') {
                return {
                    createdAt: {
                        $gte: invoiceDateFromReturn, $lte: invoiceDateToReturn
                    }
                }
            } else if (type === 'reversalCommission') {
                return {
                    createdAt: {
                        $gte: invoiceDateFromReturn, $lte: invoiceDateToReturn
                    }
                }
            }
            else if (type === 'all') {
                return {
                    createdAt: {
                        $gte: period.startDate, $lte: period.endDate
                    }
                };
            } else {
                return {
                    createdAt: {
                        $gte: period.startDate, $lte: period.endDate
                    }
                }
            }
        }
        try {
            const transcation = await Transaction.find(findByType(type))
                .find(findByPeriod(period, type))
                .lean()
                .populate('packageId', 'products name totalPointAmount');

            // calculate total Amount
            const totalAmount = transcation.reduce((a, c) => a + c.amount, 0);

            return res.status(200).json({
                transcation,
                total: totalAmount
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })
}