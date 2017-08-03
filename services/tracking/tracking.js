
var db = require('./../../model/user');
var bannerDB = require('./../../model/banner')
var deviceTrackDB = require('./../../model/device _tracking');
var userTrackDB = require('./../../model/user-tracking');
var userActivityDB = require('./../../model/user-activity');
var campaignDb = require('./../../model/campaign');
var viewDb = require('./../../model/campaignview');
var userHistory = require('./../../model/user-history');
var referral = require('./../../model/referral');
var db_master = require('./../../model/master');
var view = require('./../../model/campaignview');
var config = require('./../../controllers/conf');
var Notify = require('../../services/notifications/notification');
var _ = require('lodash');




exports.user_tracking = function (request,response) {

    try {

    console.log('user tracking',request.body.user_id)

        if (request.body.user_id) {

            db.findOne({_id: request.body.user_id}, function (error, userData) {

                if (error || !userData) {
                    console.log('s')
                    return senderror("User not founds", response);
                }
                else {

                 //   var user = userData
                    console.log(userData.user_track_details)
                    userTrackDB.findOne({_id: userData.user_track_details}, function (Err, userTracks) {

                        if (Err || !userTracks) {

                            db.findByIdAndUpdate(request.body.user_id, {$set: request.body}, function (err, doc) {

                                if (err || !doc) {

                                    senderror("User not found. Please enter valid user details.", response);

                                    return;
                                }
                                else {

                                    var user = doc
                                    var track = new userTrackDB();

                                    delete user['_id'];
                                    delete user['updated_at'];
                                    /*track = user;*/
                                  //  track.track_id = userTracks.length + 1
                                    track.user = request.body.user_id;
                                    track.full_name = user.full_name
                                    track.email = user.email
                                    track.mobile = user.mobile
                                    track.password = user.password
                                    track.online = user.online
                                    track.image = user.image
                                    track.state = user.state
                                    track.city = user.city
                                    track.town = user.town
                                    track.current_location = user.current_location
                                    track.latitude = user.latitude
                                    track.longitude = user.longitude
                                    track.dob = user.dob
                                    track.gender = user.gender
                                    track.age = user.age
                                    track.marital_status = user.marital_status
                                    track.profession = user.profession
                                    track.verification_code = user.verification_code
                                    track.verified = user.verified
                                    track.blocked = user.blocked
                                    track.facebook_id = user.facebook_id
                                    track.google_id = user.google_id
                                    track.login_platform = user.login_platform
                                    track.referral_code = user.referral_code
                                    track.referred_by = user.referred_by
                                    track.device_id = user.device_id
                                    track.push_token = user.push_token
                                    track.device_type = user.device_type
                                    track.app_version = user.app_version
                                    track.os_version = user.os_version
                                    track.ip_address = user.ip_address
                                    track.screen_resolution = user.screen_resolution
                                    track.device_manufacturer = user.device_manufacturer
                                    track.device_platform = user.device_platform
                                    track.os_name = user.os_name
                                    track.sdk_version = user.sdk_version
                                    track.register_date = user.register_date
                                    track.verified_date = user.verified_date
                                    track.wallet = user.wallet
                                    track.install_from = user.install_from


                                    console.log(track)


                                    userTrackDB.create(track, function (createErr, createtrack) {

                                        if (createErr) {

                                            return senderror("Userc not found", response);
                                        }
                                        else {

                                            db.update({_id: request.body.user_id}, {$set: {user_track_details: track._id}}, function (Uperr, updated) {

                                                if (Uperr) {

                                                    return senderror("User not found", response);
                                                }
                                                else {
                                                    db.findOne({_id: request.body.user_id},config.projection, function (error, usersDetail) {

                                                        if(error)
                                                        {
                                                            return senderror("User not found", response);
                                                        }
                                                        else {

                                                            sendUserDetails(usersDetail,response)

                                                        }
                                                    })

                                                }
                                            })


                                        }
                                    })

                                }
                            })
                        }
                        else {


                         //   console.log(userTracks)


                            if((userTracks.device_platform == userData.device_platform) && (userTracks.mobile == userData.mobile) && (userTracks.unique_id == userData.unique_id) && (userTracks.latitude == userData.latitude) && (userTracks.longitude == userData.longitude) ){


                                sendUserDetails(userData,response)

                            }
                            else {

                                db.findByIdAndUpdate(request.body.user_id, {$set: request.body}, function (err, doc) {

                                    if (err || !doc) {

                                        senderror("User not found. Please enter valid user details.", response);

                                        return;
                                    }
                                    else {

                                        var user = doc
                                        var track = new userTrackDB();

                                        delete user['_id'];
                                        delete user['updated_at'];
                                        /*track = user;*/
                                        track.track_id = userTracks.length + 1
                                        track.user = request.body.user_id;
                                        track.full_name = user.full_name
                                        track.email = user.email
                                        track.mobile = user.mobile
                                        track.password = user.password
                                        track.online = user.online
                                        track.image = user.image
                                        track.state = user.state
                                        track.city = user.city
                                        track.town = user.town
                                        track.current_location = user.current_location
                                        track.latitude = user.latitude
                                        track.longitude = user.longitude
                                        track.dob = user.dob
                                        track.gender = user.gender
                                        track.age = user.age
                                        track.marital_status = user.marital_status
                                        track.profession = user.profession
                                        track.verification_code = user.verification_code
                                        track.verified = user.verified
                                        track.blocked = user.blocked
                                        track.facebook_id = user.facebook_id
                                        track.google_id = user.google_id
                                        track.login_platform = user.login_platform
                                        track.referral_code = user.referral_code
                                        track.referred_by = user.referred_by
                                        track.device_id = user.device_id
                                        track.push_token = user.push_token
                                        track.device_type = user.device_type
                                        track.app_version = user.app_version
                                        track.os_version = user.os_version
                                        track.ip_address = user.ip_address
                                        track.screen_resolution = user.screen_resolution
                                        track.device_manufacturer = user.device_manufacturer
                                        track.device_platform = user.device_platform
                                        track.os_name = user.os_name
                                        track.sdk_version = user.sdk_version
                                        track.register_date = user.register_date
                                        track.verified_date = user.verified_date
                                        track.wallet = user.wallet
                                        track.install_from = user.install_from


                                        console.log(track)


                                        userTrackDB.create(track, function (createErr, createtrack) {

                                            if (createErr) {

                                                return senderror("Userc not found", response);
                                            }
                                            else {

                                                db.update({_id: request.body.user_id}, {$set: {user_track_details: track._id}}, function (Uperr, updated) {

                                                    if (Uperr) {

                                                        return senderror("User not found", response);
                                                    }
                                                    else {
                                                        db.findOne({_id: request.body.user_id},config.projection, function (error, usersDetail) {

                                                            if(error)
                                                            {
                                                                return senderror("User not found", response);
                                                            }
                                                            else {

                                                                sendUserDetails(usersDetail,response)

                                                            }
                                                        })

                                                    }
                                                })


                                            }
                                        })

                                    }
                                })

                            }

                        }

                    })

                }

            })

        }
        else {

        }
    }
    catch (err) {

        return senderror("Somethings went wrong. Please try again", response);

    }
}

