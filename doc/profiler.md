# Server profiler API

Don't forget to start the profiler before trying to use it.

```js
var nomo = require('node-monkey').start();
nomo.profiler.start();
```

<!---
## nomo.profiler.setConfig(options)
Set profiler configuration options.

* **options**: Available options are as follows
  * *active*: `true` or `false` to set whether the profiler is active.
-->

## nomo.profiler.start()
Start the profiler. Until this is called, all profiler related calls effectively do nothing so there generally should be no performance
hit by leaving the calls in place as long as the profiler is stopped.

## nomo.profiler.stop()
Stop the profiler. Once this is called, all profiler related calls effectively do nothing so there generally should be no performance hit
by leaving the calls in place as long as the profiler is stopped.

## nomo.profiler.startTime(key [, params])
Begin timing a piece of code based on the given `key`. Multiple calls to `startTime()` with the same key will be tracked as separate calls.
It is mostly useful for grouping or identifying a specific piece of code in the results.

* **key**: The key used to track the time of a piece of code
* **params**: *(optional)* Anything given here will be stored along side the call time. This is especially useful for identifying a particular
                           call/iteration or specific arguments passed to a function call. To see what the resulting data might look like see
                           [nomo.profiler.getData](#nomoprofilergetdata)

**Returns** a uuid to track the specific call that is passed to `stopTime()`

### Example

```js
var nomo = require('node-monkey').start();
nomo.profiler.start();

var timer = nomo.profiler.startTime('identifier', {some: 'data'});
/* [code that does stuff here] */
nomo.profiler.stopTimer(timer);
```

## nomo.profiler.stopTime(uuid)
Stop a particular timer.

* **uuid**: The `uuid` returned from a call to `startTime()`.

## nomo.profiler.profile(key, function [, saveArgs])
This is a convenience method specifically for profiling a function. It takes a function and returns a profiled version of it.

* **key**: Same as the `key` parameter in `startTime()`
* **function**: A function to profile
* **saveArgs**: *(optional)* Defaults to `false`. If `true` this will store the arguments passed to the function on each call with the call
                data. It is passed to the `params` parameter of `startTime()`.

**Returns** a profiled version of the given function

### Example

```js
var nomo = require('node-monkey').start();
nomo.profiler.start();

function myfunc() {
    // Do something here
}

var myfunc = nomo.profiler.profile('myfunc', myfunc, true);
```

## nomo.profiler.getData()
Get the data the profiler has collected

### Example return data (very contrived)

```js
{
    "apples": {
        "totalCalls": 2,
        "totalTime": 0.003,
        "calls": [
            {
                "time": 0.001,
                "params": null
            },
            {
                "time": 0.002,
                "params": null
            }
        ]
    },
    "bananas": {
        "totalCalls": 1,
        "totalTime": 0.005,
        "calls": [
            {
                "time": 0.005,
                "params": "I ate them all"
            }
        ]
    }
}
```

## nomo.profiler.clearData()
Clear the data the profiler has collected


# Browser/Client profiler API

These are the commands that are already registered for you and can be run from your browser javascript console. All callbacks for
server commands receive two arguments: `response` and `error`.

## nomo.profiler.start(callback(response, error))
See [nomo.profiler.start](#nomoprofilerstart)

## nomo.profiler.stop(callback(response, error))
See [nomo.profiler.stop](#nomoprofilerstop)

## nomo.profiler.getData(callback(response, error))
See [nomo.profiler.getData](#nomoprofilergetdata)

## nomo.profiler.clearData(callback(response, error))
See [nomo.profiler.clearData](#nomoprofilercleardata)