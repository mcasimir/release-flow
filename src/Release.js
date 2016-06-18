import DefaultErrorFactory from './DefaultErrorFactory';
import DefaultLogger from './DefaultLogger';
import Git from './Git';
import Start from './phases/Start';
import Publish from './phases/Publish';
import Finish from './phases/Finish';
import defaults from './defaults';

export default class Release {

  static get plugins() {
    this._plugins = this._plugins || {};
    return this._plugins;
  }

  static registerPlugin(name, fn) {
    this.plugins[name] = fn;
  }

  constructor(options) {
    options = Object.assign({}, defaults, options);
    this.options = options;
    this.phases = {
      start: new Start(),
      publish: new Publish(),
      finish: new Finish()
    };

    this.errorFactory = new DefaultErrorFactory();
    this.logger = new DefaultLogger(options);
    this.git = new Git(options);

    (options.plugins || []).forEach(plugin => {
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

  plugin(fnOrString, options = {}) {
    if (typeof fnOrString === 'function') {
      fnOrString(this, options);
    } else {
      Release.plugins[fnOrString](this, options);
    }
  }
}
