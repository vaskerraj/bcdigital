const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const SearchTag = mongoose.model('SearchTag');
const Category = mongoose.model('Category');
const Package = mongoose.model('Package');
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
                .lean()
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
                });
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/product/:id', async (req, res) => {
        const productId = req.params.id;
        try {
            const products = await Product.findById(productId)
                .lean()
                .populate('brand')
                .populate({
                    path: 'category',
                    select: 'name slug _id',
                    populate: ({
                        path: 'parentId',
                        select: 'name slug _id',
                        populate: ({
                            path: 'parentId',
                            select: 'name slug _id',
                        })
                    })
                })
                .populate('review.postedBy', 'name');
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/products/auth', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        try {
            const products = await Product.find({ createdBy: req.user._id }).sort([['createdAt', -1]])
                .lean()
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
                });
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
        var filenames = req.files.map(file => file.filename)
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

    server.post('/api/products/latest', async (req, res) => {
        const { page, limit } = req.body;
        const currentPage = page || 1;
        const productPerPage = limit || 20;
        try {
            // later change approved.status to active
            const products = await Product.find({ 'products.approved.status': 'approved', 'products.status': 'active' })
                .select('_id name slug brand colour size products rating createdBy')
                .lean()
                .populate('brand')
                .populate({
                    path: 'createdBy',
                    select: 'name username role sellerRole picture, _id',
                })
                .sort([['createdAt', -1]])
                .skip((currentPage - 1) * productPerPage)
                .limit(productPerPage);
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
            // later change approved.status to active
            const products = await Product.find(
                {
                    _id: { $ne: productId },
                    category: product.category,
                    'products.approved.status': 'approved',
                    'products.status': 'active'
                }
            )
                .select('_id name slug colour products rating createdBy')
                .lean()
                .populate({
                    path: 'createdBy',
                    select: 'name username role sellerRole picture, _id',
                })
                .limit(12);
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
                .lean()
                .populate('brand');
            if (products) return res.status(200).json(products);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    //  for autocomplete
    server.post('/api/search/filter', async (req, res) => {
        const { searchtext } = req.body;
        const regex = new RegExp(searchtext, 'i');
        const products = await SearchTag.find({ tag: regex }, { tag: 1 })
            .select('tag')
            .sort([['count', -1]])
            .limit(10);
        return res.status(200).json(products);
    });


    server.post('/api/product/search', async (req, res) => {
        const {
            query,
            type,
            category,
            brand,
            price,
            page,
            sort,
            rating,
            limit
        } = req.body;

        const findBySearchType = (query, searchType) => {
            if (searchType === 'search') {
                return {
                    $text: { $search: query },
                    $and: [
                        { 'products.approved.status': 'approved' },
                        { 'products.status': 'active' }
                    ]
                }
            } else if (searchType === 'cat') {
                return {
                    category: { $in: query },
                    $and: [
                        { 'products.approved.status': 'approved' },
                        { 'products.status': 'active' }
                    ]
                }
            } else {
                return {}
            }
        }
        const findCategory = (category) => {
            if (category !== 'all') {
                return { category: category };
            } else {
                return {}
            }
        }
        const findBrand = (brand) => {
            if (brand !== 'all') {
                return {
                    brand: { $in: brand }
                }
            } else {
                return {};
            }
        }

        const findPrice = price => {
            if (price !== '') {
                return {
                    'products.finalPrice': {
                        $gte: price[0],
                        $lte: price[1]
                    }
                }
            } else {
                return {}
            }
        }

        const sortBy = sort => {
            switch (sort) {
                case 'best':
                    return {}
                case 'sold':
                    return [['products.sold', -1]]
                case 'price':
                    return [['products.finalPrice', 1]]
                case 'dprice':
                    return [['products.finalPrice', -1]]
                case 'createdAt':
                    return [['createdAt', 1]]
                case 'newest':
                    return [['createdAt', - 1]]
                default:
                    return {}
            }
        }

        const getTotalProcuts = async (query, type, category, brand, price) => {
            if (type === 'search') {
                return await Product.countDocuments(
                    {
                        $text: { $search: query },
                        category: category !== 'all' ? category : { $exists: true },
                        brand: brand !== 'all' ? { $in: brand } : { $exists: true },
                        'products.finalPrice': price !== '' ?
                            {
                                $gte: price[0],
                                $lte: price[1]
                            }
                            :
                            { $exists: true }
                    }
                );
            } else if (type === 'cat') {
                return await Product.countDocuments(
                    {
                        category: { $in: query },
                        brand: brand !== 'all' ? { $in: brand } : { $exists: true },
                        'products.finalPrice': price !== '' ?
                            {
                                $gte: price[0],
                                $lte: price[1]
                            }
                            :
                            { $exists: true }
                    }
                );
            }
        }

        const getCategoryAndBrand = async (query, type) => {
            if (type === 'search') {
                return await Product.find(
                    {
                        $text: { $search: query }
                    })
                    .select('category brand')
                    .populate('brand', '_id name')
                    .populate('category', '_id name');
            } else if (type === 'cat') {
                return await Product.find(
                    {
                        category: { $in: query }
                    })
                    .select('category brand')
                    .populate('brand', '_id name')
                    .populate('category', '_id name');
            }
        }

        const getMaxPrice = async (query, type) => {
            if (type === 'search') {
                return await Product.findOne(
                    {
                        $text: { $search: query }
                    },
                    {
                        'products': 1
                    })
                    .select('products')
                    .sort([['products.finalPrice', -1]])
            } else if (type === 'cat') {
                return await Product.findOne(
                    {
                        category: { $in: query }
                    },
                    {
                        'products': 1
                    })
                    .select('products')
                    .sort([['products.finalPrice', -1]])

            }
        }

        try {
            const currentPage = page || 1;
            const productPerPage = limit || 24;
            let categoryId = ''
            if (type === 'cat') {
                const category = await Category.findOne({ slug: query }).select('_id').lean();
                // get all sub categories if exist under this parent category
                const subCategoriesBaseOnParent = await Category.find({ parentId: category._id }).select('_id').lean();
                const getCategoriesIds = subCategoriesBaseOnParent.map(item => item._id);
                if (getCategoriesIds.length !== 0) {
                    categoryId = getCategoriesIds;
                } else {
                    const caterogryIdArray = new Array(category._id);
                    categoryId = [...getCategoriesIds, ...caterogryIdArray];
                }
            }
            const products = await Product.find(findBySearchType(type === 'cat' ? categoryId : query, type))
                .find(findCategory(category))
                .find(findBrand(brand))
                .find(findPrice(price))
                .select('_id name slug brand, category colour products rating createdBy')
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
                .populate('brand', 'name slug')
                .populate({
                    path: 'createdBy',
                    select: '_id name username role sellerRole',
                })
                .sort(sortBy(sort))
                .skip((currentPage - 1) * productPerPage)
                .limit(productPerPage);

            const totalProducts = await getTotalProcuts(type === 'cat' ? categoryId : query, type, category, brand, price);

            const categoryAndBrand = await getCategoryAndBrand(type === 'cat' ? categoryId : query, type);

            const maxPrice = await getMaxPrice(type === 'cat' ? categoryId : query, type);


            return res.status(200).json({
                total: totalProducts,
                products,
                categoryAndBrand,
                maxPrice: maxPrice.products[0].finalPrice
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/products/trending', async (req, res) => {
        const getProductDetail = async (id) => {
            const productDetail = await Product.findOne(
                {
                    'products._id': id,
                    'products.approved.status': 'approved', 'products.status': 'active'
                },
                {
                    'products.$': 1
                })
                .select('_id name slug brand colour size products rating createdBy')
                .lean()
                .populate('brand')
                .populate({
                    path: 'createdBy',
                    select: 'name username role sellerRole picture, _id',
                });
            return productDetail;
        }

        const products = await Package.aggregate([
            {
                "$unwind": {
                    "path": "$products"
                }
            },
            {
                "$group": {
                    "_id": "$products.productId",
                    "totalSold": {
                        "$sum": "$products.productQty"
                    }
                }
            },
            {
                "$sort": {
                    "totalSold": -1
                }
            },
            {
                "$limit": 20
            }
        ])
        let trendingProducts = [];
        await Promise.all(
            products.map(async (item) => {
                const productObj = new Object();
                productObj['_id'] = item._id;
                productObj['products'] = await getProductDetail(item._id);
                trendingProducts.push(productObj);
            })
        )
        return res.status(200).json(trendingProducts);
        return res.status(200).json(products)
    });
}
