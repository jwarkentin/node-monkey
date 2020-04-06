# Client

The Node Monkey client is exposed in the global scope and is available in your console as `monkey`.

## Properties

### monkey#client

This generally shouldn't need to be touched but it gives you access to the socket.io client socket. See [here](server.md#nodemonkeyremoteclients) for more on why and how you might use this.


## Methods

### monkey#init()

When you want to connect the client to the server, which you will probably want to do in production environments for debugging, you must call `monkey.init()` to kick things off. When you do, you will be prompted to enter a username and password to authenticate and any authentication errors will display in the console.

You may disconnect at any time after which point calling `monkey.init()` will just invoke `monkey.connect()` so they are equivalent. You will be prompted for authentication again.


### monkey#connect()

Re-establish a connection to the server after you've called `monkey.disconnect()`. Calling `monkey.init()` a second time will also call this.


### monkey#disconnect()

Disconnect from the server.


### monkey#cmd(\<string>command[, noOutput])

* `command<string>`: The full command string to execute (e.g. `adduser bob -p password123`)
* `noOutput<bool>`: By default the result of the command you run will be logged to the console. If you set this to `true` it will not log the result.

**Return**

A promise that will resolve with successful output or reject with the error output.

**Example**

```js
monkey.cmd('adduser bob')

monkey.cmd('adduser bob').then(function(output) {
  /* do something */
}).catch(function(error) {
  /* do something else */
})
```