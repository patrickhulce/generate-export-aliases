var chai = require('chai');
var sinon = require('sinon');
chai.should();

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

global.relativeRequire = function (file) { return require('../lib/' + file); };
global.defineTest = function (file, func) {
  describe(file, function () {
    func(require('../lib/' + file));
  });
};
