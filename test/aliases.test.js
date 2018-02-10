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
          {alias: 'other', source: './lib/other.js'},
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
      return aliasUtils(app3Dir).createAlias('source', 'alias').then(() => {
        return Promise.try(() => {
          fs.statSync(app3Dir + '/alias.js')
          fs.unlinkSync(app3Dir + '/alias.js')
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

    it('should fail for nested aliases', () => {
      return aliasUtils(app3Dir).createAlias('./src', 'nested/alias').should.eventually.be.rejected
    })

    it('should fail for wildcard aliases', () => {
      return aliasUtils(app3Dir).createAlias('./src', 'nested/*').should.eventually.be.rejected
    })
  })
})
