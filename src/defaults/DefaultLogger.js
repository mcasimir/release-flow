import chalk from "chalk";

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const COLORS = {
  error: "red",
  warn: "yellow",
  info: "white",
  debug: "gray",
};

const DEFAULT_OPTIONS = {
  logLevel: "info",
};

export default class DefaultLogger {
  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.level = options.logLevel;
    this.console = options.console || console;
  }

  error(message, metadata) {
    this.log("error", message, metadata);
  }

  warn(message, metadata) {
    this.log("warn", message, metadata);
  }

  info(message, metadata) {
    this.log("info", message, metadata);
  }

  debug(message, metadata) {
    this.log("debug", message, metadata);
  }

  log(level, message, metadata) {
    if (LEVELS[this.level] >= LEVELS[level]) {
      let openColor = chalk.styles[COLORS[level]].open;
      let closeColor = chalk.styles[COLORS[level]].close;

      let args = [
        openColor + chalk.bold(`${level}:`) + ` ${message}` + closeColor,
        metadata,
      ];

      if (metadata === null || metadata === undefined) {
        args.pop();
      }

      this.console.log(...args);
    }
  }
}
