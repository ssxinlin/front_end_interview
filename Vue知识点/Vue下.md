26、说说nextTick的用处？
举个例子，在Vue中：
this.name = '林三心'
this.age = 18
this.sex = '男'

我们修改了三个变量，那问题来了，是每修改一次，DOM就更新一次吗？不是的，Vue采用的是异步更新的策略，通俗点讲就是，同一事件循环内多次修
改，会同一进行一次视图更新，这样才能节省性能。
看懂了上面，那你应该也看得懂下面的例子了吧：
<div ref="testDiv">{{name}}</div>

name: '小林'

this.name = '林三心'
console.log(this.$refs.testDiv.innerHTML) // 这里是啥呢

答案是“小林”，前面说了，Vue是异步更新，所以数据一更新，视图却还没更新，所以拿到的还是上一次的旧视图数据，那么想要拿到最新视图
数据怎么办呢？
this.name = '林三心'
this.$nextTick(() => {
    console.log(this.$refs.testDiv.innerHTML) // 林三心
})

27、Vue的SSR是什么？有什么好处？
SSR就是服务端渲染。
基于node.js serve服务环境开发，所有html代码在服务端渲染。
数据返回给前端，然后前端进行“激活”，即可成为浏览器识别的html代码。
SSR首次加载更快，有更好的用户体验，有更好的seo优化，因为爬虫能看到整个页面的内容，如果是vue项目，由于数据还要经过解析，这就造成爬虫并
不会等待你的数据加载完成，所以其实Vue项目的seo体验并不是很好。

28、Vue的响应式是怎么实现的？
整体思路：数据劫持+观察者模式
对象内部通过defineReactive方法，使用Object.defineProperty将属性进行劫持（只会劫持已经存在的属性），数组则是通过重写数组方法来实现。
当页面使用对应属性时，每个属性都拥有自己的dep属性，存放它依赖的watcher（依赖收集），当属性变化后会通知自己对应的watcher去更新
（派发更新）。
想详细了解过程：https://juejin.cn/column/6969563635194527758

const { arrayMethods } = require('./array')

class Observer {
    constructor(value){
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true
        })
        if(Array.isArray(value)){
            value._proto_ = arrayMethods
            this.observeArray(value)
        }else{
            this.walk(value)
        }
    }
    walk(data){
        let keys = Object.keys(data)
        for(let i = 0; i < keys.length; i++){
            const key = keys[i]
            const value = data[key]
            defineReactive(data, key, value)
        }
    }
    observeArray(items){
        for(let i = 0; i < item.length; i++){
            observe(item[i])
        }
    }
}

function defineReactive(data, key, value){
    const childOb = observe(value)
    const dep = new Dep()
    Object.defineProperty(data, key, {
        get(){
            console.log('获取值')
            if(Dep.target){
                dep.depend()
                if(childOb){
                    childOb.dep.depend()
                    if(Array.isArray(value)){
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newVal){
            if(newVal === value) return
            observe(newVal)
            value = newVal
            dep.notify()
        }
    })
}

function observe(value){
    if(Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value)){
        return new Observer(value)
    }
}

function dependArray(value){
    for(let e,i = 0, l = value.length; i < l; i++){
        e = value[i]
        e && e._ob_ && e._ob_.dep.depend()
        if(Array.isArray(e)){
            dependArray(e)
        }
    }
}

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methodsToPath = [
    'push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'
]
methodsToPath.forEach(method => {
    arrayMethods[method] = function(...args){
        const result = arrayProto[method].apply(this, args)
        const ob = this._ob_
        var inserted
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
            default:
                break;    
        }
        if(inserted) ob.observeArray(inserted)
        ob.dep.notify()
        return result
    }
})

29、为什么只对对象劫持，而要对数组进行方法重写？
因为对象最多也就几十个属性，拦截起来数量不多，但是数组可能会有几百几千项，拦截起来非常耗性能，所以直接重写数组原型上的方法，是比较
节省性能的方案。

30、Vue的模板编译原理？
建议看这篇：https://juejin.cn/post/6969563640416436232

31、Vue的computed和watch的原理？
建议看这篇：https://juejin.cn/post/6974293549135167495

32、Vue.set方法的原理？
function set(target, key, val){
    // 判断是否是数组
    if(Array.isArray(target)){
        target.length = Math.max(target.length, key)
        target.splice(key, 1, val)
        return val
    }
    const ob = target._ob_
    // 如果此对象没有不是响应式对象，直接设置并返回
    if(key in target && !(key in target.prototype) || !ob){
        target[key] = val
        return val
    } 
    // 否则，新增属性，并响应式处理
    defineReactive(target, key, val)
    return val
}

33、Vue.delete方法的原理？
function delete(target, key){
    // 判断是否是数组
    if(Array.isArray(target)){
        target.splice(key, 1)
        return 
    }
    const ob = target._ob_
    // 对象本身就没有这个属性，直接返回
    if(!(key in target)) return
    // 否则，删除这个属性
    delete target[key]
    // 判断是否是响应式对象，不是的话，直接返回
    if(!ob) return
    ob.dep.notify()
}

34、nextTick的原理？
let callbacks = []; //回调函数
let pending = false;
function flushCallbacks() {
  pending = false; //把标志还原为false
  // 依次执行回调
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]();
  }
}
let timerFunc; //先采用微任务并按照优先级优雅降级的方式实现异步刷新
if (typeof Promise !== "undefined") {
  // 如果支持promise
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
  };
} else if (typeof MutationObserver !== "undefined") {
  // MutationObserver 主要是监听dom变化 也是一个异步方法
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
} else if (typeof setImmediate !== "undefined") {
  // 如果前面都不支持 判断setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // 最后降级采用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!pending) {
    pending = true;
    timerFunc();
  }
}

