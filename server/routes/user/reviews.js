const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/reviews', requiredAuth, checkRole(['subscriber']), async (req, res) => {

        try {
            const orders = await Order.find(
                {
                    orderedBy: req.user._id,
                    $and: [
                        { 'products.orderStatus': 'delivered' },
                        { 'products.paymentStatus': 'paid' }
                    ],
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
                            .select('_id name colour products rating review').lean();
                        relatedProducts.push(orderProducts);
                    })
                );

                const parseProducts = JSON.parse(JSON.stringify(relatedProducts));
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
                    productObj['orderedBy'] = item.orderedBy;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            )
            return res.status(200).json(orderProducts);

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // product already exist so let update 
    server.put('/api/review', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { productId, rating, review } = req.body;

        const productObjId = mongoose.Types.ObjectId(productId);
        try {

            const updateReview = await Product.findByIdAndUpdate(productId, {
                review: {
                    rating,
                    review,
                    postedBy: req.user._id
                }
            });
            if (updateReview) {
                const rating = await Product.aggregate([
                    { $match: { _id: productObjId } },
                    {
                        $project: {
                            averageRating: {
                                $avg: "$review.rating",
                            },
                        },
                    },
                ]).exec();
                const avarageRating = rating[0].averageRating;
                await Product.findByIdAndUpdate(productId, {
                    rating: avarageRating,
                });
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    })

    server.get('/api/reviews/:id', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const productId = req.params.id;
        try {
            const product = await Product.findOne({
                'products._id': productId,
            }, {
                'products.$': 1
            })
                .select('name colour products')
                .lean();
            const review = await Product.findOne({
                'products._id': productId,
                'review.postedBy': req.user._id
            }, {
                'review.$': 1
            })
                .select('rating review')
                .lean();
            return res.status(200).json({ product, review });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};