'use strict';

let Process = require('./lib/Process');
let Sequence = require('./lib/Sequence');

class Release {
  constructor(options) {
    this.options = options;
    this.phases = {
      start: new Process(),
      publish: new Process(),
      finish: new Process()
    };
  }

  start() {
    return this.phases.start.run({
      options: this.options
    });
  }

  publish() {
    return this.phases.publish.run({
      options: this.options
    });
  }

  finish() {
    return this.phases.finish.run({
      options: this.options
    });
  }

  full() {
    let seq = new Sequence();
    seq.push(this.start.bind(this));
    seq.push(this.publish.bind(this));
    seq.push(this.finish.bind(this));
    return seq.run();
  }
}

module.exports = Release;
