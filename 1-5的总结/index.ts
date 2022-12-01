// import { effect } from './effect'
import { effect } from './effect'
import { reactive } from './reactive'
// import { readonly, shallowReadonly } from './readonly'

// const data = shallowReactive([1,2,3])

// const child = reactive(dataobj)
// const parent = reactive(proto)
// Object.setPrototypeOf(child, parent)

// 非原始值响应方式
// effect(() => {
//   console.log(data)
// })

// data[4] = 1
// data.length = 1

// 这种会返回false
// {
//   const obj = {}
//   const data = reactive([obj])
//   console.log(data.includes(obj))
// }

// 测试数组方法隐式改变length属性
// {
//   // const arr = []
//   const arr = reactive([1,2,3])
//   effect(() => {
//     console.log(1)
//     arr.push(1)
//   })
//   effect(() => {
//     console.log(2)
//     arr.push(1)
//   })
// }

// 如何代理set和map
{
  {
    // 普通对象的读取和设置操作
    const obj = { foo: 1 }
    obj.foo // 读取属性
    obj.foo = 2 // 设置属性

    // 用 get/set 方法操作 Map 数据
    const map = new Map()
    map.set('key', 1) // 设置数据
    map.get('key') // 读取数据
    // 他们之间是有差异的
  }

  const s = new Set([1, 2, 3])
  // const proxy_map = reactive(s)
  const proxy_map = reactive(new Map([['foo', s]]))

  effect(() => {
    console.log('执行了副作用函数=>', proxy_map)
  })
  proxy_map.set('foo', 123)
}
