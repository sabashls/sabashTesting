/**
 * Created by sashcash on 2/14/17.
 */
var mongoose = require('mongoose');

var Users_Tracking_Schema = new mongoose.Schema({
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
        verified: String,
        facebook_id: String,
        google_id: String,
        login_platform: String,
        referral_code: String,
        referred_by: String,
        device_id: String,
        push_token: String,
        device_type: String,
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
        sdk_version: String,
           /* track_id:Number,*/
        updated_at: {type: Date, default: Date.now},

            user: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'users'
        },
        wallet: {type: Number},
        blocked: {type: String, default: 0},
        register_date: {type: Date},
        verified_date: {type: Date}
    },
    {collection: 'users_tracking'}
);

module.exports = mongoose.model('users_tracking', Users_Tracking_Schema);
