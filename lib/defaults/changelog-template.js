'use strict';

module.exports = function(context) {
  let release = context.release;
  let lines = [`<a name="${release.name}"></a>`];
  let level = 0;

  release.changes.traverse(
    (entry) => {
      level++;

      if (level !== 1 && !entry.isLeaf()) {
        lines.push('');
      }

      let titleBullet = (entry.isLeaf() ? '-' : Array(level + 1).join('#')) + ' ';
      let subject = entry.subject;
      let scope = entry.scope || '';
      let links = entry.links.map(function(link) {
        return `[${link.name}](${link.url})`;
      }).join(', ');

      if (scope) {
        scope = `**${scope}** - `;
      }

      if (links) {
        links = ` (${links})`;
      }

      if (entry.subjectLink) {
        subject = `[${subject}](${entry.subjectLink})`;
      }

      lines.push(`${titleBullet}${scope}${subject}${links}`);

      if (level !== 1 && !entry.isLeaf()) {
        lines.push('');
      }
    },
    () => {
      level--;
    });

  return lines.join('\n');
};
