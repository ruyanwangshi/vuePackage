import { reactive } from './reactive'
import { readonly } from './readonly'

type Effect = {
  (): any
  deps: Array<Set<() => any>>
  scheduler?(effect?: () => any): any
}

const bucket = new WeakMap()
let activeEffect: Effect
const effectStack: Effect[] = []
const ITERATE_KEY = Symbol()
const ITERATE_KEYS_KEY = Symbol()
const OBJECT_KEY = Symbol()

const typeEvent = {
  set: 'set',
  add: 'add',
  delete: 'delete',
} as const

type Valueof<O> = O[keyof O]

// 映射数组方法，使includes、indexOf、lastIndexOf映射成正确的对象
const arrayMethods = {}

// 一个标记变量，代表是哦福进行追踪。默认为true，即允许追踪
let shouldTrack = true

;(['includes', 'indexOf', 'lastIndexOf'] as const).forEach((key) => {
  arrayMethods[key] = function (...arg: any[]) {
    const otherMethods = Array.prototype[key]
    let res = otherMethods.call(this, ...arg)
    if (res === false || res === '-1') {
      res = otherMethods.call(this.raw, ...arg)
    }
    return res
  }
})
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
  arrayMethods[method] = function (...arg: any[]) {
    const otherMethods = Array.prototype[method]
    shouldTrack = false
    const res = otherMethods.call(this, ...arg)
    shouldTrack = true
    return res
  }
})

// set 集合映射方法
// 定义一个对象，将自定义的 add 方法定义到该对象下
const mutableInstrumentations = function (isShallow: boolean = false, isReadonly = false) {
  console.log('this123=>', this)
  return {
    add(key) {
      // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
      const target = this.raw
      // 通过原始数据对象执行 add 方法添加具体的

      // 判断添加的值是否存在原集合中
      const hadKey = target.has(key)

      // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
      const res = target.add(key)

      // 调用trigger函数出发响应。并指定操作类型为ADD
      // 只有值未在集合中才会出发副作用函数
      if (!hadKey) {
        trigger(target, key, typeEvent.add)
      }
      return res
    },
    delete(key) {
      // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
      const target = this.raw
      // 通过原始数据对象执行 add 方法添加具体的

      // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
      const res = target.delete(key)

      // 调用trigger函数出发响应。并指定操作类型为ADD
      trigger(target, key, typeEvent.delete)
      return res
    },
    get(key) {
      // 取出原始对象
      const target = this.raw

      // 判断key是否存在于目标对象上面
      const had = target.has(key)

      if (!isShallow) {
        track(target, key)
      }

      if (had) {
        const res = target.get(key)
        return typeof res === 'object' && !isReadonly ? reactive(res) : res
      }
    },
    set(key, value) {
      if (isReadonly) {
        throw new Error('该对象是只读的！')
      }
      const target = this.raw

      const had = target.has(key)

      // 处理响应式数据污染普通数据的问题
      const rawValue = value.raw || value
      target.set(key, rawValue)
      const oldValue = target.get(key)
      if (!had) {
        trigger(target, key, typeEvent.add)
      } else if (value !== oldValue || (oldValue === oldValue && value === value)) {
        trigger(target, key, typeEvent.set)
      }
    },
    forEach(cb, thisArg) {
      // 获取原始对象
      const target = this.raw

      // forEach会关联对象的key的添加和删除操作的依赖关系，使用ITERATE_KEY来对这种对象进行依赖的收集操作
      track(target, ITERATE_KEY)

      // wrap 函数用来把可代理的值转换为响应式数据
      const wrap = (v) => (typeof v === 'object' ? reactive(v) : v)

      // 通过原始对象调用forEach把回调函数传进去
      target.forEach((k, v) => {
        cb.call(thisArg, wrap(k), wrap(v), this)
      })
    },
    [Symbol.iterator]: iteratorMethods,
    entries: iteratorMethods,
    values: () => {
      console.log('this=>', this);
      valueIteratorMethods('values')
    },
    keys: valueIteratorMethods.bind(this, 'keys'),
  }
}

function valueIteratorMethods(key) {
  // 获取原始对象
  const target = this.raw

  const iter = target[key]()
  if (key === 'keys') {
    track(target, ITERATE_KEYS_KEY)
  } else {
    track(target, ITERATE_KEY)
  }
  const wrap = (v) => (typeof v === 'object' ? reactive(v) : v)

  return {
    next() {
      const { value, done } = iter.next()
      return {
        value: value ? wrap(value) : value,
        done,
      }
    },

    [Symbol.iterator]() {
      return this
    },
  }
}

