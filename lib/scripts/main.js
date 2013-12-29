require.config({
  shim: {
    '/lib/jquery.js': {
      exports: 'jQuery'
    },
    '/socket.io/socket.io.js': {
      exports: 'io'
    },
    '/lib/cycle.js': {
      exports: 'cycle'
    }
  }
});

define([
  '/lib/jquery.js',
  '/lib/lodash.js',
  '/socket.io/socket.io.js',
  '/scripts/webconsole.js'
], function($, _, io, webconsole) {
  var authEnabled = <%= authEnabled %>;

  function setStatus(status) {
    $('#con-status').html(status).attr('class', status.toLowerCase());
  }

  function setError(err) {
    $('#error').html(err);
  }

  function promptPassword(done) {
    if(!authEnabled) {
      done();
      return;
    }

    var prompt = $('#pwd-prompt'),
        loginBtn = prompt.find('#login-btn');

    prompt.css({
      top: ($(document).height() / 2) - (prompt.height() / 2),
      left: ($(document).width() / 2) - (prompt.width() / 2)
    }).show();

    prompt.find('input').keydown(function(event) {
      if(event.keyCode == 13) {
        loginBtn.click();
      }
    }).filter('#username').focus();

    loginBtn.click(function() {
      loginBtn.off();
      prompt.hide();
      prompt.find('.auth-error-wrapper').hide();

      //var cookieDomain = location.hostname == 'localhost' ? '' : location.hostname;
      //document.cookie = "username=" + prompt.find('#username').val() + "; domain=" + cookieDomain + "; port=" + location.port + "; path=/;" + (location.protocol == 'https:' ? ' secure' : '');
      //document.cookie = "password=" + prompt.find('#password').val() + "; domain=" + cookieDomain + "; port=" + location.port + "; path=/;" + (location.protocol == 'https:' ? ' secure' : '');

      done(prompt.find('#username').val(), prompt.find('#password').val());
    });
  }

  var connection;
  function connectSocket(done) {
    setStatus('Connecting');

    if(connection) {
      try {
        // Even though calling 'disconnect' here will throw an error the following 'connect' call won't work without it if we've had a failed connection attempt already
        connection.socket.disconnect();
      } catch(err) {}
      connection.socket.connect();
      return;
    }

    // NOTE: If the host we're connecting to does not match what's in the URL then it's considered a cross-origin request and the browser will not send cookies for authorization
    var host = location.protocol + '//' + location.hostname + ':' + <%= port %>;
    connection = io.connect(host, {
      'reconnect': true,
      'connect timeout': 4000,
      'max reconnection attempts': Infinity,
      'reconnection limit': Infinity
    });

    connection.on('connect', function() {
      setStatus('Connected');

      if(_.isFunction(done)) {
        done();
      }
    });

    connection.on('error', function(errStr) {
      if(!connection.connected) {
        if(errStr == 'handshake error' || errStr == 'handshake unauthorized') {
          setTimeout(function() { doAuth(done); });
        }

        if(connection.reconnecting) {
          setStatus('Connecting');
        } else {
          setStatus('Disconnected');
        }
      }
    });

    connection.on('disconnect', function() {
      setStatus('Disconnected');
    });
  }

  function doAuth(done) {
    promptPassword(function(username, password) {
      $.ajax({
        url: '/auth',
        type: 'post',
        data: JSON.stringify({
          username: username,
          password: password
        }),
        dataType: 'json',
        success: function(data, status, jqXHR) {
          if(data.result && data.sessionId) {
            var cookieDomain = location.hostname == 'localhost' ? '' : location.hostname;
            document.cookie = "sessionId=" + data.sessionId + "; domain=" + cookieDomain + "; port=" + location.port + "; path=/;" + (location.protocol == 'https:' ? ' secure' : '');

            connectSocket(done);
          } else {
            $('#pwd-prompt .auth-error').html(data.error).parent().show();
            setTimeout(doAuth);
          }
        },
        error: function(jqXHR, status, error) {
          try {
            error = JSON.parse(error).error;
          } catch(err) {}

          setError(error);
        }
      });
    });
  }


  connectSocket(function() {
    // TODO: We should have a way of getting webconsole config options from the server and passing them through when we instantiate it here (things like style overrides)
    var wcon = new webconsole({
      ioConnection: connection
    });
  });
});