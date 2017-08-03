/**
 * Created by sabash ls on 01/11/16.
 */

var db = require('./../../model/user');
var accountHistoryDB = require('./../../model/account_history');
var deviceTrackDB = require('./../../model/device _tracking');
var userTrackDB = require('./../../model/user-tracking');
var userActivityDB = require('./../../model/user-activity');
var userHistory = require('./../../model/user-history');
var referral = require('./../../model/referral');
var masterDB = require('./../../model/master');
var view = require('./../../model/campaignview');
var config = require('./../../controllers/conf');
var Notify = require('../../services/notifications/notification');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var async = require('async')

// var Notify = require('./../../controllers/notification');
var curl = require('curlrequest');
var fs = require("fs");
var crypto = require('crypto');

var express = require('express');
var app = express();

var _ = require('underscore');

var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');


var us = require('underscore')

var randomstring = require("randomstring");
var random = randomstring.generate({
    length: 6,
    charset: 'alphanumeric',
    capitalization: 'uppercase'
});


var transporter = nodemailer.createTransport("SMTP", {

    service: 'gmail',
    debug: true,
    auth: {
        user: 'noreply@sash.cash',
        pass: 'sash@cash123'
    }
});

var redis = require("redis"),
    client = redis.createClient();



var fs = require("fs");

var logger = require('./../../lib/logger')
var userValidation = require('./../../utils')




/**====================> Promise call back function <====================**/

exports.promise = function (request, response) {

    logger.info(request.body.user_id)


    var promise = db.findOne({ _id: request.body.user_id }).exec();

    promise.then(function (userData) {
        logger.info(userData);

        return db.findByIdAndUpdate(userData._id, {
            $set: {
                full_name: "dummy"
            }
        });

    }).then(function (user) {
        console.log('updated user: ' + user.full_name);
        throw new Error("test error")
        // do something with updated user
    }).catch(function (err) {
        // just need one of these
        logger.error('errors:', err);
    });




    response.send(true)


}


exports.promise1 = function (request, response) {

    userValidation.validateIllegalUser(request.body.user_id)
        .then(res => {
            if (res.invaliduser) {
                response.send()
            } else if (asa) {
                return userValidation.someMethod()
            }
        }).then(res => {

        }).catch(e => {

        })

}







/**       =========> User Login <==========
 *
 * @param request  {email:7200732319,password:2562874548}
 * @param response
 * @returns {status:'success', data:{result:{_id:'64647474kjdhdsf', access_token:'6dh*******************i7d'}}, message:'Login successfully'}
 */
exports.login = function (request, response) {

    try {


        console.log("hello loginnnnnn", request.body)

        if (request.body) {

            var user = new db(request.body);

            if (us.isEmpty(user.password)) {
                response.json({ status: 'failure', message: 'Please enter valid password' })
                return;
            }

            user.password = encrypt(user.password);    // password encryption method

            /** ========>  Checking of Email or Mobile  <======= **/
            if (us.isNaN(Number(request.body.email))) {

                db.findOne({ 'email': request.body.email }).exec(function (errors, checkEmail) {

                    if (checkEmail) {

                        db.findOne({ 'email': request.body.email, 'password': user.password }).exec(function (err, checkEmailPwd) {

                            if (checkEmailPwd) {

                                var data = checkEmailPwd.toJSON();

                                if ((data.blocked == '1') || (data.blocked == 1)) {

                                    response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                                    return;

                                }

                                if ((data.verified == '0') || (data.verified == 0)) {

                                    response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                                    return;
                                }

                                db.update({ email: data.email }, { $set: { updated_at: new Date() } }, function (errors, updateUser) {

                                })


                                login_responce(checkEmailPwd, response);

                            }
                            else {
                                response.json({ status: 'failure', message: 'Please enter valid password' })
                            }

                        })
                    }
                    else {


                        console.log(errors)
                        console.log(checkEmail)
                        response.json({ status: 'failure', message: 'Please enter valid email id' })

                    }
                })
            }
            else {
                console.log('mobile')

                db.findOne({ 'mobile': user.email }).exec(function (err, checkMobile) {

                    if (checkMobile) {

                        db.findOne({ 'mobile': user.email, 'password': user.password }).exec(function (err, checkMobilePwd) {

                            if (checkMobilePwd) {
                                console.log('mobile1')
                                var data = checkMobilePwd.toJSON();

                                if (data.blocked == '1' || data.blocked == 1) {
                                    response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                                    return;

                                }
                                if (data.verified == '0' || data.verified == 0) {

                                    response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                                    return;
                                }

                                db.update({ email: data.email }, { $set: { updated_at: new Date() } }, function (errors, updateUser) {

                                })



                                /*** user Responce send   ***/

                                login_responce(checkMobilePwd, response);

                            }
                            else {
                                response.json({ status: 'failure', message: 'Please enter valid password' })
                            }

                        })
                    }
                    else {

                        response.json({ status: 'failure', message: 'Please enter valid mobile number' })
                    }

                })

            }

        } else {
            senderror("Invalid Request. Please enter valid user details", response);
        }
    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Something went wrong. Please try again", response);
    }
}


/*** ==========> Update Facebook User Profile  functions <===========
 *
 * @param request {email:7200732319,facebook_id:2562874548,google_id:7456586875}
 * @param response
 * @returns  {status:'success', data:{result:{_id:'64647474kjdhdsf', access_token:'6dh*******************i7d'}}, message:'Login successfully'}
 */
