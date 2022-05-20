this指向

JS中this指向只需记忆5大原则

1、如果new关键词出现在被调用函数的前面，那么JavaScript引擎会创建一个新的对象，被调用函数中的this指向的就是这个新创建的函数。
function ConstructorExample() {
    console.log(this);
    this.value = 10;
    console.log(this);
}

new ConstructorExample();

// -> ConstructorExample {}
// -> ConstructorExample { value: 10 }


2、如果通过apply、call或者bind的方式触发函数，那么函数中的this指向传入函数的第一个参数。
function fn() {
    console.log(this);
}

var obj = {
    value: 5
};

var boundFn = fn.bind(obj);

boundFn(); // -> { value: 5 }
fn.call(obj); // -> { value: 5 }
fn.apply(obj); // -> { value: 5 }

3、如果一个函数是某个对象的方法，并且对象使用句点符号触发函数，那么this指向的就是该函数作为那个对象的属性的对象，也就是，this指向句点左边的对象。
var obj = {
    value: 5,
    printThis: function (){
        console.log(this)
    }
}

obj.printThis() // -> { value: 5, printThis: f }

4、如果一个函数作为FFI被调用，意味着这个函数不符合以上任何一种调用方式，this指向全局对象，在浏览器中，即是Window。
var obj = {
    value: 5,
    printThis: function() {
      console.log(this);
    }
};

obj.printThis(); // -> { value: 5, printThis: ƒ }

注意，第4条规则和第3条很类似，不同的是当函数没有作为方法被调用时，它将自动隐式编程全局对象的属性——window。也就是当我们调用 fn()，可以理解为window.fn()，
根据第三条规则，fn()函数中的this指向的就是window。
var obj = {
    value: 5,
    printThis: function() {
      console.log(this);
    }
};

obj.printThis(); // -> { value: 5, printThis: ƒ }

5、如果出现上面对条规则的累加情况，则优先级自1至4递减，this的指向按照优先级最高的规则判断。

例：
var obj = {
    value: 'hi',
    printThis: function() {
        console.log(this);
    }
};

var print = obj.printThis;

obj.printThis(); // -> {value: "hi", printThis: ƒ}
print(); // -> Window {stop: ƒ, open: ƒ, alert: ƒ, ...}

obj.printThis() ，根据第三条规则this指向的就是obj。根据第四条规则print()是FFI，因此this指向window。

箭头函数

箭头函数是ES6中新增的，它和普通函数有一些区别，箭头函数没有自己的this，它的this继承于外层代码库中的this。箭头函数在使用时，需要注意以下几点:
（1）函数体内的this对象，继承的是外层代码块的this。
（2）不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。
（3）不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
（4）不可以使用yield命令，因此箭头函数不能用作 Generator 函数。
（5）箭头函数没有自己的this，所以不能用call()、apply()、bind()这些方法去改变this的指向.

var obj = {
    hi: function(){
        console.log(this);
        return ()=>{
            console.log(this);
        }
    },
    sayHi: function(){
        return function() {
            console.log(this);
            return ()=>{
                console.log(this);
            }
        }
    },
    say: ()=>{
        console.log(this);
    }
}
let hi = obj.hi();  //输出obj对象
hi();               //输出obj对象
let sayHi = obj.sayHi();
let fun1 = sayHi(); //输出window
fun1();             //输出window
obj.say();          //输出window

在 ES5 中，其实 this 的指向，始终坚持一个原理：this 永远指向最后调用它的那个对象，来，跟着我朗读三遍：this 永远指向最后调用它的那个对象，
this 永远指向最后调用它的那个对象，this 永远指向最后调用它的那个对象。

怎么改变this的指向？
改变this的指向有以下几种方法：
a.使用ES6的箭头函数
b.在函数内部使用_this = this
c.使用apply、call、bind
d.new实例化一个对象

箭头函数

众所周知，ES6 的箭头函数是可以避免 ES5 中使用 this 的坑的。箭头函数的 this 始终指向函数定义时的 this，而非执行时。，箭头函数需要记着这句话：“箭头函数中
没有 this 绑定，必须通过查找作用域链来决定其值，如果箭头函数被非箭头函数包含，则 this 绑定的是最近一层非箭头函数的 this，否则，this 为 undefined”。
 var name = "windowsName";
    var a = {
        name : "Cherry",
        func1: function () {
            console.log(this.name)     
        },
        func2: function () {
            setTimeout( () => {
                this.func1()
            },100);
        }
    };
    a.func2()     // Cherry
    
apply、call、bind 区别

apply
apply() 方法调用一个函数, 其具有一个指定的this值，以及作为一个数组（或类似数组的对象）提供的参数
apply语法：fun.apply(thisArg, [argsArray])

a. thisArg：在 fun 函数运行时指定的 this 值。需要注意的是，指定的 this 值并不一定是该函数执行时真正的 this 值，如果这个函数处于非严格模式下，
则指定为 null 或 undefined 时会自动指向全局对象（浏览器中就是window对象），同时值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的自动包装对象。
b. argsArray：一个数组或者类数组对象，其中的数组元素将作为单独的参数传给 fun 函数。如果该参数的值为null 或 undefined，则表示不需要传入任何参数。

apply和call的区别
其实 apply 和 call 基本类似，他们的区别只是传入的参数不同。
call语法：fun.call(thisArg[,arg1[,arg2[,...]]])

所以 apply 和 call 的区别是 call 方法接受的是若干个参数列表，而 apply 接收的是一个包含多个参数的数组。
 var a ={
        name : "Cherry",
        fn : function (a,b) {
            console.log( a + b)
        }
    }
    var b = a.fn;
    b.apply(a,[1,2])     // 3
    var c = a.fn
    c.call(a,1,2)        // 3

bind
bind()方法创建一个新的函数, 当被调用时，将其this关键字设置为提供的值，在调用新函数时，在任何提供之前提供一个给定的参数序列。
