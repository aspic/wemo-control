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

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

/** run wemo and load config */
var bridge = require('./bridge');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

bridge.init(config);


app.get('/api/devices', function (req, res) {
    res.send(bridge.getDevices());
});

app.get('/api/device/:id/toggle', function (req, res) {
    var id = req.params.id;
    bridge.toggle(id)
        .then(function(result) {
            res.send(result);
        }, function(err) {
            res.send({ error: err });
        });
});
app.get('/api/device/:id/brightness/:value', function (req, res) {
    var id = req.params.id;
    var value = req.params.value;

    bridge.setValue(id, 'brightness', value)
        .then(function(result) {
            res.send(result);
        }, function(err) {
            res.send({ error: err });
        });
});

app.get('/api/rules/', function(req, res) {
    res.send(bridge.getRules());
});
app.get('/api/log/', function(req, res) {
    res.send(bridge.getLog());
});

app.post('/api/rule/:id/update', function(req, res) {
    var id = req.params.id;
    var rule = bridge.updateRule(req.body);
    storeConfig()
        .then(function(result) {
            console.log(result);
        }, function(err) {
            console.log(err);
        });
    res.send(rule);
});

app.post('/api/rule/:id/remove', function(req, res) {
    var id = req.params.id;
    var rules = bridge.updateRule({id: id, removed: true});
    storeConfig()
        .then(function(result) {
            console.log(result);
        }, function(err) {
            console.log(err);
        });
    res.send(rules);
});

app.get('/api/rule/:id/:action', function (req, res) {
    var name = req.params.id;
    var action = req.params.action;
    bridge.controlRule(name, action)
        .then(function(rules) {
            res.send(rules);
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
