
const expect = require('chai').expect;
const Promise = require('../promise');

describe('Promise', () => {
    it('should be a promise object', () => {
        const promise = new Promise(() => {});
        expect(promise.toString()).to.equal('[object Promise]');
    });

    it('should be make promise does work', (done) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(100);
            }, 500);
        });

        promise.then((result) => {
            expect(result).to.equal(100);
            done();
        });
    });
});
