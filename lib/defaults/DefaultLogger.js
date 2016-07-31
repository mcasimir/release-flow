'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

var COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'white',
  debug: 'gray'
};

var DEFAULT_OPTIONS = {
  logLevel: 'info'
};

var DefaultLogger = function () {
  function DefaultLogger(options) {
    _classCallCheck(this, DefaultLogger);

    options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.level = options.logLevel;
    this.console = options.console || console;
  }

  _createClass(DefaultLogger, [{
    key: 'error',
    value: function error(message, metadata) {
      this.log('error', message, metadata);
    }
  }, {
    key: 'warn',
    value: function warn(message, metadata) {
      this.log('warn', message, metadata);
    }
  }, {
    key: 'info',
    value: function info(message, metadata) {
      this.log('info', message, metadata);
    }
  }, {
    key: 'debug',
    value: function debug(message, metadata) {
      this.log('debug', message, metadata);
    }
  }, {
    key: 'log',
    value: function log(level, message, metadata) {
      if (LEVELS[this.level] >= LEVELS[level]) {
        var _console;

        var openColor = _chalk2.default.styles[COLORS[level]].open;
        var closeColor = _chalk2.default.styles[COLORS[level]].close;

        var args = [openColor + _chalk2.default.bold(level + ':') + (' ' + message) + closeColor, metadata];

        if (metadata === null || metadata === undefined) {
          args.pop();
        }

        (_console = this.console).log.apply(_console, args);
      }
    }
  }]);

  return DefaultLogger;
}();

exports.default = DefaultLogger;