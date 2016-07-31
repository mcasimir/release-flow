import {stub} from 'sinon';
import assert, {deepEqual} from 'assert';
import Phase, {Step as PhaseStep} from '../src/Phase';
import Step from '../src/Step';
import Sequence from '../src/Sequence';

describe('Phase', function() {
  it('exports Step', function() {
    assert(PhaseStep === Step);
  });

  describe('new Phase()', function() {
    it('grabs steps from extending class scope (if any)', function() {
      class X extends Phase {
        static steps = [1, 2, 3];
      }

      let x = new X();

      deepEqual(x.steps, X.steps);
    });

    it('creates new Sequence if steps are not found in class', function() {
      let phase = new Phase();

      assert(phase.steps instanceof Sequence);
    });
  });

  describe('step', function() {
    it('adds a step', function() {
      let phase = new Phase();

      phase.step({name: 'A'});
      phase.step({name: 'B'});

      deepEqual(phase.steps, [
        {name: 'A'},
        {name: 'B'}
      ]);
    });
  });

  describe('before', function() {
    it('insert callback before the given step', function() {
      let phase = new Phase();

      phase.step({name: 'A'});
      phase.step({name: 'B'});

      phase.before('B', {name: 'C'});

      deepEqual(phase.steps, [
        {name: 'A'},
        {name: 'C'},
        {name: 'B'}
      ]);
    });
  });

  describe('replace', function() {
    it('replace the given step', function() {
      let phase = new Phase();

      phase.step({name: 'A'});
      phase.step({name: 'B'});

      phase.replace('B', {name: 'C'});

      deepEqual(phase.steps, [
        {name: 'A'},
        {name: 'C'}
      ]);
    });
  });

  describe('run', function() {
    it('calls steps run', function() {
      let phase = new Phase();

      stub(phase.steps, 'run');

      phase.run({x: 1});

      assert(phase.steps.run.calledWith({x: 1}));
    });
  });
});
