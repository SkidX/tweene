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
        // internal handlers are executed first
        if(this._coreHandlers[name].length)
        {
            for(i = 0, end = this._coreHandlers[name].length; i < end; i++)
            {
                
                entry = this._coreHandlers[name][i];                
                entry.callback.apply(entry.scope, entry.params);                    
            }
        }
        if(name in this._handlers && this._handlers[name] !== null)
        {
            entry = this._handlers[name];
            entry.callback.apply(entry.scope, entry.params);
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