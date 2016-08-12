'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

gulp.task('styles',function() {
	return gulp.src('./css/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('./css/main.css'))
		.pipe(gulp.dest('.'))
});

gulp.task('watch',['styles'], function() {
	gulp.watch('./css/**/*.scss', ['styles']);
});