function iteratorMethods() {
  // 获取原始对象
  const target = this.raw

  const iter = target.entries()
  track(target, ITERATE_KEY)
  const wrap = (v) => (typeof v === 'object' ? reactive(v) : v)

  return {
    next() {
      const { value, done } = iter.next()
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done,
      }
    },

    [Symbol.iterator]() {
      return this
    },
  }
}

// 创建代理对象
export function createProxy<O extends object>(data: O, isShallow: boolean = false, isReadonly = false): O {
  return new Proxy<O>(data, {
    get(target: any, key: string, receiver: any) {
      if (key === 'raw') {
        return target
      }

      console.log('触发get=>', key, target)
      // 如果触发没有key那就创建一个key来进行收集副作用函数 // 暂时无法拦截没有属性的对象直接effect函数内部使用的情况
      // if(!key) {
      //   track(target, OBJECT_KEY);
      //   const res = Reflect.get(target. key, target);
      //   console.log('结果=>', res);
      //   return;
      // }

      // set 与 map 相关的逻辑代码
      // 如果是 set 对象需要修正getter函数内部的this指向
      // 如果读取的是 size 属性
      // 通过指定第三个参数 receiver 为原始对象 target 从而修复问题
      if (key === 'size') {
        // 调用track函数建立响应联系
        // 响应联系需要建立在 ITERATE_KEY 与副作用函数之间，这是因为任何新增、删除操作都会影响 size 属性。
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target)
        // 将方法与原始数据对象 target 绑定后返回 set 与 map 相关的逻辑代码
      } else if (mutableInstrumentations(isShallow, isReadonly)[key]) {
        return mutableInstrumentations.call(this, isShallow, isReadonly)[key]
      }

      if (arrayMethods[key]) {
        return Reflect.get(arrayMethods, key, receiver)
      }

      // 只有在不是只读的情况下收集依赖项的副作用函数,并且与内置的symbol不产生相关的绑定关系
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }

      const res = Reflect.get(target, key, receiver)

      // 是否开启浅代理
      if (isShallow) {
        return res
      }

      if (res !== null && typeof res === 'object') {
        return isReadonly ? readonly(res) : reactive(res)
        // return createProxy(res, isShallow, isReadonly)
      }

      return res
    },
    set(target: any, key: string, newValue: any, receiver: any) {
      // 只读属性是否开启
      if (isReadonly) {
        throw new Error(`该对象是只读，无法对属性  ${key}  值修改！`)
      }
      const oldValue = target[key]

      const isArray = Array.isArray(target)

      // 如果源对象属性上有该值那么就是设置，否则就是更新。
      const type = isArray ? (Number(key) >= target.length ? typeEvent.add : typeEvent.set) : Object.prototype.hasOwnProperty.call(target, key) ? typeEvent.set : typeEvent.add
      const res = Reflect.set(target, key, newValue, receiver)

      // console.log(newValue)
      // 如果target对象与代理对象的原始对象相等那么执行副作用函数
      if (target === receiver.raw) {
        if (oldValue !== newValue && (newValue === newValue || oldValue === oldValue)) {
          trigger(target, key, type, newValue)
        }
      }

      return res
    },
    has(target: any, p: string) {
      track(target, p)
      const hadKey = Reflect.has(target, p)
      return hadKey
    },
    deleteProperty(target, p) {
      if (isReadonly) {
        throw new Error(`该属性是只读！${String(p)}`)
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, p)
      const res = Reflect.deleteProperty(target, p)
      if (hadKey && res) {
        trigger(target, p, typeEvent.delete)
      }
      return res
    },
    // 使用 for in循环的时候
    ownKeys(target) {
      // 需要区别一下是数组还是普通对象；
      const isArray = Array.isArray(target)

      // 如果是数组则需要依赖length
      if (isArray) {
        track(target, 'length')
      } else {
        // 否则使用自己生成key
        track(target, ITERATE_KEY)
      }

      const res = Reflect.ownKeys(target)
      return res
    },
  })
}

// 收集副作用函数和代理对象之间的依赖
export function track<T extends object, K = string>(target: T, key: K) {
  if (!activeEffect || !shouldTrack) {
    return
  }

  let depsMap = bucket.get(target)

  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)

  activeEffect.deps.push(deps)
}

