var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    uglify = require('gulp-uglify');

gulp.task(
    'lodash',
    shell.task(
        [
            'lodash include=extend,map,each,findWhere,isPlainObject,isString,isArray,isUndefined -d',
        ],
        {
            cwd: 'src'
        }
    )
);

gulp.task(
    'build',
    ['lodash'],
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
