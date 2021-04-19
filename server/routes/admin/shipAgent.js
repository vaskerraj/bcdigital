const mongoose = require('mongoose');
const ShippingAgent = mongoose.model('ShippingAgent');
const slugify = require('slugify');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/shipagent', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { name, email, number, address, panNo, minDeliveryTime, maxDeliveryTime } = req.body;
        try {

            const agent = new ShippingAgent({
                name,
                slug: slugify(name),
                email,
                number,
                address,
                panNo,
                minDeliveryTime,
                maxDeliveryTime,
                status: 'approved'
            });
            await agent.save();

            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Agent already exists with this email address'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.get('/api/shipagent', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const shipAgents = await ShippingAgent.find({}).lean();
            return res.status(200).json(shipAgents);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
    server.get('/api/shipagent/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const shipAgentId = req.params.id;
        try {
            const shipAgent = await ShippingAgent.findById(shipAgentId).lean();
            return res.status(200).json(shipAgent);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/shipagent/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const shipAgentId = req.params.id;
        try {
            const deletedAgent = await ShippingAgent.findByIdAndRemove(shipAgentId);
            if (deletedAgent) {
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/shipagent', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { name, email, number, address, panNo, minDeliveryTime, maxDeliveryTime, shipAgentId } = req.body;
        try {
            await ShippingAgent.findByIdAndUpdate(shipAgentId, {
                name,
                slug: slugify(name),
                email,
                number,
                address,
                panNo,
                minDeliveryTime,
                maxDeliveryTime
            });
            return res.status(200).json({ msg: "success" });
        }
        catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Agent already exists with this email address'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });

    server.put('/api/shipagent/status/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const shipAgentId = req.params.id;
        try {
            const preAgentStatus = await ShippingAgent.findById(shipAgentId).select('status');
            if (preAgentStatus.status === 'approved') {
                await ShippingAgent.findByIdAndUpdate(shipAgentId, { status: 'unapproved' });
            } else {
                await ShippingAgent.findByIdAndUpdate(shipAgentId, { status: 'approved' });
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

};