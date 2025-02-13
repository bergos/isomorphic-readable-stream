'use strict'

const process = require('process')

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const { Writable } = require('../../lib/ours/index')

const assert = require('assert') // Ensure callback is always invoked before
// error is emitted. Regardless if error was
// sync or async.

{
  let callbackCalled = false // Sync Error

  const writable = new Writable({
    write: common.mustCall((buf, enc, cb) => {
      cb(new Error())
    })
  })
  writable.on(
    'error',
    common.mustCall(() => {
      assert.strictEqual(callbackCalled, true)
    })
  )
  writable.write(
    'hi',
    common.mustCall(() => {
      callbackCalled = true
    })
  )
}
{
  let callbackCalled = false // Async Error

  const writable = new Writable({
    write: common.mustCall((buf, enc, cb) => {
      process.nextTick(cb, new Error())
    })
  })
  writable.on(
    'error',
    common.mustCall(() => {
      assert.strictEqual(callbackCalled, true)
    })
  )
  writable.write(
    'hi',
    common.mustCall(() => {
      callbackCalled = true
    })
  )
}
{
  // Sync Error
  const writable = new Writable({
    write: common.mustCall((buf, enc, cb) => {
      cb(new Error())
    })
  })
  writable.on('error', common.mustCall())
  let cnt = 0 // Ensure we don't live lock on sync error

  while (writable.write('a')) cnt++

  assert.strictEqual(cnt, 0)
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
