var path = require('path');
var express = require('express');
var app = express();

var control = require('./wemo-control');

control.init();

app.use('/build', express.static('build'));

app.get('/js/app.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'src/app.js'));
});

app.get('/api/devices', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(control.endDevices());
});

app.get('/api/light/:id/:toggle', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var action = req.param("toggle");
    control.toggle(id, action);

    res.send({status: "ok"});
});
app.get('/api/light/:id/level/:level', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var id = req.param("id");
    var level = req.param("level");
    control.dim(id, level, 0);

    res.send({status: "ok"});
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(3000, 'localhost', function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Listening at http://localhost:3000');
});
