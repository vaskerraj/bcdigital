const mongoose = require('mongoose');
const Cancellation = mongoose.model('Cancellation');
const Return = mongoose.model('Return');
const Refund = mongoose.model('Refund');
const Product = mongoose.model('Product');
const Package = mongoose.model('Package');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

const getProductDetail = async (products) => {
    const getProductIds = products.map(item => item.productId);

    const orderProducts = await Product.find(
        {
            'products._id': { $in: getProductIds }
        },
        {
            'products.$': 1
        })
        .select('_id name colour products').lean();

    const parseProducts = JSON.parse(JSON.stringify(orderProducts));
    // combine proucts details and productQty
    const combineProductWithOrderitems = parseProducts.map(item => ({
        ...item,
        ...products.find(ele => ele.productId == item.products[0]._id)
    }));

    return combineProductWithOrderitems;
}
const getPakageDetailsWithProducts = async (packages) => {
    let orderPackages = [];
    await Promise.all(
        packages.map(async (item) => {
            const packageObj = new Object();
            packageObj['_id'] = item._id;
            packageObj['products'] = await getProductDetail(item.products);
            packageObj['shippingCharge'] = item.shippingCharge;
            packageObj['amount'] = item.cancelAmount;
            packageObj['cancelAt'] = item.cancelAt;
            orderPackages.push(packageObj);
        })
    )
    return orderPackages;
}
const getRefundDetails = async (returnId) => {
    const returnInfo = await Refund.findOne({ returnId, refundType: "return" }).lean();
    return returnInfo ?
        returnInfo
        :
        null
}

