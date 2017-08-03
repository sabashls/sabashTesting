/**
 * Created by USER on 03-11-2016.
 */
/**
 * Created by sabash ls on 01/11/16.
 */

var db = require('./../../model/campaign');
var user = require('./../../model/user');
var view = require('./../../model/campaignview');
var config = require('./../../controllers/conf');
var _uscore = require('underscore');
var curl = require('curlrequest');
var Notify = require('../../services/notifications/notification');

var nodemailer = require('nodemailer');
var rp = require('request-promise');
var schedule = require('node-schedule');

var _ = require('lodash');






function notifyList(){

    user.find({},function(err,userData){

        if(err){
            console.log("userData error",err)
        }

        else{

            // console.log("userData",userData)

            userData.forEach(function(val,index){


                console.log("userData[i]",userData[index].device_type)


                if(userData[index].push_token != "-1"){

                    var pushtoken=userData[index].push_token

                    console.log("pushtoken Result",pushtoken)


                    db.find({
                        campaign_status: 'active',
                        campaign_platform:{$elemMatch:{$eq:userData[index].device_type}},
                        $or: [{'campaign_town': userData[index].town}, {'campaign_town': 'all'}],
                        campaign_gender:{$elemMatch:{$eq:userData[index].gender}},
                    })

                        .exec(function(err,result){
                            if(err){
                                console.log("notification error",err)
                            }

                            else {


                                console.log("Statge_2")

                                for(var j=0;j<result.length;j++){

                                    // console.log("Statge_3")

                                    var notifyData={}
                                    notifyData.title=result[j].title
                                    notifyData.type=result[j].type

                                }


                                // var notifyData="hello"

                                console.log("Statge_4")

                                if(pushtoken){

                                    console.log("Statge_6")

                                    Notify.campaignListNotify(pushtoken,notifyData)
                                }



                            }

                        })

                }

                else{


                    console.log("Condition 2 passed")
                }



            })


        }

    })
}





/*** ==========>  Campaign List API functions <===========***/

exports.campaignList = function (req, res) {

console.log('campaignList')

        try {

            var mustparams = ["type"];
            var resObj = {};
            if (!checkParams(req, res, mustparams)) return;

            user.findById(req.body.user_id, function (err, doc) {

                if (err || !doc) {

                    senderror("User Not found.", res);

                    return;

                } else {

                    var data = doc.toJSON();

                    if (data['blocked'] == '1') {

                        senderror("You are blocked from using the app. Please contact SashCash team for further details", res);

                        return;

                    } else {

                        console.log("Add has been hosting",req.body)

                        var campaigns = new db(req.body);
                        var timestamp = new Date().toUTCString();
                        var visibleCampaigns = [];

                            view.find({user: data._id}).exec(function (err, viewList) {

                                if (err || !viewList) {

                                    senderror("No Campaigns Available.", res);

                                    return;

                                } else {
                                         db.find({
                                        type: campaigns.type,
                                        campaign_status: 'active',
                                        campaign_platform:{$elemMatch:{$eq:data.device_type}},
                                        $or: [{'campaign_town': data.town}, {'campaign_town': 'all'}],
                                        /*campaign_marital_status:{$elemMatch:{$eq:data.marital_status}},*/
                                        /* $or: [{'campaign_city': data.city}, {'campaign_city': 'all'}],
                                         $or: [{'campaign_state': data.state}, {'campaign_state': 'all'}],*/
                                        campaign_gender:{$elemMatch:{$eq:data.gender}}
                                    }).sort({cost: -1, updated_at: 1}).exec(function (err, list) {

                                        if (err || !list) {

                                            senderror("User Not found.", res);

                                            return;

                                        } else {

                                            if (viewList.length != 0) {

                                               // console.log(list)
                                               // console.log(list.length,list[0].order_id,list[1].order_id)

                                               // console.log(viewList[0].order_id)

                                                var result = _.differenceBy(list, viewList,'order_id');


                                                console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6')
                                                console.log(result[0]._id)

                                                resObj['status'] = "success";
                                                resObj['campaigns'] = result;
                                                res.json(resObj);

                                            } else {


                                                resObj['status'] = "success";
                                                resObj['campaigns'] = list;
                                                res.json(resObj);

                                            }
                                        }
                                    });
                                }
                            });

                    }
                }
            });

        }
        catch (error) {

            json = {
                error: "Error: " + error.message
            };

            return senderror("Exception Occurred", res);
        }



}






