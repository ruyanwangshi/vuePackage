const bucket = new WeakMap()
let activeEffect = null
const ITERATE_KEY = Symbol()

const data = {
    name: '测试'
}

const pData = new Proxy(data, {
    get(target, key, receiver) {
        track(target, key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
        const result = Reflect.set(target, key, value, receiver)
        trigger(target, key, type)
        return result
    },
    has(target, key) { // 拦截in操作符
        track(target, key)
        return Reflect.has(target, key)
    },
    ownKeys(target) {
        track(target, ITERATE_KEY)
        return Reflect.ownKeys(target)
    }
})

function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    deps && deps.forEach(fn => fn());
    if(type === 'ADD') {
        const iterateEffect = depsMap.get(ITERATE_KEY)
        iterateEffect && iterateEffect.forEach(fn => fn());
    }
  }

  function track(target, key) {
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, depsMap = new Map())
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, deps = new Set())
    }
    deps.add(activeEffect);
  }


  function effect (fn) {
    const effectFn = () => {
      activeEffect = effectFn
      fn()
    }
    effectFn()
  }

  effect(() => {
    // console.log('name' in pData)
    for(const key in pData) {
        console.log(key)
    }
  })

//   console.log(Reflect.ownKeys(pData))
pData.name  = 123
// console.log(Reflect.getOwnPropertyDescriptor(pData, 'name')) // 获取属性描述符
// console.log(Reflect.getPrototypeOf(pData)) // 获取自身的原型对象