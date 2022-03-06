const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const User = mongoose.model('Users');
const Brand = mongoose.model('Brand');

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.post('/api/seller/products', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { status, name, brand, pDate, sort } = req.body;
        const findByStatusType = type => {
            switch (type) {
                case 'pending':
                    return {
                        createdBy: req.user._id,
                        'products.approved.status': 'pending'
                    }
                case 'approved':
                    return {
                        createdBy: req.user._id,
                        'products.approved.status': 'approved'
                    }
                case 'live':
                    return {
                        createdBy: req.user._id,
                        $and: [
                            { 'products.approved.status': 'approved' },
                            { 'products.status': 'active' }
                        ]
                    }
                case 'active':
                    return {
                        createdBy: req.user._id,
                        'products.status': 'active'
                    }
                case 'inactive':
                    return {
                        createdBy: req.user._id,
                        'products.status': 'inactive'
                    }
                case 'unapproved':
                    return {
                        createdBy: req.user._id,
                        'products.approved.status': 'unapproved'
                    }
                default:
                    return {
                        createdBy: req.user._id,
                        'products.price': { $exists: true }
                    }
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
        const findByDate = (date) => {
            if (date != 'all') {
                return {
                    createdAt: {
                        $gte: date.startDate, $lt: date.endDate
                    }
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
        try {
            const products = await Product.find(findByStatusType(status))
                .find(findByName(name))
                .find(findByBrand(brand))
                .find(findByDate(pDate))
                .select('_id name slug brand colour size category products createdBy createdAt')
                .lean()
                .populate('brand')
                .sort(sortBy(sort));

            let productsAsSellerNeeded = [];
            products.map(product => {
                product.products.map(item => {
                    const obj = new Object();
                    // common
                    obj["_id"] = product._id;
                    obj["name"] = product.name;
                    obj["slug"] = product.slug;
                    obj["category"] = product.category;
                    obj["brand"] = product.brand;
                    obj["colour"] = product.colour;

                    // product base
                    obj["product_id"] = item._id;
                    obj["size"] = item.size;
                    obj["quantity"] = item.quantity;
                    obj["price"] = item.price;
                    obj["discount"] = item.discount;
                    obj["promoStartDate"] = item.promoStartDate;
                    obj["promoEndDate"] = item.promoEndDate;
                    obj["finalPrice"] = item.finalPrice;
                    obj["approved"] = item.approved.status;
                    obj["status"] = item.status;
                    obj["sold"] = item.sold;

                    productsAsSellerNeeded.push(obj);
                });
            });

            return res.status(200).json({ products: productsAsSellerNeeded });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}
