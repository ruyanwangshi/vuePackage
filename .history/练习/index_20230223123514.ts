const bucket = new WeakMap()


const obj = {
    count: 0
}

function reactive<T extends object>(obj: T) {

    const data = new Proxy(obj, {
        get(target, key) {
            if(typeof key !== 'symbol') {
                track(target, key)
            }
            return target[key]
        }
    })
}


function track<T extends object>(target: T, key: string) {
    let depMap = bucket.get(target)

    if(!depMap) {
        bucket.set(target, depMap = new Map())
    }

    let deps = depMap.get(key)

    if(!deps) {
        depMap.set(key, deps = new Set())
    }

    deps && deps.forEach(fn => {
        fn()
    });
}