exports.updateFacebook = function (request, response) {

    try {

        console.log(request.body)

        console.log('*************************')

        if (request.body.email) {

            if (request.body.facebook_id) {

                db.findOne({ email: request.body.email }, function (err, doc) {
                    if (err || !doc) {
                        senderror("User not found. Please enter valid user details.", response);
                        return;
                    }
                    else {

                        var data = doc.toJSON();

                        if (data.blocked == '1' || data.blocked == 1) {
                            response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                            return;

                        }
                        if (data.verified == '0' || data.verified == 0) {

                            response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                            return;
                        }
                        db.findByIdAndUpdate(doc._id, { $set: { facebook_id: request.body.facebook_id, login_platform: 'facebook' } }, function (err, usr) {

                            if (err || !usr) {
                                senderror("Facebook account not updated.", response);
                                return;
                            }
                            else {

                                db.findOne({ email: request.body.email }, config.projection, function (error1, userData) {

                                    if (error1 || !userData) {
                                        senderror("User not found. Please enter valid user details.", response);
                                        return;

                                    }
                                    else {

                                        login_responce(userData, response);

                                        // sendUserDetails(userData, response);
                                    }
                                })
                            }
                        });

                    }
                });

            }
            else {
                senderror("Facebook_id is missing", response);
            }
        }
        else {
            senderror("Email is missing", response);
        }
    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Social Login API functions <===========***/
/**
 *
 * @param request {login_platform:'facebook / google',email:'apiwriter@gmail.com',facebook_id:'5164646466468'}
 * @param response
 * @returns {status:'success', data:{result:{_id:'64647474kjdhdsf', access_token:'6dh*******************i7d'}}, message:'Login successfully'}
 */
exports.socialLogin = function (request, response) {

    try {
        console.log(request.body)

        console.log('*************************')

        if (request.body.login_platform) {

            if (request.body.login_platform == 'facebook') {

                if (request.body.facebook_id != null) {

                    db.findOne({ email: request.body.email }, config.projection, function (err, fb) {

                        if (err || !fb) {

                            db.findOne({ facebook_id: request.body.facebook_id }, config.projection, function (err, fbData) {

                                if (err || !fbData) {
                                    senderror("User not found. Please enter valid user details.", response);
                                }
                                else {
                                    var data = fbData.toJSON();

                                    if (data.blocked == '1' || data.blocked == 1) {
                                        response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                                        return;

                                    }
                                    if (data.verified == '0' || data.verified == 0) {

                                        response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                                        return;
                                    }


                                    db.update({ facebook_id: request.body.facebook_id }, { $set: { login_platform: 'faceook' } }, function (updateFbErr, updateEB) {

                                    })





                                    login_responce(fbData, response);
                                }
                            });

                        }
                        else {

                            var data = fb.toJSON();

                            if (data.blocked == '1' || data.blocked == 1) {
                                response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                                return;

                            }
                            if (data.verified == '0' || data.verified == 0) {

                                response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                                return;
                            }

                            db.update({ email: request.body.email }, { $set: { login_platform: 'faceook' } }, function (updateFbErr, updateEB) {

                            })

                            login_responce(fb, response);
                        }
                    });
                }
                else {
                    senderror("Internal error occured in facebook login", response);
                }

            }
            else if (request.body.login_platform == 'google') {

                if (request.body.google_id != null) {

                    db.findOne({ email: request.body.email }, config.projection, function (err, gData) {

                        if (err || !gData) {

                            senderror("User not found. Please enter valid user details.", response);

                        }
                        else {
                            var data = gData.toJSON();

                            if (data.blocked == '1' || data.blocked == 1) {
                                response.send(JSON.stringify({ status: 'blocked', message: 'Your account is blocked, Please contact Sash.Cash support team for further details' }));
                                return;

                            }
                            if (data.verified == '0' || data.verified == 0) {

                                response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                                return;
                            }

                            db.update({ email: request.body.email }, { $set: { login_platform: 'google' } }, function (updateFbErr, updateEB) {

                            })

                            login_responce(gData, response);
                        }
                    });
                }
            }
            else {

                senderror("User platform Invalid", response);

            }
        }
        else {
            senderror("User platform Invalid", response);

        }
    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }
}

/**     =========> User Signup <==========
 *
 * @param req {email:'apiwrite@sash.cash',mobile:7200*****9',password:'12345678',sdk_version:25,....etc}
 * @param res
 * @returns {status: 'verify', data:{'result':user._id}
 */
exports.signup = function (req, res) {

    try {
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++')
        console.log(req.body)
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++')


        if (req.body.sdk_version) {

            if ((req.body.sdk_version == 24) || (req.body.sdk_version == 25)) {

                req.body.os_name = 'Nougat'
            }
            else if (req.body.sdk_version == 23) {

                req.body.os_name = 'Marshmallow'

            }
            else if ((req.body.sdk_version == 22) || (req.body.sdk_version == 21)) {

                req.body.os_name = 'Lollipop'

            }
            else if (req.body.sdk_version == 19) {

                req.body.os_name = 'KitKat'

            }
            else if ((req.body.sdk_version == 18) || (req.body.sdk_version == 17) || (req.body.sdk_version == 16)) {

                req.body.os_name = 'Jelly Bean'

            }

            else {

                req.body.os_name = 'Below Jelly Bean'

            }

        }


        var user = new db(req.body);


        masterDB.findOne({ type: 'discount' }, function (errors, discountData) {

            if (errors || !discountData) {

            }
            else {
                console.log(discountData, 'discountDataaaaaaaaaaaaaaaaaaaaa')

                user.user_discount_amount = Number(discountData.value);
                user.used_discount_amount = 0;
            }
        })





        if (user.password) {
            user.password = encrypt(user.password)
            user.referral_code = "SC" + randomstring.generate({
                length: 6,
                charset: 'alphanumeric',
                capitalization: 'uppercase'
            });
            user.verification_code = randomstring.generate({
                length: 6,
                charset: 'numeric',
            })
            user.register_date = new Date();
            user.verified_date = new Date();
            user.verified_date = user.verified_date.setMinutes(user.verified_date.getMinutes() + 30);
            user.verified = 0;
            user.platform = 'signup';
            user.online = 'false';
            user.wallet = 5;
            user.referral_amount = 10;


            masterDB.findOne({ type: 'signup' }, function (errors, signupData) {

                if (errors || !signupData) {

                }
                else {
                    console.log(signupData, 'discountDataaaaaaaaaaaaaaaaaaaaa')

                    user.wallet = Number(signupData.value);
                }
            })




            var teser = new db();


            /** iOS User purpose only**/
            if (user._id) {
            }

            else {

                user._id = teser._id;
            }

        }
        console.log(user)


        if (_.isEmpty(user.email)) {

            senderror("Invalide email id!", res);
        }
        else {
            //Check for Email reuse
            db.findOne({ 'email': user.email }, function (err, userEmail) {
                if (userEmail) {

                    senderror("Email id already exists!", res);
                }
                else {
                    //Check for Mobile reuse

                    if (_.isEmpty(user.mobile)) {
                        senderror("Invalide mobile number!", res);
                    }
                    else {

                        db.findOne({ 'mobile': user.mobile }, function (err, userPhone) {

                            if (userPhone) {

                                senderror("Mobile number already exists!", res);
                                return;

                            } else {

                                if (!_.isEmpty(req.body.referred_by)) {

                                    db.findOne({
                                        referral_code: user.referred_by,
                                        verified: '1',
                                        blocked: '0'
                                    }, function (err, userReferralCode) {

                                        if (!userReferralCode) {

                                            senderror("Please enter valid referral code!", res);
                                            return;

                                        }
                                        else {

                                            if (user.full_name && user.age && user.dob && user.password && user.state && user.city && user.town && user.marital_status && user.profession && user.gender) {

                                                db.create(user, function (err, doc) {

                                                    if (err) {
                                                        senderror(" User not created. Please try again.", res);
                                                        return;

                                                    }
                                                    else {


                                                        db.findOne({ _id: user._id }, function (error, userData) {

                                                            if (error) {
                                                                return senderror("User not found", response);
                                                            }
                                                            else {


                                                                userTrackDB.find({ user: user._id }, function (err, userTracks) {

                                                                    if (err) {
                                                                        return senderror("User not found", response);
                                                                    }
                                                                    else {

                                                                        var trackUser = userData;
                                                                        var track = new userTrackDB();

                                                                        delete trackUser['_id'];
                                                                        delete trackUser['updated_at'];
                                                                        /*track = user;*/
                                                                        track.track_id = userTracks.length + 1
                                                                        track.user = user._id;
                                                                        track.full_name = trackUser.full_name
                                                                        track.email = trackUser.email
                                                                        track.mobile = trackUser.mobile
                                                                        track.password = trackUser.password
                                                                        track.online = trackUser.online
                                                                        track.image = trackUser.image
                                                                        track.state = trackUser.state
                                                                        track.city = trackUser.city
                                                                        track.town = trackUser.town
                                                                        track.current_location = trackUser.current_location
                                                                        track.latitude = trackUser.latitude
                                                                        track.longitude = trackUser.longitude
                                                                        track.dob = trackUser.dob
                                                                        track.gender = trackUser.gender
                                                                        track.age = trackUser.age
                                                                        track.marital_status = trackUser.marital_status
                                                                        track.profession = trackUser.profession
                                                                        track.verification_code = trackUser.verification_code
                                                                        track.verified = trackUser.verified
                                                                        track.blocked = trackUser.blocked
                                                                        track.facebook_id = trackUser.facebook_id
                                                                        track.google_id = trackUser.google_id
                                                                        track.login_platform = trackUser.login_platform
                                                                        track.referral_code = trackUser.referral_code
                                                                        track.referred_by = trackUser.referred_by
                                                                        track.device_id = trackUser.device_id
                                                                        track.push_token = trackUser.push_token
                                                                        track.device_type = trackUser.device_type
                                                                        track.app_version = trackUser.app_version
                                                                        track.os_version = trackUser.os_version
                                                                        track.ip_address = user.ip_address
                                                                        track.screen_resolution = trackUser.screen_resolution
                                                                        track.device_manufacturer = trackUser.device_manufacturer
                                                                        track.device_platform = trackUser.device_platform
                                                                        track.os_name = trackUser.os_name
                                                                        track.sdk_version = trackUser.sdk_version
                                                                        track.register_date = trackUser.register_date
                                                                        track.verified_date = trackUser.verified_date
                                                                        track.wallet = trackUser.wallet


                                                                        userTrackDB.create(track, function (createErr, createtrack) {

                                                                            if (createErr) {

                                                                                return senderror("User not found", response);
                                                                            }
                                                                            else {

                                                                                db.update({ _id: user._id }, { $set: { user_track_details: track._id } }, function (Uperr, updated) {

                                                                                    if (Uperr) {

                                                                                        return senderror("User not found", response);
                                                                                    }
                                                                                    else {


                                                                                        deviceTrackDB.findOne({ unique_id: user.unique_id }, function (errors, findData) {

                                                                                            if (errors || !findData) {
                                                                                                console.log('Device already installed')

                                                                                            }
                                                                                            else {

                                                                                                deviceTrackDB.update({ unique_id: user.unique_id }, { $set: { user: user._id, user_track_details: track._id, updated_date: new Date() } }, function (err, deviceData) {

                                                                                                    if (err || !deviceData) {

                                                                                                        console.log('error')
                                                                                                    }
                                                                                                    else {
                                                                                                        console.log('success')


                                                                                                    }

                                                                                                })
                                                                                            }

                                                                                        })

                                                                                        var subj = "Welcome to Sash.Cash";

                                                                                        var email = user.email;

                                                                                        var userName = user.full_name;

                                                                                        var pwd = user.verification_code;

                                                                                        welcomeMail(subj, email, userName, pwd, res);

                                                                                        sendsms(user.mobile, "Welcome to Sash.Cash. Your verification code: " + user.verification_code + " .", res);

                                                                                        /* sendUserDetails(doc, res);*/

                                                                                        accountHistory(user._id, user.wallet)


                                                                                        console.log('resultttt', user._id)
                                                                                        res.json({ status: 'verify', data: { 'result': user._id } });

                                                                                    }
                                                                                })


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

                                                res.json({
                                                    status: 'success',
                                                    message: ' Valide User'
                                                })


                                            }


                                        }

                                    });

                                }
                                else {
                                    console.log('valide User12')

                                    if (user.full_name && user.age && user.dob && user.password && user.state && user.city && user.town && user.marital_status && user.profession && user.gender) {

                                        db.create(user, function (err, doc) {

                                            if (err) {
                                                senderror(" User not created. Please try again.", res);
                                                return;

                                            }
                                            else {

                                                db.findOne({ _id: user._id }, function (error, userData) {

                                                    if (error) {
                                                        return senderror("User not found", response);
                                                    }
                                                    else {


                                                        userTrackDB.find({ user: user._id }, function (err, userTracks) {

                                                            if (err) {
                                                                return senderror("User not found", response);
                                                            }
                                                            else {

                                                                var trackUser = userData;
                                                                var track = new userTrackDB();

                                                                delete trackUser['_id'];
                                                                delete trackUser['updated_at'];
                                                                /*track = user;*/
                                                                track.track_id = userTracks.length + 1
                                                                track.user = user._id;
                                                                track.full_name = trackUser.full_name
                                                                track.email = trackUser.email
                                                                track.mobile = trackUser.mobile
                                                                track.password = trackUser.password
                                                                track.online = trackUser.online
                                                                track.image = trackUser.image
                                                                track.state = trackUser.state
                                                                track.city = trackUser.city
                                                                track.town = trackUser.town
                                                                track.current_location = trackUser.current_location
                                                                track.latitude = trackUser.latitude
                                                                track.longitude = trackUser.longitude
                                                                track.dob = trackUser.dob
                                                                track.gender = trackUser.gender
                                                                track.age = trackUser.age
                                                                track.marital_status = trackUser.marital_status
                                                                track.profession = trackUser.profession
                                                                track.verification_code = trackUser.verification_code
                                                                track.verified = trackUser.verified
                                                                track.blocked = trackUser.blocked
                                                                track.facebook_id = trackUser.facebook_id
                                                                track.google_id = trackUser.google_id
                                                                track.login_platform = trackUser.login_platform
                                                                track.referral_code = trackUser.referral_code
                                                                track.referred_by = trackUser.referred_by
                                                                track.device_id = trackUser.device_id
                                                                track.push_token = trackUser.push_token
                                                                track.device_type = trackUser.device_type
                                                                track.app_version = trackUser.app_version
                                                                track.os_version = trackUser.os_version
                                                                track.ip_address = user.ip_address
                                                                track.screen_resolution = trackUser.screen_resolution
                                                                track.device_manufacturer = trackUser.device_manufacturer
                                                                track.device_platform = trackUser.device_platform
                                                                track.os_name = trackUser.os_name
                                                                track.unique_id = trackUser.unique_id
                                                                track.sdk_version = trackUser.sdk_version
                                                                track.register_date = trackUser.register_date
                                                                track.verified_date = trackUser.verified_date
                                                                track.wallet = trackUser.wallet


                                                                userTrackDB.create(track, function (createErr, createtrack) {

                                                                    if (createErr) {

                                                                        return senderror("User not found", response);
                                                                    }
                                                                    else {

                                                                        db.update({ _id: user._id }, { $set: { user_track_details: track._id } }, function (Uperr, updated) {

                                                                            if (Uperr) {

                                                                                return senderror("User not found", response);
                                                                            }
                                                                            else {


                                                                                deviceTrackDB.findOne({ unique_id: user.unique_id }, function (errors, findData) {

                                                                                    if (errors || !findData) {
                                                                                        console.log('Device already installed')

                                                                                    }
                                                                                    else {

                                                                                        deviceTrackDB.update({ unique_id: user.unique_id }, { $set: { user: user._id, user_track_details: track._id, updated_date: new Date() } }, function (err, deviceData) {

                                                                                            if (err || !deviceData) {

                                                                                                console.log('error')
                                                                                            }
                                                                                            else {
                                                                                                console.log('success')


                                                                                            }

                                                                                        })
                                                                                    }

                                                                                })




                                                                                var subj = "Welcome to Sash.Cash";

                                                                                var email = user.email;

                                                                                var userName = user.full_name;

                                                                                var pwd = user.verification_code;

                                                                                welcomeMail(subj, email, userName, pwd, res);

                                                                                sendsms(user.mobile, "Welcome to Sash.Cash. Your verification code: " + user.verification_code + " .", res);

                                                                                /* sendUserDetails(doc, res);*/
                                                                                accountHistory(user._id, user.wallet)
                                                                                console.log('resultttt2', user._id)
                                                                                res.json({ status: 'verify', data: { 'result': user._id } });

                                                                            }
                                                                        })


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
                                        console.log('valide User')

                                        res.json({
                                            status: 'success',
                                            message: ' Valide user'
                                        })

                                    }

                                }

                            }

                        });
                    }
                }
            });

        }
    }
    catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", res);
    }
}


/**       =========> User Profile Image Upload  <==========      **/
/**
 *
 * @param request {user_id:'5645m456546k467462k544',profile_image:'data:base64lhlglhdglhlndlgldkhndglhgdlhldghhhhh...etc}
 * @param response
 * @returns {status: 'success', data: {result:data}} || {status: 'verify', data: {result:user_id}}
 */
exports.profileImage = function (request, response) {

    try {




        if (request.body.profile_image && request.body.user_id) {

            base64_decode(request.body.profile_image, request.body.user_id + '.png');

            var image = 'profileimage/' + request.body.user_id + '.png';

            db.findOne({ _id: request.body.user_id }, config.projection, function (err, findUser) {

                if (err) {
                    senderror("User not found. Please enter valid user details.", response);
                }
                else {

                    var data = findUser.toJSON()

                    if (data.blocked == '1' || data.blocked == 1) {

                        response.send(JSON.stringify({
                            status: 'blocked',
                            message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                        }));
                        return;

                    }

                    if (data.verified == '0' || data.verified == 0) {

                        response.send(JSON.stringify({ status: 'verify', data: { result: { _id: data._id } } }));
                        return;
                    }

                    db.update({ _id: request.body.user_id }, { $set: { 'image': image } }, function (err, user) {
                        if (err) {
                            senderror("User not found. Please enter valid user details.", response);
                        }
                        else {
                            data.image = image
                            response.json({ status: 'success', data: { result: data } });
                        }
                    })
                }
            })

        }
        else {
            senderror("Invalid Request. Please enter valid user details", response);
        }
    }
    catch (error) {
        return senderror("Exception Occurred", response);
    }
}


/*** ==========> Forgot Password  API functions <===========***/
/**
 *
 * @param req {email:'7200364182' | 'sabash.cse@gmail.com'}
 * @param res
 * @returns {status:'success', message:'One Time Password is sent to you. Please check your mobile'}
 */
exports.forgotPassword = function (req, res) {

    try {

        var mustparams = ["email"];

        console.log("email", req.body.email);

        if (!checkParams(req, res, mustparams)) return;

        var user = req.body;

        var ver = user.email;

        db.findOne({ $or: [{ 'email': user.email }, { 'mobile': user.email }] }, function (err, doc) {

            if (err || !doc) {

                senderror("User not found. Please enter valid user details.", res);
                return;
            }
            else {

                var data = doc.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    res.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if (data.verified == '0' || data.verified == 0) {

                    res.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                    return;
                }



                var text = randomstring.generate({
                    length: 6,
                    charset: 'numeric',
                })
                user.verified_date = new Date();
                user.verified_date = user.verified_date.setMinutes(user.verified_date.getMinutes() + 30);


                var data = doc.toJSON();

                db.update({ _id: data._id }, { $set: { verification_code: text, verified_date: user.verified_date } }, function (error, updateData) {

                    if (error) {
                        console.log(error)
                        senderror("User not found. Please enter valid user details.", res);
                        return;
                    }
                    else {

                        var smssubj = "Dear Customer, Your OTP is: " + text + " Please enter the OTP to proceed. Thank you.";
                        sendsms(data.mobile, smssubj);

                        var msg = "One Time Password is sent to you. Please check your mobile";
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ status: 'success', message: msg }));

                    }

                })

            }

        });

    } catch (error) {
        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", res);
    }
}


/*** ==========> User Verification  API functions <===========***/
/**
 *
 * @param req {email:'7200364182' | 'sabash.cse@gmail.com',verification}
 * @param res
 * @returns {status:'success',message:'OTP verified successfully'}
 */
exports.forgotVerification = function (req, res) {

    try {

        console.log(req.body)

        var user = new db(req.body);
        var verification_code = req.body.verification_code;
        var users;

        db.findOne({ $or: [{ 'email': req.body.email }, { 'mobile': req.body.email }] }, function (err, doc) {

            if (err || !doc) {
                senderror("Invalid verification code. Please enter a valid code!", res);
                return;

            } else {

                console.log(doc.verification_code, verification_code)
                if (doc.verification_code == verification_code) {

                    if (doc.verified_date > new Date()) {

                        var data = doc.toJSON();

                        db.update({ 'email': data.email }, { $set: { verified: 1 } }, function (err, user) {

                            if (err || !user) {

                                senderror("User not found. Please enter valid user details.", res);
                                return;
                            }
                            else {
                                console.log(true)
                                res.json({ status: 'success', message: 'OTP verified successfully' })
                            }
                        });

                    }
                    else {
                        senderror("verification code already Expired!", res);
                        return;
                    }
                }
                else {
                    senderror("Invalid verification code. Please enter a valid code!", res);
                    return;
                }

            }

        });

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Resend  API functions <===========***/
/**
 *
 * @param request {email:'7200364182' | 'sabash.cse@gmail.com'}
 * @param response
 * @returns {status:'success', message:'One Time Password is sent to you. Please check your mobile'}
 */
exports.resend = function (request, response) {

    try {

        console.log(request.body)


        var mustparams = ["email"];
        if (!checkParams(request, response, mustparams)) return;

        var user = new db(request.body);
        var ver = user.email;

        user.verification_code = randomstring.generate({
            length: 6,
            charset: 'numeric',
        })
        user.verified_date = new Date();
        user.verified_date = user.verified_date.setMinutes(user.verified_date.getMinutes() + 30);
        user.verified = 0;

        db.findOne({ $or: [{ 'email': user.email }, { 'mobile': user.email }] }, function (err, doc) {
            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }
            else {
                var data = doc.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                var data = doc.toJSON();
                db.findByIdAndUpdate(data['_id'], {
                    verification_code: user.verification_code,
                    verified: user.verified,
                    verified_date: user.verified_date
                }, function (err, doc) {
                    if (err) {
                        senderror("User not found. Please enter valid user details.", response);
                        return;
                    }
                    else {

                        sendsms(data.mobile, "Welcome to Sash.Cash. Your verification code is : " + user.verification_code + " .", response);

                        response.setHeader('Content-Type', 'application/json');
                        response.send(JSON.stringify({
                            status: 'success',
                            message: 'OTP send successfully',
                        }));
                    }
                });
            }

        });

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Specific User API functions <===========***/
/**
 *
 * @param request {user_id:'5435rs784587449854'}
 * @param response
 * @returns  {status:'success',data:{result:userDetails}}
 */
exports.specificUser = function (request, response) {

    try {
        db.findOne({ _id: request.body.user_id }, config.projection, function (err, doc) {
            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }
            else {
                var data = doc.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({ status: 'verify', message: 'OTP not verified ' }));
                    return;
                }

                sendUserDetails(doc, response);
            }



        });

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }

}


/*** ==========> changePassword User API functions <===========  ***/
/**
 *
 * @param request {email:'7200*****9 | apiwriter@sash.cash',password:'12314342'}
 * @param response
 * @returns  {status:'success',message:'Your password changed successfully!'}
 */
exports.newPassword = function (request, response) {

    try {


        var mustparams = ["email", "password"];
        if (!checkParams(request, response, mustparams)) return;

        var user = new db(request.body);
        user.password = encrypt(user.password)
        console.log(user.password)

        db.findOne({ $or: [{ 'email': user.email }, { 'mobile': user.email }] }, function (err, doc) {
            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }
            else {
                var data = doc.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                    return;
                }


                console.log(data.password, user.password)

                /* if (data.password == user.password) {
 
                     senderror("Please enter a new password", response);
                     return;
                 }*/

                db.update({ email: data.email }, { $set: { password: user.password } }, function (err, doc) {
                    if (err) {
                        senderror("User not found. Please enter valid user details.", response);
                        return;
                    }
                    else {

                        var msg = "Your password changed successfully!";
                        response.setHeader('Content-Type', 'application/json');
                        response.send(JSON.stringify({
                            status: 'success',
                            message: msg
                        }));

                    }
                });
            }


        })


    }

    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> changePassword User API functions <===========  ***/
/**
 *
 * @param request {user_id:'53sfg35445455424',new_password:'12314342',old_password:'87654321'}
 * @param response
 * @returns  {status:'success',message:'Your password changed successfully!'}
 */
exports.changePassword = function (request, response) {

    try {


        console.log(request.body)

        var user = request.body;
        user.old_password = encrypt(user.old_password)
        user.new_password = encrypt(user.new_password)




        db.findOne({ _id: request.body.user_id }, function (err, doc) {

            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }
            else {

                var data = doc.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                    return;
                }


                db.findOne({ _id: request.body.user_id, password: user.old_password }, function (err, doc) {

                    if (err || !doc) {
                        senderror("Invalid password. Please enter valid password. ", response);
                        return;
                    }
                    else {

                        if (user.old_password == user.new_password) {

                            senderror("Please enter a new password", response);
                            return;
                        }

                        db.update({ _id: request.body.user_id }, { $set: { password: user.new_password } }, function (err, doc) {

                            if (err) {
                                senderror("User not found. Please enter valid user details.", response);
                                return;
                            }
                            else {

                                var msg = "Your password changed successfully!";
                                response.setHeader('Content-Type', 'application/json');
                                response.send(JSON.stringify({
                                    status: 'success',
                                    message: msg
                                }));

                            }
                        });

                    }


                })





            }


        })


    }

    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Update  User Profile API functions <===========  ***/
/**
 *
 * @param request {full_name:'ApiWrite',city:'chennai',town:'tambaram',.....,etc}
 * @param response
 * @returns {status:'verify',data:{result:'524428724574794c24}}
 */
exports.update = function (request, response) {

    try {

        console.log("user test this case", request.body)

        request.body.online = true;

        db.findOne({ _id: request.body.user_id }, function (error, findData) {


            if (findData) {

                console.log('other change Update chagesssssssss')

                var data = findData.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;
                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({ status: 'verify', message: 'OTP not verified ' }));
                    return;
                }

                if (request.body.mobile) {

                    // console.log(findData._id,"Help Meeee",request.body.user_id)

                    if (findData.mobile == request.body.mobile) {

                        // console.log("existing Mobile",findData.mobile)

                        db.update({ _id: request.body.user_id }, { $set: request.body }, function (err, doc) {

                            if (err || !doc) {

                                senderror("User not found. Please enter valid user details.", response);

                                return;
                            }

                            else {

                                db.findOne({ _id: request.body.user_id }, function (err, usr) {

                                    if (err || !usr) {

                                        senderror("User not found. Please enter valid user details.", response);

                                        return;
                                    }

                                    usr['updateMobile'] = 0;



                                    response.json({ status: 'success', data: { result: usr } });

                                });

                            }
                        });

                    }

                    else {

                        console.log('mobile Update chagesssssssss')

                        db.findOne({ mobile: request.body.mobile }, function (error, mobilCheck) {

                            if (mobilCheck) {
                                senderror("Mobile number already exists!", response);

                                return;
                            } else {
                                request.body.verified = 0

                                request.body.verification_code = randomstring.generate({
                                    length: 6,
                                    charset: 'numeric',
                                })

                                request.body.verified_date = new Date();
                                request.body.verified_date = request.body.verified_date.setMinutes(request.body.verified_date.getMinutes() + 30);

                                db.findByIdAndUpdate(request.body.user_id, { $set: request.body }, function (err, doc) {

                                    if (err || !doc) {

                                        senderror("User not found. Please enter valid user details.", response);
                                        return;
                                    }
                                    else {

                                        db.findById(request.body.user_id, config.projection, function (err, user) {

                                            if (err || !user) {

                                                senderror("User not found. Please enter valid user details.", response);

                                                return;
                                            }

                                            // console.log(user.mobile, "After udpated");

                                            var text = Math.floor((Math.random() * 900000) + 100000)

                                            user.password = text

                                            var data = user;

                                            console.log("data-------------------", data.mobile);
                                            console.log(data);

                                            var content = 'Dear ' + data['full_name'] + ',,\r\n\r\nWe received a request to reset the password associated with this e-mail address. \r\n';
                                            content += 'Please find your login details:\r\n\r\nEmail: ';
                                            content += user.email + '\r\n\n OTP : ';
                                            content += user.password + '\r\n\r\n';


                                            var smssubj = "Dear Customer, Your OTP is: " + request.body.verification_code + " Please enter the OTP to proceed. Thank you.";

                                            var subj = "Mobile number has been Changed successfully please verify your mobile number with OTP- SashCash";

                                            var userName = data['full_name'];

                                            var mailContent = "You have recently requested to change your Mobile Number for your Sash.Cash account.";

                                            var pwd = user.password;

                                            var email = user.email



                                            sendsms(data.mobile, smssubj);
                                            user['updateMobile'] = 1;
                                            // sendUserDetails(user, response);

                                            response.json({ status: 'verify', data: { result: user._id } })
                                            return;
                                        });
                                    }
                                });
                            }

                        })

                    }

                }
                else {

                    console.log('update')

                    /***  Device Update function Use here  ****/

                    db.update({ _id: request.body.user_id }, { $set: request.body }, function (err, doc) {

                        if (err || !doc) {

                            senderror("User not found. Please enter valid user details.", response);

                            return;
                        }

                        else {

                            db.findOne({ _id: request.body.user_id }, function (err, usr) {

                                if (err || !usr) {

                                    senderror("User not found. Please enter valid user details.", response);

                                    return;
                                }
                                else {
                                    sendUserDetails(usr, response);

                                    return;

                                }

                            });

                        }
                    });

                }
            }
            else {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }

        })

    }

    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }
}

/****** =========> professionList Methods <========== *******/
/**
 *
 * @param req
 * @param res {status:'success',data:{result:lists}}
 */
exports.professionList = function (req, res) {

    var data = fs.readFileSync('./public/jsons/profession.json');

    var pars = JSON.parse(data);


    var arr = [];

    for (var x in pars) {

        var profession = pars[x].profession;

        var professionObj = {}

        professionObj.profession = profession;

        arr.push(professionObj);

    }


    var responseObj = {}

    responseObj.status = "success";

    responseObj.data = { result: arr };

    res.send(responseObj);

    // res.send(arr);

}


/****** =========> stateList Methods <========== *******/
/**
 *
 * @param req
 * @param res  {status:'success',data:{result:lists}}
 */
exports.stateList = function (req, res) {


    var data = fs.readFileSync('./public/jsons/state.json');

    var pars = JSON.parse(data);


    var arr = [];

    for (var x in pars) {

        var state = pars[x].state;

        var stateObj = {}

        stateObj.state = state;


        arr.push(stateObj);

    }


    var responseObj = {}

    responseObj.status = "success";

    responseObj.data = { result: arr };


    console.log(arr.length, 'state.lengthhhhhhhhhhhhhh')
    res.send(responseObj);

}


/****** =========> CityList Methods <========== *******/
/**
 *
 * @param req {state:'Tamil Nadu'
 * @param res {status:'success',data:{result:lists}}
 */
exports.cityList = function (req, res) {


    var userCity = req.body.state;
    // var userCity=req.params.city;

    var data = fs.readFileSync('./public/jsons/state.json');

    var stateList = JSON.parse(data);


    var cityLen = stateList.length;

    var arrCity = [];

    for (var i = 0; i < cityLen; i++) {

        if (stateList[i].state === userCity) {

            var cityArr = stateList[i].cities.length;

            for (var j = 0; j < cityArr; j++) {

                var getCity = stateList[i].cities[j].city;
                var cityObj = {}

                cityObj.city = getCity;
                arrCity.push(cityObj);
            }

            var responseObj = {};
            responseObj.status = "success";
            responseObj.data = { result: arrCity };
            res.send(responseObj)
        }

    }
}

/****** =========> TownList Methods <========== *******/

/**
 *
 * @param req {state:'Tamil Nadu',city:'chennai'}
 * @param res {status:'success',data:{result:lists}}
 */
exports.townList = function (req, res) {

    var userState = req.body.state;


    var userCity = req.body.city;


    var data = fs.readFileSync('./public/jsons/state.json');

    var stateList = JSON.parse(data);

    var stateLen = stateList.length;


    var arrTown = [];

    for (var i = 0; i < stateLen; i++) {

        if (stateList[i].state === userState) {

            var cityArr = stateList[i].cities.length;


            for (var j = 0; j < cityArr; j++) {

                var getCity = stateList[i].cities[j].city;

                if (getCity === userCity) {


                    var townArr = stateList[i].cities[j].towns.length;


                    for (var k = 0; k < townArr; k++) {

                        var getTown = stateList[i].cities[j].towns[k].town;

                        var townObj = {}

                        townObj.town = getTown;


                        arrTown.push(townObj);

                    }

                    var responseObj = {}

                    responseObj.status = "success";

                    responseObj.data = { result: arrTown };

                    res.send(responseObj);
                }


            }

        }
    }

}




/*** ==========> accountHistory User API functions <===========***/
/**
 *
 * @param req {typ:'recharge | campaign | transfer | refferal'}
 * @param res
 * @returns {status:'success',data:{result:account History Lists}}
 */
exports.accountHistory = function (req, res) {
    try {
        var userId = req.body.user_id
        var startdate = req.body.select_date;
        var arr = {};
        var Lists = [];
        var total = 0;

        var jsonContent = {}; // JSON.parse(contents);
        jsonContent['status'] = "success";
        console.log('accountHistory', req.body)
        //console.log('satatrrrrrr dateeeeeeeeeeee' ,startdate)
        db.findById(userId, function (err, userdoc) {
            if (err || !userdoc) {
                senderror("User not found. Please enter valid user details.", res);
                return;
            }
            else {
                var types = ["video", "poster", "appdownload", "link", "audio", "homepage", "tablebg"];

                for (var i = 0; i < types.length; i++) {
                    var typeinfo = {};

                    typeinfo['title'] = "No of " + types[i] + " Ads Viewed";

                    getValuesForTypes(typeinfo, types[i])

                }

                function getValuesForTypes(typeinfo, type) {
                    // console.log('satat dateeeeeeeeeeee' ,startdate)
                    var date = new Date(startdate);
                    date.setHours(0, 0, 0, 0);
                    var endDate = new Date(date);
                    endDate.setHours(23, 59, 59, 59);

                    view.find({
                        'user': userId,
                        'type': type,
                        'updated_at': { $gte: date, $lt: endDate }
                    }).populate('campaign').sort('-updated_at').exec(function (err, viewdoc) {

                        console.log('ViewDocvvvvvv', viewdoc);

                        if (err || !viewdoc || viewdoc.length == 0) {
                            typeinfo['list'] = [];
                            arr[type] = typeinfo;
                        }
                        else {
                            var viewdocs = JSON.parse(JSON.stringify(viewdoc));
                            var newdocs = [];
                            var tlt;
                            for (var j = 0; j < viewdocs.length; j++) {
                                var docinfo = {};
                                docinfo['_id'] = viewdocs[j]['_id'];
                                docinfo['updated_at'] = viewdocs[j]['updated_at'];
                                docinfo['duration'] = viewdocs[j]['campaign']['duration'];
                                docinfo['cost'] = viewdocs[j]['campaign']['cost'];
                                docinfo['title'] = viewdocs[j]['campaign']['title'];
                                docinfo['description'] = viewdocs[j]['campaign']['description'];
                                docinfo['image'] = viewdocs[j]['campaign']['image'];
                                total = total + viewdocs[j]['campaign']['cost'];

                                newdocs.push(docinfo);

                            }
                            typeinfo['list'] = newdocs;
                            typeinfo['total'] = total;

                            arr[type] = typeinfo;


                        }
                    });
                }


                setTimeout(function () {

                    /*** TableBG Calculation ***/

                    if (arr.tablebg) {

                        if (arr.tablebg.list.length == 0) {
                            arr.tablebg['total_count'] = arr.tablebg.list.length;
                            arr.tablebg['total_cost'] = 0;
                        }
                        else {
                            arr.tablebg['total_count'] = arr.tablebg.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.tablebg.list.length; i++) {
                                val += arr.tablebg.list[i].cost;
                            }
                            arr.tablebg['total_cost'] = val;
                        }

                    }

                    /*** Homepage Calculation ***/

                    if (arr.homepage) {

                        if (arr.homepage.list.length == 0) {
                            arr.homepage['total_count'] = arr.homepage.list.length;
                            arr.homepage['total_cost'] = 0;
                        }
                        else {
                            arr.homepage['total_count'] = arr.homepage.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.homepage.list.length; i++) {
                                val += arr.homepage.list[i].cost;
                            }
                            arr.homepage['total_cost'] = val;

                        }

                    }

                    /*** Video Calculation ***/

                    if (arr.video) {

                        if (arr.video.list.length == 0) {
                            arr.video['total_count'] = arr.video.list.length;
                            arr.video['total_cost'] = 0;
                        }
                        else {
                            arr.video['total_count'] = arr.video.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.video.list.length; i++) {
                                val += arr.video.list[i].cost;
                            }
                            arr.video['total_cost'] = val;
                        }

                    }

                    /*** Poster Calculation ***/

                    if (arr.poster) {

                        if (arr.poster.list.length == 0) {
                            arr.poster['total_count'] = arr.poster.list.length;
                            arr.poster['total_cost'] = 0;
                        }
                        else {
                            arr.poster['total_count'] = arr.poster.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.poster.list.length; i++) {
                                val += arr.poster.list[i].cost;
                            }
                            arr.poster['total_cost'] = val;
                        }

                    }

                    /*** AppDownload Calculation ***/

                    if (arr.appdownload) {

                        if (arr.appdownload.list.length == 0) {
                            arr.appdownload['total_count'] = arr.appdownload.list.length;
                            arr.appdownload['total_cost'] = 0;
                        }
                        else {
                            arr.appdownload['total_count'] = arr.appdownload.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.appdownload.list.length; i++) {
                                val += arr.appdownload.list[i].cost;
                            }
                            arr.appdownload['total_cost'] = val;
                        }

                    }

                    /*** Link Calculation ***/

                    if (arr.link) {

                        if (arr.link.list.length == 0) {
                            arr.link['total_count'] = arr.link.list.length;
                            arr.link['total_cost'] = 0;
                        }
                        else {
                            arr.link['total_count'] = arr.link.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.link.list.length; i++) {
                                val += arr.link.list[i].cost;
                            }
                            arr.link['total_cost'] = val;
                        }

                    }

                    /*** Audio Calculation ***/

                    if (arr.audio) {

                        if (arr.audio.list.length == 0) {
                            arr.audio['total_count'] = arr.audio.list.length;
                            arr.audio['total_cost'] = 0;
                        }
                        else {
                            arr.audio['total_count'] = arr.audio.list.length;
                            var val = 0;
                            for (var i = 0; i < arr.audio.list.length; i++) {
                                val += arr.audio.list[i].cost;
                            }
                            arr.audio['total_cost'] = val;
                        }

                    } else {

                    }

                    jsonContent = arr;
                    jsonContent['status'] = "success";

                    res.json(jsonContent);
                }, 1000)


            }
        })
    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", res);
    }

}



/*all Account History*/
/**
 *
 * @param req  {typ:'recharge | campaign | transfer | refferal | all'}
 * @param res
 * @returns {status:'success',data:{result:account History Lists}}
 */
exports.allHistory = function (req, res) {

    try {


        console.log(req.body)

        console.log('*************************')

        var query = {};

        db.findOne({ _id: req.body.user_id }, function (err, doc) {
            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }
            else {
                var data = doc.toJSON()



                if (data.blocked == '1' || data.blocked == 1) {

                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;

                }

                else if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({ status: 'verify', data: { result: data._id } }));
                    return;
                }

                else {

                    query.user = req.body.user_id;

                    if (req.body.type) {

                        if (req.body.type == 'all') {
                            console.log('All')
                            if (req.body.from_date && req.body.to_date) {

                                var fromDate = new Date(req.body.from_date)

                                //fromDate.setHours(0, 0, 0, 0);

                                var toDate = new Date(req.body.to_date)

                                console.log(fromDate, toDate)
                                // toDate.setHours(23, 59, 59, 59);
                                query.updated_at = { $gte: req.body.from_date, $lt: req.body.to_date }



                            }

                        }
                        else {

                            query.type = req.body.type

                            if (req.body.from_date && req.body.to_date) {

                                /* var fromDate = new Date(req.body.from_date)
                                 var toDate = new Date(req.body.to_date)*/

                                var fromDate = new Date(req.body.from_date)
                                //  fromDate.setHours(0, 0, 0, 0);

                                var toDate = new Date(req.body.to_date)
                                toDate.setHours(23, 59, 59, 59);
                                // query.updated_at = {$gte: fromDate, $lt:toDate }



                            }
                        }
                    }
                    else {
                        console.log('without else')

                        if (req.body.from_date && req.body.to_date) {

                            var fromDate = new Date(req.body.from_date)
                            // fromDate.setHours(0, 0, 0, 0);

                            var toDate = new Date(req.body.to_date)
                            toDate.setHours(23, 59, 59, 59);
                            // query.updated_at = {$gte: fromDate, $lt:toDate }


                        }
                        else {

                        }


                    }

                    console.log('^^^^^^^^^^^^^^^')
                    console.log(query)

                    accountHistoryDB.find(query).populate('campaign').populate('user').populate('referral').populate('transfer').populate('recharge').skip(req.body.skip).limit(req.body.limit).sort({ updated_at: -1 }).exec(function (err, historyList) {


                        if (err || !historyList) {


                            res.json({ status: 'success', data: { result: [] } })
                        }
                        else {
                            //  console.log(historyList,'resultttt')
                            if (req.body.type == 'all') {

                                var all = { user: new mongoose.Types.ObjectId(req.body.user_id) }
                                accountHistoryDB.aggregate([{ $match: all }, { $group: { _id: "", total: { $sum: "$amount" } } }], function (sumerr, totalcount) {
                                    if (sumerr) {
                                        res.json({ status: 'success', data: { result: [] } })

                                    }
                                    else {
                                        console.log(historyList.length, ' alll', totalcount)

                                        if (totalcount.length == 0) {
                                            res.json({ status: 'success', data: { total: 0, result: historyList } })
                                        }
                                        else {
                                            res.json({ status: 'success', data: { total: totalcount[0].total, result: historyList } })
                                        }
                                    }

                                })

                            }
                            else {
                                var all = { user: new mongoose.Types.ObjectId(req.body.user_id), type: req.body.type }
                                accountHistoryDB.aggregate([{ $match: all }, { $group: { _id: "", total: { $sum: "$amount" } } }], function (sumerr, totalcount) {
                                    if (sumerr) {
                                        res.json({ status: 'success', data: { result: [] } })

                                    }
                                    else {
                                        console.log(' else  alll', totalcount)
                                        if (totalcount.length == 0) {
                                            res.json({ status: 'success', data: { total: 0, result: historyList } })
                                        }
                                        else {
                                            res.json({ status: 'success', data: { total: totalcount[0].total, result: historyList } })
                                        }

                                    }

                                })

                            }


                        }


                    })


                }

            }


        })


    }
    catch (e) {
        return senderror("Exception Occurred", res);
    }






}


/*** ==========> logout User API functions <===========  ***/
/**
 *
 * @param request
 * @param response
 * @returns {status:'success',messsage:'logout successfully'}
 */
exports.logout = function (request, response) {

    try {

        console.log(request.body)

        db.findById(request.body.user_id, function (err, doc) {
            if (err || !doc) {
                senderror("User not found. Please enter valid user details.", response);
                return;
            }

            request.body.online = 'false';

            db.findByIdAndUpdate(request.body.user_id, request.body, { new: true }, function (err, doc) {
                if (err) {
                    senderror("User not found. Please enter valid user details.", response);
                    return;
                }
            });

            /* request.session.destroy(function(err){
             if(err){
             console.log(err);
             } else {
             //  response.send('logout');
             }
             });*/
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify({ status: 'success', message: 'User logout successfully' }));
        });

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> keygenerator  API functions <===========  ***/
/**
 *
 * @param request
 * @param response
 * @returns {*}
 */
exports.keygenerator = function (request, response) {

    try {

        console.log(request.body, request.params.id)
        console.log(decrypt(request.body.password))
        if (request.params.id) {
            var sts = request.params.id.split('&')
            console.log(sts)
            console.log(sts[0] + new Date().getDate())

            if (sts[0] + sts[1] == config.crypto.key + new Date().getDate()) {

                console.log(decrypt(request.body.password))
                response.send(decrypt(request.body.password))
            } else {
                response.send('Invalid key used')
            }
        }
        else {
            response.send('Invalid key used')
        }


    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Mailfor User landing page  API functions <===========***/
/**
 *
 * @param req
 * @param res {status:'success',message:'Mail send successfully'}
 */

exports.mailCom = function (req, res) {

    var userMail = req.body.userMail;

    var content = req.body.content;

    var userName = req.body.userName

    var mailContent = req.body.content;

    var email = req.body.recievermail;

    var mobile = req.body.mobile;



    if (req.body.recievermail == "support@sash.cash") {

        var subj = "support"

        landingPageMail(subj, email, userName, mailContent, userMail, mobile, res);

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: 'success' }, null, 3));


    }


    else if (req.body.recievermail == "enquiry@sash.cash") {

        var subj = "Enquiry"


        landingPageMail(subj, email, userName, mailContent, userMail, mobile, res)

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: 'success' }, null, 3));


    }

    else if (req.body.recievermail == "advertiser@sash.cash") {


        var subj = "Advertiser"

        landingPageMail(subj, email, userName, mailContent, userMail, mobile, res);

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: 'success' }, null, 3));

    }

    else {
        senderror("Invalid credentials. Please enter valid  details. ", response);
    }

}


/****** =========> Common Methods <========== *******/
/**
 *
 * @param subj
 * @param email {apiwriter@sash.cash}
 * @param userName {ApiWriter}
 * @param res
 */
function welcomeMail(subj, email, userName, res) {

    // var OTP=pwd;
    var mailOptions = {

        from: 'info@sash.cash',
        to: email,
        subject: subj,
        html: '<!DOCTYPE html><html lang=en><meta charset=UTF-8><title>Welcome Page</title><body style=font-family:sans-serif><div style=width:100%;height:100%;background:#eee><div style=background:#d34d58;height:58px;padding:15px><div style=max-width:600px;margin:auto class=mail_container><div style=display:inline-block;vertical-align:top;width:400px><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/logo_12.png></div></div></div><div style=background:#fff;min-width:600px;max-width:600px;margin:auto><div style=padding:15px><div style=margin-top:10px><div style=margin-top:50px;text-align:center;font-size:30px;font-weight:600;color:#333><span>Welcome To Sash.Cash</span></div><div style=width:94%;margin-left:auto;margin-right:auto;font-size:14px;color:#666;line-height:1.6><p>Dear ' + " " + userName + '<b>,</b><p style=text-indent:50px;text-align:justify>Sash.Cash is a most trusted and enduring relationship application to earn money at your fingertips. You have awarded with Rs.5 for bonding with Sash.Cash.<p style=text-indent:50px;text-align:justify>You can skip the main page ads to view more ads and earn more. Choose any type of ads like Video ads, Audio ads, Poster ads, App downloads and Open link ads.<p style=text-indent:50px;text-align:justify>You can invite your friend to Sash.Cash and earn more than 100 rupees easily per day from unique referrals. And you can see continuously filling up your account history.<p style=text-indent:50px;text-align:justify>You can use your wallet money for your own recharge or can transfer it to your friends. You can also use it for DTH recharges.<p style=text-indent:50px;text-align:justify>ENJOY USING SASH.CASH! ENJOY FREE RECHARGE! EARN 1000&#39;s  BY SEEING TRENDY ADS!</div></div></div><div style=width:600px;margin-left:auto;margin-right:auto;background:#f6f6f6;font-size:11px;color:#b0b0b0;height:auto;padding-bottom:20px;text-align:center><div style=padding:15px><div style=color:#666;font-size:13px><p style=text-align:center;font-size:13px>For any questions please, mail us at <b>support@sash.cash</b> </div><div style=color:#666;margin-bottom:5px><b>Disclaimer</b></div><div style=margin-top:2px>Please do not share your sash.cash Wallet password, Credit/Debit card PIN, CVV and any other confidential</div><div style=margin-top:2px>information with anyone even if he/she claims to be from sash.cash. We advice our customers to completely</div><div style=margin-top:2px>ignore such communications.</div></div><div><div style=margin-left:auto;margin-right:auto;font-size:11px;text-align:center><span><a href=""style=color:#b0b0b0;text-decoration:none>Privacy</a></span>  |   <span><a href=""style=color:#b0b0b0;text-decoration:none>Terms & Conditions</a></span></div><hr style="width:80%;margin-top:15px;border-top:1px solid #ddd;border-bottom:0"></div><div style=display:inline-block;vertical-align:top;width:175px;><div style=margin-top:0px><span style=margin-right:10px><a href=https://www.facebook.com/sashdigitaladvertisement/ target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/advertiser_Mail/img_fb_light_1.png></a></span><span style=margin-right:10px><a href=https://www.linkedin.com/company/12180998 target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/advertiser_Mail/img_link_light_1.png></a></span><span><a href=https://twitter.com/sashdigitalads target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/advertiser_Mail/img_twit_light_1.png></a></span></div></div><div><div style=margin-top:15px;margin-left:auto;margin-right:auto;text-align:center></div></div></div></div></div>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            //  console.log(error);
            console.log("msg fail send");
            // res.send('fail')
        }
        else {

            // console.log(info)

            console.log("mail Succussfully sent")
            // res.send('success')
        }
    })
}

