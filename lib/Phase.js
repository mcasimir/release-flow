'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Step = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Step = require('./Step');

Object.defineProperty(exports, 'Step', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Step).default;
  }
});

var _Sequence = require('./Sequence');

var _Sequence2 = _interopRequireDefault(_Sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Phase = function () {
  function Phase() {
    _classCallCheck(this, Phase);

    this.steps = this.constructor.steps || new _Sequence2.default();
  }

  _createClass(Phase, [{
    key: 'step',
    value: function step(_step) {
      this.steps.push(_step);
    }
  }, {
    key: 'before',
    value: function before(step, callback) {
      var idx = this.steps.findIndex(function (fn) {
        return fn.name === step;
      });

      if (idx !== -1) {
        this.steps.splice(idx, 0, callback);
      }
    }
  }, {
    key: 'run',
    value: function run(args) {
      return this.steps.run(args);
    }
  }]);

  return Phase;
}();

exports.default = Phase;