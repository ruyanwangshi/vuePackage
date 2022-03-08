// 命令式编程
const div = document.createElement('div')
div.textContent = '命令式创建dom'
document.body.appendChild(div)

// 声明式编程
h({
  tag: 'div',
  attrs: {
    class: 'test',
  },
})
function h(vdom) {
  if (typeof vdom === 'object') {
    const el = document.createElement(vdom.tag)
    for (const key in vdom) {
      el.setAttribute(key, vdom[key])
    }
  }
}
