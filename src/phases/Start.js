import semver from 'semver';
import prependFile from 'prepend-file';
import Phase, {Step} from '../Phase';
import ChangelogEntry from '../ChangelogEntry';

export default class Start extends Phase {
  @Step()
  fetch(release) {
    release.logger.debug('fetching tags and heads');
    try {
      release.git.fetchHeadsAndTags();
    } catch (e) {
      return Promise.reject(release.error('Unable to fetch tags and heads'));
    }
  }

  @Step()
  getPreviousVersion(release) {
    release.logger.debug('finding previous version');
    let lastTagName = release.git.lastTagName();
    if (lastTagName) {
      let versionMatch = lastTagName.match(/\d\.\d\.\d.*/);
      release.previousVersion = versionMatch && versionMatch[0];
    } else {
      release.previousVersion = null;
    }
    release.previous = release.previousVersion &&
      `${release.options.tagPrefix}${release.previousVersion}`;
    release.logger.debug(`previous version was ${release.previousVersion}`);
  }

  @Step()
  getCommits(release) {
    let sha = release.git.lastLocalTagSha();
    release.logger.debug(`getting commits from ${sha}`);
    release.commits = release.git.conventionalCommits(sha);
    release.logger.debug(`${release.commits.length} commits found`);
    if (!release.commits.length) {
      return Promise.reject(release.error('Nothing to release'));
    }
  }

  @Step()
  getNextVersion(release) {
    release.logger.debug('getting next version');

    if (release.previousVersion) {
      release.bump = release.options.getBump(release.commits);
      release.logger.debug(`bumping ${release.bump} based on convetions`);
      release.nextVersion = semver.inc(release.previousVersion, release.bump);
    } else {
      release.logger.debug('no previousVersion, assuming initialVersion');
      release.nextVersion = release.options.initialVersion;
    }

    release.logger.debug(`next version will be ${release.nextVersion}`);
  }

  @Step()
  getName(release) {
    release.logger.debug('getting release name');
    release.name = `${release.options.tagPrefix}${release.nextVersion}`;
    release.logger.debug(`release name is ${release.name}`);
  }

  @Step()
  validate(release) {
    if (!release.git.isCurrentBranch(release.options.developmentBranch)) {
      throw release.error(
        `Current branch should be ${release.options.developmentBranch}`
      );
    }

    if (release.git.hasUntrackedChanges()) {
      throw release.error('You have untracked changes');
    }

    if (release.git.hasLocalTag(release.name)) {
      throw release.error(`Tag ${release.name} already exists`);
    }
  }

  @Step()
  openReleaseBranch(release) {
    release.git.openBranch(
      `${release.options.releaseBranchPrefix}${release.nextVersion}`
    );
  }

  @Step()
  getChangelogEntries(release) {
    release.logger.debug('getting changelog entries');
    let commits = release.commits;
    let changes = new ChangelogEntry(release.name);

    changes.subjectLink = release.previous ?
      release.git.compareLink(release.previous, release.name) :
      release.git.commitLink(release.name);

    let breaking = new ChangelogEntry('Breaking Changes');
    let features = new ChangelogEntry('Features');
    let fixes = new ChangelogEntry('Fixes');

    let headersMap = {};

    commits.forEach(function(commit) {
      if (headersMap[commit.header]) {
        let change = headersMap[commit.header];
        change.addLink(
          commit.shortHash,
          release.git.commitLink(commit.shortHash)
        );
      } else if (
          commit.type === 'feat' ||
          commit.type === 'fix' ||
          commit.breaking
      ) {
        let change = new ChangelogEntry(commit.subject);
        headersMap[commit.header] = change;
        if (commit.type === 'feat') {
          if (commit.scope) {
            change.scope = commit.scope;
          }
          change.addLink(
            commit.shortHash,
            release.git.commitLink(commit.shortHash)
          );
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
  }

  @Step()
  generateChangelog(release) {
    release.logger.debug('generating changelog');
    release.changelog = release.options.changelogTemplate({release: release});
    release.logger.debug('changelog', release.changelog);
  }

  @Step()
  writeChangelog(release) {
    release.logger.debug('writing changelog');
    prependFile.sync(release.options.changelogPath, release.changelog);
  }

  @Step()
  commit(release) {
    release.git.commitAll(`Release ${release.name}`);
  }
}
