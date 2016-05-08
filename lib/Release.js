'use strict';

let DefaultErrorFactory = require('./DefaultErrorFactory');
let DefaultLogger = require('./DefaultLogger');
let Git = require('./Git');
let Start = require('./phases/Start');
let Publish = require('./phases/Publish');
let Finish = require('./phases/Finish');

const DEFAULT_OPTIONS = {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0'
};

class Release {
  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.options = options;
    this.phases = {
      start: new Start(),
      publish: new Publish(),
      finish: new Finish()
    };

    this.errorFactory = new DefaultErrorFactory();
    this.logger = new DefaultLogger(options);
    this.git = new Git(options);
  }

  start() {
    return this.phases.start.run(this);
  }

  publish() {
    return this.phases.publish.run(this);
  }

  finish() {
    return this.phases.finish.run(this);
  }

  full() {
    return Promise.resolve()
      .then(this.start.bind(this))
      .then(this.publish.bind(this))
      .then(this.finish.bind(this));
  }

  error() {
    return this.errorFactory.create.apply(this.errorFactory, arguments);
  }
}

module.exports = Release;
