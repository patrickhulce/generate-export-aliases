#!/usr/bin/env node

const generate = require('../lib/generate.js')

generate(process.cwd()).then(() => {
  process.stdout.write('Aliases created!')
}).catch(err => {
  process.stdout.write(err.stack)
  process.exit(1)
})
