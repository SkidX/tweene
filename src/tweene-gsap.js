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
