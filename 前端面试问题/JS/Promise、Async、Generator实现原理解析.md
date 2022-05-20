Promise/async/Generator实现原理解析

刚接触async/await时，就被其暂停执行的特性吸引了，心想在没有原生API支持的情况下，await居然能挂起当前方法，实现暂停执行，十分好奇。
以下是有关JS异步编程的一切：
1、Promise的实现原理
2、async/await的实现原理
3、Generator的实现原理

Promise实现

Promise为我们解决了什么问题：在传统的异步编程中，如果异步之间存在依赖关系，我们就需要通过层层嵌套回调来满足这种依赖，如果嵌套层数过多，可读性和可维护性
都会变得很差，产生所谓的“回调地狱”，而Promise将回调嵌套改为链式调用，增加可读性和可维护性。下面我们就来一步步实现一个Promise：
1、观察者模式
我们先来看一个最简单的Promise使用：
const p1 = new Promise((resolve, reject) => {
    setTimeout(()=>{
        resolve('resolve')
    }, 1000)
})
p1.then(res => {
    console.log(res),
}, err => {
    console.log(err)
})
观察这个例子，我们分析Promise的调用流程：
1、Promise的构造方法接收一个executor()，在new Promise()时就立刻执行这个executor回调
2、executor()内部的异步任务被放入宏/微任务队列，等待执行
3、then被执行，收集成功/失败回调，放入成功/失败队列
4、executor()的异步任务被执行，触发resolve/reject，从成功/失败队列中取出回调依次执行

其实熟悉设计模式的同学，很容易就能意识到这是个观察者模式，这种收集依赖 -> 触发通知 -> 取出依赖执行 的方式，被广泛运用于观察者模式的实现，在Promise里，
执行顺序是then收集依赖 -> 异步触发resolve -> resolve执行依赖。依此，我们可以勾勒出Promise的大致形状：
class MyPromise {
    // 构造方法接收一个回调
    constructor(executor){
        this._resolveQueue = [] // then收集的执行成功的回调队列
        this._rejectQueue = [] // then收集的执行失败的回调队列
        // 由于resolve/reject是在executor内部被调用，因此需要使用箭头函数固定this指向，否则找不到this._resolveQueue
        let _resolve = (val) => {
            // 从成功队列里取出回调依次执行
            while(this._resolveQueue.length){
                const callback = this._resolveQueue.shift()
                callback(val)
            }
        }
        // 实现同resolve
        let _reject = (val) => {
            while(this._rejectQueue.length){
                const callback = this._rejectQueue.shift()
                callback(val)
            }
        }
        // new Promise()时立即执行executor，并传入resolve和reject
        executor(_resolve, _reject)
    }
    // then方法，接收一个成功的回调和一个失败的回调，并push进对应队列
    then(resolveFn, rejectFn){
        this._resolveQueue.push(resolveFn)
        this._rejectQueue.push(rejectFn)
    }
}
我们运用观察者模式简单的实现了一下then和resolve，使我们能够在then方法的回调里取得异步操作的返回值，但我们这个Promise离最终实现还有很长的距离，
下面我们来一步步补充这个Promise。

Promise A+规范

上面我们已经简单地实现了一个超低配版Promise，但我们会看到很多文章和我们写的不一样，他们的Promise实现中还引入了各种状态控制，
这是由于ES6的Promise实现需要遵循Promise/A+规范，是规范对Promise的状态控制做了要求。Promise/A+的规范比较长，这里只总结两条核心规则：
1、Promise本质是一个状态机，且状态只能为以下三种：Pending（等待态）、Fulfilled（执行态）、Rejected（拒绝态），状态的变更是单向的，
只能从Pending -> Fulfilled 或 Pending -> Rejected，状态变更不可逆
2、then方法接收两个可选参数，分别对应状态改变时触发的回调。then方法返回一个promise。then 方法可以被同一个 promise 调用多次。

