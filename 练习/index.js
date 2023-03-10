const bucket = new WeakMap()
let activedEffect
let effectStack = []

const obj = {
  count: 0,
  flag: true,
}

const data = reactive(obj)

effect(() => {
  console.log('外层副作用函数', data.flag)
})




// data.flag = false
data.count++

function effect(callback) {
  const effectFn = () => {
    // cleanup(effectFn)
    // effectStack.push(effectFn)
    activedEffect = effectFn
    callback()
    // effectStack.pop()
    // activedEffect = effectStack[effectStack.length - 1]
  }
//   effectFn.deps = new Set()
  effectFn()
}

function cleanup(effect) {
  const deps = effect.deps
  for (const item of deps) {
    item.delete(effect)
  }
  effect.deps.clear()
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
  if (!activedEffect) return
  let depMap = bucket.get(target)

  if (!depMap) {
    bucket.set(target, (depMap = new Map()))
  }

  let deps = depMap.get(key)

  if (!deps) {
    depMap.set(key, (deps = new Set()))
  }

  deps.add(activedEffect)
//   activedEffect && activedEffect.deps.add(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  const effectFn = new Set(deps)
  effectFn && effectFn.forEach((fn) => fn())
}
