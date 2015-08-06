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
 * Vars and methods common to tween and timeline, for animation library that does not have native support
 * for playhead control (play / pause / reverse and so on)
 * @mixin
 *
 */
var ControlsPro = function()
{
    this._time = null;

    this._startTime = 0;

    this._pauseTime = 0;

    this._position = 0;

    this._paused = true;

    this._running = false;

    this._delayDummy = null;

    this._emulatedProgress = false;

    this._emulatedBegin = false;

    this._playAllowed = true;

    this._reverseAllowed = false;


    /**
     * play() and reverse() acts on both global and local direction (_fwd and _localFwd properties), while the change
     * in direction performed during a yoyo loop changes only local direction
     *
     * @param {boolean} value
     * @returns {this}
     */
    this.setDir = function(value)
    {
        this._fwd = value;
        this.setLocalDir(value);
        return this;

    };

    /**
     * Change the actual local direction of the animation
     *
     * @param {boolean} value
     * @returns {this}
     */
    this.setLocalDir = function(value)
    {
        this._localFwd = value;
        // change direction of the delay too
        if(this._delayDummy)
        {
            this._delayDummy.setDir(value);
        }
        // when changing direction of a timeline, the change cascades to children
        if(this.type != 'tween')
        {
            this._propagateToAll('setDir', value);
        }
        return this;
    };


    /**
     * Swap the global direction, from forward to backward or vice versa
     *
     * @returns {this}
     */
    this.swapDir = function()
    {
        this._fwd = !this._fwd;
        this.swapLocalDir();
        return this;
    };


    /**
     * Swap the actual local direction, from forward to backward or vice versa
     *
     * @returns {this}
     */
    this.swapLocalDir = function()
    {
        this._localFwd = !this._localFwd;
        if(this._delayDummy)
        {
            this._delayDummy.swapDir();
        }
        if(this.type != 'tween')
        {
            this._propagateToAll('swapDir');
        }
        return this;
    };


    /**
     * Override Common.play()
     *
     */
    this.play = function()
    {
        // play not allowed when the current playhead position is at the end of the duration
        if(this._playAllowed)
        {
            this._reverseAllowed = true;
            if(!this._fwd)
            {
                this.pause();
                this.swapDir();
            }
            this.resume();
        }
        return this;
    };


    /**
     * Override Common.reverse()
     *
     */
    this.reverse = function()
    {
        // reverse is not allowed when the playhead position is equal to 0 (begin of the current animation)
        if(this._reverseAllowed)
        {
            this._playAllowed = true;
            if(this._fwd)
            {
                this.pause();
                this.swapDir();
            }
            this.resume();
        }
        return this;
    };


    /**
     * Override Common.pause()
     *
     */
    this.pause = function()
    {
//        console.log(this._id, 'pause');
        // if not ready, it means that is not yet started, so no need to perform a pause
        if(this._ready)
        {
            // stop progress ticker, if present
            this._stopProgress();

            // propagate pause to delay, if present
            if(this._delayDummy)
            {
                this._delayDummy.pause();
                this._paused = true;
                return this;
            }

            if(!this._paused)
            {
//                console.log(this._id, 'pausing');
                this._paused = true;

                this._pauseTime = Tw.ticker.now();
                // evaluate pause position on playhead
                this._position += (this._pauseTime - this._startTime) * this.getRealSpeed() * (this._localFwd? 1 : -1);

                this._pauseTween();
            }
        }
        return this;
    };


    /**
     * Override Common.resume()
     *
     */
    this.resume = function()
    {
//        if(this._parent && this._parent.paused())
//        {
//            return this;
//        }
//        console.log(this._id, 'resume', (this._parent && this._parent.paused()? 'parent paused': 'parent running'));
        if(this._paused && (this._fwd && this._playAllowed || !this._fwd && this._reverseAllowed))
        {
            this._paused = false;
            this.prepare();

            // propagate resume to delay, if present
            if(this._delayDummy)
            {
                this._delayDummy.resume();
                return this;
            }

            // evaluate remaining duration, accordingly with current position, direction and speed
            if(this.type != 'timeline')
            {
                var duration = this._localFwd? this._duration - this._position : this._position;
                this._data.duration = convertTime(duration, this._coreTimeUnit, this._driverTimeUnit);
                this._data.realDuration = this._data.duration / this.getRealSpeed();
            }
            this._startTime = Tw.ticker.now();

            if(this._duration)
            {
                this._playAllowed = true;
                this._reverseAllowed = true;
            }

            // always true after the very first execution of resume()
            if(this._running)
            {
                if(this._duration)
                {
                    // resume progress ticker, if needed
                    this._startProgress();
                }

                // when the animation library does not have native support for begin callback
                if(this._emulatedBegin && this._hasHandlers('_begin'))
                {
                    this._runHandlers('_begin');
                }

                // at both ends of the tween (begin in forward dir, end in backward dir) perform preTween actions
                if(this.type != 'timeline' && ((this._position === 0 && this._localFwd) || (this._position == this._duration && !this._localFwd)))
                {
                    this._preTween(this._localFwd);
                }
                this._resumeTween();
            }
            else
            {
                this._loopsCount = 0;
                // we need pausable and reversable delay, so we ignore any native support for delay and always emulate it
                if(this._delay)
                {
                    this._emulateDelay(this._delay, this._run);
                }
                else
                {
                    this._run();
                }
            }
        }
        return this;
    };


    /**
     * Override Common.restart()
     *
     */
    this.restart = function()
    {
        if(this._keyCurrentIndex !== null)
        {
            this._keyCurrentIndex = null;
        }

        this.pause();
        this.setDir(true);
        this.back();
        this.resume();
        return this;
    };


    /**
     * Override Common.back()
     *
     */
    this.back = function()
    {
        // reset loop counter accordingly with direction
        if(this._loops)
        {
            if(this._fwd)
            {
                this._loopsCount = 0;
            }
            else
            {
                if(this._loops != -1)
                {
                    this._loopsCount = this._loops + 1;
                }
            }
        }

        if(this._running)
        {
            this._back();
        }
        this._playAllowed = this._fwd;
        this._reverseAllowed = !this._playAllowed;
        return this;
    };


    /**
     * Override Common.speed()
     *
     */
    this.speed = function(value)
    {
        if(value === void 0)
        {
            return this._speed;
        }

        if(!this._running)
        {
            this.invalidate();
        }
        value = parseSpeed(value);

        if(value != this._speed)
        {
            // changing speed in running animations is performed pausing and immediately resuming with the new speed
            var notPaused = !this._paused;
            if(notPaused)
            {
                this.pause();
            }

            this._speed = value;

            if(notPaused)
            {
                this.resume();
            }
        }
        return this;
    };


    /**
     * Calculate current time position, needed only by info methods like time() and progress()
     *
     * @returns {number}
     */
    this._getPosition = function()
    {
        if(this._time !== null)
        {
            return this._time;
        }
        if(this._paused)
        {
            return this._position;
        }
        var now = Tw.ticker.now();
        return Math.max(0, this._position + (now - this._startTime) * this.getRealSpeed() * (this._localFwd? 1 : -1));
    };


    /**
     * Calculate the current percent progress, as a value between 0 and 1
     *
     * @returns {number}
     */
    this._getProgress = function()
    {
        return Math.max(0, Math.min(1, this._getPosition() / this._duration));
    };


    /**
     * Get the current running status
     *
     * @returns {boolean}
     */
    this._getPaused = function()
    {
        return this._paused;
    };


    /**
     * Reset the internal playhead position on both ends of animation
     *
     */
    this._resetPosition = function()
    {
        this._paused = true;
        this._position = this._localFwd? this._duration : 0;
        this._startTime = this._pauseTime = 0;
    };


    /**
     * Used to emulate a progress / update callback when the driver lacks native support for it
     *
     */
    this._startProgress = function()
    {
        if(this._emulatedProgress && this._hasHandlers('progress'))
        {
            // passing 0 as first param, it will fire until it is manually removed
            Tw.ticker.addCallback(0, this._id + '_progress', this._runHandlers, this, ['progress']);
        }
    };


    /**
     * Used to emulate a progress / update callback when the driver lacks native support for it
     *
     */
    this._stopProgress = function()
    {
        if(this._emulatedProgress && this._hasHandlers('progress'))
        {
            Tw.ticker.removeCallback(this._id + '_progress');
        }
    };


    /**
     * Internal method used to restart the animation in both directions.
     *
     */
    this._restart = function()
    {
        this._delayDummy = null;
        this.pause();
        this._back();
        this.resume();
    };


    /**
     * Used in loop or manual restart, it reset data and animation to the begin (or end) state accordingly to direction
     *
     * @returns {this}
     */
    this._back = function()
    {
        this._position = this._localFwd? 0 : this._duration;
        if(this._running)
        {
            this._delayDummy = null;
            var dir = this._localFwd? (this._hasPre && this._offset !== 0? 'pre' : 'begin') : 'end';
            this._backTween(dir);
        }
        return this;
    };


    /**
     * Update loop counter when running in backward direction and restart
     *
     */
    this._loopRev = function()
    {
        this._loopsCount --;
        this._restart();
    };


    /**
     * Update loop counter when running in forward direction and restart
     *
     */
    this._loopFwd = function()
    {
        this._runHandlers('loop');
        if(this._yoyo)
        {
            this.swapLocalDir();
        }
        this._restart();
    };


    /**
     * loop controller, performed on both ends of animation, accordingly with current direction and yoyo property
     *
     */
    this._loopCheck = function()
    {
        this._delayDummy = null;
        if(this._fwd)
        {
            this._loopsCount++;
        }
        else
        {
            if(this._yoyo)
            {
                this.swapLocalDir();
            }
            this._runHandlers('loop');
        }

        if(this._loopsDelay)
        {
            if(!this._fwd && !this._yoyo)
            {
                // delay is executed on final position in order to have a simmetric animation between both directions
                this._back();
            }
            this._emulateDelay(this._loopsDelay, this._loopFwd, this._loopRev);
        }
        else
        {
            if(this._fwd)
            {
                this._loopFwd();
            }
            else
            {
                this._loopRev();
            }
        }
    };



    /**
     * Emulate delay and loopsDelay using a special Dummy Tween
     *
     * @param {number} delay
     * @param {function} callback
     * @param {function} [reverseCallback] - used only in loopsDelay
     */
    this._emulateDelay = function(delay, callback, reverseCallback)
    {
        var dummy = this._delayDummy = this._getDummy()
            .duration(delay)
            .setCoreHandler('end', name, callback, this);

        // only loopsDelay has reverseCallback set
        if(reverseCallback)
        {
            dummy.position(this._fwd? 0 : delay);
            // progress callback is not paused during loops delay
            if(this._emulatedPlayhead && this._hasHandlers('progress'))
            {
                dummy.setCoreHandler('progress', '_progress', this._runHandlers, this, ['progress']);
            }
            dummy.setCoreHandler('reverse', name, reverseCallback, this);
        }

        dummy[this._fwd? 'play' : 'reverse']();
    };


    /**
     * Internal event handler needed to perform actions at the begin of the animation
     */
    this._onTweenBegin = function()
    {
        if(this._position === 0 && this._localFwd)
        {
            // begin event is not raised on loop iterations
            if(this._loopsCount === 0)
            {
                this._runHandlers('begin');
            }
        }
    };


    /**
     * Internal event handler needed to perform actions at the end of the animation
     */
    this._onTweenEnd = function()
    {
        this._resetPosition();

        if(this._localFwd)
        {
            if(this._loopsCount == this._loops)
            {
                if(this.type != 'timeline')
                {
                    this._postTween('end');
                }
                this._playAllowed = false;
                this._time = this._duration;
                this._runHandlers('end');
                this._time = null;
            }
            else if(this._loops !== 0)
            {
                this._loopCheck();
            }
        }
        else
        {
            if(this._loopsCount === 0)
            {
                if(this.type != 'timeline')
                {
                    this._postTween('begin');
                }
                this._reverseAllowed = false;
                this._time = 0;
                this._runHandlers('reverse');
                this._time = null;
            }
            else if(this._loops !== 0)
            {
                this._loopCheck();
            }
        }
    };


    /**
     * Create a Dummy object
     * @see TweeneDummy
     *
     * @returns {object}
     */
    this._getDummy = function()
    {
        // Dummy don't need any target
        return Tw.get(null, 'Dummy');
    };


    // register some internal handlers
    this.setCoreHandler('_begin', '_begin', this._onTweenBegin, this);
    this.setCoreHandler('_end', '_end', this._onTweenEnd, this);

};