//Promise/A+规范的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._status = PENDING     // Promise状态
    this._resolveQueue = []    // 成功队列, resolve时触发
    this._rejectQueue = []     // 失败队列, reject时触发
    // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
    let _resolve = (val) => {
      if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
      this._status = FULFILLED              // 变更状态
      // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
      // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
      while(this._resolveQueue.length) {    
        const callback = this._resolveQueue.shift()
        callback(val)
      }
    }
    // 实现同resolve
    let _reject = (val) => {
      if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
      this._status = REJECTED               // 变更状态
      while(this._rejectQueue.length) {
        const callback = this._rejectQueue.shift()
        callback(val)
      }
    }
    // new Promise()时立即执行executor,并传入resolve和reject
    executor(_resolve, _reject)
  }
  // then方法,接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    this._resolveQueue.push(resolveFn)
    this._rejectQueue.push(rejectFn)
  }
}

then的链式调用

补充完规范，我们接着来实现链式调用，这是Promise实现的重点和难点，我们先来看一下then是如何链式调用的：
const p1 = new Promise((resolve, reject) => {
  resolve(1)
})

p1
  .then(res => {
    console.log(res)
    //then回调中可以return一个Promise
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(2)
      }, 1000);
    })
  })
  .then(res => {
    console.log(res)
    //then回调中也可以return一个值
    return 3
  })
  .then(res => {
    console.log(res)
  })
  // 输出: 1  2  3
  
我们思考一下如何实现这种链式调用：
1、显然.then()需要返回一个Promise，这样才能找到then方法，所以我们会把then方法的返回值包装成Promise。
2、.then()的回调需要拿到上一个.then()的返回值
3、.then()的回调需要顺序执行，以上面这段代码为例，虽然中间return了一个Promise，但执行顺序仍要保证是1->2->3。我们要等待当前Promise状态变更后，
再执行下一个then收集的回调，这就要求我们对then的返回值分类讨论
// then方法
then(resolveFn, rejectFn){
    // return一个新的Promise
    return new MyPromise((resolve, reject) => {
        // 把resolveFn重新包装一下，再push进resolve执行队列，这是为了能够获取回调的返回值进行分类讨论
        const fulfilledFn = (val) => {
            try {
                // 执行第一个（当前的）Promise的成功回调，并获取返回值
                let x = resolveFn(val)
                // 分类讨论返回值，如果是Promise，那么等待Promise状态变更，否则直接resolve
                // 这里resolve之后，就能被下一个then()的回调获取到返回值，从而实现链式调用
                x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
            } catch (error){
                reject(error)
            }
        }
        // 把后续then收集的依赖都push进当前Promise的成功回调队列中(_rejectQueue), 这是为了保证顺序调用
        this._resolveQueue.push(fulfilledFn)
        //reject同理
        const rejectedFn  = error => {
            try {
                let x = rejectFn(error)
                x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
            } catch (error) {
                reject(error)
            }
        }
        this._rejectQueue.push(rejectedFn)
    })
}


值穿透 & 状态已变更的情况

