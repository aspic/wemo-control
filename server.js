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


app.get('/api/devices', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(bridge.getDevices());
});

app.get('/api/device/:id/toggle', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    bridge.toggle(id)
        .then(function(result) {
            res.send(result);
        }, function(err) {
            res.send({ error: err });
        });
});
app.get('/api/device/:id/brightness/:value', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var value = req.param("value");

    bridge.setValue(id, 'brightness', value)
        .then(function(result) {
            res.send(result);
        }, function(err) {
            res.send({ error: err });
        });
});

app.get('/api/rules/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(bridge.getRules());
});
app.post('/api/rule/:id/update', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var rule = bridge.updateRule(req.body, id);
    storeConfig()
        .then(function(result) {
            console.log(result);
        }, function(err) {
            console.log(err);
        });
    res.send(rule);
});

app.get('/api/rule/:name/:action', function (req, res) {
    var name = req.param("name");
    var action = req.param("action");
    bridge.controlRule(name, action)
        .then(function(rule) {
            res.send(rule);
        }, function(err) {
            res.status(404).send(err);
        });
});

app.use('/', express.static('frontend'));

function storeConfig() {
    return new Promise(function(resolve, reject) {
        var rules = bridge.getRules();
        config.rules = rules;
        var configString = JSON.stringify(config, null, 4);

        fs.writeFile("./config.json", configString, function(err) {
            if(err) {
                reject("Unable to write config: " + err);
            } else {
                resolve("Config written");
            }
        });  
    });
}

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
