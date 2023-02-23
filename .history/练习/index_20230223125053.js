const bucket = new WeakMap()
let activedEffect

const obj = {
  count: 0,
}

const data = reactive(obj)

effect(() => {
  console.log('副作用函数中的结果', data.count)
})

data.count ++

function effect(callback) {
  const effectFn = () => {
    activedEffect = callback
    callback()
  }
  effectFn()
}



function reactive(obj) {
  const data = new Proxy(obj, {
    get(target, key) {
      if (typeof key !== 'symbol') {
        track(target, key)
      }
      return target[key]
    },
    set(target, key, new_val) {
        target[key] = new_val
      if (typeof key !== 'symbol') {
        trigger(target, key)
      }
      return true
    },
  })
  return data
}

function track(target, key) {
  let depMap = bucket.get(target)

  if (!depMap) {
    bucket.set(target, (depMap = new Map()))
  }

  let deps = depMap.get(key)

  if (!deps) {
    depMap.set(key, (deps = new Set()))
  }

  deps.add(activedEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  deps && deps.forEach((fn) => fn())
}
