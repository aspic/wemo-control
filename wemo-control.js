/**
 * https://github.com/timonreinhard/wemo-client
 */
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

exports.toggle = function(deviceId, action, cb) {
    var actionId = action === "off" ? 0 : 1;
    
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

exports.applyRule = function(ruleKey) {
    var rule = rules[ruleKey];

    if(rule) {
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
        if(handled) {
            activeRules.push(rule);
        }

        rule.active = handled;
    }
    return rule;
};

exports.rules = function() {
    return rules;
}

exports.activeRules = function() {
    return activeRules;
}

exports.allRules = function() {
    return {rules: rules, activeRules: activeRules};
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
