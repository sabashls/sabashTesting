/**
 * Created by sabash ls on 01/11/16.
 */

var db = require('./../../model/user');
var accountHistoryDB = require('./../../model/account_history');
var userCreditDB = require('./../../model/userCredit');
var userTrackDB = require('./../../model/user-tracking');
var userActivityDB = require('./../../model/user-activity');
var userHistory = require('./../../model/user-history');
var referral = require('./../../model/referral');
var masterDB = require('./../../model/master');
var view = require('./../../model/campaignview');
var config = require('./../../controllers/conf');
var Notify = require('../../services/notifications/notification');

var async = require('async')

// var Notify = require('./../../controllers/notification');
var curl = require('curlrequest');
var fs = require("fs");
var crypto = require('crypto');

var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var nodemailer = require('nodemailer');
var jwt    = require('jsonwebtoken');


var us = require('underscore')

var randomstring = require("randomstring");
var random = randomstring.generate({
    length: 6,
    charset: 'alphanumeric',
    capitalization:'uppercase'
});

/***--------->  Session Authentication  Here <--------***/






var transporter = nodemailer.createTransport("SMTP",{

    service: 'gmail',
    debug: true,
    auth: {
        user: 'noreply@sash.cash',
        pass: 'sash@cash123'
    }
});


var secretKey="SashCash";

app.set('superSecret',secretKey);


