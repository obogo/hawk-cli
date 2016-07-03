'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var {Name}Schema = new Schema({
    active: {type: Boolean, default: true},
    name: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

if (!{Name}Schema.options.toJSON) {
    {Name}Schema.options.toJSON = {};
}

{Name}Schema.options.toJSON.transform = function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
};

mongoose.model('{Name}', {Name}Schema);
