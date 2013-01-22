var clog = console.log;
var nomo = require('./index.js').start();
nomo.profiler.start();

function logObject() {
  clog('Sending object to clients');
  console.log({key1: 'hi', key2: ['deep', 'object']});
}

//setInterval(logObject, 3000);
logObject();


//
// -- Test profiling --
//

(nomo.profiler.profile('test function', function() {
  console.log('testing profiler');
}))();
console.log(nomo.profiler.getData());