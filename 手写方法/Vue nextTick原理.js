let callbacks = []
let pending = false
function flushCallbacks(){
    pending = false // 把标志还原为false
    // 依次执行回调
    for(let i = 0; i < callbacks.length; i++){
        callbacks[i]()
    }
}
let timerFunc; // 定义异步方法 采用优雅降级
if(typeof Promise !== "undefined"){
    // 如果支持promise
    const p = Promise.resolve()
    timerFunc = () => {
        p.then(flushCallbacks)
    }
} else if (typeof MutationObserver !== "undefined"){
    // MutationObserver主要是监听dom变化 也是一个异步方法
    let counter = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
    }
} else if (typeof setImmediate !== "undefined"){
    // 如果前面都不支持 判断setImmediate

}
