var socket = io.connect(location.host, {
  'reconnect': true,
  'connect timeout': 4000,
  'max reconnection attempts': Infinity,
  'reconnection limit': Infinity
});

socket.on('reconnecting', function(delay, attempts) {
  if(delay > that.options.reconnectionDelay) that.connection.socket.reconnectionDelay = 5000;
});

socket.on('console', function(data) {
  console[data.type].apply(console, data.data);
});