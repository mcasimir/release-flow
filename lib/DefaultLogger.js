'use strict';

let chalk = require('chalk');

const LEVELS = {
  'error': 0,
  'warn': 1,
  'info': 2,
  'debug': 3
};

const COLORS = {
  'error': 'red',
  'warn': 'yellow',
  'info': 'white',
  'debug': 'gray'
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

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  log(level, message, metadata) {
    if (LEVELS[this.level] >= LEVELS[level]) {
      let args = [chalk.styles[COLORS[level]].open + chalk.bold(`${level}:`), `${message}` + chalk.styles[COLORS[level]].close, metadata];
      if (metadata === null || metadata === undefined) {
        args.pop();
      }
      console.log.apply(console, args);
    }
  }
}

module.exports = DefaultLogger;
