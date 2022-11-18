import { effect } from './effect'
import { reactive, shallowReactive } from './reactive'
import { readonly, shallowReadonly } from './readonly'



// const data = shallowReactive([1,2,3])
const data = reactive([1,2,3])

// const child = reactive(dataobj)
// const parent = reactive(proto)
// Object.setPrototypeOf(child, parent)



// 非原始值响应方式
effect(() => {
  console.log(data)
})

data[4] = 1
data.length = 1