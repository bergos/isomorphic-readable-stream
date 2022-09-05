'use strict'

const process = require('process')

const tap = require('tap')

const silentConsole = {
  log() {},

  error() {}
}
const common = require('../common')

const assert = require('assert')

const stream = require('../../lib/ours/index') // Ensure consistency between the finish event when using cork()
// and writev and when not using them

{
  const writable = new stream.Writable()

  writable._write = (chunks, encoding, cb) => {
    cb(new Error('write test error'))
  }

  writable.on('finish', common.mustNotCall())
  writable.on('prefinish', common.mustNotCall())
  writable.on(
    'error',
    common.mustCall((er) => {
      assert.strictEqual(er.message, 'write test error')
    })
  )
  writable.end('test')
}
{
  const writable = new stream.Writable()

  writable._write = (chunks, encoding, cb) => {
    setTimeout(cb.bind(null, new Error('write test error')), 1)
  }

  writable.on('finish', common.mustNotCall())
  writable.on('prefinish', common.mustNotCall())
  writable.on(
    'error',
    common.mustCall((er) => {
      assert.strictEqual(er.message, 'write test error')
    })
  )
  writable.end('test')
}
{
  const writable = new stream.Writable()

  writable._write = (chunks, encoding, cb) => {
    cb(new Error('write test error'))
  }

  writable._writev = (chunks, cb) => {
    cb(new Error('writev test error'))
  }

  writable.on('finish', common.mustNotCall())
  writable.on('prefinish', common.mustNotCall())
  writable.on(
    'error',
    common.mustCall((er) => {
      assert.strictEqual(er.message, 'writev test error')
    })
  )
  writable.cork()
  writable.write('test')
  setTimeout(function () {
    writable.end('test')
  }, 1)
}
{
  const writable = new stream.Writable()

  writable._write = (chunks, encoding, cb) => {
    setTimeout(cb.bind(null, new Error('write test error')), 1)
  }

  writable._writev = (chunks, cb) => {
    setTimeout(cb.bind(null, new Error('writev test error')), 1)
  }

  writable.on('finish', common.mustNotCall())
  writable.on('prefinish', common.mustNotCall())
  writable.on(
    'error',
    common.mustCall((er) => {
      assert.strictEqual(er.message, 'writev test error')
    })
  )
  writable.cork()
  writable.write('test')
  setTimeout(function () {
    writable.end('test')
  }, 1)
} // Regression test for
// https://github.com/nodejs/node/issues/13812

{
  const rs = new stream.Readable()
  rs.push('ok')
  rs.push(null)

  rs._read = () => {}

  const ws = new stream.Writable()
  ws.on('finish', common.mustNotCall())
  ws.on('error', common.mustCall())

  ws._write = (chunk, encoding, done) => {
    setTimeout(done.bind(null, new Error()), 1)
  }

  rs.pipe(ws)
}
{
  const rs = new stream.Readable()
  rs.push('ok')
  rs.push(null)

  rs._read = () => {}

  const ws = new stream.Writable()
  ws.on('finish', common.mustNotCall())
  ws.on('error', common.mustCall())

  ws._write = (chunk, encoding, done) => {
    done(new Error())
  }

  rs.pipe(ws)
}
{
  const w = new stream.Writable()

  w._write = (chunk, encoding, cb) => {
    process.nextTick(cb)
  }

  w.on('error', common.mustCall())
  w.on('finish', common.mustNotCall())
  w.on('prefinish', () => {
    w.write("shouldn't write in prefinish listener")
  })
  w.end()
}
{
  const w = new stream.Writable()

  w._write = (chunk, encoding, cb) => {
    process.nextTick(cb)
  }

  w.on('error', common.mustCall())
  w.on('finish', () => {
    w.write("shouldn't write in finish listener")
  })
  w.end()
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