我们已经初步完成了链式调用，但是对于 then() 方法，我们还要两个细节需要处理一下
1、值穿透：根据规范，如果 then() 接收的参数不是function，那么我们应该忽略它。如果没有忽略，当then()回调不为function时将会抛出异常，导致链式调用中断
2、处理状态为resolve/reject的情况：其实我们上边 then() 的写法是对应状态为padding的情况，但是有些时候，resolve/reject 在 then() 之前就被执行
（比如Promise.resolve().then()），如果这个时候还把then()回调push进resolve/reject的执行队列里，那么回调将不会被执行，因此对于状态已经变为fulfilled
或rejected的情况，我们直接执行then回调：
  // then方法,接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
    typeof resolveFn !== 'function' ? resolveFn = value => value : null
    typeof rejectFn !== 'function' ? rejectFn = reason => {
      throw new Error(reason instanceof Error? reason.message:reason);
    } : null
    // return一个新的promise
    return new MyPromise((resolve, reject) => {
      // 把resolveFn重新包装一下,再push进resolve执行队列,这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = value => {
        try {
          // 执行第一个(当前的)Promise的成功回调,并获取返回值
          let x = resolveFn(value)
          // 分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      // reject同理
      const rejectedFn  = error => {
        try {
          let x = rejectFn(error)
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      switch (this._status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this._resolveQueue.push(fulfilledFn)
          this._rejectQueue.push(rejectedFn)
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this._value)    // this._value是上一个then回调return的值(见完整版代码)
          break;
        case REJECTED:
          rejectedFn(this._value)
          break;
      }
    })
  }

兼容同步任务

完成了then的链式调用以后，我们再处理一个前边的细节，然后放出完整代码。上文我们说过，Promise的执行顺序是new Promise -> then()收集回调 -> 
resolve/reject执行回调，这一顺序是建立在executor是异步任务的前提上的，如果executor是一个同步任务，那么顺序就会变成new Promise -> 
resolve/reject执行回调 -> then()收集回调，resolve的执行跑到then之前去了，为了兼容这种情况，我们给resolve/reject执行回调的操作包一个setTimeout，
让它异步执行。

这里插一句，有关这个setTimeout，其实还有一番学问。虽然规范没有要求回调应该被放进宏任务队列还是微任务队列，但其实Promise的默认实现是放进了微任务队列，
我们的实现（包括大多数Promise手动实现和polyfill的转化）都是使用setTimeout放入了宏任务队列（当然我们也可以用MutationObserver模拟微任务）
//Promise/A+规定的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._status = PENDING     // Promise状态
    this._value = undefined    // 储存then回调return的值
    this._resolveQueue = []    // 成功队列, resolve时触发
    this._rejectQueue = []     // 失败队列, reject时触发
    // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
    let _resolve = (val) => {
      //把resolve执行回调的操作封装成一个函数,放进setTimeout里,以兼容executor是同步代码的情况
      const run = () => {
        if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = FULFILLED              // 变更状态
        this._value = val                     // 储存当前value
        // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
        // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
        while(this._resolveQueue.length) {    
          const callback = this._resolveQueue.shift()
          callback(val)
        }
      }
      setTimeout(run)
    }
    // 实现同resolve
    let _reject = (val) => {
      const run = () => {
        if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = REJECTED               // 变更状态
        this._value = val                     // 储存当前value
        while(this._rejectQueue.length) {
          const callback = this._rejectQueue.shift()
          callback(val)
        }
      }
      setTimeout(run)
    }
    // new Promise()时立即执行executor,并传入resolve和reject
    executor(_resolve, _reject)
  }

  // then方法,接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
    typeof resolveFn !== 'function' ? resolveFn = value => value : null
    typeof rejectFn !== 'function' ? rejectFn = reason => {
      throw new Error(reason instanceof Error? reason.message:reason);
    } : null
    // return一个新的promise
    return new MyPromise((resolve, reject) => {
      // 把resolveFn重新包装一下,再push进resolve执行队列,这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = value => {
        try {
          // 执行第一个(当前的)Promise的成功回调,并获取返回值
          let x = resolveFn(value)
          // 分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      // reject同理
      const rejectedFn  = error => {
        try {
          let x = rejectFn(error)
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      switch (this._status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this._resolveQueue.push(fulfilledFn)
          this._rejectQueue.push(rejectedFn)
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this._value)    // this._value是上一个then回调return的值(见完整版代码)
          break;
        case REJECTED:
          rejectedFn(this._value)
          break;
      }
    })
  }
}

Promise.prototype.catch()

catch()方法返回一个Promise，并且处理拒绝的情况。它的行为与调用Promise.prototype.then(undefined, onRejected) 相同。
//catch方法其实就是执行一下then的第二个回调
catch(rejectFn) {
  return this.then(undefined, rejectFn)
}


Promise.prototype.finally()

finally()方法返回一个Promise。在promise结束时，无论结果是fulfilled或者是rejected，都会执行指定的回调函数。在finally之后，还可以继续then。
并且会将值原封不动的传递给后面的then
//finally方法
finally(callback) {
  return this.then(
    value => MyPromise.resolve(callback()).then(() => value),  // MyPromise.resolve执行回调,并在then中return结果传递给后面的Promise
    reason => MyPromise.resolve(callback()).then(() => { throw reason })  // reject同理
  )
}
MyPromise.resolve(callback())的意义，这里补充解释一下：这个写法其实涉及到一个finally()的使用细节，finally()如果return了一个reject状态的Promise，
将会改变当前Promise的状态，这个MyPromise.resolve就用于改变Promise状态，在finally()没有返回reject态Promise或throw错误的情况下，
去掉MyPromise.resolve也是一样的


