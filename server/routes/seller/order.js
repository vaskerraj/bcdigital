const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Product = mongoose.model('Product');
const Users = mongoose.model('Users');
const Cancellation = mongoose.model('Cancellation');
const Refund = mongoose.model('Refund');

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.post('/api/seller/orders/list', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { status, paymentMethod, orderId, orderDate, sort, page, limit } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'confirmed':
                    return {
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
                    }
                case 'packed':
                    return {
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
                        ],
                    }
                case 'shipped':
                    return {
                        seller: req.user._id,
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
                    }
                case 'cancelled':
                    return {
                        seller: req.user._id,
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
                        seller: req.user._id,
                        rproducts: {
                            $elemMatch: {
                                "orderStatusLog.status": ['return_approve', 'return_atCity',
                                    'return_sameCity', 'return_shipped', 'return_delivered']
                            }
                        }
                    }
                case 'all':
                    return {
                        seller: req.user._id,
                        'products.$.orderStatus': { $ne: 'confirmed' },
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
                default:
                    return {
                        seller: req.user._id,
                        'products.$.orderStatus': { $ne: 'confirmed' },
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
                    populate: ({
                        path: 'orderedBy',
                        select: 'name mobile email username role picture _id',
                    }
                    )
                })
                .populate({
                    path: 'seller',
                    select: 'name _id',
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

            const getOrderConfirmedDate = (sellerTime) => {
                //Note : sellerTime will updated after order confirmed so reduce sellerTime to get confirmed time
                return new Date(sellerTime - process.env.SELLER_TIME_FOR_PACKING * (60 * 60 * 1000));
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
                    productObj['ordersConfirmedAt'] = getOrderConfirmedDate(item.sellerTime);
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

    server.put('/api/seller/orderstatus/trackingid', requiredAuth, checkRole(['seller']), async (req, res) => {
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
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // oder/package details & package details to print label
    server.get('/api/seller/package/:id', requiredAuth, checkRole(['seller']), async (req, res) => {
        const packageId = req.params.id;
        try {
            const package = await Package.findById(packageId)
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'orderedBy',
                        select: 'name _id',
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name',
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
                            .select('_id name products colour package').lean();
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

    server.put('/api/seller/cancelorder/all', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { orderId, packageId, productId, paymentStatus, paymentType } = req.body;
        try {
            const checkCancelProduct = await Package.findOne(
                {
                    _id: packageId,
                    'products._id': { $in: productId },
                    "products.orderStatus": 'confirmed'
                })
                .lean()
                .populate('orderId', 'orderedBy');


            const parseCancelProducts = JSON.parse(JSON.stringify(checkCancelProduct));
            const onlyCancelableProduct = parseCancelProducts.products.filter((item) => productId.includes(item._id));

            if (onlyCancelableProduct.length !== 0) {
                const orderStatusLog = {
                    status: 'cancelled_by_seller',
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
                                    "products.$.orderStatus": 'cancelled_by_seller'
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
                        const checkPrevCancelProduct = checkCancelProduct.products.filter(item => item.orderStatus !== 'cancelled_by_user' && item.orderStatus !== 'cancelled_by_admin' && item.orderStatus !== 'cancelled_by_seller' && item.orderStatus !== 'cancel_approve');

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