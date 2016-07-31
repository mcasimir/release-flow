"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DefaultErrorFactory = function () {
  function DefaultErrorFactory() {
    _classCallCheck(this, DefaultErrorFactory);
  }

  _createClass(DefaultErrorFactory, [{
    key: "createError",
    value: function createError(message) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var error = new Error(message);
      Object.assign(error, data);
      return error;
    }
  }]);

  return DefaultErrorFactory;
}();

exports.default = DefaultErrorFactory;