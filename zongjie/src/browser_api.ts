import { createRenderer } from './renderer.js'
import { shouldSetAsProps } from './utils.js'

type InvokerFn = {
  (e: Event): void
  value?: (e: Event) => void | ((e: Event) => void)[]
}

interface El extends HTMLElement {
  _vei?: {
    [key: string]: InvokerFn
  }
}

const renderer = createRenderer({
  createElement(tag: string) {
    return document.createElement(tag)
  },
  setElementText(el: El, text: string) {
    console.log('执行了set=>', el, text)
    el.textContent = text
  },
  insert(el: El, parent: HTMLElement, anchor = null) {
    console.log('内容=>', parent)
    parent.insertBefore(el, anchor)
  },
  // 将属性设置相关操作封装到 patchProps函数中，并作为渲染选项传递
  patchProps(el: El, key: string, prevValue, nextValue) {
    // 获取该 DOM Properties 的类型
    // 获取为该元素伪造的事件处理函数invoke
    const invokers = el._vei || (el._vei = {})
    let invoker: InvokerFn = invokers[key]
    // 匹配以on开头的属性，视其为事件
    console.log('key=>', key)
    if (/^on/.test(key)) {
      // 根据属性名称得到对应的事件名称，例如: onClick -> click
      const name = key.slice(2).toLowerCase()
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = ((e) => {
            // 如果invoker.value 是数组，则遍历它逐个调用事件处理函数
            if(Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e))
            } else {
            // 否则直接作为函数调用
              invoker.value(e)
            }
          }) as InvokerFn

          invoker.value = nextValue
          console.log('执行了=>', invoker)
          // 绑定事件，nextValue 为事件函数
          el.addEventListener(name, invoker)
        } else {
          // 如果invoker 存在，意味着更新，并且只需要更新invoker.value的值即可
          invoker.value = nextValue
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker)
      }
    }
    // 对class进行特殊处理
    else if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      // 获取该 DOM Properties 的类型
      const type = typeof el[key]

      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  },
  patchElement(oldVNode, newVnode) {},
})

export { renderer }
