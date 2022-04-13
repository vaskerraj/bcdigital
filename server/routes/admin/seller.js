const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Seller = mongoose.model('Seller');
const multer = require('multer');

var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage });

const admin = require('../../../firebase/firebaseAdmin');
const { singleImageUpload, updateSingleImage, deleteImage } = require('../../utils/imageUpload');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.get('/api/admingetseller', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const user = await Users.findOne({ role: 'seller', sellerRole: 'own' })
                .select('_id picture mobile email')
                .lean();
            let moreSellerInfo = null;
            if (user) {
                moreSellerInfo = await Seller.findOne({ userId: user._id })
                    .populate('addresses.region', '_id name')
                    .populate('addresses.city', '_id name')
                    .populate('addresses.area', '_id name');
            }
            return res.status(200).json({ seller: user, details: moreSellerInfo });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/ownseller', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('shopLogo'), async (req, res) => {
        const { name, mobile, password, email } = req.body;
        try {
            let sellerPicture;
            if (req.file) {
                sellerPicture = req.file.filename;
                await singleImageUpload(req, 'seller');
            }
            const user = await Users.findOne({ username: mobile, method: 'custom', role: 'seller' });
            if (user) {
                return res.status(422).json({ error: 'Seller alerady exists with this mobile number' });
            }
            const newuser = new Users({
                name,
                email,
                username: mobile,
                mobile,
                password,
                picture: sellerPicture,
                role: 'seller',
                sellerRole: 'own',
                method: 'custom',
                status: 'approved'
            });
            await newuser.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = newuser._id.toString();

            await admin.auth().createCustomToken(uid)
                .then(function (token) {
                    return res.status(201).json({ msg: 'success' });
                })
                .catch(function (error) {
                    return res.status(500).json({ error: "Error during token creation" });
                });

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Seller already exists with this mobile number'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.delete('/api/seller/:id', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const sellerId = req.params.id;
        try {
            const deletedSeller = await Users.findByIdAndRemove(sellerId);
            if (deletedSeller) {
                await deleteImage(deletedSeller.picture, 'seller');
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    ////////////////// own shop step ////////////////////////
    // company
    server.post('/api/ownshop/step/company', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('docFile'), async (req, res) => {
        const { id, legalName, regType, regNumber, fullname, mobile, email, street } = req.body;

        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;
                await singleImageUpload(req, 'seller');
            }

            const seller = new Seller({
                userId: id,
                legalName,
                registrationType: regType,
                registrationNumber: regNumber,
                documentFile: docFile,
                documentVerify: 'verified',
                step: 'company',
            });
            await seller.save();
            if (seller) {
                return res.status(201).json({ msg: 'success' });
            }

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // addresses
    server.put('/api/ownshop/step/addresses', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { id, addresses } = req.body;
        try {
            await Seller.findOneAndUpdate({ userId: id },
                {
                    addresses,
                    step: 'addresses',
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
    server.put('/api/ownshop/step/bank', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('copyofcheque'), async (req, res) => {
        const { id, title, number, bankName, bankBranch } = req.body;
        try {
            let copyOfCheque;
            if (req.file) {
                copyOfCheque = req.file.filename;
                await singleImageUpload(req, 'sellerDoc');
            }
            await Seller.findOneAndUpdate({ userId: id },
                {
                    step: 'bank',
                    stepComplete: true,
                    'account.title': title,
                    'account.number': number,
                    'account.bankName': bankName,
                    'account.branch': bankBranch,
                    'account.chequeFile': copyOfCheque,
                    'account.bankVerify': 'verified',
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    //////////////////////// own shop update /////////////////////
    // company
    server.put('/api/ownshop/business', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('docFile'), async (req, res) => {
        const { id, legalName, regType, regNumber, fullname, mobile, email, street } = req.body;

        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;

                const preDocImage = await Seller.findOne({ userId: id }).select('documentFile');
                if (preDocImage) {
                    await updateSingleImage(req, preDocImage.account.documentFile, 'sellerDoc');
                }
                await Seller.findOneAndUpdate({ userId: id }, { documentFile: docFile });
            }

            // company
            await Seller.findOneAndUpdate({ userId: id },
                {
                    legalName,
                    registrationType: regType,
                    registrationNumber: regNumber,
                }
            );

            // company or business address
            await Seller.findOneAndUpdate(
                {
                    userId: id,
                    'addresses.label': 'business'
                },
                {
                    '$set': {
                        'addresses.$.fullname': fullname,
                        'addresses.$.mobile': mobile,
                        'addresses.$.email': email,
                        'addresses.$.street': street,
                    }
                }
            );


            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // warehouse
    server.put('/api/ownshop/warehouse', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { id, addresses } = req.body;

        try {
            await Seller.findOneAndUpdate({
                userId: id,
                'addresses.label': 'warehouse'
            },
                {
                    '$set': {
                        'addresses.$.fullname': addresses.fullname,
                        'addresses.$.mobile': addresses.mobile,
                        'addresses.$.email': addresses.email,
                        'addresses.$.region': addresses.region,
                        'addresses.$.city': addresses.city,
                        'addresses.$.area': addresses.area,
                        'addresses.$.street': addresses.street,
                    }
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // return
    server.put('/api/ownshop/return', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { id, addresses } = req.body;

        try {
            await Seller.findOneAndUpdate({
                userId: id,
                'addresses.label': 'return'
            },
                {
                    '$set': {
                        'addresses.$.fullname': addresses.fullname,
                        'addresses.$.mobile': addresses.mobile,
                        'addresses.$.email': addresses.email,
                        'addresses.$.region': addresses.region,
                        'addresses.$.city': addresses.city,
                        'addresses.$.area': addresses.area,
                        'addresses.$.street': addresses.street,
                    }
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    // bank
    server.put('/api/ownshop/bank', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('copyofcheque'), async (req, res) => {
        const { id, title, number, bankName, bankBranch } = req.body;
        try {
            let copyOfCheque;
            if (req.file) {
                copyOfCheque = req.file.filename;

                const preBankImage = await Seller.findOne({ userId: id }).select('account.chequeFile');

                if (preBankImage) {
                    await updateSingleImage(req, preBankImage.account.chequeFile, 'sellerDoc');
                }
                await Seller.findOneAndUpdate({ userId: id }, { 'account.chequeFile': copyOfCheque });
            }
            await Seller.findOneAndUpdate({ userId: id },
                {
                    'account.title': title,
                    'account.number': number,
                    'account.bankName': bankName,
                    'account.branch': bankBranch,
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/seller/status/:id/:status', requiredAuth, checkRole(['admin']), async (req, res) => {
        const sellerId = req.params.id;
        const status = req.params.status;
        try {
            const seller = await Seller.findByIdAndUpdate(sellerId, {
                'status.title': status,
                'status.actionBy': req.user._id
            });

            await Users.findByIdAndUpdate(seller.userId, {
                status
            })
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/ownshop/username', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { mobile, sellerId } = req.body;
        try {
            const user = await Users.findOne({ username: mobile, method: 'custom', role: 'seller' });
            if (user) {
                return res.status(422).json({ error: 'Seller alerady exists with this mobile number' });
            }
            await Users.findByIdAndUpdate(sellerId, { username: mobile, mobile });
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Shop with username already exists'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });

    server.put('/api/ownshop/password', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { password, sellerId } = req.body;
        try {
            const user = await Users.findById(sellerId);
            user.password = password;
            await user.save();

            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    //////////////////// seller list /////////////////////

    server.get("/api/admin/seller/list", requiredAuth, checkRole(['admin']), async (req, res) => {

        try {
            const sellers = await Seller.find(
                {
                    'status.title': { $ne: 'deleted' },
                })
                .populate('userId')
                .populate('addresses.region', '_id name')
                .populate('addresses.city', '_id name')
                .populate('addresses.area', '_id name');
            return res.status(200).json(sellers);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.put("/api/admin/seller/commission", requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { sellerId, amount } = req.body;
        try {
            await Seller.findByIdAndUpdate(sellerId,
                {
                    commission: amount
                });
            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.get('/api/admin/seller/verify', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const seller = await Seller.find(
                {
                    stepComplete: 'true',
                    $or: [
                        { documentVerify: 'pending' },
                        { documentVerify: 're_uploaded' },
                        { 'account.bankVerify': 'pending' },
                        { 'account.bankVerify': 're_uploaded' },
                    ]
                })
                .lean()
                .populate('userId', 'name mobile email status createdAt')
                .populate('addresses.region', '_id name')
                .populate('addresses.city', '_id name')
                .populate('addresses.area', '_id name');
            return res.status(200).json(seller);
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
    server.put('/api/admin/seller/verify', requiredAuth, checkRole(['admin']), async (req, res) => {
        const { sellerId, type, status } = req.body;
        try {
            if (type === "doc") {
                await Seller.findByIdAndUpdate(sellerId,
                    {
                        documentVerify: status,
                    }
                );
            } else if (type === "bank") {
                await Seller.findByIdAndUpdate(sellerId,
                    {
                        $set: { 'account.bankVerify': status },
                    }
                );
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });
};