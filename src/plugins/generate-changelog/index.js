import prependFile from "prepend-file";
import ChangelogEntry from "./ChangelogEntry";
import { resolve } from "path";
import changelogTemplate from "./changelog-template";

export default function installPlugin(release) {
  release.options.changelogTemplate =
    release.options.changelogTemplate || changelogTemplate;

  release.options.changelogPath =
    release.options.changelogPath || resolve(process.cwd(), "CHANGELOG.md");

  release.phases.start.before("commit", {
    name: "getChangelogEntries",
    run(release) {
      release.logger.debug("getting changelog entries");
      let commits = release.commits;
      let changes = new ChangelogEntry(release.name);

      changes.subjectLink = release.previousReleaseName
        ? release.git.compareLink(release.previousReleaseName, release.name)
        : release.git.commitLink(release.name);

      let breaking = new ChangelogEntry("Breaking Changes");
      let features = new ChangelogEntry("Features");
      let fixes = new ChangelogEntry("Fixes");

      let headersMap = {};

      commits.forEach(function (commit) {
        if (headersMap[commit.header]) {
          let change = headersMap[commit.header];
          change.addLink(commit.shortHash, release.git.commitLink(commit.hash));
        } else if (
          commit.type === "feat" ||
          commit.type === "fix" ||
          commit.breaking
        ) {
          let change = new ChangelogEntry(commit.subject);
          headersMap[commit.header] = change;

          if (commit.scope) {
            change.scope = commit.scope;
          }

          change.addLink(commit.shortHash, release.git.commitLink(commit.hash));

          if (commit.type === "feat") {
            features.addChild(change);
          }
          if (commit.type === "fix") {
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
      release.logger.debug("Changes:", release.changes);
    },
  });

  release.phases.start.before("commit", {
    name: "generateChangelogContent",
    run(release) {
      release.logger.debug("generating changelog");
      release.changelog = release.options.changelogTemplate({
        release: release,
      });
      release.logger.debug("changelog", release.changelog);
    },
  });

  release.phases.start.before("commit", {
    name: "writeChangelog",
    run(release) {
      release.logger.debug("writing changelog");
      prependFile.sync(release.options.changelogPath, release.changelog);
    },
  });
}
