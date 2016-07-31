"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChangelogEntry = function () {
  function ChangelogEntry(subject) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, ChangelogEntry);

    this.subject = subject;
    this.scope = options.scope;
    this.subjectLink = options.subjectLink;
    this.links = options.links || [];
    this.children = [];
  }

  _createClass(ChangelogEntry, [{
    key: "addLink",
    value: function addLink(name, url) {
      this.links.push({ name: name, url: url });
    }
  }, {
    key: "addChild",
    value: function addChild(child) {
      this.children.push(child);
    }
  }, {
    key: "isLeaf",
    value: function isLeaf() {
      return !this.children.length;
    }
  }, {
    key: "traverse",
    value: function traverse(previsit, postvisit) {
      if (previsit) {
        previsit(this);
      }
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].traverse(previsit, postvisit);
      }
      if (postvisit) {
        postvisit(this);
      }
    }
  }]);

  return ChangelogEntry;
}();

exports.default = ChangelogEntry;