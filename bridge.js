var Promise = require('promise');
var moment = require('moment');

var plugins = {};
var rules = [];
var conditionals = [];
var activeId = -1;

var logs = [];

/** exported functions */
exports.init = function(config) {
    rules = config.rules;
    conditionals = config.conditionals;

    plugins = config.plugins.map(function(plugin) {
        return require('./plugins/' + plugin.type).new(stateListener, plugin).load();
    });
};


exports.getDevices = function() {
    var devices = [];
    for(var i = 0; i < plugins.length; i++) {
        devices = [].concat(devices, plugins[i].getDevices());
    }
    return devices;
};

exports.getDevice = function(id) {
    return new Promise(function(resolve, reject) {
        var device = getDevice(id);
        if(device) {
            resolve(device);
        } else {
            reject("device " + id + " not found");
        }
    });
};

exports.getConditionals = function () {
    return new Promise(function (resolve, reject) {
        resolve(conditionals);
    });
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
            logRuleEdited(rule.name, 'removed');
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
        logRuleEdited(rule.name, 'updated');
    } else {
        rules.push(newRule);
        logRuleEdited(newRule.name, 'added');
    }
    return this.getRules();
};

/* Disables, enables or toggles rule by name */
exports.controlRule = function(name, action) {
    return new Promise(function(resolve, reject) {
        var rule = ruleByName(name);

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
            reject("unable to find rule for name=" + name);
        }
    }.bind(this));
};

/** helpers */
function registerPlugin(name, plugin, pluginConfig) {
    var createdPlugin = {
        name: name,
        init: plugin.init,
        getDevices: plugin.getDevices,
        config: pluginConfig
    };
    logPlugin(name, true);
    return createdPlugin;
}

/** Should only be called by log*methods */
function log(logObject) {
    if(!logObject.type) {
        console.log("No type specified for logObject");
        return;
    }
    logObject['at'] = moment().format();
    logs.push(logObject);
}

function logRuleChange(ruleName, action) {
    log({type: 'rule', name: ruleName, action: action});
}

function logRuleEdited(ruleName, action) {
    log({type: 'rule', name: ruleName, action: action});
}

function logStateChange(deviceName, enabled) {
    log({type: 'state', name: deviceName, enabled: enabled});
}

function logPlugin(pluginName, enabled) {
    log({type: 'plugin', name: pluginName, enabled: enabled});
}

/** Notified when devices change state */
function stateListener(device) {
    if(device.type == 'sensor') {
        logStateChange(device.name, device.enabled);
    }

    /** Check conditionals */
    if (conditionals) {
        for(var j = 0; j < conditionals.length; j++) {
            checkRuleConditional(conditionals[j]);
        }
    }
}

function checkRuleConditional(conditional) {
    /** Check conditions */
    for(var i = 0; i < conditional.and.length; i++) {
        var condition = conditional.and[i];
        var device = getDevice(condition.deviceId);

        if(device && (device.enabled !== condition.enabled)) {
            return;
        }
    }
    /** condition fulfilled */
    for(var j = 0; j < conditional.then.length; j++) {
        var then = conditional.then[j];
        var rule = ruleByName(then.ruleName);
        if(then.enabled) {
            enableRule(rule);
            logRuleChange(rule.name, 'conditional enabled');
        } else {
            disableRule(rule);
            logRuleChange(rule.name, 'conditional disabled');
        }
    }
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
    logRuleChange(rule.name, 'disabled');
    activeId = -1;
}

function enableRule(rule) {
    if(applyRule(rule)) {
        activeId = rule.id;
    }
    logRuleChange(rule.name, 'enabled');
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

function ruleByName(name) {
    for(var i = 0; i < rules.length; i++) {
        if(name === rules[i].name) {
            return rules[i];
        }
    }
}