Promise.resolve()

Promise.resolve(value)方法返回一个以给定值解析后的Promise 对象。如果该值为promise，返回这个promise；如果这个值是thenable（即带有"then" 方法)），
返回的promise会“跟随”这个thenable的对象，采用它的最终状态；否则返回的promise将以此值完成。此函数将类promise对象的多层嵌套展平。
//静态的resolve方法
static resolve(value) {
  if(value instanceof MyPromise) return value // 根据规范, 如果参数是Promise实例, 直接return这个实例
  return new MyPromise(resolve => resolve(value))
}


Promise.reject()

Promise.reject()方法返回一个带有拒绝原因的Promise对象。
//静态的reject方法
static reject(reason) {
  return new MyPromise((resolve, reject) => reject(reason))
}


Promise.all()

Promise.all(iterable)方法返回一个 Promise 实例，此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调
完成（resolve）；如果参数中  promise 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 promise 的结果。
//静态的all方法
static all(promiseArr) {
  let index = 0
  let result = []
  return new MyPromise((resolve, reject) => {
    promiseArr.forEach((p, i) => {
      //Promise.resolve(p)用于处理传入值不为Promise的情况
      MyPromise.resolve(p).then(
        val => {
          index++
          result[i] = val
          //所有then执行后, resolve结果
          if(index === promiseArr.length) {
            resolve(result)
          }
        },
        err => {
          //有一个Promise被reject时，MyPromise的状态变为reject
          reject(err)
        }
      )
    })
  })
}


Promise.race()

Promise.race(iterable)方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。
static race(promiseArr) {
  return new MyPromise((resolve, reject) => {
    //同时执行Promise,如果有一个Promise的状态发生改变,就变更新MyPromise的状态
    for (let p of promiseArr) {
      MyPromise.resolve(p).then(  //Promise.resolve(p)用于处理传入值不为Promise的情况
        value => {
          resolve(value)        //注意这个resolve是上边new MyPromise的
        },
        err => {
          reject(err)
        }
      )
    }
  })
}


完整代码
//Promise/A+规定的三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._status = PENDING     // Promise状态
    this._value = undefined    // 储存then回调return的值
    this._resolveQueue = []    // 成功队列, resolve时触发
    this._rejectQueue = []     // 失败队列, reject时触发

    // 由于resolve/reject是在executor内部被调用, 因此需要使用箭头函数固定this指向, 否则找不到this._resolveQueue
    let _resolve = (val) => {
      //把resolve执行回调的操作封装成一个函数,放进setTimeout里,以兼容executor是同步代码的情况
      const run = () => {
        if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = FULFILLED              // 变更状态
        this._value = val                     // 储存当前value

        // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
        // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
        while(this._resolveQueue.length) {    
          const callback = this._resolveQueue.shift()
          callback(val)
        }
      }
      setTimeout(run)
    }
    // 实现同resolve
    let _reject = (val) => {
      const run = () => {
        if(this._status !== PENDING) return   // 对应规范中的"状态只能由pending到fulfilled或rejected"
        this._status = REJECTED               // 变更状态
        this._value = val                     // 储存当前value
        while(this._rejectQueue.length) {
          const callback = this._rejectQueue.shift()
          callback(val)
        }
      }
      setTimeout(run)
    }
    // new Promise()时立即执行executor,并传入resolve和reject
    executor(_resolve, _reject)
  }

  // then方法,接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
    typeof resolveFn !== 'function' ? resolveFn = value => value : null
    typeof rejectFn !== 'function' ? rejectFn = reason => {
      throw new Error(reason instanceof Error? reason.message:reason);
    } : null
    // return一个新的promise
    return new MyPromise((resolve, reject) => {
      // 把resolveFn重新包装一下,再push进resolve执行队列,这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = value => {
        try {
          // 执行第一个(当前的)Promise的成功回调,并获取返回值
          let x = resolveFn(value)
          // 分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      // reject同理
      const rejectedFn  = error => {
        try {
          let x = rejectFn(error)
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      }
      switch (this._status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this._resolveQueue.push(fulfilledFn)
          this._rejectQueue.push(rejectedFn)
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this._value)    // this._value是上一个then回调return的值(见完整版代码)
          break;
        case REJECTED:
          rejectedFn(this._value)
          break;
      }
    })
  }

  //catch方法其实就是执行一下then的第二个回调
  catch(rejectFn) {
    return this.then(undefined, rejectFn)
  }

  //finally方法
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),             //执行回调,并returnvalue传递给后面的then
      reason => MyPromise.resolve(callback()).then(() => { throw reason })  //reject同理
    )
  }

  //静态的resolve方法
  static resolve(value) {
    if(value instanceof MyPromise) return value //根据规范, 如果参数是Promise实例, 直接return这个实例
    return new MyPromise(resolve => resolve(value))
  }

  //静态的reject方法
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  //静态的all方法
  static all(promiseArr) {
    let index = 0
    let result = []
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        //Promise.resolve(p)用于处理传入值不为Promise的情况
        MyPromise.resolve(p).then(
          val => {
            index++
            result[i] = val
            if(index === promiseArr.length) {
              resolve(result)
            }
          },
          err => {
            reject(err)
          }
        )
      })
    })
  }

  //静态的race方法
  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      //同时执行Promise,如果有一个Promise的状态发生改变,就变更新MyPromise的状态
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(  //Promise.resolve(p)用于处理传入值不为Promise的情况
          value => {
            resolve(value)        //注意这个resolve是上边new MyPromise的
          },
          err => {
            reject(err)
          }
        )
      }
    })
  }
}

