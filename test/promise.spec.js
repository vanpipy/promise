
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

        promise
            .then((result) => {
                return result * 2;
            })
            .then((result) => {
                expect(result).to.equal(200);
                done();
            });
    });

    it('should be reject in next promise', (done) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(100);
            }, 500);
        });

        const next = promise.then((result) => {
            throw 'error';
        });

        setTimeout(() => {
            expect(next.reason).to.equal('error');
            done();
        }, 1000);
    });
});
