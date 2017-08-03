/**
 * Created by sabash on 21/3/17.
 */



var mongoose = require('mongoose');

var UserAccountHistorySchema = new mongoose.Schema({

        amount : Number,
        type : String,
        source:String,
        is_earned:Number,
        is_type:String,

        campaign:{type: mongoose.Schema.ObjectId,
            ref: 'campaigns'},
        referral:{type: mongoose.Schema.ObjectId,
            ref: 'users'},
        transfer:{type: mongoose.Schema.ObjectId,
            ref: 'transfers'},
        recharge:{type: mongoose.Schema.ObjectId,
            ref: 'recharges'},
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        user_dateils: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking'
        },

        device_platform :String,
        updated_at: { type: Date, default: Date.now },
        is_active:{type: Number, default: 0},
        is_view:{type: Number, default: 0},
        is_click:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
        is_expired:{type: Number, default: 0},

    },
    {collection: 'account_history'}
);

module.exports = mongoose.model('account_history', UserAccountHistorySchema);
