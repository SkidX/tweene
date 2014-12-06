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
 * Dummy tween driver. Dummies are used to emulate delay and to fill time gaps between real tweens inside timelines
 * @class
 * @mixes Common, TweenCommon, ControlsPro, TweenPro
 * 
 * suitable OST https://www.youtube.com/watch?v=GaUqpnHvua8
 * 
 */   
Tw.registerDriver('Dummy', 'tween', function() {
    Common.call(this);
    TweenCommon.call(this);
    ControlsPro.call(this);
    TweenPro.call(this);    

    
    this._driverTimeUnit = 'ms';    
    this._emulatedPlayhead = true;
    this._emulatedProgress = true;
        
    this
        .setCoreHandler('end', 'resetPos', this._resetPosition, this)
        .setCoreHandler('reverse', 'resetPos', this._resetPosition, this)
        .setCoreHandler('end', '_progress', this._stopProgress, this)
        .setCoreHandler('reverse', '_progress', this._stopProgress, this);                

    
    /**
     * nothing to invalidate here
     * 
     * @returns {this}
     */
    this.invalidate = function()
    {
        return this;
    };
    
    
    /**
     * Override ControlsPro.pause()
     * 
     * @returns {this}
     */
    this.pause = function()
    {
        if(!this._paused)
        {
            this._stopProgress();
            // remove callback from ticker queue
            Tw.ticker.removeCallback(this._id);
            this._paused = true;
            this._pauseTime = Tw.ticker.now();
            this._position += (this._pauseTime - this._startTime) * this.getRealSpeed() * (this._localFwd? 1 : -1);
        }
        return this;
    };
    
                        
    /** 
     * Set internal position of dummy
     * 
     * @param {number} value
     * @returns {this}
     */      
    this.position = function(value)
    {
        this._position = value;
        if(value === 0)
        {
            this._playAllowed = true;
        }
        else if(value == this._duration)
        {
            this._reverseAllowed = true;
        }
            
        return this;
    };
    
    
    /**
     * Set dummy duration
     * 
     * @param {number} value
     * @returns {this}
     */
    this.duration = function(value)
    {
        this._duration = value;
        return this;
    };
    
    
    /**
     * Override ControlsPro.resume()
     * 
     * @returns {this}
     */
    this.resume = function()
    {
        if(this._paused)
        {
            this._running = true;
            this._paused = false;            
            var handler = this._localFwd? 'end' : 'reverse';
            
            if(this._localFwd && this._position === 0)
            {
                this._runHandlers('begin');                
            }
            var duration = (this._localFwd? this._duration - this._position : this._position) / this.getRealSpeed();                
            if(!duration)
            {
                this._runHandlers(handler);
            }
            else
            {                
                var params = [duration, this._id, this._runHandlers, this, [handler]];
                this._startTime = Tw.ticker.now();
                // add callback in ticker queue
                Tw.ticker.addCallback.apply(Tw.ticker, params);                
                this._startProgress();
            }
        }
        return this;
    };
    
        
    this._backTween = function() {};    
        
});
      
