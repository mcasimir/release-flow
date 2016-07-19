import {spy} from 'sinon';
import assert from 'assert';
import Sequence from '../src/Sequence';

describe('Sequence', function() {
  describe('run', function() {
    it('calls all the functions', async function() {
      let seq = new Sequence();

      seq.push(spy());
      seq.push(spy());
      seq.push(spy());

      let [fn1, fn2, fn3] = seq;

      await seq.run();

      assert(fn1.called);
      assert(fn2.called);
      assert(fn3.called);
    });

    it('works with runnables', async function() {
      let seq = new Sequence();

      let runnable1 = {run: spy()};
      let runnable2 = {run: spy()};
      let runnable3 = {run: spy()};

      seq.push(runnable1);
      seq.push(runnable2);
      seq.push(runnable3);

      await seq.run();

      assert(runnable1.run.called);
      assert(runnable2.run.called);
      assert(runnable3.run.called);
    });

    it('rejects if one of the runnables throws', async function() {
      let seq = new Sequence();
      let err = new Error('success');
      seq.push(() => {
        throw err;
      });

      try {
        await seq.run();
        assert.fail('seq.run was expected to throw');
      } catch (e) {
        if (e.message !== 'success') {
          throw e;
        }
      }
    });
  });
});
