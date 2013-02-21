# kslite

CommonJS 的主要目标是让 JS 在各种环境下都能运行，这不是 kslite 的目标
此外 CommonJS 的 Modules 促进各处的开发能够快速互通共用，这个才是 kslite 的目标。

我对比了 Modules 2.0 和 kslite，发现 kslite 已经解决了 modules 2.0 的大部分问题。
如玉伯总结的 CommonJS Modules 核心理念：

1. 职责单一原则：模块的声明、下载和执行是三个不同步骤，在 API 设计和实现上，应当尽量分离。
2. 约定优于配置：模块所在路径和文件名，就是模块的标识，无需另行指定。这也是 DRY 原则的体现。
3. 懒懒原则：能不执行的就先不执行，确实需要时才执行。

此外我们有包，时间戳，版本控制等等

当前 Modules 2.0 有比 kslite 优秀的地方在于很好的处理冲突。
我们通过S.add的模块内部实现很自由，不同模块可能操作相同的对象，比如都实现S.log。会冲突。

下面是最常被提起的用例：

```js
//  test/math.js
KSLITE.declare([], function(require, exports){
    exports.add = function(a, b){
        return a + b;
    };
});
//  test/increment.js
KSLITE.declare(['test-math'], function(require, exports){
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

属性 add/use 模式可以这样理解，declare 为 add，provide 为 use。区别是：

1. 之前 add/use 的回调函数，传入的 S 实例，被替换成 require 方法。需要使用哪个依赖模块就 require 哪个。
2. declare 的 fn 的产出应该被挂载在 exports 对象里(注意 exports 不能被重新赋值)，而 exports 为 fn 被调用时的第二个参数。
3. 另外如果使用 kslite 内置的 substitute，extend等方法，需要这样写： `require('kslite').extend`。目前 `kslite` 被设置为内置模块，任何provide可以不声明依赖直接使用。

可以看到通过 exports+require 模式，隐去了模块间对S实例的贡献访问，避免了冲突的可能。
但是看起来经过这样的改动，模块越来越像类，模块支持只不过是面向JS这种非阻塞语言实现类似java的import的功能，仅此而已。

而我之前理解的包，模块和包都有业务含义的代码集。kslite 第一版，add 也是传入两个参数，`add(“mod”，function(S，P))`;
其中P为包对象，包开发这对整个包以内的所有模块负责，P挂载在S下，而模块开发的内容挂载在P下。通过这样的设计来避免包间的冲突。

不过既然当前 commonjs 的 package 还是一片迷雾，我们还是通过简单的修改，以 modules 的方式更彻底的处理冲突
所以新版本 kslite 支持了 commonjs 的模块开发写法(估计这是以后的趋势，大家尽快熟悉起来，用起来)。
即当前 kslite 同时支持 yui3 的 add/use 模式和 commonjs 的 declare/provide/require 模式。
新版本后在浏览器端，支持 commonjs 的主要 api， 非浏览器环境以及 ES5 strict 模式不在考虑范围。
使用 commonjs 写法开发的模块，经过简单 build 可以被 bravojs，seajs 浏览器中的实现载入使用。

Modules 2.0 相比 kslite 还有的好处包括，我们有选择的

1. declare 模块时不需要指定模块 id
   可以理解为，use 什么，load 进来的那就是什么。既然文件名决定了模块id，那这样做会避免显示模块id和文件名不一致的情况出现。
   kslite 的 declare 方法同样支持不传 id。但是这样做有一个问题就是，如果需要模块定义合并，需要打包编译工具，这提高了使用门槛，同时很不利于线上问题 debug。
   所以建议大家还是在declare的时候写好id，另外严格按照kslite的包和模块名管理方案来为文件命名。
2. 模块体存在于某个闭包的私有变量中，无法直接访问。
   就如常见的 JavaScript OOP 中队类私有 变量的处理，模块信息作为某个闭包的私有属性，只能通过公共api的require访问。
   kslite 暂时没有这么做，因为这样做同样不利于 debug。所以需要大家开发时不要尝试修改KSLITE对象的任何内容。

期待CommonJS的讨论早日尘埃落定，玉伯的 seajs 也能处理好遗留的debug，子模块，包管理，版本控制等等问题，
到时候就是 kslite 这几百行代码谢幕的时刻，而我们开发的其他内容都不会被浪费。


-------

kslite 为 kissy 的仅支持有限方法的子集：
这些方法包括 log，mix，clone，extend，add，use，getScript，substitute
kslite为所在页面引入KSLITE全局对象。

相比于 kissy，发生变化的方法如下：
substitute：增加一个参数，当最后一个参数为 true 时，未匹配到的模板(如{a})会被保留而不会被置空，这样可以多次substitute，分批将数据写入模板。
add：任何时候只 add，不 attach。
use：不用add即可直接use，详见下面的包和模块管理。

### 包和模块管理：

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

### 性能方面考虑：

这种模式只要 use 中包含的模块足够，满足所有依赖，则可以保证所有模块并行 load，否则可能存在串行情况。
开发时使用小模块模式，每一个正式产出，比如生成广告投放用 inf.js，广告展现用 showad.js 应该手动 combo。
因为在 use 时会按照 require 顺序 attach，所以手动 combo 的代码不需要关心模块间顺序。

### 其他配置项：

kslite 相关配置项，在局部变量 kslite_config 中，之后 mix 入 S.Config

 - lt_b：kslite 的 base，推荐每个产出写死一个 kslite 的 base 地址，而不是通过 currentScript 获得。因为kslite不一定作为 `<script>`节点静态引入
 - lt_pkgs：包路径信息，如上。
 - lt_t：时间戳比如 20101129.js
 - lt_v：版本 如 1.1.5 计划沿用 kissy 版本。

### 关于与 kissy 兼容性：

在页面存在同一版本的 kissy 实例时，`S.app("KSLITE")` 构建。
同时根据当前 kissy 的 add 模式，需要额外生成一段代码，将所需模块预先注册一下。
