/**
 * Created by sabash on 16/3/17.
 */


/**
 * Created by sabash on 16/3/17.
 */


var db = require('./../../../model/campaign');
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

exports.tableBGList = function (req, res) {

    console.log('campaignList')
    res.send({status:'success',data:{result:[]}})



}


/*** ==========> Specific Home page Campaign  API functions <===========***/

exports.completeTableBGCampaign = function (req, res) {

    res.send({status:'success',data:{result:{}}})
}


/*** ==========> complete Home page Campaign API functions <===========***/

exports.specificTableBG = function (req, res) {

    res.send({status:'success',data:{result:{}}})
}




/** Common Methods  **/

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


