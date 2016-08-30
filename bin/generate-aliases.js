#!/usr/bin/env node

var generate = require('../lib/generate.js');
generate(process.cwd()).then(function () {
  console.log('Aliases created!');
}).catch(function (err) {
  console.log(err.stack);
  process.exit(1);
});
