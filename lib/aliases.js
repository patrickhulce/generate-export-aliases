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
          alias: key,
          source: value.replace(/^\.\//, '').replace(/\/$/, ''),
          isIndex: value.endsWith('/')
        }
      })
    },
    async createAlias(source, alias) {
      if (_.includes(alias, '*')) {
        return Promise.reject(new Error('nested and wildcard aliases not yet supported'))
      }

      const shouldUseIndexFolder = alias.isIndex
      const [aliasName, ...aliasFolderPathParts] = alias.split('/').reverse()
      const aliasFolderPath = path.join(
        rootDir,
        aliasFolderPathParts.join('/'),
        shouldUseIndexFolder ? aliasName : '',
      )
      fs.mkdirSync(aliasFolderPath, {recursive: true})
      const levelsOfNesting = aliasFolderPath.split('/').length - 1
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
