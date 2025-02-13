'use strict'

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const { Writable } = require('../../lib/ours/index')

const assert = require('assert') // basic

{
  // Find it on Writable.prototype
  assert(Reflect.has(Writable.prototype, 'writableFinished'))
} // event

{
  const writable = new Writable()

  writable._write = (chunk, encoding, cb) => {
    // The state finished should start in false.
    assert.strictEqual(writable.writableFinished, false)
    cb()
  }

  writable.on(
    'finish',
    common.mustCall(() => {
      assert.strictEqual(writable.writableFinished, true)
    })
  )
  writable.end(
    'testing finished state',
    common.mustCall(() => {
      assert.strictEqual(writable.writableFinished, true)
    })
  )
}
{
  // Emit finish asynchronously.
  const w = new Writable({
    write(chunk, encoding, cb) {
      cb()
    }
  })
  w.end()
  w.on('finish', common.mustCall())
}
{
  // Emit prefinish synchronously.
  const w = new Writable({
    write(chunk, encoding, cb) {
      cb()
    }
  })
  let sync = true
  w.on(
    'prefinish',
    common.mustCall(() => {
      assert.strictEqual(sync, true)
    })
  )
  w.end()
  sync = false
}
{
  // Emit prefinish synchronously w/ final.
  const w = new Writable({
    write(chunk, encoding, cb) {
      cb()
    },

    final(cb) {
      cb()
    }
  })
  let sync = true
  w.on(
    'prefinish',
    common.mustCall(() => {
      assert.strictEqual(sync, true)
    })
  )
  w.end()
  sync = false
}
{
  // Call _final synchronously.
  let sync = true
  const w = new Writable({
    write(chunk, encoding, cb) {
      cb()
    },

    final: common.mustCall((cb) => {
      assert.strictEqual(sync, true)
      cb()
    })
  })
  w.end()
  sync = false
}
/* replacement start */

process.on('beforeExit', (code) => {
  if (code === 0) {
    tap.pass('test succeeded')
  } else {
    tap.fail(`test failed - exited code ${code}`)
  }
})
/* replacement end */
