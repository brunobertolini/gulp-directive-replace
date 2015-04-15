'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');
var lodash = require('lodash');
var path = require('path');
var Minimize = require('minimize');

module.exports = injectTemplateModule;

////////////////////////////////////////////////////////////

function injectTemplateModule (options) {
  var defaultOptions = {
    root: '',
    minify: {}
  };
  var opts = lodash.extend(defaultOptions, options);
  return through.obj(objectStream);

  ////////////

  function objectStream (file, enc, cb) {
    var _this = this;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      _this.emit('error', pluginError('Streaming not supported'));
      return cb();
    }

    try {
      var contents = file.contents.toString();
      transformSourceFile(file, contents, opts);
    } catch (err) {
      err.fileName = file.path;
      _this.emit('error', pluginError(err));
    }

    _this.push(file);
    cb();
  }
}

function transformSourceFile (file, content, opts) {
  if (!content) {
    return content;
  }

  var templateUrlRegex = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;
  var gulpSrcFileContent = content.toString();
  var templateUrl = extractTemplateUrl(gulpSrcFileContent);

  if (!templateUrl) {
    return;
  }

  var templateContent = getTemplateContent(templateUrl);
  var minimize = new Minimize(opts.minify);

  minimize.parse(templateContent, transformMinimized);

  ////////////

  function extractTemplateUrl (contents) {
    var regex = templateUrlRegex,
        match = regex.exec(contents),
        hasTemplateUrl = match && match[2];
    return hasTemplateUrl ? path.join(opts.root, match[2]) : false;
  }

  function getTemplateContent (templateUrl) {
    return fs.readFileSync(templateUrl, 'utf8');
  }

  function transformMinimized (err, minimizedTemplate) {
    if (err) {
      return callback(pluginError(err));
    }

    var escapedTemplate = escapeString(minimizedTemplate);
    var injectedTemplate = 'template: \'' + escapedTemplate + '\'';
    var gulpSrcFileOutput = gulpSrcFileContent.replace(templateUrlRegex, injectedTemplate);

    file.contents = new Buffer(gulpSrcFileOutput);
  }

  function escapeString (string) {
    var escapedString = string;
    escapedString = escapeBackslash(escapedString);
    escapedString = escapeSingleQuotes(escapedString);
    return escapedString;
  }

  function escapeSingleQuotes (string) {
    return string ? string.replace(/'/g, "\\'") : '';
  }

  function escapeBackslash (string) {
    return string ? string.replace(/\\/g, '\\\\') : '';
  }
}

function pluginError (msg) {
  return new gutil.PluginError('gulp-directive-replace', msg);
}