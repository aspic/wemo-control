# Wemo control
I got my hands on a couple of [wemo lights](http://www.belkin.com/us/p/P-F7C033/). However their smart phone application is horrendously bad, slow, and error prone. If that's not bad enough, there is no proper API for their devices. After looking into several alternatives (most of them not working at all) for controlling these lights, I stumbled upon [wemo client for node](https://github.com/timonreinhard/wemo-client). Which detects all devices in my home network (even grouped lightbulbs). So, I started to build a little web application to control these devices.

## Dependencies
* [node js](https://nodejs.org/) (server back end)
* [node express](http://expressjs.com/) (routing and request/response handling)
* [wemo client for node](https://github.com/timonreinhard/wemo-client) (interface to manage wemo)
* [immutable-js](https://github.com/facebook/immutable-js) 
* .. some react, babel, bootstrap and font-awesome for the front-end

## Install and run

    // Install dependencies
    $ npm install express wemo-client immutable
    // Run
    $ node server.js

This starts the server and exposes the web application on ```http://localhost:3000```

## Todo
* Add a 'mode' section, where it's possible to create modes and control multiple bulbs at once (and by certain rules)
* Extract frontend-stuff into a distable dependency
* Periodically controllable modes, for instance turn all lights on at 0700am
