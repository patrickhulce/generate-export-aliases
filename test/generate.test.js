var fs = require('fs');
var Promise = require('bluebird');

defineTest('generate.js', function (generate) {
  var app1Dir = __dirname + '/fixtures/app1';
  var app2Dir = __dirname + '/fixtures/app2';
  var app3Dir = __dirname + '/fixtures/app3';

  it('should create the specified aliases', function () {
    return generate(app1Dir).then(function () {
      return Promise.try(function () {
        fs.statSync(app1Dir + '/myFile.js');
        fs.statSync(app1Dir + '/other.js');
        fs.unlinkSync(app1Dir + '/myFile.js');
        fs.unlinkSync(app1Dir + '/other.js');
      });
    });
  });
});
