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




// 创建代理对象
export function createProxy<O extends object>(data: O, isShallow: boolean = false) {
  return new Proxy<O>(data, {
    get(target: any, key: string, receiver: any) {
      // console.log('get=>', target)
      if (key === 'raw') {
        return target
      }
      track(target, key)
      const res = Reflect.get(target, key, receiver)
      if (isShallow) {
        return res
      }
      // console.log(key)
      if (res !== null && typeof res === 'object') {
        return createProxy(res)
      }
      return res
      // reactive(res)
    },
    set(target: any, key: string, newValue: any, receiver: any) {
      const oldValue = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? typeEvent.set : typeEvent.add
      const res = Reflect.set(target, key, newValue, receiver)
      // console.log(newValue)
      // 如果target对象与代理对象的原始对象相等那么执行副作用函数
      if (target === receiver.raw) {
        if ((oldValue !== newValue && newValue === newValue) || oldValue === oldValue) {
          trigger(target, key, type)
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
      console.log('target=>', target, p)
      const hadKey = Object.prototype.hasOwnProperty.call(target, p)
      const res = Reflect.deleteProperty(target, p)
      if (hadKey && res) {
        trigger(target, p, typeEvent.delete)
      }
      return res
    },
    ownKeys(target) {
      track(target, ITERATE_KEY)
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
export function trigger<T extends object, K = string>(target: T, key: K, type: Valueof<typeof typeEvent>) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const deps: Set<Effect> = depsMap.get(key)
  const effctFn: Set<Effect> = new Set()
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
  deps &&
    deps.forEach((fn) => {
      if (fn !== activeEffect) {
        effctFn.add(fn)
      }
    })
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
