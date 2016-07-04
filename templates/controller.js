'use strict';

/* global exports */

var hawk = require('local-lib').hawk;
var mongoose = require('mongoose');
var apiHelper = require('express-api-helper');
var _ = require('lodash');
var config = require('config');
var paginate = require('mongoose-range-paginate');
var {Name} = mongoose.model('{Name}');

function getPaginationOptions(req) {
    var limit = 50;

    // https://github.com/kilianc/mongoose-range-paginate
    var options = {};
    options.startId = req.query.start_id; // the document's id (value) ex. ObjectId()
    options.sortKey = req.query.sort_key || '_id';
    options.sort = '-' + options.sortKey;
    options.startKey = req.query.start_key; // the document's key (value) ex. updatedAt
    options.limit = isNaN(req.query.limit) ? limit : Math.min(req.query.limit, limit);

    delete req.query.sort_key;
    delete req.query.start_id;
    delete req.query.start_key;
    delete req.query.limit;

    return options;
}

function getFullURL(req, queryParams) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.path;
    for (var e in req.query) {
        if (req.query.hasOwnProperty(e)) {
            queryParams.push(e + '=' + encodeURIComponent(req.query[e]));
        }
    }
    return fullUrl;
}

function load(req, res, next, id) {
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
}

function create(req, res) {
    apiHelper.requireParams(req, res, [/* 'name' */], function () {
        var app = new {Name}(req.body);

        var promise = app.save();

        promise.onFulfill(function (app) {
            apiHelper.ok(req, res, app);
            hawk.fire('{name}::created', app)
        });

        promise.onReject(function (err) {
            apiHelper.serverError(req, res, err);
        });
    });
}

function update(req, res) {
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
}

function destroy(req, res) {
    var app = req.app;

    var promise = app.remove();
    promise.onFulfill(function (app) {
        apiHelper.ok(req, res, app);
        hawk.fire('{name}::removed', app);
    });

    promise.onReject(function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function show(req, res) {
    apiHelper.ok(req, res, req.app || req.user);
}

function all(req, res) {

    if(req.query.limit) {
        return all_paginated(req, res);
    }

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

function all_paginated(req, res) {
    var options = getPaginationOptions(req);

    var filter = ''; // add fields to add or remove from selection. Ex. '-updatedAt' would remove updatedAt
    paginate({Name}.find(req.query).select(filter), options).exec(function (err, list) {
        if (err) {
            return apiHelper.serverError(req, res, err);
        }
        var meta = {
            limit: options.limit
        };
        if (list.length) {
            meta.nextId = list[list.length - 1].id;
            meta.nextKey = list[list.length - 1][options.sortKey];

            var queryParams = [];
            var fullUrl = getFullURL(req, queryParams);

            queryParams.push('limit=' + options.limit);
            queryParams.push('start_id=' + meta.nextId);
            queryParams.push('start_key=' + meta.nextKey);

            if (queryParams.length) {
                fullUrl += "?" + queryParams.join('&');
            }
            meta.url = fullUrl;
        }
        apiHelper.ok(req, res, {
            type: '{name}',
            meta: meta,
            list: list
        });
    });
}

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
