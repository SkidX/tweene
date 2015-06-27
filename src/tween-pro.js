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



// used as cache for vendor-prefixed names
var propertyNames = {};

/**
 * Get style real name and value, checking for browser prefixes if needed
 * 
 * @param {object} style
 * @param {string} name
 * @returns {array} - return [realName, value]
 */
function getProperty(style, name)
{
    if(style[name] !== void 0)
    {
        return [name, style[name]];
    }
    if(name in propertyNames)
    {
        return [propertyNames[name], style[propertyNames[name]]];
    }
    name = name.substr(0, 1).toUpperCase() + name.substr(1);
    var prefixes = ['webkit', 'moz', 'ms', 'o'], fullName;
    for(var i = 0, end = prefixes.length; i < end; i++)
    {
        fullName = prefixes[i] + name;
        if(style[fullName] !== void 0)
        {
            propertyNames[name] = fullName;
            return [fullName, style[fullName]];
        }
    }
    return [name, void 0];        
}


/**
 * Reverse a cubic bezier, needed for playing tweens backwards
 * 
 * @param {array} value - 4-length cubic bezier array
 * @returns {array}
 */
function reverseBezier(value)
{
    return [
        1 - value[2],
        1 - value[3],
        1 - value[0],
        1 - value[1]
    ];
}


// needed by next func
var bezierEasingCache = {};

/**
 * Widely based on the great work by Vincent Tan
 * http://polymathprogrammer.com/2007/06/27/reverse-engineering-bezier-curves/
 * 
 * given a bezier curve and current time progress, it returns a new cubic bezier array equal to the remaining part of the curve
 * 
 * @param {Array} oldBezier - 4-length cubic bezier array
 * @param {Number} time -  current progress value, between 0 and 1 
 * @returns {Array}
 */
function getNewBezier(oldBezier, time)         
{                
    if(time === 0 || time === 1)
    {
        return oldBezier;
    }

    var cacheName = oldBezier.join('_').replace(/\./g, 'p') + '_' + time.toFixed(3);
    if(cacheName in bezierEasingCache)
    {
        return bezierEasingCache[cacheName];
    }        

    var oldBezierFunc = bezier.apply(null, oldBezier);
    var xInterval = 1 - time;
    var startY = oldBezierFunc(time);
    var sign = startY > 1? - 1 : 1;
    var yInterval = (1 - startY) * sign;

    var u = 0.33, v = 0.67;
    var uu = u * xInterval + time;
    var vv = v * xInterval + time;

    var 
        p0x = 0, p0y = 0,
        p1x = u, p1y = (oldBezierFunc(uu) - startY) * sign / yInterval, 
        p2x = v, p2y = (oldBezierFunc(vv) - startY) * sign / yInterval, 
        p3x = 1, p3y = 1,
        compU = 1 - u, compV = 1 -v, 
        u2 = u * u, u3 = u * u * u, v2 = v * v, v3 = v * v * v,

        a = 3 * compU * compU * u, b = 3 * compU * u2, 
        c = 3 * compV * compV * v, d = 3 * compV * v2;       

    var det = a*d - b*c;

    /* it would not be needed, it's just to honor Murphy's Law */
    if(det === 0) 
    {
        console.log('New Bezier FAIL: Det == 0'); 
        return oldBezier;
    }

    var compU3 = compU * compU * compU, compV3 = compV * compV * compV;

    var 
        q1x = p1x - (compU3 * p0x + u3 * p3x),
        q1y = p1y - (compU3 * p0y + u3 * p3y),	
        q2x = p2x - (compV3 * p0x + v3 * p3x),
        q2y = p2y - (compV3 * p0y + v3 * p3y);

    var res = [
        (d * q1x - b * q2x) / det,
        (d * q1y - b * q2y) / det,

        ((-c) * q1x + a * q2x) / det,
        ((-c) * q1y + a * q2y) / det
    ];

    bezierEasingCache[cacheName] = res;
    return res;
}




/**
 * Vars and methods used in tween object, for animation library that does not have native support 
 * for playhead control (play / pause / reverse and so on) 
 * @mixin
 * 
 */
