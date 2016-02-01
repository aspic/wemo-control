/**
 * https://github.com/timonreinhard/wemo-client
 */
var Immutable = require('immutable');
var Wemo = require('wemo-client');
var wemo = new Wemo();
var client; 

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
