
(function(){
    var appRoot = 'app/';
    var outputRoot = 'build/';

    module.exports = {
        root: appRoot,
        source: appRoot + '**/*.js',
        output: outputRoot,
        sourceMapRelativePath: '../' + appRoot
    };

})();