(function() {

  //
  // - Global Variabls -
  //

  var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
  var isSafari  = (navigator.userAgent.indexOf('Safari') > 0 && navigator.userAgent.indexOf('Chrome') < 0) ? true : false;
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
        var cdata = data.callerData,
            trace;
        if(cdata) {
          trace = ' -- Called from ' + cdata.file + ':' + cdata.line + ':' + cdata.column + (cdata.callerName ? '(function ' + cdata.callerName + ')' : '');
        }

        var toLog;
        if (data.type == 'log' && data.config && data.config.clientSideStyles && !isSafari) {
          toLog = _stylize(data.data, trace);
        } else {
          toLog = data.data;
          if (trace) toLog.push(trace);
        }

        console[data.type].apply(console, toLog);
      } else {
        console.log(data);
      }
    }
  }


  //
  // - Websocket connection -
  //

  var host = location.protocol + '//<%= nomoHost %>:' + <%= nomoPort %>;
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


  //
  // -- Styling --
  //
  // utilizes the `%c`-style formatting, which is supported in Firebug and Chrome.
  //
  //

  var
  theStyles = {
    // styles
    '\033[24m'  : 'text-decoration: none',
    '\033[22m'  : 'font-weight: normal',
    '\033[1m'   :'font-weight: bold',
    '\033[3m'   :'font-style: italic',
    '\033[4m'   :'text-decoration: underline',
    '\033[23m'  :'font-style: normal',

    //color
    '\033[39m'  :'color: '       ,
    '\033[37m'  :'color: white'  ,
    '\033[90m'  :'color: grey'   ,
    '\033[30m'  :'color: black'  ,
    '\033[35m'  :'color: magenta',
    '\033[33m'  :'color: yellow' ,
    '\033[31m'  :'color: red'    ,
    '\033[36m'  :'color: cyan'   ,
    '\033[34m'  :'color: blue'   ,
    '\033[32m'  :'color: green'
  },

  // Styles for the caller data.
  traceStyle = 'color:grey; font-family:Helvetica, Arial, sans-serif',

  // RegExp pattern for styles
  pattern           = /(\033\[.*?m)+/g,
  // RegExp pattern for format specifiers (like '%o', '%s')
  formatPattern     = /(?:^|[^%])%(s|d|i|o|f|c)/g;

  function _stylize(data, cdata) {
    // If `data` has multiple arguments, we are going to merge everything into
    // the first argument, so style-specifiers can be used throughout all arguments.

    var cap,
        mergeArgsStart = 1,
        formatSpecifiers = [];

    // If the first argument is an object, we need to replace it with `%o`
    // (always preemptively reset the color)
    if (_.isObject(data[0])) {
      data.splice(1, 0, data[0]);
      data[0] = '\033[39m%o';
    }

    // Count all format specifiers in the first argument to see from where we need to
    // start merging
    while (cap = formatPattern.exec(data[0])) {
        mergeArgsStart++;
    }

    // Start merging...
    if (data.length > mergeArgsStart) {
      for (var i=mergeArgsStart; i<data.length; i++) {
        arg = data[i];
        var specifier;

        if (typeof arg == 'string') {
          // Since this argument is a string and may be styled as well, put it right in...
          specifier = ' ' + arg;
          // ...and remove the argument...
          data.splice(i, 1);
          // ...and adapt the iterator.
          i--;
        } else {
          // Otherwise use the '%o'-specifier (preemptively reset color)
          specifier = ' \033[39m%o';
        }

        data[0] += specifier;
      }
    }

    // Now let's collect all format specifiers and their positions as well,
    // so we know where to put our style-specifiers.
    while (cap = formatPattern.exec(data[0])) {
      formatSpecifiers.push(cap);
    }

    var added = 0,
        txt = data[0];

    // Let's do some styling...
    while (cap = pattern.exec(txt)) {

      var styles = [],
          capsplit = cap[0].split('m');

      // Get the needed styles
      for (var j=0; j<capsplit.length; j++) {
        var s;
        if (s = theStyles[capsplit[j] + 'm']) styles.push(s);
      }

      // Check if the style must be added before other specifiers
      if (styles.length) {
        var k;
        for (k=0; k<formatSpecifiers.length; k++) {
          sp = formatSpecifiers[k];
          if (cap['index'] < sp['index']) {
            break;
          }
        }

        // Add them at the right position
        pos = k + 1 + added;
        data.splice(pos, 0, styles.join(';'));
        added++;

        // Replace original with `%c`-specifier
        data[0] = data[0].replace(cap[0], '%c');
      }
    }
    // ...done!

    // At last, add caller data, if present.
    if (cdata) {
      data[0] += '%c' + cdata;
      data.push(traceStyle);
    }

    return data;
  }

})();