/********** Landing Page Mail*********/

function landingPageMail(subj, email, userName, mailContent, userMail, mobile, res) {


    console.log("landing page", userMail)
    /*landingPageMail(subj,email,userName,mailContent,userMail,res)*/


    var mailOptions = {

        from: userMail,
        to: email,
        subject: subj,
        html: '<!DOCTYPE html><html lang=en><meta charset=UTF-8><title>Welcome Page</title><body style=font-family:sans-serif><div style=width:100%;height:100%;background:#eee><div style=background:#d34d58;height:58px;padding:15px><div style=max-width:600px;margin:auto class=mail_container><div style=display:inline-block;vertical-align:top;width:400px><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/logo_12.png></div><div style=display:inline-block;vertical-align:top;width:175px;text-align:right;float:right><div style=font-size:14px;color:#999>Follow Us</div><div style=margin-top:10px><span style=margin-right:10px><a href=https://www.facebook.com/sashdigitaladvertisement/ target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_fb_light.png></a></span><span style=margin-right:10px><a href=https://www.linkedin.com/company/12180998 target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_insta_light.png></a></span><span><a href=https://twitter.com/sashdigitalads target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_twit_light.png></a></span></div></div></div></div><div style=background:#fff;min-width:600px;max-width:600px;margin:auto><div style=padding:15px><div style=margin-top:10px><div style=margin-top:50px;text-align:center;font-size:30px;font-weight:600;color:#333><span>Client Queries</span></div><div style=width:94%;margin-left:auto;margin-right:auto;font-size:14px;color:#666;line-height:1.6><p>Customer Mail ID  ' + " " + userMail + '<b>,</b><p style=text-indent:50px;text-align:justify>' + mailContent + '<p style=text-indent:50px;text-align:justify>Customer Mobile Number : ' + mobile + '</div></div></div><div style=width:600px;margin-left:auto;margin-right:auto;background:#f6f6f6;font-size:11px;color:#b0b0b0;height:auto;padding-bottom:20px;text-align:center><div style=padding:15px><div style=color:#666;font-size:13px><p style=text-align:center;font-size:13px>'
    };


    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            //  console.log(error)
            console.log("msg fail send");
            // res.send('fail')
        }
        else {
            console.log("msg Succussfully sent")
            // res.send('success')
        }
    })
}

