'use strict';

let path = require('path');

module.exports = require('swig')
  .compileFile(path.resolve(__dirname, './changelog.swig'));
