const client = require('twilio')('AC52d10d461b4f8102486e57444ba53b0d', 'a3fd495b5167edb15409d05afc413548');
const serviceSid = 'VAedfd84a4d559f10e96e0481b3d689965'

module.exports = {

    doSms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verifications.create({
                to: `+91${userData.phone}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
                console.log(res);
            })
        })
    },

    otpVerify: (otpData, userData) => {
        let resp = {}

        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userData.phone}`,
                code: otpData.otp
            }).then((resp) => {
                console.log("verification success");
                resolve(resp)
            })
        })
    }



}