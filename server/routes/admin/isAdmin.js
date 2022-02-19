const mongoose = require('mongoose');
const moment = require('moment')
const User = mongoose.model('Users');
const Package = mongoose.model('Package');
const Product = mongoose.model('Product');
const Refund = mongoose.model('Refund');
const Cancellation = mongoose.model('Cancellation');
const Seller = mongoose.model('Seller');

const admin = require('../../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../../middlewares/auth');
const adminSeeder = require('../../utils/seeder');

module.exports = function (server) {
    // init admin seeder
    adminSeeder();
    server.get('/api/isadmin', requiredAuth, checkRole(['admin']), async (req, res) => {
        return res.status(200).json({ msg: "OK" });
    });

    server.post('/api/dashbaord', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { lastWeekStart, lastWeekEnd, thisWeekStart, thisWeekEnd } = req.body;
        const today = moment().startOf('day');
        const yesterdayStart = moment().subtract(1, 'day').startOf('day').toDate();
        const yesterdayEnd = moment().subtract(1, 'day').endOf('day').toDate();

        const todayStart = today.toDate()
        const todayEnd = moment(today).endOf('day').toDate()
        try {
            // orders
            const totalOrders = await Package.countDocuments(
                {
                    $or: [
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'return_request' } },
                        { 'products.orderStatus': { $ne: 'return_approve' } },
                        { 'products.orderStatus': { $ne: 'return_pick' } },
                        { 'products.orderStatus': { $ne: 'return_shipped' } },
                        { 'products.orderStatus': { $ne: 'return_delivered' } },
                    ],
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                })
            const lastWeekTotalOrder = await Package.countDocuments(
                {
                    $or: [
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'return_request' } },
                        { 'products.orderStatus': { $ne: 'return_approve' } },
                        { 'products.orderStatus': { $ne: 'return_pick' } },
                        { 'products.orderStatus': { $ne: 'return_shipped' } },
                        { 'products.orderStatus': { $ne: 'return_delivered' } },
                    ],
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
                })

            const thisWeekTotalOrder = await Package.countDocuments(
                {
                    $or: [
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'return_request' } },
                        { 'products.orderStatus': { $ne: 'return_approve' } },
                        { 'products.orderStatus': { $ne: 'return_pick' } },
                        { 'products.orderStatus': { $ne: 'return_shipped' } },
                        { 'products.orderStatus': { $ne: 'return_delivered' } },
                    ],
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    createdAt: { $gte: thisWeekStart, $lte: thisWeekEnd }
                })

            const yesterdayTotalOrder = await Package.countDocuments(
                {
                    $or: [
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'return_request' } },
                        { 'products.orderStatus': { $ne: 'return_approve' } },
                        { 'products.orderStatus': { $ne: 'return_pick' } },
                        { 'products.orderStatus': { $ne: 'return_shipped' } },
                        { 'products.orderStatus': { $ne: 'return_delivered' } },
                    ],
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    createdAt: {
                        $gte: yesterdayStart,
                        $lte: yesterdayEnd
                    }
                })

            const todayTotalOrder = await Package.countDocuments(
                {
                    $or: [
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'return_request' } },
                        { 'products.orderStatus': { $ne: 'return_approve' } },
                        { 'products.orderStatus': { $ne: 'return_pick' } },
                        { 'products.orderStatus': { $ne: 'return_shipped' } },
                        { 'products.orderStatus': { $ne: 'return_delivered' } },
                    ],
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    createdAt: {
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                })

            const totalOwnShopOrders = await Package.countDocuments(
                {
                    sellerRole: 'own',
                    'products.orderStatus': 'not_confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                })
            const totalSellerOrders = await Package.countDocuments(
                {
                    sellerRole: 'normal',
                    'products.orderStatus': 'not_confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                });

            // Products
            const totalProducts = await Product.countDocuments(
                {
                    $and: [
                        {
                            'products.approved.status': { $ne: 'unapproved' },
                        },
                        {
                            'products.approved.status': { $ne: 'pending' }
                        }
                    ]
                }
            )
            const lastWeekTotalProducts = await Product.countDocuments(
                {
                    $and: [
                        {
                            'products.approved.status': { $ne: 'unapproved' },
                        },
                        {
                            'products.approved.status': { $ne: 'pending' }
                        }
                    ],
                    createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
                }
            )
            const thisWeekTotalProducts = await Product.countDocuments(
                {
                    $and: [
                        {
                            'products.approved.status': { $ne: 'unapproved' },
                        },
                        {
                            'products.approved.status': { $ne: 'pending' }
                        }
                    ],
                    createdAt: { $gte: thisWeekStart, $lte: thisWeekEnd }
                }
            )
            const yesterdayTotalProducts = await Product.countDocuments(
                {
                    $and: [
                        {
                            'products.approved.status': { $ne: 'unapproved' },
                        },
                        {
                            'products.approved.status': { $ne: 'pending' }
                        }
                    ],
                    createdAt: {
                        $gte: yesterdayStart,
                        $lte: yesterdayEnd
                    }
                }
            )
            const todayTotalProducts = await Product.countDocuments(
                {
                    $and: [
                        {
                            'products.approved.status': { $ne: 'unapproved' },
                        },
                        {
                            'products.approved.status': { $ne: 'pending' }
                        }
                    ],
                    createdAt: {
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                })

            const todayPendingProducts = await Product.countDocuments(
                {
                    'products.approved.status': 'pending'
                })

            // rcc
            const totalPendingRefund = await Refund.countDocuments({
                status: 'progress'
            });
            const totalPendigRetrun = 0;
            const totalPendingCancellation = await Cancellation.countDocuments({
                status: 'progress'
            });

            // Sellers
            const totalSeller = await User.countDocuments(
                {
                    role: 'seller'
                }
            )
            const lastWeekTotalSellers = await User.countDocuments(
                {
                    role: 'seller',
                    createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
                }
            )
            const thisWeekTotalSellers = await User.countDocuments(
                {
                    role: 'seller',
                    createdAt: { $gte: thisWeekStart, $lte: thisWeekEnd }
                }
            )
            const yesterdayTotalSellers = await User.countDocuments(
                {
                    role: 'seller',
                    createdAt: {
                        $gte: yesterdayStart,
                        $lte: yesterdayEnd
                    }
                }
            )
            const todayTotalSellers = await User.countDocuments(
                {
                    role: 'seller',
                    createdAt: {
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                })

            const totalPendingVerification = await Seller.countDocuments(
                {
                    stepComplete: 'true',
                    $or: [
                        { documentVerify: 'pending' },
                        { documentVerify: 're_uploaded' },
                        { 'account.bankVerify': 'pending' },
                        { 'account.bankVerify': 're_uploaded' },
                    ]
                })
            // customer
            const totalUsers = await User.countDocuments(
                {
                    role: 'subscriber'
                })
            const totalGoogleUsers = await User.countDocuments(
                {
                    role: 'subscriber',
                    method: 'google.com'
                })
            const totalFacebookUsers = await User.countDocuments(
                {
                    role: 'subscriber',
                    method: 'facebook.com'
                })

            return res.status(200).json({
                totalOrders,
                lastWeekTotalOrder,
                thisWeekTotalOrder,
                yesterdayTotalOrder,
                todayTotalOrder,
                totalOwnShopOrders,
                totalSellerOrders,
                totalProducts,
                lastWeekTotalProducts,
                thisWeekTotalProducts,
                yesterdayTotalProducts,
                todayTotalProducts,
                todayPendingProducts,
                totalPendingRefund,
                totalPendigRetrun,
                totalPendingCancellation,
                totalSeller,
                lastWeekTotalSellers,
                thisWeekTotalSellers,
                yesterdayTotalSellers,
                todayTotalSellers,
                totalPendingVerification,
                totalUsers,
                totalGoogleUsers,
                totalFacebookUsers
            })
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/orderchart', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { startDate, endDate } = req.body;
        try {
            const orderGroupBydate = await Package.aggregate([
                {
                    $match: {
                        $expr:
                        {
                            $gte: [
                                "$createdAt",
                                {
                                    $dateFromString: {
                                        dateString: endDate,
                                        format: "%Y-%m-%d"
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    }
                },
                {
                    $group: {
                        _id: "$createdAt",
                        orders: {
                            $sum: 1
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            return res.status(200).json(orderGroupBydate);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    });
    server.post('/api/customerchart', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { startDate, endDate } = req.body;
        try {
            const customerGroupBydate = await User.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    role: 'subscriber'
                                },
                                {
                                    $gte: [
                                        "$createdAt",
                                        {
                                            $dateFromString: {
                                                dateString: endDate,
                                                format: "%Y-%m-%d"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    }
                },
                {
                    $group: {
                        _id: "$createdAt",
                        customers: {
                            $sum: 1
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            return res.status(200).json(customerGroupBydate);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    });
};