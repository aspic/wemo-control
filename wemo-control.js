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
    controlLight(deviceId, actionId, cb); 
};

function controlLight(deviceId, actionId, cb) {
    client.setDeviceStatus(deviceId, 10006, actionId, function(err, resp) {
        exports.reload(function(devices) {
            var device = filterDevice(deviceId, devices);
            if(cb) {
                cb(device);
            }
        });
    });
}
    
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

function lightEnabled(device) {
    return device.capabilities["10006"] === "1";

}
