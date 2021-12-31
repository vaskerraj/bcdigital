const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const User = mongoose.model('Users');
const Brand = mongoose.model('Brand');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/products/list', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { status, name, productId, sort, brand, seller, page, limit } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'pending':
                    return {
                        'products.approved.status': 'pending'
                    }
                case 'liveactive':
                    return {
                        $and: [
                            { 'products.approved.status': 'approved' },
                            { 'products.status': 'active' }
                        ]
                    }
                case 'liveunactive':
                    return {
                        $and: [
                            { 'products.approved.status': 'approved' },
                            { 'products.status': { $ne: 'active' } }
                        ]
                    }
                case 'unapproved':
                    return {
                        'products.approved.status': 'unapproved'
                    }
                default:
                    return { 'products.approved.status': 'pending' }
            }
        }

        const findByName = (name) => {
            if (name !== 'all') {
                return {
                    $text: { $search: name }
                }
            } else {
                return {};
            }
        }
        const findByProductId = (id) => {
            if (id !== 'all') {
                return {
                    '_id': id
                }
            } else {
                return {};
            }
        }
        const findByBrand = (brand) => {
            if (brand !== 'all') {
                return {
                    brand: brand
                }
            } else {
                return {};
            }
        }
        const findBySeller = (seller) => {
            if (seller !== 'all') {
                return {
                    createdBy: seller
                }
            } else {
                return {};
            }
        }
        const sortBy = sort => {
            switch (sort) {
                case 'oldest':
                    return [['createdAt', 1]]
                case 'newest':
                    return [['createdAt', - 1]]
                default:
                    return [['createdAt', - 1]]
            }
        }

        const currentPage = page || 1;
        const productPerPage = limit || 30;
        try {
            const products = await Product.find(findByStatusType(status))
                .find(findByName(name))
                .find(findByProductId(productId))
                .find(findByBrand(brand))
                .find(findBySeller(seller))
                .select('_id name slug brand colour size category products createdBy createdAt')
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
                    select: '_id name'
                })
                .sort(sortBy(sort))
                .skip((currentPage - 1) * productPerPage)
                .limit(productPerPage);

            const allProduct = await Product.find(findByStatusType(status), { _id: 0 })
                .find(findByName(name))
                .find(findByProductId(productId))
                .find(findByBrand(brand))
                .find(findBySeller(seller))
                .select('_id');

            if (products && allProduct) return res.status(200).json({
                total: allProduct.length,
                products
            });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    //  for seller autocomplete
    server.post('/api/search/sellers', async (req, res) => {
        const { searchtext } = req.body;
        const regex = new RegExp(searchtext, 'i');
        const sellers = await User.find({ name: regex, role: 'seller' }, { name: 1 })
            .select('name _id')
            .limit(10);
        return res.status(200).json(sellers);
    });

    //  for brand autocomplete
    server.post('/api/search/brands', async (req, res) => {
        const { searchtext } = req.body;
        const regex = new RegExp(searchtext, 'i');
        const brands = await Brand.find({ name: regex }, { name: 1 })
            .select('name _id')
            .limit(10);
        return res.status(200).json(brands);
    });

    server.put('/api/product/all/status/:id/:status', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
        const productStatus = req.params.status;
        try {
            await Product.findByIdAndUpdate(productId,
                {
                    '$set':
                    {
                        'products.$[].approved.status': productStatus,
                        'products.$[].approved.approvedBy': req.user._id,
                        'products.$[].approved.approvedAt': new Date()
                    },
                });

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.put('/api/product/each/status/:id/:status', requiredAuth, checkRole(['admin', 'seller']), async (req, res) => {
        const productId = req.params.id;
        const productStatus = req.params.status;
        try {
            await Product.findOneAndUpdate({ 'products._id': productId },
                {
                    '$set':
                    {
                        'products.$.approved.status': productStatus,
                        'products.$.approved.approvedBy': req.user._id,
                        'products.$.approved.approvedAt': new Date()
                    },
                }
            );

            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.put("/api/admin/product/commission", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { productId, amount } = req.body;
        try {
            await Product.findByIdAndUpdate(productId,
                {
                    '$set': { point: amount }
                });
            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
};