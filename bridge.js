var Promise = require('promise');

var plugins = {};
var rules = [];
var activeId = -1;

var logs = [];

/** exported functions */
exports.init = function(config) {
    rules = config.rules; 

    Object.keys(config.plugins).forEach(function(key) {
        registerPlugin(key, require('./plugins/' + config.plugins[key]));
    });
    initPlugins(); 
};


exports.getDevices = function() {
    var devices = [];
    apply(function(plugin) {
        devices = [].concat(devices, plugin.getDevices());
    });
    return devices;
};

exports.getLog = function() {
    return logs;
};

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
};

exports.setValue = function(id, key, value) {
    return new Promise(function(resolve, reject) {
        var device = getDevice(id);
        if(!device) {
            reject("device with id: " + id + " not found");
        }
        var setter = toSetter(key);
        if(device && typeof(device[setter]) === 'function') {
            device[setter](value, function() {
                resolve(device);
            });
        } else {
            reject("device with id: " + id + " does not support setter: " + setter + "()");
        }
    });
};

exports.getRules = function() {
    return rules.map(function(rule) {
        rule.active = rule.id == activeId;
        return rule;
    });
};

/** Adds or updates a rule */
exports.updateRule = function(rule) {

    var index = ruleIndex(rule.id);
    if(rule.removed) {
        if(index >= 0) {
            rules.splice(index, 1);
            log('removed rule', rule.id);
        }
        return this.getRules();
    }

    var newRule = {
        id: rule.id,
        name: rule.name,
        icon: rule.icon,
        devices: rule.devices
    };

    if(index >= 0) {
        rules[index] = newRule;
        log('updated rule', rule.id);
    } else {
        rules.push(newRule);
        log('added rule', rule.id);
    }
    return this.getRules();
};

/* Disables, enables or toggles rule by name */
exports.controlRule = function(id, action) {
    return new Promise(function(resolve, reject) {
        var rule = ruleById(id);

        console.log(rule);
        if (rule) {
            if(action == "toggle") {
                isActive(rule) ? disableRule(rule) : enableRule(rule);
                resolve(this.getRules());
            } else if(action == "enable") {
                resolve(enableRule(rule));
            } else if(action == "disable") {
                resolve(disableRule(rule));
            } else {
                reject("action " + action + " not supported");
            }
        } else {
            reject("unable to find rule: " + id);
        }
    }.bind(this));
};

/** helpers */
function registerPlugin(name, plugin) {
    plugins[name] = {
        init: plugin.init,
        getDevices: plugin.getDevices
    };
    console.log("Enabled plugin: " + name);
}

function log(action, ruleId) {
    logs.push({
        action: action,
        rule: ruleId,
        at: Date.now()
    });
    console.log(logs);
}

function initPlugins() {
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

function isActive(rule) {
    return activeId === rule.id;
}

function disableRule(rule) {
    log('disabled rule', rule.id);
    activeId = -1;
}

function enableRule(rule) {
    if(applyRule(rule)) {
        activeId = rule.id;
    }
    log('enabled rule', rule.id);
}

function applyRule(rule) {
    rule.devices.map(function(deviceRule) {
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

function ruleIndex(id) {
    for(var i = 0; i < rules.length; i++) {
        if(id == rules[i].id) {
            return i;
        }
    }
    return -1;
}

function ruleById(id) {
    for(var i = 0; i < rules.length; i++) {
        if(id == rules[i].id) {
            return rules[i];
        }
    }
}
