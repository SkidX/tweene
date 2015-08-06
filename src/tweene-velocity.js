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



// needed for scheduling sequences of Tweene.set()
var velocitySetPendings = [];


/**
 * Velocity Tween Driver
 *
 * @link http://julian.com/research/velocity/
 * @mixes Common, TweenCommon, ControlsPro, TweenPro
 *
 */
Tw.registerDriver('velocity', 'tween', function() {
    Common.call(this);
    TweenCommon.call(this);
    ControlsPro.call(this);
    TweenPro.call(this);

    this._driverTimeUnit = 'ms';

    this._emulatedPlayhead = true;
    this._emulatedFrom = true;
    this._emulatedLoop = true;
    this._emulatedDelay = true;
    this._emulatedBegin = false;
    this._emulatedProgress = false;
    this._allowMultipleEasing = true;
    this._allowTransform = true;


    this._propertyMap = {
        x: 'translateX',
        y: 'translateY',
        z: 'translateZ',
        rotation: 'rotateZ',
        rotate: 'rotateZ',
        rotationX: 'rotateX',
        rotationY: 'rotateY',
        rotationZ: 'rotateZ'
    };

    var _css = $.fn.velocity.CSS;
    this._tweenReady = true;
    this._pendings = [];
    this._setPending = false;


    /**
     * Velocity executes also instant tweens async, so we need to handle an internal schedule
     *
     * @param {function} callback
     * @param {array} [params]
     */
    this._addPendingCall = function(callback, params)
    {
        this._pendings.push([callback, params || []]);
    };


    /**
     * Run pending callbacks
     *
     */
    this._processPendings = function()
    {
        for(var i = 0, end = this._pendings.length; i < end; i++)
        {
            this._pendings[i][0].apply(this, this._pendings[i][1]);
        }
        // pending processed could push other calls, so we cannot just empty the whole array
        this._pendings.splice(0, end);
    };


    /**
     * Fetch actual style values from Velocity calls queue, then pass them to a callback
     *
     * @param {object} tween
     * @param {function} callback
     */
    this._getVelocityValues = function(tween, callback)
    {
        var calls = $.fn.velocity.State.calls;
        var name, root, beginValue, endValue, entry = calls[calls.length - 1][0][0];
        for(name in entry)
        {
            if(isObject(entry[name]) && 'startValue' in entry[name])
            {
                // Velocity splits some properties in sub-properties
                root = _css.Hooks.getRoot(name);
                if(!(name in tween))
                {
                    tween[name] = {begin: null, end: null, then: null, easing: root in tween? tween[root].easing : null};
                }
                beginValue = entry[name].startValue + entry[name].unitType;
                endValue = entry[name].endValue + entry[name].unitType;
                callback.call(this, tween, name, root, beginValue, endValue);
            }
        }
    };


    /**
     * Velocity implements bezier internally, we can send directly the array param
     *
     * @param {array} value
     * @returns {array}
     */
    this._getBezierEasing = function(value)
    {
        return value;
    };


    /**
     * Save pre-start values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string} root
     * @param {string|number} begin
     * @param {string|number} end
     */
    this._fetchBegin = function(tween, name, root, begin, end)
    {
        tween[name].begin = end;
        if(this._hasBegin && !this._hasEnd)
        {
            tween[name].end = tween[name].pre = begin;
            if(this._hasThen && tween[name].then === null)
            {
                tween[name].then = begin;
            }
            if(root != name)
            {
                tween[root].begin = tween[root].end = tween[root].then = null;
            }
            this._endReady = true;
        }
        else
        {
            tween[name].pre = begin;
            if(tween[name].end === null)
            {
                tween[name].end = end;
            }
            if(root != name)
            {
                tween[root].begin = null;
            }
        }

    };


    /**
     * Save then values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string} root
     * @param {string|number} begin
     * @param {string|number} end
     */
    this._fetchThen = function(tween, name, root, begin, end)
    {
        tween[name].then = end;
        if(tween[name].end === null)
        {
            tween[name].end = begin;
        }
        if(tween[name].begin === null)
        {
            tween[name].begin = tween[name].end;
        }
        if(this._hasPre && tween[name].pre === null)
        {
            tween[name].pre = this._hasEnd? tween[name].begin : tween[name].end;
        }
        if(root != name)
        {
            tween[root].begin = tween[root].end = tween[root].then = tween[root].pre = null;
        }
    };


    /**
     * Save post-tween values in tween structure
     *
     * @param {object} tween
     * @param {string} name
     * @param {string} root
     * @param {string|number} begin
     * @param {string|number} end
     */
    this._fetchEnd = function(tween, name, root, begin, end)
    {
        tween[name].begin = begin;
        tween[name].end = end;
        if(this._hasPre && tween[name].pre === null)
        {
            tween[name].pre = begin;
        }
        if(this._hasThen && tween[name].then === null)
        {
            tween[name].then = end;
        }
        if(root != name)
        {
            tween[root].begin = tween[root].end = tween[root].pre = tween[root].then = null;
        }
    };


    /**
     * Set css values instantly
     *
     * @param {string} field - 'begin' | 'end' | 'pre' | 'then'
     */
    this._setTween = function(field)
    {
        if(!this._tweenReady)
        {
            this._addPendingCall(this._setTween, [field]);
            return;
        }

        var options, self = this, i, end, tween, values,
            onComplete = function() {
                self._tweenReady = true;
                self._processPendings();
            };

        this._tweenReady = false;
        for(i = 0, end = this._target.length; i < end; i++)
        {
            tween = this._data.tween[i];
            values = this._getTweenValues(this._data.tween[i], field, true);
            options = {duration: 0, queue: false};
            if(i == end - 1)
            {
                options.complete = onComplete;
            }
            this._target.eq(i).velocity(values, options);
            if(field == 'begin' && this._hasBegin && !this._beginReady)
            {
                this._getVelocityValues(tween, this._fetchBegin);
                this._hasPre = true;
            }
            else if(field == 'then' && this._hasThen && !this._thenReady)
            {
                this._getVelocityValues(tween, this._fetchThen);
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
    };


    /**
     * Execute the effective tween
     *
     */
    this._playTween = function()
    {
        if(!this._tweenReady)
        {
            this._addPendingCall(this._playTween);
            return;
        }
        // in Velocity also tweens with duration = 0 are async, so we need to handle a queue in order to allow multiple Tweene.set() to run in the right order
        if(!this._duration)
        {
            if(!this._setPending)
            {
                this._setPending = true;
                velocitySetPendings.push(this);

                this.setCoreHandler('_end', 'setEnd', function() {
                    velocitySetPendings.shift();
                    if(velocitySetPendings.length > 0)
                    {
                        velocitySetPendings[0]._playTween();
                    }
                }, this);

                if(velocitySetPendings.length > 1)
                {
                    return;
                }
            }
        }


        var self = this,
            data = this._data,
            field = this._localFwd? 'end' : 'begin',
            i, end, tween, values, options,  target,
            onBegin = function() { self._runHandlers('_begin'); },
            onComplete = function() { self._runHandlers('_end'); },
            onProgress = function() { self._runHandlers('progress'); };
        for(i = 0, end = this._target.length; i < end; i++)
        {
            tween = data.tween[i];
            target = this._target.eq(i);
            values = this._getTweenValues(tween, field, (data.duration !== 0));
            options = {
                duration: data.realDuration,
                queue: 'tweene_' + this._id
            };

            if(data.duration)
            {
                options.easing = this._getRealEasing(data.easing);
            }

            if(i === end - 1)
            {
                options.begin = onBegin;
                options.complete = onComplete;

                if(this._hasHandlers('progress'))
                {
                    options.progress = onProgress;
                }
            }
            target.velocity(values, options).dequeue('tweene_' + this._id);
            if(!this._endReady)
            {
                this._getVelocityValues(tween, this._fetchEnd);
            }
        }
        this._endReady = true;
        return this;
    };



    /**
     * Pause a running tween
     *
     */
    this._pauseTween = function()
    {
//        console.log('pausing velocity tween');
        this._target.velocity('stop', 'tweene_' + this._id);
//        this._pendings = [];
        return this;
    };



    this._resumeTween = function()
    {
//        console.log('resuming velocity tween');
        return this._playTween();
    };


    // need to handle also this with queue
    this._oldStaticProps = this._setStaticProps;

    this._setStaticProps = function(first, second)
    {
        if(!this._tweenReady)
        {
            this._addPendingCall(this._setStaticProps, [first, second]);
            return;
        }

        this._oldStaticProps(first, second);
    };


});


/**
 * Velocity Timeline Driver
 *
 * @mixes Common, TimelineCommon, ControlsPro, TimelinePro
 *
 */
Tw.registerDriver('velocity', 'timeline', function() {
    Common.call(this);
    TimelineCommon.call(this);
    ControlsPro.call(this);
    TimelinePro.call(this);

    this._driverTimeUnit = 'ms';
});

Tw.defaultTimeUnit = 'ms';
Tw.defaultDriver = 'velocity';
