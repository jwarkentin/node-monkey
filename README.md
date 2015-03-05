# Node Monkey

A Node.js module for inspecting, debugging and interfacing with Node.js applications through a web browser

NodeMonkey runs a simple server and uses [Socket.IO](https://github.com/LearnBoost/socket.io) to create a websocket connection between the browser and server. Its primary feature captures anything that would normally be logged to the terminal and passes it to the browser for inspection.

## Motivation

The motivation for this project came from trying to debug a Node.js server I wrote that used websockets.
I found it problematic trying to inspect objects with the terminal.
I tried using the built-in debugging that works with the [Chrome Developer Tools plugin](https://github.com/joyent/node/wiki/using-eclipse-as-node-applications-debugger) for Eclipse.
Unfortunately, I ran into a problem where setting breakpoints to inspect objects would cause the server to stop responding to heartbeats thus causing the client to disconnect.
This would entirely mess up my debugging efforts. All I really needed to do was have a good way to inspect objects.
I searched Google and found projects like [node-inspector](https://github.com/dannycoates/node-inspector), which doesn't work with the latest versions of Node, and [node-codein](http://thomashunter.name/blog/nodejs-console-object-debug-inspector/) which has many bugs.
And neither works with Firefox.

So NodeMonkey was born!

## Compatibility

Any browser with a JavaScript console and websocket support!

## Installation

```
npm install node-monkey
```

## Features

* Log console output to the browser console
  - Now provides a Bunyan stream (see [below](#bunyan)) interface!
* Register commands for your application that can be executed from the browser console
* Profile performance of sections of code

## A note on security

NodeMonkey is primarily designed for debugging and for now should only be used for such. I haven't implemented any sort of authorization
to prevent anyone from gaining access to the data that is dumped out. If you are concerned about other's potentially gaining access while
you are debugging, you should change the `host` from `0.0.0.0` to something more secure like `127.0.0.1`. Definitely don't include it in
production code before authorization is in place.

## Complete Documentation

To get a quick start see the limited examples below. For complete documentation see the following links:

* [NodeMonkey API](doc/nomo.md)
* [Profiler API](doc/profiler.md)

## Quick Usage

Using NodeMonkey is extremely easy.
All you have to do is include the following line in your Node.js application.
Anything that is logged to the console after this will show up in the browser console once connected.
It captures all output to `console.log()`, `console.warn()` and `console.error()`.

```js
var nomo = require('node-monkey').start([options]);
```

To connect your browser simply go to `http://0.0.0.0:50500` in your web browser.
If you change the default `host` and `port` bindings be sure to adjust your URL accordingly.

As an alternative to viewing output through this page, you can also view output in the console of your own web application by including the following lines
(adjust the host and port as necessary, this is based on the defaults):

```html
<script type="text/javascript" src="http://0.0.0.0:50500/socket.io/socket.io.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/lodash.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/cycle.js"></script>
<script type="text/javascript" src="http://0.0.0.0:50500/client.js"></script>
```

**NOTE**: You do NOT have to refresh the page when you restart your Node.js application to continue to receive output.
          Socket.IO will automatically reconnect.

### Bunyan

If you use the awesome [Bunyan](https://github.com/trentm/node-bunyan) library for logging, you can now add node-monkey as a Bunyan log stream by simply passing `nomo.stream`, like so:

```js
var nomo = require('node-monkey').start(),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'app',
  streams: [
    {
      level: 'info',
      stream: nomo.stream
    }
  ]
});

log.error('something happened');
```

Any messages Bunyan sends to the stream will be displayed in your browser console!

## Options

* **host**: The host network interface to bind to. Default is `0.0.0.0` which means ALL interfaces.
* **port**: The port to listen on. Default is `50500`.
* **overrideConsole**: Set this to `false` to prevent NodeMonkey from overriding the console functions when you start it. You can call `nomo.replaceConsole()` any time to override the console functions and `nomo.revertConsole()` to change it back. Default is `true`.
* **suppressOutput**: Use this to suppress terminal output when `console.log()` is called, freeing the console from clutter and allowing you to only inspect objects through the browser. Default is `true`.
* **saveOutput**: If data is logged before you are able to connect your browser, you may still want to be able to view this data. Setting this option to `true` causes node-monkey to save the output and dump it out to the browser once you connect. Default is `false`. **NOTE** This will not be effective in newer versions of Firefox that have a proper built-in dev console.
* **clientMaxBuffer**: The maximum number of messages to buffer while waiting for the console to open. Only has an effect if `saveOutput` is enabled. Default is `50`.
* **silent**: If `true` then nothing will be logged to the console when started. Default is `false`.
* **showCallerInfo**: If `true` then call stack information will be collected and the file, line and column where the log call is made from will be displayed in the browser console. Note that when used as a Bunyan stream it will respect the `src` option passed to Bunyan for messages written from Bunyan, even if this is set to `true`. Default is `true`.
* **convertStyles**: Whether to convert style related terminal escape sequences to corresponding JS console styles. Default is `true`.

<!---
* **profiler**: This is a nested object of options for the profiler. It's options are listed below.

    ### Profiler Options
    * **active**: If `true`, the profiler will be enabled when NodeMonkey is included. Defaults to `true`.
                  Note that it doesn't matter what this is set to if you never call any profiler functions.
-->

## Logging Examples

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

## Contribute

I welcome any pull requests, feature suggestions, bug fixes and bug reports. Let me know what you think.

Dependencies
------------

* [Socket.IO](https://github.com/LearnBoost/socket.io)
* [Lo-Dash](https://github.com/bestiejs/lodash)

## [MIT License](LICENSE)
