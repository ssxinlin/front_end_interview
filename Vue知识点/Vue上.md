1、Vue的优点？Vue的缺点？
优点：渐进式，组件化，轻量级，虚拟dom，响应式，单页面路由，数据与视图分开
缺点：单页面不利于seo，不支持ie8以下，首屏加载时间长

2、为什么说Vue是一个渐进式框架？
渐进式：通俗的讲就是，你想用啥就用啥，不强求你，你想用component就用，不用也可以。

3、Vue跟React的异同点？
相同点：
a.都使用了虚拟dom
b.组件化开发
c.都是单向数据流（父子组件之间，不建议子组件修改父组件传下来的数据）
d.都支持服务端渲染
不同点：
a.React的JSX，Vue的template
b.数据变化，React手动（setState）,Vue自动（初始化已响应式处理，Object.defineProperty）
c.React单向绑定，Vue双向绑定
d.React的Redux，Vue的Vuex

4、MVVM是什么？和MVC有何区别呢？
MVC
Model（模型）：负责从数据库中取数据
View（视图）：负责展示数据的地方
Controller（控制器）：用户交互的地方，例如点击事件等
思想：Controller将Model的数据展示在View上
MVVM
VM:也就是View-Model，做了两件事达到了数据的双向绑定，一是将Model转换成View，即将后端传递的数据转换成看到的页面。
实现的方式是：数据绑定。二是将View转换成Model，即将看到的页面转换成后端的数据。实现的方式是：DOM事件监听。
思想：实现了View和Model的自动同步，也就是当Model的属性改变时，我们不用再手动操作Dom元素来改变View的显示，
而是改变该属性，对应View层显示会自动改变（对应Vue数据驱动的思想）
区别：
整体看来，MVVM比MVC精简得多，不仅简化了业务与界面的依赖，还解决了数据频繁更新的问题，不用再用选择器操作DOM元素。
因为在MVVM中，View不知道Model的存在，Model和View-Model也观察不到View，这种低耦合模式提高了代码的可复用性。
Vue是不是MVVM框架？
Vue是MVVM框架，但是不是严格符合MVVM，因为MVVM规定Model和View不能直接通信，而Vue的ref可以做到这点

5、Vue和jQuery的区别在哪？为什么放弃jQuery用Vue？
a.jQuery是直接操作DOM，Vue不直接操作DOM，Vue的数据与视图是分开的，Vue只需要操作数据即可
b.jQuery的操作DOM行为是频繁的，而Vue利用虚拟DOM技术，大大提高了更新DOM时的性能
c.Vue中不倡导直接操作DOM，开发者只需要把大部分精力放在数据层面
d.Vue集成的一些库，大大提高了开发效率，比如Vuex，Router等

6、Vue的作者是谁
尤雨溪

7、为什么data是个函数并且返回一个对象呢？
data之所以是一个函数，是因为一个组件可能会多处调用，而每一次调用就会执行一次data函数并返回新的数据对象，
这样，就可以避免多处调用之间的数据污染。

8、使用过哪些Vue的修饰符？
Vue的修饰符
.lazy：作用是，改变输入框的值时value不会改变，当光标离开输入框时，v-model绑定的值value才会改变
.trim：作用类似与JavaScript的trim()方法，作用是把v-model绑定的值的首尾空格给过滤掉。
.number：作用是将值转成数字，但是先输入字符串和先输入数字是两种情况，先输入数字的话，只取前面数字部分，
先输入字母的话，number修饰符无效。
.stop：作用是阻止冒泡。
.capture：事件默认是由里往外冒泡，capture修饰符的作用是反过来，由外往内捕获。
.self：作用是，只有点击事件绑定的本身才会触发事件。
.once：作用是事件只执行一次。
.prevent：作用是阻止默认事件（例如a标签的跳转）
.native：加在自定义组件的事件上，保证事件能执行
.left, .middle, .right：这三个修饰符是鼠标的左中右按键触发的事件
.passive：当我们在监听元素滚动事件的时候，会一直触发onscroll事件，在pc端是没有问题的，但在移动端会让我们的网页变卡，
因此我们使用这个修饰符的时候，相当于给onscroll事件整了一个.lazy修饰符
.camel：确保绑定参数被识别为驼峰写法。
.sync：父子组件传值，子组件想更新这个值，使用此修饰符可简写。

