const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const slugify = require('slugify');

const { requiredAuth, checkRole } = require('../../middlewares/auth');

const categoriesListWithSubs = (categories, parentId = null) => {
    const categoriesList = [];
    let category;
    if (parentId === null) {
        category = categories.filter(cat => cat.parentId == undefined)
    } else {
        category = categories.filter(cat => cat.parentId == parentId)
    }

    for (let cat of category) {
        categoriesList.push({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            children: categoriesListWithSubs(categories, cat._id)
        });
    }
    return categoriesList;
}
module.exports = function (server) {
    server.post('/api/categories', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const categoryObj = {
                name: req.body.name,
                slug: slugify(req.body.name)
            }
            // if category is parent itself
            if (req.body.parentId !== null) {
                categoryObj.parentId = req.body.parentId;
            }

            const category = new Category(categoryObj);
            await category.save();
            return res.status(201).json(category);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }

    });

    server.get('/api/admingetcat', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const categories = await Category.find({}).lean();
            // get list of categories with subs
            const allCategories = categoriesListWithSubs(categories)
            return res.status(200).json(allCategories);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.get('/api/categories', async (req, res) => {
        try {
            const categories = await Category.find({}).lean();
            // get list of categories with subs
            const allCategories = categoriesListWithSubs(categories)
            return res.status(200).json(allCategories);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};