35、key有什么用？说说diff算法。
建议看这篇：https://juejin.cn/post/6844904113587634184

36、如果子组件改变props里的数据会发生什么？
a.改变的props数据是基本数据类型
如果修改的是基本类型，则会报错
props:{
    num:Number,
}
created(){
    this.num = 999 // 会出错
}

b.改变的props数据是引用数据类型
props:{
    item:{
        default:() => {},
    }
}
created(){
    this.item.name = 'sanxin'; //不报错，并且父级数据会跟着变
    this.item = 'sss' // 会报错，跟基础类型报一样的错
}

37、props怎么自定义验证？
props:{
    num:{
        default: 1,
        validator: function(value){
            return [1, 2, 3, 4, 5].indexOf(value) !== -1
        }
    }
}

38、watch的immediate属性有什么用？
比如平时created时要请求一次数据，并且当搜索值改变，也要请求数据，我们会这么写：
created(){
    this.getList()
}
watch:{
    searchInputValue(){
        this.getList()
    }
}
使用immediate可以这么写，当它为true时，会初始执行一次。
watch:{
    searchInputValue:{
        handler: 'getList',
        immediate: true
    }
}

39、watch监听一个对象时，如何排除某些属性的监听？
data(){
    return {
        params: {
            a: 1,
            b: 2,
            c: 3,
            d: 4
        }
    }
}
watch:{
    params:{
        deep: true,
        handler(){
            this.getList;
        }
    }
}
但是如果我只想要a，b改变时重新请求，c，d改变时不重新请求呢？
mounted(){
    Object.keys(this.params)
    .filter((_) => !["c", "d"].includes(_) // 排除对c，d属性的监听
    .forEach((_) => {
        this.$watch((vm) => vm.params[_], handler, {
            deep: true,
        })
    })
}
data(){
    return {
        params:{
            a: 1,
            b: 2,
            c: 3,
            d: 4
        }
    }
}
watch:{
    params:{
        deep: true,
        handler(){
            this.getList
        }
    }
}

40、审查元素时发现data-v-xxxx，这是啥？
这是在标记Vue文件中CSS时使用scoped标记产生的，因为要保证各文件中的CSS不相互影响，给每个component都做了唯一的标记，所以每引入一个component就会出现一个新
的'data-v-xxxx'标记。

41、computed如何实现传参？
<div>{{total(3)}}</div>
computed:{
    total(){
        return function(n){
            return n * this.num
        }
    }
}

42、Vue的hook的使用？
a.同一组件中使用
这是我们常用的使用定时器的方式：
export default {
    data(){
        timer: null
    },
    mounted(){
        this.timer = setInterval(() => {
            console.log(1)
        }, 1000)
    },
    beforeDestory(){
        clearInterval(this.timer);
        this.timer = null;
    }
}
上面做法不好的地方在于：得全局多定义一个timer变量，可以使用hook这么做：
export default {
    methods: {
        fn(){
            const timer = setInterval(() => {
                console.log(1)
            }, 1000);
            this.$once('hook:beforeDestory', () => {
                clearInterval(timer);
                timer = null
            })
        }
    }
}
b.父子组件使用
如果子组件需要在mounted时触发父组件的某一个函数，平时都会这么写：
//父组件
<rl-child @childMounted="childMountedHandle"/>
method () {
  childMountedHandle() {
    // do something...
  }
},

// 子组件
mounted () {
  this.$emit('childMounted')
},
使用hook的话可以更方便：
// 父组件
<rl-child @hook:mounted="childMountedHandle"/>
method(){
    childMountedHandle(){
        // do something...
    }
}

43、provide和inject是响应式的吗？
// 祖先组件
provide(){
    return {
        // keyName: { name: this.name }, // value 是对象才能实现响应式，也就是引用类型
        keyName: this.changeValue // 通过函数的方式也可以[注意，这里是把函数作为value，而不是this.changeValue()]
        // keyName: 'test' value 如果是基本类型，就无法实现响应式
    }
},
data(){
    return {
        name: '张三'
    }
},
methods:{
    changeValue(){
        this.name = 'zhangSan'
    }
}
// 后代组件
inject:['keyName']
created(){
    console.log(this.keyName) // zhangSan
}

44、Vue的el属性和$mount优先级？
比如下面这种情况，Vue会渲染到哪个节点上？
new Vue({
    router,
    store,
    el:'#app',
    render: h => h(App)
}).$mount('#ggg')
el和$mount同时存在时，el优先级 > $mount

45、动态指令和参数有使用过吗？
<template>
    <aButton @[someEvent]="handleSomeEvent()" :[someProps]="1000" />
</template>
/*<script>
  data(){
    return{
      someEvent: someCondition ? "click" : "dbclick",
      someProps: someCondition ? "num" : "price"
    }
  },
  methods: {
    handleSomeEvent(){
      // handle some event
    }
  }  
</script> */

46、相同的路由组件如何重新渲染？
开发人员经常遇到的情况是，多个路由解析为同一个Vue组件。问题是，Vue出于性能原因，默认情况下共享组件将不会重新渲染，如果你尝试在使用相同组件的路由之间进行切换，
则不会发生任何变化。
const routes = [
    {
        path: '/a',
        component: MyComponent
    },
    {
        path:'/b',
        component: MyComponent
    }
]
如果依然想重新渲染，怎么办呢？可以使用key
<template>
    <router-view :key="$route.path"></router-view>
</template>

47、自定义v-model
默认情况下，v-model是@input事件侦听器和:value属性上的语法糖，但是，你可以在你的Vue组件中指定一个模型属性来定义使用什么事件和value属性
export default: {
    model: {
        event: 'change',
        prop: 'checked'
    }
}

48、如何获取的data中某一个数据的初始状态？
在开发中，有时候需要拿初始状态去计算，例如：
data(){
    return {
        num: 10
    }
},
mounted(){
    this.num = 1000
},
methods: {
    howMuch(){
        // 计算出num增加了多少，那就是1000 - 初始值
        // 可以通过this.$options.data().xxx来获取初始值
        console.log(1000 - this.$options.data().num)
    }
}

49、为什么不建议v-for和v-if同时存在？
<div v-for="item in [1, 2, 3, 4, 5, 6, 7]" v-if="item !== 3">
    {{item}}
</div>
上面的写法是v-for和v-if同时存在，会先把7个元素都遍历出来，然后再一个个判断是否为3，并把3给隐藏掉，这样的坏处就是，渲染了无用的3节点，增加无用的dom操作，
建议使用computed来解决这个问题：
<div v-for="item in list">
    {{item}}
</div>

computed() {
    list() {
        return [1, 2, 3, 4, 5, 6, 7].filter(item => item !== 3)
    }
}

50、计算变量时，methods和computed哪个好？
<div>
    <div>{{howMuch1()}}</div>
    <div>{{howMuch2()}}</div>
    <div>{{index}}</div>
</div>

data: () {
    return {
         index: 0
    }
}
methods: {
    howMuch1() {
        return this.num + this.price
    }
}
computed() {
    howMuch2() {
        return this.num + this.price
    }
}
computed会好一些，因为computed会有缓存。例如index由0变成1，那么会触发视图更新，这个时候methods会重新执行一次，而computed不会，因为computed依赖的两个
变量num和price都没变。
