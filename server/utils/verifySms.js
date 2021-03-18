const verifySms = async (mobile, code, method) => {
    // check date also
    try {
        const sms = await User.findOne({ mobile, code, method, status: 'active' }, null, { sort: { createdAt: -1 } }, { limit: 1 });
        return sms;
    } catch (error) {
        return error.message;
    }
}

module.exports = verifySms