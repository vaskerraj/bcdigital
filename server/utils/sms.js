const axios = require('axios');

const smsGetway = async (mobile, smstext) => {
    const baseurl = "https://www.hamrosms.com/SMSSend/Message.asp";
    const apiid = process.env.SMS_API_ID;
    const userid = process.env.SMS_USER_ID;
    const pwd = process.env.SMS_PWD;
    const senderName = process.env.SMS_SENDER_NAME;
    const MobileNo = mobile;
    const curl = baseurl + '?apiid=' + apiid + '&userid=' + userid;
    const url = curl + "&pwd=" + pwd + " &senderName=" + senderName + "&MobileNo=" + MobileNo + "&text=" + smstext;

    try {
        const { data } = await axios.get(url);
        if (data.includes("ID")) {
            return {
                status: 200,
                msg: 'done'
            };
        }
    } catch (error) {
        return {
            status: 400,
            msg: error.message
        }
    }
};

module.exports = smsGetway;