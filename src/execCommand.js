import {execSync} from 'child_process';

export default function execCommand(cmd, options = {}) {
  let stdout = execSync(cmd)
    .toString()
    .trim();

  if (options.splitLines) {
    stdout = stdout.split('\n')
      .map(function(line) {
        return line.trim();
      })
      .filter(function(line) {
        return line;
      });
  }

  return stdout;
}
