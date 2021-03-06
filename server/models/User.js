const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Schema;

const addressSchema = mongoose.Schema({
    label: String,
    name: String,
    mobile: String,
    region: { type: ObjectId, ref: 'DefaultAddress' },
    city: { type: ObjectId, ref: 'DefaultAddress' },
    area: { type: ObjectId, ref: 'DefaultAddress' },
    street: String,
    isDefault: {
        type: String,
        default: false
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        requred: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    email: String,
    mobile: String,
    password: String,
    picture: String,
    method: {
        type: String,
        default: 'custom'
    },
    fireuid: String,
    role: {
        type: String,
        default: 'subscriber'
    },
    adminRole: {

    },
    sellerRole: {
        type: String,
        default: 'normal'
    },
    deliveryRole:
    {
        type: String  // main(shipping agent created by admin) / branch(branch head created by shipping agent) / rider 
    },
    registerMethod: {
        type: String,
        enum: [
            "web",
            "app"
        ]
    },
    cart: {
        type: Array,
        default: []
    },
    addresses: [addressSchema],
    status: {
        type: String,
    },
    // wishlist: [{ type: ObjectId, ref: 'Products' }]
    notificationToken: {
        type: String
    }
}, { timestamps: true });


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

