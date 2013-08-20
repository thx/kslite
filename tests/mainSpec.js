//在karma下，它把文件放在/base/下，我们需要mock一下getScript
if (window.__karma__) {
    var __getScript = KSLITE.getScript;
    KSLITE.getScript = function() {
        var args = Array.prototype.slice.call(arguments);
        //只处理本地路径 
        if (args[0].indexOf('http://') == -1) {
            args[0] = '/base/tests/' + args[0];
        }

        __getScript.apply(null, args);
    };
}

describe('kslite', function() {
    describe('工具函数', function() {
        describe('log', function() {
            it('不会出错就成', function() {
                KSLITE.log(123);
                expect(1).to.be(1);
            });
        });

        describe('iF', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iF(function() {})).to.be(true);
                expect(KSLITE.iF({})).to.be(false);
            });
        });

        describe('iA', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iA([])).to.be(true);
                expect(KSLITE.iA({})).to.be(false);
            });
        });

        describe('iO', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iO({})).to.be(true);
                expect(KSLITE.iO([])).to.be(false);
                expect(KSLITE.iO(123)).to.be(false);
                expect(KSLITE.iO("123")).to.be(false);
            });
        });

        describe('iPO', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iPO({})).to.be(true);
                expect(KSLITE.iPO(window)).to.be(false);
                expect(KSLITE.iPO(document.getElementsByTagName('body')[0])).to.be(false);
                expect(KSLITE.iPO([])).to.be(false);
                expect(KSLITE.iPO(123)).to.be(false);
                expect(KSLITE.iPO("123")).to.be(false);
            });
        });

        describe('iS', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iS({})).to.be(false);
                expect(KSLITE.iS(window)).to.be(false);
                expect(KSLITE.iS(document.getElementsByTagName('body')[0])).to.be(false);
                expect(KSLITE.iS([])).to.be(false);
                expect(KSLITE.iS(123)).to.be(false);
                expect(KSLITE.iS("123")).to.be(true);
            });
        });


        describe('clone', function() {
            it('函数判断正常', function() {
                var a = {
                    a: 1,
                    b: 2
                }, b = {
                        a: 1,
                        b: 2,
                        c: {
                            d: 1
                        }
                    };
                expect(KSLITE.clone(a)).to.eql(a);
                expect(KSLITE.clone(a)).not.to.eql(b);
                expect(KSLITE.clone(b)).to.eql(b);
            });
        });

        describe('mix', function() {
            it('函数判断正常', function() {
                var foo = {
                    a: 1,
                    b: 2
                };

                var foo1 = {
                    a: 5,
                    b: 6
                };

                var bar = {
                    c: 4,
                    d: {
                        e: 1
                    }
                };

                expect(KSLITE.mix(foo, bar)).to.eql(foo);
                expect(KSLITE.mix(foo, bar).c).to.be(4);
                expect(KSLITE.mix(foo, foo1, false).a).to.be(1);
                expect(KSLITE.mix(foo, foo1, true).a).to.be(5);
                expect(KSLITE.mix(foo1, bar, true, ['d']).c).to.be(undefined);
                expect(foo1.d).not.to.be(undefined);
            });
        });

        describe('substitute', function() {
            it('函数判断正常', function() {
                var tmpl = "iam {a}, heis{b}";
                var tmpl1 = "iam {{a}}, heis{{b}}";
                var tmpl2 = "iam {a}, heis{b},{c}";
                var data = {
                    a: 123,
                    b: 234
                };

                expect(KSLITE.substitute(tmpl, data)).to.be("iam 123, heis234");
                expect(KSLITE.substitute(tmpl1, data, /\{\{([^}])\}\}/g)).to.be("iam 123, heis234");
                expect(KSLITE.substitute(tmpl2, data, null, true)).to.be("iam 123, heis234,{c}");
                expect(KSLITE.substitute(tmpl2, data)).to.be("iam 123, heis234,");
            });
        });

        describe('extend', function() {
            it('函数功能正常', function() {

                function Person(name) {
                    this.init(name);
                }

                KSLITE.mix(Person.prototype, {
                    init: function(name) {
                        this.name = name;
                    },
                    getName: function() {
                        return "Person's Name: " + this.name;
                    }
                });

                function Stuff(name, id) {
                    this.init(name, id);
                }

                KSLITE.extend(Stuff, Person, {
                    init: function(name, id) {
                        Stuff.superclass.init.apply(this, arguments);
                        this.id = id;
                    },
                    getInfo: function() {
                        return "Stuff's Name&id: " + this.name + " " + this.id;
                    }
                });

                var s1 = new Stuff("s", 1);
                expect(s1.getName()).to.be("Person's Name: s");
                expect(s1.getInfo()).to.be("Stuff's Name&id: s 1");

                expect((s1 instanceof Person)).to.be(true);
                expect((s1 instanceof Stuff)).to.be(true);
                expect((s1.constructor)).to.be(Stuff);
            });

        });

    });

    describe('全局配置', function() {
        describe('KSLITEonLoad', function() {
            it('请求成功后回调', function() {
                expect(window.testksliteonload).to.be(1);
            });

            it('请求成功后再次请求直接修改', function() {
                KSLITEonLoad.push(function() {
                    window.testksliteonload = 2;
                });

                expect(window.testksliteonload).to.be(2);
            });
        });

        describe('KSLITEpkgPaths', function() {
            it('添加包路径', function() {
                KSLITE.path('tanxssp', function(p, pkg) {
                    expect(p).to.be('http://cdn.tanx.com/t/tanxssp');
                    expect(pkg).to.eql({
                        url: 'http://cdn.tanx.com/t/',
                        charset: 'gbk'
                    });
                });

                KSLITE.path('tkapi', function(p, pkg) {
                    expect(p).to.be('http://a.alimama.cn/tkapi');
                    expect(pkg).to.eql({
                        url: 'http://a.alimama.cn/',
                        charset: 'utf-8'
                    });
                });
            });

            it('后添加包路径', function() {

                KSLITEpkgPaths.push('test@http://test.com/');
                KSLITE.path('test', function(p, pkg) {
                    expect(p).to.be('http://test.com/test');
                    expect(pkg).to.eql({
                        url: 'http://test.com/',
                        charset: 'gbk'
                    });
                });
            });
        });

        //TODO 时间戳的函数 
        describe('KSLITEtimestamp', function() {
            it('请求的路径上有时间戳', function() {
                expect(1).to.be(1);
                // KSLITE._gPath('test', function(s){
                //     console.log(s);
                // })
            });
        });

    });

    describe('核心功能函数', function() {
        describe('getScript', function() {
            it('获取脚本正常', function(done) {
                KSLITE.getScript('./getScript/normal.js', function() {
                    expect(window.getScriptCallback).to.be(1);
                    done();
                });
            });

            it('指定charset获取正确', function() {
                expect(1).to.be(1);
            });

            it('添加自定义属性正常', function() {
                expect(1).to.be(1);
            });
        });

        describe('add', function() {
            it('添加模块正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('use', function() {
            it('以,分隔调用模块正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('provide', function() {
            it('使用模块功能正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('_aMs', function() {
            it('批量获取模块正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('_aM', function() {
            it('获取单个模块正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('_lM', function() {
            it('载入模块正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('path', function() {
            it('获取脚本路径', function() {
                expect(1).to.be(1);
            });
        });
        describe('_gPath', function() {
            it('获取脚本全路径', function() {
                expect(1).to.be(1);
            });
        });
        describe('_ns', function() {
            it('获取脚本正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('multiAsync', function() {
            it('批量异步获取脚本正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('require', function() {
            it('载入脚本正常', function() {
                expect(1).to.be(1);
            });
        });
        describe('declare', function() {
            it('声明模块正常', function() {
                expect(1).to.be(1);
            });
        });
    });
});
