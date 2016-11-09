'use strict';

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
    options.sortKey = req.query.sort_key || 'updatedAt';
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
    {Name}.findOne({_id: id}).then(function ({name}) {
        if (!{name}) {
            return apiHelper.notFound(req, res);
        }
        req.{name} = {name};
        next();
    }, function () {
        apiHelper.notFound(req, res);
    });
}

function create(req, res) {
    var {name} = new {Name}(req.body);

    var promise = {name}.save();

    promise.then(function ({name}) {
        apiHelper.ok(req, res, {name});
    }, function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function update(req, res) {
    var {name} = req.{name};

    {name} = _.extend({name}, req.body);

    var promise = {name}.save();
    promise.then(function ({name}) {
        apiHelper.ok(req, res, {name});
    }, function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function destroy(req, res) {
    var {name} = req.{name};

    var promise = {name}.remove();
    promise.then(function ({name}) {
        apiHelper.ok(req, res, {name});
    }, function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function show(req, res) {
    apiHelper.ok(req, res, req.{name});
}

function all(req, res) {

    var query = {};

    // Example
    // if (req.query.something) {
    //     query.something = true
    // }

    if(req.query.limit) {
        // req.query.sort_key = 'createdAt'; // Example of sort_key override
        return all_paginated(query, req, res);
    }

    var promise = {Name}.find(query);
    promise.then(function (list) {
        apiHelper.ok(req, res, {
            type: "{name}",
            list: list
        });
    }, function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function count(req, res) {

    var query = {};

    // Example
    // if (req.query.something) {
    //     query.something = true
    // }

    var promise = {Name}.count(query);
    promise.then(function (count) {
        apiHelper.ok(req, res, {
            type: "{name}",
            count: count
        });
    }, function (err) {
        apiHelper.serverError(req, res, err);
    });
}

function all_paginated(query, req, res) {
    var options = getPaginationOptions(req);
    var select = ''; // add fields to add or remove from selection. Ex. '-updatedAt' would remove updatedAt
    paginate({Name}.find(query).select(select), options).exec(function (err, list) {
        if (err) {
            return apiHelper.serverError(req, res, err);
        }
        var meta = {
            limit: options.limit
        };
        if (list.length === options.limit) {
            meta.nextId = list[list.length - 1].id;
            meta.nextKey = list[list.length - 1][options.sortKey];

            var queryParams = [];
            var fullUrl = getFullURL(req, queryParams);

            queryParams.push('limit=' + options.limit);
            queryParams.push('start_id=' + meta.nextId);
            if(meta.nextKey instanceof Date) {
                queryParams.push('start_key=' + meta.nextKey.getTime());
            } else {
                queryParams.push('start_key=' + encodeURIComponent(meta.nextKey));
            }

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
exports.count = count;

// :: Event Listeners :: //
// {Name}.on('created', function({name}){
//     console.log('#event - {name} created', {name});
// });
//
// {Name}.on('updated', function({name}){
//     console.log('#event - {name} updated', {name});
// });
//
// {Name}.on('deleted', function({name}){
//     console.log('#event - {name} destroyed', {name});
// });