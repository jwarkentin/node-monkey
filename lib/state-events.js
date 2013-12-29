var _ = require('lodash');

// An event system based around jQuery's deferred object. Events are fired by resolving the deferred object. This, however, allows the object to essentially be "reset".
module.exports = {
  _validEvent: function(event) {
    if(!this._evts[event]) {
      console.trace();
      throw new Error("'" + event + "' is not a registered event");
    }
  },

  // Memory management - call this when shutting down an object instance that implements this
  _shutdownEvents: function() {
    this._evts = null;
  },

  // Register one or multiple events
  _registerEvent: function(events) {
    var that = this;

    if(!this._evts) {
      this._evts = {};
    }

    if(!_.isArray(events)) {
      events = [events];
    }

    _.each(events, function(event) {
      // We register the antithetic events as well so anything can know which state the event object is in
      if(!_.str.endsWith(event, 'Pending')) {
        that._registerEvent(event + 'Pending');
      }

      that._evts[event] = {deferred: null, once: [], each: []};
      that._resetEvent(event);
    });
  },

  _resetEvent: function(event) {
    this._validEvent(event);

    var that = this;

    if(!this._evts[event].deferred || this._evts[event].deferred.state() == 'resolved') {
      this._evts[event].deferred = _.Deferred();

      _.when(this._evts[event].deferred).done(function() {
        that._fireEvent(event);
      });

      if(!_.str.endsWith(event, 'Pending')) {
        this._completeEvent(event + 'Pending');
      }
    }
  },

  _fireEvent: function(event) {
    this._validEvent(event);

    var evtObj = this._evts[event];
    _.when(evtObj.deferred).done(evtObj.each, evtObj.once);
    evtObj.once = [];
  },

  _completeEvent: function(event) {
    this._validEvent(event);

    var def = this._evts[event].deferred;
    def.resolve.apply(def, Array.prototype.slice.call(arguments, 1));

    if(!_.str.endsWith(event, 'Pending')) {
      this._resetEvent(event + 'Pending');
    }
  },

  onState: function(event, callback) {
    /*if(!this._evts[event]) {
      return this.constructor.__super__.on.apply(this, arguments);
    }*/
    this._validEvent(event);

    var evtObj = this._evts[event];
    evtObj.each.push(callback);

    if(evtObj.deferred.state() == 'resolved') {
      _.when(evtObj.deferred).done(callback);
    }
  },

  onceState: function(event, callback) {
    /*if(!this._evts[event]) {
      return this.constructor.__super__.once.apply(this, arguments);
    }*/
    this._validEvent(event);

    var evtObj = this._evts[event];
    if(evtObj.deferred.state() == 'resolved') {
      _.when(evtObj.deferred).done(callback);
    } else {
      evtObj.once.push(callback);
    }
  },

  offState: function(event, callback) {
    /*if(!this._evts[event]) {
      return this.constructor.__super__.off.apply(this, arguments);
    }*/
    this._validEvent(event);

    var evtObj = this._evts[event],
        cblocOnce = evtObj.once.indexOf(callback),
        cblocEach = evtObj.each.indexOf(callback);

    if(cblocOnce != -1) {
      evtObj.once.splice(cblocOnce, 1);
    }
    if(cblocEach != -1) {
      evtObj.each.splice(cblocEach, 1);
    }
  }
};