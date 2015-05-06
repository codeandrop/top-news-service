'use strict';

var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins(),
  browserSync = require('browser-sync'),
  // nodemon = require('gulp-nodemon'),
  // sass = require('gulp-sass'),
  // eslint = require('gulp-eslint'),
  reload = browserSync.reload,
  BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('lint', function () {
  return gulp.src(['app.js',
                   'routes/**/*.*',
                   'modules/**/*.*',
                   'public/javascripts/**/*.*'])
    // .pipe(reload({stream: true, once: true}))
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(plugins.eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(plugins.eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(plugins.eslint.failOnError());
});

// // Lint JavaScript
// gulp.task('jshint', function () {
//   return gulp.src('app/scripts/**/*.js')
//     .pipe(reload({stream: true, once: true}))
//     .pipe(plugins.jshint())
//     .pipe(plugins.jshint.reporter('jshint-stylish'))
//     .pipe(plugins.if(!browserSync.active, gulpLoadPlugins.jshint.reporter('fail')));
// });

gulp.task('sass', function () {
  return gulp.src('public/stylesheets/style.scss')
    .pipe(plugins.sass())
    .pipe(gulp.dest('public/stylesheets'))
    .pipe(reload({stream: true}));
});

// gulp.task('watch', function() {
  // gulp.watch('public/stylesheets/*.scss', ['sass']);
// });

gulp.task('browser-sync', ['lint', 'sass', 'nodemon'], function() {
	browserSync.init({
		proxy: "http://localhost:5000",
        files: ['public/**/*.*'],
        browser: "google chrome",
        port: 7000,
	});
  gulp.watch("public/stylesheets/*.scss", ['sass', reload]);
  // gulp.watch('routes/**/*.*', ['lint', reload]);
  // gulp.watch('views/**/*.*', reload);
  // gulp.watch('app.js', ['lint', reload]);
  // gulp.watch("app/*.html").on('change', reload);
});

gulp.task('nodemon', ['lint'] ,function (cb) {
  var called = false;
	return plugins.nodemon({
	  script: 'app.js',
    // tasks: ['browser-sync'],
    // tasks: ['lint'],
    watch: ['app.js', 'routes/**/*.*', 'views/**/*.*']
	  //script: 'bin/www'
	})
  .on('start', function () {
    if (!called) { cb(); }
    called = true;
  })
  .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false   //
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('default', ['browser-sync'], function() {
  // place code for your default task here
});