var TweenPro = function()
{        
    this._beginReady = this._endReady = this._thenReady = false;
    
    
    
    /**
     * Called on first tween start
     * 
     * @returns {TweenPro}
     */
    this._run = function()
    {
        if(this._duration)
        {
            this._startProgress();
        }
        // get current display and/or visibility values before starting, if needed
        if(this._hasStaticProps)
        {
            this._fetchStaticProps();
            this._setStaticProps('tween');                                        
        }

        this._running = true;
        this._delayDummy = null;
        
        if(this._emulatedBegin && this._hasHandlers('_begin'))
        {
            this._runHandlers('_begin');
        }
        
        // if from() or fromTo() tween, need to jump to begin position before starting the animation
        if(this._emulatedFrom && this._from)
        {
            this._setTween('begin');
        }
        
        this._startTime = Tw.ticker.now();             
        this._playTween();

        return this;            
    };                                 


    /**
     * Used to restore begin or end style values accordingly to current direction
     * 
     * @param {string} field
     */
    this._backTween = function(field)
    {
        this._resetTween(field);
    };


    /**
     * Set style values accordinglty to the param, and perform postTween actions
     * 
     * @param {string} field
     */
    this._resetTween = function(field)
    {
        this._setTween(field);
        this._postTween(field);            
    };


    /**
     * Perform actions before starting the tween. Apply to both directions
     * 
     * @param {boolean} direction - true = forward, false = backward
     */
    this._preTween = function(direction)
    {
        var field = direction? 'begin' : 'end';
        if(this._hasStaticProps && this._duration)
        {
            this._setStaticProps(field, 'tween');                            
        }
        this._setTween(field);
    };
    

    /**
     * Perform actions after ending the tween. Apply to both directions
     * 
     * @param {string} field
     */
    this._postTween = function(field)
    {
        if(field == 'end')                
        {
            if(this._hasThen)
            {
                this._setTween('then');
            }
            if(this._hasStaticProps)
            {
                this._setStaticProps(field, 'then');
            }
        }
        else
        {
            // if the tween is reversed, restore previous style values
            // this is needed in timelines, when a reversed tween is preceded by others that refer common targets, with a time gap between them
            // otherwise, during the time gap in reverse direction the targets will have wrong style values
            if(this._hasPre)// && this._offset !== 0)
            {
                this._setTween('pre');
            }
            this._setStaticProps(field);
        }

    };


    /**
     * Get a simple name: value map of style property, ready to be passed to the chosen animation library.
     * If supported, set also the per-property easing specified by the user
     * 
     * @param {object} tween - tween data structure
     * @param {string} field - 'begin' | 'end' | 'pre' | 'then'
     * @param {boolean} isSet - true when the values are needed for changing the style instantly. Easing info are omitted in this case
     * @returns {object}
     */
    this._getTweenValues = function(tween, field, isSet)
    {
        var values = {}, entry, value, name, easing, i = 0;
        for(name in tween)
        {
            entry = tween[name];
            value = null;
            easing = entry.easing;

            if(entry[field] !== null)
            {
                i++;
                // cast pure numeric string to number. This avoid bugs in Transit and other libraries that potentially does not support numeric 
                // values passed as string
                value = isNumeric(entry[field])? Number(entry[field]) : entry[field];
                value = isSet || !this._allowMultipleEasing || !easing? value : [value, this._getRealEasing(easing)];
                values[name] = value;
            }            
        }

        // instead of handling different errors from any library involved, if there are no values to set, we force a fake tween
        if(!i)
        {
            values.opacity = '+=0';
        }

        return values;
    };


    /**
     * Fetch a style value for a dom element
     * 
     * @param {object} item - dom element
     * @param {string} name - property name
     * @param {boolean} useStyle - if true, use element.style instead of computedStyle value
     * @returns {string|number}
     */
    this._getCurrentValue = function(item, name, useStyle)
    {
        var style = useStyle? item.style : window.getComputedStyle(item);
        return style[name];        
    };


    /**
     * Fetch current values for display and / or visibility properties
     * 
     */
    this._fetchStaticProps = function()
    {             
        this._staticProps = [];
        
        var item, i, end, names, name, value, fieldName, field, hidden, tweenValue, values;
        for(i = 0, end = this._getTargetLength(); i < end; i++)
        {
            item = this._target.get(i);
            names = {display: false, visibility: false};
            
            this._staticProps[i] = {
                begin: {},
                end: {},
                then: {},
                tween: {}
            };
            
            for(name in names)
            {
                fieldName = '_' + name;
                field = cloneObject(this[fieldName]);
                if(field.mask > 0)
                {
                    if(field.mask < 7)
                    {
                        value = this._getCurrentValue(item, name, false);
                        if(field.begin === null)
                        {
                            field.begin = value;
                        }

                        if(field.end === null)
                        {
                            field.end = value;
                            if(field.then === null)
                            {
                                field.then = value;
                            }
                        }                                                                                
                    }

                    values = this._staticProps[i];
                    
                    values.begin[name] = field.begin;
                    values.end[name] = field.end;
                    values.then[name] = field.then;
                    // values that show the element need to be set before the tween
                    hidden = (name == 'display')? 'none' : 'hidden';
                    tweenValue = field.begin != hidden? field.begin : (field.end != hidden? field.end : false);
                    if(tweenValue !== false)
                    {
                        values.tween[name] = tweenValue;
                    }                    
                }
            }
        }
    };
    
    
    /**
     * Set display and visibility properties, that are handled separately
     * @link http://tweene.com/docs/#displayVisibility
     * 
     * @param {string} first
     * @param {string} [second] two set of values could be applied toghether in some cases, for example end + then or begin + tween
     */
    this._setStaticProps = function(first, second)
    {
        if(this._staticProps.length)
        {
            var i, end, values;
            for(i = 0, end = this._getTargetLength(); i < end; i++)
            {                
                values = this._staticProps[i][first];
                if(second)
                {
                    values = extendObject(values, this._staticProps[i][second]);
                }
                if(!isEmpty(values))
                {
                    this._target.eq(i).css(values);
                }
            }
        }
    };         
    

    /**
     * Override TweenCommon._getRealEasing()
     * It generates also custom bezier curves needed for resuming a paused tween honoring the original easing effect
     * 
     * @param {string|array} value
     * @returns {string|array|function}
     */
    this._getRealEasing = function(value)
    {
        if(isString(value) && value in easings)
        {
            value = easings[value];
        }

        if(isArray(value))
        {
            var position = this._position;
            // in backward direction, reverse the bezier curve too
            if(!this._localFwd)
            {
                value = reverseBezier(value);
                position = this._duration - position;
            }

            var timeRatio = position / this._duration;
            value = this._getBezierEasing(getNewBezier(value, timeRatio));
        }

        return value;
    };


};