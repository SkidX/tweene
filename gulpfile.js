
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    map = require('vinyl-map'),
    size = require('gulp-size'),
    uglify = require('gulp-uglifyjs'),
    wrapper = require('gulp-wrapper'),
    merge = require('merge-stream'),
    browserify = require('gulp-browserify-thin'),
    header = require('gulp-header'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    pkg = require('./package.json');



gulp.task('lint', function() {
    return gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(){
        done();
    });
});


gulp.task('testing', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js', 
        singleRun: false
    }, done);
});

var modulesPath = 'src/';
   
var commons = [
    modulesPath + 'tweene.js',
    modulesPath + 'common.js',
    modulesPath + 'label.js',
    modulesPath + 'callback.js',
    modulesPath + 'tween-common.js',
    modulesPath + 'timeline-common.js'
];

var pro = [
    modulesPath + 'ticker.js',                
    modulesPath + 'controls-pro.js',
    modulesPath + 'tween-pro.js',
    modulesPath + 'timeline-pro.js',
    modulesPath + 'tweene-dummy.js'
];
   
var drivers = {
    tweene: {
        files: commons.concat(pro, [
            modulesPath + 'tweene-gsap.js',
            modulesPath + 'tweene-velocity.js',
            modulesPath + 'tweene-transit.js',
            modulesPath + 'tweene-jquery.js'               
        ]),
        deps: ['jquery', 'jquery.transit', 'velocity-animate', 'gsap']
    }, 
    
    jquery: {
        files: commons.concat(pro, [
            modulesPath + 'tweene-jquery.js'               
        ]),
        deps: ['jquery']
    },
    
    transit: {
        files: commons.concat(pro, [
            modulesPath + 'tweene-transit.js'               
        ]),
        deps: ['jquery', 'jquery.transit']
    },
    
    velocity: {
        files: commons.concat(pro, [
            modulesPath + 'tweene-velocity.js'               
        ]),
        deps: ['jquery', 'velocity-animate']
    },
        
    gsap: {
        files: commons.concat([
            modulesPath + 'tweene-gsap.js'
        ]),
        deps: ['gsap']
    }
           
};
   
   
var banner = [
    '/**',
    ' * <%= pkg.title %> - <%= pkg.description %>',
    ' * @version <%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    " * Copyright (c) 2014, Federico Orru' <federico@buzzler.com>",
    ' * ', 
    ' * @license <%= pkg.license %>',
    ' * See LICENSE.txt for details',
    ' * ',
    ' */',
    ''
].join('\n');      


gulp.task('src', function(){   

    var header = 
        ";(function (window) {\n" +
        "'use strict'; \n" +
        "var func = function(window, undef) {\n" +
        "'use strict'; \n\n",
        footer = '',   
        driver, srcs, deps, streams = [];
    
    for(driver in drivers)
    {
        srcs = drivers[driver].files;
        deps = drivers[driver].deps;
        footer =    
            "return Tw;\n" +
            "};\n\n" +
            "if(typeof(define) === 'function' && define.amd) {\n" +
            "   define(['" + deps.join("', '") + "'], func);\n" +
            "} else if(typeof(module) !== 'undefined' && module.exports) {\n" +
            "   var mod;\n";
        for(var i = 0, end = deps.length; i < end; i++)
        {
            footer += " mod = require('" + deps[i] + "');\n";
            if(deps[i] == 'jquery')
            {
                footer += " if(window) window.jQuery = window.$ = mod;\n";
            }
        }
        footer += 
            "module.exports.Tweene = func(window);\n" +
            "} else {\n" +
            "   func(window);\n" +
            "}\n" +
            "}(typeof(global) !== 'undefined'? global : window));\n";
            
        streams.push(
            gulp.src(srcs)
            .pipe(sourcemaps.init())
            .pipe(concat(driver + '.js'))
            .pipe(wrapper({
                header: header,
                footer: footer
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./'))
        );
    }
    return merge.apply(null, streams);        
});

gulp.task('vendor', function()
{
    return browserify()
        .require(['jquery', 'velocity-animate', 'jquery.transit', 'gsap'])
        .bundle('vendor.js')
        .on('error', function(err)
        {
            console.error(err.toString());
            process.exit(1);
        })
        .pipe(gulp.dest('./vendor'))
        .pipe(gulp.dest('./examples/js'));
});


gulp.task('css', function () {
    gulp.src('examples/scss/*.scss')
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('examples/css'));
});    


   
gulp.task('default', ['src'], function(){   
    
    var driver, streams = [], suffix;
    
    for(driver in drivers)
    {
        suffix = driver == 'tweene'? 'all' : driver;
        streams.push(
            gulp.src(driver + '.js')        
                .pipe(uglify('tweene-' + suffix + '.min.js'))
                .pipe(header(banner, {pkg: pkg}))
                .pipe(size({gzip: true, title: driver + ': '}))            
                .pipe(gulp.dest('minified/'))
        );
    }
    return merge.apply(null, streams);    
    
});


var srcWatcher = gulp.watch('src/modules/*.js', ['src']);
srcWatcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});


var cssWatcher = gulp.watch('examples/scss/*.scss', ['css']);
cssWatcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});
