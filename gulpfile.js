var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task(
    'normal',
    function() {
        return gulp.src('src/*.js')
            .pipe(gulp.dest('dist'));
    }
);

gulp.task(
    'minified',
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

gulp.task(
    'build',
    gulp.parallel('normal', 'minified')
);
