
// const withSass = require('@zeit/next-sass')
// module.exports = withSass({
// })

module.exports = {
    env: {
        api: 'https://bcdigital.vercel.app',
        TRACKINGID_PREFIX: 'BCD'
    },
    images: {
        domains: ['bcdigital.vercel.app', 'bcdigital.online'],
    },
}