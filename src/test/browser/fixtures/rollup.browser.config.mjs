import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodePolyfill from 'rollup-plugin-polyfill-node'

export default {
  input: ['test/browser/test-browser.js'],
  output: {
    file: 'tmp/rollup/suite.browser.js',
    format: 'iife',
    name: 'readableStreamTestSuite'
  },
  plugins: [
    commonjs(),
    nodePolyfill(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    })
  ]
}
