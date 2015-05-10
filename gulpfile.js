'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var plugins = gulpLoadPlugins(),
  reload = browserSync.reload,
  BROWSER_SYNC_RELOAD_DELAY = 500,
  paths = {
    js: ['*.js', 'app.js', 'test/**/*.js', '!test/coverage/**', 'routes/**/*.js',
         'public/javascripts/**/*.js', 'modules/**/*.js'],
    html: ['views/**/*.*'],
    css: ['public/stylesheets/style.scss'],
    cssDest: ['public/stylesheets'],
    sass: ['public/stylesheets/*.scss'],
    publicPath: ['public/**/*.*']};


// TODO: Define env variables and ports globally


gulp.task('lint', function () {
    return gulp.src(paths.js)
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

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src(paths.js)
      // .pipe(reload({stream: true, once: true}))
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      // .pipe(plugins.jshint.reporter('default'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('sass', function () {
    return gulp.src(paths.css)
      .pipe(plugins.sass())
      .pipe(gulp.dest(paths.cssDest[0]))
      .pipe(reload({stream: true}));
});

gulp.task('mochaTest', ['jshint', 'lint'], function () {
    return gulp.src(paths.js[2], {read: false})
      .pipe(plugins.mocha({
        reporter: 'spec'
      }));
});

gulp.task('coverage', ['mochaTest'], function (cb) {
    gulp.src([paths.js[1], paths.js[4], paths.js[5], paths.js[6]])
      .pipe(plugins.istanbul()) // Covering files
      .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
      .on('finish', function () {
          gulp.src(paths.js[2], {read: false})
            .pipe(plugins.mocha({
              reporter: 'spec'
            }))
            .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests runned
            .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 80 } })) // Enforce a coverage of at least 90%
            .on('end', cb);
      });
});

gulp.task('browser-sync', ['mochaTest', 'sass', 'nodemon'], function() {
    browserSync.init({
      proxy: 'http://localhost:5000',
          files: [paths.publicPath],
          browser: 'google chrome',
          port: 7000
    });
    gulp.watch(paths.sass, ['sass', reload]);
    gulp.watch(paths.js, ['mochaTest']);
});

gulp.task('nodemon', ['mochaTest'], function (cb) {
    var called = false;
    return plugins.nodemon({
      script: paths.js[1],
      watch: [paths.js, paths.html]
    })
    .on('start', function () {
        if (!called) {
            cb();
        }
        called = true;
    })
    .on('restart', function onRestart() {
        // reload connected browsers after a slight delay
        setTimeout(function reload() {
            browserSync.reload({
              stream: false
            });
        }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('default', ['browser-sync'], function() {
  // place code for your default task here
});
