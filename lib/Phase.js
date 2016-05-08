'use strict';

let Sequence = require('./Sequence');

class Phase extends Sequence {
  constructor() {
    this.steps = new Sequence();
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
}

module.exports = Phase;