洋洋洒洒150多行的代码，到这里，我们终于可以给Promise的实现做一个结尾了。我们从一个最简单的Promise使用实例开始，通过对调用流程的分析，根据观察者模式实现了
Promise的大致骨架，然后依据Promise/A+规范填充代码，重点实现了then 的链式调用，最后完成了Promise的静态/实例方法。其实Promise实现在整体上并没有太复杂的
思想，但我们日常使用的时候往往忽略了很多Promise细节，因而很难写出一个符合规范的Promise实现，源码的实现过程，其实也是对Promise使用细节重新学习的过程。



async/await实现

虽然前面花了这么多篇幅讲Promise的实现，不过探索async/await暂停执行的机制才是我们的初衷，下面我们就来进入这一块的内容。同样的，开头我们点一下async/await
的使用意义。在多个回调依赖的场景中，尽管Promise通过链式调用取代了回调嵌套，但过多的链式调用可读性仍然不佳，流程控制也不方便，ES7提出的async函数，终于让JS
对于异步操作有了终极解决方案，简洁优美地解决了以上两个问题。

设想一下这样的场景，异步任务a -> b -> c之间存在依赖关系，如果我们通过then链式调用来处理这些关系，可读性并不是很好，如果我们想控制其中某个过程，比如在某些
条件下，b不往下执行到c，那么也不是很方便控制。
Promise.resolve(a)
.then(b => {
    // do something
})
.then(c => {
    // do something
})

但是如果通过async/await来实现这个场景，可读性和流程控制都会方便不少

async () => {
    const a = await Promise.resolve(a)
    const b = await Promise.resolve(b)
    const c = await Promise.resolve(c)
}

那么我们要如何实现一个async/await呢，首先我们要知道，async/await实际上是对Generator（生成器）的封装，是一个语法糖。由于Generator出现不久就被
async/await取代了，很多同学对Generator比较陌生，因此我们先来看看Generator的用法：
ES6新引入了Generator函数，可以通过yield关键字，把函数的执行流挂起，通过next()方法可以切换到下一个状态，为改变执行流程提供了可能，从而为异步编程
提供解决方案。
function* myGenerator(){
    yield '1'
    yield '2'
    return '3'
}
const gen = myGenerator(); // 获取迭代器
gen.next() // { value: '1', done: false }
gen.next() // { value: '2', done: false }
gen.next() // { value: '3', done: true }

也可以通过给next()传参，让yield具有返回值
function* myGenerator(){
    console.log(yield '1') // test1
    console.log(yield '2') // test2
    console.log(yield '3') // test3
} 
const gen = myGenerator() // 获取迭代器
gen.next()
gen.next('test1')
gen.next('test2')
gen.next('test3')

