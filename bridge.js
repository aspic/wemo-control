var Promise = require('promise');
var wemoPlugin = require('./wemo-plugin');
var plugins = {};

registerPlugin('wemo', wemoPlugin);

exports.init = function() {
    initPlugins(); 
}

function registerPlugin(name, plugin) {
    plugins[name] = {
        init: plugin.init,
        getDevices: plugin.getDevices
    }
}

function initPlugins() {
    apply(function(plugin) {
        plugin.init();
    });
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

// registerPlugin('wemo', wemoPlugin);
// console.log("Registered plugins: ", plugins);
// initPlugins();
