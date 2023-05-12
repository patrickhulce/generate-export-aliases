/* eslint-disable no-path-concat */
require('./bootstrap')

const fs = require('fs')
const Promise = require('bluebird')
const generate = require('../lib/generate')

describe('lib/generate.js', () => {
  const app1Dir = __dirname + '/fixtures/app1'

  it('should create the specified aliases', () => {
    return generate(app1Dir).then(() => {
      return Promise.try(() => {
        fs.statSync(app1Dir + '/myFile.js')
        fs.statSync(app1Dir + '/other/index.js')
        fs.statSync(app1Dir + '/other/index.d.ts')
        fs.statSync(app1Dir + '/nested/cjs/folder/path/index.js')
        fs.statSync(app1Dir + '/nested/esm/folder/path.js')

        require(app1Dir + '/myFile.js').should.equal('Hello, World!')
        require(app1Dir + '/nested/cjs/folder/path/index.js').should.equal('Hello, World!')

        fs.unlinkSync(app1Dir + '/myFile.js')
        fs.unlinkSync(app1Dir + '/other/index.js')
        fs.unlinkSync(app1Dir + '/other/index.d.ts')
        fs.unlinkSync(app1Dir + '/nested/cjs/folder/path/index.js')
        fs.unlinkSync(app1Dir + '/nested/esm/folder/path.js')
      })
    })
  })
})