我们看到Generator的语法，应该会感到很熟悉，*/yield和async/await看起来其实已经很相似了，它们都提供了暂停执行的功能，但二者又有三点不同：
1、async/await自带执行器，不需要手动调用next()就能自动执行下一步。
2、async函数返回值是Promise对象，而Generator返回的是生成器对象。
3、await能够返回Promise的resolve/reject的值
我们对async/await的实现，其实就是对应以上三点封装Generator。

自动执行

我们先来看一下，对于这样一个Generator，手动执行是怎样一个过程。
function* myGenerator(){
    yield Promise.resolve(1);
    yield Promise.resolve(2);
    yield Promise.resolve(3);
}
// 手动执行迭代器
const gen = myGenerator();
gen.next().value.then(val => {
    // console.log(val)
    gen.next(val).value.then(val => {
          console.log(val)
        gen.next(val).value.then(val => {
              console.log(val)
              gen.next(val)
        })
    })
})

显然，手动执行的语法看起来既笨拙又丑陋，我们希望生成器函数能自动向下执行，且yield能返回resolve的值，基于这两个需求，我们进行一个进本的封装，
这里async/await是关键字，不能重写，我们用函数来模拟：
function run(gen){
    var g = gen() // 由于每次gen()获取到的都是最新的迭代器，因此获取迭代器操作要放在_next()之前，否则会进入死循环
    function _next(val){ // 封装一个方法，执行递归g.next()
        var res = g.next(val) // 获取迭代器对象，并返回resolve的值
        if(res.done) return res.value // 递归终止条件
        res.value.then(val => { // Promise的then方法是实现自动迭代的前提
            _next(val) // 等待Promise完成就自动执行下一个next，并传入resolve的值
        })
    }
    _next(val) // 第一次执行 
}

对于我们之前的例子，我们就能这样执行：
function* myGenerator() {
  console.log(yield Promise.resolve(1))   //1
  console.log(yield Promise.resolve(2))   //2
  console.log(yield Promise.resolve(3))   //3
}

run(myGenerator)

这样我们就初步实现了一个async/await。上边的代码只有五六行，但并不是一下就能看明白的，我们之前用了四个例子来做铺垫，也是为了让读者更好地理解这段代码。 
简单来说，我们封装了一个run方法，run方法里我们把执行下一步的操作封装成_next()，每次Promise.then()的时候都去执行_next()，实现自动迭代的效果。
在迭代的过程中，我们还把resolve的值传入gen.next()，使得yield得以返回Promise的resolve的值

这里插一句，是不是只有.then方法这样的形式才能完成我们自动执行的功能呢？答案是否定的，yield后边除了接Promise，还可以接thunk函数，thunk函数不是一个新
东西，所谓thunk函数，就是单参的只接受回调的函数，详细介绍可以看阮一峰Thunk 函数的含义和用法，无论是Promise还是thunk函数，其核心都是通过传入回调的方式来
实现Generator的自动执行。thunk函数只作为一个拓展知识，理解有困难的同学也可以跳过这里，并不影响后续理解。


返回Promise&异常处理

虽然我们实现了Generator的自动执行以及让yield返回resolve的值，但上边的代码还存在着几点问题：
1、需要兼容基本类型：这段代码能自动执行的前提是yield后面跟Promise，为了兼容后面跟着基本类型值的情况，我们需要把yield跟的内容（gen.next().value）都
用Promise.resolve()转换一遍。
2、缺少错误处理：上边代码的Promise如果执行失败，就会导致后续执行直接中断，我们需要通过调用Generator.prototype.throw()，把错误抛出来，才能被外层
的try-catch捕获到。
3、返回值是Promise：async/await的返回值是一个Promise，我们这里也需要保持一致，给返回值包一个Promise。

我们改造一下run方法：
function run(gen){
    return new Promise((resolve, reject) => {
        var g = gen()
        function _next(val){
            try {
                var res = g.next(val)
            } catch(err) {
                return reject(err)
            }
            if(res.done){
                return resolve(res.value)
            }
            // res.value包装成Promise，以兼容yield后面跟基本类型的情况
            Promise.resolve(res.value).then(
                val => {
                    _next(val)
                },
                err => {
                    // 抛出错误
                    g.throw(err)
                }
            )
        }
        _next()
    })
}

