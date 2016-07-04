#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
var readFile = require('read-file');
var writeFile = require('write');
var remedial = require('remedial');
var pluralize = require('pluralize');
var rootPath = path.dirname(fs.realpathSync(__filename));
var templatesPath = path.join(rootPath, 'templates');

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function moveFile(name, templateFile, dest, strings) {
    readFile(path.join(templatesPath, templateFile), 'utf8', function (err, content) {

        strings = strings || {};
        strings.Name = strings.Name || name.capitalize();
        strings.name = strings.name || name;
        strings.names = strings.names || pluralize(name);

        content = content.supplant(strings);
        writeFile(dest, content, function (err) {
            if (err) console.log(err);
        });
    });
}

program
    .version('0.0.1');

program
    .command('package [name]')
    .option("-p, --server_path <path>", "Server path")
    .option("-a, --append <path>", "Append to package")
    .description('creates a hawk package')
    .action(function (name, options) {
        var serverPath = options.server_path;
        var packageDir = path.join(serverPath, 'packages', pluralize(name));
        if (serverPath) {
            if (options.append) {
                readFile(path.join(serverPath, 'packages', name, 'index.js'), 'utf8', function (err, content) {
                    content = content.replace(/(exports.init = function.*?{)/gi, "$1\n    hawk.invoke(require('./routes/" + pluralize(options.append) + "'));")
                    content = content.replace(/(\/\/ :: models :: \/\/)/gi, "$1\nrequire('./models/" + options.append.capitalize() + "');")
                    writeFile(path.join(serverPath, 'packages', name, 'index.js'), content, function (err) {
                        if (err) console.log(err);
                    });
                });
                moveFile(options.append, 'controller.js', path.join(packageDir, 'controllers', options.append.capitalize() + 'Controller.js'));
                moveFile(options.append, 'model.js', path.join(packageDir, 'models', options.append.capitalize() + '.js'));
                moveFile(options.append, 'route.js', path.join(packageDir, 'routes', pluralize(options.append) + '.js'));
            } else {
                moveFile(name, 'package.js', path.join(packageDir, 'index.js'));
                moveFile(name, 'controller.js', path.join(packageDir, 'controllers', name.capitalize() + 'Controller.js'));
                moveFile(name, 'model.js', path.join(packageDir, 'models', name.capitalize() + '.js'));
                moveFile(name, 'route.js', path.join(packageDir, 'routes', pluralize(name) + '.js'));
            }

        } else {
            co(function *() {
                serverPath = yield prompt('server dir: ');
                if (options.append) {
                    name = options.append;
                } else {
                    moveFile(name, 'package.js', path.join(packageDir, 'index.js'));
                }
                moveFile(name, 'controller.js', path.join(packageDir, 'controllers', name.capitalize() + 'Controller.js'));
                moveFile(name, 'model.js', path.join(packageDir, 'models', name.capitalize() + '.js'));
                moveFile(name, 'route.js', path.join(packageDir, 'routes', pluralize(name) + '.js'));

                process.exit(0);
            });
        }
    });

program.parse(process.argv);
