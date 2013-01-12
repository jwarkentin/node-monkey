Version 0.2.0
-------------
- Added profiling functionality
- Added ability to send commands to the Node.js server from the web browser

Version 0.1.2
-------------
- Fixed a bug causing NodeMonkey to crash the app it's included in

Version 0.1.1
-------------
- Changed default port to 50500
- Fixed logging issue causing messages to only be sent to the client on initial connection
- Fixed websocket reconnection problem
- Added buffering on Firefox if Firebug isn't open on initial page load so messages can be displayed once it is
- Dumps instructions to the console when started. Added `silent` option to disable this behavior.