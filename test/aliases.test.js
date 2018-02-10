/* eslint-disable no-path-concat */
require('./bootstrap')

const fs = require('fs')
const Promise = require('bluebird')
const aliasUtils = require('../lib/aliases')

describe('lib/aliases.js', () => {
  const app1Dir = __dirname + '/fixtures/app1'
  const app2Dir = __dirname + '/fixtures/app2'
  const app3Dir = __dirname + '/fixtures/app3'

  describe('#getAliases', () => {
    it('should read the aliases from package.json config', () => {
      return aliasUtils(app1Dir).getAliases().then(aliases => {
        aliases.should.eql([
          {alias: 'myFile', source: './lib/fileA.js'},
          {alias: 'other', source: './lib/other'},
        ])
      })
    })

    it('should default to no aliases', () => {
      return aliasUtils(app2Dir + '/').getAliases().then(aliases => {
        aliases.should.eql([])
      })
    })

    it('should fail when no package.json is found', () => {
      return aliasUtils(app3Dir).getAliases().should.eventually.be.rejected
    })
  })

  describe('#createAlias', () => {
    it('should create a file in the root dir', () => {
      return aliasUtils(app3Dir).createAlias('file', 'alias').then(() => {
        return Promise.try(() => {
          fs.statSync(app3Dir + '/alias.js')
          fs.unlinkSync(app3Dir + '/alias.js')
        })
      })
    })

    it('should create .d.ts files when appropriate', () => {
      return aliasUtils(app1Dir).createAlias('lib/other', 'alias').then(() => {
        return Promise.try(() => {
          const contents = fs.readFileSync(app1Dir + '/alias.d.ts', 'utf8')
          contents.should.contain('export * from')
          fs.unlinkSync(app1Dir + '/alias.js')
          fs.unlinkSync(app1Dir + '/alias.d.ts')
        })
      })
    })

    it('should point the alias to the source file', () => {
      return aliasUtils(app3Dir).createAlias('./file.js', 'alias').then(() => {
        return Promise.try(() => {
          const original = require(app3Dir + '/file.js')
          const aliased = require(app3Dir + '/alias.js')
          original.should.equal(aliased)
          fs.unlinkSync(app3Dir + '/alias.js')
        })
      })
    })

    it('should fail for missing files', () => {
      return (() => aliasUtils(app3Dir).createAlias('./missing', 'alias')).should.throw(/Cannot find/)
    })

    it('should fail for nested aliases', () => {
      return aliasUtils(app3Dir).createAlias('./file', 'nested/alias').should.eventually.be.rejected
    })

    it('should fail for wildcard aliases', () => {
      return aliasUtils(app3Dir).createAlias('./file', 'nested/*').should.eventually.be.rejected
    })
  })
})
