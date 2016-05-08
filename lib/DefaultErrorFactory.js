'use strict';

class DefaultErrorFactory {
  constructor() {
  }

  create(message) {
    return new Error(message);
  }
}

module.exports = DefaultErrorFactory;
