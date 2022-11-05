const express = require('express')
const next = require('next')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const glob = require('glob');

// init models
require('./models/User.js');
require('./models/SMS.js');
require('./models/Category.js');
require('./models/Brand.js');
require('./models/Banner.js');
require('./models/DefaultAddress.js');
require('./models/ShipAgent.js');
require('./models/ShippingPlan.js');
require('./models/DeliveryUser.js');
require('./models/Coupon.js');

require('./models/Product.js');
require('./models/SearchTag.js');

require('./models/Cart.js');
require('./models/Order.js');
require('./models/Package.js');
require('./models/NotificationToken.js');
require('./models/Seller.js');
require('./models/Payment.js');
require('./models/Cancellation.js');
require('./models/Refund.js');
require('./models/Return.js');

require('./models/Transaction.js');
require('./models/SellerInvoiceDates.js');
require('./models/CommonSetting.js');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev });
const handle = app.getRequestHandler()

mongoose.connect('mongodb://localhost:27017/bcdigital', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.on('connected', err => {
    console.log('Connected to mongo instace')
});

mongoose.connection.on('error', err => {
    console.log('Error on Connected to mongo instace')
});

app.prepare().then(() => {
    const server = express();

    // middlewares
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    // Allows for cross origin domain request:
    server.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // routes
    const rootPath = require('path').normalize(__dirname + '/..');
    glob.sync(rootPath + '/server/routes/*.js').forEach(controllerPath => require(controllerPath)(server));
    glob.sync(rootPath + '/server/routes/user/*.js').forEach(controllerPath => require(controllerPath)(server));
    glob.sync(rootPath + '/server/routes/admin/*.js').forEach(controllerPath => require(controllerPath)(server));
    glob.sync(rootPath + '/server/routes/seller/*.js').forEach(controllerPath => require(controllerPath)(server));
    glob.sync(rootPath + '/server/routes/delivery/*.js').forEach(controllerPath => require(controllerPath)(server));

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})