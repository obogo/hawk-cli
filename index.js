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

function moveFile(packageName, templateFile, dest, strings) {
    readFile(path.join(templatesPath, templateFile), 'utf8', function (err, content) {

        strings = strings || {};
        strings.Name = strings.Name || packageName.capitalize();
        strings.name = strings.name || packageName;
        strings.names = strings.names || pluralize(packageName);

        content = content.supplant(strings);

        // var destFile;
        // if(dest.indexOf('.js') === -1) {
        //     destFile = path.join(dest, packageName + '.js');
        //     console.log('YES', destFile);
        // } else {
        //     destFile = dest;
        //     console.log('NO', destFile);
        // }
        // var destFile = dest.indexOf('.js') === -1 ? path.join(dest, packageName + '.js') : dest;
        // console.log('destFile', dest);

        writeFile(dest, content, function (err) {
            if (err) console.log(err);
            process.exit(0);
        });
    });
}

program
    .version('0.0.1');

program
    .command('package [name]')
    .option("-s, --server_path <path>", "Server path")
    .description('creates a hawk package')
    .action(function (name, options) {
        if (options.server_path) {
            moveFile(name, 'package.js', path.join(options.server_path, 'packages', name, 'index.js'));
            moveFile(name, 'controller.js', path.join(options.server_path, 'packages', name, 'controllers', name.capitalize() + 'Controller.js'));
            moveFile(name, 'model.js', path.join(options.server_path, 'packages', name, 'models', name.capitalize() + '.js'));
            moveFile(name, 'route.js', path.join(options.server_path, 'packages', name, 'routes', pluralize(name) + '.js'));
        } else {
            co(function *() {
                var serverPath = yield prompt('server dir: ');
                moveFile(name, 'package.js', path.join(serverPath, 'packages', name));
                moveFile(name, 'controller.js', path.join(serverPath, 'packages', name, 'controllers'));
                moveFile(name, 'model.js', path.join(serverPath, 'packages', name, 'models'));
                moveFile(name, 'route.js', path.join(serverPath, 'packages', name, 'routes'));
            });
        }
    });

program.parse(process.argv);
