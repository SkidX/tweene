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