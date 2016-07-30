import assert, {equal} from 'assert';
import Step from '../src/Step';
import Sequence from '../src/Sequence';

describe('@Step', function() {
  it('Initializes step sequence', function() {
    class TestClass1 {
      @Step()
      doSomething() {
      }
    }

    assert(TestClass1.steps instanceof Sequence);
  });

  it('Adds a named step to target class property', function() {
    class TestClass2 {
      @Step('do-something')
      doSomething() {
      }
    }

    equal(TestClass2.steps[0].name, 'do-something');
  });

  it('Adds a named step from method name to target class property', function() {
    class TestClass3 {
      @Step()
      doSomething() {
      }
    }

    equal(TestClass3.steps[0].name, 'doSomething');
  });
});
