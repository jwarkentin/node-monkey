# SSH

## Setup

For the SSH interface to be activated it needs to generate host keys. The first time you run Node Monkey with SSH enabled it will automatically generate the host keys. This means you need to specify a data directory for it to save the keys in. If you are running it in production you will want to commit your data directory with your code.

**Enabling SSH**

```js
let monkey = require('node-monkey')({
  dataDir: `${__dirname}/monkey-data`,
  ssh: {
    enabled: true
  }
})
```


## Usage

#### Features currently supported

* Tab autocomplete for commands
* Space at start of command prevents it from being recorded in command history
* CTRL+D exits
* CTRL+L clears the screen

#### Built-in commands

* clear
* exit
* adduser
* deluser
* showusers
* passwd

#### Notable missing features

* Holding CTRL while pressing the right and left arrow keys does nothing
* CTRL+C to stop commands
* CTRL+U and CTRL+K for clearing from cursor to beginning and end of line