const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');
const Package = mongoose.model('Package');
const ShippingCost = mongoose.model('ShippingPlan');
const Coupon = mongoose.model('Coupon');
const User = mongoose.model('Users');

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
                        .select('_id products createdBy').lean()
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
                await Cart.deleteOne({ 'orderedBy': req.user._id });
            }

            // save packages base on unique seller
            packages.map(async package => {
                const newPackages = new Package({
                    orderId: order._id,
                    products: package.products,
                    seller: package.seller,
                    sellerRole: package.sellerRole,
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
            const order = await Order.findOne({ _id: orderId, orderedBy: req.user._id }).lean();
            if (order.paymentStatus === 'notpaid') {
                if (order.paymentType !== 'cashondelivery') {
                    return res.status(500).json({ error: "Order not found" });
                }
                // payementType = cashondelivery
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(200).json({ msg: "success" });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    });

    // order list at user pannel
    server.get('/api/orders/:duration', requiredAuth, checkRole(['subscriber']), async (req, res) => {
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
            const orders = await Order.find(
                {
                    orderedBy: req.user._id,
                    $or: [
                        { paymentType: 'cashondelivery' },
                        {
                            $and: [
                                { paymentType: { $ne: 'cashondelivery' } },
                                { 'products.paymentStatus': 'paid' }
                            ]
                        },
                    ],
                    createdAt: { $gte: fromdate }
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
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['paymentType'] = item.paymentType;
                    productObj['paymentStatus'] = item.paymentStatus;
                    productObj['orderStatus'] = item.orderStatus;
                    productObj['orderStatusLog'] = item.orderStatusLog;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            return res.status(200).json(orderProducts);

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};