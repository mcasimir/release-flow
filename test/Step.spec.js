import {equal} from 'assert';
import Step from '../src/Step';
import {spy} from 'sinon';

describe('Step', function() {
  it('Adds a named step to target class property', function() {
    class TestClass {
      @Step('myMethod')
      method() {
        spy();
      }
    }

    equal(TestClass.steps[0].name, 'myMethod');
  });
});
