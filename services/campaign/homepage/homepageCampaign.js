/**
 * Created by sabash on 16/3/17.
 */

var db = require('./../../../model/campaign');
var accountHistoryDB = require('./../../../model/account_history');
var user = require('./../../../model/user');
var view = require('./../../../model/campaignview');
var clickDB = require('./../../../model/campaignclick');
var config = require('./../../../controllers/conf');
var _uscore = require('underscore');
var curl = require('curlrequest');
var Notify = require('../../../services/notifications/notification');

var nodemailer = require('nodemailer');
var rp = require('request-promise');
var schedule = require('node-schedule');

var _ = require('lodash');
const winston = require('winston');


/*** ==========>   Background API functions <===========***/

exports.homePageBackground = function (req, res) {

    res.send({status:'success',data:{result:[]}})

}


/*** ==========>  Campaign List API functions <===========***/

exports.homepageList = function (req, res) {

    console.log('home page campaignList')

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

                if (data['blocked'] == '1'  || data['blocked'] == 1 ) {

                    senderror("You are blocked from using the app. Please contact SashCash team for further details", res);

                    return;

                } else {


                    if (data.verified == '0' || data.verified == 0) {

                        res.send(JSON.stringify({status: 'verify', data: {result: {_id: data._id}}}));
                        return;
                    }

                    else {

                        console.log("Add has been hosting", req.body)
                        var p2;
                        var campaign = new db(req.body);
                        var timestamp = new Date().toUTCString();
                        var visibleCampaigns = [];

                        var result = []

                        view.find({user: data._id,type:campaign.type}, function (err, viewList) {

                            if (err || !viewList) {

                                senderror("User Not found.", res);

                                return;

                            }
                            else {

                                db.find({
                                    type: campaign.type,
                                    campaign_status:{$in : ['active','completed']},
                                    $and:[{$or: [{'is_android': 1}, {'is_weband': 1}]},{$and: [{'is_android_view': true}, {'is_weband_view': true}]}],
                                    campaign_platform:{$elemMatch:{$eq:data.device_platform}},
                                    $and:[{$or: [{'campaign_town': data.town}, {'campaign_town': 'all'}]},{$or: [{'campaign_professional': data.profession}, {'campaign_professional': 'all'}]}],
                                    campaign_marital_status:{$elemMatch:{$eq:data.marital_status}},
                                    campaign_gender:{$elemMatch:{$eq:data.gender}},
                                })
                                 .sort({cost: -1, updated_at: -1}).exec(function (err, list) {

                                    if (err || !list) {

                                        senderror("User Not found.", res);
                                        return ;

                                    } else {

                                        for (var k = 0; k < list.length; k++) {
                                            list[k].is_view = 0;
                                            list[k].is_valide = 0;
                                        }

                                        if (viewList.length != 0) {


                                           var valObj = isFuction(list,viewList)

                                            var resObj = Completedviewed(valObj,viewList)

                                            isExpired(resObj,res)

                                        }
                                        else {

                                            var resObj = nonCompleted(list)
                                            isExpired(resObj,res)

                                        }
                                    }
                                });
                            }
                        });


                    }

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



function isExpired(resList,responce) {

    var result = [];

    for (var i =0 ; i < resList.length;i++){

        if(resList[i].is_valide == 1){

        }
        else {

            result.push(resList[i])
        }


    }
    responce.json({status: "success", data:{result:result}})
}

function isFuction(list,viewList){
    console.log(list.length,"campaign List")

    console.log(viewList.length,"Viewed Campaign List ")


    for (var i = 0; i < list.length; i++) {

        for (var j = 0; j < viewList.length; j++) {

            if(list[i]) {

                if (list[i].uuid == viewList[j].uuid) {

                    if (viewList[j].Expired_date < new Date()) {
                        list[i].is_view = 1
                        list[i].is_valide = 1

                    }
                    else {

                        list[i].is_view = 1
                    }

                }
                else {
                    if (list[i].is_view == 1) {

                    }
                    else {
                        list[i].is_view = 0;

                        /*if (list[i].is_android == 0 || list[i].is_weband == 0) {
                            list.splice(i, 1)
                        }
                        else {
                            list[i].is_view = 0;
                        }*/
                        //list[i].is_view = 0;
                    }
                }

            }
            else {
                //return list
            }


/*
            if(list[i].uuid == viewList[j].uuid){

                console.log('Equalllllllllll')
            }

            else {

                console.log('elseeeeeeeeeeeeeeeeeee')
            }*/



        }
       // console.log(i,'iiiiiiiiiiiiiiiiii')


    }

    return list
}

function completedCampaign(lists,viewLists) {

    console.log(lists.length,"campaign List")

    console.log(viewLists.length,"Viewed Campaign List ")

    var listresult = []
    lists.forEach(function(list) {

        viewLists.forEach(function(viewList) {

            if(list) {

                if(list.campaign_status == 'completed'){


                    if (list.uuid == viewList.uuid) {
                            list.is_view = 1
                        if (viewList.Expired_date < new Date()) {
                            list['is_valide'] = 1
                            list.is_valide = 1

                        }

                    }
                    else {
                        list['is_valide'] = 1

                        if (list.is_view == 1) {

                        }
                        else {
                            list.is_view = 0;

                            /*if (list[i].is_android == 0 || list[i].is_weband == 0) {
                             list.splice(i, 1)
                             }
                             else {
                             list[i].is_view = 0;
                             }*/
                            //list[i].is_view = 0;
                        }
                    }
                    listresult.push(list)
                }
                else {

                    if (list.uuid == viewList.uuid) {

                        if (viewList.Expired_date < new Date()) {
                            list.is_view = 1
                            list.is_valide = 1

                        }
                        else {

                            list.is_view = 1
                        }

                    }
                    else {
                        if (list.is_view == 1) {

                        }
                        else {
                            list.is_view = 0;

                            /*if (list[i].is_android == 0 || list[i].is_weband == 0) {
                             list.splice(i, 1)
                             }
                             else {
                             list[i].is_view = 0;
                             }*/
                            //list[i].is_view = 0;
                        }
                    }


                    listresult.push(list)
                }



            }
            else {
                //return list
            }
        })

        })
    return listresult

}

function nonCompleted(lists) {

    var listresult =[]
    lists.forEach(function(lister) {


            if(lister) {

                     if(lister.campaign_status == 'completed'){
                         lister['is_valide'] = 1
                     }
                     else {

                     }
                listresult.push(lister)

            }

        })
    return listresult
}

function Completedviewed(lists,viewedLists) {

    var listresult =[]
    lists.forEach(function(lister) {


            if(lister) {

                     if(lister.campaign_status == 'completed'){

                         viewedLists.forEach(function (viewLister) {

                             if (lister.uuid == viewLister.uuid) {

                                 lister.is_view = 1

                                 if (viewLister.Expired_date < new Date()) {
                                     lister['is_valide'] = 1
                                     lister.is_valide = 1

                                 }
                                 else {
                                     lister['is_valide'] = 0
                                     lister.is_valide = 0
                                 }

                                 listresult.push(lister)
                             }
                             else {
                                        if (lister.is_view == 1) {
                                        }
                                        else {
                                            lister.is_view = 0;
                                        }
                             }
                         })

                     }
                     else {
                         listresult.push(lister)
                     }
            }
        })
    return listresult
}






/*** ==========> Specific Home page Campaign  API functions <===========***/

exports.specificHomepage = function (request, response) {

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

                        console.log(campaign.campaign_status,'Specific campaign checking')

                        if((campaign.campaign_status == 'active'  || campaign.campaign_status == 'completed' )) {

                            console.log('Specific campaign ACtive  or completed')

                            clickDB.find({campaign: request.body.campaign_id,}, function (err2, clickCount) {

                                if (err2) {
                                    senderror("Campaign Not found.", response);
                                    return;
                                }
                                else {

                                    if(campaign.is_weband == 1){

                                        console.log(clickCount.length ,'clicksss',campaign.weband_clicks * 2 )

                                        if (clickCount.length >= (campaign.weband_clicks * 2)) {

                                            console.log('if caseeee')

                                            db.update({_id: request.body.campaign_id}, {$set: {is_android_view: false}}, function (errors, updatedData) {

                                                if (errors || !updatedData) {

                                                    senderror("This Campaign Just Now Expired ", response);
                                                    return;
                                                }
                                                else {
                                                    senderror("This Campaign Just Now Expired ", response);
                                                    return;
                                                }

                                            })
                                        }
                                        else if ((clickCount.length + 1) == (campaign.weband_clicks * 2)) {

                                            clickDB.findOne({
                                                campaign: request.body.campaign_id,
                                                user: request.body.user_id
                                            }, function (err3, userclick) {

                                                if (userclick) {

                                                    response.json({status: 'success', data: {result: campaign}})
                                                }
                                                else {

                                                    var clickCampaign = new clickDB();

                                                    clickCampaign.campaign = request.body.campaign_id
                                                    clickCampaign.user = request.body.user_id
                                                    clickCampaign.type = campaign.type
                                                    clickCampaign.user_details = data.user_track_details,
                                                        clickCampaign.device_platform = data.device_platform

                                                    clickDB.create(clickCampaign, function (errors, createClickedUser) {
                                                        if (errors) {

                                                            response.json({status: 'success', data: {result: campaign}})
                                                        }
                                                        else {

                                                            view.find({campaign: request.body.campaign_id}).populate('user').exec(function (errs1, viewCount) {

                                                                if (errs1) {
                                                                    senderror("Campaign view Not found.", response);
                                                                    return;

                                                                } else {
                                                                    if (campaign.clicks <= viewCount.length) {

                                                                        senderror("This Campaign Just Now Expired ", response);
                                                                        return;
                                                                    }

                                                                    else {


                                                                        db.update({_id: request.body.campaign_id}, {$set: {is_weband_view: false}}, function (errors, updatedData) {

                                                                        })

                                                                        response.json({
                                                                            status: 'success',
                                                                            data: {result: campaign}
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }

                                                    })


                                                }

                                            })


                                        }

                                        else {
                                            console.log('else caseeee')

                                            /* db.update({_id: request.body.campaign_id}, {$set: {is_android_view: false}}, function (errors, updatedData) {

                                             if (errors || !updatedData) {

                                             senderror("This Campaign Just Now Expired ", response);
                                             return;
                                             }
                                             else {
                                             senderror("This Campaign Just Now Expired ", response);
                                             return;
                                             }

                                             })*/
                                            clickDB.findOne({
                                                campaign: request.body.campaign_id,
                                                user: request.body.user_id
                                            }, function (err3, userclick) {

                                                if (userclick) {
                                    console.log('11111111')
                                                    response.json({status: 'success', data: {result: campaign}})
                                                }
                                                else {
                                                    console.log('222222')
                                                    var clickCampaign = new clickDB();

                                                    clickCampaign.campaign = request.body.campaign_id
                                                    clickCampaign.user = request.body.user_id
                                                    clickCampaign.type = campaign.type
                                                    clickCampaign.user_details = data.user_track_details,
                                                        clickCampaign.device_platform = data.device_platform

                                                    clickDB.create(clickCampaign, function (errors, createClickedUser) {
                                                        if (errors) {

                                                            response.json({status: 'success', data: {result: campaign}})
                                                        }
                                                        else {

                                                            view.find({campaign: request.body.campaign_id}).populate('user').exec(function (errs1, viewCount) {

                                                                if (errs1) {
                                                                    senderror("Campaign view Not found.", response);
                                                                    return;

                                                                } else {
                                                                    if (campaign.clicks <= viewCount.length) {

                                                                        senderror("This Campaign Just Now Expired ", response);
                                                                        return;
                                                                    }

                                                                    else {


                                                                        /* db.update({_id: request.body.campaign_id}, {$set: {is_android_view: false}}, function (errors, updatedData) {

                                                                         })*/




                                                                        response.json({
                                                                            status: 'success',
                                                                            data: {result: campaign}
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }

                                                    })


                                                }

                                            })


                                        }
                                    }

                                    else if(campaign.is_android == 1){
                                        console.log(clickCount.length,'else1',campaign.weband_clicks)

                                        if (clickCount.length < (campaign.android_clicks * 2)) {

                                            clickDB.findOne({
                                                campaign: request.body.campaign_id,
                                                user: request.body.user_id
                                            }, function (err3, userclick) {

                                                if (userclick) {
                                                    console.log('send click',campaign)

                                                    response.json({status: 'success', data: {result: campaign}})
                                                }
                                                else {
                                                    console.log('create click')
                                                    var clickCampaign = new clickDB();

                                                    clickCampaign.campaign = request.body.campaign_id
                                                    clickCampaign.user = request.body.user_id
                                                    clickCampaign.type = campaign.type
                                                    clickCampaign.user_details = data.user_track_details,
                                                        clickCampaign.device_platform = data.device_platform

                                                    clickDB.create(clickCampaign, function (errors, createClickedUser) {
                                                        if (errors) {

                                                            response.json({status: 'success', data: {result: campaign}})
                                                        }
                                                        else {

                                                            console.log('create click su')

                                                            view.find({campaign: request.body.campaign_id}).populate('user').exec(function (errs1, viewCount) {

                                                                if (errs1) {
                                                                    senderror("Campaign view Not found.", response);
                                                                    return;

                                                                } else {
                                                                    if (campaign.clicks <= viewCount.length) {

                                                                        senderror("This Campaign Just Now Expired ", response);
                                                                        return;
                                                                    }

                                                                    else {


                                                                        console.log('create click send')


                                                                        response.json({
                                                                            status: 'success',
                                                                            data: {result: campaign}
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }

                                                    })


                                                }

                                            })


                                        }

                                        else {

                                            console.log('else 122')

                                            db.update({_id: request.body.campaign_id}, {$set: {is_weband_view: false}}, function (errors, updatedData) {

                                                if (errors || !updatedData) {

                                                    senderror("This Campaign Just Now Expired ", response);
                                                    return;
                                                }
                                                else {
                                                    senderror("This Campaign Just Now Expired ", response);
                                                    return;
                                                }

                                            })


                                        }

                                    }


                                    else {


                                        response.json({status: 'success', data: {result: campaign}})
                                    }


                                }

                            })
                        }

                        else {

                            console.log('else Activeeee || Completed')
                            senderror("This Campaign Just Now Expired ", response);
                            return;
                        }

                        /*view.find({campaign: request.body.campaign_id}).populate('user').exec(function (err1, viewCount) {

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
                         })*/

                    }
                });
            }
        })
    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }
}


/*** ==========> complete Home page Campaign API functions <===========***/

exports.completeHomepageCampaign = function (request, res) {

    try {

        user.findById(request.body.user_id, function (err, userdoc) {

            if (err || !userdoc) {

                senderror("User Not found.", res);
                return;

            } else {

                var data = userdoc.toJSON();
                var walletamount = data['wallet'];
                //walletamount = Math.ceil(walletamount);

                if ((data.blocked == '1') || (data.blocked == 1)) {

                    res.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if ((data.verified == '0') || (data.verified == 0)) {

                    res.send(JSON.stringify({status: 'verify', data: {result: data._id}}));
                    return;
                }

                db.findOne({_id:request.body.campaign_id}, function (err, doc) {

                    if (err || !doc) {

                        senderror("Campaign Not found.", res);
                        return;

                    }
                    else {

                        var campaign = doc;
                        var camId = request.body.campaign_id
                        var costtouser = Math.ceil(campaign['android_cost']);

                        console.log(walletamount,'walletold')
                        walletamount = Math.ceil(walletamount) + Math.ceil(costtouser);

                        console.log(costtouser,'costuser')
                        console.log(walletamount,'wallet')
                        if(campaign.campaign_status == 'active'){

                            var date = new Date();
                            date = date.setMinutes (date.getMinutes() + 1440 );

                            var campaignview = new view();
                            campaignview.uuid = campaign.uuid;
                            campaignview.campaign = request.body.campaign_id;
                            campaignview.user = request.body.user_id;
                            campaignview.device_platform = data.device_platform;
                            campaignview.Expired_date = date
                            campaignview.type = campaign.type




                            view.find({campaign: request.body.campaign_id,uuid:campaign.uuid}).populate('user').exec(function (err1, viewTotalCount) {

                                if (err1) {

                                    senderror("Campaign view Not found.", res);
                                    return;

                                } else {

                                    console.log('complete 1')

                                    if(viewTotalCount.length  >=  campaign.clicks){

                                        senderror("This Campaign Just Now Expired ", res);
                                        return;

                                    }
                                    else if((campaign.clicks) ==  (viewTotalCount.length + 1 )){
                                        console.log('complete 12')

                                        if(campaign.is_android == 1) {
                                            console.log('complete a 1')
                                            view.find({
                                                campaign: request.body.campaign_id,
                                                device_platform: data.device_platform,
                                                uuid: campaign.uuid
                                            }).populate('user').exec(function (err1, viewDeviceCount)
                                            {

                                                if (err1) {

                                                    senderror("Campaign view Not found.", res);
                                                    return;

                                                } else {


                                                    if(viewDeviceCount.length >= campaign.android_clicks){

                                                        senderror("This Campaign Just Now Expired ", res);
                                                        return;
                                                    }
                                                    else if((viewDeviceCount.length + 1) == campaign.android_clicks){


                                                        if((campaign.clicks) ==  (viewTotalCount.length + 1 )){

                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
                                                                'user': request.body.user_id
                                                            }).sort('-updated_at').exec(function (error, viewUserClick)
                                                            {
                                                                if (error || !viewUserClick) {

                                                                    view.create(campaignview, function (err, viwdoc) {

                                                                        if (viwdoc){

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                            db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',is_android:0,end_date:new Date()}}, function (error, upCam) {

                                                                                if (error) {

                                                                                    senderror("Campaign view Not found.", response);

                                                                                } else {

                                                                                    db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                                                                                        if (adverDoc) {

                                                                                            var options = {
                                                                                                method: 'POST',
                                                                                                uri: config.completeEmailUrl,
                                                                                                body: {
                                                                                                    campaign_id: request.body.campaign_id,

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
                                                                                                                data: {result:{wallet:user.wallet}}
                                                                                                            }));
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
                                                                            }));
                                                                        }


                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }));
                                                                }
                                                            })



                                                        } else {
                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
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

                                                                                accountHistory(request.body.user_id,request.body.campaign_id,costtouser)


                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {

                                                                                        db.update({_id: request.body.campaign_id}, {$set: {is_android: 0}}, function (errors, updatedData) {

                                                                                            if (errors || !updatedData) {

                                                                                                senderror("This Campaign Just Now Expired ", res);
                                                                                                return;
                                                                                            }
                                                                                            else {




                                                                                                res.setHeader('Content-Type', 'application/json');

                                                                                                res.send(JSON.stringify({
                                                                                                    status: 'success',
                                                                                                    data: {result:{wallet:user.wallet}}
                                                                                                }));
                                                                                            }

                                                                                        })




                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }))
                                                                }
                                                            })


                                                        }


                                                    }
                                                    else {
                                                        view.findOne({
                                                            'campaign': request.body.campaign_id,
                                                            'user': request.body.user_id
                                                        }).sort('-updated_at').exec(function (error, viewdoc)
                                                        {

                                                            if (error || !viewdoc) {

                                                                view.create(campaignview, function (err, doc) {

                                                                    user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                                        if (err) {
                                                                            senderror("User not found", res);
                                                                            return;
                                                                        }
                                                                        else {

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                            user.findById(request.body.user_id, function (err, user) {
                                                                                if (err) {
                                                                                    senderror("User not found", res);
                                                                                    return;
                                                                                } else {
                                                                                    res.setHeader('Content-Type', 'application/json');

                                                                                    res.send(JSON.stringify({
                                                                                        status: 'success',
                                                                                        data: {result:{wallet:user.wallet}}
                                                                                    }));
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                });

                                                            } else {

                                                                res.send(JSON.stringify({
                                                                    status: 'success',
                                                                    message: 'view campaigns'
                                                                }))
                                                            }
                                                        })

                                                    }

                                                }


                                            })

                                        }
                                        else if(campaign.is_weband == 1) {
                                            console.log('complete wa 1')
                                            view.find({
                                                campaign: request.body.campaign_id,
                                                $or: [{device_platform: data.device_platform}, {device_platform: 'web'}],
                                                uuid: campaign.uuid
                                            }).populate('user').exec(function (err1, viewDeviceCount)
                                            {

                                                if (err1) {

                                                    senderror("Campaign view Not found.", res);
                                                    return;

                                                } else {


                                                    if(viewDeviceCount.length >= campaign.weband_clicks){

                                                        senderror("This Campaign Just Now Expired ", res);
                                                        return;
                                                    }
                                                    else if((viewDeviceCount.length + 1) == campaign.weband_clicks){


                                                        if((campaign.clicks) ==  (viewTotalCount.length + 1 )){

                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
                                                                'user': request.body.user_id
                                                            }).sort('-updated_at').exec(function (error, viewUserClick)
                                                            {
                                                                if (error || !viewUserClick) {

                                                                    view.create(campaignview, function (err, viwdoc) {

                                                                        if (viwdoc){

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                            db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',is_weband: 0,end_date:new Date()}}, function (error, upCam) {

                                                                                if (error) {

                                                                                    senderror("Campaign view Not found.", res);

                                                                                } else {

                                                                                    db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                                                                                        if (adverDoc) {

                                                                                            var options = {
                                                                                                method: 'POST',
                                                                                                uri: config.completeEmailUrl,
                                                                                                body: {
                                                                                                    campaign_id: request.body.campaign_id,

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
                                                                                                                data: {result:{wallet:user.wallet}}
                                                                                                            }));
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
                                                                            }));
                                                                        }


                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }));
                                                                }
                                                            })



                                                        } else {

                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
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

                                                                                accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {
                                                                                        db.update({_id: request.body.campaign_id}, {$set: {is_weband: 0}}, function (errors, updatedData) {

                                                                                            if (errors || !updatedData) {

                                                                                                senderror("This Campaign Just Now Expired ", res);
                                                                                                return;
                                                                                            }
                                                                                            else {
                                                                                                res.setHeader('Content-Type', 'application/json');

                                                                                                res.send(JSON.stringify({
                                                                                                    status: 'success',
                                                                                                    data: {result:{wallet:user.wallet}}
                                                                                                }));
                                                                                            }

                                                                                        })

                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }))
                                                                }
                                                            })


                                                        }


                                                    }
                                                    else {
                                                        view.findOne({
                                                            'campaign': request.body.campaign_id,
                                                            'user': request.body.user_id
                                                        }).sort('-updated_at').exec(function (error, viewdoc)
                                                        {

                                                            if (error || !viewdoc) {

                                                                view.create(campaignview, function (err, doc) {

                                                                    user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                                        if (err) {
                                                                            senderror("User not found", res);
                                                                            return;
                                                                        }
                                                                        else {

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                            user.findById(request.body.user_id, function (err, user) {
                                                                                if (err) {
                                                                                    senderror("User not found", res);
                                                                                    return;
                                                                                } else {
                                                                                    res.setHeader('Content-Type', 'application/json');

                                                                                    res.send(JSON.stringify({
                                                                                        status: 'success',
                                                                                        data: {result:{wallet:user.wallet}}
                                                                                    }));
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                });

                                                            } else {

                                                                res.send(JSON.stringify({
                                                                    status: 'success',
                                                                    message: 'view campaigns'
                                                                }))
                                                            }
                                                        })

                                                    }

                                                }


                                            })

                                        }
                                        else {
                                            console.log('complete else 1')
                                            senderror("This Campaign Just Now Expired ", res);
                                            return;

                                        }


                                    }
                                    else {

                                        if(campaign.is_android == 1) {
                                            console.log('complete a 12')
                                            view.find({
                                                campaign: request.body.campaign_id,
                                                device_platform: data.device_platform,
                                                uuid: campaign.uuid
                                            }).populate('user').exec(function (err1, viewDeviceCount)
                                            {

                                                if (err1) {

                                                    senderror("Campaign view Not found.", res);
                                                    return;

                                                } else {


                                                    if(viewDeviceCount.length >= campaign.android_clicks){

                                                        senderror("This Campaign Just Now Expired ", res);
                                                        return;
                                                    }
                                                    else if((viewDeviceCount.length + 1) == campaign.android_clicks){
                                                        console.log('complete a 12 + 1')

                                                        if((campaign.clicks) ==  (viewTotalCount.length + 1 )){

                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
                                                                'user': request.body.user_id
                                                            }).sort('-updated_at').exec(function (error, viewUserClick)
                                                            {
                                                                if (error || !viewUserClick) {

                                                                    view.create(campaignview, function (err, viwdoc) {

                                                                        if (viwdoc){

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)


                                                                            db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',is_android:0,end_date:new Date()}}, function (error, upCam) {

                                                                                if (error) {

                                                                                    senderror("Campaign view Not found.", res);

                                                                                } else {

                                                                                    db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                                                                                        if (adverDoc) {

                                                                                            var options = {
                                                                                                method: 'POST',
                                                                                                uri: config.completeEmailUrl,
                                                                                                body: {
                                                                                                    campaign_id: request.body.campaign_id,

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
                                                                                                                data: {result:{wallet:user.wallet}}
                                                                                                            }));
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
                                                                            }));
                                                                        }


                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }));
                                                                }
                                                            })



                                                        } else {

                                                            console.log('else coplete a 12')

                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
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

                                                                                accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {

                                                                                        db.update({_id: request.body.campaign_id}, {$set: {is_android: 0}}, function (errors, updatedData) {

                                                                                            if (errors || !updatedData) {

                                                                                                senderror("This Campaign Just Now Expired ", res);
                                                                                                return;
                                                                                            }
                                                                                            else {

                                                                                                console.log('User Earned')
                                                                                                res.setHeader('Content-Type', 'application/json');

                                                                                                res.send(JSON.stringify({
                                                                                                    status: 'success',
                                                                                                    data: {result:{wallet:user.wallet}}
                                                                                                }));
                                                                                            }

                                                                                        })




                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }))
                                                                }
                                                            })


                                                        }


                                                    }
                                                    else {
                                                        console.log('else holeeee complete a 12')
                                                        view.findOne({
                                                            'campaign': request.body.campaign_id,
                                                            'user': request.body.user_id
                                                        }).sort('-updated_at').exec(function (error, viewdoc)
                                                        {

                                                            if (error || !viewdoc) {

                                                                view.create(campaignview, function (err, doc) {

                                                                    user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                                        if (err) {
                                                                            senderror("User not found", res);
                                                                            return;
                                                                        }
                                                                        else {

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)


                                                                            user.findById(request.body.user_id, function (err, user) {
                                                                                if (err) {
                                                                                    senderror("User not found", res);
                                                                                    return;
                                                                                } else {
                                                                                    res.setHeader('Content-Type', 'application/json');

                                                                                    console.log('user Earne Success fully')
                                                                                    res.send(JSON.stringify({
                                                                                        status: 'success',
                                                                                        data: {result:{wallet:user.wallet}}
                                                                                    }));
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                });

                                                            } else {

                                                                console.log('user Earned Success fully')

                                                                res.send(JSON.stringify({
                                                                    status: 'success',
                                                                    message: 'view campaigns'
                                                                }))
                                                            }
                                                        })

                                                    }

                                                }


                                            })

                                        }
                                        else if(campaign.is_weband == 1) {
                                            console.log('complete wa 12')
                                            view.find({
                                                campaign: request.body.campaign_id,
                                                $or: [{device_platform: data.device_platform}, {device_platform: 'web'}],
                                                uuid: campaign.uuid
                                            }).populate('user').exec(function (err1, viewDeviceCount)
                                            {

                                                if (err1) {

                                                    senderror("Campaign view Not found.", response);
                                                    return;

                                                } else {

                                                    console.log('wa complete 1')

                                                    if(viewDeviceCount.length >= campaign.weband_clicks){

                                                        senderror("This Campaign Just Now Expired ", res);
                                                        return;
                                                    }
                                                    else if((viewDeviceCount.length + 1) == campaign.weband_clicks){

                                                        console.log('wa complete 12')
                                                        if((campaign.clicks) ==  (viewTotalCount.length + 1 )){
                                                            console.log('wa complete 13')
                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
                                                                'user': request.body.user_id
                                                            }).sort('-updated_at').exec(function (error, viewUserClick)
                                                            {
                                                                if (error || !viewUserClick) {

                                                                    view.create(campaignview, function (err, viwdoc) {

                                                                        if (viwdoc){

                                                                            accountHistory(request.body.user_id,request.body.campaign_id,costtouser)


                                                                            db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',is_weband:0,end_date:new Date()}}, function (error, upCam) {

                                                                                if (error) {

                                                                                    senderror("Campaign view Not found.", res);

                                                                                } else {

                                                                                    db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                                                                                        if (adverDoc) {

                                                                                            var options = {
                                                                                                method: 'POST',
                                                                                                uri: config.completeEmailUrl,
                                                                                                body: {
                                                                                                    campaign_id: request.body.campaign_id,

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
                                                                                                                data: {result:{wallet:user.wallet}}
                                                                                                            }));
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
                                                                            }));
                                                                        }


                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }));
                                                                }
                                                            })



                                                        } else {
                                                            console.log('wa complete else 1')
                                                            view.findOne({
                                                                'campaign': request.body.campaign_id,
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

                                                                                accountHistory(request.body.user_id,request.body.campaign_id,costtouser)


                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {
                                                                                        db.update({_id: request.body.campaign_id}, {$set: {is_weband: 0}}, function (errors, updatedData) {

                                                                                            if (errors || !updatedData) {

                                                                                                senderror("This Campaign Just Now Expired ", res);
                                                                                                return;
                                                                                            }
                                                                                            else {
                                                                                                res.setHeader('Content-Type', 'application/json');

                                                                                                res.send(JSON.stringify({
                                                                                                    status: 'success',
                                                                                                    data: {result:{wallet:user.wallet}}
                                                                                                }));
                                                                                            }

                                                                                        })

                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    });

                                                                } else {

                                                                    res.send(JSON.stringify({
                                                                        status: 'success',
                                                                        message: 'view campaigns'
                                                                    }))
                                                                }
                                                            })


                                                        }


                                                    }
                                                    else {
                                                        console.log('wa complete else  1')
                                                        view.findOne({
                                                            'campaign': request.body.campaign_id,
                                                            'user': request.body.user_id
                                                        }).sort('-updated_at').exec(function (error, viewdoc)
                                                        {

                                                            if (error || !viewdoc) {

                                                                console.log('wa complete else  12')
                                                                view.create(campaignview, function (createerrs, doc) {

                                                                    if(createerrs){
                                                                        console.log('wa complete else  13')
                                                                        senderror("This Campaign Just Now Expired ", res);
                                                                        return;


                                                                    } else {
                                                                        console.log('wa complete else  14',walletamount)
                                                                        user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, function (err, doc) {
                                                                            if (err) {
                                                                                senderror("User not found", res);
                                                                                return;
                                                                            }
                                                                            else {

                                                                                accountHistory(request.body.user_id,request.body.campaign_id,costtouser)

                                                                                user.findById(request.body.user_id, function (err, user) {
                                                                                    if (err) {
                                                                                        console.log('wa complete else  14')
                                                                                        senderror("User not found", res);
                                                                                        return;
                                                                                    } else {
                                                                                        data = user.toJSON();
                                                                                        console.log('wa complete else  16')
                                                                                        console.log('success','wa complete else  16',data.wallet)
                                                                                        res.send({
                                                                                            status: 'success',
                                                                                            data: {result:{wallet:data.wallet}}
                                                                                        });
                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    }


                                                                });

                                                            } else {

                                                                res.send(JSON.stringify({
                                                                    status: 'success',
                                                                    message: 'view campaigns'
                                                                }))
                                                            }
                                                        })

                                                    }

                                                }


                                            })

                                        }
                                        else {
                                            console.log('complete else 12')
                                            senderror("This Campaign Just Now Expired ", res);
                                            return;

                                        }


                                    }



                                }
                            })


                            /*
                             if(campaign.is_android == 1) {

                             view.find({
                             campaign: request.body.campaign_id,
                             device_platform: data.device_platform,
                             uuid: campaign.uuid
                             }).populate('user').exec(function (err1, viewDeviceCount)
                             {

                             if (err1) {

                             senderror("Campaign view Not found.", response);
                             return;

                             } else {


                             if(viewDeviceCount.length >= campaign.android_clicks){

                             senderror("This Campaign Just Now Expired ", res);
                             return;
                             }
                             else if((viewDeviceCount.length + 1) == campaign.android_clicks){


                             if((campaign.clicks) ==  (viewTotalCount.length + 1 )){

                             view.findOne({
                             'campaign': request.body.campaign_id,
                             'user': request.body.user_id
                             }).sort('-updated_at').exec(function (error, viewUserClick)
                             {
                             if (error || !viewUserClick) {

                             view.create(campaignview, function (err, viwdoc) {

                             if (viwdoc){

                             db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',end_date:new Date()}}, function (error, upCam) {

                             if (error) {

                             senderror("Campaign view Not found.", response);

                             } else {

                             db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                             if (adverDoc) {

                             var options = {
                             method: 'POST',
                             uri: config.completeEmailUrl,
                             body: {
                             campaign_id: request.body.campaign_id,

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
                             data: {result:{wallet:user.wallet}}
                             }));
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
                             }));
                             }


                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }));
                             }
                             })



                             } else {
                             view.findOne({
                             'campaign': request.body.campaign_id,
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

                             db.update({_id: request.body.campaign_id}, {$set: {is_android: 0}}, function (errors, updatedData) {

                             if (errors || !updatedData) {

                             senderror("This Campaign Just Now Expired ", response);
                             return;
                             }
                             else {
                             res.setHeader('Content-Type', 'application/json');

                             res.send(JSON.stringify({
                             status: 'success',
                             data: {result:{wallet:user.wallet}}
                             }));
                             }

                             })




                             }
                             })
                             }
                             });
                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }))
                             }
                             })


                             }


                             }
                             else {
                             view.findOne({
                             'campaign': request.body.campaign_id,
                             'user': request.body.user_id
                             }).sort('-updated_at').exec(function (error, viewdoc)
                             {

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
                             data: {result:{wallet:user.wallet}}
                             }));
                             }
                             })
                             }
                             });
                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }))
                             }
                             })

                             }

                             }


                             })

                             }
                             else if(campaign.is_weband == 1) {

                             view.find({
                             campaign: request.body.campaign_id,
                             $or: [{device_platform: data.device_platform}, {device_platform: 'web'}],
                             uuid: campaign.uuid
                             }).populate('user').exec(function (err1, viewDeviceCount)
                             {

                             if (err1) {

                             senderror("Campaign view Not found.", response);
                             return;

                             } else {


                             if(viewDeviceCount.length >= campaign.weband_clicks){

                             senderror("This Campaign Just Now Expired ", res);
                             return;
                             }
                             else if((viewDeviceCount.length + 1) == campaign.weband_clicks){


                             if((campaign.clicks) ==  (viewTotalCount.length + 1 )){

                             view.findOne({
                             'campaign': request.body.campaign_id,
                             'user': request.body.user_id
                             }).sort('-updated_at').exec(function (error, viewUserClick)
                             {
                             if (error || !viewUserClick) {

                             view.create(campaignview, function (err, viwdoc) {

                             if (viwdoc){

                             db.update({_id: request.body.campaign_id}, {$set: {campaign_status: 'completed',end_date:new Date()}}, function (error, upCam) {

                             if (error) {

                             senderror("Campaign view Not found.", response);

                             } else {

                             db.findOne({_id:request.body.campaign_id}).populate('advertisers').exec(function (err, adverDoc) {

                             if (adverDoc) {

                             var options = {
                             method: 'POST',
                             uri: config.completeEmailUrl,
                             body: {
                             campaign_id: request.body.campaign_id,

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
                             data: {result:{wallet:user.wallet}}
                             }));
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
                             }));
                             }


                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }));
                             }
                             })



                             } else {

                             view.findOne({
                             'campaign': request.body.campaign_id,
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
                             db.update({_id: request.body.campaign_id}, {$set: {is_weband: 0}}, function (errors, updatedData) {

                             if (errors || !updatedData) {

                             senderror("This Campaign Just Now Expired ", response);
                             return;
                             }
                             else {
                             res.setHeader('Content-Type', 'application/json');

                             res.send(JSON.stringify({
                             status: 'success',
                             data: {result:{wallet:user.wallet}}
                             }));
                             }

                             })

                             }
                             })
                             }
                             });
                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }))
                             }
                             })


                             }


                             }
                             else {
                             view.findOne({
                             'campaign': request.body.campaign_id,
                             'user': request.body.user_id
                             }).sort('-updated_at').exec(function (error, viewdoc)
                             {

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
                             data: {result:{wallet:user.wallet}}
                             }));
                             }
                             })
                             }
                             });
                             });

                             } else {

                             res.send(JSON.stringify({
                             status: 'success',
                             message: 'view campaigns'
                             }))
                             }
                             })

                             }

                             }


                             })

                             }
                             else {
                             senderror("This Campaign Just Now Expired ", res);
                             return;

                             }*/

                        }
                        else {
                            senderror("This Campaign Just Now Expired ", res);
                            return;
                        }


                    }
                });
            }
        })

    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", res);
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
    res.json({status: 'failure', message: msg});
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