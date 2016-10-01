import $ from 'jquery';
import { Globals } from './index.js';

export function getDevices(cb) {
    $.ajax(Globals.host + '/api/devices').then(function(data) {
        cb(data);
    });
}

export function getDevice(id, cb) {
    $.ajax(Globals.host + '/api/device/' + id).then(function(data) {
        cb(data);
    });
}

export function getRules(cb) {
    $.ajax(Globals.host + '/api/rules').then(function(rules) {
        cb(rules);
    });
}

export function getLog(cb) {
    $.ajax(Globals.host + '/api/log').then(function(data) {
        cb(data);
    });
}

export function postToggleDevice(id, cb) {
    $.ajax(Globals.host + '/api/device/' + id + '/toggle').then(function(data) {
        cb(data);
    });
}

export function postDeviceSetter(deviceId, action, value, cb) {
    $.ajax({
        url: Globals.host + '/api/device/' + deviceId + '/' + action + '/' + value,
        type: 'POST',
        success: function (data) {
            cb(data);
        }
    });
}

export function postBrightness(id, value, cb) {
    $.ajax(Globals.host + '/api/device/' + id + '/brightness/' + value).then(function (data) {
        cb(data);
    });
}

export function postToggleRule(name, cb) {
    $.ajax({
        url: Globals.host + '/api/rule/' + name + '/toggle',
        type: 'POST',
        success: function (data) {
            cb(data);
        }
    });
}

export function postUpdateRule(rule, cb) {
    $.ajax({
        url: Globals.host + '/api/rule/update',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            cb(data);
        },
        data: JSON.stringify(rule)
    });
}

export function postRemoveRule(id, cb) {
    $.ajax({
        url: Globals.host + '/api/rule/' + id + '/remove',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        success: function (removed) {
            cb(removed);
        }
    });
}

