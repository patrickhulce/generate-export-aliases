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

      const sourceJsPath = findSource(rootDir, source)
      const sourceRaw = fs.readFileSync(sourceJsPath).toString()
      // eslint-disable-next-line unicorn/prefer-starts-ends-with
      const maybeIsEsm = sourceRaw.match(/^export /m)
      const sourceDTsPath = sourceJsPath.replace(/\.js$/, '.d.ts')
      const destJsPath = path.join(rootDir, alias + '.js')
      const destDTsPath = path.join(rootDir, alias + '.d.ts')
      if (fs.existsSync(sourceDTsPath)) {
        fs.writeFileSync(destDTsPath, `export * from '${source}'\n`, 'utf8')
      }

      const contents = maybeIsEsm ?
        `export * from "${source}"\n` :
        `module.exports = require("${source}")\n`

      return fs.writeFileAsync(destJsPath, contents, 'utf8')
    },
  }
}
