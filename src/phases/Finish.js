import Phase, { Step } from "../Phase";

export default class Finish extends Phase {
  @Step()
  fetch(release) {
    release.logger.debug("fetching tags and heads");
    try {
      release.git.fetchHeadsAndTags();
    } catch (e) {
      throw release.error("Unable to fetch tags and heads");
    }
  }

  @Step()
  getReleaseInfo(release) {
    release.branchName = release.git.getCurrentBranch();
    release.name = release.branchName.slice(
      release.options.releaseBranchPrefix.length
    );
    release.tagName = `${release.options.tagPrefix}${release.name}`;
  }

  @Step()
  validateReleaseBranch(release) {
    let currentBranch = release.git.getCurrentBranch();
    if (!currentBranch.startsWith(release.options.releaseBranchPrefix)) {
      throw release.error(
        "You can only finish a release from a release branch"
      );
    }

    if (release.git.hasUntrackedChanges()) {
      throw release.error("You have untracked changes");
    }

    if (release.git.hasUnpushedCommits()) {
      throw release.error("You have unpushed changes");
    }
  }

  @Step()
  checkoutProduction(release) {
    release.git.checkout(release.options.productionBranch);
  }

  @Step()
  validateProductionBranch(release) {
    if (release.git.hasUntrackedChanges()) {
      throw release.error("You have untracked changes");
    }

    if (release.git.hasUnpushedCommits()) {
      throw release.error("You have unpushed changes");
    }
  }

  @Step()
  mergeToProduction(release) {
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
    if (
      release.options.developmentBranch !== release.options.productionBranch
    ) {
      release.git.checkout(release.options.developmentBranch);
      release.git.merge(release.branchName);
      release.git.pushRef(release.options.developmentBranch);
    }
  }
}
