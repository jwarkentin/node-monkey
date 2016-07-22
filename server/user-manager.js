import fs from 'fs'
import scrypt from 'scrypt'

function UserManager(options) {
  this.userFile = options.userFile
  this.userFileCache = null
  this.userFileCreated = false
}

Object.assign(UserManager.prototype, {
  _readFile() {
    if (this.userFileCache) {
      return this.userFileCache
    }

    try {
      this.userFileCache = JSON.parse(fs.readFileSync(this.userFile))
      this.userFileCreated = true
      setTimeout(() => { this.userFileCache = null }, 5000)

      return this.userFileCache
    } catch(err) {
      if (err.code === 'ENOENT') {
        return {
          guest: {
            password: 'c2NyeXB0AAEAAAABAAAAAZS+vE1+zh4nY6vN21zM3dIzpJVImr8OrK0iJoA+iUPk7WIdo3RhgeATzWENocd7gKNbEKVgq6LbXqrmVjLtnYy5FXyfRCtEtmjUuj19AqcW'
          }
        }
      }
      throw err
    }
  },

  _writeFile(data) {
    this.userFileCache = null
    fs.writeFileSync(this.userFile, JSON.stringify(data, null, '  '))
    this.userFileCreated = true
  },

  _hashPassword(passwd) {
    return scrypt.kdfSync(passwd.normalize('NFKC'), { N: 1, r: 1, p: 1 }).toString('base64')
  },

  _verifyPassword(hash, passwd) {
    return scrypt.verifyKdfSync(Buffer.from(hash, 'base64'), passwd.normalize('NFKC'))
  },

  createUser(username, password) {
    return new Promise((resolve, reject) => {
      if (!this.userFile) {
        return reject(new Error(`No user file found. Did you forget to set the 'dataDir' option?`))
      }

      let users = this._readFile()
      if (users[username]) {
        return reject(new Error(`User '${username}' already exists`))
      }

      if (!this.userFileCreated) {
        delete users['guest']
      }

      users[username] = {
        password: this._hashPassword(password)
      }
      this._writeFile(users)
      resolve()
    })
  },

  setPassword(username, password) {
    return new Promise((resolve, reject) => {
      if (!this.userFile) {
        return reject(new Error(`No user file found. Did you forget to set the 'dataDir' option?`))
      }

      let users = this._readFile()

      users[username].password = this._hashPassword(password)
      this._writeFile(users)
      resolve()
    })
  },

  getUsers() {
    return new Promise((resolve, reject) => {
      resolve(this._readFile())
    })
  },

  getUserData(username) {
    return new Promise((resolve, reject) => {
      let users = this._readFile()
      if (!users[username]) {
        return reject(`User '${username}' does not exist`)
      }

      resolve(users[username])
    })
  },

  verifyUser(username, passwd) {
    return new Promise((resolve, reject) => {
      this.getUserData(username).then(userData => {
        resolve(this._verifyPassword(userData.password, passwd))
      }).catch(reject)
    })
  }
})


export default UserManager