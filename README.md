# release-flow

[![Build Status](https://travis-ci.org/mcasimir/release-flow.svg?branch=master)](https://travis-ci.org/mcasimir/release-flow) [![codecov](https://codecov.io/gh/mcasimir/release-flow/branch/master/graph/badge.svg)](https://codecov.io/gh/mcasimir/release-flow)

## Git flow conventional releases

`release-flow` leverages different best-practices to make release process safe and painless.

### Features

- Based on commit conventions
- Simplify the release process and management taking over tedious and error prone tasks
- Complements perfectly with CI tools
- Flexible branching model
- Pluggable in design
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

```
release-flow start
```

Effect:

- Fetches remote changes
- Compute the next version bump from commits (ie. `feat commit === minor`)
- Validates the operation (no uncommitted/untracked changes, no existing tag for the version)
- Creates and checks out a new release branch
- Commits (without pushing) any eventual changes made to start the release (ie. changelog, bump package.json)

#### Publish a release (from the new release branch)

```
release-flow publish
```

#### Finalize a release (from the release branch)

```
release-flow finish
```

Effect:

- Fetches remote changes
- Validates the operation (no uncommitted/untracked changes)
- Merges release branch on master
- Tags master after the release version
- Merges back to development (if different from master)

#### Supported Branching model

`release-flow` supports both the canonical `git-flow` branching model with develop/master and a
simplified branching with just master.

#### Default commit conventions

Release flow uses conventional commits to simplify the release process (computing next version, generating changelogs).

Conventional commits are commits with a specific message format:

```
type([scope]): message [BREAKING]
```

ie.

- fix(homepage): fixed title alignment
- feat: implemented user login
- feat(api): BREAKING changed endpoint to list users
