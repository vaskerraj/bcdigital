const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        requred: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    email: String,
    mobile: String,
    password: String,
    picture: String,
    method: {
        type: String,
        defailt: 'mobile'
    },
    fireuid: String,
    role: {
        type: String,
        default: 'subscriber'
    },
    cart: {
        type: Array,
        default: []
    },
    address: String,
    // wishlist: [{ type: ObjectId, ref: 'Products' }]
}, { timestamps: true });

function isMobileRequired() {
    if (levelsEligibleForOffice.indexOf(this.level) > -1) {  //"this" contains the employee document at the time of required validation
        return true;
    }
    return false;
}

// we use function to use this not es6 arrow function
userSchema.pre('save', function (next) {
    const user = this;
    // to prevet Random Table Attack
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });

});


userSchema.methods.comparePassword = function (userPassword) {
    const user = this;
    // to use async need to use promise
    return new Promise((reslove, reject) => {
        bcrypt.compare(userPassword, user.password, (err, isMatch) => {
            if (err) {
                return reject(err);
            }
            if (!isMatch) {
                return reject(false);
            }

            reslove(true);
        });
    });
}

mongoose.models.Users || mongoose.model('Users', userSchema)

