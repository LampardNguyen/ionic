var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');
var paths = {
  sass: ['./scss/**/*.scss'],
  lib: ['./coding/lib/speakingurl.min.js', './coding/lib/ionic/js/ionic.bundle.js', './coding/lib/parse-1.6.12.js', './coding/lib/jquery.min.js', './coding/lib/angular-animate.min.js', './coding/lib/underscore.js', './coding/lib/angular-cookies.js', './coding/lib/angular-translate.min.js', './coding/lib/angular-translate-loader-static-files.min.js', './coding/lib/angular-translate-storage-cookie.min.js', './coding/lib/angular-translate-storage-local.min.js', './coding/lib/nprogress-master/nprogress.js', './coding/lib/angular-messages.js', './coding/lib/CryptoJS/sha3.js', './coding/lib/ionic.filter.bar.min.js', './coding/lib/ngCordova/ng-cordova.min.js'],
  css: ["./coding/css/ionic.app.css", "./coding/css/angular-material.min.css", "./coding/css/ionic.filter.bar.min.css", "./coding/css/ng-animation.css", "./coding/lib/nprogress-master/nprogress.css"],
  coding: './coding'
};
gulp.task('default', ['minify']);
gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss').pipe(sass()).on('error', sass.logError).pipe(gulp.dest('./coding/css/')).pipe(minifyCss({
    keepSpecialComments: 0
  })).pipe(rename({
    extname: '.min.css'
  })).pipe(gulp.dest('./coding/css/')).on('end', done);
});
gulp.task('watch', function() {
  // gulp.watch(paths.sass, ['sass']);
  // gulp.watch(paths.coding + '/**/*.+(js|css|html)', ['minify']);
  gulp.watch([paths.coding + '/css/*.css'], ['miniCss']);
  gulp.watch([paths.coding + '/js/**/*.js'], ['miniJs']);
  gulp.watch([paths.coding + '/lib/**/*.+(js|css|html)'], ['miniLib']);
  gulp.watch([paths.coding + '/templates/*.html'], ['miniHtml']);
});
gulp.task('install', ['git-check'], function() {
  return bower.commands.install().on('log', function(data) {
    gutil.log('bower', gutil.colors.cyan(data.id), data.message);
  });
});
gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log('  ' + gutil.colors.red('Git is not installed.'), '\n  Git, the version control system, is required to download Ionic.', '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.', '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.');
    process.exit(1);
  }
  done();
});
gulp.task('minify', ['miniLib', 'miniCss', 'miniJs', 'miniHtml']);
// minify lib
gulp.task('miniLib', function() {
  gulp.src(paths.lib).pipe(jshint()).pipe(uglify()).pipe(concat('lib.min.js')).pipe(gulp.dest('./www/lib/'));
});
// minify css
gulp.task('miniCss', function() {
  gulp.src(paths.css).pipe(minifyCss({
    keepSpecialComments: 0
  })).pipe(concat('css.min.css')).pipe(gulp.dest('./www/css/'));
});
// minify js
gulp.task('miniJs', function() {
  gulp.src("coding/js/services/*.js").pipe(jshint()).pipe(uglify()).pipe(concat('modules.min.js')).pipe(gulp.dest('./www/js/'));
  gulp.src("coding/js/modules/route.js").pipe(jshint()).pipe(uglify()).pipe(concat('module-app.min.js')).pipe(gulp.dest('./www/js/'));
  gulp.src("coding/js/controllers/*.js").pipe(jshint()).pipe(uglify()).pipe(concat('controller.min.js')).pipe(gulp.dest('./www/js/'));
  gulp.src("coding/js/modules/app.js").pipe(jshint()).pipe(uglify()).pipe(concat('app.min.js')).pipe(gulp.dest('./www/js/'));
});
// minify html
gulp.task('miniHtml', function() {
  gulp.src('coding/templates/*.html').pipe(htmlmin({
    collapseWhitespace: true
  })).pipe(gulp.dest('www/templates'))
});