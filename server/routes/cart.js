const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Coupon = mongoose.model('Coupon');
const Cart = mongoose.model('Cart');
const ShippingCost = mongoose.model('ShippingPlan');

const moment = require('moment');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/cartitems', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { productIds } = req.body;
        try {
            let productsList = [];
            await Promise.all(
                productIds.map(async (product) => {
                    const products = await Product.findOne(
                        {
                            'products._id': product
                        }, { 'products.$': 1 })
                        .select('_id name slug brand colour size products createdBy')
                        .lean()
                        .populate('brand')
                        .populate({
                            path: 'createdBy',
                            select: '_id name username role sellerRole',
                        });
                    productsList.push(products);
                })
            );
            return res.status(200).json(productsList);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // check coupon api @at cart page
    server.post('/api/apply/coupon', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { coupon, cartTotal } = req.body;
        try {
            const couponValidation = await Coupon.findOne({
                code: coupon,
                validityStart: { $lte: new Date() },
                validityEnd: { $gte: new Date() }
            });

            if (couponValidation) {
                //check coupon for new user or all user

                // if new user : new user mean user who register before 30 days
                if (couponValidation.availableFor === 'newuser') {
                    const registerDate = moment(couponValidation.createdAt, "DD-MM-YYYY");
                    const today = moment();
                    const daysOfRegistered = today.diff(registerDate, 'days');
                    if (daysOfRegistered >= 30) {
                        return res.status(200).json({ msg: 'Provided coupon code only applicable for new user.' })
                    }
                }

                // check avaiable voucher
                if (couponValidation.availableVoucher !== 0) {
                    // check minBasket
                    if (cartTotal >= couponValidation.minBasket) {
                        //check redeemsPerUser
                        // ## Note: To get total number of coupon used by user, Cart model will needed, so return coupon for now

                        return res.status(200).json(couponValidation);

                    } else {
                        return res.status(200).json({ msg: 'You should have minimum order of Rs.' + couponValidation.minBasket + ' to apply this coupon code.' })
                    }
                }
                else {
                    return res.status(200).json({ msg: 'Coupon code not available.' });
                }
            } else {
                return res.status(200).json({ msg: 'Invalid coupon code.' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    });

    // cart to checkout page
    server.post('/api/cart', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { products, total, shipping, shippingCharge, coupon, couponDiscount, grandTotal } = req.body;

        try {
            // initial coupon discount amount and shipping charge
            let couponDiscountAmount = 0;
            let shippingChargeBaseOnPackages = 0;

            // recheck all data from frontend
            const getProductIds = products.map(item => item.productId);
            let productsCartList = [];
            await Promise.all(
                getProductIds.map(async (pro) => {
                    const cartProducts = await Product.findOne(
                        {
                            'products._id': pro
                        }, { 'products.$': 1 })
                        .select('_id products createdBy').lean();
                    productsCartList.push(cartProducts);
                })
            );

            // Note : result must be stringify and parse cause its cant combine using spread  operator
            const parseProducts = JSON.parse(JSON.stringify(productsCartList));

            // combine 
            const combineProductWithCartItems = parseProducts.map(item => ({
                ...item,
                ...products.find(ele => ele.productId === item.products[0]._id),
            }));

            // check total
            const productTotal = combineProductWithCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0);
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
                const checkCoupon = await Coupon.findById(coupon).select('discountType discountAmount').lean();
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

            // find and delete old data
            let cartExsitByThisUser = await Cart.findOne({ orderedBy: req.user._id });

            if (cartExsitByThisUser) {
                cartExsitByThisUser.remove();
            }
            const newCart = new Cart({
                products,
                total,
                shipping,
                shippingCharge,
                coupon,
                couponDiscount,
                grandTotal,
                orderedBy: req.user._id
            })
            await newCart.save();
            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}