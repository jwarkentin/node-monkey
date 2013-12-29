var _ = require('lodash'),
    logger = require(__dirname + '/../logger.js');

function command() {
  this.commands = {};
}

_.extend(command.prototype, {
  /**
   * Register a command that can be run from the client
   *
   * @param  object options   Command info. Valid options are as follows:
   *                            cmd           (string) The command (case sensitive)
   *                            callback      The function that will be called and passed any arguments when the given command is run
   *                            context       (optional) The context of 'this' when the given callback is called
   *                            description   (optional) A helpful description of the command
   */
  registerCommand: function(options) {
    var cmd = options.cmd;
    if(this.commands[cmd]) {
      throw new Error("There is already a command registered as '" + cmd + "'");
    }

    this.commands[cmd] = options;
  },

  exec: function(cmd, args, done) {
    var command = this.commands[cmd];
    if(command) {
      command.apply(command.context || this, function(err, out) {
        if(err) {
          logger.verbose('Error executing command: ' + (err.message || err));
        }
        done(err, out);
      }, args);
    } else {
      done("There is no command '" + cmd + "'");
    }
  }
});


module.exports = command;