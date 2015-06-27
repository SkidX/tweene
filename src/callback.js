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
 * Create a Callback object, used internally by timelines when you add callbacks calls
 * @class
 * 
 * @param {function} callback
 * @param {object} scope
 * @param {array} params
 * @param {number} dir - values: 1 | -1 | 0
 */
var Callback = function(callback, scope, params, dir, isPause)
{
    this.type = 'callback';    
    // unique id
    this._id = ++ Tw._idCounter;
    
    this.isPause = !!isPause;
    
    dir = dir === 1? true : (dir === -1? false : null);
    var parent = null;
            
    /**
     * Get or set the parent timeline object
     * 
     * @param {object} [value] - parent object
     * @returns {object|this}
     */
    this.parent = function(value)
    {
        if(!value)
        {
            return parent;
        }
        parent = value;
        return this;                
    };
    
    
    /**
     * Return the unique identifier
     * 
     * @returns {number} 
     */
    this.id = function()
    {
        return this._id;
    };
    
    
    /**
     * Duration of a callback inside a timeline is always 0, this is needed because internally they are handled as tweens
     * 
     * @returns {number}
     */
    this.totalDuration = function()
    {
        return 0;
    };
    
        
    /**
     * Execute the callback if the parent's direction is coherent with the callback's dir value
     * 
     * @returns {this}
     */
    this.resume = function()
    {
        if(callback && (dir === null || dir != parent.reversed()))
        {
            callback.apply(scope || parent, params);
        }
        return this;
    };
    
    
    
};

