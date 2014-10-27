

$('body').css({margin: 0, padding: 0});


describe('Tweene Utilities: ', function() {

    it('isFunction', function() {      
        expect(isFunction()).toBe(false);
        expect(isFunction([])).toBe(false);
        expect(isFunction(new Array())).toBe(false);
        expect(isFunction({})).toBe(false);
        expect(isFunction(Object)).toBe(true);
        expect(isFunction(Array)).toBe(true);
        expect(isFunction(5)).toBe(false);
        expect(isFunction('4')).toBe(false);
        expect(isFunction(.35)).toBe(false);
        expect(isFunction('array')).toBe(false);
        expect(isFunction(new String('test'))).toBe(false);
        expect(isFunction(function(){})).toBe(true);
        expect(isFunction(window)).toBe(false);
        expect(isFunction(window.open)).toBe(true);
    });

    it('isArray', function() {      
        expect(isArray()).toBe(false);
        expect(isArray([])).toBe(true);
        expect(isArray(new Array())).toBe(true);
        expect(isArray({})).toBe(false);
        expect(isArray(Object)).toBe(false);
        expect(isArray(Array)).toBe(false);
        expect(isArray(5)).toBe(false);
        expect(isArray('4')).toBe(false);
        expect(isArray(.35)).toBe(false);
        expect(isArray('array')).toBe(false);
        expect(isArray(new String('test'))).toBe(false);
        expect(isArray(function(){})).toBe(false);
        expect(isArray(window)).toBe(false);
        expect(isArray(window.open)).toBe(false);
    });

    it('isObject', function() {      
        expect(isObject()).toBe(false);
        expect(isObject([])).toBe(true);
        expect(isObject(new Array())).toBe(true);
        expect(isObject({})).toBe(true);
        expect(isObject(Object)).toBe(true);
        expect(isObject(Array)).toBe(true);
        expect(isObject(5)).toBe(false);
        expect(isObject('4')).toBe(false);
        expect(isObject(.35)).toBe(false);
        expect(isObject('array')).toBe(false);
        expect(isObject(new String('test'))).toBe(true);
        expect(isObject(function(){})).toBe(true);
        expect(isObject(window)).toBe(true);
        expect(isObject(window.open)).toBe(true);
    });

    it('isString', function() {      
        expect(isString()).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString(new Array())).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(Object)).toBe(false);
        expect(isString(Array)).toBe(false);
        expect(isString(5)).toBe(false);
        expect(isString('4')).toBe(true);
        expect(isString(.35)).toBe(false);
        expect(isString('array')).toBe(true);
        expect(isString(new String('test'))).toBe(true);
        expect(isString(function(){})).toBe(false);
        expect(isString(window)).toBe(false);
        expect(isString(window.open)).toBe(false);
    });

    it('isNumber', function() {      
        expect(isNumber()).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isNumber(new Array())).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber(Object)).toBe(false);
        expect(isNumber(Array)).toBe(false);
        expect(isNumber(5)).toBe(true);
        expect(isNumber('4')).toBe(false);
        expect(isNumber(.35)).toBe(true);
        expect(isNumber('array')).toBe(false);
        expect(isNumber(new String('test'))).toBe(false);
        expect(isNumber(function(){})).toBe(false);
        expect(isNumber(window)).toBe(false);
        expect(isNumber(window.open)).toBe(false);
    });

    it('isEmpty', function() {      
        expect(isEmpty({})).toBe(true);
        expect(isEmpty({a: 0, b: 1})).toBe(false);
    });
    
    it('extendObject', function() {      
        expect(extendObject({}, {a: 5}).a).toBe(5);
        expect(extendObject({a: 2}, {a: 3}).a).toBe(3);
    });

    it('cloneObject', function() {      
        var obj = {a: 5, b: 10};
        expect(cloneObject(obj)).toEqual(obj);
        expect(cloneObject(obj)).not.toBe(obj);
    });

    it('keys', function() {      
        var obj = {a: 5, b: 10};
        expect(keys(obj)).toEqual(['a', 'b']);
    });


    it('seemsPlainObject', function() {      
        expect(seemsPlainObject()).toBe(false);
        expect(seemsPlainObject([])).toBe(false);
        expect(seemsPlainObject(new Array())).toBe(false);
        expect(seemsPlainObject({})).toBe(true);
        expect(seemsPlainObject(Object)).toBe(false);
        expect(seemsPlainObject(Array)).toBe(false);
        expect(seemsPlainObject(5)).toBe(false);
        expect(seemsPlainObject('4')).toBe(false);
        expect(seemsPlainObject(.35)).toBe(false);
        expect(seemsPlainObject('array')).toBe(false);
        expect(seemsPlainObject(new String('test'))).toBe(false);
        expect(seemsPlainObject(function(){})).toBe(false);
        expect(seemsPlainObject(window)).toBe(false);
        expect(seemsPlainObject(window.open)).toBe(false);
    });


    it('camelize', function() {      
        expect(camelize('border-bottom-width')).toBe('borderBottomWidth');
    });

    it('decamelize', function() {      
        expect(decamelize('borderBottomWidth')).toBe('border-bottom-width');
    });


    it('compoundMapping', function() {      
        expect(compoundMapping('margin', 10)).toEqual({marginTop: '10', marginRight: '10', marginBottom: '10', marginLeft: '10'});
        expect(compoundMapping('padding', '10  20')).toEqual({paddingTop: '10', paddingRight: '20', paddingBottom: '10', paddingLeft: '20'});
        expect(compoundMapping('borderColor', '10 20  30')).toEqual({borderTopColor: '10', borderRightColor: '20', borderBottomColor: '30', borderLeftColor: '20'});
        expect(compoundMapping('margin', '10 20 30 40')).toEqual({marginTop: '10', marginRight: '20', marginBottom: '30', marginLeft: '40'});
        expect(compoundMapping('margin', '10 20 30 40 50')).toEqual({marginTop: '10', marginRight: '20', marginBottom: '30', marginLeft: '40'});
        expect(compoundMapping('borderRadius', '10 20')).toEqual({borderTopLeftRadius: '10', borderTopRightRadius: '20', borderBottomRightRadius: '10', borderBottomLeftRadius: '20'});
    });
    
    
    it('transformMapping', function() {      
        expect(transformMapping('scale', 1.2)).toEqual({scaleX: '1.2', scaleY: '1.2'});
        expect(transformMapping('rotate', '30deg')).toEqual({rotateZ: '30deg'});
        expect(transformMapping('rotate3d', '0, 0, 1, -30deg')).toEqual({rotateZ: '-30deg'});
        expect(transformMapping('rotate3d', '1,0,0, -30deg')).toEqual({rotateX: '-30deg'});
        expect(transformMapping('rotate3d', '0,1,0,60')).toEqual({rotateY: '60'});
        expect(transformMapping('translate', '50, 100')).toEqual({translateX: '50', translateY: '100'});
        expect(transformMapping('translate', '50  , -100')).toEqual({translateX: '50', translateY: '-100'});
        expect(transformMapping('translate3d', '0,1,2')).toEqual({translateX: '0', translateY: '1', translateZ: '2'});
        expect(transformMapping('skew', 20)).toEqual({skewX: '20', skewY: '20'});
    });    

    it('parseSpeed', function() {      
        expect(parseSpeed('half')).toBe(0.5);
        expect(parseSpeed('double')).toBe(2.0);
        expect(parseSpeed(3.5)).toBe(3.5);
        expect(parseSpeed(-5)).toBe(1);
        expect(parseSpeed(false)).toBe(1);
        expect(parseSpeed([])).toBe(1);
        expect(parseSpeed(0)).toBe(1);
        expect(parseSpeed()).toBe(1);
    });    
    
    var vett = [0, 1, 2, 3, 4, 5];
        
    it('inArray', function() {      
        expect(inArray(vett, 3)).toBe(3);
        expect(inArray(vett, 0)).toBe(0);
        expect(inArray(vett, 6)).toBe(-1);
        expect(inArray(vett, -1)).toBe(-1);
        expect(inArray.bind(null, 3, vett)).toThrow();
        expect(inArray.bind(null, {}, 1)).toThrow();
    });    
           
    it('convertTime', function() {      
        expect(convertTime(3, 's', 'ms')).toBe(3000);
        expect(convertTime(300, 'ms', 's')).toBe(0.3);
        expect(convertTime(3, 's', 's')).toBe(3);
    });    

    
    it('isNumeric', function() {      
        expect(isNumeric(3)).toBe(true);
        expect(isNumeric('3')).toBe(true);
        expect(isNumeric('+3')).toBe(true);
        expect(isNumeric('4px')).toBe(false);
        expect(isNumeric('+=3px')).toBe(false);
        expect(isNumeric(' 3')).toBe(true);
        expect(isNumeric('-3')).toBe(true);
    });    
    
    
});



