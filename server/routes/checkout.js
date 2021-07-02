const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.get('/api/checkout', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const cartDetails = await Cart.findOne({ orderedBy: req.user._id }).lean();

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