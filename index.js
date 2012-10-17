var _ = require('underscore');
var httpServer = require('http');
var socketIO = require('socket.io');
var fs = require('fs');
//var clientJS = fs.readFileSync('./client.js');

function NodeMonkey() {
  this.config = {};
  this.msgbuffer = [];
}

_.extend(NodeMonkey.prototype, {
  consoleMsg: function(type, data) {
    // Send to open sockets if there is at least one, otherwise buffer
    var consoleData = {type: type, data: Array.prototype.slice.call(data)};
    if(!this.iosrv || !this.iosrv.sockets.length) {
      this.msgbuffer.push(consoleData);
    } else {
      for(var i = 0; i < this.iosrv.sockets.length; i++) {
        this.iosrv.sockets[i].emit('console', consoleData);
      }
    }

    // Dump to console if requested
    if(!this.config.suppressOutput) {
      var msgFunc = 'c' + type;
      if(this[msgFunc]) this[msgFunc].apply(console, arguments);
    }
  },

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
  },

  start: function(config) {
    var that = this;

    this.config = _.extend({
      host: '0.0.0.0',
      port: '5678',
      suppressOutput: true,
      saveOutput: true
    }, config || {});

    var socketIOSrc = 'http://' + this.config.host + ':' + this.config.port + '/socket.io/socket.io.js';
    this.srv = httpServer.createServer(function(req, res) {
      if(req.url.indexOf('socket.io') === 1) {
      } else if(req.url == '/client.js') {
        var clientJS = fs.readFileSync('./client.js');
        res.end(clientJS);
      } else {
        res.end('<html><head><title>Node Monkey</title><script type="text/javascript" src="' +  socketIOSrc + '"></script><script type="text/javascript" src="/client.js"></script><head><body>Open your console to see output</body></html>');
      }
    }).listen(this.config.port, this.config.host);
    this.iosrv = socketIO.listen(this.srv);
    this.iosrv.set('log level', 1);
    this.iosrv.enable('browser client minification');
    this.iosrv.enable('browser client etag');
    this.iosrv.enable('browser client gzip');

    this.iosrv.sockets.on('connection', function(socket) {
      if(that.msgbuffer.length) {
        for(var i = 0; i < that.msgbuffer.length; i++) {
          socket.emit('console', that.msgbuffer[i]);
        }

        that.msgbuffer = [];
      }
    });

    this.replaceConsole();
  }
});


module.exports = new NodeMonkey();