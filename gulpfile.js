const gulp            = require("gulp");
const uglify          = require("gulp-uglify");
const plumber         = require("gulp-plumber");
const notify          = require("gulp-notify");
const minimist        = require('minimist');
const gulpif          = require('gulp-if');
const source          = require('vinyl-source-stream');
const buffer          = require('vinyl-buffer');

// ** parse args
var knownOptions = {
 string: 'env',
 default: { env: process.env.NODE_ENV || 'development' }
};
var options = minimist(process.argv.slice(2), knownOptions);
process.env.NODE_ENV = options.env || 'development';
var isProduction = (options.env === 'production');

// ** log
console.log('[NODE_ENV]', process.env.NODE_ENV);

gulp.task("js", function () {
    gulp.src(["src/*.js"])
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe( gulpif( isProduction, uglify()))
        .pipe(gulp.dest("./dist/"));
});

gulp.task("default", function () {
    gulp.watch(["src/*.js"], ["js"]);
});
