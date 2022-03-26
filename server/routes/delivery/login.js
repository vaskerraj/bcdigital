const mongoose = require('mongoose');
const slugify = require('slugify');
const User = mongoose.model('Users');
const ShippingAgent = mongoose.model('ShippingAgent');

const { requiredAuth, checkRole } = require('../../middlewares/auth');
const admin = require('../../../firebase/firebaseAdmin');

module.exports = function (server) {

    server.post('/api/delivery/register', requiredAuth, checkRole(['delivery']), async (req, res) => {
        const { name, mobile, email, password, deliveryRole, relatedCity, address, branchId } = req.body;
        try {

            const deliveryUser = await ShippingAgent.findOne({
                userId: req.user._id
            });

            //for rider mobile number will be needed
            const user = new User({
                name: branchId ? name : deliveryUser.name + "_" + name,
                email,
                username: email,
                mobile,
                password,
                role: 'delivery',
                deliveryRole,
                method: 'custom',
                registerMethod: 'web',
                status: 'approved'
            });
            await user.save();

            // use objectid of database uid
            const uid = user._id.toString();

            const agent = new ShippingAgent({
                userId: uid,
                name: branchId ? name : deliveryUser.name + "_" + name,
                slug: slugify(branchId ? name : deliveryUser.name + "_" + name),
                email,
                number: mobile,
                address,
                panNo: deliveryUser.panNo,
                minDeliveryTime: deliveryUser.minDeliveryTime,
                maxDeliveryTime: deliveryUser.maxDeliveryTime,
                parentId: branchId ? branchId : req.user._id,
                branchName: branchId ? deliveryUser.deliveryRole === "main" ? "Main" : deliveryUser.branchName : name,
                relatedCity,
                deliveryRole,
                status: 'approved'
            });
            await agent.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client
            // create custom claims to define delivery role
            await admin.auth().createCustomToken(uid, { deliveryRole: deliveryRole });

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'User exists with this email address'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.post('/api/delivery/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ error: 'Provide both email and password' });
        }

        const user = await User.findOne({ username: email, email, method: 'custom', role: 'delivery', status: { $ne: "blocked" } });
        if (!user) {
            return res.status(422).json({ error: 'Invalid email or password.' });
        }
        try {
            await user.comparePassword(password);

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();
            if (user.status === "deleted") {
                // Note: at delivery pannel user(branch & rider) wont delete for later user of data so delete api update status as "deleted".
                // but user need to delete from firebase so deleting from login api coz we cant access other user token from delete api 

                await admin.auth().deleteUser(uid).then(async () => {
                    await User.findByIdAndUpdate(user._id, {
                        username: deliveryUser.email + "_deleted" + Math.random()
                    });
                    return res.status(422).json({ error: 'Your account was deleted' });
                }).catch((error) => {
                    return res.status(500).json({ error: "Error during user deleting" });
                });
            } else {
                const token = await admin.auth().createCustomToken(uid, { deliveryRole: user.deliveryRole });

                return res.status(200).json({
                    name: user.name,
                    deliveryRole: user.deliveryRole,
                    token
                });
            }

        } catch (err) {
            return res.status(422).json({ error: 'Invalid mobile number or password.' });
        }

    });

};