import assert, {equal, deepEqual} from 'assert';
import ChangelogEntry from
  '../../src/plugins/generate-changelog/ChangelogEntry';

describe('ChangelogEntry', function() {
  describe('new ChangelogEntry()', function() {
    it('sets subject', function() {
      let ce = new ChangelogEntry('Changed something');
      equal(ce.subject, 'Changed something');
    });

    it('init links to empty array', function() {
      let ce = new ChangelogEntry('...');
      deepEqual(ce.links, []);
    });

    it('init children to empty array', function() {
      let ce = new ChangelogEntry('...');
      deepEqual(ce.children, []);
    });

    it('init allows to set scope', function() {
      let ce = new ChangelogEntry('...', {
        scope: 'abc'
      });
      equal(ce.scope, 'abc');
    });

    it('init allows to set subjectLink', function() {
      let ce = new ChangelogEntry('...', {
        subjectLink: 'abc'
      });
      equal(ce.subjectLink, 'abc');
    });

    it('init allows to set links', function() {
      let ce = new ChangelogEntry('...', {
        links: ['abc', 'bcd']
      });

      deepEqual(ce.links, ['abc', 'bcd']);
    });
  });

  describe('addLink', function() {
    it('adds a link', function() {
      let ce = new ChangelogEntry('...');

      ce.addLink('abc', 'bcd');

      deepEqual(ce.links, [{
        name: 'abc',
        url: 'bcd'
      }]);
    });
  });

  describe('addChild', function() {
    it('adds a child', function() {
      let ce = new ChangelogEntry('...');

      ce.addChild('abc');

      deepEqual(ce.children, ['abc']);
    });
  });

  describe('isLeaf', function() {
    it('returns true if ChangelogEntry has no children', function() {
      let ce = new ChangelogEntry('...');
      assert(ce.isLeaf());
    });

    it('returns false if ChangelogEntry has children', function() {
      let ce = new ChangelogEntry('...');
      ce.addChild('abc');
      assert(!ce.isLeaf());
    });
  });

  describe('traverse', function() {
    it('calls previsit on all children in right order', function() {
      let root = new ChangelogEntry('A');

      let b = new ChangelogEntry('B');
      let c = new ChangelogEntry('C');

      root.addChild(b);
      root.addChild(c);

      b.addChild(new ChangelogEntry('D'));

      let visits = [];
      root.traverse(entry => visits.push(entry.subject));

      deepEqual(visits, ['A', 'B', 'D', 'C']);
    });

    it('calls postvisit on all children in right order', function() {
      let root = new ChangelogEntry('A');

      let b = new ChangelogEntry('B');
      let c = new ChangelogEntry('C');

      root.addChild(b);
      root.addChild(c);

      b.addChild(new ChangelogEntry('D'));

      let visits = [];
      root.traverse(
        null,
        entry => visits.push(entry.subject)
      );

      deepEqual(visits, ['D', 'B', 'C', 'A']);
    });
  });
});
