import { createProxy } from './effect.js'

// 只读代理对象函数
export function readonly<O extends object>(obj: O) {
    return createProxy(obj, false, true)
}

// 浅只读
export function shallowReadonly<O extends object>(obj: O) {
    return createProxy(obj, true, true)
}