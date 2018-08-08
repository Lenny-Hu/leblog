const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');
const path = require('path');

const transport = new (winston.transports.DailyRotateFile)({
  filename: path.resolve(__dirname, 'logs/custom-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

// transport.on('rotate', function(oldFilename, newFilename) {
//   // do something fun
// });

const logger = new (winston.Logger)({
  transports: [
    transport
  ]
});

module.exports = logger;
