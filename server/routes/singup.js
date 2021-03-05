const mongoose = require('mongoose');
const Users = mongoose.model('Users');
module.exports = function (server) {

    server.post('/api/signup', async (req, res) => {
        const { mobile, password } = req.body;
        try {
            const user = new Users({ mobile, password });
            await user.save();

            return res.status(200).json(user);

        } catch (error) {
            return res.status(422).json({
                error: error.code === 11000 ? 'User already exists' : error.message
            });
        }
    });

};