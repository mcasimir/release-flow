import assert, {throws, doesNotThrow, fail, equal, deepEqual} from 'assert';
import Start from '../../src/phases/Start';
import {stub} from 'sinon';
import Release from '../../src/Release';

describe('Start', function() {
  beforeEach(function() {
    this.release = new Release();
    stub(this.release.logger, 'debug');
  });

  describe('fetch', function() {
    it('fetches heads and tags', function() {
      stub(this.release.git, 'fetchHeadsAndTags');

      let phase = new Start();
      phase.fetch(this.release);

      assert(this.release.git.fetchHeadsAndTags.called);
    });

    it('breaks in case of error', function() {
      stub(this.release.git, 'fetchHeadsAndTags').throws();

      let phase = new Start();
      try {
        phase.fetch(this.release);
        fail('Should not get here');
      } catch (e) {
        equal(e.message, 'Unable to fetch tags and heads');
      }
    });
  });

  describe('getPreviousVersion', function() {
    it('set previousVersion if tagname', function() {
      stub(this.release.git, 'getLastLocalTagName').returns('v1.2.3');

      let phase = new Start();
      phase.getPreviousVersion(this.release);
      equal(this.release.previousVersion, '1.2.3');
    });

    it('set previousReleaseName if tagname', function() {
      stub(this.release.git, 'getLastLocalTagName').returns('v1.2.3');
      this.release.options.tagPrefix = 'xyz';
      let phase = new Start();
      phase.getPreviousVersion(this.release);
      equal(this.release.previousReleaseName, 'xyz1.2.3');
    });

    it('does not set previousVersion if no tagname', function() {
      stub(this.release.git, 'getLastLocalTagName').returns(null);

      let phase = new Start();
      phase.getPreviousVersion(this.release);
      equal(this.release.previousVersion, null);
    });

    it('does not set previousReleaseName if no tagname', function() {
      stub(this.release.git, 'getLastLocalTagName').returns(null);
      let phase = new Start();
      phase.getPreviousVersion(this.release);
      equal(this.release.previousReleaseName, null);
    });
  });

  describe('getCommits', function() {
    it('fetches conventionalCommits with lastLocalTagSha', function() {
      stub(this.release.git, 'getLastLocalTagSha').returns('xyz');
      stub(this.release.git, 'conventionalCommits').returns([{}]);

      let phase = new Start();
      phase.getCommits(this.release);

      assert(this.release.git.conventionalCommits.calledWith('xyz'));
    });

    it('sets release commits', function() {
      stub(this.release.git, 'getLastLocalTagSha');
      stub(this.release.git, 'conventionalCommits').returns(['123']);

      let phase = new Start();
      phase.getCommits(this.release);

      deepEqual(this.release.commits, ['123']);
    });

    it('breaks release if no commits found', function() {
      stub(this.release.git, 'getLastLocalTagSha');
      stub(this.release.git, 'conventionalCommits').returns([]);

      let phase = new Start();
      try {
        phase.getCommits(this.release);
        fail('Should not get here');
      } catch (e) {
        equal(e.message, ('Nothing to release'));
      }
    });
  });

  describe('getNextVersion', function() {
    it('sets initialVersion if no previousVersion', function() {
      this.release.options.initialVersion = '2.3.4';

      let phase = new Start();
      phase.getNextVersion(this.release);

      equal(this.release.nextVersion, '2.3.4');
    });

    it('if previousVersion calls getBump with commits', function() {
      this.release.previousVersion = '2.3.4';
      stub(this.release.options, 'getBump').returns('patch');

      this.release.commits = ['abc', 'bcd'];

      let phase = new Start();
      phase.getNextVersion(this.release);

      assert(this.release.options.getBump.calledWith(['abc', 'bcd']));
    });

    it('bumps version according to getBump', function() {
      this.release.previousVersion = '2.3.4';
      stub(this.release.options, 'getBump').returns('patch');

      let phase = new Start();
      phase.getNextVersion(this.release);

      equal(this.release.nextVersion, '2.3.5');
    });

    it('sets release.name', function() {
      this.release.options.tagPrefix = 'xyz';
      this.release.previousVersion = '2.3.4';
      stub(this.release.options, 'getBump').returns('patch');

      let phase = new Start();
      phase.getNextVersion(this.release);

      equal(this.release.name, 'xyz2.3.5');
    });
  });

  describe('validate', function() {
    it('throws if currentBranch is not developmentBranch', function() {
      this.release.options.developmentBranch = 'abc';

      stub(this.release.git, 'isCurrentBranch').returns(false);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      throws(() => {
        phase.validate(this.release);
      }, /Current branch should be abc$/);
    });

    it('does not throw if currentBranch is developmentBranch', function() {
      this.release.options.developmentBranch = 'abc';

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /Current branch should be abc$/);
    });

    it('throws if hasUntrackedChanges', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(true);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      throws(() => {
        phase.validate(this.release);
      }, /You have untracked changes$/);
    });

    it('does not throw if has not hasUntrackedChanges', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /You have untracked changes$/);
    });

    it('throws if hasUnpushedCommits', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(true);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      throws(() => {
        phase.validate(this.release);
      }, /You have unpushed changes$/);
    });

    it('does not throw if has not hasUnpushedCommits', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      let phase = new Start();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /You have unpushed changes$/);
    });

    it('throws if hasLocalTag with release name', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(true);

      this.release.name = 'abc';

      let phase = new Start();

      throws(() => {
        phase.validate(this.release);
      }, /Tag abc already exists$/);
    });

    it('does not throw if has not LocalTag with release name', function() {

      stub(this.release.git, 'isCurrentBranch').returns(true);
      stub(this.release.git, 'hasUntrackedChanges').returns(false);
      stub(this.release.git, 'hasUnpushedCommits').returns(false);
      stub(this.release.git, 'hasLocalTag').returns(false);

      this.release.name = 'abc';

      let phase = new Start();

      doesNotThrow(() => {
        phase.validate(this.release);
      }, /Tag abc already exists$/);
    });
  });

  describe('openReleaseBranch', function() {
    it('calls git.openBranch with the releaseBranchPrefix and nextVersion',
      function() {
        this.release.options.releaseBranchPrefix = 'xyz~';
        this.release.nextVersion = '1.2.3';
        stub(this.release.git, 'openBranch');

        let phase = new Start();
        phase.openReleaseBranch(this.release);
        assert(this.release.git.openBranch.calledWith('xyz~1.2.3'));
      });
  });

  describe('commit', function() {
    it('invokes git commitAll with release message', function() {
      this.release.name = 'xyz123';

      stub(this.release.git, 'commitAll');

      let phase = new Start();
      phase.commit(this.release);

      assert(this.release.git.commitAll.calledWith('Release xyz123'));
    });
  });
});
