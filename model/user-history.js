/**
 * Created by sashcash on 2/14/17.
 */

var mongoose = require('mongoose');

var UsersHistorySchema = new mongoose.Schema({
        user_history : [{
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
               login_platform: String,  //previous name platform
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



               wallet:  { type: Number, default: 0},
               blocked: { type: String, default: '0'},
               updated_at: { type: Date, default: Date.now },
               register_date: { type: Date }}] ,


        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        }
    },
    {collection: 'users_history'}
);

module.exports = mongoose.model('users_history', UsersHistorySchema);
