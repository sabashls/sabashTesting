/**
 * Created by sabash on 14/6/17.
 */

'use strict'
const winston = require('winston');
/*let logTransports = [new (winston.transports.Console)
({
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'debug'
})
];*/
//if (process.env.LOG_PATH && process.env.LOG_PATH !== '') {
let logTransports = ([
    new winston.transports.File({
        name: 'info-file',
        level: 'info',
        filename: process.env.LOG_PATH || './logs/filelog-info.log',
        handleExceptions: true,
        humanReadableUnhandledException: true
    }),
    new winston.transports.File({
        name: 'error-file',
        level: 'error',
        filename: process.env.LOG_PATH || './logs/filelog-error.log',
        handleExceptions: true,
        humanReadableUnhandledException: true
    })
]);
//}

// let logger = new (winston.Logger)({
//     transports: logTransports,
//     exitOnError: process.env.NODE_ENV === 'development' ? true : false,
//     level: ['production', 'preproduction'].indexOf(process.env.NODE_ENV) !== -1 ? 'info' : 'silly',
//     json: true
//     //maxsize: 5242880, //Max size of each file will be 5MB
//     //maxFiles: 10, // Max of 10 files 5 mb each will be created
// });


var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            level: 'debug'
        }),
        new (winston.transports.File)({
            name: 'info-file',
            filename: process.env.LOG_PATH || './logs/filelog-info.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: process.env.LOG_PATH || './logs/filelog-error.log',
            level: 'error'
        })
    ]
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

module.exports = logger;