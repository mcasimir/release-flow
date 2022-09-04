import Git from "./Git";
import Start from "./phases/Start";
import Publish from "./phases/Publish";
import Finish from "./phases/Finish";
import defaults from "./defaults";

export default class Release {
  static plugins = {};

  static registerPlugin(name, fn) {
    this.plugins[name] = fn;
  }

  constructor(options) {
    options = Object.assign({}, defaults, options);
    this.options = options;
    this.phases = {
      start: new Start(),
      publish: new Publish(),
      finish: new Finish(),
    };

    this.logger = new options.Logger({ logLevel: options.logLevel });
    this.errorFactory = new options.ErrorFactory();
    this.git = new Git(options);

    for (let plugin of options.plugins) {
      this.plugin(plugin);
    }
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

  async full() {
    await this.start();
    await this.publish();
    await this.finish();
  }

  error(...args) {
    return this.errorFactory.createError(...args);
  }

  plugin(fnOrString) {
    if (typeof fnOrString === "function") {
      fnOrString(this);
    } else {
      Release.plugins[fnOrString](this);
    }
  }
}
