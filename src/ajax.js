import $ from 'jquery';
import { Globals } from './index.js';

export function getDevices(cb) {
    $.ajax(Globals.host + '/api/devices').then(function(data) {
        cb(data);
    });
}

export function getRules(cb) {
    $.ajax(Globals.host + '/api/rules').then(function(rules) {
        cb(rules);
    });
}

export function postToggleDevice(id, cb) {
    $.ajax(Globals.host + '/api/device/' + id + '/toggle').then(function(data) {
        cb(data);
    });
}

export function postBrightness(id, value, cb) {
    $.ajax(Globals.host + '/api/device/' + id + '/brightness/' + value).then(function (data) {
        cb(data);
    });
}

export function postToggleRule(id, cb) {
    $.ajax(Globals.host + '/api/rule/' + id + '/toggle').then(function (data) {
        cb(data);
    });
}

export function postUpdateRule(name, rule, cb) {
    $.ajax({
        url: Globals.host + '/api/rule/' + name + '/update',
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

