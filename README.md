NodeMonkey
==========

A Node.js module for inspecting and debugging Node applications through a web browser

NodeMonkey runs a simple server and uses [Socket.IO](https://github.com/LearnBoost/socket.io) to create a websocket connection between the browser and server.
It captures anything that would normally be logged to the terminal, converts it to JSON and passes it to the browser
where it can be logged in the console for inspection.

Version 0.2.0 also introduces code profiling functionality and the ability to send commands to your Node.js application from your web browser.

The motivation for this project came from trying to debug a Node.js server I wrote that used websockets.
I found it problematic trying to inspect objects with the terminal.
I tried using the built-in debugging that works with the [Chrome Developer Tools plugin](https://github.com/joyent/node/wiki/using-eclipse-as-node-applications-debugger) for Eclipse.
Unfortunately, I ran into a problem where setting breakpoints to inspect objects would cause the server to stop responding to heartbeats thus causing the client to disconnect.
This would entirely mess up my debugging efforts. All I really needed to do was have a good way to inspect objects.
I searched Google and found projects like [node-inspector](https://github.com/dannycoates/node-inspector), which doesn't work with the latest versions of Node, and [node-codein](http://thomashunter.name/blog/nodejs-console-object-debug-inspector/) which has many bugs.
And neither works with Firefox. And NodeMonkey was born!

Installation
------------

```
npm install node-monkey
```

Usage
-----

Using NodeMonkey is extremely easy.
All you have to do is include the following line in your Node.js application.
Anything that is logged to the console after this will show up in the browser console once connected.
It captures all output to `console.log()`, `console.warn()` and `console.error()`.

```javascript
var nm = require('node-monkey').start([options]);
```

To connect your browser simply go to `http://0.0.0.0:50500` in your web browser.
If you change the default `host` and `port` bindings be sure to adjust your URL accordingly.

As an alternative to viewing output through this page, you can also view output in the console of your own web application by including the following lines:

```html
<script type="text/javascript" src="http://0.0.0.0:50500/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/client.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/underscore.js"></script>
```

**NOTE**: You do NOT have to refresh the page when you restart your Node application to continue to receive output. It will automatically reconnect.

Options
-------

* **host**: The host network interface to bind to. Default is `0.0.0.0` which means ALL interfaces.
* **port**: The port to listen on. Default is `50500`.
* **suppressOutput**: Use this to suppress terminal output when `console.log()` is called, freeing the console from clutter and allowing you to only inspect objects through the browser. Default is `true`.
* **saveOutput**: If data is logged before you are able to connect your browser, you may still want to be able to view this data. Setting this option to `true` causes node-monkey to save the output and dump it out to the browser once you connect. Default is `true`.
* **silent**: If `true` then nothing will be logged to the console when started. Default is `false`.
* **profiler**: This is a nested object of options for the profiler. It's options are listed below.

    ### Profiler Options
    * **active**: If `true`, the profiler will be enabled when NodeMonkey is included. Defaults to `true`.
                  Note that it doesn't matter what this is set to if you never call any profiler functions.

Logging Examples
----------------

**Example 1**
```javascript
require('node-monkey').start();
console.log('It works!', {key1: 'test', key2: ['an', 'array']});
```

**Example 2**
```javascript
require('node-monkey').start({
  suppressOutput: false
});

console.log('It works!');
console.warn('You might have done something wrong');
console.error('FATAL ERROR', {message: 'Something broke'});
```

Profiling Examples
------------------

**Example 1 - Setting profiler options**  
```javascript
var nm = require('node-monkey').setConfig({
    profiler: {
        active: false
    }
});
```

OR

```javascript
var nm = require('node-monkey');
nm.profiler.setConfig({
    active: false
});
```

However, the above example is equivalent to the following:

```javascript
var nm = require('node-monkey');
nm.profiler.pause();
// NOTE: You can reverse this by calling `nm.profiler.resume()`
```

**Example 2 - Using the profiler**  
After you have included and configured the profiler you have a couple simple options right now. You can manually start and stop
the timer allowing complete control over what is timed and what data you see in the output.

```javascript
// NOTE: The second parameter for `startTime()` is optional and can simply be any data you want to see
//       with the call data that is dumped out for this call
var timer = nm.profiler.startTime('identifier', {some: 'data'});
/* [code that does stuff here] */
nm.profiler.stopTimer(timer);
```

However, if you just want to profile a specific function you can call `profile()` which will return a new profiled version of the function.
If you use this, you have a third parameter which, if set to `true` will cause it to save the arguments the function is called with in the
profile data for each function call.

```javascript
var myfunc = nm.profiler.profile('identifier', function() {
    /* [code that does stuff here] */
});
```

Just a final note about the identifiers/keys used when timing functions. They are mainly used as a grouping mechanism. You can use the same
key as many times as you want. If you want to distinguish between different calls using the same key, put something unique in the `params`
argument which follows the identifier.

Contribute
----------

I welcome any pull requests, feature suggestions, bug fixes and bug reports. Let me know what you think.

Dependencies
------------

* [Socket.IO](https://github.com/LearnBoost/socket.io)
* [Underscore](http://documentcloud.github.com/underscore/)

## LICENSE - "MIT License"

Copyright (c) 2012 Justin Warkentin

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.