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

**SSH connection example**

If you were running your server on `localhost` on the default port and without any accounts created, you would run this command:

```
ssh guest@localhost -p 50501
```

You would then be prompted for a password. The default password for the guest account is 'guest'. Once authenticated, you will be presented with a command prompt provided by your application with any custom commands you've registered that looks like this (by default):

```
[Node Monkey] guest@YourHostName:
```

Pressing `TAB` at an empty prompt will show you all available commands and allow you to select one using `TAB` or the left and right arrow keys.

#### Features currently supported

* Tab autocomplete for commands
* Command history (with up/down arrow keys)
* Space at start of command prevents it from being recorded in command history
* Holding CTRL while pressing the right and left arrow keys jumps the cursor by whole words
* CTRL+D exits
* CTRL+L clears the screen
* CTRL+K clears from the cursor to the end of the line
* CTRL+U clears from the cursor to the beginning of the line
* CTRL+W clears the previous word
* ALT+D clears the next word

#### Built-in commands

* clear
* exit
* adduser
* deluser
* showusers
* passwd

#### Notable missing features

* CTRL+C to abort running commands