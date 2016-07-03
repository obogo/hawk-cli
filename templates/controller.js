'use strict';

/* global exports */

var hawk = require('local-lib').hawk;
var mongoose = require('mongoose');
var apiHelper = require('express-api-helper');
var _ = require('lodash');
var config = require('config');
var {Name} = mongoose.model('{Name}');

var load = function (req, res, next, id) {
    var promise = {Name}.findOne({_id: id}).exec();
    promise.onFulfill(function (app) {
        if (!app) {
            return apiHelper.notFound(req, res);
        }
        req.app = app;
        next();
    });
    promise.onReject(function () {
        apiHelper.notFound(req, res);
    });
};

var create = function (req, res) {
    apiHelper.requireParams(req, res, ['name'], function () {
        var app = new {Name}({
            name: req.body.name
        });

        var promise = app.save();

        promise.onFulfill(function (app) {
            apiHelper.ok(req, res, app);
            hawk.fire('{name}::created', app)
        });

        promise.onReject(function (err) {
            apiHelper.serverError(req, res, err);
        });
    });
};

var update = function (req, res) {
    var app = req.app;

    app = _.extend(app, req.body);

    var promise = app.save();
    promise.onFulfill(function (app) {
        apiHelper.ok(req, res, app);
        hawk.fire('{name}::updated', app);
    });

    promise.onReject(function (err) {
        apiHelper.serverError(req, res, err);
    });
};

var destroy = function (req, res) {
    var app = req.app;

    var promise = app.remove();
    promise.onFulfill(function (app) {
        apiHelper.ok(req, res, app);
        hawk.fire('{name}::removed', app);
    });

    promise.onReject(function (err) {
        apiHelper.serverError(req, res, err);
    });
};

var show = function (req, res) {
    apiHelper.ok(req, res, req.app || req.user);
};

var all = function (req, res) {
    var promise = {Name}.find().exec();
    promise.onFulfill(function (list) {
        apiHelper.ok(req, res, {
            type: "{name}",
            list: list
        });
    });
    promise.onReject(function (err) {
        apiHelper.serverError(req, res, err);
    });
};

exports.load = load;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.show = show;
exports.all = all;

// :: Event Listeners :: //
hawk.on('{name}::created', function (req) {
    console.log('#event: {name} created');
});

hawk.on('{name}::updated', function (req) {
    console.log('#event: {name} updated');
});

hawk.on('{name}::removed', function (req) {
    console.log('#event: {name} removed');
});
