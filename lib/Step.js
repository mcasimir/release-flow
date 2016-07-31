'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Step;

var _Sequence = require('./Sequence');

var _Sequence2 = _interopRequireDefault(_Sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Step(name) {
  return function (target, methodName, descriptor) {
    var stepName = name || methodName;
    target.constructor.steps = target.constructor.steps || new _Sequence2.default();

    target.constructor.steps.push({
      name: stepName,
      run: target[methodName].bind(target)
    });

    return descriptor;
  };
}