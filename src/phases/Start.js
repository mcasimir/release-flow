import semver from 'semver';
import Phase, {Step} from '../Phase';

export default class Start extends Phase {
  @Step()
  fetch(release) {
    release.logger.debug('fetching tags and heads');
    try {
      release.git.fetchHeadsAndTags();
    } catch (e) {
      throw release.error('Unable to fetch tags and heads');
    }
  }

  @Step()
  getPreviousVersion(release) {
    release.logger.debug('finding previous version');
    let lastTagName = release.git.getLastLocalTagName();
    if (lastTagName) {
      let versionMatch = lastTagName.match(/\d\.\d\.\d.*/);
      release.previousVersion = versionMatch && versionMatch[0];
      release.previousReleaseName =
        `${release.options.tagPrefix}${release.previousVersion}`;
    } else {
      release.previousVersion = null;
      release.previousReleaseName = null;
    }
    release.logger.debug(`previous version was ${release.previousVersion}`);
  }

  @Step()
  getCommits(release) {
    let sha = release.git.getLastLocalTagSha();
    release.logger.debug(`getting commits from ${sha}`);
    release.commits = release.git.conventionalCommits(sha);
    release.logger.debug(`${release.commits.length} commits found`);
    if (!release.commits.length) {
      throw release.error('Nothing to release');
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

    release.name = `${release.options.tagPrefix}${release.nextVersion}`;

    release.logger.debug(`next version will be ${release.nextVersion}`);
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

    if (release.git.hasUnpushedCommits(release.options.developmentBranch)) {
      throw release.error('You have unpushed changes');
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
  commit(release) {
    release.git.commitAll(`Release ${release.name}`);
  }
}
