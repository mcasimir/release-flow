'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Release = (_temp = _class = function () {
  _createClass(Release, null, [{
    key: 'registerPlugin',
    value: function registerPlugin(name, fn) {
      this.plugins[name] = fn;
    }
  }]);

  function Release(options) {
    _classCallCheck(this, Release);

    options = Object.assign({}, _defaults2.default, options);
    this.options = options;
    this.phases = {
      start: new _Start2.default(),
      publish: new _Publish2.default(),
      finish: new _Finish2.default()
    };

    this.logger = new options.Logger({ logLevel: options.logLevel });
    this.errorFactory = new options.ErrorFactory();
    this.git = new _Git2.default(options);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var plugin = _step.value;

        this.plugin(plugin);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
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
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.start();

              case 2:
                _context.next = 4;
                return this.publish();

              case 4:
                _context.next = 6;
                return this.finish();

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function full() {
        return _ref.apply(this, arguments);
      }

      return full;
    }()
  }, {
    key: 'error',
    value: function error() {
      var _errorFactory;

      return (_errorFactory = this.errorFactory).createError.apply(_errorFactory, arguments);
    }
  }, {
    key: 'plugin',
    value: function plugin(fnOrString) {
      if (typeof fnOrString === 'function') {
        fnOrString(this);
      } else {
        Release.plugins[fnOrString](this);
      }
    }
  }]);

  return Release;
}(), _class.plugins = {}, _temp);
exports.default = Release;