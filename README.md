# generate-export-aliases

[![NPM Package](https://badge.fury.io/js/generate-export-aliases.svg)](https://www.npmjs.com/package/generate-export-aliases)
[![Build Status](https://travis-ci.org/patrickhulce/generate-export-aliases.svg?branch=master)](https://travis-ci.org/patrickhulce/generate-export-aliases)
[![Coverage Status](https://coveralls.io/repos/github/patrickhulce/generate-export-aliases/badge.svg?branch=master)](https://coveralls.io/github/patrickhulce/generate-export-aliases?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/generate-export-aliases.svg)](https://david-dm.org/patrickhulce/generate-export-aliases)

Generates additional files to make requiring files deep in your node module easy and safe from refactoring.

## Usage

Save `generate-export-aliases` as a dev dependency in your `package.json`.

```sh
npm i -D generate-export-aliases
```

Add a prepublish hook and the exports you wish to alias to the `config` section of your `package.json` under `exportAliases`.
For example, if you wanted to alias the `myHelper.js` file in the following directory structure...

#### Example Folder Structure

```
├── LICENSE
├── README.md
├── package.json
├── lib
│   ├── fileA.js
│   ├── fileB.js
│   ├── fileC.js
│   └── shared
│       ├── myHelper.js
│       └── otherHelper.js
```

#### `package.json`

```json
{
  "name": "my-fantastic-library",
  "scripts": {
    "prepublish": "generate-export-aliases"
  },
  "config": {
    "exportAliases": {
      "exposed-helper": "./lib/shared/myHelper.js"
    }
  }
}
```

#### Requiring Your Alias

```js
const exposedHelper = require('my-fantastic-library/exposed-helper')
const exposedHelperOriginal = require('my-fantastic-library/lib/shared/myHelper.js')
exposedHelper === exposedHelperOriginal // true
```

## Inspiration

[lodash](https://github.com/lodash/lodash)'s build process
