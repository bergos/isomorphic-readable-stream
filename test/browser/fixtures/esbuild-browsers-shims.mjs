import * as processModule from 'process-es6'

export const process = processModule

export function setImmediate(fn, ...args) {
  setTimeout(() => fn(...args), 1)
}
