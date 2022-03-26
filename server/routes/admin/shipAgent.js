const mongoose = require('mongoose');
const ShippingAgent = mongoose.model('ShippingAgent');
const User = mongoose.model('Users');

const slugify = require('slugify');

const admin = require('../../../firebase/firebaseAdmin');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/shipagent', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { name, email, number, address, panNo, minDeliveryTime, maxDeliveryTime, password, relatedCity } = req.body;
        try {

            // create user as shipping agent | deliveryRole will be main here
            const user = new User({
                name,
                email,
                username: email,
                password,
                role: 'delivery',
                deliveryRole: 'main',
                method: 'custom',
                registerMethod: 'web',
                status: 'approved'
            });
            await user.save();

            // use objectid of database uid
            const uid = user._id.toString();

            const agent = new ShippingAgent({
                userId: uid,
                name,
                slug: slugify(name),
                email,
                number,
                address,
                panNo,
                minDeliveryTime,
                maxDeliveryTime,
                relatedCity,
                deliveryRole: 'main',
                status: 'approved'
            });
            await agent.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            await admin.auth().createCustomToken(uid, { deliveryRole: "main" })
                .then(function (token) {
                    return res.status(201).json({ msg: 'success' });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });
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