NodeMonkey
==========

A Node.js module for inspecting and debugging Node.js applications through a web browser

NodeMonkey runs a simple server and uses [Socket.IO](https://github.com/LearnBoost/socket.io) to create a websocket connection between the browser and server.
It captures anything that would normally be logged to the terminal, converts it to JSON and passes it to the browser
where it can be logged in the console for inspection.

Version 0.2.0 also introduces code profiling functionality and the ability to send commands to your Node.js application from your web browser.  
Version 0.2.1 introduces major changes and cleanup. You can now register your own commands that can then be run from the browser.

The motivation for this project came from trying to debug a Node.js server I wrote that used websockets.
I found it problematic trying to inspect objects with the terminal.
I tried using the built-in debugging that works with the [Chrome Developer Tools plugin](https://github.com/joyent/node/wiki/using-eclipse-as-node-applications-debugger) for Eclipse.
Unfortunately, I ran into a problem where setting breakpoints to inspect objects would cause the server to stop responding to heartbeats thus causing the client to disconnect.
This would entirely mess up my debugging efforts. All I really needed to do was have a good way to inspect objects.
I searched Google and found projects like [node-inspector](https://github.com/dannycoates/node-inspector), which doesn't work with the latest versions of Node, and [node-codein](http://thomashunter.name/blog/nodejs-console-object-debug-inspector/) which has many bugs.
And neither works with Firefox.

NodeMonkey was born!

Installation
------------

```
npm install node-monkey
```

A note on security
------------------

NodeMonkey is primarily designed for debugging and for now should only be used for such. I haven't implemented any sort of authorization
to prevent anyone from gaining access to the data that is dumped out. If you are concerned about other's potentially gaining access while
you are debugging, you should change the `host` from `0.0.0.0` to something more secure like `127.0.0.1`. Definitely don't include it in
production code before authorization is in place, and even then it's debatable whether there's a good reason.

Complete Documentation
----------------------
To get a quick start see the limited examples below. For complete documentation see the following links:

* [NodeMonkey API](https://github.com/jwarkentin/node-monkey/blob/master/doc/nomo.md)
* [Profiler API](https://github.com/jwarkentin/node-monkey/blob/master/doc/profiler.md)

Usage
-----

Using NodeMonkey is extremely easy.
All you have to do is include the following line in your Node.js application.
Anything that is logged to the console after this will show up in the browser console once connected.
It captures all output to `console.log()`, `console.warn()` and `console.error()`.

```js
var nomo = require('node-monkey').start([options]);
```

To connect your browser simply go to `http://0.0.0.0:50500` in your web browser.
If you change the default `host` and `port` bindings be sure to adjust your URL accordingly.

As an alternative to viewing output through this page, you can also view output in the console of your own web application by including the following lines:

```html
<script type="text/javascript" src="http://0.0.0.0:50500/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/underscore.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/cycle.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/client.js"></script>
```

**NOTE**: You do NOT have to refresh the page when you restart your Node.js application to continue to receive output.
          Socket.IO will automatically reconnect.

Options
-------

* **host**: The host network interface to bind to. Default is `0.0.0.0` which means ALL interfaces.
* **port**: The port to listen on. Default is `50500`.
* **suppressOutput**: Use this to suppress terminal output when `console.log()` is called, freeing the console from clutter and allowing you to only inspect objects through the browser. Default is `true`.
* **saveOutput**: If data is logged before you are able to connect your browser, you may still want to be able to view this data. Setting this option to `true` causes node-monkey to save the output and dump it out to the browser once you connect. Default is `true`.
* **silent**: If `true` then nothing will be logged to the console when started. Default is `false`.

<!---
* **profiler**: This is a nested object of options for the profiler. It's options are listed below.

    ### Profiler Options
    * **active**: If `true`, the profiler will be enabled when NodeMonkey is included. Defaults to `true`.
                  Note that it doesn't matter what this is set to if you never call any profiler functions.
-->

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
