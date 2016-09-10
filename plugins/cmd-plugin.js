/** Runs a shell command when some conditional is true */

var exec = require('child_process').exec;

function CMD(listener, config) {
    this.devices = [];
    this.config = config;
}

CMD.prototype.load = function () {
    var device = {
        id: 'cmd-' + this.config.id,
        name: 'Command line plugin',
        type: 'cmd',
        setEnabled: function (enabled, cb) {
            if (enabled) {
                exec(this.config.cmd, function (error, stdout, stderr) {
                    if (error != null || stderr) {
                        console.log("error " + error);
                        console.log("stderr " + stderr);
                    } else {
                        console.log("stdout " + stdout);
                    }
                });
            }
            cb();
        }.bind(this)
    };
    this.devices = [device];
    return this;
};

CMD.prototype.getDevices = function () {
    return this.devices;
};

exports.new = function (listener, config) {
    return new CMD(listener, config);
};