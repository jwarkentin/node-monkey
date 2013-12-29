var scrypt = require('scrypt'),
    async = require('async'),
    _ = require('lodash'),
    fs = require('fs'),
    logger = require(__dirname + '/logger.js');

_.mixin(require('underscore.deferred'));

try {
  var pam = require('authenticate-pam');
} catch(err) {
  logger.warn("Failed loading 'authenticate-pam' module. System user authentication will not be available.");
}

/**
 * Call the given callback if it is defined passing it all subsequent after the callback. Whatever `this` is will be set
 * as the context for the callback. Use `call` or `apply` as desired to control `this` for the callback.
 *
 * @param  {Function} cb  The callback to call
 * @return {Boolean}  Whether or not a callback was called
 */
function callCb(cb) {
  if(_.isFunction(cb)) {
    cb.apply(this, Array.prototype.slice.call(arguments, 1));

    return true;
  }

  return false;
}


function mauth(options) {
  var that = this;

  /**
   * Options:
   *
   *   scryptAuthFile: String or array of files to load users from for scrypt based auth
   *   systemAuth: Whether to try to auth against system users. Default: true
   *   authPriority: An array of auth types to try and the order in which to try them. Default: ['scrypt', 'system']
   */
  this.options = _.extend({
    systemAuth: true,
    authPriority: ['scrypt', 'system']
  }, options || {});

  this._scryptUsersLoader = _.Deferred();
  this._loadScryptUsers(function(err) {
    if(!err) {
      that._scryptUsersLoader.resolve();
    } else {
      that._scryptUsersLoader.reject(err.message);
    }
  });
}

_.extend(mauth.prototype, {
  _loadScryptUsers: function(done) {
    this._scryptUsers = {};
    if(this.options.scryptAuthFile && this.options.authPriority.indexOf('scrypt') != -1) {
      if(!fs.existsSync(this.options.scryptAuthFile)) {
        this.writeAuthFile({}, done);
      } else {
        try {
          this._scryptUsers = JSON.parse(fs.readFileSync(this.options.scryptAuthFile, {encoding: 'utf8'}));
        } catch(err) {
          callCb(done, new Error("Error loading scrypt users from file '" + this.options.scryptAuthFile + "': " + err.message));
        }
      }

      callCb(done);
    }

    // We didn't load anything because we weren't supposed to
    callCb(done);
  },

  writeAuthFile: function(data, done) {
    var that = this;

    // Write the new latest user info to file
    fs.writeFile(this.options.scryptAuthFile, JSON.stringify(data, null, '  '), {encoding: 'utf8', mode: 416}, function(err) {
      if(err) {
        that._scryptUsersLoader = _.Deferred();
        that._loadScryptUsers(function() {
          that._scryptUsersLoader.resolve();

          if(_.isFunction(done)) {
            done(err);
          }
        });
      } else {
        if(_.isFunction(done)) {
          done(err);
        }
      }
    });
  },

  addUser: function(user, pwd, options, done) {
    var that = this;

    if(_.isFunction(options) && !done) {
      done = options;
      options = null;
    }

    options = _.extend({
      maxtime: 0.2,
      maxmem: null,
      maxmemfrac: null
    }, options || {});

    _.when(this._scryptUsersLoader).done(function() {
      if(!options.update && that._scryptUsers[user]) {
        callCb(done, new Error("Cannot add user '" + user + "': User already exists"));
      }

      var userData = {
        pwd: scrypt.passwordHash(pwd, options.maxtime, options.maxmem, options.maxmemfrac, function(err, pwdhash) {
          if(!err) {
            // Copy the data and only add the user to our actual object if the save is successful, otherwise the user doesn't have permission
            var saveData = _.cloneDeep(that._scryptUsers);
            saveData[user] = {
              pwd: pwdhash
            };

            that.writeAuthFile(saveData, function(err) {
              if(!err) {
                that._scryptUsers[user] = saveData[user];
              }

              callCb(done, err);
            });
          } else {
            callCb(done, err);
          }
        })
      };
    });
  },

  setPwd: function(user, pwd, options, done) {
    var that = this;

    if(_.isFunction(options) && !done) {
      done = options;
      options = null;
    }

    _.when(this._scryptUsersLoader).done(function() {
      if(!that._scryptUsers[user]) {
        callCb(done, new Error("Failed setting new pass word for user '" + user + "': User does not exist"));
      }

      that.addUser(user, pwd, _.extend(options || {}, {update: true}), done);
    });
  },

  delUser: function(user, done) {
    var that = this;

    _.when(this._scryptUsersLoader).done(function() {
      if(that._scryptUsers[user]) {
        // Copy the data and only delete the user from our actual object if the save is successful, otherwise the user doesn't have permission
        var saveData = _.cloneDeep(that._scryptUsers);
        delete saveData[user];

        that.writeAuthFile(saveData, function(err) {
          if(!err) {
            delete that._scryptUsers[user];
          }

          callCb(done, err);
        });
      }
    });
  },

  authUser: function(user, pw, done) {
    var that = this;

    _.when(this._scryptUsersLoader).done(function() {
      var errors = {};

      async.eachSeries(that.options.authPriority, function(item, cb) {
        if(item == 'scrypt') {
          if(!that._scryptUsers[user]) {
            errors.scrypt = "User '" + user + "' does not exist";

            // Try next auth method
            cb();
          } else {
            scrypt.verifyHash(that._scryptUsers[user].pwd, pw, function(err, result) {
              if(result) {
                // We don't need to continue to iterate
                cb('done');
              } else {
                errors.scrypt = err.message;

                // Try next auth method
                cb();
              }
            });
          }
        } else if(item == 'system') {
          pam.authenticate(user, pw, function(err) {
            if(!err) {
              cb('done');
            } else {
              errors.system = err;

              // Try next auth method
              cb();
            }
          });
        }
      }, function(err) {
        if(err) {
          callCb(done, null, true);
        } else {
          // If there is an error it means we succeeded and exited the iteration early. Otherwise we failed and need to handle it.
          callCb(done, JSON.stringify(errors, null, '  '), false);
        }
      });
    });
  }
});


module.exports = mauth;