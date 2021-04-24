const mongoose = require('mongoose');
const DeliveryUser = mongoose.model('DeliveryUser');

const admin = require('../../../firebase/firebaseAdmin');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/deliveryuser', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { name, email, mobile, password, agentId } = req.body;
        try {

            const user = new DeliveryUser({
                name,
                email,
                username: mobile,
                mobile,
                password,
                agentId,
                createdBy: req.user._id
            });
            await user.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();

            await admin.auth().createCustomToken(uid)
                .then(function (token) {
                    return res.status(201).json({ msg: 'success' });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'User already exists with this mobile.'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.get('/api/deliveryuser', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const deliveryuser = await DeliveryUser.find({}).populate('agentId createdBy').lean();
            return res.status(200).json(deliveryuser);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/deliveryuser/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const userId = req.params.id;
        try {
            await DeliveryUser.findByIdAndRemove(userId).lean();;
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/deliveryuser', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { name, mobile, agentId, userId } = req.body;
        try {
            await DeliveryUser.findByIdAndUpdate(userId, { name, mobile, agentId });
            return res.status(200).json({ msg: "success" });
        }
        catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." });
        }
    });

    server.put('/api/deliveryuser/status/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const userId = req.params.id;
        try {
            const preDeliveryStatus = await DeliveryUser.findById(userId).select('status');
            if (preDeliveryStatus.status === 'approved') {
                await DeliveryUser.findByIdAndUpdate(userId, { status: 'unapproved' });
            } else {
                await DeliveryUser.findByIdAndUpdate(userId, { status: 'approved' });
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/deliveryuser/username', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { mobile, userId } = req.body;
        try {
            await DeliveryUser.findByIdAndUpdate(userId, { username: mobile, mobile });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'User already exists with this mobile.'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });

    server.put('/api/deliveryuser/password', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { password, userId } = req.body;
        try {
            const user = await DeliveryUser.findById(userId);
            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
};