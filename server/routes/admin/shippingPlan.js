const mongoose = require('mongoose');
// shipping plan = shipping cost
const ShippingCost = mongoose.model('ShippingPlan');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/shipcost', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        // cityId = defaultAddress's cityId
        const { name, shipAgentId, cityId, amount, minDeliveryTime, maxDeliveryTime } = req.body;
        try {
            //check exsiting data
            const checkshipCost = await ShippingCost.findOne({
                name, shipAgentId, cityId
            });
            console.log(checkshipCost);
            if (!checkshipCost) {
                const shippingCost = new ShippingCost({
                    name,
                    shipAgentId,
                    cityId,
                    amount,
                    minDeliveryTime,
                    maxDeliveryTime
                });
                await shippingCost.save();

                return res.status(201).json({ msg: 'success' });
            } else {
                return res.status(422).json({ error: "Plan already exsit with this name, city and agent." });
            }

        } catch (error) {
            return res.status(422).json({ error: "Something went wrong.Please try again." });
        }

    });

    server.get('/api/shipcost', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const shipCost = await ShippingCost.find({})
                .populate('shipAgentId')
                .populate({
                    path: 'cityId',
                    populate: ({
                        path: 'parentId',
                        select: 'name'
                    })
                }).lean();
            return res.status(200).json(shipCost);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/shipcost/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const shipCostId = req.params.id;
        try {
            const shippingCost = await ShippingCost.findById(shipCostId)
                .populate('shipAgentId')
                .populate({
                    path: 'cityId',
                    populate: ({
                        path: 'parentId',
                        select: 'name'
                    })
                }).lean();
            return res.status(200).json(shippingCost);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/shipcost/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const shipCostId = req.params.id;
        try {
            const deletedShipCost = await ShippingCost.findByIdAndRemove(shipCostId);
            if (deletedShipCost) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/shipcost', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { name, shipAgentId, cityId, amount, minDeliveryTime, maxDeliveryTime, shipCostId } = req.body;
        try {
            //check exsiting data
            const checkshipCost = await ShippingCost.findOne({
                name, shipAgentId, cityId
            });
            if (!checkshipCost) {
                await ShippingCost.findByIdAndUpdate(shipCostId, {
                    name,
                    shipAgentId,
                    cityId,
                    amount,
                    minDeliveryTime,
                    maxDeliveryTime
                });
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(422).json({ error: "Plan already exsit with this name, city and agent." });
            }
        }
        catch (error) {
            return res.status(422).json({
                error: "Something went wrong. Please try again later."
            });
        }
    });
};