export default class Sequence extends Array {
  run(args) {
    args = args || {};
    return this.reduce((acc, curr) => {
      return acc.then(function () {
        let promise;

        try {
          promise =
            curr.run instanceof Function
              ? curr.run(args)
              : Promise.resolve(curr(args));
        } catch (e) {
          promise = Promise.reject(e);
        }

        return promise;
      });
    }, Promise.resolve(args));
  }
}
