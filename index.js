'use strict';

var minify = require('html-minifier').minify;
var through = require('through2');
var stringEscape = require('js-string-escape');
var gutil = require('gulp-util');
var loadash = require('lodash');
var path = require('path');
var fs = require('fs');
var PluginError = gutil.PluginError;

// Consts
var PLUGIN_NAME = 'gulp-directive-replace';

module.exports = function (opts) {

    var defaultOpts = {
        root: '',
        transform: null
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

        var content = proxy(opts.transform || transform, null)(opts.root, String(file.contents), opts.minify);

        file.contents = new Buffer(content);

        return next(null, file);
    });
};

function proxy(fn, context) {
    var args = [].slice.call(arguments, 2);
    return function () {
        return fn.apply(context, args.concat([].slice.call(arguments)));
    }
}

function transform(basePath, template, minifyOpts) {

    var templateUrlRegex = /templateUrl\s*([\:\=])[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;

    var matches, templateContent, templateInline, templatePath;
    while ((matches = templateUrlRegex.exec(template)) !== null) {

        templatePath = path.join(basePath, matches[3]);

        if (fileExistsSync(templatePath)) {

            templateContent = extractTemplateUrl(templatePath);

            templateInline = getTemplateInline(matches[1], templateContent, loadash.merge({
                collapseWhitespace: true,
                caseSensitive:true
            }, minifyOpts));

            template = replaceTemplateUrl(matches.index, matches[0].length, template, templateInline);
        }
    }
    return template;
}

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

function getTemplateInline(sign, content, options) {
    var template = minify(content, options);
    var templateEscaped = stringEscape(template);
    return 'template' + sign + ' \'' + templateEscaped + '\'';
}

function replaceTemplateUrl(index, length, content, templateInline) {
    var templateUrl = content.substr(index, length);
    return content.replace(templateUrl, templateInline);
}