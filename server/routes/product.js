const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const SearchTag = mongoose.model('SearchTag');
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
        if (fs.existsSync(oldPath)) {
            await fs.renameSync(oldPath, newPath);
        }
    } catch (err) {
        return res.status(422).json({ error: "Something went wrong. Please try again later" });
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
            colour.map(item => {
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

    server.put('/api/product/:id', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
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
            colour.map(item => {
                var files = item.images;
                files.map(file => {
                    moveImageAndFile(path.join(path.dirname(__dirname), "/../public/uploads/products/temp/" + file),
                        path.join(path.dirname(__dirname), "/../public/uploads/products/" + file));
                })
            });

            // return false;
            await Product.findByIdAndUpdate(productId, {
                category: categoryId,
                name: productname,
                slug: slugify(productname + '_' + Date.now()),
                brand: brand === 'null' ? null : brand,
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
            });

            // Note: update image at onChange antd upload and prevent updating if upload is untouch
            colour.map(async (item) => {
                var imagesItem = item.images;
                if (imagesItem[0].uid === undefined) {
                    await Product.findByIdAndUpdate(productId, {
                        colour
                    });
                }
            });
            return res.status(201).json({ msg: 'success' })
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/products', async (req, res) => {
        try {
            const products = await Product.find({}).sort([['createdAt', -1]])
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
                    select: 'name username role sellerRole picture, _id',
                })
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/product/:id', async (req, res) => {
        const productId = req.params.id;
        try {
            const products = await Product.findById(productId)
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

    server.get('/api/products/auth', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        try {
            const products = await Product.find({ createdBy: req.user._id }).sort([['createdAt', -1]])
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

    server.put('/api/product/status/:id/:status', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
        const productStatus = req.params.status;
        try {
            if (productStatus === 'active') {
                await Product.findOneAndUpdate({ 'products._id': productId },
                    {
                        '$set': { 'products.$.status': 'inactive' },
                    }
                );
            } else {
                await Product.findOneAndUpdate({ 'products._id': productId },
                    {
                        '$set': { 'products.$.status': 'active' },
                    }
                );
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.delete('/api/product/:id', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
        try {
            await Product.findOneAndUpdate({ 'products._id': productId },
                {
                    '$set': { 'products.$.status': 'deleted' },
                }
            );
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.get('/api/product/restore/:id', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
        try {
            await Product.findOneAndUpdate({ 'products._id': productId },
                {
                    '$set': { 'products.$.status': 'active' },
                }
            );
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.post('/api/product/available', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const { productId, action, quantity } = req.body;
        try {
            const incOrDecNumber = action === 'decrement' ? `-${quantity}` : quantity;

            await Product.findOneAndUpdate({ 'products._id': productId }, { '$inc': { 'products.$.quantity': incOrDecNumber } });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.get('/api/products/number/:number', async (req, res) => {
        const totalNumber = parseInt(req.params.number);
        try {
            // later change approved.status to active
            const products = await Product.find({ 'products.approved.status': 'pending', 'products.status': 'active' })
                .select('_id name slug brand colour size products rating createdBy')
                .populate('brand')
                .populate({
                    path: 'createdBy',
                    select: 'name username role sellerRole picture, _id',
                })
                .sort([['createdAt', -1]])
                .limit(totalNumber)
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // related product 
    server.post('/api/products/related', async (req, res) => {
        const { productId } = req.body;
        try {
            const product = await Product.findById(productId).lean();
            console.log(product);
            // later change approved.status to active
            const products = await Product.find(
                {
                    _id: { $ne: productId },
                    category: product.category,
                    'products.approved.status': 'pending',
                    'products.status': 'active'
                }
            )
                .select('_id name slug colour products rating createdBy')
                .populate({
                    path: 'createdBy',
                    select: 'name username role sellerRole picture, _id',
                })
                .limit(12)
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // after add to cart
    server.get('/api/product/cart/:id', async (req, res) => {
        const productId = req.params.id;
        try {
            const products = await Product.findOne({ 'products._id': productId }, { 'products.$': 1 })
                .select('_id name slug brand colour size products')
                .populate('brand')
                .lean();
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // search and filter

    const handleAutoComplete = async (req, res, searchtext) => {
        const regex = new RegExp(searchtext, 'i');
        const products = await SearchTag.find({ tag: regex }, { tag: 1 })
            .select('tag')
            .sort([['count', -1]])
            .limit(10);
        // const products = await Product.find({ $text: { $search: searchtext } })
        //     .select('name');
        res.status(200).json(products);
    }

    server.post('/api/search/filter', async (req, res) => {
        const { searchtext } = req.body;
        if (searchtext) {
            handleAutoComplete(req, res, searchtext);
        }
    });
}