import assert, {fail, equal, deepEqual} from 'assert';
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

    it('breaks in case of error', async function() {
      stub(this.release.git, 'fetchHeadsAndTags').throws();

      let phase = new Start();
      try {
        await phase.fetch(this.release);
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

    it('breaks release if no commits found', async function() {
      stub(this.release.git, 'getLastLocalTagSha');
      stub(this.release.git, 'conventionalCommits').returns([]);

      let phase = new Start();
      try {
        await phase.getCommits(this.release);
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

  });

  describe('openReleaseBranch', function() {

  });

  describe('getChangelogEntries', function() {

  });

  describe('generateChangelog', function() {

  });

  describe('writeChangelog', function() {

  });

  describe('commit', function() {

  });
});
