'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _desc, _value, _class;

var _Phase2 = require('../Phase');

var _Phase3 = _interopRequireDefault(_Phase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Publish = (_dec = (0, _Phase2.Step)(), _dec2 = (0, _Phase2.Step)(), (_class = function (_Phase) {
  _inherits(Publish, _Phase);

  function Publish() {
    _classCallCheck(this, Publish);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Publish).apply(this, arguments));
  }

  _createClass(Publish, [{
    key: 'validate',
    value: function validate(release) {
      var currentBranch = release.git.getCurrentBranch();
      if (!currentBranch.startsWith(release.options.releaseBranchPrefix)) {
        throw release.error('You can only publish a release from a release branch');
      }

      if (release.git.hasUntrackedChanges()) {
        throw release.error('You have untracked changes');
      }
    }
  }, {
    key: 'push',
    value: function push(release) {
      release.git.pushRef(release.git.getCurrentBranch());
    }
  }]);

  return Publish;
}(_Phase3.default), (_applyDecoratedDescriptor(_class.prototype, 'validate', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'validate'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'push', [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, 'push'), _class.prototype)), _class));
exports.default = Publish;