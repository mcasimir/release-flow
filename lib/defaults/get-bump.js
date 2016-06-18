'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (commits) {
  var bump = 'patch';
  commits.forEach(function (commit) {
    if (commit.breaking) {
      bump = 'major';
    } else if (commit.type === 'feat' && bump === 'patch') {
      bump = 'minor';
    }
  });
  return bump;
};