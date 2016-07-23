# User Management

Node Monkey requies authentication to connect via the web client or an SSH client. When you first start it you will authenticate with username `guest` and password `guest`. To create a user you must specify a `dataDir` as described in the [options](server.md#options).

Passwords are stored with strong scrypt hashes so you don't have to worry about someone gaining access to the users file and obtaining the hashes.

If you have to manually edit or replace the `users.json` file that stores the accounts, the changes you make will automatically take effect within a few seconds at most.

## Creating users

Currently Node Monkey doesn't have the ability for commands to prompt for additional input. This feature is coming but for now passwords must be specified in plain text on the command line. However, command history is not remembered between SSH sessions and just like your standard Linux command line, if you start the command with a space it will not be remembered in your immediate history.

```
adduser [username] -p [password]
```

**Example**

```
 adduser bob -p password123
```
Notice the space at the beginning of the command.


## Changing passwords

You can only change your own password.

```
passwd
```


## Deleting users

```
deluser [username]
```