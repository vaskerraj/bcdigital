const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');
const Package = mongoose.model('Package');

const admin = require('../../../firebase/firebaseAdmin');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

const sortBy = sort => {
    switch (sort) {
        case 'oldest':
            return [['createdAt', 1]]
        case 'newest':
            return [['createdAt', - 1]]
        default:
            return [['createdAt', - 1]]
    }
}

const sortByAgg = sort => {
    switch (sort) {
        case 'oldest':
            return { 'createdAt': 1 }
        case 'newest':
            return { 'createdAt': -1 }
        default:
            return { 'createdAt': -1 }
    }
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

module.exports = function (server) {
    server.post('/api/admin/users', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { status, user, sort, page, limit } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'approved':
                    return {
                        role: 'subscriber',
                        status: { $ne: 'blocked' }
                    }
                case 'blocked':
                    return {
                        role: 'subscriber',
                        status: 'blocked'
                    }

                default:
                    return {
                        role: 'subscriber',
                        status: { $ne: 'blocked' }
                    }
            }
        }
        const findByUser = (user) => {
            if (user !== 'all') {
                return {
                    _id: user
                }
            } else {
                return {};
            }
        }

        const currentPage = page || 1;
        const productPerPage = limit || 30;

        try {
            const users = await Users.find(findByStatusType(status))
                .find(findByUser(user))
                .select('_id name username picture mobile email method addresses status createdAt')
                .lean()
                .populate('addresses.region', 'name')
                .populate('addresses.city', 'name')
                .populate('addresses.area', 'name')
                .sort(sortBy(sort))
                .skip((currentPage - 1) * productPerPage)
                .limit(productPerPage);

            const allUsers = await Users.find(findByStatusType(status), { _id: 0 })
                .find(findByUser(user))
                .select('_id');

            if (users && allUsers) return res.status(200).json({
                total: allUsers.length,
                users
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    //  for user autocomplete
    server.post('/api/search/users', async (req, res) => {
        const { searchtext } = req.body;
        const regex = new RegExp(searchtext, 'i');
        const sellers = await Users.find({ name: regex, role: 'subscriber' }, { name: 1 })
            .select('name username mobile method _id')
            .limit(10);
        return res.status(200).json(sellers);
    });

    server.get('/api/admin/user/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const userId = req.params.id;
        try {
            const user = await Users.findById(userId)
                .select('_id name username picture mobile email method addresses status createdAt')
                .lean()
                .populate('addresses.region', 'name')
                .populate('addresses.city', 'name')
                .populate('addresses.area', 'name');

            return res.status(200).json(user);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    })


    server.post('/api/admin/user/orders', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { userId, sort, page, limit } = req.body;

        const userObjId = mongoose.Types.ObjectId(userId);

        const currentPage = page || 1;
        const productPerPage = limit || 30;

        const skipBy = (currentPage, productPerPage) => {
            return ((currentPage - 1) * productPerPage)
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
                            { orderedBy: userObjId },
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
                {
                    "$sort": sortByAgg(sort)
                },
                {
                    "$skip": skipBy(currentPage, productPerPage)
                },
                {
                    "$limit": productPerPage
                }
            ]);

            const getPakageDetailsWithProducts = async (packages) => {
                let orderPackages = [];
                await Promise.all(
                    packages.map(async (item) => {
                        const packageObj = new Object();
                        packageObj['_id'] = item._id;
                        packageObj['products'] = await getProductDetail(item.products);
                        packageObj['paymentStatus'] = item.paymentStatus;
                        packageObj['orderStatus'] = item.orderStatus;
                        orderPackages.push(packageObj);
                    })
                )
                return orderPackages;
            }

            let orderProducts = [];
            await Promise.all(
                orders.map(async (item) => {
                    const productObj = new Object();
                    productObj['_id'] = item._id;
                    productObj['packages'] = await getPakageDetailsWithProducts(item.packages);
                    productObj['total'] = item.total;
                    productObj['shippingCharge'] = item.shippingCharge;
                    productObj['grandTotal'] = item.grandTotal;
                    productObj['paymentType'] = item.paymentType;
                    productObj['createdAt'] = item.createdAt;

                    orderProducts.push(productObj);
                })
            );

            const totalOrder = await Order.aggregate([
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
                            { orderedBy: userObjId },
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
                }
            ]);

            return res.status(200).json({
                orders: orderProducts,
                total: totalOrder.length
            });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // order details at admin
    server.get('/api/admin/order/detail/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
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
}