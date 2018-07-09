
// const { curry, compose } = require('compose-parallel');

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

function errorCatcher (done) {
    try {
        done();
    } catch (error) {
        throw error;
    }
}

function makeWarning (content) {
    console.warn(content);
}

function callbackRunner (context, callback) {
    assert(callback, 'function');

    callback((value) => {
        context.resolve(value);
    }, (reason) => {
        context.reject(reason);
    });
}

function doResolve (context) {
    let value;

    context.stage = stages.fulfilled;
    const next = context.next;

    try {
        value = context._onFulfilled(context.value);
    } catch (error) {
        context.stage = stages.rejected;
        context.reason = error;
    }

    if (next && next.toString() == PromiseType) {
        next.stage = context.stage;
        next.value = value;

        if (context.reason || context.stage == stages.rejected) {
            next.reason = context.reason;
            makeWarning(next.reason);

            return;
        }

        doResolve(next);
    }
}

/*
 * 1. The value.
 * 2. Task queue.
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

    callbackRunner(ctx, fn);
}

Promise.prototype.toString = () => PromiseType;

Promise.prototype.resolve = function (value) {
    //TODO: Unfold the input
    this.value = value;

    doResolve(this, value);
};

Promise.prototype.reject = function (reason) {
    this.reason = reason;

    this.stage = stages.rejected;
};

Promise.prototype.then = function (onFulfilled, onRejected) {
    if (typeof onFulfilled == 'function') {
        this._onFulfilled = onFulfilled;
    }

    if (typeof onRejected == 'function') {
        this._onRejected = onRejected;
    }

    this.next = new Promise(noop);

    return this.next;
};

module.exports = Promise;
