/**
 * Created by sabash ls on 01/11/16.
 */
var mongoose = require('mongoose');

var FeedbacksSchema = new mongoose.Schema({
  user_id: {
	type: mongoose.Schema.ObjectId,
	ref: 'users',
  },
  email: String,
  mobile: String,
  feedback: String,
  rating: String,
  updated_at: { type: Date, default: Date.now },
},
{collection: 'feedbacks'}
);

module.exports = mongoose.model('feedbacks', FeedbacksSchema);