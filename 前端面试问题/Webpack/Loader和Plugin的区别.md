Loader和Plugin的区别

Loader

loader从字面的意思理解是加载的意思。由于webpack本身只能打包CommonJS规范的JS文件，所以针对CSS、图片等格式的文件没法打包，就需要引入第三方的模块进行打包。
Loader虽然是扩展了Webpack，但是它只专注于转换文件（transform）这一个领域，完成压缩、打包、语言翻译。Loader是运行在NodeJS中的，仅仅只是为了打包。
如：css-loader和style-loader模块是为了打包CSS
babel-loader和babel-core模块是为了把ES6的代码转换成ES5
url-loader和file-loader是把图片进行打包

plugin

plugin完成的是loader不能完成的功能。plugin也是为了扩展webpack的功能，但是plugin是作用于webpack本身的，而且plugin不仅只局限在打包，资源的加载上，它的
功能要更加丰富。从打包优化和压缩，到重新定义环境变量，功能强大到可以处理各种各样的任务。webpack提供了很多开箱即用的插件：CommonChunkPlugin主要用于提取第
三方库和公共模块，避免首屏加载的bundle文件，或者按需加载的bundle文件体积过大，导致加载时间过长，是一把优化的利器。而在多页面应用中，更是能够为每个页面间的
应用程序共享代码创建bundle。插件可以携带参数，所以在plugins属性传入new实例。
如：
针对html文件打包和拷贝（还有很多配置）的插件：html-webpack-plugin，不但完成了html文件的拷贝，打包，还给html中自动增加了引入打包后的JS文件的代码()，还
能指明把JS文件引入到html文件的底部等等。
plugins: [
    // 对html模板进行处理，生成对应的html，引入需要的资源模块
    new HtmlWebpackPlugin({
        template: './index.html',       // 模板文件，即需要打包和拷贝到build目录下的html文件
        filename: 'index.html',         // 目标html文件
        chunks: ['useperson'],          // 对应加载的资源，即html文件需要引入的JS模块
        inject: true                    // 资源加入到底部，把模块引入到html文件的底部
    })
]

从运行时机的角度区分：
1、loader运行在打包文件之前（loader为在模块加载时的预处理文件）
2、plugins在整个编译周期都起作用
