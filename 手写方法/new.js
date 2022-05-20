/**
 * new是将构造函数变为实例对象
 *
 * new到底做了什么？专业描述如下：
 * 1.在内存中创建一个新对象
 * 2.这个新对象内部的[[prototype]]特性被赋值为构造函数的prototype属性
 * 3.构造函数内部的this被赋值为这个新对象(即this指向新对象)
 * 4.执行构造函数内部的代码(给新对象添加属性)
 * 5.如果构造函数返回非空 对象，则返回该对象；否则，返回刚创建的新对象。
*/

/**
 * 思路
 * 1.那我们就可以用代码来实现了，其实只需要完成这几个功能。
 * 2.让实例可以访问构造函数原型所在的原型链上的属性；
 * 3.让实例可以访问到私有属性；
 * 4.构造函数返回的最后结果是引用数据类型;
 */

function myNew(fn, ...args){
    let obj = Object.create(fn.prototype)
    console.log("obj", obj)
    let res = fn.call(obj, ...args)
    console.log("res", res)
    // if(res && (res instanceof Object)) {
    //     return res
    // }
    if(res && (typeof res === 'object' || typeof res === 'function')){
        return res
    }
    return obj
}

function Person(name, age){
    this.name = name
    this.age = age
}
Person.prototype.say = function (){
    console.log(this.age)
}
let p1 = myNew(Person, "liHua", 19)
console.log(p1.name)
console.log(p1)
p1.say()

function theNew(fn, ...args) {
    let obj = Object.create(fn.prototype)
    let res = fn.call(obj, ...args)
    if(res && (typeof res === 'object' || typeof res === 'function')) {
        return res
    }
    return  obj
}
