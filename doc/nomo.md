# NodeMonkey API
Assuming:
```js
var nomo = require('node-monkey');
```

## nomo.setConfig(config)
Set/Reset config options.  
**NOTE** This WILL be changing soon to `setOptions()` and it will be more flexible at that point.

* **config**: An object with the options you want to set/change. Valid options are as follows:
    * **host**: The host network interface to bind to. Default is `0.0.0.0` which means ALL interfaces.
    * **port**: The port to listen on. Default is `50500`.
    * **overrideConsole**: Set this to `false` to prevent NodeMonkey from overriding the console functions when you start it. You can call `nomo.replaceConsole()` any time to override the console functions and `nomo.revertConsole()` to change it back. Default is `true`.
    * **suppressOutput**: Use this to suppress terminal output when `console.log()` is called, freeing the console from clutter and allowing you to only inspect objects through the browser. Default is `true`.
    * **saveOutput**: If data is logged before you are able to connect your browser, you may still want to be able to view this data. Setting this option to `true` causes node-monkey to save the output and dump it out to the browser once you connect. Default is `false`.
    * **clientMaxBuffer**: The maximum number of messages to buffer while waiting for the console to open. Only has an effect if `saveOutput` is enabled. Default is `50`.
    * **silent**: If `true` then nothing will be logged to the console when started. Default is `false`.
    * **showCallerInfo**: If `true` then call stack information will be collected and the file, line and column where the log call is made from will be displayed in the browser console. Note that when used as a Bunyan stream it will respect the `src` option passed to Bunyan for messages written from Bunyan, even if this is set to `true`. Default is `true`.
    * **convertStyles**: Whether to convert style related terminal escape sequences to corresponding JS console styles. Default is `true`.

## nomo.start([options])
Start the NodeMonkey server so the browser client can connect.

* **options**: These are the same as the `config` options above. This is just for convenience so you can pass them in when starting the server. In most cases though you won't need to change anything from the defaults so you shouldn't need to call `setConfig()` or pass any `options` in.

## nomo.stop()
Stop the NodeMonkey server. This will disconnect any browser client's that are listening.

## nomo.registerCommand(options)
You can register any command you'd like to run any function you'd like through this method. It is recommended, but not required, to namespace your commands (e.g. 'mynamespace.mycommand').

* **options**: An object containing at least some of the following data:
  * **command**: (string) (required) The string that will be used to identify the function to call a.k.a. "the command". It should be unique in the system.
  * **callback**: The function to call when the command is run.
  * **context**: (optional) The context of `this` for the `callback` when it is called
  * **description**: (optional) A description of the command that can be used for help

### Example

```js
nomo.registerCommand({
  cmd: 'myApp.doSomething',
  callback: myObj.doSomething,
  context: myObj,
  description: 'Does something cool'
});
```

Given the above, from the browser you can then run:

```js
// NOTE: The second argument where you list args to pass to the command is now optional.
//       If there are no args you can either pass the callback as the second argument or
//       pass 'null' to skip over it and continue passing the callback as the 3rd argument.
nomo.cmd('myApp.doSomething', [arg1, arg2, arg3], function(response, error) {
    console.log(response, error);
});
```

## nomo.replaceConsole()
You generally shouldn't ever have to call this. This function is already called automatically to replace the `console` methods with versions that forward the output to the browser.

## nomo.revertConsole()
Like `replaceConsole()` you should generally never need to call this. You may do so if you want the console functions to return to their normal function and just dump data out to the terminal.
