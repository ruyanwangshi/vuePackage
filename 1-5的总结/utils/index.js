"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effect_1 = require("../effect");
const reactive_1 = require("../reactive");
// set 集合映射方法
// 定义一个对象，将自定义的 add 方法定义到该对象下
const mutableInstrumentations = {
    add(key) {
        // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
        const target = this.raw;
        // 通过原始数据对象执行 add 方法添加具体的
        // 判断添加的值是否存在原集合中
        const hadKey = target.has(key);
        // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
        const res = target.add(key);
        // 调用trigger函数出发响应。并指定操作类型为ADD
        // 只有值未在集合中才会出发副作用函数
        if (!hadKey) {
            (0, effect_1.trigger)(target, key, effect_1.typeEvent.add);
        }
        return res;
    },
    delete(key) {
        // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
        const target = this.raw;
        // 通过原始数据对象执行 add 方法添加具体的
        // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
        const res = target.delete(key);
        // 调用trigger函数出发响应。并指定操作类型为ADD
        (0, effect_1.trigger)(target, key, effect_1.typeEvent.delete);
        return res;
    },
    get(key) {
        // 取出原始对象
        const target = this.raw;
        // 判断key是否存在于目标对象上面
        const had = target.has(key);
        // if (!isShallow) {
        //   track(target, key)
        // }
        if (had) {
            const res = target.get(key);
            // return typeof res === 'object' && !isReadonly ? reactive(res) : res
        }
    },
    set(key, value) {
        // if (isReadonly) {
        //   throw new Error('该对象是只读的！')
        // }
        const target = this.raw;
        const had = target.has(key);
        // 处理响应式数据污染普通数据的问题
        const rawValue = value.raw || value;
        target.set(key, rawValue);
        const oldValue = target.get(key);
        if (!had) {
            (0, effect_1.trigger)(target, key, effect_1.typeEvent.add);
        }
        else if (value !== oldValue || (oldValue === oldValue && value === value)) {
            (0, effect_1.trigger)(target, key, effect_1.typeEvent.set);
        }
    },
    forEach(cb, thisArg) {
        // 获取原始对象
        const target = this.raw;
        // forEach会关联对象的key的添加和删除操作的依赖关系，使用ITERATE_KEY来对这种对象进行依赖的收集操作
        (0, effect_1.track)(target, ITERATE_KEY);
        // wrap 函数用来把可代理的值转换为响应式数据
        const wrap = (v) => (typeof v === 'object' ? (0, reactive_1.reactive)(v) : v);
        // 通过原始对象调用forEach把回调函数传进去
        target.forEach((k, v) => {
            cb.call(thisArg, wrap(k), wrap(v), this);
        });
    },
    [Symbol.iterator]: iteratorMethods,
    entries: iteratorMethods,
    values: valueIteratorMethods,
    keys: keysIteratorMethods,
};
function valueIteratorMethods(key) {
    // 获取原始对象
    const target = this.raw;
    const iter = target['values']();
    if (key === 'keys') {
        (0, effect_1.track)(target, ITERATE_KEYS_KEY);
    }
    else {
        (0, effect_1.track)(target, ITERATE_KEY);
    }
    const wrap = (v) => (typeof v === 'object' ? (0, reactive_1.reactive)(v) : v);
    return {
        next() {
            const { value, done } = iter.next();
            return {
                value: value ? wrap(value) : value,
                done,
            };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function keysIteratorMethods(key) {
    // 获取原始对象
    console.log('执行了=>', this);
    const target = this.raw;
    const iter = target['keys']();
    if (key === 'keys') {
        (0, effect_1.track)(target, ITERATE_KEYS_KEY);
    }
    else {
        (0, effect_1.track)(target, ITERATE_KEY);
    }
    const wrap = (v) => (typeof v === 'object' ? (0, reactive_1.reactive)(v) : v);
    return {
        next() {
            const { value, done } = iter.next();
            return {
                value: value ? wrap(value) : value,
                done,
            };
        },
        [Symbol.iterator]() {
            console.log('执行了=>', this);
            return this;
        },
    };
}
function iteratorMethods() {
    // 获取原始对象
    const target = this.raw;
    const iter = target.entries();
    (0, effect_1.track)(target, ITERATE_KEY);
    const wrap = (v) => (typeof v === 'object' ? (0, reactive_1.reactive)(v) : v);
    return {
        next() {
            const { value, done } = iter.next();
            return {
                value: value ? [wrap(value[0]), wrap(value[1])] : value,
                done,
            };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
