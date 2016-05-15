'use strict';

let Phase = require('../Phase');
let semver = require('semver');

class Start extends Phase {
  constructor() {
    super();

    this.step(function fetch(release) {
      release.logger.debug('fetching tags and heads');
      try {
        release.git.fetchHeadsAndTags();
      } catch (e) {
        return Promise.reject(release.error(`Unable to fetch tags and heads`));
      }
    });

    // this.step(function validate(release) {
    //   if (!release.git.isCurrentBranch(release.options.developmentBranch)) {
    //     return Promise.reject(release.error(`Current branch should be ${release.options.developmentBranch}`));
    //   }
    //
    //   if (release.git.hasUntrackedChanges()) {
    //     return Promise.reject(release.error(`You have untracked changes`));
    //   }
    //
    //   return Promise.resolve();
    // });

    this.step(function getPreviousVersion(release) {
      release.logger.debug('finding previous version');
      let lastTagName = release.git.lastTagName();
      if (!lastTagName) {
        release.previousVersion = null;
      } else {
        let versionMatch = lastTagName.match(/\d\.\d\.\d.*/);
        release.previousVersion = versionMatch && versionMatch[0];
      }
      release.previous = release.previousVersion && `${release.options.tagPrefix}${release.previousVersion}`;
      release.logger.debug(`previous version was ${release.previousVersion}`);
    });

    this.step(function getCommits(release) {
      let sha = release.git.lastLocalTagSha();
      release.logger.debug(`getting commits from ${sha}`);
      release.commits = release.git.commits(sha);
      release.logger.debug(`${release.commits.length} commits found`);
      if (!release.commits.length) {
        return Promise.reject(release.error(`Nothing to release`));
      }
    });

    this.step(function getNextVersion(release) {
      release.logger.debug('getting next version');

      if (!release.previousVersion) {
        release.logger.debug('no previousVersion, assuming initialVersion');
        release.nextVersion = release.options.initialVersion;
      } else {
        release.bump = release.options.getBump(release.commits);
        release.logger.debug(`bumping ${release.bump} based on convetions`);
        release.nextVersion = semver.inc(release.previousVersion, release.bump);
      }

      release.logger.debug(`next version will be ${release.nextVersion}`);
    });

    this.step(function getName(release) {
      release.logger.debug('getting release name');
      release.name = `${release.options.tagPrefix}${release.nextVersion}`;
      release.logger.debug(`release name is ${release.name}`);
    });

    this.step(function generateChangelog(release) {
      release.logger.debug(`generating changelog`);
      release.changelog = release.options.changelogTemplate({release: release});
      release.logger.debug(release.changelog);
    });
  }
}

module.exports = Start;
