import { effect } from './effect.js'

type IsFunction<T extends (...arg: any[]) => any> = T extends Function ? ReturnType<T> : T

type Options = {
  immediate?: boolean
}

export function watch<O extends (...arg: any[]) => any>(resource: O, cb: (value: IsFunction<O>, oldvalue: IsFunction<O> | undefined) => void, options?: Options): void
export function watch<O extends object>(resource: O, cb: (value: O, oldvalue: O | undefined) => void, options?: Options): void

export function watch<O extends (...arg: any[]) => any>(resource: O, cb: (value: IsFunction<O>, oldvalue: IsFunction<O> | undefined) => void, options: Options = {} as Options) {
  let newValue: IsFunction<O>, oldValue: IsFunction<O> | undefined
  let getter: any
  if (typeof resource === 'function') {
    getter = resource
  } else if (typeof resource === 'object') {
    getter = () => recursion(resource)
  }

  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }
  console.log('resoure=>', resource)
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      job()
    },
  })

  if (options.immediate) {
    job()
  } else {
    newValue = effectFn()
  }
}

function recursion<O extends any>(obj: O, listenStack = new Set()) {
  if (typeof obj !== 'object' && listenStack.has(obj)) {
    return
  }

  listenStack.add(obj)

  for (const key in obj) {
    recursion(obj[key], listenStack)
  }

  return obj
}
