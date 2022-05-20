Webpack热更新及编译流程

本文以剖析webpack-dev-server源码，从零开始实现webpack热更新HMR，深入了解webpack-dev-server、webpack-dev-middleware、webpack-hot-middleware
的实现机制，彻底搞懂他们的原理，在面试过程中这个知识点能答得非常出彩，在搭建脚手架过程中这块能得心应手。

什么是HMR?

Hot Module Replacement，简称HMR，是指当我们对代码修改并保存后，webpack将会对代码进行新的打包，并将新的模块发送给浏览器端，浏览器用新的模块替换掉旧的
模块，以实现在不刷新浏览器的前提下更新页面。

优点：相对于live reload刷新页面的方案，HMR的优点在于可以保存应用的状态，提高了开发效率。

理解chunk和module的概念：
chunk就是若干module打成的包，一个chunk应该包括多个module，一般来说最终会形成一个file，而JS以外的资源，webpack会通过各种loader转换成一个module，这个
模块会被打包到某个chunk中，并不会形成一个独立的chunk。


webpack编译

webpack watch：使用监控模式开始启动webpack编译，在webpack的watch模式下，文件系统中某一个文件发生修改，webpack监听到文件变化，根据配置文件对模块重新
编译打包，每次编译偶数产生一个唯一的hash值。

HotModuleReplacementPlugin做了哪些事？
1、生成两个补丁文件
manifest(JSON)上一次编译生成的hash.hot-update.json(如:b1f49e2fc76aae861d9f.hot-update.json)

updated chunk(JavaScript)chunk名字.上一次编译生成的hash.hot-update.js(如：main.b1f49e2fc76aae861d9f.hot-update.js)
这里调用了一个全局的webpackHotUpdate函数，留心一下这个js的结构

是的这两个文件不是webpack生成的，而是这个插件生成的，你可在配置文件把HotModuleReplacementPlugin去掉试一试。

2、在chunk文件中注入HMR runtime运行时代码：我们的热更新客户端主要逻辑（拉取新模块代码、执行新模块代码、执行accept的回调实现局部更新）都是这个插件把函数
注入到我们的chunk文件中，而非webpack-dev-server，webpack-dev-server只是调用了这些函数。

看懂打包文件

下面这段代码就是使用HotModuleReplacementPlugin编译生成的chunk，注入HMR runtime的代码，启动服务npm run dev，输入http://loaclhost:8000/main.js，
截取主要的逻辑细节处理省了：
(function (modules) {
  	//(HMR runtime代码) module.hot属性就是hotCreateModule函数的执行结果，所有hot属性有accept、check等属性
  	function hotCreateModule() {
        var hot = {
            accept: function (dep, callback) {
                for (var i = 0; i < dep.length; i++)
                    hot._acceptedDependencies[dep[i]] = callback;
            },
            check: hotCheck,//【在webpack/hot/dev-server.js中调用module.hot.accept就是hotCheck函数】
        };
        return hot;
    }
    //(HMR runtime代码) 以下几个方法是 拉取更新模块的代码
    function hotCheck(apply) {}
    function hotDownloadUpdateChunk(chunkId) {}
    function hotDownloadManifest(requestTimeout) {}
    //(HMR runtime代码) 以下几个方法是 执行新代码 并 执行accept回调
    window["webpackHotUpdate"] = function webpackHotUpdateCallback(chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules);
    };
    function hotAddUpdateChunk(chunkId, moreModules) {hotUpdateDownloaded();}
    function hotUpdateDownloaded() {hotApply()}
    function hotApply(options) {}
    //(HMR runtime代码) hotCreateRequire给模块parents、children赋值了
    function hotCreateRequire(moduleId) {
      	var fn = function(request) {
            return __webpack_require__(request);
        };
        return fn;
    }
    // 模块缓存对象
    var installedModules = {};
    // 实现了一个 require 方法
    function __webpack_require__(moduleId) {
        // 判断这个模块是否在 installedModules缓存 中
        if (installedModules[moduleId]) {
            // 在缓存中，直接返回 installedModules缓存 中该 模块的导出对象
            return installedModules[moduleId].exports;
        }
        // Create a new module (and put it into the cache)
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,  // 模块是否加载
            exports: {},  // 模块的导出对象
            hot: hotCreateModule(moduleId), // module.hot === hotCreateModule导出的对象
            parents: [], // 这个模块 被 哪些模块引用了
            children: [] // 这个模块 引用了 哪些模块
        };
        // (HMR runtime代码) 执行模块的代码，传入参数
        modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
        // 设置模块已加载
        module.l = true;
        // 返回模块的导出对象
        return module.exports;
    }
    // 暴露 模块的缓存
    __webpack_require__.c = installedModules;
    // 加载入口模块 并且 返回导出对象
    return hotCreateRequire(0)(__webpack_require__.s = 0);
})(
    {
        "./src/content.js":
            (function (module, __webpack_exports__, __webpack_require__) {}),
        "./src/index.js":
            (function (module, exports, __webpack_require__) {}),// 在模块中使用的require都编译成了__webpack_require__
        "./src/lib/client/emitter.js":
            (function (module, exports, __webpack_require__) {}),
        "./src/lib/client/hot/dev-server.js":
            (function (module, exports, __webpack_require__) {}),
        "./src/lib/client/index.js":
            (function (module, exports, __webpack_require__) {}),
        0:// 主入口
            (function (module, exports, __webpack_require__) {
                eval(`
                    __webpack_require__("./src/lib/client/index.js");
                    __webpack_require__("./src/lib/client/hot/dev-server.js");
                    module.exports = __webpack_require__("./src/index.js");
                `);
            })
    }
);

