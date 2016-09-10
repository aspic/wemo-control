/** Runs a shell command when some conditional is true */

var exec = require('child_process').exec;
var devices = [];

exports.init = function(listener, config) {
    var device = {
        id: 'cmd-' + Date.now(),
        name: 'Command line plugin',
        type: 'cmd',
        notify: function(device) {
            if(device.enabled) {
                exec(config.cmd, function(error, stdout, stderr) {

                    if(error != null || stderr) {
                        console.log("error " + error);
                        console.log("stderr " + stderr);
                    } else {
                        console.log("stdout " + stdout);
                    }
                });
            }
        }
    };
    devices = [device];
};

exports.getDevices = function () {
    return devices;
};