import Sequence from './Sequence';
export {default as Step} from './Step';

export default class Phase {
  constructor() {
    this.steps = this.constructor.steps || new Sequence();
  }

  step(step) {
    this.steps.push(step);
  }

  before(step, callback) {
    let idx = this.steps.findIndex(function(fn) {
      return fn.name === step;
    });

    if (idx !== -1) {
      this.steps.splice(idx, 0, callback);
    }
  }

  run(args) {
    return this.steps.run(args);
  }
}
