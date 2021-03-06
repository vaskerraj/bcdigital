const mongoose = require('mongoose');
const Banner = mongoose.model('Banner');
const slugify = require('slugify');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bannerImagePath = "/../../public/uploads/banners";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), bannerImagePath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage })
var bannerUpload = upload.fields([
    {
        name: 'webImage', maxCount: 1
    }, {
        name: 'mobileImage',
        maxCount: 1
    }])

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');


module.exports = function (server) {
    server.get('/api/admin/banner', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const banner = await Banner.find({}, null, { sort: { order: 1 } }).lean();
            if (banner) return res.status(200).json(banner);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/banner', requiredAuth, checkRole(['admin']), bannerUpload, async (req, res) => {
        const { bannerPosition, bannerFor, sellerId, categoryId, productId, validityStart, validityEnd, bannerName } = req.body
        try {
            let webPicture;
            let mobilePicture;
            if (req.files['webImage'][0]) {
                webPicture = req.files['webImage'][0].filename;
            }

            if (req.files['mobileImage'][0]) {
                mobilePicture = req.files['mobileImage'][0].filename;
            }

            const banner = new Banner({
                bannerPosition, bannerFor, sellerId,
                categoryId, productId, validityStart, validityEnd,
                bannerName, slug: slugify(bannerName),
                webImage: webPicture, mobileImage: mobilePicture,
                cretedBy: req.user.id
            });
            await banner.save();
            return res.status(200).json({ msg: 'success' })
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }

    });
    server.post('/api/orderbanner', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { order } = req.body;
        try {
            order.map(async (o, index) => {

                let orderkey = index + 1;
                //  .exec fix issue of TypeError: Converting circular structure to JSON--> starting at object with constructor 'NativeTopology'
                await Banner.findByIdAndUpdate(o._id, { $set: { order: orderkey } });
            });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }

    });

    server.get('/api/admin/banner/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const bannerId = req.params.id;
        try {
            const banner = await Banner.findById(bannerId).populate({
                path: 'categoryId',
                as: 'breadcrumb',
                populate: ({
                    path: 'parentId',
                    select: 'name slug _id',
                    populate: ({
                        path: 'parentId',
                        select: 'name slug _id',
                    })
                })
            }).lean();
            if (banner) return res.status(200).json(banner);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/banner', requiredAuth, checkRole(['admin']), bannerUpload, async (req, res) => {

        const { bannerId, bannerPosition, bannerFor, sellerId, categoryId, productId, validityStart, validityEnd, bannerName } = req.body
        try {
            if (req.files['webImage']) {
                if (req.files['webImage'][0]) {
                    webPicture = req.files['webImage'][0].filename;
                }
                const preBannerWebImage = await Banner.findById(bannerId).select('webImage');
                if (preBannerWebImage) {
                    // check file
                    if (fs.existsSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + preBannerWebImage.webImage))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + preBannerWebImage.webImage))
                    }
                }
                await Banner.findByIdAndUpdate(bannerId, {
                    webImage: webPicture
                });
            }
            if (req.files['mobileImage']) {
                if (req.files['mobileImage'][0]) {
                    mobilePicture = req.files['mobileImage'][0].filename;
                }
                const preBannerMobileImage = await Banner.findById(bannerId).select('mobileImage');
                if (preBannerMobileImage) {
                    if (fs.existsSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + preBannerMobileImage.mobileImage))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + preBannerMobileImage.mobileImage))
                    }
                }
                await Banner.findByIdAndUpdate(bannerId, {
                    mobileImage: mobilePicture
                });
            }

            await Banner.findByIdAndUpdate(bannerId, {
                bannerPosition, bannerFor,
                sellerId, categoryId, productId,
                validityStart, validityEnd,
                bannerName, slug: slugify(bannerName)
            });
            return res.status(200).json({ msg: 'success' });
        } catch {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }

    });

    server.delete('/api/banner/:id', requiredAuth, checkRole('admin'), async (req, res) => {
        const bannerId = req.params.id;
        try {
            const deletedBanner = await Banner.findByIdAndRemove(bannerId);
            if (deletedBanner) {
                if (fs.existsSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + deletedBanner.webImage))) {
                    fs.unlinkSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + deletedBanner.webImage))
                }
                if (fs.existsSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + deletedBanner.mobileImage))) {
                    fs.unlinkSync(path.join(path.dirname(__dirname), bannerImagePath + '/' + deletedBanner.mobileImage))
                }
                return res.status(200).json({ msg: 'success' })
            }
        } catch {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }
    });
}