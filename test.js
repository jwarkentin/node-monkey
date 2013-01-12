var clog = console.log;
var nm = require('./index.js').start();

function logObject() {
  clog('Sending object to clients');
  console.log({key1: 'hi', key2: ['deep', 'object']});
}

//setInterval(logObject, 3000);
logObject();


//
// -- Test profiling --
//

(nm.profiler.profile('test function', function() {
  console.log('testing profiler');
}))();
console.log(nm.profiler.getData());