var drivers = ['Gsap', 'Velocity', 'Transit', 'Jquery'];



describe('Tweene timeline creation: ', function() {

    var driver, t, i, end, $target;
    
    $target = $('<div id="target"></div>');
    $('body').append($target);

    var func = function(i)
    {
        it('empty timeline (' + driver + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            t = Tweene.line();    
            expect(t.driverName).toBe(driver.toLowerCase());
            expect(t.type).toBe('timeline');
            done();
        });                
        
        it('timeline with options object (' + driver + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            t = Tweene.line({delay: '2s', loops: 2});
            expect(t.driverName).toBe(driver.toLowerCase());
            expect(t._delay).toBe(2000);
            expect(t._loops).toBe(2);
            done();
        });                

        it('timeline with fluent syntax (' + driver + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            t = Tweene.line()
                .delay('2s')
                .loops(2);
            expect(t.driverName).toBe(driver.toLowerCase());
            expect(t._delay).toBe(2000);
            expect(t._loops).toBe(2);
            done();
        });                
        
        it('timeline with target (' + driver + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            t = Tweene.line($target);
            expect(t.driverName).toBe(driver.toLowerCase());
            expect(t._target).toBe($target);
            done();
        });                
        

        it('timeline with target and options (' + driver + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            t = Tweene.line('#target', {delay: '500ms'});
            expect(t.driverName).toBe(driver.toLowerCase());
            expect(t._target.attr('id')).toBe('target');
            expect(t._delay).toBe(500);
            done();
        });         
        
    };
  
    for(i = 0, end = drivers.length; i < end; i++)
    {
      func(i);
    }
    
});



