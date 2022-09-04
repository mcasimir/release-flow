import fs from "fs";
import assert, { equal } from "assert";
import Release from "../../src/Release";
import plugin from "../../src/plugins/bump-package-json";

describe("plugins", function () {
  describe("bumpPackageJson", function () {
    beforeEach(function () {
      fs.renameSync("package.json", "package.json.bkp");
      fs.writeFileSync("package.json", "{}");
    });
    afterEach(function () {
      fs.unlinkSync("package.json");
      fs.renameSync("package.json.bkp", "package.json");
    });
    it("installs a step", function () {
      let release = new Release({
        plugins: [plugin],
      });
      let step = release.phases.start.steps.find(
        (step) => step.name === "bumpPackageJson"
      );
      assert(step);
    });
    it("writes nextVersion on package json", function () {
      let release = new Release({
        plugins: [plugin],
      });
      release.nextVersion = "1.2.3";
      let step = release.phases.start.steps.find(
        (step) => step.name === "bumpPackageJson"
      );
      step.run(release);
      const packageJson = fs.readFileSync("package.json", "utf-8");
      equal(
        packageJson,
        `{
  "version": "1.2.3"
}
`
      );
    });
  });
});
