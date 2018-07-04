
// const { curry, compose } = require('compose-parallel');

const stages = { pending: 0, fulfilled: 1, rejected: 2, };

function noop () {}

/*
 * 1. The value.
 * 2. Task queue.
 */
function Promise (fn) {
    const ctx = this;

    ctx.value = void 0;
    ctx.stage = stages.pending;

    fn(function(value) {
        ctx.resolve(value);
    }, function(reason) {
        ctx.reject(reason);
    });
}

Promise.prototype.toString = () => '[object Promise]';

Promise.prototype.resolve = function (value) {
    //Unfold the input
    this.stage = stages.fulfilled;

    if (this.next) {
        this.next.value = this.onFulfilled(value);
        this.next.resolve(this.next.value);
    }
};

Promise.prototype.reject = function (reason) {

};

Promise.prototype.then = function (onFulfilled, onRejected) {
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
    this.next = new Promise(noop);

    return this.next;
};

module.exports = Promise;
