

export function createRenderer() {

    // 更新与挂载还有卸载操作函数
    function patch(oldVnode, newVnode, container) {
        // 如果旧vnode不存在，执行挂载操作
        if(!oldVnode) {
            mountElement(newVnode, container)
        } else {
            // 否则执行更新操作

        }
    }

    // 挂载函数
    function mountElement(vnode, container) {
        // 创建DOM对象
        const el = document.createElement(vnode.type)
        // 处理子节点，如果子节点是字符串，代表元素具有文本节点

        if(typeof vnode.children === 'string') {
            el.textContent = vnode.children
        }

        // 把元素添加到容器节点里面
        container.appendChild(el)
    }

    function render(vnode, container) {
        if(vnode) {
            // 如果新的vnode的存在，将其与旧vnode一起传递给patch函数，执行打补丁操作。
            patch(container._vnode, vnode, container)
        } else {
            if(container._vnode) {
                // 当旧vnode存在，而且vnode不能再，说明是卸载unmount操作
                // 只需要将container内容的DOM清空即可
                container.innerHTML = ''
            }
        }
        // 把vnode 存储到container._vnode下，记后续渲染中的旧vnode
        container._vnode = vnode
    }

    // 同构渲染
    function hydrate() {
        
    }

    return {
        render,
        hydrate
    }
}


