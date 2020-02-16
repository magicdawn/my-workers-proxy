const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const pkg = require('./package.json')

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'esm',
      exports: 'named',
    },
  ],

  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs({
      exclude: 'src/**',
    }),
    resolve({
      preferBuiltins: false,
    }),
  ],
}
