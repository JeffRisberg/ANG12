
(function(){
    var gulp = require('gulp');
    var paths = require('../paths');

    function reportChange(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }

    //gulp-changed only processes files with updated modified time
    gulp.task('watch', function() {
        //gulp.watch(paths.js, ['build-js']).on('change', reportChange);
        gulp.watch(paths.jade, ['build-jade']).on('change', reportChange);
        //gulp.watch(paths.scss, ['build-scss']).on('change', reportChange);
    });
})();