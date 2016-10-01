var Heos = require('heos');
var devices = [];

function HeosPlugin(listener, config) {

}

exports.new = function(listener, config) {
    return new HeosPlugin(listener, config);
};

HeosPlugin.prototype.load = function () {

    Heos.connect()
        .then(function(heos) {
            // Get all your players (speakers or groups)
            return heos.getPlayers();
        })
        .then(function(players) {

            console.log('Found %s players', players.length);
            for(var i = 0; i < players.length; i++) {
                devices.push(registerPlayer(players[i]));
            }


            // Pick the first and get what it is playing
            return players[0].getNowPlaying()
                .then(function(media) {
                    console.log('Playing:', media);
                });

        })
        .catch(function(err) {
            console.log('Error', err);
        });

    return this;
};

HeosPlugin.prototype.getDevices = function() {
    return devices;
};

function registerPlayer(player) {
    return {
        id: String(player.pid),
        name: player.name,
        type: 'player',
        setPlayNext: function (value, cb) {
            player.playNext();
            cb();
        },
        setPlayPrevious: function (value, cb) {
            player.playPrevious();
            cb();
        }
    }
}
