/** dependencies */
var path = require('path');
var Promise = require('promise');
var express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');

/** create app and register middleware */
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** run wemo and load config */
var bridge = require('./bridge');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

bridge.init(config);

app.use('/build', express.static('build'));

app.get('/js/app.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'src/app.js'));
});

app.get('/api/devices', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(bridge.getDevices());
});

app.get('/api/device/:id/toggle', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    bridge.toggle(id).then(function(result) {
        res.send(result);
    }, function(err) {
        res.send({ error: err });
    });
});
app.get('/api/device/:id/brightness/:value', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var value = req.param("value");

    bridge.setValue(id, 'brightness', value).then(function(result) {
        res.send(result);
    }, function(err) {
        res.send({ error: err });
    });
});

app.get('/api/rules/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(bridge.getRules());
});
app.post('/api/rule/:rule/update', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    bridge.updateRule(req.body);
    res.send(bridge.getRules());
});

app.get('/api/rules/:rule/toggle', function (req, res) {
    var ruleKey = req.param("rule");
    bridge.toggleRule(ruleKey);
    res.send(bridge.getRules());
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
