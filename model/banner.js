/**
 * Created by sabash on 3/4/17.
 */



var mongoose = require('mongoose');

var BannerSchema = new mongoose.Schema({

        status: String,
        category:String,
        type: String,
        url: String,
        sort : String,
        name : String,
        banner_logo_ios : String,
        banner_logo_android : String,
        country : String,
        device : Array,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        amount: Number,
        updated_at: {type: Date, default: Date.now},
        created_date: {type: Date, default: Date.now},
        experied_date: {type: Date, default: Date.now},

        is_active:{type: Number, default: 0},
        is_block:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
    },
    {collection: 'shopper_banner'}
);

module.exports = mongoose.model('shopper_banner', BannerSchema);