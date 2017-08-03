/**
 * Created by sabash on 16/3/17.
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
        user_dateils: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        device_platform :String,

        type: String,
        updated_at: { type: Date, default: Date.now },
        is_active:{type: Number, default: 0},
        is_view:{type: Number, default: 0},
        is_click:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
        is_Expired:{type: Number, default: 0},

    },
    {collection: 'campaignclicks'}
);

module.exports = mongoose.model('campaignclicks', CampaignViewsSchema);
