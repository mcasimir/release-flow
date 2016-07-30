import execCommand from '../src/execCommand';
import {stub} from 'sinon';
import {equal, deepEqual} from 'assert';
import childProcess from 'child_process';

describe('execCommand', function() {
  it('trims execSync stdout', function() {
    stub(childProcess, 'execSync', function() {
      return new Buffer(' my string\n');
    });

    equal(execCommand('abc'), 'my string');
  });

  it('returns stdout as an array of lines with splitLines option', function() {
    stub(childProcess, 'execSync', function() {
      return new Buffer(' line 1\nline 2\n \nline 3');
    });

    deepEqual(
      execCommand('abc', {splitLines: true}),
      ['line 1', 'line 2', 'line 3']
    );
  });

  afterEach(() => {
    if (childProcess.execSync.restore) {
      childProcess.execSync.restore();
    }
  });
});
