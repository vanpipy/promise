
var Promise = (function() {
    'use strict';

    const N = null;
    const PromiseType = '[object Promise]';

    const stages = { pending: 0, fulfilled: 1, rejected: 2, };

    var count = 0;

    function noop (v) { return v; }

    function assert (variable, typeWanted) {
        if (typeof variable != typeWanted) {
            throw `${typeWanted} needed`;
        }
    }

    function makeWarn (content) {
        console.warn(content);
    }

    function makeError (content) {
        console.error(content);
    }

    function isPromise (context) {
        return context && context.toString() == PromiseType;
    }

    function isPrimaryPromise (context) {
        return isPromise(context) && context.primary;
    }

    function callbackRunner (context, callback) {
        assert(callback, 'function');

        callback((value) => {
            context.resolve(value);
        }, (reason) => {
            context.reject(reason);
        });
    }

    function doResolve (context, start, value) {
        if (start >= context.tasks.length) return;

        let next = context.tasks[start];

        try {
            value = next._onFulfilled(value);
            if (waitingNextResolution(start, context, value)) return;
        } catch (error) {
            context.stage = stages.rejected;
            context.reason = error;
            return;
        }

        if (isPromise(next)) {
            doResolve(context, start + 1, value);
        }
    }

    function waitingNextResolution (pauseIndex, previous, next) {
        if (isPrimaryPromise(next)) {
            inheritSecondaryPromise(pauseIndex, previous, next);
            return 1;
        }
        return 0;
    }

    function inheritSecondaryPromise (secondaryIndex, previous, next) {
        while (secondaryIndex + 1 < previous.tasks.length) {
            next.tasks.push(previous.tasks[secondaryIndex + 1]);
            secondaryIndex += 1;
        }
    }

    function doReject (context, reason) {
        makeError(reason);
    }

    /*
     * There are many promise generated, but only two kinds here is.
     * 1. Primary Promise.
     * 2. Secondary Promise - it come from the thenable function.
     * All of promise [1,2] will be generated by Promise constructor.
     * It's important to separate the type of promise to primary and secondary,
     * cause when we talk about the promise tries to run, it's a promise chain and
     * run like this -- `promise > then > then > promise > then`.
     * So imagining there is a primary processor which represents Promise chain.
     * Promise chain will called as the order of tasks and every processor have
     * only one primary Promise, once another primary Promise processor got, replaces
     * previous one and concat unused secondary Promise.
     *
     * Simple summary:
     * 1. Promise processor.
     * 2. Promise processor has only one primary Promise or Promise chain.
     * 3. Another primary Promise appear Promise processor, replaces the previous primary Promise
     *      and inherits unused secondary from previous Promise.
     * 4. Only primary Promise has tasks attribute;
     *
     * In fact, it's not standard promiseA+, just an expository promise pattern in javascript.
     * It does work and make me to believe that it's true about promise pattern in javascript.
     */
    function Promise (fn) {
        const ctx = this;

        ctx.$id = count++;

        ctx.value = N;
        ctx.exception = N;
        ctx.reason = N;

        ctx._onFulfilled = noop;
        ctx._onRejected = noop;

        ctx.stage = stages.pending;

        if (fn != noop) {
            ctx.tasks = [];
            ctx.primary = true;
        } else {
            ctx.secondary = true;
        }

        callbackRunner(ctx, fn);
    }

    Promise.prototype.toString = () => PromiseType;

    Promise.prototype.resolve = function (value) {
        doResolve(this, 0, value);
    };

    Promise.prototype.reject = function (reason) {
        doReject(this, reason);
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
        const next = new Promise(noop);

        if (typeof onFulfilled == 'function') {
            next._onFulfilled = onFulfilled;
        }

        if (typeof onRejected == 'function') {
            next._onRejected = onRejected;
        }

        this.tasks.push(next);

        return this;
    };

    return Promise;
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
}

