const mongoose = require('mongoose');
const DefaultAddress = mongoose.model('DefaultAddress');
const slugify = require('slugify');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

const addressListWithSubs = (addresses, parentId = null) => {
    const addressesList = [];
    let address;
    if (parentId === null) {
        address = addresses.filter(add => add.parentId == undefined)
    } else {
        address = addresses.filter(add => add.parentId == parentId)
    }

    for (let add of address) {
        addressesList.push({
            _id: add._id,
            name: add.name,
            slug: add.slug,
            parentId: add.parentId,
            children: addressListWithSubs(addresses, add._id)
        });
    }
    return addressesList;
}
module.exports = function (server) {
    server.post('/api/defaultaddresses', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        // try {
        const addressObj = {
            name: req.body.name,
            slug: slugify(req.body.name)
        }
        // if category is parent itself
        if (req.body.parentId !== null) {
            addressObj.parentId = req.body.parentId;
        }

        const address = new DefaultAddress(addressObj);
        await address.save();
        return res.status(201).json(address);
        // } catch (error) {
        //     return res.status(422).json({ error: "Something went wrong.Please try again." });
        // }

    });

    server.get('/api/admin/defaultadd', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const addresses = await DefaultAddress.find({}).lean();
            // get list of categories with subs
            const allAddresses = addressListWithSubs(addresses)
            return res.status(200).json(allAddresses);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/defaultAddress/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const defaultAddId = req.params.id;
        try {
            var deladdress = await DefaultAddress.findByIdAndRemove(defaultAddId);
            // get one to get deleted _id(parent id for 3rd step);
            if (deladdress) {
                const address = await DefaultAddress.find({ parentId: defaultAddId });
                address && address.map(async (add) => {
                    const deleteSubAdd = await DefaultAddress.findOneAndRemove({ parentId: add.parentId });
                    // delete 3 step categories
                    if (deleteSubAdd.parentId) {
                        await DefaultAddress.deleteMany({ parentId: deleteSubAdd._id });
                    }
                })

            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/defaultaddresses', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { name, defaultAddId } = req.body;
        try {
            await DefaultAddress.findByIdAndUpdate(defaultAddId, { name, slug: slugify(name) });
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong.Please try again." });
        }
    });
};