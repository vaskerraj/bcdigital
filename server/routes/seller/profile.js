const mongoose = require('mongoose');
const Seller = mongoose.model('Seller');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sellerImagePath = "/../../public/uploads/sellers/docs";

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), sellerImagePath))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

var upload = multer({ storage: storage })

const { requiredAuth, checkRole } = require('../../middlewares/auth');

module.exports = function (server) {

    // company
    server.put('/api/seller/profile/business', requiredAuth, checkRole(['seller']), upload.single('docFile'), async (req, res) => {
        const { legalName, regType, regNumber, fullname, mobile, email, street } = req.body;

        try {
            let docFile;
            if (req.file) {
                docFile = req.file.filename;

                const preDocImage = await Seller.findOne({ userId: req.user._id }).select('documentFile');
                if (preDocImage) {
                    // check file
                    if (fs.existsSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preDocImage.documentFile))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preDocImage.documentFile))
                    }
                }
                await Seller.findOneAndUpdate({ userId: req.user._id }, { documentFile: docFile });
            }

            // company
            await Seller.findOneAndUpdate({ userId: req.user._id },
                {
                    documentVerify: 're_uploaded',
                    legalName,
                    registrationType: regType,
                    registrationNumber: regNumber,
                }
            );

            // company or business address
            await Seller.findOneAndUpdate(
                {
                    userId: req.user._id,
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
    server.put('/api/seller/profile/warehouse', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { addresses } = req.body;

        try {
            await Seller.findOneAndUpdate({
                userId: req.user._id,
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
    server.put('/api/seller/profile/return', requiredAuth, checkRole(['seller']), async (req, res) => {
        const { addresses } = req.body;

        try {
            await Seller.findOneAndUpdate({
                userId: req.user._id,
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
    server.put('/api/seller/profile/bank', requiredAuth, checkRole(['seller']), upload.single('copyofcheque'), async (req, res) => {
        const { title, number, bankName, bankBranch } = req.body;
        try {
            let copyOfCheque;
            if (req.file) {
                copyOfCheque = req.file.filename;

                const preBankImage = await Seller.findOne({ userId: req.user._id }).select('account.chequeFile');

                if (preBankImage) {
                    // check file
                    if (fs.existsSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preBankImage.account.documentFile))) {
                        fs.unlinkSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preBankImage.account.chequeFile))
                    }
                }
                await Seller.findOneAndUpdate({ userId: req.user._id }, { 'account.chequeFile': copyOfCheque });
            }
            await Seller.findOneAndUpdate({ userId: req.user._id },
                {
                    'account.bankVerfiy': 're_uploaded',
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
};