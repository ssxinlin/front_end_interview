// bind实现要复杂一点 因为他考虑的情况比较多 还要涉及参数合并（类似函数柯里化）
Function.prototype.myBind = function (context, ...args){
    if(!context || context === null){
        context = window
    }
    // 创造唯一的key值，作为我们构造的context内部方法名
    let fn = Symbol()
    context[fn] = this
    let _this = this
    const result = function (...innerArgs){
        // 第一种情况 :若是将 bind 绑定之后的函数当作构造函数，通过 new 操作符使用，则不绑定传入的 this，而是将 this 指向实例化出来的对象
        // 此时由于new操作符作用  this指向result实例对象  而result又继承自传入的_this 根据原型链知识可得出以下结论
        // this.__proto__ === result.prototype   //this instanceof result =>true
        // this.__proto__.__proto__ === result.prototype.__proto__ === _this.prototype; //this instanceof _this =>true
        if(this instanceof _this === true){
            // 此时this指向result的实例 这时候不需要改变this的指向
            this[fn] = _this
            this[fn](...[...args, ...innerArgs]); // 这里使用ES6的方法让bind支持参数合并
            delete this[fn]
        }else{
            // 如果只是作为普通函数调用，那就简单了，直接改变this指向为传入的context
            context[fn](...[...args, ...innerArgs])
            delete context[fn]
        }
    }
    // 如果绑定的是构造函数，那么需要继承构造函数原型属性和方法
    result.prototype = Object.create(this.prototype)
    return result
}
// 用法如下
function Person(name, age){
    console.log(name)
    console.log(age)
    console.log(this)
}
Person.prototype.say = function (){
    console.log("hello")
}
let obj = {
    objName: '张三',
    objAge: 18
}
function normalFun(name, age){
    console.log(name)
    console.log(age)
    console.log(this)
    console.log(this.objName)
    console.log(this.objAge)
}
// 先测试作为构造函数调用
let bindFun = Person.myBind(obj, '我是参数传进来的name')
let a = new bindFun('我是参数传进来的age')
a.say() //hello

// 再测试作为普通函数调用
let bindFun = normalFun.myBind(obj, '我是参数传进来的name')
bindFun('我是参数传进来的age')


