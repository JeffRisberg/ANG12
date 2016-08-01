
(function() {

    var gulp = require('gulp');
    var paths = require('../paths');
    var settings = require('../settings');
    var useref = require('gulp-useref');

    gulp.task('build-dist', [], function () {

        return gulp.src('vendor-bundle.html')
            .pipe(useref())
            .pipe(gulp.dest('dist'));
    });

})();