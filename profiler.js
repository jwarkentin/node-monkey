var _ = require('underscore');

var profiler = function(options) {
  this.setConfig(options);

  this.uuidData = {};
  this.data = {};
  this.uuid = 0;
};

_.extend(profiler.prototype, {
  setConfig: function(config) {
    this.config = _.extend({
      active: true
    }, config || {});

    return this;
  },

  pause: function() {
    this.config.active = false;
  },

  resume: function() {
    this.config.active = true;
  },

  getData: function() {
    var data = this.data;

    _.each(data, function(callData, key) {
      callData.totalCalls = callData.calls.length;
      var runTimes = _.pluck(callData.calls, 'time');
      callData.totalTime = _.reduce(runTimes, function(sum, n) { return sum += n; });
    });

    return data;
  },

  startTime: function(key, params) {
    if(!this.config.active) return;

    var uuid = ++this.uuid;
    this.uuidData[uuid] = {key: key, params: params, startTime: new Date()};

    if(!this.data[key]) this.data[key] = {calls: []};

    return uuid;
  },

  stopTime: function(uuid) {
    if(!this.config.active) return;

    var stopTime = new Date();
    var uuidData = this.uuidData[uuid];
    if(!uuidData) {
      console.error('Invalid timer ID. Give the ID returned from calling startTime().');
      return;
    }

    var runTime = (stopTime.getTime() - uuidData.startTime.getTime()) / 1000;

    this.data[uuidData.key].calls.push({params: uuidData.params, time: runTime});
  },

  profile: function(key, f, saveArgs) {
    var that = this;

    return function() {
      var uuid = that.startTime(key, saveArgs ? arguments : undefined);
      var result = f.apply(this, arguments);
      that.stopTime(uuid);

      return result;
    };
  }
});


module.exports = profiler;