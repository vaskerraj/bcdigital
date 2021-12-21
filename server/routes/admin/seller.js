const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Seller = mongoose.model('Seller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sellerImagePath = "/../../public/uploads/sellers";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), sellerImagePath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage });

const admin = require('../../../firebase/firebaseAdmin');

const { requiredAuth, checkRole, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.get('/api/admingetseller', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const user = await Users.findOne({ role: 'seller', sellerRole: 'own' })
                .select('_id picture email')
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
            }
            const user = new Users({
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
            await user.save();

            // Note: auto login after successfully sign up(registration)

            // using firebase custom auth using
            // create token and send to client

            // use objectid of database uid
            const uid = user._id.toString();

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
                if (fs.existsSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + deletedSeller.picture))) {
                    fs.unlinkSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + deletedSeller.picture))
                }
                return res.status(200).json({ msg: 'success' });
            }
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    // own shop step
    // company
    server.post('/api/ownshop/step/company', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('docFile'), async (req, res) => {
        const { id, legalName, regType, regNumber, fullname, mobile, email, street } = req.body;

        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;
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
                    bankVerify: 'verified',
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.put('/api/ownseller', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), upload.single('sellerPicture'), async (req, res) => {
        const { name, email, sellerId } = req.body;
        try {
            let sellerPicture;
            if (req.file) {
                sellerPicture = req.file.filename;
                const preSellerImage = await Users.findById(sellerId).select('picture');
                if (preSellerImage) {
                    // check file
                    if (fs.existsSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preSellerImage.picture))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preSellerImage.picture))
                    }
                }
                await Users.findByIdAndUpdate(sellerId, {
                    picture: sellerPicture
                });
            }
            await Users.findByIdAndUpdate(sellerId, { name, email });
            return res.status(200).json({ msg: "success" });
        }
        catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Seller already exists'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });

    server.put('/api/seller/status/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const sellerId = req.params.id;
        try {
            const preSellerStatus = await Users.findById(sellerId).select('status');
            if (preSellerStatus.status === 'approved') {
                await Users.findByIdAndUpdate(sellerId, { status: 'unapproved' });
            } else {
                await Users.findByIdAndUpdate(sellerId, { status: 'approved' });
            }
            return res.status(200).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Something went wrong. Please try again later." })
        }
    });

    server.put('/api/ownseller/username', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
        const { mobile, sellerId } = req.body;
        try {
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

    server.put('/api/ownseller/password', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin']), async (req, res) => {
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

    server.get('/api/admin/seller/verify', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const seller = await Seller.find(
                {
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