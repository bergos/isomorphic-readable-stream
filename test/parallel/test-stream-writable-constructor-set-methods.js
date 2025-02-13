'use strict'

const { Buffer } = require('buffer')

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const assert = require('assert')

const { Writable } = require('../../lib/ours/index')

const bufferBlerg = Buffer.from('blerg')
const w = new Writable()
assert.throws(
  () => {
    w.end(bufferBlerg)
  },
  {
    name: 'Error',
    code: 'ERR_METHOD_NOT_IMPLEMENTED',
    message: 'The _write() method is not implemented'
  }
)

const _write = common.mustCall((chunk, _, next) => {
  next()
})

const _writev = common.mustCall((chunks, next) => {
  assert.strictEqual(chunks.length, 2)
  next()
})

const w2 = new Writable({
  write: _write,
  writev: _writev
})
assert.strictEqual(w2._write, _write)
assert.strictEqual(w2._writev, _writev)
w2.write(bufferBlerg)
w2.cork()
w2.write(bufferBlerg)
w2.write(bufferBlerg)
w2.end()
/* replacement start */

process.on('beforeExit', (code) => {
  if (code === 0) {
    tap.pass('test succeeded')
  } else {
    tap.fail(`test failed - exited code ${code}`)
  }
})
/* replacement end */
