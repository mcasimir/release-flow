import assert from 'assert';
import DefaultErrorFactory from '../../src/defaults/DefaultErrorFactory';

describe('DefaultErrorFactory', function() {
  describe('create', function() {
    it('Creates a generic error', function() {
      let errorFactory = new DefaultErrorFactory();
      let error = errorFactory.createError('Abc');
      assert(error instanceof Error);
      assert(error.message === 'Abc');
      assert(error.name === 'Error');
    });
  });
});
