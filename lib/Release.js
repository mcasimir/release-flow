'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DefaultErrorFactory = require('./DefaultErrorFactory');

var _DefaultErrorFactory2 = _interopRequireDefault(_DefaultErrorFactory);

var _DefaultLogger = require('./DefaultLogger');

var _DefaultLogger2 = _interopRequireDefault(_DefaultLogger);

var _Git = require('./Git');

var _Git2 = _interopRequireDefault(_Git);

var _Start = require('./phases/Start');

var _Start2 = _interopRequireDefault(_Start);

var _Publish = require('./phases/Publish');

var _Publish2 = _interopRequireDefault(_Publish);

var _Finish = require('./phases/Finish');

var _Finish2 = _interopRequireDefault(_Finish);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Release = function () {
  _createClass(Release, null, [{
    key: 'registerPlugin',
    value: function registerPlugin(name, fn) {
      this.plugins[name] = fn;
    }
  }, {
    key: 'plugins',
    get: function get() {
      this._plugins = this._plugins || {};
      return this._plugins;
    }
  }]);

  function Release(options) {
    var _this = this;

    _classCallCheck(this, Release);

    options = Object.assign({}, _defaults2.default, options);
    this.options = options;
    this.phases = {
      start: new _Start2.default(),
      publish: new _Publish2.default(),
      finish: new _Finish2.default()
    };

    this.errorFactory = new _DefaultErrorFactory2.default();
    this.logger = new _DefaultLogger2.default(options);
    this.git = new _Git2.default(options);

    (options.plugins || []).forEach(function (plugin) {
      _this.plugin(plugin);
    });
  }

  _createClass(Release, [{
    key: 'start',
    value: function start() {
      return this.phases.start.run(this);
    }
  }, {
    key: 'publish',
    value: function publish() {
      return this.phases.publish.run(this);
    }
  }, {
    key: 'finish',
    value: function finish() {
      return this.phases.finish.run(this);
    }
  }, {
    key: 'full',
    value: function full() {
      return Promise.resolve().then(this.start.bind(this)).then(this.publish.bind(this)).then(this.finish.bind(this));
    }
  }, {
    key: 'error',
    value: function error() {
      return this.errorFactory.create.apply(this.errorFactory, arguments);
    }
  }, {
    key: 'plugin',
    value: function plugin(fnOrString) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (typeof fnOrString === 'function') {
        fnOrString(this, options);
      } else {
        Release.plugins[fnOrString](this, options);
      }
    }
  }]);

  return Release;
}();

exports.default = Release;