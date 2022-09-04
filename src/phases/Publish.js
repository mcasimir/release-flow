import Phase, { Step } from "../Phase";

export default class Publish extends Phase {
  @Step()
  validate(release) {
    let currentBranch = release.git.getCurrentBranch();
    if (!currentBranch.startsWith(release.options.releaseBranchPrefix)) {
      throw release.error(
        "You can only publish a release from a release branch"
      );
    }

    if (release.git.hasUntrackedChanges()) {
      throw release.error("You have untracked changes");
    }
  }

  @Step()
  push(release) {
    release.git.pushRef(release.git.getCurrentBranch());
  }
}
