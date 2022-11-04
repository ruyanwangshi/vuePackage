import { effect } from './effect'
import { reactive, shallowReactive } from './reactive'
import { readonly, shallowReadonly } from './readonly'



// const data = shallowReactive([1,2,3])
const data = reactive([])

// const child = reactive(dataobj)
// const parent = reactive(proto)
// Object.setPrototypeOf(child, parent)



// 非原始值响应方式
effect(() => {
  data.push(1)
})

effect(() => {
  data.push(2)
})


// data[3] = 1
data.length = 1