define([
  '/lib/lodash.js',
  '/lib/cycle.js'
], function(_, cycle) {

  var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
  var isSafari  = (navigator.userAgent.indexOf('Safari') > 0 && navigator.userAgent.indexOf('Chrome') < 0) ? true : false;
  var msgBuffer = [];


  function webconsole(options) {
    var that = this;

    this.options = _.extend({}, options);
    this.ioConnection = this.options.ioConnection;

    this.ioConnection.on('console', function(messages) {
      // `data` should always be an array of messages now
      if(_.isArray(messages)) {
        _.each(messages, function(message) {
          that._logMsg(message);
        });
      } else {
        console.error("Received bad data from server (should be an array): " + messages);
      }
    });

    this.styleConfig = _.merge({
      termMap: {
        '\u001b[24m' : 'text-decoration: none',
        '\u001b[22m' : 'font-weight: normal',
        '\u001b[1m'  : 'font-weight: bold',
        '\u001b[3m'  : 'font-style: italic',
        '\u001b[4m'  : 'text-decoration: underline',
        '\u001b[23m' : 'font-style: normal',

        //color
        '\u001b[39m' : 'color: ',
        '\u001b[37m' : 'color: white',
        '\u001b[90m' : 'color: grey',
        '\u001b[30m' : 'color: black',
        '\u001b[35m' : 'color: magenta',
        '\u001b[33m' : 'color: yellow',
        '\u001b[31m' : 'color: red',
        '\u001b[36m' : 'color: cyan',
        '\u001b[34m' : 'color: blue',
        '\u001b[32m' : 'color: green'
      },

      traceStyle: 'color:grey; font-family:Helvetica, Arial, sans-serif',
    }, this.options.styleConfig || {});


    this.stylePatterns = {
      // Pattern for terminal escape codes
      termCode: /(\u001b\[.*?m)+/g,

      // Pattern for format specifiers (like '%o', '%s')
      format: /(?:^|[^%])%(s|d|i|o|f|c)/g
    };
  }

  _.extend(webconsole.prototype, {
    // NOTE: Modifies the passed object
    _prepSentData: function(data) {
      // Replace function placeholder's with actual functions
      (function freplace(rdata) {
        for(var prop in rdata) {
          if(typeof(rdata[prop]) == 'string' && rdata[prop].substr(0, 9) == 'function ') {
            // At some point in the future this could either call .toString() on the function or replace it with a version
            // of the function capable of using a command to actually call the remote function over the websocket.
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

      return cycle.retrocycle(data);
    },

    _logMsg: function(message) {
      if(isFirefox && !window.console.exception) {
        msgBuffer.push(message);
      } else {
        message.logData = this._prepSentData(message.logData);

        if(message.type && message.logData) {
          var cdata = message.callerData,
              trace;

          if(cdata) {
            trace = ' -- Called from ' + cdata.file + ':' + cdata.line + ':' + cdata.column + (cdata.callerName ? '(function ' + cdata.callerName + ')' : '');
          }

          var logData = message.logData;
          if(message.timestamp && message.config.showTimestamp) {
            logData.unshift(message.timestamp);
          }

          if(message.type == 'log' && message.config && message.config.convertStyles && !isSafari) {
            logData = this._stylize(message.logData, trace);
          } else {
            logData = message.logData;
            if(trace) logData.push(trace);
          }

          console[message.type].apply(console, logData);
        } else {
          console.log(message);
        }
      }
    },

    _stylize: function(data, cdata) {
      // If `data` has multiple arguments, we are going to merge everything into
      // the first argument, so style-specifiers can be used throughout all arguments.

      var cap,
          mergeArgsStart = 1,
          formatSpecifiers = [];

      // If the first argument is an object, we need to replace it with `%o`
      // (always preemptively reset the color)
      if (_.isObject(data[0])) {
        data.splice(1, 0, data[0]);
        data[0] = '%o';
      }

      // Count all format specifiers in the first argument to see from where we need to
      // start merging
      var txt = data[0];
      while (cap = this.stylePatterns.format.exec(txt)) {
          if (cap[1] == 'o') {
            // Insert color resetter
            data[0] = data[0].replace(cap[0], cap[0].slice(0, cap[0].length -2) + '\u001b[39m%o');
          }
          mergeArgsStart++;
      }


      // Start merging...
      if (data.length > mergeArgsStart) {
        for (var i = mergeArgsStart; i < data.length; i++) {
          var arg = data[i],
              specifier;

          if (typeof arg == 'string') {
            // Since this argument is a string and may be styled as well, put it right in...
            specifier = ' ' + arg;
            // ...and remove the argument...
            data.splice(i, 1);
            // ...and adapt the iterator.
            i--;
          } else {
            // Otherwise use the '%o'-specifier (preemptively reset color)
            specifier = ' \u001b[39m%o';
          }

          data[0] += specifier;
        }
      }

      // Now let's collect all format specifiers and their positions as well,
      // so we know where to put our style-specifiers.
      while (cap = this.stylePatterns.format.exec(data[0])) {
        formatSpecifiers.push(cap);
      }

      var added = 0;
      txt = data[0];

      // Let's do some styling...
      while (cap = this.stylePatterns.termCode.exec(txt)) {

        var styles = [],
            capsplit = cap[0].split('m');

        // Get the needed styles
        for (var j = 0; j < capsplit.length; j++) {
          var s;
          if (s = this.styleConfig.termMap[capsplit[j] + 'm']) styles.push(s);
        }

        // Check if the style must be added before other specifiers
        if (styles.length) {
          var k;
          for (k = 0; k < formatSpecifiers.length; k++) {
            var sp = formatSpecifiers[k];
            if (cap['index'] < sp['index']) {
              break;
            }
          }

          // Add them at the right position
          var pos = k + 1 + added;
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
        data.push(this.styleConfig.traceStyle);
      }

      return data;
    }
  });


  return webconsole;

});