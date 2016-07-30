export default function(commits) {
  let bump = 'patch';
  commits.forEach(function(commit) {
    if (commit.breaking) {
      bump = 'major';
    } else if (commit.type === 'feat' && bump === 'patch') {
      bump = 'minor';
    }
  });
  return bump;
}
