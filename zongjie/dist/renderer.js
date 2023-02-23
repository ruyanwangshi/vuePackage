// 卸载DOM
// 在unmount 函数内，我们有机会调用绑定在DOM元素上的指令钩子函数，列入beforeUnmount、unmounted等。
// 当unmount 函数执行时，我们有机会检测虚拟节点vnode的类型。如果该虚拟节点描述的时组件，则我们有机会调用组件相关的生命周期函数。
function unmount(vnode) {
    // 根据 vnode 获取要卸载的真实DOM元素
    const el = vnode.el;
    // 获取el的父元素
    const parent = el.parentNode;
    // 调用removeChild 移除元素
    if (parent)
        el.removeChild(vnode.el);
}
export function createRenderer(options) {
    const { createElement, insert, setElementText, patchProps, patchElement } = options;
    // 更新与挂载还有卸载操作函数
    function patch(oldVnode, newVnode, container) {
        // 如果旧node存在 ，但是旧node和新node类型不一样
        if (oldVnode && oldVnode.type !== newVnode.type) {
            // 执行卸载操作
            unmount(null);
            oldVnode = null;
        }
        else {
            // 如果俩个node节点类型一样
            // 如果旧node的值时字符串类型，则它描述的是普通标签元素
            const { type } = newVnode;
            if (typeof type === 'string') {
                // 如果旧vnode不存在，执行挂载操作
                if (!oldVnode) {
                    mountElement(newVnode, container);
                }
                else {
                    // 否则执行更新操作
                    patchElement(oldVnode, newVnode);
                }
            }
            else if (typeof type === 'object') {
                // 如果 新node的type的值类型是对象，则它描述的是组件。
            }
            else if (type === 'xxx') {
                // 处理其它类型的vnode
            }
        }
    }
    // 挂载函数
    function mountElement(vnode, container) {
        // 创建DOM对象
        const el = createElement(vnode.type);
        // 让 vode.el 引用真实 DOM 元素
        vnode.el = el;
        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(el, key, null, vnode.props[key]);
            }
        }
        // 处理子节点，如果子节点是字符串，代表元素具有文本节点
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children);
        }
        else if (Array.isArray(vnode.children)) {
            vnode.children.forEach((node) => {
                patch(null, node, container);
            });
        }
        // HTMLAttributes 与 DOM properties
        // 理解HTMLAttributes 和 DOM Properties 之间的差异 和 关联非常重要。
        // HTMLAttributes 指的就是定义在HTML 标签上的属性，这里指的就是 id="my-input" type="text" value = "foo"。
        // <input id="my-inpit" type="text" value="foo">
        // 把元素添加到容器节点里面
        insert(el, container);
    }
    function render(vnode, container) {
        if (!container) {
            throw Error('请提供一个容器元素');
        }
        if (vnode) {
            // 如果新的vnode的存在，将其与旧vnode一起传递给patch函数，执行打补丁操作。
            patch(container._vnode, vnode, container);
        }
        // 如果vnode为null那么执行卸载操作
        else {
            if (container._vnode) {
                // 当旧vnode存在，而且vnode不能再，说明是卸载unmount操作
                // 只需要将container内容的DOM清空即可
                // 但这样作不严谨：
                // 1.容器的内容可能是由某个或多个组件你渲染的，当执行卸载操作发生时，
                // 应该正确地调用这些组件的beforeUnmount、unmount等声明周期。
                // 2.即使内容不是由组件渲染。有的元素存在自定义指令，我们应该在卸载操
                // 作发生时正确执行对应的指令钩子函数。
                // 3.使用innerHTML清空容器元素内容的另一个缺陷是，它不会移除绑定在DOM元素上的事件处理函数。
                unmount(container._vnode);
            }
        }
        // 把vnode 存储到container._vnode下，记后续渲染中的旧vnode
        container._vnode = vnode;
    }
    // 同构渲染
    function hydrate() { }
    return {
        render,
        hydrate,
    };
}