9、使用过哪些Vue的内部指令？
Vue指令
v-text：更新元素的textContent。
v-html：更新元素的innerHTML。
v-show：根据表达式真假值，切换元素的display CSS property，当条件变化时该指令触发过渡效果。
v-if：根据表达式真假值，来有条件地渲染元素。在切换元素及它的数据绑定，组件被销毁并重建，如果元素是<template>，
将提出它的内容作为条件块，当条件变化时该指令触发过渡效果。
v-else：前一兄弟元素必须有v-if或者v-else-if，类似js中的if else。
v-else-if：前一兄弟元素必须有v-if或者v-else-if。
v-for：列表循环渲染，数组，对象，字符串都可以。
v-on：缩写是@，绑定事件。
v-bind：缩写是：，用于动态绑定各种变量。
v-model：双向绑定表单项的值。
v-slot：缩写是#，插槽名。
v-once：元素和组件只渲染一次。
v-pre：跳过这个元素和它的子元素的编译过程，可以用来显示原始Mustache标签，跳过大量没有指令的节点会加快编译。
v-cloak：这个指令保持在元素上直接关联实例结束编译，和CSS规则如[v-cloak]:{display:none}一起用时，
这个指令可以隐藏来编译的Mustache标签直到实例准备完毕。

10、组件之间的传值方式有哪些？
a.父子组件传值给子组件，子组件使用props进行接收。
b.子组件传值给父组件，子组件使用$emit+事件对父组件进行传值。
c.组件中可以使用$parent和$children获取到父组件实例和子组件实例，进而获取数据。
d.使用$attrs和$listeners，在对一些组件进行二次封装时可以方便传值，例如A->B->C。
e.使用$ref获取组件实例，进而获取数据。
f.使用Vuex进行状态管理。
g.使用eventBus进行跨组件触发事件，进而传递数据。
h.使用provide和inject，官方建议我们不要用这个。
i.使用浏览器本地缓存，例如localStorage

11、路由有哪些模式？又有哪些不同呢？
a.hash模式：通过#号后面的内容的更改，触发hashchange事件，实现路由切换。
b.history模式：通过pushState和replaceState切换url，触发popstate事件，实现路由切换，需要后端配合

12、如何设置动态class，动态style？
a.动态class对象：<div :class="{ 'is-active': true, 'red': isRed }"></div>
b.动态class数组：<div :class="[ 'is-active', isRed ? 'red' : '' ]"></div>
c.动态style对象：<div :style="{ color: textColor, fontSize: '18px' }"></div>
d.动态style数组：<div :style="[{ color: textColor, fontSize: '18px' }, { fontWeight: '300' }]"></div>

13、v-if和v-show有何区别？
a.v-if是通过控制DOM元素的销毁和生成来实现显隐，每一次显隐都会使组件重新跑一遍生命周期，因为显隐决定了组件的生成和销毁。
b.v-show是通过控制DOM元素的class样式来实现显隐，不会销毁。
c.频繁或者大量显隐使用v-show，是否使用v-if。

14、computed和watch有何区别？
a.computed是依赖已有的变量来计算一个目标变量，大多数情况都是多个变量凑在一起计算出一个变量，并且computed具有缓存机制，
依赖值不变的情况下其会直接读取缓存进行复用，computed不能进行异步操作。
b.watch是监听一个变量的变化，并执行相应的回调函数，通常是一个变量的变化决定多个变量的变化，watch可以进行异步操作。
c.简单记就是：一般情况下，computed是多对一，watch是一对多。

15、Vue的生命周期？
服务端是否调用？
a.beforeCreate（是）：实例了Vue但还没进行数据的初始化与响应式处理。
b.created（是）：数据已被初始化和响应式处理，在这里可以访问到数据，也可以修改数据。
c.beforeMount（否）：render函数在这里被调用，生成虚拟DOM，但是还没有转成真实DOM并替换el。
d.mounted（否）：在这里真实DOM挂载完毕。
e.beforeUpdate（否）：数据更新后，新的虚拟DOM生成，但还没跟旧的虚拟DOM对比打补丁。
f.updated（否）：新旧虚拟DOM对比打补丁后，进行真实DOM的更新。
g.activated（否）：被keep-alive缓存的组件被激活时调用。
h.deactivated（否）：被keep-alive缓存的组件停用时调用。
i.destroyed（否）：实例销毁后调用，该钩子被调用后，对应Vue实例的所有指令都被解绑，所有的事件监听器被移除，所有的子实例也被销毁。
j.errorCaptured（是）：当捕获一个来自子孙组件的错误时被调用，此钩子会收到三个参数：错误对象，
发生错误的组件实例以及一个包含错误来源信息的字符串，此钩子可以返回false以阻止该错误继续向上传播。

16、为什么v-if和v-for不建议用在同一便签？
在Vue2中，v-for优先级是高于v-if的，咱们来看例子：
<div v-for="item in [1,2,3,4,5,6,7]" v-if="item !== 3">
    {{item}}
</div>>
上面的写法是v-for和v-if同时存在，会先把7个元素都遍历出来，然后再一个个判断是否为3，并把3给隐藏掉，这样的坏处就是，
渲染了无用的3节点，增加无用的DOM操作，建议使用computed来解决这个问题。
<div v-for="item in list">
    {{item}}
</div>

computed() {
    list() {
        return [1, 2, 3, 4, 5, 6, 7].filter(item => item !== 3)
    }
}

