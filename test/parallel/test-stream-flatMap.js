/* replacement start */
const AbortController = globalThis.AbortController || require('abort-controller').AbortController

const AbortSignal = globalThis.AbortSignal || require('abort-controller').AbortSignal

const EventTarget = globalThis.EventTarget || require('event-target-shim').EventTarget

if (typeof AbortSignal.abort !== 'function') {
  AbortSignal.abort = function () {
    const controller = new AbortController()
    controller.abort()
    return controller.signal
  }
}
/* replacement end */

;('use strict')

const { Buffer } = require('buffer')

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const fixtures = require('../common/fixtures')

const { Readable } = require('../../lib/ours/index')

const assert = require('assert')

const st = require('timers').setTimeout

function setTimeout(ms) {
  return new Promise((resolve) => {
    st(resolve, ms)
  })
}

const { createReadStream } = require('fs')

function oneTo5() {
  return Readable.from([1, 2, 3, 4, 5])
}

{
  // flatMap works on synchronous streams with a synchronous mapper
  ;(async () => {
    assert.deepStrictEqual(
      await oneTo5()
        .flatMap((x) => [x + x])
        .toArray(),
      [2, 4, 6, 8, 10]
    )
    assert.deepStrictEqual(
      await oneTo5()
        .flatMap(() => [])
        .toArray(),
      []
    )
    assert.deepStrictEqual(
      await oneTo5()
        .flatMap((x) => [x, x])
        .toArray(),
      [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
    )
  })().then(common.mustCall())
}
{
  // flatMap works on sync/async streams with an asynchronous mapper
  ;(async () => {
    assert.deepStrictEqual(
      await oneTo5()
        .flatMap(async (x) => [x, x])
        .toArray(),
      [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
    )
    const asyncOneTo5 = oneTo5().map(async (x) => x)
    assert.deepStrictEqual(await asyncOneTo5.flatMap(async (x) => [x, x]).toArray(), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5])
  })().then(common.mustCall())
}
{
  // flatMap works on a stream where mapping returns a stream
  ;(async () => {
    const result = await oneTo5()
      .flatMap(async (x) => {
        return Readable.from([x, x])
      })
      .toArray()
    assert.deepStrictEqual(result, [1, 1, 2, 2, 3, 3, 4, 4, 5, 5])
  })().then(common.mustCall()) // flatMap works on an objectMode stream where mappign returns a stream
  ;(async () => {
    const result = await oneTo5()
      .flatMap(() => {
        return createReadStream(fixtures.path('x.txt'))
      })
      .toArray() // The resultant stream is in object mode so toArray shouldn't flatten

    assert.strictEqual(result.length, 5)
    assert.deepStrictEqual(
      Buffer.concat(result).toString(),
      (process.platform === 'win32' ? 'xyz\r\n' : 'xyz\n').repeat(5)
    )
  })().then(common.mustCall())
}
{
  // Concurrency + AbortSignal
  const ac = new AbortController()
  const stream = oneTo5().flatMap(
    common.mustNotCall(async (_, { signal }) => {
      await setTimeout(100, {
        signal
      })
    }),
    {
      signal: ac.signal,
      concurrency: 2
    }
  ) // pump

  assert
    .rejects(
      async () => {
        for await (const item of stream) {
          // nope
          silentConsole.log(item)
        }
      },
      {
        name: 'AbortError'
      }
    )
    .then(common.mustCall())
  queueMicrotask(() => {
    ac.abort()
  })
}
{
  // Already aborted AbortSignal
  const stream = oneTo5().flatMap(
    common.mustNotCall(async (_, { signal }) => {
      await setTimeout(100, {
        signal
      })
    }),
    {
      signal: AbortSignal.abort()
    }
  ) // pump

  assert
    .rejects(
      async () => {
        for await (const item of stream) {
          // nope
          silentConsole.log(item)
        }
      },
      {
        name: 'AbortError'
      }
    )
    .then(common.mustCall())
}
{
  // Error cases
  assert.throws(() => Readable.from([1]).flatMap(1), /ERR_INVALID_ARG_TYPE/)
  assert.throws(
    () =>
      Readable.from([1]).flatMap((x) => x, {
        concurrency: 'Foo'
      }),
    /ERR_OUT_OF_RANGE/
  )
  assert.throws(() => Readable.from([1]).flatMap((x) => x, 1), /ERR_INVALID_ARG_TYPE/)
  assert.throws(
    () =>
      Readable.from([1]).flatMap((x) => x, {
        signal: true
      }),
    /ERR_INVALID_ARG_TYPE/
  )
}
{
  // Test result is a Readable
  const stream = oneTo5().flatMap((x) => x)
  assert.strictEqual(stream.readable, true)
}
{
  const stream = oneTo5()
  Object.defineProperty(stream, 'map', {
    value: common.mustNotCall(() => {})
  }) // Check that map isn't getting called.

  stream.flatMap(() => true)
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
