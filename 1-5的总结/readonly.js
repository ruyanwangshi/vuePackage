import { createProxy } from './effect.js';
// 只读代理对象函数
export function readonly(obj) {
    return createProxy(obj, false, true);
}
// 浅只读
export function shallowReadonly(obj) {
    return createProxy(obj, true, true);
}
