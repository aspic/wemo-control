/**
 * Based off https://github.com/timonreinhard/wemo-client
 */
var Wemo = require('wemo-client');
var wemo = new Wemo();
var client; 
var endDevices = [];

exports.init = function() {
    wemo.discover(function(deviceInfo) {
        client = wemo.client(deviceInfo);
        // TODO: reload?
        client.getEndDevices(function(err, data){
            endDevices = data;
        });
    });
};

exports.endDevices = function() {
    return endDevices;
}

exports.toggle = function(deviceId, action) {
    var actionId = action === "off" ? 0 : 1;
    
    client.setDeviceStatus(deviceId, 10006, actionId, function(err, resp) {
        console.log(resp);
    });
};
    
exports.dim = function(deviceId, value, time) {
    client.setDeviceStatus(deviceId, 10008, value + ":" + time, function(err, resp) {
        console.log(resp);
    });
};
