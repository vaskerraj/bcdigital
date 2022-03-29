const mongoose = require('mongoose');

const User = mongoose.model('Users');
const ShippingAgent = mongoose.model('ShippingAgent');
const Package = mongoose.model('Package');
const Users = mongoose.model('Users');
const Product = mongoose.model('Product');
const DefaultAddress = mongoose.model('DefaultAddress');

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/isdelivery', requiredAuth, checkRole(['delivery']), async (req, res) => {
        try {
            const delivery = await ShippingAgent.findOne({ userId: req.user._id })
                .lean()
                .populate('userId', 'name username mobile email deliveryRole')
                .populate('relatedCity', '_id name');
            return res.status(200).json(delivery);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });


    // branch apis
    server.get('/api/delivery/branch', requiredAuth, checkRole(['delivery']), async (req, res) => {
        try {
            const branchs = await ShippingAgent.find({
                parentId: req.user._id,
                deliveryRole: "branch",
                status: { $ne: 'deleted' }
            })
                .lean()
                .populate('userId', 'name username mobile email deliveryRole _id')
                .populate('relatedCity', '_id name');
            const getTotalRider = async (userId) => {
                return await ShippingAgent.countDocuments({
                    parentId: userId,
                    deliveryRole: "rider",
                    status: { $ne: 'deleted' }
                })
            }
            const branchWithRiderTotal = [];

            await Promise.all(
                branchs.map(async item => {
                    const braObj = new Object();
                    braObj['_id'] = item._id;
                    braObj['branchName'] = item.branchName;
                    braObj['userId'] = item.userId;
                    braObj['email'] = item.email;
                    braObj['number'] = item.number;
                    braObj['relatedCity'] = item.relatedCity;
                    braObj['address'] = item.address;
                    braObj['totalRider'] = await getTotalRider(item.userId?._id);
                    braObj['status'] = item.status;
                    braObj['createdAt'] = item.createdAt;
                    branchWithRiderTotal.push(braObj);
                })
            );
            return res.status(200).json(branchWithRiderTotal);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/branch', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { shipAgentId, name, number, address, relatedCity } = req.body;
        try {
            const updateShippingAgent = await ShippingAgent.findByIdAndUpdate(shipAgentId, {
                branchName: name,
                number,
                address,
                relatedCity
            });
            await User.findByIdAndUpdate(updateShippingAgent.userId, {
                name: updateShippingAgent.name + "_" + name,
                mobile: number,
            })
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/branch/status', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { branchId, status } = req.body;
        try {
            const deliveryUser = await ShippingAgent.findById(branchId).select("userId").lean();
            // update branch
            await ShippingAgent.findByIdAndUpdate(branchId, { status });
            // update rider those who belong to branch
            const updatedRider = await ShippingAgent.updateMany(
                {
                    parentId: deliveryUser.userId,
                    deliveryRole: "rider"
                },
                {
                    status
                });
            //user update (deliveryRole) at user collection
            if (updatedRider.nModified !== 0) {
                const deliveryRiders = await ShippingAgent.find({
                    parentId: deliveryUser.userId,
                    deliveryRole: "rider"
                }).select("userId").lean();
                const updateRiderUserId = deliveryRiders.map(item => item.userId);
                // update user as rider of deleted branch
                await User.updateMany(
                    {
                        _id: { $in: updateRiderUserId }
                    },
                    {
                        status
                    });
            }
            // update user as branch
            const updatedDeliveryUser = await User.findByIdAndUpdate(deliveryUser.userId, {
                status,
            });
            if (updatedDeliveryUser) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.delete('/api/delivery/branch/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const shipAgentId = req.params.id;
        try {
            const deliveryUser = await ShippingAgent.findById(shipAgentId).select("email userId").lean();
            // update email of deleted branch coz email have to be unique
            // delivery user have to show to custmer so not deleting user just change status and keep data
            await ShippingAgent.findByIdAndUpdate(shipAgentId, {
                status: "deleted",
                email: deliveryUser.email + "_deleted" + Math.random()
            });

            // delete(update) rider those who belong to deleted branch
            const updatedRider = await ShippingAgent.updateMany(
                {
                    parentId: deliveryUser.userId,
                    deliveryRole: "rider"
                },
                {
                    status: "deleted",
                    email: deliveryUser.email + "_deleted" + Math.random()
                });
            if (updatedRider.nModified !== 0) {
                const deliveryRiders = await ShippingAgent.find({
                    parentId: deliveryUser.userId,
                    deliveryRole: "rider"
                }).select("userId").lean();
                const updateRiderUserId = deliveryRiders.map(item => item.userId);
                // update user as rider of deleted branch
                await User.updateMany(
                    {
                        _id: { $in: updateRiderUserId }
                    },
                    {
                        status: "deleted",
                    });
            }
            // update user as branch
            const deletedDeliveryUser = await User.findByIdAndUpdate(deliveryUser.userId, {
                status: "deleted",
            });
            if (deletedDeliveryUser) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." });
        }
    });

    server.get('/api/delivery/branch/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const branchId = req.params.id;
        try {
            // Note: userId will be null in case of branch get deleted from user model
            const branch = await ShippingAgent.findById(branchId)
                .lean()
                .populate('userId', 'name username mobile email deliveryRole')
                .populate('relatedCity', '_id name')

            return res.status(200).json(branch);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    //rider apis
    // Note : main branch can view all rider of thier branchs and also add rider to main branch
    server.get('/api/delivery/rider', requiredAuth, checkRole(['delivery']), async (req, res) => {
        try {
            const currentUserId = req.user._id;
            const currentUserDetails = await User.findById(currentUserId).select("deliveryRole").lean();
            if (currentUserDetails.deliveryRole === "main") {
                // get all branch and their rider

                const branches = await ShippingAgent.find({
                    parentId: currentUserId,
                    deliveryRole: "branch",
                    status: { $ne: 'deleted' }
                }).select("userId")
                    .lean();

                const getBranchesId = branches.map(item => item.userId);
                // all brnach id including main branch
                const allBranchesIds = [...getBranchesId, ...new Array(currentUserId)];
                const riders = await ShippingAgent.find({
                    parentId: { $in: allBranchesIds },
                    deliveryRole: "rider",
                    status: { $ne: 'deleted' }
                })
                    .lean()
                    .populate('userId', 'name username mobile email deliveryRole')
                    .populate('relatedCity', '_id name');


                return res.status(200).json(riders);
            } else {
                // if user is branch
                const riders = await ShippingAgent.find({
                    parentId: req.user._id,
                    deliveryRole: 'rider',
                    status: { $ne: 'deleted' }
                })
                    .lean()
                    .populate('userId', 'name username mobile email deliveryRole')
                    .populate('relatedCity', '_id name');

                return res.status(200).json(riders);
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/rider/status', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { riderId, status } = req.body;
        try {
            const deliveryUser = await ShippingAgent.findById(riderId).select("userId").lean();
            // update rider
            await ShippingAgent.findByIdAndUpdate(riderId, { status });

            // update user as rider
            const updatedDeliveryUser = await User.findByIdAndUpdate(deliveryUser.userId, {
                status,
            });
            if (updatedDeliveryUser) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.delete('/api/delivery/rider/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const shipAgentId = req.params.id;
        try {
            const deliveryUser = await ShippingAgent.findById(shipAgentId).select("email userId").lean();
            // update email of deleted rider coz email have to be unique
            // delivery user have to show to custmer so not deleting user just change status and keep data
            await ShippingAgent.findByIdAndUpdate(shipAgentId, {
                status: "deleted",
                email: deliveryUser.email + "_deleted" + Math.random()
            });

            // update user as branch
            const deletedDeliveryUser = await User.findByIdAndUpdate(deliveryUser.userId, {
                status: "deleted",
            });
            if (deletedDeliveryUser) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." });
        }
    });

    //check page base on trackingId(check duplicate)

    server.get('/api/delivery/check/package/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const trackingId = req.params.id;
        try {
            const packages = await Package.find({
                trackingId,
                "products.orderStatus": "packed"
            })
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'shipping',
                        select: 'name',
                        populate: ({
                            path: 'shipAgentId',
                            select: 'name _id number email relatedCity',
                        })
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile _id',
                }).
                lean();
            if (packages.length === 0) {
                return res.status(200).json({ packages, msg: "not_found" });
            } else {
                return res.status(200).json({ packages, msg: "found" });
            }
        } catch (error) {
            console.log(error)
        }
    });

    ////////////////// Make ship ///////////////

    server.get('/api/package/makeship/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const packageId = req.params.id;
        try {
            const package = await Package.findById(packageId)
                .lean()
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'shipping',
                        select: 'name _id amount maxDeliveryTime minDeliveryTime isDefault',
                        populate: ({
                            path: 'shipAgentId',
                            select: 'name _id number email address',
                        })
                    },
                    {
                        path: 'orderedBy',
                        select: 'name username role picture _id',
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile email picture _id'
                });
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
                            .select('_id name colour products package').lean();
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
            const getUserAddress = async (addressId) => {
                const userAddress = await Users.findOne(
                    {
                        "addresses._id": addressId,
                    }, { _id: 0 })
                    .select('addresses')
                    .lean()
                    .populate('addresses.region', 'name')
                    .populate('addresses.city', 'name')
                    .populate('addresses.area', 'name');

                return userAddress;
            }

            const packageObj = new Object();
            packageObj['_id'] = package._id;
            packageObj['products'] = await getProductDetail(package.products);
            packageObj['shippingCharge'] = package.shippingCharge;
            packageObj['delivery'] = await getUserAddress(package.orderId.delivery);
            packageObj['deliveryMobile'] = package.orderId.deliveryMobile;
            packageObj['paymentType'] = package.paymentType;
            packageObj['paymentStatus'] = package.paymentStatus;
            packageObj['seller'] = package.seller;
            packageObj['orders'] = package.orderId;
            packageObj['packageTotal'] = package.packageTotal;
            packageObj['trackingId'] = package.trackingId;
            packageObj['createdAt'] = package.createdAt;

            return res.status(200).json(packageObj);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put("/api/package/makeship", requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { packageId } = req.body;
        try {
            const shipStatusLog = {
                status: 'shipped',
                statusChangeBy: req.user?._id !== undefined ? req.user._id : null,
                statusChangeDate: new Date()
            }

            const allProductFromPackage = await Package.findById(packageId, { _id: 0 }).select('products').lean();
            const packedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "packed");

            await Promise.all(
                packedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: packageId,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'shipped',
                            },
                            $push: {
                                'products.$.orderStatusLog': shipStatusLog
                            }
                        });
                })
            );

            await Package.findOneAndUpdate({
                _id: packageId
            }, {

                $set: {
                    shipLocation: req.user?._id !== undefined ? req.user._id : null,
                    shipDate: new Date()
                }
            })

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });


    // receive package
    server.get('/api/delivery/receive/package/:id', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const currentUser = req.user._id;
        const trackingId = req.params.id;
        try {
            const deliveryUser = await ShippingAgent.findOne({ userId: currentUser }).select("relatedCity").lean();
            const packages = await Package.find({
                trackingId,
                "products.orderStatus": "shipped"
            }).select("orderId seller _id")
                .populate({
                    path: 'orderId',
                    populate: ([{
                        path: 'shipping',
                        select: 'name',
                        populate: ({
                            path: 'shipAgentId',
                            select: 'name _id number email relatedCity',
                        })
                    }
                    ])
                })
                .populate({
                    path: 'seller',
                    select: 'name mobile _id',
                }).lean();
            if (packages.length === 0) {
                return res.status(200).json({ packages, msg: "not_found" });
            } else {

                const getUserAddress = async (addressId) => {
                    const userAddress = await Users.findOne(
                        {
                            "addresses._id": addressId,
                        }, { _id: 0 })
                        .select('addresses')
                        .lean();
                    return userAddress.addresses[0].city;
                }

                let packagesArray = [];
                await Promise.all(
                    packages.map(async (item) => {
                        const packageObj = new Object();
                        packageObj['_id'] = item._id;
                        packageObj['deliveryCity'] = await getUserAddress(item.orderId.delivery);
                        packageObj['seller'] = item.seller;
                        packageObj['orderId'] = item.orderId;

                        packagesArray.push(packageObj);
                    })
                )

                return res.status(200).json({
                    packages: packagesArray,
                    msg: "found",
                    relatedCity: deliveryUser.relatedCity
                });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/delivery/receive/package', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const currentUser = req.user._id;
        const { id } = req.body;
        try {
            const shipStatusLog = {
                status: 'reached_at_city',
                statusChangeBy: req.user._id,
                statusChangeDate: new Date()
            }

            const allProductFromPackage = await Package.findById(id, { _id: 0 }).select('products').lean();
            const packedProductOnly = allProductFromPackage.products.filter(item => item.orderStatus === "shipped");

            await Promise.all(
                packedProductOnly.map(async pro => {
                    await Package.findOneAndUpdate({
                        _id: id,
                        'products._id': pro._id,
                    },
                        {
                            $set: {
                                "products.$.orderStatus": 'reached_at_city',
                                reachedLocation: currentUser,
                                reachedDate: new Date()
                            },
                            $push: {
                                'products.$.orderStatusLog': shipStatusLog
                            }
                        });
                })
            );

            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}