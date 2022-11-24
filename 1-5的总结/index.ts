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
{
  // const arr = []
  const arr = reactive([])
  effect(() => {
    console.log('第一个副作用函数')
    arr.push(1)
  })
  effect(() => {
    console.log('第二个副作用函数')
    arr.push(1)
  })
}