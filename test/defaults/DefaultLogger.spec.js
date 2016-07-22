import {spy, stub} from 'sinon';
import assert, {equal, deepEqual} from 'assert';
import DefaultLogger from '../../src/defaults/DefaultLogger';
import {bold, red, yellow, white, gray} from 'chalk';

describe('DefaultLogger', function() {
  describe('new DefaultLogger()', function() {
    it('has default level == info', function() {
      let logger = new DefaultLogger();
      equal(logger.level, 'info');
    });

    it('allows to override default level', function() {
      let logger = new DefaultLogger({
        logLevel: 'warn'
      });
      equal(logger.level, 'warn');
    });
  });

  describe('error', function() {
    it('calls log with level = error', function() {
      let logger = new DefaultLogger();
      stub(logger, 'log');
      logger.error('message', {a: 1});
      assert(logger.log.calledWith('error', 'message', {a: 1}));
    });
  });

  describe('warn', function() {
    it('calls log with level = warn', function() {
      let logger = new DefaultLogger();
      stub(logger, 'log');
      logger.warn('message', {a: 1});
      assert(logger.log.calledWith('warn', 'message', {a: 1}));

    });
  });

  describe('info', function() {
    it('calls log with level = info', function() {
      let logger = new DefaultLogger();
      stub(logger, 'log');
      logger.info('message', {a: 1});
      assert(logger.log.calledWith('info', 'message', {a: 1}));
    });
  });

  describe('debug', function() {
    it('calls log with level = debug', function() {
      let logger = new DefaultLogger();
      stub(logger, 'log');
      logger.debug('message', {a: 1});
      assert(logger.log.calledWith('debug', 'message', {a: 1}));
    });
  });

  describe('log', function() {
    it('ignores log level under the current level', function() {
      let logger = new DefaultLogger({
        logLevel: 'error',
        console: {
          log: spy()
        }
      });

      logger.info('msg');

      assert(logger.console.log.called === false);
    });

    it('logs for log level equal or to the current level', function() {
      let logger = new DefaultLogger({
        logLevel: 'error',
        console: {
          log: spy()
        }
      });

      logger.error('err');
      assert(logger.console.log.called === true);
    });

    it('logs for log level above or to the current level', function() {
      let logger = new DefaultLogger({
        logLevel: 'warn',
        console: {
          log: spy()
        }
      });

      logger.error('err');

      assert(logger.console.log.called === true);
    });

    it('logs error in red', function() {
      let logger = new DefaultLogger({
        logLevel: 'debug',
        console: {
          log: spy()
        }
      });

      logger.error('msg');

      deepEqual(
        logger.console.log.args[0],
        [red(bold('error:') + ' msg')]
      );
    });

    it('logs warn in yellow', function() {
      let logger = new DefaultLogger({
        logLevel: 'debug',
        console: {
          log: spy()
        }
      });

      logger.warn('msg');

      deepEqual(
        logger.console.log.args[0],
        [yellow(bold('warn:') + ' msg')]
      );
    });
  });

  it('logs info in white', function() {
    let logger = new DefaultLogger({
      logLevel: 'debug',
      console: {
        log: spy()
      }
    });

    logger.info('msg');

    deepEqual(
      logger.console.log.args[0],
      [white(bold('info:') + ' msg')]
    );
  });

  it('logs debug in gray', function() {
    let logger = new DefaultLogger({
      logLevel: 'debug',
      console: {
        log: spy()
      }
    });

    logger.debug('msg');

    deepEqual(
      logger.console.log.args[0],
      [gray(bold('debug:') + ' msg')]
    );
  });
});
