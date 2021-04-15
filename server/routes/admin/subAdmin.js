const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const admin = require('../../../firebase/firebaseAdmin');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/subadmin', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { name, email, mobile, password, adminRole } = req.body;
        try {

            const user = new Users({
                name,
                email,
                username: email,
                mobile,
                password,
                role: 'admin',
                adminRole,
                method: 'custom',
                status: 'approved'
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
                    'User already exists with this email.'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.get('/api/subadmin', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const subadmin = await Users.find({ role: 'admin', adminRole: { $ne: 'superadmin' } }).lean();
            return res.status(200).json(subadmin);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/subadmin/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const subadminId = req.params.id;
        try {
            await Users.findByIdAndRemove(subadminId);
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/subadmin', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { name, mobile, adminRole, subadminId } = req.body;
        try {
            await Users.findByIdAndUpdate(subadminId, { name, mobile, adminRole });
            return res.status(200).json({ msg: "success" });
        }
        catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." });
        }
    });

    server.put('/api/subadmin/status/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const subadminId = req.params.id;
        try {
            const preSubadminStatus = await Users.findById(subadminId).select('status');
            if (preSubadminStatus.status === 'approved') {
                await Users.findByIdAndUpdate(subadminId, { status: 'unapproved' });
            } else {
                await Users.findByIdAndUpdate(subadminId, { status: 'approved' });
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/subadmin/username', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { email, subadminId } = req.body;
        try {
            await Users.findByIdAndUpdate(subadminId, { username: email, email });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Sub admin already exists'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });

    server.put('/api/subadmin/password', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { password, subadminId } = req.body;
        try {
            const user = await Users.findById(subadminId);
            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
};