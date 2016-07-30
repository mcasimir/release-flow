'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _ChangelogEntry2 = require('ChangelogEntry');

var _ChangelogEntry3 = _interopRequireDefault(_ChangelogEntry2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Changelog = function (_ChangelogEntry) {
  _inherits(Changelog, _ChangelogEntry);

  function Changelog(release) {
    _classCallCheck(this, Changelog);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Changelog).call(this, release.name));

    _this.Entry = _ChangelogEntry3.default;
    return _this;
  }

  return Changelog;
}(_ChangelogEntry3.default);

exports.default = Changelog;