import assert, {equal, deepEqual} from 'assert';
import {stub} from 'sinon';
import Release from '../src/Release';

describe('Release', function() {
  it('has plugins map', function() {
    deepEqual(Release.plugins, {});
  });

  describe('static registerPlugin', function() {
    it('registers a plugin', function() {
      let pluginsBackup = Release.plugins;
      let modifiedPlugins = {};
      Release.plugins = modifiedPlugins;
      Release.registerPlugin('x', 'y');
      Release.plugins = pluginsBackup;
      equal(modifiedPlugins.x, 'y');
    });
  });

  describe('start', function() {
    it('runs start phase', function() {
      let release = new Release();
      release.phases.start.run = stub();
      release.start();
      assert(release.phases.start.run.calledWith(release));
    });
  });

  describe('publish', function() {
    it('runs publish phase', function() {
      let release = new Release();
      release.phases.publish.run = stub();
      release.publish();
      assert(release.phases.publish.run.calledWith(release));
    });
  });

  describe('finish', function() {
    it('runs finish phase', function() {
      let release = new Release();
      release.phases.finish.run = stub();
      release.finish();
      assert(release.phases.finish.run.calledWith(release));
    });
  });

  describe('full', function() {
    it('invokes start, publish and finish', async function() {
      let release = new Release();
      release.start = stub().returns(Promise.resolve());
      release.publish = stub().returns(Promise.resolve());
      release.finish = stub().returns(Promise.resolve());

      await release.full();

      assert(release.start.called);
      assert(release.publish.called);
      assert(release.finish.called);
    });
  });

  describe('error', function() {
    it('invokes error factory', function() {
      let release = new Release();

      stub(release.errorFactory, 'createError');

      release.error(1, 2, 3);

      assert(release.errorFactory.createError.calledWith(1, 2, 3));
    });
  });

  describe('new Release()', function() {
    it('attaches all the plugins', function() {
      stub(Release.prototype, 'plugin');

      let release = new Release({
        plugins: ['x', 'y', 'z']
      });

      let stubbedMethod = release.plugin;

      Release.prototype.plugin.restore();

      assert(stubbedMethod.calledWith('x'));
      assert(stubbedMethod.calledWith('y'));
      assert(stubbedMethod.calledWith('z'));
    });
  });

  describe('plugin', function() {
    it('invokes anonymous plugins', function() {
      let release = new Release();
      let fn = stub();
      release.plugin(fn);
      assert(fn.calledWith(release));
    });

    it('invokes named plugins', function() {
      let release = new Release();
      let fn = stub();

      let pluginsBackup = Release.plugins;
      let modifiedPlugins = {};
      Release.plugins = modifiedPlugins;
      Release.registerPlugin('fn', fn);

      release.plugin('fn');
      Release.plugins = pluginsBackup;

      assert(fn.calledWith(release));
    });
  });
});
