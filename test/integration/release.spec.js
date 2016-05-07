'use strict';

let Release = require('..');

let release = new Release();

Release.registerPlugin('gulp', function(release, options) {
  let gulp = require('gulp');
  let namespace = options.namespace || 'release';

  gulp.task(`${namespace}:start`, function() {
    return release.start();
  });

  gulp.task(`${namespace}:publish`, function() {
    return release.publish();
  });

  gulp.task(`${namespace}:finish`, function() {
    return release.finish();
  });

  gulp.task(`${namespace}:commits`, function() {
    return release.getCommits()
      .then(console.log);
  });

  gulp.task(`${namespace}:preview`, function() {
    return release.getChanges()
      .then(console.log);
  });
});

Release.registerPlugin('jira', function(release, options) {
  release.before('start:changelog:write', function jira(args) {
    let regex = new RegExp(`\\b${options.project}-\\d+\\b`, 'g');
    args.changelog = args.changelog.replace(regex, `[$1](${options.url}/boards/$1)`);
  });
});

Release.registerPlugin('npm', function(release, options) {
  release.before('start:commit', function npm(args) {
    let regex = new RegExp(`\\b${options.project}-\\d+\\b`, 'g');
    args.changelog = args.changelog.replace(regex, `[$1](${options.url}/boards/$1)`);
  });
});

release.plugin('gulp', {
  namespace: 'release'
});

release.plugin('jira', {
  url: 'http://jira.example.com',
  project: 'CE'
});

release.plugin('npm');

release.start();
