var bunyan = require('bunyan');
var clog = console.log;
var nomo = require('./index.js').start({
  suppressOutput: false
});
nomo.profiler.start();


var log = bunyan.createLogger({
  name: 'app',
  streams: [
    {
      level: 'info',
      stream: nomo.stream
    }
  ]
});

log.info('something happened');


//
// -- Test console functions --
//

function logObject() {
  clog('Sending object to clients');
  console.log({key1: 'hi', key2: ['deep', 'object']});
}

//setInterval(logObject, 3000);
logObject();

// Test sending functions
console.log({
  testfunc: function() {},
  nestedArray: [
    function() {},
    function() {},
    function() {},
    { nested: function() {} }
  ]
});

console.dir({test: 'hi', test1: {nested: 'object'}, test2: function() { alert('hi'); }});

console.log('\033[32mgreen test, %cred test, %o, \033[34mblue test', 'color:red', {test: 'object'});


//
// -- Test profiling --
//

(nomo.profiler.profile('test function', function() {
  console.log('testing profiler');
}))();
console.log(nomo.profiler.getData());