exports.verification = function (req, res) {

    try {
        console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        console.log(req.body,'dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        var user = new db(req.body);
        var verification_code =req.body.verification_code;
        var users;
        var referralAmount;

        db.findOne({_id:req.body.user_id}, function (err, doc) {

            if (err || !doc) {
                senderror("Invalid verification code. Please enter a valid code!", res);
                return;
            } else {
                    console.log(doc , verification_code)
                if (doc.verification_code == verification_code) {
                console.log(1,doc.verified_date , new Date())
                    if (doc.verified_date > new Date()) {
                        console.log(12)
                        var data = doc.toJSON();

                        db.update({'email': data.email}, {$set: {verified: 1, blocked: 0}}, function (err, user) {

                            if (err || !user) {

                                senderror("User not found. Please enter valid user details.", res);
                                return;
                            }
                            else {
                                console.log(13)
                                users = data;
                                if (users.referred_by) {
                                    console.log(14)
                                    db.findOne({
                                        "referral_code": users.referred_by,
                                        verified: 1,
                                        blocked: 0
                                    }).exec(function (frnerr, frndoc) {

                                        if (frnerr) {
                                            res.json({
                                                status: 'success',
                                                message:'OTP verified successfully'
                                            })
                                        }
                                        else {
                                            console.log(15,users.referred_by)
                                            var frnuserdata = JSON.parse(JSON.stringify(frndoc));
                                            var referrals = new referral();

                                            referral.find({referral_code: users.referred_by}, function (error, refercount) {

                                                if (error) {
                                                    senderror("User not found. Please enter valid user details.", res);
                                                    return
                                                }
                                                else {
                                                    console.log(data._id, 16, refercount.length)

                                                    masterDB.findOne({
                                                        type: "referralcost",
                                                        "attribute": users.device_platform
                                                    }, function (Err, refferalData) {

                                                        var  amount = Number(refferalData.value);

                                                    if (refercount[0].referral_user.length < 10) {


                                                            referralAmount = (amount * 100) / 100



                                                    }
                                                    else if ((refercount[0].referral_user.length >= 10) && (refercount[0].referral_user.length < 20)) {


                                                            referralAmount = (amount * 80) / 100


                                                    }
                                                    else if ((refercount[0].referral_user.length >= 20) && (refercount[0].referral_user.length < 30)) {

                                                            referralAmount = (amount * 60) / 100


                                                    }
                                                    else if ((refercount[0].referral_user.length >= 30) && (refercount[0].referral_user.length < 40)) {

                                                            referralAmount = (amount * 40) / 100


                                                    }
                                                    else if ((refercount[0].referral_user.length >= 40) && (refercount[0].referral_user.length < 50)) {

                                                            referralAmount = (amount * 20) / 100

                                                    }

                                                    else {
                                                        referralAmount = 0
                                                        console.log(referralAmount, 'wallet ios:0 & android|web : 0')


                                                    }

                                                    console.log(referralAmount, 'refferallllllllllllllllAmounttttttttttttttt')

                                                    referral.findOne({referral_user: {$elemMatch: {user: data._id}}}, function (referralerrs, userchecks) {

                                                        if (referralerrs || !userchecks) {

                                                            console.log('referrral find user 1')
                                                            var referrals = new referral();
                                                            referral.find({}, function (error, referralcount) {

                                                                var referral_count = referralcount.length + 1;
                                                                referrals.referral_id = "SCR00" + referral_count;
                                                                referrals.status = 1;
                                                                referrals.total_amount = 0;
                                                                referrals.referral_code = data.referral_code
                                                                referrals.user = data._id;
                                                                referrals.type = 'referral';
                                                                referrals.referred_by = [{
                                                                    user: frnuserdata._id,
                                                                    reffered_date: new Date(),
                                                                    user_details: frnuserdata.users_history
                                                                }]
                                                                referrals.__v = 1,
                                                                    referral.create(referrals, function (error, referraldoc) {

                                                                        if (error) {
                                                                            console.log(19)
                                                                        }
                                                                        else {
                                                                            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                                                                            console.log(18, users.user_track_details)
                                                                            console.log(188888888888888, data)
                                                                            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                                                                            referral.update({referral_code: users.referred_by}, {
                                                                                $addToSet: {
                                                                                    referral_user: {
                                                                                        user: users._id,
                                                                                        amount: referralAmount,
                                                                                        user_details: users.user_track_details
                                                                                    }
                                                                                }
                                                                            }, function (err1, updata) {

                                                                                if (err1) {
                                                                                    console.log(21)
                                                                                }
                                                                                else {

                                                                                    console.log(20)
                                                                                    var updateWallet = Number(frnuserdata.wallet) + Number(referralAmount)

                                                                                    db.update({referral_code: users.referred_by}, {$set: {wallet: Number(updateWallet)}}, function (errors, upRefferal) {

                                                                                        if (errors) {
                                                                                            console.log(23)
                                                                                            senderror("User not found. Please enter valid user details.", res);
                                                                                            return
                                                                                        }
                                                                                        else {
                                                                                            console.log(22)
                                                                                            referral.findOne({referral_code: users.referred_by}, function (error, refercounts) {
                                                                                                var totalAmount = Number(refercounts.total_amount) + Number(referralAmount)
                                                                                                referral.update({referral_code: users.referred_by}, {$set: {total_amount: Number(totalAmount)}}, function (error, refercounts) {


                                                                                                })


                                                                                                /*** ====== user Account history DB created ===== ***/

                                                                                                var accountHistory = new accountHistoryDB();
                                                                                                accountHistory.amount = Number(referralAmount);
                                                                                                accountHistory.type = 'referral';
                                                                                                accountHistory.source = 'referral';
                                                                                                accountHistory.referral = data._id;
                                                                                                accountHistory.user_details = frndoc.user_track_details;
                                                                                                accountHistory.user = frndoc._id
                                                                                                accountHistory.status = 1;
                                                                                                accountHistory.updated_at = new Date();
                                                                                                accountHistory.is_type = 'earn'

                                                                                                accountHistoryDB.create(accountHistory, function (err, creditData) {

                                                                                                    if (err) {
                                                                                                        senderror("User not found. Please enter valid user details.", res);
                                                                                                        return

                                                                                                    }
                                                                                                    else {
                                                                                                        res.json({
                                                                                                            status: 'success',
                                                                                                            message: 'OTP verified successfully'
                                                                                                        })

                                                                                                    }

                                                                                                })

                                                                                            })


                                                                                        }

                                                                                    })


                                                                                }
                                                                            })

                                                                        }

                                                                    })

                                                            })

                                                        }
                                                        else {

                                                            console.log(userchecks, 'referrral find user else 1')
                                                            /*  var referrals = new referral();

                                                             referral.find({}, function (error, referralcount) {

                                                             var referral_count = referralcount.length + 1;
                                                             referrals.referral_id = "SCR00" + referral_count;
                                                             referrals.status = 0;
                                                             referrals.total_amount = 0;
                                                             referrals.referral_code = data.referral_code
                                                             referrals.user = data._id;
                                                             referrals.type = 'referral';
                                                             referrals.__v = 0,

                                                             referral.create(referrals, function (error, referraldoc) {
                                                             if (error) {
                                                             senderror("user not found", res);
                                                             }
                                                             else {
                                                             res.json({status: 'success',message:'OTP verified successfully'});
                                                             }
                                                             })
                                                             })*/
                                                            res.json({
                                                                status: 'success',
                                                                message: 'OTP verified successfully'
                                                            });

                                                        }

                                                    })

                                                })
                                                }

                                            })
                                        }


                                    })

                                }
                                else {
                                    var referrals = new referral();


                                            referral.find({}, function (error, referralcount) {

                                                var referral_count = referralcount.length + 1;
                                                referrals.referral_id = "SCR00" + referral_count;
                                                referrals.status = 0;
                                                referrals.total_amount = 0;
                                                referrals.referral_code = data.referral_code
                                                referrals.user = data._id;
                                                referrals.type = 'referral';
                                                referrals.__v = 0,

                                                    referral.create(referrals, function (error, referraldoc) {
                                                        if (error) {
                                                            senderror("user not found", res);
                                                        }
                                                        else {
                                                            res.json({status: 'success',message:'OTP verified successfully'});
                                                        }
                                                    })
                                            })




                                }
                            }
                        })
                    }
                    else {
                        /***  Expertied date  **/
                        console.log('Expired time')
                        senderror("OTP code has been expired. Please try again", res);
                    }
                }
                else {
                    console.log(-1)
                    /*** verify code ***/
                    senderror("Invalid verification code", res);
                }
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





/****** =========> Refferal Methods <========== *******/

exports.referralHistory = function (req, res) {
    var data = req.body.user_id;
    var select_date = req.body.select_date;
    var conObj = {}
    var resObj = {};

    if (data) {
        conObj['_id'] = req.body.user_id
    } else {
        conObj['_id'] = '';
    }

    db.findOne(conObj, function (err, userdocs) {
        if (err || !userdocs) {
            senderror("User not found. Please enter valid user details.", res);
            return;
        }
        else {

            var referObj = {};
            var userdoc = userdocs.toJSON()
            var referCode = userdoc.referral_code;

            if (select_date) {
                var date = new Date(req.body.select_date);
                date.setHours(0, 0, 0, 0);
                var endDate = new Date(date);
                endDate.setHours(23, 59, 59, 59);
                referObj = {user: req.body.user_id, updated_at: {$gte: date, $lt: endDate}}

            } else {
                referObj = {user: req.body.user_id}

                console.log("referral_codeithu",referObj)
            }
            referral.findOne(referObj).populate('referral_user.user').populate('referral_user.user_details').exec(function (err, result) {

                if (err) {
                    senderror("User not found. Please enter valid user details.", res);
                    return;
                } else {
                    console.log(JSON.stringify(result))
                    resObj['status'] = 'success';
                    resObj['referralList'] = result
                    res.json(resObj)
                }

            })
        }
    })
}


function referralCalculation(platform,percentage) {
   var resultData
    masterDB.findOne({type:"referralcost","attribute" :platform },function (Err,refferalData) {
        console.log(refferalData.value,'referralCalculation')
       var  amount = Number(refferalData.value);
       console.log(amount,'referralCalculation')
        resultData =  (amount*percentage)/100
        console.log(resultData,'referralCalculation')
    })
return resultData;

}



function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status: 'failure', message: msg}, null, 3));
}

