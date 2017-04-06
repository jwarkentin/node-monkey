require("source-map-support").install(),module.exports=function(e){function t(n){if(r[n])return r[n].exports;var i=r[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var r={};return t.m=e,t.c=r,t.i=function(e){return e},t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=22)}([function(e,t){e.exports=require("babel-runtime/core-js/object/assign")},function(e,t){e.exports=require("babel-runtime/core-js/object/keys")},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(){this.commands={}}Object.defineProperty(t,"__esModule",{value:!0});var o=r(8),s=n(o),a=r(0),u=n(a),l=r(5),c=n(l),f=r(3),d=n(f),h=r(23),p=n(h);(0,u.default)(i.prototype,{addCmd:function(e,t,r){if(this.commands[e])throw new Error("'"+e+"' is already registered as a command");"function"==typeof t&&(r=t,t={}),this.commands[e]={opts:t,exec:r}},bindI:function(e){var t=this,r=c.default.mapValues(this);return(0,u.default)(r,c.default.mapValues(this.constructor.prototype,function(r,n){return r instanceof Function?"runCmd"===n?r.bind(t,e):r.bind(t):r})),r},runCmd:function(e,t,r){var n=this;return new s.default(function(i,o){var s=d.default.parseCommand(t),a=s[0],u=n.commands[a];if(!r)return o("Missing user context for command '"+a+"'");if(!u)return o("Command not found: '"+a+"'");var l=(0,p.default)(s.slice(1));u.exec({args:l,username:r},{write:e.write,writeLn:e.writeLn,error:e.error,prompt:e.prompt},i)})}}),t.default=i},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=r(0),o=n(i),s=r(21),a=n(s),u=r(27),l=n(u);t.default=(0,o.default)({parseCommand:function(e){var t=/"(.*?)"|'(.*?)'|`(.*?)`|([^\s"]+)/gi,r=[],n=void 0;do{null!==(n=t.exec(e))&&r.push(n[1]||n[2]||n[3]||n[4])}while(null!==n);return r},getStack:function(){var e=Error.prepareStackTrace,t=Error.stackTraceLimit;Error.prepareStackTrace=function(e,t){return t.map(l.default.wrapCallSite)},Error.stackTraceLimit=30;var r=(new Error).stack;return Error.prepareStackTrace=e,Error.stackTraceLimit=t,r.slice(1)}},a.default)},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("lodash")},function(e,t){e.exports=require("babel-runtime/core-js/get-iterator")},function(e,t){e.exports=require("babel-runtime/core-js/json/stringify")},function(e,t){e.exports=require("babel-runtime/core-js/promise")},function(e,t){e.exports=require("babel-runtime/helpers/typeof")},function(module,exports,__webpack_require__){"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var _keys=__webpack_require__(1),_keys2=_interopRequireDefault(_keys),_typeof2=__webpack_require__(9),_typeof3=_interopRequireDefault(_typeof2),origJSON=global.JSON,JSON={};module.exports=JSON,"function"!=typeof JSON.decycle&&(JSON.decycle=function(e,t){var r=[],n=[];return function e(i,o){var s,a;return void 0!==t&&(i=t(i)),"object"!==(void 0===i?"undefined":(0,_typeof3.default)(i))||null===i||i instanceof Boolean||i instanceof Date||i instanceof Number||i instanceof RegExp||i instanceof String?i:(s=r.indexOf(i))>=0?{$ref:n[s]}:(r.push(i),n.push(o),Array.isArray(i)?(a=[],i.forEach(function(t,r){a[r]=e(t,o+"["+r+"]")})):(a={},(0,_keys2.default)(i).forEach(function(t){a[t]=e(i[t],o+"["+JSON.stringify(t)+"]")})),a)}(e,"$")}),"function"!=typeof JSON.retrocycle&&(JSON.retrocycle=function retrocycle($){var px=/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;return function rez(value){value&&"object"===(void 0===value?"undefined":(0,_typeof3.default)(value))&&(Array.isArray(value)?value.forEach(function(element,i){if("object"===(void 0===element?"undefined":(0,_typeof3.default)(element))&&null!==element){var path=element.$ref;"string"==typeof path&&px.test(path)?value[i]=eval(path):rez(element)}}):(0,_keys2.default)(value).forEach(function(name){var item=value[name];if("object"===(void 0===item?"undefined":(0,_typeof3.default)(item))&&null!==item){var path=item.$ref;"string"==typeof path&&px.test(path)?value[name]=eval(path):rez(item)}}))}($),$}),JSON=origJSON},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=r(3),i=function(e){return e&&e.__esModule?e:{default:e}}(n),o={trace:10,debug:20,info:30,warn:40,error:50,fatal:60},s=i.default.invert(o);t.default=function(e){return{write:function(t){t=JSON.parse(t);var r=t.src;e._sendMessage({method:s[t.level]||"info",args:[t.msg,t],callerInfo:r&&{caller:r.func||"anonymous",file:r.file,line:r.line,column:0}})}}}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=r(24),i=function(e){return e&&e.__esModule?e:{default:e}}(n);t.default=function(e){var t=i.default.createServer();return t.pre(i.default.pre.userAgentConnection()),t.use(i.default.gzipResponse()),t.use(i.default.CORS({credentials:!0})),t.get(/.*/,i.default.serveStatic({directory:__dirname,default:"index.html"})),t}},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e){var t=0,r={},n={writeLn:null,write:function(t,r){t&&e.emit("console",{method:"log",args:[t]})},error:function(t,r){t&&e.emit("console",{method:"error",args:[t]})},prompt:function(n,i,o){"function"==typeof i&&(o=i,i=void 0),i||(i={});var s=t++;e.emit("prompt",s,n,i),r[s]=o}};return n.writeLn=n.write,e.on("promptResponse",function(e,t){r[e]&&r[e](null,t)}),new c.default(n)}Object.defineProperty(t,"__esModule",{value:!0});var o=r(5),s=n(o),a=r(26),u=n(a),l=r(2),c=n(l);t.default=function(e){var t=void 0,r=void 0,n=e.userManager;return"function"==typeof e.server?t=(0,u.default)(e.server):(t=(0,u.default)(),t.attach(e.server)),r=t.of("/nm"),r.on("connection",function(t){var r=null;t.emit("settings",e.clientSettings),t.emit("auth"),t.on("auth",function(r){n.verifyUser(r.username,r.password).then(function(n){t.emit("authResponse",n,n?void 0:"Incorrect password"),n&&(t.username=r.username,t.join("authed"),e.onAuth&&e.onAuth(t))}).catch(function(e){t.emit("authResponse",!1,e)})}),t.on("cmd",function(e,n){if(!t.username)return void t.emit("cmdResponse",e,"You are not authorized to run commands");r||(r=i(t)),r.runCmd(n,t.username).then(function(r){t.emit("cmdResponse",e,null,r)}).catch(function(r){t.emit("cmdResponse",e,r&&r.message||r,null)})})}),s.default.each(e.handlers,function(e,r){t.on(r,e)}),r}},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e){this.options=e=(0,h.default)({host:"127.0.0.1",port:50501,title:"Node Monkey",prompt:"Node Monkey:",silent:!1},e),this.clients={},this.clientId=1,this.server=y.default.Server({hostKeys:e.hostKeys.map(function(e){return m.default.readFileSync(e)})},this.onClient.bind(this));var t=this.options.monkey;this.server.listen(e.port,e.host,function(){e.silent||t.local.log("SSH listening on "+this.address().port)})}function o(e){this.options=e,this.client=e.client,this.cmdMan=null,this.userManager=e.userManager,this.session=null,this.stream=null,this.term=null,this.ptyInfo=null,this.title=e.title,this.promptTxt=e.prompt+" ",this.inputActive=!1,this.cmdHistory=[],this.username=null,this.client.on("authentication",this.onAuth.bind(this)),this.client.on("ready",this.onReady.bind(this)),this.client.on("end",this.onClose.bind(this))}Object.defineProperty(t,"__esModule",{value:!0});var s=r(7),a=n(s),u=r(1),l=n(u),c=r(6),f=n(c),d=r(0),h=n(d),p=r(4),m=n(p),v=r(28),y=n(v),g=r(29),_=n(g),w=r(2);n(w);(0,h.default)(i.prototype,{shutdown:function(){var e=this.clients,t=!0,r=!1,n=void 0;try{for(var i,o=(0,f.default)(e);!(t=(i=o.next()).done);t=!0){var s=i.value;s.write("\nShutting down"),s.close()}}catch(e){r=!0,n=e}finally{try{!t&&o.return&&o.return()}finally{if(r)throw n}}},onClient:function(e){var t=this,r=r++;this.clients[r]=new o({client:e,cmdManager:this.options.cmdManager,userManager:this.options.userManager,title:this.options.title,prompt:this.options.prompt,onClose:function(){return delete t.clients[r]}})}}),(0,h.default)(o.prototype,{_initCmdMan:function(){var e=this,t={writeLn:null,write:function(t,r){r||(r={}),t||(t=""),r.bold?e.term.bold(t):e.term(t),r.newline&&e.term.nextLine()},error:function(t,r){r||(r={}),e.term.red(t),r.newline&&e.term.nextLine()},prompt:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",r=arguments[1],n=arguments[2];"function"==typeof r&&(n=r,r=void 0),r||(r={});var i={};r.hideInput&&(i.echo=!1),e.term(t),e.term.inputField(i,n)}};t.writeLn=function(e,r){r||(r={}),r.newline=!0,t.write(e,r)},this.cmdMan=this.options.cmdManager.bindI(t)},write:function(e,t){t||(t={}),this.term&&(t.style?this.term[style](e):this.term(e))},close:function(){this.stream&&this.stream.end(),this.onClose()},onAuth:function(e){var t=this;"password"==e.method?this.userManager.verifyUser(e.username,e.password).then(function(r){r?(t.username=e.username,e.accept()):e.reject()}).catch(function(t){e.reject()}):(e.method,e.reject())},onReady:function(){var e=this;this.client.on("session",function(t,r){e.session=t(),e.session.once("pty",function(t,r,n){e.ptyInfo=n,t&&t()}).on("window-change",e.onWindowChange.bind(e)).once("shell",function(t,r){e.stream=t(),e._initCmdMan(),e._initStream(),e._initTerm()})})},onWindowChange:function(e,t,r){var n=this.stream;(0,h.default)(this.ptyInfo,r),n&&(n.rows=r.rows,n.columns=r.cols,n.emit("resize")),e&&e()},onClose:function(){var e=this.options.onClose;e&&e()},onKey:function(e,t,r){"CTRL_L"===e?this.clearScreen():"CTRL_D"===e&&(this.term.nextLine(),this.close())},_initStream:function(){var e=this,t=this.stream;t.name=this.title,t.rows=this.ptyInfo.rows||24,t.columns=this.ptyInfo.cols||80,t.isTTY=!0,t.setRawMode=function(){},t.on("error",function(e){console.error("SSH stream error:",e.message)}),t.stdout.getWindowSize=function(){return[e.ptyInfo.cols,e.ptyInfo.rows]}},_initTerm:function(){var e=this.stream,t=this.term=_.default.createTerminal({stdin:e.stdin,stdout:e.stdout,stderr:e.stderr,generic:this.ptyInfo.term,appName:this.title});t.options.crlf=!0,t.on("key",this.onKey.bind(this)),t.windowTitle(this._interpolate(this.title)),this.clearScreen()},_interpolate:function(e){for(var t=/{@(.+?)}/g,r={username:this.username},n=void 0;n=t.exec(e);)r[n[1]]&&(e=e.replace(n[0],r[n[1]]));return e},clearScreen:function(){this.term.clear(),this.prompt()},prompt:function(){var e=this,t=this.term;t.windowTitle(this._interpolate(this.title)),t.bold(this._interpolate(this.promptTxt)),this.inputActive||(this.inputActive=!0,t.inputField({history:this.cmdHistory,autoComplete:(0,l.default)(this.cmdMan.commands),autoCompleteMenu:!0},function(r,n){e.inputActive=!1," "!==n[0]&&e.cmdHistory.push(n),t.nextLine(),"exit"===n?e.close():"clear"===n?e.clearScreen():n?e.cmdMan.runCmd(n,e.username).then(function(t){"string"!=typeof t&&(t=(0,a.default)(t,null,"  ")),e.term(t),e.term.nextLine(),e.prompt()}).catch(function(t){"string"!=typeof t&&(t=t.message||(0,a.default)(t,null,"  ")),e.term.red.error(t),e.term.nextLine(),e.prompt()}):e.prompt()}))}}),t.default=i},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e,t){return g?new Buffer(e,t):Buffer.from(e,t)}function o(e){this.userFile=e.userFile,this.userFileCache=null,this.userFileCreated=!1,e.silent||this.getUsers().then(function(e){var t=(0,h.default)(e);t.length?1===t.length&&"guest"===t[0]&&console.warn("[WARN] No users detected. You can login with default user 'guest' and password 'guest' when prompted.\nThis user will be disabled when you create a user account.\n"):"production"===process.env.NODE_ENV?console.warn("No users have been created and you are running in production mode so you will not be able to login.\n"):console.warn("It seems there are no users and you are not running in production mode so you will not be able to login. This is probably a bug. Please report it!\n")})}Object.defineProperty(t,"__esModule",{value:!0});var s=r(8),a=n(s),u=r(7),l=n(u),c=r(0),f=n(c),d=r(1),h=n(d),p=r(4),m=n(p),v=r(25),y=n(v),g=!1;try{Buffer.from("","base64")}catch(e){g=!0}(0,f.default)(o.prototype,{_readFile:function(){var e=this;if(this.userFileCache)return this.userFileCache;try{if(!this.userFile){var t=new Error("No user file specified");throw t.code="ENOENT",t}return this.userFileCache=JSON.parse(m.default.readFileSync(this.userFile)),this.userFileCreated=!0,setTimeout(function(){e.userFileCache=null},5e3),this.userFileCache}catch(t){if("ENOENT"===t.code)return"production"===process.env.NODE_ENV?{}:{guest:{password:"c2NyeXB0AAEAAAABAAAAAZS+vE1+zh4nY6vN21zM3dIzpJVImr8OrK0iJoA+iUPk7WIdo3RhgeATzWENocd7gKNbEKVgq6LbXqrmVjLtnYy5FXyfRCtEtmjUuj19AqcW"}};throw t}},_writeFile:function(e){this.userFileCache=null,m.default.writeFileSync(this.userFile,(0,l.default)(e,null,"  ")),this.userFileCreated=!0},_hashPassword:function(e){return y.default.kdfSync(e.normalize("NFKC"),{N:1,r:1,p:1}).toString("base64")},_verifyPassword:function(e,t){return y.default.verifyKdfSync(i(e,"base64"),t.normalize("NFKC"))},createUser:function(e,t){var r=this;return new a.default(function(n,i){if(!r.userFile)return i(new Error("No user file found. Did you forget to set the 'dataDir' option?"));var o=r._readFile();if(o[e])return i(new Error("User '"+e+"' already exists"));r.userFileCreated||delete o.guest,o[e]={password:r._hashPassword(t)},r._writeFile(o),n()})},deleteUser:function(e){var t=this;return new a.default(function(r,n){if(!t.userFile)return n(new Error("No user file found. Did you forget to set the 'dataDir' option?"));var i=t._readFile();return i[e]?t.userFileCreated?(delete i[e],t._writeFile(i),void r()):n(new Error("User file has not been created")):n(new Error("User '"+e+"' does not exist"))})},setPassword:function(e,t){var r=this;return new a.default(function(n,i){if(!r.userFile)return i(new Error("No user file found. Did you forget to set the 'dataDir' option?"));var o=r._readFile();o[e].password=r._hashPassword(t),r._writeFile(o),n()})},getUsers:function(){var e=this;return new a.default(function(t,r){t(e._readFile())})},getUserData:function(e){var t=this;return new a.default(function(r,n){var i=t._readFile();if(!i[e])return n(new Error("User '"+e+"' does not exist"));r(i[e])})},verifyUser:function(e,t){var r=this;return new a.default(function(n,i){r.getUserData(e).then(function(e){n(r._verifyPassword(e.password,t))}).catch(i)})}}),t.default=o},function(e,t){e.exports=require("child_process")},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("keypair")},function(e,t){e.exports=require("os")},function(e,t){e.exports=require("path")},function(e,t,r){"use strict";var n=r(9),i=function(e){return e&&e.__esModule?e:{default:e}}(n);e.exports={isObject:function(e){var t=void 0===e?"undefined":(0,i.default)(e);return!!e&&("object"==t||"function"==t)},invert:function(e){var t={};for(var r in e)e.hasOwnProperty(r)&&(t[e[r]]=r);return t}}},function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e){function t(){if(!o){o=!0;var e=["[Deprecation Warning] Running Node Monkey with 'augmentConsole' enabled.","This is strongly discouraged and will be removed in the v1.0.0 release.","See here for more info: https://github.com/jwarkentin/node-monkey/releases/tag/v1.0.0-rc.1"].join(" ");i.local.warn(e),i.remote.warn(e)}}var r=process.NODE_ENV,n=this.options=w.default.merge({server:{server:null,host:"0.0.0.0",port:R,silent:!1,bufferSize:50,attachOnStart:!0,disableLocalOutput:!1},client:{showCallerInfo:"production"!==r,convertStyles:!0},ssh:{enabled:!1,host:"0.0.0.0",port:R+1,title:"Node Monkey on "+d.default.hostname(),prompt:"[Node Monkey] {@username}@"+d.default.hostname()+":"},dataDir:null},e);this.msgBuffer=[],this.BUNYAN_STREAM=(0,x.default)(this),this._attached=!1,this._typeHandlers={},this._createLocal(),this._createRemote(),this._setupCmdMan(),this._setupUserManager(),this._setupServer(),this._setupSSH(),n.server.attachOnStart&&this.attachConsole();var i=this,o=!1;Object.defineProperty(t,"name",{value:"warnConsole"}),console.local=w.default.mapValues(this.local,function(e,r){var n=function(){return t(),e.apply(console,arguments)};return Object.defineProperty(n,"name",{value:r}),n}),console.remote=w.default.mapValues(this.remote,function(e,r){var n=function(){return t(),e.apply({callerStackDistance:2},arguments)};return Object.defineProperty(n,"name",{value:r}),n})}var o=r(0),s=n(o),a=r(6),u=n(a),l=r(1),c=n(l),f=r(19),d=n(f),h=r(4),p=n(h),m=r(20),v=n(m),y=r(17),g=n(y),_=(r(16),r(5)),w=n(_),b=r(18),S=n(b),M=r(10),N=n(M),C=r(11),x=n(C),k=r(12),F=n(k),O=r(13),j=n(O),E=r(14),A=n(E),L=r(2),P=n(L),q=r(15),I=n(q),D=r(3),T=n(D),R=50500,U=w.default.mapValues(console),z=new g.default,J=["log","info","warn","error","dir"],H=0;w.default.assign(i.prototype,{_getServerProtocol:function(e){return e._events&&e._events.tlsClientError?"https":"http"},getServerPaths:function(){return{basePath:v.default.normalize(__dirname+"/../dist"),client:"monkey.js",index:"index.html"}},_displayServerWelcome:function(){if(!this.options.server.silent){var e=this.options.server.server;if(e.listening){var t=this._getServerProtocol(e),r=e.address(),n=r.address,i=r.port;this.local.log("Node Monkey listening at "+t+"://"+n+":"+i)}else e.on("listening",this._displayServerWelcome.bind(this))}},_setupCmdMan:function(){this._cmdMan=new P.default;var e=this.cmdMan=this._cmdMan.bindI({write:function(e,t){console.log(e)},writeLn:function(e,t){console.log(e)},error:function(e,t){console.error(e)},prompt:function(e,t,r){"function"==typeof t&&(t,t=void 0),t||(t={}),console.warn("Prompt not implemented")}});this.addCmd=e.addCmd,this.runCmd=e.runCmd},_setupUserManager:function(){var e=this.options.dataDir,t=this.userManager=new I.default({userFile:e?e+"/users.json":void 0,silent:this.options.server.silent});this.cmdMan.addCmd("showusers",function(e,r,n){t.getUsers().then(function(e){r.writeLn((0,c.default)(e).join("\n")),n()})}),this.cmdMan.addCmd("adduser",function(e,r,n){var i=e.args,o=i._[0];if(!o)return r.error("You must specify a username"),n();r.prompt("Password: ",{hideInput:!0},function(e,i){r.writeLn(),r.prompt("Again: ",{hideInput:!0},function(e,s){r.writeLn(),i===s?t.createUser(o,i).then(function(){return r.write("Created user '"+o+"'")}).catch(r.error).then(n):(r.error("Passwords do not match"),n())})})}),this.cmdMan.addCmd("deluser",function(e,r,n){var i=e.args,o=i._[0];if(!o)return r.error("You must specify a username"),n();t.deleteUser(o).then(function(){return r.write("Deleted user '"+o+"'")}).catch(r.error).then(n)}),this.cmdMan.addCmd("passwd",function(e,r,n){var i=(e.args,e.username);r.prompt("Current password: ",{hideInput:!0},function(e,o){r.writeLn(),t.verifyUser(i,o).then(function(e){e?r.prompt("Password: ",{hideInput:!0},function(e,o){r.writeLn(),r.prompt("Again: ",{hideInput:!0},function(e,s){r.writeLn(),o===s?t.setPassword(i,o).then(function(){return r.write("Updated password for "+i)}).catch(r.error).then(n):(r.error("Passwords do not match"),n())})}):(r.error("Incorrect password"),n())})})})},_setupServer:function(){var e=this.options,t=e.server.server;if(!t){var r=(0,F.default)({name:"Node Monkey"});t=this.options.server.server=r.server;var n=e.server,i=n.host,o=n.port;r.listen(o,i)}this._displayServerWelcome(),this.serverApp=t,this.remoteClients=(0,j.default)({server:t.server||t,userManager:this.userManager,onAuth:this._sendMessages.bind(this),clientSettings:e.client})},_setupSSH:function(){var e=this.options.ssh;if(e.enabled){var t=this.options.dataDir;if(!t)throw new Error("Options 'dataDir' is required to enable SSH");var r=p.default.readdirSync(t),n=/\.key$/,i=[],o=!0,s=!1,a=void 0;try{for(var l,c=(0,u.default)(r);!(o=(l=c.next()).done);o=!0){var f=l.value;n.test(f)&&i.push(t+"/"+f)}}catch(e){s=!0,a=e}finally{try{!o&&c.return&&c.return()}finally{if(s)throw a}}if(!i.length){console.log("No SSH host key found. Generating new host key...");var d=(0,S.default)();p.default.writeFileSync(t+"/rsa.key",d.private),p.default.writeFileSync(t+"/rsa.key.pub",d.public),i=[t+"/rsa.key"]}this.SSHMan=new A.default({monkey:this,cmdManager:this._cmdMan,userManager:this.userManager,silent:this.options.server.silent,host:e.host,port:e.port,title:w.default.result(e,"title"),prompt:w.default.result(e,"prompt"),hostKeys:i})}},_getCallerInfo:function(e){if(this.options.client.showCallerInfo){var t=T.default.getStack().map(function(e){return{functionName:e.getFunctionName(),methodName:e.getMethodName(),fileName:e.getFileName(),lineNumber:e.getLineNumber(),columnNumber:e.getColumnNumber()}}),r=t.find(function(e,t,r){var n=r[t-2],i=r[t-4];return!(!n||"Logger._emit"!==n.functionName||!/\/bunyan\.js$/.test(n.fileName))||(!(!n||!i||"emit"!==n.methodName||"_sendMessage"!==i.methodName)||void 0)});if(r||"number"!=typeof e||(r=t[e]),r)return{caller:r.functionName||r.methodName,file:r.fileName,line:r.lineNumber,column:r.columnNumber}}},_sendMessage:function(e,t){this.msgBuffer.push({method:e.method,args:e.args,callerInfo:e.callerInfo||this._getCallerInfo(t+1)}),this.msgBuffer.length>this.options.server.bufferSize&&this.msgBuffer.shift(),this._sendMessages()},_sendMessages:function(){var e=this.remoteClients;w.default.size(e.adapter.rooms.authed)&&(w.default.each(this.msgBuffer,function(t){e.to("authed").emit("console",N.default.decycle(t))}),this.msgBuffer=[])},_createLocal:function(){this.local=U},_createRemote:function(){var e=this,t=this.remote={};J.forEach(function(r){e.remote[r]=function(){e._sendMessage({method:r,args:Array.prototype.slice.call(arguments)},this.callerStackDistance?this.callerStackDistance+1:2)},Object.defineProperty(t[r],"name",{value:r})})},attachConsole:function(e){var t=this;if(!this._attached){if(!H){var r=0;J.forEach(function(e){console[e]=function(){if(r)return n.local[e].apply(console,arguments);++r,z.emit.apply(z,[e].concat(Array.prototype.slice.call(arguments))),--r},Object.defineProperty(console[e],"name",{value:e})})}++H;var n=this,i=this.options.server;e=void 0!==e?e:i.disableLocalOutput,w.default.each(this.remote,function(r,i){var o=t._typeHandlers[i]=function(){r.apply({callerStackDistance:5},arguments),e||n.local[i].apply(console,arguments)};Object.defineProperty(o,"name",{value:i}),z.on(i,o)}),this._attached=!0}},detachConsole:function(){var e=this;(0,s.default)(console,this.local),this._attached=!1,--H,J.forEach(function(t){z.removeListener(t,e._typeHandlers[t]),delete e._typeHandlers[t]})}});var B={},K=R-1;e.exports=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"default";if("string"==typeof e&&(t=e,e=void 0),!B[t]){e||(e={});var r=w.default.get(e,"server.port");r?K=+r:(w.default.set(e,"server.port",++K),w.default.set(e,"ssh.port",++K)),B[t]=new i(e)}return B[t]},e.exports.NodeMonkey=i},function(e,t){e.exports=require("minimist")},function(e,t){e.exports=require("restify")},function(e,t){e.exports=require("scrypt")},function(e,t){e.exports=require("socket.io")},function(e,t){e.exports=require("source-map-support")},function(e,t){e.exports=require("ssh2")},function(e,t){e.exports=require("terminal-kit")}]);
//# sourceMappingURL=server.js.map