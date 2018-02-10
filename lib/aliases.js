const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const Promise = require('bluebird')

Promise.promisifyAll(fs)

function findSource(rootDir, file) {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    return filePath
  }

  return require.resolve(filePath)
}

module.exports = function (rootDir) {
  return {
    getAliases() {
      return fs.readFileAsync(path.join(rootDir, 'package.json'), 'utf8').then(data => {
        const pkg = JSON.parse(data)
        const config = pkg.config || {}
        return _.map(config.exportAliases || {}, (value, key) => {
          if (value.indexOf('./') !== 0) {
            value = './' + value
          }
          return {alias: key, source: value}
        })
      })
    },
    createAlias(source, alias) {
      if (_.includes(alias, '*') || _.includes(alias, '/')) {
        return Promise.reject(new Error('nested and wildcard aliases not yet supported'))
      }

      const fileContents = 'module.exports = require("' + source + '");\n'
      return fs.writeFileAsync(path.join(rootDir, alias + '.js'), fileContents, 'utf8')
    },
  }
}
