/**
 * 这三个函数的基本用法，call，apply，bind 都是需要挂在Function对象上的三个方法，并且调用这三个方法必须得是函数。
 *
 * func.call(thisArg, param1, param2, ...)
 * func.apply(thisArg, [param1,param2, ...])
 * func.bind(thisArg, param1,param2, ...)
 *
 * 其中func 是要调用的函数，thisArg 一般是this所指的对象，后面的为参数。
 * 这三者的公共点就是，都是改变函数func的this指向。其中 call和apply 的区别在于传参的写法不同：
 * call 是一个一个参数传，而apply是以数组的形式传入。
 * 然后bind 与这两者的区别在于：bind函数不会马上执行，而（call 与 apply）是在改变了函数的this指向后立马执行。

*/

// call 和 apply的基本原理是差不多的

Function.prototype.call = function (context, ...args) {
    let CONTEXT = context || window;
    CONTEXT.fn = this;
    let res = eval('CONTEXT.fn(...args)');
    delete CONTEXT.fn
    return res;
}

Function.prototype.apply = function (context, args) {
    let CONTEXT = context || window;
    context.fn = this;
    let res = eval('CONTEXT.fn(...args)');
    delete CONTEXT.fn
    return res;
}

// bind的实现

// 这里需要注意bind的核心是需要返回一个函数。这样调用bind方法接收到函数的对象，再通过执行接收的函数，就可以得到想要的结果。
// 一个 绑定函数 也能使用 new 操作符创建对象,这种行为就像把原函数当成构造器，thisArg 参数无效。也就是 new 操作符修改 this 指向的优先级更高。

Function.prototype.myBind = function (context) {
    if (typeof this !== 'function') {
        throw TypeError('error');
    }
    // 缓存this
    const self = this;
    const args = [...arguments].slice(1);
    //返回一个函数
    return function fn() {
        // 判断调用方式
        if (this instanceof fn) {
            return new self(...args, ...arguments);
        }
        return self.apply(context, args.concat(...arguments));
    };
};
