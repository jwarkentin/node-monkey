# Server

## Provide your own

Node Monkey allows you to provide your own server if you want and it will just attach to it. However, if you do so you have to setup a route to serve the Node Monkey client file at a bare minimum. Examples for how to do this below.

Note that with both of these examples it doesn't matter when you call `listen()`. If your server is already listening Node Monkey will still print out a message with the URL to access it unless you set `server.silent` to `true` when instantiating Node Monkey.

**Example with restify**

```js
let restify = require('restify')
let app = restify.createServer()
let monkey = require('node-monkey')({
  server: {
    server: app.server
  }
})

let monkeyFiles = monkey.getServerPaths()
app.get(/\/monkey\.js$/, restify.serveStatic({
  directory: monkeyFiles.basePath,
  file: monkeyFiles.client
}))

app.get(/\/monkey\/?$/, restify.serveStatic({
  directory: monkeyFiles.basePath,
  file: monkeyFiles.index
}))

app.listen(80, '0.0.0.0')
```

**Example with express**

```js
let app = require('express')()
let server = require('http').Server(app)
let monkey = require('node-monkey')({
  server: {
    server: server
  }
})

let monkeyFiles = monkey.getServerPaths()
app.get('/monkey.js', function(req, res, next) {
  res.sendFile(`${monkeyFiles.basePath}/${monkeyFiles.client}`)
})

app.get('/monkey', function(req, res, next) {
  res.sendFile(`${monkeyFiles.basePath}/${monkeyFiles.index}`)
})

server.listen(80, '0.0.0.0')
```


## Options

The `options` object you can provide to Node Monkey is nested and hopefully somewhat intuitive.

