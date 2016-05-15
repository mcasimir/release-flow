'use strict';

class Sequence extends Array {
  constructor() {
    super();
  }

  run(args) {
    args = args || {};
    return this.reduce((acc, curr) => {
      return acc.then(function() {
        let promise;

        try {
          promise = curr instanceof Sequence ?
            curr.run(args) :
            Promise.resolve(curr(args));
        } catch (e) {
          promise = Promise.reject(e);
        }

        return promise;
      });

    }, Promise.resolve(args));
  }
}

module.exports = Sequence;
