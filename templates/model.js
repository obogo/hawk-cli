'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define Schema
var schema = new Schema({
    // org: {type: Schema.ObjectId, ref: 'Org', required: true, index: true},
    // active: {type: Boolean, default: true},
    // name: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
}, {
    strict: false
});

// Ref: https://github.com/fzaninotto/mongoose-lifecycle/blob/master/index.js
schema.pre('save', function (next) {
    this._isNew_internal = this.isNew;
    next();
});

schema.post('save', function() {
    var model = this.model(this.constructor.modelName);
    this._isNew_internal ? model.emit('created', this) : model.emit('updated', this);
    this._isNew_internal = undefined;
});

schema.post('remove', function() {
    this.model(this.constructor.modelName).emit('deleted', this);
});

// Setup Transform
if (!schema.options.toJSON) {
    schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
};

mongoose.model('{Name}', schema, '{namesUnderscore}');