到这里，一个async/await的实现基本完成了。最后我们可以看一下babel对async/await的转换结果，其实整体的思路是一样的，但是写法稍有不同：
//相当于我们的run()
function _asyncToGenerator(fn) {
  // return一个function，和async保持一致。我们的run直接执行了Generator，其实是不太规范的
  return function() {
    var self = this
    var args = arguments
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      //相当于我们的_next()
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      //处理异常
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

使用方式：
const foo = _asyncToGenerator(function* () {
  try {
    console.log(yield Promise.resolve(1))   //1
    console.log(yield 2)                    //2
    return '3'
  } catch (error) {
    console.log(error)
  }
})

foo().then(res => {
  console.log(res)                          //3
})

有关async/await的实现，到这里就告一段落了。但是直到结尾，我们也不知道await到底是如何暂停执行的，有关await暂停执行的秘密，我们还要到Generator的实现
中去寻找答案。


Generator实现

我们从一个简单的Generator使用实例开始，一步步探究Generator的实现原理：
function* foo(){
    yield 'result1'
    yield 'result2'
    yield 'result3'
}
const gen = foo()
console.log(gen.next().value)
console.log(gen.next().value)
console.log(gen.next().value)

我们可以在babel官网上在线转换这段代码，看看ES5环境下是如何实现Generator的：
"use strict";

var _marked =
/*#__PURE__*/
regeneratorRuntime.mark(foo);

function foo() {
  return regeneratorRuntime.wrap(function foo$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'result1';
        case 2:
          _context.next = 4;
          return 'result2';
        case 4:
          _context.next = 6;
          return 'result3';
        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

var gen = foo();
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().value);

代码咋一看不长，但如果仔细观察会发现有两个不认识的东西-----regeneratorRuntime.mark和regeneratorRuntime.wrap，这两者其实是regenerator-runtime模块
里的两个方法，regenerator-runtime模块来自facebook的regenerator模块，完整代码在runtime.js。

低配实现&调用流程分析

实现一个简单的Generator：
// 生成器函数根据yield语句将代码分割为switch-case块，后续通过切换_context.prev和_context.next来分别执行各个case
function gen$(_context){
    while(1){
        switch(_context.prev === _context.next){
            case 0:
                _context.next = 2;
                return 'result1';
            case 2:
                _context.next = 4;
                return 'result2';
            case 4:
                _context.next = 6;         
               return 'result3';
            case 6:
            case end:
                return _context.stop()    
        }
    }
}
// 低配版context
var context = {
    next: 0,
    prev: 0,
    done: false,
    stop: function stop(){
        this.done = true
    }
}
// 低配版invoke
let gen = function(){
    return {
        next: function(){
            value = context.done ? undefined: gen$(context)
            done = context.done
            return {
                value,
                done
            }
        }
    }
}
// 测试使用
var g = gen()
g.next() // { value: 'result1', done: false }
g.next() // { value: 'result2', done: false }
g.next() // { value: 'result3', done: false }
g.next() // { value: undefined, done: true }

这段代码不难理解，我们来分析一下调用流程：
1、我们定义的function*生成器函数被转换为以上代码
2、转换后的代码分为三大块：
    a.gen$(_context)由yield分割生成器函数代码而来
    b.context对象用于储存函数执行上下文
    c.invoke()方法定义next()，用于执行gen$(_next)来跳到下一步
3、当我们调用g.next()，就相当于调用invoke()方法，执行gen$(_context)，进入switch语句，switch根据context的标识，执行对应的case块，return对应结果
4、当生成器函数运行到末尾（没有下一个yield或已经return），switch匹配不到对应代码块，就会return空值，
这时g.next()返回{ value: undefined, done:true }    

从中我们可以看出，Generator实现的核心在于上下文保存，函数并没有真的被挂起，每一次yield，其实都执行了一遍传入的生成器函数，只是在这个过程中间使用了一个
context对象储存上下文，使得每次执行生成器函数的时候，都可以从上一个执行结果开始执行，看起来就像函数被挂起了一样。
