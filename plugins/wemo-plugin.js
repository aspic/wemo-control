/**
 * https://github.com/timonreinhard/wemo-client
 */
var Immutable = require('immutable');
var Wemo = require('wemo-client');
var wemo = new Wemo();
var client; 
var rules;

var activeRules = [];
var controls = {};

var devices = [];
var LIGHT_DIMMABLE = "dimmableLight";

exports.init = function() {
    console.log("Starts initiating wemo plugin");
    wemo.discover(function(deviceInfo) {
        client = wemo.client(deviceInfo);
        client.getEndDevices(function(err, data){
            devices = loadDevices(data);
            console.log("Wemo plugin initiated with " + devices.length + " devices");
        });
    });
};

function loadDevices(devices) {
    return devices.map(function(device) {
        if(device.deviceType === LIGHT_DIMMABLE) {
            return registerLight(device);
        } 
    });
}

function registerLight(device) {
    return {
        id: device.deviceId,
        name: device.friendlyName,
        type: 'light',
        enabled: device.capabilities['10006'] === "1",
        brightness: device.capabilities['10008'],
        setEnabled: function(enabled, cb) {
            var enabledValue = enabled ? 1 : 0;
            var device = this;
            client.setDeviceStatus(this.id, 10006, enabledValue, function(err, resp) {
                device.enabled = enabled; 
                cb();
            });
        },
        setBrightness: function(value, cb) {
            var device = this;
            if(value < 0 || value > 255) {
                console.log(value + " is not between 0 or 255");
                return;
            }
            client.setDeviceStatus(this.id, 10008, value, function(err, resp) {
                device.brightness = value;
                device.enabled = value === "0" ? false : true;
                cb();
            });
        }
    }
}

exports.getDevices = function() {
    return devices;
}

exports.reload = function(cb) {
    client.getEndDevices(function(err, data){
        endDevices = data;
        if(cb) {
            cb(data);
        }
    });
}

exports.toggleRule = function(ruleKey) {
    var rule = rules[ruleKey];
    if(rule) {
        isActive(ruleKey) ? disableRule(rule) : enableRule(rule);
    }

    return exports.rulesAsActive();
}

exports.updateRule = function(rule) {
   var newRule = {
        name: rule.name,
        icon: rule.icon,
        deviceRules: rule.deviceRules
   } 
   rules[newRule.name] = newRule;
}

function disableRule(rule) {
    for(var i = 0; i < activeRules.length; i++) {
        var activeRule = activeRules[i];
        if(rule.name === activeRule.name) {
            activeRules.splice(i, 1);
            break;
        }
    }    
    if(activeRules.length > 0) {
        // Re-applies last rule
        applyRule(activeRules[activeRules.length - 1]);
    }
}

function enableRule(rule) {
    if(applyRule(rule)) {
        activeRules.push(rule);
    }
};

function applyRule(rule) {
    var deviceRules = rule.deviceRules;
    var handled = false;
    Object.keys(deviceRules).forEach(function(deviceId) {
        var deviceRule = deviceRules[deviceId];

        if(deviceRule.brightness) {
            exports.dim(deviceId, deviceRule.brightness, 0);
            handled = true;
        }
        if(deviceRule.state) {
            var actionId = deviceRule.state === "on" ? 1 : 0;    
            controlLight(deviceId, actionId);
            handled = true;
        }
    });
    return handled;
}

exports.rules = function() {
    return rules;
}

exports.rulesAsActive = function() {
    var active = {};
    Object.keys(rules).forEach(function(key) {
        var rule = Immutable.Map(rules[key])
        if(isActive(key)) {
            rule = rule.set('active', true);
        }
        rule = rule.set('devices', rulesToDevices(rule.get('deviceRules')));
        active[key] = rule;
    });
    return active;
}

function isActive(ruleName) {
    for(var i = 0; i < activeRules.length; i++) {
        if(activeRules[i].name === ruleName) {
            return true;
        } 
    }
    return false;
}

function rulesToDevices(deviceRules) {
    var devices = [];
    Object.keys(deviceRules).forEach(function(deviceId) {
        var device = filterDevice(deviceId, endDevices);
        var deviceRule = deviceRules[deviceId];
        if(device) {
            if(deviceRule.enabled) {
                device.capabilities["10006"] = deviceRule.enabled ? 1 : 0;
            }
            if(deviceRule.brightness) {
                device.capabilities["10008"] = deviceRule.brightness;
            }
            devices.push(device);
        }
    });
    return devices;
}
