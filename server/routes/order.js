const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');
const Package = mongoose.model('Package');
const ShippingCost = mongoose.model('ShippingPlan');
const Coupon = mongoose.model('Coupon');
const Payment = mongoose.model('Payment');
const Cancellation = mongoose.model('Cancellation');
const Refund = mongoose.model('Refund');
const Users = mongoose.model('Users');
const Return = mongoose.model('Return');
const Seller = mongoose.model('Seller');

const { requiredAuth, checkRole, checkAdminRole } = require('../middlewares/auth');

const { orderConfirm, orderShipped } = require('../../email/templets');
const { oderStatusEmailHandler } = require('../../email');

const checkProductDiscountValidity = (toDate, fromDate) => {
    // to check discount is valid till today 
    const today = new Date();
    const mindate = new Date(toDate);
    const maxdate = new Date(fromDate);

    return (today.getTime() >= mindate.getTime() && today.getTime() <= maxdate.getTime());
}
const priceSectionFromCombinedCartItems = (cartItem) => {
    const cartItemQtyAndPrice = [];
    cartItem.map(item => {
        let cartItemQtyAndPriceObj = new Object();

        const finalPrice = checkProductDiscountValidity(item.products[0].promoStartDate, item.products[0].promoEndDate) === true
            ? item.products[0].finalPrice
            :
            item.products[0].price;

        cartItemQtyAndPriceObj['productQty'] = item.productQty;
        cartItemQtyAndPriceObj['exactPrice'] = finalPrice;

        cartItemQtyAndPrice.push(cartItemQtyAndPriceObj)
    })
    return cartItemQtyAndPrice;
}

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
            packageObj['maturityDate'] = item.maturityDate;
            packageObj['paymentStatus'] = item.paymentStatus;
            orderPackages.push(packageObj);
        })
    )
    return orderPackages;
}
const getPakageDetailsWithProductsOnCancel = async (packages) => {
    let orderPackages = [];
    await Promise.all(
        packages.map(async (item) => {
            const packageObj = new Object();
            packageObj['_id'] = item._id;
            packageObj['products'] = await getProductDetail(item.products);
            packageObj['shippingCharge'] = item.shippingCharge;
            packageObj['amount'] = item.cancelAmount;
            orderPackages.push(packageObj);
        })
    )
    return orderPackages;
}

const cancellableProductFromPackage = async (products) => {
    const onlyCancelableProduct = products.filter(item => item.orderStatus === 'not_confirmed' || item.orderStatus === 'confirmed' || item.orderStatus === 'packed');

    const getProductIds = onlyCancelableProduct.map(item => item.productId);
    const productDetail = await Product.find(
        {
            'products._id': { $in: getProductIds }
        },
        {
            'products.$': 1
        })
        .select('_id name colour products').lean();

    const parseProducts = JSON.parse(JSON.stringify(productDetail));
    // combine proucts details and productQty
    const combineProductWithCancelableProduct = parseProducts.map(item => ({
        ...item,
        ...products.find(ele => ele.productId == item.products[0]._id)
    }));

    return combineProductWithCancelableProduct;
}

const returnAbleProductFromPackage = async (products) => {
    const onlyCancelableProduct = products.filter(item => item.orderStatus === 'delivered');

    const getProductIds = onlyCancelableProduct.map(item => item.productId);
    const productDetail = await Product.find(
        {
            'products._id': { $in: getProductIds }
        },
        {
            'products.$': 1
        })
        .select('_id name colour products').lean();

    const parseProducts = JSON.parse(JSON.stringify(productDetail));
    // combine proucts details and productQty
    const combineProductWithCancelableProduct = parseProducts.map(item => ({
        ...item,
        ...products.find(ele => ele.productId == item.products[0]._id)
    }));

    return combineProductWithCancelableProduct;
}

