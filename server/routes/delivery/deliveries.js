const mongoose = require('mongoose');

const Package = mongoose.model('Package');
const Order = mongoose.model('Order');
const Users = mongoose.model('Users');
const Product = mongoose.model('Product');
const ShippingAgent = mongoose.model('ShippingAgent');
const Seller = mongoose.model('Seller');
const Payment = mongoose.model('Payment');
const Transaction = mongoose.model('Transaction');
const SellerInvoiceDates = mongoose.model('SellerInvoiceDates');

const moment = require('moment');

const { requiredAuth, checkRole } = require('../../middlewares/auth');
const { orderDelivered } = require('../../../email/templets');
const { oderStatusEmailHandler } = require('../../../email');

const getProductDetail = async (products) => {

    const getProductIds = products.map(item => item.productId);
    let relatedProducts = [];
    await Promise.all(
        getProductIds.map(async (pro) => {
            const orderProducts = await Product.findOne(
                {
                    'products._id': pro
                },
                {
                    'products.$': 1
                })
                .select('name slug colour products _id').lean();
            relatedProducts.push(orderProducts);
        })
    );

    const parseProducts = JSON.parse(JSON.stringify(relatedProducts));

    // combine proucts details and productQty
    const combineProductWithOrderitems = parseProducts.map(item => ({
        ...item,
        ...products.find(ele => ele.productId == item.products[0]._id)
    }));

    return combineProductWithOrderitems;
}

