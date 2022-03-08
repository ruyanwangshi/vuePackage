// 这样不能很好的推断传入类型
function foo(val: any) {
    return val
}

foo(123)

function bar<T extends any>(val: T): T {
    return val
}

let res = bar(321)

export {}