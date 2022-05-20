class Observer {
    // 观测值
    constructor(value) {
        this.walk(value)
    }
    walk(data){
        // 对象上的所有属性依次进行观测
        let keys = Object.keys(data)
        for(let i = 0; i < keys.length; i++){
            let key = keys[i]
            let value = data[key]
            defineReactive(data, key, value)
        }
    }
}
// Object.definePrototype数据劫持核心 兼容性在ie9以上
function defineReactive(data, key, value){
    Object.defineProperty(data, key, {
        get(){
            console.log("获取值")
            return value
        },
        set(newValue){
            if(newValue === value) return
            console.log("设置值")
            value = newValue
        }
    })
}
export function observe(value){
    // 如果传过来的是对象或者数组，进行属性劫持
    if(Object.prototype.toString.call(value) === "[object Object]" || Array.isArray(value)){
        return new Observer(value)
    }
}
