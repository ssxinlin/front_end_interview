function mySetInterval(fn, time = 1000){
    let timer = null, isClear =false
    function interval(){
        if(isClear){
            isClear = false
            clearInterval(timer)
            return
        }
        fn()
        tiemr = setTimeout(interval, time)
    }
    timer = setTimeout(interval, time)
    return () => {
        isClear = true
    }
}

let a = mySetInterval(()=>{
    console.log("hello")
}, 1000)
// a()
let cannel = mySetInterval(()=>{
    console.log("world")
}, 1500)
cannel()
