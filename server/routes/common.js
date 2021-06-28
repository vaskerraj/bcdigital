const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Category = mongoose.model('Category');
const Brand = mongoose.model('Brand');
const Banner = mongoose.model('Banner');
const DefaultAddress = mongoose.model('DefaultAddress');
const ShippingCost = mongoose.model('ShippingPlan');
const Coupon = mongoose.model('Coupon');

const admin = require('../../firebase/firebaseAdmin');
const { requiredAuth, checkRole } = require('../middlewares/auth');
const verifySms = require('../utils/verifySms');

const categoriesListWithSubs = (categories, parentId = null) => {
    const categoriesList = [];
    let category;
    if (parentId === null) {
        category = categories.filter(cat => cat.parentId == undefined)
    } else {
        category = categories.filter(cat => cat.parentId == parentId)
    }

    for (let cat of category) {
        categoriesList.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            children: categoriesListWithSubs(categories, cat._id)
        });
    }
    return categoriesList;
}

const addressListWithSubs = (addresses, parentId = null) => {
    const addressesList = [];
    let address;
    if (parentId === null) {
        address = addresses.filter(add => add.parentId == undefined)
    } else {
        address = addresses.filter(add => add.parentId == parentId)
    }

    for (let add of address) {
        addressesList.push({
            _id: add._id,
            name: add.name,
            slug: add.slug,
            parentId: add.parentId,
            children: addressListWithSubs(addresses, add._id)
        });
    }
    return addressesList;
}

module.exports = function (server) {
    server.post('/api/changePwd', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const { current, password, method, role } = req.body;
        try {
            const user = await Users.findOne({ _id: req.user._id, method, role });
            await user.comparePassword(current);

            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: 'Current password doesnt match.' });
        }
    });

    server.post('/api/recoverPassword', async (req, res) => {
        const { mobile, verificationCode, password, smsmethod, role } = req.body;
        try {
            // Note: checked mobile number at while sending sms so not check mobile number as username
            const { msg } = await verifySms(mobile, verificationCode, smsmethod);
            if (msg !== 'verify') {
                return res.status(422).json({ error: 'Invalid SMS Verification Code' });
            }

            const user = await Users.findOne({ username: mobile, method: 'custom', role });
            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/categories', async (req, res) => {
        try {
            const categories = await Category.find({}).lean();
            // get list of categories with subs
            const allCategories = categoriesListWithSubs(categories)
            return res.status(200).json(allCategories);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // brand list
    server.get('/api/brands', async (req, res) => {
        try {
            const brands = await Brand.find({}, null, { sort: { order: 1 } }).lean();
            if (brands) return res.status(200).json(brands);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // banner list 
    server.get('/api/banner/:position', async (req, res) => {
        const bannerPostion = req.params.position;
        try {
            const banner = await Banner.find({
                bannerPosition: bannerPostion,
                $or: [
                    { validityStart: null },
                    {
                        $and: [
                            { validityStart: { $lte: new Date() } },
                            { validityEnd: { $gte: new Date() } }
                        ]
                    },
                ]
            }).populate({
                path: 'productId',
                select: 'slug _id',
            }).populate({
                path: 'categoryId',
                select: 'slug _id',
            }).populate({
                path: 'sellerId',
                select: 'sellerRole name _id',
            }).sort([['order', 1]]).limit(7).lean();
            if (banner) return res.status(200).json(banner);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // seller details
    server.get('/api/seller/:id', async (req, res) => {
        const sellerId = req.params.id;
        try {
            const sellers = await Users.findById(sellerId).select('_id name username picture role sellerRole addresses');
            return res.status(200).json(sellers);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    // default address of service at region city
    server.get('/api/defaultaddress', async (req, res) => {
        try {
            const addresses = await DefaultAddress.find({}).lean();
            // get list of categories with subs
            const allAddresses = addressListWithSubs(addresses)
            return res.status(200).json(allAddresses);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/related/defaultaddress', async (req, res) => {
        const { addressId } = req.body;
        try {
            const addresses = await DefaultAddress.find({ parentId: addressId }).lean();
            return res.status(200).json(addresses);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // shipping plan list (for both user who have address and doesnt have address)
    // user who have default address
    server.get('/api/shipping', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        try {
            const userAddress = await Users.findOne(
                {
                    "_id": req.user._id,
                    $or: [
                        { 'addresses.isDefault': true },
                        { 'addresses.isDefault': false }
                    ]
                })
                .select('addresses')
                .lean();
            if (userAddress) {
                const shippingPlans = await ShippingCost.find({
                    cityId: userAddress.addresses[0].city
                })
                    .lean()
                    .sort([['amount', -1]]);
                return res.status(200).json({ plans: shippingPlans, as: 'user' });
            } else {
                const defaultCustomPlan = await ShippingCost.find({ isDefault: true })
                    .lean();
                return res.status(200).json({ plans: defaultCustomPlan, as: 'default' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // shipping plan for user
    server.get('/api/shippingPlans/:cityId', requiredAuth, checkRole(['subscriber']), async (req, res) => {
        const cityId = req.params.cityId;
        try {
            const shipCost = await ShippingCost.find({ cityId }).lean();
            return res.status(200).json(shipCost);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // coupon 
    server.get('/api/coupon', requiredAuth, checkRole(['user']), async (req, res) => {
        try {
            const coupons = await Coupon.find({}).populate('categoryId').lean();
            return res.status(200).json(coupons);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // coupon detail
    server.get('/api/coupon/:id', requiredAuth, checkRole(['user']), async (req, res) => {
        const couponId = req.params.id;
        try {
            const coupons = await Coupon.findById(couponId).populate('categoryId').lean();
            return res.status(200).json(coupons);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}