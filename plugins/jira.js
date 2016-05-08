'use strict';

module.exports = function(release, options) {
  release.phases.start.before('commit', function npm(release) {
    let regex = new RegExp(`\\b${options.project}-\\d+\\b`, 'g');
    release.changelog = release.changelog.replace(regex, `[$1](${options.url}/boards/$1)`);
  });
};
