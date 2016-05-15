'use strict';

class ChangelogEntry {
  constructor(subject, options) {
    options = options || {};
    this.subject = subject;
    this.scopes = options.scopes || [];
    this.subjectLink = options.subjectLink;
    this.links = options.links || [];
    this.children = [];
  }

  setSubject(subject) {
    this.subject = subject;
  }

  setSubjectLink(link) {
    this.subjectLink = link;
  }

  addLink(name, url) {
    this.links.push({name: name, url: url});
  }

  addScope(subject) {
    this.scopes.push(subject);
  }

  addChild(child) {
    this.children.push(child);
  }

  isLeaf() {
    return !this.children.length;
  }

  traverse(previsit, postvisit) {
    previsit(this);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverse(previsit, postvisit);
    }
    postvisit(this);
  }
}

class Changelog extends ChangelogEntry {
  constructor(release) {
    super(release.name);
    this.Entry = ChangelogEntry;
  }
}

module.exports = Changelog;
