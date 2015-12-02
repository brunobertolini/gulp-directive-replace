'use strict';

var minify = require('html-minifier').minify;
var through = require('through2');
var stringEscape = require('js-string-escape');
var gutil = require('gulp-util');
var loadash = require('lodash');
var path = require('path');
var fs = require('fs');
var PluginError = gutil.PluginError;
var PluginLog = gutil.log;

// Consts
var PLUGIN_NAME = 'gulp-directive-replace';

var templateUrlRegex = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;

module.exports = function (opts) {

    var defaultOpts = {
        root: '',
        minifier: {
            collapseWhitespace: true
        }
    };

    opts = loadash.merge(defaultOpts, opts || {});

    if (!opts.root) {
        throw new PluginError(PLUGIN_NAME, 'You should specify the templates root path.');
    }

    return through.obj(function (file, encoding, next) {

        if (file.isNull()) {
            return next(null, file);
        }

        if (file.isStream()) {
            return next(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var content = file.contents.toString();

        var matches, templateContent, templateInline, templatePath;
        while ((matches = templateUrlRegex.exec(content)) !== null) {

            templatePath = path.join(opts.root, matches[2]);

            if (fileExistsSync(templatePath)) {

                templateContent = extractTemplateUrl(templatePath);

                templateInline = getTemplateInline(templateContent, opts.minifier);

                content = replaceTemplateUrl(matches.index, matches[0].length, content, templateInline);

                file.contents = new Buffer(content);
            }

            templatePath = null;
            templateInline = null;
            templateContent = null;
        }

        return next(null, file);
    });
};


function fileExistsSync(filePath) {
    try {
        fs.statSync(filePath);
    } catch (err) {
        return err.code != 'ENOENT';
    }
    return true;
}

function extractTemplateUrl(templateUrlPath) {
    return fs.readFileSync(templateUrlPath, 'utf8');
}

function getTemplateInline(content, options) {
    var template = minify(content, options);
    var templateEscaped = stringEscape(template);
    return 'template: \'' + templateEscaped + '\'';
}

function replaceTemplateUrl(index, length, content, templateInline) {
    var templateUrl = content.substr(index, length);
    return content.replace(templateUrl, templateInline);
}