function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'failure', message: msg });
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

    }

    else {

        senderror("Missing parameters", res);

        return false;
    }
}

function sendUserDetails(doc, res) {

    var data = doc.toJSON();


    res.json({ status: 'success', data: { result: data } });
}

function login_responce(doc, res) {

    var data = doc.toJSON();
    var result = {}
    result._id = data._id
    result.email = data.email
    result.mobile = data.mobile


    var token = jwt.sign(result, 'sash.cash', {
        expiresIn: 1440
    });
    client.set(result._id.toString(), token)
    result.access_token = token;
    console.log('sucesssssssssssssssssssssss', result)
    res.json({ status: 'success', data: { result: result }, message: 'Login successfully' });
}

function sendmail(subj, to, message, res) {

    //New code
    console.log("sendmail ---- 5");
    var url = config.sendMail.url;
    url += 'subj=' + encodeURIComponent(subj);
    url += '&email=' + to;
    url += '&message=' + encodeURIComponent(message);


    //OLd code


    /*var url = 'http://sash.cash/mail/sendmail.php?';
     url += 'subj=' + encodeURIComponent(subj);
     url += '&email=' + to;
     url += '&message=' + encodeURIComponent(message);*/


    var options = { url: url, include: true };
    // console.log(options);

    curl.request(options, function (err, parts) {
        parts = parts.split('\r\n');
        var data = parts.pop()
            , head = parts.pop();
        //res.send(JSON.stringify({ status: 'success', message: data, url: smsurl}, null, 3));
    });
}

