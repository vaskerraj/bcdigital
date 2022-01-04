const mongoose = require('mongoose');
const Order = mongoose.model('Users');
const Package = mongoose.model('Package');
const Product = mongoose.model('Product');

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

            } else {
                return res.status(200).json({ msg: "success" });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}