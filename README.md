# kslite
kslite是一个短小精悍的模块管理程序。

## 包和模块管理：
模块名由包名，路径，文件名。三部分构成
如 `{packagename}-{path_0}-...-{path_n}-{filename}`
包类似 *.jar，每个包对应一个 codebase 即 classesroot。在 `S.config.lt_pkgs` 中配置
是一个 http 地址，如果没有则以为 kslite 所在地址为 base。
比如：

```js
S.Config.lt_pkgs={
    inf:"http://a.alimama.cn/kslite/",
    test:"http://demo.taobao.com/tbad/kslite"
}
```

模块 `inf-a` 对应地址 http：//a.alimama.cn/kslite/inf/a.js
模块 `test-t-1` 对应地址 http：//demo.taobao.com/tbad/kslite/test/t/1.js

这样根据模块名称即可定位模块地址，所以不需要 add 预先注册模块即可直接 use。
add 不执行 attach。只有第一次 use 的时候才执行 attach。
add 同样支持 require。可以在载入 js 后根据 require 串行加载更多模块。已处理循环引用问题，办法很土。
暂时不支持 use 外部 JS 文件，如 `use("jquery.js")`;

## 一些说明
文件使用utf-8编码, 在合并到别的工程的时候手工编码转换

## 使用方法
```js
// 文件及路径, test包下的math模块, 以下类似
//test/math.js 
KSLITE.declare([], function(require, exports){
    exports.add = function(a, b){
        return a + b;
    };
});

//  test/increment.js
KSLITE.declare(['test-math'], function(require, exports){
    //注意这里需要调用一下require方法
    var add = require('test-math').add;
    exports.increment = function(a){
        return add(a,1);
    };
});

//  test/program.js
KSLITE.declare(["test-increment"], function(require, exports){
    var inc = require("test-increment").increment;
   exports.result = inc(1);
});

//  调用
KSLITE.provide(["test-program"], function(require){
    alert(require("test-program").result);
});
```

##开放接口
所有方法绑定在全局变量KSLITE上

###declare(module, callback) 

###provide(module, callback) 

###path(module, callback) 

###log()

###getScript

###substitute

###clone

###mix

###multiAsync

###extend

###iA(obj)

###iF(obj)

###iPO(obj)

###iS(obj)

## 配置项：
kslite 相关配置项，在局部变量 kslite_config 中，之后 mix 入 S.Config

 - lt_b：kslite 的 base，推荐每个产出写死一个 kslite 的 base 地址，而不是通过 currentScript 获得。因为kslite不一定作为 `<script>`节点静态引入
 - lt_pkgs：包路径信息，如上。
 - lt_t：时间戳比如 20101129.js
 - lt_v：版本 如 1.1.5 
