import { createProxy } from './effect'

export function reactive<O extends object>(obj:O) {
    return createProxy(obj)
  }