import { effect, track, trigger } from './effect.js';
export function computed(getter) {
    let value;
    let dirty = true;
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            dirty = true;
            trigger(obj, 'value');
        },
    });
    const obj = {
        get value() {
            if (dirty) {
                dirty = false;
                value = effectFn();
            }
            track(obj, 'value');
            return value;
        },
    };
    return obj;
}
