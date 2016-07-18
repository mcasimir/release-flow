import assert from 'assert';
import DefaultErrorFactory from '../src/DefaultErrorFactory';

describe('DefaultErrorFactory', function() {
  describe('create', function() {
    it('Creates a generic error', function() {
      let errorFactory = new DefaultErrorFactory();
      let error = errorFactory.create('Abc');
      assert(error instanceof Error);
      assert(error.message === 'Abc');
      assert(error.name === 'Error');
    });
  });
});
