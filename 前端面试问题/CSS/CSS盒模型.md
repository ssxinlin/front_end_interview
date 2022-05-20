盒模型

浏览器根据CSS基础框盒模型（CSS basic box model），将元素表示成矩形盒子，CSS决定这些盒子的大小、位置以及属性。
每个盒子由四个区域组成：内容区域 content area、内边距区域 padding area、 边框区域 border area、 外边距区域 margin area
注意：外边距重叠现象有时会发生。

盒模型分为IE盒模型和W3C标准盒模型。
IE盒模型和W3C标准盒模型的区别是什么？
1. W3C 标准盒模型：
属性width,height只包含内容content，不包含border和padding。（width = content）
2. IE 盒模型：
属性width,height包含border和padding，指的是content+padding+border。(width = content + padding + border)
在ie8+浏览器中使用哪个盒模型可以由box-sizing(CSS新增的属性)控制，默认值为content-box，即标准盒模型；如果将box-sizing设为border-box则用的是IE盒模型。如果在ie6,7,8中DOCTYPE缺失会触发IE模式。在当前W3C标准中盒模型是可以通过box-sizing自由的进行切换的。


外边距重叠
块的上外边距（margin-top）和下外边距（margin-bottom）有时合并（折叠）为单个边距，其大小为单个边距的最大值（或如果它们相等，则仅为其中一个），
这种行为称为边距重叠。
注意有设定float和position = absolute的元素不会产生外边距重叠行为。
有三种情况会形成外边距重叠
1、同一层相邻元素之间
<style>
p:nth-child(1){
  margin-bottom: 13px;
}
p:nth-child(2){
  margin-top: 87px;
}
</style>

<p>下边界范围会...</p>
<p>...会跟这个元素的上边界范围重叠。</p>

2、没有内容将父元素和后代元素分开
<style type="text/css">
    section    {
        margin-top: 13px;
        margin-bottom: 87px;
    }

    header {
        margin-top: 87px;
    }

    footer {
        margin-bottom: 13px;
    }
</style>

<section>
    <header>上边界重叠 87</header>
    <main></main>
    <footer>下边界重叠 87 不能再高了</footer>
</section>

3、空的块级元素
<style>
p {
  margin: 0;
}
div {
  margin-top: 13px;
  margin-bottom: 87px;
}
</style>

<p>上边界范围是 87 ...</p>
<div></div>
<p>... 上边界范围是 87</p>

另：

上述情况的组合会产生更复杂的外边距折叠。
即使某一外边距为0，这些规则仍然适用。因此就算父元素的外边距是0，第一个或最后一个子元素的外边距仍然会“溢出”到父元素的外面。
如果参与折叠的外边距中包含负值，折叠后的外边距的值为最大的正边距与最小的负边距（即绝对值最大的负边距）的和,；也就是说如果有-13px 8px 100px叠在一起，边界范围
的技术就是 100px -13px的87px。
如果所有参与折叠的外边距都为负，折叠后的外边距的值为最小的负边距的值。这一规则适用于相邻元素和嵌套元素。

box-sizing
CSS中的box-sizing属性定义了user agent应该如何计算一个元素的总长度和总高度。
在CSS盒子模型的默认定义里，你对一个元素所设置的width和height只会应用到这个元素的内容区。如果这个元素有任何的border或padding，绘制到屏幕上时的盒子宽度和高低
会加上设置的边框和内边距值。这意味着当你调整一个元素的宽度和高度时需要时刻注意到这个元素的边框和内边距。当我们实现响应式布局时，这点尤其烦人。

box-sizing 属性可以被用来调整这些表现:

content-box是默认值。如果你设置一个元素的宽为100px，那么这个元素的内容区会有100px 宽，并且任何边框和内边距的宽度都会被增加到最后绘制出来的元素宽度中。
border-box告诉浏览器：你想要设置的边框和内边距的值是包含在width内的。也就是说，如果你将一个元素的width设为100px，那么这100px会包含它的border和padding，
不包含margin，内容区的实际宽度是width减去(border + padding)的值。大多数情况下，这使得我们更容易地设定一个元素的宽高。

我们在编写页面代码时应尽量使用标准的W3C模型(需在页面中声明DOCTYPE类型)，这样可以避免多个浏览器对同一页面的不兼容。
因为若不声明DOCTYPE类型，IE浏览器会将盒子模型解释为IE盒子模型，FireFox等会将其解释为W3C盒子模型；若在页面中声明了DOCTYPE类型，所有的浏览器都会把盒模型
解释为W3C盒模型。