exports.activity_tracking = function (request,response) {

    try {
     /*console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++')
        console.log(request.body)
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++')*/
        if (request.body.user_id) {

            db.findOne({_id: request.body.user_id}, function (err, userData) {

                if (err || !userData) {
                    var activity = new userActivityDB()

                    activity.response = [request.body.response]
                    activity.request = [request.body.request]
                    activity.event = request.body.event
                    activity.screen_name = request.body.screen_name
                    activity.created_by = request.body.created_by
                    activity.type = request.body.type
                    activity.source = request.body.source
                    activity.source1 = request.body.source1
                    activity.source2 = request.body.source2
                    activity.source3 = request.body.source3
                    activity.source4 = request.body.source4
                    activity.source5 = request.body.source5


                    userActivityDB.create(activity, function (error, createActivity) {

                        if (error) {
                            senderror("User not found", response);
                            return
                        }
                        else {

                            response.json({status: 'success'});

                        }

                    })
                }
                else {


                    var activity = new userActivityDB()

                    activity.user_detail = userData.user_track_details;
                    activity.user = request.body.user_id
                    activity.response = [request.body.response]
                    activity.request = [request.body.request]
                    activity.event = request.body.event
                    activity.screen_name = request.body.screen_name
                    activity.created_by = request.body.created_by
                    activity.type = request.body.type
                    activity.source = request.body.source
                    activity.source1 = request.body.source1
                    activity.source2 = request.body.source2
                    activity.source3 = request.body.source3
                    activity.source4 = request.body.source4
                    activity.source5 = request.body.source5


                    userActivityDB.create(activity, function (error, createActivity) {

                        if (error) {
                            senderror("User not found", response);
                            return
                        }
                        else {


                            walletNotification(userData,request.body.user_id,userData.wallet,response)

                            /*response.json({status: 'success'});*/

                        }

                    })

                }

            })

        }
        else {

            if (request.body.email) {

                db.findOne({$or: [{'email': request.body.email}, {'mobile': request.body.email}]}, function (err, userData) {

                    if (err || !userData) {

                        var activity = new userActivityDB()

                        activity.response = [request.body.response]
                        activity.request = [request.body.request]
                        activity.event = request.body.event
                        activity.screen_name = request.body.screen_name
                        activity.created_by = request.body.created_by
                        activity.type = request.body.type
                        activity.source = request.body.source
                        activity.source1 = request.body.source1
                        activity.source2 = request.body.source2
                        activity.source3 = request.body.source3
                        activity.source4 = request.body.source4
                        activity.source5 = request.body.source5


                        userActivityDB.create(activity, function (error, createActivity) {

                            if (error) {
                                senderror("User not found", response);
                                return
                            }
                            else {

                                response.json({status: 'success'});

                            }

                        })
                    }
                    else {

                        var activity = new userActivityDB()

                        activity.user_detail = userData.user_track_details;
                        activity.user = userData._id
                        activity.response = [request.body.response]
                        activity.request = [request.body.request]
                        activity.event = request.body.event
                        activity.screen_name = request.body.screen_name
                        activity.created_by = request.body.created_by
                        activity.type = request.body.type
                        activity.source = request.body.source
                        activity.source1 = request.body.source1
                        activity.source2 = request.body.source2
                        activity.source3 = request.body.source3
                        activity.source4 = request.body.source4
                        activity.source5 = request.body.source5


                        userActivityDB.create(activity, function (error, createActivity) {

                            if (error) {
                                senderror("User not found", response);
                                return
                            }
                            else {

                                walletNotification(userData,request.body.user_id,userData.wallet,response)

                                /*response.json({status: 'success'});*/

                            }

                        })


                    }
                })

            }
            else
            {
                var activity = new userActivityDB()

                activity.response = [request.body.response]
                activity.request = [request.body.request]
                activity.event = request.body.event
                activity.screen_name = request.body.screen_name
                activity.created_by = request.body.created_by
                activity.type = request.body.type
                activity.source = request.body.source
                activity.source1 = request.body.source1
                activity.source2 = request.body.source2
                activity.source3 = request.body.source3
                activity.source4 = request.body.source4
                activity.source5 = request.body.source5


                userActivityDB.create(activity, function (error, createActivity) {

                    if (error) {
                        senderror("User not found", response);
                        return
                    }
                    else {

                        response.json({status: 'success'});

                    }

                })
            }
        }
    }
    catch(err){

        return senderror("Somethings went wrong. Please try again", response);

    }
}

