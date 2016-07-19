import getBump from '../../src/defaults/get-bump';
import {equal} from 'assert';

describe('get-bump', function() {
  it('returns major if there is a breaking commit', function() {
    let bump = getBump([{breaking: true}]);
    equal(bump, 'major');
  });

  it('returns major if there is a breaking commit and a feature', function() {
    let bump = getBump([
      {breaking: true},
      {type: 'feat'}
    ]);
    equal(bump, 'major');
  });

  it('returns minor if there is a feature', function() {
    let bump = getBump([{type: 'feat'}]);
    equal(bump, 'minor');
  });

  it('returns patch by default', function() {
    let bump = getBump([]);
    equal(bump, 'patch');
  });
});
