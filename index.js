// Must be setup before any modules that try to use the logger are included
var logger = require(__dirname + '/lib/logger.js');
logger.addConsoleLog({level: 'info'});



var _ = require('lodash'),
    auth = require(__dirname + '/lib/srvauth.js'),
    webInspector = require(__dirname + '/lib/features/webinspect.js');

_.mixin(require('underscore.deferred'));


var inst = null;
function NodeMonkey(options) {
  var that = this;

  // Only one instance per app
  if(!inst) {
    if(this instanceof NodeMonkey) {
      inst = this;
    } else {
      inst = new NodeMonkey(options);
      return inst;
    }
  } else {
    return inst;
  }

  // Kafooble the energy motron
  this.options = _.merge({
    auth: {
      enable: true,
      scryptAuthFile: null
    },

    interfaces: {
      web: {
        enable: true,
        host: '0.0.0.0',
        port: 33033,

        // In seconds
        sessionTimeout: 300,

        paths: {
          templates: __dirname + '/lib/templates',
          lib: __dirname + '/lib',
          scripts: __dirname + '/lib/scripts',
          css: __dirname + '/lib/css',
          node_modules: __dirname + '/node_modules'
        },

        ssl: {
          key: null,
          cert: null
        },
      },

      ssh: {
        enable: false,
        host: '0.0.0.0',
        port: 33034,

        // If a userKeydir is specified we will try to authenticate users by looking for a [username].pub file
        userKeydir: null,

        // We include the hostKeydir under the module directory and have a .gitignore to avoid committing the host keys because we
        // want the keys to be regenerated per server the app is deployed on and we should avoid committing SSH keys anyway.
        hostKeydir: __dirname + '/keys'
      }
    },

    features: {
      webInspector: {
        enable: true,
        bufferLength: 15,
        silenceTerminal: false,

        client: {
          showTimestamp: true,
          showCalledFrom: true,

          // Convert terminal color/style codes to browser styles for similar output. If this is false and terminal output has special codes they will be dumped out raw to the browser console.
          convertStyles: true
        }
      }
    }
  }, options || {});

  if(this.options.auth.enable) {
    this.auth = new auth({
      scryptAuthFile: this.options.scryptAuthFile
    });
  }

  this.interfaces = {};

  if(this.options.interfaces.web.enable) {
    var webi = require(__dirname + '/lib/interfaces/webi.js');
    this.interfaces.web = new webi(_.extend({}, this.options.interfaces.web, {authMod: this.auth}));
    this.interfaces.web.startServer();


    this.webInspector = new webInspector(_.extend({}, this.options.features.webInspector, {webInterface: this.interfaces.web}));
    if(this.options.features.webInspector.enable) {
      this.webInspector.enable();
    }
  }

  if(this.options.interfaces.ssh.enable) {
    var sshi = require(__dirname + '/lib/interfaces/sshi.js');
    this.interfaces.ssh = new sshi(_.extend({}, this.options.interfaces.ssh, {authMod: this.auth}));
    this.interfaces.ssh.startServer();
  }
}

_.extend(NodeMonkey.prototype, {
});


module.exports = NodeMonkey;