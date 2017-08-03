


var app = require('../index');

var user = require('../services/user/user');
var referral = require('../services/referral/referral');
var campaign = require('../services/campaign/campaign');
var recharge = require('../services/recharge/recharge');
var payment = require('../services/payment/payment');
var transfer = require('../services/transfers/transfer');
var feedback = require('../services/feedbacks/feedback');
var Notify = require('../services/notifications/notification');

var homePage = require("../services/campaign/homepage/homepageCampaign")
var video = require("../services/campaign/video/videoCampaign")
var poster = require("../services/campaign/poster/posterCampaign")
var link = require("../services/campaign/link/linkCampaign")
var appDownload = require("../services/campaign/app_download/appDownloadCamapign")
var audio = require("../services/campaign/audio/audioCampaign")
var tableBG = require("../services/campaign/tableBG/tableBG")

/**
 * Old IOS Code Back up & usage code
 */
var old_homePage = require("../services/campaign/homepage/iosoldhomepage")
var old_video = require("../services/campaign/video/iosoldvideo")
var old_poster = require("../services/campaign/poster/iosoldposter")
var old_link = require("../services/campaign/link/iosoldlink")
var old_audio = require("../services/campaign/audio/iosoldaudio")
var old_tableBG = require("../services/campaign/tableBG/tableBG")
var notification = require("../services/campaign/notification/noification")


app.get('/logout',function (req,res) {



})

var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

var redis = require("redis"),
    client = redis.createClient();


client.set('sabash','Sash20');
client.set('sabash','Sash21');

client.get("sabash", function(err, reply) {

});

var async = require('async')

/**  JWT integeration Start  Here **/

var authentication=function (req, res,next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;

    var user_id = req.body.user_id

    if (token) {
        if (user_id) {
            client.get(user_id, function (err, result) {
                if (err) {
                    return res.send({
                        // success: false,
                        status: 'failure',
                        message: 'expireddd'
                    });
                }
                else {
                    if (result == token) {

                        jwt.verify(token, req.body.user_id, function (err, decoded) {

                            if (err) {

                                console.log("Token comes in else part", err)

                                res.json({status: 'expired', message: 'Token expired'});

                                return;
                            }
                            else {

                                console.log("Token comes in else part")

                                req.decoded = decoded;
                                next();
                            }
                        });

                    }

                }

            })
        }
        else {
            res.json({status: 'expired', message: 'Invalid user details'});
        }
    }
    else {

        return res.send({
            // success: false,
            status: 'failure',
            message: 'expireddd'
        });

    }
}

app.get('/api/v1/mobile/users/login',function (req,res) {

    console.log(req.session.user_id)

    res.send(req.session.user_id)

});

/*app.get('/crash', function() {
    process.nextTick(function () {
        throw new Error;
    });
})*/



const fs = require("fs");
var operatorDB = require('./../model/operator')

var data = fs.readFileSync('./public/jsons/generalOperatorList.json');

var opList = JSON.parse(data);

var arr = [];
OperatorList()

function OperatorList() {

    operatorDB.find({},function (err,operatorData) {

        if(err || !operatorData){
            console.log('Opertor Listssssssssss Error')
        }
        else {
            if (operatorData.length == 0) {
                for (var x in opList) {

                    var operator = new operatorDB(opList[x])

                    operatorDB.create(operator, function (err, create) {

                    })
                }
                console.log('Operator add successfully')

            }
            else {
                console.log('Operator already added')

            }
        }

    })
}




/**  List API functions **/



app.post('/promise',user.promise);


app.post('/api/v1/mobile/operatorList',recharge.opList);

app.post('/api/v1/mobile/circleList',recharge.opCircleList);

app.post('/api/v1/mobile/rechargePlanList',recharge.rechargePlanList);

app.post('/api/v1/mobile/operatorInformation',recharge.fetchOperator);







/*** ====================================> Users  API Functions <==========================================***/

app.post('/api/v1/mobile/users/login',user.login);             // User Login API

app.post('/api/v1/mobile/users/updateFacebook',user.updateFacebook);

app.post('/api/v1/mobile/users/socialLogin',user.socialLogin);             // User Login API

app.post('/api/v1/mobile/users/create',user.signup);                    // User Singnup API

app.post('/api/v1/mobile/users/profileImage',user.profileImage);

app.post('/api/v1/mobile/users/forgotPassword',user.forgotPassword);

app.post('/api/v1/mobile/users/forgotVerification',user.forgotVerification);

app.post('/api/v1/mobile/users/resend',user.resend);

app.post('/api/v1/mobile/users',user.specificUser);         // To Load the Specific user Details API


app.post('/api/v1/mobile/users/changePassword',user.changePassword);

app.post('/api/v1/mobile/users/newPassword',user.newPassword);

app.post('/api/v1/mobile/users/update',user.update);


app.post('/api/v1/mobile/professionList',user.professionList);         // To Load the professionList API

app.post('/api/v1/mobile/stateList', user.stateList);           // To Load the StateList API

app.post('/api/v1/mobile/cityList',user.cityList);             // To Load the CityList API

app.post('/api/v1/mobile/townList',user.townList);             // To Load the TownList API





app.post('/api/v1/mobile/users/accountHistorydd',user.accountHistory);

app.post('/api/v1/mobile/users/accountHistory',user.allHistory);





app.post('/api/v1/mobile/users/referralHistory',referral.referralHistory);

app.post('/api/v1/mobile/users/verification',referral.verification);




app.post('/api/v1/mobile/users/mailCom',user.mailCom)

app.post('/api/v1/mobile/keygenerator/:id',user.keygenerator);

app.post('/api/v1/mobile/users/logout',user.logout);




