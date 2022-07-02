const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const User = mongoose.model('Users');
const Banner = mongoose.model('Banner');
const Seller = mongoose.model('Seller');

const moment = require('moment');

const { requiredAuth, checkRole } = require('../middlewares/auth');

module.exports = function (server) {
    server.post('/api/shop/own', async (req, res) => {
        const {
            category,
            brand,
            price,
            page,
            sort,
            rating,
            limit
        } = req.body;

        const findByCreatedBy = (id) => {
            return {
                createdBy: id,
                'products.approved.status': 'approved',
                'products.status': 'active'
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

        const getTotalProcuts = async (id, category, brand, price) => {

            return await Product.countDocuments(
                {
                    createdBy: id,
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

        }

        const getCategoryAndBrand = async (id) => {

            return await Product.find(
                {
                    createdBy: id,
                    'products.approved.status': 'approved',
                    'products.status': 'active'
                })
                .select('category brand')
                .populate('brand', '_id name')
                .populate('category', '_id name');
        }


        const getMaxPrice = async (id) => {

            return await Product.findOne(
                {
                    createdBy: id,
                    'products.approved.status': 'approved',
                    'products.status': 'active'
                },
                {
                    'products': 1
                })
                .select('products')
                .sort([['products.finalPrice', -1]])
        }

        try {
            const currentPage = page || 1;
            const productPerPage = limit || 24;

            const ownshopId = await User.findOne({ sellerRole: 'own' }).select('_id');

            const products = await Product.find(findByCreatedBy(ownshopId._id))
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

            const totalProducts = await getTotalProcuts(ownshopId._id, category, brand, price);

            const categoryAndBrand = await getCategoryAndBrand(ownshopId._id);

            const maxPrice = await getMaxPrice(ownshopId._id);

            return res.status(200).json({
                total: totalProducts,
                products,
                categoryAndBrand,
                maxPrice: maxPrice ? maxPrice.products[0].finalPrice : 0
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/shop/:id', async (req, res) => {
        try {
            const seller = await Seller.findOne({ userId: req.params.id })
                .lean()
                .populate('userId', 'name mobile email picture');
            return res.status(200).json(seller);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/shop', async (req, res) => {
        const {
            id,
            category,
            brand,
            price,
            page,
            sort,
            rating,
            limit
        } = req.body; s
        const findByCreatedBy = (id) => {
            return {
                createdBy: id
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

        const getTotalProcuts = async (id, category, brand, price) => {

            return await Product.countDocuments(
                {
                    createdBy: id,
                    'products.approved.status': 'approved',
                    'products.status': 'active',
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

        }

        const getCategoryAndBrand = async (id) => {

            return await Product.find(
                {
                    createdBy: id,
                })
                .select('category brand')
                .populate('brand', '_id name')
                .populate('category', '_id name');
        }


        const getMaxPrice = async (id) => {

            return await Product.findOne(
                {
                    createdBy: id,
                },
                {
                    'products': 1
                })
                .select('products')
                .sort([['products.finalPrice', -1]])
        }

        try {
            const currentPage = page || 1;
            const productPerPage = limit || 24;

            const products = await Product.find(findByCreatedBy(id))
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
                    select: 'name username',
                })
                .sort(sortBy(sort))
                .skip((currentPage - 1) * productPerPage)
                .limit(productPerPage);

            const totalProducts = await getTotalProcuts(id, category, brand, price);

            const categoryAndBrand = await getCategoryAndBrand(id);

            const maxPrice = await getMaxPrice(id);

            return res.status(200).json({
                total: totalProducts,
                products,
                categoryAndBrand,
                maxPrice: maxPrice ? maxPrice.products[0].finalPrice : 0
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });



    server.get('/api/shop/banner/:id', async (req, res) => {
        const sellerId = req.params.id;
        try {
            const banner = await Banner.find({
                sellerId,
                bannerPosition: 'position_seller',
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
            }).sort([['order', 1]]).limit(10).lean();
            if (banner) return res.status(200).json(banner);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}