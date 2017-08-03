/**
 * Created by sabash ls on 01/11/16.
 **/


/***  =============>  Sash Cash NPM Modules Dependency  <=============   ***/

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./controllers/db');
const http = require('http');
const config = require('./controllers/conf');
const cors = require('cors');
const fs = require("fs");
const app = module.exports = express();
const router = express.router
const path = require('path');
const https = require('https');
const morgan = require('morgan');
const logger = require('./lib/logger');
const helmet = require('helmet');
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, './public')));

app.use(cors());

app.use(helmet({frameguard: {action: 'deny'}}))

app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '150mb',
    extended: true
}));


app.use(cors());

var enableCORS = function (request, response, next) {
    response.header('Access-Control-Allow-Origin', request.headers.origin);
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Date, X-Date');
    return next();
};

app.use(enableCORS);

//console.log('Limit file size: '+limit);

var requestLog = function (request, response, next) {
    var details;
    details = {
        client: request.ip,
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body
    };
    var tag = "request";
    next();
};
app.use(requestLog);


http.createServer(app).listen(config.http.port, function () {


    console.log('===========================================================');

    console.log('Sever running on the port :' + config.http.port)

    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')

    console.log('Sever connect configuration file :' + config.config_file)

    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')

    console.log('Sever connected with :' + config.database.db + ' Database Schema');

    console.log('===========================================================')

})



app.get('/data', function (req, res) {
    res.send(req.connection.remoteAddress)
})

app.get('/', function (req, res) {
    res.send('API Working successfully')
})


logger.info('testing')



require('./routes/android_routes_api');
require('./routes/tracking_routes');



