const mongoose = require('mongoose');
const User = mongoose.model('Users');

module.exports = function (server) {

    server.post('/api/login', async (req, res) => {
        const { mobile, password } = req.body;
        if (!mobile || !password) {
            res.status(422).json({ error: 'Provide both mobile number and password' });
        }

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(422).json({ error: 'Invalid mobile number or password.' });
        }

        try {
            await user.comparePassword(password);
            // create token and send to client

            //sample return
            return res.status(200).json(user);
        } catch (err) {
            return res.status(422).json({ error: 'Invalid email or password.' });
        }
    });

};