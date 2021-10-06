const mongoose = require('mongoose');
const User = mongoose.model('Users');
const Seller = mongoose.model('Seller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sellerDocsImagePath = "/../../public/uploads/sellers/docs";
const sellerlogoPath = "/../../public/uploads/sellers";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), sellerDocsImagePath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage })

var sellerLogoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), sellerlogoPath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})


var uploadImageBaseOnColor = multer({ storage: sellerLogoStorage });

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    server.get('/api/isseller', requiredAuth, checkRole(['seller']), async (req, res) => {
        const seller = await Seller.findOne({ userId: req.user._id })
            .lean()
            .populate('userId', 'name mobile email picture')
            .populate('addresses.region', '_id name')
            .populate('addresses.city', '_id name')
            .populate('addresses.area', '_id name')
        return res.status(200).json(seller);
    });

    // start seller Apis
    // company
    server.post('/api/seller/start/company', requiredAuth, checkRole(['seller']), upload.single('docFile'), async (req, res) => {
        const { legalName, regType, regNumber } = req.body;
        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;
            }
            const seller = new Seller({
                userId: req.user._id,
                legalName,
                registrationType: regType,
                registrationNumber: regNumber,
                documentFile: docFile,
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
    server.put('/api/seller/start/addresses', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { addresses } = req.body;
        try {
            await Seller.findOneAndUpdate({ userId: req.user._id },
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

    // bank
    server.post('/api/seller/start/bank', requiredAuth, checkRole(['seller']), upload.single('copyofcheque'), async (req, res) => {
        const { title, number, bankName, bankBranch } = req.body;
        console.log(req.body)
        try {
            let copyOfCheque;
            if (req.file) {
                copyOfCheque = req.file.filename;
            }
            await Seller.findOneAndUpdate({ userId: req.user._id },
                {
                    step: 'bank',
                    stepComplete: true,
                    'account.title': title,
                    'account.number': number,
                    'account.bankName': bankName,
                    'account.branch': bankBranch,
                    'account.chequeFile': copyOfCheque
                }
            );

            return res.status(201).json({ msg: 'success' });

        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.post('/api/seller/logo', uploadImageBaseOnColor.single('file'), async (req, res) => {
        const { id } = req.query;
        try {
            let filename;
            if (req.file) {
                filename = req.file.filename;

                const preSellerLogo = await User.findById(id).select('picture');
                if (preSellerLogo) {
                    // check file
                    if (fs.existsSync(path.join(path.dirname(__dirname), sellerlogoPath + '/' + preSellerLogo.picture))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), sellerlogoPath + '/' + preSellerLogo.picture))
                    }
                }
                await User.findByIdAndUpdate(id, { picture: filename });
            }
            return res.status(201).json({ msg: 'success' });
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};