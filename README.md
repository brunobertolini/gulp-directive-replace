# Gulp Directive Replace

[![Build Status](https://travis-ci.org/brunobertolini/gulp-directive-replace.svg?branch=master)](https://travis-ci.org/brunobertolini/gulp-directive-replace) [![Coverage Status](https://coveralls.io/repos/github/brunobertolini/gulp-directive-replace/badge.svg?branch=master)](https://coveralls.io/github/brunobertolini/gulp-directive-replace?branch=master) [![Dependency Status](https://gemnasium.com/brunobertolini/gulp-directive-replace.svg)](https://gemnasium.com/brunobertolini/gulp-directive-replace)

[![NPM](https://nodei.co/npm/gulp-directive-replace.png?downloads=true)](https://nodei.co/npm/gulp-directive-replace/)

Replace templateUrl by minified html template

## Installation

npm install gulp-directive-replace

## Usage

```
var gulp = require('gulp');
var directiveReplace = require('gulp-directive-replace');

gulp.task('directives', function(){

  return gulp.src('./app/directives/*.js')
    .pipe(directiveReplace({root: 'app'))
    .pipe(gulp.dest('./'));

});
```

## Options 

### root

The path between directive templateUrl string, and gulpfile path.

Example: 

Let's say you have a following folder structure

```
/gulpfile.js
/app
    index.html
    /directives
        yourdirective.js
    /partials
        yourpartial.html
```

Then, your directive templateUrl is: '/partials/yourpartial.html'

The plugin will get template url and needs find that there is a *app* folder, but will not. You need inform to it by "root" option, like this:

```
directiveReplace({
    root: 'app'
})
```

### transform

A custom transform function for templates.

```
directiveReplace({
    root: 'app',
    transform: function(basePath, template) {
        return template;
    }
})
```

basePath is the *root* config.

### minify options

This plugin use 'html-minifier' to minify html templates. So, you set your options like:

```
directiveReplace({
    minify: {
        yourRule: '...'
    }
})
```

collapseWhitespace and caseSensitive options are true by default.

See options reference in [html-minifier docs](https://www.npmjs.com/package/html-minifier#options-quick-reference)