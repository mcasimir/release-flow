'use strict';

class Sequence extends Array {
  constructor() {
    super();
  }

  run(args) {
    args = args || {};
    return this.phases.reduce((acc, curr) => {
      let promise;

      try {
        promise = curr instanceof Sequence ?
          curr.run(args) :
          Promise.resove(curr(args));
      } catch (e) {
        promise = Promise.reject(e);
      }

      return acc.then(function() {
        return promise;
      });

    }, Promise.resolve(args));
  }
}

module.exports = Sequence;
