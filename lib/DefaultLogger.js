'use strict';

const LEVELS = {
  'error': 0,
  'info': 1,
  'debug': 2
};

const DEFAULT_OPTIONS = {
  logLevel: 'info'
};

class DefaultLogger {
  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.level = options.logLevel;
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  log(level, message, metadata) {
    if (LEVELS[this.level] >= LEVELS[level]) {
      let args = [`${level}:`, message, metadata];
      if (metadata === null || metadata === undefined) {
        args.pop();
      }
      console[level].apply(console, args);
    }
  }
}

module.exports = DefaultLogger;
