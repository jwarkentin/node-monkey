- Create merged option/config parser
- Create optional argument handler
- Implement different authorization handler (before socket.io connect that returns auth key - like session id)
- Console, profiler, command interface

- Use HTTPS by default (provide configuration option)
- Default port 44044 or 33033
- Make SSH an optional dependency (package.json, check for it if option is enabled in config, update README to reflect that it's optional)

Config:
- Auth
    - Also use system users
- Console
- Profiler
- Command Interface
- SSH
    - Enable?



- console.trace() functionality
- Catch unhandled exceptions and pass them through before dying
- Pass data through to client, even if there's a fatal exception
- Replace object's functions with a call that sends a command, runs the function and returns the result
- Is it possible to rebuild full objects including inheritance?

- Login interface (hashing and nonce security) using socketIO 'authorization'
- Replace setConfig() with setOptions() which takes one object or two args (option, value)

## Profiler

- Implement a way to view the help descriptions on commands