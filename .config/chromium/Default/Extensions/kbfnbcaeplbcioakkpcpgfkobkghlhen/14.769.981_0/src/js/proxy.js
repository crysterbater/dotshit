!function e(t, n, o) {
    function i(s, c) {
        if (!n[s]) {
            if (!t[s]) {
                var a = "function" == typeof require && require;
                if (!c && a) return a(s, !0);
                if (r) return r(s, !0);
                var u = new Error("Cannot find module '" + s + "'");
                throw u.code = "MODULE_NOT_FOUND", u;
            }
            var d = n[s] = {
                exports: {}
            };
            t[s][0].call(d.exports, function(e) {
                var n = t[s][1][e];
                return i(n ? n : e);
            }, d, d.exports, e, t, n, o);
        }
        return n[s].exports;
    }
    for (var r = "function" == typeof require && require, s = 0; s < o.length; s++) i(o[s]);
    return i;
}({
    1: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/json/stringify"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/json/stringify": 8
    } ],
    2: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/assign"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/assign": 9
    } ],
    3: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/define-property"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/define-property": 10
    } ],
    4: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/promise"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/promise": 11
    } ],
    5: [ function(e, t, n) {
        "use strict";
        n.__esModule = !0, n["default"] = function(e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        };
    }, {} ],
    6: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var i = e("../core-js/object/define-property"), r = o(i);
        n["default"] = function() {
            function e(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var o = t[n];
                    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), 
                    (0, r["default"])(e, o.key, o);
                }
            }
            return function(t, n, o) {
                return n && e(t.prototype, n), o && e(t, o), t;
            };
        }();
    }, {
        "../core-js/object/define-property": 3
    } ],
    7: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var i = e("../core-js/object/define-property"), r = o(i);
        n["default"] = function(e, t, n) {
            return t in e ? (0, r["default"])(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e;
        };
    }, {
        "../core-js/object/define-property": 3
    } ],
    8: [ function(e, t, n) {
        var o = e("../../modules/_core"), i = o.JSON || (o.JSON = {
            stringify: JSON.stringify
        });
        t.exports = function(e) {
            return i.stringify.apply(i, arguments);
        };
    }, {
        "../../modules/_core": 19
    } ],
    9: [ function(e, t, n) {
        e("../../modules/es6.object.assign"), t.exports = e("../../modules/_core").Object.assign;
    }, {
        "../../modules/_core": 19,
        "../../modules/es6.object.assign": 74
    } ],
    10: [ function(e, t, n) {
        e("../../modules/es6.object.define-property");
        var o = e("../../modules/_core").Object;
        t.exports = function(e, t, n) {
            return o.defineProperty(e, t, n);
        };
    }, {
        "../../modules/_core": 19,
        "../../modules/es6.object.define-property": 75
    } ],
    11: [ function(e, t, n) {
        e("../modules/es6.object.to-string"), e("../modules/es6.string.iterator"), e("../modules/web.dom.iterable"), 
        e("../modules/es6.promise"), t.exports = e("../modules/_core").Promise;
    }, {
        "../modules/_core": 19,
        "../modules/es6.object.to-string": 76,
        "../modules/es6.promise": 77,
        "../modules/es6.string.iterator": 78,
        "../modules/web.dom.iterable": 79
    } ],
    12: [ function(e, t, n) {
        t.exports = function(e) {
            if ("function" != typeof e) throw TypeError(e + " is not a function!");
            return e;
        };
    }, {} ],
    13: [ function(e, t, n) {
        t.exports = function() {};
    }, {} ],
    14: [ function(e, t, n) {
        t.exports = function(e, t, n, o) {
            if (!(e instanceof t) || void 0 !== o && o in e) throw TypeError(n + ": incorrect invocation!");
            return e;
        };
    }, {} ],
    15: [ function(e, t, n) {
        var o = e("./_is-object");
        t.exports = function(e) {
            if (!o(e)) throw TypeError(e + " is not an object!");
            return e;
        };
    }, {
        "./_is-object": 36
    } ],
    16: [ function(e, t, n) {
        var o = e("./_to-iobject"), i = e("./_to-length"), r = e("./_to-index");
        t.exports = function(e) {
            return function(t, n, s) {
                var c, a = o(t), u = i(a.length), d = r(s, u);
                if (e && n != n) {
                    for (;u > d; ) if (c = a[d++], c != c) return !0;
                } else for (;u > d; d++) if ((e || d in a) && a[d] === n) return e || d || 0;
                return !e && -1;
            };
        };
    }, {
        "./_to-index": 64,
        "./_to-iobject": 66,
        "./_to-length": 67
    } ],
    17: [ function(e, t, n) {
        var o = e("./_cof"), i = e("./_wks")("toStringTag"), r = "Arguments" == o(function() {
            return arguments;
        }()), s = function(e, t) {
            try {
                return e[t];
            } catch (n) {}
        };
        t.exports = function(e) {
            var t, n, c;
            return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (n = s(t = Object(e), i)) ? n : r ? o(t) : "Object" == (c = o(t)) && "function" == typeof t.callee ? "Arguments" : c;
        };
    }, {
        "./_cof": 18,
        "./_wks": 71
    } ],
    18: [ function(e, t, n) {
        var o = {}.toString;
        t.exports = function(e) {
            return o.call(e).slice(8, -1);
        };
    }, {} ],
    19: [ function(e, t, n) {
        var o = t.exports = {
            version: "2.4.0"
        };
        "number" == typeof __e && (__e = o);
    }, {} ],
    20: [ function(e, t, n) {
        var o = e("./_a-function");
        t.exports = function(e, t, n) {
            if (o(e), void 0 === t) return e;
            switch (n) {
              case 1:
                return function(n) {
                    return e.call(t, n);
                };

              case 2:
                return function(n, o) {
                    return e.call(t, n, o);
                };

              case 3:
                return function(n, o, i) {
                    return e.call(t, n, o, i);
                };
            }
            return function() {
                return e.apply(t, arguments);
            };
        };
    }, {
        "./_a-function": 12
    } ],
    21: [ function(e, t, n) {
        t.exports = function(e) {
            if (void 0 == e) throw TypeError("Can't call method on  " + e);
            return e;
        };
    }, {} ],
    22: [ function(e, t, n) {
        t.exports = !e("./_fails")(function() {
            return 7 != Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    }, {
        "./_fails": 26
    } ],
    23: [ function(e, t, n) {
        var o = e("./_is-object"), i = e("./_global").document, r = o(i) && o(i.createElement);
        t.exports = function(e) {
            return r ? i.createElement(e) : {};
        };
    }, {
        "./_global": 28,
        "./_is-object": 36
    } ],
    24: [ function(e, t, n) {
        t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
    }, {} ],
    25: [ function(e, t, n) {
        var o = e("./_global"), i = e("./_core"), r = e("./_ctx"), s = e("./_hide"), c = "prototype", a = function(e, t, n) {
            var u, d, l, f = e & a.F, g = e & a.G, p = e & a.S, _ = e & a.P, h = e & a.B, v = e & a.W, b = g ? i : i[t] || (i[t] = {}), m = b[c], y = g ? o : p ? o[t] : (o[t] || {})[c];
            g && (n = t);
            for (u in n) d = !f && y && void 0 !== y[u], d && u in b || (l = d ? y[u] : n[u], 
            b[u] = g && "function" != typeof y[u] ? n[u] : h && d ? r(l, o) : v && y[u] == l ? function(e) {
                var t = function(t, n, o) {
                    if (this instanceof e) {
                        switch (arguments.length) {
                          case 0:
                            return new e();

                          case 1:
                            return new e(t);

                          case 2:
                            return new e(t, n);
                        }
                        return new e(t, n, o);
                    }
                    return e.apply(this, arguments);
                };
                return t[c] = e[c], t;
            }(l) : _ && "function" == typeof l ? r(Function.call, l) : l, _ && ((b.virtual || (b.virtual = {}))[u] = l, 
            e & a.R && m && !m[u] && s(m, u, l)));
        };
        a.F = 1, a.G = 2, a.S = 4, a.P = 8, a.B = 16, a.W = 32, a.U = 64, a.R = 128, t.exports = a;
    }, {
        "./_core": 19,
        "./_ctx": 20,
        "./_global": 28,
        "./_hide": 30
    } ],
    26: [ function(e, t, n) {
        t.exports = function(e) {
            try {
                return !!e();
            } catch (t) {
                return !0;
            }
        };
    }, {} ],
    27: [ function(e, t, n) {
        var o = e("./_ctx"), i = e("./_iter-call"), r = e("./_is-array-iter"), s = e("./_an-object"), c = e("./_to-length"), a = e("./core.get-iterator-method"), u = {}, d = {}, n = t.exports = function(e, t, n, l, f) {
            var g, p, _, h, v = f ? function() {
                return e;
            } : a(e), b = o(n, l, t ? 2 : 1), m = 0;
            if ("function" != typeof v) throw TypeError(e + " is not iterable!");
            if (r(v)) {
                for (g = c(e.length); g > m; m++) if (h = t ? b(s(p = e[m])[0], p[1]) : b(e[m]), 
                h === u || h === d) return h;
            } else for (_ = v.call(e); !(p = _.next()).done; ) if (h = i(_, b, p.value, t), 
            h === u || h === d) return h;
        };
        n.BREAK = u, n.RETURN = d;
    }, {
        "./_an-object": 15,
        "./_ctx": 20,
        "./_is-array-iter": 35,
        "./_iter-call": 37,
        "./_to-length": 67,
        "./core.get-iterator-method": 72
    } ],
    28: [ function(e, t, n) {
        var o = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
        "number" == typeof __g && (__g = o);
    }, {} ],
    29: [ function(e, t, n) {
        var o = {}.hasOwnProperty;
        t.exports = function(e, t) {
            return o.call(e, t);
        };
    }, {} ],
    30: [ function(e, t, n) {
        var o = e("./_object-dp"), i = e("./_property-desc");
        t.exports = e("./_descriptors") ? function(e, t, n) {
            return o.f(e, t, i(1, n));
        } : function(e, t, n) {
            return e[t] = n, e;
        };
    }, {
        "./_descriptors": 22,
        "./_object-dp": 47,
        "./_property-desc": 54
    } ],
    31: [ function(e, t, n) {
        t.exports = e("./_global").document && document.documentElement;
    }, {
        "./_global": 28
    } ],
    32: [ function(e, t, n) {
        t.exports = !e("./_descriptors") && !e("./_fails")(function() {
            return 7 != Object.defineProperty(e("./_dom-create")("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    }, {
        "./_descriptors": 22,
        "./_dom-create": 23,
        "./_fails": 26
    } ],
    33: [ function(e, t, n) {
        t.exports = function(e, t, n) {
            var o = void 0 === n;
            switch (t.length) {
              case 0:
                return o ? e() : e.call(n);

              case 1:
                return o ? e(t[0]) : e.call(n, t[0]);

              case 2:
                return o ? e(t[0], t[1]) : e.call(n, t[0], t[1]);

              case 3:
                return o ? e(t[0], t[1], t[2]) : e.call(n, t[0], t[1], t[2]);

              case 4:
                return o ? e(t[0], t[1], t[2], t[3]) : e.call(n, t[0], t[1], t[2], t[3]);
            }
            return e.apply(n, t);
        };
    }, {} ],
    34: [ function(e, t, n) {
        var o = e("./_cof");
        t.exports = Object("z").propertyIsEnumerable(0) ? Object : function(e) {
            return "String" == o(e) ? e.split("") : Object(e);
        };
    }, {
        "./_cof": 18
    } ],
    35: [ function(e, t, n) {
        var o = e("./_iterators"), i = e("./_wks")("iterator"), r = Array.prototype;
        t.exports = function(e) {
            return void 0 !== e && (o.Array === e || r[i] === e);
        };
    }, {
        "./_iterators": 42,
        "./_wks": 71
    } ],
    36: [ function(e, t, n) {
        t.exports = function(e) {
            return "object" == typeof e ? null !== e : "function" == typeof e;
        };
    }, {} ],
    37: [ function(e, t, n) {
        var o = e("./_an-object");
        t.exports = function(e, t, n, i) {
            try {
                return i ? t(o(n)[0], n[1]) : t(n);
            } catch (r) {
                var s = e["return"];
                throw void 0 !== s && o(s.call(e)), r;
            }
        };
    }, {
        "./_an-object": 15
    } ],
    38: [ function(e, t, n) {
        "use strict";
        var o = e("./_object-create"), i = e("./_property-desc"), r = e("./_set-to-string-tag"), s = {};
        e("./_hide")(s, e("./_wks")("iterator"), function() {
            return this;
        }), t.exports = function(e, t, n) {
            e.prototype = o(s, {
                next: i(1, n)
            }), r(e, t + " Iterator");
        };
    }, {
        "./_hide": 30,
        "./_object-create": 46,
        "./_property-desc": 54,
        "./_set-to-string-tag": 58,
        "./_wks": 71
    } ],
    39: [ function(e, t, n) {
        "use strict";
        var o = e("./_library"), i = e("./_export"), r = e("./_redefine"), s = e("./_hide"), c = e("./_has"), a = e("./_iterators"), u = e("./_iter-create"), d = e("./_set-to-string-tag"), l = e("./_object-gpo"), f = e("./_wks")("iterator"), g = !([].keys && "next" in [].keys()), p = "@@iterator", _ = "keys", h = "values", v = function() {
            return this;
        };
        t.exports = function(e, t, n, b, m, y, L) {
            u(n, t, b);
            var x, j, w, O = function(e) {
                if (!g && e in R) return R[e];
                switch (e) {
                  case _:
                    return function() {
                        return new n(this, e);
                    };

                  case h:
                    return function() {
                        return new n(this, e);
                    };
                }
                return function() {
                    return new n(this, e);
                };
            }, k = t + " Iterator", N = m == h, F = !1, R = e.prototype, I = R[f] || R[p] || m && R[m], A = I || O(m), P = m ? N ? O("entries") : A : void 0, E = "Array" == t ? R.entries || I : I;
            if (E && (w = l(E.call(new e())), w !== Object.prototype && (d(w, k, !0), o || c(w, f) || s(w, f, v))), 
            N && I && I.name !== h && (F = !0, A = function() {
                return I.call(this);
            }), o && !L || !g && !F && R[f] || s(R, f, A), a[t] = A, a[k] = v, m) if (x = {
                values: N ? A : O(h),
                keys: y ? A : O(_),
                entries: P
            }, L) for (j in x) j in R || r(R, j, x[j]); else i(i.P + i.F * (g || F), t, x);
            return x;
        };
    }, {
        "./_export": 25,
        "./_has": 29,
        "./_hide": 30,
        "./_iter-create": 38,
        "./_iterators": 42,
        "./_library": 43,
        "./_object-gpo": 50,
        "./_redefine": 56,
        "./_set-to-string-tag": 58,
        "./_wks": 71
    } ],
    40: [ function(e, t, n) {
        var o = e("./_wks")("iterator"), i = !1;
        try {
            var r = [ 7 ][o]();
            r["return"] = function() {
                i = !0;
            }, Array.from(r, function() {
                throw 2;
            });
        } catch (s) {}
        t.exports = function(e, t) {
            if (!t && !i) return !1;
            var n = !1;
            try {
                var r = [ 7 ], s = r[o]();
                s.next = function() {
                    return {
                        done: n = !0
                    };
                }, r[o] = function() {
                    return s;
                }, e(r);
            } catch (c) {}
            return n;
        };
    }, {
        "./_wks": 71
    } ],
    41: [ function(e, t, n) {
        t.exports = function(e, t) {
            return {
                value: t,
                done: !!e
            };
        };
    }, {} ],
    42: [ function(e, t, n) {
        t.exports = {};
    }, {} ],
    43: [ function(e, t, n) {
        t.exports = !0;
    }, {} ],
    44: [ function(e, t, n) {
        var o = e("./_global"), i = e("./_task").set, r = o.MutationObserver || o.WebKitMutationObserver, s = o.process, c = o.Promise, a = "process" == e("./_cof")(s);
        t.exports = function() {
            var e, t, n, u = function() {
                var o, i;
                for (a && (o = s.domain) && o.exit(); e; ) {
                    i = e.fn, e = e.next;
                    try {
                        i();
                    } catch (r) {
                        throw e ? n() : t = void 0, r;
                    }
                }
                t = void 0, o && o.enter();
            };
            if (a) n = function() {
                s.nextTick(u);
            }; else if (r) {
                var d = !0, l = document.createTextNode("");
                new r(u).observe(l, {
                    characterData: !0
                }), n = function() {
                    l.data = d = !d;
                };
            } else if (c && c.resolve) {
                var f = c.resolve();
                n = function() {
                    f.then(u);
                };
            } else n = function() {
                i.call(o, u);
            };
            return function(o) {
                var i = {
                    fn: o,
                    next: void 0
                };
                t && (t.next = i), e || (e = i, n()), t = i;
            };
        };
    }, {
        "./_cof": 18,
        "./_global": 28,
        "./_task": 63
    } ],
    45: [ function(e, t, n) {
        "use strict";
        var o = e("./_object-keys"), i = e("./_object-gops"), r = e("./_object-pie"), s = e("./_to-object"), c = e("./_iobject"), a = Object.assign;
        t.exports = !a || e("./_fails")(function() {
            var e = {}, t = {}, n = Symbol(), o = "abcdefghijklmnopqrst";
            return e[n] = 7, o.split("").forEach(function(e) {
                t[e] = e;
            }), 7 != a({}, e)[n] || Object.keys(a({}, t)).join("") != o;
        }) ? function(e, t) {
            for (var n = s(e), a = arguments.length, u = 1, d = i.f, l = r.f; a > u; ) for (var f, g = c(arguments[u++]), p = d ? o(g).concat(d(g)) : o(g), _ = p.length, h = 0; _ > h; ) l.call(g, f = p[h++]) && (n[f] = g[f]);
            return n;
        } : a;
    }, {
        "./_fails": 26,
        "./_iobject": 34,
        "./_object-gops": 49,
        "./_object-keys": 52,
        "./_object-pie": 53,
        "./_to-object": 68
    } ],
    46: [ function(e, t, n) {
        var o = e("./_an-object"), i = e("./_object-dps"), r = e("./_enum-bug-keys"), s = e("./_shared-key")("IE_PROTO"), c = function() {}, a = "prototype", u = function() {
            var t, n = e("./_dom-create")("iframe"), o = r.length, i = "<", s = ">";
            for (n.style.display = "none", e("./_html").appendChild(n), n.src = "javascript:", 
            t = n.contentWindow.document, t.open(), t.write(i + "script" + s + "document.F=Object" + i + "/script" + s), 
            t.close(), u = t.F; o--; ) delete u[a][r[o]];
            return u();
        };
        t.exports = Object.create || function(e, t) {
            var n;
            return null !== e ? (c[a] = o(e), n = new c(), c[a] = null, n[s] = e) : n = u(), 
            void 0 === t ? n : i(n, t);
        };
    }, {
        "./_an-object": 15,
        "./_dom-create": 23,
        "./_enum-bug-keys": 24,
        "./_html": 31,
        "./_object-dps": 48,
        "./_shared-key": 59
    } ],
    47: [ function(e, t, n) {
        var o = e("./_an-object"), i = e("./_ie8-dom-define"), r = e("./_to-primitive"), s = Object.defineProperty;
        n.f = e("./_descriptors") ? Object.defineProperty : function(e, t, n) {
            if (o(e), t = r(t, !0), o(n), i) try {
                return s(e, t, n);
            } catch (c) {}
            if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");
            return "value" in n && (e[t] = n.value), e;
        };
    }, {
        "./_an-object": 15,
        "./_descriptors": 22,
        "./_ie8-dom-define": 32,
        "./_to-primitive": 69
    } ],
    48: [ function(e, t, n) {
        var o = e("./_object-dp"), i = e("./_an-object"), r = e("./_object-keys");
        t.exports = e("./_descriptors") ? Object.defineProperties : function(e, t) {
            i(e);
            for (var n, s = r(t), c = s.length, a = 0; c > a; ) o.f(e, n = s[a++], t[n]);
            return e;
        };
    }, {
        "./_an-object": 15,
        "./_descriptors": 22,
        "./_object-dp": 47,
        "./_object-keys": 52
    } ],
    49: [ function(e, t, n) {
        n.f = Object.getOwnPropertySymbols;
    }, {} ],
    50: [ function(e, t, n) {
        var o = e("./_has"), i = e("./_to-object"), r = e("./_shared-key")("IE_PROTO"), s = Object.prototype;
        t.exports = Object.getPrototypeOf || function(e) {
            return e = i(e), o(e, r) ? e[r] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? s : null;
        };
    }, {
        "./_has": 29,
        "./_shared-key": 59,
        "./_to-object": 68
    } ],
    51: [ function(e, t, n) {
        var o = e("./_has"), i = e("./_to-iobject"), r = e("./_array-includes")(!1), s = e("./_shared-key")("IE_PROTO");
        t.exports = function(e, t) {
            var n, c = i(e), a = 0, u = [];
            for (n in c) n != s && o(c, n) && u.push(n);
            for (;t.length > a; ) o(c, n = t[a++]) && (~r(u, n) || u.push(n));
            return u;
        };
    }, {
        "./_array-includes": 16,
        "./_has": 29,
        "./_shared-key": 59,
        "./_to-iobject": 66
    } ],
    52: [ function(e, t, n) {
        var o = e("./_object-keys-internal"), i = e("./_enum-bug-keys");
        t.exports = Object.keys || function(e) {
            return o(e, i);
        };
    }, {
        "./_enum-bug-keys": 24,
        "./_object-keys-internal": 51
    } ],
    53: [ function(e, t, n) {
        n.f = {}.propertyIsEnumerable;
    }, {} ],
    54: [ function(e, t, n) {
        t.exports = function(e, t) {
            return {
                enumerable: !(1 & e),
                configurable: !(2 & e),
                writable: !(4 & e),
                value: t
            };
        };
    }, {} ],
    55: [ function(e, t, n) {
        var o = e("./_hide");
        t.exports = function(e, t, n) {
            for (var i in t) n && e[i] ? e[i] = t[i] : o(e, i, t[i]);
            return e;
        };
    }, {
        "./_hide": 30
    } ],
    56: [ function(e, t, n) {
        t.exports = e("./_hide");
    }, {
        "./_hide": 30
    } ],
    57: [ function(e, t, n) {
        "use strict";
        var o = e("./_global"), i = e("./_core"), r = e("./_object-dp"), s = e("./_descriptors"), c = e("./_wks")("species");
        t.exports = function(e) {
            var t = "function" == typeof i[e] ? i[e] : o[e];
            s && t && !t[c] && r.f(t, c, {
                configurable: !0,
                get: function() {
                    return this;
                }
            });
        };
    }, {
        "./_core": 19,
        "./_descriptors": 22,
        "./_global": 28,
        "./_object-dp": 47,
        "./_wks": 71
    } ],
    58: [ function(e, t, n) {
        var o = e("./_object-dp").f, i = e("./_has"), r = e("./_wks")("toStringTag");
        t.exports = function(e, t, n) {
            e && !i(e = n ? e : e.prototype, r) && o(e, r, {
                configurable: !0,
                value: t
            });
        };
    }, {
        "./_has": 29,
        "./_object-dp": 47,
        "./_wks": 71
    } ],
    59: [ function(e, t, n) {
        var o = e("./_shared")("keys"), i = e("./_uid");
        t.exports = function(e) {
            return o[e] || (o[e] = i(e));
        };
    }, {
        "./_shared": 60,
        "./_uid": 70
    } ],
    60: [ function(e, t, n) {
        var o = e("./_global"), i = "__core-js_shared__", r = o[i] || (o[i] = {});
        t.exports = function(e) {
            return r[e] || (r[e] = {});
        };
    }, {
        "./_global": 28
    } ],
    61: [ function(e, t, n) {
        var o = e("./_an-object"), i = e("./_a-function"), r = e("./_wks")("species");
        t.exports = function(e, t) {
            var n, s = o(e).constructor;
            return void 0 === s || void 0 == (n = o(s)[r]) ? t : i(n);
        };
    }, {
        "./_a-function": 12,
        "./_an-object": 15,
        "./_wks": 71
    } ],
    62: [ function(e, t, n) {
        var o = e("./_to-integer"), i = e("./_defined");
        t.exports = function(e) {
            return function(t, n) {
                var r, s, c = String(i(t)), a = o(n), u = c.length;
                return a < 0 || a >= u ? e ? "" : void 0 : (r = c.charCodeAt(a), r < 55296 || r > 56319 || a + 1 === u || (s = c.charCodeAt(a + 1)) < 56320 || s > 57343 ? e ? c.charAt(a) : r : e ? c.slice(a, a + 2) : (r - 55296 << 10) + (s - 56320) + 65536);
            };
        };
    }, {
        "./_defined": 21,
        "./_to-integer": 65
    } ],
    63: [ function(e, t, n) {
        var o, i, r, s = e("./_ctx"), c = e("./_invoke"), a = e("./_html"), u = e("./_dom-create"), d = e("./_global"), l = d.process, f = d.setImmediate, g = d.clearImmediate, p = d.MessageChannel, _ = 0, h = {}, v = "onreadystatechange", b = function() {
            var e = +this;
            if (h.hasOwnProperty(e)) {
                var t = h[e];
                delete h[e], t();
            }
        }, m = function(e) {
            b.call(e.data);
        };
        f && g || (f = function(e) {
            for (var t = [], n = 1; arguments.length > n; ) t.push(arguments[n++]);
            return h[++_] = function() {
                c("function" == typeof e ? e : Function(e), t);
            }, o(_), _;
        }, g = function(e) {
            delete h[e];
        }, "process" == e("./_cof")(l) ? o = function(e) {
            l.nextTick(s(b, e, 1));
        } : p ? (i = new p(), r = i.port2, i.port1.onmessage = m, o = s(r.postMessage, r, 1)) : d.addEventListener && "function" == typeof postMessage && !d.importScripts ? (o = function(e) {
            d.postMessage(e + "", "*");
        }, d.addEventListener("message", m, !1)) : o = v in u("script") ? function(e) {
            a.appendChild(u("script"))[v] = function() {
                a.removeChild(this), b.call(e);
            };
        } : function(e) {
            setTimeout(s(b, e, 1), 0);
        }), t.exports = {
            set: f,
            clear: g
        };
    }, {
        "./_cof": 18,
        "./_ctx": 20,
        "./_dom-create": 23,
        "./_global": 28,
        "./_html": 31,
        "./_invoke": 33
    } ],
    64: [ function(e, t, n) {
        var o = e("./_to-integer"), i = Math.max, r = Math.min;
        t.exports = function(e, t) {
            return e = o(e), e < 0 ? i(e + t, 0) : r(e, t);
        };
    }, {
        "./_to-integer": 65
    } ],
    65: [ function(e, t, n) {
        var o = Math.ceil, i = Math.floor;
        t.exports = function(e) {
            return isNaN(e = +e) ? 0 : (e > 0 ? i : o)(e);
        };
    }, {} ],
    66: [ function(e, t, n) {
        var o = e("./_iobject"), i = e("./_defined");
        t.exports = function(e) {
            return o(i(e));
        };
    }, {
        "./_defined": 21,
        "./_iobject": 34
    } ],
    67: [ function(e, t, n) {
        var o = e("./_to-integer"), i = Math.min;
        t.exports = function(e) {
            return e > 0 ? i(o(e), 9007199254740991) : 0;
        };
    }, {
        "./_to-integer": 65
    } ],
    68: [ function(e, t, n) {
        var o = e("./_defined");
        t.exports = function(e) {
            return Object(o(e));
        };
    }, {
        "./_defined": 21
    } ],
    69: [ function(e, t, n) {
        var o = e("./_is-object");
        t.exports = function(e, t) {
            if (!o(e)) return e;
            var n, i;
            if (t && "function" == typeof (n = e.toString) && !o(i = n.call(e))) return i;
            if ("function" == typeof (n = e.valueOf) && !o(i = n.call(e))) return i;
            if (!t && "function" == typeof (n = e.toString) && !o(i = n.call(e))) return i;
            throw TypeError("Can't convert object to primitive value");
        };
    }, {
        "./_is-object": 36
    } ],
    70: [ function(e, t, n) {
        var o = 0, i = Math.random();
        t.exports = function(e) {
            return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++o + i).toString(36));
        };
    }, {} ],
    71: [ function(e, t, n) {
        var o = e("./_shared")("wks"), i = e("./_uid"), r = e("./_global").Symbol, s = "function" == typeof r, c = t.exports = function(e) {
            return o[e] || (o[e] = s && r[e] || (s ? r : i)("Symbol." + e));
        };
        c.store = o;
    }, {
        "./_global": 28,
        "./_shared": 60,
        "./_uid": 70
    } ],
    72: [ function(e, t, n) {
        var o = e("./_classof"), i = e("./_wks")("iterator"), r = e("./_iterators");
        t.exports = e("./_core").getIteratorMethod = function(e) {
            if (void 0 != e) return e[i] || e["@@iterator"] || r[o(e)];
        };
    }, {
        "./_classof": 17,
        "./_core": 19,
        "./_iterators": 42,
        "./_wks": 71
    } ],
    73: [ function(e, t, n) {
        "use strict";
        var o = e("./_add-to-unscopables"), i = e("./_iter-step"), r = e("./_iterators"), s = e("./_to-iobject");
        t.exports = e("./_iter-define")(Array, "Array", function(e, t) {
            this._t = s(e), this._i = 0, this._k = t;
        }, function() {
            var e = this._t, t = this._k, n = this._i++;
            return !e || n >= e.length ? (this._t = void 0, i(1)) : "keys" == t ? i(0, n) : "values" == t ? i(0, e[n]) : i(0, [ n, e[n] ]);
        }, "values"), r.Arguments = r.Array, o("keys"), o("values"), o("entries");
    }, {
        "./_add-to-unscopables": 13,
        "./_iter-define": 39,
        "./_iter-step": 41,
        "./_iterators": 42,
        "./_to-iobject": 66
    } ],
    74: [ function(e, t, n) {
        var o = e("./_export");
        o(o.S + o.F, "Object", {
            assign: e("./_object-assign")
        });
    }, {
        "./_export": 25,
        "./_object-assign": 45
    } ],
    75: [ function(e, t, n) {
        var o = e("./_export");
        o(o.S + o.F * !e("./_descriptors"), "Object", {
            defineProperty: e("./_object-dp").f
        });
    }, {
        "./_descriptors": 22,
        "./_export": 25,
        "./_object-dp": 47
    } ],
    76: [ function(e, t, n) {}, {} ],
    77: [ function(e, t, n) {
        "use strict";
        var o, i, r, s = e("./_library"), c = e("./_global"), a = e("./_ctx"), u = e("./_classof"), d = e("./_export"), l = e("./_is-object"), f = e("./_a-function"), g = e("./_an-instance"), p = e("./_for-of"), _ = e("./_species-constructor"), h = e("./_task").set, v = e("./_microtask")(), b = "Promise", m = c.TypeError, y = c.process, L = c[b], y = c.process, x = "process" == u(y), j = function() {}, w = !!function() {
            try {
                var t = L.resolve(1), n = (t.constructor = {})[e("./_wks")("species")] = function(e) {
                    e(j, j);
                };
                return (x || "function" == typeof PromiseRejectionEvent) && t.then(j) instanceof n;
            } catch (o) {}
        }(), O = function(e, t) {
            return e === t || e === L && t === r;
        }, k = function(e) {
            var t;
            return !(!l(e) || "function" != typeof (t = e.then)) && t;
        }, N = function(e) {
            return O(L, e) ? new F(e) : new i(e);
        }, F = i = function(e) {
            var t, n;
            this.promise = new e(function(e, o) {
                if (void 0 !== t || void 0 !== n) throw m("Bad Promise constructor");
                t = e, n = o;
            }), this.resolve = f(t), this.reject = f(n);
        }, R = function(e) {
            try {
                e();
            } catch (t) {
                return {
                    error: t
                };
            }
        }, I = function(e, t) {
            if (!e._n) {
                e._n = !0;
                var n = e._c;
                v(function() {
                    for (var o = e._v, i = 1 == e._s, r = 0, s = function(t) {
                        var n, r, s = i ? t.ok : t.fail, c = t.resolve, a = t.reject, u = t.domain;
                        try {
                            s ? (i || (2 == e._h && E(e), e._h = 1), s === !0 ? n = o : (u && u.enter(), n = s(o), 
                            u && u.exit()), n === t.promise ? a(m("Promise-chain cycle")) : (r = k(n)) ? r.call(n, c, a) : c(n)) : a(o);
                        } catch (d) {
                            a(d);
                        }
                    }; n.length > r; ) s(n[r++]);
                    e._c = [], e._n = !1, t && !e._h && A(e);
                });
            }
        }, A = function(e) {
            h.call(c, function() {
                var t, n, o, i = e._v;
                if (P(e) && (t = R(function() {
                    x ? y.emit("unhandledRejection", i, e) : (n = c.onunhandledrejection) ? n({
                        promise: e,
                        reason: i
                    }) : (o = c.console) && o.error && o.error("Unhandled promise rejection", i);
                }), e._h = x || P(e) ? 2 : 1), e._a = void 0, t) throw t.error;
            });
        }, P = function(e) {
            if (1 == e._h) return !1;
            for (var t, n = e._a || e._c, o = 0; n.length > o; ) if (t = n[o++], t.fail || !P(t.promise)) return !1;
            return !0;
        }, E = function(e) {
            h.call(c, function() {
                var t;
                x ? y.emit("rejectionHandled", e) : (t = c.onrejectionhandled) && t({
                    promise: e,
                    reason: e._v
                });
            });
        }, C = function(e) {
            var t = this;
            t._d || (t._d = !0, t = t._w || t, t._v = e, t._s = 2, t._a || (t._a = t._c.slice()), 
            I(t, !0));
        }, M = function(e) {
            var t, n = this;
            if (!n._d) {
                n._d = !0, n = n._w || n;
                try {
                    if (n === e) throw m("Promise can't be resolved itself");
                    (t = k(e)) ? v(function() {
                        var o = {
                            _w: n,
                            _d: !1
                        };
                        try {
                            t.call(e, a(M, o, 1), a(C, o, 1));
                        } catch (i) {
                            C.call(o, i);
                        }
                    }) : (n._v = e, n._s = 1, I(n, !1));
                } catch (o) {
                    C.call({
                        _w: n,
                        _d: !1
                    }, o);
                }
            }
        };
        w || (L = function(e) {
            g(this, L, b, "_h"), f(e), o.call(this);
            try {
                e(a(M, this, 1), a(C, this, 1));
            } catch (t) {
                C.call(this, t);
            }
        }, o = function(e) {
            this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, 
            this._n = !1;
        }, o.prototype = e("./_redefine-all")(L.prototype, {
            then: function(e, t) {
                var n = N(_(this, L));
                return n.ok = "function" != typeof e || e, n.fail = "function" == typeof t && t, 
                n.domain = x ? y.domain : void 0, this._c.push(n), this._a && this._a.push(n), this._s && I(this, !1), 
                n.promise;
            },
            "catch": function(e) {
                return this.then(void 0, e);
            }
        }), F = function() {
            var e = new o();
            this.promise = e, this.resolve = a(M, e, 1), this.reject = a(C, e, 1);
        }), d(d.G + d.W + d.F * !w, {
            Promise: L
        }), e("./_set-to-string-tag")(L, b), e("./_set-species")(b), r = e("./_core")[b], 
        d(d.S + d.F * !w, b, {
            reject: function(e) {
                var t = N(this), n = t.reject;
                return n(e), t.promise;
            }
        }), d(d.S + d.F * (s || !w), b, {
            resolve: function(e) {
                if (e instanceof L && O(e.constructor, this)) return e;
                var t = N(this), n = t.resolve;
                return n(e), t.promise;
            }
        }), d(d.S + d.F * !(w && e("./_iter-detect")(function(e) {
            L.all(e)["catch"](j);
        })), b, {
            all: function(e) {
                var t = this, n = N(t), o = n.resolve, i = n.reject, r = R(function() {
                    var n = [], r = 0, s = 1;
                    p(e, !1, function(e) {
                        var c = r++, a = !1;
                        n.push(void 0), s++, t.resolve(e).then(function(e) {
                            a || (a = !0, n[c] = e, --s || o(n));
                        }, i);
                    }), --s || o(n);
                });
                return r && i(r.error), n.promise;
            },
            race: function(e) {
                var t = this, n = N(t), o = n.reject, i = R(function() {
                    p(e, !1, function(e) {
                        t.resolve(e).then(n.resolve, o);
                    });
                });
                return i && o(i.error), n.promise;
            }
        });
    }, {
        "./_a-function": 12,
        "./_an-instance": 14,
        "./_classof": 17,
        "./_core": 19,
        "./_ctx": 20,
        "./_export": 25,
        "./_for-of": 27,
        "./_global": 28,
        "./_is-object": 36,
        "./_iter-detect": 40,
        "./_library": 43,
        "./_microtask": 44,
        "./_redefine-all": 55,
        "./_set-species": 57,
        "./_set-to-string-tag": 58,
        "./_species-constructor": 61,
        "./_task": 63,
        "./_wks": 71
    } ],
    78: [ function(e, t, n) {
        "use strict";
        var o = e("./_string-at")(!0);
        e("./_iter-define")(String, "String", function(e) {
            this._t = String(e), this._i = 0;
        }, function() {
            var e, t = this._t, n = this._i;
            return n >= t.length ? {
                value: void 0,
                done: !0
            } : (e = o(t, n), this._i += e.length, {
                value: e,
                done: !1
            });
        });
    }, {
        "./_iter-define": 39,
        "./_string-at": 62
    } ],
    79: [ function(e, t, n) {
        e("./es6.array.iterator");
        for (var o = e("./_global"), i = e("./_hide"), r = e("./_iterators"), s = e("./_wks")("toStringTag"), c = [ "NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList" ], a = 0; a < 5; a++) {
            var u = c[a], d = o[u], l = d && d.prototype;
            l && !l[s] && i(l, s, u), r[u] = r.Array;
        }
    }, {
        "./_global": 28,
        "./_hide": 30,
        "./_iterators": 42,
        "./_wks": 71,
        "./es6.array.iterator": 73
    } ],
    80: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function i() {
            function e(e) {
                var t = e.detail, n = t.name, o = t.data;
                r && r[n].postMessage(o);
            }
            function t() {
                document.dispatchEvent(new CustomEvent("grammarly:pong")), document.dispatchEvent(new CustomEvent("grammarly:reset"));
            }
            function n(e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return document.dispatchEvent(new CustomEvent("grammarly:message", {
                    detail: (0, a["default"])({
                        event: e
                    }, t)
                }));
            }
            function o() {
                document.removeEventListener("grammarly:action", e), document.removeEventListener("grammarly:ping", t), 
                document.removeEventListener("grammarly:reset", o), r = null;
            }
            function i(e) {
                var t = f.runtime.connect({
                    name: e
                });
                return t.onMessage.addListener(function(t) {
                    return n("message", {
                        msg: t,
                        name: e
                    });
                }), t.onDisconnect.addListener(function() {
                    console.warn("port malfunction " + e);
                    var t = f.runtime.lastError;
                    g.proxyPortDisconnected(e, t && t.message || "port malfunction: " + e), o(), document.dispatchEvent(new CustomEvent("grammarly:error", {
                        detail: {
                            event: "disconnect",
                            name: e
                        }
                    }));
                }), t;
            }
            var r = [ l.ports.bridge, l.ports.background, l.ports.broadcast ].reduce(function(e, t) {
                return (0, a["default"])({}, e, (0, s["default"])({}, t, i(t)));
            }, {});
            document.addEventListener("grammarly:action", e), document.addEventListener("grammarly:ping", t), 
            document.dispatchEvent(new CustomEvent("grammarly:proxyports")), document.addEventListener("grammarly:proxyports", o), 
            g.proxyInit();
        }
        var r = e("babel-runtime/helpers/defineProperty"), s = o(r), c = e("babel-runtime/core-js/object/assign"), a = o(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("lib/tracking/felogPixel"), d = e("lib/tracking/telemetry"), l = e("extension-api/interface"), f = window.chrome || window.firefox, g = new d.Telemetry(u.sendEventPixel);
        "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", i, !1) : i();
    }, {
        "babel-runtime/core-js/object/assign": 2,
        "babel-runtime/helpers/defineProperty": 7,
        "extension-api/interface": 81,
        "lib/tracking/felogPixel": 84,
        "lib/tracking/telemetry": 85
    } ],
    81: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.ports = {
            bridge: "bridge",
            background: "message:to-priv",
            broadcast: "message:to-non-priv"
        };
    }, {} ],
    82: [ function(e, t, n) {
        "use strict";
        function o() {
            if (s()) {
                var e = void 0;
                try {
                    e = firefox;
                } catch (t) {
                    e = {};
                }
                return !!e.runtime;
            }
            return c() || u();
        }
        function i() {
            return !!window.__extensionTestsMode;
        }
        function r() {
            return "87677a2c52b84ad3a151a4a72f5bd3c4";
        }
        function s() {
            return window.navigator.userAgent.indexOf("Firefox") !== -1;
        }
        function c() {
            return !!window.chrome && /google/i.test(navigator.vendor);
        }
        function a() {
            return /^((?!chrome).)*safari/i.test(navigator.userAgent);
        }
        function u() {
            return /edge/i.test(navigator.userAgent);
        }
        function d() {
            return a() && navigator.userAgent.indexOf("Version/8.0") !== -1;
        }
        function l() {
            return navigator.appVersion.indexOf("Win") !== -1;
        }
        function f() {
            return !!window.IS_BG;
        }
        function g() {
            var e = !1;
            try {
                e = safari.extension.globalPage.contentWindow !== window;
            } catch (t) {}
            return e;
        }
        function p() {
            return !!window.IS_POPUP;
        }
        function _() {
            return f() || p();
        }
        function h() {
            return c() ? "chrome" : s() ? "firefox" : a() ? "safari" : "other";
        }
        function v() {
            var e = "unknown";
            try {
                if (a()) return safari.extension.displayVersion;
                if (c()) {
                    var t = chrome.runtime.getManifest();
                    return t.version;
                }
                if (s()) {
                    var n = firefox.runtime.getManifest();
                    return n.version;
                }
                return e;
            } catch (o) {
                return console.error(o), e;
            }
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.isWE = o, n.isTestsMode = i, n.getUuid = r, n.isFF = s, n.isChrome = c, n.isSafari = a, 
        n.isEdge = u, n.isSafari8 = d, n.isWindows = l, n.isBg = f, n.isSafariSettingsPopup = g, 
        n.isPopup = p, n.isBgOrPopup = _, n.getBrowser = h, n.getVersion = v, n.ENV = "prod";
        var b = "c10dd64c87f70ef5563a63c368797e8c";
        n.MIXPANEL = {
            qaKey: "7a5c95b5cba1b225d00cc3ba1c410c78",
            key: b,
            cookie: "mp_" + b + "_mixpanel"
        }, n.STATSC = {
            URL: "https://stats-public.grammarly.io/",
            PREFIX: "grammarly.ui"
        }, n.GRAMMARLY_DOMAIN = "grammarly.com";
        var m = "https://www." + n.GRAMMARLY_DOMAIN;
        n.DAPI = "https://data." + n.GRAMMARLY_DOMAIN;
        var y = "https://app." + n.GRAMMARLY_DOMAIN, L = "https://auth." + n.GRAMMARLY_DOMAIN + "/v3", x = L + "/user", j = m + "/after_install_page", w = "https://emailfeedback." + n.GRAMMARLY_DOMAIN;
        n.URLS = {
            app: y,
            appPersonalDictionary: y + "/profile/dictionary",
            capi: "wss://capi." + n.GRAMMARLY_DOMAIN + "/freews",
            dapiMimic: n.DAPI + "/api/mimic",
            dapiProps: n.DAPI + "/api/props",
            editorDictionary: y + "/profile/dictionary",
            dictionary: "https://capi." + n.GRAMMARLY_DOMAIN + "/api/defs",
            docs: y + "/docs",
            docsApi: "https://dox." + n.GRAMMARLY_DOMAIN + "/documents",
            authCreatePage: L + "/redirect-anonymous?location=" + j,
            userOrAnonymous: x + "/oranonymous",
            authSignin: L + "/login",
            authSignup: L + "/signup",
            signin: m + "/signin",
            signup: m + "/signup",
            resetPassword: m + "/resetpassword",
            saveEmailFeedback: w + "/api/feedback/",
            raven: "felog.grammarly.io",
            newFelog: "https://f-log-extension.grammarly.io",
            referral: m + "/referral?page=extension",
            welcomeC: m + "/extension-success",
            upgrade: m + "/upgrade",
            uninstall: m + "/extension-uninstall",
            terms: m + "/terms",
            policy: m + "/privacy-policy",
            pageConfigUrl: "https://d3cv4a9a9wh0bt.cloudfront.net/browserplugin/config.json"
        };
        var O = h().slice(0, 1).toUpperCase() + h().slice(1);
        n.appName = "extension" + O, n.gnarAppName = h() + "Ext";
    }, {} ],
    83: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function i(e, t, n, o, i, r, a, u) {
            var d = {
                message: r,
                logger: i,
                level: c.toFelogString(a),
                application: e,
                version: t,
                env: n
            };
            return u && (d.extra = u), o + "/log?json=" + encodeURIComponent((0, s["default"])(d));
        }
        var r = e("babel-runtime/core-js/json/stringify"), s = o(r);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c;
        !function(e) {
            e[e.INFO = 0] = "INFO", e[e.WARN = 1] = "WARN", e[e.ERROR = 2] = "ERROR";
        }(c = n.LogLevel || (n.LogLevel = {})), function(e) {
            function t(t) {
                switch (t) {
                  case e.INFO:
                    return "INFO";

                  case e.WARN:
                    return "WARN";

                  case e.ERROR:
                    return "ERROR";

                  default:
                    ;
                    throw new TypeError("Unrecognized log level " + t);
                }
            }
            e.toFelogString = t;
        }(c = n.LogLevel || (n.LogLevel = {})), n.felogRequestUrl = i;
    }, {
        "babel-runtime/core-js/json/stringify": 1
    } ],
    84: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function i(e, t, n, o) {
            var i = document.createElement("img");
            return i.src = a.felogRequestUrl(c.appName, c.getVersion(), c.ENV, c.URLS.newFelog, e, t, n, o), 
            s["default"].resolve();
        }
        var r = e("babel-runtime/core-js/promise"), s = o(r);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("../newConfig"), a = e("./felog");
        n.sendEventPixel = i;
    }, {
        "../newConfig": 82,
        "./felog": 83,
        "babel-runtime/core-js/promise": 4
    } ],
    85: [ function(e, t, n) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var i = e("babel-runtime/core-js/json/stringify"), r = o(i), s = e("babel-runtime/helpers/classCallCheck"), c = o(s), a = e("babel-runtime/helpers/createClass"), u = o(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("./felog"), l = function() {
            function e(t) {
                var n = this;
                (0, c["default"])(this, e), this._sendFelog = t, this.pageLoadTimeout = function() {
                    n._send("cs.connection.failover.pageLoad.timeout", "content script init failed", d.LogLevel.ERROR);
                }, this.appLoadTimeout = function() {
                    n._send("cs.connection.failover.appLoad.timeout", "extension init timed out", d.LogLevel.ERROR);
                }, this.differentStateDomain = function(e) {
                    n._send("cs.state.differentDomain", "received state for different domain", d.LogLevel.INFO, {
                        stateDomain: e
                    });
                }, this.restoredBgConnection = function(e) {
                    n._send("cs.connection.bg.restored", "bg page connection restored", d.LogLevel.INFO, {
                        timeWithoutConnection: e
                    });
                }, this.initWithoutBgConnection = function() {
                    n._send("cs.connection.bg.disconnected", "no connection to bg page", d.LogLevel.INFO);
                }, this.fetchDefinitionsFail = function() {
                    n._send("cs.connection.api.definition.failed", "definitions fetch failed", d.LogLevel.WARN);
                }, this.infinityCheckResetFail = function(e) {
                    n._send("cs.connection.infiniteCheck.failed", "infinite check reset failed", d.LogLevel.ERROR, {
                        delay: e
                    });
                }, this.tooLongPageConfigInit = function(e) {
                    n._send("cs.pageConfig.init.exceeded", "page config init timeout", d.LogLevel.WARN, {
                        initTime: e
                    });
                }, this.tooLongUserUpdateTime = function(e) {
                    n._send("bg.state.user.update.exceeded", "user state update took too long", d.LogLevel.WARN, {
                        updateTime: e
                    });
                }, this.lostBgPageConnection = function() {
                    n._send("cs.gbutton.bgСonnection.lost", "gbutton connection to bg page lost", d.LogLevel.INFO);
                }, this.restoreBgPageConnection = function(e) {
                    n._send("cs.gbutton.bgСonnection.restored", "gbutton connection to bg page restored", d.LogLevel.INFO, {
                        time: e
                    });
                }, this.badCursorPosition = function() {
                    n._send("cs.editor.badCursorPosition", "incorrect cursor position in grammarly-editor", d.LogLevel.INFO);
                }, this.cursorJump = function() {
                    n._send("cs.editor.cursorJump", "cursor jump detected", d.LogLevel.WARN);
                }, this.signinOpen = function() {
                    n._send("cs.signin.open", "sign in dialog opened", d.LogLevel.INFO);
                }, this.signinClose = function(e) {
                    n._send("cs.signin.close", "sign in dialog closed", d.LogLevel.INFO, {
                        openTime: e
                    });
                }, this.tabReloadClick = function() {
                    n._send("cs.gbutton.reload.click", "gbutton reload clicked", d.LogLevel.WARN);
                }, this.popupLoadError = function(e, t) {
                    n._send("cs.popup.load.error", "could not open pop-up editor", d.LogLevel.ERROR, {
                        message: e,
                        name: t
                    });
                }, this.loginNoBgPageConnection = function(e) {
                    n._send("debug.cs.connection.signin.bg.timeout", "can not connect to bg page on login", d.LogLevel.INFO, {
                        message: e
                    });
                }, this.pageConfigCDNError = function(e) {
                    n._send("cs.pageConfig.cdn.error", "could not read page config", d.LogLevel.ERROR, {
                        message: e
                    });
                }, this.pageConfigLocalStorageError = function(e, t) {
                    n._send("cs.pageConfig.localStorage.error", "could not read page config from localStorage", d.LogLevel.INFO, {
                        message: e,
                        name: t
                    });
                }, this.pageConfigUpdated = function(e, t) {
                    n._send("cs.pageConfig.updated", "page config updated", d.LogLevel.INFO, {
                        oldVersion: e,
                        newVersion: t
                    });
                }, this.settingsPopupTimeout = function() {
                    n._send("settings.popup.init.timeout", "settings popup open timeout", d.LogLevel.WARN);
                }, this.settingsUsupportedShow = function(e) {
                    n._send("settings.popup.state.unsupported.show", "page unsupported message shown", d.LogLevel.INFO, {
                        popupType: e
                    });
                }, this.settingsPopupToggled = function(e) {
                    n._send("settings.popup.experiment.toggle", "settings popup disabled/enabled for experiment on /personalize page", d.LogLevel.INFO, {
                        isPopupDisabled: e
                    });
                }, this.socketBgError = function() {
                    n._send("bg.socket.error", "bg page socket error", d.LogLevel.WARN);
                }, this.capiNotAuthorizedLoop = function(e, t) {
                    n._send("debug.socket.notAuthorizedLoop", "could not authenticate on capi and auth", d.LogLevel.INFO, {
                        authDegradation: e,
                        cookiesDisabled: t
                    });
                }, this.socketDisabledCookie = function() {
                    n._send("debug.socket.disabledCookies", "disabled cookies after failed authentication", d.LogLevel.INFO);
                }, this.socketBgRestored = function(e) {
                    n._send("debug.bg.socket.restored", "capi session restored", d.LogLevel.INFO, {
                        tryCount: e
                    });
                }, this.socketBgReconnectFail = function(e, t) {
                    n._send("bg.socket.reconnect.fail", "could not restore ws connection", d.LogLevel.WARN, {
                        token: e,
                        tryCount: t
                    });
                }, this.socketCsError = function() {
                    n._send("cs.socket.error", "content script socket error", d.LogLevel.WARN);
                }, this.soketCsErrorMsg = function(e) {
                    n._send("cs.socket.errorMsg", "capi error", d.LogLevel.WARN, {
                        message: e
                    });
                }, this.gnarClientInitFail = function(e) {
                    n._send("gnar.bg.tracking.gnar.init.fail", "gnar init failed", d.LogLevel.WARN, {
                        message: e
                    });
                }, this.bgTrackingInitFail = function() {
                    n._send("debug.tracking.init.fail", "bg page tracking library init failed", d.LogLevel.INFO);
                }, this.dailyPing = function() {
                    n._send("debug.dailyPing", "daily ping", d.LogLevel.INFO);
                }, this.userUpgradeClick = function(e) {
                    n._send("cs.ui.action.upgradeClick", "upgrade hook clicked", d.LogLevel.INFO, {
                        placement: e
                    });
                }, this.gButtonClick = function() {
                    n._send("cs.ui.gbutton.click", "gbutton clicked", d.LogLevel.INFO);
                }, this.checkingToggledInField = function(e) {
                    n._send("cs.ui.gbutton.toggleInField", "checking toggled in field", d.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.disabledOnDomain = function() {
                    n._send("cs.state.disabledOnDomain", "checking disabled for domain", d.LogLevel.INFO);
                }, this.sessionInvalidated = function(e, t) {
                    n._send("bg.session.invalidated", "user session invalidated", d.LogLevel.INFO, {
                        reason: e,
                        userChanged: t
                    });
                }, this.unexpectedAnonymous = function(e) {
                    n._send("debug.bg.session.unexpectedAnonymous", "user changed to anonymous", d.LogLevel.INFO, e);
                }, this.dapiPropInitialized = function(e, t) {
                    n._send("bg.settings.dapi.prop.init", "save property to the DAPI", d.LogLevel.INFO, {
                        name: e,
                        value: t
                    });
                }, this.getDapiPropError = function(e, t) {
                    n._send("bg.connection.dapi.getProp.error", "could not get dapi property", d.LogLevel.WARN, {
                        property: e,
                        body: t
                    });
                }, this.setDapiPropError = function(e, t) {
                    n._send("bg.connection.dapi.setProp.error", "could not set dapi property", d.LogLevel.WARN, {
                        property: e,
                        body: t
                    });
                }, this.toggleExtensionDefs = function(e) {
                    n._send("bg.settings.definitions.toggle", "definitions toggled for domain", d.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.toggleExtension = function(e) {
                    n._send("bg.settings.extension.toggle", "extension toggled for domain", d.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.cookieOverflow = function(e, t) {
                    n._send("debug.bg.state.cookie.overflow", "cookie is too big", d.LogLevel.INFO, {
                        size: e,
                        biggestCookie: t
                    });
                }, this.externalChangePlan = function() {
                    n._send("bg.api.external.changePlan", "plan changed from editor", d.LogLevel.INFO);
                }, this.externalChangeDialect = function() {
                    n._send("bg.api.external.changeDialect", "dialect changed from editor", d.LogLevel.INFO);
                }, this.externalChangeUser = function() {
                    n._send("bg.api.external.changeUsed", "user changed from editor", d.LogLevel.INFO);
                }, this.externalLogout = function() {
                    n._send("bg.api.external.logout", "user logged out form editor", d.LogLevel.INFO);
                }, this.externalEnableEmailPerception = function() {
                    n._send("bg.api.external.enableEmailPerception", "user enabled email perception feature on the funnel", d.LogLevel.INFO);
                }, this.bgPageStartFail = function(e, t) {
                    n._send("bg.start.fail", "bg page start failed", d.LogLevel.ERROR, {
                        message: e,
                        stack: t
                    });
                }, this.bgPageInitTimeout = function(e) {
                    n._send("bg.state.start.timeout", "bg page init timeout", d.LogLevel.WARN, {
                        initTime: e
                    });
                }, this.bgPageInitFail = function(e) {
                    n._send("bg.state.init.fail", "bg page init failed", d.LogLevel.ERROR, {
                        initAttempts: e
                    });
                }, this.extensionUpdated = function(e, t) {
                    n._send("bg.state.updated", "extension updated", d.LogLevel.INFO, {
                        currentVersion: e,
                        previousVersion: t
                    });
                }, this.extensionUpdateFail = function(e) {
                    n._send("bg.state.update.fail", "extension update failed", d.LogLevel.INFO, {
                        previousVersion: e
                    });
                }, this.cannotGetInstallSource = function() {
                    n._send("bg.getSource.fail", "failed to get extension install source", d.LogLevel.WARN);
                }, this.extensionInstall = function(e) {
                    n._send("bg.state.install", "extension installed", d.LogLevel.INFO, {
                        source: e
                    });
                }, this.chromeForcedToUpdate = function(e) {
                    n._send("bg.chrome.forcedToUpdate", "chrome forced update", d.LogLevel.INFO, {
                        newVersion: e
                    });
                }, this.chromeContentScriptLoadError = function(e, t) {
                    n._send("bg.chrome.cs.load.error", "content script execution error", d.LogLevel.WARN, {
                        message: e,
                        type: t
                    });
                }, this.reloadNotificationShow = function() {
                    n._send("bg.ui.notification.tabsReload.show", "extension reload notification shown", d.LogLevel.WARN);
                }, this.reloadNotificationClick = function() {
                    n._send("bg.ui.notification.tabsReload.click", "reload notification clicked", d.LogLevel.INFO);
                }, this.fetchUserFail = function(e, t, o) {
                    n._send("bg.user.fetch.fail", "failed to update user", d.LogLevel.WARN, {
                        body: t,
                        statusCode: o,
                        reason: e
                    });
                }, this.fetchMimicFail = function(e, t) {
                    n._send("bg.user.mimic.fail", "mimic request failed", d.LogLevel.WARN, {
                        body: e,
                        statusCode: t
                    });
                }, this.fetchCookieFail = function() {
                    n._send("bg.cookie.fail", "could not get grauth from cookie", d.LogLevel.WARN);
                }, this.fetchSettingsFail = function(e, t) {
                    n._send("bg.user.settings.fail", "could not get settings from auth", d.LogLevel.WARN, {
                        body: e,
                        statusCode: t
                    });
                }, this.frequentCookieChanges = function(e) {
                    n._send("debug.cookie.onChange.error", "cookie change too frequent", d.LogLevel.INFO, {
                        canceled: e
                    });
                }, this.initializePropFromDapi = function(e) {
                    n._send("bg.state.dapi.prop.initialize", "set property from dapi", d.LogLevel.INFO, {
                        name: e
                    });
                }, this.emailPerceptionPopupShow = function() {
                    n._send("cs.emailPerception.popup.show", "show email perception popup on gmail/inbox domain", d.LogLevel.INFO);
                }, this.emailPerceptionPopupCancel = function() {
                    n._send("cs.emailPerception.popup.cancel", "user canceled email perception popup on gmail/inbox", d.LogLevel.INFO);
                }, this.emailPerceptiongButtonHover = function() {
                    n._send("cs.emailPerception.gbutton.hover", "user hovered gButton and ask for feedback btn is shown on gmail/inbox", d.LogLevel.INFO);
                }, this.onboardingPopupShow = function() {
                    n._send("cs.onboarding.popup.show", "show onboarding popup to user after first time extension install", d.LogLevel.INFO);
                }, this.onboardingPopupCancel = function() {
                    n._send("cs.onboarding.popup.cancel", "user canceled onboarding popup", d.LogLevel.INFO);
                }, this.onboardingTutorialShow = function() {
                    n._send("cs.onboarding.tutorial.show", "opened onboarding dialog after popup", d.LogLevel.INFO);
                }, this.onboardingVideoLoaded = function() {
                    n._send("cs.onboarding.tutorial.video.loaded", "load video data for onboarding tutorial", d.LogLevel.INFO);
                }, this.saveEmailFeedbackError = function(e) {
                    n._send("bg.emailfeedback.save.error", "failed to save email feedback", d.LogLevel.INFO, {
                        body: e
                    });
                }, this.incognitoInit = function() {
                    n._send("bg.incognito.init", "extension initialized in incognito mode", d.LogLevel.INFO);
                }, this.disabledCookiesInit = function() {
                    n._send("bg.cookie.disabled", "extension initialized with disabled cookies", d.LogLevel.INFO);
                }, this.proxyInit = function() {
                    n._send("proxy.init", "proxy script initialized", d.LogLevel.INFO);
                }, this.proxyPortDisconnected = function(e, t) {
                    n._send("proxy.disconnect", "proxy port disconnected", d.LogLevel.INFO, {
                        port: e,
                        error: t
                    });
                }, this.unhandledBgPageException = function(e) {
                    n._send("bg.unhandledException", "unhandled exception on background page", d.LogLevel.ERROR, {
                        message: e.error ? e.error.message : e.message
                    });
                }, this.unhandledBgPageRejection = function(e) {
                    n._send("bg.unhandledRejection", "unhandled promise rejection on background page", d.LogLevel.ERROR, {
                        message: null != e.reason ? "string" == typeof e.reason ? e.reason : e.reason.message : void 0
                    });
                }, this.storageMigrationSucceeded = function() {
                    n._send("bg.storageMigration.success", "storage migration succeeded", d.LogLevel.INFO, {});
                }, this.storageMigrationFailed = function(e) {
                    n._send("bg.storageMigration.failure", "storage migration failed", d.LogLevel.ERROR, {
                        message: e && e.message
                    });
                }, this.cardShowAction = function() {
                    n._send("cs.editor.card.show", "show card action", d.LogLevel.INFO);
                }, this.cardHideAction = function() {
                    n._send("cs.editor.card.hide", "hide card action", d.LogLevel.INFO);
                }, this.cardReplacementAction = function() {
                    n._send("cs.editor.card.replacement", "click on the replacement in the card", d.LogLevel.INFO);
                }, this.cardAddToDictAction = function() {
                    n._send("cs.editor.card.addToDict", "click add to dictionary button in the card", d.LogLevel.INFO);
                }, this.cardIgnoreAction = function() {
                    n._send("cs.editor.card.ignore", "click ignore button in the card", d.LogLevel.INFO);
                }, this.synonymCardShowAction = function(e) {
                    n._send("cs.editor.synonym.show", "show synonymous card action", d.LogLevel.INFO, {
                        notFoundCard: e
                    });
                }, this.synonymCardHideAction = function(e) {
                    n._send("cs.editor.synonym.hide", "hide synonymous card action", d.LogLevel.INFO, {
                        notFoundCard: e
                    });
                }, this.synonymReplacementAction = function() {
                    n._send("cs.editor.synonym.replacement", "click on the replacement in the synonym", d.LogLevel.INFO);
                }, this.dictCardShowAction = function() {
                    n._send("cs.editor.dict.show", "show dictionary card action", d.LogLevel.INFO);
                }, this.dictCardHideAction = function() {
                    n._send("cs.editor.dict.hide", "hide dictionary card action", d.LogLevel.INFO);
                };
            }
            return (0, u["default"])(e, [ {
                key: "_send",
                value: function(e, t, n, o) {
                    var i = void 0;
                    try {
                        i = (0, r["default"])(o);
                    } catch (s) {
                        i = "Failed to stringify event properties: '" + s + "', '" + (s && s.message) + "'", 
                        console.warn(i, "for " + t + "@" + e);
                    }
                    try {
                        this._sendFelog(e, t, n, null != o ? {
                            json: i
                        } : void 0);
                    } catch (s) {
                        console.warn("Failed to send felog for " + t + "@" + e + ": '" + s + "', '" + (s && s.message) + "'");
                    }
                }
            } ]), e;
        }();
        n.Telemetry = l;
    }, {
        "./felog": 83,
        "babel-runtime/core-js/json/stringify": 1,
        "babel-runtime/helpers/classCallCheck": 5,
        "babel-runtime/helpers/createClass": 6
    } ]
}, {}, [ 80 ]);