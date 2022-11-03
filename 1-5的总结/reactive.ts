import { createProxy } from './effect'

// 默认是深层次代理
export function reactive<O extends object>(obj: O) {
  return createProxy(obj)
}

// 浅代理
export function shallowReactive<O extends object>(obj: O) {
  return createProxy(obj, true)
}
