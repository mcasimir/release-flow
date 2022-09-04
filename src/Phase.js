import Sequence from "./Sequence";

export default class Phase {
  constructor() {
    this.steps = this.constructor.steps || new Sequence();
  }

  step(step) {
    this.steps.push(step);
  }

  before(stepName, callback) {
    let idx = this.steps.findIndex(function (step) {
      return step.name === stepName;
    });

    if (idx !== -1) {
      this.steps.splice(idx, 0, callback);
    }
  }

  replace(stepName, callback) {
    let idx = this.steps.findIndex(function (step) {
      return step.name === stepName;
    });

    if (idx !== -1) {
      this.steps.splice(idx, 1, callback);
    }
  }

  run(...args) {
    return this.steps.run(...args);
  }
}

export { default as Step } from "./Step";
