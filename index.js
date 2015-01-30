'use strict';

var fs      =  require('fs');
var gutil   = require('gulp-util');
var through = require('through2');
var lodash  = require('lodash');
var path    = require('path');
var Minimize = require('minimize');

function templateTransformPlugin(options) {

  var defaultOptions = {
    root: '',
    minify: {}
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
      // file.contents = new Buffer(transform(contents, opts));
      transform(file, contents, opts);
    } catch (err) {
      err.fileName = file.path;
      _this.emit('error', pluginError(err));
    }

    _this.push(file);
    cb();
  }
}

function pluginError(msg) {
  return new gutil.PluginError('gulp-directive-replace', msg);
}

function transform(file, content, opts) {

  if (!content) {
    return content;
  }

  var templateUrlRegExp = /templateUrl\:[^\'\"]*(\'|\")([^\'\"]+)(\'|\")/gm;

  var output = content.toString();
  var templateUrlDirective = templateUrlRegExp.exec(output);

  if (!templateUrlDirective) {
    /* exits if the directive doesn't have templateUrl */
    return;
  }

  var templateUrl = path.join(opts.root, templateUrlDirective[2]);
  var template = fs.readFileSync( templateUrl , 'utf8');


  var minimize = new Minimize(opts.minify);
  minimize.parse(template, function (err, data) {
      if (err) {
        return callback(pluginError(err));
      }

      var result = output.replace(templateUrlRegExp, 'template: \'' + data.replace(new RegExp("[']", 'g'), "\\'") + '\'');

      file.contents = new Buffer(result);
  });
}

module.exports = templateTransformPlugin;
