var app = require('../index');

var user = require('../services/user/user');
var tracking = require('../services/tracking/tracking');


app.post('/api/v1/mobile/deviceTracking',tracking.device_tracking)


app.post('/api/v1/mobile/userTracking',tracking.user_tracking)


app.post('/api/v1/mobile/activityTracking',tracking.activity_tracking)
