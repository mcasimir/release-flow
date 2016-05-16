'use strict';

let DefaultErrorFactory = require('./DefaultErrorFactory');
let DefaultLogger = require('./DefaultLogger');
let Git = require('./Git');
let Start = require('./phases/Start');
let Publish = require('./phases/Publish');
let Finish = require('./phases/Finish');
let pathResolve = require('path').resolve;

const DEFAULT_OPTIONS = {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0',
  repoHttpUrl: null,
  changelogPath: pathResolve(process.cwd(), 'CHANGELOG.md'),
  repoHttpProtocol: 'https',
  getBump: require('./defaults/get-bump.js'),
  changelogTemplate: require('./defaults/changelog-template.js'),
  plugins: []
};

class Release {

  static get plugins() {
    this._plugins = this._plugins || {};
    return this._plugins;
  }

  static registerPlugin(name, fn) {
    this.plugins[name] = fn;
  }

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

    (options.plugins || []).forEach((plugin) => {
      this.plugin(plugin);
    });
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

  plugin(fnOrString, options) {
    options = options || {};
    if (typeof fnOrString === 'function') {
      fnOrString(this, options);
    } else {
      Release.plugins[fnOrString](this, options);
    }
  }
}

module.exports = Release;
