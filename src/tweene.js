/**
 * Tweene - JavaScript Animation Proxy
 * @version 0.5.11
 * @link http://tweene.com
 *
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 *
 * @license Artistic License 2.0
 * See LICENSE.txt for details
 *
 */

/* jshint -W008 */

/**
 * Common data and utility functions used internally.
 * None of them is exported.
 */

if(jQuery && window)
{
    var $ = jQuery;
}

// used for recognize transform properties
var transformProperties = 'scale|scale3d|translate|translate3d|rotate|rotate3d|rotation|skew|scaleX|scaleY|scaleZ|translateX|translateY|translateZ|x|y|z|rotateX|rotateY|rotateZ|skewX|skewY'.split('|');

// compound transforms are on the begin of the transformProperties array
var compoundTransforms = transformProperties.slice(0, 8);

// compound properties we parse to obtain a list of key - value couples
var compoundNames = 'margin|padding|borderColor|borderWidth|borderRadius'.split('|');
var compoundDirections = ['Top', 'Right', 'Bottom', 'Left'];
var radiusDirections = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'];

// base name and aliases for event names. Those with an empty string as value are the names used internally
var handlersMap = {
    begin: '',
    end: '',
    progress: '',
    loop: '',
    reverse: '',
    onBegin: 'begin',
    start: 'begin',
    onStart: 'begin',
    onEnd: 'end',
    complete: 'end',
    onComplete: 'end',
    finish: 'end',
    onFinish: 'end',
    done: 'end',
    onProgress: 'progress',
    update: 'progress',
    onUpdate: 'progress',
    onLoop: 'loop',
    onRepeat: 'loop',
    onReverse: 'reverse',
    onReverseComplete: 'reverse'
};


// base name and aliases for option names. Those with an empty string as value are the names used internally
var optionsMap = {
    delay: '',
    loops: '',
    loopsDelay: '',
    yoyo: '',
    target: '',
    speed: '',
    sleep: 'delay',
    repeat: 'loops',
    repeatDelay: 'loopsDelay',
    timeScale: 'speed'
};


// base name and aliases for tween option names
var tweenOptionsMap = {
    easing: '',
    duration: '',
    paused: '',
    to: '',
    from: '',
    then: '',
    ease: 'easing'
};


// predefined easing shortcuts
var easings = {
    linear: [.25, .25, .75, .75],
    ease: [.25, 0.1, 0.25, 1],
    'ease-in': [.42, 0, 1, 1],
    'ease-out': [0, 0, .58, 1],
    'ease-in-out': [.42, 0, .58, 1],
    'in': [.42, 0, 1, 1],
    out: [0, 0, .58, 1],
    'in-out': [.42, 0, .58, 1],
    snap: [0, 1, .5, 1],
    easeInCubic: [.550,.055,.675,.190],
    easeOutCubic: [.215,.61,.355,1],
    easeInOutCubic: [.645,.045,.355,1],
    easeInCirc: [.6,.04,.98,.335],
    easeOutCirc: [.075,.82,.165,1],
    easeInOutCirc: [.785,.135,.15,.86],
    easeInExpo: [.95,.05,.795,.035],
    easeOutExpo: [.19,1,.22,1],
    easeInOutExpo: [1,0,0,1],
    easeInQuad: [.55,.085,.68,.53],
    easeOutQuad: [.25,.46,.45,.94],
    easeInOutQuad: [.455,.03,.515,.955],
    easeInQuart: [.895,.03,.685,.22],
    easeOutQuart: [.165,.84,.44,1],
    easeInOutQuart: [.77,0,.175,1],
    easeInQuint: [.755,.05,.855,.06],
    easeOutQuint: [.23,1,.32,1],
    easeInOutQuint: [.86,0,.07,1],
    easeInSine: [.47,0,.745,.715],
    easeOutSine: [.39,.575,.565,1],
    easeInOutSine: [.445,.05,.55,.95],
    easeInBack: [.6,-.28,.735,.045],
    easeOutBack: [.175, .885,.32,1.275],
    easeInOutBack: [.68,-.55,.265,1.55]
};


// predefined duration shortcuts
var durations = {
    fast: '200ms',
    slow: '600ms'
};


// predefined speed shortcuts
var speeds = {
    half: 0.5,
    'double': 2
};



function isFunction(value)
{
    return typeof value == 'function';
}



function isNumber(value)
{
    return typeof value == 'number' || (value && typeof value == 'object' && Object.prototype.toString.call(value) == '[object Number]') || false;
}



function isString(value)
{
    return typeof value == 'string' || (value && typeof value == 'object' && Object.prototype.toString.call(value) == '[object String]') || false;
}



