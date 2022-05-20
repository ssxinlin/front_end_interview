/**
 数组扁平化概念
 数组扁平化是指将一个多维数组变为一维数组
 */

// 实现
// 1、reduce
// 遍历数组每一项，若值为数组则递归遍历，否则concat
function flatten1(arr) {
    return arr.reduce((result, item) => {
        return result.concat(Array.isArray(item) ? flatten(item) : item)
    }, [])
}

// reduce是数组的一种方法，它接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
// reduce包含两个参数：回调函数，传给total的初始值

// 求数组的各项值相加的和
arr.reduce((total, item) => { // total为之前的计算结果，item为数组的各项值
    return total + item
}, 0)


// 2、toString & split
// 调用数组的toString方法，讲数组变为字符串，然后再用split分割还原为数组
function flatten2(arr) {
    return arr.toString().split(",").map(function (item) {
        return Number(item)
    })
}

// 因为split分割后形成的数组的每一项值为字符串，所以需要用一个map方法遍历数组将其每一项转换为数值型


// 3、join & split
// 和上面的toString一样，join也可以将数组转换为字符串
function flatten3(arr) {
    return arr.join(",").split(",").map(function (item) {
        return parseInt(item)
    })
}


// 4、递归
// 递归遍历每一项，若为数组则继续遍历，否则concat
function flatten4(arr) {
    var res = []
    arr.map(item => {
        if(Array.isArray(item)) {
            flatten4(item)
        } else {
            res.push(item)
        }
    })
    return res
}

// 跟1很像


// 5、扩展运算符
// ES6的扩展运算符能将二维数组变为一维
[].concat(...[1, 2, 3, [4, 5]]) // [1, 2, 3, 4, 5]

// 根据这个结果我们可以做一个遍历，若arr中含有数组则使用一次扩展运算符，直至没有为止。

function flatten5(arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
    }
    return arr
}
