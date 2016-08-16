/**
 * https://github.com/timonreinhard/wemo-client
 */
var Wemo = require('wemo-client');
var wemo = new Wemo();

var LIGHT_DIMMABLE = "dimmableLight";
var devices = [];

exports.init = function(listener) {
    console.log("Starts initiating wemo plugin");
    wemo.discover(function(deviceInfo) {
        var client = wemo.client(deviceInfo);
        var modelName = deviceInfo.modelName;
        if(modelName === "Bridge") {
            client.getEndDevices(function(err, data){
                devices = devices.concat(loadDevices(data, client));
                console.log("Wemo plugin initiated with " + devices.length + " devices");
            });
        } else if(modelName === "Socket") {
            devices.push(registerSocket(deviceInfo, client, listener));
            console.log("Wemo plugin initiated with " + devices.length + " devices");
        } else if(modelName === "Sensor") {
            devices.push(registerSensor(deviceInfo, client, listener));
            console.log("Wemo plugin initiated with " + devices.length + " devices");
        } else {
            console.log("Unable to handle device with name: " + modelName);
        }
    });
};

function loadDevices(devices, client) {
    return devices.map(function(device) {
        if(device.deviceType === LIGHT_DIMMABLE) {
            return registerLight(device, client);
        }
    });
}

function registerLight(device, client) {
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
                device.enabled = value !== "0";
                cb();
            });
        }
    }
}

function registerSocket(deviceInfo, client, listener) {
    var device = {
        id: deviceInfo.serialNumber,
        name: deviceInfo.friendlyName,
        type: 'socket',
        enabled: deviceInfo.binaryState === '1',
        setEnabled: function(enabled, cb) {
            var enabledValue = enabled ? 1 : 0;
            var device = this;
            client.setBinaryState(enabledValue, function(err, response) {
                if(!err) {
                    device.enabled = enabled;
                    cb();
                } else {
                    console.log(err);
                }
            });
        }
    };
    client.on('binaryState', function(value) {
        device.enabled = value === '1';
        listener(device);
    });
    return device;
}

function registerSensor(deviceInfo, client, listener) {
    var device = {
        id: deviceInfo.serialNumber,
        name: deviceInfo.friendlyName,
        type: 'sensor',
        enabled: deviceInfo.binaryState === '1'
    };
    client.on('binaryState', function(value) {
        device.enabled = value === '1';
        listener(device);
    });
    return device;
}

exports.getDevices = function () {
    return devices;
};