var isArray = Array.isArray || function(value)
{
    return value && typeof value == 'object' && typeof value.length == 'number' && Object.prototype.toString.call(value) == '[object Array]';
};



function isObject(value)
{
    var type = typeof value;
    return type === 'function' || type === 'object' && !!value;
}


/*
 * @link http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 */
function isNumeric(value)
{
    return !isArray(value) && (value - parseFloat(value) + 1) >= 0;
}


function isEmpty(obj)
{
    for(var name in obj)
    {
        if(obj.hasOwnProperty(name))
        {
            return false;
        }
    }
    return true;
}



function seemsPlainObject(value)
{
    return  isObject(value) && !(value instanceof Function) && value.constructor == Object;
}



function extendObject(obj)
{
    if (!isObject(obj))
    {
        return obj;
    }

    var source, name, i, length;
    for (i = 1, length = arguments.length; i < length; i++)
    {
        source = arguments[i];
        for (name in source)
        {
            obj[name] = source[name];
        }
    }
    return obj;
}


function cloneObject(obj, deep)
{
    if (isFunction(obj) || !isObject(obj))
    {
        return obj;
    }
    if(isArray(obj))
    {
        obj = obj.slice();
        if(deep)
        {
            for(var i = 0, end = obj.length; i < end; i++)
            {
                obj[i] = cloneObject(obj[i], deep);
            }
        }
    }
    else
    {
        obj = extendObject({}, obj);
        if(deep)
        {
            for(var name in obj)
            {
                if(obj.hasOwnProperty(name))
                {
                    obj[name] = cloneObject(obj[name], deep);
                }
            }
        }
    }

    return obj;
}



function keys(obj)
{
    if(Object.keys)
    {
        return Object.keys(obj);
    }
    var ks = [];
    for (var key in obj)
    {
        if(obj.hasOwnProperty(key))
        {
            ks.push(key);
        }
    }
    return ks;
}


// simplified version of Array.indexOf polyfill
function inArray(array, search)
{
    if(!isArray(array))
    {
        throw 'expected an array as first param';
    }

    if(array.indexOf)
    {
        return array.indexOf(search);
    }

    for(var i = 0, end = array.length; i < end; i++)
    {
        if(array[i] === search)
        {
            return i;
        }
    }
    return -1;
}


// used to convert arguments to real array
function toArray(args, pos)
{
    if(pos === void 0)
    {
        pos = 0;
    }
    return Array.prototype.slice.call(args, pos);
}


/**
 * convert time from seconds to milliseconds and vice versa
 *
 * @param {number} value
 * @param {string} fromUnit - 's' | 'ms'
 * @param {string} toUnit - 's' | 'ms'
 * @returns {Number}
 */
function convertTime(value, fromUnit, toUnit)
{
    if(fromUnit != toUnit && value !== 0)
    {
        return value * (toUnit == 's'? 0.001 : 1000);
    }
    return value;
}



/*
 *  Based on Bez http://github.com/rdallasgray/bez
 *
 * Copyright Robert Dallas Gray. All rights reserved.
 * Provided under the FreeBSD license: https://github.com/rdallasgray/bez/blob/master/LICENSE.txt
*/
function bezier(x1, y1, x2, y2)
{
    var p1 = [x1, y1], p2 = [x2, y2],
        A = [null, null], B = [null, null], C = [null, null],

        bezCoOrd = function(time, ax)
        {
            C[ax] = 3 * p1[ax]; B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax]; A[ax] = 1 - C[ax] - B[ax];
            return time * (C[ax] + time * (B[ax] + time * A[ax]));
        },

        xDeriv = function(time)
        {
            return C[0] + time * (2 * B[0] + 3 * A[0] * time);
        },

        xForT = function(time)
        {
            var x = time, i = 0, z;
            while (++i < 14)
            {
                z = bezCoOrd(x, 0) - time;
                if (Math.abs(z) < 1e-3) break;
                x -= z / xDeriv(x);
            }
            return x;
        };

    return function(time) {
        return bezCoOrd(xForT(time), 1);
    };
}


/**
 * take as input compound properties defined as a space separated string of values and return the list of single value properties
 *
 *   padding: 5 => paddingTop: 5, paddingRight: 5, paddingBottom: 5, paddingLeft: 5
 *   border-width: 2px 1px => borderTopWidth: 2px, borderRightWidth: 1px, borderBottomWidth: 2px, borderLeftWidth: 1px
 *
 * @param {string} name
 * @param {string} value
 * @returns {object}
 */
