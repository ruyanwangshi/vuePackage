import { effect } from './effect.js';
export function watch(resource, cb, options = {}) {
    let newValue, oldValue;
    let getter;
    if (typeof resource === 'function') {
        getter = resource;
    }
    else if (typeof resource === 'object') {
        getter = () => recursion(resource);
    }
    const job = () => {
        newValue = effectFn();
        cb(newValue, oldValue);
        oldValue = newValue;
    };
    console.log('resoure=>', resource);
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            job();
        },
    });
    if (options.immediate) {
        job();
    }
    else {
        newValue = effectFn();
    }
}
function recursion(obj, listenStack = new Set()) {
    if (typeof obj !== 'object' && listenStack.has(obj)) {
        return;
    }
    listenStack.add(obj);
    for (const key in obj) {
        recursion(obj[key], listenStack);
    }
    return obj;
}