17、Vuex有哪些属性？用处是什么？
a.State：定义了应用状态的数据结构，可以在这里设置默认的初始状态。
b.Getter：允许组件从Store中获取数据，mapGetters辅助函数仅仅是将store中的getter映射到局部计算属性。
c.Mutation：是唯一更改Store中状态的方法，且必须是同步函数。
d.Action：用于提交mutation，而不是直接变更状态，可以包含任意异步操作。
e.Module：允许将单一的Store拆分为多个Store且同时保存在单一的状态树中。

18、不需要响应式的数据应该怎么处理？
在我们的Vue开发中，会有一些数据，从始至终都未曾改变过，这种死数据，既然不改变，那也就不需要对他做响应式处理了，
不然只会做一些无用功消耗性能，比例一些写死的下拉框，写死的表格数据，这些数据量大的死数据，如果都进行响应式处理，会消耗大量性能。
/*
方法一：将数据定义在data之外
data(){
    this.list1 = { xxxxxxxxxxxxx },
    this.list2 = { xxxxxxxxxxxxx },
    this.list3 = { xxxxxxxxxxxxx },
    this.list4 = { xxxxxxxxxxxxx },
    this.list5 = { xxxxxxxxxxxxx },
    return {}
}

方法二：Object.freeze()
data(){
    return{
        list1: Object.freeze({ xxxxxxxxxxxxx }),
        list2: Object.freeze({ xxxxxxxxxxxxx }),
        list3: Object.freeze({ xxxxxxxxxxxxx }),
        list4: Object.freeze({ xxxxxxxxxxxxx }),
        list5: Object.freeze({ xxxxxxxxxxxxx })
    }
}
*/

19、watch有哪些属性，分别有什么用？
当我们监听一个基本数据类型时：
watch: {
    value(){
        // do something
    }
}
当我们监听一个引用数据类型时：
watch: {
    obj: {
        handler(){ // 执行回调函数
            // do something
        },
        deep: true, // 是否执行深度监听
        immediate: true // 是否执行handler函数
    }
}

20、父子组件生命周期顺序？
父beforeCreate -> 父created -> 父beforeMount -> 子beforeCreate -> 子created -> 子beforeMount -> 子mounted -> 父mounted

21、对象新属性无法更新视图，删除属性无法更新视图，为什么，怎么办？
原因：Object.defineProperty没有对对象的新属性进行属性劫持。
对象新属性无法更新视图：使用Vue.$set(obj, key, value)，组件中this.$set(obj, key, value)。
删除属性无法更新视图：使用Vue.$delete(obj, key)，组件中this.$delete(obj, key)。

22、直接arr[index] = xxx无法更新视图是为什么，怎么办？
原因：Vue没有对数组进行Object.defineProperty的属性劫持，所以arr[index] = xxx是无法更新视图的。
使用数组的splice方法，arr.splice(index, 1, item)。
使用Vue.$set(arr, index, value)。

23、自定义指令
建议看这篇文章：https://www.cnblogs.com/lzq035/p/14183553.html

24、插槽的使用以及原理？
建议看这篇文章：https://juejin.cn/post/6949848530781470733

25、为什么不建议用index做key，为什么不建议用随机数做key？
举个例子：
<div v-for="(item, index) in list" :key="index">{{item.name}}</div>

list: [
    { name: '小明', id: '123' },
    { name: '小红', id: '124' },
    { name: '小花', id: '125' }
]

渲染为
<div key="0">小明</div>
<div key="1">小红</div>
<div key="2">小花</div>

现在我执行 list.unshift({ name: '小林', id: '122' })

渲染为
<div key="0">小林</div>
<div key="1">小明</div>
<div key="2">小红</div>
<div key="3">小花</div>


新旧对比

<div key="0">小明</div>  <div key="0">小林</div>
<div key="1">小红</div>  <div key="1">小明</div>
<div key="2">小花</div>  <div key="2">小红</div>
                         <div key="3">小花</div>

可以看出，如果用index做key的话，其实是更新了原有的三项，并新增了小花，虽然达到了渲染目的，但是损耗性能

现在我们使用id来做key，渲染为

<div key="123">小明</div>
<div key="124">小红</div>
<div key="125">小花</div>

现在我执行 list.unshift({ name: '小林', id: '122' })，渲染为

<div key="122">小林</div>
<div key="123">小明</div>
<div key="124">小红</div>
<div key="125">小花</div>

新旧对比

                           <div key="122">小林</div>
<div key="123">小明</div>  <div key="123">小明</div>
<div key="124">小红</div>  <div key="124">小红</div>
<div key="125">小花</div>  <div key="125">小花</div>
可以看出，原有的三项都不变，只是新增了小林这个人，这才是最理想的结果

用index和用随机数都是同理，随机数每次都在变，做不到专一性，很消耗性能。

