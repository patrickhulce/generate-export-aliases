var fs = require('fs');
var Promise = require('bluebird');

defineTest('aliases.js', function (aliasUtils) {
  var app1Dir = __dirname + '/fixtures/app1';
  var app2Dir = __dirname + '/fixtures/app2';
  var app3Dir = __dirname + '/fixtures/app3';

  describe('#getAliases', function () {
    it('should read the aliases from package.json config', function () {
      return aliasUtils(app1Dir).getAliases().then(function (aliases) {
        aliases.should.eql([
          {alias: 'myFile', source: './lib/fileA.js'},
          {alias: 'other', source: './lib/other.js'},
        ]);
      });
    });

    it('should default to no aliases', function () {
      return aliasUtils(app2Dir + '/').getAliases().then(function (aliases) {
        aliases.should.eql([]);
      });
    });

    it('should fail when no package.json is found', function () {
      return aliasUtils(app3Dir).getAliases().should.eventually.be.rejected;
    });
  });

  describe('#createAlias', function () {
    it('should create a file in the root dir', function () {
      return aliasUtils(app3Dir).createAlias('source', 'alias').then(function () {
        return Promise.try(function () {
          fs.statSync(app3Dir + '/alias.js');
          fs.unlinkSync(app3Dir + '/alias.js');
        });
      });
    });

    it('should point the alias to the source file', function () {
      return aliasUtils(app3Dir).createAlias('./file.js', 'alias').then(function () {
        return Promise.try(function () {
          var original = require(app3Dir + '/file.js');
          var aliased = require(app3Dir + '/alias.js');
          original.should.equal(aliased);
          fs.unlinkSync(app3Dir + '/alias.js');
        });
      });
    });

    it('should fail for nested aliases', function () {
      return aliasUtils(app3Dir).createAlias('./src', 'nested/alias').should.eventually.be.rejected;
    });

    it('should fail for wildcard aliases', function () {
      return aliasUtils(app3Dir).createAlias('./src', 'nested/*').should.eventually.be.rejected;
    });
  });
});
