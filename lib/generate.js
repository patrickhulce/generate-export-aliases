const Promise = require('bluebird')
const aliasUtils = require('./aliases.js')

module.exports = function (rootDir) {
  const alias = aliasUtils(rootDir)

  return alias.getAliases().then(aliases => {
    return Promise.map(aliases, item => {
      return alias.createAlias(item)
    })
  })
}
