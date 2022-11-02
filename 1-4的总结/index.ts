import { effect } from './effect'
import { reactive } from './reactive'

const dataobj = {
  foo: {
    count: 0
  }
} as {
  [key: string]: any
}

// const proto = {
//   bar: {}
// }


const data = reactive(dataobj)

// const child = reactive(dataobj)
// const parent = reactive(proto)
// Object.setPrototypeOf(child, parent)



// 非原始值响应方式
effect(() => {
  console.log(data.foo.count)
})


data.foo.count = 123