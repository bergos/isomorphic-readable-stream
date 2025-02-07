'use strict'

const process = require('process')

const { Buffer } = require('buffer')

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const stream = require('../../lib/ours/index')

const assert = require('assert')

const readable = new stream.Readable({
  read: () => {}
})
const writables = []

for (let i = 0; i < 5; i++) {
  const target = new stream.Writable({
    write: common.mustCall((chunk, encoding, callback) => {
      target.output.push(chunk)
      callback()
    }, 1)
  })
  target.output = []
  target.on('pipe', common.mustCall())
  readable.pipe(target)
  writables.push(target)
}

const input = Buffer.from([1, 2, 3, 4, 5])
readable.push(input) // The pipe() calls will postpone emission of the 'resume' event using nextTick,
// so no data will be available to the writable streams until then.

process.nextTick(
  common.mustCall(() => {
    for (const target of writables) {
      assert.deepStrictEqual(target.output, [input])
      target.on('unpipe', common.mustCall())
      readable.unpipe(target)
    }

    readable.push('something else') // This does not get through.

    readable.push(null)
    readable.resume() // Make sure the 'end' event gets emitted.
  })
)
readable.on(
  'end',
  common.mustCall(() => {
    for (const target of writables) {
      assert.deepStrictEqual(target.output, [input])
    }
  })
)
/* replacement start */

process.on('beforeExit', (code) => {
  if (code === 0) {
    tap.pass('test succeeded')
  } else {
    tap.fail(`test failed - exited code ${code}`)
  }
})
/* replacement end */
