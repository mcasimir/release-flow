'use strict';

let Release = require('.');
let release = new Release();

release.start()
  .then(function() {
    console.log('OK');
  })
  .catch(function(err) {
    console.log(err);
  });