/*** ====================================> Campaign  API Functions <==========================================***/


/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Home Page API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/homePage',homePage.homepageList);

app.post('/api/v1/mobile/campaign/complete/homePage',homePage.completeHomepageCampaign);

app.post('/api/v1/mobile/campaign/homePage',homePage.specificHomepage);


/*========================================> IOS Old function API <============================================ */

app.post('/api/v1/mobile/ios/campaignList/homePage',old_homePage.homepageList);

app.post('/api/v1/mobile/ios/campaign/complete/homePage',old_homePage.completeHomepageCampaign);

app.post('/api/v1/mobile/ios/campaign/homePage',old_homePage.specificHomepage);


app.post('/api/v1/mobile/campaign/homePageBackground',homePage.homePageBackground);




/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Video API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/video',video.videoList);

app.post('/api/v1/mobile/campaign/complete/video',video.completeVideoCampaign);

app.post('/api/v1/mobile/campaign/video',video.specificVideo);


/*========================================> IOS Old function API <============================================ */

app.post('/api/v1/mobile/ios/campaignList/video',old_video.videoList);

app.post('/api/v1/mobile/ios/campaign/complete/video',old_video.completeVideoCampaign);

app.post('/api/v1/mobile/ios/campaign/video',old_video.specificVideo);



app.post('/api/v1/mobile/campaign/videoBackground',video.videoBackground);





/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Poster API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/poster',poster.posterList);

app.post('/api/v1/mobile/campaign/complete/poster',poster.completePosterCampaign);

app.post('/api/v1/mobile/campaign/poster',poster.specificPoster);

/*========================================> IOS Old function API <============================================ */

app.post('/api/v1/mobile/ios/campaignList/poster',old_poster.posterList);

app.post('/api/v1/mobile/ios/campaign/complete/poster',old_poster.completePosterCampaign);

app.post('/api/v1/mobile/ios/campaign/poster',old_poster.specificPoster);


app.post('/api/v1/mobile/campaign/posterBackground',poster.posterBackground);




/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Link API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/link',link.linkList);

app.post('/api/v1/mobile/campaign/complete/link',link.completeLinkCampaign);

app.post('/api/v1/mobile/campaign/link',link.specificLink);


/*========================================> IOS Old function API <============================================ */

app.post('/api/v1/mobile/ios/campaignList/link',old_link.linkList);

app.post('/api/v1/mobile/ios/campaign/complete/link',old_link.completeLinkCampaign);

app.post('/api/v1/mobile/ios/campaign/link',old_link.specificLink);



app.post('/api/v1/mobile/campaign/linkBackground',link.linkBackground);


/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   App Download API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/appDownload',appDownload.appDownloadList);

app.post('/api/v1/mobile/campaign/complete/appDownload/',appDownload.completeappDownloadCampaign);

app.post('/api/v1/mobile/campaign/appDownload',appDownload.specificappDownload);


app.post('/api/v1/mobile/campaign/appDownloadBackground',appDownload.appDownloadBackground);

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Audio API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/audio',audio.audioList);

app.post('/api/v1/mobile/campaign/complete/audio',audio.completeAudioCampaign);

app.post('/api/v1/mobile/campaign/audio',audio.specificAudio);


/*========================================> IOS Old function API <============================================ */

app.post('/api/v1/mobile/ios/campaignList/audio',old_audio.audioList);

app.post('/api/v1/mobile/ios/campaign/complete/audio',old_audio.completeAudioCampaign);

app.post('/api/v1/mobile/ios/campaign/audio',old_audio.specificAudio);


app.post('/api/v1/mobile/campaign/audioBackground',audio.audioBackground);




/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Table BG API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/campaignList/tableBG',tableBG.tableBGList);

app.post('/api/v1/mobile/campaign/complete/tableBG',tableBG.completeTableBGCampaign);

app.post('/api/v1/mobile/campaign/tableBG',tableBG.specificTableBG);


/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&   Notification API    &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/

app.post('/api/v1/mobile/notificationList',notification.allList);

app.post('/api/v1/mobile/updateNotification',notification.updateNotification);

app.post('/api/v1/mobile/campaigns/campaignList',campaign.campaignList);



/*** ====================================> Recharge  API Functions <============================================***/

app.post('/payment/response',payment.status)

app.post('/api/v1/mobile/recharge/login',recharge.jriLogin)

app.post('/api/v1/mobile/recharge/signup',recharge.jriSignup)

app.post('/api/v1/mobile/recharge/balance',recharge.balance)

/*** ====================================> Recharge  API Functions <============================================***/


app.post('/api/v1/mobile/rechargeConfirmation',recharge.discountUserCalculation)

app.post('/api/v1/mobile/hashKey',recharge.paymentKey)




app.get('/api/v1/recharge/rechargeResponse',recharge.rechargeResponce)

app.get('/api/v1/recharge/response',recharge.jriRechargeResponse)

app.post('/api/v1/mobile/recharge',recharge.rechargeAPI)

app.post('/api/v1/mobile/getRecharge',recharge.specificRecharge)

app.post('/api/v1/mobile/recentTransaction',recharge.recentRecharge)

app.post('/api/v1/mobile/refund',recharge.refundMoney)

app.post('/api/v1/mobile/getRefund',recharge.refundMoneyPay)



/*** ====================================> transfer  API Functions <===========================================***/

app.post('/api/v1/mobile/transfer/sashcash',transfer.transfer);

app.post('/api/v1/mobile/transfer/paytm',transfer.transferPaytm)

app.post('/api/v1/mobile/transfer/transferHistory',transfer.transferHistory);



/*** ====================================> Campaign  API Functions <===========================================***/

app.post('api/v1/mobile/feedback',feedback.feedback);  //pending

