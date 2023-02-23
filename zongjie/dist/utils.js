export function shouldSetAsProps(el, key, nextValue) {
    // 特殊处理
    if (key === 'form' && el.tagName === 'INPUT') {
        return false;
    }
    return key in el;
}
// 序列化class类
export function normalizeClass(classList) {
    let value = '';
    const type = typeof classList;
    if (type === 'string') {
        return classList;
    }
    else if (type === 'object' && classList) {
        console.log(classList);
        for (const key in classList) {
            const keyValue = classList[key];
            const type = typeof keyValue;
            if (type === 'boolean' && keyValue) {
                value += ` ${key}`;
            }
        }
    }
    else if (Array.isArray(classList)) {
        for (const item of classList) {
            const type = typeof item;
            if (type === 'string') {
                value += ` ${normalizeClass(item)}`;
            }
            else if (type === 'object' && item) {
                value += ` ${normalizeClass(item)}`;
                console.log(item);
            }
        }
    }
    return value.trim();
}
