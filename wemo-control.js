/**
 * https://github.com/timonreinhard/wemo-client
 */
var Immutable = require('immutable');
var Wemo = require('wemo-client');
var wemo = new Wemo();
var client; 
var endDevices = [];
var rules;

var activeRules = [];

exports.init = function(config) {
    wemo.discover(function(deviceInfo) {
        client = wemo.client(deviceInfo);
        console.log(client);
        exports.reload();
    });
    rules = config.rules;
};

exports.reload = function(cb) {
    client.getEndDevices(function(err, data){
        endDevices = data;
        if(cb) {
            cb(data);
        }
    });
}

exports.endDevices = function() {
    return endDevices;
}

exports.toggle = function(deviceId, cb) {

    var device = filterDevice(deviceId, endDevices);
    var enabled = lightEnabled(device);
    var actionId = enabled ? 0 : 1;
    
    client.setDeviceStatus(deviceId, 10006, actionId, function(err, resp) {
        exports.reload(function(devices) {
            var device = filterDevice(deviceId, devices);
            if(cb) {
                cb(device);
            }
        });
    });
};
    
exports.dim = function(deviceId, value, time, cb) {
    client.setDeviceStatus(deviceId, 10008, value + ":" + time, function(err, resp) {
        exports.reload(function(devices) {
            var device = filterDevice(deviceId, devices);
            if(cb) {
                cb(device);
            }
        });
    });
};

exports.toggleRule = function(ruleKey) {
    var rule = rules[ruleKey];
    if(rule) {
        isActive(rule) ? disableRule(rule) : enableRule(rule);
    }

    return exports.rulesAsActive();
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
    var devices = rule.devices;
    var brightness = rule.brightness;
    var handled = false;

    for(var i = 0; i < devices.length; i++) {
        var deviceId = devices[i];
        if(brightness) {
            exports.dim(deviceId, brightness, 0);
            handled = true;
        }
    } 
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
        rule = rule.set('devices', deviceIdsToDevices(rule.get('devices')));
        active[key] = rule;
    });
    return active;
}

function filterDevice(deviceId, devices) {
    var device;
    for(var i = 0; i < devices.length; i++) {
        if(deviceId === devices[i].deviceId) {
            device = devices[i];
            break;
        }
    }
    return device;
}

function isActive(ruleName) {
    for(var i = 0; i < activeRules.length; i++) {
        if(activeRules[i].name === ruleName) {
            return true;
        } 
    }
    return false;
}

function deviceIdsToDevices(devices) {
    return devices.map(function(deviceId) {
        for(var i = 0; i < endDevices.length; i++) {
            var device = endDevices[i];
            if(device.deviceId === deviceId) {
                return device;
            }
        }           
    });
}

function lightEnabled(device) {
    return device.capabilities["10006"] === "1";

}
