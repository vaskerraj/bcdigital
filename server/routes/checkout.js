const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');
const ShippingCost = mongoose.model('ShippingPlan');
const Coupon = mongoose.model('Coupon');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.get('/api/checkout', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const cartDetails = await Cart.findOne({ orderedBy: req.user._id }).lean();
            if (!cartDetails) {
                return res.status(200).json({ msg: 'error' });
            }
            const getProductIds = cartDetails.products.map(item => item.productId);
            let productsCartList = [];
            await Promise.all(
                getProductIds.map(async (pro) => {
                    const cartProducts = await Product.findOne(
                        {
                            'products._id': pro
                        })
                        .select('_id products createdBy').lean();
                    productsCartList.push(cartProducts);
                })
            );

            // Note : result must be stringify and parse cause its cant combine using spread  operator
            const parseProducts = JSON.parse(JSON.stringify(productsCartList));

            const productFromCartDetails = cartDetails.products;

            // combine proucts details and productQty
            const combineProductWithCartItems = parseProducts.map(item => ({
                ...item,
                ...productFromCartDetails.find(ele => ele.productId == item.products[0]._id)
            }));

            // initial coupon discount amount and shipping charge
            let couponDiscountAmount = 0;
            let shippingChargeBaseOnPackages = 0;

            // check total
            const productTotal = combineProductWithCartItems.reduce((a, c) => (a + c.productQty * c.products[0].finalPrice), 0);
            if (productTotal !== cartDetails.total) {
                return res.status(200).json({ msg: 'error' });
            }

            // check stock
            const checkStock = combineProductWithCartItems.find(item => item.products[0].quantity - item.products[0].sold < item.productQty);
            if (checkStock) {
                return res.status(200).json({ msg: 'error' });
            }

            //check shipping
            if (cartDetails.shipping) {
                const checkShipping = await ShippingCost.findById(cartDetails.shipping).select('amount').lean();
                if (!checkShipping) {
                    return res.status(200).json({ msg: 'error' });
                }
                // for total number of package to ship to customer
                const uniqueSellerForPackage = [...new Map(combineProductWithCartItems.map(item =>
                    [item.createdBy['_id'], item.createdBy])).values()];

                const packages = uniqueSellerForPackage.length === 0 ? 1 : uniqueSellerForPackage.length;

                // shipping charge
                shippingChargeBaseOnPackages = Number(checkShipping.amount) * Number(packages);
                if (shippingChargeBaseOnPackages !== cartDetails.shippingCharge) {
                    return res.status(200).json({ msg: 'error' });
                }
            }

            // check coupon
            if (cartDetails.coupon) {
                const checkCoupon = await Coupon.findById(cartDetails.coupon).select('discountType discountAmount').lean();
                if (!checkCoupon) {
                    return res.status(200).json({ msg: 'error' });
                }

                const discountType = checkCoupon.discountType;
                // coupon discount amount
                couponDiscountAmount = discountType === 'flat'
                    ? Math.round(checkCoupon.discountAmount)
                    : Math.round((productTotal * checkCoupon.discountAmount) / 100);

                if (couponDiscountAmount !== cartDetails.couponDiscount) {
                    return res.status(200).json({ msg: 'error' });
                }
            }

            const checkGrandTotal = productTotal + shippingChargeBaseOnPackages - couponDiscountAmount;
            if (checkGrandTotal !== cartDetails.grandTotal) {
                return res.status(200).json({ msg: 'error' });
            }

            // combine cart details and products details
            let newObj = new Object();
            let newArray = [];
            newObj['products'] = combineProductWithCartItems;
            newObj['cartDetails'] = cartDetails;
            newArray.push(newObj)

            return res.status(200).json(newArray[0]);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};