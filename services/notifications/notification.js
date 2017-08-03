// var config = require('./config');
var config = require('./../../controllers/conf');

var FCM = require('fcm-push');
var fcm = new FCM(config.pushNotify.serverKey);

/*** User  Referral notification  ***/

exports.referralNotify = function (userPush, userDetails) {

    var message = {

        // registration_ids: ["cTGhTOUvdj8:APA91bFDfUErYZQej3_qCGijof8CpuRO96pQSC67pZonRk17UyPXyUVHCX0wMrs-r8B9XVmI_qRKufubJ3IdAhiAmmjW0KwErilZiSumoficeZziPYGHvtPeMtBXOIUOVsXAF3pjZ94d","eoJ4qLrTvbM:APA91bEK9TC8P9qVw4QS4B9zhReenjQQHuNbUm45YynPJvxD_f65Eclr7kqkDViO6VhQOR2b5-pMZlvhoJjKHudpbArRMP2oe_SEE_eSrCcmtyHWYFuCxAqtPvLBKSlx4S6fP5NWKokf"],

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            "description": "You have earned Rs. 10 for referring " + userDetails.full_name,
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

exports.campaignListNotify=function(userPush,notifyData){

    var message={

        to:userPush,
        data:{
            "title": notifyData.title,
            "description": notifyData.type

        }
    }

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        }
        else {
            console.log("Successfully sent with response: ", response);
        }
    });

}

/*** User Welcome notification  ***/

exports.welcomeNotify = function (userPush, userDetails) {

    var message = {

        // registration_ids: ["cTGhTOUvdj8:APA91bFDfUErYZQej3_qCGijof8CpuRO96pQSC67pZonRk17UyPXyUVHCX0wMrs-r8B9XVmI_qRKufubJ3IdAhiAmmjW0KwErilZiSumoficeZziPYGHvtPeMtBXOIUOVsXAF3pjZ94d","eoJ4qLrTvbM:APA91bEK9TC8P9qVw4QS4B9zhReenjQQHuNbUm45YynPJvxD_f65Eclr7kqkDViO6VhQOR2b5-pMZlvhoJjKHudpbArRMP2oe_SEE_eSrCcmtyHWYFuCxAqtPvLBKSlx4S6fP5NWKokf"],

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            "description": "Sash.Cash is a most trusted and enduring relationship application to earn money at your fingertips"
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

/*** Wallet  notification  ***/

exports.walletNotify = function (userPush, userDetails) {

    var message = {

        // registration_ids: ["cTGhTOUvdj8:APA91bFDfUErYZQej3_qCGijof8CpuRO96pQSC67pZonRk17UyPXyUVHCX0wMrs-r8B9XVmI_qRKufubJ3IdAhiAmmjW0KwErilZiSumoficeZziPYGHvtPeMtBXOIUOVsXAF3pjZ94d","eoJ4qLrTvbM:APA91bEK9TC8P9qVw4QS4B9zhReenjQQHuNbUm45YynPJvxD_f65Eclr7kqkDViO6VhQOR2b5-pMZlvhoJjKHudpbArRMP2oe_SEE_eSrCcmtyHWYFuCxAqtPvLBKSlx4S6fP5NWKokf"],

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            "description": 'You have awarded with Rs.5 for bonding with Sash.Cash'
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}


/*** Recharge Failure notification  ***/

exports.rechargeNotifyFailure = function (userPush, rechargeObj, amount) {

    var message = {

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            //   "description": "Recharge of Rs. " + rechargeObj.amount + " for "+rechargeObj.mobile+" was successful. Thank you.",
            "description": "We have refunded the amount of Rs " + amount + " in your Sash.Cash wallet for your failed recharge . Thank you.",
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

/*** Recharge Success notification  ***/

exports.rechargeNotifySuccess = function (userPush, rechargeObj, amount) {

    var message = {

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            "description": "Recharge of Rs. " + amount + " for " + rechargeObj.mobile + " was successful. Thank you.",
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

/*** Transfer Success notification  ***/

exports.transferNotify = function (userPush, rechargeObj, amount) {

    var message = {

        to: userPush, // required fill with device token or topics

        data: {
            "title": 'Sash.Cash',
            "description": "Transfer of Rs. " + amount + " for " + rechargeObj.full_name + " was successful. Thank you.",
        }
    };

    fcm.send(message, function (err, response) {

        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}





