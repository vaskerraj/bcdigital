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

const moveImageAndFile = async (oldPath, newPath) => {
    console.log(oldPath);
    try {
        await fs.renameSync(oldPath, newPath);
    } catch (err) {
        // console.log(err);
    }
}

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/product', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        console.log(req.body)
        const { inputdata: {
            categoryId,
            productname,
            brand,
            colour,
            product,
            shortDescription,
            description,
            warrantyType,
            freeShipping,
            warrantyPeriod,
            weight,
            length,
            width,
            height,
            dangerousMaterials
        } } = req.body

        try {

            // move picture from temp folder to parent folder
            const imageWithNameOnly = colour.filter(item => item.name !== '');
            imageWithNameOnly.map(item => {
                var files = item.images;
                files.map(file => {
                    moveImageAndFile(path.join(path.dirname(__dirname), "/../public/uploads/products/temp/" + file),
                        path.join(path.dirname(__dirname), "/../public/uploads/products/" + file));
                })
            });
            const newProduct = new Product({
                category: categoryId,
                name: productname,
                slug: slugify(productname + '_' + Date.now()),
                brand: brand === 'null' ? null : brand,
                colour: colour.filter(item => item.name !== ''),
                products: product,
                shortDescription,
                description,
                warranty: {
                    warrantyType,
                    warrantyPeriod
                },
                freeShipping: {
                    status: freeShipping,
                    offeredBy: req.user.id
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
            await newProduct.save();
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