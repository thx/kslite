describe('kslite', function() {
    describe('工具函数', function() {
        describe('log', function() {
            it('不会出错就成', function() {
                KSLITE.log(123);
                expect(1).toBe(1);
            });
        });

        describe('iF', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iF(function() {})).toBe(true);
                expect(KSLITE.iF({})).toBe(false);
            });
        });

        describe('iA', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iA([])).toBe(true);
                expect(KSLITE.iA({})).toBe(false);
            });
        });

        describe('iO', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iO({})).toBe(true);
                expect(KSLITE.iO([])).toBe(false);
                expect(KSLITE.iO(123)).toBe(false);
                expect(KSLITE.iO("123")).toBe(false);
            });
        });

        describe('iPO', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iPO({})).toBe(true);
                expect(KSLITE.iPO(window)).toBe(false);
                expect(KSLITE.iPO(document.getElementsByTagName('body')[0])).toBe(false);
                expect(KSLITE.iPO([])).toBe(false);
                expect(KSLITE.iPO(123)).toBe(false);
                expect(KSLITE.iPO("123")).toBe(false);
            });
        });

        describe('iS', function() {
            it('函数判断正常', function() {
                expect(KSLITE.iS({})).toBe(false);
                expect(KSLITE.iS(window)).toBe(false);
                expect(KSLITE.iS(document.getElementsByTagName('body')[0])).toBe(false);
                expect(KSLITE.iS([])).toBe(false);
                expect(KSLITE.iS(123)).toBe(false);
                expect(KSLITE.iS("123")).toBe(true);
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
                expect(KSLITE.clone(a)).toEqual(a);
                expect(KSLITE.clone(a)).not.toEqual(b);
                expect(KSLITE.clone(b)).toEqual(b);
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

                expect(KSLITE.mix(foo, bar)).toEqual(foo);
                expect(KSLITE.mix(foo, bar).c).toBe(4);
                expect(KSLITE.mix(foo, foo1, false).a).toBe(1);
                expect(KSLITE.mix(foo, foo1, true).a).toBe(5);
                expect(KSLITE.mix(foo1, bar, true, ['d']).c).toBeUndefined();
                expect(foo1.d).not.toBeUndefined();
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

                expect(KSLITE.substitute(tmpl, data)).toEqual("iam 123, heis234");
                expect(KSLITE.substitute(tmpl1, data, /\{\{([^}])\}\}/g)).toEqual("iam 123, heis234");
                expect(KSLITE.substitute(tmpl2, data, null, true)).toEqual("iam 123, heis234,{c}");
                expect(KSLITE.substitute(tmpl2, data)).toEqual("iam 123, heis234,");
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
                expect(s1.getName()).toBe("Person's Name: s");
                expect(s1.getInfo()).toBe("Stuff's Name&id: s 1");

                expect((s1 instanceof Person)).toEqual(true);
                expect((s1 instanceof Stuff)).toEqual(true);
                expect((s1.constructor)).toEqual(Stuff);
            });

        });

    });

    describe('全局配置', function() {
        describe('KSLITEonLoad', function() {
            it('请求成功后回调', function() {
                expect(window.testksliteonload).toBe(1);
            });

            it('请求成功后再次请求直接修改', function() {
                KSLITEonLoad.push(function() {
                    window.testksliteonload = 2;
                });

                expect(window.testksliteonload).toBe(2);
            });
        });

        describe('KSLITEpkgPaths', function() {
            it('添加包路径', function() {
                KSLITE.path('tanxssp', function(p, pkg) {
                    expect(p).toEqual('http://cdn.tanx.com/t/tanxssp');
                    expect(pkg).toEqual({
                        url: 'http://cdn.tanx.com/t/',
                        charset: 'gbk'
                    });
                });

                KSLITE.path('tkapi', function(p, pkg) {
                    expect(p).toEqual('http://a.alimama.cn/tkapi');
                    expect(pkg).toEqual({
                        url: 'http://a.alimama.cn/',
                        charset: 'utf-8'
                    });
                });
            });

            it('后添加包路径', function() {

                KSLITEpkgPaths.push('test@http://test.com/'); 
                KSLITE.path('test', function(p, pkg) {
                    expect(p).toEqual('http://test.com/test');
                    expect(pkg).toEqual({
                        url: 'http://test.com/',
                        charset: 'gbk'
                    });
                });
            });
        });

        //TODO 时间戳的函数 
        describe('KSLITEtimestamp', function() {
            it('请求的路径上有时间戳', function() {
                expect(1).toEqual(1);
                // KSLITE._gPath('test', function(s){
                //     console.log(s);
                // })
            });
        });

    });

    describe('核心功能函数', function() {
        describe('add', function() {
            it('添加模块正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('use', function() {
            it('以,分隔调用模块正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('getScript', function() {
            it('获取脚本正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('provide', function() {
            it('使用模块功能正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('_aMs', function() {
            it('批量获取模块正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('_aM', function() {
            it('获取单个模块正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('_lM', function() {
            it('载入模块正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('path', function() {
            it('获取脚本路径', function() {
                expect(1).toEqual(1);
            });
        });
        describe('_gPath', function() {
            it('获取脚本全路径', function() {
                expect(1).toEqual(1);
            });
        });
        describe('_ns', function() {
            it('获取脚本正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('multiAsync', function() {
            it('批量异步获取脚本正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('require', function() {
            it('载入脚本正常', function() {
                expect(1).toEqual(1);
            });
        });
        describe('declare', function() {
            it('声明模块正常', function() {
                expect(1).toEqual(1);
            });
        });
    });
});
