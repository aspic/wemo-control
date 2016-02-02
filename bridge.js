var Promise = require('promise');
var Immutable = require('immutable');

var plugins = {};
var rules = [];
var activeRules = [];

/** exported functions */
exports.init = function(config) {
    rules = config.rules; 

    Object.keys(config.plugins).forEach(function(key) {
        registerPlugin(key, require('./plugins/' + config.plugins[key]));
    });
    initPlugins(); 
}


exports.getDevices = function() {
    var devices = [];
    apply(function(plugin) {
        devices = [].concat(devices, plugin.getDevices());
    });
    return devices;
}

exports.toggle = function(id) {
    return new Promise(function(resolve, reject) {
        var device = getDevice(id);
        if(device && device.setEnabled) {
            device.setEnabled(!device.enabled, function() {
                resolve(device);
            });
        } else {
            reject("device " + id + " does not support setEnabled");
        }
    });
}

exports.setBrightness = function(id, value) {
    return new Promise(function(resolve, reject) {
        var device = getDevice(id);
        if(device && device.setBrightness) {
            device.setBrightness(value, function() {
                resolve(device);
            });
        } else {
            reject("device " + id + " does not support setBrightness");
        }
    });
}

exports.setValue = function(id, key, value) {
    return new Promise(function(resolve, reject) {
        var device = getDevice(id);
        if(!device) {
            reject("device with id: " + id + " not found");
        }
        var setter = toSetter(key);
        console.log(setter);
        if(device && typeof(device[setter]) === 'function') {
            device[setter](value, function() {
                resolve(device);
            });
        } else {
            reject("device with id: " + id + " does not support setter: " + setter + "()");
        }
    });
}

exports.getRules = function() {
    var i = 0;
    var active = rules.map(function(rule) {
        var rule = Immutable.Map(rule)
        if(isActive(i)) {
            rule = rule.set('active', true);
        }
        rule = rule.set('id', i);
        i++;
        return rule;
    });
    return active;
}

exports.updateRule = function(rule) {
   var newRule = {
        id: rule.id,
        name: rule.name,
        icon: rule.icon,
        devices: rule.devices
   } 
   if(rule.id >= rules.length) {
        rules.push(newRule);
   } else {
        rules[rule.id] = newRule;
   }
}

exports.toggleRule = function(ruleId) {
    var rule = rules[ruleId];
    if(rule) {
        isActive(ruleId) ? disableRule(rule) : enableRule(rule);
    }
    return exports.getRules();
}

/** helpers */
function registerPlugin(name, plugin) {
    var enabled = {
        init: plugin.init,
        getDevices: plugin.getDevices
    };

    plugins[name] = enabled;
    console.log("Enabled plugin: " + name);
}

function initPlugins(plugins) {
    

    apply(function(plugin) {
        plugin.init();
    });
}

function getDevice(id) {
    var devices = exports.getDevices();
    for(var i = 0; i < devices.length; i++) {
        if(id === devices[i].id) {
            return devices[i];
        }
    }
}

function apply(f) {
    for (var key in plugins) {
        if (plugins.hasOwnProperty(key)) {
            f(plugins[key]);
        }
    } 
}

function toSetter(key) {
    return "set" + key.charAt(0).toUpperCase() + key.slice(1);
}

function isActive(id) {
    for(var i = 0; i < activeRules.length; i++) {
        if(activeRules[i].id == id) {
            return true;
        } 
    }
    return false;
}

function disableRule(rule) {
    for(var i = 0; i < activeRules.length; i++) {
        var activeRule = activeRules[i];
        if(rule.id == activeRule.id) {
            activeRules.splice(i, 1);
            break;
        }
    }    
    // Re-apply last rule
    if(activeRules.length > 0) {
        applyRule(activeRules[activeRules.length - 1]);
    }
}

function enableRule(rule) {
    if(applyRule(rule)) {
        activeRules.push(rule);
    }
};

function applyRule(rule) {
    var rules = rule.devices;
    rule.devices.map(function(deviceRule) {
        var device = getDevice(deviceRule.id);
        for (var prop in deviceRule) {
            exports.setValue(deviceRule.id, prop, deviceRule[prop])
                .then(function(result) {
                    handled = true;
                }, function(err) {
                    //TODO handle?
                    console.log("Error setting value " + err);
                });
        }
    });
    return true;
}
