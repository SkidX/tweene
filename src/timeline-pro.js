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
 * Vars and methods used in timeline object, for animation library that does not have native support for timelines
 * @mixin
 *
 */
var TimelinePro = function()
{
    this._emulatedPlayhead = true;

    this._emulatedBegin = true;

    this._emulatedProgress = true;

    this._runningList = {};

    this._runningCount = 0;

    this._keyframes = {};

    this._index = [];

    this._childrenList = [];

    this._backKeyframes = {};

    this._backIndex = [];

    this._backEnabled = true;

    this._keyTime = null;
    this._keyDirection = null;
    this._keyCurrentIndex = null;



    /**
     * Cascade a method call to the children that are currently running
     *
     * @param {string} method
     * @returns {this}
     */
    this._propagate = function(method)
    {
        var args = toArray(arguments, 1);
        for(var id in this._runningList)
        {
            this._runningList[id][method].apply(this._runningList[id], args);
        }
        return this;
    };


    /**
     * Cascade a method call to the all the children, regardless their running status
     *
     * @param {string} method
     * @returns {this}
     */
    this._propagateToAll = function(method)
    {
        var args = toArray(arguments, 1);
        for(var i = 0, end = this._childrenList.length; i < end; i++)
        {
            this._childrenList[i][method].apply(this._childrenList[i], args);
        }
        return this;
    };


    /**
     * Perform internal tasks needed before starting the timeline
     *
     * @returns {number} - Returns the timeline total duration
     */
    this.prepare = function()
    {
        if(this._ready)
        {
            return this;
        }

        var sortInt = function(a, b){
            return a - b;
        };

        this._reset();

        if(this._emulatedProgress)
        {
            this
                .setCoreHandler('end', '_progress', this._stopProgress, this, [])
                .setCoreHandler('reverse', '_progress', this._stopProgress, this, []);
        }

        this._mergeChildren();
        this._index.sort(sortInt);

        // empty timeline
        if(!this._index.length)
        {
            this._ready = true;
            return this;
        }

        var i = 1;
        var firstTime = this._index[0];
        // if the first child does not start at 0, add a dummy to fill to gap
        if(firstTime !== 0)
        {
            // prevent the push of 0 at the end of index, because index is already sorted
            this._keyframes[0] = {f: [], b: [], fTrigger: null, bTrigger: null};
            this._addDummy(0, firstTime);
            this._keyframes[0].bTrigger = null;
            this._index.unshift(0);
            i++;
        }

        // add dummies to fill the gaps between real children, in both directions, so the timeline will work like a queues tree
        var time, keyframe, j;
        for(var len = this._index.length - 1; i < len; i++)
        {
            time = this._index[i];
            keyframe = this._keyframes[time];
            if(!keyframe.bTrigger)
            {
                j = i - 1;
                while(j > 0 && !this._keyframes[this._index[j]].bTrigger)
                {
                    j--;
                }
                this._addDummy(this._index[j], time);
            }
            if(!keyframe.fTrigger)
            {
                j = i + 1;
                while(j < this._index.length - 2 && !this._keyframes[this._index[j]].fTrigger)
                {
                    j++;
                }
                this._addDummy(time, this._index[j]);
            }
        }

        this._backIndex.sort(sortInt);
        this._ready = true;
        return this._getTotalDuration();
    };


    /**
     * Push child to the top level timeline in order to build a sorted index needed for restarting all the tweens in the right order
     *
     * @param {object} tween
     * @param {number} begin
     * @param {number} end
     * @param {number} offset
     * @returns {this}
     */
    this.pushUp = function(tween, begin, end, offset)
    {
        if(this._parent)
        {
            this._parent.pushUp(tween, begin + offset, end + offset, 0);
        }
        else
        {
            if(tween.type == 'tween')
            {
                tween.offset(begin + offset);
            }
        }

        // add to backIndex
        this._addToIndex(tween, begin, end, false, false, true);
        return this;
    };


    /**
     * Reset internal indexes and properties, needed by invalidate()
     *
     */
    this._reset = function()
    {
        this._offset = 0;
        this._cursor = null;
        this._keyframes = {};
        this._index = [];
        this._backKeyframes = {};
        this._backIndex = [];
    };


    /**
     * Add a dummy child. Dummies are needed to fill gaps between real children.
     * Dummy reverse and end events will trigger the start for other children
     *
     * @param {number} begin
     * @param {number} end
     */
    this._addDummy = function(begin, end)
    {
        var dummy = this._getDummy();
        var res = this._addToIndex(dummy, begin, end, true, true, false);
        this.pushUp(dummy, begin, end);
        dummy
            .parent(this)
            .duration(end - begin)
            .setCoreHandler('reverse', 'timeline', this._childCallback, this, ['b', begin, dummy.id(), res[0]])
            .setCoreHandler('end', 'timeline', this._childCallback, this, ['f', end, dummy.id(), res[1]]);

        this._childrenList.push(dummy);
    };


    /**
     * Save a children to index or backIndex. Indexes are needed to start and reset tweens in the right order
     *
     * @param {object} tween - dummy, tween or timeline object
     * @param {number} begin
     * @param {number} end
     * @param {boolean} fTriggering - forward triggering, true when this child is suitable for triggering next children with its end event
     * @param {boolean} bTriggering - backward triggering, true when this child is suitable for triggering previous children with its reverse event
     * @param {boolean} useBack - true = store data in backIndex
     * @returns {array}
     */
    this._addToIndex = function(tween, begin, end, fTriggering, bTriggering, useBack)
    {
        var keyframes, index, firstBegin, firstEnd;
        if(useBack)
        {
            keyframes = this._backKeyframes;
            index = this._backIndex;
        }
        else
        {
            keyframes = this._keyframes;
            index = this._index;
        }

        if(!(begin in keyframes))
        {
            keyframes[begin] = {f: [], b: [], fc: [], bc: [], fTrigger: null, bTrigger: null};
            index.push(begin);
        }
        if(tween.type == 'callback')
        {
            keyframes[begin].fc.push(tween);
        }
        else
        {
            keyframes[begin].f.push(tween);
        }
        // use only one child for each keyframe trigger in forward direction
        firstBegin = fTriggering && !this._keyframes[begin].fTrigger;
        if(firstBegin)
        {
            keyframes[begin].fTrigger = tween;
        }

        if(end != Infinity)
        {
            if(!(end in keyframes))
            {
                keyframes[end] = {f: [], b: [], fc: [], bc: [], fTrigger: null, bTrigger: null};
                index.push(end);
            }
            if(tween.type == 'callback')
            {
                keyframes[end].bc.push(tween);
            }
            else
            {
                keyframes[end].b.push(tween);
            }
            // use only one child for each keyframe trigger in backward direction
            firstEnd = bTriggering && !this._keyframes[end].bTrigger;
            if(firstEnd)
            {
                keyframes[end].bTrigger = tween;
            }
        }

        return [firstBegin, firstEnd];
    };


    /**
     * Available for drivers that need to perform extra operation with labels
     *
     * @param {object} child - Label object
     * @param {number} begin - label position inside the timeline
     */
    this._mergeLabel = function(child, begin)
    {
        // nop
    };


    /**
     * Merge tweens and timelines inside their parent timeline
     *
     * @param {object} child - tween or timeline
     * @param {number} begin
     * @param {number} end
     */
    this._mergeTweenable = function(child, begin, end)
    {
        this._childrenList.push(child);
        this._mergeElement(child, begin, end, true);
    };


    /**
     * Merge callbacks inside their parent timeline
     *
     * @param {object} child - Callback object
     * @param {number} begin
     * @param {number} end
     */
    this._mergeCallback = function(child, begin, end)
    {
        this._mergeElement(child, begin, end, false);
    };


    /**
     * Finalize the merging of tweens, timelines and callbacks
     *
     * @param {object} child
     * @param {number} begin
     * @param {number} end
     * @param {boolean} tweenable - true for tweens and timelines
     * @returns {undefined}
     */
    this._mergeElement = function(child, begin, end, tweenable)
    {
        // trigger will be true only for tweenable children with positive duration (callbacks have end = begin)
        var trigger = end > begin;
        var res = this._addToIndex(child, begin, end, trigger, trigger, false);

        if(tweenable)
        {
            this.pushUp(child, begin, end, this._offset);

            child.setCoreHandler('reverse', 'timeline', this._childCallback, this, ['b', begin, child.id(), res[0]]);
            if(end != Infinity)
            {
                child.setCoreHandler('end', 'timeline', this._childCallback, this, ['f', end, child.id(), res[1]]);
            }
        }
    };


    /**
     * Called by each child on reverse and end events. Used for update runningList and trigger the start of other previous or next children
     *
     * @param {string} direction - 'b' = backward | 'f' = forward
     * @param {number} time
     * @param {number} id - unique identifier of the child
     * @param {boolean} isKeyChild - true when the child is enabled to trigger the start of other children
     */
    this._childCallback = function(direction, time, id, isKeyChild)
    {
        // remove from runningList
        if(id in this._runningList)
        {
            delete this._runningList[id];
            this._runningCount--;
        }

        if(isKeyChild)
        {
            if(time in this._keyframes)
            {
                this._processKeyframe(time, direction, null);
            }
        }
    };



    this._processKeyframe = function(time, direction, currentIndex)
    {
        this._keyCurrentIndex = null;

        var cDirection = direction + 'c', cList = this._keyframes[time][cDirection], tList = this._keyframes[time][direction],
            i, end, offset, item, paused = false;

        if(cList.length)
        {
            if(direction == 'f')
            {
                i = currentIndex !== null? currentIndex + 1 : 0;
                end = cList.length;
                offset = 1;
            }
            else
            {
                i = currentIndex !== null? currentIndex - 1 : cList.length - 1;
                end = -1;
                offset = -1;
            }

            for(; i != end; i += offset)
            {
                item = cList[i];
                if(item.isPause)
                {
                    paused = true;
                    this._keyTime = time;
                    this._keyDirection = direction;
                    this._keyCurrentIndex = i;
                    this.pause();
                }

                // also callback are executed by resume()
                item.resume();
                if(paused)
                {
                    break;
                }
            }
        }

        if(!paused)
        {
            if(tList.length)
            {
                for(i = 0, end = tList.length; i < end; i++)
                {
                    item = tList[i];
                    this._addToRun(item);
                    item.resume();
                }
            }
            // emulate end / reverse events
            if((direction == 'b' && time === 0) || (direction == 'f' && time == this._index[this._index.length - 1]))
            {
                this._runHandlers('_end');
            }
        }

        return paused;
    };


    /**
     * Called on first timeline start
     *
     * @returns {this}
     */
    this._run = function()
    {
        this._running = true;
        this._delayDummy = null;

        if(this._emulatedBegin && this._hasHandlers('_begin'))
        {
            this._runHandlers('_begin');
        }

        this._startTime = Tw.ticker.now();
        this._playTween();

        return this;
    };


    /**
     * trigger the start of the first keyframe
     *
     */
    this._playTween = function()
    {
        this._childCallback('f', 0, -1, true);
    };


    /**
     * propagate pause to the running children
     *
     */
    this._pauseTween = function()
    {
        this._propagate('pause');
    };


    /**
     * if running, propagate resume to running children, else trigger first or last keyframe accordingly with current direction
     */
    this._resumeTween = function()
    {
        var runningCount = this._runningCount, paused = false;
        this._startProgress();

        if(this._keyCurrentIndex !== null)
        {
            this._keyDirection = this._localFwd? 'f' : 'b';
            paused = this._processKeyframe(this._keyTime, this._keyDirection, this._keyCurrentIndex);
        }

        if(!paused)
        {
            if(runningCount)
            {
                this._propagate('resume');
            }
            else
            {
                var args = false, direction = this._localFwd;

                if(direction && this._position === 0)
                {
                    args = ['f', 0, -1, true];
                }
                else if(!direction && this._position == this._duration)
                {
                    args = ['b', this._index.length? this._index[this._index.length - 1] : 0, -1, true];
                }

                if(args)
                {
                    this._childCallback.apply(this, args);
                }
            }
        }
    };


    /**
     * Go to final or start position resetting also the children, accordingly with current direction
     *
     */
    this._backTween = function()
    {
        // clear running List
        this._runningList = {};
        this._runningCount = 0;

        // timeline disable back in nested timelines when going back
        if(!this._backEnabled)
        {
            return;
        }
        var i, end, inc, type, elemList, time;

        // reset tweens in reverse order, in order to restore all the style properties correctly
        if(this._localFwd)
        {
            i = this._backIndex.length - 1;
            end = -1;
            inc = -1;
            type = 'f';
        }
        else
        {
            i = 0;
            end = this._backIndex.length;
            inc = 1;
            type = 'b';
        }


        for(; i != end; i += inc)
        {
            time = this._backIndex[i];
            elemList = this._backKeyframes[time][type];
            for(var j = elemList.length - 1; j >= 0; j--)
            {
                var child = elemList[j];
                // disable back in children timelines
                child._backEnabled = false;
                child.pause().back();
                child._backEnabled = true;
            }
        }
    };


    /**
     * Add child to runningList
     *
     * @param {object} child
     * @returns {this}
     */
    this._addToRun = function(child)
    {
        if(child.totalDuration())
        {
            var id = child.id();
            // avoid multiple wrong increments of runningCount
            if(!(id in this._runningList))
            {
                this._runningCount ++;
                this._runningList[id] = child;
            }
        }
        return this;
    };


    /**
     * Remove child from runningList
     *
     * @param {object} child
     * @returns {this}
     */
    this._removeFromRun = function(child)
    {
        var id = child.id();
        // avoid multiple wrong decrements of runningCount
        if(id in this._runningList)
        {
            this._runningCount --;
            delete this._runningList[id];
        }
        return this;
    };
};
