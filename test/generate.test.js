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
        fs.statSync(app1Dir + '/other.js')
        fs.statSync(app1Dir + '/other.d.ts')
        fs.unlinkSync(app1Dir + '/myFile.js')
        fs.unlinkSync(app1Dir + '/other.d.ts')
        fs.unlinkSync(app1Dir + '/other.js')
      })
    })
  })
})
