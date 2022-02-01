const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Product = mongoose.model('Product');
const Users = mongoose.model('Users');
const Cancellation = mongoose.model('Cancellation');
const Refund = mongoose.model('Refund');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/admin/orders/own', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const orders = await Package.find({
                'sellerRole': 'own',
                $or: [
                    { 'products.orderStatus': 'not_confirmed' },
                    { 'products.orderStatus': 'confirmed' },
                    { 'products.orderStatus': 'packed' },
                    { 'products.orderStatus': 'shipped' },
                    { 'products.orderStatus': 'for_delivery' },
                    { 'products.orderStatus': 'delivered' },
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
                    select: 'name picture _id',
                })
                .lean()
                .sort([['updatedAt', -1]]);

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
                            .select('_id name colour products').lean();
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
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['delivery'] = item.delivery;
                    productObj['deliveryMobile'] = item.deliveryMobile;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['seller'] = item.seller;
                    productObj['orders'] = item.orderId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            return res.status(200).json(orderProducts);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
    server.get('/api/admin/orders/seller', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const orders = await Package.find({
                'sellerRole': { $ne: 'own' },
                $or: [
                    { 'products.orderStatus': 'not_confirmed' },
                    { 'products.orderStatus': 'confirmed' },
                    { 'products.orderStatus': 'packed' },
                    { 'products.orderStatus': 'shipped' },
                    { 'products.orderStatus': 'for_delivery' },
                    { 'products.orderStatus': 'delivered' },
                ],
            })
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
                    select: 'name picture _id',
                })
                .lean()
                .sort([['updatedAt', -1]]);

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
                            .select('_id name colour products').lean();
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
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['delivery'] = item.delivery;
                    productObj['deliveryMobile'] = item.deliveryMobile;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['seller'] = item.seller;
                    productObj['orders'] = item.orderId;
                    productObj['packageTotal'] = item.packageTotal;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            return res.status(200).json(orderProducts);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/admin/orderstatus', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { status, itemId, tackingId } = req.body;
        try {
            await Package.findOneAndUpdate({
                'products._id': itemId,
            }, {
                '$set': { "products.$.orderStatus": status }
            });

            const orderStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            await Package.findOneAndUpdate({ 'products._id': itemId },
                {
                    $push: {
                        'products.$.orderStatusLog': orderStatusLog
                    }
                }, {
                new: true
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

    server.put('/api/admin/orderstatus/trackingid', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { trackingId, packageId, productId } = req.body;

        try {
            await Package.findOneAndUpdate({
                'products._id': { $in: productId }
            }, {
                '$set': {
                    "products.$.orderStatus": 'packed'
                }
            });

            const orderStatusLog = {
                status: 'packed',
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            await Package.findOneAndUpdate({
                _id: packageId,
                'products._id': { $in: productId }
            },
                {
                    $push: {
                        'products.$.orderStatusLog': orderStatusLog
                    },
                    $set: {
                        trackingId
                    }
                },
                {
                    new: true
                });
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // package details to print label
    server.get('/api/admin/package/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
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
                            .select('_id name products package').lean();
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
                            const checkPrevCancelProduct = checkCancelProduct.products.filter(item => item.orderStatus !== 'cancelled_by_user' && item.orderStatus !== 'cancelled_by_admin');

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
                        totalCancelAmount: cancelProductObj.cancelAmount,
                        requestBy: checkCancelProduct.orderId.orderedBy,
                        status: 'complete',
                        statusLog: cancelStatusLog
                    });

                    await newCancellation.save();

                    if (paymentStatus === 'paid' && paymentType !== 'cashondelivery' && newCancellation) {

                        const productTotalAmount = cancelProductObj.cancelAmount;

                        const shippingChargeOnCancel = cancelProductObj.shippingCharge;

                        const totalRefundAmount = parseInt(productTotalAmount) + parseInt(shippingChargeOnCancel);

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
                            amount: totalRefundAmount,
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
}