'use strict';

var {name}Ctrl = require('../controllers/{Name}Ctrl');

module.exports = function (app, auth) {

    app.route('/{names}')
        .post(/*auth.requiresLogin,*/ {name}Ctrl.create);
        .get(/*auth.requiresLogin,*/  {name}Ctrl.all);

    app.route('/{names}/:{name}Id')
        .get(/*auth.requiresLogin,*/  {name}Ctrl.show);
        .post('/{names}/:{name}Id/update', {name}Ctrl.update);
        .post('/{names}/:{name}Id/delete', {name}Ctrl.destroy);

    app.param('{name}Id', {name}Ctrl.load);

};
