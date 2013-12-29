var libssh = require('ssh'),
    fs = require('fs'),
    async = require('async'),
    _ = require('lodash'),
    exec = require('child_process').exec,
    logger = require(__dirname + '/../logger.js');

function sshi(options) {
  var that = this;
  this.options = _.extend({}, options || {});

  this._requiredOpts(['port', 'hostKeydir']);

  this._rsaHostKey = options.rsaHostKey || (this.options.hostKeydir + '/host_rsa_key');
  this._rsa1HostKey = options.rsa1HostKey || (this.options.hostKeydir + '/host_rsa1_key');
  this._dsaHostKey = options.dsaHostKey || (this.options.hostKeydir + '/host_dsa_key');

  this._ready = _.Deferred();
  this.ensureHostKeys(function(err) {
    if(err) {
      logger.error(err);
      return;
    }

    that._server = libssh.createServer({
      hostRsaKeyFile: that._rsaHostKey,
      hostDsaKeyFile: that._dsaHostKey
    });

    that._server.on('connection', function(session) {
      session.on('auth', function(message) {
        console.log(message);
        if(that.options.userKeydir && message.subtype == 'publickey') {
          var userKey = that.options.userKeydir + '/' + message.authUser;
          fs.exists(userKey, function(exists) {
            if(exists) {
              fs.readFile(userKey, {encoding: 'utf8'}, function(err, data) {
                if(err) {
                  message.replyDefault();
                } else {
                  if(message.comparePublicKey(data)) {
                    message.replyAuthSuccess();
                  }
                }
              });
            } else {
              message.replyDefault();
            }
          });
        }

        if(that.options.authMod && message.subtype == 'password') {
          that.options.authMod.authUser(message.authUser, message.authPassword, function(err, result) {
            if(result) {
              message.replyAuthSuccess();
            } else {
              logger.verbose('[Auth Error] ' + err);
              message.replyDefault();
            }
          });
        }
      });

      session.on('channel', function(channel) {
        channel.on('end', function() {
          logger.verbose('Channel closed');
        });

        channel.on('subsystem', function(message) {
          console.log('subsystem', message);
        });

        channel.on('pty', function(message) {
          console.log('PTY', message);
          message.replySuccess();
        });

        channel.on('shell', function(message) {
          console.log('Shell', message);

          message.replySuccess();

          channel.write('Hi!');

          process.stdin
            .pipe(channel.pipe(channel))
            .pipe(process.stdout);
        });
      });
    });

    that._server.on('close', function() {
      logger.info("SSH server stopped");
    });


    that._ready.resolve();
  });
}

_.extend(sshi.prototype, {
  _requiredOpts: function(opts) {
    var that = this;

    _.each(opts, function(opt) {
      if(!_.has(that.options, opt)) {
        throw new Error("Missing required option '" + opt + "'");
      }
    });
  },

  startServer: function() {
    var that = this;

    _.when(this._ready).done(function() {
      that._server.listen(that.options.port);
    });
  },

  stopServer: function() {
    if(this._server) {
      this._server.close();
    }
  },

  ensureHostKeys: function(onComplete) {
    var that = this;

    async.parallel({
      rsa: function(done) {
        if(!fs.existsSync(that._rsaHostKey)) {
          that.generateKey('rsa', that._rsaHostKey, done);
        } else {
          done();
        }
      },

      rsa1: function(done) {
        if(!fs.existsSync(that._rsa1HostKey)) {
          that.generateKey('rsa1', that._rsa1HostKey, done);
        } else {
          done();
        }
      },

      dsa: function(done) {
        if(!fs.existsSync(that._dsaHostKey)) {
          that.generateKey('dsa', that._dsaHostKey, done);
        } else {
          done();
        }
      }
    }, function(err, results) {
      var success = true,
          errors = [];

      _.each(results, function(args) {
        if(args && args[0]) {
          success = false;
          errors.push(args[0].message.trim());
        }
      });

      if(_.isFunction(onComplete)) {
        if(success) {
          onComplete();
        } else {
          onComplete("[Error] Failed generating SSH host keys. Cannot continue!\n" + errors.join('\n'));
        }
      }
    });
  },

  generateKey: function(type, filename, done) {
    exec("ssh-keygen -N '' -t " + type + " -f " + filename, function(err, stdout, stderr) {
      done(null, arguments);
    });
  }
});


module.exports = sshi;