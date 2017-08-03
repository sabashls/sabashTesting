/**
 * Created by sabash on 17/3/17.
 */


var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({

        current_location: String,
        latitude: String,
        longitude: String,
        device_id: String,
        push_token: String,
        device_model: String,
        app_version: String,
        os_version: String,
        ip_address: String,
        screen_resolution: String,
        device_manufacturer: String,
        unique_id: String,
        device_platform: String,
        os_name: String,
        install_from:String,
        sdk_version: String,
        user_track_details: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking'
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        updated_at: {type: Date, default: Date.now},
        install_date: {type: Date,default: Date.now},


        is_active:{type: Number, default: 0},
        is_block:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
    },

    {collection: 'device_tracking'}
);

module.exports = mongoose.model('device_tracking', UsersSchema);
