import fs from "fs"
import scrypt from "scrypt-kdf"

class UserManager {
  userFile
  userFileCache = null
  userFileCreated = false

  constructor(options) {
    this.userFile = options.userFile

    if (!options.silent) {
      this.getUsers().then((users) => {
        const usernames = Object.keys(users)
        if (!usernames.length) {
          if (process.env.NODE_ENV === "production") {
            console.warn(
              `No users have been created and you are running in production mode so you will not be able to login.\n`,
            )
          } else {
            console.warn(
              `It seems there are no users and you are not running in production mode so you will not be able to login. This is probably a bug. Please report it!\n`,
            )
          }
        } else if (usernames.length === 1 && usernames[0] === "guest") {
          console.warn(
            `[WARN] No users detected. You can login with default user 'guest' and password 'guest' when prompted.\n` +
              `This user will be disabled when you create a user account.\n`,
          )
        }
      })
    }
  }

  async getUsers() {
    if (this.userFileCache) {
      return this.userFileCache
    }

    try {
      if (!this.userFile) {
        let err = new Error(`No user file specified`)
        err.code = "ENOENT"
        throw err
      }

      this.userFileCache = JSON.parse(fs.readFileSync(this.userFile).toString("base64"))
      this.userFileCreated = true
      setTimeout(() => {
        this.userFileCache = null
      }, 5000)

      return this.userFileCache
    } catch (err) {
      if (err.code === "ENOENT") {
        return process.env.NODE_ENV === "production"
          ? {}
          : {
              guest: {
                password:
                  "c2NyeXB0AA8AAAAIAAAAAc8D4r96lep3aBQSBeAqf0a+9MX6KyB6zKTF9Nk3ruTPIXrzy8IM7vjSLpIKuVZMNTZZ72CMqKp/PQmnyXmf7wGup1bWBGSwoV5ymA72ZzZg",
              },
            }
      }
      throw err
    }
  }

  _writeFile(data) {
    this.userFileCache = null
    fs.writeFileSync(this.userFile, JSON.stringify(data, null, "  "))
    this.userFileCreated = true
  }

  async _hashPassword(passwd) {
    return (await scrypt.kdf(passwd, { logN: 15, r: 8, p: 1 })).toString("base64")
  }

  async _verifyPassword(actualPasswd, testPasswd) {
    return scrypt.verify(Buffer.from(actualPasswd, "base64"), testPasswd)
  }

  async createUser(username, password) {
    if (!this.userFile) {
      throw new Error(`No user file found. Did you forget to set the 'dataDir' option?`)
    }

    const users = await this.getUsers()
    if (users[username]) {
      throw new Error(`User '${username}' already exists`)
    }

    if (!this.userFileCreated) {
      delete users["guest"]
    }

    users[username] = {
      password: await this._hashPassword(password),
    }
    this._writeFile(users)
  }

  async deleteUser(username) {
    if (!this.userFile) {
      throw new Error(`No user file found. Did you forget to set the 'dataDir' option?`)
    }

    const users = await this.getUsers()
    if (!users[username]) {
      throw new Error(`User '${username}' does not exist`)
    }

    if (!this.userFileCreated) {
      throw new Error(`User file has not been created`)
    }

    delete users[username]
    this._writeFile(users)
  }

  async setPassword(username, password) {
    if (!this.userFile) {
      throw new Error(`No user file found. Did you forget to set the 'dataDir' option?`)
    }

    const users = await this.getUsers()
    users[username].password = await this._hashPassword(password)
    this._writeFile(users)
  }

  async getUserData(username) {
    const users = await this.getUsers()
    if (!users[username]) {
      throw new Error(`User '${username}' does not exist`)
    }

    return users[username]
  }

  async verifyUser(username, passwd) {
    const userData = await this.getUserData(username)
    return this._verifyPassword(userData.password, passwd)
  }
}

export default UserManager