function compoundMapping(name, value)
{
    var parts, nameParts, prefix, suffix, dirs, values = {}, easing, i;
    if(isArray(value))
    {
        value = value[0];
        easing = value[1];
    }
    else
    {
        easing = null;
    }

    parts = String(value).split(/\s+/);

    switch(parts.length)
    {
        case 1: parts = [parts[0], parts[0], parts[0], parts[0]]; break;
        case 2: parts = [parts[0], parts[1], parts[0], parts[1]]; break;
        case 3: parts = [parts[0], parts[1], parts[2], parts[1]]; break;
    }

    nameParts = decamelize(name).split('-');
    prefix = nameParts[0];
    suffix = nameParts.length > 1? nameParts[1].substr(0, 1).toUpperCase() + nameParts[1].substr(1) : '';

    dirs = name == 'borderRadius'? radiusDirections : compoundDirections;

    for(i = 0; i < 4; i++)
    {
        values[prefix + dirs[i] + suffix] = easing? [parts[i], easing] : parts[i];
    }
    return values;
}


/**
 *  split commpound transform values
 *
 *   scale: 1.2 => scaleX: 1.2, scaleY: 1.2
 *   rotate3d: 30, 60, 40 => rotateX: 30, rotateY: 60, rotateZ: 40
 *
 * @param {string} name
 * @param {string} value
 * @returns {object}
 */
function transformMapping(name, value)
{
    var easing, dirs = ['X', 'Y', 'Z'], values = {}, parts, baseName;
    if(isArray(value))
    {
        value = value[0];
        easing = value[1];
    }
    else
    {
        easing = null;
    }

    parts = String(value).split(/\s*,\s*/);
    baseName = name.indexOf('3') !== -1? name.substr(0, name.length - 2) : name;

    if(name == 'rotate3d')
    {
        if(parts.length == 4)
        {
            dirs = [parts[0] == '1'? 'X' : (parts[1] == '1'? 'Y' : 'Z')];
            parts[0] = parts[3];
        }
        else
        {
            throw 'invalid rotate 3d value';
        }
    }
    else
    {
        switch(parts.length)
        {
            // for rotations, a single value is passed as Z-value, while for other transforms it is applied to X and Y
            case 1:
                parts = baseName == 'rotate' || baseName == 'rotation'? [null, null, parts[0]] : [parts[0], parts[0], null];
            break;

            case 2:
                parts = [parts[0], parts[1], null];
            break;
        }

    }

    for(var i = 0; i < dirs.length; i++)
    {
        if(parts[i] !== null)
        {
            values[baseName + dirs[i]] = easing? [parts[i], easing] : parts[i];
        }
    }
    return values;
}



function isTransformProperty(name)
{
    return (inArray(transformProperties, name) != -1);
}


// border-bottom-width -> borderBottomWidth
function camelize(name)
{
    return name.replace(/(\-[a-z])/g, function(value) {
        return value.substr(1).toUpperCase();
    });
}


// borderBottomWidth -> border-bottom-width
function decamelize(name)
{
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}


/**
 * accept a speed name shortcuts or a number and give back an acceptable positive value.
 * Fallback to 1 if value is out of valid range
 *
 * @param {string|number} value
 * @returns {number}
 */
function parseSpeed(value)
{
    if(value in speeds)
    {
        value = speeds[value];
    }

    value = parseFloat(value);
    if(isNaN(value) || !value || value <= 0)
    {
        value = 1;
    }
    return value;
}




/**
 * Tweene global class, is the unique identifier exported
 *
 * You will never need to instantiate a Tweene object. You have to use Tweene static methods
 * in order to obtain instances of tween and timeline objects of the different drivers
 *
 * @class
 *
 */
