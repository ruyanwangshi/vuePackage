const bucket = new WeakMap()
let activedEffect: () => void

const obj = {
  count: 0,
}

function effect(callback: () => void) {
    const effectFn = () => {
        activedEffect = callback
        callback()
    }
    effectFn()
}

const data = reactive(obj)

effect(() => {
    console.log('副作用函数中的结果', data)
})

function reactive<T extends object>(obj: T) {
  const data = new Proxy(obj, {
    get(target, key) {
      if (typeof key !== 'symbol') {
        track(target, key)
      }
      return target[key]
    },
    set(target, key, new_val) {
      if (typeof key !== 'symbol') {
        trigger(target, key)
      }
      return true
    },
  })
}

function track<T extends object>(target: T, key: string) {
  let depMap = bucket.get(target)

  if (!depMap) {
    bucket.set(target, (depMap = new Map()))
  }

  let deps = depMap.get(key)

  if (!deps) {
    depMap.set(key, (deps = new Set()))
  }

  deps.push(effect)
}

function trigger<T extends object>(target: T, key: string) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  deps && deps.forEach((fn) => fn())
}
