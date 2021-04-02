const mongoose = require('mongoose');
const Brand = mongoose.model('Brand');
const slugify = require('slugify');
var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), '/../../public/uploads/brands'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage })

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');


module.exports = function (server) {
    server.get('/api/admin/brands', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const brands = await Brand.find({}, null, { sort: { order: 1 } }).lean();
            if (brands) return res.status(200).json(brands);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/brands', requiredAuth, checkRole(['admin']), upload.single('brandPicture'), async (req, res) => {
        const { name } = req.body
        try {
            let brandPicture;
            if (req.file) {
                brandPicture = req.file.filename;
            }
            const brands = new Brand({ name, slug: slugify(name), image: brandPicture, cretedBy: req.user.id });
            await brands.save();
            return res.status(200).json({ msg: 'success' })
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }
    });
    server.post('/api/orderbrands', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { order } = req.body;
        try {
            order.map(async (o, index) => {

                let orderkey = index + 1;
                //  .exec fix issue of TypeError: Converting circular structure to JSON--> starting at object with constructor 'NativeTopology'
                await Brand.findByIdAndUpdate(o._id, { $set: { order: orderkey } });
            });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }

    });
}