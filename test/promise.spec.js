
const expect = require('chai').expect;
const Promise = require('../promise');
const interval = 10;

describe('Promise', () => {
    it('should be a promise object', () => {
        const promise = new Promise(() => {});
        expect(promise.toString()).to.equal('[object Promise]');
    });

    it('should be make promise does work', (done) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(100);
            }, interval);
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

    it('should be extract subpromise and get same result', (done) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(100);
            }, interval);
        });

        promise.then((rs) => {
            return rs * 10;
        }).then((res) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(2 * res + 100);
                }, interval);
            }).then((result) => {
                return `The result you want is ${result / 100}`;
            });
        }).then((result) => {
            expect(result).to.equal('The result you want is 21');
            done();
        });
    });
});
