'use strict';

var fs      =  require('fs');
var gutil   = require('gulp-util');
var through = require('through2');
var lodash  = require('lodash');
var path    = require('path');
var htmlMinifier    = require('html-minifier').minify;

function templateTransformPlugin(options) {

  var defaultOptions = {
    root: '',
    minify: {
      removeComments: true,
      collapseWhitespace:true
    }
  };

  var opts = lodash.extend(defaultOptions, options);

  return through.obj(objectStream);

  function objectStream(file, enc, cb) {
    /* jshint validthis: true */

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
      file.contents = new Buffer(transform(contents, opts));
    } catch (err) {
      err.fileName = file.path;
      _this.emit('error', pluginError(err));
    }

    _this.push(file);
    cb();
  }
}

function pluginError(msg) {
  return new gutil.PluginError('gulp-strip-line', msg);
}

function transform(content, opts) {

  if (!content) {
    return content;
  }

  var templateUrlRegExp = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;

  var output = content.toString();
  var templateUrlDirective = templateUrlRegExp.exec(output);
  var templateUrl = path.join(opts.root, templateUrlDirective[2]);
  var template = fs.readFileSync( templateUrl , 'utf8');

  template = htmlMinifier(template, opts.minify);

  return output.replace(templateUrlRegExp, 'template: \'' + template + '\'');
}

module.exports = templateTransformPlugin;
