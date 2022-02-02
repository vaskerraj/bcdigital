const mongoose = require('mongoose');
const SearchTag = mongoose.model('SearchTag');
const Product = mongoose.model('Product');
const slugify = require('slugify');

module.exports = function (server) {

    server.post('/api/tags', async (req, res) => {
        const { tag } = req.body;
        try {
            if (tag) {
                const checkExsitingTag = await SearchTag.findOne({ slug: slugify(tag.toLowerCase()) });
                if (!checkExsitingTag) {
                    const checkProductByTag = await Product.find({ $text: { $search: tag } })
                        .select('name');
                    if (checkProductByTag.length >= 1) {
                        const tags = new SearchTag({
                            tag,
                            slug: slugify(tag.toLowerCase())
                        });
                        await tags.save();

                        return res.status(200).json({ msg: "success" });
                    } else {
                        return res.status(200).json({ msg: "error" });
                    }
                } else {
                    await SearchTag.findOneAndUpdate({ tag }, { '$inc': { 'count': 1 } });
                    return res.status(200).json({ msg: "success" });
                }
            } else {
                return res.status(422).json({ error: "Some error occur. Please try again later." });
            }
        }
        catch (error) {
            return res.status(200).json({ error: "Some error occur. Please try again later." });
        }
    });
}