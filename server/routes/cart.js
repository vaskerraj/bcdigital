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
                        },
                        {
                            'products.$': 1
                        })
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
            }).lean();

            if (couponValicartdation) {
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