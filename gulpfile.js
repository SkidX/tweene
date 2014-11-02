
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
    return gulp.src('./src/modules/*.js')
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

var modulesPath = 'src/modules/';
   
var commons = [
    modulesPath + 'Tweene.js',
    modulesPath + 'Common.js',
    modulesPath + 'Label.js',
    modulesPath + 'Callback.js',
    modulesPath + 'TweenCommon.js',
    modulesPath + 'TimelineCommon.js'
];

var pro = [
    modulesPath + 'Ticker.js',                
    modulesPath + 'ControlsPro.js',
    modulesPath + 'TweenPro.js',
    modulesPath + 'TimelinePro.js',
    modulesPath + 'TweeneDummy.js'
];
   
var drivers = {
    all: commons.concat(pro, [
        modulesPath + 'TweeneGsap.js',
        modulesPath + 'TweeneVelocity.js',
        modulesPath + 'TweeneTransit.js',
        modulesPath + 'TweeneJquery.js'               
    ]),
    
    jquery: commons.concat(pro, [
        modulesPath + 'TweeneJquery.js'               
    ]),
    
    transit: commons.concat(pro, [
        modulesPath + 'TweeneTransit.js'               
    ]),
    
    velocity: commons.concat(pro, [
        modulesPath + 'TweeneVelocity.js'               
    ]),
        
    gsap: commons.concat([
        modulesPath + 'TweeneGsap.js'
    ])
    
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
    
    var driver, srcs, streams = [];
    
    for(driver in drivers)
    {
        srcs = drivers[driver];
        streams.push(
            gulp.src(srcs)
            .pipe(sourcemaps.init())
            .pipe(concat('Tweene-' + driver + '.js'))
            .pipe(wrapper({
                header: "(function(window, undef){ \n  'use strict'; \n",
                footer: "\n}(window));"
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('src'))
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
    
    var driver, streams = [];
    
    for(driver in drivers)
    {
        srcs = drivers[driver];
        streams.push(
            gulp.src('src/Tweene-' + driver + '.js')        
            .pipe(uglify('Tweene-' + driver + '.min.js'))
            .pipe(header(banner, {pkg: pkg}))
            .pipe(size({gzip: true, title: driver + ': '}))            
            .pipe(gulp.dest('.'))
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
