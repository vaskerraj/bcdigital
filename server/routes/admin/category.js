const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const slugify = require('slugify');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

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
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Category already exists'
                    :
                    "Something went wrong.Please try again."
            });
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

    server.delete('/api/category/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const categoryId = req.params.id;
        try {
            var delcategory = await Category.findByIdAndRemove(categoryId);
            // get one to get deleted _id(parent id for 3rd step);
            if (delcategory) {
                const category = await Category.find({ parentId: categoryId });
                category && category.map(async (cat) => {
                    const deleteSubCate = await Category.findOneAndRemove({ parentId: cat.parentId });
                    // delete 3 step categories
                    if (deleteSubCate.parentId) {
                        await Category.deleteMany({ parentId: deleteSubCate._id });
                    }
                })

            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/category', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { name, categoryId } = req.body;
        try {
            await Category.findByIdAndUpdate(categoryId, { name, slug: slugify(name) });
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Category already exists'
                    :
                    "Something went wrong.Please try again."
            });
        }
    });
};