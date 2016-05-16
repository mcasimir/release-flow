'use strict';

let Release = require('./lib/Release');

require('./plugins/bump-package-json')(Release);

module.exports = Release;
