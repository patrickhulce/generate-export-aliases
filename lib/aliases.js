const fs = require('fs')
const path = require('path')

const _ = require('lodash')

function findSource(rootDir, file) {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    return filePath
  }

  return require.resolve(filePath)
}

module.exports = function (rootDir) {
  return {
    async getAliases() {
      const data = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
      const pkg = JSON.parse(data)
      const config = pkg.config || {}
      return _.map(config.exportAliases || {}, (value, key) => {
        return {
          alias: key.replace(/\/$/, ''),
          source: value.replace(/^\.\//, ''),
          isIndex: key.endsWith('/')
        }
      })
    },
    async createAlias({source, alias, isIndex}) {
      if (_.includes(alias, '*')) {
        return Promise.reject(new Error('nested and wildcard aliases not yet supported'))
      }

      const shouldUseIndexFolder = isIndex
      const parts = alias.split('/')
      const aliasName = parts.slice(-1)[0]
      const aliasFolderPathParts = parts.slice(0, -1)
      const aliasFolderRelativePath = aliasFolderPathParts.length || shouldUseIndexFolder ?
        path.join(
        aliasFolderPathParts.join('/'),
        shouldUseIndexFolder ? aliasName : ''
      ) : ''
      const aliasFolderPath = path.join(rootDir, aliasFolderRelativePath)
      fs.mkdirSync(aliasFolderPath, {recursive: true})
      const levelsOfNesting = aliasFolderRelativePath.length ? aliasFolderRelativePath.split('/').length : 0

      const pathToSource = levelsOfNesting
        ? '../'.repeat(levelsOfNesting) + source
        : './' + source

      const sourceJsPath = findSource(rootDir, './' + source)
      const sourceRaw = fs.readFileSync(sourceJsPath).toString()
      // eslint-disable-next-line unicorn/prefer-starts-ends-with
      const maybeIsEsm = sourceRaw.match(/^export /m)
      const sourceDTsPath = sourceJsPath.replace(/\.js$/, '.d.ts')
      const fileName = shouldUseIndexFolder ? 'index' : aliasName
      const destJsPath = path.join(aliasFolderPath, fileName + '.js')
      const destDTsPath = path.join(aliasFolderPath, fileName + '.d.ts')
      if (fs.existsSync(sourceDTsPath)) {
        fs.writeFileSync(destDTsPath, `export * from '${pathToSource}'\n`, 'utf8')
      }

      const contents = maybeIsEsm
        ? `export * from "${pathToSource}"\n`
        : `module.exports = require("${pathToSource}")\n`

      return fs.writeFileSync(destJsPath, contents, 'utf8')
    },
  }
}
