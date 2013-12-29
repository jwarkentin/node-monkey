var fs = require('fs'),
    express = require('express'),
    socketIO = require('socket.io'),
    _ = require('lodash'),
    path = require('path'),
    sessMan = require(__dirname + '/../session-manager.js'),
    nmutil = require(__dirname + '/../util.js'),
    logger = require(__dirname + '/../logger.js'),
    stateEvents = require(__dirname + '/../state-events.js');

function webi(options) {
  var that = this;

  this.options = _.extend({}, options || {});
  this.auth = this.options.authMod;

  this._registerEvent(['startServer', 'stopServer']);

  this._sessionSockets = {};
  sessMan.on('destroySession', function(hash) {
    var socket = that._sessionSockets[hash];
    if(socket) {
      socket.disconnect();
      delete that._sessionSockets[hash];
    }
  });

  this.expressApp = this._expressApp();
}

_.extend(webi.prototype, stateEvents, {
  startServer: function() {
    if(this._server) return;

    this._resetEvent('stopServer');

    var that = this;

    var ssl = this.options.ssl;
    if(ssl.key && ssl.cert) {
      this._secure = true;
      this._server = require('https').createServer({
        key: fs.readFileSync(ssl.key),
        cert: fs.readFileSync(ssl.cert)
      }, this.expressApp).listen(this.options.port, this.options.host);
    } else {
      this._secure = false;
      this._server = require('http').createServer(this.expressApp).listen(this.options.port, this.options.host);
    }

    // Setup Socket.IO
    this._iosrv = socketIO.listen(this._server);

    this._iosrv.set('log level', 1);
    this._iosrv.enable('browser client minification');
    this._iosrv.enable('browser client etag');

    this._iosrv.set('authorization', function(handshakeData, callback) {
      var result = null, error = null;

      if(!that.auth) {
        result = true;
      } else if(handshakeData.headers.cookie) {
        handshakeData.cookie = nmutil.parseCookies(handshakeData.headers.cookie);

        if(handshakeData.cookie.sessionId) {
          sessMan.validateSession(handshakeData.cookie.sessionId, {address: handshakeData.address.address, userAgent: handshakeData.headers['user-agent']}, callback);
        } else {
          result = false;
          error = 'Missing session cookie';
        }
      } else {
        result = false;
        error = 'No cookies passed for auth';
      }

      if(result !== null) {
        callback(error, result);
      }
    });

    this._iosrv.sockets.on('connection', function(socket) {
      socket.sessionKeepalive = setInterval(function() {
        if(!socket.disconnected) {
          sessMan.touchSession(socket.handshake.cookie.sessionId);
        }
      }, that.options.sessionTimeout * 1000);

      sessMan.touchSession(socket.handshake.cookie.sessionId);

      that._sessionSockets[socket.handshake.cookie.sessionId] = socket;
      socket.on('disconnect', function() {
        delete that._sessionSockets[socket.handshake.cookie.sessionId];
      });
    });

    this._completeEvent('startServer');
  },

  stopServer: function() {
    if(!this._server) return;

    this._resetEvent('startServer');

    this._iosrv.disconnect();
    this._server.close();

    delete this._iosrv;
    delete this._server;

    this._completeEvent('stopServer');
  },

  _expressApp: function() {
    var that = this,
        app = express();

    var ctMap = {
      html: 'text/html',
      css: 'text/css'
    };

    var fileMap = {
      '/': {
        location: that.options.paths.templates + '/index.tpl',
        type: 'html',
        render: function(data) {
          return _.template(data, {
            secure: that._secure
          });
        }
      },

      '/lib/jquery.js': that.options.paths.node_modules + '/jquery/dist/jquery.min.js',
      '/lib/lodash.js': require.resolve('lodash'),
      '/lib/cycle.js': require.resolve('cycle'),
      '/lib/require.js': that.options.paths.node_modules + '/requirejs/require.js',

      '/scripts/main.js': {
        location: that.options.paths.scripts + '/main.js',
        render: function(data) {
          return _.template(data, {
            authEnabled: Boolean(that.auth),
            host: that.options.host,
            port: that.options.port
          });
        }
      },


      // Actions

      '/auth': {
        requestType: 'post',
        type: 'text/plain',
        handler: function(req, res) {
          req.on('data', function(data) {
            if(!that.auth) {
              res.end(JSON.stringify({result: true}));
              return;
            }

            try {
              data = JSON.parse(data.toString());
            } catch(err) {
              logger.verbose("Error parsing auth request: " + err.message);
              res.end(JSON.stringify({result: false, error: 'Error parsing request. Invalid JSON data.'}));
              return;
            }

            if(!data.username || !data.password) {
              res.end(JSON.stringify({result: false, error: 'Missing username or password'}));
            } else {
              that.auth.authUser(data.username, data.password, function(errors, result) {
                if(result) {
                  sessMan.createSession({address: req.connection.remoteAddress, userAgent: req.headers['user-agent']}, {timeout: that.options.sessionTimeout}, function(err, sessHash) {
                    res.end(JSON.stringify({result: true, sessionId: sessHash, error: null}));
                  });
                } else {
                  logger.verbose(errors);
                  res.end(JSON.stringify({result: false, error: 'Authentication failure'}));
                }
              });
            }
          });
        }
      },

      '/logout': {
        type: 'text/plain',
        handler: function(req, res) {
          var cookies = nmutil.parseCookies(req.headers.cookie);
          if(cookies.sessionId) {
            sessMan.destroySession(cookies.sessionId);
            res.end(JSON.stringify({result: true, error: null}));
          } else {
            res.end(JSON.stringify({result: false, error: 'No session cookie found'}));
          }
        }
      }
    };

    _.each(fileMap, function(location, uri) {
      var fileData = {};
      if(_.isObject(location)) {
        fileData = location;
        location = fileData.location;
      }

      app[fileData.requestType || 'get'](uri, function(req, res) {
        if(location) {
          var fext = location.match(/\.([^\.]+)$/);
          if(fext) fext = fext[1];
          if(ctMap[fext]) fileData.type = fext;
        }

        if(fileData.type) {
          res.setHeader('Content-Type', ctMap[fileData.type] || fileData.type);
        }

        if(fileData.handler) {
          fileData.handler(req, res);
        } else {
          var fname = path.normalize((location[0] != '/' ? (__dirname + '/lib/') : '') + location);
          if(_.isFunction(fileData.render)) {
            var file = fs.readFile(fname, {encoding: 'utf8'}, function(err, data) {
              if(err) {
                logger.error(err.message);
              } else {
                if(_.isFunction(fileData.render)) {
                  res.send(fileData.render(data));
                } else {
                  res.send(data);
                }
              }
            });
          } else {
            res.sendfile(fname);
          }
        }
      });
    });


    // Static directories

    app.use('/scripts', express.static(that.options.paths.scripts));
    app.use('/css', express.static(that.options.paths.css));

    return app;
  }
});


module.exports = webi;