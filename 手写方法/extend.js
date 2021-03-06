function Parent(name) {
    this.name = name
    this.say = () => {
        console.log("hello")
    }
}
Parent.prototype.play = () => {
    console.log("world")
}
function Children(name){
    Parent.call(this)
    this.name = name
}
Children.prototype = Object.create(Parent.prototype)
Children.prototype.constructor = Children

let child = new Children("张三")
console.log(child.name)
child.say()
child.play()
