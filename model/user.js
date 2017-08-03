var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({
        full_name: String,
        username: String,
        email: String,
        password: String,
        mobile: String,
        image: String,
        state: String,
        city: String,
        town: String,
        current_location: String,
        latitude: String,
        longitude: String,
        dob: String,
        gender: String,
        age: String,
        marital_status: String,
        profession: String,
        verification_code: String,
        verified: {type: Number, default: 0},
        facebook_id: String,
        google_id: String,
        login_platform: String,  //previous name platform
        referral_code: String,
        referred_by: String,
        device_id: String,
        push_token: String,
        device_model: String,
        online: String,
        user_type: String,
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
        users_history: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_history'
        },
        wallet: {type: Number, default: 0},
        blocked: {type: Number, default: 0},
        updated_at: {type: Date, default: Date.now},
        register_date: {type: Date,default: Date.now},
        verified_date: {type: Date,default: Date.now},

        is_active:{type: Number, default: 0},
        is_block:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
    },

    {collection: 'users'}
);

module.exports = mongoose.model('users', UsersSchema);
