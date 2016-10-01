'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var {Name}Schema = new Schema({
    // org: {type: Schema.ObjectId, ref: 'Org', required: true, index: true},
    // active: {type: Boolean, default: true},
    // name: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
}, {
    strict: false
});

if (!{Name}Schema.options.toJSON) {
    {Name}Schema.options.toJSON = {};
}

{Name}Schema.options.toJSON.transform = function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
};

mongoose.model('{Name}', {Name}Schema);
