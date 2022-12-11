export function createRenderer(options) {
  const { createElement, insert, setElementText } = options
  // 更新与挂载还有卸载操作函数
  function patch(oldVnode, newVnode, container) {
    // 如果旧vnode不存在，执行挂载操作
    if (!oldVnode) {
      mountElement(newVnode, container)
    } else {
      // 否则执行更新操作
    }
  }

  // 挂载函数
  function mountElement(vnode, container) {
    // 创建DOM对象
    const el = createElement(vnode.type)

    if (vnode.props) {
      for (const key in vnode.props) {
        if (key in el) {
          // 获取该 DOM Properties 的类型
          const type = typeof el[key]

          const value = vnode.props[key]

          if (type === 'boolean' && value === '') {
            el[key] = true
          } else {
            el[value] = value
          }
        } else {
          el.setAttribute(key, vnode.props[key])
        }
      }
    }
    // 处理子节点，如果子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((node) => {
        patch(null, node, container)
      })
    }

    // HTMLAttributes 与 DOM properties
    // 理解HTMLAttributes 和 DOM Properties 之间的差异 和 关联非常重要。
    // HTMLAttributes 指的就是定义在HTML 标签上的属性，这里指的就是 id="my-input" type="text" value = "foo"。
    // <input id="my-inpit" type="text" value="foo">

    // 把元素添加到容器节点里面
    insert(el, container)
  }

  function render(vnode, container) {
    if (!container) {
      throw Error('请提供一个容器元素')
    }

    if (vnode) {
      // 如果新的vnode的存在，将其与旧vnode一起传递给patch函数，执行打补丁操作。
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 当旧vnode存在，而且vnode不能再，说明是卸载unmount操作
        // 只需要将container内容的DOM清空即可
        container.innerHTML = ''
      }
    }
    // 把vnode 存储到container._vnode下，记后续渲染中的旧vnode
    container._vnode = vnode
  }

  // 同构渲染
  function hydrate() {}

  return {
    render,
    hydrate,
  }
}
