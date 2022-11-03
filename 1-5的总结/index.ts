import { effect } from './effect'
import { reactive, shallowReactive } from './reactive'
import { readonly, shallowReadonly } from './readonly'

// const dataobj = {
//   foo: {
//     count: 0
//   }
// } as {
//   [key: string]: any
// }

// const proto = {
//   bar: {}
// }




const data = shallowReactive([1,2,3])
// const data = readonly([1,2,3])

// const child = reactive(dataobj)
// const parent = reactive(proto)
// Object.setPrototypeOf(child, parent)



// 非原始值响应方式
effect(() => {
  for(const item in data){
    console.log('item=>', item)
  }
})


// data[3] = 1
data.length = 1