import mock from 'mock-require';
import assert, {deepEqual, equal} from 'assert';
import {stub} from 'sinon';
import Release from '../../src/Release';
import ChangelogEntry from
  '../../src/plugins/generate-changelog/ChangelogEntry';

describe('plugins', function() {
  describe('generateChangelog', function() {
    beforeEach(function() {
      this.prependFileCalls = [];

      mock('prepend-file', {
        sync: (path, data) => {
          this.prependFileCalls.push([path, data]);
        }
      });

      this.generateChangelog = mock.reRequire(
        '../../src/plugins/generate-changelog'
      ).default;
    });

    afterEach(function() {
      mock.stopAll();
    });

    describe('installPlugin', function() {
      it('installs steps in right order', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        let steps = release.phases.start.steps;
        let names = steps.slice(-4, -1).map(step => step.name);

        deepEqual(names, [
          'getChangelogEntries',
          'generateChangelogContent',
          'writeChangelog'
        ]);
      });
    });

    describe('getChangelogEntries', function() {
      it('assign root to release.changes', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        release.commits = [];

        let step = release.phases.start.steps.find(
          step => step.name === 'getChangelogEntries'
        );

        step.run(release);
        assert(release.changes instanceof ChangelogEntry);
      });

      it('set root subject after release name',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.name = 'release123';
          release.commits = [];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.subject, 'release123');
        });

      it('for first release sets root subjectLink after release name',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.name = 'release123';

          stub(release.git, 'commitLink', commit => `commitlink://${commit}`);

          release.commits = [];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.subjectLink, 'commitlink://release123');
        });

      it('sets root subjectLink as compareLink between prev and release',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.previousReleaseName = 'release1';
          release.name = 'release2';

          stub(release.git, 'compareLink',
            (commit1, commit2) => `comparelink://${commit1}..${commit2}`);

          release.commits = [];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.subjectLink,
            'comparelink://release1..release2');
        });

      it('does not add any children since no commit fits', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        release.commits = [];

        let step = release.phases.start.steps.find(
          step => step.name === 'getChangelogEntries'
        );

        step.run(release);
        deepEqual(release.changes.children, []);
      });

      it('adds a list of feat entries if one is present',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.name = 'release2';

          release.commits = [{
            header: 'feat: commit1',
            subject: 'commit1',
            type: 'feat'
          }];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.children[0].subject, 'Features');
        });

      it('adds a list of fix entries if one is present',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.name = 'release2';

          release.commits = [{
            header: 'fix: commit1',
            subject: 'commit1',
            type: 'fix'
          }];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.children[0].subject, 'Fixes');
        });

      it('adds a list of breaking changes entries if one is present',
        function() {
          let release = new Release({
            plugins: [this.generateChangelog]
          });

          release.name = 'release2';

          release.commits = [{
            header: 'breaking: commit1',
            subject: 'commit1',
            breaking: true
          }];

          let step = release.phases.start.steps.find(
            step => step.name === 'getChangelogEntries'
          );

          step.run(release);
          equal(release.changes.children[0].subject, 'Breaking Changes');
        });

      it('adds scope to changelog if commit has one', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        release.name = 'release2';

        release.commits = [{
          header: 'feat: commit1',
          subject: 'commit1',
          type: 'feat',
          scope: 'xyz',
          shortHash: '12345',
          hash: '12345678910'
        }];

        let step = release.phases.start.steps.find(
          step => step.name === 'getChangelogEntries'
        );

        step.run(release);
        equal(release.changes.children[0].children[0].scope, 'xyz');
      });

      it('adds link to commit for any entry', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        release.name = 'release2';

        release.commits = [{
          header: 'feat: commit1',
          subject: 'commit1',
          type: 'feat',
          scope: 'xyz',
          shortHash: '12345',
          hash: '12345678910'
        }];

        let step = release.phases.start.steps.find(
          step => step.name === 'getChangelogEntries'
        );

        stub(release.git, 'commitLink', commit => `commitlink://${commit}`);

        step.run(release);
        let commitEntry = release.changes.children[0].children[0];
        deepEqual(commitEntry.links[0], {
          name: '12345',
          url: 'commitlink://12345678910'
        });
      });

      it('squashes commits with identical header', function() {
        let release = new Release({
          plugins: [this.generateChangelog]
        });

        release.name = 'release2';

        release.commits = [{
          header: 'feat: commit1',
          subject: 'commit1',
          type: 'feat',
          scope: 'xyz',
          shortHash: '12345',
          hash: '12345678910'
        },
        {
          header: 'feat: commit1',
          subject: 'commit1',
          type: 'feat',
          scope: 'xyz',
          shortHash: '67890',
          hash: '67890123456'
        }];

        let step = release.phases.start.steps.find(
          step => step.name === 'getChangelogEntries'
        );

        stub(release.git, 'commitLink', commit => `commitlink://${commit}`);

        step.run(release);

        equal(release.changes.children[0].children.length, 1);

        let commitEntry = release.changes.children[0].children[0];

        deepEqual(commitEntry.links, [{
          name: '12345',
          url: 'commitlink://12345678910'
        }, {
          name: '67890',
          url: 'commitlink://67890123456'
        }]);
      });

    });

    describe('generateChangelogContent', function() {
      it('processes changes through changelog template', function() {
        let changelogTemplateStub = stub().returns('abc');

        let release = new Release({
          changelogTemplate: changelogTemplateStub,
          plugins: [this.generateChangelog]
        });

        let step = release.phases.start.steps.find(
          step => step.name === 'generateChangelogContent'
        );

        step.run(release);

        assert(changelogTemplateStub.calledWith({release: release}));
        equal(release.changelog, 'abc');
      });
    });

    describe('writeChangelog', function() {
      it('prepends changelog contents to changelog', function() {
        let release = new Release({
          changelogPath: 'XYZ.md',
          plugins: [this.generateChangelog]
        });

        release.changelog = 'abc';

        let step = release.phases.start.steps.find(
          step => step.name === 'writeChangelog'
        );

        step.run(release);

        deepEqual(this.prependFileCalls[0], ['XYZ.md', 'abc']);
      });
    });
  });
});
