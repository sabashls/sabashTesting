/**
 * Created by sabash on 23/3/17.
 */

/**
 * Created by sabash on 16/3/17.
 */

var bannerDB = require('./../../../model/banner')
var db = require('./../../../model/campaign');
var accountHistoryDB = require('./../../../model/account_history');
var user = require('./../../../model/user');
var view = require('./../../../model/campaignview');
var config = require('./../../../controllers/conf');
var _uscore = require('underscore');
var curl = require('curlrequest');
var Notify = require('../../../services/notifications/notification');

var nodemailer = require('nodemailer');
var rp = require('request-promise');
var schedule = require('node-schedule');

var _ = require('lodash');




/*** ==========>  Campaign List API functions <===========***/

exports.allList = function (req, res) {

    console.log('all campaign List',req.body.user_id)

    try {

          user.findOne({_id:req.body.user_id}, function (err, doc) {



            if (err || !doc) {



                senderror("User Not found.", res);

                return;

            } else {

                var data = doc.toJSON();

                if (data['blocked'] == '1') {

                    senderror("You are blocked from using the app. Please contact SashCash team for further details", res);

                    return;

                }
                if (data.verified == '0' || data.verified == 0) {

                    res.send(JSON.stringify({status: 'verify', data:{result:{_id:data._id}}}));
                    return;
                }


                else {

                    /* console.log("Add has been hosting",req.body)*/

                    var campaigns = new db(req.body);

                    view.find({user: data._id}).exec(function (err, viewList) {

                        if (err || !viewList) {

                            senderror("No Campaigns Available.", res);

                            return;

                        } else {

                            console.log(data.device_platform)
                            console.log(viewList.length,'viewed list')
                            db.find({
                                type: { $in: config.notificationList },
                                campaign_status: 'active',
                                $and:[{$or: [{'is_android': 1}, {'is_weband': 1}]},{$and: [{'is_android_view': true}, {'is_web_view': true}]}],
                                campaign_platform:{$elemMatch:{$eq:data.device_platform}},
                                $and:[{$or: [{'campaign_town': data.town}, {'campaign_town': 'all'}]},{$or: [{'campaign_professional': data.profession}, {'campaign_professional': 'all'}]}],
                                campaign_marital_status:{$elemMatch:{$eq:data.marital_status}},
                                campaign_gender:{$elemMatch:{$eq:data.gender}},
                            }).skip(Number(req.body.skip)).limit(Number(req.body.limit)).sort({updated_at: -1}).exec(function (errors, list) {

                                if (errors || !list) {

                                    res.json({
                                        status: 'success',
                                        data: {result: list}
                                    })

                                    return;

                                } else {
                                    console.log(list.length,'listss')
                                    if (list.length != 0) {

                                        if (viewList.length != 0) {

                                            var result = _.differenceBy(list, viewList, 'uuid');


                                            console.log('resultssssss',result.length)
                                            res.json({
                                                status: 'success',
                                                data: {result: result}
                                            })


                                        }
                                        else {

                                            res.json({
                                                status: 'success',
                                                data: {result: list}
                                            })

                                        }
                                    }
                                    else {


                                        res.json({
                                            status: 'success',
                                            data: {result: list}
                                        })

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



/*** ==========> Specific Home page Campaign  API functions <===========***/

exports.updateNotification = function (request, response) {

    try {

        user.findById(request.body.user_id, function (err, userdoc) {
            if (err || !userdoc) {

                senderror("User Not found.", response);
                return;
            }
            else {

                var data = userdoc.toJSON();

                if ((data.blocked == '1') || (data.blocked == 1)) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if ((data.verified == '0') || (data.verified == 0)) {

                    response.send(JSON.stringify({status: 'verify', data: {result: data._id}}));
                    return;
                }


                db.findById(request.body.campaign_id, function (err, doc) {

                    if (err || !doc) {

                        senderror("Campaign Not found.", response);
                        return;

                    } else {

                        var campaign = doc.toJSON();

                        var campaignview = new view();
                        campaignview.uuid = campaign.uuid;
                        campaignview.campaign = request.body.campaign_id;
                        campaignview.user = request.body.user_id;
                        campaignview.user_detail = data.user_track_details;
                        campaignview.type = campaign['type'];

                        view.create(campaignview, function (viewerr, viwdoc) {

                            if (viewerr || !viwdoc) {
                                senderror("Campaign Not found.", response);
                                return;
                            } else {

                                response.send({status:'success',data:{result:'viewd successfully'}})

                            }

                        })


                    }
                });
            }
        })
    } catch (error) {

        return senderror("Exception Occurred", response);
    }

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


function accountHistory(user_id,campaign_id,amount) {


    console.log('account Historyyyyyyyyyyyyyyyyyy')
    console.log(user_id,'users',campaign_id,'campaign',amount)

    user.findOne({_id:user_id}, function (err, userdoc) {

        db.findOne({_id:campaign_id}, function (err, userdoc) {

            var accountHistory = new accountHistoryDB();
            accountHistory.amount =  Number(amount);
            accountHistory.campaign =  campaign_id;
            accountHistory.type = 'campaign';
            accountHistory.source = 'campaign';
            accountHistory.user    = user_id;
            accountHistory.user_details =userdoc.user_track_details;
            accountHistory.status = 1;
            accountHistory.is_earned = 1;
            accountHistory.updated_at = new Date();
            accountHistory.is_type = 'earn'

            accountHistoryDB.create(accountHistory,function (err,creditData) {

            })

        })

    })

}