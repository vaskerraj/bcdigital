const mongoose = require('mongoose');
const CommonSetting = mongoose.model('CommonSetting');

const { requiredAuth, checkAdminRole } = require('../../middlewares/auth');

module.exports = function (server) {
    server.put('/api/common/setting', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        const { contactNumber, facebookLink, twitterLink, andriodLink, iosLink } = req.body;
        try {
            await CommonSetting.findOneAndUpdate(
                {
                    record: true
                },
                {
                    $set: {
                        contactNumber,
                        facebookLink,
                        twitterLink,
                        andriodLink,
                        iosLink,
                        record: true
                    }
                },
                { upsert: true }
            );
            return res.status(200).json({ msg: 'success' })
        } catch (error) {
            console.log(error)
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
    server.get('/api/common/setting', requiredAuth, checkAdminRole(['superadmin', 'subsuperadmin', 'contentManager']), async (req, res) => {
        try {
            const commonSetting = await CommonSetting.findOne({}).lean();
            return res.status(200).json(commonSetting);
        } catch (error) {
            return res.status(422).json({ error: "Some error occur. Please try again later." });
        }
    });
};