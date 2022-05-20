/**

 js基本数据类型：
 null undefined number boolean string

 js引用数据类型：
 function object array

 typeof是用来判断数据类型的，就一个参数 ,使用方式像这样： typeof  num,  就是判断num是什么类型

 typeof 一般只能返回如下几个结果："number"、"string"、"boolean"、"object"、"function" 和 "undefined"；

 对象，数组 都是引用类型， 使用typeof 结果是 object类型，但是null 是基本数据类型，使用typeof结果也是 object，

 可以这么理解：null 是 不指向任何对象 的 空指针， 因为它是指向对象的，所以typeof 就是 object, 但是它又是空的，所以就属于基本数据类型。

 但是要想判断一个变量是不是数组， 或者对象， 这时候就需要instanceof了（判断是不是null，直接用  变量 === null 就行， null===null 结果是 true）
*/

function instance_of(L, R) {
    // 兼容一下函数对象
    if ((typeof(L) != 'object' && typeof(L) != 'function') || L == 'null') return false;

    var O = R.prototype
    L = L.__proto__
    while (true) {
        if (L === null) return false
        if (O === L) return true
        L = L.__proto__
    }
}
// 规则简单来说就是 L的  __proto__  是不是强等于 R.prototype，不等于再找  L.__proto__ .__proto__  直到 __proto__ 为 null