module.exports = function (server) {
    server.post('/api/submitorder', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const {
            packages,
            products,
            total,
            shipping,
            shippingCharge,
            coupon,
            couponDiscount,
            grandTotal,
            delivery,
            deliveryMobile,
            paymentType
        } = req.body;

        try {
            const getProductIds = products.map(item => item.productId);
            let productsCartList = [];
            await Promise.all(
                getProductIds.map(async (pro) => {
                    const cartProducts = await Product.findOne(
                        {
                            'products._id': pro
                        },
                        {
                            'products.$': 1
                        })
                        .select('_id products createdBy point').lean()
                        .populate('createdBy');
                    productsCartList.push(cartProducts);
                })
            );

            // Note : result must be stringify and parse cause its cant combine using spread  operator
            const parseProducts = JSON.parse(JSON.stringify(productsCartList));

            // combine proucts details and productQty
            const combineProductWithCartItems = parseProducts.map(item => ({
                ...item,
                ...products.find(ele => ele.productId == item.products[0]._id)
            }));

            // initial coupon discount amount and shipping charge
            let couponDiscountAmount = 0;
            let shippingChargeBaseOnPackages = 0;

            // check total
            const productTotal = priceSectionFromCombinedCartItems(combineProductWithCartItems).reduce((a, c) => (a + c.productQty * c.exactPrice), 0);

            if (productTotal !== total) {
                return res.status(200).json({ msg: 'error' });
            }

            // check stock
            const checkStock = combineProductWithCartItems.find(item => item.products[0].quantity - item.products[0].sold < item.productQty);
            if (checkStock) {
                return res.status(200).json({ msg: 'error' });
            }

            //check shipping
            if (shipping) {
                const checkShipping = await ShippingCost.findById(shipping).select('amount').lean();
                if (!checkShipping) {
                    return res.status(200).json({ msg: 'error' });
                }
                // for total number of package to ship to customer
                const uniqueSellerForPackage = [...new Map(combineProductWithCartItems.map(item =>
                    [item.createdBy['_id'], item.createdBy])).values()];

                const packages = uniqueSellerForPackage.length === 0 ? 1 : uniqueSellerForPackage.length;

                // shipping charge
                shippingChargeBaseOnPackages = Number(checkShipping.amount) * Number(packages);
                if (shippingChargeBaseOnPackages !== shippingCharge) {
                    return res.status(200).json({ msg: 'error' });
                }
            }

            // check coupon
            if (coupon) {
                const checkCoupon = await Coupon.findById(cartDetails.coupon).select('discountType discountAmount').lean();
                if (!checkCoupon) {
                    return res.status(200).json({ msg: 'error' });
                }

                const discountType = checkCoupon.discountType;
                // coupon discount amount
                couponDiscountAmount = discountType === 'flat'
                    ? Math.round(checkCoupon.discountAmount)
                    : Math.round((productTotal * checkCoupon.discountAmount) / 100);

                if (couponDiscountAmount !== couponDiscount) {
                    return res.status(200).json({ msg: 'error' });
                }
            }

            const checkGrandTotal = productTotal + shippingChargeBaseOnPackages - couponDiscountAmount;
            if (checkGrandTotal !== grandTotal) {
                return res.status(200).json({ msg: 'error' });
            }

            // save data to database
            const newOrder = new Order({
                total,
                shipping,
                shippingCharge,
                coupon,
                couponDiscount,
                grandTotal,
                delivery,
                deliveryMobile,
                paymentType,
                orderedBy: req.user._id
            })
            const order = await newOrder.save();

            // remove data from cart
            if (order && paymentType === 'cashondelivery') {
                await Cart.deleteOne({ 'orderedBy': req.user._id }).lean();

                // send email
                const userInfo = await Users.findById(req.user._id).select('name email registerMethod').lean();
                if (userInfo.email && userInfo.registerMethod === 'web') {
                    const orderSummery = {
                        subtotal: total,
                        shippingCharge,
                        couponDiscount,
                        grandTotal,
                        paymentMethod: paymentType
                    }

                    const packagesForEmail = [];
                    await Promise.all(
                        packages.map(async (item) => {
                            const packageObj = new Object();
                            packageObj['products'] = await getProductDetail(item.products);
                            packagesForEmail.push(packageObj)
                        })
                    )
                    const orderIdUpperCase = order._id.toString().toUpperCase();
                    const emailBody = orderConfirm(userInfo.name, orderIdUpperCase, packagesForEmail, orderSummery);
                    const subject = "Your order is confirm of order id #" + orderIdUpperCase;
                    await oderStatusEmailHandler(userInfo.email, subject, emailBody)
                }
            }

            // 
            const totalComissionAmount = (product) => {
                return product.reduce((a, c) => (a + c.pointAmount), 0);
            }
            // save packages base on unique seller
            packages.map(async package => {
                const newPackages = new Package({
                    orderId: order._id,
                    products: package.products,
                    seller: package.seller,
                    sellerRole: package.sellerRole,
                    totalPointAmount: totalComissionAmount(package.products),
                    shippingCharge: package.shippingCharge,
                    packageTotal: package.packageTotal,
                    paymentType
                });
                await newPackages.save();
            })

            return res.status(201).json({
                id: order._id,
                price: grandTotal,
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/checkorder/:id', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const orderId = req.params.id;
        try {
            const order = await Order.findOne({ _id: orderId, orderedBy: req.user._id }).select('_id total shippingCharge couponDiscount grandTotal paymentType').lean();
            const packages = await Package.find({ orderId: order._id }).select('paymentStatus products').lean();

            const checkedPaidPackages = packages.filter(item => item.paymentStatus === 'notpaid');

            if (order.paymentType !== 'cashondelivery') {
                if (checkedPaidPackages.length !== 0) {
                    return res.status(500).json({ error: "Order not found" });
                }
                return res.status(200).json({ msg: "success" });
            } else {
                // payementType = cashondelivery
                return res.status(200).json({ msg: "success" });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // order list at user pannel
    server.get('/api/orders/list/:duration', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const duration = req.params.duration;

        let fromdate = new Date();
        switch (duration) {
            case 1:
                fromdate.setDate(fromdate.getDate() - 30);
                break;
            case 2:
                fromdate.setMonth(fromdate.getMonth() - 3);
                break;
            case 3:
                fromdate.setFullYear(fromdate.getFullYear(), 0, 1);
                break;
            default:
                fromdate.setMonth(fromdate.getMonth() - 3);
                break;
        }
        try {

            const orders = await Order.aggregate([
                {
                    "$lookup": {
                        "from": "packages",
                        "localField": "_id", // from order document
                        "foreignField": "orderId",
                        "as": "packages"
                    }
                },
                {
                    "$match": {
                        "$and": [
                            { orderedBy: req.user._id },
                            { createdAt: { $gte: fromdate } },
                            {
                                "$or": [
                                    { "packages.paymentType": 'cashondelivery' },
                                    {
                                        $and: [
                                            { "packages.paymentType": { $ne: 'cashondelivery' } },
                                            { 'packages.paymentStatus': 'paid' }
                                        ]
                                    },
                                ],
                            }
                        ]
                    }
                },
            ]);

            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['packages'] = await getPakageDetailsWithProducts(item.packages);
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['paymentType'] = item.paymentType;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            );
            return res.status(200).json(orderProducts);

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // order details
    server.get('/api/orders/detail/:id', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const orderId = req.params.id;
        try {

            const order = await Order.findById(orderId).lean();
            const userAddress = await Users.findOne(
                {
                    "addresses._id": order.delivery,
                }, { _id: 0 })
                .select('addresses')
                .lean()
                .populate('addresses.region', 'name')
                .populate('addresses.city', 'name')
                .populate('addresses.area', 'name');

            const packages = await Package.find(
                {
                    orderId: orderId
                })
                .lean()
                .populate('seller', '_id name');

            let orderPackages = [];
            await Promise.all(
                packages.map(async (item) => {
                    const packageObj = new Object();
                    packageObj['_id'] = item._id;
                    packageObj['products'] = await getProductDetail(item.products);
                    packageObj['paymentStatus'] = item.paymentStatus;
                    packageObj['paymentType'] = item.paymentType;
                    packageObj['seller'] = item.seller;
                    packageObj['packageTotal'] = item.packageTotal;
                    orderPackages.push(packageObj);
                })
            );

            return res.status(200).json({
                order,
                deliveryAddress: userAddress.addresses[0],
                packages: orderPackages
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/orders/payment', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { paymentType, amount, orderId, tranId, packageId } = req.body;
        try {
            const order = await Order.findOne({ _id: orderId, paymentType, orderedBy: req.user._id });

            if (order) {

                if (paymentType === 'cashondelivery') {

                    const newPayment = new Payment({
                        orderId,
                        packageId,
                        amount,
                        paymentType,
                        transactionId: tranId,
                        paidBy: req.user._id
                    });
                    const payment = await newPayment.save();
                    // update paymentStatus at package(user pay as package receive)
                    await Package.findOneAndUpdate({
                        packageId,
                    }, {
                        $set: {
                            paymentStatus: 'paid',
                            paymentId: payment._id,
                            paymentDate: new Date()
                        }
                    });

                    // remove data from cart
                    await Cart.deleteOne({ 'orderedBy': req.user._id });

                    return res.status(200).json({ msg: 'success' });
                } else {

                    const newPayment = new Payment({
                        orderId,
                        amount,
                        paymentType,
                        transactionId: tranId,
                        paidBy: req.user._id
                    });
                    const payment = await newPayment.save();

                    // update paymentStatus at package
                    await Package.updateMany({
                        orderId,
                    }, {
                        $set: {
                            paymentStatus: 'paid',
                            paymentId: payment._id,
                            paymentDate: new Date()
                        }
                    });

                    // remove data from cart
                    await Cart.deleteOne({ 'orderedBy': req.user._id });
                    return res.status(200).json({ msg: 'success' });
                }


            } else {
                const payment = new Payment({
                    orderId,
                    packageId,
                    amount,
                    paymentType,
                    transactionId: tranId,
                    paidBy: req.user._id,
                    paymentStatus: 'unfair'
                });
                await payment.save();
                return res.status(200).json({ msg: 'unfair_payment' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/orders/check-payment', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { orderId, paymentType } = req.body;
        try {
            const payment = await Payment.findOne({ orderId, paymentType, paidBy: req.user._id });
            if (payment) {
                return res.status(200).json({ msg: 'success' });
            } else {
                return res.status(200).json({ msg: 'notsuccess' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/cancelrequest/:id', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const orderId = req.params.id;
        try {

            const packages = await Package.find(
                {
                    orderId
                })
                .lean()
                .populate('orderId', '_id')
                .populate('seller', '_id name');


            let orderPackages = [];
            await Promise.all(
                packages.map(async (item) => {
                    const packageObj = new Object();
                    packageObj['_id'] = item._id;
                    packageObj['products'] = await cancellableProductFromPackage(item.products);
                    packageObj['paymentId'] = item.paymentId;
                    packageObj['paymentStatus'] = item.paymentStatus;
                    packageObj['paymentType'] = item.paymentType;
                    orderPackages.push(packageObj);
                })
            );

            return res.status(200).json(orderPackages);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/cancelorder', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { orderId, orders, cancelRequestGroupPackages, paymentId, paymentStatus, paymentType } = req.body;
        try {
            const orderStatusLog = {
                status: 'cancelled_by_user',
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }

            //check orderStatus for every product. for cancellation, order mustn't be shipped

            const cancelledFromPackage = async (packageId, productIds, action) => {
                const onlyProducts = await Package.findById(packageId, { _id: 0 }).select('products').lean();
                const parseOnlyProducts = JSON.parse(JSON.stringify(onlyProducts));
                const onlyCancelProduct = parseOnlyProducts.products.filter((item) => productIds.includes(item.productId));


                switch (action) {
                    case 'cancelTotal':
                        return onlyCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
                    case 'products':
                        const combineCancelProdutAndCanclReason = onlyCancelProduct.map(item => ({
                            ...item,
                            ...orders.find(ele => ele.productId == item.productId)
                        }));

                        return combineCancelProdutAndCanclReason;
                    case 'checkCancelableOrder':
                        const checkOrderStatusForCancel = onlyCancelProduct.some(item => item.orderStatus === 'not_confirmed' || item.orderStatus === 'confirmed' || item.orderStatus === 'packed');

                        return checkOrderStatusForCancel ? true : false;
                    case 'checkNotConfirmedOrder':
                        const checkNotConfirmedOrder = onlyCancelProduct.some(item => item.orderStatus !== 'not_confirmed');
                        return checkNotConfirmedOrder ? false : true;
                    case 'cancelAtStatus':
                        const lastOrderSatus = onlyCancelProduct[0].orderStatusLog[0]?.status;
                        return lastOrderSatus === 'cancelled_by_user' ? 'not_confirmed' : lastOrderSatus;
                    default:
                        return null;
                }
            }
            let cancelProductsOrder = [];
            await Promise.all(
                cancelRequestGroupPackages.map(async (item) => {
                    const productObj = new Object();
                    productObj['orderStatus'] = await cancelledFromPackage(item.packageId, item.productId, 'checkCancelableOrder');
                    productObj['orderStatusNotConfirmed'] = await cancelledFromPackage(item.packageId, item.productId, 'checkNotConfirmedOrder');

                    cancelProductsOrder.push(productObj);
                })
            )

            if (cancelProductsOrder.some(item => item.orderStatus !== false) === true) {
                let packageUpdate;
                await Promise.all(
                    packageUpdate = orders.map(async (order) => {
                        await Package.findOneAndUpdate({
                            _id: order.packageId,
                            'products.productId': order.productId
                        },
                            {
                                $set: {
                                    "products.$.orderStatus": 'cancelled_by_user'
                                },
                                $push: {
                                    'products.$.orderStatusLog': orderStatusLog
                                }
                            });
                    })
                )

                if (packageUpdate) {

                    const getShippingCharge = async (packageId, productIds) => {

                        const getProductFromPackage = await Package.findById(packageId).select('products shippingCharge').lean();

                        const onlyProductIdOfPackage = getProductFromPackage.products.map(item => item.productId);

                        const parseProductId = JSON.parse(JSON.stringify(onlyProductIdOfPackage));

                        const diffProductIds = parseProductId.filter(e => !productIds.includes(e));

                        let shippingCharge = 0;
                        if (diffProductIds === 0) {
                            shippingCharge = getProductFromPackage.shippingCharge;
                        } else {
                            // check if there is product which was cancel by user.
                            // this condition will occur when user cancel product one by one.
                            // if user cancel product one by one then first order may approve cancellation(status: cancel_approve). so check cancel_approve in orderStatus
                            const checkPrevCancelProduct = getProductFromPackage.products.filter(item => item.orderStatus !== 'cancelled_by_user' && item.orderStatus !== 'cancelled_by_admin' && item.orderStatus !== 'cancelled_by_seller' && item.orderStatus !== 'cancel_approve');

                            shippingCharge = checkPrevCancelProduct.length === 0
                                ? getProductFromPackage.shippingCharge
                                : 0
                        }
                        return shippingCharge;
                    }

                    let cancelProducts = [];
                    await Promise.all(
                        cancelRequestGroupPackages.map(async (item) => {
                            const productObj = new Object();
                            productObj['packageId'] = item.packageId;
                            productObj['shippingCharge'] = await getShippingCharge(item.packageId, item.productId);
                            productObj['cancelAmount'] = await cancelledFromPackage(item.packageId, item.productId, 'cancelTotal')
                            productObj['products'] = await cancelledFromPackage(item.packageId, item.productId, 'products')
                            productObj['cancelAt'] = await cancelledFromPackage(item.packageId, item.productId, 'cancelAtStatus')

                            cancelProducts.push(productObj);
                        })
                    )

                    const productTotalAmount = cancelProducts.reduce((a, c) => (a + c.cancelAmount), 0);

                    const shippingChargeOnCancel = cancelProducts.reduce((a, c) => (a + c.shippingCharge), 0);

                    const totalRefundAmount = parseInt(productTotalAmount) + parseInt(shippingChargeOnCancel);


                    // insert into cancellation

                    const statusNotConfirmedOrder = cancelProductsOrder.some(item => item.orderStatusNotConfirmed === true);

                    const cancelStatusLog = {
                        status: paymentType === 'cashondelivery' && statusNotConfirmedOrder ? 'complete' : 'progress',
                        statusChangeBy: req.user._id,
                        statusChangeDate: new Date()
                    }
                    const newCancellation = new Cancellation({
                        orderId,
                        packages: cancelProducts,
                        paymentId: paymentType === 'cashondelivery' && statusNotConfirmedOrder ? null : paymentId,
                        paymentType,
                        paymentStatus,
                        totalCancelAmount: totalRefundAmount,
                        requestBy: req.user._id,
                        status: paymentType === 'cashondelivery' && statusNotConfirmedOrder ? 'complete' : 'progress',
                        statusLog: cancelStatusLog
                    });

                    await newCancellation.save();

                    // save refund data
                    if (paymentStatus === 'paid' && paymentType !== 'cashondelivery' && newCancellation) {
                        const newRefund = new Refund({
                            orderId,
                            cancellationId: newCancellation._id,
                            amount: totalRefundAmount,
                            refundType: 'cancel',
                            paymentId,
                            paymentStatus,
                            paymentType,
                            refundTo: req.user._id,
                        });
                        await newRefund.save();
                        return res.status(200).json({ msg: 'success' });
                    }
                    return res.status(200).json({ msg: 'success' });
                }
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })

    server.get('/api/cancelorders', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const cancelOrders = await Cancellation.find(
                { requestBy: req.user._id }
            )
                .lean()
                .populate('orderId', 'createdAt');

            const getRefundDetails = async (cancellationId, paymentType, paymentStatus) => {
                const cancelInfo = await Refund.findOne({ cancellationId }).lean();
                return cancelInfo ?
                    paymentType === cancelInfo.paymentType && paymentStatus === cancelInfo.paymentStatus ?
                        cancelInfo
                        :
                        null
                    :
                    null
            }
            let cancelOrderProducts = [];

            await Promise.all(
                cancelOrders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['packages'] = await getPakageDetailsWithProductsOnCancel(item.packages);
                    productObj['amount'] = item.totalCancelAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['refund'] = await getRefundDetails(item._id, item.paymentType, item.paymentStatus);
                    productObj['createdAt'] = item.createdAt;

                    cancelOrderProducts.push(productObj);
                })
            );
            return res.status(200).json(cancelOrderProducts);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })

    // return item
    server.get('/api/returnrequest/:id', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const packageId = req.params.id;
        try {
            const package = await Package.findOne({
                _id: packageId,
                maturityDate: { $gte: new Date() }
            }).
                select('_id products orderId seller paymentId maturityDate')
                .lean();
            if (package) {
                const packageObj = new Object();
                packageObj['_id'] = package._id;
                packageObj['products'] = await returnAbleProductFromPackage(package.products, package._id);
                packageObj['paymentId'] = package.paymentId;
                packageObj['maturityDate'] = package.maturityDate;

                return res.status(200).json(packageObj);
            } else {
                return res.status(200).json({ products: {} });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/returnorder', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const {
            orderId,
            orders,
            returnRequestGroupPackage,
            paymentId,
            refundValue,
            accountName,
            accountNumber,
            bankName,
            branch,
            esewaId
        } = req.body;
        try {
            const orderStatusLog = {
                status: 'return_request',
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
                return process.env.TRACKINGID_PREFIX + addStrWithDate.toString().slice(-9) + "RN";
            }
            const returnTrackingId = createRandomId();

            // return can request base on same pakageId not with base on orderId
            const packageId = returnRequestGroupPackage[0].packageId;

            //check orderStatus for every product. for cancellation, order mustn't be shipped
            const onlyProducts = await Package.findById(packageId, { _id: 0 }).select('products paymentType').lean();

            const returnedFromPackage = async (productIds, action) => {
                const parseOnlyProducts = JSON.parse(JSON.stringify(onlyProducts));
                const onlyReturnProduct = parseOnlyProducts.products.filter((item) => productIds.includes(item.productId));

                const combineProductAndReturnOrder = onlyReturnProduct.map(item => ({
                    ...item,
                    ...orders.find(ele => ele.productId == item.productId)
                }));

                switch (action) {
                    case 'productPrice':
                        const productsForPrice = parseOnlyProducts.products.filter(item => item.productId === productIds);
                        // get price of per per productQty coz return QTY wont be same as order QTY
                        return (productsForPrice[0].price / productsForPrice[0].productQty);
                    case 'products':
                        return combineProductAndReturnOrder;
                    case 'checkReturnableOrder':
                        const checkOrderForReturn = combineProductAndReturnOrder.some(item => item.orderStatus === 'delivered'
                            && item.productQty > item.returnProductQty
                            && item.productQty >= item.reqReturnProductQty
                        );
                        return checkOrderForReturn ? true : false;
                    default:
                        return null;
                }
            }
            const checkReturnOrder = await returnedFromPackage(returnRequestGroupPackage[0].productId, 'checkReturnableOrder');

            if (checkReturnOrder) {
                let packageUpdate;

                await Promise.all(
                    packageUpdate = orders.map(async (order) => {
                        await Package.findOneAndUpdate({
                            _id: order.packageId,
                            'products.productId': order.productId
                        },
                            {
                                $inc: {
                                    "products.$.returnProductQty": order.reqReturnProductQty
                                }
                            }
                        );
                    })
                )

                if (packageUpdate) {

                    // insert rproduct at Package collection
                    let returnProductsForPackageCollection = [];
                    await Promise.all(
                        orders.map(async (item) => {
                            const productObj = new Object();
                            productObj['productId'] = item.productId;
                            productObj['trackingId'] = returnTrackingId;
                            productObj['productQty'] = item.reqReturnProductQty;
                            productObj['price'] = parseInt(await returnedFromPackage(item.productId, 'productPrice')) * parseInt(item.reqReturnProductQty);
                            productObj['reason'] = item.reason;
                            productObj['orderStatus'] = "return_request";
                            productObj['orderStatusLog'] = orderStatusLog;

                            returnProductsForPackageCollection.push(productObj);
                        })
                    )

                    await Package.findByIdAndUpdate(
                        packageId,
                        {
                            rproducts: returnProductsForPackageCollection
                        }
                    );

                    // insert into return
                    let returnProductsForReturnCollection = [];
                    await Promise.all(
                        orders.map(async (item) => {
                            const productObj = new Object();
                            productObj['productId'] = item.productId;
                            productObj['productQty'] = item.reqReturnProductQty;
                            productObj['price'] = parseInt(await returnedFromPackage(item.productId, 'productPrice')) * parseInt(item.reqReturnProductQty);
                            productObj['reason'] = item.reason;
                            returnProductsForReturnCollection.push(productObj);
                        })
                    )

                    const totalReturnAmount = returnProductsForReturnCollection.reduce((a, c) => a + c.price, 0)

                    const returnStatusLog = {
                        status: 'progress',
                        statusChangeBy: req.user._id,
                        statusChangeDate: new Date()
                    }
                    const newReturn = new Return({
                        orderId,
                        packageId,
                        trackingId: returnTrackingId,
                        products: returnProductsForReturnCollection,
                        paymentId: paymentId,
                        totalReturnAmount,
                        requestBy: req.user._id,
                        status: 'progress',
                        statusLog: returnStatusLog
                    });

                    await newReturn.save();

                    // save refund data
                    if (newReturn) {
                        const newRefund = new Refund({
                            orderId,
                            returnId: newReturn._id,
                            amount: totalReturnAmount,
                            refundType: 'return',
                            paymentId,
                            paymentType: onlyProducts.paymentType,
                            paymentStatus: "paid",
                            refundTo: req.user._id,
                            esewaId,
                            'account.title': accountName,
                            'account.number': accountNumber,
                            'account.bankName': bankName,
                            'account.branch': branch,
                            status: 'justin'
                        });
                        await newRefund.save();
                        return res.status(200).json({ msg: 'success', id: returnTrackingId, "refund": "success" });
                    }
                    // report refund and return process has error.
                    return res.status(200).json({ msg: 'success', id: returnTrackingId, "refund": "error" });
                } else {
                    return res.status(422).json({ error: "Some error occur. Please try again later." });
                }
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/returnresult/:packageId/:trackingId', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const packageId = req.params.packageId;
        const trackingId = req.params.trackingId;
        try {
            const returns = await Return.findOne(
                {
                    packageId,
                    trackingId,
                    requestBy: req.user._id,
                }
            )
                .select('_id orderId packageId products status')
                .lean()
                .populate('orderId', 'createdAt')
                .populate('packageId', 'rproducts');

            const returnOrders = new Object();
            returnOrders['_id'] = returns._id;
            returnOrders['order'] = returns.orderId;
            returnOrders['package'] = returns.packageId;
            returnOrders['products'] = await getProductDetail(returns.products);
            returnOrders['status'] = returns.status;

            return res.status(200).json(returnOrders);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // oder/package details & package details to print label
    server.get('/api/retrunitems/:packageId/:trackingId', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const packageId = req.params.packageId;
        const trackingId = req.params.trackingId;
        try {
            const package = await Package.findById(packageId)
                .select("_id orderId seller rproducts trackingId")
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

            //seller return address
            const sellerAddress = await Seller.findOne({
                userId: package.seller._id,
                'addresses.label': 'return'
            }, {
                'addresses.$': 1
            }).select('addresses').lean()
                .populate('addresses.region', 'name')
                .populate('addresses.city', 'name')
                .populate('addresses.area', 'name');

            const filterdReturnProducts = package.rproducts.filter(item => item.trackingId === trackingId);

            const packageObj = new Object();
            packageObj['_id'] = package._id;
            packageObj['rproducts'] = await getProductDetail(filterdReturnProducts);
            packageObj['returnAddress'] = sellerAddress;
            packageObj['seller'] = package.seller;
            packageObj['orders'] = package.orderId;
            packageObj['trackingId'] = package.trackingId;
            packageObj['returnTrackingId'] = trackingId;

            return res.status(200).json(packageObj);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/returnorders', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const returnOrders = await Return.find(
                { requestBy: req.user._id }
            )
                .lean()
                .populate('orderId', 'createdAt')
                .populate('packageId', 'rproducts')
                .sort({ createdAt: -1 });

            const getRefundDetails = async (returnId, paymentType, paymentStatus) => {
                const returnInfo = await Refund.findOne({ returnId, refundType: "return" }).lean();
                return returnInfo ?
                    returnInfo
                    :
                    null
            }
            let returnOrderProducts = [];

            await Promise.all(
                returnOrders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['order'] = item.orderId;
                    productObj['packageId'] = item.packageId;
                    productObj['products'] = await getProductDetail(item.products);
                    productObj['returnTrackingId'] = item.trackingId;
                    productObj['amount'] = item.totalReturnAmount;
                    productObj['paymentId'] = item.paymentId;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['status'] = item.status;
                    productObj['statusLog'] = item.statusLog;
                    productObj['refund'] = await getRefundDetails(item._id, item.paymentType, item.paymentStatus);
                    productObj['createdAt'] = item.createdAt;

                    returnOrderProducts.push(productObj);
                })
            );
            return res.status(200).json(returnOrderProducts);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })

};