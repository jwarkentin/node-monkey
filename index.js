var _ = require('underscore');
var httpServer = require('http');
var socketIO = require('socket.io');
var fs = require('fs');
//var clientJS = fs.readFileSync('./client.js');
var profiler = require('./profiler.js');

function NodeMonkey() {
  this.config = {};
  this.msgbuffer = [];

  this.profiler = new profiler();
}

_.extend(NodeMonkey.prototype, {
  profiler: null,

  setConfig: function(config) {
    this.config = _.extend({
      host: '0.0.0.0',
      port: '50500',
      suppressOutput: true,
      saveOutput: true,
      silent: false
    }, config || {});

    this.config.profiler = _.extend({
      activeOnStart: true
    }, this.config.profiler || {});

    this.profiler.setConfig(this.config.profiler);

    return this;
  },

  consoleMsg: function(type, data) {
    // Send to open sockets if there is at least one, otherwise buffer
    var consoleData = {type: type, data: Array.prototype.slice.call(data)};
    if(!this.iosrv || !_.keys(this.iosrv.sockets.sockets).length) {
      this.clog('No clients - buffering');
      this.msgbuffer.push(consoleData);
    } else {
      this.iosrv.sockets.emit('console', consoleData);
    }

    // Dump to console if requested
    if(!this.config.suppressOutput) {
      var msgFunc = 'c' + type;
      if(this[msgFunc]) this[msgFunc].apply(console, arguments);
    }
  },

  // If there are multiple clients that are reconnecting, we want to give them a little time
  // so we can send any buffered messages to as many as possible
  trySendBuffer: _.debounce(function() {
    if(this.msgbuffer.length) {
      for(var i = 0; i < this.msgbuffer.length; i++) {
        this.iosrv.sockets.emit('console', this.msgbuffer[i]);
      }

      this.msgbuffer = [];
    }
  }, 800),

  replaceConsole: function() {
    var that = this;

    this.clog = console.log;
    this.cwarn = console.warn;
    this.cerror = console.error;

    console.log = function() {
      that.consoleMsg('log', arguments);
    };

    console.warn = function() {
      that.consoleMsg('warn', arguments);
    };

    console.error = function() {
      that.consoleMsg('error', arguments);
    };

    return this;
  },

  start: function(config) {
    var that = this;

    this.setConfig(config);

    var socketIOSrc = 'http://' + this.config.host + ':' + this.config.port + '/socket.io/socket.io.js';
    this.srv = httpServer.createServer(function(req, res) {
      if(req.url.indexOf('socket.io') === 1) {
      } else if(req.url == '/client.js') {
        var clientJS = fs.readFileSync(__dirname + '/client.js');
        res.end(clientJS);
      } else if(req.url == '/underscore.js') {
        res.end(fs.readFileSync('./node_modules/underscore/underscore-min.js'));
      } else {
        res.end('<html><head><title>Node Monkey</title><script type="text/javascript" src="' +  socketIOSrc + '"></script><script type="text/javascript" src="/underscore.js"></script><script type="text/javascript" src="/client.js"></script><head><body>Open your console to see output</body></html>');
      }
    }).listen(this.config.port, this.config.host);
    this.iosrv = socketIO.listen(this.srv);
    this.iosrv.set('log level', 1);
    this.iosrv.enable('browser client minification');
    this.iosrv.enable('browser client etag');
    this.iosrv.enable('browser client gzip');

    this.iosrv.sockets.on('connection', function(socket) {
      that.trySendBuffer();

      socket.on('cmd', function(cmd) {
        var callObj = ['that'].concat(cmd.command.split('.').slice(0, -1)).join('.');
        socket.emit('cmdResponse', { cmdId: cmd.cmdId, result: eval('that.' + cmd.command + '.apply(' + callObj + ', cmd.args);') });
      });
    });

    this.replaceConsole();

    if(!this.config.silent) {
      this.clog('------------------');
      this.clog('NodeMonkey started');
      this.clog('To inspect output, open a browser to: http://' + this.config.host + ':' + this.config.port);
      this.clog('------------------');
      this.clog(' ');
    }

    return this;
  }
});


module.exports = new NodeMonkey();
