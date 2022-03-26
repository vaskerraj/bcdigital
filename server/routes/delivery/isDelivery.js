const mongoose = require('mongoose');

const User = mongoose.model('Users');
const ShippingAgent = mongoose.model('ShippingAgent');
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
}