describe('Tweene set: ', function() {

    var driver, $target, style, values, relValues;
    
    values = {left: 100, top: '50px', padding: '20 50'};
    relValues = {left: '+=50px', top: '-=20'};
  
    var func = function(i)
    {
        it('css values (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div></div>');
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.set($target, values);    
            Tweene.set($target, relValues);  
            setTimeout(function() {
                expect(style.paddingLeft).toBe('50px');
                expect(style.left).toBe('150px');
                expect(style.top).toBe('30px');
                $target.remove();
                done();           
            }, 200);
        });                        
        
    };
    

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});


describe('Tweene line set: ', function() {

    var driver, $target, style, values, relValues;
    
    values = {left: 100, top: '50px', padding: '20 50'};
    relValues = {left: '+=50px', top: '-=20'};
  
    var func = function(i)
    {
        it('css values (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div></div>');
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.line().set($target, values).set($target, relValues).play();
            
            setTimeout(function() {
                expect(style.paddingLeft).toBe('50px');
                expect(style.left).toBe('150px');
                expect(style.top).toBe('30px');
                $target.remove();
                done();           
            }, 100);
            
        });                        
        
    };
    

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});



describe('Tweene to: ', function() {

    var driver, $target, style, called;
    

    var completeCallback = function() {
        called = true;
    };

    
    var func = function(i)
    {
        it('jquery syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.to($target, {opacity: 0, left: '+=50px'}, 300, 'easeOutQuad', completeCallback);            
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('50px');
                expect(parseFloat(style.opacity)).toEqual(0);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('gsap syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.to($target, '0.3s', {opacity: 0, left: '+=50px', ease: 'easeOutQuad', onComplete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('50px');
                expect(parseFloat(style.opacity)).toEqual(0);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('velocity syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.to($target, {opacity: 0, left: '+=50px'}, {duration: 300, easing: 'easeOutQuad', complete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('50px');
                expect(parseFloat(style.opacity)).toEqual(0);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('transit syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.to($target, {opacity: 0, left: '+=50px', duration: 300, easing: 'easeOutQuad', complete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('50px');
                expect(parseFloat(style.opacity)).toEqual(0);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('fluent syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.get($target)
                .to({opacity: 0, left: '+=50px'})
                .duration(300)
                .easing('easeOutQuad')
                .on('complete', completeCallback)
                .play();                                   
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('50px');
                expect(parseFloat(style.opacity)).toEqual(0);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('paused by default (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px, opacity: 1"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            var t = Tweene.to($target, {opacity: 0}, {duration: 300, paused: true, end: completeCallback});
            expect(t._immediateStart).toBe(false);
            setTimeout(function() {
                expect(parseFloat(style.opacity)).toEqual(1);
                t.play();
                setTimeout(function() {
                    expect(called).toBe(true);
                    expect(parseFloat(style.opacity)).toEqual(0);
                    $target.remove();
                    done();           
                }, 600);
                
            }, 100);
            
        });                        
        
    };           

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});



describe('Tweene from: ', function() {

    var driver, $target, style, called;
    

    var completeCallback = function() {
        called = true;
    };

    
    var func = function(i)
    {
        it('jquery syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; opacity: 1; left: 0; top: 0; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.from($target, {opacity: 0, left: '+=50px'}, 300, 'easeOutQuad', completeCallback);            
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('0px');
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('gsap syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; opacity: 1; left: 0; top: 0; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.from($target, '0.3s', {opacity: 0, left: '+=50px', ease: 'easeOutQuad', onComplete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('0px');
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('velocity syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; opacity: 1; left: 0; top: 0; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.from($target, {opacity: 0, left: '+=50px'}, {duration: 300, easing: 'easeOutQuad', complete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('0px');
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('transit syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; opacity: 1; left: 0; top: 0; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.from($target, {opacity: 0, left: '+=50px', duration: 300, easing: 'easeOutQuad', complete: completeCallback});
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('0px');
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('fluent syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; opacity: 1; left: 0; top: 0; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            called = false;
            Tweene.get($target)
                .from({opacity: 0, left: '+=50px'})
                .duration(300)
                .easing('easeOutQuad')
                .on('complete', completeCallback)
                .play();                                   
            setTimeout(function() {
                expect(called).toBe(true);
                expect(style.left).toBe('0px');
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

    };           

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});



describe('Tweene fromTo: ', function() {

    var driver, $target, style;
        
    var func = function(i)
    {
        it('jquery syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.fromTo($target, {opacity: 0}, {opacity: 1}, 300);
            setTimeout(function() {
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('gsap syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.from($target, '0.3s', {opacity: 0}, {opacity: 1});
            setTimeout(function() {
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('velocity syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.from($target, {opacity: 0}, {opacity: 1}, {duration: 300});
            setTimeout(function() {
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        

        it('fluent syntax (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            Tweene.get($target)
                .from({opacity: 0})
                .to({opacity: 1})
                .duration(300)
                .play();
            setTimeout(function() {
                expect(parseFloat(style.opacity)).toEqual(1);
                $target.remove();
                done();           
            }, 600);
        });                        
        
    };           

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});


describe('Tweene timeline: ', function() {

    var driver, $target, style, t, originalTimeout, progCounter, loopCounter, calls, directionalCalls;
    
    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });    
    
    var func = function(i)
    {
        it('complex timeline (' + drivers[i] + ')', function(done) {
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            Tweene.defaultTimeUnit = 's';
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
            progCounter = 0;
            loopCounter = 0;
            calls = 0;
            directionalCalls = 0;
                        
            t = Tweene.line({
                loops: 2,
                loopsDelay: 0.5,
                delay: '500ms'                
            })
                .to($target, {rotate: '90deg', left: 200, top: 200}, 0.4)
                .from($target, {left: 100, top: 100, then: {width: 100, height: 100}}, 0.3, '+=0.2')
                .add('label', 0.6)
                .fromTo($target, {left: '-=50', top: '+=30'}, {left: '+=150', top: '+=130'}, 0.2, 'label+=0.1')
                .add(function() { calls ++; }, 0.1)
                .add(-1, function() { directionalCalls ++; }, 0.2)
                .on('begin', function() {
                    expect(this.paused()).toBe(false);
                })
                .on('progress', function() {
                    progCounter++;
                })
                .on('complete', function(a, b, c) {
                    expect(a + b + c).toBe(30);
                    expect(loopCounter).toBe(2);
                    expect(this.progress()).toBe(1);
                    expect(this.reversed()).toBe(false);
                    this.speed(1.5);
                    this.reverse();
                    expect(this.reversed()).toBe(true);
                }, [5, 10, 15])
                .on('loop', function() {
                    loopCounter ++;
                })
                .on('reverse', function() {
                    expect(loopCounter).toBe(4);
                    expect(calls).toBe(6);
                    expect(directionalCalls).toBe(3);
                    expect(loopCounter).toBe(4);
                    expect(this.time()).toBe(0);
                    expect(this.progress()).toBe(0);
                    expect(this.reversed()).toBe(true);
                    expect(progCounter).toBeGreaterThan(100);
                    $target.remove();
                    done();                               
                })
            ;
                                               
            expect(t._loops).toBe(2);
            expect(t._loopsDelay).toBe(500);
            expect(t._delay).toBe(500);
            expect(t.paused()).toBe(true);
            
            t.play();
            
        });                        

        
    };           

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});



describe('Tweene exec: ', function() {

    var driver, $target, style;

    Tweene.registerMacro('fadeIn', function(){
        this.to({opacity: 1, display: 'block'});
    });
    
    Tweene.registerMacro('fadeOut', function(){
        this.to({opacity: 0, then: {display: 'none'}});
    });
    
        
    var func = function(i)
    {
        it('complex timeline (' + drivers[i] + ')', function(done) {            
            driver = drivers[i];
            Tweene.defaultDriver = driver;
            Tweene.defaultTimeUnit = 's';
            $target = $('<div style="position: absolute; display: block; width: 50px; height: 50px"></div>');            
            $('body').append($target);
            style = window.getComputedStyle($target.get(0));
                                    
            Tweene.line({
            })
                .exec($target, 'fadeOut')
                .exec($target, 'fadeIn')
                .exec($target, 'fadeOut')
                .on('complete', function() {
                    expect(Number(style.opacity)).toBe(0);
                    expect(style.display).toBe('none');
                    $target.remove();
                    done();           
                }).play();
            
        });                        

        
    };           

    for(i = 0, end = drivers.length; i < end; i++)
    {
        func(i);
    }
    
});
