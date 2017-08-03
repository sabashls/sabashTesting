var mongoose = require('mongoose');

var AdvertiserSchema = new mongoose.Schema({
        role: String,
        advertiser_id: String,
        firstname: String,
        lastname: String,
        email: String,
        password: String,
        mobile:String,
        company: String,
        company_url:String,
        address:String,
        advertiser_type:String,
        target_audience:String,
        average_monthly_spend:String,
        bank_details: String,
        incharge:
            [{
                name : String,
                email : String,
                mobile : String
            }],
        preferredlocation : String,
        //address:{ type : Array , "default" : [] },
        verification_id: String,
        verified: String,

        updated_at: { type: Date, default: Date.now }
    },
    {collection: 'advertisers'}
);

module.exports = mongoose.model('advertisers', AdvertiserSchema);
