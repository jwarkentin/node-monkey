var _ = require('lodash'),
    cycle = require('cycle');

function webinspector(options) {
  var that = this;
  this.options = _.extend({}, options);

  this.webi = this.options.webInterface;
  this._origConsole = _.clone(console);
  this.msgbuffer = [];

  this.webi.onState('startServer', function() {
    that.webi._iosrv.sockets.on('connection', function(socket) {
      socket.emit('console', [{
        type: 'log',
        config: that.options.client,
        logData: ['%cWelcome to Node Monkey\n%c----------------------', 'font-weight: bold', 'font-weight: normal']
      }]);
      socket.emit('console', that.msgbuffer);
    });
  });
}

_.extend(webinspector.prototype, {
  prepLogData: function(data) {
    // Decycle
    var sendData = cycle.decycle(data);

    // Replace function()'s with placeholders
    (function freplace(rdata) {
      for(var prop in rdata) {
        if(_.isFunction(rdata[prop])) {
          // At some point in the future this could replace it with a version of the function capable of making
          // a command to actually call the function over the websocket.
          rdata[prop] = rdata[prop].toString();
        } else if(_.isObject(rdata[prop])) {
          freplace(rdata[prop]);
        }
      }
    })(sendData);

    return sendData;
  },

  consoleMsg: function(type, logData) {
    var that = this;

    var caller, callerData;
    if(this.options.client.showCalledFrom) {
      // Capture file and line number of caller. Unfortunately, the API doesn't seem to allow it, so instead we'll just have to parse it out.
      var stack = (new Error()).stack.toString().split('\n');
      caller = stack[3]; // First line is just 'Error'
      callerData = caller.match(/at (.*) \((.*):(.*):(.*)\)/);
      if(!callerData) callerData = caller.match(/at ()(.*):(.*):(.*)/);
      if(callerData) {
        callerData = {
          callerName: callerData[1],
          file: callerData[2],
          line: parseInt(callerData[3]),
          column: parseInt(callerData[4])
        };
      }
    }

    var msgTime = new Date();
    var sendMsg = {
      timestamp: _.str.sprintf('%s-%s-%s %s:%s:%s',
        msgTime.getFullYear(),
        _.str.pad(msgTime.getMonth() + 1, 2, '0'),
        _.str.pad(msgTime.getDate(), 2, '0'),
        _.str.pad(msgTime.getHours(), 2, '0'),
        _.str.pad(msgTime.getMinutes(), 2, '0'),
        _.str.pad(msgTime.getSeconds(), 2, '0')
      ),
      type: type,
      config: this.options.client,
      callerData: callerData,
      logData: this.prepLogData(Array.prototype.slice.call(logData))
    };

    this.msgbuffer.push(sendMsg);
    while(this.msgbuffer.length > this.options.bufferLength) {
      this.msgbuffer.shift();
    }

    this.webi._iosrv.sockets.emit('console', [sendMsg]);

    // Dump to console if requested
    if(!this.options.silenceTerminal) {
      this._origConsole[type].apply(this._origConsole, logData);
    }
  },

  enable: function() {
    var that = this;

    console.log = function() {
      that.consoleMsg('log', arguments);
    };

    console.warn = function() {
      that.consoleMsg('warn', arguments);
    };

    console.error = function() {
      that.consoleMsg('error', arguments);
    };

    console.dir = function() {
      that.consoleMsg('dir', arguments);
    };

    return this;
  },

  disable: function() {
    _.extend(console, this._origConsole);
  },
});


module.exports = webinspector;