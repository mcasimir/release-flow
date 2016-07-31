import Phase, {Step} from '../Phase';

export default class Finish extends Phase {
  @Step()
  getReleaseInfo(release) {
    release.branchName = release.git.getCurrentBranch();
    release.name = release.branchName
      .slice(0, release.options.releaseBranchPrefix);
    release.tagName = `${release.options.tagPrefix}${name}`;
  }

  @Step()
  validate(release) {
    let currentBranch = release.git.getCurrentBranch();
    if (!currentBranch.startsWith(release.options.releaseBranchPrefix)) {
      throw release.error(
        'You can only finish a release from a release branch'
      );
    }
  }

  @Step()
  mergeToProduction(release) {
    release.git.checkout(release.options.productionBranch);
    release.git.merge(release.branchName);
    release.git.pushRef(release.options.productionBranch);
  }

  @Step()
  tagProduction(release) {
    release.git.tag(release.tagName);
    release.git.pushRef(release.tagName);
  }

  @Step()
  mergeBackToDevelopment(release) {
    release.git.checkout(release.options.developmentBranch);
    release.git.merge(release.branchName);
    release.git.pushRef(release.options.developmentBranch);
  }
}
