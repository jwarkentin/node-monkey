var winston = require('winston'),
    _ = require('lodash');

_.str = require('underscore.string');

var logger = new (winston.Logger)();

function tsFn() {
  var d = new Date();
  return _.str.sprintf('%s-%s-%s %s:%s:%s',
    d.getFullYear(),
    _.str.pad(d.getMonth() + 1, 2, '0'),
    _.str.pad(d.getDate(), 2, '0'),
    _.str.pad(d.getHours(), 2, '0'),
    _.str.pad(d.getMinutes(), 2, '0'),
    _.str.pad(d.getSeconds(), 2, '0')
  );
}


//
//  Useful options to pass to these functions include things like 'level', 'filename' (for file transport)
//


logger.addConsoleLog = function(options) {
  logger.add(winston.transports.Console, _.extend({
    handleExceptions: false,
    colorize: true,
    timestamp: tsFn
  }, options || {}));
};

logger.addFileLog = function(options) {
  logger.add(winston.transports.File, _.extend({
    handleExceptions: false,
    colorize: false,
    json: false,
    timestamp: tsFn
  }, options || {}));
};


module.exports = logger;