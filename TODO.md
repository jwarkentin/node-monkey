# TODO List

### General
- Think of new name for project
- Consider building with a postinstall script and using the 'env' preset to determine environment: https://babeljs.io/docs/plugins/preset-env/
- Consider setting up a default data directory in `/tmp` named based on hash of path to application root
  - This would make SSH require no setup out of the box allowing it to be more useful and exciting to the uninitiated
  - This would allow creating signed tokens for browser auth to allow re-connecting within a session time window without re-authenticating even after refreshing the page.
  - This would eliminate the need to store credentials even in memory in the browser thus improving security.
  - This would create a mechanism that could be used to expire sessions if, for example, a developer connected from a user's machine to debug and then walked away and forgot to disconnect, thus leaving a knowledgable user with full access to the internals of the server.

### Documentation
- Show good examples (video?) of wrapping an existing server socket with Node Monkey websocket and including script on page
- Show examples of how to implement custom SSH commands under server `addCmd()` documentation
- Clarify that "Client" refers to the browser in the documentation

### Message tagging and filtering
- Allow tagging messages for filtering
  - Pass user's tagging function context such as name of module/file and function where call was made from
  - Consider ways to add an extra context object or array when log calls are made that is compatible with existing console log calls (would have to be a noop when Node Monkey isn't running/attached)
- Allow routing messages based on tags to browser and/or console
- Allow filtering server side based on tags to restrict what users can see which messages
- Allow setting include/exclude filter regexp's on the client to only show messages matching filters

### Command Manager
- Implement command abort functionality
  - runCmd() call should return an object with an `abort()` method
  - Commands should be provided a context object with an EventEmitter prototype that they can bind to for handling aborts
  - Should it be a fatal error if there is no event listener after the command has started?
    - Even though some commands aren't really cancelable it they can still bind a noop callback. It just would force implementers to think about cancellation to try and prevent uninteruptible commands.
  - Make SSH module's `CTRL_C` call `abort()`

### SSH
- Allow an application name to be set (default: 'Node Monkey') which gets interpolated into the prompt text
- Refactor to improve organization and keep terminal events, data and management separate. Also need to expose more useful API.
- Consider how to make authentication and command management pluggable in preparation for moving to its own module
- Break out into separate module

### Browser
- Hide reconnection errors and just show 'Reconnecting...' instead. Once it connects, show a simple horizontal rule to break up the output.
- Consider possibility of implementing a simple CLI emulator
- Create shortcut in browser (`Alt+R`?) to pop up prompt for command and then show the output in an alert box instead of the terminal
- Figure out how to properly collect command output and display alert dialogs with respons output and errors

### Server
- Add option to show console log call sources in the terminal, not just in the browser
- Implement `console.trace()` capturing and sending to browser
- Implement `console.time()` and `console.timeEnd()` capturing and sending to browser
- Catch unhandled exceptions and pass them through to remote before dying
- Replace object's functions with a call that sends a command, runs the function and returns the result
- Is it possible to rebuild full objects including inheritance?
- Implement a way to document command help info and view existing commands as well as individual command documentation
  - NOTE: The full set of available commands can already be seen by pressing `TAB` to auto-complete with nothing entered over SSH, but this doesn't solve the problem for the browser. Probably just need to add a command to list commands (possibly with an auto-complete-like prefix filter).