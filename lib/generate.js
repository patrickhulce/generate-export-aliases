var Promise = require('bluebird');
var aliasUtils = require('./aliases.js');

module.exports = function (rootDir) {
  var alias = aliasUtils(rootDir);

  return alias.getAliases().then(function (aliases) {
    return Promise.map(aliases, function (item) {
      return alias.createAlias(item.source, item.alias);
    });
  });
};
