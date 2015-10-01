var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('serve', shell.task(['babel-node index']));
