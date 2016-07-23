# Node Monkey

A tool for inspecting, debugging and commanding Node applications through a web browser or SSH interface into your app.

Node Monkey runs a simple server (or attaches to your existing server) and uses [Socket.IO](https://github.com/LearnBoost/socket.io) to create a websocket connection between the browser and server. Its primary feature captures anything that would normally be logged to the terminal and passes it to the browser for inspection.

## Contents

- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Quick Usage](#quick-usage)
- [Server](doc/server.md)
  - [Provide your own](doc/server.md#provide-your-own)
  - [Options](doc/server.md#options)
  - [Properties](doc/server.md#properties)
  - [Methods](doc/server.md#methods)
- [Client](doc/client.md)
  - [Properties](doc/client.md#properties)
  - [Methods](doc/client.md#methods)
- [SSH](doc/ssh.md)
  - [Setup](doc/ssh.md#setup)
  - [Usage](doc/ssh.md#usage)
- [User Management](doc/user-management.md)
- [Contributing](doc/contributing.md)
- [Changelog](CHANGELOG.md)
- [MIT License](LICENSE.md)

## Motivation

The motivation for this project came from trying to debug a Node.js server I wrote that used websockets. I found it problematic trying to inspect objects with the terminal because the output was too large and not browsable. I tried using the built-in debugging that works with the [Chrome Developer Tools plugin](https://github.com/joyent/node/wiki/using-eclipse-as-node-applications-debugger) for Eclipse. Unfortunately, I ran into a problem where setting breakpoints to inspect objects would cause the server to stop responding to heartbeats thus causing the client to disconnect. This would entirely mess up my debugging efforts. All I really needed to do was have a good way to inspect objects.

I searched Google and found projects like [node-inspector](https://github.com/dannycoates/node-inspector), which didn't work with the latest versions of Node, and [node-codein](http://thomashunter.name/blog/nodejs-console-object-debug-inspector/) which had many bugs. And neither worked with Firefox. So, Node Monkey was born!

## Features

* Log console output from your app to the browser console
  - Now provides a Bunyan stream (see [below](#bunyan)) interface!
* Provides SSH capability so you can get a shell into your app for inspection, debugging or anything else you can imagine
* Register commands for your application that can be executed from the browser console or the SSH interface

## Installation

```
npm install --save node-monkey
```

If you're interested in testing experimental and upcoming features, run this instead:

```
npm install --save node-monkey@next
```

## Quick Usage

Using NodeMonkey is designed to be extremely easy. All you have to do is include one line in your application. Anything that is logged to the console after this will show up in the browser console once connected.
It captures all output to `console.log()`, `console.warn()` and `console.error()`.

```js
let monkey = require('node-monkey')([options]);

// Do this if you want to bind to the console and have all output directed to the browser
// Pass `true` to disable server side logging and only see output in the browser
monkey.attachConsole()
```

When you start your app you will see the following output:

```
Node Monkey listening at http://0.0.0.0:50500
```

To connect your browser simply go to the address it shows in your web browser (`http://0.0.0.0:50500` in this case). If you change the default `host` and `port` bindings or pass in your own server be sure to adjust your URL accordingly. It will prompt you for a username and password. Until you setup a user the default is `guest` and `guest`.

If you provide your own server you can view output in the console of your own web application instead. To see how to provide your own server check out the [documentation](doc/server.md#provide-your-own).

```html
<script type="text/javascript" src="http://0.0.0.0:50500/monkey.js"></script>
```

**NOTE**: You do NOT have to refresh the page when you restart your Node.js application to continue to receive output. Node Monkey will automatically reconnect.


---
### LICENSE: [MIT](LICENSE.md)