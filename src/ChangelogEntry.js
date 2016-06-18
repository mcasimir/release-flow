export default class ChangelogEntry {
  constructor(subject, options = {}) {
    this.subject = subject;
    this.scope = options.scope;
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

  setScope(scope) {
    this.scope = scope;
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
