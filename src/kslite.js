/**
 * KISSY -- An Enjoyable UI Library : Keep It Simple & Stupid, Short & Sweet, Slim & Sexy...<br/>
 * KSLITE -- KISSY的子集,通过精简过的有限的方法,提供模块管理,OO支持等基本功能
 * @module kslite
 * @author lifesinger@gmail.com,limu@taobao.com
 * @modify by hubo.hb@alibaba-inc.com 
 */

(function(win, S, undefined) {
    //KSLITE没有定义的时候
    //已经定义的时候不再处理
    if (win[S] === undefined) {
        //S重置为对象
        S = win[S] = {};
    } else {
        return;
    }

    //快捷对象
    var doc = win.document;
    var toString = Object.prototype.toString;
    var i;

    var isType = function(type) {
        return function(o) {
            return toString.call(o) === '[object ' + type + ']';
        };
    };

    /**
     * Copies all the properties of s to r.
     * @method mix
     * @param r {Object} 目标对象
     * @param s {Object} 源对象
     * @param ov {Boolean} 是否强制覆盖
     * @param wl {Array} 如果存在白名单,只覆盖白名单内的对象.
     * @return {Object} the augmented object
     */
    var mix = function(r, s, ov, wl) {
        if (!s || !r) {
            return r;
        }
        if (ov === undefined) {
            ov = true;
        }
        var i, p, l;
        if (wl && (l = wl.length)) {
            for (i = 0; i < l; i++) {
                p = wl[i];
                if (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
        } else {
            for (p in s) {
                if (ov || !(p in r)) {
                    r[p] = s[p];
                }
            }
        }
        return r;
    };

    //快捷方法，准备插入元素的节点 
    var gbt = 'getElementsByTagName'; //字符串暂存,方便压缩
    var head = doc[gbt]('head')[0] || doc.documentElement;

    //定义几个模块的状态
    var INIT = 0;
    var LOADING = 1;
    var LOADED = 2;
    var ERROR = 3;
    var ATTACHED = 4;
    var RE_CSS = /\.css(?:\?|$)/i;

    //脚本加载的回调函数， IE下处理readyState，需要同时处理loaded和complete两种状态
    var scriptOnload = function(node, callback) {
        var re = /^(?:loaded|complete|undefined)$/;
        /*
        var oldrc = node.onreadystatechange;
        var oldload = node.onload;
        var olderr = node.onerror;
        */
        node.onreadystatechange = node.onload = node.onerror = function() {
            if (re.test(node.readyState)) {
                node.onload = node.onerror = node.onreadystatechange = null;
                //node = null;

                callback();
                /*
                if (oldrc) oldrc();
                if (oldload) oldload();
                if (olderr) olderr();
                */
            }
        };
    };


    //获取第一个可以交互的脚本
    //IE only

    function getInteractiveScript() {
        if (navigator.userAgent.indexOf("MSIE") < 0) {
            return null;
        }
        var scripts = head[gbt]('script');
        var script, i = 0,
            len = scripts.length;
        for (; i < len; i++) {
            script = scripts[i];
            if (script.readyState === 'interactive') {
                return script;
            }
        }
        return null;
    }

    var scripts = doc[gbt]('script');
    var ksCurKey = 'KSLITEcurrentScript';

    //试图通过script上的kslite属性来找到当前kslite使用的脚本
    //这需要在script标签上写kslite属性
    if (!win[ksCurKey]) {
        for (i = 0; i < scripts.length; i++) {
            if (scripts[i].kslite) {
                win[ksCurKey] = scripts[i];
                break;
            }
        }
    }

    //这里取到的base可能会有问题， 比如异步的时候, 所以最好还是写在script的属性上
    win[ksCurKey] = (win[ksCurKey] || scripts[scripts.length - 1]);

    S.Env = {
        mods: {},
        fns: {},
        _loadQueue: {},
        _relies: { //kslite add
            rq: {},
            sp: {}
        }
    };

    //默认配置
    S.Config = {
        debug: false,
        base: (win[ksCurKey].src).split("/").slice(0, -1).join("/") + "/",
        timeout: 10,
        charset: 'gbk',
        lt_pkgs: {}, //缓存包对象
        timestamp: win.KSLITEtimestamp || '{timestamp}' //timestamp会被替换
    };

    //暂存，方便压缩
    var sconfig = S.Config;

    //debug信息
    if (/demo|debug|test/.test(location.href)) {
        sconfig.debug = true;
    }

    if (sconfig.debug) {
        sconfig.timestamp = (new Date()).getTime() + ".js";
    }

    //添加kslite方法
    mix(S, {
        //kslite的版本号
        version: "{version}", //version会被替换
        //存一下快捷方式
        mix: mix,
        /**
         * Prints debug info.
         * @method log
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @return {KSLITE}
         */
        log: function(msg, cat) {
            var s = 'console';
            if (sconfig.debug && win[s] && win[s].log) {
                win[s][cat && win[s][cat] ? cat : 'log'](msg);
            }
            return S;
        },
        /**
         * Clone Object
         * @method clone
         * @param o {Object} 源对象
         * @return {Object} the object cloned
         */
        //克隆出对象o, 如果是数组或者对象，同时复制子对象
        clone: function(o) {
            var ret = o,
                b, k;
            if (o && ((b = S.iA(o)) || S.iPO(o))) {
                ret = b ? [] : {};
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        ret[k] = S.clone(o[k]);
                    }
                }
            }
            return ret;
        },
        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @method extend
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */

        //原型继承
        //r 子类
        //s 父类
        //px 给子类添加的原型方法集合
        //sx 给子类添加的静态方法
        extend: function(r, s, px, sx) {
            if (!s || !r) {
                return r;
            }
            var OP = Object.prototype;
            var O = function(o) {
                function F() {}
                F.prototype = o;
                return new F();
            };
            var sp = s.prototype;
            var rp = O(sp);
            //拷贝原型
            r.prototype = rp;
            //修正constructor
            rp.constructor = r;
            //设置superclass, 方便子类查找
            r.superclass = sp;
            //如果s是一个对象，设置sp的constructor为它自己
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }
            //给子类加原型方法
            if (px) {
                mix(rp, px);
            }
            //给子类加静态方法
            if (sx) {
                mix(r, sx);
            }
            return r;
        },
        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         * @param str {String}模板字符串
         * @param o {String}模板数据
         * @param regexp {String}替换用正则 可以用来代替默认值
         * @param multiSubstitute {Boolean} 是否支持多次substitute 为true,str中的模板如果匹配不到将被保留而不是置空.
         */
        substitute: function(str, o, regexp, multiSubstitute) {
            if (!S.iS(str) || !S.iPO(o)) {
                return str;
            }
            return str.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] !== undefined) ? o[name] : (multiSubstitute ? match : "");
            });
        },
        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <pre>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </pre>
         * @param url {String} 文件地址
         * @param success {Function|Object} 回调函数
         * @param charset {String} 字符串
         */
        getScript: function(url, success, charset, expando) {
            var isCSS = RE_CSS.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script');
            var config = success,
                error, timeout, timer, k;

            if (S.iPO(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
                if (!expando) {
                    expando = config.expando;
                }
            }

            //防止IE下charset属性在后面导致不生效
            if (charset) {
                node.charset = charset;
            }

            if (expando) {
                for (k in expando) {
                    node.setAttribute(k, expando[k]);
                }
            }

            if (S.iF(success)) {
                if (isCSS) {
                    success.call(node);
                } else {
                    scriptOnload(node, function() {
                        if (timer) {
                            clearTimeout(timer);
                            timer = undefined;
                        }
                        success.call(node);
                    });
                }
            }

            if (S.iF(error)) {
                timer = setTimeout(function() {
                    timer = undefined;
                    error();
                }, (timeout || sconfig.timeout) * 1000);
            }

            if (isCSS) {
                node.rel = 'stylesheet';
                node.href = url;
            } else {
                node.async = true;
                node.src = url;
            }

            head.insertBefore(node, head.firstChild);
            return node;
        },

        //工具函数 是否为函数
        iF: isType('Function'),

        //工具函数 是否为数组
        iA: isType('Array'),

        //工具函数 是否为字符串
        iS: isType('String'),

        //工具函数 是否为对象
        iO: isType('Object'),

        //是否为纯对象, 排除dom节点及window
        iPO: function(o) {
            return o && S.iO(o) && !o.nodeType && !o.setInterval;
        },
        /**
         * Add a module.<br/>
         * S.add('mod-name',function(S){});
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KSLITE
         * @return {KSLITE}
         */
        //添加模块到系统中
        //name   模块名
        //fn     模块加载成功后回调
        //config 该模块的配置, 应该是一个对象{requires:[xxxx,xxx]} 也可以直接是一个数组  
        add: function(name, fn, config) {
            var mods = S.Env.mods,
                mod;
            if (mods[name] && mods[name].status > INIT) {
                return;
            }
            //加入模块的状态
            mod = {
                name: name,
                fn: fn || null,
                status: LOADED
            };

            //如果config是个数组, 改写一下
            if (S.iA(config)) {
                config = {
                    requires: config
                };
            }
            //混合一下
            mix(mod, config);
            //记录
            mods[name] = mod;
            return S;
        },
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.<br/>
         * S.use('mod-name',function(S){});
         * @param modNames {String} 不同模块间以逗号(,)分隔
         * @param callback {Function} 相关代码引入成功后的回调函数
         */

        //使用模块
        //modNames:逗号分隔的模块名
        //callback : 加载成功后的回调
        use: function(modNames, callback) {
            modNames = modNames.split(',');
            var mods = S.Env.mods;
            S._aMs(modNames, function() {
                if (callback) {
                    callback(S);
                }
            });
        },

        //批量载入模块
        _aMs: function(modNames, callback) {
            var i, asyncers = {};
            for (i = 0; i < modNames.length; i++) {
                asyncers[modNames[i]] = {
                    f: S._aM,
                    a: modNames[i]
                };
            }
            S.multiAsync(asyncers, callback);
        },

        //处理模块加载逻辑
        _aM: function(modName, callback) { //require! | noreg mod | cycling require! | name2path! | load queue!
            var mod, requires;
            var mods = S.Env.mods,
                rqmap = S.Env._relies.rq,
                spmap = S.Env._relies.sp;

            function attachMod(mod) {
                if (mod.status != ATTACHED) {
                    if (mod.fn) {
                        //S.log("attach " + mod.name); //注册，这里叫附加
                        //执行模块
                        //上下文S， 附加的模块， 模块中exports附加到的位置
                        mod.fn(S, S.require(mod.name), S._ns(mod.name));
                    } else {
                        //S.log("attach " + mod.name + " without expected attach fn!", "warn");
                    }

                    mod.status = ATTACHED;
                }
                callback();
            }

            function addRelies(mod) {
                var i, modName, reqName, m, n; //rqmap,spmap

                function reg2Map(modName) {
                    rqmap[modName] = rqmap[modName] || {};
                    spmap[modName] = spmap[modName] || {};
                    return modName;
                }
                modName = reg2Map(mod.name);
                for (i = 0; i < mod.requires.length; i++) {
                    reqName = reg2Map(mod.requires[i]);
                    rqmap[modName][reqName] = 1;
                    spmap[reqName][modName] = 1;
                    for (n in spmap[modName]) {
                        rqmap[n][reqName] = 1;
                        spmap[reqName][n] = 1;
                    }
                }
            }
            mod = mods[modName];
            if (mod && mod.status !== INIT) {
                requires = mod.requires;
                if (S.iA(requires) && requires.length > 0) { //如果模块存在且模块已经加载过了
                    addRelies(mod); //处理一下模块的依赖 
                    if (rqmap[modName][modName]) { //有循环依赖了 
                        throw new Error("Fatal Error,Loop Reqs:" + mod.name);
                    }
                    //S.log(mod.name + " to req: " + requires);
                    S._aMs(requires, function() {
                        attachMod(mod);
                    });
                } else {
                    //注册模块
                    attachMod(mod);
                }
            } else { //没有注册的模块，重新注册一下
                mod = {
                    name: modName
                };
                S._lM(mod, function() {
                    S._aM(modName, function() { //先加载再注册
                        attachMod(mods[modName]);
                    });
                });
            }
        },

        //加载单个模块
        _lM: function(mod, callback) {
            var lq = S.Env._loadQueue,
                modName = mod.name,
                lo;
            var mods = S.Env.mods;
            if (lq[modName]) {
                lo = lq[modName];
                if (lo.c) {
                    //S.log(modName + " is already loaded", "warn");
                    callback();
                } else {
                    //S.log(modName + " is loading,listen to callback");
                    lo.fns.push(callback);
                }
            } else {
                S._gPath(mod, function() {
                    lq[modName] = {
                        fns: [callback],
                        c: false
                    };
                    if (!mods[modName]) {
                        mods[modName] = {
                            name: modName,
                            status: INIT
                        };
                    }
                    S.getScript(mod.fullpath, function() {
                        var i, lo = lq[modName],
                            m;
                        if (mods[modName].status === INIT) {
                            mods[modName].status = LOADED;
                        }
                        for (i = 0; i < lo.fns.length; i++) {
                            lo.fns[i]();
                        }
                        lo.c = true;
                        lo.fns = undefined;
                    }, mod.charset, {
                        mod_name: modName
                    });
                });
            }
        },

        //返回一个模块对应的地址
        path: function(s, callback) {
            var pa = s.split("-"),
                pkgname = pa[0],
                packages = sconfig.lt_pkgs,
                pkg = packages[pkgname];

            if (S.iS(pkg.url)) {
                callback(pkg.url + pa.join("/"), pkg);
            }
            /*} else {
                KSLITE.provide(["packages-router"], function(require) {
                    var pr = require("packages-router");
                    callback((pr[pkgname] || S.Config.base) + pa.join("/"));
                });
            }*/
        },

        //处理模块的全路径，带有时间戳
        _gPath: function(mod, fn) {
            S.path(mod.name, function(path, pkg) {
                mod.fullpath = path + ".js?_t=" + sconfig.timestamp + ".js";
                mod.package = pkg;
                //S.log("path " + mod.name + ": " + mod.fullpath);
                fn();
            });
        },

        multiAsync: function(asyncers, callback) {
            var ctx, k, hasAsyncer = false;

            function isAllComplete() { //检查是否所有的异步都执行完成
                var k, ro = {};
                for (k in asyncers) {
                    if (!asyncers[k].c) {
                        return;
                    }
                    ro[k] = asyncers[k].r;
                }
                callback(ro); //都完成后，把结果收集并整理一下，完成回调
            }
            //只有当asyncers有对象时才继续
            for (k in asyncers) {
                hasAsyncer = true;
            }

            //直接返回一个空对象
            if (!hasAsyncer) {
                callback({});
            }
            for (k in asyncers) {
                (function() {
                    var ao = asyncers[k]; //{context:c,fn:f,args:a,result:r,iscomplete:c}
                    ao.f.call((ao.c || S), ao.a, function(data) {
                        ao.r = data;
                        ao.c = true;
                        isAllComplete();
                    });
                })();
            }

        },

        _ns: function(names) {
            var i, namesArr = names.split("-"),
                o = S.Env.fns;
            for (i = 0; i < namesArr.length; i++) {
                o[namesArr[i]] = o[namesArr[i]] || {};
                o = o[namesArr[i]];
            }
            return o;
        },

        require: function(modName) {
            var modRoot = S._ns(modName);
            modRoot.exports = modRoot.exports || {};
            return modRoot.exports;
        },

        //声明一个模块
        declare: function() {
            var interactiveScript, i, arg, id, depsArr, modFactory;
            //遍历参数
            for (i = 0; i < arguments.length; i++) {
                arg = arguments[i];
                if (S.iS(arg)) { //字符串作为模块id
                    id = arg;
                } else if (S.iA(arg)) { //数组作为模块依赖
                    depsArr = arg;
                } else if (S.iF(arg)) { //函数作为模块的构造函数
                    modFactory = arg;
                }
            }

            if (!id) { //约定禁止没有id的情况
                return;
            }

            S.add(id, function(S, exports, exportsParent) {
                modFactory(S.require, exports, exportsParent);
            }, depsArr);
        },
        //以数组形式使用模块
        provide: function(modsArr, fn) {
            S.use(modsArr.join(","), function(S) {
                fn(S.require);
            });
        }
    });

    //声明kslite模块
    S.declare("kslite", [], function(require, exports) {
        //只导出最后数组中的方法
        exports = S.mix(exports, S, true, ["path", "log", "getScript", "substitute", "clone", "mix", "multiAsync", "extend", "iA", "iF", "iPO", "iS"]);
    });

    //使用一下, log一下已经加载完成
    S.provide(["kslite"], function(require) {
        S.require("kslite").log("kslite inited");
    });


    //pkg
    //增加模块路径
    //模块名@模块路径@模块编码
    function addPath(s) {
        if (S.iS(s)) {
            var pp = s.split("@");
            sconfig.lt_pkgs[pp[0]] = {
                url: pp[1],
                charset: pp[2] || sconfig.charset
            };
        } else if (S.iO(s)) {
            if( !s.charset ) {
                s.charset = sconfig.charset;
            }
            S.mix(sconfig.lt_pkgs, s);
        }
    }

    var kslite_pkgpaths = win.KSLITEpkgPaths;

    //暴露出一个全局方法增加KSLITE加载完成后的调用
    win.KSLITEpkgPaths = {
        push: function(s) {
            addPath(s);
        }
    };

    //如果加载前已经存在kslite_pkgpaths且为一个数组
    //把它们加到路径里
    if (kslite_pkgpaths && S.iA(kslite_pkgpaths)) {
        for (i = 0; i < kslite_pkgpaths.length; i++) {
            addPath(kslite_pkgpaths[i]);
        }
    }

    var ksLoadKey = 'KSLITEonLoad';
    var kslite_onload = win[ksLoadKey];

    //暴露出一个全局方法增加KSLITE加载完成后的调用
    win[ksLoadKey] = {
        push: function(fn) {
            if (fn && S.iF(fn)) {
                fn(S);
            }
        }
    };

    //如果脚本加载之前已经定义了onload，并且它是数组
    //把KSLITE作为参数传入
    if (kslite_onload && S.iA(kslite_onload)) {
        for (i = 0; i < kslite_onload.length; i++) {
            win[ksLoadKey].push(kslite_onload[i]);
        }
    }
})(this, 'KSLITE');
