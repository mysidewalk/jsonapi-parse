var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task(
    'build',
    function() {
        return gulp.src('src/*.js')
            .pipe(concat('jsonapi.js'))
            .pipe(uglify())
            .pipe(rename(
                function(path) {
                    path.basename += '.min';
                }
            ))
            .pipe(gulp.dest('dist'));
    }
);
