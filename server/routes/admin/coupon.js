const mongoose = require('mongoose');
const Coupon = mongoose.model('Coupon');
const slugify = require('slugify');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/coupon', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { code, availableFor, description, discountType, discountAmount, minBasket, applicableOn, totalVoucher, redeemsPerUser, validityStart, validityEnd, couponUseIn, categoryId } = req.body;

        try {

            const coupon = new Coupon({
                code,
                slug: slugify(code),
                availableFor,
                description,
                discountType,
                discountAmount,
                minBasket,
                applicableOn,
                totalVoucher,
                availableVoucher: totalVoucher,
                redeemsPerUser,
                validityStart,
                validityEnd,
                couponUseIn,
                categoryId,
                createdBy: req.user._id
            });
            await coupon.save();
            return res.status(200).json({ msg: "success" });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Coupon code already exists.'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.put('/api/coupon', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { code, availableFor, description, discountType, discountAmount, minBasket,
            applicableOn, totalVoucher, redeemsPerUser, validityStart, validityEnd, couponUseIn, categoryId, couponId } = req.body;
        try {
            // fix date issue at update
            await Coupon.findByIdAndUpdate(couponId, {
                validityStart: null,
                validityEnd: null,
            })
            await Coupon.findByIdAndUpdate(couponId, {
                code,
                availableFor,
                description,
                discountType,
                discountAmount,
                minBasket,
                applicableOn,
                totalVoucher,
                availableVoucher: totalVoucher,
                redeemsPerUser,
                validityStart,
                validityEnd,
                couponUseIn,
                categoryId
            });
            return res.status(200).json({ msg: "success" });
        }
        catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Coupon code already exists.'
                    :
                    "Something went wrong.Please try again."
            });
        }
    });

    server.get('/api/admin/coupon', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const coupons = await Coupon.find({}).populate('categoryId createdBy').lean();
            return res.status(200).json(coupons);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/admin/coupon/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const couponId = req.params.id;
        try {
            const coupon = await Coupon.findById(couponId).populate('categoryId createdBy').lean();
            return res.status(200).json(coupon);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/coupon/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const couponId = req.params.id;
        try {
            await Coupon.findByIdAndRemove(couponId);
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
};