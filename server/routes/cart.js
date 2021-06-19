const mongoose = require('mongoose');
const Product = mongoose.model('Product');

module.exports = function (server) {
    server.post('/api/cartitems', async (req, res) => {
        const { productIds } = req.body;
        console.log(productIds);
        try {
            let productsList = [];
            await Promise.all(
                productIds.map(async (product) => {
                    const products = await Product.findOne(
                        {
                            'products._id': product
                        }, { 'products.$': 1 })
                        .select('_id name slug brand colour size products')
                        .populate('brand');
                    productsList.push(products);
                })
            );
            return res.status(200).json(productsList);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
}