* `server<object>`
  * `server<http>`: An [http](https://nodejs.org/api/http.html) (or https) server instance for Node Monkey to attach to instead of creating its own. When this is passed the `host` and `port` options aren't used.
  * `host<ip>`: Host interface to bind to. The default `0.0.0.0` listens on all host IPs.
  * `port<int>`: The port to listen on for Node Monkey client connections.
  * `silent<bool>`: When `true`, the start-up messages Node Monkey normally prints will be silenced.
  * `bufferSize<int>`: When there are no clients connected to receive messages Node Monkey buffers them until at least one client connects to receive them. This is the number of messages it will buffer before the oldest ones start to drop off.
  * `attachOnStart<bool>`: Whether Node Monkey should automatically call `attachConsole()` for you when it initializes.
  * `disableLocalOutput<bool>`: When `true` and `attachConsole()` has been called all local console output will be silenced and logged output will only be visible in the browser console. Can be overridden on each individual call to `attachConsole()` (see [docs](nodemonkeyattachconsole)).

* `client<object>`
  * `showCallerInfo<bool>`: When `true` all browser console output will show at least the file and line number where the call was made that logged the output.
  * `convertStyles<bool>`: Sometimes terminal output contains special codes that create colored output in the terminal. When true, this attempts to convert the terminal output styles to the equivalent browser console styles.

* `ssh<object>`
  * `enabled<bool>`: When `true` the SSH app interface is enabled. This allows you to actually SSH in to your application to run custom commands for whatever purposes you may have. The `dataDir` option is required to enable this.
  * `host<ip>`: The SSH host interface to listen on (see `server.host` above).
  * `port<int>`: The port to listen on for SSH connections.
  * `title<string>`: You can customize what the terminal window title says by setting this option. It allows variable interpolation with `{@myvar}` syntax. For now there is only one possible variable: `username`.
  * `prompt<string>`: You can customize what the terminal prompt says by setting this option. It allows variable interpolation with `{@myvar}` syntax. For now there is only one possible variable: `username`.

* `dataDir<string>`: To enable user accounts and SSH functionality Node Monkey needs a directory to store a few files in. Without this there is a default `guest` user with password `guest` but SSH cannot be enabled. Generally you will want to commit this directory with the code base of your project that uses Node Monkey.

**Defaults**
```js
{
  server: {
    // You can provide your own server and Node Monkey will use it instead of creating its own.
    // However, this MUST be the underlying http server instance, not the express/restify/whatever app.
    server: null,

    host: '0.0.0.0',
    port: 50500,
    silent: false,
    bufferSize: 50,
    attachOnStart: true,

    // Only takes effect when Node Monkey is attached to the console
    disableLocalOutput: false
  },
  client: {
    showCallerInfo: NODE_ENV === 'production' ? false : true,
    convertStyles: true
  },
  ssh: {
    enabled: false,
    host: '0.0.0.0',
    port: 50501,
    title: `Node Monkey on ${os.hostname()}`,
    prompt: `[Node Monkey] {@username}@${os.hostname()}:`
  },

  // Needed for storing things like user files and SSH host keys
  dataDir: null
}
```

If you provide your own server you can view output in the console of your own web application instead. To see how to provide your own server check out the [documentation](doc/server.md#provide-your-own). You will need to include the following `<script>` tag in your HTML source to integrate Node Monkey output with your app:

```html
<script type="text/javascript" src="/monkey.js"></script>
```


## Properties

### NodeMonkey#BUNYAN_STREAM

If you use the awesome [Bunyan](https://github.com/trentm/node-bunyan) library for logging, you can add Node Monkey as a Bunyan log stream. If you pass Bunyan's `src: true` option in development you will get good call traces in the web console. You generally should not set this flag in production as it can seriously hurt performance.

**Example**
```js
let monkey = require('node-monkey')(),
    bunyan = require('bunyan')

let logger = bunyan.createLogger({
  name: 'app',
  src: true,  // NOTE: Do not enable this flag in production
  streams: [
    {
      level: 'info',
      stream: monkey.BUNYAN_STREAM
    }
  ]
})

logger.info('something happened!')
logger.error('something bad happened!')
```

### NodeMonkey#server

You generally shouldn't need to use this property but it gives you access to whatever the web server is that's being used to serve Node Monkey clients.

### NodeMonkey#remoteClients

You generally shouldn't need to use this but it gives you access to the underlying namespaced socket.io instance managing connected sockets. So, if you wanted you could send a message to all authorized clients like so:

```js
monkey.remoteClients.to('authed').emit('mychannel', something, somethingElse, etc)
```

And then to receive that on the client side you'd do:

```js
monkey.client.on('mychannel', function(arg1, arg2, arg3) {
  console.log(arguments)
})
```


## Methods

### NodeMonkey#constructor([\<object>options[, \<string>name]])

Instantiates an instance of Node Monkey.

By default, this will automatically attach to the `console` object and send log messages to both the terminal and your browser console. This behavior can be customized by the [options](#options) you can pass in.

The constructed instance contains two useful properties named `local` and `remote`. If you want to only log something to either the local terminal or only to the remote browser console and not both, despite Node Monkey being attached to the `console` object, you can do so using these objects as demonstrated below.

**Example**
```
let NodeMonkey = require('node-monkey')
let monkey = NodeMonkey()

// With the default options this will show in the browser console and in your terminal
console.log('Hello world!')

// This will only appear in your terminal
monkey.local.log('Local!')

// This will only appear in your attached browser console
monkey.remote.log('Remote!')
```

#### Named Instances

You can include Node Monkey in all the files within your app that you want and if used like the examples above, each call to `NodeMonkey()` will always return the same instance you first constructed, ignoring any options passed on subsequent calls. However, you may want to construct new instances with different options. To do so, give your instance a name:

```js
let NodeMonkey = require('node-monkey')
let monkey1 = NodeMonkey()          // Creates an instance named 'default'
let monkey2 = NodeMonkey('george')  // Creates a new instance with default options
let monkey3 = NodeMonkey({          // Creates a new instance with custom options named 'ninja'
  server: {
    silent: true
  }
}, 'ninja')
```

If you don't specify a port for additional instances it will automatically be set for you and will just increment from the default (e.g. 50502, 50504 for the websocket server and 50503, 50505 for the SSH server).

To get an already constructed instance in another file just call it with the name again:

```js
let NodeMonkey = require('node-monkey')
let monkey3 = NodeMonkey('ninja')
```

### NodeMonkey#getServerPaths()

Use this when instantiating Node Monkey with your own web server. At a minimum the `monkey.js` client file must be loaded to connect to Node Monkey. This function returns an object with the `basePath` directory which contains all Node Monkey static files as well as the names of the `client` and `index` files served out-of-the-box by Node Monkey when it provides the server.

**Return**

**Example response object**
```js
{
  basePath: '/srv/myapp/node_modules/node-monkey/dist',
  client: 'monkey.js',
  index: 'index.html'
}
```

### NodeMonkey#attachConsole([\<boolean>disableLocal])

When called this attaches to the built-in `console` object so all calls are handled by Node Monkey. If set, the optional `disableLocal` flag will stop local console output so all output is only visible in your attached browser console. You can also set `server.disableLocal` in the options passed when instantiating Node Monkey instead.

### NodeMonkey#detachConsole()

Detaches Node Monkey from the built-in `console` object.

### NodeMonkey#addCmd(\<string>cmdName[, \<object>opts], \<function>exec)

Adds a custom command that can be called remotely from the browser or SSH command line if it's enabled. When the command is called from either interface your `exec` callback will be called with four arguments, as follows:

_exec(opts, term, callback)_: 
* `opts`: An object containing two properties currently available to commands to use as needed 
  * `args<object>`: Any parsed arguments given on the command line. They are parsed using [minimist](https://github.com/substack/minimist) so see the documentation there for further details.
  * `username<string>`: The username of the user that is executing the command
* `term<object>`: An object containing a few functions for working with input and output
  * `write<function>`: Writes whatever is given to the terminal or web console without a newline following. Not that when your command finishes a newline will be inserted automatically before the prompt is displayed so your final output does not need to have a newline.
    * _write(\<mixed>output, \<object>options)_  
    `options` accepts `newline` and `bold`
  * `writeLn<function>`: Calls `write()` but automatically adds a newline.
    * _writeLn(\<mixed>output, \<object>options)_  
    `options` accepts `bold`
  * `error<function>`: Writes red error text to the console.
    * _error(\<mixed>output, \<object>options)_  
    `options` accepts `newline`
  * `prompt<function>`: Prompt the user for input
    * _prompt(\<string>promptTxt[, \<object>options], \<function>callback)_  
    `prompTxt` is self explanatory  
    `options` currently accepts the option `hideInput` which will hide keyboard input from being displayed which is useful when prompting for passwords.  
    `callback` should accept two arguments: `error` and `input`.
* `done`: You must call this when your command function has finished executing.

### NodeMonkey#runCmd(\<string>rawCommand, \<string>asUser)

* `rawCommand<string>`: The full command you want to be parsed and executed (e.g. `addUser bob -p password`)
* `asUser<string>`: The user to run the command as

**Return**

A promise that will resolve with successful command output or reject with an error.