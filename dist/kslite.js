/**
 * KISSY -- An Enjoyable UI Library : Keep It Simple & Stupid, Short & Sweet, Slim & Sexy...<br/>
 * KSLITE -- KISSY���Ӽ�,ͨ�������������޵ķ���,�ṩģ������,OO֧�ֵȻ�������
 * @module kslite
 * @author lifesinger@gmail.com,limu@taobao.com
 * @modify by hubo.hb@alibaba-inc.com 
 */

(function(win, S, undefined) {
    //KSLITEû�ж�����ʱ��
    //�Ѿ�������ʱ�����ٴ���
    if (win[S] === undefined) {
        //S����Ϊ����
        S = win[S] = {};
    } else {
        return;
    }

    //���ݶ���
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
     * @param r {Object} Ŀ������
     * @param s {Object} Դ����
     * @param ov {Boolean} �Ƿ�ǿ�Ƹ���
     * @param wl {Array} �������ڰ�����,ֻ���ǰ������ڵĶ���.
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

    //���ݷ�����׼������Ԫ�صĽڵ� 
    var gbt = 'getElementsByTagName'; //�ַ����ݴ�,����ѹ��
    var head = doc[gbt]('head')[0] || doc.documentElement;

    //���弸��ģ����״̬
    var INIT = 0;
    var LOADING = 1;
    var LOADED = 2;
    var ERROR = 3;
    var ATTACHED = 4;
    var RE_CSS = /\.css(?:\?|$)/i;

    //�ű����صĻص������� IE�´���readyState����Ҫͬʱ����loaded��complete����״̬
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


    //��ȡ��һ�����Խ����Ľű�
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

    //��ͼͨ��script�ϵ�kslite�������ҵ���ǰksliteʹ�õĽű�
    //����Ҫ��script��ǩ��дkslite����
    if (!win[ksCurKey]) {
        for (i = 0; i < scripts.length; i++) {
            if (scripts[i].kslite) {
                win[ksCurKey] = scripts[i];
                break;
            }
        }
    }

    //����ȡ����base���ܻ������⣬ �����첽��ʱ��, �������û���д��script��������
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

    //Ĭ������
    S.Config = {
        debug: false,
        base: (win[ksCurKey].src).split("/").slice(0, -1).join("/") + "/",
        timeout: 10,
        charset: 'gbk',
        lt_pkgs : {}, //����������
        timestamp: win.KSLITEtimestamp || '20130815074332' //timestamp�ᱻ�滻
    };

    //�ݴ棬����ѹ��
    var sconfig = S.Config;

    //debug��Ϣ
    if (/demo|debug|test/.test(location.href)) {
        sconfig.debug = true;
    }

    if (sconfig.debug) {
        sconfig.timestamp = (new Date()).getTime() + ".js";
    }

    //����kslite����
    mix(S, {
        //kslite�İ汾��
        version: "0.0.1", //version�ᱻ�滻
        //��һ�¿��ݷ�ʽ
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
         * @param o {Object} Դ����
         * @return {Object} the object cloned
         */
        //��¡������o, �������������߶�����ͬʱ�����Ӷ���
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

        //ԭ�ͼ̳�
        //r ����
        //s ����
        //px ���������ӵ�ԭ�ͷ�������
        //sx ���������ӵľ�̬����
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
            //����ԭ��
            r.prototype = rp;
            //����constructor
            rp.constructor = r;
            //����superclass, ������������
            r.superclass = sp;
            //����s��һ������������sp��constructorΪ���Լ�
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }
            //��������ԭ�ͷ���
            if (px) {
                mix(rp, px);
            }
            //�������Ӿ�̬����
            if (sx) {
                mix(r, sx);
            }
            return r;
        },
        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         * @param str {String}ģ���ַ���
         * @param o {String}ģ������
         * @param regexp {String}�滻������ ������������Ĭ��ֵ
         * @param multiSubstitute {Boolean} �Ƿ�֧�ֶ���substitute Ϊtrue,str�е�ģ������ƥ�䲻�����������������ÿ�.
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
         * @param url {String} �ļ���ַ
         * @param success {Function|Object} �ص�����
         * @param charset {String} �ַ���
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

            //��ֹIE��charset�����ں��浼�²���Ч
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

        //���ߺ��� �Ƿ�Ϊ����
        iF: isType('Function'),

        //���ߺ��� �Ƿ�Ϊ����
        iA: isType('Array'),

        //���ߺ��� �Ƿ�Ϊ�ַ���
        iS: isType('String'),

        //���ߺ��� �Ƿ�Ϊ����
        iO: isType('Object'),

        //�Ƿ�Ϊ������, �ų�dom�ڵ㼰window
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
        //����ģ�鵽ϵͳ��
        //name   ģ����
        //fn     ģ�����سɹ����ص�
        //config ��ģ��������, Ӧ����һ������{requires:[xxxx,xxx]} Ҳ����ֱ����һ������  
        add: function(name, fn, config) {
            var mods = S.Env.mods,
                mod;
            if (mods[name] && mods[name].status > INIT) {
                return;
            }
            //����ģ����״̬
            mod = {
                name: name,
                fn: fn || null,
                status: LOADED
            };

            //����config�Ǹ�����, ��дһ��
            if (S.iA(config)) {
                config = {
                    requires: config
                };
            }
            //����һ��
            mix(mod, config);
            //��¼
            mods[name] = mod;
            return S;
        },
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.<br/>
         * S.use('mod-name',function(S){});
         * @param modNames {String} ��ͬģ�����Զ���(,)�ָ�
         * @param callback {Function} ���ش��������ɹ����Ļص�����
         */

        //ʹ��ģ��
        //modNames:���ŷָ���ģ����
        //callback : ���سɹ����Ļص�
        use: function(modNames, callback) {
            modNames = modNames.split(',');
            var mods = S.Env.mods;
            S._aMs(modNames, function() {
                if (callback) {
                    callback(S);
                }
            });
        },

        //��������ģ��
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

        //����ģ�������߼�
        _aM: function(modName, callback) { //require! | noreg mod | cycling require! | name2path! | load queue!
            var mod, requires;
            var mods = S.Env.mods,
                rqmap = S.Env._relies.rq,
                spmap = S.Env._relies.sp;

            function attachMod(mod) {
                if (mod.status != ATTACHED) {
                    if (mod.fn) {
                        //S.log("attach " + mod.name); //ע�ᣬ�����и���
                        //ִ��ģ��
                        //������S�� ���ӵ�ģ�飬 ģ����exports���ӵ���λ��
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
                if (S.iA(requires) && requires.length > 0) { //����ģ��������ģ���Ѿ����ع���
                    addRelies(mod); //����һ��ģ�������� 
                    if (rqmap[modName][modName]) { //��ѭ�������� 
                        throw new Error("Fatal Error,Loop Reqs:" + mod.name);
                    }
                    //S.log(mod.name + " to req: " + requires);
                    S._aMs(requires, function() {
                        attachMod(mod);
                    });
                } else {
                    //ע��ģ��
                    attachMod(mod);
                }
            } else { //û��ע����ģ�飬����ע��һ��
                mod = {
                    name: modName
                };
                S._lM(mod, function() {
                    S._aM(modName, function() { //�ȼ�����ע��
                        attachMod(mods[modName]);
                    });
                });
            }
        },

        //���ص���ģ��
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

        //����һ��ģ����Ӧ�ĵ�ַ
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

        //����ģ����ȫ·��������ʱ����
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

            function isAllComplete() { //�����Ƿ����е��첽��ִ������
                var k, ro = {};
                for (k in asyncers) {
                    if (!asyncers[k].c) {
                        return;
                    }
                    ro[k] = asyncers[k].r;
                }
                callback(ro); //�����ɺ󣬰ѽ����ռ�������һ�£����ɻص�
            }
            //ֻ�е�asyncers�ж���ʱ�ż���
            for (k in asyncers) {
                hasAsyncer = true;
            }

            //ֱ�ӷ���һ���ն���
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

        //����һ��ģ��
        declare: function() {
            var interactiveScript, i, arg, id, depsArr, modFactory;
            //��������
            for (i = 0; i < arguments.length; i++) {
                arg = arguments[i];
                if (S.iS(arg)) { //�ַ�����Ϊģ��id
                    id = arg;
                } else if (S.iA(arg)) { //������Ϊģ������
                    depsArr = arg;
                } else if (S.iF(arg)) { //������Ϊģ���Ĺ��캯��
                    modFactory = arg;
                }
            }

            if (!id) { //Լ����ֹû��id������
                return;
            }

            S.add(id, function(S, exports, exportsParent) {
                modFactory(S.require, exports, exportsParent);
            }, depsArr);
        },
        //��������ʽʹ��ģ��
        provide: function(modsArr, fn) {
            S.use(modsArr.join(","), function(S) {
                fn(S.require);
            });
        }
    });

    //����ksliteģ��
    S.declare("kslite", [], function(require, exports) {
        //ֻ�������������еķ���
        exports = S.mix(exports, S, true, ["path", "log", "getScript", "substitute", "clone", "mix", "multiAsync", "extend", "iA", "iF", "iPO", "iS"]);
    });

    //ʹ��һ��, logһ���Ѿ���������
    S.provide(["kslite"], function(require) {
        S.require("kslite").log("kslite inited");
    });


    //pkg
    //����ģ��·��
    //ģ����@ģ��·��@ģ������
    function addPath(s) {
        if (S.iS(kslite_pkgpaths[i])) {
            var pp = s.split("@");
            sconfig.lt_pkgs[pp[0]] = {
                url: pp[1],
                charset: pp[2] || sconfig.charset
            };
        } else if (S.iO(s)) {
            S.mix(sconfig.lt_pkgs, s);
        }
    }

    var kslite_pkgpaths = win.KSLITEpkgPaths;

    //��¶��һ��ȫ�ַ�������KSLITE�������ɺ��ĵ���
    win.KSLITEpkgPaths = {
        push: function(s) {
            addPath(s);
        }
    };

    //��������ǰ�Ѿ�����kslite_pkgpaths��Ϊһ������
    //�����Ǽӵ�·����
    if (kslite_pkgpaths && S.iA(kslite_pkgpaths)) {
        for (i = 0; i < kslite_pkgpaths.length; i++) {
            addPath(kslite_pkgpaths[i]);
        }
    }

    var ksLoadKey = 'KSLITEonLoad';
    var kslite_onload = win[ksLoadKey];

    //��¶��һ��ȫ�ַ�������KSLITE�������ɺ��ĵ���
    win[ksLoadKey] = {
        push: function(fn) {
            if (fn && S.iF(fn)) {
                fn(S);
            }
        }
    };

    //�����ű�����֮ǰ�Ѿ�������onload��������������
    //��KSLITE��Ϊ��������
    if (kslite_onload && S.iA(kslite_onload)) {
        for (i = 0; i < kslite_onload.length; i++) {
            win[ksLoadKey].push(kslite_onload[i]);
        }
    }
})(this, 'KSLITE');
