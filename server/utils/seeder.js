const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const admin = require('../../firebase/firebaseAdmin');

const adminSeeder = async () => {
    if (process.env.ADMIN_RESET === 'true') {
        try {
            const adminuser = await Users.findOne({ method: 'custom', role: 'admin', adminRole: 'superadmin' });
            if (adminuser) {
                adminuser.password = process.env.ADMIN_PWD;
                await adminuser.save();
            }
        } catch (error) {
        }
    }

    try {
        const adminuser = await Users.findOne({ method: 'custom', role: 'admin', adminRole: 'superadmin' });
        if (!adminuser) {
            const user = new Users({
                name: process.env.ADMIN_NAME,
                username: process.env.ADMIN_EMAIL,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PWD,
                method: 'custom',
                role: 'admin',
                adminRole: 'superadmin'
            });
            await user.save();
        }
    } catch (error) {
    }

}

module.exports = adminSeeder;