'use strict';

let Phase = require('../Phase');

class Start extends Phase {
  constructor() {
    super();

    this.step(function fetch(release) {
      release.logger.info('fetching tags and heads');
      release.git.fetchHeadsAndTags();
    });

    this.step(function getPreviousVersion(release) {
      release.logger.debug('finding previous version');
      let lastTagName = release.git.lastTagName();
      if (!lastTagName) {
        release.previousVersion = null;
      } else {
        let versionMatch = lastTagName.match(/\d\.\d\.\d.*/);
        release.previousVersion = versionMatch && versionMatch[0];
      }
    });

    this.step(function getNextVersion(release) {
      if (!release.previousVersion) {
        release.nextVersion = release.options.initialVersion;
      } else {

      }

      let lastTagName = release.git.lastTagName();
      if (!lastTagName) {
        release.previousVersion = null;
      } else {
        let versionMatch = lastTagName.match(/\d\.\d\.\d.*/);
        release.previousVersion = versionMatch && versionMatch[0];
      }
    });

    this.step(function validate(release) {
      if (!release.git.isCurrentBranch(release.options.developmentBranch)) {
        return Promise.reject(release.error(`Current branch should be ${release.options.developmentBranch}`));
      }

      if (release.git.hasUntrackedChanges()) {
        return Promise.reject(release.error(`You have untracked changes.`));
      }

      return Promise.resolve();
    });
  }
}

module.exports = Start;
