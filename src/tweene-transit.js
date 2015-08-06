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
 * Transit Tween Driver
 *
 * @link http://ricostacruz.com/jquery.transit/ *
 * @mixes Common, TweenCommon, ControlsPro, TweenPro
 *
 */
Tw.registerDriver('transit', 'tween', function() {
    Common.call(this);
    TweenCommon.call(this);
    ControlsPro.call(this);
    TweenPro.call(this);

    this._driverTimeUnit = 'ms';

    this._emulatedPlayhead = true;
    this._emulatedFrom = true;
    this._emulatedDelay = true;
    this._emulatedLoop = true;
    this._emulatedBegin = true;
    this._emulatedProgress = true;
    this._allowTransform = true;
    this._allowMultipleEasing = false;

    this._propertyMap = {
        translateX: 'x',
        translateY: 'y',
        translateZ: 'z',
        rotateZ: 'rotate',
        rotation: 'rotate',
        rotationX: 'rotateX',
        rotationY: 'rotateY',
        rotationZ: 'rotate',
        scaleZ: 'scale'
    };

    // force transitionEnd events
    $.transit.useTransitionEnd = true;

    this._emulatingComplete = false;
    this._currentEasing = null;

    this._styles = [];
    this._firstRun = true;
    this._rotationFixed = false;


    /**
     * Get style objects for a dom target, storing the reference inside an internal cache
     *
     */
    this._getTargetStyle = function(i, useStyle)
    {
        // style are checked in asc order
        if(i >= this._styles.length)
        {
            var target = this._target.get(i);
            this._styles[i] = [window.getComputedStyle(target), target.style];
        }

        return this._styles[i][useStyle? 1 : 0];
    };


    /**
     * CSS Transitions supports natively cubic bezier curves
     *
     * @param {array} value
     * @returns {string}
     */
    this._getBezierEasing = function(value)
    {
        if(this._currentEasing === null)
        {
            this._currentEasing = value;
        }
        return 'cubic-bezier(' + value.join(', ') + ')';
    };


    /**
     * Fetch transform property value directly from Transit
     *
     */
    this._getTransformValue = function(target, name, raw)
    {
        var transform = target.data('transform');
        if(!transform || !(name in transform))
        {
            if(raw)
            {
                return null;
            }
            else
            {
                if(name.indexOf('scale') === 0)
                {
                    name = 'scale';
                }
                else if(name.indexOf('rotate') === 0)
                {
                    name = 'rotate';
                }
            }
        }
        return target.css(name);
    };


    /**
     * Fetch current style properties values and pass them to the given callback
     *
     * @param {object} target
     * @param {object} tween
     * @param {boolean} useStyle
     * @param {function} callback
     *
     */
    this._getCurrentValues = function(target, tween, useStyle, callback)
    {
        var item = target.get(0), name, value, property;
        var style = useStyle? item.style : window.getComputedStyle(item);

        for(name in tween)
        {
            if(tween[name].isTransform)
            {
                value = this._getTransformValue(target, name);
            }
            else
            {
                property = getProperty(style, name);
                // update data in case of browser-prefixed name
                if(property[0] != name)
                {
                    tween[property[0]] = tween[name];
                    delete tween[name];
                    name = property[0];
                }
                value = property[1];
            }

            if(value !== void 0)
            {
                callback.call(this, tween, name, value);
            }
        }
    };


    /**
     * Save pre-start values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string|number} value
     */
    this._fetchBeginPre = function(tween, name, value)
    {
        var prop = tween[name];
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
    };


    /**
     * Save post-start values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string|number} value
     */
    this._fetchBeginPost = function(tween, name, value)
    {
        var prop = tween[name];
        prop.begin = value;
        if(prop.end === null)
        {
            prop.end = value;
            if(this._hasThen && prop.then === null)
            {
                prop.then = value;
            }
        }
    };


    /**
     * Save values after applying 'then' style
     *
     * @param {object} tween
     * @param {string} name
     * @param {string|number} value
     */
    this._fetchThen = function(tween, name, value)
    {
        tween[name].then = value;
    };


    /**
     * Save pre-tween values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string|number} value
     */
    this._fetchPlayPre = function(tween, name, value)
    {
        var prop = tween[name];
        prop.begin = value;

        if(prop.end === null)
        {
            prop.end = value;
        }

        if(this._hasThen && prop.then === null)
        {
            prop.then = value;
        }
    };


    /**
     * Save post-tween values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string|number} value
     */
    this._fetchPlayPost = function(tween, name, value)
    {
        var prop = tween[name];
        prop.end = value;

        if(this._hasThen && prop.then === null)
        {
            prop.then = value;
        }

    };


    /**
     * Set css values instantly
     *
     * @param {string} field - 'begin' | 'end' | 'pre' | 'then'
     */
    this._setTween = function(field)
    {
        var tween, target, i, end;
        for(i = 0, end = this._target.length; i < end; i++)
        {
            tween = this._data.tween[i];
            target = this._target.eq(i);

            if(field == 'begin' && this._hasBegin && !this._beginReady)
            {
                this._getCurrentValues(target, tween, false, this._fetchBeginPre);
            }

            var values = this._getTweenValues(tween, field, true);
            this._target.eq(i).css(values);

            if(field == 'begin' && this._hasBegin && !this._beginReady)
            {
                this._getCurrentValues(target, tween, false, this._fetchBeginPost);
            }
            else if(field == 'then' && this._hasThen && !this._thenReady)
            {
                this._getCurrentValues(target, tween, false, this._fetchThen);
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
            self = this, useTrans = data.duration > 0,
            method = useTrans? 'transition' : 'css',
            field = this._localFwd? 'end' : 'begin',
            name, needRepaint, item, targetStyle, targetComputedStyle, posValue,
            posNames = ['left', 'top', 'right', 'bottom'], pos,
            i, end, j, endj, values, nop,
            onComplete = function(event) {
                //event.stopPropagation();
                //event.preventDefault();
//                if(this == event.target)
//                {
                    self._target.css('transition', 'none');
                    self._runHandlers('_end');
//                    Tw.ticker.addCallback(-1, '-' + self._id, self._runHandlers, self, ['_end']);
//                }
//                else
//                {
//                    console.log('parent!');
//                }
                return false;
            };

        for(i = 0, end = this._target.length; i < end; i++)
        {
            var tween = data.tween[i];
            var target = this._target.eq(i);
            if(!this._beginReady)
            {
                this._getCurrentValues(target, tween, false, this._fetchPlayPre);
            }

            values = this._getTweenValues(tween, field, false);

            // use transitions only if duration > 0
            if(useTrans)
            {
                values.duration = data.realDuration;
                values.queue = false;
                if(data.duration)
                {
                    values.easing = this._getRealEasing(data.easing);
                }

                // on first run there could be a bug when animating left, top, right or bottom that are 'auto', we need to force a repaint
                if(this._firstRun)
                {
                    needRepaint = false;
                    targetStyle = null;
                    targetComputedStyle = null;
                    item = target.get(0);

                    for(j = 0, endj = posNames.length; j < endj; j++)
                    {
                        pos = posNames[j];
                        if(pos in values)
                        {
                            // target style cached while checking all the properties
                            if(!targetStyle)
                            {
                                targetStyle = this._getTargetStyle(i, true);
                                targetComputedStyle = this._getTargetStyle(i, false);
                            }
                            posValue = targetStyle[pos];
                            // if 'auto', use value from jquery position(), else use computed value, then force a repaint
                            if(posValue === '' || posValue === 'auto')
                            {
                                targetStyle[pos] = targetComputedStyle[pos] == 'auto'? target.position()[pos] : targetComputedStyle[pos];
                                needRepaint = true;
                            }
                        }
                    }
                    if(needRepaint)
                    {
                        nop = item.offsetWidth;
                    }

                }
            }
            if(useTrans && i == end - 1)
            {
                // transit complete callback is not passing the event object needed to stop propagation in nested contexts
                // also when display = none, css transitions does not raise complete event
                // we need to emulate the event
                this._emulatingComplete = true;
                Tw.ticker.addCallback(data.realDuration, '-emulate' + this._id, onComplete);
                target.transition(values);
                target.unbind('transitionend');
            }
            else
            {
                target[method](values);
            }

            if(!this._endReady)
            {
                this._getCurrentValues(target, tween, true, this._fetchPlayPost);
            }
        }

        this._firstRun = false;
        this._beginReady = true;
        this._endReady = true;

        // if instant tween, emulate complete event
        if(!useTrans)
        {
            this._runHandlers('_end');
        }

        return this;
    };


    /**
     * Pause a running tween
     *
     */
    this._pauseTween = function()
    {
        var easingFunc = null, transform, transformValues = null, offset, currentOffset,
            timeProgress, valueProgress, beginValue, endValue, current,
            i, end, style, targetStyle, tween, target, name, prop;

        // cancel complete callback
        if(this._emulatingComplete)
        {
            Tw.ticker.removeCallback('-emulate' + this._id);
        }
        this._target.unbind($.support.transitionEnd);

        for(i = 0, end = this._target.length; i < end; i++)
        {
            style = {};
            targetStyle = this._getTargetStyle(i, false);
            tween = this._data.tween[i];
            target = this._target.eq(i);
            for(name in tween)
            {
                prop = tween[name];
                if(prop.isTransform)
                {
                    // fetch current transition values directly from transform matrix, no need for calculation
                    if(name == 'x' || name == 'y' || name == 'z')
                    {
                        if(!transformValues)
                        {
                            transform = getProperty(targetStyle, 'transform')[1];
                            transformValues = transform.substring(transform.indexOf('(') + 1, transform.length - 1).split(/\s*,\s*/);
                            offset = transform.indexOf('matrix3d') === 0? 12 : 4;
                        }
                        currentOffset = offset + (name == 'z'? 2 : (name == 'y'? 1 : 0));
                        style[name] = transformValues[currentOffset];
                    }
                    else
                    {
                        // calculate the current value at current progress, taking easing in consideration
                        if(!easingFunc)
                        {
                            easingFunc = bezier.apply(null, this._currentEasing);
                            timeProgress = this.progress();
                            valueProgress = easingFunc(timeProgress);
                        }
                        beginValue = parseFloat(prop.begin);
                        endValue = parseFloat(prop.end);
                        current = ((endValue - beginValue) * valueProgress) + beginValue;
                        style[name] = current;
                    }
                }
                else
                {
                    // read non-transform properties directly from computed style
                    style[name] = targetStyle[name];
                }
            }
            style[getProperty(targetStyle, 'transition')[0]] = 'none';
            target.css(style);
        }
        return this;
    };



    this._resumeTween = function()
    {
        return this._playTween();
    };


});



/**
 * Transit Timeline Driver
 *
 * @mixes Common, TimelineCommon, ControlsPro, TimelinePro
 *
 */
Tw.registerDriver('transit', 'timeline', function() {
    Common.call(this);
    TimelineCommon.call(this);
    ControlsPro.call(this);
    TimelinePro.call(this);

    this._driverTimeUnit = 'ms';

});

Tw.defaultTimeUnit = 'ms';
Tw.defaultDriver = 'transit';
