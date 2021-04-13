const mongoose = require('mongoose');
const Users = mongoose.model('Users');
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
    server.post('/api/ownseller', requiredAuth, checkRole(['admin']), upload.single('sellerPicture'), async (req, res) => {
        const { name, mobile, password } = req.body;
        try {
            let sellerPicture;
            if (req.file) {
                sellerPicture = req.file.filename;
            }
            const user = new Users({
                name,
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
                    'Seller already exists'
                    :
                    "Something went wrong.Please try again."
            });
        }

    });

    server.get('/api/admingetseller', requiredAuth, checkRole(['admin']), async (req, res) => {
        try {
            const sellers = await Users.find({ role: 'seller' }).lean();
            return res.status(200).json(sellers);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });

    server.delete('/api/seller/:id', requiredAuth, checkRole(['admin']), async (req, res) => {
        const sellerId = req.params.id;
        console.log(sellerId);
        try {
            const deletedSeller = await Users.findByIdAndRemove(sellerId);
            console.log(deletedSeller);
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

    server.put('/api/seller', requiredAuth, checkRole(['admin']), upload.single('sellerPicture'), async (req, res) => {
        const { name, mobile, sellerId } = req.body;
        try {
            let sellerPicture;
            if (req.file) {
                sellerPicture = req.file.filename;
            }
            const preSellerImage = await Users.findById(sellerId).select('picture');
            if (preSellerImage) {
                // check file
                if (fs.existsSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preSellerImage.picture))) {
                    fs.unlinkSync(path.join(path.dirname(__dirname), sellerImagePath + '/' + preSellerImage.picture))
                }
            }
            await Users.findByIdAndUpdate(sellerId, { name, username: mobile, mobile, picture: sellerPicture });
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ?
                    'Seller already exists'
                    :
                    "Something went wrong. Please try again later."
            });
        }
    });
};