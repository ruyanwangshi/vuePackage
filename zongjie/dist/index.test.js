import { test } from '@jest/globals';
import { effect, createProxy } from './effect.js';
// import {} from './'
// import { renderer } from './renderer.js'
test("测试effect函数是否执行", () => {
    const proxy = createProxy({
        name: '测试'
    });
    effect(() => {
    });
    // expect(add()).toBe(2)
});
