(function() {

  //
  // - Global Variabls -
  //

  var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
  var msgBuffer = [];


  //
  // - Global Functions -
  //

  // NOTE: Modifies the passed object
  function prepSentData(data) {
    // Replace function placeholder's with actual functions
    (function freplace(rdata) {
      for(var prop in rdata) {
        if(typeof(rdata[prop]) == 'string' && rdata[prop].substr(0, 9) == 'function ') {
          // At some point in the future this could either call .toString() on the function or replace it with a version
          // of the function capable of making using a command to actually call the function over the websocket.
          try {
            eval('rdata[prop] = ' + rdata[prop]);
          } catch(err) {
            rdata[prop] = function() {};
          }
        } else if(_.isObject(rdata[prop])) {
          freplace(rdata[prop]);
        }
      }
    })(data);

    return JSON.retrocycle(data);
  }

  function logMsg(data) {
    if(isFirefox && !window.console.exception) {
      msgBuffer.push(data);
    } else {

      data.data = prepSentData(data.data);

      if(data.type && data.data) {
        var cdata = data.callerData;
        if(cdata) {
          data.data.push('-- Called from ' + cdata.file + ':' + cdata.line + ':' + cdata.column + (cdata.callerName ? '(function ' + cdata.callerName + ')' : ''));
        }
        console[data.type].apply(console, data.data);
      } else {
        console.log(data);
      }
    }
  }


  //
  // - Websocket connection -
  //

  var host = location.protocol + '//' + location.hostname + ':' + <%= nomoPort %>;
  var connection = io.connect(host, {
    'reconnect': true,
    'connect timeout': 4000,
    'max reconnection attempts': Infinity,
    'reconnection limit': Infinity
  });

  connection.on('connect', function() {
    logMsg(' ');
    logMsg(' /--------------------\\');
    logMsg('  Welcome to NodeMokey');
    logMsg(' \\--------------------/');
  });

  connection.on('reconnecting', function(delay, attempts) {
    if(delay > 4000) connection.socket.reconnectionDelay = 4000;
  });

  connection.on('console', function(data) {
    logMsg(data);
  });

  connection.on('disconnect', function() {
    msgBuffer = [];
  });


  // Interval for Firefox to log any buffered messages to the console as soon as it is opened
  //
  // The method to detect if Firebug is open may change. Look for changes here:
  //   http://stackoverflow.com/questions/398111/javascript-that-detects-firebug
  if(isFirefox) {
    var logInterval = setInterval(function() {
      if(msgBuffer.length && window.console.exception) {
        for(var i = 0; i < msgBuffer.length; i++) {
          logMsg(msgBuffer[i]);
        }

        msgBuffer = [];

        // There is no point in continuing because window.console.exception will always be defined
        // after Firebug is opened initially, even if it is closed while the page is loaded.
        clearInterval(logInterval);
      }
    }, 500);
  }



  //
  // -- NodeMonkey API --
  //

  window.nomo = {
    _cmdCall: 0,
    _callbacks: {},

    cmd: function(cmd, args, callback) {
      if(_.isFunction(args) && !callback) {
        callback = args;
        args = null;
      }

      var cmdId = ++nomo._cmdCall;
      connection.emit('cmd', {command: cmd, args: args, cmdId: cmdId});

      if(callback) {
        nomo._callbacks[cmdId] = callback;
      }
    },

    _response: function(resp) {
      resp.result = prepSentData(resp.result);
      var cb = nomo._callbacks[resp.cmdId];
      if(cb) {
        cb(resp.result, resp.error);
      }
    },

    profiler: {
      start: function() {
        nomo.cmd('profiler.start');
      },

      stop: function() {
        nomo.cmd('profiler.stop');
      },

      getData: function(callback) {
       nomo.cmd('profiler.getData', null, callback);
      }
    }
  };

  connection.on('cmdResponse', nomo._response);

})();
