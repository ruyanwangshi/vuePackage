# 理解Proxy 和 Reflect

> ​		使用**Proxy**可以创建一个代理对象，它能够实现对其他对象的代理，这里的关键词是其他对象，也就是说，**Proxy**只能代理对象，无法代理非对象值，例如布尔值，数值，字符串等。那么代理是指什么呢？所谓的代理是对一个对象**基本语义**的代理。它允许我们**拦截**并**重新定义**对一个对象的基本操作。

## 基本语义（Proxy）

> ​		什么是基本语义？给出一个对象obj，可以对它进行一些操作，例如：读取属性值，设置属性值：
>
> ```js
> obj.foo // 获取foo属性值
> obj.foo++ // 读取和设置属性foo的值
> ```
>
> ​		类似这种读取、设置属性值的操作，就属于基本语义的操作，即基本操作。既然是基本操作那么它就可以使用Proxy拦截。
>
> ```js
> const obj = new Proxy(object, {
> 	// 拦截读取属性值的操作
> 	get() {
>         /*...*/
>     },
>     // 拦截设置属性值的操作
>     set() {
>         /*...*/
>     }
> })
> ```
>
> ​		函数也是对象，所以调用函数也是对一个对象的基本操作：
>
> ```js
> const fn = () => console.log('测试夹子')
> fn()
> ```
>
> ​		因此，可以用Proxy来拦截函数的调用操作，这里使用apply拦截函数的调用：
>
> ```js
> const p2 = new Proxy(fn, {
> 	apply(target,thisArg,argArray) {
> 		target.call(thisArg, ...argArray)
> 	}
> })
> p2('测试函数调用夹子') // 输出， 测试函数调用夹子
> ```

## 复合操作（Proxy）

> ​		上面的列子说明了基本操作。Proxy只能够拦截对一个对象的基本操作。那么，什么是非基本操作，其实调用对象的方法就是典型的基本操作，又称为复合操作。
>
> ```js
> obj.fn()
> ```
>
> ​		实际上，调用一个对象的方法，是由俩个基本语义组成的。第一个基本语义是get，即先通过get操作得到obj.fn属性。第二个基本语义是函数调用，即通过get得到obj.fn的值后再调用它，也就是apply。理解Proxy只能够代理对象的基本语义很重要，为后续如何实现对Map,Set等数据类型的代理时，都利用了Proxy的特点。

## Reflect对象

> ```js
> Reflect.get()
> Reflect.set()
> Reflect.apply()
> ```
>
> ​		Reflect下的方法与Proxy的拦截器方法名字相同，任何在Proxy的拦截器中能够找到的方法，都能够在Reflect中找到同名函数。
>
> ​		Reflect函数的作用，比如：Reflect.get() 他的功能就是提供访问一个对象属性的默认行为，下面的俩个操作时等价的：
>
> ```js
> const obj = {foo: 1}
> // 直接读取
> console.log(obj.foo)
> // 使用Reflect.get读取
> Reflect.get(obj, 'foo')
> ```
>
> ​		既然操作是等价的，为什么要多写一些单词用Reflect呢。因为Reflect下面的函数还能接收最重要的参数receiver，可以把它理解为函数调用过程中的this
>
> ```js
> // 修改后的例子
>       const data = { 
>           name: '测试名称',
>           get foo() {
>               // 这个地方this是{name: 2} 而不是原target
>               console.log(this)
>               return this.name
>           }
>      }
>       const test = new Proxy(data, {
>         get(target, key, receiver) {
>           return Reflect.get(target, key, {name: 2})
>         }
>       })
>       console.log(test.bar) // 2
> 
>       // 书上例子
>       const obj = {foo: 1}
>       console.log(Reflect.get(obj, 'foo', {foo: 2})) // 1 因为获取属性值没有使用属性描述符来获取属性值，无法改变this指向
> ```
>
> 

