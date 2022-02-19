
// const withSass = require('@zeit/next-sass')
// module.exports = withSass({
// })

module.exports = {
    swcMinify: true,
    env: {
        api: 'http://localhost:3000',
        TRACKINGID_PREFIX: 'BCD'
    },
    images: {
        domains: ['localhost', 'bcdigital.online'],
    },
}