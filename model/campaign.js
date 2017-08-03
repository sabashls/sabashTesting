/**
 * Created by sabash ls on 01/11/16.
 */

var mongoose = require('mongoose');

var CampaignsSchema = new mongoose.Schema({

        type: String, //poster,video,homepage,audio,link,appdownload,tablebg
        title: String, //campaignn name
        total: String, //cost to user
        duration: String,
        min_age: Number,
        max_age: Number,
        order_id: [String],
        campaign_id: String,
        language: String,
        payment_mode: String,
        payment_status :String,

        tax :Number,
        total_cost: Number,  //Total cost to user
        cost: Number,
        ios_cost :Number,
        web_cost :Number,
        android_cost :Number,
        commission :Number,

        ios_clicks: Number,
        web_clicks: Number,
        android_clicks: Number,

        weband_clicks: Number,

        advertiser: {
            type: mongoose.Schema.ObjectId,
            ref: 'advertisers',
        },
        /** No Of Clicks **/
        clicks: Number,

        /**Campaigns Types Files**/
        image: String,
        video: String,
        audio: String,
        link: String,
        app_name: String,

        /** Campaign Start and End Date no**/
        created_date: {type: Date, default: Date.now},
        start_date: {type: Date},
        end_date: {type: Date},

        /** Campaigns Size  **/
        poster_size: String, //1x, 2x, 3x, 4x
        video_size: String, //500KB, 1 NB, 1.5MB, 2MB
        app_size: String, //7.5MB, 10MB, 12.5MB, 15MB, 17.5MB, 20MB, 22.5MB, 50MB


        description: String,
        app_ratings: String,
        app_cost: String,
        author: String,

        campaign_status: {type: String}, //possible status: pending, awaiting, active, completed, rejected
        campaign_platform: [String], //ios, android, web, all
        campaign_country: String, //api
        campaign_professional: String, //api
        campaign_marital_status: [String], //api
        campaign_state: String, //api
        campaign_city: String, //api
        campaign_town: String, //api
        campaign_gender: [String], //male, female, both
        content_verifiedBy: String,
        payment_verifiedBy: String,
        reject_reason: String,
        updated_at: {type: Date, default: Date.now},

        rehost_campaign :{
            type: mongoose.Schema.ObjectId,
            ref: 'campaigns',
        },
        uuid: String,

        is_android:{type: Number, default: 0},
        is_web:{type: Number, default: 0},
        is_ios:{type: Number, default: 0},
        is_weband:{type: Number, default: 0},

        is_android_view:{type: Boolean, default: true},
        is_web_view:{type: Boolean, default: true},
        is_ios_view:{type: Boolean, default: true},
        is_weband_view:{type: Boolean, default: true},

        is_active:{type: Number, default: 0},
        is_view:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},


    },
    {collection: 'campaigns'}
);

var ImageSchema = new mongoose.Schema({
    url: {type: String},
    created: {type: Date, default: Date.now}
});
var Image = mongoose.model('images', ImageSchema);

module.exports = mongoose.model('campaigns', CampaignsSchema);

