// import { effect } from './effect'
import { effect } from './effect'
import { reactive } from './reactive'
import { ref, toRefs, proxyRefs } from './ref'
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
// {
//   {
//     // 普通对象的读取和设置操作
//     const obj = { foo: 1 }
//     obj.foo // 读取属性
//     obj.foo = 2 // 设置属性

//     // 用 get/set 方法操作 Map 数据
//     const map = new Map()
//     map.set('key', 1) // 设置数据
//     map.get('key') // 读取数据
//     // 他们之间是有差异的
//   }

//   const s = new Set([1, 2, 3])
//   // const proxy_map = reactive(s)
//   const proxy_map = reactive(new Map())
//   proxy_map.set('foo', s);
//   effect(() => {
//     for(const values of proxy_map.values()){
//       console.log('item=>', values.size);
//     }
//   })
//   proxy_map.get('foo').add(1)
// }

// 如何引入代理原始响应式

{
  // const wrapper = {
  //   value: 'vue'
  // }

  // const name = reactive(wrapper);

  // console.log('name.value=>', name.value)

  // const name = ref(1)

  // effect(() => {
  //   console.log('name=>', name.value)
  // })

  // name.value = 2

  // obj 是响应式数据

  // const obj = reactive({
  //   foo: 123,
  //   bar: 2,
  // })
  // // 将响应式数据展开到一个新的对象 newObj

  // // const newObj = {
  // //   ...obj,
  // // }

  // const newObj = {
  //   ...toRefs(obj),
  // }

  // effect(() => {
  //   // 在副作用函数内通过新的对象 newObj 读取 foo 属性值
  //   console.log(newObj.foo.value)
  // })

  // newObj.foo.value = 100


  // 自动脱ref
  // const obj = reactive({
  //      foo: 123,
  //     bar: 2,
  // })

  //  const newObj = {
  //   ...toRefs(obj),
  // }

  // // 自动脱ref
  // const objValue = proxyRefs({
  //   ...newObj
  // })

  // effect(() => {
  //   console.log(objValue.foo)
  // })

  // // newObj.foo.value = 321

  // objValue.foo = 321


  const foo = ref(1)

  const test = reactive({
    foo
  })

  effect(() => {
    console.log(test.foo)
  })

  test.foo = 2
}
