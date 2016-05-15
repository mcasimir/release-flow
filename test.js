'use strict';

let Release = require('.');
let release = new Release({
  logLevel: 'debug'
});

release.start()
  .then(function() {
    console.log('OK');
  })
  .catch(function(err) {
    console.log(err.stack);
  });
