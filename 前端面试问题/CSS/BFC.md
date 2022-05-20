BFC

BFC到底是什么东西？
BFC全称：Block Formatting Context，名为”块级格式化上下文“。
W3C官方解释为：BFC它决定了元素如何对其内容进行地位，以及与其他元素的关系和相互作用，当涉及到可视化布局时，Block Formatting Context提供了一个环境，HTML在
这个环境中按照一定的规则进行布局。
简单来说就是，BFC是一个完全独立的空间（布局环境），让空间里的子元素不会影响到外面的布局。那么怎么使用BFC呢，BFC可以看作是一个CSS元素属性。

怎样触发BFC呢
触发BFC使用的CSS属性：
1. overflow: hidden;
2. display: inline-block;
3. position: absolute;
4. position: fixed;
5. display: table-cell;
6. display: flex

BFC的规则
a. BFC就是一个块级元素，块级元素会在垂直方向一个接一个得排列。
b. BFC就是网页中的一个隔离的独立容器，容器中的标签不会影响到外部标签。
c. 垂直方向的距离由margin决定，属于同一个BFC的两个相邻的标签外边距会发生重叠。
d. 计算BFC的高度时，浮动元素也参与计算。

BFC解决了什么问题
1. 使用Float脱离文档流，高度塌陷。
2. Margin边距重叠。
3. 两栏布局。
