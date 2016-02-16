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
 * Create a Label object, used internally by timelines when you add a label
 * @class
 *
 * @param {string} name
 */
var Label = function(name)
{
    this.type = 'label';
    this._id = name;
    this._name = name;
    this._position = null;


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
     * Get/Set the time position inside the parent timeline
     *
     * @param {number} [value]
     * @returns {this}
     */
    this.position = function(value)
    {
        if(value === void 0)
        {
            return this._position;
        }
        this._position = value;
        return this;
    };

};
