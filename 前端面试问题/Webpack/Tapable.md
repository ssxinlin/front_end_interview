Tapable

Webpack本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable，Webpack中最核心的负责编译的Compiler和负责创建bundles
的Compilation都是Tapable的实例。本文主要介绍一下Tapable中的钩子函数。

tapable包暴露出很多钩子类，这些类可以用来为插件创建钩子函数，主要包含一下几种：
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook
} = require("tapable"); 

所有钩子类的构造函数都接收一个可选的参数，这个参数是一个由字符串参数组成的数组，如下：
const hook = new SyncHook(["arg1", "arg2", "arg3"])


hooks概览

常用的钩子主要包含一下几种，分为同步和异步，异步又分为并发执行和串行执行
Tapable
    1、Sync：
        a.SyncHook
        b.SyncBailHook
        c.SyncWaterfallHook
        d.SyncLoopHook
    2、Async：
        a.AsyncParallel*
            I、AsyncParallelHook
            II、AsyncParallelBailHook    
        b.AsyncSeries*
            I、AsyncSeriesHook,
            II、AsyncSeriesBailHook,
            III、AsyncSeriesWaterfallHook    

首先，整体感受下钩子的用法，如下
1
SyncHook
同步串行
不关心监听函数的返回值


2
SyncBailHook
同步串行
只要监听函数中有一个函数的返回值不为 null，则跳过剩下所有的逻辑


3
SyncWaterfallHook
同步串行
上一个监听函数的返回值可以传给下一个监听函数


4
SyncLoopHook
同步循环
当监听函数被触发的时候，如果该监听函数返回true时则这个监听函数会反复执行，如果返回 undefined 则表示退出循环


5
AsyncParallelHook
异步并发
不关心监听函数的返回值


6
AsyncParallelBailHook
异步并发
只要监听函数的返回值不为 null，就会忽略后面的监听函数执行，直接跳跃到callAsync等触发函数绑定的回调函数，然后执行这个被绑定的回调函数


7
AsyncSeriesHook
异步串行
不关系callback()的参数


8
AsyncSeriesBailHook
异步串行
callback()的参数不为null，就会直接执行callAsync等触发函数绑定的回调函数


9
AsyncSeriesWaterfallHook
异步串行
上一个监听函数的中的callback(err, data)的第二个参数,可以作为下一个监听函数的参数
