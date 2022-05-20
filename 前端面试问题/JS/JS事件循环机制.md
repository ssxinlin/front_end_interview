JS事件循环机制

首先我们要知道两点：
JavaScript是单线程的语言；
EventLoop是JavaScript的执行机制。

浏览器中的事件循环

JavaScript代码的执行过程中，除了依靠函数调用栈来搞定函数的执行顺序外，还依靠任务队列（task queue）来搞定另一些代码的执行。整个执行过程，我们称之为
事件循环过程。一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。任务队列又分宏任务（macro-task）和微任务（micro-task），在最新标准中，它们被
分别成为task和jobs。

宏任务（macro-task）大概包括：
a.script（整体代码）
b.setTimeout
c.setInterval
d.setImmediate
e.I/O
f.UI render

微任务（micro-task）包括：
a.process.nextTick
b.Promise
c.Async/Await(实际就是Promise)
d.MutationObserver(html5新特性)

执行宏任务，然后执行该宏任务产生的微任务，若微任务在执行过程中产生了新的微任务，则继续执行微任务，微任务执行完毕后，再回到宏任务中进行下一轮循环。
async function async1(){
    await async2()
    console.log('async1 end')
}
async function async2(){
    console.log('async2 end')
}
async1()
setTimeout(function (){
    console.log('setTimeout')
},0)
new Promise(resolve => {
    console.log('Promise')
    resolve()
})
.then(function (){
    console.log('Promise1')
})
.then(function(){
    console.log('Promise2')
})
答案输出为：async2 end => Promise => async1 end => promise1 => promise2 => setTimeout 

async/await执行顺序
我们知道async隐式返回 Promise 作为结果的函数,那么可以简单理解为，await后面的函数执行完毕时，await会产生一个微任务(Promise.then是微任务)。
但是我们要注意这个微任务产生的时机，它是执行完await之后，直接跳出async函数，执行其他代码(此处就是协程的运作，A暂停执行，控制权交给B)。其他代码执行完毕后，
再回到async函数去执行剩下的代码，然后把await后面的代码注册到微任务队列当中。我们来看个例子

console.log('script start')

async function async1() {
    await async2()
    console.log('async1 end')
}
async function async2() {
    console.log('async2 end')
}
async1()

setTimeout(function() {
    console.log('setTimeout')
}, 0)

new Promise(resolve => {
    console.log('Promise')
    resolve()
})
.then(function() {
    console.log('promise1')
})
.then(function() {
    console.log('promise2')
})

console.log('script end')
// script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout

分析这段代码：

1、执行代码，输出script start。
2、执行async1(),会调用async2(),然后输出async2 end,此时将会保留async1函数的上下文，然后跳出async1函数。
3、遇到setTimeout，产生一个宏任务
4、执行Promise，输出Promise。遇到then，产生第一个微任务
5、继续执行代码，输出script end
6、代码逻辑执行完毕(当前宏任务执行完毕)，开始执行当前宏任务产生的微任务队列，输出promise1，该微任务遇到then，产生一个新的微任务
7、执行产生的微任务，输出promise2,当前微任务队列执行完毕。执行权回到async1
8、执行await,实际上会产生一个promise返回，即
let promise_ = new Promise((resolve,reject){ resolve(undefined)})
执行完成，执行await后面的语句，输出async1 end

最后，执行下一个宏任务，即执行setTimeout，输出setTimeout
