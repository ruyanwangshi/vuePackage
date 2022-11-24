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

const typeEvent = {
  set: 'set',
  add: 'add',
  delete: 'delete',
} as const

type Valueof<O> = O[keyof O]


// 映射数组方法，使includes、indexOf、lastIndexOf映射成正确的对象
const arrayMethods = {}

  ; (['includes', 'indexOf', 'lastIndexOf'] as const).forEach(key => {
    arrayMethods[key] = function (...arg: any[]) {
      const otherMethods = Array.prototype[key];
      let res = otherMethods.call(this, ...arg);
      if (res === false || res === '-1') {
        res = otherMethods.call(this.raw, ...arg)
      }
      return res;
    }

  })

// 创建代理对象
export function createProxy<O extends object>(data: O, isShallow: boolean = false, isReadonly = false): O {
  return new Proxy<O>(data, {
    get(target: any, key: string, receiver: any) {
      if (key === 'raw') {
        return target
      }
      console.log('收集到的key', key)
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
      console.log('设置到的key', key)
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

  if (!activeEffect) {
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
  // console.log('bucket=>', target, key)
  if (!depsMap) {
    return
  }
  const deps: Set<Effect> = depsMap.get(key)
  const effctFn: Set<Effect> = new Set()

  if (Array.isArray(target)) {
    console.log('执行了添加add=>', type)
    // 如果是数组，那么添加新元素的时候会隐式增长length属性
    if (type === typeEvent.add) {
      const lengthEffect = depsMap.get('length')
      lengthEffect &&
        lengthEffect.forEach((fn) => {
          if (fn !== activeEffect) {
            effctFn.add(fn)
          }
        })
      // 如果key为length那么需要取出与length相关的所有副作用函数
    } else if (key === 'length') {
      depsMap.forEach((effects, key) => {
        if (key === 'length') {
          effects.forEach((fn) => {
            if (fn !== activeEffect) {
              effctFn.add(fn)
            }
          })
        } else if (key >= newValue) {
          effects.forEach((fn) => {
            if (fn !== activeEffect) {
              effctFn.add(fn)
            }
          })
        }
      })
    }
  } else {
    deps &&
      deps.forEach((fn) => {
        if (fn !== activeEffect) {
          effctFn.add(fn)
        }
      })
  }

  // 在设置的时候把 for ... in 依赖的副作用函数取出来重新执行
  if (type === typeEvent.add || type === typeEvent.delete) {
    const InitialEffect = depsMap.get(ITERATE_KEY)
    InitialEffect &&
      InitialEffect.forEach((fn) => {
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
