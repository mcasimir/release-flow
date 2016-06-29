export default class Sequence {

  constructor() {
    this._runnables = [];
  }

  run(args) {
    args = args || {};
    return this._runnables.reduce((acc, curr) => {
      return acc.then(function() {
        let promise;

        try {
          promise = curr.run instanceof Function ?
            curr.run(args) :
            Promise.resolve(curr(args));
        } catch (e) {
          promise = Promise.reject(e);
        }

        return promise;
      });

    }, Promise.resolve(args));
  }

  push(runnable) {
    this._runnables.push(runnable);
  }

}
