"use strict";

var directiveReplace     = require('../');
var es                   = require('event-stream');
var fs                   = require('fs');
var path                 = require('path');
var gutil                = require('gulp-util');
var expect               = require('chai').expect;
var mockery              = require('mockery');
var sinon                = require('sinon');

var getFile = function(filepath) {
    return new gutil.File({
        base: path.dirname(filepath),
        path: filepath,
        cwd: path.join(__dirname, 'test'),
        contents: fs.readFileSync(filepath)
    });
};

var getFileNull = function() {
    var filepath = __dirname;
    return new gutil.File({
        base: path.dirname(filepath),
        path: filepath,
        cwd: path.join(__dirname, 'test'),
        contents: null
    });
};

var getFileStream = function() {
    return new gutil.File({
        contents: es.readArray(['stream', 'with', 'those', 'contents'])
    });
};

var fixture = function(filepath) {
    return getFile(path.join('test', 'fixtures', filepath));
};

var expected = function(filepath) {
    return getFile(path.join('test', 'expected', filepath));
};

describe('gulp-directive-replace', function() {

    it('should throw an error when root path config is missing', function () {
        expect(function() {
            directiveReplace();
        }).to.throw('You should specify the templates root path.');
    });

    it('should throw a stream event error', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isStream()).to.be.true;
        });

        stream.once('error', function(error) {
            expect(error).to.be.instanceof(Error);
            expect(String(error.message).trim()).to.be.equal('Streaming not supported');
        });

        stream.once('end', cb);

        stream.write(getFileStream());

        stream.end();
    });

    it('should do nothing when file content is null', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.false;
            expect(file.contents).to.be.null;
        });

        stream.once('end', cb);

        stream.write(getFileNull());

        stream.end();
    });

    it('should do nothing when file content is empty', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
            expect(String(file.contents).trim()).to.be.empty;
        });

        stream.once('end', cb);

        stream.write(fixture('example01.js'));

        stream.end();
    });

    it('should do nothing with templateUrl when file does not exist', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
            expect(String(file.contents).trim()).to.be.equal(String(expected('example03.js').contents).trim());
        });

        stream.once('end', cb);

        stream.write(fixture('example03.js'));

        stream.end();
    });

    it('should replace the unique templateUrl found', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
            expect(String(file.contents).trim()).to.be.equal(String(expected('example02.js').contents).trim());
        });

        stream.once('end', cb);

        stream.write(fixture('example02.js'));

        stream.end();
    });

    it('should replace one or more templateUrl found in a single and deeper level path', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures')
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
            expect(String(file.contents).trim()).to.be.equal(String(expected('example04.js').contents).trim());
        });

        stream.once('end', cb);

        stream.write(fixture('example04.js'));

        stream.end();
    });

    it('should have a transformation function when it is provided on config', function (cb) {

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures'),
            transform: function(basePath, template) {
                return template;
            }
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
            expect(String(file.contents).trim()).to.be.equal(String(expected('example05.js').contents).trim());
        });

        stream.once('end', cb);

        stream.write(fixture('example05.js'));

        stream.end();
    });

    it('should pass minify options to html-minifier',  function(cb) {        
        var minifyOpts = {
            collapseWhitespace: false,
            caseSensitive: false,
            maxLineLength: 12345           
        };

        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mockery.registerMock('html-minifier', {
            minify: function(content, opts) {
                expect(opts).to.be.eql(minifyOpts);
                return content;
            }
        });

        directiveReplace = require('../');

        var stream = directiveReplace({
            root: path.join(__dirname, 'fixtures'),
            minify: minifyOpts
        });

        stream.once('data', function(file) {
            expect(file.isBuffer()).to.be.true;
        });

        stream.once('end', cb);
        
        stream.write(fixture('example05.js'));
        
        stream.end();
    });
});