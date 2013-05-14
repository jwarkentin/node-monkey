require(__dirname + '/src/cycle.js');
var _ = require('lodash');
var httpServer = require('http');
var socketIO = require('socket.io');
var fs = require('fs');

//var clientJS = fs.readFileSync('./client.js');
var clientHTML = _.template(fs.readFileSync(__dirname + '/src/client.html').toString());
var profiler = require(__dirname + '/src/profiler.js');

function NodeMonkey() {
  var that = this;

  // Maintain internal references to any functions we will use or override
  this.clog = console.log;
  this.cwarn = console.warn;
  this.cerror = console.error;
  this.cdir = console.dir;

  this.config = {};
  this.msgbuffer = [];
  this.commands = {};

  this.profiler = new profiler();

  this.registerCommand({
    cmd: 'profiler.start',
    callback: that.profiler.start,
    context: that.profiler,
    description: 'Start the profiler'
  });

  this.registerCommand({
    cmd: 'profiler.stop',
    callback: that.profiler.stop,
    context: that.profiler,
    description: 'Stop the profiler'
  });

  this.registerCommand({
    cmd: 'profiler.getData',
    callback: that.profiler.getData,
    context: that.profiler,
    description: 'Get the data the profiler has collected'
  });

  this.registerCommand({
    cmd: 'profiler.clearData',
    callback: that.profiler.clearData,
    context: that.profiler,
    description: 'Clear the data the profiler has collected'
  });
}

_.extend(NodeMonkey.prototype, {
  profiler: null,

  setConfig: function(config) {
    this.config = _.extend({
      host: '0.0.0.0',
      port: '50500',
      overrideConsole: true,
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

  prepSendData: function(data) {
    // Decycle
    var sendData = JSON.decycle(data);

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

  consoleMsg: function(type, data) {
    var that = this;

    // Capture file and line number of caller. Unfortunately, the API doesn't seem to allow it, so instead we'll just have to parse it out.
    var stack = (new Error()).stack.toString().split('\n');
    var caller = stack[3]; // First line is just 'Error'
    var callerData = caller.match(/at (.*) \((.*):(.*):(.*)\)/);
    if(!callerData) callerData = caller.match(/at ()(.*):(.*):(.*)/);
    callerData = {
      callerName: callerData[1],
      file: callerData[2],
      line: parseInt(callerData[3]),
      column: parseInt(callerData[4])
    };

    // Send to open sockets if there is at least one, otherwise buffer
    var sendData = this.prepSendData(Array.prototype.slice.call(data));

    var consoleData = {type: type, data: sendData, callerData: callerData};
    if(!this.iosrv || !_.keys(this.iosrv.sockets.sockets).length) {
      //this.clog('No clients - buffering');
      this.msgbuffer.push(consoleData);
    } else {
      try {
        this.iosrv.sockets.emit('console', consoleData);
      } catch(err) {
        this.cerror('Failed sending message: ' + err);
      }
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

  revertConsole: function() {
    console.log = this.clog;
    console.warn = this.cwarn;
    console.error = this.cerror;
    console.dir = this.cdir;
  },

  /**
   * Register a command that can be run from the client
   *
   * @param  object options   Command info. Valid options are as follows:
   *                            cmd           (string) The command (case sensitive)
   *                            callback      The function that will be called and passed any arguments when the given command is run
   *                            description   (optional) A helpful description of the command
   *                            context       (optional) The context of 'this' when the given callback is called
   */
  registerCommand: function(options) {
    var cmd = options.cmd;
    if(this.commands[cmd]) {
      throw new Error("There is already a command registered as '" + cmd + "'");
    }

    this.commands[cmd] = options;
  },

  start: function(config) {
    var that = this;

    this.setConfig(config);

    this.srv = httpServer.createServer(function(req, res) {
      if(req.url.indexOf('socket.io') === 1) {
      } else if(req.url == '/client.js') {
        res.end(_.template(fs.readFileSync(__dirname + '/src' + req.url).toString(), {nomoHost: that.config.host, nomoPort: that.config.port}));
      } else if(req.url == '/cycle.js') {
        res.end(fs.readFileSync(__dirname + '/src' + req.url));
      } else if(req.url == '/lodash.js') {
        res.end(fs.readFileSync(require.resolve('lodash')));
      } else {
        res.end(clientHTML());
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
        var result = null, error = null;
        if(that.commands[cmd.command]) {
          try {
            var cmdOpts = that.commands[cmd.command];
            result = cmdOpts.callback.apply(cmdOpts.context ? cmdOpts.context : that, cmd.args);
          } catch(err) {
            error = err.message;
          }
        } else {
          error = "There is no registered command for '" + cmd.command + "'";
        }

        try{
          socket.emit('cmdResponse', { cmdId: cmd.cmdId, result: that.prepSendData(result), error: error });
        } catch(err) {
          that.clog('Failed sending message: ' + err);
        }

        //var callObj = ['that'].concat(cmd.command.split('.').slice(0, -1)).join('.');
        //socket.emit('cmdResponse', { cmdId: cmd.cmdId, result: eval('that.' + cmd.command + '.apply(' + callObj + ', cmd.args);') });
      });
    });

    if(this.config.overrideConsole) {
      this.replaceConsole();
    }

    if(!this.config.silent) {
      this.clog('------------------');
      this.clog('NodeMonkey started');
      this.clog('To inspect output, open a browser to: http://' + this.config.host + ':' + this.config.port);
      this.clog('------------------');
      this.clog(' ');
    }

    return this;
  },

  stop: function() {
    this.revertConsole();

    this.iosrv.disconnect();
    delete this.iosrv;

    this.srv.close();
    delete this.srv;
  }
});


module.exports = new NodeMonkey();