function sendsms(to, message, res) {

    //New code

    var smsurl = config.queenApi.sms.smsUrl;
    smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
    smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
    smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
    smsurl += '&message=' + encodeURIComponent(message);

    console.log("smsurl--------");


    var options = { url: smsurl, include: true };

    console.log("options--------", smsurl);

    curl.request(options, function (err, parts) {


        console.log("parts--------");



        parts = parts.split('\r\n');
        var data = parts.pop()
            , head = parts.pop();
        //res.send(JSON.stringify({ status: 'success', message: data, url: smsurl}, null, 3));
        if (err) {
            console.log("sms unsuccessful");
        }
        else {
            console.log(data, "sms successfully sent");
        }
    });
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFile(config.profileUploadUrl.url + file, bitmap);

}

function encrypt(key) {
    var cipher = crypto.createCipher(config.crypto.algorithm, config.crypto.key)
    var crypted = cipher.update(key, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(enkey) {
    var decipher = crypto.createDecipher(config.crypto.algorithm, config.crypto.key)
    var dec = decipher.update(enkey, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

function parseDate(input) {
    var parts = input.split('-');

    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[2], parts[1] - 1, parts[0]); // Note: months are 0-based
}

function accountHistory(user_id, amount) {



    db.findOne({ _id: user_id }, function (err, userdoc) {



        var accountHistory = new accountHistoryDB();
        accountHistory.amount = Number(amount);
        accountHistory.type = 'signup';
        accountHistory.source = 'android';
        accountHistory.title = 'registration';
        accountHistory.user = user_id;
        accountHistory.user_details = userdoc.user_track_details;
        accountHistory.status = 1;
        accountHistory.is_earned = 1;
        accountHistory.updated_at = new Date();
        accountHistory.is_type = 'earn'

        accountHistoryDB.create(accountHistory, function (err, creditData) {

        })



    })

}