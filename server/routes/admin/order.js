const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Product = mongoose.model('Product');
const Users = mongoose.model('Users');
const Cancellation = mongoose.model('Cancellation');
const Refund = mongoose.model('Refund');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.post('/api/admin/orders/own', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { status, paymentMethod, orderId, orderDate, sort, page, limit } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'not_confirmed':
                    return {
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
                    }
                case 'confirmed':
                    return {
                        sellerRole: 'own',
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
                    }
                case 'packed':
                    return {
                        sellerRole: 'own',
                        'products.orderStatus': 'packed',
                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'shipped':
                    return {
                        sellerRole: 'own',
                        'products.orderStatus': 'shipped',
                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'delivered':
                    return {
                        sellerRole: 'own',
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
                    }
                case 'cancelled':
                    return {
                        sellerRole: 'own',
                        'products.orderStatus': 'cancel_approve',
                        products: {
                            $elemMatch: { "orderStatusLog.status": ['cancelled_by_admin', 'cancelled_by_seller', 'cancelled_by_user'] }
                        },

                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'return':
                    return {
                        sellerRole: 'own',
                        rproducts: {
                            $elemMatch: {
                                "orderStatusLog.status": ['return_request', 'return_approve', 'return_atCity',
                                    'return_sameCity', 'return_shipped', 'return_delivered']
                            }
                        }
                    }
                default:
                    return {
                        sellerRole: 'own',
                        $or: [
                            { 'products.orderStatus': 'not_confirmed' },
                            { 'products.orderStatus': 'confirmed' },
                            { 'products.orderStatus': 'packed' },
                            { 'products.orderStatus': 'shipped' },
                            { 'products.orderStatus': 'for_delivery' },
                            { 'products.orderStatus': 'delivered' },
                            { 'products.orderStatus': 'cancelled_by_user' },
                            { 'products.orderStatus': 'cancelled_by_seller' },
                            { 'products.orderStatus': 'cancelled_by_admin' },
                            { 'products.orderStatus': 'cancel_approve' },
                            { 'products.orderStatus': 'cancel_denide' },
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
                    }
            }
        }
        const findByOrderId = (id) => {
            if (id !== 'all') {
                return {
                    orderId: id
                }
            } else {
                return {};
            }
        }
        const findByDate = (date) => {
            if (date != 'all') {
                return {
                    createdAt: {
                        $gte: date.startDate, $lt: date.endDate
                    }
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
                    return [['createdAt', 1]]
                case 'newest':
                    return [['createdAt', - 1]]
                default:
                    return [['createdAt', - 1]]
            }
        }

        const currentPage = page || 1;
        const orderPerPage = limit || 30;
        try {
            const orders = await Package.find(findByStatusType(status))
                .find(findByOrderId(orderId))
                .find(findByPaymentMethod(paymentMethod))
                .find(findByDate(orderDate))
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
                        path: 'coupon',
                        select: 'name _id code availableFor discountType discountAmount minBasket availableVoucher'
                    }, {
                        path: 'orderedBy',
                        select: 'name mobile email username role picture _id',
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile _id',
                })
                .lean()
                .sort(sortBy(sort))
                .skip((currentPage - 1) * orderPerPage)
                .limit(orderPerPage);

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

            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['rproducts'] = status === "return" ? await getProductDetail(item.rproducts) : [];
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['delivery'] = item.delivery;
                    productObj['deliveryMobile'] = item.deliveryMobile;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['seller'] = item.seller;
                    productObj['sellerTime'] = item.sellerTime;
                    productObj['orders'] = item.orderId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            const allOrders = await Package.find(findByStatusType(status))
                .find(findByOrderId(orderId))
                .find(findByPaymentMethod(paymentMethod))
                .find(findByDate(orderDate))
                .select('_id');

            return res.status(200).json({
                orders: orderProducts,
                total: allOrders.length
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/admin/orders/seller', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { status, paymentMethod, orderId, orderDate, sellerId, sort, page, limit } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'not_confirmed':
                    return {
                        sellerRole: { $ne: 'own' },
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
                    }
                case 'confirmed':
                    return {
                        sellerRole: { $ne: 'own' },
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
                    }
                case 'packed':
                    return {
                        sellerRole: { $ne: 'own' },
                        'products.orderStatus': 'packed',
                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'shipped':
                    return {
                        sellerRole: { $ne: 'own' },
                        'products.orderStatus': 'shipped',
                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'delivered':
                    return {
                        sellerRole: { $ne: 'own' },
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
                    }
                case 'cancelled':
                    return {
                        sellerRole: { $ne: 'own' },
                        products: {
                            $elemMatch: { "orderStatusLog.status": ['cancelled_by_seller'] }
                        },
                        $or: [
                            { paymentType: 'cashondelivery' },
                            {
                                $and: [
                                    { paymentType: { $ne: 'cashondelivery' } },
                                    { paymentStatus: 'paid' }
                                ]
                            },
                        ],
                    }
                case 'return':
                    return {
                        sellerRole: { $ne: 'own' },
                        rproducts: {
                            $elemMatch: {
                                "orderStatusLog.status": ['return_request', 'return_approve', 'return_atCity',
                                    'return_sameCity', 'return_shipped', 'return_delivered']
                            }
                        }
                    }
                default:
                    return {
                        sellerRole: { $ne: 'own' },
                        $or: [
                            { 'products.orderStatus': 'not_confirmed' },
                            { 'products.orderStatus': 'confirmed' },
                            { 'products.orderStatus': 'packed' },
                            { 'products.orderStatus': 'shipped' },
                            { 'products.orderStatus': 'for_delivery' },
                            { 'products.orderStatus': 'delivered' },
                            { 'products.orderStatus': 'cancelled_by_user' },
                            { 'products.orderStatus': 'cancelled_by_seller' },
                            { 'products.orderStatus': 'cancelled_by_admin' },
                            { 'products.orderStatus': 'cancel_approve' },
                            { 'products.orderStatus': 'cancel_denide' },
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
                    }
            }
        }
        const findByOrderId = (id) => {
            if (id !== 'all') {
                return {
                    orderId: id
                }
            } else {
                return {};
            }
        }
        const findByDate = (date) => {
            if (date != 'all') {
                return {
                    createdAt: {
                        $gte: date.startDate, $lt: date.endDate
                    }
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
        const findBySellerId = (id) => {
            if (id !== 'all') {
                return {
                    seller: id
                }
            } else {
                return {};
            }
        }
        const sortBy = sort => {
            switch (sort) {
                case 'oldest':
                    return [['createdAt', 1]]
                case 'newest':
                    return [['createdAt', - 1]]
                default:
                    return [['createdAt', - 1]]
            }
        }

        const currentPage = page || 1;
        const orderPerPage = limit || 30;
        try {
            const orders = await Package.find(findByStatusType(status))
                .find(findByOrderId(orderId))
                .find(findBySellerId(sellerId))
                .find(findByPaymentMethod(paymentMethod))
                .find(findByDate(orderDate))
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
                        path: 'coupon',
                        select: 'name _id code availableFor discountType discountAmount minBasket availableVoucher'
                    }, {
                        path: 'orderedBy',
                        select: 'name mobile email username role picture _id',
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile _id',
                })
                .lean()
                .sort(sortBy(sort))
                .skip((currentPage - 1) * orderPerPage)
                .limit(orderPerPage);

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

            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['rproducts'] = status === "return" ? await getProductDetail(item.rproducts) : [];
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['delivery'] = item.delivery;
                    productObj['deliveryMobile'] = item.deliveryMobile;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['seller'] = item.seller;
                    productObj['sellerTime'] = item.sellerTime;
                    productObj['orders'] = item.orderId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            const allOrders = await Package.find(findByStatusType(status))
                .find(findByOrderId(orderId))
                .find(findByPaymentMethod(paymentMethod))
                .find(findByDate(orderDate))
                .select('_id');

            return res.status(200).json({
                orders: orderProducts,
                total: allOrders.length
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/orderstatus', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { status, itemId, tackingId } = req.body;
        try {
            const orderStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            const updatePackage = await Package.findOneAndUpdate({
                _id: tackingId,
                'products._id': itemId,
            }, {
                '$set': {
                    "products.$.orderStatus": status,
                    sellerTime: new Date(Date.now() + process.env.SELLER_TIME_FOR_PACKING * (60 * 60 * 1000))
                },
                $push: {
                    'products.$.orderStatusLog': orderStatusLog
                }
            });

            if (status === 'packed' || status === 'shipped' || status === 'cancelled') {
                // check app user or web user. if web send email, if app then send notification
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(200).json({ msg: "success" });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/orderstatus/all', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { status, productId, packageId } = req.body;
        try {
            const orderStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            await Promise.all(
                productId.map(async id => {
                    await Package.findOneAndUpdate({
                        _id: packageId,
                        'products._id': id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": status
                            },
                            $push: {
                                'products.$.orderStatusLog': orderStatusLog
                            }
                        }
                    );
                })

            );

            await Package.findByIdAndUpdate(packageId, {
                '$set': {
                    sellerTime: new Date(Date.now() + process.env.SELLER_TIME_FOR_PACKING * (60 * 60 * 1000))
                }
            });

            if (status === 'packed' || status === 'shipped') {
                // check app user or web user. if web send email, if app then send notification
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(200).json({ msg: "success" });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/orderstatus/trackingid', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { packageId, productId } = req.body;

        try {

            const orderStatusLog = {
                status: 'packed',
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }

            const createRandomId = () => {
                const hex = "0123456789";
                const model = "xxxxxxxxx";
                var str = "";
                for (var i = 0; i < model.length; i++) {
                    var rnd = Math.floor(Math.random() * hex.length);
                    str += model[i] == "x" ? hex[rnd] : model[i];
                }

                const addStrWithDate = Number(str) + Number(new Date())
                return process.env.TRACKINGID_PREFIX + addStrWithDate.toString().slice(-9);
            }
            const trackingId = createRandomId();

            const package = await Package.findById(packageId).select('trackingId').lean();
            if (package.trackingId) {
                await Promise.all(
                    productId.map(async (id) => {
                        await Package.findOneAndUpdate({
                            _id: packageId,
                            'products._id': id
                        },
                            {
                                $set: {
                                    "products.$.orderStatus": 'packed',
                                },
                                $push: {
                                    'products.$.orderStatusLog': orderStatusLog
                                }
                            });
                    })
                )

                return res.status(200).json({ packageId, trackingId: package.trackingId });
            } else {

                await Promise.all(
                    productId.map(async (id) => {
                        await Package.findOneAndUpdate({
                            _id: packageId,
                            'products._id': id
                        },
                            {
                                $set: {
                                    "products.$.orderStatus": 'packed',
                                    trackingId
                                },
                                $push: {
                                    'products.$.orderStatusLog': orderStatusLog
                                }
                            });
                    })
                )

                return res.status(200).json({ packageId, trackingId });
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // oder/package details & package details to print label
    server.get('/api/admin/package/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const packageId = req.params.id;
        try {
            const package = await Package.findById(packageId)
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
                        path: 'coupon',
                        select: 'name _id code availableFor discountType discountAmount minBasket availableVoucher'
                    }, {
                        path: 'orderedBy',
                        select: 'name username role picture _id',
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile email picture _id'
                }).lean();
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
                            .select('_id name colour products package').lean();
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

                const actualAddress = userAddress.addresses.filter(add => add._id.toString() === addressId.toString());
                
                return { addresses: actualAddress};
            }

            const packageObj = new Object();
            packageObj['_id'] = package._id;
            packageObj['products'] = await getProductDetail(package.products);
            packageObj['shippingCharge'] = package.shippingCharge;
            packageObj['delivery'] = await getUserAddress(package.orderId.delivery);
            packageObj['deliveryMobile'] = package.orderId.deliveryMobile;
            packageObj['paymentType'] = package.paymentType;
            packageObj['paymentStatus'] = package.paymentStatus;
            packageObj['seller'] = package.seller;
            packageObj['orders'] = package.orderId;
            packageObj['packageTotal'] = package.packageTotal;
            packageObj['trackingId'] = package.trackingId;
            packageObj['createdAt'] = package.createdAt;

            return res.status(200).json(packageObj);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/cancelorder', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { orderId, packageId, productId, paymentStatus, paymentType } = req.body;
        try {

            const checkCancelProduct = await Package.findOne(
                {
                    _id: packageId,
                    'products._id': productId,
                    "products.orderStatus": 'not_confirmed'
                })
                .lean()
                .populate('orderId', 'orderedBy');


            if (checkCancelProduct) {
                const orderStatusLog = {
                    status: 'cancelled_by_admin',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }

                const packageUpdate = await Package.findOneAndUpdate({
                    _id: packageId,
                    'products._id': productId
                },
                    {
                        $set: {
                            "products.$.orderStatus": 'cancelled_by_admin'
                        },
                        $push: {
                            'products.$.orderStatusLog': orderStatusLog
                        }
                    },
                    {
                        new: true
                    });

                //send email
                if (packageUpdate) {

                    const getShippingCharge = (productIds) => {
                        const onlyProductIdOfPackage = checkCancelProduct.products.map(item => item._id);

                        const parseProductId = JSON.parse(JSON.stringify(onlyProductIdOfPackage));

                        const diffProductIds = parseProductId.filter(item => item !== productIds);

                        let shippingCharge = 0;
                        if (diffProductIds.length === 0) {
                            shippingCharge = checkCancelProduct.shippingCharge;
                        } else {
                            // check if there is product which was cancel by admin or user & seller
                            // this condition will occur when user cancel product before then admin.
                            // if user cancel one product from order and first order may approve cancellation(status: cancel_approve). so check cancel_approve in orderStatus
                            const checkPrevCancelProduct = checkCancelProduct.products.filter(item => item.orderStatus !== 'cancelled_by_user' && item.orderStatus !== 'cancelled_by_admin' && item.orderStatus !== 'cancel_approve');

                            shippingCharge = checkPrevCancelProduct.length === 0
                                ? checkCancelProduct.shippingCharge
                                : 0
                        }
                        return shippingCharge;
                    }

                    const cancelledFromPackage = (productIds, action) => {

                        const parseOnlyProducts = JSON.parse(JSON.stringify(checkCancelProduct));
                        const onlyCancelProduct = parseOnlyProducts.products.filter((item) => productIds.includes(item._id));

                        switch (action) {
                            case 'cancelTotal':
                                return onlyCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
                            case 'products':
                                return onlyCancelProduct;
                            default:
                                return null;
                        }
                    }

                    const cancelProductObj = new Object();
                    cancelProductObj['packageId'] = packageId;
                    cancelProductObj['shippingCharge'] = getShippingCharge(productId);
                    cancelProductObj['cancelAmount'] = cancelledFromPackage(productId, 'cancelTotal')
                    cancelProductObj['products'] = cancelledFromPackage(productId, 'products');

                    const productTotalAmount = cancelProductObj.cancelAmount;

                    const shippingChargeOnCancel = cancelProductObj.shippingCharge;

                    const totalRefundCancelAmount = parseInt(productTotalAmount) + parseInt(shippingChargeOnCancel);

                    const cancelStatusLog = {
                        status: 'complete',
                        statusChangeBy: req.user._id,
                        statusChangeDate: new Date()
                    }
                    const newCancellation = new Cancellation({
                        orderId,
                        packages: cancelProductObj,
                        paymentId: paymentType === 'cashondelivery' ? null : cancelProduct.paymentId,
                        paymentType,
                        paymentStatus,
                        totalCancelAmount: totalRefundCancelAmount,
                        requestBy: checkCancelProduct.orderId.orderedBy,
                        status: 'complete',
                        statusLog: cancelStatusLog
                    });

                    await newCancellation.save();

                    if (paymentStatus === 'paid' && paymentType !== 'cashondelivery' && newCancellation) {

                        // refund status
                        const refundStatus = {
                            status: 'justin',
                            statusChangeBy: req.user._id,
                            statusChangeDate: new Date()
                        }
                        // save refund data
                        const newRefund = new Refund({
                            orderId,
                            cancellationId: newCancellation._id,
                            amount: totalRefundCancelAmount,
                            refundType: 'cancel',
                            paymentId: checkCancelProduct.paymentId,
                            paymentStatus,
                            paymentType,
                            refundTo: checkCancelProduct.orderId.orderedBy,
                            status: 'justin',
                            statusLog: refundStatus
                        });
                        await newRefund.save();

                        return res.status(200).json({ msg: 'success' });
                    } else {
                        return res.status(200).json({ msg: 'success' });
                    }
                }
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/cancelorder/all', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { orderId, packageId, productId, paymentStatus, paymentType } = req.body;
        try {
            const checkCancelProduct = await Package.findOne(
                {
                    _id: packageId,
                    'products._id': { $in: productId },
                    "products.orderStatus": 'not_confirmed'
                })
                .lean()
                .populate('orderId', 'orderedBy');


            const parseCancelProducts = JSON.parse(JSON.stringify(checkCancelProduct));
            const onlyCancelableProduct = parseCancelProducts.products.filter((item) => productId.includes(item._id));

            if (onlyCancelableProduct.length !== 0) {
                const orderStatusLog = {
                    status: 'cancelled_by_admin',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }

                await Promise.all(
                    productId.map(async (id) => {
                        await Package.findOneAndUpdate({
                            _id: packageId,
                            'products._id': id
                        },
                            {
                                $set: {
                                    "products.$.orderStatus": 'cancelled_by_admin'
                                },
                                $push: {
                                    'products.$.orderStatusLog': orderStatusLog
                                }
                            });
                    })
                )

                //send email

                const getShippingCharge = (productIds) => {
                    const onlyProductIdOfPackage = parseCancelProducts.products.map(item => item._id);
                    const diffProductIds = onlyProductIdOfPackage.filter(e => !productIds.includes(e));

                    let shippingCharge = 0;
                    if (diffProductIds.length === 0) {
                        shippingCharge = checkCancelProduct.shippingCharge;
                    } else {
                        // check if there is product which was cancel by admin or user & seller
                        // this condition will occur when user cancel product before then admin.
                        // if user cancel one product from order and first order may approve cancellation(status: cancel_approve). so check cancel_approve in orderStatus
                        const checkPrevCancelProduct = checkCancelProduct.products.filter(item => item.orderStatus !== 'cancelled_by_user' && item.orderStatus !== 'cancelled_by_admin' && item.orderStatus !== 'cancel_approve');

                        shippingCharge = checkPrevCancelProduct.length === 0
                            ? checkCancelProduct.shippingCharge
                            : 0
                    }
                    return shippingCharge;
                }

                const cancelledFromPackage = (productIds, action) => {
                    switch (action) {
                        case 'cancelTotal':
                            return onlyCancelableProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
                        case 'products':
                            return onlyCancelableProduct;
                        default:
                            return null;
                    }
                }

                const cancelProductObj = new Object();
                cancelProductObj['packageId'] = packageId;
                cancelProductObj['shippingCharge'] = getShippingCharge(productId);
                cancelProductObj['cancelAmount'] = cancelledFromPackage(productId, 'cancelTotal')
                cancelProductObj['products'] = cancelledFromPackage(productId, 'products');

                const productTotalAmount = cancelProductObj.cancelAmount;

                const shippingChargeOnCancel = cancelProductObj.shippingCharge;

                const totalRefundCancelAmount = parseInt(productTotalAmount) + parseInt(shippingChargeOnCancel);
                const cancelStatusLog = {
                    status: 'complete',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                const newCancellation = new Cancellation({
                    orderId,
                    packages: cancelProductObj,
                    paymentId: paymentType === 'cashondelivery' ? null : checkCancelProduct.paymentId,
                    paymentType,
                    paymentStatus,
                    totalCancelAmount: totalRefundCancelAmount,
                    requestBy: checkCancelProduct.orderId.orderedBy,
                    status: 'complete',
                    statusLog: cancelStatusLog
                });

                await newCancellation.save();

                if (paymentStatus === 'paid' && paymentType !== 'cashondelivery' && newCancellation) {

                    // refund status
                    const refundStatus = {
                        status: 'justin',
                        statusChangeBy: req.user._id,
                        statusChangeDate: new Date()
                    }
                    // save refund data
                    const newRefund = new Refund({
                        orderId,
                        cancellationId: newCancellation._id,
                        amount: totalRefundCancelAmount,
                        refundType: 'cancel',
                        paymentId: checkCancelProduct.paymentId,
                        paymentStatus,
                        paymentType,
                        refundTo: checkCancelProduct.orderId.orderedBy,
                        status: 'justin',
                        statusLog: refundStatus
                    });
                    await newRefund.save();

                    return res.status(200).json({ msg: 'success' });
                } else {
                    return res.status(200).json({ msg: 'success' });
                }
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}