exports.device_tracking = function (request,response) {

    try {

        if(request.body.sdk_version) {

            if((request.body.sdk_version == 24) || (request.body.sdk_version == 25)){

                request.body.os_name = 'Nougat'
            }
            else if(request.body.sdk_version == 23){

                request.body.os_name = 'Marshmallow'

            }
            else if((request.body.sdk_version == 22) || (request.body.sdk_version == 21)){

                request.body.os_name = 'Lollipop'

            }
            else if(request.body.sdk_version == 19){

                request.body.os_name = 'KitKat'

            }
            else if((request.body.sdk_version == 18) || (request.body.sdk_version == 17) || (request.body.sdk_version == 16)){

                request.body.os_name = 'Jelly Bean'

            }

            else {

                request.body.os_name = 'Below Jelly Bean'

            }

        }




        var device = new deviceTrackDB(request.body)


        deviceTrackDB.findOne({unique_id:device.unique_id},function (error,findData) {

            if(findData){
                console.log('Device already installed')
                response.json({status:'success',message:'Device already installed'})
            }
            else {
                deviceTrackDB.create(device,function (err,deviceData) {

                    if(err || !deviceData){

                        response.json({status:'success',message:'Device track not created'})
                    }
                    else {
                        console.log('success')
                        response.json({status:'success',message:'success'})

                    }

                })
            }

        })








    }
    catch(err){

        return senderror("Something went wrong. Please try again", response);

    }
}


/**** Common method function Start here ****/

function senderror(msg, res) {
        res.setHeader('Content-Type', 'application/json');
        res.json({status: 'failure', message: msg});
    }

function sendUserDetails(doc, res) {
    var data = doc.toJSON();
    res.json({status:'success',data:{result:data}});
}

function walletNotification(userData,user_id,wallet,res){

    var result =[]
    var data =userData

    viewDb.find({user: user_id}).exec(function (err, viewList) {

        if (err || !viewList) {

            senderror("No Campaigns Available.", res);

            return;

        } else {
            campaignDb.find({
                type: { $in: config.notificationList },
                campaign_status: 'active',
                campaign_platform:{$elemMatch:{$eq:data.device_platform}},
                //$or: [{'is_android_view': true}, {'is_weband_view': true}],
                campaign_platform:{$elemMatch:{$eq:data.device_type}},
                $and:[{$or: [{'campaign_town': data.town}, {'campaign_town': 'all'}]},{$or: [{'profession': data.profession}, {'profession': 'all'}]}],
                campaign_marital_status:{$elemMatch:{$eq:data.marital_status}},
                campaign_gender:{$elemMatch:{$eq:data.gender}}
            }).sort({updated_at: 1}).exec(function (err, list) {

                if (err || !list) {

                    senderror("User Not found.", res);

                    return;

                } else {
                    if (list.length != 0) {

                        if (viewList.length != 0) {

                             result = _.differenceBy(list, viewList, 'uuid');

                            res.json({
                                status: 'success',
                                data: {result: {wallet:wallet,notify:result.length}}
                            })

                        }
                        else {

                            res.json({
                                status: 'success',
                                data: {result: {wallet:wallet,notify:list.length}}

                            })

                        }
                    }
                    else {

                        res.json({
                            status: 'success',
                            data: {result: {wallet:wallet,notify:list.length}}
                        })

                    }
                }
            });
        }
    });



}




