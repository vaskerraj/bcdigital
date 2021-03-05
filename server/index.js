const express = require('express')
const next = require('next')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const glob = require('glob');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev });
const handle = app.getRequestHandler()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
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

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})