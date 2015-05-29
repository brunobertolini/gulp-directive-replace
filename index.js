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

  return through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    try {
      var originalContent = file.contents.toString();
      var templateUrlRegex = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;
      var templateUrl = extractTemplateUrl(originalContent, templateUrlRegex, opts);

      if (!templateUrl) {
        return cb(null, file);
      }

      var templateContent = getTemplateContent(templateUrl);
      var minimize = new Minimize(opts.minify);

      minimize.parse(templateContent, escapeMinifiedContent);

    } catch (err) {
      return cb(new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
    }

    ////////////

    function escapeMinifiedContent (err, minimizedTemplate) {
      if (err) {
        return cb(new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
      }

      var escapedTemplate = escapeString(minimizedTemplate);
      var injectedTemplate = 'template: \'' + escapedTemplate + '\'';
      var replacedContent = originalContent.replace(templateUrlRegex, injectedTemplate);

      file.contents = new Buffer(replacedContent);

      return cb(null, file);
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

