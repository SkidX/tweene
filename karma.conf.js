
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'vendor/vendor.js',
            'test/vendor.js',
            'src/Tweene.js',
            'src/Common.js',
            'src/Label.js',
            'src/Callback.js',
            'src/Ticker.js',                
            'src/TweenCommon.js',
            'src/TimelineCommon.js',
            'src/ControlsPro.js',
            'src/TweenPro.js',
            'src/TimelinePro.js',
            'src/TweeneDummy.js',
            'src/TweeneGsap.js',
            'src/TweeneVelocity.js',
            'src/TweeneTransit.js',
            'src/TweeneJquery.js',
            'test/spec.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor        
        preprocessors: {
            'src/*.js': ['coverage']
        },        

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'progress', 
            'coverage'
        ],

        coverageReporter: {
            reporters: [
                {
                    type: 'text'
                }
            ]
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'Chrome', 
            'Firefox',
            'IE'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
