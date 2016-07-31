import ChangelogEntry from
  '../../src/plugins/generate-changelog/ChangelogEntry';
import changelogTemplate from
  '../../src/plugins/generate-changelog/changelog-template';

import {equal} from 'assert';

describe('changelog-template', function() {
  it('Adds an anchor for release name', function() {
    let context = {
      release: {
        name: 'release1',
        changes: {
          traverse() {}
        }
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog, `<a name="release1"></a>

`);
  });

  it('Adds h1 entry for each top level leaf', function() {
    let root = new ChangelogEntry('root');

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root

`);
  });

  it('Render subject for non leaf entries as title', function() {
    let root = new ChangelogEntry('root');
    root.addChild(new ChangelogEntry('child1'));

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root

- child1

`);
  });

  it('Adds a space before >2nd level titles', function() {
    let root = new ChangelogEntry('root');
    let child1 = new ChangelogEntry('child1');
    let child2 = new ChangelogEntry('child2');
    root.addChild(child1);
    child1.addChild(child2);

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root

## child1

- child2

`);
  });

  it('Does not add a space after leaf entries', function() {
    let root = new ChangelogEntry('root');
    let child1 = new ChangelogEntry('child1');
    let child2 = new ChangelogEntry('child2');
    let child3 = new ChangelogEntry('child3');
    root.addChild(child1);
    child1.addChild(child2);
    child1.addChild(child3);

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root

## child1

- child2
- child3

`);
  });

  it('renders one link', function() {
    let root = new ChangelogEntry('root');
    root.addLink('link 1', 'link-1-url');

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root ([link 1](link-1-url))

`);
  });

  it('renders two or more link comma separated', function() {
    let root = new ChangelogEntry('root');
    root.addLink('link 1', 'link-1-url');
    root.addLink('link 2', 'link-2-url');

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# root ([link 1](link-1-url), [link 2](link-2-url))

`);
  });

  it('renders scope in bold', function() {
    let root = new ChangelogEntry('root');
    root.scope = 'feat';

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# **feat** - root

`);
  });

  it('renders subject link', function() {
    let root = new ChangelogEntry('root');
    root.subjectLink = 'xyz';

    let context = {
      release: {
        name: 'release1',
        changes: root
      }
    };

    let changelog = changelogTemplate(context);

    equal(changelog,
`<a name="release1"></a>
# [root](xyz)

`);
  });
});
