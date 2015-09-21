var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task(
    'build',
    function() {
        return gulp.src('src/*.js')
            .pipe(uglify())
            .pipe(rename(
                function(path) {
                    path.basename += '.min';
                }
            ))
            .pipe(gulp.dest('dist'));
    }
);
