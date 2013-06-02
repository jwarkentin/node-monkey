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
          trace = '-- Called from ' + cdata.file + ':' + cdata.line + ':' + cdata.column + (cdata.callerName ? '(function ' + cdata.callerName + ')' : '');
        }

        // style the output in `%c`-style. Does not work in Safari though
        var toLog = isSafari ? data.data : stylize(data.data, trace);
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
    'text-decoration: none'         : '\033[24m', // reset
    'font-weight: normal'           : '\033[22m', // reset
    'font-weight: bold'             : '\033[1m',
    'font-style: italic'            : '\033[3m',
    'text-decoration: underline'    : '\033[4m',
    'font-style: normal'            : '\033[23m',

    //color
    'color: '                       : '\033[39m', // reset
    'color: white'                  : '\033[37m',
    'color: grey'                   : '\033[90m',
    'color: black'                  : '\033[37m',
    'color: magenta'                : '\033[35m',
    'color: yellow'                 : '\033[33m',
    'color: red'                    : '\033[31m',
    'color: cyan'                   : '\033[36m',
    'color: blue'                   : '\033[34m',
    'color: green'                  : '\033[32m'
  },

  traceStyle = 'color:grey; font-family:Helvetica, Arial, sans-serif',

  // regular expressions
  pattern           = /(\033\[.*?m)+/g,
  formatPattern     = /%(s|d|i|o|f|c)/g;

  function stylize(data, cdata) {
    
    var formatSpecifiers = [],
        exceedingArgs = 0,
        cap,
        txt;

    if (data.length > 1) {
      // check for format specifiers
      txt = data[0];
      while (cap = formatPattern.exec(txt)) {
        formatSpecifiers.push(cap);
      }
    }

    var argsl = data.length - 1; // length of additional arguments

    // nasty hack when there are less specifiers than additional arguments (is handled differently in firebug and chrome)
    // we add the remaining specifiers at the end of the data array.
    if (!formatSpecifiers.length) {
      data = [data.join(' ')];
      txt = data[0];
    } else
    if (formatSpecifiers.length > argsl) {
      var remainingSpecifiers = formatSpecifiers.slice(argsl);
      for (var j=0; j<remainingSpecifiers.length; j++) {
        data.push(remainingSpecifiers[j][0]);
      }
    } else
    // memorize number of arguments at the end, so we can add the caller data appropriately
    if (formatSpecifiers.length < argsl) {
      exceedingArgs = argsl - formatSpecifiers.length;
    }

    var added = 0;
    while (cap = pattern.exec(txt)) {

      var styles = [],
          capsplit = cap[0].split('m');

      // get the needed styles
      for (var i=0; i<capsplit.length; i++) {
        for (var s in theStyles) {
          if (theStyles[s] == capsplit[i] + 'm') {
            styles.push(s);
          }
        }
      }

      // see if the style must be added before other specifiers
      if (styles.length) {
        var found;
        for (i=0; i<formatSpecifiers.length; i++) {
          sp = formatSpecifiers[i];
          if (cap['index'] < sp['index']) {
            found = i;
            break;
          }
        }

        // add at the right position
        if (found !== undefined) {
          pos = i + 1 + added;
          data.splice(pos, 0, styles.join(';'));
          added++;
        } else {
          data.push(styles.join(';'));
        }

        // replace with `%c`
        data[0] = data[0].replace(cap[0], '%c');
      }
    }

    // add caller data
    if (cdata) {
      if (exceedingArgs > 0) data[0] += data.splice(data.length - exceedingArgs).join('');
      data[0] += '%c' + cdata;
      data.push(traceStyle);
    }
    
    return data;
  }




})();
