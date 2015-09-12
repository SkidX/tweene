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
 * // jQuery plugin that allow to use cubic bezier curves for easing
 *  Based on Bez http://github.com/rdallasgray/bez
 *
 * Copyright Robert Dallas Gray. All rights reserved.
 * Provided under the FreeBSD license: https://github.com/rdallasgray/bez/blob/master/LICENSE.txt
*/
if(jQuery)
{
    jQuery.extend({ tweeneBezier: function(coOrdArray) {
        var encodedFuncName = "tweenebez_" + jQuery.makeArray(arguments).join("_").replace(/\./g, "p");
        if (typeof jQuery.easing[encodedFuncName] !== "function")
        {
            jQuery.easing[encodedFuncName] = function(x, time, b, c, d)
            {
                return c * bezier(coOrdArray[0], coOrdArray[1], coOrdArray[2], coOrdArray[3])(time / d) + b;
            };
        }
        return encodedFuncName;
    }});
}


/**
 * jQuery Tween Driver
 *
 * @mixes Common, TweenCommon, ControlsPro, TweenPro
 *
 */
Tw.registerDriver('jquery', 'tween', function() {
    Common.call(this);
    TweenCommon.call(this);
    ControlsPro.call(this);
    TweenPro.call(this);

    this._driverTimeUnit = 'ms';

    this._emulatedPlayhead = true;
    this._emulatedFrom = true;
    this._emulatedLoop = true;
    this._emulatedDelay = true;
    this._emulatedLoop = true;
    this._emulatedBegin = false;
    this._emulatedProgress = false;
    this._allowMultipleEasing = true;
    this._allowTransform = false;


    this._propertyMap = {
        x: 'left',
        y: 'top'
    };


    // handle position properties in a custom way
    this._getProperty = function(target, style, name)
    {
        if(style[name] !== void 0)
        {
            var value = style[name];
            if(inArray(['left', 'top', 'right', 'bottom'], name) !== -1 && (value === '' || value === 'auto'))
            {
                value = target.position()[name];
            }

            return [name, value];
        }

        return getProperty(style, name);
    };


    /**
     * Fetch current values before starting
     *
     * @param {object} target
     * @param {object} tween
     */
    this._getCurrentValues = function(target, tween)
    {
        var item = target.get(0), name, value, property, prop, style = window.getComputedStyle(item);

        for(name in tween)
        {
            property = this._getProperty(target, style, name);
            if(property[0] != name)
            {
                tween[property[0]] = tween[name];
                delete tween[name];
                name = property[0];
            }
            value = property[1];

            if(value !== void 0)
            {
                prop = tween[property[0]];
                prop.pre = value;
                if(!this._hasEnd)
                {
                    prop.end = value;
                    if(this._hasThen && prop.then === null)
                    {
                        prop.then = value;
                    }
                }
                this._hasPre = true;
            }
        }
    };


    /**
     * return a callback used as jquery step event handler. It saves style values during _setTween()
     *
     * @param {object} tween
     * @param {boolean} fetchBegin
     * @param {boolean} fetchEnd
     * @returns {function}
     */
    this._setFetch = function(tween, fetchBegin, fetchEnd)
    {
        var self = this;
        return function(now, fx) {
            if(fx.prop in tween)
            {
                var prop = tween[fx.prop];
                var unit = isNumber(fx.end)? fx.unit : '';
                if(fetchBegin)
                {
                    prop.begin = fx.end + unit;
                    if(fetchEnd)
                    {
                        prop.end = prop.pre = fx.start + unit;
                        if(self._hasThen && prop.then === null)
                        {
                            prop.then = prop.end;
                        }
                        self._endReady = true;
                    }
                    else
                    {
                        prop.pre = fx.start + unit;
                        if(prop.end === null)
                        {
                            prop.end = fx.end + unit;
                        }
                    }
                    self._hasPre = true;
                }
                else
                {
                    prop.then = fx.end + unit;
                    if(prop.end === null)
                    {
                        prop.end = fx.start + unit;
                    }
                    if(prop.begin === null)
                    {
                        prop.begin = prop.end;
                    }
                    if(self._hasPre && prop.pre === null)
                    {
                        prop.pre = self._hasEnd? prop.begin : prop.end;
                    }
                }
            }
        };

    };


    /**
     * return a callback used as jquery step event handler. It saves style values during _playTween()
     *
     * @param {object} tween
     * @returns {function}
     */
    this._playFetch = function(tween)
    {
        var self = this;
        return function(now, fx)
        {
            if(fx.prop in tween)
            {
                var prop = tween[fx.prop];
                var unit = isNumber(fx.end)? fx.unit : '';
                prop.end = fx.end + unit;

                if(self._hasThen && prop.then === null)
                {
                    prop.then = prop.end;
                }
                if(!self._beginReady || prop.begin === null)
                {
                    prop.begin = fx.start + unit;
                }
                if(self._duration)
                {
                    fx.end = fx.start;
                    fx.now = fx.start;
                }

            }
        };
    };


    /**
     * Set css values instantly
     *
     * @param {string} field - 'begin' | 'end' | 'pre' | 'then'
     */
    this._setTween = function(field)
    {
        var tween, target, i, end, values,
            fetchBegin = (field == 'begin' && this._hasBegin && !this._beginReady),
            fetchThen = !fetchBegin && (field == 'then' && this._hasThen && !this._thenReady),
            fetchEnd = fetchBegin && !this._hasEnd,
            fetch = fetchBegin || fetchThen;

        for(i = 0, end = this._target.length; i < end; i++)
        {
            tween = this._data.tween[i];
            target = this._target.eq(i);

            if(fetchBegin)
            {
                this._getCurrentValues(target, tween);
            }

            values = this._getTweenValues(tween, field, true);
            if(fetch)
            {
                target.animate(values, {
                    duration: 0,
                    step: this._setFetch(tween, fetchBegin, fetchEnd)
                });
            }
            else
            {
                target.css(values);
            }
        }

        if(field == 'begin')
        {
            this._beginReady = true;
        }
        else if(field == 'then')
        {
            this._thenReady = true;
        }

        return this;
    };


    /**
     * Execute the effective tween
     *
     */
    this._playTween = function()
    {
        var data = this._data,
            field = this._localFwd? 'end' : 'begin',
            self = this, tween, target, values, prePlay = false, options,
            onStart = function() { self._runHandlers('_begin'); },
            onComplete = function() { self._runHandlers('_end'); },
            onProgress = function() { self._runHandlers('progress'); };


        if(!this._endReady)
        {
            prePlay = true;
            for(i = 0, end = this._target.length; i < end; i++)
            {
                tween = this._data.tween[i];
                target = this._target.eq(i);
                values = this._getTweenValues(tween, field, true);
                options = {
                    duration: 0,
                    step: this._playFetch(tween)
                };

                if(i == (end - 1) && !this._duration)
                {
                    options.start = onStart;
                    options.complete = onComplete;
                }

                target.animate(values, options);
            }
            this._beginReady = true;
            this._endReady = true;
        }


        if(this._duration || !prePlay)
        {
            for(var i = 0, end = this._target.length; i < end; i++)
            {
                values = this._getTweenValues(data.tween[i], field, false);
                options = {
                    duration: data.realDuration,
                    queue: 'queue_' + this._id
                };
                if(data.duration)
                {
                    options.easing = this._getRealEasing(data.easing);
                }

                if(i == end - 1)
                {
                    options.start = onStart;
                    options.complete = onComplete;
                    if(this._hasHandlers('progress'))
                    {
                        options.progress =  onProgress;
                    }
                }
                this._target.eq(i).animate(values, options);
            }
            this._target.dequeue('queue_' + this._id);
        }
    };



    /**
     * Pause a running tween
     *
     */
    this._pauseTween = function()
    {
        this._target.stop('queue_' + this._id, true);
    };



    this._resumeTween = function()
    {
        return this._playTween();
    };



    this._getBezierEasing = function(value)
    {
        return $.tweeneBezier(value);
    };

});



/**
 * jQuery Timeline Driver
 *
 * @mixes Common, TimelineCommon, ControlsPro, TimelinePro
 *
 */
Tw.registerDriver('jquery', 'timeline', function() {
    Common.call(this);
    TimelineCommon.call(this);
    ControlsPro.call(this);
    TimelinePro.call(this);

    this._driverTimeUnit = 'ms';

});

Tw.defaultTimeUnit = 'ms';
Tw.defaultDriver = 'jquery';