梳理下大概的流程：
1、hotCreateRequire(0)(__webpack_require__.s)主入口
2、当浏览器执行这个chunk时，在执行每个模块的时候，会给每个模块传入一个module对象，结构如下，并把这个module对象放到缓存installedModules中，我们可以
通过__webpack_require__.c拿到这个模块缓存对象。
var module = installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {},
    hot: hotCreateModule(moduleId),
    parents: [],
    children: []
};
3、hotCreateRequire会帮我们给模块module的parents、children赋值
4、接下来看看hot属性，hotCreateModule(moduleId)返回了啥？没错hot是一个对象，有accept、check两个主要属性，接下来我们就详细的剖析下module.hot和
module.hot.accept
function hotCreateModule(){
    var hot = {
        accept: function (dep, callback){
            for(var i = 0, i < dep.length; i++){
                hot.__acceptedDependencies[dep[i]] = callback
            }
        },
        check: hotCheck,
    }
    return hot
}

聊聊module.hot和module.hot.accept

1、accept使用
如果要实现热更新，下面这段代码是必不可少的，accept传入的回调函数就是局部刷新逻辑，当./content.js模块改变时执行：
if(module.hot){
    module.hot.accept(["./content.js"], render)
}

2、accept原理
为什么我们只有写了module.hot.accept(["./content.js"], render)才能实现热更新？这得从accept这个函数的原理开始说起，我们再来看看module.hot和
module.hot.accept
function hotCreateModule() {
    var hot = {
        accept: function (dep, callback) {
            for (var i = 0; i < dep.length; i++)
                hot._acceptedDependencies[dep[i]] = callback;
        },
    };
    return hot;
} 
var module = installedModules[moduleId] = {
    // ...
    hot: hotCreateModule(moduleId),
};
没错accept就是往hot._acceptedDependencies对象存入局部更新回调函数，_acceptedDependencies什么时候会用到呢？（当模块文件改变的时候，我们会
调用acceptedDependencies搜集的回调）

3、再看accept
// 再看下面这段代码是不是有点明白了
if (module.hot) {
    module.hot.accept(["./content.js"], render);
    // 等价于module.hot._acceptedDependencies["./content.js"] = render
    // 没错，他就是将模块改变时，要做的事进行了搜集，搜集到_acceptedDependencies中
    // 以便当content.js模块改变时，他的父模块index.js通过_acceptedDependencies知道要干什么
}

服务端实现

客户端实现

。。。未完待续（https://juejin.cn/post/6844904020528594957#heading-24）
