'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _desc, _value, _class;

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

var Finish = (_dec = (0, _Phase2.Step)(), _dec2 = (0, _Phase2.Step)(), _dec3 = (0, _Phase2.Step)(), _dec4 = (0, _Phase2.Step)(), _dec5 = (0, _Phase2.Step)(), _dec6 = (0, _Phase2.Step)(), _dec7 = (0, _Phase2.Step)(), _dec8 = (0, _Phase2.Step)(), (_class = function (_Phase) {
  _inherits(Finish, _Phase);

  function Finish() {
    _classCallCheck(this, Finish);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Finish).apply(this, arguments));
  }

  _createClass(Finish, [{
    key: 'fetch',
    value: function fetch(release) {
      release.logger.debug('fetching tags and heads');
      try {
        release.git.fetchHeadsAndTags();
      } catch (e) {
        throw release.error('Unable to fetch tags and heads');
      }
    }
  }, {
    key: 'getReleaseInfo',
    value: function getReleaseInfo(release) {
      release.branchName = release.git.getCurrentBranch();
      release.name = release.branchName.slice(release.options.releaseBranchPrefix.length);
      release.tagName = '' + release.options.tagPrefix + release.name;
    }
  }, {
    key: 'validateReleaseBranch',
    value: function validateReleaseBranch(release) {
      var currentBranch = release.git.getCurrentBranch();
      if (!currentBranch.startsWith(release.options.releaseBranchPrefix)) {
        throw release.error('You can only finish a release from a release branch');
      }

      if (release.git.hasUntrackedChanges()) {
        throw release.error('You have untracked changes');
      }

      if (release.git.hasUnpushedCommits()) {
        throw release.error('You have unpushed changes');
      }
    }
  }, {
    key: 'checkoutProduction',
    value: function checkoutProduction(release) {
      release.git.checkout(release.options.productionBranch);
    }
  }, {
    key: 'validateProductionBranch',
    value: function validateProductionBranch(release) {
      if (release.git.hasUntrackedChanges()) {
        throw release.error('You have untracked changes');
      }

      if (release.git.hasUnpushedCommits()) {
        throw release.error('You have unpushed changes');
      }
    }
  }, {
    key: 'mergeToProduction',
    value: function mergeToProduction(release) {
      release.git.merge(release.branchName);
      release.git.pushRef(release.options.productionBranch);
    }
  }, {
    key: 'tagProduction',
    value: function tagProduction(release) {
      release.git.tag(release.tagName);
      release.git.pushRef(release.tagName);
    }
  }, {
    key: 'mergeBackToDevelopment',
    value: function mergeBackToDevelopment(release) {
      if (release.options.developmentBranch !== release.options.productionBranch) {

        release.git.checkout(release.options.developmentBranch);
        release.git.merge(release.branchName);
        release.git.pushRef(release.options.developmentBranch);
      }
    }
  }]);

  return Finish;
}(_Phase3.default), (_applyDecoratedDescriptor(_class.prototype, 'fetch', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getReleaseInfo', [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, 'getReleaseInfo'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'validateReleaseBranch', [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, 'validateReleaseBranch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'checkoutProduction', [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, 'checkoutProduction'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'validateProductionBranch', [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, 'validateProductionBranch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'mergeToProduction', [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, 'mergeToProduction'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'tagProduction', [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, 'tagProduction'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'mergeBackToDevelopment', [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, 'mergeBackToDevelopment'), _class.prototype)), _class));
exports.default = Finish;