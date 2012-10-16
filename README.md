node-monkey
===========

A Node.js module for inspecting and debugging Node applications through a web browser  
  
node-monkey runs a simple server and uses [Socket.IO](https://github.com/LearnBoost/socket.io) to create a websocket connection between the browser and server.
It captures anything that would normally be logged to the terminal, converts it to JSON and passes it to the browser
where it can be logged in the console for inspection.

Installation
------------

```
npm install node-monkey
```

Usage
-----

Using node-monkey is extremely easy.
All you have to do is include the following line in your Node.js application.
Anything that is logged to the console after this will show up in the browser console once connected.
It captures all output to `console.log()`, `console.warn()` and `console.error()`.

```javascript
require('node-monkey').start([options]);
```

To connect your browser simply go to `http://0.0.0.0:5678` in your web browser.
If you change the default `host` and `port` bindings be sure to adjust your URL accordingly.

Options
-------

* **host**: The host network interface to bind to. Default is `0.0.0.0` which means ALL interfaces.
* **port**: The port to listen on. Default is `5678`.
* **suppressOutput**: Use this to suppress terminal output when `console.log()` is called, freeing the console from clutter and allowing you to only inspect objects through the browser. Default is `true`.
* **saveOutput**: If data is logged before you are able to connect your browser, you may still want to be able to view this data. Setting this option to `true` causes node-monkey to save the output and dump it out to the browser once you connect. Default is `true`.