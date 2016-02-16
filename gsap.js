;(function (window) {
'use strict'; 
var func = function(window, undef) {
'use strict'; 

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

/**
 * Tweene - JavaScript Animation Proxy
 *
 * @link http://tweene.com
 *
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 *
 * @license Artistic License 2.0
 * See LICENSE.txt for details
 *
 */



/**
 * Vars and methods common to every tween and timeline, whatever is the driver used
 * @mixin
 *
 */
var Common = function()
{
    // unique identifier
    this._id = ++ Tw._idCounter;
    this._coreTimeUnit = Tw._coreTimeUnit;
    this._timeUnit = Tw.defaultTimeUnit;

    this._parent = null;

    this._target = null;

    this._duration = 0;

    this._speed = 1;

    this._delay = 0;

    this._loops = 0;

    this._loopsDelay = 0;

    this._loopsCount = 0;

    this._yoyo = false;

    this._fwd = true;

    this._localFwd = true;

    this._ready = false;

    this._running = false;

    // event handlers set by user
    this._handlers = {
        begin: null,
        end: null,
        reverse: null,
        progress: null,
        loop: null
    };

    // event handlers set internally
    this._coreHandlers = {
        _begin: [],
        _end: [],
        begin: [],
        end: [],
        reverse: [],
        progress: [],
        loop : []
    };


    /**
     * Play the animation in forward direction
     * @link http://tweene.com/docs/#play
     *
     * @returns {this}
     */
    this.play = function()
    {
        this._fwd = true;
        this._playTween();
        return this;
    };


    /**
     * Play the animation in backward direction from its current position
     * @link http://tweene.com/docs/#reverse
     *
     * @returns {this}
     */
    this.reverse = function()
    {
        this._fwd = false;
        this._reverseTween();
        return this;
    };


    /**
     * Pause the animation on its current state.
     * @link http://tweene.com/docs/#pause
     *
     * @returns {this}
     */
    this.pause = function()
    {
        if(this._ready)
        {
            this._pauseTween();
        }
        return this;
    };


    /**
     * Resume a previously paused animation without affecting the current direction
     * @link http://tweene.com/docs/#resume
     *
     * @returns {this}
     */
    this.resume = function()
    {
        this._resumeTween();
        return this;
    };


    /**
     * Restart animation in forward direction.
     * Reset also loops counter.
     * Initial delay is performed only on the very first start, not on restart.
     * @link http://tweene.com/docs/#restart
     *
     * @returns {this}
     */
    this.restart = function()
    {
        this._restartTween();
        return this;
    };


    /**
     * Go back to initial or final position accordingly to the value of direction. Intended to be used internally, you don't have to call this directly.
     *
     * @returns {this}
     */
    this.back = function()
    {
        this._backTween(this._localFwd? 'begin' : 'end');
        return this;
    };


    /**
     * Get or set the speed of the current tween/timeline. Normal speed is 1, so 2 is double speed and 0.5 is half speed.
     * It's usable both before and during the animation.
     * It Accepts also string shortcut defined in Tweene.speeds
     * @link http://tweene.com/docs/#speedControl
     *
     * @param {number} [value]
     * @returns {number|this}
     */
    this.speed = function(value)
    {
        if(value === void 0)
        {
            return this._speed;
        }

        value = parseSpeed(value);
        if(value != this._speed)
        {
            this._speed = value;
            this._speedTween();
        }
        return this;
    };


    /**
     * Alias for speed()
     * @see speed
     *
     */
    this.timeScale = function()
    {
        return this.speed.apply(this, arguments);
    };


    /**
     * Return the current playhead time (a value between 0 and duration) in time unit set in Tweene.defaultTimeUnit
     *
     * @returns {number}
     */
    this.time = function()
    {
        return Math.round(convertTime(this._getPosition(), this._coreTimeUnit, this._timeUnit) * 1000) / 1000;
    };


    /**
     * Return the current playhead position in percent (a value between 0 and 1)
     *
     * @returns {number}
     */
    this.progress = function()
    {
        return Math.round(this._getProgress() * 1000) / 1000;
    };


    /**
     * Return true if the animation is currently paused
     * Tt's true also when the animation is finished or not yet started
     *
     * @returns {boolean}
     */
    this.paused = function()
    {
        return this._getPaused();
    };


    /**
     * Return true if the animation direction is currently reversed
     *
     * @returns {boolean}
     */
    this.reversed = function()
    {
        return !this._fwd;
    };


    /**
     * Get/Set the tween duration (only get available for timeline)
     * Accept numeric values interpreted as Tweene.defaultTimeUnit
     * or string with unit suffix, so '500ms' or '0.5s'
     *
     * @param {string|number} [value]
     * @returns {this|number}
     *
     */
    this.duration = function(value)
    {
        if(value !== void 0)
        {
            if(this._type != 'timeline')
            {
                this._duration = this._parseTime(value);
                this.invalidate();
            }
            return this;
        }

        // timeline needs to process its children in order to calculate the overall duration
        if(this.type == 'timeline')
        {
            this.prepare();
        }
        return Math.round(convertTime(this._duration, this._coreTimeUnit, this._timeUnit) * 1000) / 1000;
    };


    /**
     * Get the tween/timeline total duration including loops and loopsDelay, in the timeUnit set in Tweene.defaultTimeUnit
     * In case of infinite loop, it returns Infinity
     *
     * @returns {number}
     */
    this.totalDuration = function()
    {
        if(this.type == 'timeline')
        {
            this.prepare();
        }
        return Math.round(convertTime(this._getTotalDuration() * this._speed, this._coreTimeUnit, this._timeUnit) * 1000) / 1000;
    };


    /**
     * Set the animation target (jquery or dom objects commonly, accordingly to the specific animation library in use)
     * @link http://tweene.com/docs/#target
     *
     * @param {string|object} [value]
     * @returns {string|object|this}
     */
    this.target = function(value)
    {
        if(value === void 0)
        {
            return this._target;
        }
        this._setTarget(value);
        return this;
    };


    /**
     * Get/Set the tween initial delay
     * Accept numeric values interpreted as Tweene.defaultTimeUnit
     * or string with unit suffix, so '500ms' or '0.5s'
     * @link http://tweene.com/docs/#delay
     *
     * @param {string|number} [value]
     * @returns {number|this}
     */
    this.delay = function(value)
    {
        if(value === void 0)
        {
            return convertTime(this._delay, this._coreTimeUnit, this._timeUnit);
        }
        this._delay = this._parseTime(value);
        this.invalidate();
        return this;
    };



    /**
     * Set the number of animation repeats. Default is 0, so loops(1) will execute the tween/timeline twice.
     * A value of -1 means 'Infinite loop'.
     * @link http://tweene.com/docs/#loops
     *
     * @param {number} value
     * @returns {this}
     */
    this.loops = function(value)
    {
        if(value === void 0)
        {
            return this._loops;
        }
        value = parseInt(value);
        if(isNaN(value))
        {
            value = 0;
        }
        else if(!isFinite(value))
        {
            value = -1;
        }
        this._loops = value;
        this.invalidate();
        return this;
    };


    /**
     * Enable/disable yoyo behavior or retrieve its status.
     * Yoyo makes sense only when used with looops.
     * @link http://tweene.com/docs/#yoyoEffect
     *
     * @param {boolean} [value]
     * @returns {boolean|this}
     */
    this.yoyo = function(value)
    {
        if(value === void 0)
        {
            return this._yoyo;
        }
        this._yoyo = !!value;
        return this;
    };


    /**
     * Get/Set the value of delay before each loop iteration
     * Accept numeric values interpreted as Tweene.defaultTimeUnit
     * or string with unit suffix, so '500ms' or '0.5s'
     * @link http://tweene.com/docs/#loopsDelay
     *
     * @param {string|number} [value]
     * @returns {number|this}
     */
    this.loopsDelay = function(value)
    {
        if(value === void 0)
        {
            return convertTime(this._loopsDelay, this._coreTimeUnit, this._timeUnit);
        }
        this._loopsDelay = this._parseTime(value);
        this.invalidate();
        return this;
    };


    /**
     * Add event handler.
     * First param is the event name,
     * second param is the callback function,
     * third (optional) array of params to pass to the callback
     * fourth (optional) scope for the callback (the default is the tween / timeline object that will raise the event)
     *
     * Available events:
     *  begin | onBegin | start | onStart:
     *      raised on the animation start
     *
     *  end | onEnd | complete | onComplete | finish | onFinish | done:
     *      raised on the animation end, after all loops (a tween with infinite loops will never fire this event)
     *
     *  reverse | onReverse | onReverseComplete:
     *      raised when the animation ends in backward direction, so at the start position.
     *
     *  progress | onProgress | update | onUpdate:
     *      fires periodically during the tween. The frequency of the call
     *      could be different for any animation library used.
     *      When the library does not offer native progress event, it is emulated
     *      via RequestAnimationFrame
     *
     *  loop | onLoop | onRepeat:
     *      raised on each loop iteration
     *
     *
     * @link http://tweene.com/docs/#events
     *
     * @param {string} name
     * @param {function|null} callback - pass null to remove a previously set event handler
     * @param {array} [params]
     * @param {object} [scope]
     * @returns {this}
     */
    this.on = function(name, callback)
    {
        if(name in handlersMap)
        {
            name = handlersMap[name].length? handlersMap[name] : name;
            if(callback === null)
            {
                this._handlers[name] = null;
            }
            else
            {
                this._handlers[name] = {
                    callback: callback,
                    params: arguments.length > 2? (isArray(arguments[2])? arguments[2] : [arguments[2]]) : [],
                    scope: arguments.length > 3 && arguments[3] !== null? arguments[3] : this
                };
            }
        }
        return this;
    };


    /**
     * Used internally for register core event handlers
     *
     * @param {string} name
     * @param {string} id
     * @param {function} callback
     * @param {object} [scope]
     * @param {array} [params]
     * @param {boolean} [priority]
     * @returns {this}
     */
    this.setCoreHandler = function(name, id, callback, scope, params, priority)
    {
        this.unsetCoreHandler(name, id);
        var entry = {id: id, callback: callback, scope: scope || this, params: params || []};

        if(priority)
        {
            this._coreHandlers[name].unshift(entry);
        }
        else
        {
            this._coreHandlers[name].push(entry);
        }

        return this;
    };


    /**
     * Used internally for unregister core event handlers
     *
     * @param {string} name
     * @param {string} id
     * @returns {this}
     */
    this.unsetCoreHandler = function(name, id)
    {
        for(var i = 0, end = this._coreHandlers[name].length; i < end; i++)
        {
            if(this._coreHandlers[name][i].id == id)
            {
                this._coreHandlers[name].splice(i, 1);
                break;
            }
        }
        return this;
    };


    /**
     * Reset _ready flag every time that one of the internal properties that need to be processed before running is changed
     *
     * @returns {this}
     */
    this.invalidate = function()
    {
        if(!this._running)
        {
            if(this._parent)
            {
                this._parent.invalidate();
            }
            this._ready = false;
        }
        return this;
    };


    /**
     * Get/Set the parent object. The parent could be a timeline or a tween if the child is a DummyTween used for emulate delay
     *
     * @param {object} [value]
     * @returns {this|object}
     */
    this.parent = function(value)
    {
        if(value === void 0)
        {
            return this._parent;
        }
        this._parent = value;
        this.invalidate();
        return this;
    };


    /**
     * Get the internal unique identifier
     *
     * @returns {number}
     */
    this.id = function()
    {
        return this._id;
    };


    /**
     * Set options for tween or timeline
     *
     * @param {object} options
     * @returns {this}
     */
    this.options = function(options)
    {
        // the object will be modified, we need to clone it in order to keep the original safe, allowing its reuse
        options = cloneObject(options, true);
        var opts = this._parseOptions(options);
        opts.events = this._parseEvents(options);
        this._applyArguments(opts);
        return this;
    };


    /**
     * Return the resulting speed of the object
     *
     * @returns {number}
     */
    this.getRealSpeed = function()
    {
        return this._parent? this._parent.getRealSpeed() * this._speed : this._speed;
    };


    /**
     * Get the tween/timeline total duration including loops and loopsDelay
     * In case of infinite loop, it returns Infinity
     *
     * @returns {number}
     */
    this._getTotalDuration = function()
    {
        if(this._loops == -1 && (this._duration || this._loopsDelay))
        {
            return Infinity;
        }
        return (this._duration + ((this._loopsDelay + this._duration) * this._loops)) / this._speed;
    };


    /**
     * Assign otpions and event handlers previously parsed
     *
     * @param {object} args
     */
    this._applyArguments = function(args)
    {
        var name;
        for(name in args.events)
        {
            this.on.apply(this, args.events[name]);
        }
        delete args.events;

        for(name in args)
        {
            // these properties are available only for tween objects
            if(this.type != 'timeline' && inArray(['from', 'to', 'then', 'immediateStart'], name) != -1)
            {
                this['_' + name] = args[name];
            }
            else if(name in this && this[name] instanceof Function)
            {
                this[name](args[name]);
            }
        }
    };


    /**
     * Check if there are public or internal event handlers set for that name
     *
     * @param {string} name
     * @returns {boolean}
     */
    this._hasHandlers = function(name)
    {
        return (name in this._handlers && this._handlers[name] !== null) || this._coreHandlers[name].length;
    };


    /**
     * execute event handlers bound to the given name
     *
     * @param {string} name
     */
    this._runHandlers = function(name)
    {
        var i, end, entry;

        // run external events first to guarantee correct events order inside timelines
        if(name in this._handlers && this._handlers[name] !== null)
        {
            entry = this._handlers[name];
            entry.callback.apply(entry.scope, entry.params);
        }

        // internal handlers
        if(this._coreHandlers[name].length)
        {
            for(i = 0, end = this._coreHandlers[name].length; i < end; i++)
            {

                entry = this._coreHandlers[name][i];
                entry.callback.apply(entry.scope, entry.params);
            }
        }

    };




    /**
     * find and return allowed options in a generic object
     *
     * @param {Object} options
     * @param {Boolean} remove - if true, it removes found options from original object
     * @returns {Object}
     */
    this._parseOptions = function(options, remove)
    {
        var opts = this.type == 'tween'? extendObject({}, optionsMap, tweenOptionsMap) : optionsMap,
            values = {}, name, realName, value;

        for(name in options)
        {
            if(options.hasOwnProperty(name) && name in opts)
            {
                value = options[name];
                // paused property is used internally for another purpose, so we have to handle this option separately
                if(name == 'paused')
                {
                    this._immediateStart = !value;
                    delete options[name];
                    continue;
                }

                realName = opts[name].length? opts[name] : name;
                values[realName] = value;
                if(remove)
                {
                    delete options[name];
                }

            }
        }
        return values;
    };



    /**
     * Find and return allowed event in a generic object
     *
     * @param {object} options
     * @param {boolean} remove - if true, it removes found handlers and related values (scope and params) from original object
     * @returns {object}
     */
    this._parseEvents = function (options, remove)
    {
        var values = {}, value, args, name, realName, params;
        for(name in options)
        {
            if(options.hasOwnProperty(name) && name in handlersMap)
            {
                value = options[name];
                realName = handlersMap[name].length? handlersMap[name] : name;
                args = [realName, value];
                if(remove)
                {
                    delete options[name];
                }
                if((name + 'Params') in options)
                {
                    params = options[name + 'Params'];
                    args.push(isArray(params) ? params : [params]);
                    if(remove)
                    {
                        delete options[name + 'Params'];
                    }
                }
                if((name + 'Scope') in options)
                {
                    args.push(options[name + 'Scope']);
                    if(remove)
                    {
                        delete options[name + 'Scope'];
                    }
                }
                else
                {
                    args.push(this);
                }
                values[realName] = args;
            }
        }
        return values;
    };


    /**
     * Parse time value used for delay and duration settings, return a number that is the time expressed in coreTimeUnit.
     * Fallback to 0 if the given value is not valid
     *
     * @param {string|number} value
     * @returns {number}
     */
    this._parseTime = function(value)
    {
        if(!value)
        {
            return 0;
        }
        var unit = this._timeUnit, parts;
        if(isString(value))
        {
            // check for duration shortcuts like 'slow', 'fast', and so on
            if(value in durations)
            {
                value = durations[value];
            }

            // accept 's' or 'ms' as suffix after the number
            parts = value.match(/^[\+\-]?\s*([0-9\.]+)\s*(m?s)?$/i);
            if(parts === null || parts[1] === void 0)
            {
                return 0;
            }
            if(parts[2] !== void 0)
            {
                unit = parts[2].toLowerCase();
            }
            value = parts[1];
        }
        value = Number(value);

        if(isNaN(value))
        {
            value = 0;
        }

        value = convertTime(value, unit, this._coreTimeUnit);

        return Math.max(0, value);
    };


    /**
     * Set the target for tween or timeline. It accept both an object or a selector string
     *
     * @param {string|object} value
     * @returns {this}
     */
    this._setTarget = function(value)
    {
        if(isString(value) && '$' in window)
        {
            value = $(value);
        }
        this._target = value;
        return this;
    };


};

/**
 * Tweene - JavaScript Animation Proxy
 *
 * @link http://tweene.com
 *
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 *
 * @license Artistic License 2.0
 * See LICENSE.txt for details
 *
 */


/**
 * Create a Label object, used internally by timelines when you add a label
 * @class
 *
 * @param {string} name
 */
var Label = function(name)
{
    this.type = 'label';
    this._id = name;
    this._name = name;
    this._position = null;


    /**
     * Return the unique identifier
     *
     * @returns {number}
     */
    this.id = function()
    {
        return this._id;
    };


    /**
     * Get/Set the time position inside the parent timeline
     *
     * @param {number} [value]
     * @returns {this}
     */
    this.position = function(value)
    {
        if(value === void 0)
        {
            return this._position;
        }
        this._position = value;
        return this;
    };

};

/**
 * Tweene - JavaScript Animation Proxy 
 * 
 * @link http://tweene.com
 *   
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 * 
 * @license Artistic License 2.0 
 * See LICENSE.txt for details
 * 
 */


/**
 * Create a Callback object, used internally by timelines when you add callbacks calls
 * @class
 * 
 * @param {function} callback
 * @param {object} scope
 * @param {array} params
 * @param {number} dir - values: 1 | -1 | 0
 */
var Callback = function(callback, scope, params, dir, isPause)
{
    this.type = 'callback';    
    // unique id
    this._id = ++ Tw._idCounter;
    
    this.isPause = !!isPause;
    
    dir = dir === 1? true : (dir === -1? false : null);
    var parent = null;
            
    /**
     * Get or set the parent timeline object
     * 
     * @param {object} [value] - parent object
     * @returns {object|this}
     */
    this.parent = function(value)
    {
        if(!value)
        {
            return parent;
        }
        parent = value;
        return this;                
    };
    
    
    /**
     * Return the unique identifier
     * 
     * @returns {number} 
     */
    this.id = function()
    {
        return this._id;
    };
    
    
    /**
     * Duration of a callback inside a timeline is always 0, this is needed because internally they are handled as tweens
     * 
     * @returns {number}
     */
    this.totalDuration = function()
    {
        return 0;
    };
    
        
    /**
     * Execute the callback if the parent's direction is coherent with the callback's dir value
     * 
     * @returns {this}
     */
    this.resume = function()
    {
        if(callback && (dir === null || dir != parent.reversed()))
        {
            callback.apply(scope || parent, params);
        }
        return this;
    };
    
    
    
};


/**
 * Tweene - JavaScript Animation Proxy 
 * 
 * @link http://tweene.com
 *   
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 * 
 * @license Artistic License 2.0 
 * See LICENSE.txt for details
 * 
 */


/**
 * Vars and methods common to every tween, whatever is the driver used
 * @mixin
 * 
 */
var TweenCommon = function()
{    
    this.type = 'tween';

    this._from = null;

    this._to = null;

    this._then = null;

    this._easing = Tw.defaultEasing;

    this._duration = this._parseTime(Tw.defaultDuration);

    // could be overriden inside each driver
    this._propertyMap = {};

    this._hasMultipleEasing = false;
    this._allowMultipleEasing = false;
    this._allowTransform = false;        

    this._immediateStart = true;                

    this._data = null;    

    this._offset = 0;



    /**
     * Used by parent timeline to set the time offset of the tween
     * 
     * @param {number} value
     * @returns {this}
     */
    this.offset = function(value)
    {
        this._offset = value;
        return this;
    };


    /**
     * Create and return a timeline using target and driver of the current object
     * 
     * @param {object} params
     * @returns {object}
     */
    this.line = function(params)
    {
        return Tw.line(this._target, params, this.driverName);
    };


    /**
     * Execute a previously registered macro using this as macro scope
     * 
     * @param {string} name - the name of the macro
     * @returns {this}
     */
    this.exec = function(name)
    {
        // all arguments but the first will be passed to the macro
        var args = toArray(arguments, 1);
        if(name && name in Tw._macros)
        {
            Tw._macros[name].apply(this, args);
        }

        return this;
    };


    /**
     * Get/Set an easing function for the tween
     * 
     * @param {string|array} [value] You could pass a string shortcut for easing registered in Tweene.easings or a 4-length array that represents 
     * a cubic bezier curve
     * @returns {string|array|this}
     */
    this.easing = function(value)
    {
        if(value === void 0)
        {
            return this._easing;
        }            
        this._easing = value;
        return this;
    };


    /**
     * Parse arguments and set internal properties, expecting an object considered as "from" style properties
     * 
     * @returns {this}
     */
    this.from = function()
    {
        this.parseArguments(arguments, true, false);        
        this.invalidate();
        return this;
    };


    /**
     * Parse arguments and set internal properties, expecting an object considered as "from" style properties and another one considered as "to" style properties
     * 
     * @returns {this}
     */
    this.fromTo = function()
    {
        this.parseArguments(arguments, true, true);        
        this.invalidate();
        return this; 
    };


    /**
     * Parse arguments and set internal properties, expecting an object considered as "to" style properties
     * 
     * @returns {this}
     */
    this.to = function()
    {
        this.parseArguments(arguments, false, true);        
        this.invalidate();
        return this;
    };


    /**
     * Set then style properties
     * @link http://tweene.com/docs/#then
     * 
     * @param {object} values
     * @returns {this}
     */
    this.then = function(values)
    {
        this._then = values;
        this.invalidate();
        return this;
    };


    /**
     * Change style properties instantly, like $('#target').css()
     * @link http://tweene.com/docs/#tweenSet
     * 
     * @param {object} values
     * @returns {this}
     */
    this.set = function(values)
    {
        // it runs as a 'to' tween with 0 duration, this allow to schedule it inside a timeline too
        if(values)
        {
            this._to = values;        
        }
        this
            .duration(0)
            .play();
        return this;
    };


    /**
     * Perform internal tasks needed before starting the tween
     * 
     * @returns {number} - Returns the tween total duration
     */
    this.prepare = function()
    {
        this._prepare();
        return this._getTotalDuration();
    };


    /**
     * Parse all the supported variants for argument syntax in Tweene.to, Tweene.from and Tweene.fromTo. Check docs:
     * @link http://tweene.com/docs/#tweenTo
     * @link http://tweene.com/docs/#tweenFrom
     * @link http://tweene.com/docs/#tweenFromTo
     * 
     * @param {arguments|array} args
     * @param {boolean} needFrom
     * @param {boolean} needTo
     * @param {boolean} needPos - using timeline shortcuts .to() .from() and .fromTo() also position inside the timeline need to be parsed from arguments
     * @returns {string|number|this} - if needPos = true, returns parsed position
     */
    this.parseArguments = function(args, needFrom, needTo, needPos)
    {
        if(!isArray(args))
        {
            args = toArray(args);
        }
        var values = {events: {}}, pos = null;        
        if(args.length)
        {
            // duration passed before properties, like in GSAP
            if(isString(args[0]) || isNumber(args[0]))
            {
                values.duration = args.shift();
            }

            if(args.length)
            {
                if(needFrom)
                {
                    values = this._parseDataArg(args.shift(), 'from', values);
                }

                if(args.length)
                {      
                    if(needTo)
                    {
                        values = this._parseDataArg(args.shift(), 'to', values);
                    }

                    if(args.length)
                    {
                        // if not yet passed, check for duration param after the style properties 
                        if(!('duration' in values) && (isString(args[0]) || isNumber(args[0])))
                        {
                            values.duration = args.shift();
                        }

                        if(args.length)
                        {
                            // timeline position, when needed, is expected here after duration
                            if(needPos && (isString(args[0]) || isNumber(args[0])))
                            {
                                pos = args.shift();
                            }

                            if(args.length)
                            {                            
                                if(isString(args[0]) || isArray(args[0]))
                                {
                                    values.easing = args.shift();
                                }
                                else if(!isFunction(args[0]))
                                {           
                                    values = this._parseDataArg(args.shift(), 'then', values);
                                }
                            }
                        }

                        // complete callback 
                        if(args.length && isFunction(args[0]))
                        {
                            var evt = ['end', args.shift()];
                            if(args.length)
                            {
                                evt.push(isArray(args[0])? args[0] : [args[0]]);
                                if(args.length)
                                {
                                    evt.push(args.shift());
                                }
                            }
                            values.events.end = evt;
                        }
                    }
                }
            }
        }

        this._applyArguments(values);
        if(needPos)
        {
            return pos;
        }
        return this;        
    };


    /**
     * Clear the internal _data cache 
     * 
     */
    this._reset = function()
    {
        this._data = null;
    };

    
    /**
     * Perform internal tasks needed before starting the tween
     * 
     * @returns {this}
     */
    this._prepare = function()
    {
        if(!this._ready)
        {   
            this._reset();

            if(this._emulatedProgress)
            {
                // stop the progress ticker on both ends of the tween
                this
                    .setCoreHandler('end', '_progress', this._stopProgress, this, [])
                    .setCoreHandler('reverse', '_progress', this._stopProgress, this, []);                
            }

            // fill data with all time values converted to the unit used by the current driver
            this._data = {
                delay: convertTime(this._delay, this._coreTimeUnit, this._driverTimeUnit),
                loopsDelay: convertTime(this._loopsDelay, this._coreTimeUnit, this._driverTimeUnit),
                duration: convertTime(this._duration, this._coreTimeUnit, this._driverTimeUnit),
                speed: this._speed,
                easing: this._easing
            };        

            this._data.realDuration = this._data.duration / this.getRealSpeed();

            // flags needed for further actions
            this._hasBegin = false;
            this._hasEnd = false;
            this._hasThen = false;
            this._hasTween = false;
            this._hasPre = false;
            this._hasMultipleEasing = false;
            
            // init data structures for handling display and visibility special properties 
            this._hasStaticProps = false;
            this._staticProps = [];
            this._display = {pre: null, begin: null, end: null, then: null, mask: 0};
            this._visibility = {pre: null, begin: null, end: null, then: null, mask: 0};

            this._data.tween = this._prepareProperties(this._from, this._to, this._then);                        

            this._ready = true;
        }
        return this;        
    };    


    /**
     * Return the number of dom elements selected as target for this tween. If the specific library used does not support target objects
     * with a length property, this method should be overriden in the driver class
     * 
     * @returns {number}
     */
    this._getTargetLength = function()
    {
        return this._target.length;
    };


    /**
     * Create a common data structure after processing data hold in from, to and then objects, if set
     * 
     * @param {object|null} from
     * @param {object|null} to
     * @param {object|null} then
     * @returns {object|array}
     */
    this._prepareProperties = function(from, to, then)
    {        
        var tween = {};
        this._prepareSingle(tween, to, 'end');
        this._prepareSingle(tween, from, 'begin');
        this._prepareSingle(tween, then, 'then');
        
        // if the used animation library does not have native support for play / pause / reverse / resume, it creates a clone of tween structure 
        // for each single dom target involved
        if(this._emulatedPlayhead)
        {
            var i, end, 
                sortedTween = {}, 
                tweens = [],
                name,
                transformOrder = [
                    'x', 'translateX', 'y', 'translateY', 'z', 'translateZ', 
                    'rotateZ', 'rotate', 'rotation', 'rotationZ', 'rotateX', 'rotationX', 'rotateY', 'rotationY', 
                    'scale', 'scaleX', 'scaleY', 'scaleZ' 
                ]
            ;
            
            for(i = 0, end = transformOrder.length; i < end; i++)
            {
                name = transformOrder[i];
                if(name in tween)
                {
                    sortedTween[name] = tween[name];
                    delete tween[name];
                }
            }
            
            tween = extendObject(sortedTween, tween);
                                                            
            for(i = 0, end = this._getTargetLength(); i < end; i++)
            {
                tweens[i] = cloneObject(tween, true);
            }
            return tweens;
        }
        return tween;                
    };    


    


    /**
     * Process one block of properties
     * 
     * @param {object} tween
     * @param {object} block - one of from, to, then
     * @param {string} type - 'begin' | 'end' | 'then'
     */
    this._prepareSingle = function(tween, block, type)
    {
        if(block)
        {
            block = this._parsePropertiesNames(block);
            var data;
            // bit mask used for display and visibility properties
            // 1 = then, 2 = 'end', 4 = 'begin'. In case of 'end', value is copied in then too, so 3 is used instead of 2
            var maskValue = type == 'then'? 1 : (type == 'end'? 3 : 4);
            // _hasBegin | _hasEnd | _hasThen
            var hasField = '_has' + type.substr(0, 1).toUpperCase() + type.substr(1);
            for(var name in block)
            {
                if(block.hasOwnProperty(name))
                {
                    var easing = null, value = block[name], found;

                    // per-property easing 
                    if(isArray(value))
                    {
                        easing = this._allowMultipleEasing? value[1] : null;
                        value = value[0];

                        // per-property easing passed with then object is ignored
                        this._hasMultipleEasing = (easing && type != 'then');
                    }

                    if(name == 'display' || name == 'visibility')
                    {
                        this['_' + name][type] = value;
                        this._hasStaticProps = true;
                        this['_' + name].mask |= maskValue;            
                        // 'then' object is processed after 'end', so if there is a static property there too, it will overwrite correctly the one set by 'end' call
                        if(type == 'end')
                        {
                            this['_' + name].then = value;                            
                        }
                        continue;
                    }

                    this[hasField] = true;
                    if(type != 'then')
                    {
                        this._hasTween = true;
                    }

                    if(type == 'end' || !(name in tween))
                    {
                        found = false;
                        data = {
                            pre: null,
                            begin: null, 
                            end: null, 
                            then: null,
                            easing: null, 
                            isTransform: false
                        };                        
                    }
                    else
                    {
                        found = true;
                        data = tween[name];
                    }

                    data[type] = value;

                    if(type != 'then')
                    {
                        if(!found)
                        {
                            data.easing = easing;
                        }
                    }                    

                    if(!data.isTransform)
                    {
                        data.isTransform = isTransformProperty(name);
                    }                        

                    tween[name] = data;
                }
            }
        }                
    };


    /**
     * utility function for splitting tween style values when per-property easing is specified
     * currently used only by GSAP driver, so for simplicity it assumes that this._emulatePlayhead is false and tween data is not cloned 
     * for each dom target
     * 
     * @param {objet} tween
     * @returns {array}
     */
    this._splitEasing = function(tween)
    {
        var map = {},
            tweens = [],
            name, easing, easingName, entry;

        for(name in tween)
        {
            entry = tween[name];
            easing = entry.easing? entry.easing : this._easing; 
            // easing could be a string or an array, so we normalize array values to a string in order to have a proper value for the easing map
            easingName = (isString(easing))? easing : easing.join('_').replace(/\./g, 'p');
            if(!(easingName in map))
            {
                map[easingName] = tweens.length;
                tweens.push({tween: {}, easing: easing});
            }
            tweens[map[easingName]].tween[name] = entry;            
        }
        return tweens;                        
    };


    /**
     * Perform several actions on style properties passed
     * 
     * @param {object} values
     * @returns {object}
     */
    this._parsePropertiesNames = function(values)
    {
        var newValues = {}, newName, subValues;
        for(var name in values)
        {
            if(values.hasOwnProperty(name))
            {
                // convert dashed names to camelCase version
                newName = camelize(name);                                            
                
                // split compund properties like padding: 10px 20px to a list of single-valued properties
                if(inArray(compoundNames, newName) !== -1)
                {
                    subValues = compoundMapping(newName, values[name]);
                }
                // split compound transform properties like translate: 10 20 to a list of single-valued transform properties
                else if(this._allowTransform && inArray(compoundTransforms, newName) !== -1)
                {
                    subValues = transformMapping(newName, values[name]);
                }
                else
                {
                    subValues = {};
                    subValues[newName] = values[name];
                }
                                    
                for(name in subValues)
                {
                    // if found, replace the given name with the alias accepted by the specific animation library
                    newName = name in this._propertyMap? this._propertyMap[name] : name;
                    // if transformation are not supported (using jQuery as animation library, for example) any transform property is dropped
                    if(this._allowTransform || !isTransformProperty(newName))
                    {
                        newValues[newName] = subValues[name];                    
                    }
                }
            }
        }
        return newValues;
    };


    /**
     * Transform the given easing value in the form accepted by the specific animation library. In most of the case, the driver has to override 
     * _getBezierEasing() method 
     * 
     * @param {string|array} value
     * @returns {string|array|function}
     */    
    this._getRealEasing = function(value)
    {
        // check for shortcut set in Tweene.easings
        if(isString(value) && value in easings)
        {
            value = easings[value];
        }

        // cubic bezier curve array
        if(isArray(value) && value.length == 4)
        {
            value = this._getBezierEasing(value);
        }

        return value;
    };


    /**
     * Duplicate style properties object and check for any options and event handlers passed together
     * 
     * @param {object} data - only plain object accepted, else it throws an exception 
     * @param {string} name - 'from' | 'to' | 'then'
     * @param {object} values - destination container
     * @returns {object}
     */
    this._parseDataArg = function(data, name, values)
    {        
        if(!seemsPlainObject(data))
        {
            throw 'Expected plain object as argument';
        }
        data = cloneObject(data, true);    
        var options = this._parseOptions(data, true);
        var events = this._parseEvents(data, true);
        if(keys(data).length)
        {
            values[name] = data;
        }
        values = extendObject(values, options);
        values.events = extendObject(values.events, events);
        return values;
    };                   

};
/**
 * Tweene - JavaScript Animation Proxy
 *
 * @link http://tweene.com
 *
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 *
 * @license Artistic License 2.0
 * See LICENSE.txt for details
 *
 */



/**
 * Vars and methods common to every timeline object, whatever is the driver used
 * @mixin
 *
 */
var TimelineCommon = function()
{
    this.type = 'timeline';

    this._offset = 0;

    this._children = [];

    this._cursor = null;

    this._labels = {};


    /**
     * Add tweens, timelines, callbacks and labels to current timeline object
     * @link http://tweene.com/docs/#timelineAdd
     * @link http://tweene.com/docs/#nestedTimelines
     * @link http://tweene.com/docs/#directionalCallbacks
     * @link http://tweene.com/docs/#labels
     *
     * @param {string|object|number} child - number is accepted only when adding directional callback
     * @param {string|number} [startPosition]
     * @returns {this}
     */
    this.add = function(child, startPosition)
    {
        // adding a label
        if(isString(child))
        {
            // label needs to start with an alphabetic character and cannot contains arithmetic symbols specified in the regexp here
            if(child.search(/^[a-z][^\+\-=]*$/) != -1)
            {
                child = new Label(child);
                this._labels[child.id()] = child;
            }
            else
            {
                throw 'The label "' + child +'" contains invalid symbols';
            }
        }
        else
        {
            // adding a callback or directional callback
            if(isFunction(child) || (isNumber(child) && isFunction(startPosition)))
            {
                var dir = 0, i = 0;
                // when a number is passed as first arg, it is a directional callback and we need to shift left the other params
                if(isNumber(child))
                {
                    dir = child;
                    child = startPosition;
                    startPosition = arguments[2] || null;
                    i = 1;
                }
                i = i + 2;
                // params expected after the callback
                var params = arguments.length > i? (isArray(arguments[i])? arguments[i] : [arguments[i]]) : [];
                i ++;
                // callback scope object expected after callback params
                var scope = arguments.length > i? arguments[i] : null;
                child = new Callback(child, scope, params, dir, false);
            }

            child.parent(this);
        }

        if(startPosition === void 0)
        {
            startPosition = null;
        }

        this._children.push({id: child.id(), child: child, start: startPosition});
        this.invalidate();
        return this;
    };


    /**
     * Add pause, with an optional callback
     * @link http://tweene.com/docs/#addPause
     *
     * @param {string|number} [startPosition]
     * @param {string|number} [callbackDirection]
     * @param {function} [callback] - callback
     * @param {array} [params] - callback params
     * @param {object} [scope] - callback scope
     * @returns {this}
     */
    this.addPause = function()
    {
        var args = toArray(arguments),
            startPosition = null,
            dir = 0,
            callback = null,
            params = [],
            scope = null,
            arg,
            child;

        if(args.length)
        {
            arg = args.shift();
            if(isFunction(arg))
            {
                callback = arg;
            }
            else
            {
                startPosition = arg;
            }

            if(args.length)
            {
                arg = args.shift();
                if(!callback)
                {
                    if(isNumber(arg))
                    {
                        dir = arg;
                        if(args.length)
                        {
                            callback = args.shift();
                        }
                    }
                    else
                    {
                        callback = arg;
                    }
                }

                if(callback && args.length)
                {
                    params = args.shift();
                    if(!isArray(params))
                    {
                        params = [params];
                    }

                    if(args.length)
                    {
                        scope = args.shift();
                    }
                }
            }
        }

        child = new Callback(callback, scope, params, dir, true);
        child.parent(this);
        this._children.push({id: child.id(), child: child, start: startPosition});
        this.invalidate();
        return this;
    };



    /**
     * Create a tween and execute a previously registered macro on it
     * If the timeline has not a target specified, it expects a target as first param.
     * It expects a position as second (or first) param, all other params are passed to the tween exec() method
     *
     * @returns {this}
     */
    this.exec = function()
    {
        var args = toArray(arguments);
        if(args.length)
        {
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            var pos = args.length > 1?  args.splice(1, 1)[0] : null;
            this.add(tween, pos);
            tween.exec.apply(tween, args);
        }
        return this;
    };

    /**
     * Schedule a tween with duration = 0
     * @link http://tweene.com/docs/#timelineSet
     *
     * @returns {this}
     */
    this.set = function()
    {
        var args = toArray(arguments);
        if(args.length)
        {
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            if(args.length)
            {
                var values = args.shift();
                var pos = args.length? args.shift() : null;
                tween._to = values;
                tween.duration(0);
                this.add(tween, pos);
            }
        }
        return this;
    };


    /**
     * Shortcut for .add(Tweene.get().to())
     * @link http://tweene.com/docs/#timelineTo
     *
     * @returns {this}
     */
    this.to = function()
    {
        return this._tweenMethod(arguments, false, true);
    };


    /**
     * Shortcut for .add(Tweene.get().fromTo())
     * @link http://tweene.com/docs/#timelineFromTo
     *
     * @returns {this}
     */
    this.fromTo = function()
    {
        return this._tweenMethod(arguments, true, true);
    };


    /**
     * Shortcut for .add(Tweene.get().from())
     * @link http://tweene.com/docs/#timelineFrom
     *
     * @returns {this}
     */
    this.from = function()
    {
        return this._tweenMethod(arguments, true, false);
    };


    /**
     * used internally for setting child timeline time position inside the parent
     *
     * @param {number} value
     * @returns {this}
     */
    this.offset = function(value)
    {
        this._offset = value;
        return this;
    };


    /**
     * Timeline need to process its children just before starting or when you ask for duration. See implementation in TimelinePro or
     * in specific drivers
     *
     * @returns {this}
     */
    this.prepare = function()
    {
        if(this._ready)
        {
            return this;
        }

        this._reset();
        this._mergeChildren();
        this.ready = true;
        return this;
    };


    /**
     * Perform all the common actions needed by .to(), .from() and .fromTo()
     *
     * @param {arguments} args
     * @param {boolean} from
     * @param {boolean} to
     * @returns {this}
     */
    this._tweenMethod = function(args, from, to)
    {
        args = toArray(args);
        if(args.length)
        {
            // use first argument as target if the timeline does not have a global target set
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            var pos = tween.parseArguments(args, from, to, true);
            this.add(tween, pos);
        }
        return this;
    };


    /**
     * Process all the children added evaluating their actual time position inside the timeline
     *
     * @returns {this}
     */
    this._mergeChildren = function()
    {
        if(this._ready)
        {
            return this;
        }

        // cursor will contains the end of the last processed child, while duration holds the overall end of the timeline
        this._cursor = this._duration = 0;

        var child, begin, end, start, childDelay, tweenable;
        for(var i = 0, len = this._children.length; i < len; i++)
        {
            child = this._children[i].child;
            start = this._children[i].start;

            tweenable = child.type == 'timeline' || child.type == 'tween';

            if(tweenable)
            {
                // if the child has a delay, remove it from the child and use it as a start offset inside the timeline
                childDelay = this._parseTime(child.delay());
                if(childDelay)
                {
                    this._cursor += childDelay;
                    this._duration += childDelay;
                    child.delay(0);
                }
            }

            // evaluate actual start position
            begin = this._getStartPosition(this._duration, this._cursor, start);

            if(child.type == 'label')
            {
                child.position(begin);
                this._mergeLabel(child, begin);
                continue;
            }

            if(tweenable)
            {
                if(child.type == 'timeline')
                {
                    child.offset(this._offset + begin);
                }
                // prepare() returns totalDuration
                end = begin + child.prepare();
                this._mergeTweenable(child, begin, end);
            }
            else
            {
                // callbacks have duration = 0
                end = begin;
                this._mergeCallback(child, begin, end);
            }

            // an infinite loop in a child tween or timeline results in its duration = Infinity
            if(end != Infinity)
            {
                this._cursor = end;
                if(this._cursor > this._duration)
                {
                    this._duration = this._cursor;
                }
            }
            else
            {
                this._cursor = this._duration = Infinity;
            }
        }
        return this;
    };


    /**
     * Evaluate actual time position of a child inside a timeline
     *
     * @param {number} currentDuration
     * @param {number} currentCursor - end of the previously processed child
     * @param {string|number} startPosition
     *
     * @returns {number}
     */
    this._getStartPosition = function(currentDuration, currentCursor, startPosition)
    {
        // by default, add to the end of the timeline, obtaining a queue of not-overlapping tweens
        if(startPosition === null)
        {
            return currentDuration;
        }
        var start = currentDuration, pos, sign = 0, toCursor = false;
        if(isString(startPosition))
        {
            // parts:
            //  1 - label
            //  2 - relative operator, +=, ++=, -=, --=
            //  3 - time value, number or string with 's' or 'ms' suffix
            var parts = startPosition.match(/^([a-z][^\+\-=]*)?(?:(\+{1,2}|\-{1,2})=)?([^\+\-=]+)?$/i);
            if(parts === null)
            {
                return currentDuration;
            }

            pos = parts[3] !== void 0? this._parseTime(parts[3]) : 0;

            if(parts[2] !== void 0)
            {
                toCursor = parts[2].length == 2;
                sign = parts[2].substr(0, 1) == '-'? -1 : 1;
            }

            if(parts[1] !== void 0 && parts[1] in this._labels)
            {
                start = this._labels[parts[1]].position();
                if(!sign)
                {
                    pos = 0;
                    sign = 1;
                }
            }
            else
            {
                if(sign)
                {
                    start = toCursor? currentCursor: currentDuration;
                }
                else
                {
                    start = 0;
                    sign = 1;
                }
            }
        }
        else
        {
            start = 0;
            sign = 1;
            pos = this._parseTime(startPosition);
        }

        if(start == Infinity)
        {
            return Infinity;
        }

        // cannot add child in negative positions, fallback to 0
        return Math.max(0, start + (pos * sign));
    };

};

/**
 * Tweene - JavaScript Animation Proxy
 *
 * @link http://tweene.com
 *
 * Copyright (c) 2014, Federico Orru'   <federico@buzzler.com>
 *
 * @license Artistic License 2.0
 * See LICENSE.txt for details
 *
 */


/**
 * Vars and methods common to Gsap tween and timeline drivers
 * @mixin
 */
var GsapCommon = function()
{

    this._driverTimeUnit = 's';

    this._native = null;

    this._eventsTarget = null;

    this._eventsSet = false;


    /**
     * Return the native TimelineMax object used internally by tween and timeline
     *
     * @returns {object} - TimelineMax object
     */
    this.getNative = function()
    {
        this.prepare();
        return this._native;
    };


    /**
     * Get current time position, needed only by info methods like time() and progress()
     *
     * @returns {number}
     */
    this._getPosition = function()
    {
        if(!this._ready)
        {
            return 0;
        }
        return convertTime(this._native.time(), this._driverTimeUnit, this._coreTimeUnit);
    };


    /**
     * Get the current percent progress, as a value between 0 and 1
     *
     * @returns {number}
     */
    this._getProgress = function()
    {
        if(!this._ready)
        {
            return 0;
        }
        return this._native.progress();
    };


    /**
     * Get the current running status
     *
     * @returns {bolean}
     */
    this._getPaused = function()
    {
        return (!this._ready || this._native.paused());
    };


    /**
     * Map Tweene event handlers to native Gsap events
     *
     */
    this._setupEvents = function()
    {
        if(this._eventsSet)
        {
            return;
        }
        var self = this, target, name;
        this.setCoreHandler('begin', '_running', function() { self._running = true; });

        this._eventsSet = true;

        var eventMaps = {
            begin: 'onStart',
            end: 'onComplete',
            loop: 'onRepeat',
            reverse: 'onReverseComplete',
            progress: 'onUpdate'
        };

        for(name in eventMaps)
        {
            if(this._hasHandlers(name))
            {
                target = name == 'end'? this._native : this._eventsTarget;
                target.eventCallback(eventMaps[name], this._runHandlers, [name], this);
            }
        }
    };


    /**
     * Propagate a call to the internal native object
     *
     * @param {string} name - method name
     */
    this._callNative = function(name)
    {
        this.prepare();
        this._setupEvents();
        this._native[name]();
    };


    /**
     * Propagate play() to native object
     *
     */
    this._playTween = function()
    {
        this._callNative('play');
    };


    /**
     * Propagate pause() to native object
     *
     */
    this._pauseTween = function()
    {
        this._callNative('pause');
    };


    /**
     * Propagate resume() to native object
     *
     */
    this._resumeTween = function()
    {
        this._callNative('resume');
    };


    /**
     * Propagate reverse() to native object
     *
     */
    this._reverseTween = function()
    {
        this._callNative('reverse');
    };


    /**
     * Propagate restart() to native object
     *
     */
    this._restartTween = function()
    {
        this._callNative('restart');
    };


    /**
     * Map speed() calls to native timeScale() method
     *
     */
    this._speedTween = function()
    {
        if(this._native && !this._parent)
        {
            this._native.timeScale(this._speed);
        }
    };

};


/**
 * Gsap Tween Driver
 * @link http://greensock.com/gsap
 *
 * @mixes Common, TweenCommon, GsapCommon
 *
 */
Tw.registerDriver('Gsap', 'tween', function(){
    Common.call(this);
    TweenCommon.call(this);
    GsapCommon.call(this);

    this._allowMultipleEasing = true;
    this._allowTransform = true;

    this._propertyMap = {
        translateX: 'x',
        translateY: 'y',
        translateZ: 'z',
        rotate: 'rotation',
        rotateX: 'rotationX',
        rotateY: 'rotationY',
        rotateZ: 'rotationZ'
    };



    /**
     * Override TweenCommon._reset()
     *
     */
    this._reset = function()
    {
        if(this._native)
        {
            this._native.clear();
            this._native = null;
        }
        this._eventsTarget = null;
        this._eventsSet = false;
    };


    /**
     * Get a Gsap generic Ease object constructed with a cubic bezier easing function
     *
     * @param {array} value
     * @returns {object}
     */
    this._getBezierEasing = function(value)
    {
        return new Ease(bezier.apply(null, value));
    };


    /**
     * Override TweenCommon.prepare()
     *
     * @returns {number}
     */
    this.prepare = function()
    {
        this._prepare();

        if(this._native !== null)
        {
            return this;
        }

        var
            data = this._data,
            from, to,
            then = {},
            i, end, tween, name, elem, fromCount, toCount, thenCount = 0;

        this._native = new TimelineMax({
            delay: data.delay
        })
            .pause()
            .timeScale(this._speed);

        // with Gsap we do per-property easing with overlapping tweens of the same targets
        data.tween = this._hasMultipleEasing? this._splitEasing(data.tween) : [{tween: data.tween, easing: data.easing}];

        for(i = 0, end = data.tween.length; i < end; i++)
        {
            tween = data.tween[i].tween;

            fromCount = 0;
            toCount = 0;
            from = {};
            to = {};

            for(name in tween)
            {
                if(tween[name].begin !== null)
                {
                    fromCount ++;
                    from[name] = tween[name].begin;
                }

                if(tween[name].end !== null)
                {
                    toCount ++;
                    to[name] = tween[name].end;
                }

                if(tween[name].then !== null)
                {
                    thenCount ++;
                    then[name] = tween[name].then;
                }
            }

            var values = (this._hasEnd)? to : from;
            if(data.duration)
            {
                values.ease = this._getRealEasing(data.tween[i].easing);
            }

            // in order to achieve almost the same behavior in all the drivers, it runs always with immediateRender = false
            values.immediateRender = false;
            values.paused = true;
            if(this._loops !== 0)
            {
                values.repeat = this._loops;
                values.repeatDelay = data.loopsDelay;
            }
            if(this._yoyo)
            {
                values.yoyo = true;
            }

            // add display and visibility properties

            if(toCount)
            {
                if(this._display.end)
                {
                    to.display = this._display.end;
                }
                if(this._visibility.end)
                {
                    if(this._visibility.end == 'hidden')
                    {
                        thenCount++;
                        then.visibility = this._visibility.end;
                    }
                    else
                    {
                        to.visibility = this._visibility.end;
                    }
                }
            }

            var duration = Math.max(0, data.duration - 0.000001);
            if(fromCount)
            {
                if(this._display.begin)
                {
                    from.display = this._display.begin;
                }
                if(this._visibility.begin)
                {
                    from.visibility = this._visibility.begin;
                }

                if(toCount)
                {
                    elem = TweenMax.fromTo(this._target, duration, from, to);
                }
                else
                {
                    elem = TweenMax.from(this._target, duration, from);
                }
            }
            else if(toCount)
            {
                elem = TweenMax.to(this._target, duration, to);
            }
            else
            {
                elem = TweenMax.to(this._target, duration, {opacity: '+=0'});
            }


            // we add events only to the first tween
            if(i === 0)
            {
                this._eventsTarget = elem;
            }

            // avoid from bug when nested inside timelines
            // @link http://greensock.com/forums/topic/10418-fromto-seems-to-ignore-immediaterender-false-when-nested/
            this._native.add(elem, 0.000001);
            elem.paused(false);
        }

        if(this._display.then)
        {
            thenCount++;
            then.display = this._display.then;
        }
        if(this._visibility.then)
        {
            thenCount++;
            then.visibility = this._visibility.then;
        }

        if(thenCount)
        {
            this._native.to(this._target, 0, then, data.duration);
        }

        this._setupEvents();

        return this._getTotalDuration();
    };


});



/**
 * Gsap Timeline Driver
 *
 * @mixes Common, TimelineCommon, GsapCommon
 *
 */
Tw.registerDriver('Gsap', 'timeline', function(){
    Common.call(this);
    TimelineCommon.call(this);
    GsapCommon.call(this);

    this._innerNative = null;


    /**
     * Override TimelineCommon.prepare()
     *
     * @returns {number}
     */
    this.prepare = function()
    {
        if(this._ready)
        {
            return this;
        }

        var values = {paused: true};
        if(this._loops)
        {
            values.repeat = this._loops;
            values.repeatDelay = convertTime(this._loopsDelay, this._coreTimeUnit, this._driverTimeUnit);
        }

        if(this._yoyo)
        {
            values.yoyo = true;
        }

        var _native = new TimelineMax(values);

        if(this._parent)
        {
            this._native = _native;
        }
        else
        {
            this._native = new TimelineMax({paused: true, delay: convertTime(this._delay, this._coreTimeUnit, this._driverTimeUnit)})
                .add(_native);
            _native.paused(false);
        }

        this._innerNative = _native;
        this._native.timeScale(this._speed);
        this._eventsTarget = _native;
        this._setupEvents();

        this._mergeChildren();
        this._ready = true;
        return this._getTotalDuration();
    };


    /**
     * Override TimelineCommon._reset()
     *
     */
    this._reset = function()
    {
        this._offset = 0;
        this._cursor = null;
        if(this._native)
        {
            this._native.clear();
            this._innerNative.clear();
            this._native = null;
            this._innerNative = null;
        }
        this._eventsTarget = null;
        this._eventsSet = false;
    };


    /**
     * Override TimelineCommon._mergeLabel()
     *
     */
    this._mergeLabel = function(child, begin)
    {
        // nop
    };


    /**
     * Override TimelineCommon._mergeTweenable()
     *
     */
    this._mergeTweenable = function(child, begin, end)
    {
        if(begin != Infinity)
        {
            var childNative = child.getNative();
            this._innerNative.add(childNative, convertTime(begin, this._coreTimeUnit, this._driverTimeUnit));
            childNative.paused(false);
        }
    };


    /**
     * Override TimelineCommon._mergeCallback()
     *
     */
    this._mergeCallback = function(child, begin, end)
    {
        if(begin != Infinity)
        {
            if(child.isPause)
            {
                this._native.addPause(convertTime(begin + this._delay, this._coreTimeUnit, this._driverTimeUnit), child.resume, [], child);
            }
            else
            {
                this._innerNative.call(child.resume, [], child, convertTime(begin, this._coreTimeUnit, this._driverTimeUnit));
            }
        }
    };



});


Tw.defaultTimeUnit = 's';
Tw.defaultDriver = 'gsap';
return Tw;
};

if(typeof(define) === 'function' && define.amd) {
   define(['gsap'], func.bind(this, window));
} else if(typeof(module) !== 'undefined' && module.exports) {
   var mod;
 mod = require('gsap');
module.exports = func(window);
} else {
   func(window);
}
}(typeof(global) !== 'undefined'? global : window));

//# sourceMappingURL=gsap.js.map