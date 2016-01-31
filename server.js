var path = require('path');
var express = require('express');
var fs = require('fs');

var app = express();
var control = require('./wemo-control');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

control.init(config);

app.use('/build', express.static('build'));

app.get('/js/app.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'src/app.js'));
});

app.get('/api/devices', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(control.endDevices());
});

app.get('/api/device/:id/toggle', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    control.toggle(id, function(device) {
        if(device) {
            res.send(device);
        } else {
            res.send({ error: 'not found' });
        }
    });
});
app.get('/api/device/:id/level/:level', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var level = req.param("level");
    control.dim(id, level, 0, function(device) {
        if(device) {
            res.send(device);
        } else {
            res.send({ error: 'not found' });
        }
    });
});
app.get('/api/rules/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(control.rulesAsActive());
});

app.get('/api/rules/:rule/toggle', function (req, res) {
    var ruleKey = req.param("rule");
    if(ruleKey) {
        control.toggleRule(ruleKey);
    }
    res.send(control.rulesAsActive());
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

var port = 8080;
if(config.host) {
    port = config.host.port;
}

app.listen(port, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Listening on http://localhost:' + port);
});
