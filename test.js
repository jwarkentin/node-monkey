var clog = console.log;
require('./index.js').start();

function logObject() {
  clog('Sending object to clients');
  console.log({key1: 'hi', key2: ['deep', 'object']});
}

setInterval(logObject, 3000);
logObject();
