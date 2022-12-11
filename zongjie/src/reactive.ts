import { createProxy } from './effect.js'

const reactiveMap = new Map();

// 默认是深层次代理
export function reactive<O extends object>(obj: O) {
  // 先去获取是否创建过代理对象
  const existionProxy = reactiveMap.get(obj);
  if(existionProxy) return existionProxy;
  // 如果没有创建过代理对象直接创建代理对象
  const proxy = createProxy(obj)
  reactiveMap.set(obj, proxy)
  return proxy
}

// 浅代理
export function shallowReactive<O extends object>(obj: O) {
  return createProxy(obj, true)
}
