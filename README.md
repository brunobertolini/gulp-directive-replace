# Gulp Directive Replace

[![Dependency Status](https://gemnasium.com/brunobertolini/gulp-directive-replace.svg)](https://gemnasium.com/brunobertolini/gulp-directive-replace)

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
    .pipe(directiveReplace())
    .pipe(gulp.dest('./'));

});
```

## Options 


### root

The path between directive templateUrl string, and gulpfile path.

### domain

The domain of directive templateUrl string. 
Use if template url contains domain.

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
directiveReplace({root: 'app', domain: 'http://www.example.com/'})
```

### minify

Html minifier options.

This options is passed directly to [Minimize](https://www.npmjs.com/package/minimize).