/*** ==========> Specific Campaign  API functions <===========***/

exports.specificCampaign = function (request, response) {

    try {

        db.findById(request.params.id, function (err, doc) {

            if (err || !doc) {

                senderror("Campaign Not found.", response);
                return;

            } else {

                var campaign = doc.toJSON();

                view.find({campaign: request.params.id}).populate('user').exec(function (err1, viewCount) {

                    if (err1) {
                        senderror("Campaign view Not found.", response);
                        return;

                    } else {
                        if (campaign.clicks == viewCount.length) {

                            senderror("This Campaign Just Now Expired ", response);
                            return;
                        }
                        else if (campaign.clicks < viewCount.length) {
                            senderror("This Campaign Just Now Expired ", response);
                            return;

                        }
                        else {
                            sendCampaignDetails(doc, response);
                        }
                    }
                })

            }
        });

    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }
}


/*** ==========> complete Campaign API functions <===========***/

/*exports.completeCampaign = function (request, res) {

 try {

 db.findById(request.params.id, function (err, doc) {

 if (err || !doc) {

 senderror("Campaign Not found.", res);
 return;

 } else {

 var camId = request.params.id
 var campaign = doc.toJSON();
 var costtouser = Math.ceil(campaign['cost']);

 user.findById(request.body.user_id, function (err, doc) {

 if (err || !doc) {

 senderror("User Not found.", res);
 return;

 } else {

 var data = doc.toJSON();
 var walletamount = data['wallet'];
 walletamount = Math.ceil(walletamount) + Math.ceil(costtouser);

 if (data['blocked'] == '1') {

 senderror("You are blocked from using the app. Please contact SashCash team for further details", res);
 return;

 } else {

 var campaignview = new view();
 campaignview.campaign = request.params.id;
 campaignview.user = request.body.user_id;
 campaignview.type = campaign['type'];

 view.find({campaign: camId}).populate('user').exec(function (err1, viewCount) {

 if (err1) {

 senderror("Campaign view Not found.", response);
 return;

 } else {


 if (campaign.clicks == viewCount.length) {
 console.log(viewCount[0])

 db.update({_id: camId}, {$set: {campaign_status: 'completed'}}, function (error, upCam) {

 if (error) {

 senderror("Campaign view Not found.", response);

 } else {

 db.findOne({_id:request.params.id}).populate('advertisers').exec(function (err, adverDoc) {



 if (adverDoc) {

 var device = []
 var android = []
 var web = []
 var ios = []
 var male = []
 var female = []
 for (var i = 0; i < viewCount.length; i++) {

 // if(viewCount[i].user.device_type) {
 if (viewCount[i].user.device_type == 'android') {
 android.push(viewCount[i].user.device_type)
 }
 else if (viewCount[i].user.device_type == 'web') {
 web.push(viewCount[i].user.device_type)
 }
 else if (viewCount[i].user.device_type == 'ios') {
 ios.push(viewCount[i].user.device_type)
 }
 else {
 console.log("Device not found");
 }

 // }


 if (viewCount[i].user.gender == 'Male') {
 male.push(viewCount[i].user.gender)
 } else if (viewCount[i].user.gender == 'Female') {
 female.push(viewCount[i].user.gender)
 } else {
 console.log("Gender not found")
 }
 }
 var Android = android.length
 var Web = web.length
 var Ios = ios.length
 var Male = male.length
 var Female = female.length
 var clickes = {
 android: Android,
 web: Web,
 ios: Ios,
 male: Male,
 female: Female
 }
 var totalClickes = viewCount.length;




 var options = {
 method: 'POST',
 // uri: 'http://20.0.0.13:8001/campaigns/completeCampaignEmail',
 uri: 'http://52.77.106.59:8001/campaigns/completeCampaignEmail',
 body: {
 camDetail: adverDoc,
 clicks:clickes,
 totalCount: totalClickes

 },
 json: true // Automatically stringifies the body to JSON
 };
 rp(options)
 .then(function (result) {
 console.log(JSON.stringify(result))
 if (result == 'success'){


 } else {

 /!*res.send(JSON.stringify({
 status: 'success',
 message: 'view campaigns'
 }, null, 3));*!/
 }
 })

 view.findOne({
 'campaign': request.params.id,
 'user': request.body.user_id
 }).sort('-updated_at').exec(function (error, viewdoc)
 {

 console.log(viewdoc, 'viewdocsaba')

 if (error || !viewdoc) {

 console.log('empty View doc');
 view.create(campaignview, function (err, doc) {

 console.log("Campaign view ---- created");
 console.log(doc);

 user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
 if (err) {
 senderror("User not found", res);
 return;
 }
 else {
 user.findById(request.body.user_id, function (err, user) {
 if (err) {
 senderror("User not found", res);
 return;
 }
 res.setHeader('Content-Type', 'application/json');
 console.log(doc, "WALLET UPDATED")
 res.send(JSON.stringify({
 status: 'success',
 wallet: user.wallet
 }, null, 3));
 })
 }
 });
 });




 } else {
 senderror("This Campaign Email send", res);
 return;
 }

 })
 .catch(function (err) {
 console.log(err)
 // res.send('errr')
 });



 }
 else {
 senderror("This Campaign Just Now Expired ", res);
 return;
 }
 })


 }
 });

 } else if (campaign.clicks < viewCount.length) {
 senderror("This Campaign Just Now Expired ", res);
 return;

 } else {

 view.findOne({
 'campaign': request.params.id,
 'user': request.body.user_id
 }).sort('-updated_at').exec(function (error, viewdoc) {

 console.log(viewdoc, 'viewdoc')

 if (error || !viewdoc) {

 console.log('empty View doc');
 view.create(campaignview, function (err, doc) {

 console.log("Campaign view ---- created");
 console.log(doc);

 user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
 if (err) {
 senderror("User not found", res);
 return;
 }
 else {
 user.findById(request.body.user_id, function (err, user) {
 if (err) {
 senderror("User not found", res);
 return;
 }
 res.setHeader('Content-Type', 'application/json');
 console.log(doc, "WALLET UPDATED")
 res.send(JSON.stringify({
 status: 'success',
 wallet: user.wallet
 }, null, 3));
 })
 }
 });
 });

 } else {

 res.send(JSON.stringify({
 status: 'success',
 message: 'view campaigns'
 }, null, 3));
 }
 })
 }
 }
 })
 }
 }
 });
 }
 });

 } catch (error) {

 json = {
 error: "Error: " + error.message
 };

 return senderror("Exception Occurred", res);
 }
 }*/




