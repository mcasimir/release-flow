export default class ChangelogEntry {
  constructor(subject, options = {}) {
    this.subject = subject;
    this.scope = options.scope;
    this.subjectLink = options.subjectLink;
    this.links = options.links || [];
    this.children = [];
  }

  addLink(name, url) {
    this.links.push({name: name, url: url});
  }

  addChild(child) {
    this.children.push(child);
  }

  isLeaf() {
    return !this.children.length;
  }

  traverse(previsit, postvisit) {
    if (previsit) {
      previsit(this);
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverse(previsit, postvisit);
    }
    if (postvisit) {
      postvisit(this);
    }
  }
}
