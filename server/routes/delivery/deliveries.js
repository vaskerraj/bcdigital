const mongoose = require('mongoose');

const Package = mongoose.model('Package');
const Users = mongoose.model('Users');
const Product = mongoose.model('Product');
const ShippingAgent = mongoose.model('ShippingAgent');

const { requiredAuth, checkRole } = require('../../middlewares/auth');
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
                    productObj['deliveredBy'] = item.deliveredBy;
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

}