const getUserAddress = async (addressId) => {
    const userAddress = await Users.findOne(
        {
            "addresses._id": addressId,
        }, { _id: 0 })
        .select('addresses')
        .lean()
        .populate('addresses.region', 'name')
        .populate('addresses.city', 'name')
        .populate('addresses.area', 'name');

    return userAddress.addresses[0];
}
module.exports = function (server) {
    server.post('/api/deliveries/list/branch', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { status, paymentMethod, trackingId, sort, page, limit } = req.body;
        const findByStatusType = (type) => {

            switch (type) {
                case 'pending':
                    return {
                        reachedLocation: req.user._id,
                        'products.orderStatus': 'reached_at_city',
                    }
                case 'for_delivery':
                    return {
                        reachedLocation: req.user._id,
                        'products.orderStatus': 'for_delivery',
                    }
                case 'fail_delivery':
                    return {
                        'products.orderStatus': 'fail_delivery',
                        $or: [
                            { reachedLocation: req.user._id },
                            { 'failDeliveryStatus.location': req.user._id }
                        ],
                    }
                case 'delivered':
                    return {
                        reachedLocation: req.user._id,
                        'products.orderStatus': 'delivered',
                    }
                case 'not_delivered':
                    return {
                        reachedLocation: req.user._id,
                        'products.orderStatus': 'not_delivered',
                    }
                case 'return':
                    return {
                        rproducts: { "orderStatusLog.statusChangeBy": req.user._id },

                        rproducts: {
                            $elemMatch: { "orderStatusLog.status": ['return_shipped', 'return_atCity', 'return_sameCity', 'return_delivered'] }
                        }
                    }

                default:
                    return {
                        reachedLocation: req.user._id,
                        $or: [
                            { 'products.orderStatus': 'reached_at_city' },
                            { 'products.orderStatus': 'for_delivery' },
                            { 'products.orderStatus': 'delivered' },
                        ]
                    }
            }
        }
        const findByTrackingId = (id) => {
            if (id !== 'all') {
                return {
                    trackingId: id
                }
            } else {
                return {};
            }
        }
        const findByPaymentMethod = (method) => {
            if (method != 'all') {
                return { paymentType: method }
            } else {
                return {};
            }
        }

        const sortBy = sort => {
            switch (sort) {
                case 'oldest':
                    return [['reachedDate', 1]]
                case 'newest':
                    return [['reachedDate', - 1]]
                default:
                    return [['reachedDate', - 1]]
            }
        }

        const currentPage = page || 1;
        const orderPerPage = limit || 30;

        try {
            const orders = await Package.find(findByStatusType(status))
                .find(findByTrackingId(trackingId))
                .find(findByPaymentMethod(paymentMethod))
                .lean()
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'shipping',
                        select: 'name _id amount maxDeliveryTime minDeliveryTime isDefault',
                        populate: ({
                            path: 'shipAgentId',
                            select: 'name _id number email',
                        })
                    },
                    {
                        path: 'orderedBy',
                        select: 'name mobile email username role picture _id',
                    }
                    ])
                }).populate({
                    path: 'deliveredBy',
                    select: 'name mobile _id'
                })
                .populate({
                    path: 'seller',
                    select: 'name _id'
                })
                .sort(sortBy(sort))
                .skip((currentPage - 1) * orderPerPage)
                .limit(orderPerPage);

            const getSellerAddress = async (sellerId) => {
                const sellerAddress = await Seller.findOne({
                    userId: sellerId,
                    'addresses.label': 'return'
                }, {
                    'addresses.$': 1
                }).select('addresses legalName')
                    .lean()
                    .populate('addresses.region', 'name')
                    .populate('addresses.city', 'name')
                    .populate('addresses.area', 'name');
                return sellerAddress;
            }


            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['delivery'] = await getUserAddress(item.orderId.delivery);
                    productObj['rproducts'] = status === "return" ? await getProductDetail(item.rproducts) : [];
                    productObj['seller'] = item.seller;
                    productObj['sellerAddress'] = await getSellerAddress(item.seller);
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['orders'] = item.orderId;
                    productObj['trackingId'] = item.trackingId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['reachedDate'] = item.reachedDate;
                    productObj['deliveredBy'] = item.deliveredBy;
                    productObj['notDelivered'] = item.notDelivered;
                    productObj['failDeliveryStatus'] = item.failDeliveryStatus;
                    productObj['currentStatus'] = status == "all" ?
                        item.deliveryDate !== undefined ?
                            'delivered'
                            :
                            item.deliveredBy !== undefined ?
                                'for_delivery'
                                :
                                'pending'
                        :
                        status
                        ;

                    orderProducts.push(productObj);
                })
            )

            const alldDeliveries = await Package.find(findByStatusType(status))
                .find(findByTrackingId(trackingId))
                .find(findByPaymentMethod(paymentMethod))
                .select('_id');

            return res.status(200).json({
                delivery: orderProducts,
                total: alldDeliveries.length
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/deliveries/list/rider', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { status, paymentMethod, trackingId, sort, page, limit } = req.body;
        const findByStatusType = (type, branchId) => {

            switch (type) {
                case 'pending':
                    return {
                        reachedLocation: branchId,
                        'products.orderStatus': 'reached_at_city',
                    }
                case 'for_delivery':
                    return {
                        deliveredBy: req.user._id,
                        'products.orderStatus': 'for_delivery',
                    }
                case 'delivered':
                    return {
                        deliveredBy: req.user._id,
                        'products.orderStatus': 'delivered',
                    }
                case 'not_delivered':
                    return {
                        reachedLocation: branchId,
                        'products.orderStatus': 'not_delivered',
                    }

                default:
                    return {
                        reachedLocation: branchId,
                        $or: [
                            { 'products.orderStatus': 'reached_at_city' },
                            { 'products.orderStatus': 'for_delivery' },
                            { 'products.orderStatus': 'delivered' },
                        ]
                    }
            }
        }
        const findByTrackingId = (id) => {
            if (id !== 'all') {
                return {
                    trackingId: id
                }
            } else {
                return {};
            }
        }
        const findByPaymentMethod = (method) => {
            if (method != 'all') {
                return { paymentType: method }
            } else {
                return {};
            }
        }

        const sortBy = sort => {
            switch (sort) {
                case 'oldest':
                    return [['reachedDate', 1]]
                case 'newest':
                    return [['reachedDate', - 1]]
                default:
                    return [['reachedDate', - 1]]
            }
        }

        const currentPage = page || 1;
        const orderPerPage = limit || 30;
        try {
            const riderDetails = await ShippingAgent.findOne({ userId: req.user._id }).select("parentId").lean();
            const orders = await Package.find(findByStatusType(status, riderDetails.parentId))
                .find(findByTrackingId(trackingId))
                .find(findByPaymentMethod(paymentMethod))
                .lean()
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'shipping',
                        select: 'name _id amount maxDeliveryTime minDeliveryTime isDefault',
                        populate: ({
                            path: 'shipAgentId',
                            select: 'name _id number email',
                        })
                    },
                    {
                        path: 'orderedBy',
                        select: 'name mobile email username role picture _id',
                    }
                    ])
                })
                .sort(sortBy(sort))
                .skip((currentPage - 1) * orderPerPage)
                .limit(orderPerPage);

            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['delivery'] = await getUserAddress(item.orderId.delivery);
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['orders'] = item.orderId;
                    productObj['trackingId'] = item.trackingId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['reachedDate'] = item.reachedDate;
                    productObj['notDelivered'] = item.notDelivered;
                    productObj['currentStatus'] = status == "all" ?
                        item.deliveryDate !== undefined ?
                            'delivered'
                            :
                            item.deliveredBy !== undefined ?
                                'for_delivery'
                                :
                                'pending'
                        :
                        status
                        ;

                    orderProducts.push(productObj);
                })
            )

            const allDeliveries = await Package.find(findByStatusType(status, riderDetails.parentId))
                .find(findByTrackingId(trackingId))
                .find(findByPaymentMethod(paymentMethod))
                .select('_id');

            return res.status(200).json({
                delivery: orderProducts,
                total: allDeliveries.length
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/deliveries/package/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const packageId = req.params.id;
        try {
            const package = await Package.findById(packageId)
                .select('_id orderId products shippingCharge delivery paymentType paymentStatus orders packageTotal trackingId shipDate reachedDate deliveryDate notDelivered createdAt')
                .lean()
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'orderedBy',
                        select: 'name _id',
                    }
                    ])
                });

            const getUserAddress = async (addressId) => {
                const userAddress = await Users.findOne(
                    {
                        "addresses._id": addressId,
                    }, { _id: 0 })
                    .select('addresses')
                    .lean()
                    .populate('addresses.region', 'name')
                    .populate('addresses.city', 'name')
                    .populate('addresses.area', 'name');

                return userAddress;
            }

            const packageObj = new Object();
            packageObj['_id'] = package._id;
            packageObj['products'] = await getProductDetail(package.products);
            packageObj['shippingCharge'] = package.shippingCharge;
            packageObj['delivery'] = await getUserAddress(package.orderId.delivery);
            packageObj['deliveryMobile'] = package.orderId.deliveryMobile;
            packageObj['paymentType'] = package.paymentType;
            packageObj['paymentStatus'] = package.paymentStatus;
            packageObj['orders'] = package.orderId;
            packageObj['packageTotal'] = package.packageTotal;
            packageObj['trackingId'] = package.trackingId;
            packageObj['shipDate'] = package.shipDate;
            packageObj['reachedDate'] = package.reachedDate;
            packageObj['deliveredBy'] = package.deliveredBy;
            packageObj['deliveryDate'] = package.deliveryDate;
            packageObj['notDelivered'] = package.notDelivered;
            packageObj['createdAt'] = package.createdAt;

            return res.status(200).json(packageObj);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/riderpick', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { packageId } = req.body;
        const currentUser = req.user._id;
        try {
            const riderpickStatusLog = {
                status: 'for_delivery',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            }

            const allProductFromPackage = await Package.findById(packageId, { _id: 0 }).select('products').lean();
            const reachedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "reached_at_city");

            await Promise.all(
                reachedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: packageId,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'for_delivery',
                                deliveredBy: currentUser,
                            },
                            $push: {
                                'products.$.orderStatusLog': riderpickStatusLog
                            }
                        });
                })
            );

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });


    // in case of rider unable to delivered
    server.put('/api/delivery/notdelivered', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { id, reason } = req.body;
        const currentUser = req.user._id;
        try {
            const riderpickStatusLog = {
                status: 'not_delivered',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            }

            const notDeliveryAttempt = {
                reason,
                date: new Date(),
                attemptBy: currentUser
            }

            const allProductFromPackage = await Package.findById(id, { _id: 0 }).select('products').lean();
            const reachedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "for_delivery" || item.orderStatus === "not_delivered");

            await Promise.all(
                reachedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: id,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'not_delivered',
                            },
                            $push: {
                                'products.$.orderStatusLog': riderpickStatusLog,
                            }
                        });
                })
            );
            await Package.findByIdAndUpdate(id, {
                $push: {
                    notDelivered: notDeliveryAttempt,
                }
            })

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/rider/reattempt', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { packageId } = req.body;
        const currentUser = req.user._id;
        try {
            const riderpickStatusLog = {
                status: 'for_delivery',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            }

            const allProductFromPackage = await Package.findById(packageId, { _id: 0 }).select('products').lean();
            const reachedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "not_delivered");

            await Promise.all(
                reachedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: packageId,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'for_delivery',
                                deliveredBy: currentUser,
                            },
                            $push: {
                                'products.$.orderStatusLog': riderpickStatusLog
                            }
                        });
                })
            );

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // in case of rider unable to delivered 3 time
    // in case delivery city and seller's return city are different
    server.put('/api/delivery/makefaildelivery', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { type, id } = req.body;
        const currentUser = req.user._id;
        try {
            const failDeliveryStatusLog = {
                status: 'fail_delivery',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            }
            let allProductFromPackage;
            // type = id(packageId) or trackingId
            if (type === "id") {
                allProductFromPackage = await Package.findById(id, { _id: 0 }).select('products').lean();

            } else {
                allProductFromPackage = await Package.findOne({ trackingId: id }, { _id: 0 }).select('products').lean();
            }

            const reachedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "not_delivered");

            if (reachedProductOnly.length === 0) {
                return res.status(200).json({ msg: "not_found" });
            }
            await Promise.all(
                reachedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: id,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'fail_delivery',
                            },
                            $push: {
                                'products.$.orderStatusLog': failDeliveryStatusLog,
                            }
                        }
                    )
                })
            );

            const failDeliveryLog = {
                status: 'fd_dispatched',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            };

            await Package.findByIdAndUpdate(id,
                {
                    $set: {
                        "failDeliveryStatus.status": 'fd_dispatched',
                        "failDeliveryStatus.location": currentUser,
                    },
                    $push: {
                        'failDeliveryStatus.statusLog': failDeliveryLog,
                    }
                });

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/fail/samecity', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { type, id } = req.body;
        const currentUser = req.user._id;
        try {
            let allProductFromPackage;
            // type = id(packageId) or trackingId
            if (type === "id") {
                allProductFromPackage = await Package.findById(id, { _id: 0 }).select('products failDeliveryStatus').lean();

            } else {
                allProductFromPackage = await Package.findOne({ trackingId: id }, { _id: 0 }).select('products failDeliveryStatus').lean();
            }

            //check same city status, this is useful whn delivery branch view seller info second time
            const checkSameCity = allProductFromPackage.failDeliveryStatus?.status === "fd_sameCity" ? true : false;

            if (!checkSameCity) {

                const notDeliveredProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "not_delivered");
                if (notDeliveredProductOnly.length === 0) {
                    return res.status(200).json({ msg: "not_found" });
                }

                const failDeliveryStatusLog = {
                    status: 'fail_delivery',
                    statusChangeBy: currentUser,
                    statusChangeDate: new Date()
                }

                await Promise.all(
                    notDeliveredProductOnly.map(async pro => {
                        await Package.findOneAndUpdate({
                            _id: id,
                            'products._id': pro._id,
                        },
                            {
                                $set: {
                                    "products.$.orderStatus": 'fail_delivery',
                                },
                                $push: {
                                    'products.$.orderStatusLog': failDeliveryStatusLog,
                                }
                            }
                        )
                    })
                );

                const failDeliveryLog = {
                    status: 'fd_sameCity',
                    statusChangeBy: currentUser,
                    statusChangeDate: new Date()
                };

                await Package.findByIdAndUpdate(id,
                    {
                        $set: {
                            "failDeliveryStatus.status": 'fd_sameCity',
                            "failDeliveryStatus.location": currentUser,
                        },
                        $push: {
                            'failDeliveryStatus.statusLog': failDeliveryLog,
                        }
                    });
            }

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/fail/handlerover', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { type, id } = req.body;
        const currentUser = req.user._id;
        try {
            let allProductFromPackage;
            // type = id(packageId) or trackingId
            if (type === "id") {
                allProductFromPackage = await Package.findById(id, { _id: 0 }).select('products failDeliveryStatus').lean();

            } else {
                allProductFromPackage = await Package.findOne({ trackingId: id }, { _id: 0 }).select('products failDeliveryStatus').lean();
            }


            const notDeliveredProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "fail_delivery");
            if (notDeliveredProductOnly.length === 0) {
                return res.status(200).json({ msg: "not_found" });
            }

            const failDeliveryLog = {
                status: 'fd_receivedBySeller',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            };

            await Package.findByIdAndUpdate(id,
                {
                    $set: {
                        "failDeliveryStatus.status": 'fd_receivedBySeller',
                        "failDeliveryStatus.location": currentUser,
                    },
                    $push: {
                        'failDeliveryStatus.statusLog': failDeliveryLog,
                    }
                });

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/delivered', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { packageId } = req.body;
        const currentUser = req.user._id;
        try {
            const allProductFromPackage = await Package.findById(packageId)
                .select('products shippingCharge orderId seller sellerRole paymentType')
                .lean()
                .populate({
                    path: 'orderId',
                    populate: ({
                        path: 'orderedBy',
                        select: '_id',
                    })
                });


            const wayToDeliveryProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "for_delivery");
            if (wayToDeliveryProductOnly.length === 0) {
                return res.status(200).json({ msg: "not_found" });
            }

            // sellerId
            const createdForUser_seller = allProductFromPackage.seller;

            //create invoice statement for seller between each 15 days
            const currentDate = moment();
            const currentDay = currentDate.format('DD');
            const thisMonthStartDate = moment().startOf('month').format('YYYY-MM-DD');
            const thisMonthEndDate = moment().endOf('month').format('YYYY-MM-DD');

            let invoiceStartDate;
            let invoiceEndDate;
            if (currentDay <= 15) {
                invoiceStartDate = thisMonthStartDate;
                invoiceEndDate = moment(thisMonthStartDate, 'YYYY-MM-DD').add(14, 'days').format('YYYY-MM-DD');

            } else {
                invoiceStartDate = moment(thisMonthStartDate, 'YYYY-MM-DD').add(15, 'days').format('YYYY-MM-DD');
                invoiceEndDate = thisMonthEndDate
            }

            const checkSellerInvoiceDate = await SellerInvoiceDates.countDocuments({
                sellerId: createdForUser_seller,
                $and:
                    [
                        { dateFrom: { $gte: invoiceStartDate } },
                        { dateTo: { $lte: invoiceEndDate } }
                    ]
            });

            // recalculate order total
            // recalculate commission amount
            // and insert at Package collection

            const finalOrderTotal = wayToDeliveryProductOnly.reduce((a, c) => (a + (c.productQty * c.price)), 0);
            const shippingCharge = allProductFromPackage.shippingCharge;

            const totalAtDelivery = finalOrderTotal + shippingCharge;
            //
            const totalPointAmountAtDelivery = wayToDeliveryProductOnly.reduce((a, c) => (a + c.pointAmount), 0);

            const deliveredDeliveryLog = {
                status: 'delivered',
                statusChangeBy: currentUser,
                statusChangeDate: new Date()
            };


            const maturityDate = moment().add(7, 'days');

            await Promise.all(
                wayToDeliveryProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: packageId,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'delivered',
                                totalAtDelivery,
                                totalPointAmount: totalPointAmountAtDelivery,
                                deliveryDate: new Date(),
                                maturityDate,
                            },
                            $push: {
                                'products.$.orderStatusLog': deliveredDeliveryLog,
                            }
                        });
                })
            );

            const orderId = allProductFromPackage.orderId._id;
            const orderByCreatedBy = allProductFromPackage.orderId.orderedBy._id;
            const sellerRole = allProductFromPackage.sellerRole;

            if (allProductFromPackage.paymentType === "cashondelivery") {
                const newPayment = new Payment({
                    orderId,
                    packageId,
                    amount: totalAtDelivery,
                    paymentType: 'cashondelivery',
                    transactionId: 'cashondelivery',
                    paidBy: orderByCreatedBy
                });
                const payment = await newPayment.save();
                await Package.findByIdAndUpdate(packageId, {
                    paymentStatus: 'paid',
                    paymentId: payment._id,
                    paymentDate: new Date()
                });
                await Order.findOneAndUpdate({ orderId }, {
                    paymentStatus: "paid"
                });
            }

            // also insert at Transcation collection
            // Note: shipping charge have to add to transcation collection after package has been shipped.

            // insert order total
            const newOrderTotal = new Transaction({
                orderId,
                packageId,
                transType: 'orderTotal',
                amount: finalOrderTotal,
                createdBy: orderByCreatedBy,
                createdForUser: createdForUser_seller,
                createdForString: sellerRole === 'own' ? 'own_seler' : "seller",
            });

            await newOrderTotal.save();

            //insert admin commission
            const newComission = new Transaction({
                orderId,
                packageId,
                transType: 'commission',
                amount: totalPointAmountAtDelivery,
                createdBy: createdForUser_seller,
                createdForString: "admin",
            });
            await newComission.save();

            //insert dates on sellerinvoicedates collections
            if (checkSellerInvoiceDate === 0 && sellerRole !== 'own') {
                const newSellerInvoiceDate = new SellerInvoiceDates({
                    sellerId: createdForUser_seller,
                    dateFrom: invoiceStartDate,
                    dateTo: invoiceEndDate
                });
                await newSellerInvoiceDate.save();
            }

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}