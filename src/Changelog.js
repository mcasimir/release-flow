import ChangelogEntry from 'ChangelogEntry';

export default class Changelog extends ChangelogEntry {
  constructor(release) {
    super(release.name);
    this.Entry = ChangelogEntry;
  }
}
