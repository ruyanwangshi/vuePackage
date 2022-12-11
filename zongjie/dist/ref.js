import { reactive } from './reactive.js';
// 封装一个 ref 函数
export function ref(value) {
    // 在 ref 函数内部创建包裹对象
    const wrapper = {
        value,
    };
    // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true,
    });
    // 6.2 响应式丢失的问题
    // 将包裹对象变成响应式数据
    return reactive(wrapper);
}
export function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key];
        },
        set value(value) {
            obj[key] = value;
        },
    };
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true,
    });
    return wrapper;
}
export function toRefs(obj) {
    const ret = {};
    // 使用 for...in 循环遍历对象
    for (const key in obj) {
        ret[key] = toRef(obj, key);
    }
    return ret;
}
export function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);
            return value.__v_isRef ? value.value : value;
        },
        set(target, key, newvalue, receiver) {
            const value = target[key];
            if (value.__v_isRef) {
                value.value = newvalue;
                return true;
            }
            else {
                return Reflect.set(target, key, newvalue, receiver);
            }
        },
    });
}
