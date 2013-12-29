var crypto = require('crypto'),
    scrypt = require('scrypt'),
    eventEmitter = require('events').EventEmitter,
    _ = require('lodash');


var sessman = _.extend(new eventEmitter(), {
  activeSessions: {},

  createSession: function(data, options, done) {
    data = typeof(data) == 'string' ? data : JSON.stringify(data);
    options = _.extend({
      timeout: 300
    }, options);

    // We don't want to overwrite an existing session.
    var sessId, sessHash;
    while(sessman.activeSessions[sessHash = crypto.createHash('md5').update(data + (sessId = parseInt(Math.random() * 1000000, 10))).digest('hex')]) {
      continue;
    }

    sessman.activeSessions[sessHash] = {
      createTime: parseInt(Date.now() / 1000),
      touchTime: parseInt(Date.now() / 1000),
      timeout: options.timeout,
      data: data,
      sessionId: sessId
    };

    done(null, sessHash);
  },

  destroySession: function(hash) {
    delete sessman.activeSessions[hash];

    this.emit('destroySession', hash);
  },

  touchSession: function(hash) {
    if(sessman.activeSessions[hash]) {
      sessman.activeSessions[hash].touchTime = parseInt(Date.now() / 1000);
    }
  },

  validateSession: function(hash, data, done) {
    data = typeof(data) == 'string' ? data : JSON.stringify(data);

    if(sessman.activeSessions[hash]) {
      var sessdata = sessman.activeSessions[hash];

      if(sessdata.data == data) {
        done(null, true);
        return;
      }
    }

    done(null, false);
  }
});

// Cleanup sessions once a minute
setInterval(function() {
  var now = parseInt(Date.now() / 1000);
  _.each(sessman.activeSessions, function(session, sessionId) {
    if((now - session.touchTime) > session.timeout) {
      sessman.destroySession(sessionId);
    }
  });
}, 60000);

module.exports = sessman;