/**
 * Created by sashcash on 2/14/17.
 */
var mongoose = require('mongoose');

var user_Activity_Schema = new mongoose.Schema({
        screen_name : String,
        status : String,
        event : String,
        type : String,
        source : String,
        source1:String,
        source2:String,
        source3:String,
        source4:String,
        source5:String,
        request: Array,
        response: Array,
        updated_at: {type: Date, default: Date.now},
        created_by: {type: String, default: 'web'},

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        user_details: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking'
        }
    },
    {collection: 'users_activity'}
);
module.exports = mongoose.model('users_activity', user_Activity_Schema);