// 副作用函数和代理对象执行函数
export function trigger<T extends object, K = string>(target: T, key: K, type?: Valueof<typeof typeEvent>, newValue?: any) {
  const depsMap = bucket.get(target)

  if (!depsMap) {
    return
  }
  const deps: Set<Effect> = depsMap.get(key)
  const effctFn: Set<Effect> = new Set()

  deps &&
    deps.forEach((fn) => {
      if (fn !== activeEffect) {
        effctFn.add(fn)
      }
    })

  if (Array.isArray(target) && type === typeEvent.add) {
    const lengthEffect = depsMap.get('length')
    lengthEffect &&
      lengthEffect.forEach((fn) => {
        // if (fn !== activeEffect) {
        effctFn.add(fn)
        // }
      })
  }

  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, key) => {
      if (key >= newValue) {
        effects.forEach((fn) => {
          if (fn !== activeEffect) {
            effctFn.add(fn)
          }
        })
      }
    })
  }

  // if (Array.isArray(target)) {
  //   console.log('执行了添加add=>', type)
  //   // 如果是数组，那么添加新元素的时候会隐式增长length属性
  //   if (type === typeEvent.add) {
  //     const lengthEffect = depsMap.get('length')
  //     lengthEffect &&
  //       lengthEffect.forEach((fn) => {
  //         if (fn !== activeEffect) {
  //           effctFn.add(fn)
  //         }
  //       })
  //     // 如果key为length那么需要取出与length相关的所有副作用函数
  //   } else if (key === 'length') {
  //     depsMap.forEach((effects, key) => {
  //       // if (key === 'length') {
  //       //   effects.forEach((fn) => {
  //       //     if (fn !== activeEffect) {
  //       //       effctFn.add(fn)
  //       //     }
  //       //   })
  //       // } else if (key >= newValue) {
  //       //   effects.forEach((fn) => {
  //       //     if (fn !== activeEffect) {
  //       //       effctFn.add(fn)
  //       //     }
  //       //   })
  //       // }

  //       if (key >= newValue) {
  //         effects.forEach((fn) => {
  //           if (fn !== activeEffect) {
  //             effctFn.add(fn)
  //           }
  //         })
  //       }
  //     })
  //   }
  // } else {
  //   deps &&
  //     deps.forEach((fn) => {
  //       if (fn !== activeEffect) {
  //         effctFn.add(fn)
  //       }
  //     })
  // }

  // 在设置的时候把 for ... in 依赖的副作用函数取出来重新执行
  // 不只是单纯的普通对象的add 和 delete 还需要关心 map 对象上面的value的set

  if (type === typeEvent.add || type === typeEvent.delete || (type === typeEvent.set && {}.toString.call(target) === '[object Map]')) {
    const InitialEffect = depsMap.get(ITERATE_KEY)
    const mapKeysEffect = depsMap.get(ITERATE_KEYS_KEY)
    InitialEffect &&
      InitialEffect.forEach((fn) => {
        if (fn !== activeEffect) {
          effctFn.add(fn)
        }
      })
    mapKeysEffect &&
      mapKeysEffect.forEach((fn) => {
        if (fn !== activeEffect) {
          effctFn.add(fn)
        }
      })
  }

  effctFn &&
    effctFn.forEach((fn: Effect) => {
      if (fn?.scheduler) {
        fn.scheduler(fn)
      } else {
        fn()
      }
    })
}

export function effect<F extends (...arg: any[]) => any>(
  fn: F,
  options?: {
    scheduler?: (effect?: () => any) => void
    lazy?: boolean
  }
) {
  const effctFn: Effect = () => {
    cleanup(effctFn)
    activeEffect = effctFn
    effectStack.push(activeEffect)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  if (options?.scheduler) {
    effctFn.scheduler = options.scheduler
  }
  effctFn.deps = []
  if (!options?.lazy) {
    effctFn()
  }

  return effctFn
}

// 清除代理对象与副作用函数之间的关系
function cleanup(effctFn: Effect) {
  const deps: Array<Set<() => any>> = effctFn.deps
  {
    let item: Set<() => any>
    for (item of deps) {
      item.delete(activeEffect)
    }
    effctFn.deps.length = 0
  }
}

// 测试调度器代码
const stack: Set<() => any> = new Set()

let flush = false
function jobFn() {
  if (flush) return
  flush = true
  Promise.resolve()
    .then(() => {
      stack.forEach((fn) => fn())
    })
    .finally(() => {
      flush = false
    })
}
