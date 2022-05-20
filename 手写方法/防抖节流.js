// 防抖
function debounce(fn, delay = 300){
    let timer
    return function(){
        const args = arguments
        if(timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)      // 改变this指向为调用debounce所指的对象
        }, delay)
    }
}
window.addEventListener(
    'scroll',
    debounce(() => {
        console.log("12345")
    }, 1000)
)

// 节流
function throttle(fn, delay){
    let flag = true
    return () => {
        if(!flag) return
        flag = false
        timer = setTimeout(() => {
            fn()
            flag = true
        }, delay)
    }
}

window.addEventListener(
    'scroll',
    throttle(() => {
        console.log("6666666")
    }, 1000)
)