var Tweene = function()
{
    var _self = this;

    // used for generate unique identifier for any tweene object (tweens, timelines, callbacks and labels)
    this._idCounter = 0;

    // internally, all time values use this unit
    this._coreTimeUnit = 'ms';

    // time unit used when pure numbers are passed as delay or duration values. Users can change this value any time
    // when the user requires only GSAP driver, it defaults to 's' in order to mimic the library native API
    this.defaultTimeUnit = 'ms';

    this._macros = {};

    this.easings = easings;

    this.durations = durations;

    this.speeds = speeds;

    this.defaultDriver = 'jquery';

    this.defaultEasing = 'easeOutQuad';

    this.defaultDuration = '400ms';

    // container for registered drivers
    var _drivers = {
            tween: {},
            timeline: {}
        },


        /**
         * Create a tween or timeline object of the specified driver. If driverName is not given, it fallbacks to default driver
         *
         * @param {string} 'tween' or 'timeline'
         * @param {string} [driverName] - one of the registered driver's name
         * @returns {object} tween or timeline object
         */
        _getInstance = function(type, driverName)
        {
            var d, i;
            driverName = (driverName? driverName : _self.defaultDriver).toLowerCase();

            if(driverName in _drivers[type])
            {
                d = _drivers[type][driverName];
                i = new d();
                i.driverName = driverName;
                return i;
            }
            throw 'Driver ' + name + ' not found';
        },


        /**
         * Common method used inside from(), to() and fromTo() to create a tween and pass arguments to it
         *
         * @param {arguments} args - list of arguments passed to original public method
         * @param {string} method - 'from' | 'to' | 'fromTo'
         * @returns {object} - return a tween object
         */
        _tweenNow = function(args, method)
        {
            var tw = _getInstance('tween');
            if(args.length)
            {
                args = toArray(args, 0);
                tw.target(args.shift())[method].apply(tw, args);
            }

            return tw._immediateStart? tw.play() : tw;
        };


    /**
     * Register an animation driver
     *
     * @param {string} name - name of the driver
     * @param {string} type - 'tween' | 'timeline'
     * @param {function} construct - constructor function that defines the driver class
     * @returns {Tweene}
     */
    this.registerDriver = function(name, type, construct)
    {
        type = type.toLowerCase();
        if(type != 'tween')
        {
            type = 'timeline';
        }
        _drivers[type][name.toLowerCase()] = construct;
        return this;
    };


    /**
     * Define a macro for tween objects
     * @link http://tweene.com/docs/#macro
     *
     * @param {string} name
     * @param {function} macro - inside the function, 'this' refers to the tween object
     * @returns {Tweene}
     */
    this.registerMacro = function(name, macro)
    {
        this._macros[name] = macro;
        return this;
    };


    /**
     * Return an instance of a tween object
     * @link http://tweene.com/docs/#createTween
     *
     * @param {object|string} [target] jquery object or string selector of the dom element(s) to be animated
     * @param {string} [driver]
     * @returns {object}
     */
    this.get = function(target, driver)
    {
        var t = _getInstance('tween', driver);
        return target? t.target(target) : t;
    };


    /**
     * Apply instantly the properties values to the target
     *
     * @param {object|string} target
     * @param {object} values - CSS property - value map
     * @returns {unresolved}
     */
    this.set = function(target, values)
    {
        return _getInstance('tween').target(target).set(values);
    };


    /**
     * Create a tween object for a 'to' animation and pass the arguments to it. First argument is always the target.
     * If you don't set paused: true in the options passed, the tween will start immediately.
     * @link http://tweene.com/docs/#tweenTo
     *
     * @returns {object} - return the tween object
     */
    this.to = function()
    {
        return _tweenNow(arguments, 'to');
    };


    /**
     * Create a tween object for a 'from' animation and pass the arguments to it. First argument is always the target.
     * If you don't set paused: true in the options passed, the tween will start immediately.
     * @link http://tweene.com/docs/#tweenFrom
     *
     * @returns {object} - return the tween object
     */
    this.from = function()
    {
        return _tweenNow(arguments, 'from');
    };


    /**
     * Create a tween object for a 'fromTo' animation and pass the arguments to it. First argument is always the target.
     * If you don't set paused: true in the options passed, the tween will start immediately.
     * @link http://tweene.com/docs/#tweenFromTo
     *
     * @returns {object} - return the tween object
     */
    this.fromTo = function()
    {
        return _tweenNow(arguments, 'fromTo');
    };


    /**
     * Create a timeline object
     * @link http://tweene.com/docs/#createTimeline
     *
     * @param {object|string} [target] - it checks if the object passed as first param is a plain object (options) or not (target)
     * @param {object} [options]
     * @param {string} driver - name of the driver
     * @returns {object} - a timeline object
     */
    this.line = function(target, options, driver)
    {
        // we assume that targets cannot be plain objects
        var lineTarget = (isObject(target) && !seemsPlainObject(target))  || isString(target)? target : null;
        // if no target is passed, unshift arguments by one position
        if(!lineTarget)
        {
            options = arguments[0];
            driver = arguments[1];
        }
        options = seemsPlainObject(options)? options : {};
        // driver can be specified also with a 'driver' property inside options object
        driver = (driver !== void 0)? driver : 'driver' in options? options.driver : null;
        return _getInstance('timeline', driver)
            .options(options)
            .target(lineTarget);
    };

};

var Tw = new Tweene();

if(window)
{
    window.Tweene = Tw;
}
