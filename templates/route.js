'use strict';

var {name}Ctrl = require('../controllers/{Name}Controller');

module.exports = function (app, config, auth) {

    var uri = config.uri;

    app.route(uri + '/{names}')
        .post({name}Ctrl.create)
        .get({name}Ctrl.all);

    // Support for CORS (should be used only if on same domain)
    app.route(uri + '/{names}/:{name}Id')
        .get({name}Ctrl.show)
        .put({name}Ctrl.update)
        .delete({name}Ctrl.destroy);

    // Support for non-CORS (better performance)
    app.post(uri + '/{names}/:{name}Id/update', {name}Ctrl.update);
    app.post(uri + '/{names}/:{name}Id/delete', {name}Ctrl.destroy);

    app.param('{name}Id', {name}Ctrl.load);

};
