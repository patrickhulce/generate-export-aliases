var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');

Promise.promisifyAll(fs);

module.exports = function (rootDir) {
  return {
    getAliases: function () {
      return fs.readFileAsync(path.join(rootDir, 'package.json'), 'utf8').then(function (data) {
        var pkg = JSON.parse(data);
        var config = pkg.config || {};
        return _.map(config.exportAliases || {}, function (value, key) {
          if (value.indexOf('./') !== 0) { value = './' + value; }
          return {alias: key, source: value};
        });
      });
    },
    createAlias: function (source, alias) {
      if (_.includes(alias, '*') || _.includes(alias, '/')) {
        return Promise.reject(new Error('nested and wildcard aliases not yet supported'));
      }

      var fileContents = 'module.exports = require("' + source + '");\n';
      return fs.writeFileAsync(path.join(rootDir, alias + '.js'), fileContents, 'utf8');
    },
  };
};
