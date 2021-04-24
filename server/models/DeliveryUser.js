const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Schema;

const deliveryUserSchema = new mongoose.Schema({
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
        default: 'custom'
    },
    fireuid: String,
    agentId: {
        type: ObjectId,
        ref: 'ShippingAgent'
    },
    role: {
        type: String,
        default: 'delivery'
    },
    // pickUps: {
    //     type: ObjectId,
    //     ref: 'Order'
    // },
    address: {
        type: String
    },
    createdBy: {
        type: ObjectId,
        ref: 'Users'
    },
    status: {
        type: String,
        default: 'approved'
    },
}, { timestamps: true });


// we use function to use this not es6 arrow function
deliveryUserSchema.pre('save', function (next) {
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


deliveryUserSchema.methods.comparePassword = function (userPassword) {
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

mongoose.models.DeliveryUser || mongoose.model('DeliveryUser', deliveryUserSchema)