module.exports = function (server) {

    // cancellation
    server.get("/api/cancellation/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const cancellationList = await Cancellation.find({
                status: 'progress'
            }).lean()
                .populate('orderId')
                .populate('requestBy', 'name mobile email _id');


            let cancellationProducts = [];

            await Promise.all(
                cancellationList.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['packages'] = await getPakageDetailsWithProducts(item.packages);
                    productObj['amount'] = item.totalCancelAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['requestBy'] = item.requestBy;
                    productObj['requestBy'] = item.requestBy;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['createdAt'] = item.createdAt;

                    cancellationProducts.push(productObj);
                })
            );
            return res.status(200).json(cancellationProducts);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put("/api/cancellation/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { cancellationId, status, packageId } = req.body;
        try {
            const cancellationStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            const updateCancellation = await Cancellation.findByIdAndUpdate(cancellationId,
                {
                    $set: {
                        status
                    },
                    $push: {
                        statusLog: cancellationStatusLog
                    }
                });

            if (updateCancellation && status === 'complete') {

                //start refund process after canellation if refund status:justin
                const refundStatusLog = {
                    status: 'progress',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Refund.findOneAndUpdate({ cancellationId }, {
                    $set: {
                        status: 'progress'
                    },
                    $push: {
                        statusLog: refundStatusLog
                    }
                });
                const cancelApproveStatusLog = {
                    status: 'cancel_approve',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Promise.all(
                    // when cancellation got approve then update package document and send email to both seller and customer.
                    updateCancellation.packages.map(async (package) => {
                        const productIds = package.products.map(item => item.productId);
                        productIds.map(async (id) => {
                            await Package.findOneAndUpdate(
                                {
                                    _id: package.packageId,
                                    'products.productId': id
                                },
                                {
                                    $set: {
                                        "products.$.orderStatus": 'cancel_approve'
                                    },
                                    $push: {
                                        'products.$.orderStatusLog': cancelApproveStatusLog
                                    },
                                });
                        });
                    })
                )
            } else if (updateCancellation && status === 'denide') {
                // when cancellation got denide then update package document and send email to both seller and customer.
                const refundStatusLog = {
                    status: 'denide',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Refund.findOneAndUpdate({ cancellationId }, {
                    $set: {
                        status: 'denide'
                    },
                    $push: {
                        statusLog: refundStatusLog
                    }
                });

                const cancelDenideStatusLog = {
                    status: 'cancel_denide',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Promise.all(
                    updateCancellation.packages.map(async (package) => {
                        const productIds = package.products.map(item => item.productId);
                        productIds.map(async (id) => {
                            await Package.findOneAndUpdate(
                                {
                                    _id: package.packageId,
                                    'products.productId': id
                                },
                                {
                                    $set: {
                                        "products.$.orderStatus": package.cancelAt
                                    },
                                    $push: {
                                        'products.$.orderStatusLog': cancelDenideStatusLog,
                                    }
                                });
                            await Package.findOneAndUpdate(
                                {
                                    _id: package.packageId,
                                    'products.productId': id
                                },
                                {
                                    $push: {
                                        'products.$.orderStatusLog': {
                                            status: package.cancelAt,
                                            statusChangeBy: req.user._id,
                                            statusChangeDate: new Date()
                                        }
                                    }
                                });
                        });
                    })
                )
            }

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.get("/api/cancellation/list", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const cancellationList = await Cancellation.find({
                status: { $ne: 'progress' }
            }).lean()
                .populate('orderId')
                .populate('requestBy', 'name mobile email _id');

            let cancellationProducts = [];

            await Promise.all(
                cancellationList.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['packages'] = await getPakageDetailsWithProducts(item.packages);
                    productObj['amount'] = item.totalCancelAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['requestBy'] = item.requestBy;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['createdAt'] = item.createdAt;
                    productObj['updatedAt'] = item.updatedAt;

                    cancellationProducts.push(productObj);
                })
            );
            return res.status(200).json(cancellationProducts);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    // return
    server.get("/api/return/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const returnList = await Return.find({
                status: 'progress'
            }).lean()
                .populate('orderId')
                .populate('requestBy', 'name mobile email _id');

            let returnProducts = [];
            await Promise.all(
                returnList.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['trackingId'] = item.trackingId;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['amount'] = item.totalReturnAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['refund'] = await getRefundDetails(item._id);
                    productObj['requestBy'] = item.requestBy;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['createdAt'] = item.createdAt;

                    returnProducts.push(productObj);
                })
            );
            return res.status(200).json(returnProducts);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put("/api/return/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { returnId, status, denideReason } = req.body;
        try {
            const returnStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }
            const updateRetrun = await Return.findByIdAndUpdate(returnId,
                {
                    $set: {
                        status
                    },
                    $push: {
                        statusLog: returnStatusLog
                    }
                });

            if (updateRetrun && status === 'complete') {
                const returnApproveStatusLog = {
                    status: 'retrun_approve',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Promise.all(
                    // when return got approve then update package document and send email to customer.

                    updateRetrun.products.map(async (item) => {
                        await Package.findOneAndUpdate(
                            {
                                _id: updateRetrun.packageId,
                                'rproducts.productId': item.productId,
                                'rproducts.orderStatus': 'return_request'
                            },
                            {
                                $set: {
                                    "rproducts.$.orderStatus": 'return_approve'
                                },
                                $push: {
                                    'rproducts.$.orderStatusLog': returnApproveStatusLog
                                },
                            })
                    })
                )
            } else if (updateRetrun && status === 'denide') {
                // when return got denide then update package document and send email customer.
                const refundStatusLog = {
                    status: 'denide',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Refund.findOneAndUpdate({ returnId }, {
                    $set: {
                        status: 'denide'
                    },
                    $push: {
                        statusLog: refundStatusLog
                    }
                });

                const returnDenideStatusLog = {
                    status: 'return_denide',
                    statusChangeBy: req.user._id,
                    statusChangeDate: new Date()
                }
                await Promise.all(
                    // when return got approve then update package document and send email to customer.

                    updateRetrun.products.map(async (item) => {
                        await Package.findOneAndUpdate(
                            {
                                _id: updateRetrun.packageId,
                                'rproducts.productId': item.productId,
                                'rproducts.orderStatus': 'return_request'
                            },
                            {
                                $set: {
                                    "rproducts.$.orderStatus": 'return_denide'
                                },
                                $push: {
                                    'rproducts.$.orderStatusLog': returnDenideStatusLog
                                },
                            })
                    })
                )
            }

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.get("/api/return/list", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const returnList = await Return.find({
                status: { $ne: 'progress' }
            }).lean()
                .populate('orderId')
                .populate('requestBy', 'name mobile email _id');

            let returnProducts = [];

            await Promise.all(
                returnList.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['trackingId'] = item.trackingId;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['amount'] = item.totalReturnAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['refund'] = await getRefundDetails(item._id);
                    productObj['requestBy'] = item.requestBy;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['createdAt'] = item.createdAt;
                    productObj['updatedAt'] = item.updatedAt;

                    returnProducts.push(productObj);
                })
            );
            return res.status(200).json(returnProducts);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    // refund
    server.get("/api/refund/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {

            const refundList = await Refund.find({
                status: 'progress'
            }).lean()
                .populate('orderId')
                .populate({
                    path: 'paymentId',
                    populate: ({
                        path: 'paidBy',
                        select: 'name mobile email _id'
                    })
                })
                .populate('cancellationId')
                .populate('refundTo', 'name mobile email _id');

            return res.status(200).json(refundList);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put("/api/refund/pending", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        const { refundId, status, reason } = req.body;
        try {
            const refundStatusLog = {
                status,
                statusChangeBy: req.user._id,
                statusChangeDate: new Date(),
                reason
            }

            await Refund.findByIdAndUpdate(refundId, {
                $set: {
                    status
                },
                $push: {
                    statusLog: refundStatusLog
                }
            });

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.get("/api/refund/list", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'ordermanager']), async (req, res) => {
        try {
            const refundList = await Refund.find({
                status: { $ne: 'progress' }
            }).lean()
                .populate('orderId')
                .populate({
                    path: 'paymentId',
                    populate: ({
                        path: 'paidBy',
                        select: 'name mobile email _id'
                    })
                })
                .populate('cancellationId')
                .populate('refundTo', 'name mobile email _id');

            return res.status(200).json(refundList);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
}