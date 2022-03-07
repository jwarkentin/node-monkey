/*! For license information please see server.js.LICENSE.txt */
require("source-map-support").install(),function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.NodeMonkey=t():e.NodeMonkey=t()}(global,(function(){return(()=>{"use strict";var __webpack_modules__={"./src/lib/common-utils.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>i});var n=r("@babel/runtime/helpers/typeof"),s=r.n(n);const i={isObject:function(e){var t=s()(e);return!!e&&("object"==t||"function"==t)},invert:function(e){var t={};for(var r in e)e.hasOwnProperty(r)&&(t[e[r]]=r);return t}}},"./src/lib/cycle.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>__WEBPACK_DEFAULT_EXPORT__});var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@babel/runtime/helpers/typeof"),_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__),origJSON=global.JSON,JSON={};const __WEBPACK_DEFAULT_EXPORT__=JSON;"function"!=typeof JSON.decycle&&(JSON.decycle=function(e,t){var r=[],n=[];return function e(s,i){var o,a;return void 0!==t&&(s=t(s)),"object"!==_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(s)||null===s||s instanceof Boolean||s instanceof Date||s instanceof Number||s instanceof RegExp||s instanceof String?s:(o=r.indexOf(s))>=0?{$ref:n[o]}:(r.push(s),n.push(i),Array.isArray(s)?(a=[],s.forEach((function(t,r){a[r]=e(t,i+"["+r+"]")}))):(a={},Object.keys(s).forEach((function(t){a[t]=e(s[t],i+"["+JSON.stringify(t)+"]")}))),a)}(e,"$")}),"function"!=typeof JSON.retrocycle&&(JSON.retrocycle=function retrocycle($){var px=/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;return function rez(value){value&&"object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(value)&&(Array.isArray(value)?value.forEach((function(element,i){if("object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(element)&&null!==element){var path=element.$ref;"string"==typeof path&&px.test(path)?value[i]=eval(path):rez(element)}})):Object.keys(value).forEach((function(name){var item=value[name];if("object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(item)&&null!==item){var path=item.$ref;"string"==typeof path&&px.test(path)?value[name]=eval(path):rez(item)}})))}($),$}),JSON=origJSON},"./src/server/bunyan-stream.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>i});var n={trace:10,debug:20,info:30,warn:40,error:50,fatal:60},s=r("./src/server/utils.js").default.invert(n);const i=function(e){return{write:function(t){t=JSON.parse(t),e._sendMessage({method:s[t.level]||"info",args:[t.msg,t]})}}}},"./src/server/command-interface.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>c});var n=r("@babel/runtime/helpers/createClass"),s=r.n(n),i=r("@babel/runtime/helpers/classCallCheck"),o=r.n(i),a=r("@babel/runtime/helpers/defineProperty"),u=r.n(a);const c=s()((function e(t,r,n,s,i){o()(this,e),u()(this,"commandManager",null),u()(this,"write",(function(e,t){console.log(e)})),u()(this,"writeLn",(function(e,t){console.log(e)})),u()(this,"error",(function(e,t){console.error(e)})),u()(this,"prompt",(function(e,t,r){"function"==typeof t&&(t,t=void 0),t||(t={}),console.warn("Prompt not implemented")})),this.commandManager=t,this.write=r,this.writeLn=n,this.error=s,this.prompt=i}))},"./src/server/command-manager.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>v});var n=r("@babel/runtime/helpers/asyncToGenerator"),s=r.n(n),i=r("@babel/runtime/helpers/createClass"),o=r.n(i),a=r("@babel/runtime/helpers/classCallCheck"),u=r.n(a),c=r("@babel/runtime/helpers/defineProperty"),l=r.n(c),p=r("@babel/runtime/regenerator"),h=r.n(p),f=(r("lodash"),r("./src/server/utils.js")),_=r("minimist"),d=r.n(_),m=o()((function e(){var t=this;u()(this,e),l()(this,"commands",{}),l()(this,"addCmd",(function(e,r,n){if(t.commands[e])throw new Error("'".concat(e,"' is already registered as a command"));"function"==typeof r&&(n=r,r={}),t.commands[e]={opts:r,exec:n}})),l()(this,"runCmd",function(){var e=s()(h().mark((function e(r,n,s){var i,o,a,u,c,l;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(i=f.default.parseCommand(r),o=i[0],a=t.commands[o],n){e.next=5;break}throw new Error("Missing user context for command '".concat(o,"'"));case 5:if(a){e.next=7;break}throw new Error("Command not found: '".concat(o,"'"));case 7:return u=d()(i.slice(1)),c=f.default.getPromiseObj(),l=a.exec({args:u,username:n},{write:s.write,writeLn:s.writeLn,error:s.error,prompt:s.prompt},c.resolve),e.abrupt("return",l.then?l:c.promise);case 11:case"end":return e.stop()}}),e)})));return function(t,r,n){return e.apply(this,arguments)}}())}));const v=m},"./src/server/setup-server.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>a});var n=r("restify"),s=r.n(n),i=r("restify-cors-middleware"),o=r.n(i);const a=function(e){var t=s().createServer(),r=o()({origins:[/https?:\/\/.+/],allowHeaders:[],exposeHeaders:[],credentials:!0});return t.pre(s().pre.userAgentConnection()),t.pre(r.preflight),t.use(s().plugins.gzipResponse()),t.use(r.actual),t.get("*",s().plugins.serveStatic({directory:__dirname,default:"index.html"})),t}},"./src/server/setup-socket.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>u});var n=r("lodash"),s=r.n(n),i=r("socket.io"),o=r.n(i),a=r("./src/server/command-interface.js");const u=function(e){var t=o()();t.attach(e.server,{autoUnref:!0});var r=t.of("/nm");return r.on("connection",(function(t){var r=null;t.emit("settings",e.clientSettings),t.emit("auth"),t.on("auth",(function(r){e.userManager.verifyUser(r.username,r.password).then((function(n){t.emit("authResponse",n,n?void 0:"Incorrect password"),n&&(t.username=r.username,t.join("authed"),e.onAuth&&e.onAuth(t))})).catch((function(e){t.emit("authResponse",!1,e)}))})),t.on("cmd",(function(n,s){t.username?(r||(r=function(e,t){var r=0,n={},s=function(e,r){e&&t.emit("console",{method:"log",args:[e]})},i=function(e,r){e&&t.emit("console",{method:"error",args:[e]})},o=function(e,s,i){"function"==typeof s&&(i=s,s=void 0),s||(s={});var o=r++;t.emit("prompt",o,e,s),n[o]=i};return t.on("promptResponse",(function(e,t){var r=n[e];r&&r(null,t)})),new a.default(e,s,s,i,o)}(e.cmdManager,t)),e.cmdManager.runCmd(s,t.username,r).then((function(e){t.emit("cmdResponse",n,null,e)})).catch((function(e){t.emit("cmdResponse",n,e&&e.message||e,null)}))):t.emit("cmdResponse",n,"You are not authorized to run commands")}))})),s().each(e.handlers,(function(e,r){t.on(r,e)})),r}},"./src/server/ssh-manager.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>x});var n=r("@babel/runtime/helpers/classCallCheck"),s=r.n(n),i=r("@babel/runtime/helpers/createClass"),o=r.n(i),a=r("@babel/runtime/helpers/defineProperty"),u=r.n(a),c=r("fs"),l=r.n(c),p=r("tty"),h=r.n(p),f=r("node-pty"),_=r("ssh2"),d=r.n(_),m=r("terminal-kit"),v=r.n(m),y=r("./src/server/command-interface.js");function b(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,t){if(!e)return;if("string"==typeof e)return w(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return w(e,t)}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,s=function(){};return{s,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,o=!0,a=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return o=e.done,e},e:function(e){a=!0,i=e},f:function(){try{o||null==r.return||r.return()}finally{if(a)throw i}}}}function w(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var g=function(){function e(t){s()(this,e),u()(this,"options",{host:"127.0.0.1",port:50501,title:"Node Monkey",prompt:"Node Monkey:",silent:!1}),u()(this,"server",void 0),u()(this,"clients",new Set),t=Object.assign(this.options,t),this.server=new(d().Server)({hostKeys:t.hostKeys.map((function(e){return l().readFileSync(e)}))},this.onClient.bind(this));var r=this.options.monkey;this.server.listen(t.port,t.host,(function(){t.silent||r.local.log("SSH listening on ".concat(this.address().port))}))}return o()(e,[{key:"shutdown",value:function(){var e,t=b(this.clients);try{for(t.s();!(e=t.n()).done;){var r=e.value;r.write("\nShutting down"),r.close()}}catch(e){t.e(e)}finally{t.f()}}},{key:"onClient",value:function(e){var t=this,r=this.options,n=r.cmdManager,s=r.userManager,i=r.title,o=r.prompt;this.clients.add(new k({client:e,cmdManager:n,userManager:s,title:i,prompt:o,onClose:function(){return t.clients.delete(e)}}))}}]),e}(),k=function(){function e(t){s()(this,e),this.options=t,this.client=t.client,this.cmdInterface=null,this.userManager=t.userManager,this.session=null,this.stream=null,this.pty=null,this.term=null,this.ptyInfo=null,this.title=t.title,this.promptTxt="".concat(t.prompt," "),this.inputActive=!1,this.cmdHistory=[],this.username=null,this.client.on("authentication",this.onAuth.bind(this)),this.client.on("ready",this.onReady.bind(this)),this.client.on("end",this.onClose.bind(this))}return o()(e,[{key:"_initCmdMan",value:function(){var e=this,t=function(t,r){r||(r={}),t||(t=""),r.bold?e.term.bold(t):e.term(t),r.newline&&e.term.nextLine()};this.cmdInterface=new y.default(this.options.cmdManager,t,(function(e,r){r||(r={}),r.newline=!0,t(e,r)}),(function(t,r){r||(r={}),e.term.red(t),r.newline&&e.term.nextLine()}),(function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",r=arguments.length>1?arguments[1]:void 0,n=arguments.length>2?arguments[2]:void 0;"function"==typeof r&&(n=r,r=void 0),r||(r={});var s={};r.hideInput&&(s.echo=!1),e.term(t),e.term.inputField(s,n)}))}},{key:"write",value:function(e,t){var r=t.style,n=void 0===r?void 0:r;this.term&&(n?this.term[n](e):this.term(e))}},{key:"close",value:function(){this.stream&&this.stream.end(),this.onClose()}},{key:"onAuth",value:function(e){var t=this;"password"==e.method?this.userManager.verifyUser(e.username,e.password).then((function(r){r?(t.username=e.username,e.accept()):e.reject()})).catch((function(t){e.reject()})):(e.method,e.reject())}},{key:"onReady",value:function(){var e=this;this.client.on("session",(function(t,r){e.session=t(),e.session.once("pty",(function(t,r,n){e.ptyInfo=n,t&&t()})).on("window-change",(function(t,r,n){Object.assign(e.ptyInfo,n),e._resize(),t&&t()})).once("shell",(function(t,r){e.stream=t(),e._initCmdMan(),e._initStream(),e._initPty(),e._initTerm()}))}))}},{key:"onClose",value:function(){var e=this.options.onClose;e&&e()}},{key:"onKey",value:function(e,t,r){var n=this;if("CTRL_L"===e)this.clearScreen();else if("CTRL_C"===e)this.inputActive=!1,this.inputField.abort(),this.term("\n^^C\n"),this.prompt();else if("CTRL_D"===e){this.inputField.getInput().length||(this.term.nextLine(),setTimeout((function(){n.close()}),0))}}},{key:"_resize",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this,t=e.term;t&&t.stdout.emit("resize")}},{key:"_initStream",value:function(){var e=this.stream;e.name=this.title,e.isTTY=!0,e.setRawMode=function(){},e.on("error",(function(e){console.error("SSH stream error:",e.message)}))}},{key:"_initPty",value:function(){var e=this,t=f.native.open(this.ptyInfo.cols,this.ptyInfo.rows);this.pty={master_fd:t.master,slave_fd:t.slave,master:new(h().WriteStream)(t.master),slave:new(h().ReadStream)(t.slave)},Object.defineProperty(this.pty.slave,"columns",{enumerable:!0,get:function(){return e.ptyInfo.cols}}),Object.defineProperty(this.pty.slave,"rows",{enumerable:!0,get:function(){return e.ptyInfo.rows}}),this.stream.stdin.pipe(this.pty.master),this.pty.master.pipe(this.stream.stdout)}},{key:"_initTerm",value:function(){var e=this.term=v().createTerminal({stdin:this.pty.slave,stdout:this.pty.slave,stderr:this.pty.slave,generic:this.ptyInfo.term,appName:this.title,isSSH:!0,isTTY:!0});e.on("key",this.onKey.bind(this)),e.windowTitle(this._interpolate(this.title)),this.clearScreen()}},{key:"_interpolate",value:function(e){for(var t,r=/{@(.+?)}/g,n={username:this.username};t=r.exec(e);)n[t[1]]&&(e=e.replace(t[0],n[t[1]]));return e}},{key:"clearScreen",value:function(){this.term.clear(),this.prompt()}},{key:"prompt",value:function(){var e=this,t=this.term;t.windowTitle(this._interpolate(this.title)),t.bold(this._interpolate(this.promptTxt)),this.inputActive||(this.inputActive=!0,this.inputField=t.inputField({history:this.cmdHistory,autoComplete:Object.keys(this.options.cmdManager.commands),autoCompleteHint:!0,autoCompleteMenu:!0},(function(r,n){return e.inputActive=!1,t.nextLine(),r?t.error(r.message||r):n?(" "!==n[0]&&e.cmdHistory.push(n),void("exit"===n?setTimeout(e.close.bind(e)):"clear"===n?e.clearScreen():n?e.options.cmdManager.runCmd(n,e.username,e.cmdInterface).then((function(t){"string"!=typeof t&&(t=JSON.stringify(t,null,"  ")),e.term(t),e.term.nextLine(),e.prompt()})).catch((function(t){"string"!=typeof t&&(t=t.message||JSON.stringify(t,null,"  ")),e.term.red.error(t),e.term.nextLine(),e.prompt()})):e.prompt())):e.prompt()})))}}]),e}();const x=g},"./src/server/user-manager.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>y});var n=r("@babel/runtime/helpers/asyncToGenerator"),s=r.n(n),i=r("@babel/runtime/helpers/classCallCheck"),o=r.n(i),a=r("@babel/runtime/helpers/createClass"),u=r.n(a),c=r("@babel/runtime/helpers/defineProperty"),l=r.n(c),p=r("@babel/runtime/regenerator"),h=r.n(p),f=r("fs"),_=r.n(f),d=r("scrypt-kdf"),m=r.n(d),v=function(){function e(t){o()(this,e),l()(this,"userFile",void 0),l()(this,"userFileCache",null),l()(this,"userFileCreated",!1),this.userFile=t.userFile,t.silent||this.getUsers().then((function(e){var t=Object.keys(e);t.length?1===t.length&&"guest"===t[0]&&console.warn("[WARN] No users detected. You can login with default user 'guest' and password 'guest' when prompted.\nThis user will be disabled when you create a user account.\n"):"production"===process.env.NODE_ENV?console.warn("No users have been created and you are running in production mode so you will not be able to login.\n"):console.warn("It seems there are no users and you are not running in production mode so you will not be able to login. This is probably a bug. Please report it!\n")}))}var t,r,n,i,a,c,p,f;return u()(e,[{key:"getUsers",value:(f=s()(h().mark((function e(){var t,r=this;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!this.userFileCache){e.next=2;break}return e.abrupt("return",this.userFileCache);case 2:if(e.prev=2,this.userFile){e.next=7;break}throw(t=new Error("No user file specified")).code="ENOENT",t;case 7:return this.userFileCache=JSON.parse(_().readFileSync(this.userFile).toString("base64")),this.userFileCreated=!0,setTimeout((function(){r.userFileCache=null}),5e3),e.abrupt("return",this.userFileCache);case 13:if(e.prev=13,e.t0=e.catch(2),"ENOENT"!==e.t0.code){e.next=17;break}return e.abrupt("return","production"===process.env.NODE_ENV?{}:{guest:{password:"c2NyeXB0AA8AAAAIAAAAAc8D4r96lep3aBQSBeAqf0a+9MX6KyB6zKTF9Nk3ruTPIXrzy8IM7vjSLpIKuVZMNTZZ72CMqKp/PQmnyXmf7wGup1bWBGSwoV5ymA72ZzZg"}});case 17:throw e.t0;case 18:case"end":return e.stop()}}),e,this,[[2,13]])}))),function(){return f.apply(this,arguments)})},{key:"_writeFile",value:function(e){this.userFileCache=null,_().writeFileSync(this.userFile,JSON.stringify(e,null,"  ")),this.userFileCreated=!0}},{key:"_hashPassword",value:(p=s()(h().mark((function e(t){return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,m().kdf(t,{logN:15,r:8,p:1});case 2:return e.abrupt("return",e.sent.toString("base64"));case 3:case"end":return e.stop()}}),e)}))),function(e){return p.apply(this,arguments)})},{key:"_verifyPassword",value:(c=s()(h().mark((function e(t,r){return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",m().verify(Buffer.from(t,"base64"),r));case 1:case"end":return e.stop()}}),e)}))),function(e,t){return c.apply(this,arguments)})},{key:"createUser",value:(a=s()(h().mark((function e(t,r){var n;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.userFile){e.next=2;break}throw new Error("No user file found. Did you forget to set the 'dataDir' option?");case 2:return e.next=4,this.getUsers();case 4:if(!(n=e.sent)[t]){e.next=7;break}throw new Error("User '".concat(t,"' already exists"));case 7:return this.userFileCreated||delete n.guest,e.next=10,this._hashPassword(r);case 10:e.t0=e.sent,n[t]={password:e.t0},this._writeFile(n);case 13:case"end":return e.stop()}}),e,this)}))),function(e,t){return a.apply(this,arguments)})},{key:"deleteUser",value:(i=s()(h().mark((function e(t){var r;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.userFile){e.next=2;break}throw new Error("No user file found. Did you forget to set the 'dataDir' option?");case 2:return e.next=4,this.getUsers();case 4:if((r=e.sent)[t]){e.next=7;break}throw new Error("User '".concat(t,"' does not exist"));case 7:if(this.userFileCreated){e.next=9;break}throw new Error("User file has not been created");case 9:delete r[t],this._writeFile(r);case 11:case"end":return e.stop()}}),e,this)}))),function(e){return i.apply(this,arguments)})},{key:"setPassword",value:(n=s()(h().mark((function e(t,r){var n;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(this.userFile){e.next=2;break}throw new Error("No user file found. Did you forget to set the 'dataDir' option?");case 2:return e.next=4,this.getUsers();case 4:return n=e.sent,e.next=7,this._hashPassword(r);case 7:n[t].password=e.sent,this._writeFile(n);case 9:case"end":return e.stop()}}),e,this)}))),function(e,t){return n.apply(this,arguments)})},{key:"getUserData",value:(r=s()(h().mark((function e(t){var r;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getUsers();case 2:if((r=e.sent)[t]){e.next=5;break}throw new Error("User '".concat(t,"' does not exist"));case 5:return e.abrupt("return",r[t]);case 6:case"end":return e.stop()}}),e,this)}))),function(e){return r.apply(this,arguments)})},{key:"verifyUser",value:(t=s()(h().mark((function e(t,r){var n;return h().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getUserData(t);case 2:return n=e.sent,e.abrupt("return",this._verifyPassword(n.password,r));case 4:case"end":return e.stop()}}),e,this)}))),function(e,r){return t.apply(this,arguments)})}]),e}();const y=v},"./src/server/utils.js":(e,t,r)=>{r.r(t),r.d(t,{default:()=>o});var n=r("./src/lib/common-utils.js"),s=r("source-map-support"),i=r.n(s);const o=Object.assign({parseCommand:function(e){var t,r=/"(.*?)"|'(.*?)'|`(.*?)`|([^\s"]+)/gi,n=[];do{null!==(t=r.exec(e))&&n.push(t[1]||t[2]||t[3]||t[4])}while(null!==t);return n},getStack:function(){var e=Error.prepareStackTrace,t=Error.stackTraceLimit;Error.prepareStackTrace=function(e,t){return t.map(i().wrapCallSite)},Error.stackTraceLimit=30;var r=(new Error).stack;return Error.prepareStackTrace=e,Error.stackTraceLimit=t,r.slice(1)},getPromiseObj:function(){var e={};return e.promise=new Promise((function(t,r){Object.assign(e,{resolve:t,reject:r})})),e}},n.default)},"@babel/runtime/helpers/asyncToGenerator":e=>{e.exports=require("@babel/runtime/helpers/asyncToGenerator")},"@babel/runtime/helpers/classCallCheck":e=>{e.exports=require("@babel/runtime/helpers/classCallCheck")},"@babel/runtime/helpers/createClass":e=>{e.exports=require("@babel/runtime/helpers/createClass")},"@babel/runtime/helpers/defineProperty":e=>{e.exports=require("@babel/runtime/helpers/defineProperty")},"@babel/runtime/helpers/typeof":e=>{e.exports=require("@babel/runtime/helpers/typeof")},"@babel/runtime/regenerator":e=>{e.exports=require("@babel/runtime/regenerator")},events:e=>{e.exports=require("events")},keypair:e=>{e.exports=require("keypair")},lodash:e=>{e.exports=require("lodash")},minimist:e=>{e.exports=require("minimist")},"node-pty":e=>{e.exports=require("node-pty")},restify:e=>{e.exports=require("restify")},"restify-cors-middleware":e=>{e.exports=require("restify-cors-middleware")},"scrypt-kdf":e=>{e.exports=require("scrypt-kdf")},"socket.io":e=>{e.exports=require("socket.io")},"source-map-support":e=>{e.exports=require("source-map-support")},ssh2:e=>{e.exports=require("ssh2")},"terminal-kit":e=>{e.exports=require("terminal-kit")},fs:e=>{e.exports=require("fs")},os:e=>{e.exports=require("os")},path:e=>{e.exports=require("path")},tty:e=>{e.exports=require("tty")}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var r=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](r,r.exports,__webpack_require__),r.exports}__webpack_require__.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=(e,t)=>{for(var r in t)__webpack_require__.o(t,r)&&!__webpack_require__.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},__webpack_require__.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),__webpack_require__.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__={};return(()=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{NodeMonkey:()=>L,default:()=>R});var e=__webpack_require__("@babel/runtime/helpers/asyncToGenerator"),t=__webpack_require__.n(e),r=__webpack_require__("@babel/runtime/helpers/classCallCheck"),n=__webpack_require__.n(r),s=__webpack_require__("@babel/runtime/helpers/createClass"),i=__webpack_require__.n(s),o=__webpack_require__("@babel/runtime/helpers/defineProperty"),a=__webpack_require__.n(o),u=__webpack_require__("@babel/runtime/regenerator"),c=__webpack_require__.n(u),l=__webpack_require__("os"),p=__webpack_require__.n(l),h=__webpack_require__("fs"),f=__webpack_require__.n(h),_=__webpack_require__("path"),d=__webpack_require__.n(_),m=__webpack_require__("events"),v=__webpack_require__("lodash"),y=__webpack_require__.n(v),b=__webpack_require__("keypair"),w=__webpack_require__.n(b),g=__webpack_require__("./src/lib/cycle.js"),k=__webpack_require__("./src/server/bunyan-stream.js"),x=__webpack_require__("./src/server/setup-server.js"),S=__webpack_require__("./src/server/setup-socket.js"),C=__webpack_require__("./src/server/ssh-manager.js"),M=__webpack_require__("./src/server/command-manager.js"),O=__webpack_require__("./src/server/user-manager.js"),j=__webpack_require__("./src/server/utils.js");function q(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,t){if(!e)return;if("string"==typeof e)return E(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return E(e,t)}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,s=function(){};return{s,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,o=!0,a=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return o=e.done,e},e:function(e){a=!0,i=e},f:function(){try{o||null==r.return||r.return()}finally{if(a)throw i}}}}function E(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var N=process.env.NODE_ENV,A=50500,P=y().mapValues(console),T=new m.EventEmitter,I=["log","info","warn","error","dir"],F=0,L=function(){function e(t){n()(this,e),a()(this,"msgBuffer",[]),a()(this,"BUNYAN_STREAM",(0,k.default)(this)),a()(this,"_attached",!1),a()(this,"_typeHandlers",{});var r=this.options=y().merge({server:{server:null,host:"0.0.0.0",port:A,silent:!1,bufferSize:50,attachOnStart:!0,disableLocalOutput:!1},client:{showCallerInfo:"production"!==N,convertStyles:!0},ssh:{enabled:!1,host:"0.0.0.0",port:50501,title:"Node Monkey on ".concat(p().hostname()),prompt:"[Node Monkey] {@username}@".concat(p().hostname(),":")},dataDir:null},t);this._createLocal(),this._createRemote(),this._setupCmdMan(),this._setupUserManager(),this._setupServer(),this._setupSSH(),r.server.attachOnStart&&this.attachConsole(),console.local=y().mapValues(this.local,(function(e,t){var r=function(){return e.apply(void 0,arguments)};return Object.defineProperty(r,"name",{value:t}),r})),console.remote=y().mapValues(this.remote,(function(e,t){var r=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return e.apply(void 0,[{callerStackDistance:2}].concat(r))};return Object.defineProperty(r,"name",{value:t}),r}))}return i()(e,[{key:"_getServerProtocol",value:function(e){return e._events&&e._events.tlsClientError?"https":"http"}},{key:"getServerPaths",value:function(){return{basePath:d().normalize("".concat(__dirname,"/../dist")),client:"monkey.js",index:"index.html"}}},{key:"_displayServerWelcome",value:function(){if(!this.options.server.silent){var e=this.options.server.server;if(e.listening){var t=this._getServerProtocol(e),r=e.address(),n=r.address,s=r.port;this.local.log("Node Monkey listening at ".concat(t,"://").concat(n,":").concat(s))}else e.on("listening",this._displayServerWelcome.bind(this))}}},{key:"_setupCmdMan",value:function(){this._cmdMan=new M.default({write:function(e,t){console.log(e)},writeLn:function(e,t){console.log(e)},error:function(e,t){console.error(e)},prompt:function(e,t,r){"function"==typeof t&&(t,t=void 0),t||(t={}),console.warn("Prompt not implemented")}}),this.addCmd=this._cmdMan.addCmd,this.runCmd=this._cmdMan.runCmd}},{key:"_setupUserManager",value:function(){var e=this.options.dataDir,r=this.userManager=new O.default({userFile:e?"".concat(e,"/users.json"):void 0,silent:this.options.server.silent});this.addCmd("showusers",function(){var e=t()(c().mark((function e(t,n){var s;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.getUsers();case 2:s=e.sent,n.writeLn(Object.keys(s).join("\n"));case 4:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}()),this.addCmd("adduser",(function(e,t,n){var s=e.args._[0];if(!s)return t.error("You must specify a username"),n();t.prompt("Password: ",{hideInput:!0},(function(e,i){t.writeLn(),t.prompt("Again: ",{hideInput:!0},(function(e,o){t.writeLn(),i===o?r.createUser(s,i).then((function(){return t.write("Created user '".concat(s,"'"))})).catch(t.error).then(n):(t.error("Passwords do not match"),n())}))}))})),this.addCmd("deluser",(function(e,t,n){var s=e.args._[0];if(!s)return t.error("You must specify a username"),n();r.deleteUser(s).then((function(){return t.write("Deleted user '".concat(s,"'"))})).catch(t.error).then(n)})),this.addCmd("passwd",(function(e,t,n){e.args;var s=e.username;t.prompt("Current password: ",{hideInput:!0},(function(e,i){t.writeLn(),r.verifyUser(s,i).then((function(e){e?t.prompt("Password: ",{hideInput:!0},(function(e,i){t.writeLn(),t.prompt("Again: ",{hideInput:!0},(function(e,o){t.writeLn(),i===o?r.setPassword(s,i).then((function(){return t.write("Updated password for ".concat(s))})).catch(t.error).then(n):(t.error("Passwords do not match"),n())}))})):(t.error("Incorrect password"),n())}))}))}))}},{key:"_setupServer",value:function(){var e=this.options,t=e.server.server;if(!t){var r=(0,x.default)({name:"Node Monkey"});t=this.options.server.server=r.server;var n=e.server,s=n.host,i=n.port;r.listen(i,s)}this._displayServerWelcome(),this.serverApp=t,this.remoteClients=(0,S.default)({server:t.server||t,cmdManager:this._cmdMan,userManager:this.userManager,onAuth:this._sendMessages.bind(this),clientSettings:e.client})}},{key:"_setupSSH",value:function(){var e=this.options.ssh;if(e.enabled){var t=this.options.dataDir;if(!t)throw new Error("Options 'dataDir' is required to enable SSH");var r,n=/\.key$/,s=[],i=q(f().readdirSync(t));try{for(i.s();!(r=i.n()).done;){var o=r.value;n.test(o)&&s.push("".concat(t,"/").concat(o))}}catch(e){i.e(e)}finally{i.f()}if(!s.length){console.log("No SSH host key found. Generating new host key...");var a=w()();f().writeFileSync("".concat(t,"/rsa.key"),a.private),f().writeFileSync("".concat(t,"/rsa.key.pub"),a.public),s=["".concat(t,"/rsa.key")]}this.SSHMan=new C.default({monkey:this,userManager:this.userManager,cmdManager:this._cmdMan,silent:this.options.server.silent,host:e.host,port:e.port,title:y().result(e,"title"),prompt:y().result(e,"prompt"),hostKeys:s})}}},{key:"_getCallerInfo",value:function(e){if(this.options.client.showCallerInfo){var t=j.default.getStack().map((function(e){return{functionName:e.getFunctionName(),methodName:e.getMethodName(),fileName:e.getFileName(),lineNumber:e.getLineNumber(),columnNumber:e.getColumnNumber()}})),r=t.find((function(e,t,r){var n=r[t-2],s=r[t-4];return!(!n||"Logger._emit"!==n.functionName||!/\/bunyan\.js$/.test(n.fileName))||(!(!n||!s||"emit"!==n.methodName||"_sendMessage"!==s.methodName)||void 0)}));if(r||"number"!=typeof e||(r=t[e]),r)return{caller:r.functionName||r.methodName,file:r.fileName,line:r.lineNumber,column:r.columnNumber}}}},{key:"_sendMessage",value:function(e,t){this.msgBuffer.push({method:e.method,args:e.args,callerInfo:e.callerInfo||this._getCallerInfo(t+1)}),this.msgBuffer.length>this.options.server.bufferSize&&this.msgBuffer.shift(),this._sendMessages()}},{key:"_sendMessages",value:function(){var e=this.remoteClients;y().size(e.adapter.rooms.get("authed"))&&(y().each(this.msgBuffer,(function(t){e.to("authed").emit("console",g.default.decycle(t))})),this.msgBuffer=[])}},{key:"_createLocal",value:function(){this.local=P}},{key:"_createRemote",value:function(){var e=this,t=this.remote={};I.forEach((function(r){e.remote[r]=function(){for(var t=arguments.length,n=new Array(t),s=0;s<t;s++)n[s]=arguments[s];var i=n[0]&&n[0].callerStackDistance;e._sendMessage({method:r,args:i?n.slice(1):n},i?i+1:2)},Object.defineProperty(t[r],"name",{value:r})}))}},{key:"attachConsole",value:function(e){var t=this;if(!this._attached){if(!F){var r=0;I.forEach((function(e){console[e]=function(){for(var n=arguments.length,s=new Array(n),i=0;i<n;i++)s[i]=arguments[i];var o;if(r)return(o=t.local)[e].apply(o,s);++r,T.emit.apply(T,[e].concat(s)),--r},Object.defineProperty(console[e],"name",{value:e})}))}++F;var n=this.options.server;e=void 0!==e?e:n.disableLocalOutput,y().each(this.remote,(function(r,n){var s=t._typeHandlers[n]=function(){for(var s=arguments.length,i=new Array(s),o=0;o<s;o++)i[o]=arguments[o];var a;(r.apply(void 0,[{callerStackDistance:4}].concat(i)),e)||(a=t.local)[n].apply(a,i)};Object.defineProperty(s,"name",{value:n}),T.on(n,s)})),this._attached=!0}}},{key:"detachConsole",value:function(){var e=this;Object.assign(console,this.local),this._attached=!1,--F,I.forEach((function(t){T.removeListener(t,e._typeHandlers[t]),delete e._typeHandlers[t]}))}}]),e}(),D={},U=50499;function R(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"default";if("string"==typeof e&&(t=e,e=void 0),!D[t]){e||(e={});var r=y().get(e,"server.port");r?U=+r:(y().set(e,"server.port",++U),y().set(e,"ssh.port",++U)),D[t]=new L(e)}return D[t]}})(),__webpack_exports__=__webpack_exports__.default,__webpack_exports__})()}));
//# sourceMappingURL=server.js.map