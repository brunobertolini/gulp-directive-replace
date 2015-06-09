'use strict';

var Minimize = require('minimize');
var through = require('through2');
var gutil = require('gulp-util');
var loadash = require('lodash');
var path = require('path');
var fs = require('fs');

// Consts
var PLUGIN_NAME = 'gulp-directive-replace';

module.exports = function (opts) {
    var defaultOpts = {
        root: '',
        minify: {}
    };

    opts = loadash.merge(defaultOpts, opts || {});

    return through.obj(function(file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        try {
            var originalContent = file.contents.toString();
            var templateUrlRegex = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;
            var templateUrl = extractTemplateUrl(originalContent, templateUrlRegex, opts);

            if (!templateUrl) {
                cb(null, file);
                return;
            }

            var templateContent = getTemplateContent(templateUrl);
            var minimize = new Minimize(opts.minify);

            minimize.parse(templateContent, function(err, minimizedTemplate){

                if (err) {
                    cb(new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
                    return;
                }

                var escapedTemplate = escapeString(minimizedTemplate);
                var injectedTemplate = 'template: \'' + escapedTemplate + '\'';
                var replacedContent = originalContent.replace(templateUrlRegex, injectedTemplate);

                file.contents = new Buffer(replacedContent);

                cb(null, file);
                return;
            });

        } catch (err) {
            cb(new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
            return;
        }
    });
};

//////////////////////////////

function extractTemplateUrl (contents, regex, opts) {
    var match = regex.exec(contents);
    var hasTemplateUrl = match && match[2];

    return hasTemplateUrl ? path.join(opts.root, match[2]) : false;
}

function getTemplateContent (templateUrl) {
    return fs.readFileSync(templateUrl, 'utf8');
}

function escapeString (string) {
    var escapedString = string;
    escapedString = escapedString ? escapedString.replace(/\\/g, '\\\\') : '';
    escapedString = escapedString ? escapedString.replace(/'/g, "\\'") : '';

    return escapedString;
}

