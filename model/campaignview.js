/**
 * Created by sabash ls on 01/11/16.
 */
var mongoose = require('mongoose');

var CampaignViewsSchema = new mongoose.Schema({
        campaign: {
            type: mongoose.Schema.ObjectId,
            ref: 'campaigns'
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        user_detail: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking'
        },
        advertiser: {
            type: mongoose.Schema.ObjectId,
            ref: 'advertisers'
        },
        uuid: String,
        type: String,
        deviceuid: String,
        pushtoken: String,
        user_status: String,
        device_platform: String,
        devicemodel: String,
        updated_at: { type: Date, default: Date.now },
        Expired_date: { type: Date},
        is_active:{type: Number, default: 0},
        is_view:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
        is_Expired:{type: Number, default: 0},
    },
    {collection: 'campaignviews'}
);

module.exports = mongoose.model('campaignviews', CampaignViewsSchema);
