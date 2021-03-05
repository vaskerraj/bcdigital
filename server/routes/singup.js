module.exports = function (server) {

    server.post('/api/signup', (req, res) => {
        res.status(200).json({
            msg: 'message at login page'
        })
    });

};