'use strict';

let semver = require('semver');
let prependFile = require('prepend-file');

let Phase = require('../Phase');
let Changelog = require('../Changelog');

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

    this.step(function getChangelogEntries(release) {
      release.logger.debug(`getting changelog entries`);
      let commits = release.commits;
      let changes = new Changelog(release);

      changes.setSubjectLink(release.previous ?
        release.git.compareLink(release.previous, release.name) :
        release.git.commitLink(release.name)
      );

      let breaking = new changes.Entry('Breaking Changes');
      let features = new changes.Entry('Features');
      let fixes = new changes.Entry('Fixes');

      let headersMap = {};

      commits.forEach(function(commit) {
        if (headersMap[commit.header]) {
          let change = headersMap[commit.header];
          change.addLink(commit.shortHash, release.git.commitLink(commit.shortHash));
        } else if (commit.type === 'feat' || commit.type === 'fix' || commit.breaking) {
          let change = new changes.Entry(commit.subject);
          headersMap[commit.header] = change;
          if (commit.type === 'feat') {
            if (commit.scope) {
              change.setScope(commit.scope);
            }
            change.addLink(commit.shortHash, release.git.commitLink(commit.shortHash));
          }
          if (commit.type === 'feat') {
            features.addChild(change);
          }
          if (commit.type === 'fix') {
            fixes.addChild(change);
          }
          if (commit.breaking) {
            breaking.addChild(change);
          }
        }
      });

      if (!breaking.isLeaf()) {
        changes.addChild(breaking);
      }

      if (!features.isLeaf()) {
        changes.addChild(features);
      }

      if (!fixes.isLeaf()) {
        changes.addChild(fixes);
      }

      release.changes = changes;
      release.logger.debug('Changes:', release.changes);
    });

    this.step(function generateChangelog(release) {
      release.logger.debug(`generating changelog`);
      release.changelog = release.options.changelogTemplate({release: release});
      release.logger.debug('changelog', release.changelog);
    });

    this.step(function writeChangelog(release) {
      release.logger.debug(`writing changelog`);
      prependFile.sync(release.options.changelogPath, release.changelog);
    });
  }
}

module.exports = Start;
