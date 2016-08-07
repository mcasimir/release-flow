# release-flow

[![Build Status](https://travis-ci.org/mcasimir/release-flow.svg?branch=master)](https://travis-ci.org/mcasimir/release-flow) [![codecov](https://codecov.io/gh/mcasimir/release-flow/branch/master/graph/badge.svg)](https://codecov.io/gh/mcasimir/release-flow)

## Git flow conventional releases

`release-flow` is a command line tool that simplifies the developer side of software release process taking over tedious and error prone tasks.

`release-flow` mixes [git flow releases](http://danielkummer.github.io/git-flow-cheatsheet/) with conventional commits to make release process safe and painless.

### Features

- Based on commit conventions
- Complements perfectly with CI tools
- Flexible branching model
- Pluggable design
- Completely configurable and customizable
- Stand-alone (gulp/grunt integration is possible)
- Suitable for any kind of project and language (small apps, opensource projects, libs, enterprise applications)
- Built in plugins for Changelog generation and NPM bumps

### Installation

Globally (use from console)

``` sh
npm i -g release-flow
```

As project dependency (use through npm script or programmatically)

``` sh
npm i --save-dev release-flow
```

In your `package.json`

``` json
"scripts": {
  "release": "release-flow"
}
```

### Usage

#### Start a release (from your development branch)

``` sh
release-flow start
```

Effect:

- Fetches remote changes
- Compute the next version bump from commits (ie. `feat commit === minor`)
- Validates the operation (no uncommitted/untracked changes, no existing tag for the version)
- Creates and checks out a new release branch
- Commits (without pushing) any eventual changes made to start the release (ie. changelog, bump package.json)

#### Publish a release (from the new release branch)

``` sh
release-flow publish
```

#### Finalize a release (from the release branch)

``` sh
release-flow finish
```

Effect:

- Fetches remote changes
- Validates the operation (no uncommitted/untracked changes)
- Merges release branch on master
- Tags master after the release version
- Merges back to development (if different from master)

#### Start/Publish/Finish with one command (from your development branch)

``` sh
release-flow full
```

Effect:

Same then issuing `release-flow start`, `release-flow publish` and `release-flow finish` in sequence.

**NOTE:** This approach is especially suitable for libraries and small projects that does not require a QA phase on the release branch.

#### Supported Branching model

`release-flow` supports both the canonical `git-flow` branching model with develop/master and a
simplified branching with just master.

##### Git flow model (default)

``` js
// releaseflowrc
module.exports = {
  developmentBranch: 'develop',
  productionBranch: 'master'
};
```

![full-git-flow](https://github.com/mcasimir/release-flow/raw/master/docs/assets/full-git-flow.png)

##### Simplified model

``` js
// releaseflowrc
module.exports = {
  developmentBranch: 'master',
  productionBranch: 'master'
};
```

![simplified-git-flow](https://github.com/mcasimir/release-flow/raw/master/docs/assets/simplified.png)

#### Commit conventions

Release flow uses conventional commits to simplify the release process (computing next version, generating changelogs).

Conventional commits are commits with a specific message format:

```
type([scope]): message [BREAKING]
```

ie.

- fix(homepage): fixed title alignment
- feat: implemented user login
- feat(api): BREAKING changed endpoint to list users

##### Default bump detection logic

- Has one commit whose message contains `BREAKING` &rarr; `major`
- Has one commit whose type is feat &rarr; `minor`
- Otherwise &rarr; `patch`

#### Configuration

`release-flow` loads a `releaseflowrc` javascript file to allow configuration.

The following is an extract of the default configuration file:

``` js
export default {
  developmentBranch: 'develop',
  productionBranch: 'master',
  releaseBranchPrefix: 'release/',
  tagPrefix: 'v',
  remoteName: 'origin',
  logLevel: 'info',
  initialVersion: '1.0.0',
  repoHttpUrl: null,
  ErrorFactory: DefaultErrorFactory,
  Logger: DefaultLogger,
  repoHttpProtocol: 'https',
  getBump: getBump,
  plugins: []
};
```

#### Included Plugins

##### Bump package json

Bumps package json version on start.

``` js
// releaseflowrc
module.exports = {
  plugins: [
    'bump-package-json'
  ]
};
```

##### Generate changelog

Generates a changelog for the release and prepend it `CHANGELOG.md` or the choosen path on start.

``` js
// releaseflowrc
module.exports = {
  changelogPath: 'CHANGELOG.md'
  changelogTemplate: release => 'changelog contents'
  plugins: [
    'generate-changelog'
  ]
};
```

#### Advanced usage and plugin creation

A plugin is just a function of the form `install(release) => null`. To register it is enough to pass it in releaseflowrc

``` js
// releaseflowrc
module.exports = {
  plugins: [
    release => {
      // ... do something    
    }
  ]
};
```

Tiplcally a plugin adds some `step` to a release phase (one of start, publish or finish).

A step is an object with a `name` and a `run()` function.

To attach a step to a phase is possible to use array methods like `push` or `splice` on the `release.phases.[start/publish/finish].steps` array or use the `release.phases.[start/publish/finish].before` method to insert the step before another specific step:

``` js
// releaseflowrc
module.exports = {
  plugins: [
    release => {
      let logVersion = {
        name: 'logVersion',
        run(release) {
          console.log(release.version);
        }
      };

      release.phases.start.before('commit', logVersion);
    }
  ]
};
```
