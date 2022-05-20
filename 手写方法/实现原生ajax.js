var xmlHttp;

function createXmlHttpRequest() {
    if(window.ActiveXObject) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
    } else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest()
    }
}

function doGet(url) { // 注意在传参数值的时候最好使用encodeURI处理一下，防止乱码
    createXmlHttpRequest()
    xmlHttp.open("GET", url)
    xmlHttp.send(null)
    xmlHttp.onreadystatechange = function () {
        if(xmlHttp.readyState == 4 && xmlHttp.status === 200) {
            alert("success")
        } else {
            alert("fail")
        }
    }
}

function doPost(url, data) { // 注意在传参数值的时候最好使用encodeURI处理一下，防止乱码
    createXmlHttpRequest()
    xmlHttp.open("POST", url)
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xmlHttp.send(data)
    xmlHttp.onreadystatechange = function () {
        if(xmlHttp.readyState == 4 && xmlHttp.status === 200) {
            alert("success")
        } else {
            alert("fail")
        }
    }
}


// 模拟jquery的$.ajax方法的封装：

var createAjax = function () {
    var xhr = null
    try { //IE系列浏览器
        xhr = new ActiveXObject("microsoft.xmlhttp")
    } catch (e1) {
        try { //非IE浏览器
            xhr = new XMLHttpRequest()
        } catch (e2) {
            window.alert("您的浏览器不支持ajax，请更换浏览器！")
        }
    }
    return xhr
}

var ajax = function (conf) {
    var type = conf.type // type参数，可选
    var url = conf.url // url参数，必填
    var data = conf.data // data参数，可选
    var dataType = conf.dataType // dataType参数，可选
    var success = conf.success // 成功事件回调函数可选
    if(type === null) {
        type = "get"
    }
    if(dataType === null) {
        dataType = "text"
    }
    var xhr = createAjax()
    xhr.open(type, url, true)
    if(type === "GET" || type === "get") {
        xhr.send(null)
    } else if (type === "POST" || type === "post") {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        xhr.send(data)
    }
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            if(dataType === "text" || dataType === "TEXT") {
                if(success !== null) {
                    success(xhr.responseText)
                }
            } else if (dataType === "xml" || dataType === "XML") {
                if(success !== null) {
                    success(xhr.responseXML)
                }
            } else if (dataType === "json" || dataType === "JSON") {
                if(success !== null) {
                    success(eval("("+xhr.responseText+")"))
                }
            }
        }
    }
}

// 该方法使用也很简单，和jquery的$.ajax方法一样，不过没那么多的参数。仅仅是简单的实现了一些基本的ajax功能。使用方法如下：
ajax({
    type:"post",//post或者get，非必须
    url:"test.jsp",//必须的
    data:"name=dipoo&info=good",//非必须
    dataType:"json",//text/xml/json，非必须
    success:function(data){//回调函数，非必须
        alert(data.name);
    }
});
