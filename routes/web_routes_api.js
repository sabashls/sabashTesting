


    var app = require('../android_api');

    var user = require('../services/user/user');
    var referral = require('../services/referral/referral');
    var campaign = require('../services/campaign/campaign');
    var recharge = require('../services/recharge/recharge');
    var transfer = require('../services/transfers/transfer');
    var feedback = require('../services/feedbacks/feedback');
    var Notify = require('../services/notifications/notification');



    var isAuthenticate = function (request, responce, next) {

        if (request.session.userId) {
            next();
        }
        else {
            console.log(request.session.userId)
            responce.json({status:'failure',msg:'invalide user'})
        }
    }

    app.get('/api/v1/up/users/userLogin',isAuthenticate,function (req,res) {

        console.log('session get id', req.session.userId);

        res.send(req.session.userId)

    })

    app.get('/logout',function (req,res) {

        req.session.destroy()

    })




/*** ====================================> Users  API Functions <==========================================***/


    app.post('/api/v1/up/users/login',user.login);             // User Login API

    // app.post('/api/v1/up/users/checkAccount',user.checkAccount);  // Check User Account API

    app.post('/api/v1/up/users/signup',user.signup);                    // User Singnup API

    app.post('/api/v1/up/stateList', user.stateList);           // To Load the StateList API

    app.post('/api/v1/up/cityList',user.cityList);             // To Load the CityList API

    app.post('/api/v1/up/townList',user.townList);             // To Load the TownList API

    app.get('/api/v1/up/users/:id',user.specificUser);         // To Load the Specific user Details API

    app.get('/api/v1/up/userWallet/:id',user.userWallet);      //To  Load the Specific User Wallet Details API

    app.post('/api/v1/up/users/forgotPassword',user.forgotPassword);

    app.post('/api/v1/up/users/changePassword',user.changePassword);

    app.post('/api/v1/up/users/verification',referral.verification);

    app.post('/api/v1/up/users/resend',user.resend);

    app.post('/api/v1/up/users/accountHistory',user.accountHistory);

    app.post('/api/v1/up/users/allAccountHistory',user.allAccountHistory);

    app.post('/api/v1/up/users/logout/:id',user.logout);

    app.put('/api/v1/up/users/:id',user.update);   //pending

    app.post('/api/v1/up/users/referralHistory',referral.referralHistory);

    app.post('/api/v1/up/operatorList',user.getOperatorList);

    app.post('/api/v1/up/professionList',user.professionList);

    app.post('/api/v1/up/users/updateFacebook',user.updateFacebook);

    app.post('/api/v1/up/keygenerator/:id',user.keygenerator);

    app.post('/api/v1/up/users/updateUserImage',user.profileImage);

    app.post('/api/v1/up/users/mailCom',user.mailCom)






    /*** ====================================> Campaign  API Functions <==========================================***/

    app.post('api/v1/up/campaigns/campaignList',campaign.campaignList);

    app.put('api/v1/up/campaigns/completeCampaign/:id',user.jwtVerify,campaign.completeCampaign);

    app.get('api/v1/up/campaigns/:id',user.jwtVerify,campaign.specificCampaign);



    /*** ====================================> Recharge  API Functions <============================================***/

    // app.post('api/v1/up/recharge',user.jwtVerify,recharge.recharge);

    /*app.post('api/v1/up/recharge/rechargeHistory',user.jwtVerify,recharge.rechargeHistory);

    app.post('api/v1/up/jriLogin',recharge.jriLogin);

    app.post('api/v1/up/jriRecharge',recharge.jriRecharge);

    app.post('api/v1/up/jriRechargeStatus',recharge.jriRechargeStatus);

    app.get('api/v1/up/jriRechargeResponse',recharge.jriRechargeResponse);

    app.get('api/v1/up/recharge/rechargeResponse',recharge.rechargeResponce);

    app.post('api/v1/up/recharge/rechageStatus',recharge.rechageStatus);*/



    /*** ====================================> transfer  API Functions <===========================================***/

    app.post('api/v1/up/transfer',transfer.transfer);

    app.post('api/v1/up/transfer/transferHistory',transfer.transferHistory);



    /*** ====================================> Campaign  API Functions <===========================================***/

    app.post('api/v1/up/feedback',feedback.feedback);  //pending




    app.get('/result',function (req,res) {

        console.log(req)




    });