exports.completeCampaign = function (request, res) {

    try {

        db.findById(request.params.id, function (err, doc) {

            if (err || !doc) {


                senderror("Campaign Not found.", res);
                return;

            } else {

                var camId = request.params.id
                var campaign = doc.toJSON();
                var costtouser = Math.ceil(campaign['cost']);

                user.findById(request.body.user_id, function (err, doc) {

                    if (err || !doc) {

                        senderror("User Not found.", res);
                        return;

                    } else {

                        var data = doc.toJSON();
                        var walletamount = data['wallet'];
                        walletamount = Math.ceil(walletamount) + Math.ceil(costtouser);

                        if (data['blocked'] == '1') {

                            senderror("You are blocked from using the app. Please contact SashCash team for further details", res);
                            return;

                        } else {

                            var campaignview = new view();
                            campaignview.campaign = request.params.id;
                            campaignview.user = request.body.user_id;
                            campaignview.type = campaign['type'];

                            view.find({campaign: camId}).populate('user').exec(function (err1, viewCount) {

                                if (err1) {

                                    senderror("Campaign view Not found.", response);
                                    return;

                                } else {


                                    if (campaign.clicks == viewCount.length) {


                                        /* view.findOne({
                                         'campaign': request.params.id,
                                         'user': request.body.user_id
                                         }).sort('-updated_at').exec(function (error, viewdoc)
                                         {
                                         if (error || !viewdoc) {

                                         view.create(campaignview, function (err, viwdoc) {

                                         if (viwdoc){

                                         db.update({_id: camId}, {$set: {campaign_status: 'completed'}}, function (error, upCam) {

                                         if (error) {

                                         senderror("Campaign view Not found.", response);

                                         } else {

                                         db.findOne({_id:request.params.id}).populate('advertisers').exec(function (err, adverDoc) {

                                         if (adverDoc) {

                                         var options = {
                                         method: 'POST',
                                         uri: 'http://20.0.0.13:8001/campaigns/completeCampaignEmail',
                                         body: {
                                         campaign_id: request.params.id,

                                         },
                                         json: true // Automatically stringifies the body to JSON
                                         };

                                         rp(options)
                                         .then(function (result) {
                                         console.log(JSON.stringify(result))
                                         })
                                         .catch(function (err) {
                                         console.log(err)
                                         // res.send('errr')
                                         });
                                         user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                         if (err) {
                                         senderror("User not found", res);
                                         return;
                                         }
                                         else {
                                         user.findById(request.body.user_id, function (err, user) {
                                         if (err) {
                                         senderror("User not found", res);
                                         return;
                                         } else {
                                         res.setHeader('Content-Type', 'application/json');
                                         console.log(doc, "WALLET UPDATED")
                                         res.send(JSON.stringify({
                                         status: 'success',
                                         wallet: user.wallet
                                         }, null, 3));
                                         }
                                         })
                                         }
                                         });
                                         }
                                         else {
                                         senderror("This Campaign Just Now Expired ", res);
                                         return;
                                         }
                                         })

                                         }
                                         });

                                         }
                                         else {
                                         res.send(JSON.stringify({
                                         status: 'success',
                                         message: 'view campaigns'
                                         }, null, 3));
                                         }


                                         });

                                         } else {

                                         res.send(JSON.stringify({
                                         status: 'success',
                                         message: 'view campaigns'
                                         }, null, 3));
                                         }
                                         })*/

                                        senderror("This Campaign Just Now Expired ", res);
                                        return;
                                    }
                                    else if (campaign.clicks < viewCount.length) {
                                        console.log(viewCount.length, 'legngthhh else ifff ',campaign.clicks)
                                        senderror("This Campaign Just Now Expired ", res);
                                        return;

                                    }
                                    else if (campaign.clicks == viewCount.length + 1) {

                                        view.findOne({
                                            'campaign': request.params.id,
                                            'user': request.body.user_id
                                        }).sort('-updated_at').exec(function (error, viewdoc)
                                        {
                                            if (error || !viewdoc) {

                                                view.create(campaignview, function (err, viwdoc) {

                                                    if (viwdoc){

                                                        db.update({_id: camId}, {$set: {campaign_status: 'completed',end_date:new Date()}}, function (error, upCam) {

                                                            if (error) {

                                                                senderror("Campaign view Not found.", response);

                                                            } else {

                                                                db.findOne({_id:request.params.id}).populate('advertisers').exec(function (err, adverDoc) {

                                                                    if (adverDoc) {

                                                                        var options = {
                                                                            method: 'POST',
                                                                            uri: config.completeEmailUrl,
                                                                            body: {
                                                                                campaign_id: request.params.id,

                                                                            },
                                                                            json: true // Automatically stringifies the body to JSON
                                                                        };

                                                                        rp(options)
                                                                            .then(function (result) {
                                                                                console.log(JSON.stringify(result))
                                                                            })
                                                                            .catch(function (err) {
                                                                                console.log(err)
                                                                                // res.send('errr')
                                                                            });
                                                                        user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                                            if (err) {
                                                                                senderror("User not found", res);
                                                                                return;
                                                                            }
                                                                            else {
                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {
                                                                                        res.setHeader('Content-Type', 'application/json');

                                                                                        res.send(JSON.stringify({
                                                                                            status: 'success',
                                                                                            wallet: user.wallet
                                                                                        }, null, 3));
                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        senderror("This Campaign Just Now Expired ", res);
                                                                        return;
                                                                    }
                                                                })

                                                            }
                                                        });

                                                    }
                                                    else {
                                                        res.send(JSON.stringify({
                                                            status: 'success',
                                                            message: 'view campaigns'
                                                        }, null, 3));
                                                    }


                                                });

                                            } else {

                                                res.send(JSON.stringify({
                                                    status: 'success',
                                                    message: 'view campaigns'
                                                }, null, 3));
                                            }
                                        })

                                    }
                                    else {

                                        view.findOne({
                                            'campaign': request.params.id,
                                            'user': request.body.user_id
                                        }).sort('-updated_at').exec(function (error, viewdoc) {

                                            if (error || !viewdoc) {

                                                view.create(campaignview, function (err, doc) {

                                                    user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                        if (err) {
                                                            senderror("User not found", res);
                                                            return;
                                                        }
                                                        else {
                                                            user.findById(request.body.user_id, function (err, user) {
                                                                if (err) {
                                                                    senderror("User not found", res);
                                                                    return;
                                                                } else {
                                                                    res.setHeader('Content-Type', 'application/json');

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        wallet: user.wallet
                                                                    }, null, 3));
                                                                }
                                                            })
                                                        }
                                                    });
                                                });

                                            } else {

                                                res.send(JSON.stringify({
                                                    status: 'success',
                                                    message: 'view campaigns'
                                                }, null, 3));
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                });
            }
        });

    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", res);
    }
}


function campaigCount(camId, callback) {

    db.findById(camId, function (err, camData) {

        if (err) {

            senderror("Campaign Not found.", response);
            return;

        } else {

            view.count({campaign: camId}, function (err1, viewCount) {
                if (err1) {
                    senderror("Campaign view Not found.", response);
                    return;
                } else {
                    if (camData.count == viewCount || camData.count < viewCount) {

                        db.update({_id: camId}, {$set: {campaign_status: 'completed'}}, function (error, upCam) {

                            if (error) {

                            }
                            else {

                            }

                        })
                    }
                    else {

                    }

                }

            })
        }
    });
}


/*
 * Common Methods
 */

function sendCampaignDetails(doc, res) {

    var data = {};

    data['status'] = "success";
    data['campaigns'] = [];

    var docs = JSON.parse(JSON.stringify(doc));
    var added = 0;

    for (var i = 0; i < docs.length; i++) {

        delete docs[i]['updated_at'];
        delete docs[i]['__v'];

        //getCovered(i, docs[i]);
    }

    data['campaigns'] = docs;

    res.json(data);


}


function senderror(msg, res) {

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status: 'failure', message: msg}, null, 3));
}

function checkParams(req, res, arr) {

    // Make sure each param listed in arr is present in req.query
    var missing_params = [];

    for (var i = 0; i < arr.length; i++) {
        if (!req.body[arr[i]]) {
            missing_params.push(arr[i]);
        }
    }

    if (missing_params.length == 0) {

        return true;

    } else {

        senderror("Missing Params", res);

        return false;
    }
}

function sendSms(mobile,msg) {

    var smsurl = 'http://sms.queenmultiservices.in/submitsms.jsp?';
    smsurl += 'user=sathish&key=280559df18XX';
    smsurl += '&senderid=INFOSM&accusage=1';
    smsurl += '&mobile=+91'+mobile;
    smsurl += '&message='+encodeURIComponent(msg);


    var options = { url:smsurl, include: true };

    curl.request(options, function (err, parts) {

    });
}



