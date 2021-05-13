const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const slugify = require('slugify');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const productImagePath = "/../public/uploads/products";
const productImageTempPath = "/../public/uploads/products/temp";
const editorImagePath = "/../public/uploads/products/editor";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'upload') {
            cb(null, path.join(path.dirname(__dirname), editorImagePath))
        } else {
            cb(null, path.join(path.dirname(__dirname), productImagePath))
        }

    },
    filename: function (req, file, cb) {
        if (file.fieldname === 'upload') {
            cb(null, Date.now() + '_' + file.originalname)
        } else {
            cb(null, file.fieldname.split('_')[1] + '_' + file.originalname)
        }
    }
})

var upload = multer({ storage: storage });


var colorImageTempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), productImageTempPath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})


var uploadImageBaseOnColor = multer({ storage: colorImageTempStorage });

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/product', requiredAuth, checkRole(['admin', 'seller']), upload.any(), async (req, res) => {
        const { name, shortDescription, description, brand, price, speicalPricePercentage, specialValidityStart, specialValidityEnd, offeredBy, category, quantity, color, size, freeShipping, attributes, warrantyType, warrantyPeriod, weight, length, width, height, dangerousMaterials } = req.body
        try {

            let productPictures = [];
            if (req.files) {
                productPictures = req.files.map(file => {
                    return file.filename;
                });
            }
            const product = new Product({
                name,
                slug: slugify(name),
                shortDescription,
                description,
                brand,
                price,
                speicalPrice: {
                    price: speicalPricePercentage,
                    validityStart: specialValidityStart,
                    validityEnd: specialValidityEnd,
                    offeredBy
                },
                category,
                quantity,
                colour: {
                    name: color,
                    images: productPictures
                },
                size,
                freeShipping,
                attributes: attributes, // leave empty object
                warranty: {
                    warrantyType,
                    warrantyPeriod
                },
                package: {
                    weight,
                    dimensions: {
                        length,
                        width,
                        height
                    },
                    dangerousMaterials
                },
                createdBy: req.user.id
            });
            await product.save();
            return res.status(201).json({ msg: 'success' })
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later" });
        }
    });

    server.get('/api/products', async (req, res) => {
        try {
            const products = await Product.find({}, null, { sort: { order: 1 } })
                .populate('brand')
                .populate({
                    path: 'category',
                    select: 'name _id',
                    populate: ({
                        path: 'parentId',
                        select: 'name _id',
                        populate: ({
                            path: 'parentId',
                            select: 'name _id',
                        })
                    })
                })
                .populate({
                    path: 'createdBy',
                    select: 'name username role picture, _id',
                })
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/products/auth', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        try {
            const products = await Product.find({ createdBy: req.user._id }, null, { sort: { order: 1 } })
                .populate('brand')
                .populate({
                    path: 'category',
                    select: 'name _id',
                    populate: ({
                        path: 'parentId',
                        select: 'name _id',
                        populate: ({
                            path: 'parentId',
                            select: 'name _id',
                        })
                    })
                })
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });


    server.post('/api/product/editor', upload.single('upload'), function (req, res) {
        if (req.file) {
            console.log(req.file);
        }
    });

    server.post('/api/product/colour/images', uploadImageBaseOnColor.any(), function (req, res) {
        console.log(req.files);
        var filenames = req.files.map(file => file.filename)
        console.log(filenames)
        return res.status(200).json({ filename: filenames });
    });
}