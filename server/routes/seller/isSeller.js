const mongoose = require('mongoose');
const User = mongoose.model('Users');
const Seller = mongoose.model('Seller');
const Product = mongoose.model('Product');
const Package = mongoose.model('Package');

const multer = require('multer');
const moment = require('moment');


var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage })

const { requiredAuth, checkRole } = require('../../middlewares/auth');

const { singleImageUpload, updateSingleImage, deleteImage } = require('../../utils/imageUpload');

module.exports = function (server) {

    server.get('/api/isseller', requiredAuth, checkRole(['seller']), async (req, res) => {
        const seller = await Seller.findOne({ userId: req.user._id })
            .lean()
            .populate('userId', 'name mobile email picture')
            .populate('addresses.region', '_id name')
            .populate('addresses.city', '_id name')
            .populate('addresses.area', '_id name')
        return res.status(200).json(seller);
    });

    // start seller Apis
    // company
    server.post('/api/seller/start/company', requiredAuth, checkRole(['seller']), upload.single('docFile'), async (req, res) => {
        const { legalName, regType, regNumber } = req.body;
        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;
                await singleImageUpload(req, 'sellerDoc');
            }
            const seller = new Seller({
                userId: req.user._id,
                legalName,
                registrationType: regType,
                registrationNumber: regNumber,
                documentFile: docFile,
                step: 'company',
            });
            await seller.save();
            if (seller) {
                return res.status(201).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // addresses
    server.put('/api/seller/start/addresses', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { addresses } = req.body;
        try {
            await Seller.findOneAndUpdate({ userId: req.user._id },
                {
                    addresses,
                    step: 'addresses',
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // bank
    server.post('/api/seller/start/bank', requiredAuth, checkRole(['seller']), upload.single('copyofcheque'), async (req, res) => {
        const { title, number, bankName, bankBranch } = req.body;
        try {
            let copyOfCheque;
            if (req.file) {
                copyOfCheque = req.file.filename;
                await singleImageUpload(req, 'sellerDoc');
            }
            await Seller.findOneAndUpdate({ userId: req.user._id },
                {
                    step: 'bank',
                    stepComplete: true,
                    'account.title': title,
                    'account.number': number,
                    'account.bankName': bankName,
                    'account.branch': bankBranch,
                    'account.chequeFile': copyOfCheque
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/seller/logo', upload.single('file'), async (req, res) => {
        const { id } = req.query;
        try {
            let filename;
            if (req.file) {
                filename = req.file.filename;

                const preSellerLogo = await User.findById(id).select('picture');
                if (preSellerLogo) {
                    await updateSingleImage(req,preSellerLogo.picture, 'seller');
                }
                await User.findByIdAndUpdate(id, { picture: filename });
            }
            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // dashboard
    server.get('/api/dashbaord/card', requiredAuth, checkRole(['seller']), async (req, res) => {
        const today = moment().startOf('day');

        const todayStart = today.toDate()
        const todayEnd = moment(today).endOf('day').toDate();
        const last30DaysStart = moment().subtract(30, 'day').startOf('day').toDate();

        // note: pending order will be find base on `sellerTime` which is 48 hour from confirmed by admin
        //  so if we want pending order between 24 hour then we have to sub 48 hour too
        // eg: last24DaysStart =  48+24 = 72
        const last24hourStart = moment().subtract(72, 'h').startOf('day').toDate();  // 48+24
        const last12hourEnd = moment().subtract(60, 'h').endOf('day').toDate();  // 48+12
        const todayPedingOrderStart = moment().subtract(48, 'h').startOf('day').toDate();  // 48
        const todayPedingOrderEnd = moment().subtract(48, 'h').endOf('day').toDate();  // 48

        try {
            /////////////////// orders  ////////////////////
            const totalOrders = await Package.countDocuments(
                {
                    seller: req.user._id,
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
            //delivered orders
            const totalDeliveredOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'delivered',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ]
                })
            const totalTodayDeliveredOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'delivered',
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
            const totalLast30DeliveredOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'delivered',
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
                        $gte: last30DaysStart,
                        $lte: todayEnd
                    }
                })

            // packed but not shipped order
            const totalPackedOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'packed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ]
                })

            // to get `ship on time` get total order those have not cancellation and not pending
            const totalOrderWithoutPending = await Package.countDocuments(
                {
                    seller: req.user._id,
                    $or: [
                        { 'products.orderStatus': { $ne: 'confirmed' } },
                        { 'products.orderStatus': { $ne: 'cancel_approve' } },
                        { 'products.orderStatus': { $ne: 'cancelled_by_seller' } },
                        { 'products.orderStatus': { $ne: 'cancelled_by_admin' } },
                        { 'products.orderStatus': { $ne: 'cancelled_by_user' } },
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

            //cancellation orders
            const totalCancelledOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'cancel_approve',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ]
                })
            const totalTodayCancelledOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'cancel_approve',
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
                });

            const totalLast30CancelledOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'cancel_approve',
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
                        $gte: last30DaysStart,
                        $lte: todayEnd
                    }
                })

            // pending orders

            // pending order Between 24 hour
            const totalOrderBetween24 = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    sellerTime: {
                        $gte: last24hourStart,
                        $lte: todayPedingOrderEnd
                    }
                })
            // pending order Between 12 to 24 hour
            const totalOrderBetween24to12 = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    sellerTime: {
                        $gte: last24hourStart,
                        $lte: last12hourEnd
                    }
                })

            // pending order before 24 hour
            const totalOrderBefore24 = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ],
                    sellerTime: {
                        $lte: last24hourStart
                    }
                });


            // seller time expired order
            const totalExpiredOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    $or: [
                        {
                            'products.orderStatus': 'confirmed'
                        },
                        {
                            'products.orderStatus': 'packed'
                        }
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
                    sellerTime: {
                        $lte: moment()
                    }
                });

            //total pending order
            const totalPendingOrder = await Package.countDocuments(
                {
                    seller: req.user._id,
                    'products.orderStatus': 'confirmed',
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { paymentStatus: 'paid' }
                            ]
                        },
                    ]
                });


            // Products
            const totalProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id,
                    }
                },
                { $unwind: "$products" },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }
            ]);

            const totalApprovedProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.approved.status": "approved"
                    }
                },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }
            ]);

            const totalApprovedLiveProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.status": "active",
                        "products.approved.status": "approved"
                    }
                },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }
            ]);
            const totalApprovedButNotLiveProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.status": 'inactive',
                    }
                },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }
            ]);

            const totalUnapprovedProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.approved.status": "unapproved",
                    }
                },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }

            ])
            const totalPendingProducts = await Product.aggregate([
                {
                    $match: {
                        createdBy: req.user._id
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.approved.status": "pending",
                    }
                },
                {
                    "$group": {
                        "_id": "$id",
                        "total": { "$sum": 1 }
                    }
                }
            ]);

            return res.status(200).json({
                totalOrders,
                totalDeliveredOrder,
                totalTodayDeliveredOrder,
                totalLast30DeliveredOrder,
                totalPackedOrder,
                totalOrderWithoutPending,
                totalCancelledOrder,
                totalTodayCancelledOrder,
                totalLast30CancelledOrder,
                totalOrderBetween24,
                totalOrderBetween24to12,
                totalOrderBefore24,
                totalExpiredOrder,
                totalPendingOrder,
                totalProducts: totalProducts.length === 0 ? 0 : totalProducts[0].total,
                totalApprovedProducts: totalApprovedProducts.length === 0 ? 0 : totalApprovedProducts[0].total,
                totalApprovedLiveProducts: totalApprovedLiveProducts.length === 0 ? 0 : totalApprovedLiveProducts[0].total,
                totalApprovedButNotLiveProducts: totalApprovedButNotLiveProducts.length === 0 ? 0 : totalApprovedButNotLiveProducts[0].total,
                totalUnapprovedProducts: totalUnapprovedProducts.length === 0 ? 0 : totalUnapprovedProducts[0].total,
                totalPendingProducts: totalPendingProducts.length === 0 ? 0 : totalPendingProducts[0].total
            })
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/dashboard/orderchart', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { endDate } = req.body;
        try {
            const orderGroupBydate = await Package.aggregate([
                {
                    $match: {
                        seller: req.user._id,
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
};