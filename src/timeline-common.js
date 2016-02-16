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
 * Vars and methods common to every timeline object, whatever is the driver used
 * @mixin
 *
 */
var TimelineCommon = function()
{
    this.type = 'timeline';

    this._offset = 0;

    this._children = [];

    this._cursor = null;

    this._labels = {};


    /**
     * Add tweens, timelines, callbacks and labels to current timeline object
     * @link http://tweene.com/docs/#timelineAdd
     * @link http://tweene.com/docs/#nestedTimelines
     * @link http://tweene.com/docs/#directionalCallbacks
     * @link http://tweene.com/docs/#labels
     *
     * @param {string|object|number} child - number is accepted only when adding directional callback
     * @param {string|number} [startPosition]
     * @returns {this}
     */
    this.add = function(child, startPosition)
    {
        // adding a label
        if(isString(child))
        {
            // label needs to start with an alphabetic character and cannot contains arithmetic symbols specified in the regexp here
            if(child.search(/^[a-z][^\+\-=]*$/) != -1)
            {
                child = new Label(child);
                this._labels[child.id()] = child;
            }
            else
            {
                throw 'The label "' + child +'" contains invalid symbols';
            }
        }
        else
        {
            // adding a callback or directional callback
            if(isFunction(child) || (isNumber(child) && isFunction(startPosition)))
            {
                var dir = 0, i = 0;
                // when a number is passed as first arg, it is a directional callback and we need to shift left the other params
                if(isNumber(child))
                {
                    dir = child;
                    child = startPosition;
                    startPosition = arguments[2] || null;
                    i = 1;
                }
                i = i + 2;
                // params expected after the callback
                var params = arguments.length > i? (isArray(arguments[i])? arguments[i] : [arguments[i]]) : [];
                i ++;
                // callback scope object expected after callback params
                var scope = arguments.length > i? arguments[i] : null;
                child = new Callback(child, scope, params, dir, false);
            }

            child.parent(this);
        }

        if(startPosition === void 0)
        {
            startPosition = null;
        }

        this._children.push({id: child.id(), child: child, start: startPosition});
        this.invalidate();
        return this;
    };


    /**
     * Add pause, with an optional callback
     * @link http://tweene.com/docs/#addPause
     *
     * @param {string|number} [startPosition]
     * @param {string|number} [callbackDirection]
     * @param {function} [callback] - callback
     * @param {array} [params] - callback params
     * @param {object} [scope] - callback scope
     * @returns {this}
     */
    this.addPause = function()
    {
        var args = toArray(arguments),
            startPosition = null,
            dir = 0,
            callback = null,
            params = [],
            scope = null,
            arg,
            child;

        if(args.length)
        {
            arg = args.shift();
            if(isFunction(arg))
            {
                callback = arg;
            }
            else
            {
                startPosition = arg;
            }

            if(args.length)
            {
                arg = args.shift();
                if(!callback)
                {
                    if(isNumber(arg))
                    {
                        dir = arg;
                        if(args.length)
                        {
                            callback = args.shift();
                        }
                    }
                    else
                    {
                        callback = arg;
                    }
                }

                if(callback && args.length)
                {
                    params = args.shift();
                    if(!isArray(params))
                    {
                        params = [params];
                    }

                    if(args.length)
                    {
                        scope = args.shift();
                    }
                }
            }
        }

        child = new Callback(callback, scope, params, dir, true);
        child.parent(this);
        this._children.push({id: child.id(), child: child, start: startPosition});
        this.invalidate();
        return this;
    };



    /**
     * Create a tween and execute a previously registered macro on it
     * If the timeline has not a target specified, it expects a target as first param.
     * It expects a position as second (or first) param, all other params are passed to the tween exec() method
     *
     * @returns {this}
     */
    this.exec = function()
    {
        var args = toArray(arguments);
        if(args.length)
        {
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            var pos = args.length > 1?  args.splice(1, 1)[0] : null;
            this.add(tween, pos);
            tween.exec.apply(tween, args);
        }
        return this;
    };

    /**
     * Schedule a tween with duration = 0
     * @link http://tweene.com/docs/#timelineSet
     *
     * @returns {this}
     */
    this.set = function()
    {
        var args = toArray(arguments);
        if(args.length)
        {
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            if(args.length)
            {
                var values = args.shift();
                var pos = args.length? args.shift() : null;
                tween._to = values;
                tween.duration(0);
                this.add(tween, pos);
            }
        }
        return this;
    };


    /**
     * Shortcut for .add(Tweene.get().to())
     * @link http://tweene.com/docs/#timelineTo
     *
     * @returns {this}
     */
    this.to = function()
    {
        return this._tweenMethod(arguments, false, true);
    };


    /**
     * Shortcut for .add(Tweene.get().fromTo())
     * @link http://tweene.com/docs/#timelineFromTo
     *
     * @returns {this}
     */
    this.fromTo = function()
    {
        return this._tweenMethod(arguments, true, true);
    };


    /**
     * Shortcut for .add(Tweene.get().from())
     * @link http://tweene.com/docs/#timelineFrom
     *
     * @returns {this}
     */
    this.from = function()
    {
        return this._tweenMethod(arguments, true, false);
    };


    /**
     * used internally for setting child timeline time position inside the parent
     *
     * @param {number} value
     * @returns {this}
     */
    this.offset = function(value)
    {
        this._offset = value;
        return this;
    };


    /**
     * Timeline need to process its children just before starting or when you ask for duration. See implementation in TimelinePro or
     * in specific drivers
     *
     * @returns {this}
     */
    this.prepare = function()
    {
        if(this._ready)
        {
            return this;
        }

        this._reset();
        this._mergeChildren();
        this.ready = true;
        return this;
    };


    /**
     * Perform all the common actions needed by .to(), .from() and .fromTo()
     *
     * @param {arguments} args
     * @param {boolean} from
     * @param {boolean} to
     * @returns {this}
     */
    this._tweenMethod = function(args, from, to)
    {
        args = toArray(args);
        if(args.length)
        {
            // use first argument as target if the timeline does not have a global target set
            var target = this._target? this._target : args.shift();
            var tween = Tw.get(target, this.driverName);
            var pos = tween.parseArguments(args, from, to, true);
            this.add(tween, pos);
        }
        return this;
    };


    /**
     * Process all the children added evaluating their actual time position inside the timeline
     *
     * @returns {this}
     */
    this._mergeChildren = function()
    {
        if(this._ready)
        {
            return this;
        }

        // cursor will contains the end of the last processed child, while duration holds the overall end of the timeline
        this._cursor = this._duration = 0;

        var child, begin, end, start, childDelay, tweenable;
        for(var i = 0, len = this._children.length; i < len; i++)
        {
            child = this._children[i].child;
            start = this._children[i].start;

            tweenable = child.type == 'timeline' || child.type == 'tween';

            if(tweenable)
            {
                // if the child has a delay, remove it from the child and use it as a start offset inside the timeline
                childDelay = this._parseTime(child.delay());
                if(childDelay)
                {
                    this._cursor += childDelay;
                    this._duration += childDelay;
                    child.delay(0);
                }
            }

            // evaluate actual start position
            begin = this._getStartPosition(this._duration, this._cursor, start);

            if(child.type == 'label')
            {
                child.position(begin);
                this._mergeLabel(child, begin);
                continue;
            }

            if(tweenable)
            {
                if(child.type == 'timeline')
                {
                    child.offset(this._offset + begin);
                }
                // prepare() returns totalDuration
                end = begin + child.prepare();
                this._mergeTweenable(child, begin, end);
            }
            else
            {
                // callbacks have duration = 0
                end = begin;
                this._mergeCallback(child, begin, end);
            }

            // an infinite loop in a child tween or timeline results in its duration = Infinity
            if(end != Infinity)
            {
                this._cursor = end;
                if(this._cursor > this._duration)
                {
                    this._duration = this._cursor;
                }
            }
            else
            {
                this._cursor = this._duration = Infinity;
            }
        }
        return this;
    };


    /**
     * Evaluate actual time position of a child inside a timeline
     *
     * @param {number} currentDuration
     * @param {number} currentCursor - end of the previously processed child
     * @param {string|number} startPosition
     *
     * @returns {number}
     */
    this._getStartPosition = function(currentDuration, currentCursor, startPosition)
    {
        // by default, add to the end of the timeline, obtaining a queue of not-overlapping tweens
        if(startPosition === null)
        {
            return currentDuration;
        }
        var start = currentDuration, pos, sign = 0, toCursor = false;
        if(isString(startPosition))
        {
            // parts:
            //  1 - label
            //  2 - relative operator, +=, ++=, -=, --=
            //  3 - time value, number or string with 's' or 'ms' suffix
            var parts = startPosition.match(/^([a-z][^\+\-=]*)?(?:(\+{1,2}|\-{1,2})=)?([^\+\-=]+)?$/i);
            if(parts === null)
            {
                return currentDuration;
            }

            pos = parts[3] !== void 0? this._parseTime(parts[3]) : 0;

            if(parts[2] !== void 0)
            {
                toCursor = parts[2].length == 2;
                sign = parts[2].substr(0, 1) == '-'? -1 : 1;
            }

            if(parts[1] !== void 0 && parts[1] in this._labels)
            {
                start = this._labels[parts[1]].position();
                if(!sign)
                {
                    pos = 0;
                    sign = 1;
                }
            }
            else
            {
                if(sign)
                {
                    start = toCursor? currentCursor: currentDuration;
                }
                else
                {
                    start = 0;
                    sign = 1;
                }
            }
        }
        else
        {
            start = 0;
            sign = 1;
            pos = this._parseTime(startPosition);
        }

        if(start == Infinity)
        {
            return Infinity;
        }

        // cannot add child in negative positions, fallback to 0
        return Math.max(0, start + (pos * sign));
    };

};
