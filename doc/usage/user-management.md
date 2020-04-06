# User Management

Node Monkey requies authentication to connect via the web client or an SSH client. When you first start it you will authenticate with username `guest` and password `guest`. To create a user you must specify a `dataDir` as described in the [options](server.md#options).

Passwords are stored with strong scrypt hashes so you don't have to worry about someone gaining access to the users file and obtaining the hashes.

If you have to manually edit or replace the `users.json` file that stores the accounts, the changes you make will automatically take effect within a few seconds at most.

## Creating users

```
adduser [username]
```

You will then be prompted twice for a password and it will create the user if they match.


## Changing passwords

You can only change your own password.

```
passwd
```

You will be prompted to confirm your current password and then to enter your new password twice to confirm.


## Deleting users

```
deluser [username]
```

Currently anyone can delete a user. This will change when permission management is added.