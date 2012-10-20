(function() {

  //
  // - Global Variabls -
  //

  var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
  var msgBuffer = [];


  //
  // - Global Functions -
  //

  function logMsg(data) {
    if(isFirefox && !window.console.exception) {
      msgBuffer.push(data);
    } else {
      if(data.type && data.data) {
        console[data.type].apply(console, data.data);
      } else {
        console.log(data);
      }
    }
  }


  //
  // - Websocket connection -
  //

  var connection = io.connect(location.host, {
    'reconnect': true,
    'connect timeout': 4000,
    'max reconnection attempts': Infinity,
    'reconnection limit': Infinity
  });

  connection.on('connect', function() {
    logMsg(' ');
    logMsg('---------------------');
    logMsg('Welcome to node-mokey');
    logMsg('---------------------');
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

})();