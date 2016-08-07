import mock from 'mock-require';
import Release from '../../src/Release';
import assert, {equal} from 'assert';

describe('plugins', function() {
  describe('bumpPackageJson', function() {

    beforeEach(function() {
      this.writeFileSyncCalls = [];

      mock('fs', {
        writeFileSync: (path, data) => {
          this.writeFileSyncCalls.push([path, data]);
        },
        readFileSync: function() {
          return '{}';
        }
      });

      this.bumpPackageJson = mock.reRequire(
        '../../src/plugins/bump-package-json'
      ).default;
    });

    afterEach(function() {
      mock.stopAll();
    });

    it('installs a step', function() {
      let release = new Release({
        plugins: [this.bumpPackageJson]
      });

      let step = release.phases.start.steps.find(
        step => step.name === 'bumpPackageJson'
      );

      assert(step);
    });

    it('writes nextVersion on package json', function() {
      let release = new Release({
        plugins: [this.bumpPackageJson]
      });

      release.nextVersion = '1.2.3';

      let step = release.phases.start.steps.find(
        step => step.name === 'bumpPackageJson'
      );

      step.run(release);

      equal(this.writeFileSyncCalls[0][1], `{
  "version": "1.2.3"
}
`);
    });
  });
});
