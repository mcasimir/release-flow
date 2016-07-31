'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context) {
  var release = context.release;
  var lines = ['<a name="' + release.name + '"></a>'];
  var level = 0;

  release.changes.traverse(function (entry) {
    level++;

    if (level !== 1 && !entry.isLeaf()) {
      lines.push('');
    }

    var titleBullet = (entry.isLeaf() && level !== 1 ? '-' : Array(level + 1).join('#')) + ' ';

    var subject = entry.subject;
    var scope = entry.scope || '';
    var links = entry.links.map(function (link) {
      return '[' + link.name + '](' + link.url + ')';
    }).join(', ');

    if (scope) {
      scope = '**' + scope + '** - ';
    }

    if (links) {
      links = ' (' + links + ')';
    }

    if (entry.subjectLink) {
      subject = '[' + subject + '](' + entry.subjectLink + ')';
    }

    lines.push('' + titleBullet + scope + subject + links);

    if (!entry.isLeaf()) {
      if (entry.children[0].isLeaf()) {
        lines.push('');
      }
    }
  }, function () {
    level--;
  });

  return lines.join('\n') + '\n\n';
};