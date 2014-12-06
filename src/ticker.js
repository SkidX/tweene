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
 * Ticker object used to emulate delay, progress callbacks, async calls.
 * It uses RequestAnimationFrame when available, with fallback to setTimeout.
 * We instantiate a single Ticker in Tweene.ticker
 * @class
 * 
 */      
var Ticker = function()
{
    var _lastTime = 0;    
    var _callbacks = [];
    
    this.now = Date.now || function() 
    {
        return new Date().getTime();
    };
    
    var _now = this.now;
    
    /*
     *  Polyfill taken here: https://gist.github.com/paulirish/1579671
     *  
     * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
     * MIT license    
     *  
     */
    var _requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame || 
        
        function(callback) 
        {
            var currTime = _now();
            var timeToCall = Math.max(0, 16 - (currTime - _lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            _lastTime = currTime + timeToCall;
            return id;
        };
        


    var _tick = function()
    {
        var now = _now();
        var i = 0;
        while(i < _callbacks.length)
        {
            var entry = _callbacks[i];
            var call = (!entry.time || now - entry.now - entry.time >= 0);
            if(call && entry.time)
            {
                // remove expired callback
                _callbacks.splice(i, 1);
            }
            else
            {
                i++;
            }
            if(call)
            {
                entry.callback.apply(entry.scope, entry.params);
            }
        }
        // ticker is turned off when the callbacks list is empty
        if(_callbacks.length)
        {
            _requestAnimationFrame(_tick);
        }
    };


    /**
     * Register a callback 
     * 
     * @param {number} time - Timeout in ms. When = 0, the function will be called on each tick and need to be unregistered manually
     * @param {string} id - unique identifier of the registered callback
     * @param {function} callback
     * @param {object} [scope] scope used as 'this' inside the callback
     * @param {array} [params] params to be passed to the callback on execution
     * @returns {this}
     */
    this.addCallback = function(time, id, callback, scope, params)
    {
        this.removeCallback(id);        
        _callbacks.push({now: _now(), time: time, id: id, callback: callback, scope: scope || this, params: params || []});
        
        // turn on ticker if it is the first callback in queue 
        if(_callbacks.length == 1)
        {
            _requestAnimationFrame(_tick);
        }
        return this;
    };        


    /**
     * Unregister a callback. Callbacks registered with a positive timeout, commonly do not need to be unregistered manually, 
     * the ticker unregister them after automatically after their execution.
     * 
     * @param {string} id - unique identifier of the registered callback
     * @returns {this}
     */
    this.removeCallback = function(id)
    {
        for(var i = 0, end = _callbacks.length; i < end; i++)
        {
            if(_callbacks[i].id == id)
            {
                _callbacks.splice(i, 1);            
                break;
            }
        }
        return this;
    };        
    
};
  
  
Tw.ticker = new Ticker();  
