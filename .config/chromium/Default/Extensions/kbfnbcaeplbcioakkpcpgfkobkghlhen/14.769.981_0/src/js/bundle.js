!function e(t, n, r) {
    function o(a, s) {
        if (!n[a]) {
            if (!t[a]) {
                var c = "function" == typeof require && require;
                if (!s && c) return c(a, !0);
                if (i) return i(a, !0);
                var l = new Error("Cannot find module '" + a + "'");
                throw l.code = "MODULE_NOT_FOUND", l;
            }
            var u = n[a] = {
                exports: {}
            };
            t[a][0].call(u.exports, function(e) {
                var n = t[a][1][e];
                return o(n ? n : e);
            }, u, u.exports, e, t, n, r);
        }
        return n[a].exports;
    }
    for (var i = "function" == typeof require && require, a = 0; a < r.length; a++) o(r[a]);
    return o;
}({
    1: [ function(e, t, n) {
        (function(r) {
            !function(e) {
                if ("object" == typeof n && "undefined" != typeof t) t.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
                    var o;
                    o = "undefined" != typeof window ? window : "undefined" != typeof r ? r : "undefined" != typeof self ? self : this, 
                    o.Changesets = e();
                }
            }(function() {
                return function t(n, r, o) {
                    function i(s, c) {
                        if (!r[s]) {
                            if (!n[s]) {
                                var l = "function" == typeof e && e;
                                if (!c && l) return l(s, !0);
                                if (a) return a(s, !0);
                                var u = new Error("Cannot find module '" + s + "'");
                                throw u.code = "MODULE_NOT_FOUND", u;
                            }
                            var d = r[s] = {
                                exports: {}
                            };
                            n[s][0].call(d.exports, function(e) {
                                var t = n[s][1][e];
                                return i(t ? t : e);
                            }, d, d.exports, t, n, r, o);
                        }
                        return r[s].exports;
                    }
                    for (var a = "function" == typeof e && e, s = 0; s < o.length; s++) i(o[s]);
                    return i;
                }({
                    1: [ function(e, t, n) {
                        try {
                            t.exports = e("./lib/changesets");
                        } catch (r) {}
                    }, {
                        "./lib/changesets": 2
                    } ],
                    2: [ function(e, t, n) {
                        var r = e("textdiff").textdiff, o = e("lodash"), i = {
                            op: function(e) {
                                return e = o.clone(e), e.len = e.text ? e.text.length : 0, e.toString = function() {
                                    return this.type + this.pos + ":" + this.text;
                                }, e.extend = function(t) {
                                    return e = o.extend(o.clone(this), t), e.len = e.text.length, e;
                                }, e.revision = function(e) {
                                    return o.extend(o.clone(this), {
                                        accessory: e
                                    });
                                }, e.apply = function(t, n) {
                                    if ("+" == this.type) {
                                        if (t.length != this.tlen) throw new Error("Text length doesn't match expected length. It's most likely you have missed a transformation: expected:" + this.tlen + ", actual:" + t.length);
                                        return n && (this.pos < n.b && (n.b += this.text.length), this.pos < n.e && (n.e += this.text.length)), 
                                        t.slice(0, this.pos) + this.text + t.slice(this.pos);
                                    }
                                    if ("-" == this.type) {
                                        if (t.length != this.tlen) throw new Error("Text length doesn't match expected length. It's most likely you have missed a transformation: expected:" + this.tlen + ", actual:" + t.length);
                                        if (t.substr(this.pos, this.len) != this.text) throw new Error("Applying delete operation: Passed context doesn't match assumed context: " + JSON.stringify(e) + ', actual context: "' + t.substr(this.pos, this.len) + '"');
                                        return n && (this.pos < n.b && (n.b -= Math.min(this.text.length, n.b - this.pos)), 
                                        this.pos < n.e && (n.e -= Math.min(this.text.length, n.e - this.pos))), t.slice(0, this.pos) + t.slice(this.pos + this.len);
                                    }
                                    if ("=" == this.type) return t;
                                }, e.transformAgainst = function(e) {
                                    if ("+" == this.type && "+" == e.type) {
                                        var t = this.tlen + e.len;
                                        if (this.pos < e.pos) return this.extend({
                                            tlen: t
                                        });
                                        if (this.pos == e.pos && this.accessory < e.accessory) return this.extend({
                                            tlen: t
                                        });
                                        if (e.pos <= this.pos) return this.extend({
                                            tlen: t,
                                            pos: this.pos + e.len
                                        });
                                    } else if ("+" == this.type && "-" == e.type) {
                                        var t = this.tlen - e.len;
                                        if (this.pos < e.pos) return this.extend({
                                            tlen: t
                                        });
                                        if (this.pos == e.pos) return this.extend({
                                            tlen: t
                                        });
                                        if (e.pos < this.pos) return this.extend({
                                            tlen: t,
                                            pos: Math.max(this.pos - e.len, e.pos)
                                        });
                                    } else if ("-" == this.type && "-" == e.type) {
                                        var t = this.tlen - e.len;
                                        if (this.pos < e.pos) {
                                            var n = Math.min(e.pos - this.pos, this.len);
                                            return this.extend({
                                                tlen: t,
                                                text: this.text.substr(0, n) + this.text.substr(n + e.len)
                                            });
                                        }
                                        if (this.pos == e.pos) return this.len <= e.len ? i.op({
                                            type: "="
                                        }) : this.extend({
                                            tlen: t,
                                            text: this.text.substr(e.len)
                                        });
                                        if (e.pos < this.pos) {
                                            var r = e.pos + e.len - this.pos;
                                            return r >= this.len ? i.op({
                                                type: "="
                                            }) : r > 0 ? this.extend({
                                                tlen: t,
                                                pos: e.pos,
                                                text: this.text.substr(r)
                                            }) : this.extend({
                                                tlen: t,
                                                pos: this.pos - e.len
                                            });
                                        }
                                    } else if ("-" == this.type && "+" == e.type) {
                                        var t = this.tlen + e.len;
                                        if (this.pos < e.pos) {
                                            if (this.pos + this.len > e.pos) {
                                                var o = e.pos - this.pos;
                                                return [ this.extend({
                                                    tlen: t,
                                                    text: this.text.substr(0, o)
                                                }), this.extend({
                                                    tlen: t,
                                                    pos: e.pos + e.len,
                                                    text: this.text.substr(o)
                                                }) ];
                                            }
                                            return this.extend({
                                                tlen: t
                                            });
                                        }
                                        if (this.pos == e.pos) return this.extend({
                                            tlen: t,
                                            pos: this.pos + e.len
                                        });
                                        if (e.pos < this.pos) return this.extend({
                                            tlen: t,
                                            pos: this.pos + e.len
                                        });
                                    }
                                    return this;
                                }, e;
                            },
                            cs: function(e) {
                                return e = o.clone(e.map(function(e) {
                                    return o.clone(e);
                                })), e.toString = function() {
                                    return this.map(function(e) {
                                        return e.toString();
                                    }).join(" ");
                                }, e.push = function(t) {
                                    t instanceof Array ? t.forEach(function(t) {
                                        [].push.call(e, t);
                                    }) : [].push.call(e, t);
                                }, e.revision = function(t) {
                                    return i.cs(e.map(function(e) {
                                        return e.revision(t);
                                    }));
                                }, e.maxRevision = function() {
                                    return Math.max(0, Math.max.apply(null, e.map(function(e) {
                                        return e.accessory;
                                    })));
                                }, e.apply = function(e, t) {
                                    return this.sequencify().forEach(function(n) {
                                        e = n.apply(e, t);
                                    }), e;
                                }, e.transformAgainst = function(e) {
                                    var t = i.cs([]), e = e.sequencify();
                                    return this.forEach(function(n) {
                                        e.forEach(function(e) {
                                            n = n.transformAgainst(e);
                                        }), t.push(n);
                                    }), t;
                                }, e.sequencify = function(e) {
                                    var t = i.cs([]);
                                    return this.forEach(function(e) {
                                        "=" != e.type && (t.forEach(function(t) {
                                            e = e.transformAgainst(t);
                                        }), t.push(e));
                                    }), t;
                                }, e.pack = function() {
                                    return this.filter(function(e) {
                                        return "=" != e.type;
                                    }).map(function(e) {
                                        var t = e.text.replace(/%/g, "%25").replace(/:/g, "%3A"), n = e.pos.toString(36), r = e.tlen.toString(36), o = e.accessory.toString(36);
                                        return e.type + n + ":" + r + ":" + t + ":" + o;
                                    }).join("");
                                }, e;
                            },
                            diff: function(e, t, n) {
                                n = n || 0;
                                var o = r(e, t), a = i.cs([]), s = e.length;
                                return o.oldFragment && a.push(i.op({
                                    type: "-",
                                    tlen: s,
                                    pos: o.from,
                                    text: o.oldFragment,
                                    accessory: n
                                })), o.newFragment && a.push(i.op({
                                    type: "+",
                                    tlen: s,
                                    pos: o.from,
                                    text: o.newFragment,
                                    accessory: n
                                })), a;
                            },
                            unpack: function(e) {
                                if ("" == e) return i.cs([]);
                                var t = e.match(/(\+|-)\w+?:\w+?:[^:]+?:\w+/g);
                                if (!t) throw new Error("Cannot unpack invalid serialized changeset string");
                                return i.cs(t.map(function(e) {
                                    var t = e.substr(1).split(":");
                                    return i.op({
                                        type: e.substr(0, 1),
                                        pos: parseInt(t[0], 36),
                                        tlen: parseInt(t[1], 36),
                                        text: t[2].replace(/%3A/gi, ":").replace(/%25/g, "%"),
                                        accessory: parseInt(t[3], 36)
                                    });
                                }));
                            }
                        };
                        try {
                            t.exports = i;
                        } catch (a) {}
                    }, {
                        lodash: "lodash",
                        textdiff: "textdiff"
                    } ]
                }, {}, [ 1 ])(1);
            });
        }).call(this, "undefined" != typeof window ? window : {});
    }, {
        "./lib/changesets": 2,
        lodash: "lodash",
        textdiff: "textdiff"
    } ],
    2: [ function(e, t, n) {
        var r = e("textdiff").textdiff, o = e("lodash"), i = {
            op: function(e) {
                return e = o.clone(e), e.len = e.text ? e.text.length : 0, e.toString = function() {
                    return this.type + this.pos + ":" + this.text;
                }, e.extend = function(t) {
                    return e = o.extend(o.clone(this), t), e.len = e.text.length, e;
                }, e.revision = function(e) {
                    return o.extend(o.clone(this), {
                        accessory: e
                    });
                }, e.apply = function(t, n) {
                    if ("+" == this.type) {
                        if (t.length != this.tlen) throw new Error("Text length doesn't match expected length. It's most likely you have missed a transformation: expected:" + this.tlen + ", actual:" + t.length);
                        return n && (this.pos < n.b && (n.b += this.text.length), this.pos < n.e && (n.e += this.text.length)), 
                        t.slice(0, this.pos) + this.text + t.slice(this.pos);
                    }
                    if ("-" == this.type) {
                        if (t.length != this.tlen) throw new Error("Text length doesn't match expected length. It's most likely you have missed a transformation: expected:" + this.tlen + ", actual:" + t.length);
                        if (t.substr(this.pos, this.len) != this.text) throw new Error("Applying delete operation: Passed context doesn't match assumed context: " + JSON.stringify(e) + ', actual context: "' + t.substr(this.pos, this.len) + '"');
                        return n && (this.pos < n.b && (n.b -= Math.min(this.text.length, n.b - this.pos)), 
                        this.pos < n.e && (n.e -= Math.min(this.text.length, n.e - this.pos))), t.slice(0, this.pos) + t.slice(this.pos + this.len);
                    }
                    if ("=" == this.type) return t;
                }, e.transformAgainst = function(e) {
                    if ("+" == this.type && "+" == e.type) {
                        var t = this.tlen + e.len;
                        if (this.pos < e.pos) return this.extend({
                            tlen: t
                        });
                        if (this.pos == e.pos && this.accessory < e.accessory) return this.extend({
                            tlen: t
                        });
                        if (e.pos <= this.pos) return this.extend({
                            tlen: t,
                            pos: this.pos + e.len
                        });
                    } else if ("+" == this.type && "-" == e.type) {
                        var t = this.tlen - e.len;
                        if (this.pos < e.pos) return this.extend({
                            tlen: t
                        });
                        if (this.pos == e.pos) return this.extend({
                            tlen: t
                        });
                        if (e.pos < this.pos) return this.extend({
                            tlen: t,
                            pos: Math.max(this.pos - e.len, e.pos)
                        });
                    } else if ("-" == this.type && "-" == e.type) {
                        var t = this.tlen - e.len;
                        if (this.pos < e.pos) {
                            var n = Math.min(e.pos - this.pos, this.len);
                            return this.extend({
                                tlen: t,
                                text: this.text.substr(0, n) + this.text.substr(n + e.len)
                            });
                        }
                        if (this.pos == e.pos) return this.len <= e.len ? i.op({
                            type: "="
                        }) : this.extend({
                            tlen: t,
                            text: this.text.substr(e.len)
                        });
                        if (e.pos < this.pos) {
                            var r = e.pos + e.len - this.pos;
                            return r >= this.len ? i.op({
                                type: "="
                            }) : r > 0 ? this.extend({
                                tlen: t,
                                pos: e.pos,
                                text: this.text.substr(r)
                            }) : this.extend({
                                tlen: t,
                                pos: this.pos - e.len
                            });
                        }
                    } else if ("-" == this.type && "+" == e.type) {
                        var t = this.tlen + e.len;
                        if (this.pos < e.pos) {
                            if (this.pos + this.len > e.pos) {
                                var o = e.pos - this.pos;
                                return [ this.extend({
                                    tlen: t,
                                    text: this.text.substr(0, o)
                                }), this.extend({
                                    tlen: t,
                                    pos: e.pos + e.len,
                                    text: this.text.substr(o)
                                }) ];
                            }
                            return this.extend({
                                tlen: t
                            });
                        }
                        if (this.pos == e.pos) return this.extend({
                            tlen: t,
                            pos: this.pos + e.len
                        });
                        if (e.pos < this.pos) return this.extend({
                            tlen: t,
                            pos: this.pos + e.len
                        });
                    }
                    return this;
                }, e;
            },
            cs: function(e) {
                return e = o.clone(e.map(function(e) {
                    return o.clone(e);
                })), e.toString = function() {
                    return this.map(function(e) {
                        return e.toString();
                    }).join(" ");
                }, e.push = function(t) {
                    t instanceof Array ? t.forEach(function(t) {
                        [].push.call(e, t);
                    }) : [].push.call(e, t);
                }, e.revision = function(t) {
                    return i.cs(e.map(function(e) {
                        return e.revision(t);
                    }));
                }, e.maxRevision = function() {
                    return Math.max(0, Math.max.apply(null, e.map(function(e) {
                        return e.accessory;
                    })));
                }, e.apply = function(e, t) {
                    return this.sequencify().forEach(function(n) {
                        e = n.apply(e, t);
                    }), e;
                }, e.transformAgainst = function(e) {
                    var t = i.cs([]), e = e.sequencify();
                    return this.forEach(function(n) {
                        e.forEach(function(e) {
                            n = n.transformAgainst(e);
                        }), t.push(n);
                    }), t;
                }, e.sequencify = function(e) {
                    var t = i.cs([]);
                    return this.forEach(function(e) {
                        "=" != e.type && (t.forEach(function(t) {
                            e = e.transformAgainst(t);
                        }), t.push(e));
                    }), t;
                }, e.pack = function() {
                    return this.filter(function(e) {
                        return "=" != e.type;
                    }).map(function(e) {
                        var t = e.text.replace(/%/g, "%25").replace(/:/g, "%3A"), n = e.pos.toString(36), r = e.tlen.toString(36), o = e.accessory.toString(36);
                        return e.type + n + ":" + r + ":" + t + ":" + o;
                    }).join("");
                }, e;
            },
            diff: function(e, t, n) {
                n = n || 0;
                var o = r(e, t), a = i.cs([]), s = e.length;
                return o.oldFragment && a.push(i.op({
                    type: "-",
                    tlen: s,
                    pos: o.from,
                    text: o.oldFragment,
                    accessory: n
                })), o.newFragment && a.push(i.op({
                    type: "+",
                    tlen: s,
                    pos: o.from,
                    text: o.newFragment,
                    accessory: n
                })), a;
            },
            unpack: function(e) {
                if ("" == e) return i.cs([]);
                var t = e.match(/(\+|-)\w+?:\w+?:[^:]+?:\w+/g);
                if (!t) throw new Error("Cannot unpack invalid serialized changeset string");
                return i.cs(t.map(function(e) {
                    var t = e.substr(1).split(":");
                    return i.op({
                        type: e.substr(0, 1),
                        pos: parseInt(t[0], 36),
                        tlen: parseInt(t[1], 36),
                        text: t[2].replace(/%3A/gi, ":").replace(/%25/g, "%"),
                        accessory: parseInt(t[3], 36)
                    });
                }));
            }
        };
        try {
            t.exports = i;
        } catch (a) {}
    }, {
        lodash: "lodash",
        textdiff: "textdiff"
    } ],
    3: [ function(e, t, n) {
        "use strict";
        function r(e, t, n) {
            return arguments.length < 2 ? i(e) : void o(e, t, n);
        }
        function o(e, t) {
            var n = arguments.length <= 2 || void 0 === arguments[2] ? {} : arguments[2], r = s(e) + "=" + s(t);
            null == t && (n.maxage = -1), n.maxage && (n.expires = new Date(+new Date() + n.maxage)), 
            n.path && (r += "; path=" + n.path), n.domain && (r += "; domain=" + n.domain), 
            n.expires && (r += "; expires=" + n.expires.toUTCString()), n.secure && (r += "; secure"), 
            document.cookie = r;
        }
        function i(e) {
            var t = a(document.cookie);
            return e ? t[e] : t;
        }
        function a(e) {
            var t = {}, n = e.split(/ *; */);
            if (!n[0]) return t;
            for (var r = n, o = Array.isArray(r), i = 0, r = o ? r : r[Symbol.iterator](); ;) {
                var a;
                if (o) {
                    if (i >= r.length) break;
                    a = r[i++];
                } else {
                    if (i = r.next(), i.done) break;
                    a = i.value;
                }
                var s = a;
                s = s.split("="), t[c(s[0])] = c(s[1]);
            }
            return t;
        }
        function s(e) {
            try {
                return encodeURIComponent(e);
            } catch (t) {
                return null;
            }
        }
        function c(e) {
            try {
                return decodeURIComponent(e);
            } catch (t) {
                return null;
            }
        }
        n.__esModule = !0, n["default"] = r;
    }, {} ],
    4: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return {
                type: "success",
                value: e
            };
        }
        function o(e) {
            return {
                type: "failure",
                error: e
            };
        }
        function i(e) {
            return e.then(r, o);
        }
        function a(e, t, n) {
            var r = n();
            return e > 0 ? r["catch"](function(r) {
                return new Promise(function(e, n) {
                    return setTimeout(e, t);
                }).then(function(r) {
                    return a(e - 1, t, n);
                });
            }) : r;
        }
        var s = this && this.__extends || function() {
            var e = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(e, t) {
                e.__proto__ = t;
            } || function(e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
            };
            return function(t, n) {
                function r() {
                    this.constructor = t;
                }
                e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, 
                new r());
            };
        }();
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("@grammarly-npm/cookie"), l = e("./util"), u = "gnar_containerId", d = "gnar_containerId_test", f = 12, p = function() {
            return new Date().setFullYear(new Date().getFullYear() + 10);
        }, m = function() {
            return new Date().setMinutes(new Date().getMinutes() + 10);
        }, h = /^\.\w+\.\w+/, g = function() {
            function e(e, t, n, r, o, i, a) {
                void 0 === t && (t = []), void 0 === o && (o = 3e5), void 0 === i && (i = 0), void 0 === a && (a = function() {
                    return Date.now();
                }), this.primaryStorage = e, this.secondaryStorages = t, this._logger = n, this._metric = r, 
                this._cacheSuccessTimeoutMillis = o, this._cacheFailureTimeoutMillis = i, this._getTime = a, 
                this._allStorages = [ e ].concat(t);
            }
            return e.prototype._expireCache = function(e) {
                0 === e ? this._cacheExpireTimestamp = 0 : e > 0 && (this._cacheExpireTimestamp = this._getTime() + e);
            }, e.prototype.getContainerId = function() {
                var e = this;
                if (void 0 !== this._cache && (void 0 === this._cacheExpireTimestamp || this._getTime() < this._cacheExpireTimestamp)) return this._cache;
                var t = this._metric.getTimer("doGetContainerId.timer").start(), n = this._doGetContainerId();
                return this._cache = n, this._cacheExpireTimestamp = void 0, n.then(function(t) {
                    return e._expireCache(e._cacheSuccessTimeoutMillis);
                }, function(t) {
                    return e._expireCache(e._cacheFailureTimeoutMillis);
                }), n.then(function(n) {
                    t.stop(), e._metric.getCounter("doGetContainerId.success").increment();
                }, function(n) {
                    t.stop(), e._metric.getCounter("doGetContainerId.failure").increment(), e._logger.warn("doGetContainerId.failed", n);
                }), n;
            }, e._generateContainerId = function() {
                return l.alphanumeric(f);
            }, e.prototype._doGetContainerId = function() {
                var t = this, n = Promise.all(this._allStorages.map(function(e) {
                    return i(e.safeGetContainerId());
                }));
                return n.then(function(n) {
                    var o = n[0];
                    if ("failure" === o.type) return Promise.reject("getting containerId from primary storage " + ("'" + t.primaryStorage.name + "' has failed: " + o.error));
                    var a, s = n.find(function(e) {
                        return "success" === e.type && void 0 !== e.value;
                    }), c = "success" === o.type && void 0 === o.value && void 0 !== s, l = !1;
                    void 0 === s ? (a = e._generateContainerId(), l = !0) : a = s.value;
                    var u = n.map(function(e, n) {
                        return "success" === e.type && e.value !== a ? i(t._allStorages[n].safeSetContainerId(a)) : Promise.resolve(r(void 0));
                    }), d = Promise.all(u).then(function(e) {
                        if (c || l) {
                            var t = e[0];
                            if ("success" !== t.type) return Promise.reject("setting containerId to primary storage has failed: " + t.error);
                        }
                        return Promise.resolve(a);
                    });
                    return d.then(function(e) {
                        c ? t._metric.getCounter("recovered").increment() : l && t._metric.getCounter("generated").increment();
                    }), d;
                });
            }, e;
        }();
        n.ContainerIdManager = g;
        var b = function() {
            function e(e) {
                this.name = e;
            }
            return e.prototype.safeSetContainerId = function(e) {
                var t = this;
                return this.ensureAvailable().then(function() {
                    return t.setContainerId(e);
                });
            }, e.prototype.safeGetContainerId = function() {
                var e = this;
                return this.ensureAvailable().then(function() {
                    return e.getContainerId();
                }).then(function(e) {
                    return "" === e ? void 0 : e;
                });
            }, e;
        }();
        n.BaseStorage = b;
        var v = function(e) {
            function t(t, n) {
                var r = e.call(this, "chromeCookie") || this;
                if (r._url = t, r._domain = n, !h.test(n)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
                return r;
            }
            return s(t, e), t.prototype._hasRuntimeError = function() {
                return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
            }, t.prototype.ensureAvailable = function() {
                var e = this;
                return a(2, 1e3, function() {
                    return new Promise(function(t, n) {
                        var r = l.alphanumeric(10);
                        try {
                            window.chrome.cookies.set({
                                name: r,
                                value: r,
                                url: e._url,
                                domain: e._domain,
                                expirationDate: m() / 1e3
                            }, function(o) {
                                var i = e._hasRuntimeError();
                                !o && i && n("chrome.cookie.set failed with an error: " + i.message), o && o.value === r ? t() : n(new Error("ChromeCookieStorage is unavailable.\n              Availability test failed.\n              Tried to set " + r + ", the result is " + (o ? o.value : o) + "."));
                            });
                        } catch (o) {
                            n(o);
                        }
                    });
                });
            }, t.prototype.getContainerId = function() {
                var e = this;
                return new Promise(function(t, n) {
                    try {
                        window.chrome.cookies.get({
                            url: e._url,
                            name: u
                        }, function(r) {
                            var o = e._hasRuntimeError();
                            !r && o && n("chrome.cookie.get failed with an error: " + o.message), t(r ? r.value : void 0);
                        });
                    } catch (r) {
                        n(r);
                    }
                });
            }, t.prototype.setContainerId = function(e) {
                var t = this;
                return new Promise(function(n, r) {
                    try {
                        window.chrome.cookies.set({
                            name: u,
                            value: e,
                            url: t._url,
                            domain: t._domain,
                            expirationDate: p() / 1e3
                        }, function(o) {
                            var i = t._hasRuntimeError();
                            !o && i && r("chrome.cookie.set failed with an error: " + i.message), o && o.value === e || r(new Error("setContainerId failed.\n            Tried to set " + e + ", the result is " + (o ? o.value : o) + ".")), 
                            n();
                        });
                    } catch (o) {
                        r(o);
                    }
                });
            }, t;
        }(b);
        n.ChromeCookieStorage = v;
        var _ = function(e) {
            function t(t, n) {
                var r = e.call(this, "webExtensionsCookie") || this;
                if (r._url = t, r._domain = n, !h.test(n)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
                return r;
            }
            return s(t, e), t.prototype.ensureAvailable = function() {
                var e = this;
                return a(2, 1e3, function() {
                    return new Promise(function(t, n) {
                        var r = l.alphanumeric(10);
                        window.browser.cookies.set({
                            name: r,
                            value: r,
                            url: e._url,
                            domain: e._domain,
                            expirationDate: m() / 1e3
                        }).then(function() {
                            window.browser.cookies.get({
                                url: e._url,
                                name: r
                            }).then(function(e) {
                                e && e.value === r ? t() : n(new Error("WebExtensionsCookieStorage is unavailable.\n              Availability test failed.\n              Tried to set " + r + ", the result is " + (e ? e.value : e) + "."));
                            })["catch"](function(e) {
                                n("browser.cookies.get failed with an error: " + e.message);
                            });
                        })["catch"](function(e) {
                            n("browser.cookies.set failed with an error: " + e.message);
                        });
                    });
                });
            }, t.prototype.getContainerId = function() {
                var e = this;
                return new Promise(function(t, n) {
                    window.browser.cookies.get({
                        url: e._url,
                        name: u
                    }).then(function(e) {
                        t(e ? e.value : void 0);
                    })["catch"](function(e) {
                        n("browser.cookies.get failed with an error: " + e.message);
                    });
                });
            }, t.prototype.setContainerId = function(e) {
                var t = this;
                return new Promise(function(n, r) {
                    window.browser.cookies.set({
                        name: u,
                        value: e,
                        url: t._url,
                        domain: t._domain,
                        expirationDate: p() / 1e3
                    }).then(function(t) {
                        t && t.value === e || r(new Error("setContainerId failed.\n          Tried to set " + e + ", the result is " + (t ? t.value : t) + ".")), 
                        n();
                    })["catch"](function(e) {
                        r("browser.cookies.set failed with an error: " + e.message);
                    });
                });
            }, t;
        }(b);
        n.WebExtensionsCookieStorage = _;
        var y = function(e) {
            function t() {
                return e.call(this, "localStorage") || this;
            }
            return s(t, e), t.prototype.ensureAvailable = function() {
                var e = l.alphanumeric(10);
                return new Promise(function(t, n) {
                    localStorage.setItem(d, e), localStorage.getItem(d) !== e ? n(new Error("LocalStorage is unavailable.\n          Availability test failed.\n          Tried to set " + e + ", the result is " + localStorage.getItem(d) + ".")) : t(), 
                    localStorage.removeItem(d);
                });
            }, t.prototype.getContainerId = function() {
                var e = localStorage.getItem(u);
                return new Promise(function(t, n) {
                    return t(null === e ? void 0 : e);
                });
            }, t.prototype.setContainerId = function(e) {
                return new Promise(function(t, n) {
                    localStorage.setItem(u, e), t();
                });
            }, t;
        }(b);
        n.LocalStorage = y;
        var w = function(e) {
            function t(t) {
                var n = e.call(this, "cookie") || this;
                if (n._domain = t, !h.test(t)) throw new Error('Incorrect cookie domain provided.\n        Use top-level domain, starting from "."');
                return n;
            }
            return s(t, e), t.prototype._getCookieOptions = function() {
                return {
                    path: "/",
                    domain: this._domain,
                    expires: new Date(p())
                };
            }, t.prototype.ensureAvailable = function() {
                var e = l.alphanumeric(10);
                return new Promise(function(t, n) {
                    c["default"](e, e), c["default"](e) !== e ? n(new Error("CookieStorage is unavailable.\n          Availability test failed.\n          Tried to set " + e + ", the result is " + c["default"](e) + ".")) : t(), 
                    c["default"](e, null);
                });
            }, t.prototype.getContainerId = function() {
                return new Promise(function(e, t) {
                    return e(c["default"](u));
                });
            }, t.prototype.setContainerId = function(e) {
                var t = this;
                return new Promise(function(n, r) {
                    c["default"](u, e, t._getCookieOptions()), n();
                });
            }, t;
        }(b);
        n.CookieStorage = w;
        var k = function(e) {
            function t(t, n) {
                var r = e.call(this, "backend") || this;
                return r._fetch = t, r._url = n, r._keyName = u, r._testKeyName = d, r._baseUrl = n + "/cookies", 
                r;
            }
            return s(t, e), t.prototype.ensureAvailable = function() {
                var e = this, t = l.alphanumeric(10), n = (m() - Date.now()) / 1e3, r = this._baseUrl + "?name=" + this._testKeyName, o = r + "&value=" + t + "&maxAge=" + n;
                return this._doSend(o, "post").then(function(e) {
                    if (!e.ok) throw new Error("BackendStorage is unavailable.\n          Availability test failed.\n          Tried to set " + t + ". Request failed.\n        ");
                }).then(function() {
                    return e._doSend(r, "get").then(function(n) {
                        if (n.ok) return n.json().then(function(n) {
                            if (n.value !== t) throw new Error("BackendStorage is unavailable.\n                Availability test failed.\n                Tried to get " + e._testKeyName + " from server.\n                Got " + n.value + " instead of " + t + ".");
                        });
                        throw new Error("BackendStorage is unavailable.\n            Availability test failed.\n            Tried to get " + e._testKeyName + " from server. Request failed.");
                    });
                });
            }, t.prototype._doSend = function(e, t) {
                return this._fetch(e, {
                    credentials: "include",
                    method: t
                });
            }, t.prototype.getContainerId = function() {
                var e = this._baseUrl + "?name=" + this._keyName;
                return this._doSend(e, "get").then(function(e) {
                    return e.json();
                }).then(function(e) {
                    return e.value;
                });
            }, t.prototype.setContainerId = function(e) {
                var t = (p() - Date.now()) / 1e3, n = this._baseUrl + "?name=" + this._keyName + "&value=" + e + "&maxAge=" + t;
                return this._doSend(n, "post").then(function() {});
            }, t;
        }(b);
        n.BackendStorage = k;
        var C = function(e) {
            function t(t) {
                void 0 === t && (t = void 0);
                var n = e.call(this, "memory") || this;
                return n._value = t, n;
            }
            return s(t, e), t.prototype.ensureAvailable = function() {
                return Promise.resolve();
            }, t.prototype.getContainerId = function() {
                return Promise.resolve(this._value);
            }, t.prototype.setContainerId = function(e) {
                return this._value = e, Promise.resolve();
            }, t;
        }(b);
        n.MemoryStorage = C;
    }, {
        "./util": 6,
        "@grammarly-npm/cookie": 3
    } ],
    5: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./util"), o = e("./container_id_manager");
        n.ContainerIdManager = o.ContainerIdManager, n.BaseStorage = o.BaseStorage, n.MemoryStorage = o.MemoryStorage, 
        n.LocalStorage = o.LocalStorage, n.CookieStorage = o.CookieStorage, n.ChromeCookieStorage = o.ChromeCookieStorage, 
        n.WebExtensionsCookieStorage = o.WebExtensionsCookieStorage, n.BackendStorage = o.BackendStorage;
        var i = [ "eventName", "client", "clientVersion", "userId", "isTest", "containerId", "instanceId", "batchId" ], a = "gnar_nextPingTimestamp", s = function() {
            function e(e, t, n, o, i, a, s, c) {
                void 0 === c && (c = !1), this._client = t, this._clientVersion = n, this._fetch = o, 
                this._containerIdManager = i, this._logger = a, this._metric = s, this._storePingTimestamp = c, 
                this._batchId = 0, this._instanceId = r.alphanumeric(8), this._isReady = !1, this._queue = [], 
                this._eventsUrl = e + "/events", this._pingMaybe();
            }
            return e.prototype.track = function(e, t) {
                if (void 0 === t && (t = {}), 0 === e.indexOf(this._client + "/")) throw new Error("Event name " + e + " should not start with '" + this._client + "/'");
                Object.keys(t).forEach(function(e) {
                    if (i.indexOf(e) !== -1) throw new Error("Event data should not contain '" + e + "' prop.");
                }), this._isReady ? ("ping" !== e && this._pingMaybe(), this._send(e, t)) : this._enqueue(e, t);
            }, e.prototype.setUser = function(e, t) {
                if (null === e || "" === e) throw new Error("Invalid userId: " + e);
                var n = this._userId && this._userId !== e && !(/^-/.test(e) && /^-/.test(this._userId));
                this._isTest = t, this._userId = e, n && this._pingMaybe(!0), this._isReady || (this._execQueue(), 
                this._isReady = !0);
            }, e.prototype.getContainerId = function() {
                return this._containerIdManager.getContainerId();
            }, e.prototype._setNextPingTimestamp = function() {
                var e = r.getNextPingDate();
                if (this._nextPingTimestamp = e, this._storePingTimestamp) try {
                    localStorage.setItem(a, e.toString());
                } catch (t) {
                    this._metric.getCounter("nextPingDate.write.failure").increment(), this._logger.warn("nextPingDate.write.failed", t);
                }
            }, e.prototype._getNextPingTimestamp = function() {
                var e = this._nextPingTimestamp;
                if (void 0 !== e || !this._storePingTimestamp) return e;
                try {
                    var t = localStorage.getItem(a);
                    e = null === t ? void 0 : parseInt(t, 10);
                } catch (n) {
                    e = void 0, this._metric.getCounter("nextPingDate.read.failure").increment(), this._logger.warn("nextPingDate.read.failed", n);
                }
                return e;
            }, e.prototype._shouldPing = function(e) {
                if (e) return !0;
                var t = this._getNextPingTimestamp();
                return void 0 === t || t < Date.now();
            }, e.prototype._pingMaybe = function(e) {
                if (void 0 === e && (e = !1), this._shouldPing(e)) {
                    this._setNextPingTimestamp();
                    var t = {
                        referrer: document.referrer,
                        url: document.location.href,
                        userAgent: navigator.userAgent,
                        navigatorAppName: navigator.appName,
                        navigatorAppCodeName: navigator.appCodeName,
                        navigatorAppVersion: navigator.appVersion,
                        navigatorVendor: navigator.vendor,
                        screenWidth: screen.width,
                        screenHeight: screen.height
                    };
                    this.track("ping", t);
                }
            }, e.prototype.pingMaybe = function() {
                this._pingMaybe();
            }, e.prototype._enqueue = function(e, t) {
                this._queue.push([ e, t ]);
            }, e.prototype._execQueue = function() {
                var e = this;
                this._queue.forEach(function(t) {
                    var n = t[0], r = t[1];
                    return e._send(n, r);
                }), this._queue = [];
            }, e.prototype._send = function(e, t) {
                var n = this, r = this._batchId++;
                this.getContainerId().then(function(o) {
                    var i = {
                        eventName: n._client + "/" + e,
                        client: n._client,
                        clientVersion: n._clientVersion,
                        userId: n._userId,
                        isTest: n._isTest,
                        containerId: o,
                        instanceId: n._instanceId,
                        batchId: r
                    };
                    return n._doSend(i, t);
                })["catch"](function(e) {
                    n._metric.getCounter("send.failure").increment(), n._logger.warn("send.failed", e);
                });
            }, e.prototype._doSend = function(e, t) {
                return this._fetch(this._eventsUrl, {
                    mode: "cors",
                    credentials: "include",
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        events: [ Object.assign(e, t) ]
                    })
                });
            }, e;
        }();
        n.GnarClientImpl = s;
        var c = function() {
            function e() {
                this.history = [];
            }
            return e.prototype.track = function(e, t) {
                void 0 === t && (t = {}), this.history.push({
                    eventName: e,
                    props: t
                });
            }, e.prototype.pingMaybe = function() {}, e.prototype.setUser = function(e, t) {}, 
            e.prototype.getContainerId = function() {
                return Promise.resolve("dummy_container_id");
            }, e;
        }();
        n.MemoryGnarClient = c;
        var l = function() {
            function e() {}
            return e.prototype.track = function(e, t) {
                void 0 === t && (t = {});
                var n = "trackingGnar";
                try {
                    var r = JSON.parse(localStorage.getItem(n)) || [];
                    r.push({
                        eventName: e,
                        props: t
                    }), localStorage.setItem(n, JSON.stringify(r));
                } catch (o) {}
            }, e.prototype.pingMaybe = function() {}, e.prototype.setUser = function(e, t) {}, 
            e.prototype.getContainerId = function() {
                return Promise.resolve("dummy_container_id");
            }, e;
        }();
        n.LocalStorageGnarClient = l;
    }, {
        "./container_id_manager": 4,
        "./util": 6
    } ],
    6: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            if (void 0 === t && (t = ""), e <= 0) return t;
            var n = Math.floor(Math.random() * (i.length - 1));
            return r(e - 1, t + i.charAt(n));
        }
        function o() {
            var e = new Date();
            return e.getHours() > 2 && e.setDate(e.getDate() + 1), e.setHours(3), e.setMinutes(Math.floor(60 * Math.random())), 
            e.getTime();
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        n.alphanumeric = r, n.getNextPingDate = o;
    }, {} ],
    7: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./ring_buffer"), o = function() {
            function e(e, t, n, o) {
                var i = this;
                this._eventsSink = n, this._crashLogger = o, this._crashLogged = !1, this.sink = function(e) {
                    i._buffer.push(e), i._eventsSink(e), i._trigger(e) && i._sendCrashLog(e);
                }, this._buffer = new r.RingBuffer(e, (!0)), this._trigger = "function" == typeof t ? t : function(e) {
                    return e.level >= t;
                };
            }
            return e.prototype._sendCrashLog = function(e) {
                if (!this._crashLogged || this._buffer.size > this._buffer.capacity / 2) {
                    var t = void 0;
                    try {
                        t = JSON.stringify(this._buffer, void 0, "");
                    } catch (n) {
                        t = n;
                    }
                    this._crashLogger.log(e.level, "CrashLog", {
                        events: t,
                        first: !this._crashLogged
                    }), this._crashLogged = !0, this._buffer.clear();
                }
            }, e;
        }();
        n.CrashLogWrapper = o;
    }, {
        "./ring_buffer": 11
    } ],
    8: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./log4ts");
        n.Logging = r;
        var o = e("./log4ts_impl");
        n.LoggingImpl = o;
        var i = e("./timeseries");
        n.TimeSeries = i;
        var a = e("./timeseries_impl");
        n.TimeSeriesImpl = a;
        var s = e("./utils");
        n.EventProps = s.EventProps;
        var c;
        !function(e) {
            var t = function() {
                function e() {}
                return Object.defineProperty(e, "root", {
                    get: function() {
                        return o.LoggingConfig.getRootLogger();
                    },
                    enumerable: !0,
                    configurable: !0
                }), e.getLogger = function(t, n) {
                    return e.root.getLogger(t, n);
                }, e;
            }();
            e.Logging = t;
            var n = function() {
                function e() {}
                return Object.defineProperty(e, "root", {
                    get: function() {
                        return a.MetricsConfig.getRootMetric();
                    },
                    enumerable: !0,
                    configurable: !0
                }), e;
            }();
            e.TimeSeries = n;
        }(c = n.Monitoring || (n.Monitoring = {}));
    }, {
        "./log4ts": 9,
        "./log4ts_impl": 10,
        "./timeseries": 12,
        "./timeseries_impl": 13,
        "./utils": 14
    } ],
    9: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r;
        !function(e) {
            e[e.TRACE = 0] = "TRACE", e[e.DEBUG = 1] = "DEBUG", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", 
            e[e.ERROR = 4] = "ERROR", e[e.FATAL = 5] = "FATAL", e[e.OFF = 6] = "OFF";
        }(r = n.LogLevel || (n.LogLevel = {})), function(e) {
            function t(t) {
                switch (t) {
                  case "TRACE":
                    return e.TRACE;

                  case "DEBUG":
                    return e.DEBUG;

                  case "INFO":
                    return e.INFO;

                  case "WARN":
                    return e.WARN;

                  case "ERROR":
                    return e.ERROR;

                  case "FATAL":
                    return e.FATAL;

                  case "OFF":
                    return e.OFF;

                  default:
                    ;
                    throw new TypeError("Unrecognized log level string '" + t + "'");
                }
            }
            e.fromString = t;
        }(r = n.LogLevel || (n.LogLevel = {}));
    }, {} ],
    10: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("tslib"), o = e("./utils"), i = e("./log4ts"), a = e("./utils"), s = e("./crash_logger"), c = e("./ring_buffer"), l = function() {
            function e(e) {
                this.parent = e, this.context = void 0;
            }
            return e.prototype.get = function() {
                var e = this.parent && this.parent.get(), t = this.context;
                return e || t ? Object.assign({}, e, t) : void 0;
            }, e.prototype.add = function(e) {
                this.context = Object.assign({}, this.context, e);
            }, e.prototype.remove = function(e) {
                var t = this;
                this.context && e.forEach(function(e) {
                    e in t.context && delete t.context[e];
                });
            }, e.prototype.clear = function() {
                this.context = void 0;
            }, e;
        }();
        n.TreeContext = l;
        var u = function() {
            function e(e, t, n) {
                this.name = e, this.level = t, this.context = n, o.validateName(e);
            }
            return e.prototype.isEnabled = function(e) {
                return e >= this.level;
            }, e.prototype.handler = function(e, t) {
                var n = this;
                return {
                    trace: function(r) {
                        throw n.trace(e, r, t), r;
                    },
                    debug: function(r) {
                        throw n.debug(e, r, t), r;
                    },
                    info: function(r) {
                        throw n.info(e, r, t), r;
                    },
                    warn: function(r) {
                        throw n.warn(e, r, t), r;
                    },
                    error: function(r) {
                        throw n.error(e, r, t), r;
                    },
                    fatal: function(r) {
                        throw n.fatal(e, r, t), r;
                    }
                };
            }, e.prototype.trace = function(e, t, n) {
                this.log(i.LogLevel.TRACE, e, t, n);
            }, e.prototype.debug = function(e, t, n) {
                this.log(i.LogLevel.DEBUG, e, t, n);
            }, e.prototype.info = function(e, t, n) {
                this.log(i.LogLevel.INFO, e, t, n);
            }, e.prototype.warn = function(e, t, n) {
                this.log(i.LogLevel.WARN, e, t, n);
            }, e.prototype.error = function(e, t, n) {
                this.log(i.LogLevel.ERROR, e, t, n);
            }, e.prototype.fatal = function(e, t, n) {
                this.log(i.LogLevel.FATAL, e, t, n);
            }, e.prototype.log = function(e, t, n, r) {
                this.isEnabled(e) && (n && r || a.ErrorLike.isErrorLike(n) ? this.logImpl(e, t, n, r) : this.logImpl(e, t, void 0, r || n));
            }, e;
        }();
        n.AbstractLogger = u;
        var d = function() {
            function e(e, t, n, r, o, i, a) {
                this.level = e, this.message = t, this.logger = n, this.timestamp = r, this.exception = o, 
                this.extra = i, this.context = a;
            }
            return e;
        }();
        n.LogEvent = d;
        var f = function(e) {
            function t(t, n, r, o) {
                var i = e.call(this, t, n, o || new l()) || this;
                return i.appender = r, i;
            }
            return r.__extends(t, e), t.prototype.getLogger = function(e, n) {
                return new t(this.name + "." + e, n || this.level, this.appender, new l(this.context));
            }, t.prototype.logImpl = function(e, t, n, r) {
                var o = new d(e, t, this.name, Date.now(), n, r, this.context.get());
                try {
                    this.appender(o);
                } catch (n) {
                    console.error("Failed processing log event", n);
                    try {
                        p.printToConsole(o);
                    } catch (i) {
                        console.error("No luck. Can't print the event", i);
                    }
                }
            }, t;
        }(u);
        n.SimpleLogger = f;
        var p = function(e) {
            function t(n, r, o) {
                return e.call(this, n, r, t.printToConsole, o) || this;
            }
            return r.__extends(t, e), t.printToConsole = function(e) {
                var t = console.log;
                t = e.level <= i.LogLevel.TRACE ? console.trace || console.log : e.level <= i.LogLevel.DEBUG ? console.debug || console.log : e.level <= i.LogLevel.INFO ? console.log : e.level <= i.LogLevel.WARN ? console.warn : console.error, 
                t.apply(console, [ "[" + e.logger + "]: " + i.LogLevel[e.level] + " : " + e.message, e.exception, e.extra ].filter(function(e) {
                    return !!e;
                }));
            }, t;
        }(f);
        n.ConsoleLogger = p;
        var m = function() {
            function e() {}
            return e.createRootLogger = function(t, n, r, o, a) {
                void 0 === a && (a = !1);
                var c = function(t) {
                    t.level >= n && (a && p.printToConsole(t), r.append(t)["catch"](e._onError));
                }, u = new l(), d = c;
                if (o) {
                    var m = new f(t + ".crashLogs", i.LogLevel.TRACE, function(t) {
                        o.append(t)["catch"](e._onError);
                    }, new l(u)), h = new s.CrashLogWrapper(500, i.LogLevel.ERROR, c, m);
                    d = h.sink;
                }
                return new f(t, n, d, u);
            }, e;
        }();
        m._onError = function(e) {
            return p.printToConsole(new d(i.LogLevel.WARN, "Error while logging message to the server.", "Fallback", 0, (void 0), e));
        }, n.DefaultLogAppender = m;
        var h = function() {
            function e(e) {
                var t = this;
                this.event = e, this.promise = new Promise(function(e, n) {
                    t.resolve = e;
                }).then(function() {});
            }
            return e;
        }(), g = 300, b = 1e4, v = function() {
            function e(e, t, n) {
                void 0 === t && (t = g), void 0 === n && (n = b), this._sink = e, this._retryInterval = n, 
                this._currentItem = null, this._skippedCounter = null, this._buffer = new c.RingBuffer(t, (!1));
            }
            return e.prototype.append = function(e) {
                if (this._buffer.isFull) return this._incSkippedCounter(), Promise.reject(new Error("Outgoing message buffer is full"));
                var t = new h(e);
                return this._buffer.push(t), this._doAppend(), t.promise;
            }, e.prototype._incSkippedCounter = function() {
                this._skippedCounter || (this._skippedCounter = new d(i.LogLevel.WARN, "Messages was skipped due to buffer overflow", "log4ts_impl.LogQueue", Date.now(), (void 0), {
                    count: 0
                })), this._skippedCounter.extra.count++;
            }, e.prototype._doAppend = function() {
                var e = this;
                if (!this._buffer.isEmpty && !this._currentItem) {
                    var t = this._buffer.first, n = this._sink.append(t.event);
                    this._currentItem = t, n.then(function() {
                        t.resolve();
                        var n = e._buffer.pop();
                        if (n !== t && n === e._currentItem) throw new Error("Illegal state");
                        e._currentItem = null, e._skippedCounter && (e.append(e._skippedCounter), e._skippedCounter = null), 
                        e._doAppend();
                    })["catch"](function(n) {
                        e._retryAppend(t);
                    });
                }
            }, e.prototype._retryAppend = function(e) {
                var t = this;
                setTimeout(function() {
                    var n = e.event.extra || {};
                    n.appendRetries || (n = e.event.extra = Object.assign({
                        appendRetries: 1
                    }, n)), ++n.appendRetries, t._currentItem = null, t._doAppend();
                }, this._retryInterval);
            }, e;
        }();
        n.LogQueue = v;
        var _ = function() {
            function e() {}
            return e.prototype.append = function(e) {
                return Promise.resolve();
            }, e;
        }();
        n.DummyFelogClient = _;
        var y = function() {
            function e(e, t, n, r) {
                this._appName = e, this._appVersion = t, this._env = n, this._fetch = r;
            }
            return e.prototype.append = function(e) {
                return this._fetch(this._prepareData(e));
            }, e.prototype._toObject = function(e) {
                return void 0 === e || null === e || e instanceof Object && !Array.isArray(e) ? e : {
                    extra: e
                };
            }, e.prototype._parseException = function(e) {
                if (e) {
                    var t = this._toObject(e), n = t.name, o = void 0 === n ? "UnknownError" : n, i = t.message, a = void 0 === i ? "Unknown error message" : i, s = t.stack, c = r.__rest(t, [ "name", "message", "stack" ]);
                    return {
                        exceptionPart: {
                            exception: {
                                name: o,
                                message: a,
                                stack: s
                            }
                        },
                        exceptionDetailsPart: Object.keys(c).length > 0 ? {
                            exceptionDetails: c
                        } : {}
                    };
                }
                return {
                    exceptionPart: {},
                    exceptionDetailsPart: {}
                };
            }, e.prototype._prepareData = function(e) {
                var t = e.context ? {
                    context: e.context
                } : {}, n = this._parseException(e.exception), r = n.exceptionPart, o = n.exceptionDetailsPart, a = JSON.stringify(Object.assign({}, o, this._toObject(e.extra))), s = Object.assign({
                    message: e.message,
                    logger: e.logger,
                    level: i.LogLevel[e.level],
                    application: this._appName,
                    version: this._appVersion,
                    env: this._env
                }, t, r, "{}" !== a && {
                    details: a
                });
                return JSON.stringify(s, null, "");
            }, e;
        }();
        n.FelogClientBase = y;
        var w = function(e) {
            function t(t, n, r, o, i) {
                return e.call(this, n, r, o, function(e) {
                    return i(t, {
                        method: "POST",
                        cache: "no-cache",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: e
                    }).then(function() {});
                }) || this;
            }
            return r.__extends(t, e), t;
        }(y);
        n.PostFelogClient = w;
        var k = function(e) {
            function t(t, n, r, o, i) {
                var a = this, s = t + "/log?json=";
                return a = e.call(this, n, r, o, function(e) {
                    return i(s + encodeURIComponent(e), {
                        mode: "no-cors",
                        method: "get",
                        cache: "no-cache"
                    }).then(function() {});
                }) || this;
            }
            return r.__extends(t, e), t;
        }(y);
        n.GetFelogClient = k;
        var C = function() {
            function e() {}
            return e.getRootLogger = function() {
                return e._rootLogger || (e._rootLogger = e._createDefaultRootLogger(), e._rootLogger.warn("Using DEFAULT root logger")), 
                e._rootLogger;
            }, e.configure = function(t) {
                e._rootLogger = t, e._rootLogger.debug("ROOT logger changed", t);
            }, e._createDefaultRootLogger = function() {
                return new p("DEFAULT", i.LogLevel.DEBUG);
            }, e;
        }();
        n.LoggingConfig = C;
    }, {
        "./crash_logger": 7,
        "./log4ts": 9,
        "./ring_buffer": 11,
        "./utils": 14,
        tslib: "tslib"
    } ],
    11: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = function() {
            function e(e, t) {
                if (void 0 === t && (t = !1), this.capacity = e, this.allowOverflow = t, this._start = 0, 
                this._end = 0, this._isFull = !1, this.toJSON = this.toArray, e <= 0) throw new Error("Invalid capacity " + e);
                this._buffer = new Array(e);
            }
            return Object.defineProperty(e.prototype, "size", {
                get: function() {
                    return this._isFull ? this._buffer.length : (this._end - this._start + this._buffer.length) % this._buffer.length;
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(e.prototype, "isEmpty", {
                get: function() {
                    return 0 === this.size;
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(e.prototype, "isFull", {
                get: function() {
                    return this._isFull;
                },
                enumerable: !0,
                configurable: !0
            }), e.prototype.push = function(e) {
                if (this.isFull) {
                    if (!this.allowOverflow) throw new Error("Buffer is full");
                    ++this._start, this._start === this.capacity && (this._start = 0);
                }
                this._buffer[this._end++] = e, this._end === this.capacity && (this._end = 0), this._start === this._end && (this._isFull = !0);
            }, e.prototype.pop = function() {
                if (!this.isEmpty) {
                    var e = this._buffer[this._start];
                    return this._buffer[this._start] = void 0, this._start++, this._start === this.capacity && (this._start = 0), 
                    this._isFull = !1, e;
                }
            }, Object.defineProperty(e.prototype, "first", {
                get: function() {
                    return this.isEmpty ? void 0 : this._buffer[this._start];
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(e.prototype, "last", {
                get: function() {
                    return this.isEmpty ? void 0 : this._buffer[0 === this._end ? this.capacity - 1 : this._end - 1];
                },
                enumerable: !0,
                configurable: !0
            }), e.prototype.clear = function() {
                this._buffer = new Array(this.capacity), this._start = this._end = 0, this._isFull = !1;
            }, e.prototype.toArray = function() {
                var e;
                if (this.isEmpty) e = new Array(0); else if (this._start < this._end) e = this._buffer.slice(this._start, this._end); else {
                    e = new Array(this.size);
                    for (var t = 0, n = this._start; n < this.capacity; ++n, ++t) e[t] = this._buffer[n];
                    for (var n = 0; n < this._end; ++n, ++t) e[t] = this._buffer[n];
                }
                return e;
            }, e;
        }();
        n.RingBuffer = r;
    }, {} ],
    12: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
    }, {} ],
    13: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("tslib"), o = e("./utils"), i = function() {
            function e(e, t, n) {
                this.name = e, this.timersSink = t, this.countersSink = n, o.validateName(e);
            }
            return e.prototype.getMetric = function(e) {
                return this._createChild(e);
            }, e.prototype.getTimer = function(e) {
                return this._createChild(e);
            }, e.prototype.getCounter = function(e) {
                return this._createChild(e);
            }, Object.defineProperty(e.prototype, "parent", {
                get: function() {
                    var t = this.name.lastIndexOf("."), n = this.name.substring(0, t === -1 ? 0 : t);
                    return "" === n ? void 0 : new e(n, this.timersSink, this.countersSink);
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(e.prototype, "root", {
                get: function() {
                    var t = this.name.indexOf("."), n = this.name.substring(0, t === -1 ? 0 : t);
                    return "" === n ? this : new e(n, this.timersSink, this.countersSink);
                },
                enumerable: !0,
                configurable: !0
            }), e.prototype._createName = function(e) {
                return this.name + "." + e;
            }, e.prototype.start = function() {
                var e = Date.now(), t = this;
                return {
                    stop: function() {
                        t.recordTime(Date.now() - e);
                    }
                };
            }, e.prototype.recordTime = function(e) {
                this.timersSink(this.name, e);
            }, e.prototype.timing = function(e) {
                var t = this.start();
                try {
                    return e();
                } finally {
                    try {
                        t.stop();
                    } catch (n) {}
                }
            }, e.prototype.increment = function(e) {
                void 0 === e && (e = 1), this.countersSink(this.name, e);
            }, e.prototype.decrement = function(e) {
                void 0 === e && (e = 1), this.increment(-e);
            }, e.prototype._createChild = function(t) {
                return new e(this._createName(t), this.timersSink, this.countersSink);
            }, e;
        }();
        n.AbstractMetricsStorage = i;
        var a = function(e) {
            function t(t) {
                return e.call(this, "MP", function(e, n) {
                    return t("TIMER: " + e + " = " + n);
                }, function(e, n) {
                    return t("COUNTER: " + e + " = " + n);
                }) || this;
            }
            return r.__extends(t, e), t;
        }(i);
        n.MetricsPrinter = a;
        var s = 7500, c = 3, l = function(e) {
            function t(t, n, r, o) {
                void 0 === o && (o = s);
                var i = e.call(this, t, function(e, t) {
                    return i._reportTimer(e, t);
                }, function(e, t) {
                    return i._reportCounter(e, t);
                }) || this;
                return i._fetch = r, i._sendTimeout = o, i._countersBuffer = {}, i._timersBuffer = new Array(), 
                i._sendTimer = void 0, i._sendData = function() {
                    var e = [ i._timersBuffer.join("&"), Object.keys(i._countersBuffer).map(function(e) {
                        return e + "=" + i._countersBuffer[e];
                    }).join("&") ].filter(function(e) {
                        return e.length;
                    }).join("&"), t = i._baseUrl + e;
                    i._timersBuffer.length = 0, i._countersBuffer = {}, i._sendTimer = void 0;
                    var n = 0, r = function() {
                        i._fetch(t, {
                            mode: "no-cors",
                            cache: "no-cache"
                        })["catch"](function(e) {
                            n++ < c ? setTimeout(r, 5e3 * n) : console.error("Cannot send timesereies data", e, t);
                        });
                    };
                    r();
                }, i._baseUrl = n + "/ts?", i;
            }
            return r.__extends(t, e), t.createRoot = function(e, n, r) {
                return new t(e, n, r);
            }, t.prototype._reportTimer = function(e, t) {
                this._timersBuffer.push("t." + e + "=" + t), this._startSending();
            }, t.prototype._reportCounter = function(e, t) {
                var n = "c." + e;
                this._countersBuffer[n] = (this._countersBuffer[n] || 0) + t, this._startSending();
            }, t.prototype._startSending = function() {
                this._sendTimer || (this._sendTimer = setTimeout(this._sendData, this._sendTimeout));
            }, t;
        }(i);
        n.MetricsStorage = l;
        var u = function() {
            function e() {}
            return e.getRootMetric = function() {
                return e._metricsRoot || (console.warn("[WARNING] Using default timeseries implementation."), 
                e._metricsRoot = new a(console.log)), e._metricsRoot;
            }, e.configure = function(t) {
                e._metricsRoot = t;
            }, e;
        }();
        n.MetricsConfig = u;
    }, {
        "./utils": 14,
        tslib: "tslib"
    } ],
    14: [ function(e, t, n) {
        "use strict";
        function r(e) {
            if ("" === e) throw new Error("Empty name");
            if (!a.test(e)) throw new Error("Invalid name: " + e + ". Should be hierarchical dot separated string and may contain only word characters)");
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o;
        !function(e) {
            function t(e) {
                var t = e;
                return t && (void 0 !== t.message && void 0 !== t.name || void 0 !== t.stack);
            }
            e.isErrorLike = t;
        }(o = n.ErrorLike || (n.ErrorLike = {}));
        var i;
        !function(e) {
            function t(e) {
                return n(e, [ e ], o.isErrorLike(e));
            }
            function n(e, t, r) {
                if (!e) return {};
                var i = {}, a = r ? Object.getOwnPropertyNames : Object.keys;
                return a(e).forEach(function(r) {
                    var a = e[r];
                    if (null === a || void 0 === a || "number" == typeof a || "string" == typeof a || "boolean" == typeof a) i[r] = a; else if ("object" == typeof a) if (a instanceof Boolean || a instanceof Number || a instanceof String || a instanceof Date || a instanceof RegExp) i[r] = a.toString(); else if (t.indexOf(a) === -1) {
                        t.push(a);
                        var s = n(a, t, o.isErrorLike(a));
                        Object.keys(s).length > 0 && (i[r] = s);
                    }
                }), i;
            }
            e.fromAny = t;
        }(i = n.EventProps || (n.EventProps = {}));
        var a = /^(?!\.[\w])[\w.]*\w$/;
        n.validateName = r;
    }, {} ],
    15: [ function(e, t, n) {
        !function() {
            function e(e, t) {
                var r = n(e, t);
                return void 0 == r.from ? {
                    s: -1,
                    delta: 0
                } : {
                    s: r.from,
                    delta: r.newFragment.length - r.oldFragment.length
                };
            }
            function n(e, t) {
                if (e === t) return {};
                var n = e.length, a = t.length;
                if (i("oldLength: " + n + ". newLength: " + a), a > n) {
                    if (t.substr(0, n) === e) return i("some characters was added to the end"), {
                        from: n,
                        to: n,
                        oldFragment: "",
                        newFragment: t.substr(n)
                    };
                    if (t.substr(a - n) === e) return i("some characters was added to the start"), {
                        from: 0,
                        to: 0,
                        oldFragment: "",
                        newFragment: t.substr(0, a - n)
                    };
                }
                if (a < n) {
                    if (e.substr(n - a) === t) return i("some characters was removed from the end"), 
                    {
                        from: 0,
                        to: n - a,
                        oldFragment: e.substr(0, n - a),
                        newFragment: ""
                    };
                    if (e.substr(0, a) === t) return i("some characters was removed from the start"), 
                    {
                        from: a,
                        to: n,
                        oldFragment: e.substr(a),
                        newFragment: ""
                    };
                }
                var s = a < n ? a : n, c = r(e, t, s), l = o(e, t, n, a, s);
                return i("front: " + c), i("back: " + l), c + l > n && (l -= c + l - n), c + l > a && (l -= c + l - a), 
                {
                    from: c,
                    to: n - l,
                    oldFragment: e.substr(c, n - l - c),
                    newFragment: t.substr(c, a - l - c)
                };
            }
            function r(e, t, n) {
                for (var r = 0; e[r] === t[r] && r < n; ) r += 1;
                return r;
            }
            function o(e, t, n, r, o) {
                for (var i = 0; e[n - i - 1] === t[r - i - 1] && o - i >= 0; ) i += 1;
                return i;
            }
            function i() {}
            "undefined" == typeof t && (window.diffPos = e, window.textdiff = n);
            try {
                t.exports = {
                    diffPos: e,
                    textdiff: n
                };
            } catch (a) {}
        }();
    }, {} ],
    16: [ function(e, t, n) {
        try {
            t.exports = e("./lib/textdiff");
        } catch (r) {}
    }, {
        "./lib/textdiff": 15
    } ],
    17: [ function(e, t, n) {
        var r = {}, o = e("lodash"), i = e("emitter");
        r.Util = e("./util"), r.HtmlDom = e("./html-dom"), r.HtmlTypingLimiter = e("./html-typing-limiter"), 
        r.InputListener = e("./input-listener"), r.Matches = e("./matches"), r.MatchUpdater = e("./match-updater"), 
        r.TextareaDom = e("./textarea-dom"), r.TextSplit = e("./text-split"), r.Wrap = e("wrap"), 
        r.Editor = function(e) {
            function t() {
                ye.start(), he.start(), e.value && u(e.value), te.update(ae.currentText), g();
            }
            function n(e) {
                var t = e.length > re;
                ge = t ? be : _e, ie = t;
            }
            function a(e) {
                te.update(e), te.updateMatchesToCurrentRevision(ae.matches.get());
            }
            function s(e) {
                return he.getText(e);
            }
            function c() {
                return ae.currentText;
            }
            function l() {
                ae.currentText = s(!0), ae.emit("afterReplace");
            }
            function u(e) {
                fe.get().forEach(function(e) {
                    e.inDom = !1;
                }), a(e), fe.update(ae.currentText, e), he.setText(e), ae.isHtmlGhost ? setTimeout(l, 100) : l();
            }
            function d(e) {
                return he.setCursor(e);
            }
            function f() {
                return he.getCursor();
            }
            function p() {
                ae.latestCursor = f(Z);
            }
            function m() {
                d(ae.latestCursor);
            }
            function h(e) {
                ye.skipInputEvents(e);
            }
            function g() {
                te.send();
            }
            function b(e) {
                ue = Date.now(), 32 == e.originalEvent.charCode && de && P();
            }
            function v(e) {
                me || w(e, !0), g(), ae.emit("change", e);
            }
            function _() {
                return me ? ae.el.value : ae.el.innerHTML;
            }
            function y() {
                if (ae._currentText != _()) {
                    ae._currentText = _();
                    var e = s();
                    n(e);
                    var t = {
                        text: e
                    };
                    if (ae.emit("beforeUpdate", t), t.cancel) return y();
                    a(e), fe.update(ae.currentText, e), ae.currentText = e;
                }
            }
            function w(e, t) {
                var n = !1;
                if (!me) {
                    var o = le(ee);
                    n = o.anchorNode && r.Util.hasClass(o.anchorNode.parentNode, "gr_");
                }
                (me || t || n || ae.isHtmlGhost) && (x(), p(), ae.emit("input", e));
            }
            function k() {
                he.changeSelection();
            }
            function C(e) {
                var t = ae.matches.byId(e);
                t && ae.selectedMatch && ae.selectedMatch != t && ae.selectedMatch.deselect(), t && t.select();
            }
            function x() {
                y();
                var e = R();
                he.render(e, ae.currentText), ae.emit("saveDoc", ae.currentText);
            }
            function E(e) {
                ae.sid = e.sid, ae.emit("saveSid", ae.sid);
            }
            function S(e) {
                e._s = e._s || e.s, e._e = e._e || e.e, e.sd = e._s - e.s, e.ed = e._e - e.e;
            }
            function T(e) {
                ie ? (pe.push(e), oe || N()) : A(e), ae.emit("tracking", {
                    event: "matchFound",
                    matches: e
                });
            }
            function N() {
                oe = setTimeout(function() {
                    pe.length && Date.now() - ue > ne && P(), pe.length ? N() : oe = !1;
                }, 50);
            }
            function P() {
                if (ye.isUserTyping()) return clearTimeout(we), void (we = setTimeout(P, 200));
                if (clearTimeout(we), pe.length) {
                    var e = pe.shift();
                    e ? A(e) : P();
                }
            }
            function A(e, t) {
                var n = s();
                if (ae.currentText = n, te.update(n), te.updateMatch(e), ae._removedByServer.indexOf(e.id) > -1) return console.log("skip because it is removed by server");
                if (void 0 == ae.processMatch(e, n)) {
                    var r = ae.tryToAdd(e, n);
                    r && (O(e), t ? x() : ge());
                }
            }
            function j(e) {
                if (e && pe.length) {
                    var t = e.match, n = e.position;
                    pe[n] && (pe[n].id = t.id) && (pe[n] = !1, A(t, !0));
                }
            }
            function I(e, t, n) {
                return fe.tryToAdd(e, t, n);
            }
            function L(e) {
                if (e && 0 != e.length) {
                    for (var t = s(), n = 0; n < e.length; n++) {
                        var r = e[n];
                        r.v == t.substring(r.s, r.e) && (r.rendered = !1, O(r), fe.add(r));
                    }
                    he.invalidate(!0), x();
                }
            }
            function M() {
                return fe.get();
            }
            function R() {
                return ae.matchFilter(M());
            }
            function O(e) {
                var t = r.Util.guid(), n = Date.now();
                o.extend(e, {
                    uid: t,
                    ts: n,
                    replace: D.bind(e),
                    undo: F.bind(e),
                    addToDict: B.bind(e),
                    acknowledged: W.bind(e),
                    ignore: U.bind(e),
                    ignoreAll: V.bind(e),
                    remove: G.bind(e),
                    getEl: H.bind(e),
                    select: q.bind(e),
                    deselect: K.bind(e)
                }), ae.emit("matchExtend", e);
            }
            function D(e, t, n) {
                n = n || this, ae.emit("beforeReplace");
                var r = s(), o = e.length - n.oldVal.length;
                ae.latestCursor.s < n.s && (o = 0), ae.beforeReplace(n, o, e), he.remove(n), he.replace(n, e, t), 
                fe.replace(n, e, t, r, !0), Y(n, t ? "undoed" : "accepted"), ae.currentText = s(), 
                n.rev++, d({
                    s: n._e,
                    e: n._e
                }), me || (Z.focus(), d({
                    s: n._e,
                    e: n._e
                })), x(), g(), ae.emit("afterReplace", n), t || (ae.emit("fix", n), ae.emit("tracking", {
                    event: "matchAcceptedCard",
                    matches: n
                }));
            }
            function F(e) {
                e = e || this;
                var t = e.v;
                e.replace(t, !0), e.undoed = !0, e.beforeReplace = t;
                var n = fe.removeIntersectedWithReplace(e);
                n && x(), ae.emit("undo"), ae.emit("tracking", {
                    event: "matchUndo",
                    matches: e
                });
            }
            function B(e) {
                e = e || this, fe.forceRemove(e), te.addToDictionary(e);
                var t = fe.removeSimilar(e);
                t.push(e), x(), ae.emit("fix"), ae.emit("tracking", {
                    event: "matchAddToDict",
                    matches: t
                });
            }
            function U(e) {
                e = e || this, fe.forceRemove(e), te.ignore(e), fe.removeByPID(e), x(), ae.emit("fix"), 
                ae.emit("tracking", {
                    event: "matchIgnored",
                    matches: e
                });
            }
            function W(e) {
                e = e || this, fe.forceRemove(e), te.acknowledged(e), fe.removeByPID(e), x(), ae.emit("fix"), 
                ae.emit("tracking", {
                    event: "acknowledged",
                    matches: e
                });
            }
            function V(e) {
                e = e || this, fe.forceRemove(e), fe.removeSimilar(e), te.ignoreAll(e);
                var t = fe.removeSimilar(e);
                t.push(e), ae.emit("tracking", {
                    event: "matchIgnoredAll",
                    matches: t
                }), x();
            }
            function G(e) {
                e = e || this, fe.removeDeprecated(e), fe.remove(e, !0), he.remove(e), ae.emit("rendered");
            }
            function z() {
                var e = f(), t = s();
                return {
                    value: t.substring(e.s, e.e),
                    s: e.s,
                    e: e.e,
                    text: t
                };
            }
            function H(e) {
                return e = e || this, ee.getElementById(e.id);
            }
            function q(e, t) {
                t = t || this, t.selected || (t.selected = !0, e || (ae.emit("selectedMatch", t), 
                Y(t, "looked")), he.select(t), ae.selectedMatch = t);
            }
            function K(e, t) {
                t = t || this, t.selected && (t.selected = !1, e || ae.emit("deselectedMatch", t), 
                he.deselect(t), ae.selectedMatch = null);
            }
            function Y(e, t) {
                console.log("FEEDBACK", e.value, t), te.feedback(e, t);
            }
            function Q(e) {
                !e && te.reset(), J(), y(), te.start(), g(), ae.emit("rendered");
            }
            function J() {
                fe.get().forEach(function(e) {
                    he.remove(e);
                }), fe.clear(), ae._removedByServer = [], ae._currentText = "", x();
            }
            function X() {
                ye.stop(), he.stop(), ce(Z, "click", p), ae.emit("exit");
            }
            var $ = function() {}, Z = o.isString(e.el) ? document.querySelector(e.el) : e.el, ee = Z.ownerDocument, te = e.api, ne = 500, re = 3e3;
            o.isUndefined(e.useBufferForAddingMatches) || (ie = e.useBufferForAddingMatches);
            var oe, ie = !1, ae = i({
                el: Z,
                getText: function(e) {
                    return e ? s() : c();
                },
                setText: u,
                setCursor: d,
                getCursor: f,
                saveCursor: p,
                restoreCursor: m,
                addMethodsToMatch: O,
                addMatches: L,
                tryToAdd: I,
                render: x,
                check: g,
                getMatches: M,
                getFiltered: R,
                getSelection: z,
                close: close,
                clearData: J,
                hardReset: Q,
                latestCursor: {
                    s: 0,
                    e: 0
                },
                exit: X,
                waitTime: ne,
                matchFilter: function(e) {
                    return e;
                },
                processMatch: S,
                beforeReplace: $,
                getMatchClass: function() {
                    return "";
                },
                processRemove: $,
                matchRemoved: $,
                extendMatch: $,
                matchesEqual: function() {
                    return !1;
                },
                canAddRemovedMatch: function() {
                    return !0;
                },
                canShiftMatchEnd: function() {
                    return !0;
                },
                selectById: C,
                skipInputEvents: h,
                run: t,
                api: te,
                _removedByServer: []
            }), se = r.Util.listen, ce = r.Util.unlisten, le = (r.Util.hasClass, r.Util.getDocSelection), ue = !1, de = !0, fe = r.Matches(ae), pe = fe.matchesBuffer;
            ae.matches = fe;
            var me = "textarea" == e.editorType;
            ae.isTextarea = me, e.editor = ae;
            var he;
            e.dom ? he = e.dom(e) : "contenteditable" == e.editorType ? he = r.HtmlDom(e) : me && (he = r.TextareaDom({
                editor: ae
            })), ae.dom = he, ae.currentText = s() || "";
            var ge, be = o.debounce(x, 1e3, {
                maxWait: 5e3
            }), ve = o.debounce(x, 200, {
                maxWait: 1e3
            }), _e = window.requestIdleCallback ? function() {
                requestIdleCallback(x);
            } : ve;
            n(ae.currentText), fe.on("remove", G), fe.on("hasAvailableRenderDeletedMatch", j);
            var ye = r.InputListener({
                el: Z,
                editor: ae
            });
            return ae.inputListener = ye, "contenteditable" == e.editorType && (r.HtmlTypingLimiter({
                inputListener: ae.inputListener,
                el: Z
            }), ae.setHtml = function(e) {
                he.setHtml(e), l();
            }, ae.getHtml = he.getHtml), ye.on("changed", v), ye.on("input", w), ye.on("keypress", b), 
            ye.on("selectionChanged", k), se(Z, "click", p), ye.delegate(ae, "keydown"), ye.delegate(ae, "paste"), 
            ye.delegate(ae, "immediatepaste"), te.delegate(ae, "sending"), te.delegate(ae, "finish"), 
            te.on("add", T), te.on("start", E), he.delegate(ae, "rendered"), he.delegate(ae, "startInvalidateNode"), 
            he.delegate(ae, "endInvalidateNode"), e.autorun && t(), ae;
            var we;
        };
        try {
            t.exports = r;
        } catch (a) {}
    }, {
        "./html-dom": 18,
        "./html-typing-limiter": 19,
        "./input-listener": 20,
        "./match-updater": 21,
        "./matches": 22,
        "./text-split": 23,
        "./textarea-dom": 24,
        "./util": 25,
        emitter: "emitter",
        lodash: "lodash",
        wrap: "wrap"
    } ],
    18: [ function(e, t, n) {
        var r = function(t) {
            function n(e, t) {
                var n = L.where(R.matches.get(), {
                    inDom: !0
                }), i = L.difference(n, e);
                i.forEach(function(e) {
                    g(e);
                });
                for (var a = !1, s = 0; s < e.length; s++) {
                    var c = e[s];
                    c.replaced && (c._s = c.s, c._e = c.e), c.inDom || (a = !0, r(c, e));
                }
                if (!a) return F.emit("rendered");
                var f = l();
                o(e, t), z(O) && u(f) && d(f.pos), C();
            }
            function r(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var r = t[n];
                    e._e - e._s > r._e - r._s && j.collision(e, r) > 0 && r.inDom && g(r);
                }
            }
            function o(e, n) {
                function r(e, t) {
                    var r = D.createElement("g"), o = R.getMatchClass(e, n || "");
                    return r.className = "gr_ gr_" + e.id + o + " " + (e.cls || ""), r.textContent = t, 
                    r.id = e.id, r.setAttribute("data-gr-id", e.id), r;
                }
                j.render({
                    node: O,
                    matches: e,
                    createElement: r,
                    isValidNode: t.isValidNode,
                    isValidMatchForNode: t.isValidMatchForNode,
                    type: "dom"
                });
                for (var o = 0; o < e.length; o++) {
                    var i = e[o];
                    i.inDom || R.matches.remove(i, !0);
                }
                F.emit("rendered");
            }
            function i(e) {
                return e && (F.emit("startInvalidateNode"), j.invalidateNode(O), F.emit("endInvalidateNode")), 
                j.getText(O).replace(A.NBSP_RE, " ");
            }
            function a(e) {
                O.innerHTML = q(L.escape(e));
            }
            function s(e) {
                O.innerHTML = M.sanitize(e);
            }
            function c() {
                var e = H(D), t = e.anchorNode;
                if (t) {
                    var n = t.parentNode, r = e.toString();
                    if (!(r.length > 1)) {
                        if (W(n, "gr_")) return W(n.parentNode, "gr_spell") && (n = n.parentNode), R.selectById(n.id);
                        var o = t.nextElementSibling;
                        return o && t.__node_text && W(o, "gr_tiny") && t.__node_text.length == e.focusOffset ? R.selectById(o.id) : void (R.selectedMatch && R.selectedMatch.deselect());
                    }
                }
            }
            function l() {
                var e = H(D), t = e.anchorNode || {}, n = e.focusNode || {};
                return {
                    pos: f(),
                    aNode: t,
                    aNodeText: t.textContent,
                    aNodeParent: t.parentNode,
                    fNode: n,
                    fNodeText: n.textContent,
                    fNodeParent: n.parentNode
                };
            }
            function u(e) {
                var t = H(D), n = t.anchorNode || {}, r = t.focusNode || {};
                return e.aNode != n || e.aNodeText != n.textContent || e.aNodeParent != n.parentNode || e.fNode != r || e.fNodeText != r.textContent || e.fNodeParent != r.parentNode;
            }
            function d(e, t) {
                t = t || 10;
                var n = j.setCursorPos(O, e);
                return n === !1 && t <= 1 ? F.emit("badCursorPositionRetryFail") : n === !1 && e.s > 1 ? (F.emit("badCursorPosition"), 
                d({
                    s: e.s - 1,
                    e: e.e - 1
                }, t - 1)) : void 0;
            }
            function f() {
                return j.getCursorPos(O);
            }
            function p(e) {
                return e._s = e.s, e._e = e.e, e.id = "tmp_id", e.cls = "gr_tmp_id", o([ e ]), O.querySelectorAll(".gr_tmp_id");
            }
            function m(e) {
                return ".gr_" + e.id;
            }
            function h(e) {
                for (var t = j.getCursorPos(O), n = O.querySelectorAll(e), r = n.length, o = 0; o < r; o++) j.unwrap(n[o]);
                z(O) && j.setCursorPos(O, t);
            }
            function g(e, t) {
                for (var n = j.getCursorPos(O), r = O.querySelectorAll(m(e)), o = r.length, i = 0; i < o; i++) t ? r[i].parentNode.removeChild(r[i]) : j.unwrap(r[i]);
                e.inDom = !1, z(O) && j.setCursorPos(O, n);
            }
            function b(e) {
                var t, n = e[0];
                method = "contains" in n ? "contains" : "compareDocumentPosition", test = "contains" === method ? 1 : 16;
                e: for (;n = n.parentNode; ) {
                    for (t = e.length; t--; ) if ((n[method](e[t]) & test) !== test) continue e;
                    return n;
                }
                return null;
            }
            function v(e) {
                var t = b(e), n = e.length, r = e;
                if (n > 1) {
                    var o = j.mergeNodes(e);
                    r = [], r.push(o), n = r.length;
                }
                for (var i = 0; i < n; i++) {
                    for (var a = r[i], s = a.parentNode, c = 0; s != t && c < 1e3; ) {
                        var l = s;
                        s = s.parentNode, j.unwrap(l), c++;
                    }
                    j.unwrap(a);
                }
            }
            function _(e, t, n) {
                r(e, R.getFiltered());
                var o = p({
                    s: e.s,
                    e: e.e
                });
                o.length > 1 && v(o);
                var i = p({
                    s: e.s,
                    e: e.e
                })[0];
                i.textContent = t, i.id = e.id, e.replaced = !n, e.inDom = !n, i.className = "gr_ gr_" + e.id + R.getMatchClass(e, R.getText()) + " " + (e.cls || ""), 
                i.setAttribute("data-gr-id", e.id), n && j.unwrap(i);
            }
            function y(e) {
                for (var t = D.querySelectorAll(m(e)), n = t.length, r = 0; r < n; r++) V(t[r], "sel");
            }
            function w(e) {
                for (var t = D.querySelectorAll(m(e)), n = t.length, r = 0; r < n; r++) G(t[r], "sel");
            }
            function k(e, t) {
                var n = e.__pos, r = n + e.textContent.length, o = n >= t._s && r <= t._e;
                return o;
            }
            function C(e) {
                clearTimeout(B);
                var t = O.querySelectorAll("g[data-gr-id]"), r = t.length, o = [];
                j.markChildPos(O);
                for (var i = 0; i < r; i++) {
                    var a = t[i], s = R.matches.byId(a.id);
                    if (o.push(a.id), s && k(a, s)) {
                        if (!s.inDom && e && (s.inDom = !0), !s.selected && W(a, "sel") && G(a, "sel"), 
                        !a.className) {
                            var c = R.getMatchClass(s, R.getText());
                            a.className = "gr_ gr_" + s.id + c + " " + (s.cls || "");
                        }
                    } else {
                        var f = l();
                        j.unwrap(a), z(O) && u(f) && d(f.pos);
                    }
                }
                for (var p = R.getFiltered(), m = !1, i = 0; i < p.length; i++) {
                    var s = p[i], h = s.id;
                    o.indexOf(h) == -1 && (s.inDom = !1, m = !0);
                }
                m && n(p, R.getText());
            }
            function x(e) {
                for (var t = 0, n = e.childNodes.length; t < n; ++t) {
                    var r = e.childNodes[t];
                    3 != r.nodeType && 1 != r.nodeType && K.push(r), 3 == r.nodeType && x(r);
                }
            }
            function E() {
                setTimeout(function() {
                    x(O);
                    for (var e = 0; e < K.length; e++) {
                        var t = K[e];
                        t.parentNode.removeChild(t);
                    }
                    K.length > 0 && (O.normalize(), "" == O.firstChild.textContent.trim() && O.firstChild.parentNode.removeChild(O.firstChild), 
                    "" == O.lastChild.textContent.trim() && O.lastChild.parentNode.removeChild(O.lastChild), 
                    R.hardReset()), K = [], F.emit("startInvalidateNode"), j.invalidateNode(O), F.emit("endInvalidateNode");
                }, 0);
            }
            function S() {
                for (var e = O.cloneNode(!0), t = e.querySelectorAll(".gr-alert"), n = 0; n < t.length; n++) j.unwrap(t[n]);
                return e.innerHTML;
            }
            function T() {
                return O.innerHTML;
            }
            function N() {
                B = setTimeout(C, U), R.on("paste", function() {
                    F.emit("startInvalidateNode"), j.invalidateNode(O), F.emit("endInvalidateNode"), 
                    C();
                });
            }
            function P() {
                clearTimeout(B);
            }
            var A = e("./util"), j = e("wrap"), I = e("emitter"), L = e("lodash"), M = e("dompurify"), R = t.editor, O = t.el, D = O.ownerDocument, F = I({
                render: n,
                remove: g,
                renderRange: p,
                removeBySelector: h,
                replace: _,
                getCleanHtml: S,
                getHtml: T,
                start: N,
                stop: P,
                select: y,
                deselect: w,
                getText: i,
                setText: a,
                setHtml: s,
                changeSelection: c,
                getCursor: f,
                setCursor: d,
                unwrapToCommonParent: v,
                invalidate: C
            });
            R && R.on && R.on("immediatepaste", E);
            var B, U = 1e3, W = A.hasClass, V = A.addClass, G = A.removeClass, z = A.isFocused, H = A.getDocSelection, q = A.br, K = [];
            return F;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./util": 25,
        dompurify: "dompurify",
        emitter: "emitter",
        lodash: "lodash",
        wrap: "wrap"
    } ],
    19: [ function(e, t, n) {
        var r = function(t) {
            function n() {
                var e = b(f);
                e.anchorNode && l.invalidateNode(e.anchorNode);
            }
            function r() {
                n();
            }
            function o(e) {
                var t = b(f);
                if (!(t.toString().length > 1)) {
                    var n = t.anchorNode;
                    l.invalidateNode(n);
                    var r = e.originalEvent, o = e.commandKeyPressed, a = e.navKey, c = r.metaKey || r.ctrlKey;
                    if (!c && (o && (s = null), n && n.nodeType && 3 == n.nodeType && !(a || o && 13 != g(r) && 32 != g(r)) && (s = null, 
                    p(n.parentNode, "gr_") && (n.textContent.length == t.anchorOffset || 0 == t.anchorOffset)))) {
                        if (13 == g(r)) return i(n.parentNode);
                        var v = String.fromCharCode(g(r));
                        r.shiftKey || (v = v.toLowerCase());
                        var _ = f.createTextNode(v);
                        " " == _.textContent && (_.textContent = String.fromCharCode(160)), 0 == t.anchorOffset ? m(_, n.parentNode) : h(n.parentNode, _), 
                        s = l.getPosInText(d, _, 1), l.setRange({
                            node: _,
                            offset: 1
                        }), r.preventDefault(), l.invalidateNode(_), setTimeout(u.oninput, 0);
                    }
                }
            }
            function i(e) {
                setTimeout(function() {
                    e && e.parentNode && (e.firstChild && "BR" == e.firstChild.tagName && m(e.firstChild, e), 
                    e.lastChild && "BR" == e.lastChild.tagName && h(e, e.lastChild), l.invalidateNode(e));
                }, 0);
            }
            function a(e) {
                var t = e.originalEvent, n = t.metaKey || t.ctrlKey;
                if (n && 90 == g(t) && null != s) {
                    var r = l.getCursorPos(d), o = l.getNodeByTextPos(d, s), i = l.getNodeText(o);
                    o.node.textContent = i.substr(0, o.offset - 1) + i.substr(o.offset), l.invalidateNode(o.node), 
                    s = null, r.s--, r.e--, l.setCursorPos(d, r), t.preventDefault(), setTimeout(u.oninput, 0);
                }
            }
            var s, c = e("./util"), l = e("wrap"), u = t.inputListener, d = t.el, f = d.ownerDocument, p = c.hasClass, m = c.insertBefore, h = c.insertAfter, g = c.keyCode, b = c.getDocSelection;
            u.on("keypress", o), u.on("keydown", a), u.on("input", r);
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./util": 25,
        wrap: "wrap"
    } ],
    20: [ function(e, t, n) {
        var r = function(t) {
            function n() {
                return A ? T.getText(!0) : T.el.innerHTML;
            }
            function r() {
                a(), w();
            }
            function o() {
                s(), clearTimeout(C);
            }
            function i(e) {
                return void 0 != e ? R = !1 : void (R = !0);
            }
            function a() {
                O(S, "input", c), O(S, "click", f), O(S, "keyup", p), O(S, "keypress", v), O(S, "keydown", b), 
                O(S, "paste", l), O(P, "mousedown", _), F(S, l);
            }
            function s() {
                D(S, "input", c), D(S, "click", f), D(S, "keyup", p), D(S, "keypress", v), D(S, "keydown", b), 
                D(S, "paste", l), D(P, "mousedown", _), B(S, l);
            }
            function c(e) {
                M.emit("typed", e), R || (I = new Date(), M.emit("input"));
            }
            function l() {
                M.ignorePaste || (M.emit("immediatepaste"), R || setTimeout(function() {
                    u(!0), M.emit("paste"), M.emit("input");
                }, 10));
            }
            function u(e) {
                if (!R) {
                    var t = n(), r = y(), o = N.trim() != t.trim();
                    ("" != t || o) && (o && k && (e = !0, k = !1), (o && !r || e) && (M.emit("changed"), 
                    N = t, L = N));
                }
            }
            function d() {
                M.emit("selectionChanged");
            }
            function f(e) {
                R || (window.event && !window.event.customWritted || (e.customWritted = !0, window.event = e), 
                d());
            }
            function p(e) {
                if (!R) return g(U(e)) ? void d() : void M.emit("keyup");
            }
            function m(e) {
                return [ 37, 38, 39, 40, 17, 18, 91, 8, 16, 20, 9 ].indexOf(e) != -1;
            }
            function h(e) {
                return [ 32, 190, 188, 186, 59, 57, 48, 191, 49, 13, 8 ].indexOf(e) != -1;
            }
            function g(e) {
                return [ 37, 38, 39, 40 ].indexOf(e) != -1;
            }
            function b(e) {
                R || (k = h(U(e)), M.emit("keydown", {
                    originalEvent: e,
                    commandKeyPressed: k,
                    listener: M
                }));
            }
            function v(e) {
                if (!R) {
                    var t = m(U(e));
                    M.emit("keypress", {
                        originalEvent: e,
                        navKey: t,
                        commandKeyPressed: k,
                        listener: M
                    });
                }
            }
            function _() {
                R || (I = new Date() - 1e5, u());
            }
            function y() {
                return !(new Date() - I > j);
            }
            function w() {
                C = setTimeout(function() {
                    var e = n();
                    e != L && (I = new Date(), L = e, M.emit("input")), u(), w();
                }, 200);
            }
            var k, C, x = e("./util"), E = e("emitter"), S = t.el, T = t.editor, N = n(), P = S.ownerDocument, A = T.isTextarea, j = 4e3, I = new Date(), L = "", M = E({
                start: r,
                stop: o,
                oninput: c,
                isUserTyping: y,
                skipInputEvents: i
            }), R = !1, O = x.listen, D = x.unlisten, F = x.watch, B = x.unwatch, U = x.keyCode;
            return M;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./util": 25,
        emitter: "emitter"
    } ],
    21: [ function(e, t, n) {
        var r = function(t) {
            function n(e, t) {
                if (t) {
                    for (var n = [], r = 0; r < t.length; r++) {
                        var o, i = t[r], a = e.substring(i.s, i.e);
                        i.skipUpdatePos && a || (o = i.value != a, o && n.push(r));
                    }
                    n.length > 0 && d(n, t, !0);
                }
            }
            function r(e, n, r, o) {
                if (e.skipUpdatePos) return !1;
                h.isUndefined(r) && (r = e.s, o = e.e);
                var i = n.substring(r, o), a = e.value;
                return i != a ? (console.log("%c removed '%s' '%s'", "color:rgba(239, 110, 105, 0.8)", i, a), 
                e.removed = !0, !0) : t.matchRemoved(e, n, r, o);
            }
            function o(e, t, n) {
                var o = [];
                for (var i in n) {
                    var a = n[i];
                    a.siblingValue != e.substring(a._s - 1, a._e + 1) || r(a, e) || (delete n[i], t.push(a), 
                    o.push(a));
                }
                return o;
            }
            function i(e, t) {
                if (e.siblingValue.length < 2) return !1;
                if (e.siblingValue == t.substring(e._s - 1, e._e + 1)) return !0;
                for (var n = 10, r = -n; r < n; r++) {
                    var o = t.substring(e._s + r - 1, e._e + r + 1);
                    if (o == e.siblingValue) return e._s += r, e._e += r, e.replaced || (e.s = e._s - e.sd, 
                    e.e = e._e - e.ed), !0;
                }
            }
            function a(e, n, o) {
                var a = g(e.trimRight(), n.trimRight()), s = [];
                if (a.s != -1) {
                    for (var c = a.s, l = a.delta, u = [], f = 0; f < o.length; f++) {
                        var p = o[f], m = p.s, h = p.e;
                        if ((m >= c || 0 != l && 0 == p.s && 0 == c) && (m += l, h += l), p.value != n.substring(m, h) || m < 0 || p._value != n.substring(m + p.sd, h + p.ed) || p.removed || r(p, n, m, h)) {
                            var b = t.processRemove(p, n, m, h, l);
                            if (b) {
                                if (b.next) continue;
                                if (b.add && (u = u.concat(b.add)), b.remove) {
                                    s.push(f), p.removed = !0;
                                    continue;
                                }
                            }
                            if (i(p, n)) continue;
                            s.push(f), p.removed = !0;
                        } else if (p.s >= c) {
                            if (0 == l && p.value != n.substring(m, h)) {
                                s.push(f), p.removed = !0;
                                continue;
                            }
                            p.s = m, p.e = h, p.replaced ? (p._s = p.s, p._e = p.e) : (p._s = p.s + p.sd, p._e = p.e + p.ed);
                        }
                    }
                    if (s.length > 0 && d(s, o, !0), u.length > 0) for (var f = 0; f < u.length; f++) o.push(u[f]);
                }
            }
            function s(e, t) {
                var n = !1;
                if (e) {
                    for (var r = 0; r < e.length; r++) {
                        var o = e[r];
                        if (c(o, t)) return o;
                    }
                    return n;
                }
            }
            function c(e, n) {
                var r = 3, o = e.s - r >= n.s && e.s + r <= n.e || e.e >= n.s && e.e <= n.e;
                return t.matchesEqual(e, n, o);
            }
            function l(e, n) {
                n = n.concat();
                for (var r = 0; r < n.length; r++) {
                    var o = n[r], i = s(e, o);
                    i ? (t.extendMatch(i, o), console.log("%c SKIP MATCH it already exists", "color:rgba(239, 110, 105, 0.8)", o, i)) : e.push(o);
                }
            }
            function u(e, n) {
                var r = s(e, n);
                r && t.extendMatch(r, n);
            }
            function d(e, t, n) {
                for (var r = [], o = 0; o < e.length; o++) {
                    var i = e[o] - o, a = t[i];
                    t.splice(i, 1), r.push(a);
                }
                for (var o = 0; o < r.length; o++) n && b.emit("remove", r[o]);
            }
            function f(e, t) {
                return;
            }
            function p(e, t) {
                for (var n = 0; n < t.length; n++) t[n].id == e.id && (t.splice(n, 1), n--);
            }
            var m = e("emitter"), h = e("lodash"), g = e("textdiff").diffPos, b = m({
                removeDeprecated: f,
                remove: p,
                removeNotExisting: n,
                matchRemoved: r,
                extend: l,
                extendWithoutAdding: u,
                updatePos: a,
                locateMatch: i,
                tryToAddRemoved: o
            });
            return b;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        emitter: "emitter",
        lodash: "lodash",
        textdiff: "textdiff"
    } ],
    22: [ function(e, t, n) {
        var r = function(t) {
            function n() {
                return N || (N = []), N;
            }
            function r(e) {
                N.push(e);
            }
            function o(e) {
                return T.findWhere(N, {
                    id: e
                });
            }
            function i(e, t) {
                if (e.value = t.substring(e.s, e.e), e.skipUpdatePos && (e.value = t.substring(e.s, e.e), 
                e._value = t.substring(e._s, e._e), e.v = e.value), _(e)) return void console.log("match exist", e);
                var n = t.substring(e._s, e._e), r = t.substring(e.s, e.e);
                return e.siblingValue = t.substring(e._s - 1, e._e + 1), e.skipUpdatePos || (e.removed = n != e._value || r != e.v, 
                e.removed && (console.log("%c match value does not correspondents to the value in a text", "color:rgba(239, 110, 105, 0.8)", "'" + e.v + "' vs '" + r + "'"), 
                L.emit("lost_match_value_in_text", e))), e.removed ? void console.log("%c lost match", "color:rgba(239, 110, 105, 0.8)", e) : (b(e), 
                !0);
            }
            function a(e) {
                e.removed = !1, e.rendered = !1, t.canAddRemovedMatch(e) || (P[e.id] = e);
            }
            function s() {
                return P;
            }
            function c(e) {
                for (var t = e.pid, n = N.length, r = []; n--; ) {
                    var o = N[n];
                    o.pid == t && "" != o.value && e.value == o.value && (f(o), u(o), r.push(o));
                }
                return r;
            }
            function l(e) {
                for (var t = e.oldVal, n = N.length, r = []; n--; ) {
                    var o = N[n];
                    o.oldVal == t && (o.addedToDict = !0, f(o), u(o), r.push(o));
                }
                return r;
            }
            function u(e) {
                I.removeDeprecated(N, e);
            }
            function d(e) {
                for (var t = 0; t < N.length; t++) N[t].id == e.id && f(N[t]);
                p(e), delete P[e.id];
            }
            function f(e, t) {
                t || L.emit("remove", e), I.remove(e, N), p(e);
            }
            function p(e) {
                function t(t) {
                    n(t), m(e);
                }
                function n(e) {
                    for (var t = 0; t < A.length; t++) A[t] && A[t].id == e && (A[t] = !1);
                }
                if (e && e.id) {
                    var r = e.id;
                    if (T.isArray(r)) for (var o = 0; o < r.length; o++) t(r[o]); else t(r);
                }
            }
            function m(e) {
                if (A.length) for (var t = 0; t < A.length; t++) A[t] && A[t].pid == e.pid && A[t].highlightBegin == e.highlightBegin && A[t].highlightEnd == e.highlightEnd && L.emit("hasAvailableRenderDeletedMatch", {
                    match: A[t],
                    position: t
                });
            }
            function h(e, t) {
                g(e, t, N), I.removeNotExisting(t, N), t && I.tryToAddRemoved(t, N, P);
            }
            function g(e, t, n) {
                I.updatePos(e, t, n), L.emit("updatePos", {
                    matches: n,
                    text: t
                });
            }
            function b(e) {
                I.extend(N, [ e ]);
            }
            function v(e, t) {
                return I.locateMatch(e, t);
            }
            function _(e) {
                for (var t = 0; t < N.length; t++) {
                    var n = N[t], r = e.s == n.s && e.e == n.e;
                    if (n.r && n.ignored && r) return !0;
                }
                return !1;
            }
            function y() {
                N = [], P = {};
            }
            function w(e, t, n, r) {
                var o = t;
                T.isUndefined(o) && (o = e.rFirst), r = r.substring(0, e.s) + o + r.substring(e.e, r.length);
                var i = o.length - e.oldVal.length;
                k(e, i, r), e.e = e.s + o.length, n ? (e._s = e.s + e.sd, e._e = e.e + e.ed) : (e._s = e.s, 
                e._e = e.e), e.undoed = !1, e.replaced = !n, e.beforeReplace = e.v, e.oldVal = o, 
                e.value = o, e._value = r.substring(e._s, e._e);
            }
            function k(e, n, r) {
                for (var o = 0; o < N.length; o++) {
                    var i = N[o];
                    e != i && (e.e < i.s && (i.s += n, i.e += n, i._s += n, i._e += n), e.s >= i.s && e.e <= i.e && t.canShiftMatchEnd(e) ? (i.e += n, 
                    i._e += n, i.value = r.substring(i.s, i.e), i._value = r.substring(i._s, i._e), 
                    i.oldVal = i.value) : e.s >= i.s && e.e > i.e && (i.value = r.substring(i.s, i.e), 
                    i._value = r.substring(i._s, i._e), i.oldVal = i.value), i.rev++);
                }
            }
            function C(e) {
                for (var t = !1, n = 0; n < N.length; n++) {
                    var r = N[n];
                    if (!(r.value.split(" ").length > 1 || e == r)) {
                        var o = x(e, r);
                        o && (f(o), t = !0);
                    }
                }
                return t;
            }
            function x(e, t) {
                return (e.s <= t.s && e.e >= t.s || e.s >= t.s && e.e <= t.e || e.s <= t.e && e.e >= t.e) && t;
            }
            var E = e("./match-updater"), S = e("emitter"), T = e("lodash"), N = [], P = {}, A = [], j = [], I = E(t), L = S({
                matchUpdater: I,
                add: r,
                tryToAdd: i,
                removeDeprecated: u,
                isIntersected: x,
                removeIntersectedWithReplace: C,
                update: h,
                forceRemove: d,
                byId: o,
                removeSimilar: l,
                removeByPID: c,
                updatePos: g,
                shift: k,
                extend: b,
                remove: f,
                clear: y,
                locateMatch: v,
                get: n,
                matchesBuffer: A,
                matchesRmBuffer: j,
                getRemoved: s,
                addRemoved: a,
                replace: w,
                rmMatchesBufferCache: p
            });
            return I.delegate(L, "remove"), L;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./match-updater": 21,
        emitter: "emitter",
        lodash: "lodash"
    } ],
    23: [ function(e, t, n) {
        var r = function(t) {
            function n(e, t, n) {
                var a, s, l, v, _, y, w, k = d.diff(f, e);
                for (p.length || (l = o(0, ""), u.appendChild(l.el), p.push(l)), k = k.sequencify(), 
                _ = d.cs([]), s = 0; s < p.length; s++) {
                    for (l = p[s], y = l.text, w = l.pos, a = 0; a < _.length; a++) l.pos = l.transformAgainst(_[a]).pos;
                    if (_.push(r(l, k)), l.len) for (l.text !== y && (l.textUp = !0), l.text === y && l.pos == w || (l.posUp = !0); l.len > h; ) v = o(l.pos + m, l.text.substr(m)), 
                    l.text = l.text.substr(0, m), l.len = l.text.length, i(l.el, v.el), p.splice(s + 1, 0, v), 
                    s++, l = v; else p.splice(s, 1), u.removeChild(l.el), s--;
                }
                var C, x, E, S, T = [];
                for (s = 0; s < p.length; s++) {
                    for (l = p[s], T = [], a = 0; a < t.length; a++) x = t[a], S = Math.min(l.pos + l.len, x.e) - Math.max(l.pos, x.s), 
                    S < 0 || (E = c.extend({}, x), E.orig = x, E.s = Math.max(0, x.s - l.pos), E.value = E.value.substr(Math.max(0, l.pos - x.s), S), 
                    E.e = E.s + E.value.length, E._s = E.s, E._e = E.e, x.replaced || (E._s = E.s + x.sd, 
                    E._e = E.e + x.ed), E._s < 0 || E._e < 0 || T.push(E));
                    if (l.matchesUp = !0, l.matches.length || T.length) if (l.matches.length == T.length) for (l.matchesUp = !1, 
                    C = 0; C < l.matches.length; C++) {
                        var N = l.matches[C].orig === T[C].orig && l.matches[C]._s == T[C]._s && l.matches[C]._e == T[C]._e;
                        if (!N) {
                            l.matchesUp = !0;
                            break;
                        }
                    } else l.matchesUp = !0; else l.matchesUp = !1;
                    l.matchesUp && (l.matches = T);
                }
                for (s = 0; s < p.length; s++) {
                    if (l = p[s], l.textUp || l.matchesUp) {
                        var P = l.text;
                        P = l.matches.length ? n(l.text, l.matches) : c.escape(P), l.el.innerHTML = g(P, s == p.length - 1), 
                        l.textUp = !1;
                    }
                    l.posUp && (l.el.setAttribute("p", [ l.pos, l.pos + l.len ].join(",")), l.posUp = !1);
                }
                b.emit("finish"), f = e;
            }
            function r(e, t) {
                var n, r, o, i = d.cs([]), a = [];
                for (n = 0; n < t.length; n++) r = t[n], "=" != r.type && r.len && (r.pos < e.pos || r.pos > e.pos + e.len || (o = r.extend({
                    tlen: e.len,
                    pos: r.pos - e.pos
                }), "+" == r.type && (i.push(r), a.forEach(function(e) {
                    e.pos += r.len;
                })), "-" == r.type && (o.text = o.text.substr(0, e.pos + e.len - r.pos), o.len = o.text.length, 
                r.text = r.text.substr(o.len), r.len = r.text.length, i.push(o), a.push(r)), e.text = o.apply(e.text), 
                e.len = e.text.length));
                return i;
            }
            function o(e, t) {
                var n = d.op({
                    type: "+",
                    tlen: 0,
                    pos: e,
                    text: t,
                    accessory: 0
                });
                return n.el = document.createElement("gr_block"), n.el.style.display = "inline", 
                n.textUp = !0, n.posUp = !0, n.matchesUp = !1, n.matches = [], n;
            }
            function i(e, t) {
                var n = e.parentNode;
                e.nextSibling ? n.insertBefore(t, e.nextSibling) : n.appendChild(t);
            }
            var a = e("emitter"), s = e("changesets"), c = e("lodash"), l = e("./util"), u = t.node, d = s, f = "", p = [], m = t.blockSize || 1e3, h = t.maxBlockSize || 2e3, g = l.br, b = a({
                update: n
            });
            return b;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./util": 25,
        changesets: "changesets",
        emitter: "emitter",
        lodash: "lodash"
    } ],
    24: [ function(e, t, n) {
        var r = function(t) {
            function n() {
                var e = R.getCursor(), t = O.value;
                O.value = t + " ", O.value = t, B(O) && R.setCursor(e);
            }
            function r() {
                var e = V(document), t = e.firstChild;
                return e.id = D, e.setAttribute("gramm_id", D), F(e, O), {
                    clone: e,
                    cloneVal: t
                };
            }
            function o() {
                var e = G.insertGhost();
                E = e.clone, S = e.cloneVal, x = I({
                    el: S,
                    editor: R
                }), N = L({
                    node: S
                }), N.on("finish", function() {
                    G.emit("rendered");
                }), G.htmlDom = x, T = A.throttle(i, 100), G.clone = E, G.cloneVal = S, R.emit("createdGhost");
            }
            function i(e, t, n) {
                try {
                    N.update(e, t, n);
                } catch (r) {
                    console.error(r.stack || r);
                }
            }
            function a(e, t, n) {
                for (var r = 0; r < e.length; r++) {
                    var o = e[r];
                    o.replaced && (o._s = o.s, o._e = o.e);
                }
                c(e, t, n);
            }
            function s(e, t) {
                var n = e.parent || e, r = R.getMatchClass(n, t);
                return {
                    start: "<g class='gr_ gr_" + n.id + r + "' data-gr-id='" + n.id + "' id='" + n.id + "'>",
                    end: "</g>"
                };
            }
            function c(e, t, n) {
                M.render({
                    node: O,
                    matches: e,
                    createTag: s,
                    type: "text",
                    text: t,
                    updateMethod: n ? i : T
                });
            }
            function l() {
                return O.value;
            }
            function u(e) {
                O.value = e;
            }
            function d(e) {
                G.setTextareaValue(e), a(R.getFiltered(), e, !0);
            }
            function f() {
                var e = U(document), t = e.toString();
                t.length > 1 || z();
            }
            function p() {
                var e = O.selectionStart, t = R.getFiltered(), n = t.concat(), r = !1;
                n.sort(function(e, t) {
                    return t._e - e._e;
                });
                for (var o = [], i = 0; i < n.length; i++) {
                    var a = n[i], s = e >= a._s && e <= a._e;
                    s && o.push(a);
                }
                if (o.length > 0) {
                    o.sort(function(e, t) {
                        return e._e - e._s - (t._e - t._s);
                    }), r = !0;
                    var a = o[0];
                    return R.selectedMatch && R.selectedMatch != a && R.selectedMatch.deselect(), R.selectById(a.id);
                }
                !r && R.selectedMatch && R.selectedMatch.deselect(), r || R.emit("deselectMatch");
            }
            function m(e) {
                O.selectionStart = e.s, O.selectionEnd = e.e;
            }
            function h() {
                return {
                    s: O.selectionStart,
                    e: O.selectionEnd
                };
            }
            function g(e) {
                return x.renderRange(e);
            }
            function b(e) {
                for (var t = O.querySelectorAll(e), n = t.length, r = 0; r < n; r++) M.unwrap(t[r]);
            }
            function v(e, t) {
                var n = R.getFiltered();
                a(n, R.currentText, !0);
            }
            function _(e, t) {
                var n = O.value;
                n = n.substring(0, e.s) + t + n.substr(e.e), R.currentText = n, d(n);
            }
            function y(e) {
                x.select(e);
            }
            function w(e) {
                x.deselect(e);
            }
            function k() {
                o();
            }
            function C() {}
            var x, E, S, T, N, P = e("emitter"), A = e("lodash"), j = e("./util"), I = e("./html-dom"), L = e("./text-split"), M = e("wrap"), R = t.editor, O = R.el, D = j.guid(), F = j.insertBefore, B = j.isFocused, U = j.getDocSelection, W = function() {}, V = function(e) {
                var t = e.createElement("div");
                t.className = "gram-ghost", t.setAttribute("gramm_editor", !0), t.setAttribute("contenteditable", !0), 
                t.setAttribute("tabindex", -1);
                var n = e.createElement("span");
                return n.className = "clone-val", t.appendChild(n), t;
            }, G = P({
                el: O,
                id: D,
                render: a,
                remove: v,
                renderRange: g,
                removeBySelector: b,
                replace: _,
                start: k,
                stop: C,
                select: y,
                deselect: w,
                getText: l,
                setText: d,
                setTextareaValue: u,
                changeSelection: f,
                getCursor: h,
                setCursor: m,
                insertGhost: r,
                forceRedraw: n,
                invalidate: W
            }), z = A.debounce(p, 100);
            return setTimeout(n, 10), G;
        };
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        "./html-dom": 18,
        "./text-split": 23,
        "./util": 25,
        emitter: "emitter",
        lodash: "lodash",
        wrap: "wrap"
    } ],
    25: [ function(e, t, n) {
        var r = function() {
            function t() {
                return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
            }
            function n() {
                return t() + t() + "-" + t() + "-" + t() + "-" + t() + "-" + t() + t() + t();
            }
            function r(e, t, n, r, o) {
                if (e) {
                    void 0 == o && (o = !1);
                    var i = r ? "removeEventListener" : "addEventListener";
                    n.__wrapFunc = n.__wrapFunc || function(e) {
                        n(x.extend({
                            originalEvent: e,
                            preventDefault: _f,
                            stopPropagation: _f
                        }, e.detail));
                    }, e[i](t + "-gr", n.__wrapFunc, o), e[i](t, n, o);
                }
            }
            function o(e, t, n, o) {
                r(e, t, n, !0, o);
            }
            function i(e, t) {
                for (t = t || document; e; ) {
                    if (e == t) return !0;
                    e = e.parentNode;
                }
                return !1;
            }
            function a(e, t) {
                var n = (t || document).createElement("div");
                return n.innerHTML = E.sanitize(e.trim()), n.firstElementChild;
            }
            function s(e, t) {
                return window.$ && window.$.is ? $(e).is(t) : e.matchesSelector ? e.matchesSelector(t) : e.webkitMatchesSelector ? e.webkitMatchesSelector(t) : e.mozMatchesSelector ? e.mozMatchesSelector(t) : void 0;
            }
            function c(e, t) {
                return "number" != typeof t || L[u(e)] ? t : t + "px";
            }
            function l(e) {
                return e.replace(/-+(.)?/g, function(e, t) {
                    return t ? t.toUpperCase() : "";
                });
            }
            function u(e) {
                return e.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase();
            }
            function d(e, t, n) {
                if (arguments.length < 3) {
                    var r = e, o = getComputedStyle(r, "");
                    if (!r) return;
                    if ("string" == typeof t) return r.style[l(t)] || o.getPropertyValue(t);
                    if (x.isArray(t)) {
                        var i = {};
                        return x.each(t, function(e, t) {
                            i[t] = r.style[l(t)] || o.getPropertyValue(t);
                        }), i;
                    }
                }
                var a = "";
                if (x.isString(t)) n || 0 === n ? a = u(t) + ":" + c(t, n) : e.style.removeProperty(u(t)); else for (key in t) t[key] || 0 === t[key] ? a += u(key) + ":" + c(key, t[key]) + ";" : e.style.removeProperty(u(key));
                return e.style.cssText += ";" + a;
            }
            function f(e, t) {
                return !(!e || void 0 == e.className) && e.classList.contains(t);
            }
            function p(e, t) {
                if (e) return e.classList.add(t);
            }
            function m(e, t) {
                if (e) return e.classList.remove(t);
            }
            function h(e, t) {
                t.parentNode.insertBefore(e, t);
            }
            function g(e, t) {
                e.parentNode.insertBefore(t, e.nextSibling);
            }
            function b() {
                return window.navigator.userAgent.indexOf("Firefox") != -1;
            }
            function v(e) {
                return b() ? e.ownerDocument.activeElement == e : document.activeElement && "IFRAME" == document.activeElement.tagName ? e === e.ownerDocument.activeElement : document.activeElement && "BODY" == document.activeElement.tagName ? e === document.activeElement : e === document.activeElement;
            }
            function _(e, t) {
                return e = e.replace(A, "<br>" + T).replace(N, "<br>"), t && (e = e.replace(P, T)), 
                e;
            }
            function y(e, t) {
                if (!window.MutationObserver) return !1;
                var n = x.findLast(I, {
                    node: e,
                    cb: t
                });
                if (n) return !1;
                var r = function(e) {
                    function n(e, t, n) {
                        for (var r = 0, i = t.length; r < i; r++) {
                            var a = t[r].tagName ? t[r].tagName : e.target.tagName, s = {
                                node: e.target,
                                tag: a.toLowerCase(),
                                action: n
                            };
                            e.target && o.indexOf(s) === -1 && o.push(s);
                        }
                    }
                    function r(e, t) {
                        var n = [], r = !1;
                        return e.forEach(function(e) {
                            if ("removedNodes" === e.action) {
                                var n = e.node.tagName.toLowerCase();
                                x.indexOf(t.tags, n) !== -1 && (r = !0);
                            }
                        }), e.forEach(function(e) {
                            var o = e.tag, i = x.indexOf(t.tags, o), a = !1;
                            ("addedNodes" === e.action && i !== -1 || "removedNodes" === e.action && r) && (a = e.node), 
                            a && n.indexOf(a) === -1 && n.push(a);
                        }), !!n.length && n;
                    }
                    var o = [], i = {
                        tags: j
                    };
                    e.forEach(function(e) {
                        0 !== e.addedNodes.length && n(e, e.addedNodes, "addedNodes"), 0 !== e.removedNodes.length && n(e, e.removedNodes, "removedNodes");
                    });
                    var a = r(o, i);
                    a && t && t(a);
                }, o = new MutationObserver(r), i = {
                    childList: !0,
                    subtree: !0,
                    attributes: !1,
                    characterData: !1
                };
                o.observe(e, i), I.push({
                    node: e,
                    cb: t,
                    mo: o
                });
            }
            function w(e, t) {
                var n = x.findLast(I, {
                    node: e,
                    cb: t
                });
                return !!n && (n.mo.disconnect(), void (I = x.without(I, n)));
            }
            function k(e) {
                return e.which || e.charCode || e.keyCode || 0;
            }
            function C(e) {
                return e.getSelection() || {};
            }
            var x = e("lodash"), E = e("dompurify");
            _f = function() {}, Function.prototype.bind || (Function.prototype.bind = function(e) {
                if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                var t = Array.prototype.slice.call(arguments, 1), n = this, r = function() {}, o = function() {
                    return n.apply(this instanceof r && e ? this : e, t.concat(Array.prototype.slice.call(arguments)));
                };
                return r.prototype = this.prototype, o.prototype = new r(), o;
            }), String.prototype.trimLeft = String.prototype.trimLeft || function() {
                return String(this).replace(/^\s+/, "");
            }, String.prototype.trimRight = String.prototype.trimRight || function() {
                return String(this).replace(/\s+$/, "");
            };
            var S = new RegExp(String.fromCharCode(160), "g"), T = String.fromCharCode(160), N = /\n/g, P = /\s$/g, A = new RegExp("\n" + String.fromCharCode(32), "g"), j = (new RegExp(String.fromCharCode(32) + String.fromCharCode(32), "g"), 
            [ "b", "strong", "i", "em", "u", "ins", "s", "font", "span", "ul", "li", "ol", "a", "img", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6" ]), I = [], L = {
                "column-count": 1,
                columns: 1,
                "font-weight": 1,
                "line-height": 1,
                opacity: 1,
                "z-index": 1,
                zoom: 1
            };
            return {
                guid: n,
                listen: r,
                unlisten: o,
                watch: y,
                unwatch: w,
                elementInDocument: i,
                hasClass: f,
                addClass: p,
                css: d,
                removeClass: m,
                insertBefore: h,
                insertAfter: g,
                createEl: a,
                NBSP_RE: S,
                matchesSelector: s,
                isFocused: v,
                br: _,
                keyCode: k,
                getDocSelection: C
            };
        }();
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        dompurify: "dompurify",
        lodash: "lodash"
    } ],
    26: [ function(e, t, n) {
        try {
            t.exports = e("./lib/editor");
        } catch (r) {}
    }, {
        "./lib/editor": 17
    } ],
    27: [ function(e, t, n) {
        function r(e) {
            function t(t) {
                M.isConnected() || (f("connect to url: " + e.url), h = new k(e.url), S = !1, E = !1, 
                h.onopen = function() {
                    N = P, E = !0, T && (T = !1, M.close()), t && e.resetQueueOnReconnect ? j = [] : s(), 
                    M.emit("connect"), t && (M.emit("reconnect"), y = !1);
                }, h.onmessage = function(e) {
                    w && console.log("%c Received: %s", "color: #46af91;", e.data), r(e.data), u(e.data);
                }, h.onclose = function(e) {
                    E = !1, M.emit("disconnect", e), S || d("disconnected");
                }, h.onerror = d, window.app && app.one("offline", function() {
                    E && (M.close(), app.one("online", function() {
                        M.connect();
                    }));
                }));
            }
            function n() {
                y || (y = !0, M.isConnected() ? (M.one("disconnect", function() {
                    setTimeout(M.connect.bind(null, !0), 0);
                }), S = !0, M.close()) : M.connect(!0));
            }
            function r(t) {
                e.useStandBy && t && !i(t) && (clearTimeout(x), x = setTimeout(function() {
                    M.close(), C = !0, x = !1;
                }, e.useStandBy));
            }
            function i(e) {
                if (e && "ping" == e) return !0;
                var t, n = !1;
                try {
                    t = JSON.parse(e);
                } catch (r) {}
                return t && ("ping" == t || t.action && "pong" == t.action) && (n = !0), n;
            }
            function a(e) {
                return !i(e) && void (C && (C = !1, t(!0)));
            }
            function s() {
                if (h) for (;h.readyState == k.OPEN && j.length; ) c(j.shift());
            }
            function c(t) {
                w && console.log("%c Sending %s", "color:rgba(10, 10, 10, 0.6); font-size: 10px", t), 
                r(t), h.send(t), b && clearTimeout(b), b = setTimeout(l, e.idleTimeout);
            }
            function l() {
                b = null, M.send("ping");
            }
            function u(t) {
                try {
                    t = JSON.parse(t);
                } catch (n) {
                    p(n.stack || n, t);
                }
                e.useQueue ? (I.push(t), m()) : M.emit("message", t);
            }
            function d(e) {
                p("websocket error", e), M.emit("error", e), e && e.target && [ k.CLOSING, k.CLOSED ].indexOf(e.target.readyState) > -1 || g || (E && M.close(), 
                f("try to reconnect in " + N / 1e3 + "s"), g = setTimeout(function() {
                    N = Math.min(A, 1.5 * N), g = null, t(!0);
                }, N));
            }
            function f() {
                w && console.log.apply(console, arguments);
            }
            function p() {
                console.error.apply(console, arguments);
            }
            function m() {
                if (!v && !L) return 0 === I.length ? void (v = null) : void (v = setTimeout(function() {
                    L || M.emit("message", I.shift()), v = null, m();
                }, e.useQueue));
            }
            var h, g, b, v, _, y, w = !e.silentLogs, k = window.WebSocket || window.MozWebSocket, C = !1, x = null, E = !1, S = !1, T = !1, N = 1e3, P = 1e3, A = 6e4, j = [], I = [], L = !1;
            e = Object.assign({}, {
                url: null,
                connectionTimeout: 1e3,
                idleTimeout: 3e5,
                useQueue: !1,
                useStandBy: !1,
                playDelay: 50,
                resetQueueOnReconnect: !1
            }, e);
            var M = o({
                connect: t,
                reconnect: n,
                send: function(e) {
                    if (C) a(e); else {
                        var t = JSON.stringify(e);
                        j.push(t), s();
                    }
                },
                close: function() {
                    if (S = !0, f("explicit close requested"), !E) return T = !0;
                    try {
                        h && h.close(), g && (clearTimeout(g), g = null);
                    } catch (e) {
                        p("socket closing bug", e.stack || e);
                    }
                    E = !1, x && clearTimeout(x);
                },
                isConnected: function() {
                    return E;
                },
                release: function() {
                    clearTimeout(g);
                },
                toString: function() {
                    return "[object WebSocket]";
                },
                wsPlay: function() {
                    clearTimeout(_), _ = setTimeout(function() {
                        L = !1, m();
                    }, e.playDelay);
                },
                wsPause: function() {
                    clearTimeout(_), L = !0;
                }
            });
            return M;
        }
        var o = e("emitter");
        "function" != typeof Object.assign && !function() {
            Object.assign = function(e) {
                "use strict";
                if (void 0 === e || null === e) throw new TypeError("Cannot convert undefined or null to object");
                for (var t = Object(e), n = 1; n < arguments.length; n++) {
                    var r = arguments[n];
                    if (void 0 !== r && null !== r) for (var o in r) r.hasOwnProperty(o) && (t[o] = r[o]);
                }
                return t;
            };
        }();
        try {
            t.exports = r;
        } catch (i) {}
    }, {
        emitter: "emitter"
    } ],
    28: [ function(e, t, n) {
        try {
            t.exports = e("./lib/websocket");
        } catch (r) {}
    }, {
        "./lib/websocket": 27
    } ],
    29: [ function(e, t, n) {
        var r = function() {
            function t() {
                var e = window.navigator.userAgent, t = e.indexOf("MSIE ");
                if (t > 0) return parseInt(e.substring(t + 5, e.indexOf(".", t)), 10);
                var n = e.indexOf("Trident/");
                if (n > 0) {
                    var r = e.indexOf("rv:");
                    return parseInt(e.substring(r + 3, e.indexOf(".", r)), 10);
                }
                var o = e.indexOf("Edge/");
                return o > 0 && parseInt(e.substring(o + 5, e.indexOf(".", o)), 10);
            }
            function n(e) {
                return e ? void (ne = e) : ne;
            }
            function o(e) {
                return e ? void (re = e) : re;
            }
            function i(e) {
                for (;e.parent; ) e = e.parent;
                return e;
            }
            function a(e) {
                for (var t = e.concat(), n = 0; n < t.length; n++) {
                    var r = t[n], o = [];
                    void 0 == r._s && (r._s = r.s, r._e = r.e);
                    for (var i = n + 1; i < t.length; i++) {
                        var a = t[i];
                        if (void 0 == a._s && (a._s = a.s, a._e = a.e), !(s(r, a) <= 0)) {
                            if (r._s > a._s && r._e - a._e > 0) {
                                o.push({
                                    _s: r._s,
                                    _e: a._e,
                                    parent: r
                                }), o.push({
                                    _s: a._e,
                                    _e: r._e,
                                    parent: r
                                });
                                break;
                            }
                            if (r._e < a._e && a._s - r._s > 0) {
                                o.push({
                                    _s: r._s,
                                    _e: a._s,
                                    parent: r
                                }), o.push({
                                    _s: a._s,
                                    _e: r._e,
                                    parent: r
                                });
                                break;
                            }
                        }
                    }
                    o.length && (t.splice.apply(t, [ n, 1 ].concat(o)), n = 0);
                }
                return t.sort(function(e, t) {
                    return e._s - t._s || t._e - e._e;
                }), t;
            }
            function s(e, t) {
                return Math.min(e._e, t._e) - Math.max(e._s, t._s);
            }
            function c(e) {
                return null == e ? "" : ("" + e).replace(ae.mark, function(e) {
                    return oe.mark[e];
                });
            }
            function l(e) {
                return null == e ? "" : ("" + e).replace(ae.escape, function(e) {
                    return oe.escape[e];
                });
            }
            function u(e) {
                var t = e.node, n = e.matches, r = e.createElement, o = e.isValidNode || function(e) {
                    return !0;
                }, s = e.isValidMatchForNode || function(e, t, n) {
                    return t;
                }, c = a(n).filter(function(e) {
                    return !e.inDom && !i(e).inDom;
                });
                if (0 != c.length) {
                    v(t, t, 0, c, null, r, o, s);
                    var c = a(n).filter(function(e) {
                        return !e.inDom && !i(e).inDom;
                    });
                }
            }
            function d(e) {
                return e.replace(/\n/g, "<br>");
            }
            function f(e) {
                var t = e.text, n = e.node, r = e.matches, o = e.createTag, i = e.updateMethod;
                if (i) i(t, r, function(e, t) {
                    var n = a(t);
                    return h(e, n, o);
                }); else {
                    a(r);
                    n.innerHTML = d(h(t, r, o));
                }
            }
            function p(e) {
                return "dom" == e.type ? u(e) : "text" == e.type ? f(e) : void 0;
            }
            function m(e, t) {
                var n = e.parent || e, r = "";
                return {
                    start: "<g class='gr_ gr_" + n.id + r + "' id='" + n.id + "'>",
                    end: "</g>"
                };
            }
            function h(e, t, n) {
                var r = e;
                e = c(e);
                var o, i, a, s, u, d, f, n = n || m, p = [], h = 0;
                for (i = 0; i < t.length; i++) {
                    for (s = t[i], s.calculatedPos = !1, u = s.parent || s, u.inDom = !0, u.orig && (u.orig.inDom = !0), 
                    u = u.orig || u, o = n(u, r), u.renderTs = u.renderTs || Date.now(), d = o.start, 
                    f = h + s._s, e = e.substring(0, f) + d + e.substring(f), h += d.length, a = 0; a < p.length; a++) p[a] > f && (p[a] += d.length);
                    p.push(h + s._e);
                }
                for (p.sort(function(e, t) {
                    return e - t;
                }), h = 0, a = 0; a < p.length; a++) f = h + p[a], e = e.substring(0, f) + o.end + e.substring(f), 
                h += o.end.length;
                return l(e);
            }
            function g(e, t) {
                var n = document.createElement("g");
                return n.getElementsByTagName("g"), n.className = "gr_ gr_" + e.id, n.textContent = t, 
                n.id = e.id, n;
            }
            function b(e, t, n, o, i) {
                var a, s, c = e.ownerDocument || e, l = c.createRange(), u = c.activeElement != i;
                if (u) {
                    var d = J(c);
                    a = {
                        node: d.anchorNode,
                        activeElement: c.activeElement,
                        offset: d.anchorOffset,
                        selectionStart: c.activeElement.selectionStart
                    }, s = {
                        node: d.focusNode,
                        offset: d.focusOffset,
                        selectionEnd: c.activeElement.selectionEnd
                    };
                }
                try {
                    l.setStart(e, t), l.setEnd(e, n), l.deleteContents(), l.insertNode(o);
                } catch (n) {
                    throw r.error && r.error("replaceRange"), n;
                }
                u && ("INPUT" == a.activeElement.tagName || "TEXTAREA" == a.activeElement.tagName ? (a.activeElement.focus(), 
                a.activeElement.selectionStart = a.selectionStart, a.activeElement.selectionEnd = s.selectionEnd) : a.node && Q(a, s));
            }
            function v(e, t, n, r, o, a, s, c) {
                var l, u, d = n || 0, f = {
                    _s: void 0,
                    _e: void 0
                };
                a = a || g, o = o || {
                    level: -1,
                    validNodeForMatchLevel: 0
                }, o.text = o.text || V(e);
                var p = o.level, m = s(t);
                for (m ? o.level <= o.validNodeForMatchLevel && (o.validNodeForMatch = !0, o.validNodeForMatchLevel = o.level) : (o.validNodeForMatch = !1, 
                o.validNodeForMatchLevel = o.level), o.level++, t.__s = d, u = 0; u < t.childNodes.length; u++) if (l = t.childNodes[u], 
                l.__jump_next && (u++, delete l.__jump_next, l = t.childNodes[u]), l && (1 == l.nodeType || 3 == l.nodeType) && !B(l)) {
                    var h = M(e, l);
                    if (!O(h) || 3 != l.nodeType) {
                        3 != l.nodeType && (d = v(e, l, d, r, o, a, s, c));
                        var _ = o.brAddedAtNode, y = o.prevIsBr, w = y && (_ == l || N(_, l) || N(l, _));
                        h.prevIsBrWithinNode = w;
                        var k = D(h), C = k;
                        f._s = d, f._e = d + k.length, d = f._e, k && (o.prevIsBr = !1);
                        var x = R(h);
                        if (x && (o.prevIsBr = !0, d++, o.brAddedAtNode = l.parentNode), h.isPreWrap && k.indexOf("\n") != -1 && (o.prevIsBr = !0, 
                        o.brAddedAtNode = l.parentNode), "IMG" == h.node.tagName && (o.prevIsBr = !1), 3 == l.nodeType && f._s != f._e) {
                            C != l.textContent && (l.textContent = C);
                            for (var S = 0; S < r.length; S++) {
                                var T = r[0], P = T.parent || T;
                                if (T.__s = T.__s || T._s, T.__e = T.__e || T._e, T.__s >= f._e) break;
                                for (;"\n" == o.text[T.__s]; ) T.__s++;
                                if (T.__s < f._s) {
                                    for (var A = l.parentNode; A.__s > T.__s; ) A = A.parentNode;
                                    if (T.__timesRendered = T.__timesRendered || 0, T.__timesRendered++, T.__timesRendered > 5) break;
                                    v(e, A, A.__s, r, o, a, s, c);
                                }
                                if (f._e < T._e) {
                                    var j = T.__s;
                                    T.__s = f._e, T = {
                                        __s: j,
                                        __e: f._e,
                                        parent: T
                                    };
                                } else r.shift(), S--;
                                if (o.validNodeForMatch || c(l, o.validNodeForMatch, P)) {
                                    var I = 0;
                                    f._s < T.__s && (I = T.__s - f._s, k = k.substr(I)), T.calculatedPos = !1;
                                    var L = T.__e - T.__s, U = I + L, W = i(T), G = a(W, k.substr(0, L));
                                    if (W.renderTs = W.renderTs || Date.now(), P.inDom = !0, n = d + T.__s, k = k.substr(0, L), 
                                    b(l, I, U, G, e), ie && (G.parentNode.tagName != G.tagName && (G.__jump_next = !0), 
                                    t.firstChild && 3 == t.firstChild.nodeType && 0 == t.firstChild.textContent.length && t.removeChild(t.firstChild), 
                                    !l.parentNode)) {
                                        var z = !0;
                                        l = G;
                                    }
                                    if (G.__node_info = null, G.previousSibling && (G.previousSibling.__node_info = null), 
                                    G.nextSibling && (G.nextSibling.__node_info = null), E(l), l.parentNode == t) {
                                        z || u++, f._s = T.__s, f._e = T.__e, G.__s = T.__s, d = T.__e;
                                        var H = R(M(e, G));
                                        H && d++;
                                    }
                                    delete T.__s, delete T.__e, delete T.__timesRendered, l = G.firstChild, G.parentNode != t && G.parentNode && v(e, G.parentNode, G.parentNode.__s, r, o, a, s, c);
                                }
                            }
                        }
                    }
                }
                return F(t) && F(t.nextElementSibling) && (r[0] && r[0].__s == d && r[0].__s++, 
                d++), o.level = p, d;
            }
            function y(e) {
                if (!e || e && 0 === e.length) return !1;
                if (1 === e.length) return e[0];
                for (var t = e[0], n = e.length, r = 1; r < n; r++) t.appendChild(e[r]), S(e[r].parentNode);
                return t.innerHTML = V(t), t.normalize(), e[0].parentNode.normalize(), S(t), S(e[0].parentNode), 
                t;
            }
            function w(e) {
                return e.replace($, "");
            }
            function k(e) {
                return e.replace(Z, "");
            }
            function C(e) {
                return e.replace($, "").replace(Z, "");
            }
            function x(e, t) {
                if (e) return e.__trimmed_content ? e.__trimmed_content : t ? e.__trimmed_content = e.textContent : e.__trimmed_content = C(e.textContent);
            }
            function E(e) {
                e.__trimmed_content && delete e.__trimmed_content, e.__node_text && delete e.__node_text;
            }
            function S(e) {
                if (e && (E(e), e.parentNode && e.parentNode.normalize(), e.childNodes.length > 0)) for (var t = 0, n = e.childNodes.length; t < n; t++) S(e.childNodes[t]);
            }
            function T(e) {
                return e.replace(/\n+/g, " ").replace(ee, " ");
            }
            function N(e, t) {
                if (!t) return !1;
                for (var n = t.parentNode; null != n; ) {
                    if (n == e) return !0;
                    n = n.parentNode;
                }
                return !1;
            }
            function P(e) {
                if (e.parentNode) {
                    var t = e.ownerDocument, n = e.parentNode;
                    if (e.childNodes.length > 1) {
                        for (var r = t.createDocumentFragment(); e.childNodes.length > 0; ) {
                            var o = e.childNodes[0];
                            r.appendChild(o);
                        }
                        n.replaceChild(r, e), S(n);
                    } else e.firstChild ? (n.replaceChild(e.firstChild, e), n.normalize(), S(n)) : (n.removeChild(e), 
                    n.normalize(), S(n));
                }
            }
            function A(e, t) {
                function n(e) {
                    if (3 == e.nodeType || 1 == e.nodeType) {
                        if (3 == e.nodeType && o) return r = e, !1;
                        if (t == e && (o = !0), e.childNodes) for (var i = 0, a = e.childNodes.length; i < a; ++i) if (n(e.childNodes[i]) === !1) return !1;
                    }
                }
                var r, o;
                return n(e), r;
            }
            function j(e) {
                if (e) {
                    if (e.__is_block) return e.__is_block;
                    if (!e.ownerDocument || !e.tagName || B(e)) return e.__is_block = !1;
                    var t = e.tagName.toLowerCase(), n = [ "table", "div", "p", "blockquote", "body", "table", "tr", "th", "td", "ol", "ul", "li", "h1", "h2", "h3", "h4", "h5", "h6" ].indexOf(t) != -1;
                    return "block" == e.style.display && (n = !0), e.__is_block = n, n;
                }
            }
            function I(e, t) {
                if (e.__white_space) return "pre-wrap" === e.__white_space;
                for (var n = 3 == e.nodeType ? e.parentNode : e; n != t || e == t || e.parentNode == t; ) {
                    if (n.__white_space || (n.__white_space = getComputedStyle(n).whiteSpace), "pre-wrap" === n.__white_space) return e.__white_space = n.__white_space, 
                    "pre-wrap" == e.__white_space;
                    if (n = n.parentNode, e == t || e.parentNode == t) return;
                }
            }
            function L() {
                return r.shouldCache || document.location.hash.indexOf("cache") > -1;
            }
            function M(e, t) {
                if (t.__node_info && L()) return t.__node_info.pos = t.__node_info.offset = t.__node_info.prevIsBrWithinNode = void 0, 
                t.__node_info;
                var n = j(t), r = t.nextSibling, o = t.previousSibling, i = I(t, e), a = x(o, i), s = x(r, i);
                r && 3 == r.nodeType && !s && (r = r.nextSibling, s = x(r, i)), o && 3 == o.nodeType && !a && (o = o.previousSibling, 
                a = x(o, i));
                var c = r && x(r.parentNode.lastChild, i), l = j(r), u = j(o), d = r && r.tagName && !j(r), f = o && o.tagName && !j(o), p = "BR" == t.tagName, m = "P" == t.tagName, h = r && "BR" == r.tagName, g = o && "BR" == o.tagName, b = r && r.parentNode.lastElementChild == r && !c, v = t.parentNode.firstChild == t || !x(t.parentNode.firstChild, i) && t.parentNode.firstElementChild == t, _ = t.parentNode.lastChild == t || !c && t.parentNode.lastElementChild == t, y = v && t.parentNode == e, w = x(t, i) || n && t.querySelector("br") || t.tagName && t.querySelector("img"), k = o && a, C = r && s, E = x(t.parentNode, i), S = r && (3 == r.nodeType || d) && C, T = o && (3 == o.nodeType || f) && k, N = l && C, P = u && k, A = 1 == t.parentNode.children.length;
                return t.__node_info = {
                    node: t,
                    root: e,
                    preWrap: i,
                    next: r,
                    prev: o,
                    isTextNode: 3 == t.nodeType,
                    nodeIsBlock: n,
                    nextIsBlock: l,
                    prevIsBlock: u,
                    nextInline: d,
                    prevInline: f,
                    nodeIsBr: p,
                    nodeIsP: m,
                    nextIsBr: h,
                    prevIsBr: g,
                    nextIsLastChild: b,
                    nodeIsFirstChild: v,
                    nodeIsLastChild: _,
                    nodeIsRootFirstChild: y,
                    nodeWithContent: w,
                    prevWithContent: k,
                    nextWithContent: C,
                    parentWithContent: E,
                    nextIsElement: S,
                    prevIsElement: T,
                    nextIsBlockWithContent: N,
                    prevIsBlockWithContent: P,
                    onlyOneChild: A,
                    isRoot: t == e
                };
            }
            function R(e) {
                var t = !1;
                return e.nodeIsBlock && e.nodeWithContent && e.nextIsElement && !e.prevIsBrWithinNode && (t = !0), 
                !e.nodeIsBlock && e.nodeWithContent && (e.nextIsBlock || e.nextIsBr) && (t = !0), 
                e.nodeIsBlock && e.nodeWithContent && e.nextIsBlock && !e.prevIsBrWithinNode && (t = !0), 
                e.nextIsBr && !e.nextIsLastChild && e.nodeWithContent && (t = !0), e.nodeIsBr && !e.parentWithContent && e.nodeIsLastChild && (t = !0), 
                e.nodeIsBr && e.nextIsBr && (t = !0), e.nodeIsBr && e.nodeIsFirstChild && !e.onlyOneChild && (t = !0), 
                e.nodeIsBr && e.nextIsElement && !e.prevWithContent && !e.prevIsBr && (t = !0), 
                e.nodeIsBr && e.nextIsBlockWithContent && e.prevIsBlockWithContent && (t = !0), 
                e.isRoot && (t = !1), !e.preWrap || "\n" != e.node.textContent[e.node.textContent.length - 1] || e.prev && !e.prevIsBlock || e.next && !e.nextIsBlock || (t = !1), 
                e.isTextNode && O(e) && (t = !1), F(e.node) && (t = !1), t;
            }
            function O(e) {
                if (e.node.parentNode) return [ "table", "tbody", "thead", "tr" ].indexOf(e.node.parentNode.tagName.toLowerCase()) != -1;
            }
            function D(e) {
                if (!e.node.nodeValue) return "";
                if (O(e)) return "";
                if (e.preWrap) return e.node.nodeValue;
                if (e.node.__node_text) return e.node.__node_text;
                var t = T(e.node.nodeValue);
                return e.next && e.prev || j(e.node.parentNode) || e.prevIsBr ? ((!e.prev || e.prevIsBlock || e.prevIsBr) && (t = w(t)), 
                e.next && !e.nextIsBlock || (t = k(t)), e.node.__node_text = t, t) : (e.node.__node_text = t, 
                t);
            }
            function F(e) {
                if (e) return "TD" == e.tagName || "TH" == e.tagName;
            }
            function B(e) {
                return 1 === e.nodeType && (U(e) || W(e));
            }
            function U(e) {
                var t = e.tagName.toLowerCase();
                return re.indexOf(t) >= 0;
            }
            function W(e) {
                for (var t = 0; t < ne.length; t++) if (e.classList.contains(ne[t])) return !0;
                return !1;
            }
            function V(e, t) {
                function n(e, n) {
                    function r(n) {
                        if ((3 == n.nodeType || 1 == n.nodeType) && !B(n)) {
                            var s = M(e, n), c = a;
                            if (!O(s) || 3 != n.nodeType) {
                                if (s.isTextNode) {
                                    var l = D(s);
                                    a += l.length, l && i.push(l), s.preWrap && "\n" == l[l.length - 1] && (o = n.parentNode);
                                }
                                if (n.childNodes && !B(n)) for (var u = 0, d = n.childNodes.length; u < d; ++u) if (r(n.childNodes[u]) === !1) return !1;
                                "IMG" == n.tagName && i.push(""), F(n) && F(n.nextElementSibling) && (i.push(te), 
                                a++);
                                var f = i[i.length - 1], p = f && "\n" == f[f.length - 1] && (o == n || N(o, n) || N(n, o));
                                s.prevIsBrWithinNode = p;
                                var m = R(s);
                                return m && (i.push("\n"), a++, o = n.parentNode), t(s, c) !== !1 && void 0;
                            }
                        }
                    }
                    var o, i = [], a = 0;
                    return r(e), i.join("");
                }
                var r = t;
                t = t || _f, e.normalize();
                var o = !r && e.__getText && e.__getText.getText && e.__getText.innerHTML === e.innerHTML;
                if (o) return e.__getText.getText;
                var i = n(e);
                return r && e.__getText && delete e.__getText, r || (e.__getText = {
                    getText: i,
                    innerHTML: e.innerHTML
                }), i;
            }
            function G(e, t, n) {
                var r = e;
                if (n.isTextNode) {
                    var o = n.node.textContent.substr(0, t);
                    !n.preWrap && C(o) && (o = k(o));
                    var i = {
                        prev: n.prev,
                        preWrap: n.preWrap,
                        prevIsBlock: n.prevIsBlock,
                        prevIsBr: n.prevIsBr,
                        node: {
                            nodeValue: o
                        }
                    }, a = D(i);
                    r = t + e - (o.length - a.length);
                } else n.nodeIsBr && !n.onlyOneChild && r--;
                return r;
            }
            function z(e, t, n) {
                var r = 0;
                return t.childNodes.length && n > 0 && (t = t.childNodes[n], n = 0), V(e, function(e, o) {
                    if (e.node == t) return r = G(o, n, e), !1;
                }), r;
            }
            function H(e) {
                V(e, function(e, t) {
                    e.isTextNode || (e.node.__pos = t);
                });
            }
            function q(e, t) {
                var n;
                return e.normalize(), V(e, function(e, r) {
                    e.pos = r, e.offset = 0;
                    var o = r + D(e).length;
                    if (r == o) return !0;
                    if (t >= r && t <= o) {
                        for (var i = e.node.nodeValue || "", a = 0; a <= i.length; a++) t != G(r, a, e) || (e.offset = a);
                        return !!(e.nodeIsBr && 0 == e.offset || e.isTextNode && !e.nodeWithContent) || (n = e, 
                        !1);
                    }
                }), n;
            }
            function K(e) {
                var t = J(e.ownerDocument);
                if (!t.anchorNode) return {
                    s: -1,
                    e: -1
                };
                var n = z(e, t.anchorNode, t.anchorOffset), r = t.isCollapsed ? n : z(e, t.focusNode, t.focusOffset);
                return {
                    s: n,
                    e: r
                };
            }
            function Y(e, t) {
                var n = q(e, t.s);
                if (!n) return !1;
                L() && (n = _.clone(n));
                var r = t.s == t.e ? n : q(e, t.e);
                !n || n < 0 || r < 0 || Q(n, r, e.ownerDocument);
            }
            function Q(e, t) {
                var n = e.node.ownerDocument;
                try {
                    t || (t = e);
                    var r = J(n), o = n.createRange();
                    o.setStart(e.node, e.offset), o.setEnd(t.node, t.offset), r.removeAllRanges(), r.addRange(o);
                } catch (i) {
                    console.log(i);
                }
            }
            function J(e) {
                return e.getSelection() || {};
            }
            _f = function() {}, _ = e("lodash");
            var X = [ 10, 8, 32, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8203, 8287, 12288 ].map(function(e) {
                return String.fromCharCode(e);
            }), $ = new RegExp("^[" + X.join("") + "]+", "g"), Z = new RegExp("[" + X.join("") + "]+$", "g"), ee = new RegExp("[" + X.join("") + "]+", "g"), te = (new RegExp(String.fromCharCode(160), "g"), 
            String.fromCharCode(9)), ne = [], re = [ "pre", "code", "blockquote" ], oe = {
                mark: {
                    "&": "᪥",
                    "<": "Ᲊ",
                    ">": "ᲆ",
                    '"': "᯼",
                    "'": "ᨋ",
                    "/": "ᩗ"
                },
                escape: {
                    "᪥": "&amp;",
                    "Ᲊ": "&lt;",
                    "ᲆ": "&gt;",
                    "᯼": "&quot;",
                    "ᨋ": "&#x27;",
                    "ᩗ": "&#x2F;"
                }
            }, ie = !!t(), ae = {
                mark: new RegExp("[" + _.keys(oe.mark).join("") + "]", "g"),
                escape: new RegExp("[" + _.keys(oe.escape).join("") + "]", "g")
            };
            return {
                render: p,
                getNodeInfo: M,
                unwrap: P,
                setRange: Q,
                getNextTextNode: A,
                isDescendant: N,
                getNodeText: D,
                getCursorPos: K,
                setCursorPos: Y,
                isBr: R,
                isBlock: j,
                invalidateNode: S,
                getNodeByTextPos: q,
                getPosInText: z,
                markChildPos: H,
                getText: V,
                collision: s,
                mergeNodes: y,
                hasSkipNode: B,
                hasSkipTag: U,
                hasSkipClass: W,
                skipClass: n,
                skipTag: o,
                replaceRange: b
            };
        }();
        try {
            t.exports = r;
        } catch (o) {}
    }, {
        lodash: "lodash"
    } ],
    30: [ function(e, t, n) {
        try {
            t.exports = e("./lib/wrap");
        } catch (r) {}
    }, {
        "./lib/wrap": 29
    } ],
    31: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/array/from"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/array/from": 56
    } ],
    32: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/get-iterator"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/get-iterator": 57
    } ],
    33: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/is-iterable"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/is-iterable": 58
    } ],
    34: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/json/stringify"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/json/stringify": 59
    } ],
    35: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/map"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/map": 60
    } ],
    36: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/assign"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/assign": 61
    } ],
    37: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/create"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/create": 62
    } ],
    38: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/define-property"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/define-property": 63
    } ],
    39: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/get-own-property-symbols"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/get-own-property-symbols": 64
    } ],
    40: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/get-prototype-of"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/get-prototype-of": 65
    } ],
    41: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/keys"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/keys": 66
    } ],
    42: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/object/set-prototype-of"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/object/set-prototype-of": 67
    } ],
    43: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/promise"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/promise": 68
    } ],
    44: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/symbol"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/symbol": 69
    } ],
    45: [ function(e, t, n) {
        t.exports = {
            "default": e("core-js/library/fn/symbol/iterator"),
            __esModule: !0
        };
    }, {
        "core-js/library/fn/symbol/iterator": 70
    } ],
    46: [ function(e, t, n) {
        "use strict";
        n.__esModule = !0, n["default"] = function(e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        };
    }, {} ],
    47: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/object/define-property"), i = r(o);
        n["default"] = function() {
            function e(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var r = t[n];
                    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), 
                    (0, i["default"])(e, r.key, r);
                }
            }
            return function(t, n, r) {
                return n && e(t.prototype, n), r && e(t, r), t;
            };
        }();
    }, {
        "../core-js/object/define-property": 38
    } ],
    48: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/object/define-property"), i = r(o);
        n["default"] = function(e, t, n) {
            return t in e ? (0, i["default"])(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e;
        };
    }, {
        "../core-js/object/define-property": 38
    } ],
    49: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/object/assign"), i = r(o);
        n["default"] = i["default"] || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = arguments[t];
                for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
            }
            return e;
        };
    }, {
        "../core-js/object/assign": 36
    } ],
    50: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/object/set-prototype-of"), i = r(o), a = e("../core-js/object/create"), s = r(a), c = e("../helpers/typeof"), l = r(c);
        n["default"] = function(e, t) {
            if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + ("undefined" == typeof t ? "undefined" : (0, 
            l["default"])(t)));
            e.prototype = (0, s["default"])(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), t && (i["default"] ? (0, i["default"])(e, t) : e.__proto__ = t);
        };
    }, {
        "../core-js/object/create": 37,
        "../core-js/object/set-prototype-of": 42,
        "../helpers/typeof": 54
    } ],
    51: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../helpers/typeof"), i = r(o);
        n["default"] = function(e, t) {
            if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" !== ("undefined" == typeof t ? "undefined" : (0, i["default"])(t)) && "function" != typeof t ? e : t;
        };
    }, {
        "../helpers/typeof": 54
    } ],
    52: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/is-iterable"), i = r(o), a = e("../core-js/get-iterator"), s = r(a);
        n["default"] = function() {
            function e(e, t) {
                var n = [], r = !0, o = !1, i = void 0;
                try {
                    for (var a, c = (0, s["default"])(e); !(r = (a = c.next()).done) && (n.push(a.value), 
                    !t || n.length !== t); r = !0) ;
                } catch (l) {
                    o = !0, i = l;
                } finally {
                    try {
                        !r && c["return"] && c["return"]();
                    } finally {
                        if (o) throw i;
                    }
                }
                return n;
            }
            return function(t, n) {
                if (Array.isArray(t)) return t;
                if ((0, i["default"])(Object(t))) return e(t, n);
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            };
        }();
    }, {
        "../core-js/get-iterator": 32,
        "../core-js/is-iterable": 33
    } ],
    53: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/array/from"), i = r(o);
        n["default"] = function(e) {
            if (Array.isArray(e)) {
                for (var t = 0, n = Array(e.length); t < e.length; t++) n[t] = e[t];
                return n;
            }
            return (0, i["default"])(e);
        };
    }, {
        "../core-js/array/from": 31
    } ],
    54: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        n.__esModule = !0;
        var o = e("../core-js/symbol/iterator"), i = r(o), a = e("../core-js/symbol"), s = r(a), c = "function" == typeof s["default"] && "symbol" == typeof i["default"] ? function(e) {
            return typeof e;
        } : function(e) {
            return e && "function" == typeof s["default"] && e.constructor === s["default"] && e !== s["default"].prototype ? "symbol" : typeof e;
        };
        n["default"] = "function" == typeof s["default"] && "symbol" === c(i["default"]) ? function(e) {
            return "undefined" == typeof e ? "undefined" : c(e);
        } : function(e) {
            return e && "function" == typeof s["default"] && e.constructor === s["default"] && e !== s["default"].prototype ? "symbol" : "undefined" == typeof e ? "undefined" : c(e);
        };
    }, {
        "../core-js/symbol": 44,
        "../core-js/symbol/iterator": 45
    } ],
    55: [ function(e, t, n) {
        t.exports = e("regenerator-runtime");
    }, {
        "regenerator-runtime": 175
    } ],
    56: [ function(e, t, n) {
        e("../../modules/es6.string.iterator"), e("../../modules/es6.array.from"), t.exports = e("../../modules/_core").Array.from;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.array.from": 153,
        "../../modules/es6.string.iterator": 164
    } ],
    57: [ function(e, t, n) {
        e("../modules/web.dom.iterable"), e("../modules/es6.string.iterator"), t.exports = e("../modules/core.get-iterator");
    }, {
        "../modules/core.get-iterator": 151,
        "../modules/es6.string.iterator": 164,
        "../modules/web.dom.iterable": 169
    } ],
    58: [ function(e, t, n) {
        e("../modules/web.dom.iterable"), e("../modules/es6.string.iterator"), t.exports = e("../modules/core.is-iterable");
    }, {
        "../modules/core.is-iterable": 152,
        "../modules/es6.string.iterator": 164,
        "../modules/web.dom.iterable": 169
    } ],
    59: [ function(e, t, n) {
        var r = e("../../modules/_core"), o = r.JSON || (r.JSON = {
            stringify: JSON.stringify
        });
        t.exports = function(e) {
            return o.stringify.apply(o, arguments);
        };
    }, {
        "../../modules/_core": 85
    } ],
    60: [ function(e, t, n) {
        e("../modules/es6.object.to-string"), e("../modules/es6.string.iterator"), e("../modules/web.dom.iterable"), 
        e("../modules/es6.map"), e("../modules/es7.map.to-json"), t.exports = e("../modules/_core").Map;
    }, {
        "../modules/_core": 85,
        "../modules/es6.map": 155,
        "../modules/es6.object.to-string": 162,
        "../modules/es6.string.iterator": 164,
        "../modules/es7.map.to-json": 166,
        "../modules/web.dom.iterable": 169
    } ],
    61: [ function(e, t, n) {
        e("../../modules/es6.object.assign"), t.exports = e("../../modules/_core").Object.assign;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.assign": 156
    } ],
    62: [ function(e, t, n) {
        e("../../modules/es6.object.create");
        var r = e("../../modules/_core").Object;
        t.exports = function(e, t) {
            return r.create(e, t);
        };
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.create": 157
    } ],
    63: [ function(e, t, n) {
        e("../../modules/es6.object.define-property");
        var r = e("../../modules/_core").Object;
        t.exports = function(e, t, n) {
            return r.defineProperty(e, t, n);
        };
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.define-property": 158
    } ],
    64: [ function(e, t, n) {
        e("../../modules/es6.symbol"), t.exports = e("../../modules/_core").Object.getOwnPropertySymbols;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.symbol": 165
    } ],
    65: [ function(e, t, n) {
        e("../../modules/es6.object.get-prototype-of"), t.exports = e("../../modules/_core").Object.getPrototypeOf;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.get-prototype-of": 159
    } ],
    66: [ function(e, t, n) {
        e("../../modules/es6.object.keys"), t.exports = e("../../modules/_core").Object.keys;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.keys": 160
    } ],
    67: [ function(e, t, n) {
        e("../../modules/es6.object.set-prototype-of"), t.exports = e("../../modules/_core").Object.setPrototypeOf;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.set-prototype-of": 161
    } ],
    68: [ function(e, t, n) {
        e("../modules/es6.object.to-string"), e("../modules/es6.string.iterator"), e("../modules/web.dom.iterable"), 
        e("../modules/es6.promise"), t.exports = e("../modules/_core").Promise;
    }, {
        "../modules/_core": 85,
        "../modules/es6.object.to-string": 162,
        "../modules/es6.promise": 163,
        "../modules/es6.string.iterator": 164,
        "../modules/web.dom.iterable": 169
    } ],
    69: [ function(e, t, n) {
        e("../../modules/es6.symbol"), e("../../modules/es6.object.to-string"), e("../../modules/es7.symbol.async-iterator"), 
        e("../../modules/es7.symbol.observable"), t.exports = e("../../modules/_core").Symbol;
    }, {
        "../../modules/_core": 85,
        "../../modules/es6.object.to-string": 162,
        "../../modules/es6.symbol": 165,
        "../../modules/es7.symbol.async-iterator": 167,
        "../../modules/es7.symbol.observable": 168
    } ],
    70: [ function(e, t, n) {
        e("../../modules/es6.string.iterator"), e("../../modules/web.dom.iterable"), t.exports = e("../../modules/_wks-ext").f("iterator");
    }, {
        "../../modules/_wks-ext": 148,
        "../../modules/es6.string.iterator": 164,
        "../../modules/web.dom.iterable": 169
    } ],
    71: [ function(e, t, n) {
        t.exports = function(e) {
            if ("function" != typeof e) throw TypeError(e + " is not a function!");
            return e;
        };
    }, {} ],
    72: [ function(e, t, n) {
        t.exports = function() {};
    }, {} ],
    73: [ function(e, t, n) {
        t.exports = function(e, t, n, r) {
            if (!(e instanceof t) || void 0 !== r && r in e) throw TypeError(n + ": incorrect invocation!");
            return e;
        };
    }, {} ],
    74: [ function(e, t, n) {
        var r = e("./_is-object");
        t.exports = function(e) {
            if (!r(e)) throw TypeError(e + " is not an object!");
            return e;
        };
    }, {
        "./_is-object": 105
    } ],
    75: [ function(e, t, n) {
        var r = e("./_for-of");
        t.exports = function(e, t) {
            var n = [];
            return r(e, !1, n.push, n, t), n;
        };
    }, {
        "./_for-of": 95
    } ],
    76: [ function(e, t, n) {
        var r = e("./_to-iobject"), o = e("./_to-length"), i = e("./_to-index");
        t.exports = function(e) {
            return function(t, n, a) {
                var s, c = r(t), l = o(c.length), u = i(a, l);
                if (e && n != n) {
                    for (;l > u; ) if (s = c[u++], s != s) return !0;
                } else for (;l > u; u++) if ((e || u in c) && c[u] === n) return e || u || 0;
                return !e && -1;
            };
        };
    }, {
        "./_to-index": 140,
        "./_to-iobject": 142,
        "./_to-length": 143
    } ],
    77: [ function(e, t, n) {
        var r = e("./_ctx"), o = e("./_iobject"), i = e("./_to-object"), a = e("./_to-length"), s = e("./_array-species-create");
        t.exports = function(e, t) {
            var n = 1 == e, c = 2 == e, l = 3 == e, u = 4 == e, d = 6 == e, f = 5 == e || d, p = t || s;
            return function(t, s, m) {
                for (var h, g, b = i(t), v = o(b), _ = r(s, m, 3), y = a(v.length), w = 0, k = n ? p(t, y) : c ? p(t, 0) : void 0; y > w; w++) if ((f || w in v) && (h = v[w], 
                g = _(h, w, b), e)) if (n) k[w] = g; else if (g) switch (e) {
                  case 3:
                    return !0;

                  case 5:
                    return h;

                  case 6:
                    return w;

                  case 2:
                    k.push(h);
                } else if (u) return !1;
                return d ? -1 : l || u ? u : k;
            };
        };
    }, {
        "./_array-species-create": 79,
        "./_ctx": 87,
        "./_iobject": 102,
        "./_to-length": 143,
        "./_to-object": 144
    } ],
    78: [ function(e, t, n) {
        var r = e("./_is-object"), o = e("./_is-array"), i = e("./_wks")("species");
        t.exports = function(e) {
            var t;
            return o(e) && (t = e.constructor, "function" != typeof t || t !== Array && !o(t.prototype) || (t = void 0), 
            r(t) && (t = t[i], null === t && (t = void 0))), void 0 === t ? Array : t;
        };
    }, {
        "./_is-array": 104,
        "./_is-object": 105,
        "./_wks": 149
    } ],
    79: [ function(e, t, n) {
        var r = e("./_array-species-constructor");
        t.exports = function(e, t) {
            return new (r(e))(t);
        };
    }, {
        "./_array-species-constructor": 78
    } ],
    80: [ function(e, t, n) {
        var r = e("./_cof"), o = e("./_wks")("toStringTag"), i = "Arguments" == r(function() {
            return arguments;
        }()), a = function(e, t) {
            try {
                return e[t];
            } catch (n) {}
        };
        t.exports = function(e) {
            var t, n, s;
            return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (n = a(t = Object(e), o)) ? n : i ? r(t) : "Object" == (s = r(t)) && "function" == typeof t.callee ? "Arguments" : s;
        };
    }, {
        "./_cof": 81,
        "./_wks": 149
    } ],
    81: [ function(e, t, n) {
        var r = {}.toString;
        t.exports = function(e) {
            return r.call(e).slice(8, -1);
        };
    }, {} ],
    82: [ function(e, t, n) {
        "use strict";
        var r = e("./_object-dp").f, o = e("./_object-create"), i = e("./_redefine-all"), a = e("./_ctx"), s = e("./_an-instance"), c = e("./_defined"), l = e("./_for-of"), u = e("./_iter-define"), d = e("./_iter-step"), f = e("./_set-species"), p = e("./_descriptors"), m = e("./_meta").fastKey, h = p ? "_s" : "size", g = function(e, t) {
            var n, r = m(t);
            if ("F" !== r) return e._i[r];
            for (n = e._f; n; n = n.n) if (n.k == t) return n;
        };
        t.exports = {
            getConstructor: function(e, t, n, u) {
                var d = e(function(e, r) {
                    s(e, d, t, "_i"), e._i = o(null), e._f = void 0, e._l = void 0, e[h] = 0, void 0 != r && l(r, n, e[u], e);
                });
                return i(d.prototype, {
                    clear: function() {
                        for (var e = this, t = e._i, n = e._f; n; n = n.n) n.r = !0, n.p && (n.p = n.p.n = void 0), 
                        delete t[n.i];
                        e._f = e._l = void 0, e[h] = 0;
                    },
                    "delete": function(e) {
                        var t = this, n = g(t, e);
                        if (n) {
                            var r = n.n, o = n.p;
                            delete t._i[n.i], n.r = !0, o && (o.n = r), r && (r.p = o), t._f == n && (t._f = r), 
                            t._l == n && (t._l = o), t[h]--;
                        }
                        return !!n;
                    },
                    forEach: function(e) {
                        s(this, d, "forEach");
                        for (var t, n = a(e, arguments.length > 1 ? arguments[1] : void 0, 3); t = t ? t.n : this._f; ) for (n(t.v, t.k, this); t && t.r; ) t = t.p;
                    },
                    has: function(e) {
                        return !!g(this, e);
                    }
                }), p && r(d.prototype, "size", {
                    get: function() {
                        return c(this[h]);
                    }
                }), d;
            },
            def: function(e, t, n) {
                var r, o, i = g(e, t);
                return i ? i.v = n : (e._l = i = {
                    i: o = m(t, !0),
                    k: t,
                    v: n,
                    p: r = e._l,
                    n: void 0,
                    r: !1
                }, e._f || (e._f = i), r && (r.n = i), e[h]++, "F" !== o && (e._i[o] = i)), e;
            },
            getEntry: g,
            setStrong: function(e, t, n) {
                u(e, t, function(e, t) {
                    this._t = e, this._k = t, this._l = void 0;
                }, function() {
                    for (var e = this, t = e._k, n = e._l; n && n.r; ) n = n.p;
                    return e._t && (e._l = n = n ? n.n : e._t._f) ? "keys" == t ? d(0, n.k) : "values" == t ? d(0, n.v) : d(0, [ n.k, n.v ]) : (e._t = void 0, 
                    d(1));
                }, n ? "entries" : "values", !n, !0), f(t);
            }
        };
    }, {
        "./_an-instance": 73,
        "./_ctx": 87,
        "./_defined": 88,
        "./_descriptors": 89,
        "./_for-of": 95,
        "./_iter-define": 108,
        "./_iter-step": 110,
        "./_meta": 114,
        "./_object-create": 117,
        "./_object-dp": 118,
        "./_redefine-all": 130,
        "./_set-species": 133
    } ],
    83: [ function(e, t, n) {
        var r = e("./_classof"), o = e("./_array-from-iterable");
        t.exports = function(e) {
            return function() {
                if (r(this) != e) throw TypeError(e + "#toJSON isn't generic");
                return o(this);
            };
        };
    }, {
        "./_array-from-iterable": 75,
        "./_classof": 80
    } ],
    84: [ function(e, t, n) {
        "use strict";
        var r = e("./_global"), o = e("./_export"), i = e("./_meta"), a = e("./_fails"), s = e("./_hide"), c = e("./_redefine-all"), l = e("./_for-of"), u = e("./_an-instance"), d = e("./_is-object"), f = e("./_set-to-string-tag"), p = e("./_object-dp").f, m = e("./_array-methods")(0), h = e("./_descriptors");
        t.exports = function(e, t, n, g, b, v) {
            var _ = r[e], y = _, w = b ? "set" : "add", k = y && y.prototype, C = {};
            return h && "function" == typeof y && (v || k.forEach && !a(function() {
                new y().entries().next();
            })) ? (y = t(function(t, n) {
                u(t, y, e, "_c"), t._c = new _(), void 0 != n && l(n, b, t[w], t);
            }), m("add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON".split(","), function(e) {
                var t = "add" == e || "set" == e;
                e in k && (!v || "clear" != e) && s(y.prototype, e, function(n, r) {
                    if (u(this, y, e), !t && v && !d(n)) return "get" == e && void 0;
                    var o = this._c[e](0 === n ? 0 : n, r);
                    return t ? this : o;
                });
            }), "size" in k && p(y.prototype, "size", {
                get: function() {
                    return this._c.size;
                }
            })) : (y = g.getConstructor(t, e, b, w), c(y.prototype, n), i.NEED = !0), f(y, e), 
            C[e] = y, o(o.G + o.W + o.F, C), v || g.setStrong(y, e, b), y;
        };
    }, {
        "./_an-instance": 73,
        "./_array-methods": 77,
        "./_descriptors": 89,
        "./_export": 93,
        "./_fails": 94,
        "./_for-of": 95,
        "./_global": 96,
        "./_hide": 98,
        "./_is-object": 105,
        "./_meta": 114,
        "./_object-dp": 118,
        "./_redefine-all": 130,
        "./_set-to-string-tag": 134
    } ],
    85: [ function(e, t, n) {
        var r = t.exports = {
            version: "2.4.0"
        };
        "number" == typeof __e && (__e = r);
    }, {} ],
    86: [ function(e, t, n) {
        "use strict";
        var r = e("./_object-dp"), o = e("./_property-desc");
        t.exports = function(e, t, n) {
            t in e ? r.f(e, t, o(0, n)) : e[t] = n;
        };
    }, {
        "./_object-dp": 118,
        "./_property-desc": 129
    } ],
    87: [ function(e, t, n) {
        var r = e("./_a-function");
        t.exports = function(e, t, n) {
            if (r(e), void 0 === t) return e;
            switch (n) {
              case 1:
                return function(n) {
                    return e.call(t, n);
                };

              case 2:
                return function(n, r) {
                    return e.call(t, n, r);
                };

              case 3:
                return function(n, r, o) {
                    return e.call(t, n, r, o);
                };
            }
            return function() {
                return e.apply(t, arguments);
            };
        };
    }, {
        "./_a-function": 71
    } ],
    88: [ function(e, t, n) {
        t.exports = function(e) {
            if (void 0 == e) throw TypeError("Can't call method on  " + e);
            return e;
        };
    }, {} ],
    89: [ function(e, t, n) {
        t.exports = !e("./_fails")(function() {
            return 7 != Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    }, {
        "./_fails": 94
    } ],
    90: [ function(e, t, n) {
        var r = e("./_is-object"), o = e("./_global").document, i = r(o) && r(o.createElement);
        t.exports = function(e) {
            return i ? o.createElement(e) : {};
        };
    }, {
        "./_global": 96,
        "./_is-object": 105
    } ],
    91: [ function(e, t, n) {
        t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
    }, {} ],
    92: [ function(e, t, n) {
        var r = e("./_object-keys"), o = e("./_object-gops"), i = e("./_object-pie");
        t.exports = function(e) {
            var t = r(e), n = o.f;
            if (n) for (var a, s = n(e), c = i.f, l = 0; s.length > l; ) c.call(e, a = s[l++]) && t.push(a);
            return t;
        };
    }, {
        "./_object-gops": 123,
        "./_object-keys": 126,
        "./_object-pie": 127
    } ],
    93: [ function(e, t, n) {
        var r = e("./_global"), o = e("./_core"), i = e("./_ctx"), a = e("./_hide"), s = "prototype", c = function(e, t, n) {
            var l, u, d, f = e & c.F, p = e & c.G, m = e & c.S, h = e & c.P, g = e & c.B, b = e & c.W, v = p ? o : o[t] || (o[t] = {}), _ = v[s], y = p ? r : m ? r[t] : (r[t] || {})[s];
            p && (n = t);
            for (l in n) u = !f && y && void 0 !== y[l], u && l in v || (d = u ? y[l] : n[l], 
            v[l] = p && "function" != typeof y[l] ? n[l] : g && u ? i(d, r) : b && y[l] == d ? function(e) {
                var t = function(t, n, r) {
                    if (this instanceof e) {
                        switch (arguments.length) {
                          case 0:
                            return new e();

                          case 1:
                            return new e(t);

                          case 2:
                            return new e(t, n);
                        }
                        return new e(t, n, r);
                    }
                    return e.apply(this, arguments);
                };
                return t[s] = e[s], t;
            }(d) : h && "function" == typeof d ? i(Function.call, d) : d, h && ((v.virtual || (v.virtual = {}))[l] = d, 
            e & c.R && _ && !_[l] && a(_, l, d)));
        };
        c.F = 1, c.G = 2, c.S = 4, c.P = 8, c.B = 16, c.W = 32, c.U = 64, c.R = 128, t.exports = c;
    }, {
        "./_core": 85,
        "./_ctx": 87,
        "./_global": 96,
        "./_hide": 98
    } ],
    94: [ function(e, t, n) {
        t.exports = function(e) {
            try {
                return !!e();
            } catch (t) {
                return !0;
            }
        };
    }, {} ],
    95: [ function(e, t, n) {
        var r = e("./_ctx"), o = e("./_iter-call"), i = e("./_is-array-iter"), a = e("./_an-object"), s = e("./_to-length"), c = e("./core.get-iterator-method"), l = {}, u = {}, n = t.exports = function(e, t, n, d, f) {
            var p, m, h, g, b = f ? function() {
                return e;
            } : c(e), v = r(n, d, t ? 2 : 1), _ = 0;
            if ("function" != typeof b) throw TypeError(e + " is not iterable!");
            if (i(b)) {
                for (p = s(e.length); p > _; _++) if (g = t ? v(a(m = e[_])[0], m[1]) : v(e[_]), 
                g === l || g === u) return g;
            } else for (h = b.call(e); !(m = h.next()).done; ) if (g = o(h, v, m.value, t), 
            g === l || g === u) return g;
        };
        n.BREAK = l, n.RETURN = u;
    }, {
        "./_an-object": 74,
        "./_ctx": 87,
        "./_is-array-iter": 103,
        "./_iter-call": 106,
        "./_to-length": 143,
        "./core.get-iterator-method": 150
    } ],
    96: [ function(e, t, n) {
        var r = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
        "number" == typeof __g && (__g = r);
    }, {} ],
    97: [ function(e, t, n) {
        var r = {}.hasOwnProperty;
        t.exports = function(e, t) {
            return r.call(e, t);
        };
    }, {} ],
    98: [ function(e, t, n) {
        var r = e("./_object-dp"), o = e("./_property-desc");
        t.exports = e("./_descriptors") ? function(e, t, n) {
            return r.f(e, t, o(1, n));
        } : function(e, t, n) {
            return e[t] = n, e;
        };
    }, {
        "./_descriptors": 89,
        "./_object-dp": 118,
        "./_property-desc": 129
    } ],
    99: [ function(e, t, n) {
        t.exports = e("./_global").document && document.documentElement;
    }, {
        "./_global": 96
    } ],
    100: [ function(e, t, n) {
        t.exports = !e("./_descriptors") && !e("./_fails")(function() {
            return 7 != Object.defineProperty(e("./_dom-create")("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    }, {
        "./_descriptors": 89,
        "./_dom-create": 90,
        "./_fails": 94
    } ],
    101: [ function(e, t, n) {
        t.exports = function(e, t, n) {
            var r = void 0 === n;
            switch (t.length) {
              case 0:
                return r ? e() : e.call(n);

              case 1:
                return r ? e(t[0]) : e.call(n, t[0]);

              case 2:
                return r ? e(t[0], t[1]) : e.call(n, t[0], t[1]);

              case 3:
                return r ? e(t[0], t[1], t[2]) : e.call(n, t[0], t[1], t[2]);

              case 4:
                return r ? e(t[0], t[1], t[2], t[3]) : e.call(n, t[0], t[1], t[2], t[3]);
            }
            return e.apply(n, t);
        };
    }, {} ],
    102: [ function(e, t, n) {
        var r = e("./_cof");
        t.exports = Object("z").propertyIsEnumerable(0) ? Object : function(e) {
            return "String" == r(e) ? e.split("") : Object(e);
        };
    }, {
        "./_cof": 81
    } ],
    103: [ function(e, t, n) {
        var r = e("./_iterators"), o = e("./_wks")("iterator"), i = Array.prototype;
        t.exports = function(e) {
            return void 0 !== e && (r.Array === e || i[o] === e);
        };
    }, {
        "./_iterators": 111,
        "./_wks": 149
    } ],
    104: [ function(e, t, n) {
        var r = e("./_cof");
        t.exports = Array.isArray || function(e) {
            return "Array" == r(e);
        };
    }, {
        "./_cof": 81
    } ],
    105: [ function(e, t, n) {
        t.exports = function(e) {
            return "object" == typeof e ? null !== e : "function" == typeof e;
        };
    }, {} ],
    106: [ function(e, t, n) {
        var r = e("./_an-object");
        t.exports = function(e, t, n, o) {
            try {
                return o ? t(r(n)[0], n[1]) : t(n);
            } catch (i) {
                var a = e["return"];
                throw void 0 !== a && r(a.call(e)), i;
            }
        };
    }, {
        "./_an-object": 74
    } ],
    107: [ function(e, t, n) {
        "use strict";
        var r = e("./_object-create"), o = e("./_property-desc"), i = e("./_set-to-string-tag"), a = {};
        e("./_hide")(a, e("./_wks")("iterator"), function() {
            return this;
        }), t.exports = function(e, t, n) {
            e.prototype = r(a, {
                next: o(1, n)
            }), i(e, t + " Iterator");
        };
    }, {
        "./_hide": 98,
        "./_object-create": 117,
        "./_property-desc": 129,
        "./_set-to-string-tag": 134,
        "./_wks": 149
    } ],
    108: [ function(e, t, n) {
        "use strict";
        var r = e("./_library"), o = e("./_export"), i = e("./_redefine"), a = e("./_hide"), s = e("./_has"), c = e("./_iterators"), l = e("./_iter-create"), u = e("./_set-to-string-tag"), d = e("./_object-gpo"), f = e("./_wks")("iterator"), p = !([].keys && "next" in [].keys()), m = "@@iterator", h = "keys", g = "values", b = function() {
            return this;
        };
        t.exports = function(e, t, n, v, _, y, w) {
            l(n, t, v);
            var k, C, x, E = function(e) {
                if (!p && e in P) return P[e];
                switch (e) {
                  case h:
                    return function() {
                        return new n(this, e);
                    };

                  case g:
                    return function() {
                        return new n(this, e);
                    };
                }
                return function() {
                    return new n(this, e);
                };
            }, S = t + " Iterator", T = _ == g, N = !1, P = e.prototype, A = P[f] || P[m] || _ && P[_], j = A || E(_), I = _ ? T ? E("entries") : j : void 0, L = "Array" == t ? P.entries || A : A;
            if (L && (x = d(L.call(new e())), x !== Object.prototype && (u(x, S, !0), r || s(x, f) || a(x, f, b))), 
            T && A && A.name !== g && (N = !0, j = function() {
                return A.call(this);
            }), r && !w || !p && !N && P[f] || a(P, f, j), c[t] = j, c[S] = b, _) if (k = {
                values: T ? j : E(g),
                keys: y ? j : E(h),
                entries: I
            }, w) for (C in k) C in P || i(P, C, k[C]); else o(o.P + o.F * (p || N), t, k);
            return k;
        };
    }, {
        "./_export": 93,
        "./_has": 97,
        "./_hide": 98,
        "./_iter-create": 107,
        "./_iterators": 111,
        "./_library": 113,
        "./_object-gpo": 124,
        "./_redefine": 131,
        "./_set-to-string-tag": 134,
        "./_wks": 149
    } ],
    109: [ function(e, t, n) {
        var r = e("./_wks")("iterator"), o = !1;
        try {
            var i = [ 7 ][r]();
            i["return"] = function() {
                o = !0;
            }, Array.from(i, function() {
                throw 2;
            });
        } catch (a) {}
        t.exports = function(e, t) {
            if (!t && !o) return !1;
            var n = !1;
            try {
                var i = [ 7 ], a = i[r]();
                a.next = function() {
                    return {
                        done: n = !0
                    };
                }, i[r] = function() {
                    return a;
                }, e(i);
            } catch (s) {}
            return n;
        };
    }, {
        "./_wks": 149
    } ],
    110: [ function(e, t, n) {
        t.exports = function(e, t) {
            return {
                value: t,
                done: !!e
            };
        };
    }, {} ],
    111: [ function(e, t, n) {
        t.exports = {};
    }, {} ],
    112: [ function(e, t, n) {
        var r = e("./_object-keys"), o = e("./_to-iobject");
        t.exports = function(e, t) {
            for (var n, i = o(e), a = r(i), s = a.length, c = 0; s > c; ) if (i[n = a[c++]] === t) return n;
        };
    }, {
        "./_object-keys": 126,
        "./_to-iobject": 142
    } ],
    113: [ function(e, t, n) {
        t.exports = !0;
    }, {} ],
    114: [ function(e, t, n) {
        var r = e("./_uid")("meta"), o = e("./_is-object"), i = e("./_has"), a = e("./_object-dp").f, s = 0, c = Object.isExtensible || function() {
            return !0;
        }, l = !e("./_fails")(function() {
            return c(Object.preventExtensions({}));
        }), u = function(e) {
            a(e, r, {
                value: {
                    i: "O" + ++s,
                    w: {}
                }
            });
        }, d = function(e, t) {
            if (!o(e)) return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
            if (!i(e, r)) {
                if (!c(e)) return "F";
                if (!t) return "E";
                u(e);
            }
            return e[r].i;
        }, f = function(e, t) {
            if (!i(e, r)) {
                if (!c(e)) return !0;
                if (!t) return !1;
                u(e);
            }
            return e[r].w;
        }, p = function(e) {
            return l && m.NEED && c(e) && !i(e, r) && u(e), e;
        }, m = t.exports = {
            KEY: r,
            NEED: !1,
            fastKey: d,
            getWeak: f,
            onFreeze: p
        };
    }, {
        "./_fails": 94,
        "./_has": 97,
        "./_is-object": 105,
        "./_object-dp": 118,
        "./_uid": 146
    } ],
    115: [ function(e, t, n) {
        var r = e("./_global"), o = e("./_task").set, i = r.MutationObserver || r.WebKitMutationObserver, a = r.process, s = r.Promise, c = "process" == e("./_cof")(a);
        t.exports = function() {
            var e, t, n, l = function() {
                var r, o;
                for (c && (r = a.domain) && r.exit(); e; ) {
                    o = e.fn, e = e.next;
                    try {
                        o();
                    } catch (i) {
                        throw e ? n() : t = void 0, i;
                    }
                }
                t = void 0, r && r.enter();
            };
            if (c) n = function() {
                a.nextTick(l);
            }; else if (i) {
                var u = !0, d = document.createTextNode("");
                new i(l).observe(d, {
                    characterData: !0
                }), n = function() {
                    d.data = u = !u;
                };
            } else if (s && s.resolve) {
                var f = s.resolve();
                n = function() {
                    f.then(l);
                };
            } else n = function() {
                o.call(r, l);
            };
            return function(r) {
                var o = {
                    fn: r,
                    next: void 0
                };
                t && (t.next = o), e || (e = o, n()), t = o;
            };
        };
    }, {
        "./_cof": 81,
        "./_global": 96,
        "./_task": 139
    } ],
    116: [ function(e, t, n) {
        "use strict";
        var r = e("./_object-keys"), o = e("./_object-gops"), i = e("./_object-pie"), a = e("./_to-object"), s = e("./_iobject"), c = Object.assign;
        t.exports = !c || e("./_fails")(function() {
            var e = {}, t = {}, n = Symbol(), r = "abcdefghijklmnopqrst";
            return e[n] = 7, r.split("").forEach(function(e) {
                t[e] = e;
            }), 7 != c({}, e)[n] || Object.keys(c({}, t)).join("") != r;
        }) ? function(e, t) {
            for (var n = a(e), c = arguments.length, l = 1, u = o.f, d = i.f; c > l; ) for (var f, p = s(arguments[l++]), m = u ? r(p).concat(u(p)) : r(p), h = m.length, g = 0; h > g; ) d.call(p, f = m[g++]) && (n[f] = p[f]);
            return n;
        } : c;
    }, {
        "./_fails": 94,
        "./_iobject": 102,
        "./_object-gops": 123,
        "./_object-keys": 126,
        "./_object-pie": 127,
        "./_to-object": 144
    } ],
    117: [ function(e, t, n) {
        var r = e("./_an-object"), o = e("./_object-dps"), i = e("./_enum-bug-keys"), a = e("./_shared-key")("IE_PROTO"), s = function() {}, c = "prototype", l = function() {
            var t, n = e("./_dom-create")("iframe"), r = i.length, o = "<", a = ">";
            for (n.style.display = "none", e("./_html").appendChild(n), n.src = "javascript:", 
            t = n.contentWindow.document, t.open(), t.write(o + "script" + a + "document.F=Object" + o + "/script" + a), 
            t.close(), l = t.F; r--; ) delete l[c][i[r]];
            return l();
        };
        t.exports = Object.create || function(e, t) {
            var n;
            return null !== e ? (s[c] = r(e), n = new s(), s[c] = null, n[a] = e) : n = l(), 
            void 0 === t ? n : o(n, t);
        };
    }, {
        "./_an-object": 74,
        "./_dom-create": 90,
        "./_enum-bug-keys": 91,
        "./_html": 99,
        "./_object-dps": 119,
        "./_shared-key": 135
    } ],
    118: [ function(e, t, n) {
        var r = e("./_an-object"), o = e("./_ie8-dom-define"), i = e("./_to-primitive"), a = Object.defineProperty;
        n.f = e("./_descriptors") ? Object.defineProperty : function(e, t, n) {
            if (r(e), t = i(t, !0), r(n), o) try {
                return a(e, t, n);
            } catch (s) {}
            if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");
            return "value" in n && (e[t] = n.value), e;
        };
    }, {
        "./_an-object": 74,
        "./_descriptors": 89,
        "./_ie8-dom-define": 100,
        "./_to-primitive": 145
    } ],
    119: [ function(e, t, n) {
        var r = e("./_object-dp"), o = e("./_an-object"), i = e("./_object-keys");
        t.exports = e("./_descriptors") ? Object.defineProperties : function(e, t) {
            o(e);
            for (var n, a = i(t), s = a.length, c = 0; s > c; ) r.f(e, n = a[c++], t[n]);
            return e;
        };
    }, {
        "./_an-object": 74,
        "./_descriptors": 89,
        "./_object-dp": 118,
        "./_object-keys": 126
    } ],
    120: [ function(e, t, n) {
        var r = e("./_object-pie"), o = e("./_property-desc"), i = e("./_to-iobject"), a = e("./_to-primitive"), s = e("./_has"), c = e("./_ie8-dom-define"), l = Object.getOwnPropertyDescriptor;
        n.f = e("./_descriptors") ? l : function(e, t) {
            if (e = i(e), t = a(t, !0), c) try {
                return l(e, t);
            } catch (n) {}
            if (s(e, t)) return o(!r.f.call(e, t), e[t]);
        };
    }, {
        "./_descriptors": 89,
        "./_has": 97,
        "./_ie8-dom-define": 100,
        "./_object-pie": 127,
        "./_property-desc": 129,
        "./_to-iobject": 142,
        "./_to-primitive": 145
    } ],
    121: [ function(e, t, n) {
        var r = e("./_to-iobject"), o = e("./_object-gopn").f, i = {}.toString, a = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [], s = function(e) {
            try {
                return o(e);
            } catch (t) {
                return a.slice();
            }
        };
        t.exports.f = function(e) {
            return a && "[object Window]" == i.call(e) ? s(e) : o(r(e));
        };
    }, {
        "./_object-gopn": 122,
        "./_to-iobject": 142
    } ],
    122: [ function(e, t, n) {
        var r = e("./_object-keys-internal"), o = e("./_enum-bug-keys").concat("length", "prototype");
        n.f = Object.getOwnPropertyNames || function(e) {
            return r(e, o);
        };
    }, {
        "./_enum-bug-keys": 91,
        "./_object-keys-internal": 125
    } ],
    123: [ function(e, t, n) {
        n.f = Object.getOwnPropertySymbols;
    }, {} ],
    124: [ function(e, t, n) {
        var r = e("./_has"), o = e("./_to-object"), i = e("./_shared-key")("IE_PROTO"), a = Object.prototype;
        t.exports = Object.getPrototypeOf || function(e) {
            return e = o(e), r(e, i) ? e[i] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? a : null;
        };
    }, {
        "./_has": 97,
        "./_shared-key": 135,
        "./_to-object": 144
    } ],
    125: [ function(e, t, n) {
        var r = e("./_has"), o = e("./_to-iobject"), i = e("./_array-includes")(!1), a = e("./_shared-key")("IE_PROTO");
        t.exports = function(e, t) {
            var n, s = o(e), c = 0, l = [];
            for (n in s) n != a && r(s, n) && l.push(n);
            for (;t.length > c; ) r(s, n = t[c++]) && (~i(l, n) || l.push(n));
            return l;
        };
    }, {
        "./_array-includes": 76,
        "./_has": 97,
        "./_shared-key": 135,
        "./_to-iobject": 142
    } ],
    126: [ function(e, t, n) {
        var r = e("./_object-keys-internal"), o = e("./_enum-bug-keys");
        t.exports = Object.keys || function(e) {
            return r(e, o);
        };
    }, {
        "./_enum-bug-keys": 91,
        "./_object-keys-internal": 125
    } ],
    127: [ function(e, t, n) {
        n.f = {}.propertyIsEnumerable;
    }, {} ],
    128: [ function(e, t, n) {
        var r = e("./_export"), o = e("./_core"), i = e("./_fails");
        t.exports = function(e, t) {
            var n = (o.Object || {})[e] || Object[e], a = {};
            a[e] = t(n), r(r.S + r.F * i(function() {
                n(1);
            }), "Object", a);
        };
    }, {
        "./_core": 85,
        "./_export": 93,
        "./_fails": 94
    } ],
    129: [ function(e, t, n) {
        t.exports = function(e, t) {
            return {
                enumerable: !(1 & e),
                configurable: !(2 & e),
                writable: !(4 & e),
                value: t
            };
        };
    }, {} ],
    130: [ function(e, t, n) {
        var r = e("./_hide");
        t.exports = function(e, t, n) {
            for (var o in t) n && e[o] ? e[o] = t[o] : r(e, o, t[o]);
            return e;
        };
    }, {
        "./_hide": 98
    } ],
    131: [ function(e, t, n) {
        t.exports = e("./_hide");
    }, {
        "./_hide": 98
    } ],
    132: [ function(e, t, n) {
        var r = e("./_is-object"), o = e("./_an-object"), i = function(e, t) {
            if (o(e), !r(t) && null !== t) throw TypeError(t + ": can't set as prototype!");
        };
        t.exports = {
            set: Object.setPrototypeOf || ("__proto__" in {} ? function(t, n, r) {
                try {
                    r = e("./_ctx")(Function.call, e("./_object-gopd").f(Object.prototype, "__proto__").set, 2), 
                    r(t, []), n = !(t instanceof Array);
                } catch (o) {
                    n = !0;
                }
                return function(e, t) {
                    return i(e, t), n ? e.__proto__ = t : r(e, t), e;
                };
            }({}, !1) : void 0),
            check: i
        };
    }, {
        "./_an-object": 74,
        "./_ctx": 87,
        "./_is-object": 105,
        "./_object-gopd": 120
    } ],
    133: [ function(e, t, n) {
        "use strict";
        var r = e("./_global"), o = e("./_core"), i = e("./_object-dp"), a = e("./_descriptors"), s = e("./_wks")("species");
        t.exports = function(e) {
            var t = "function" == typeof o[e] ? o[e] : r[e];
            a && t && !t[s] && i.f(t, s, {
                configurable: !0,
                get: function() {
                    return this;
                }
            });
        };
    }, {
        "./_core": 85,
        "./_descriptors": 89,
        "./_global": 96,
        "./_object-dp": 118,
        "./_wks": 149
    } ],
    134: [ function(e, t, n) {
        var r = e("./_object-dp").f, o = e("./_has"), i = e("./_wks")("toStringTag");
        t.exports = function(e, t, n) {
            e && !o(e = n ? e : e.prototype, i) && r(e, i, {
                configurable: !0,
                value: t
            });
        };
    }, {
        "./_has": 97,
        "./_object-dp": 118,
        "./_wks": 149
    } ],
    135: [ function(e, t, n) {
        var r = e("./_shared")("keys"), o = e("./_uid");
        t.exports = function(e) {
            return r[e] || (r[e] = o(e));
        };
    }, {
        "./_shared": 136,
        "./_uid": 146
    } ],
    136: [ function(e, t, n) {
        var r = e("./_global"), o = "__core-js_shared__", i = r[o] || (r[o] = {});
        t.exports = function(e) {
            return i[e] || (i[e] = {});
        };
    }, {
        "./_global": 96
    } ],
    137: [ function(e, t, n) {
        var r = e("./_an-object"), o = e("./_a-function"), i = e("./_wks")("species");
        t.exports = function(e, t) {
            var n, a = r(e).constructor;
            return void 0 === a || void 0 == (n = r(a)[i]) ? t : o(n);
        };
    }, {
        "./_a-function": 71,
        "./_an-object": 74,
        "./_wks": 149
    } ],
    138: [ function(e, t, n) {
        var r = e("./_to-integer"), o = e("./_defined");
        t.exports = function(e) {
            return function(t, n) {
                var i, a, s = String(o(t)), c = r(n), l = s.length;
                return c < 0 || c >= l ? e ? "" : void 0 : (i = s.charCodeAt(c), i < 55296 || i > 56319 || c + 1 === l || (a = s.charCodeAt(c + 1)) < 56320 || a > 57343 ? e ? s.charAt(c) : i : e ? s.slice(c, c + 2) : (i - 55296 << 10) + (a - 56320) + 65536);
            };
        };
    }, {
        "./_defined": 88,
        "./_to-integer": 141
    } ],
    139: [ function(e, t, n) {
        var r, o, i, a = e("./_ctx"), s = e("./_invoke"), c = e("./_html"), l = e("./_dom-create"), u = e("./_global"), d = u.process, f = u.setImmediate, p = u.clearImmediate, m = u.MessageChannel, h = 0, g = {}, b = "onreadystatechange", v = function() {
            var e = +this;
            if (g.hasOwnProperty(e)) {
                var t = g[e];
                delete g[e], t();
            }
        }, _ = function(e) {
            v.call(e.data);
        };
        f && p || (f = function(e) {
            for (var t = [], n = 1; arguments.length > n; ) t.push(arguments[n++]);
            return g[++h] = function() {
                s("function" == typeof e ? e : Function(e), t);
            }, r(h), h;
        }, p = function(e) {
            delete g[e];
        }, "process" == e("./_cof")(d) ? r = function(e) {
            d.nextTick(a(v, e, 1));
        } : m ? (o = new m(), i = o.port2, o.port1.onmessage = _, r = a(i.postMessage, i, 1)) : u.addEventListener && "function" == typeof postMessage && !u.importScripts ? (r = function(e) {
            u.postMessage(e + "", "*");
        }, u.addEventListener("message", _, !1)) : r = b in l("script") ? function(e) {
            c.appendChild(l("script"))[b] = function() {
                c.removeChild(this), v.call(e);
            };
        } : function(e) {
            setTimeout(a(v, e, 1), 0);
        }), t.exports = {
            set: f,
            clear: p
        };
    }, {
        "./_cof": 81,
        "./_ctx": 87,
        "./_dom-create": 90,
        "./_global": 96,
        "./_html": 99,
        "./_invoke": 101
    } ],
    140: [ function(e, t, n) {
        var r = e("./_to-integer"), o = Math.max, i = Math.min;
        t.exports = function(e, t) {
            return e = r(e), e < 0 ? o(e + t, 0) : i(e, t);
        };
    }, {
        "./_to-integer": 141
    } ],
    141: [ function(e, t, n) {
        var r = Math.ceil, o = Math.floor;
        t.exports = function(e) {
            return isNaN(e = +e) ? 0 : (e > 0 ? o : r)(e);
        };
    }, {} ],
    142: [ function(e, t, n) {
        var r = e("./_iobject"), o = e("./_defined");
        t.exports = function(e) {
            return r(o(e));
        };
    }, {
        "./_defined": 88,
        "./_iobject": 102
    } ],
    143: [ function(e, t, n) {
        var r = e("./_to-integer"), o = Math.min;
        t.exports = function(e) {
            return e > 0 ? o(r(e), 9007199254740991) : 0;
        };
    }, {
        "./_to-integer": 141
    } ],
    144: [ function(e, t, n) {
        var r = e("./_defined");
        t.exports = function(e) {
            return Object(r(e));
        };
    }, {
        "./_defined": 88
    } ],
    145: [ function(e, t, n) {
        var r = e("./_is-object");
        t.exports = function(e, t) {
            if (!r(e)) return e;
            var n, o;
            if (t && "function" == typeof (n = e.toString) && !r(o = n.call(e))) return o;
            if ("function" == typeof (n = e.valueOf) && !r(o = n.call(e))) return o;
            if (!t && "function" == typeof (n = e.toString) && !r(o = n.call(e))) return o;
            throw TypeError("Can't convert object to primitive value");
        };
    }, {
        "./_is-object": 105
    } ],
    146: [ function(e, t, n) {
        var r = 0, o = Math.random();
        t.exports = function(e) {
            return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++r + o).toString(36));
        };
    }, {} ],
    147: [ function(e, t, n) {
        var r = e("./_global"), o = e("./_core"), i = e("./_library"), a = e("./_wks-ext"), s = e("./_object-dp").f;
        t.exports = function(e) {
            var t = o.Symbol || (o.Symbol = i ? {} : r.Symbol || {});
            "_" == e.charAt(0) || e in t || s(t, e, {
                value: a.f(e)
            });
        };
    }, {
        "./_core": 85,
        "./_global": 96,
        "./_library": 113,
        "./_object-dp": 118,
        "./_wks-ext": 148
    } ],
    148: [ function(e, t, n) {
        n.f = e("./_wks");
    }, {
        "./_wks": 149
    } ],
    149: [ function(e, t, n) {
        var r = e("./_shared")("wks"), o = e("./_uid"), i = e("./_global").Symbol, a = "function" == typeof i, s = t.exports = function(e) {
            return r[e] || (r[e] = a && i[e] || (a ? i : o)("Symbol." + e));
        };
        s.store = r;
    }, {
        "./_global": 96,
        "./_shared": 136,
        "./_uid": 146
    } ],
    150: [ function(e, t, n) {
        var r = e("./_classof"), o = e("./_wks")("iterator"), i = e("./_iterators");
        t.exports = e("./_core").getIteratorMethod = function(e) {
            if (void 0 != e) return e[o] || e["@@iterator"] || i[r(e)];
        };
    }, {
        "./_classof": 80,
        "./_core": 85,
        "./_iterators": 111,
        "./_wks": 149
    } ],
    151: [ function(e, t, n) {
        var r = e("./_an-object"), o = e("./core.get-iterator-method");
        t.exports = e("./_core").getIterator = function(e) {
            var t = o(e);
            if ("function" != typeof t) throw TypeError(e + " is not iterable!");
            return r(t.call(e));
        };
    }, {
        "./_an-object": 74,
        "./_core": 85,
        "./core.get-iterator-method": 150
    } ],
    152: [ function(e, t, n) {
        var r = e("./_classof"), o = e("./_wks")("iterator"), i = e("./_iterators");
        t.exports = e("./_core").isIterable = function(e) {
            var t = Object(e);
            return void 0 !== t[o] || "@@iterator" in t || i.hasOwnProperty(r(t));
        };
    }, {
        "./_classof": 80,
        "./_core": 85,
        "./_iterators": 111,
        "./_wks": 149
    } ],
    153: [ function(e, t, n) {
        "use strict";
        var r = e("./_ctx"), o = e("./_export"), i = e("./_to-object"), a = e("./_iter-call"), s = e("./_is-array-iter"), c = e("./_to-length"), l = e("./_create-property"), u = e("./core.get-iterator-method");
        o(o.S + o.F * !e("./_iter-detect")(function(e) {
            Array.from(e);
        }), "Array", {
            from: function(e) {
                var t, n, o, d, f = i(e), p = "function" == typeof this ? this : Array, m = arguments.length, h = m > 1 ? arguments[1] : void 0, g = void 0 !== h, b = 0, v = u(f);
                if (g && (h = r(h, m > 2 ? arguments[2] : void 0, 2)), void 0 == v || p == Array && s(v)) for (t = c(f.length), 
                n = new p(t); t > b; b++) l(n, b, g ? h(f[b], b) : f[b]); else for (d = v.call(f), 
                n = new p(); !(o = d.next()).done; b++) l(n, b, g ? a(d, h, [ o.value, b ], !0) : o.value);
                return n.length = b, n;
            }
        });
    }, {
        "./_create-property": 86,
        "./_ctx": 87,
        "./_export": 93,
        "./_is-array-iter": 103,
        "./_iter-call": 106,
        "./_iter-detect": 109,
        "./_to-length": 143,
        "./_to-object": 144,
        "./core.get-iterator-method": 150
    } ],
    154: [ function(e, t, n) {
        "use strict";
        var r = e("./_add-to-unscopables"), o = e("./_iter-step"), i = e("./_iterators"), a = e("./_to-iobject");
        t.exports = e("./_iter-define")(Array, "Array", function(e, t) {
            this._t = a(e), this._i = 0, this._k = t;
        }, function() {
            var e = this._t, t = this._k, n = this._i++;
            return !e || n >= e.length ? (this._t = void 0, o(1)) : "keys" == t ? o(0, n) : "values" == t ? o(0, e[n]) : o(0, [ n, e[n] ]);
        }, "values"), i.Arguments = i.Array, r("keys"), r("values"), r("entries");
    }, {
        "./_add-to-unscopables": 72,
        "./_iter-define": 108,
        "./_iter-step": 110,
        "./_iterators": 111,
        "./_to-iobject": 142
    } ],
    155: [ function(e, t, n) {
        "use strict";
        var r = e("./_collection-strong");
        t.exports = e("./_collection")("Map", function(e) {
            return function() {
                return e(this, arguments.length > 0 ? arguments[0] : void 0);
            };
        }, {
            get: function(e) {
                var t = r.getEntry(this, e);
                return t && t.v;
            },
            set: function(e, t) {
                return r.def(this, 0 === e ? 0 : e, t);
            }
        }, r, !0);
    }, {
        "./_collection": 84,
        "./_collection-strong": 82
    } ],
    156: [ function(e, t, n) {
        var r = e("./_export");
        r(r.S + r.F, "Object", {
            assign: e("./_object-assign")
        });
    }, {
        "./_export": 93,
        "./_object-assign": 116
    } ],
    157: [ function(e, t, n) {
        var r = e("./_export");
        r(r.S, "Object", {
            create: e("./_object-create")
        });
    }, {
        "./_export": 93,
        "./_object-create": 117
    } ],
    158: [ function(e, t, n) {
        var r = e("./_export");
        r(r.S + r.F * !e("./_descriptors"), "Object", {
            defineProperty: e("./_object-dp").f
        });
    }, {
        "./_descriptors": 89,
        "./_export": 93,
        "./_object-dp": 118
    } ],
    159: [ function(e, t, n) {
        var r = e("./_to-object"), o = e("./_object-gpo");
        e("./_object-sap")("getPrototypeOf", function() {
            return function(e) {
                return o(r(e));
            };
        });
    }, {
        "./_object-gpo": 124,
        "./_object-sap": 128,
        "./_to-object": 144
    } ],
    160: [ function(e, t, n) {
        var r = e("./_to-object"), o = e("./_object-keys");
        e("./_object-sap")("keys", function() {
            return function(e) {
                return o(r(e));
            };
        });
    }, {
        "./_object-keys": 126,
        "./_object-sap": 128,
        "./_to-object": 144
    } ],
    161: [ function(e, t, n) {
        var r = e("./_export");
        r(r.S, "Object", {
            setPrototypeOf: e("./_set-proto").set
        });
    }, {
        "./_export": 93,
        "./_set-proto": 132
    } ],
    162: [ function(e, t, n) {}, {} ],
    163: [ function(e, t, n) {
        "use strict";
        var r, o, i, a = e("./_library"), s = e("./_global"), c = e("./_ctx"), l = e("./_classof"), u = e("./_export"), d = e("./_is-object"), f = e("./_a-function"), p = e("./_an-instance"), m = e("./_for-of"), h = e("./_species-constructor"), g = e("./_task").set, b = e("./_microtask")(), v = "Promise", _ = s.TypeError, y = s.process, w = s[v], y = s.process, k = "process" == l(y), C = function() {}, x = !!function() {
            try {
                var t = w.resolve(1), n = (t.constructor = {})[e("./_wks")("species")] = function(e) {
                    e(C, C);
                };
                return (k || "function" == typeof PromiseRejectionEvent) && t.then(C) instanceof n;
            } catch (r) {}
        }(), E = function(e, t) {
            return e === t || e === w && t === i;
        }, S = function(e) {
            var t;
            return !(!d(e) || "function" != typeof (t = e.then)) && t;
        }, T = function(e) {
            return E(w, e) ? new N(e) : new o(e);
        }, N = o = function(e) {
            var t, n;
            this.promise = new e(function(e, r) {
                if (void 0 !== t || void 0 !== n) throw _("Bad Promise constructor");
                t = e, n = r;
            }), this.resolve = f(t), this.reject = f(n);
        }, P = function(e) {
            try {
                e();
            } catch (t) {
                return {
                    error: t
                };
            }
        }, A = function(e, t) {
            if (!e._n) {
                e._n = !0;
                var n = e._c;
                b(function() {
                    for (var r = e._v, o = 1 == e._s, i = 0, a = function(t) {
                        var n, i, a = o ? t.ok : t.fail, s = t.resolve, c = t.reject, l = t.domain;
                        try {
                            a ? (o || (2 == e._h && L(e), e._h = 1), a === !0 ? n = r : (l && l.enter(), n = a(r), 
                            l && l.exit()), n === t.promise ? c(_("Promise-chain cycle")) : (i = S(n)) ? i.call(n, s, c) : s(n)) : c(r);
                        } catch (u) {
                            c(u);
                        }
                    }; n.length > i; ) a(n[i++]);
                    e._c = [], e._n = !1, t && !e._h && j(e);
                });
            }
        }, j = function(e) {
            g.call(s, function() {
                var t, n, r, o = e._v;
                if (I(e) && (t = P(function() {
                    k ? y.emit("unhandledRejection", o, e) : (n = s.onunhandledrejection) ? n({
                        promise: e,
                        reason: o
                    }) : (r = s.console) && r.error && r.error("Unhandled promise rejection", o);
                }), e._h = k || I(e) ? 2 : 1), e._a = void 0, t) throw t.error;
            });
        }, I = function(e) {
            if (1 == e._h) return !1;
            for (var t, n = e._a || e._c, r = 0; n.length > r; ) if (t = n[r++], t.fail || !I(t.promise)) return !1;
            return !0;
        }, L = function(e) {
            g.call(s, function() {
                var t;
                k ? y.emit("rejectionHandled", e) : (t = s.onrejectionhandled) && t({
                    promise: e,
                    reason: e._v
                });
            });
        }, M = function(e) {
            var t = this;
            t._d || (t._d = !0, t = t._w || t, t._v = e, t._s = 2, t._a || (t._a = t._c.slice()), 
            A(t, !0));
        }, R = function(e) {
            var t, n = this;
            if (!n._d) {
                n._d = !0, n = n._w || n;
                try {
                    if (n === e) throw _("Promise can't be resolved itself");
                    (t = S(e)) ? b(function() {
                        var r = {
                            _w: n,
                            _d: !1
                        };
                        try {
                            t.call(e, c(R, r, 1), c(M, r, 1));
                        } catch (o) {
                            M.call(r, o);
                        }
                    }) : (n._v = e, n._s = 1, A(n, !1));
                } catch (r) {
                    M.call({
                        _w: n,
                        _d: !1
                    }, r);
                }
            }
        };
        x || (w = function(e) {
            p(this, w, v, "_h"), f(e), r.call(this);
            try {
                e(c(R, this, 1), c(M, this, 1));
            } catch (t) {
                M.call(this, t);
            }
        }, r = function(e) {
            this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, 
            this._n = !1;
        }, r.prototype = e("./_redefine-all")(w.prototype, {
            then: function(e, t) {
                var n = T(h(this, w));
                return n.ok = "function" != typeof e || e, n.fail = "function" == typeof t && t, 
                n.domain = k ? y.domain : void 0, this._c.push(n), this._a && this._a.push(n), this._s && A(this, !1), 
                n.promise;
            },
            "catch": function(e) {
                return this.then(void 0, e);
            }
        }), N = function() {
            var e = new r();
            this.promise = e, this.resolve = c(R, e, 1), this.reject = c(M, e, 1);
        }), u(u.G + u.W + u.F * !x, {
            Promise: w
        }), e("./_set-to-string-tag")(w, v), e("./_set-species")(v), i = e("./_core")[v], 
        u(u.S + u.F * !x, v, {
            reject: function(e) {
                var t = T(this), n = t.reject;
                return n(e), t.promise;
            }
        }), u(u.S + u.F * (a || !x), v, {
            resolve: function(e) {
                if (e instanceof w && E(e.constructor, this)) return e;
                var t = T(this), n = t.resolve;
                return n(e), t.promise;
            }
        }), u(u.S + u.F * !(x && e("./_iter-detect")(function(e) {
            w.all(e)["catch"](C);
        })), v, {
            all: function(e) {
                var t = this, n = T(t), r = n.resolve, o = n.reject, i = P(function() {
                    var n = [], i = 0, a = 1;
                    m(e, !1, function(e) {
                        var s = i++, c = !1;
                        n.push(void 0), a++, t.resolve(e).then(function(e) {
                            c || (c = !0, n[s] = e, --a || r(n));
                        }, o);
                    }), --a || r(n);
                });
                return i && o(i.error), n.promise;
            },
            race: function(e) {
                var t = this, n = T(t), r = n.reject, o = P(function() {
                    m(e, !1, function(e) {
                        t.resolve(e).then(n.resolve, r);
                    });
                });
                return o && r(o.error), n.promise;
            }
        });
    }, {
        "./_a-function": 71,
        "./_an-instance": 73,
        "./_classof": 80,
        "./_core": 85,
        "./_ctx": 87,
        "./_export": 93,
        "./_for-of": 95,
        "./_global": 96,
        "./_is-object": 105,
        "./_iter-detect": 109,
        "./_library": 113,
        "./_microtask": 115,
        "./_redefine-all": 130,
        "./_set-species": 133,
        "./_set-to-string-tag": 134,
        "./_species-constructor": 137,
        "./_task": 139,
        "./_wks": 149
    } ],
    164: [ function(e, t, n) {
        "use strict";
        var r = e("./_string-at")(!0);
        e("./_iter-define")(String, "String", function(e) {
            this._t = String(e), this._i = 0;
        }, function() {
            var e, t = this._t, n = this._i;
            return n >= t.length ? {
                value: void 0,
                done: !0
            } : (e = r(t, n), this._i += e.length, {
                value: e,
                done: !1
            });
        });
    }, {
        "./_iter-define": 108,
        "./_string-at": 138
    } ],
    165: [ function(e, t, n) {
        "use strict";
        var r = e("./_global"), o = e("./_has"), i = e("./_descriptors"), a = e("./_export"), s = e("./_redefine"), c = e("./_meta").KEY, l = e("./_fails"), u = e("./_shared"), d = e("./_set-to-string-tag"), f = e("./_uid"), p = e("./_wks"), m = e("./_wks-ext"), h = e("./_wks-define"), g = e("./_keyof"), b = e("./_enum-keys"), v = e("./_is-array"), _ = e("./_an-object"), y = e("./_to-iobject"), w = e("./_to-primitive"), k = e("./_property-desc"), C = e("./_object-create"), x = e("./_object-gopn-ext"), E = e("./_object-gopd"), S = e("./_object-dp"), T = e("./_object-keys"), N = E.f, P = S.f, A = x.f, j = r.Symbol, I = r.JSON, L = I && I.stringify, M = "prototype", R = p("_hidden"), O = p("toPrimitive"), D = {}.propertyIsEnumerable, F = u("symbol-registry"), B = u("symbols"), U = u("op-symbols"), W = Object[M], V = "function" == typeof j, G = r.QObject, z = !G || !G[M] || !G[M].findChild, H = i && l(function() {
            return 7 != C(P({}, "a", {
                get: function() {
                    return P(this, "a", {
                        value: 7
                    }).a;
                }
            })).a;
        }) ? function(e, t, n) {
            var r = N(W, t);
            r && delete W[t], P(e, t, n), r && e !== W && P(W, t, r);
        } : P, q = function(e) {
            var t = B[e] = C(j[M]);
            return t._k = e, t;
        }, K = V && "symbol" == typeof j.iterator ? function(e) {
            return "symbol" == typeof e;
        } : function(e) {
            return e instanceof j;
        }, Y = function(e, t, n) {
            return e === W && Y(U, t, n), _(e), t = w(t, !0), _(n), o(B, t) ? (n.enumerable ? (o(e, R) && e[R][t] && (e[R][t] = !1), 
            n = C(n, {
                enumerable: k(0, !1)
            })) : (o(e, R) || P(e, R, k(1, {})), e[R][t] = !0), H(e, t, n)) : P(e, t, n);
        }, Q = function(e, t) {
            _(e);
            for (var n, r = b(t = y(t)), o = 0, i = r.length; i > o; ) Y(e, n = r[o++], t[n]);
            return e;
        }, J = function(e, t) {
            return void 0 === t ? C(e) : Q(C(e), t);
        }, X = function(e) {
            var t = D.call(this, e = w(e, !0));
            return !(this === W && o(B, e) && !o(U, e)) && (!(t || !o(this, e) || !o(B, e) || o(this, R) && this[R][e]) || t);
        }, $ = function(e, t) {
            if (e = y(e), t = w(t, !0), e !== W || !o(B, t) || o(U, t)) {
                var n = N(e, t);
                return !n || !o(B, t) || o(e, R) && e[R][t] || (n.enumerable = !0), n;
            }
        }, Z = function(e) {
            for (var t, n = A(y(e)), r = [], i = 0; n.length > i; ) o(B, t = n[i++]) || t == R || t == c || r.push(t);
            return r;
        }, ee = function(e) {
            for (var t, n = e === W, r = A(n ? U : y(e)), i = [], a = 0; r.length > a; ) !o(B, t = r[a++]) || n && !o(W, t) || i.push(B[t]);
            return i;
        };
        V || (j = function() {
            if (this instanceof j) throw TypeError("Symbol is not a constructor!");
            var e = f(arguments.length > 0 ? arguments[0] : void 0), t = function(n) {
                this === W && t.call(U, n), o(this, R) && o(this[R], e) && (this[R][e] = !1), H(this, e, k(1, n));
            };
            return i && z && H(W, e, {
                configurable: !0,
                set: t
            }), q(e);
        }, s(j[M], "toString", function() {
            return this._k;
        }), E.f = $, S.f = Y, e("./_object-gopn").f = x.f = Z, e("./_object-pie").f = X, 
        e("./_object-gops").f = ee, i && !e("./_library") && s(W, "propertyIsEnumerable", X, !0), 
        m.f = function(e) {
            return q(p(e));
        }), a(a.G + a.W + a.F * !V, {
            Symbol: j
        });
        for (var te = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), ne = 0; te.length > ne; ) p(te[ne++]);
        for (var te = T(p.store), ne = 0; te.length > ne; ) h(te[ne++]);
        a(a.S + a.F * !V, "Symbol", {
            "for": function(e) {
                return o(F, e += "") ? F[e] : F[e] = j(e);
            },
            keyFor: function(e) {
                if (K(e)) return g(F, e);
                throw TypeError(e + " is not a symbol!");
            },
            useSetter: function() {
                z = !0;
            },
            useSimple: function() {
                z = !1;
            }
        }), a(a.S + a.F * !V, "Object", {
            create: J,
            defineProperty: Y,
            defineProperties: Q,
            getOwnPropertyDescriptor: $,
            getOwnPropertyNames: Z,
            getOwnPropertySymbols: ee
        }), I && a(a.S + a.F * (!V || l(function() {
            var e = j();
            return "[null]" != L([ e ]) || "{}" != L({
                a: e
            }) || "{}" != L(Object(e));
        })), "JSON", {
            stringify: function(e) {
                if (void 0 !== e && !K(e)) {
                    for (var t, n, r = [ e ], o = 1; arguments.length > o; ) r.push(arguments[o++]);
                    return t = r[1], "function" == typeof t && (n = t), !n && v(t) || (t = function(e, t) {
                        if (n && (t = n.call(this, e, t)), !K(t)) return t;
                    }), r[1] = t, L.apply(I, r);
                }
            }
        }), j[M][O] || e("./_hide")(j[M], O, j[M].valueOf), d(j, "Symbol"), d(Math, "Math", !0), 
        d(r.JSON, "JSON", !0);
    }, {
        "./_an-object": 74,
        "./_descriptors": 89,
        "./_enum-keys": 92,
        "./_export": 93,
        "./_fails": 94,
        "./_global": 96,
        "./_has": 97,
        "./_hide": 98,
        "./_is-array": 104,
        "./_keyof": 112,
        "./_library": 113,
        "./_meta": 114,
        "./_object-create": 117,
        "./_object-dp": 118,
        "./_object-gopd": 120,
        "./_object-gopn": 122,
        "./_object-gopn-ext": 121,
        "./_object-gops": 123,
        "./_object-keys": 126,
        "./_object-pie": 127,
        "./_property-desc": 129,
        "./_redefine": 131,
        "./_set-to-string-tag": 134,
        "./_shared": 136,
        "./_to-iobject": 142,
        "./_to-primitive": 145,
        "./_uid": 146,
        "./_wks": 149,
        "./_wks-define": 147,
        "./_wks-ext": 148
    } ],
    166: [ function(e, t, n) {
        var r = e("./_export");
        r(r.P + r.R, "Map", {
            toJSON: e("./_collection-to-json")("Map")
        });
    }, {
        "./_collection-to-json": 83,
        "./_export": 93
    } ],
    167: [ function(e, t, n) {
        e("./_wks-define")("asyncIterator");
    }, {
        "./_wks-define": 147
    } ],
    168: [ function(e, t, n) {
        e("./_wks-define")("observable");
    }, {
        "./_wks-define": 147
    } ],
    169: [ function(e, t, n) {
        e("./es6.array.iterator");
        for (var r = e("./_global"), o = e("./_hide"), i = e("./_iterators"), a = e("./_wks")("toStringTag"), s = [ "NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList" ], c = 0; c < 5; c++) {
            var l = s[c], u = r[l], d = u && u.prototype;
            d && !d[a] && o(d, a, l), i[l] = i.Array;
        }
    }, {
        "./_global": 96,
        "./_hide": 98,
        "./_iterators": 111,
        "./_wks": 149,
        "./es6.array.iterator": 154
    } ],
    170: [ function(e, t, n) {
        function r() {
            throw new Error("setTimeout has not been defined");
        }
        function o() {
            throw new Error("clearTimeout has not been defined");
        }
        function i(e) {
            if (d === setTimeout) return setTimeout(e, 0);
            if ((d === r || !d) && setTimeout) return d = setTimeout, setTimeout(e, 0);
            try {
                return d(e, 0);
            } catch (t) {
                try {
                    return d.call(null, e, 0);
                } catch (t) {
                    return d.call(this, e, 0);
                }
            }
        }
        function a(e) {
            if (f === clearTimeout) return clearTimeout(e);
            if ((f === o || !f) && clearTimeout) return f = clearTimeout, clearTimeout(e);
            try {
                return f(e);
            } catch (t) {
                try {
                    return f.call(null, e);
                } catch (t) {
                    return f.call(this, e);
                }
            }
        }
        function s() {
            g && m && (g = !1, m.length ? h = m.concat(h) : b = -1, h.length && c());
        }
        function c() {
            if (!g) {
                var e = i(s);
                g = !0;
                for (var t = h.length; t; ) {
                    for (m = h, h = []; ++b < t; ) m && m[b].run();
                    b = -1, t = h.length;
                }
                m = null, g = !1, a(e);
            }
        }
        function l(e, t) {
            this.fun = e, this.array = t;
        }
        function u() {}
        var d, f, p = t.exports = {};
        !function() {
            try {
                d = "function" == typeof setTimeout ? setTimeout : r;
            } catch (e) {
                d = r;
            }
            try {
                f = "function" == typeof clearTimeout ? clearTimeout : o;
            } catch (e) {
                f = o;
            }
        }();
        var m, h = [], g = !1, b = -1;
        p.nextTick = function(e) {
            var t = new Array(arguments.length - 1);
            if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
            h.push(new l(e, t)), 1 !== h.length || g || i(c);
        }, l.prototype.run = function() {
            this.fun.apply(null, this.array);
        }, p.title = "browser", p.browser = !0, p.env = {}, p.argv = [], p.version = "", 
        p.versions = {}, p.on = u, p.addListener = u, p.once = u, p.off = u, p.removeListener = u, 
        p.removeAllListeners = u, p.emit = u, p.binding = function(e) {
            throw new Error("process.binding is not supported");
        }, p.cwd = function() {
            return "/";
        }, p.chdir = function(e) {
            throw new Error("process.chdir is not supported");
        }, p.umask = function() {
            return 0;
        };
    }, {} ],
    171: [ function(e, t, n) {
        t.exports = e("./lib/effects");
    }, {
        "./lib/effects": 172
    } ],
    172: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.select = n.cancel = n.join = n.fork = n.cps = n.apply = n.call = n.race = n.put = n.take = void 0;
        var r = e("./internal/io");
        n.take = r.take, n.put = r.put, n.race = r.race, n.call = r.call, n.apply = r.apply, 
        n.cps = r.cps, n.fork = r.fork, n.join = r.join, n.cancel = r.cancel, n.select = r.select;
    }, {
        "./internal/io": 173
    } ],
    173: [ function(e, t, n) {
        "use strict";
        function r(e, t, n) {
            return t in e ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e;
        }
        function o(e) {
            return ("*" === e ? M.wildcard : b.is.array(e) ? M.array : b.is.func(e) ? M.predicate : M["default"])(e);
        }
        function i(e) {
            if (arguments.length > 0 && b.is.undef(e)) throw new Error(w);
            return L(x, b.is.undef(e) ? "*" : e);
        }
        function a(e) {
            return L(E, e);
        }
        function s(e) {
            return L(S, e);
        }
        function c(e, t) {
            (0, b.check)(e, b.is.notUndef, v);
            var n = null;
            if (b.is.array(e)) {
                var r = e, o = g(r, 2);
                n = o[0], e = o[1];
            } else if (e.fn) {
                var i = e;
                n = i.context, e = i.fn;
            }
            return (0, b.check)(e, b.is.func, v), {
                context: n,
                fn: e,
                args: t
            };
        }
        function l(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            return L(T, c(e, n));
        }
        function u(e, t) {
            var n = arguments.length <= 2 || void 0 === arguments[2] ? [] : arguments[2];
            return L(T, c({
                context: e,
                fn: t
            }, n));
        }
        function d(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            return L(N, c(e, n));
        }
        function f(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            return L(P, c(e, n));
        }
        function p(e) {
            if (!R(e)) throw new Error(_);
            return L(A, e);
        }
        function m(e) {
            if (!R(e)) throw new Error(y);
            return L(j, e);
        }
        function h(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            return 0 === arguments.length ? e = b.ident : (0, b.check)(e, b.is.func, k), L(I, {
                selector: e,
                args: n
            });
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.asEffect = n.SELECT_ARG_ERROR = n.INVALID_PATTERN = n.CANCEL_ARG_ERROR = n.JOIN_ARG_ERROR = n.FORK_ARG_ERROR = n.CALL_FUNCTION_ARG_ERROR = void 0;
        var g = function() {
            function e(e, t) {
                var n = [], r = !0, o = !1, i = void 0;
                try {
                    for (var a, s = e[Symbol.iterator](); !(r = (a = s.next()).done) && (n.push(a.value), 
                    !t || n.length !== t); r = !0) ;
                } catch (c) {
                    o = !0, i = c;
                } finally {
                    try {
                        !r && s["return"] && s["return"]();
                    } finally {
                        if (o) throw i;
                    }
                }
                return n;
            }
            return function(t, n) {
                if (Array.isArray(t)) return t;
                if (Symbol.iterator in Object(t)) return e(t, n);
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            };
        }();
        n.matcher = o, n.take = i, n.put = a, n.race = s, n.call = l, n.apply = u, n.cps = d, 
        n.fork = f, n.join = p, n.cancel = m, n.select = h;
        var b = e("./utils"), v = n.CALL_FUNCTION_ARG_ERROR = "call/cps/fork first argument must be a function, an array [context, function] or an object {context, fn}", _ = (n.FORK_ARG_ERROR = "fork first argument must be a generator function or an iterator", 
        n.JOIN_ARG_ERROR = "join argument must be a valid task (a result of a fork)"), y = n.CANCEL_ARG_ERROR = "cancel argument must be a valid task (a result of a fork)", w = n.INVALID_PATTERN = "Invalid pattern passed to `take` (HINT: check if you didn't mispell a constant)", k = n.SELECT_ARG_ERROR = "select first argument must be a function", C = (0, 
        b.sym)("IO"), x = "TAKE", E = "PUT", S = "RACE", T = "CALL", N = "CPS", P = "FORK", A = "JOIN", j = "CANCEL", I = "SELECT", L = function(e, t) {
            var n;
            return n = {}, r(n, C, !0), r(n, e, t), n;
        }, M = {
            wildcard: function() {
                return b.kTrue;
            },
            "default": function(e) {
                return function(t) {
                    return t.type === e;
                };
            },
            array: function(e) {
                return function(t) {
                    return e.some(function(e) {
                        return e === t.type;
                    });
                };
            },
            predicate: function(e) {
                return function(t) {
                    return e(t);
                };
            }
        }, R = function(e) {
            return e[b.TASK];
        };
        n.asEffect = {
            take: function(e) {
                return e && e[C] && e[x];
            },
            put: function(e) {
                return e && e[C] && e[E];
            },
            race: function(e) {
                return e && e[C] && e[S];
            },
            call: function(e) {
                return e && e[C] && e[T];
            },
            cps: function(e) {
                return e && e[C] && e[N];
            },
            fork: function(e) {
                return e && e[C] && e[P];
            },
            join: function(e) {
                return e && e[C] && e[A];
            },
            cancel: function(e) {
                return e && e[C] && e[j];
            },
            select: function(e) {
                return e && e[C] && e[I];
            }
        };
    }, {
        "./utils": 174
    } ],
    174: [ function(e, t, n) {
        (function(e) {
            "use strict";
            function t(e) {
                return e;
            }
            function r(e, t, n) {
                if (!t(e)) throw new Error(n);
            }
            function o(e, t) {
                var n = e.indexOf(t);
                n >= 0 && e.splice(n, 1);
            }
            function i() {
                var e = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0], t = u({}, e), n = new Promise(function(e, n) {
                    t.resolve = e, t.reject = n;
                });
                return t.promise = n, t;
            }
            function a(e) {
                for (var t = [], n = 0; n < e; n++) t.push(i());
                return t;
            }
            function s() {
                var e = arguments.length <= 0 || void 0 === arguments[0] ? 0 : arguments[0];
                return function() {
                    return ++e;
                };
            }
            function c(e) {
                return Promise.resolve(1).then(function() {
                    return e();
                });
            }
            function l(e) {
                p && console.warn("DEPRECATION WARNING", e);
            }
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var u = Object.assign || function(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
            };
            n.ident = t, n.check = r, n.remove = o, n.deferred = i, n.arrayOfDeffered = a, n.autoInc = s, 
            n.asap = c, n.warnDeprecated = l;
            var d = n.sym = function(e) {
                return "@@redux-saga/" + e;
            }, f = n.TASK = d("TASK"), p = (n.kTrue = function() {
                return !0;
            }, n.noop = function() {}, n.isDev = "undefined" != typeof e && e.env && "development" === e.env.NODE_ENV), m = n.is = {
                undef: function(e) {
                    return null === e || void 0 === e;
                },
                notUndef: function(e) {
                    return null !== e && void 0 !== e;
                },
                func: function(e) {
                    return "function" == typeof e;
                },
                array: Array.isArray,
                promise: function(e) {
                    return e && m.func(e.then);
                },
                iterator: function(e) {
                    return e && m.func(e.next) && m.func(e["throw"]);
                },
                task: function(e) {
                    return e && e[f];
                }
            };
        }).call(this, e("_process"));
    }, {
        _process: 170
    } ],
    175: [ function(e, t, n) {
        (function(n) {
            var r = "object" == typeof n ? n : "object" == typeof window ? window : "object" == typeof self ? self : this, o = r.regeneratorRuntime && Object.getOwnPropertyNames(r).indexOf("regeneratorRuntime") >= 0, i = o && r.regeneratorRuntime;
            if (r.regeneratorRuntime = void 0, t.exports = e("./runtime"), o) r.regeneratorRuntime = i; else try {
                delete r.regeneratorRuntime;
            } catch (a) {
                r.regeneratorRuntime = void 0;
            }
        }).call(this, "undefined" != typeof window ? window : {});
    }, {
        "./runtime": 176
    } ],
    176: [ function(e, t, n) {
        (function(e, n) {
            !function(n) {
                "use strict";
                function r(e, t, n, r) {
                    var o = t && t.prototype instanceof i ? t : i, a = Object.create(o.prototype), s = new m(r || []);
                    return a._invoke = u(e, n, s), a;
                }
                function o(e, t, n) {
                    try {
                        return {
                            type: "normal",
                            arg: e.call(t, n)
                        };
                    } catch (r) {
                        return {
                            type: "throw",
                            arg: r
                        };
                    }
                }
                function i() {}
                function a() {}
                function s() {}
                function c(e) {
                    [ "next", "throw", "return" ].forEach(function(t) {
                        e[t] = function(e) {
                            return this._invoke(t, e);
                        };
                    });
                }
                function l(t) {
                    function n(e, r, i, a) {
                        var s = o(t[e], t, r);
                        if ("throw" !== s.type) {
                            var c = s.arg, l = c.value;
                            return l && "object" == typeof l && _.call(l, "__await") ? Promise.resolve(l.__await).then(function(e) {
                                n("next", e, i, a);
                            }, function(e) {
                                n("throw", e, i, a);
                            }) : Promise.resolve(l).then(function(e) {
                                c.value = e, i(c);
                            }, a);
                        }
                        a(s.arg);
                    }
                    function r(e, t) {
                        function r() {
                            return new Promise(function(r, o) {
                                n(e, t, r, o);
                            });
                        }
                        return i = i ? i.then(r, r) : r();
                    }
                    "object" == typeof e && e.domain && (n = e.domain.bind(n));
                    var i;
                    this._invoke = r;
                }
                function u(e, t, n) {
                    var r = E;
                    return function(i, a) {
                        if (r === T) throw new Error("Generator is already running");
                        if (r === N) {
                            if ("throw" === i) throw a;
                            return g();
                        }
                        for (n.method = i, n.arg = a; ;) {
                            var s = n.delegate;
                            if (s) {
                                var c = d(s, n);
                                if (c) {
                                    if (c === P) continue;
                                    return c;
                                }
                            }
                            if ("next" === n.method) n.sent = n._sent = n.arg; else if ("throw" === n.method) {
                                if (r === E) throw r = N, n.arg;
                                n.dispatchException(n.arg);
                            } else "return" === n.method && n.abrupt("return", n.arg);
                            r = T;
                            var l = o(e, t, n);
                            if ("normal" === l.type) {
                                if (r = n.done ? N : S, l.arg === P) continue;
                                return {
                                    value: l.arg,
                                    done: n.done
                                };
                            }
                            "throw" === l.type && (r = N, n.method = "throw", n.arg = l.arg);
                        }
                    };
                }
                function d(e, t) {
                    var n = e.iterator[t.method];
                    if (n === b) {
                        if (t.delegate = null, "throw" === t.method) {
                            if (e.iterator["return"] && (t.method = "return", t.arg = b, d(e, t), "throw" === t.method)) return P;
                            t.method = "throw", t.arg = new TypeError("The iterator does not provide a 'throw' method");
                        }
                        return P;
                    }
                    var r = o(n, e.iterator, t.arg);
                    if ("throw" === r.type) return t.method = "throw", t.arg = r.arg, t.delegate = null, 
                    P;
                    var i = r.arg;
                    return i ? i.done ? (t[e.resultName] = i.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", 
                    t.arg = b), t.delegate = null, P) : i : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), 
                    t.delegate = null, P);
                }
                function f(e) {
                    var t = {
                        tryLoc: e[0]
                    };
                    1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), 
                    this.tryEntries.push(t);
                }
                function p(e) {
                    var t = e.completion || {};
                    t.type = "normal", delete t.arg, e.completion = t;
                }
                function m(e) {
                    this.tryEntries = [ {
                        tryLoc: "root"
                    } ], e.forEach(f, this), this.reset(!0);
                }
                function h(e) {
                    if (e) {
                        var t = e[w];
                        if (t) return t.call(e);
                        if ("function" == typeof e.next) return e;
                        if (!isNaN(e.length)) {
                            var n = -1, r = function o() {
                                for (;++n < e.length; ) if (_.call(e, n)) return o.value = e[n], o.done = !1, o;
                                return o.value = b, o.done = !0, o;
                            };
                            return r.next = r;
                        }
                    }
                    return {
                        next: g
                    };
                }
                function g() {
                    return {
                        value: b,
                        done: !0
                    };
                }
                var b, v = Object.prototype, _ = v.hasOwnProperty, y = "function" == typeof Symbol ? Symbol : {}, w = y.iterator || "@@iterator", k = y.toStringTag || "@@toStringTag", C = "object" == typeof t, x = n.regeneratorRuntime;
                if (x) return void (C && (t.exports = x));
                x = n.regeneratorRuntime = C ? t.exports : {}, x.wrap = r;
                var E = "suspendedStart", S = "suspendedYield", T = "executing", N = "completed", P = {}, A = {};
                A[w] = function() {
                    return this;
                };
                var j = Object.getPrototypeOf, I = j && j(j(h([])));
                I && I !== v && _.call(I, w) && (A = I);
                var L = s.prototype = i.prototype = Object.create(A);
                a.prototype = L.constructor = s, s.constructor = a, s[k] = a.displayName = "GeneratorFunction", 
                x.isGeneratorFunction = function(e) {
                    var t = "function" == typeof e && e.constructor;
                    return !!t && (t === a || "GeneratorFunction" === (t.displayName || t.name));
                }, x.mark = function(e) {
                    return Object.setPrototypeOf ? Object.setPrototypeOf(e, s) : (e.__proto__ = s, k in e || (e[k] = "GeneratorFunction")), 
                    e.prototype = Object.create(L), e;
                }, x.awrap = function(e) {
                    return {
                        __await: e
                    };
                }, c(l.prototype), x.AsyncIterator = l, x.async = function(e, t, n, o) {
                    var i = new l(r(e, t, n, o));
                    return x.isGeneratorFunction(t) ? i : i.next().then(function(e) {
                        return e.done ? e.value : i.next();
                    });
                }, c(L), L[k] = "Generator", L.toString = function() {
                    return "[object Generator]";
                }, x.keys = function(e) {
                    var t = [];
                    for (var n in e) t.push(n);
                    return t.reverse(), function r() {
                        for (;t.length; ) {
                            var n = t.pop();
                            if (n in e) return r.value = n, r.done = !1, r;
                        }
                        return r.done = !0, r;
                    };
                }, x.values = h, m.prototype = {
                    constructor: m,
                    reset: function(e) {
                        if (this.prev = 0, this.next = 0, this.sent = this._sent = b, this.done = !1, this.delegate = null, 
                        this.method = "next", this.arg = b, this.tryEntries.forEach(p), !e) for (var t in this) "t" === t.charAt(0) && _.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = b);
                    },
                    stop: function() {
                        this.done = !0;
                        var e = this.tryEntries[0], t = e.completion;
                        if ("throw" === t.type) throw t.arg;
                        return this.rval;
                    },
                    dispatchException: function(e) {
                        function t(t, r) {
                            return i.type = "throw", i.arg = e, n.next = t, r && (n.method = "next", n.arg = b), 
                            !!r;
                        }
                        if (this.done) throw e;
                        for (var n = this, r = this.tryEntries.length - 1; r >= 0; --r) {
                            var o = this.tryEntries[r], i = o.completion;
                            if ("root" === o.tryLoc) return t("end");
                            if (o.tryLoc <= this.prev) {
                                var a = _.call(o, "catchLoc"), s = _.call(o, "finallyLoc");
                                if (a && s) {
                                    if (this.prev < o.catchLoc) return t(o.catchLoc, !0);
                                    if (this.prev < o.finallyLoc) return t(o.finallyLoc);
                                } else if (a) {
                                    if (this.prev < o.catchLoc) return t(o.catchLoc, !0);
                                } else {
                                    if (!s) throw new Error("try statement without catch or finally");
                                    if (this.prev < o.finallyLoc) return t(o.finallyLoc);
                                }
                            }
                        }
                    },
                    abrupt: function(e, t) {
                        for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                            var r = this.tryEntries[n];
                            if (r.tryLoc <= this.prev && _.call(r, "finallyLoc") && this.prev < r.finallyLoc) {
                                var o = r;
                                break;
                            }
                        }
                        o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                        var i = o ? o.completion : {};
                        return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, 
                        P) : this.complete(i);
                    },
                    complete: function(e, t) {
                        if ("throw" === e.type) throw e.arg;
                        return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, 
                        this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), 
                        P;
                    },
                    finish: function(e) {
                        for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                            var n = this.tryEntries[t];
                            if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), p(n), P;
                        }
                    },
                    "catch": function(e) {
                        for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                            var n = this.tryEntries[t];
                            if (n.tryLoc === e) {
                                var r = n.completion;
                                if ("throw" === r.type) {
                                    var o = r.arg;
                                    p(n);
                                }
                                return o;
                            }
                        }
                        throw new Error("illegal catch attempt");
                    },
                    delegateYield: function(e, t, n) {
                        return this.delegate = {
                            iterator: h(e),
                            resultName: t,
                            nextLoc: n
                        }, "next" === this.method && (this.arg = b), P;
                    }
                };
            }("object" == typeof n ? n : "object" == typeof window ? window : "object" == typeof self ? self : this);
        }).call(this, e("_process"), "undefined" != typeof window ? window : {});
    }, {
        _process: 170
    } ],
    177: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), e("universal/cs");
    }, {
        "universal/cs": 341
    } ],
    178: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            chrome.runtime.lastError ? t(chrome.runtime.lastError) : e();
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.handleChromeError = r;
    }, {} ],
    179: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            return new S();
        }
        var i = e("babel-runtime/core-js/promise"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s), l = e("babel-runtime/helpers/classCallCheck"), u = r(l), d = e("babel-runtime/helpers/createClass"), f = r(d), p = e("babel-runtime/helpers/defineProperty"), m = (r(p), 
        e("babel-runtime/core-js/object/get-own-property-symbols")), h = r(m), g = function(e, t) {
            var n = {};
            for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
            if (null != e && "function" == typeof h["default"]) for (var o = 0, r = (0, h["default"])(e); o < r.length; o++) t.indexOf(r[o]) < 0 && (n[r[o]] = e[r[o]]);
            return n;
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var b = e("./message/bg"), v = e("./message/content"), _ = e("./tabs/chrome"), y = e("./chrome-util"), w = e("./web-extensions"), k = e("lib/util"), C = e("stdlib"), x = function() {
            function e(t) {
                (0, u["default"])(this, e), this.port = chrome.runtime.connect({
                    name: t
                });
            }
            return (0, f["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this.port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this.port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this.port.postMessage(e);
                }
            } ]), e;
        }(), E = function() {
            function e(t) {
                (0, u["default"])(this, e), this._port = t, this.sender = {};
                var n = t.sender, r = t.name;
                this.name = r, n && (this.sender.url = n.url, n.tab && n.tab.url && n.tab.id && (this.sender.tab = {
                    url: n.tab.url,
                    id: n.tab.id,
                    active: n.tab.active
                }));
            }
            return (0, f["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this._port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this._port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this._port.postMessage(e);
                }
            } ]), e;
        }(), S = function T() {
            (0, u["default"])(this, T), this.tabs = new _.ChromeTabsApiImpl(), this.notification = {
                kind: "web-extension",
                create: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        var r = e.onClicked, o = e.onButtonClicked, i = g(e, [ "onClicked", "onButtonClicked" ]), a = chrome.notifications, s = k.guid();
                        a.create(s, (0, c["default"])({
                            type: "basic"
                        }, i), function() {
                            y.handleChromeError(function() {
                                void 0 !== r && a.onClicked.addListener(r), void 0 !== o && a.onButtonClicked.addListener(o), 
                                t(s);
                            }, n);
                        });
                    });
                },
                clear: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        chrome.notifications.clear(e, function(e) {
                            y.handleChromeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                }
            }, this.cookies = {
                kind: "web-extension",
                get: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return chrome.cookies.get(e, function(e) {
                            return y.handleChromeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                remove: function(e) {
                    return new a["default"](function(t, n) {
                        return chrome.cookies.remove(e, function() {
                            return y.handleChromeError(function() {
                                return t(null);
                            }, n);
                        });
                    });
                },
                getAll: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return chrome.cookies.getAll(e, function(e) {
                            return y.handleChromeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                set: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return chrome.cookies.set(e, function(e) {
                            return y.handleChromeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                watch: function(e, t) {
                    chrome.cookies.onChanged.addListener(function(n) {
                        var r = n.cookie, o = n.cause;
                        !r || !r.name || e.path && e.path !== r.path || e.name !== r.name || e.domain && r.domain.indexOf(e.domain) === -1 || ("explicit" === o && t(r), 
                        "expired_overwrite" === o && t());
                    });
                }
            }, this.preferences = w.preferencesApi.windowLocalStorage, this.button = {
                kind: "web-extension",
                setBadge: function(e) {
                    chrome.browserAction.setBadgeText({
                        text: e
                    });
                },
                setIconByName: function(e) {
                    var t = "./src/icon/icon", n = e ? "-" + e : "";
                    chrome.browserAction.setIcon({
                        path: {
                            "16": t + "16" + n + ".png",
                            "32": t + "32" + n + ".png"
                        }
                    });
                },
                setBadgeBackgroundColor: function(e) {
                    chrome.browserAction.setBadgeBackgroundColor({
                        color: e
                    });
                }
            }, this.management = {
                uninstallSelf: function() {
                    chrome.management.uninstallSelf();
                }
            }, this.message = k.isBg() ? new b.GenericBackgroundMessageApiImpl(function(e) {
                return chrome.runtime.onConnect.addListener(function(t) {
                    return e(new E(t));
                });
            }, this.tabs.getActiveTab.bind(this.tabs), this.tabs.getAllTabs.bind(this.tabs)) : new v.GenericContentScriptMessageApiImpl(function(e) {
                return new x(e);
            });
        };
        n.getApi = o;
    }, {
        "./chrome-util": 178,
        "./message/bg": 186,
        "./message/content": 187,
        "./tabs/chrome": 194,
        "./web-extensions": 198,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-own-property-symbols": 39,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/util": 322,
        stdlib: 327
    } ],
    180: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            edge.runtime.lastError ? t(edge.runtime.lastError) : e();
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.handleEdgeError = r;
    }, {} ],
    181: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            return new S();
        }
        var i = e("babel-runtime/core-js/promise"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s), l = e("babel-runtime/helpers/classCallCheck"), u = r(l), d = e("babel-runtime/helpers/createClass"), f = r(d), p = e("babel-runtime/helpers/defineProperty"), m = (r(p), 
        e("babel-runtime/core-js/object/get-own-property-symbols")), h = r(m), g = function(e, t) {
            var n = {};
            for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
            if (null != e && "function" == typeof h["default"]) for (var o = 0, r = (0, h["default"])(e); o < r.length; o++) t.indexOf(r[o]) < 0 && (n[r[o]] = e[r[o]]);
            return n;
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var b = e("./message/bg"), v = e("./message/content"), _ = e("./tabs/edge"), y = e("./edge-util"), w = e("./web-extensions"), k = e("lib/util"), C = e("stdlib"), x = function() {
            function e(t) {
                (0, u["default"])(this, e), this.port = edge.runtime.connect({
                    name: t
                });
            }
            return (0, f["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this.port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this.port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this.port.postMessage(e);
                }
            } ]), e;
        }(), E = function() {
            function e(t) {
                (0, u["default"])(this, e), this._port = t, this.sender = {};
                var n = t.sender, r = t.name;
                this.name = r, n && (this.sender.url = n.url, n.tab && n.tab.url && n.tab.id && (this.sender.tab = {
                    url: n.tab.url,
                    id: n.tab.id,
                    active: n.tab.active
                }));
            }
            return (0, f["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this._port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this._port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this._port.postMessage(e);
                }
            } ]), e;
        }(), S = function T() {
            (0, u["default"])(this, T), this.tabs = new _.EdgeTabsApiImpl(), this.notification = {
                kind: "web-extension",
                create: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        var r = e.onClicked, o = e.onButtonClicked, i = g(e, [ "onClicked", "onButtonClicked" ]), a = edge.notifications, s = k.guid();
                        a.create(s, (0, c["default"])({
                            type: "basic"
                        }, i), function() {
                            y.handleEdgeError(function() {
                                void 0 !== r && a.onClicked.addListener(r), void 0 !== o && a.onButtonClicked.addListener(o), 
                                t(s);
                            }, n);
                        });
                    });
                },
                clear: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        edge.notifications.clear(e, function(e) {
                            y.handleEdgeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                }
            }, this.cookies = {
                kind: "web-extension",
                get: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return edge.cookies.get(e, function(e) {
                            return y.handleEdgeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                remove: function(e) {
                    return new a["default"](function(t, n) {
                        return edge.cookies.remove(e, function() {
                            return y.handleEdgeError(function() {
                                return t(null);
                            }, n);
                        });
                    });
                },
                getAll: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return edge.cookies.getAll(e, function(e) {
                            return y.handleEdgeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                set: function(e) {
                    return C.SafePromise.create(function(t, n) {
                        return edge.cookies.set(e, function(e) {
                            return y.handleEdgeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                },
                watch: function(e, t) {
                    edge.cookies.onChanged.addListener(function(n) {
                        var r = n.cookie, o = n.cause;
                        !r || !r.name || e.path && e.path !== r.path || e.name !== r.name || e.domain && r.domain.indexOf(e.domain) === -1 || ("explicit" === o && t(r), 
                        "expired_overwrite" === o && t());
                    });
                }
            }, this.preferences = w.preferencesApi.windowLocalStorage, this.button = {
                kind: "web-extension",
                setBadge: function(e) {
                    edge.browserAction.setBadgeText({
                        text: e
                    });
                },
                setIconByName: function(e) {
                    var t = "./src/icon/icon", n = e ? "-" + e : "";
                    edge.browserAction.setIcon({
                        path: {
                            "16": t + "16" + n + ".png",
                            "32": t + "32" + n + ".png"
                        }
                    });
                },
                setBadgeBackgroundColor: function(e) {
                    edge.browserAction.setBadgeBackgroundColor({
                        color: e
                    });
                }
            }, this.management = {
                uninstallSelf: function() {
                    edge.management.uninstallSelf();
                }
            }, this.message = k.isBg() ? new b.GenericBackgroundMessageApiImpl(function(e) {
                return edge.runtime.onConnect.addListener(function(t) {
                    return e(new E(t));
                });
            }, this.tabs.getActiveTab, this.tabs.getAllTabs) : new v.GenericContentScriptMessageApiImpl(function(e) {
                return new x(e);
            });
        };
        n.getApi = o;
    }, {
        "./edge-util": 180,
        "./message/bg": 186,
        "./message/content": 187,
        "./tabs/edge": 195,
        "./web-extensions": 198,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-own-property-symbols": 39,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/util": 322,
        stdlib: 327
    } ],
    182: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            return new w();
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i), s = e("babel-runtime/helpers/classCallCheck"), c = r(s), l = e("babel-runtime/helpers/createClass"), u = r(l), d = e("babel-runtime/core-js/object/get-own-property-symbols"), f = r(d), p = function(e, t) {
            var n = {};
            for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
            if (null != e && "function" == typeof f["default"]) for (var o = 0, r = (0, f["default"])(e); o < r.length; o++) t.indexOf(r[o]) < 0 && (n[r[o]] = e[r[o]]);
            return n;
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("./web-extensions"), h = e("./message/bg"), g = e("./message/content"), b = e("./tabs/firefox"), v = e("lib/util"), _ = function() {
            function e(t) {
                (0, c["default"])(this, e);
                try {
                    this.port = firefox.runtime.connect({
                        name: t
                    });
                } catch (n) {
                    this.onMessage = function() {}, this.onDisconnect = function() {}, this.postMessage = function() {};
                }
            }
            return (0, u["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this.port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this.port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this.port.postMessage(e);
                }
            } ]), e;
        }(), y = function() {
            function e(t) {
                (0, c["default"])(this, e), this._port = t, this.sender = {};
                var n = t.sender, r = t.name;
                this.name = r, n && (this.sender.url = n.url, n.tab && n.tab.url && n.tab.id && (this.sender.tab = {
                    url: n.tab.url,
                    id: n.tab.id,
                    active: n.tab.active
                }));
            }
            return (0, u["default"])(e, [ {
                key: "onMessage",
                value: function(e) {
                    this._port.onMessage.addListener(e);
                }
            }, {
                key: "onDisconnect",
                value: function(e) {
                    this._port.onDisconnect.addListener(e);
                }
            }, {
                key: "postMessage",
                value: function(e) {
                    this._port.postMessage(e);
                }
            } ]), e;
        }(), w = function k() {
            (0, c["default"])(this, k), this.tabs = new b.FirefoxTabsApiImpl(), this.notification = {
                kind: "web-extension",
                create: function(e) {
                    var t = e.onClicked, n = e.onButtonClicked, r = p(e, [ "onClicked", "onButtonClicked" ]), o = firefox.notifications, i = v.guid(), s = o.create(i, (0, 
                    a["default"])({
                        type: "basic"
                    }, r));
                    return void 0 !== t && o.onClicked.addListener(t), void 0 !== n && o.onButtonClicked.addListener(n), 
                    s;
                },
                clear: function(e) {
                    return firefox.notifications.clear(e);
                }
            }, this.cookies = {
                kind: "web-extension",
                get: function(e) {
                    return firefox.cookies.get(e);
                },
                getAll: function(e) {
                    return firefox.cookies.getAll(e);
                },
                remove: function(e) {
                    return firefox.cookies.remove(e);
                },
                set: function(e) {
                    return firefox.cookies.set(e);
                },
                watch: function(e, t) {
                    firefox.cookies.onChanged.addListener(function(n) {
                        var r = n.cookie, o = n.cause;
                        !r || !r.name || e.path && e.path !== r.path || e.name !== r.name || e.domain && r.domain.indexOf(e.domain) === -1 || ("explicit" === o && t(r), 
                        "expired_overwrite" === o && t());
                    });
                }
            }, this.preferences = m.preferencesApi.migrationAware, this.button = {
                kind: "web-extension",
                setBadge: function(e) {
                    firefox.browserAction.setBadgeText({
                        text: e
                    });
                },
                setIconByName: function(e) {
                    var t = "./src/icon/icon", n = e ? "-" + e : "";
                    firefox.browserAction.setIcon({
                        path: {
                            "19": t + "19" + n + ".png",
                            "38": t + "38" + n + ".png"
                        }
                    });
                },
                setBadgeBackgroundColor: function(e) {
                    firefox.browserAction.setBadgeBackgroundColor({
                        color: e
                    });
                }
            }, this.management = {
                uninstallSelf: function() {
                    firefox.management.uninstallSelf();
                }
            }, this.message = v.isBg() ? new h.GenericBackgroundMessageApiImpl(function(e) {
                return firefox.runtime.onConnect.addListener(function(t) {
                    return e(new y(t));
                });
            }, this.tabs.getActiveTab, this.tabs.getAllTabs) : new g.GenericContentScriptMessageApiImpl(function(e) {
                return new _(e);
            });
        };
        n.getApi = o;
    }, {
        "./message/bg": 186,
        "./message/content": 187,
        "./tabs/firefox": 196,
        "./web-extensions": 198,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-own-property-symbols": 39,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    183: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), window.firefox = window.browser;
        try {
            window.firefox = browser;
        } catch (r) {}
        window.edge = window.browser, window.chrome = window.chrome, n["default"] = void 0;
    }, {} ],
    184: [ function(e, t, n) {
        "use strict";
        function r(e) {
            for (var t in e) n.hasOwnProperty(t) || (n[t] = e[t]);
        }
        function o() {
            window.extensionApi || (a.isWE() ? a.isBg() ? d.bgPreload() : d.hacksForCompatibility() : a.isSafari() && a.isSafariSettingsPopup() && u.hacksForSettingsPopupCompatibility()), 
            i();
        }
        function i() {
            if (a.isChrome()) window.extensionApi = window.extensionApi || s.getApi(); else if (a.isFF()) window.extensionApi = window.extensionApi || l.getApi(); else if (a.isEdge()) window.extensionApi = window.extensionApi || c.getApi(); else {
                if (!a.isSafari()) throw new Error("unsupported browser api");
                window.extensionApi = window.extensionApi || u.getApi();
            }
            return window.extensionApi;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), e("./globals");
        var a = e("lib/util"), s = e("./chrome"), c = e("./edge"), l = e("./firefox"), u = e("./safari"), d = e("./web-extensions");
        r(e("./interface")), n.initApi = o, n.getApi = i;
    }, {
        "./chrome": 179,
        "./edge": 181,
        "./firefox": 182,
        "./globals": 183,
        "./interface": 185,
        "./safari": 192,
        "./web-extensions": 198,
        "lib/util": 322
    } ],
    185: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.ports = {
            bridge: "bridge",
            background: "message:to-priv",
            broadcast: "message:to-non-priv"
        };
    }, {} ],
    186: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = 4, t = (d.isChrome() || d.isFF()) && (!chrome.extension || !chrome.tabs || !chrome.runtime || !chrome.runtime.onConnect), n = d.isEdge() && (!edge.extension || !edge.tabs || !edge.runtime || !edge.runtime.onConnect);
            if (t || n) {
                var r = window.localStorage.getItem("bgInitFail") || "0", o = parseInt(r, 10);
                o > e ? console.error("too many bgInitFail", o) : (window.localStorage.setItem("bgInitFail", (o + 1).toString()), 
                document.location.reload());
            }
        }
        function i(e) {
            if (!e) return !1;
            if (d.isChrome()) {
                var t = new RegExp(chrome.runtime.id + "/src/popup.html");
                return t.test(e);
            }
            if (d.isEdge()) {
                var n = /^ms-browser-extension:\/\/.*\/src\/popup.html$/;
                return n.test(e);
            }
            var r = /^moz-extension:\/\/.*\/src\/popup.html$/;
            return r.test(e);
        }
        var a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("./helpers"), d = e("lib/util"), f = e("../interface");
        n.SETTINGS_TAB_ID = "popup", n.bgPreload = o;
        var p = function() {
            function e(t, r, o) {
                var a = this;
                (0, s["default"])(this, e), this._getActiveTab = r, this._getAllTabs = o, this.kind = "background-message-api", 
                this._callbacks = {}, this._tabPorts = {
                    popup: []
                }, this._messageHelper = new u.MessageHelperImpl(), this._sendMessageToPorts = function(e, t) {
                    var n = a._tabPorts[e];
                    n && n.forEach(function(e) {
                        return e.postMessage(t);
                    });
                }, this.toFocused = function(e, t) {
                    a._getActiveTab().then(function(n) {
                        var r = n.id, o = n.url;
                        if (r) return i(o) ? console.warn("toFocussed not allowed for popup when it open like regular tab", e, t) : void a._sendMessageToPorts(r.toString(), {
                            type: e,
                            content: t,
                            callid: d.guid()
                        });
                    });
                }, this.broadcast = function(e, t) {
                    if (t) {
                        var r = function(n) {
                            var r = n.id, o = n.url;
                            r && o && o.indexOf("chrome-extension:") === -1 && a._sendMessageToPorts(r.toString(), {
                                type: e,
                                callid: d.guid(),
                                content: t
                            });
                        };
                        a._getAllTabs().then(function(e) {
                            return e.forEach(r);
                        }), a._tabPorts.popup && a._tabPorts.popup.length && a._getActiveTab().then(function(e) {
                            var t = e.url, o = e.active;
                            r({
                                id: n.SETTINGS_TAB_ID,
                                url: t,
                                active: o
                            });
                        });
                    }
                }, this._initPortListener = function(e) {
                    if (e.name === f.ports.bridge) e.onMessage(function(e) {
                        "message.toFocussed" === e.method && a.toFocused(e.params && e.params.type, e.params && e.params.content);
                    }); else if (e.name === f.ports.broadcast) e.onMessage(function(e) {
                        return a.broadcast(e.type, e.content);
                    }); else if (e.name === f.ports.background) {
                        var t = e.sender;
                        if (t) {
                            if (t.tab) {
                                var r = t.tab, o = r.id, s = r.url;
                                if (o) {
                                    var c = a._tabPorts[o];
                                    void 0 === c && (c = a._tabPorts[o] = []), c.push(e);
                                }
                                s && 0 === s.indexOf("http") && a._messageHelper.fire("tab-connected", {
                                    tab: o,
                                    url: s
                                }), e.onDisconnect(function() {
                                    if (o) {
                                        var t = a._tabPorts[o];
                                        t && t.splice(t.indexOf(e), 1);
                                    }
                                });
                            }
                            if (t.url && i(t.url)) {
                                var l = n.SETTINGS_TAB_ID;
                                a._tabPorts[l] = a._tabPorts[l] || [], a._tabPorts[l].push(e), e.onDisconnect(function() {
                                    var t = a._tabPorts[l];
                                    t.splice(t.indexOf(e), 1);
                                });
                            }
                        }
                        e.onMessage(function(r) {
                            var o = function(n) {
                                var r = n.callid, o = n.content, i = n.type;
                                a._callbacks[r] && (a._callbacks[r](o), delete a._callbacks[r]);
                                var s = function(t) {
                                    return e.postMessage({
                                        content: t,
                                        callid: r
                                    });
                                };
                                a._messageHelper.fire(i, o, s, t && t.tab ? t.tab.id : -1);
                            };
                            "tab-connected" === r.type ? a._getActiveTab().then(function(e) {
                                var t = e.url;
                                r.content = {
                                    tab: n.SETTINGS_TAB_ID,
                                    url: t
                                }, o(r);
                            }) : o(r);
                        });
                    }
                }, t(this._initPortListener);
            }
            return (0, l["default"])(e, [ {
                key: "sendTo",
                value: function(e, t, n, r, o) {
                    var i = this._tabPorts[e];
                    if (!i || !i.length) return void (o && o({
                        message: "no ports on specified tabId"
                    }));
                    var a = {
                        type: t,
                        content: n
                    };
                    r && "function" == typeof r && (a.callid = d.guid(), this._callbacks[a.callid] = r), 
                    i.forEach(function(e) {
                        return e.postMessage(a);
                    });
                }
            }, {
                key: "listen",
                value: function(e, t) {
                    this._messageHelper.listen(e, t);
                }
            } ]), e;
        }();
        n.GenericBackgroundMessageApiImpl = p;
    }, {
        "../interface": 185,
        "./helpers": 188,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    187: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            window.addEventListener("update-window-size-gr", function(e) {
                function t() {
                    document.body.appendChild(n), setTimeout(function() {
                        n.parentNode && n.parentNode.removeChild(n);
                    }, 10);
                }
                var n = document.createElement("div");
                if (n.style.height = "1px", e.detail && e.detail.force) {
                    var r = setInterval(t, 100);
                    setTimeout(function() {
                        return clearInterval(r);
                    }, 405);
                }
            }, !1), window.addEventListener("close-popup-gr", function() {
                window.navigator.userAgent.indexOf("Firefox") !== -1 && window.close();
            }, !1);
        }
        var i = e("babel-runtime/helpers/classCallCheck"), a = r(i), s = e("babel-runtime/helpers/createClass"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("./helpers"), u = e("lib/util"), d = e("../interface"), f = function() {
            function e(t) {
                var n = this;
                (0, a["default"])(this, e), this.kind = "content-script-message-api", this._callbacks = {}, 
                this._messageHelper = new l.MessageHelperImpl(), this._proxyPortsStorage = {}, this.broadcastBackground = function() {
                    for (var e = arguments.length, t = Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    return n._emit(n.backgroundPort, "bg").apply(null, t);
                }, this.broadcast = function() {
                    for (var e = arguments.length, t = Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    return n._emit(n.broadcastPort, "tabs").apply(null, t);
                }, this._onPortMessage = function(e) {
                    console.log("[Messaging] extension api", "portMessage", e);
                }, this._checkHealth = function() {
                    function e() {
                        document.removeEventListener("grammarly:pong", s), i && (clearTimeout(i), i = null), 
                        o && (clearInterval(o), o = null);
                    }
                    var t = 500, r = 5e3, o = null, i = null, a = function() {
                        return document.dispatchEvent(new CustomEvent("grammarly:ping"));
                    }, s = function() {
                        e();
                    }, c = function() {
                        [ n.port, n.backgroundPort, n.broadcastPort ].forEach(function(e) {
                            e && e.removeMessageListeners && e.removeMessageListeners();
                        }), n.port = n.backgroundPort = n.broadcastPort = null, e(), document.addEventListener("grammarly:proxyports", n._onGrammarlyResetAfterTimeout), 
                        document.dispatchEvent(new CustomEvent("grammarly:offline"));
                    };
                    return function() {
                        e(), document.addEventListener("grammarly:pong", s), o = window.setInterval(a, t), 
                        i = window.setTimeout(c, r);
                    };
                }(), this._onGrammarlyResetAfterTimeout = function() {
                    document.removeEventListener("grammarly:proxyports", n._onGrammarlyResetAfterTimeout), 
                    n.port = n._initProxyPort(d.ports.bridge, n._onPortMessage, n._checkHealth, !0), 
                    n.backgroundPort = n._initProxyPort(d.ports.background, n._onBgPortMessage, n._checkHealth), 
                    n.broadcastPort = n._initProxyPort(d.ports.broadcast, null, n._checkHealth);
                }, this._onBgPortMessage = function(e) {
                    var t = e.callid, r = e.content, o = e.type;
                    n._callbacks[t] ? (n._callbacks[t](r), delete n._callbacks[t]) : n._messageHelper.fire(o, r, function(e) {
                        if (!n.backgroundPort) throw new Error("fail reply to bg page - connection lost");
                        n.backgroundPort.postMessage({
                            content: e,
                            callid: t
                        });
                    });
                }, this._initProxyPort = function(e, t, r) {
                    var o = arguments.length > 3 && void 0 !== arguments[3] && arguments[3], i = n._proxyPort(e);
                    return o && n._checkHealth(), t && i.onMessage(t), r && i.onDisconnect(r), i;
                }, this._emit = function(e, t) {
                    return function(r, o, i, a) {
                        var s = u.guid();
                        i && "function" == typeof i && (n._callbacks[s] = i);
                        try {
                            if (!e) throw new Error("lost connection to " + t + " port");
                            e.postMessage({
                                type: r,
                                callid: s,
                                content: o
                            });
                        } catch (c) {
                            if (!a) throw c;
                            a(c);
                        }
                    };
                }, this._proxyPort = function(e) {
                    n._proxyPortsStorage[e] = {};
                    var t = function(t, r) {
                        var o = r.detail;
                        if (o.name === e) {
                            var i = n._proxyPortsStorage[e][t];
                            i && i(o.msg);
                        }
                    }, r = function(e) {
                        return t("success", e);
                    }, o = function(e) {
                        return t("error", e);
                    };
                    return document.addEventListener("grammarly:message", r), document.addEventListener("grammarly:error", o), 
                    {
                        postMessage: function() {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n = {
                                data: t,
                                name: e
                            };
                            return document.dispatchEvent(new CustomEvent("grammarly:action", {
                                detail: n
                            }));
                        },
                        onMessage: function(t) {
                            n._proxyPortsStorage[e].success = t;
                        },
                        onDisconnect: function(t) {
                            n._proxyPortsStorage[e].error = t;
                        },
                        removeMessageListeners: function() {
                            document.removeEventListener("grammarly:message", r), document.removeEventListener("grammarly:error", o);
                        }
                    };
                }, this.port = t(d.ports.bridge), this.port.onMessage(this._onPortMessage), this.port.onDisconnect(function() {
                    n.port = null, n.port = n._initProxyPort(d.ports.bridge, n._onPortMessage, n._checkHealth, !0);
                }), this.backgroundPort = t(d.ports.background), this.backgroundPort.onMessage(this._onBgPortMessage), 
                this.backgroundPort.onDisconnect(function() {
                    n.backgroundPort = null, n.backgroundPort = n._initProxyPort(d.ports.background, n._onBgPortMessage, n._checkHealth);
                }), this.broadcastPort = t(d.ports.broadcast), this.broadcastPort.onDisconnect(function() {
                    n.broadcastPort = null, n.broadcastPort = n._initProxyPort(d.ports.broadcast, null, n._checkHealth);
                });
            }
            return (0, c["default"])(e, [ {
                key: "listen",
                value: function(e, t) {
                    this._messageHelper.listen(e, t);
                }
            }, {
                key: "toFocused",
                value: function(e, t) {
                    if (!this.port) throw new Error("lost connection to bg page");
                    this.port.postMessage({
                        method: "message.toFocussed",
                        params: {
                            type: e,
                            content: t
                        }
                    });
                }
            } ]), e;
        }();
        n.GenericContentScriptMessageApiImpl = f, n.hacksForCompatibility = o;
    }, {
        "../interface": 185,
        "./helpers": 188,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    188: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            return safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.activeTab;
        }
        function i() {
            var e = o();
            return e && e.url || "http://newtab";
        }
        function a() {
            function e(e, t, o) {
                var i = n[e];
                i ? i.forEach(function(e) {
                    return e(t, o);
                }) : (r[e] || (r[e] = []), r[e].push({
                    data: t,
                    callback: o
                }));
            }
            function t(e, t) {
                n[e] || (n[e] = []), n[e].push(t), r[e] && r[e].forEach(function(e) {
                    return t(e.data, e.callback);
                });
            }
            var n = {}, r = {};
            return {
                emit: e,
                on: t
            };
        }
        var s = e("babel-runtime/core-js/get-iterator"), c = r(s), l = e("babel-runtime/helpers/classCallCheck"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("lib/config"), f = function() {}, p = function m() {
            var e = this;
            (0, u["default"])(this, m), this._listeners = {}, this._queue = {}, this.fire = function(t, n) {
                var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : f, o = arguments[3], i = e._listeners[t] || [];
                i.length ? i.forEach(function(e) {
                    return e(n, r, o);
                }) : (e._queue[t] = e._queue[t] || [], e._queue[t].push({
                    content: n,
                    callback: r,
                    sender: o
                }));
            }, this.unlisten = function(t, n) {
                var r = e._listeners[t] || [], o = r.indexOf(n);
                o !== -1 && (1 === r.length ? delete e._listeners[t] : r.splice(o, 1));
            }, this.listenOnce = function(t, n) {
                var r = function o(r, i, a) {
                    e.unlisten(t, o), n && n(r, i, a);
                };
                e.listen(t, r);
            }, this.listen = function(t, n) {
                e._listeners[t] = e._listeners[t] || [], e._listeners[t].indexOf(n) === -1 && e._listeners[t].push(n);
                var r = e._queue[t] || [];
                if (r.length) {
                    var o = !0, i = !1, a = void 0;
                    try {
                        for (var s, l = (0, c["default"])(r); !(o = (s = l.next()).done); o = !0) {
                            var u = s.value;
                            try {
                                n(u.content, u.callback, u.sender);
                            } catch (d) {
                                console.error("exception during proccesing buffered messages", d);
                            }
                        }
                    } catch (f) {
                        i = !0, a = f;
                    } finally {
                        try {
                            !o && l["return"] && l["return"]();
                        } finally {
                            if (i) throw a;
                        }
                    }
                    delete e._queue[t];
                }
            };
        };
        n.MessageHelperImpl = p, n.safariBridgeId = "forge-bridge" + d.getUuid(), n.getSafariActiveTab = o, 
        n.getSafariActiveTabUrl = i, n.emitter = a;
    }, {
        "babel-runtime/core-js/get-iterator": 32,
        "babel-runtime/helpers/classCallCheck": 46,
        "lib/config": 224
    } ],
    189: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./helpers"), l = e("lib/util"), u = function() {
            function e() {
                var t = this;
                (0, i["default"])(this, e), this.kind = "background-message-api", this._messageHelper = new c.MessageHelperImpl(), 
                this._bridgeId = c.safariBridgeId, this.listen = function(e, n) {
                    "tab-connected" === e ? window.__bgEmitter.on(e, function(e, t) {
                        n({
                            tab: "popup",
                            url: c.getSafariActiveTabUrl()
                        }, t);
                    }) : window.__bgEmitter.on(e, n), t._messageHelper.listen("broadcast-background", function(r, o, i) {
                        if (null === e || e === r.type) {
                            var a = r.content;
                            "tab-connected" === r.type && (a = {
                                tab: i,
                                url: i.url
                            }), n(a, function(e) {
                                r.id && t._sendToTab(i, r.id, e);
                            }, i);
                        }
                    });
                }, this.broadcast = function(e, n) {
                    t._sendToTabs("broadcast", {
                        type: e,
                        content: n,
                        id: l.guid()
                    });
                }, this.toFocused = function(e, n) {
                    t._sendToTab(c.getSafariActiveTab(), "broadcast", {
                        type: e,
                        content: n,
                        callid: l.guid()
                    });
                }, this._sendToTab = function(e, n, r) {
                    if ("popup" === e) return t._emitToPopup(r.type, r.content);
                    if ("string" != typeof e) {
                        if (!e || !e.page) throw Error("Cannot sentTo to malformed tab " + e);
                        e.page.dispatchMessage(t._bridgeId, {
                            method: "message",
                            event: n,
                            data: r
                        });
                    }
                }, console.info("Initialize API for BG"), safari.application.addEventListener("message", function(e) {
                    return t._onMessage(e);
                }, !1), window.__bgEmitter = window.__bgEmitter || c.emitter();
            }
            return (0, s["default"])(e, [ {
                key: "_onMessage",
                value: function(e) {
                    if (e.name === this._bridgeId) {
                        var t = e.message, n = e.target;
                        if ("message" === t.method) {
                            var r = t.params, o = r.event, i = r.data;
                            if ("broadcast" === o) return this._sendToTabs("broadcast", i);
                            if ("toFocussed" === o) return this._sendToTab(c.getSafariActiveTab(), "broadcast", i);
                            this._messageHelper.fire(o, i, void 0, n);
                        }
                    }
                }
            }, {
                key: "sendTo",
                value: function(e, t, n, r) {
                    var o = l.guid();
                    this._messageHelper.listenOnce(o, r), this._sendToTab(e, "broadcast", {
                        type: t,
                        content: n,
                        id: o
                    });
                }
            }, {
                key: "_emitToPopup",
                value: function(e, t, n) {
                    try {
                        safari.extension.popovers[0].contentWindow.__popupEmitter.emit(e, t, n);
                    } catch (r) {
                        console.info("emit popup error", r);
                    }
                }
            }, {
                key: "_sendToTabs",
                value: function(e, t) {
                    var n = this;
                    safari.application.browserWindows.forEach(function(r) {
                        r.tabs.forEach(function(r) {
                            return n._sendToTab(r, e, t);
                        });
                    }), this._emitToPopup(t.type, t.content);
                }
            } ]), e;
        }();
        n.SafariBackgroundMessageImpl = u;
    }, {
        "./helpers": 188,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    190: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./helpers"), l = e("lib/util"), u = function() {
            function e() {
                var t = this;
                (0, i["default"])(this, e), this.kind = "content-script-message-api", this._bridgeId = c.safariBridgeId, 
                this._messageHelper = new c.MessageHelperImpl(), this._tabInit = function() {
                    document.removeEventListener("visibilitychange", t._tabInit), t.broadcastBackground("tab-connected");
                }, this.broadcastBackground = function(e, n, r) {
                    return t._sendToBackground("broadcast-background", e, n, r);
                }, this.broadcast = function(e, n) {
                    return t._sendToBackground("broadcast", e, n);
                }, this.toFocused = function(e, n) {
                    t._sendToBackground("toFocussed", e, n);
                }, this._dispatchMessage = function(e, n) {
                    safari.self.tab && safari.self.tab.dispatchMessage(t._bridgeId, {
                        callid: l.guid(),
                        method: "message",
                        params: {
                            event: e,
                            data: n
                        }
                    });
                }, this._sendToBackground = function(e, n, r, o) {
                    var i = l.guid();
                    if (o) {
                        var a = function s(n) {
                            o && o(n), t._messageHelper.unlisten(e, s);
                        };
                        t._messageHelper.listen(i, a);
                    }
                    t._dispatchMessage(e, {
                        type: n,
                        content: r,
                        id: i
                    });
                }, this._onMessage = function(e) {
                    if (e.name === t._bridgeId) {
                        var n = e.message;
                        "message" === n.method && t._messageHelper.fire(n.event, n.data);
                    }
                }, window.top === window && (window.safari && window.safari.self && window.safari.self.addEventListener("message", this._onMessage, !1), 
                document.hidden ? document.addEventListener("visibilitychange", this._tabInit) : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", this._tabInit, !1) : this._tabInit());
            }
            return (0, s["default"])(e, [ {
                key: "listen",
                value: function(e, t) {
                    var n = this;
                    this._messageHelper.listen("broadcast", function(r) {
                        null !== e && e !== r.type || t(r.content, function(e) {
                            r.id && n._dispatchMessage(r.id, e);
                        });
                    });
                }
            } ]), e;
        }();
        n.SafariContentScriptMessageImpl = u;
    }, {
        "./helpers": 188,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    191: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./helpers"), l = e("lib/util"), u = function() {
            function e() {
                var t = this;
                (0, i["default"])(this, e), this.kind = "content-script-message-api", this._bridgeId = c.safariBridgeId, 
                this._bgEmitter = window.safari.extension.globalPage.contentWindow.__bgEmitter, 
                this._popupEmitter = window.__popupEmitter = window.__popupEmitter || c.emitter(), 
                this.listen = function(e, n) {
                    t._popupEmitter.on(e, n);
                }, this.broadcastBackground = function(e, n, r) {
                    t._bgEmitter && t._bgEmitter.emit(e, n, r);
                }, this.broadcast = function(e, n) {
                    t._sendToTabs("broadcast", {
                        type: e,
                        content: n,
                        id: l.guid()
                    });
                }, this.toFocused = function(e, n) {
                    t._sendToTab(c.getSafariActiveTab(), "broadcast", {
                        type: e,
                        content: n,
                        callid: l.guid()
                    });
                }, this._sendToTab = function(e, n, r) {
                    if ("popup" === e) return t._emitToPopup(r.type, r.content);
                    if (!e || !e.page) throw Error("Cannot sentTo to malformed tab " + e);
                    e.page.dispatchMessage(t._bridgeId, {
                        method: "message",
                        event: n,
                        data: r
                    });
                }, console.info("Initialize API for Popup");
            }
            return (0, s["default"])(e, [ {
                key: "_emitToPopup",
                value: function(e, t, n) {
                    try {
                        safari.extension.popovers[0].contentWindow.__popupEmitter.emit(e, t, n);
                    } catch (r) {
                        console.info("emit popup error", r);
                    }
                }
            }, {
                key: "_sendToTabs",
                value: function(e, t) {
                    var n = this;
                    safari.application.browserWindows.forEach(function(r) {
                        r.tabs.forEach(function(r) {
                            return n._sendToTab(r, e, t);
                        });
                    }), this._emitToPopup(t.type, t.content);
                }
            } ]), e;
        }();
        n.SafariPopupMessageImpl = u;
    }, {
        "./helpers": 188,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    192: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            if (void 0 === e || null === e) return null;
            try {
                return decodeURIComponent(e);
            } catch (t) {
                return console.warn("Failed to decode URI sequence: " + e), null;
            }
        }
        function i() {
            return new v();
        }
        var a = e("babel-runtime/core-js/object/keys"), s = r(a), c = e("babel-runtime/core-js/promise"), l = r(c), u = e("babel-runtime/helpers/classCallCheck"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("./message/safari-content"), p = e("./message/safari-bg"), m = e("./message/safari-popup"), h = e("./tabs/safari"), g = e("lib/util"), b = e("stdlib");
        n.hacksForSettingsPopupCompatibility = function() {
            safari.application.addEventListener("popover", function(e) {
                var t = safari.extension.popovers[0];
                t && (safari.self.height = safari.self.width = 0, document.dispatchEvent(new CustomEvent("popup-open")));
            }, !0), window.addEventListener("update-window-size-gr", function(e) {
                var t = document.body;
                safari.self.height = t.clientHeight, safari.self.width = t.clientWidth - 1;
            }, !1), window.addEventListener("close-popup-gr", function(e) {
                return safari.self.hide();
            }, !1);
        };
        var v = function _() {
            (0, d["default"])(this, _), this.tabs = new h.SafariTabsImpl(), this.notification = {
                kind: "fallback",
                create: function(e) {
                    return new l["default"](function(t, n) {
                        var r = e.title, o = e.message, i = e.onClicked, a = function() {
                            var e = new Notification(r, {
                                body: o
                            });
                            void 0 !== i && (e.onclick = function() {
                                return i();
                            }), t();
                        };
                        Notification && "granted" !== Notification.permission ? Notification.requestPermission(function(e) {
                            "granted" !== e ? n(new Error("Notification permission denied")) : a();
                        }) : a();
                    });
                }
            }, this.cookies = {
                kind: "fallback",
                get: function() {
                    return l["default"].resolve(null);
                },
                remove: function() {
                    return l["default"].resolve(null);
                },
                getAll: function() {
                    return l["default"].resolve([]);
                },
                set: function() {
                    return l["default"].resolve(null);
                },
                watch: function() {}
            }, this.preferences = {
                get: function(e) {
                    return b.SafePromise.create(function(t) {
                        return t(o(safari.extension.settings[e]));
                    });
                },
                set: function(e, t) {
                    return b.SafePromise.create(function(n) {
                        safari.extension.settings[e] = encodeURIComponent(t), n();
                    });
                },
                getAll: function() {
                    return b.SafePromise.create(function(e) {
                        var t = safari.extension.settings, n = (0, s["default"])(t).filter(function(e) {
                            return t.hasOwnProperty(e);
                        }).reduce(function(e, n) {
                            return e[n] = o(t[n]), e;
                        }, {});
                        e(n);
                    });
                },
                remove: function(e) {
                    return b.SafePromise.create(function(t) {
                        delete safari.extension.settings[e], t();
                    });
                },
                removeAll: function() {
                    return b.SafePromise.create(function(e) {
                        safari.extension.settings.clear(), e();
                    });
                }
            }, this.button = {
                kind: "fallback",
                setBadge: function(e) {
                    var t = safari.extension.toolbarItems;
                    t.forEach(function(t) {
                        return t.badge = e;
                    });
                },
                setIconByName: function(e) {
                    var t = void 0, n = safari.extension.toolbarItems, r = n[0].image.split("."), o = r.pop(), i = e ? "-" + e : "";
                    if (t !== i) {
                        var a = r.join(".");
                        t && (a = a.split(t)[0]), i && (a = a.split(i)[0]), t = i, n.forEach(function(e) {
                            return e.image = "" + r + i + "." + o;
                        });
                    }
                }
            }, this.management = {
                uninstallSelf: function() {}
            }, this.message = g.isBg() ? new p.SafariBackgroundMessageImpl() : g.isSafariSettingsPopup() ? new m.SafariPopupMessageImpl() : new f.SafariContentScriptMessageImpl();
        };
        n.getApi = i;
    }, {
        "./message/safari-bg": 189,
        "./message/safari-content": 190,
        "./message/safari-popup": 191,
        "./tabs/safari": 197,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "lib/util": 322,
        stdlib: 327
    } ],
    193: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            return {
                get: e.get.bind(e),
                set: e.set.bind(e),
                getAll: e.getAll.bind(e),
                remove: e.remove.bind(e),
                removeAll: function() {
                    return h(this, void 0, void 0, u["default"].mark(function n() {
                        var r;
                        return u["default"].wrap(function(n) {
                            for (;;) switch (n.prev = n.next) {
                              case 0:
                                return n.next = 2, e.getAll();

                              case 2:
                                return r = n.sent, n.next = 5, e.removeAll();

                              case 5:
                                return n.next = 7, m["default"].all((0, f["default"])(r).filter(t).map(function(t) {
                                    return e.set(t, r[t]);
                                }));

                              case 7:
                              case "end":
                                return n.stop();
                            }
                        }, n, this);
                    }));
                }
            };
        }
        var i = e("babel-runtime/helpers/classCallCheck"), a = r(i), s = e("babel-runtime/helpers/createClass"), c = r(s), l = e("babel-runtime/regenerator"), u = r(l), d = e("babel-runtime/core-js/object/keys"), f = r(d), p = e("babel-runtime/core-js/promise"), m = r(p), h = function(e, t, n, r) {
            return new (n || (n = m["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g, b = e("stdlib"), v = e("lodash");
        !function(e) {
            e[e.success = 0] = "success", e[e.successWithEmpty = 1] = "successWithEmpty", e[e.alreadyMigrated = 2] = "alreadyMigrated";
        }(g = n.StorageMigrationResult || (n.StorageMigrationResult = {}));
        var _;
        !function(e) {
            e[e.nonEmptyMigration = 0] = "nonEmptyMigration", e[e.emptyMigration = 1] = "emptyMigration";
        }(_ || (_ = {})), n.createMigrationAwareApi = o;
        var y = function() {
            function e(t, n, r) {
                var i = this, s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : [];
                (0, a["default"])(this, e), this._name = t, this._source = n, this._destination = r, 
                this._destValuesToKeep = s, this._migrationFlagSuccessfulValue = "ok", this._migrationFlagUniqueKey = "104ccd8c-9919-9ae4-931f-782fb197486c", 
                this._migrationFlagKey = "__migration-" + this._migrationFlagUniqueKey + ":(" + this._name + ")", 
                this._migrationInProgress = !1, this.migrationAwareDestination = o(this._destination, function(e) {
                    return e === i._migrationFlagKey;
                });
            }
            return (0, c["default"])(e, [ {
                key: "_getMigrated",
                value: function() {
                    var e = this;
                    return this._destination.get(this._migrationFlagKey).then(function(t) {
                        return t === e._migrationFlagSuccessfulValue;
                    });
                }
            }, {
                key: "_setMigrated",
                value: function() {
                    return h(this, void 0, void 0, u["default"].mark(function e() {
                        var t;
                        return u["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return e.next = 2, this._destination.set(this._migrationFlagKey, this._migrationFlagSuccessfulValue);

                              case 2:
                                return e.next = 4, this._destination.get(this._migrationFlagKey);

                              case 4:
                                if (t = e.sent, t === this._migrationFlagSuccessfulValue) {
                                    e.next = 7;
                                    break;
                                }
                                throw new Error("Could not verify status write, actual value: " + t);

                              case 7:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            }, {
                key: "_runMigration",
                value: function() {
                    return h(this, void 0, void 0, u["default"].mark(function e() {
                        var t, n, r = this;
                        return u["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return b.assert(!this._migrationInProgress, "migration already in progress"), this._migrationInProgress = !0, 
                                e.prev = 2, e.next = 5, this._source.getAll();

                              case 5:
                                return t = e.sent, n = 0 === (0, f["default"])(t).length, e.next = 9, m["default"].all(this._destValuesToKeep.map(function(e) {
                                    return r._destination.get(e).then(function(n) {
                                        null != n && (t[e] = n);
                                    });
                                }));

                              case 9:
                                return e.next = 11, this._destination.removeAll();

                              case 11:
                                return e.next = 13, m["default"].all((0, f["default"])(t).filter(function(e) {
                                    return null != t[e];
                                }).map(function(e) {
                                    return r._destination.set(e, t[e]);
                                }));

                              case 13:
                                return e.t0 = v, e.t1 = t, e.next = 17, this._destination.getAll();

                              case 17:
                                if (e.t2 = e.sent, e.t0.isEqual.call(e.t0, e.t1, e.t2)) {
                                    e.next = 20;
                                    break;
                                }
                                throw new Error("Could not verify write");

                              case 20:
                                return this._migrationInProgress = !1, e.abrupt("return", n ? _.emptyMigration : _.nonEmptyMigration);

                              case 24:
                                throw e.prev = 24, e.t3 = e["catch"](2), this._migrationInProgress = !1, e.t3;

                              case 28:
                              case "end":
                                return e.stop();
                            }
                        }, e, this, [ [ 2, 24 ] ]);
                    }));
                }
            }, {
                key: "ensureMigrationCompleted",
                value: function() {
                    return h(this, void 0, void 0, u["default"].mark(function e() {
                        var t, n;
                        return u["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return e.next = 2, this._getMigrated();

                              case 2:
                                if (!e.sent) {
                                    e.next = 6;
                                    break;
                                }
                                return e.abrupt("return", g.alreadyMigrated);

                              case 6:
                                return e.next = 8, this._runMigration();

                              case 8:
                                return t = e.sent, e.next = 11, this._setMigrated();

                              case 11:
                                e.t0 = t, e.next = e.t0 === _.nonEmptyMigration ? 14 : e.t0 === _.emptyMigration ? 15 : 16;
                                break;

                              case 14:
                                return e.abrupt("return", g.success);

                              case 15:
                                return e.abrupt("return", g.successWithEmpty);

                              case 16:
                                throw n = t, new Error("Match not exhaustive: " + t);

                              case 18:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            } ]), e;
        }();
        n.StorageMigration = y;
    }, {
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/regenerator": 55,
        lodash: "lodash",
        stdlib: 327
    } ],
    194: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/promise"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("../chrome-util"), d = function() {
            function e() {
                (0, s["default"])(this, e), this.kind = "web-extension";
            }
            return (0, l["default"])(e, [ {
                key: "open",
                value: function(e, t) {
                    return new i["default"](function(n, r) {
                        chrome.tabs.create({
                            url: e,
                            active: t
                        }, function(e) {
                            u.handleChromeError(function() {
                                return n(e);
                            }, r);
                        });
                    });
                }
            }, {
                key: "updateCurrent",
                value: function(e) {
                    return new i["default"](function(t, n) {
                        chrome.tabs.update({
                            url: e
                        }, function(e) {
                            u.handleChromeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                }
            }, {
                key: "getActiveTab",
                value: function() {
                    return new i["default"](function(e, t) {
                        var n = chrome.tabs;
                        n.query({
                            active: !0,
                            lastFocusedWindow: !0
                        }, function(r) {
                            u.handleChromeError(function() {
                                return r && r.length ? e(r[0]) : n.query({
                                    active: !0
                                }, function(n) {
                                    u.handleChromeError(function() {
                                        return e(n[0]);
                                    }, t);
                                });
                            }, t);
                        });
                    });
                }
            }, {
                key: "getAllTabs",
                value: function() {
                    return new i["default"](function(e, t) {
                        return chrome.tabs.query({}, function(n) {
                            return u.handleChromeError(function() {
                                return e(n);
                            }, t);
                        });
                    });
                }
            }, {
                key: "getActiveTabUrl",
                value: function() {
                    var e = this;
                    return new i["default"](function(t, n) {
                        return e.getActiveTab().then(function(e) {
                            return u.handleChromeError(function() {
                                return t(e.url);
                            }, n);
                        });
                    });
                }
            }, {
                key: "onActiveTabChange",
                value: function(e, t) {
                    var n = this, r = function(n) {
                        u.handleChromeError(function() {
                            n && e(n);
                        }, t);
                    };
                    chrome.tabs.onActivated.addListener(function(e) {
                        return chrome.tabs.get(e.tabId, function(e) {
                            return r(e);
                        });
                    }), chrome.tabs.onUpdated.addListener(function(e, t) {
                        n.getActiveTab().then(function(n) {
                            n.id === e && (t.url || t.favIconUrl || "complete" === t.status) && chrome.tabs.get(e, function(e) {
                                return r(e);
                            });
                        });
                    }), chrome.windows.onFocusChanged.addListener(function(e) {
                        return chrome.tabs.query({
                            active: !0,
                            windowId: e,
                            lastFocusedWindow: !0
                        }, function(e) {
                            return r(e[0]);
                        });
                    }), this.getActiveTab().then(function(e) {
                        return r(e);
                    });
                }
            }, {
                key: "reload",
                value: function(e) {
                    return new i["default"](function(t, n) {
                        var r = function() {
                            return u.handleChromeError(function() {
                                return t();
                            }, n);
                        };
                        e ? chrome.tabs.reload(e, {}, r) : chrome.tabs.reload(r);
                    });
                }
            } ]), e;
        }();
        n.ChromeTabsApiImpl = d;
    }, {
        "../chrome-util": 178,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    195: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/promise"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("../edge-util"), d = function() {
            function e() {
                (0, s["default"])(this, e), this.kind = "web-extension";
            }
            return (0, l["default"])(e, [ {
                key: "open",
                value: function(e, t) {
                    return new i["default"](function(n, r) {
                        edge.tabs.create({
                            url: e,
                            active: t
                        }, function(e) {
                            u.handleEdgeError(function() {
                                return n(e);
                            }, r);
                        });
                    });
                }
            }, {
                key: "updateCurrent",
                value: function(e) {
                    return new i["default"](function(t, n) {
                        edge.tabs.update({
                            url: e
                        }, function(e) {
                            u.handleEdgeError(function() {
                                return t(e);
                            }, n);
                        });
                    });
                }
            }, {
                key: "getActiveTab",
                value: function() {
                    return new i["default"](function(e, t) {
                        var n = edge.tabs;
                        n.query({
                            active: !0,
                            lastFocusedWindow: !0
                        }, function(r) {
                            u.handleEdgeError(function() {
                                return r && r.length ? e(r[0]) : n.query({
                                    active: !0
                                }, function(n) {
                                    u.handleEdgeError(function() {
                                        return e(n[0]);
                                    }, t);
                                });
                            }, t);
                        });
                    });
                }
            }, {
                key: "getAllTabs",
                value: function() {
                    return new i["default"](function(e, t) {
                        return edge.tabs.query({}, function(n) {
                            return u.handleEdgeError(function() {
                                return e(n);
                            }, t);
                        });
                    });
                }
            }, {
                key: "getActiveTabUrl",
                value: function() {
                    var e = this;
                    return new i["default"](function(t, n) {
                        return e.getActiveTab().then(function(e) {
                            return u.handleEdgeError(function() {
                                return t(e.url);
                            }, n);
                        });
                    });
                }
            }, {
                key: "onActiveTabChange",
                value: function(e, t) {
                    var n = this, r = function(n) {
                        u.handleEdgeError(function() {
                            n && e(n);
                        }, t);
                    };
                    edge.tabs.onActivated.addListener(function(e) {
                        return edge.tabs.get(e.tabId, function(e) {
                            return r(e);
                        });
                    }), edge.tabs.onUpdated.addListener(function(e, t) {
                        n.getActiveTab().then(function(n) {
                            n.id === e && (t.url || t.favIconUrl || "complete" === t.status) && edge.tabs.get(e, function(e) {
                                return r(e);
                            });
                        });
                    }), edge.windows.onFocusChanged.addListener(function(e) {
                        return edge.tabs.query({
                            active: !0,
                            windowId: e,
                            lastFocusedWindow: !0
                        }, function(e) {
                            return r(e[0]);
                        });
                    }), this.getActiveTab().then(function(e) {
                        return r(e);
                    });
                }
            }, {
                key: "reload",
                value: function(e) {
                    return new i["default"](function(t, n) {
                        var r = function() {
                            return u.handleEdgeError(function() {
                                return t();
                            }, n);
                        };
                        e ? edge.tabs.reload(e, {}, r) : edge.tabs.reload(r);
                    });
                }
            } ]), e;
        }();
        n.EdgeTabsApiImpl = d;
    }, {
        "../edge-util": 180,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    196: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/promise"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = function() {
            function e() {
                (0, s["default"])(this, e), this.kind = "web-extension", this.getActiveTab = function() {
                    return new i["default"](function(e, t) {
                        return firefox.tabs.query({
                            active: !0,
                            lastFocusedWindow: !0
                        }).then(function(n) {
                            n && n.length ? e(n[0]) : firefox.tabs.query({
                                active: !0
                            }).then(function(t) {
                                return e(t[0]);
                            }, t);
                        }, t);
                    });
                };
            }
            return (0, l["default"])(e, [ {
                key: "open",
                value: function(e, t) {
                    return firefox.tabs.create({
                        url: e,
                        active: t
                    });
                }
            }, {
                key: "updateCurrent",
                value: function(e) {
                    return firefox.tabs.update({
                        url: e
                    });
                }
            }, {
                key: "getAllTabs",
                value: function() {
                    return firefox.tabs.query({});
                }
            }, {
                key: "getActiveTabUrl",
                value: function() {
                    return new i["default"](function(e, t) {
                        firefox.tabs.query({
                            active: !0
                        }).then(function(t) {
                            e(t[0].url);
                        }, t);
                    });
                }
            }, {
                key: "onActiveTabChange",
                value: function(e, t) {
                    var n = this;
                    firefox.tabs.onActivated.addListener(function(n) {
                        return firefox.tabs.get(n.tabId).then(function(t) {
                            return e(t);
                        }, t);
                    }), firefox.tabs.onUpdated.addListener(function(r, o) {
                        n.getActiveTab().then(function(n) {
                            n.id === r && (o.url || o.favIconUrl || "complete" === o.status) && firefox.tabs.get(r).then(e, t);
                        });
                    }), firefox.windows.onFocusChanged.addListener(function(n) {
                        return firefox.tabs.query({
                            active: !0,
                            windowId: n,
                            lastFocusedWindow: !0
                        }).then(function(t) {
                            return e(t[0]);
                        }, t);
                    }), this.getActiveTab().then(e, t);
                }
            }, {
                key: "reload",
                value: function(e) {
                    return e ? firefox.tabs.reload(e, {}) : firefox.tabs.reload();
                }
            } ]), e;
        }();
        n.FirefoxTabsApiImpl = u;
    }, {
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    197: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            var n = p.getRandomIntInclusive(1, 1e5);
            return {
                active: t || !1,
                url: e.url,
                title: e.title,
                id: n
            };
        }
        function i() {
            return safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.activeTab;
        }
        function a(e, t) {
            var n = function r(n) {
                e.removeEventListener("navigate", r), t(n);
            };
            e.addEventListener("navigate", n, !1);
        }
        var s = e("babel-runtime/core-js/promise"), c = r(s), l = e("babel-runtime/helpers/classCallCheck"), u = r(l), d = e("babel-runtime/helpers/createClass"), f = r(d);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p = e("lib/util"), m = function() {
            function e() {
                (0, u["default"])(this, e), this.kind = "safari";
            }
            return (0, f["default"])(e, [ {
                key: "open",
                value: function(e, t) {
                    return new c["default"](function(n, r) {
                        var s = i();
                        if (s) {
                            var c = safari.application.activeBrowserWindow.openTab();
                            t ? (a(c, function(e) {
                                return n(o(c, !0));
                            }), c.url = e) : (c.url = e, s.activate(), n(o(c, !1)));
                        } else r("Active tab does not exist");
                    });
                }
            }, {
                key: "getActiveTab",
                value: function() {
                    var e = i();
                    return e ? c["default"].resolve(o(e, !0)) : c["default"].reject("Active tab does not exist");
                }
            }, {
                key: "updateCurrent",
                value: function(e) {
                    return new c["default"](function(t, n) {
                        var r = i();
                        return r ? (a(r, function(e) {
                            return t(o(r, !0));
                        }), void (r.url = e)) : n("Active tab does not exist");
                    });
                }
            }, {
                key: "getAllTabs",
                value: function() {
                    return new c["default"](function(e, t) {
                        var n = safari.application.browserWindows, r = n.reduce(function(e, t) {
                            return e.concat(t.tabs);
                        }, []).map(function(e) {
                            return o(e);
                        });
                        e(r);
                    });
                }
            }, {
                key: "getActiveTabUrl",
                value: function() {
                    return new c["default"](function(e, t) {
                        var n = i();
                        return n ? void e(n && n.url || "http://newtab") : t("Active tab does not exist");
                    });
                }
            }, {
                key: "onActiveTabChange",
                value: function(e) {
                    var t = i(), n = function() {
                        t = i(), e(o(t, !0));
                    };
                    setInterval(function() {
                        var e = i();
                        e && t !== e && n();
                    }, 1e3), safari.application.addEventListener("activate", n, !0), safari.application.addEventListener("navigate", n, !0), 
                    n();
                }
            } ]), e;
        }();
        n.SafariTabsImpl = m;
    }, {
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/util": 322
    } ],
    198: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/regenerator"), s = r(a), c = e("babel-runtime/core-js/object/keys"), l = r(c), u = e("babel-runtime/core-js/promise"), d = r(u), f = function(e, t, n, r) {
            return new (n || (n = d["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p = e("stdlib"), m = e("./storage-migration"), h = e("./message/content");
        n.hacksForCompatibility = h.hacksForCompatibility;
        var g = e("./message/bg");
        n.bgPreload = g.bgPreload;
        var b;
        !function(e) {
            function t() {
                a = !0;
                var e = p.SafePromise.createCompletionSource();
                return o = e.promise, r.ensureMigrationCompleted().then(function(t) {
                    return e.resolve(!0), d["default"].resolve(t);
                }, function(t) {
                    return e.resolve(!1), d["default"].reject(t);
                });
            }
            function n(t) {
                return function() {
                    for (var n = arguments.length, i = Array(n), s = 0; s < n; s++) i[s] = arguments[s];
                    return p.assert(a === !0, "supposed to run data migration before accessing prefs with web-extensions API"), 
                    o.then(function(n) {
                        var o = n ? r.migrationAwareDestination : e.windowLocalStorage;
                        return o[t].apply(o, i);
                    });
                };
            }
            e.windowLocalStorage = {
                get: function(e) {
                    return p.SafePromise.sync(function() {
                        return window.localStorage.getItem(e);
                    });
                },
                set: function(e, t) {
                    return p.SafePromise.sync(function() {
                        return window.localStorage.setItem(e, t);
                    });
                },
                getAll: function() {
                    return p.SafePromise.sync(function() {
                        var e = {};
                        return (0, l["default"])(window.localStorage).forEach(function(t) {
                            e[t] = window.localStorage.getItem(t);
                        }), e;
                    });
                },
                remove: function(e) {
                    return p.SafePromise.sync(function() {
                        return window.localStorage.removeItem(e);
                    });
                },
                removeAll: function() {
                    return p.SafePromise.sync(function() {
                        return window.localStorage.clear();
                    });
                }
            }, e.browserStorageLocal = {
                get: function(e) {
                    return f(this, void 0, void 0, s["default"].mark(function t() {
                        var n;
                        return s["default"].wrap(function(t) {
                            for (;;) switch (t.prev = t.next) {
                              case 0:
                                return t.next = 2, firefox.storage.local.get(e);

                              case 2:
                                return n = t.sent, t.abrupt("return", n.hasOwnProperty(e) ? n[e] : null);

                              case 4:
                              case "end":
                                return t.stop();
                            }
                        }, t, this);
                    }));
                },
                set: function(e, t) {
                    return firefox.storage.local.set((0, i["default"])({}, e, t));
                },
                getAll: function() {
                    return firefox.storage.local.get(null);
                },
                remove: function(e) {
                    return firefox.storage.local.remove(e);
                },
                removeAll: function() {
                    return f(this, void 0, void 0, s["default"].mark(function e() {
                        return s["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return e.next = 2, firefox.storage.local.clear();

                              case 2:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            };
            var r = new m.StorageMigration("firefoxLocalStorageToExtApi", e.windowLocalStorage, e.browserStorageLocal, [ "version" ]), o = d["default"].resolve(!1), a = !1;
            e.ensureMigrationCompleted = t, e.migrationAware = {
                get: n("get"),
                set: n("set"),
                getAll: n("getAll"),
                remove: n("remove"),
                removeAll: n("removeAll")
            };
        }(b = n.preferencesApi || (n.preferencesApi = {}));
    }, {
        "./message/bg": 186,
        "./message/content": 187,
        "./storage-migration": 193,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/regenerator": 55,
        stdlib: 327
    } ],
    199: [ function(e, t, n) {
        "use strict";
        function r() {
            return "about:" === document.location.protocol ? i.failover.success("index_load") : (document.body.dataset.grCSLoaded = !0, 
            i.failover.startAppLoadTimer(), void e("./lib/app"));
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./extension-api");
        o.initApi();
        var i = e("./lib/failover"), a = e("./lib/client-script");
        a.injectClientScriptIfNeeded(), i.failover.startPageLoadTimer(), "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", r, !1) : r();
    }, {
        "./extension-api": 184,
        "./lib/app": 200,
        "./lib/client-script": 218,
        "./lib/console": 225,
        "./lib/failover": 258
    } ],
    200: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = {
                connection: {
                    networkOffline: !window.navigator.onLine,
                    online: !1,
                    bgNotConnected: !0,
                    cookiesDisabled: navigator.cookieEnabled === !1
                },
                user: {
                    anonymous: !0,
                    premium: !1,
                    settings: {}
                },
                page: {
                    enabled: !0,
                    enabledDefs: !1,
                    domain: j
                }
            };
            i(e);
        }
        function i(e) {
            if (e.page.domain !== j) return void k.logger.differentStateDomain(e.page.domain);
            var t = navigator.cookieEnabled === !1;
            e.connection.cookiesDisabled !== t && B.updateConnection({
                cookiesDisabled: t
            });
            var n = S.timers.stop(A);
            n && !e.connection.bgNotConnected && k.logger.restoredBgConnection(n), O && (clearTimeout(O), 
            O = null), R || s(e.page.domain, e.connection), e.page.enabled ? a(e) : f(), R || w.failover.success("app_load"), 
            R = !0;
        }
        function a(e) {
            return u(e.page, e.user), L ? L.updateState(e) : void (L = v.Buttons((0, m["default"])({}, e, {
                app: I,
                document: document,
                actions: B
            }), D.createSocket));
        }
        function s(e, t) {
            var n = t.bgNotConnected;
            c(e), b.isSafari() && d();
            var r = _.pageStyles(document);
            r.customizeElements(), r.addDomainClass(), w.failover.success("index_load"), n && (S.timers.start(A), 
            k.logger.initWithoutBgConnection());
        }
        function c(e) {
            e.includes(T.GRAMMARLY_DOMAIN) && y.addExternalEventListeners();
        }
        function l() {
            h.disableConsoleLog();
        }
        function u(e) {
            var t = e.enabledDefs, n = e.cardInspection;
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            t && !M ? M = x.dictionary({
                doc: document,
                cardInspection: n
            }) : (M && M.clear(), M = null);
        }
        function d() {
            function e() {
                var n = window.getComputedStyle(t), r = n.getPropertyValue("opacity");
                "0.5" !== r ? f() : setTimeout(e, 200);
            }
            var t = document.createElement("div");
            document.body.appendChild(t), t.classList.add("grammarly-disable-indicator"), setTimeout(e, 1e3);
        }
        function f() {
            L && (L.clear(), L = null);
        }
        var p = e("babel-runtime/core-js/object/assign"), m = r(p);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var h = e("./console"), g = e("./state"), b = e("./util"), v = e("./buttons"), _ = e("./sites"), y = e("./external"), w = e("./failover"), k = e("./tracking"), C = e("./location"), x = e("./dictionary"), E = e("./message"), S = e("./timers"), T = e("lib/config"), N = e("universal/cs/socket"), P = 3e4, A = "init_without_bg_connection", j = C.getDomain(), I = {}, L = void 0, M = void 0, R = void 0, O = setTimeout(o, P), D = new N.ContentScriptSocketManager(k.logger, E), F = g.createAndObserve(i), B = F.actions;
        l(), n.update = i;
    }, {
        "./buttons": 203,
        "./console": 225,
        "./dictionary": 227,
        "./external": 257,
        "./failover": 258,
        "./location": 286,
        "./message": 287,
        "./sites": 303,
        "./state": 305,
        "./test-api": 309,
        "./timers": 310,
        "./tracking": 316,
        "./util": 322,
        "babel-runtime/core-js/object/assign": 36,
        "lib/config": 224,
        "universal/cs/socket": 342
    } ],
    201: [ function(e, t, n) {
        "use strict";
        function r() {}
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.benchmark = r;
    }, {} ],
    202: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t, n) {
            return f.isFocused(n) || e === n || f.isParent(e, n) || e === t || f.isParent(e, t);
        }
        function i(e) {
            return 0 === e.className.indexOf("gr-") || f.resolveEl(e, E.textarea_btn) || f.resolveEl(e, "gr__tooltip");
        }
        function a(e) {
            var t = v.guid(), n = e;
            f.setGRAttributes(n, t), n.setAttribute("gramm-ifr", "true");
            var r = n.contentDocument;
            return f.addIframeCss(r), f.setGRAttributes(r.body, t), n.style.height = n.style.height || getComputedStyle(n).height, 
            r.body;
        }
        function s(e, t) {
            function n() {
                f.isFocused(Se) ? Xe() : f.listen(Se, "focus", Xe, !1);
            }
            function r() {
                fe = xe.createElement("grammarly-btn"), pe = d.findDOMNode(W()), s(), Ze.initialized = !0, 
                ye = new _.Pos({
                    btnEl: pe,
                    fieldEl: ce,
                    custom: Ne,
                    sourceEl: We,
                    isTextarea: "textarea" === le,
                    initCondition: ze
                }, O, D), qe = y.getWithinButtonPath({
                    editorEl: ce,
                    btnEl: pe,
                    padding: 15
                }), we = w.createMenu({
                    el: pe,
                    editor: ke,
                    enabled: ze,
                    user: Oe,
                    btn: Ze,
                    onboardingPopup: ge
                }, function(e) {
                    Pe = e, B();
                }), me = b.createErrorTooltip({
                    el: pe,
                    win: window
                }), we.bind(), f.listen(pe, "click", M, !1), t.on("hover", V), f.listen(Se, "blur", R, !1), 
                V({
                    target: Se
                }), c(), Be.fieldParentCustomStyle && (Ye = f.setCustomCss(ce.parentNode, Be.fieldParentCustomStyle(ce))), 
                se.online || Ze.offline();
            }
            function s() {
                var e = {
                    "z-index": (parseInt(f.css(ce, "z-index"), 10) || 1) + 1
                }, t = Be.btnCustomContainer && Be.btnCustomContainer(ce);
                if (t) {
                    Ne = !0, We = t;
                    var n = Be.btnCustomStyles && Be.btnCustomStyles(!0, ce);
                    n && (0, l["default"])(e, n);
                }
                f.insertAfter(fe, We), O(e);
            }
            function c() {
                if (Re = !0, _e = !0, je = !0, !ze) return void te();
                if (!Me) {
                    Me = !0;
                    try {
                        ke = m.createGrammarlyEditor({
                            app: oe,
                            doc: xe,
                            connection: se,
                            page: ae,
                            user: ie,
                            type: le,
                            field: ce,
                            actions: ue,
                            createSocket: de
                        }), he = g.infinityChecker(U, Ze.offline), I("on"), ke.run(), we.updateEditor(ke), 
                        ye.set("minimize", !Ge), ye.set("editor", ke);
                    } catch (e) {
                        console.error(e), Ze.offline();
                    }
                    te(), N(), P();
                }
            }
            function N() {
                var e = !Ze.getState().offline && ae.showOnboarding && ye.max;
                e && (ge = new x.Popup({
                    doc: xe,
                    el: pe,
                    editor: ke,
                    user: ie,
                    type: "onboarding"
                }), ue.seenOnboarding(), we.setOnboarding(ge));
            }
            function P() {
                var e = void 0 === ae.seenEmailPerceptionPopupDate || +new Date() - ae.seenEmailPerceptionPopupDate > T;
                ke && ke.emailFeedbackEnabled && e && ke.on("input", j);
            }
            function A() {
                ue.seenEmailPerceptionPopup(+new Date()), ke.off("input", j), clearTimeout(ve), 
                be = new x.Popup({
                    doc: xe,
                    el: pe,
                    editor: ke,
                    user: ie,
                    action: ke.insertGmailFeedback,
                    type: "emailPerception"
                });
            }
            function j() {
                if (clearTimeout(ve), void 0 !== ke) {
                    if (ke.emailFeedbackEnabled !== !0) return void ke.off("input", j);
                    var e = ke.getText().length;
                    e > S && (ve = setTimeout(A, 5e3));
                }
            }
            function I() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "on";
                ke[e]("finish", L), ke[e]("rendered", te), ke[e]("sending", q), ke[e]("show-dialog", Y);
            }
            function L() {
                Y(), te();
            }
            function M() {
                ke && ke.isOffline() && me.fastShow();
            }
            function R(e) {
                Ae && f.isFocused(Se) && V(e);
            }
            function O(e) {
                (0, l["default"])(Ce, e), B();
            }
            function D() {
                Ie = !ne(), Le = !0, h.fire("button-change-state", Ie), we && we.hide();
            }
            function F(e) {
                Ge || (Se.focus(), f.hasClass(e.target, E.status) && we.show(!0));
            }
            function B() {
                fe || r(), W();
            }
            function U() {
                ke.reset(), ke.hardReset();
            }
            function W() {
                return d.render(u.createElement(C.ButtonComponent, {
                    state: re(),
                    inlineStyle: Ce,
                    onViewClick: function(e) {
                        return F(e);
                    }
                }), fe);
            }
            function V(e) {
                if (!f.isFocused(Se) && _e) {
                    if (qe(e)) return void z();
                    _e = !1;
                }
                if (e.target !== Se) return H();
                if (o(e.target, pe, Se)) _e = !0, z(); else {
                    if (i(e.target)) return;
                    H();
                }
            }
            function G() {
                Ae = !0, je = !0, pe && "0" === pe.style.opacity && (pe.style.opacity = "1"), te();
            }
            function z() {
                Ae || (ze ? G() : Ke = setTimeout(G, 150));
            }
            function H() {
                if (Ae) {
                    if (clearTimeout(Ke), we && we.isOpened()) return void (pe.style.opacity = "0");
                    Ae = !1, je = !1, te();
                }
            }
            function q() {
                Ge || (clearTimeout(He), K());
            }
            function K() {
                clearTimeout(He), ke && !ke.getText().trim() || Ve || (Ve = !0, he && he.start(), 
                Ae || V({
                    target: Se
                }), te());
            }
            function Y() {
                clearTimeout(He), he && he.finish(), He = setTimeout(Q, 200);
            }
            function Q() {
                Ve = !1, te();
            }
            function J() {
                ke && (he && he.finish(), Me = !1, ke.remove(), I("off"));
            }
            function X() {
                J(), $(), Z(), f.unlisten(pe, "click", M), t.off("hover", V), f.unlisten(Se, "focus", Xe), 
                f.unlisten(Se, "blur", R), me && me.remove(), Ye && Ye(), fe && fe.parentNode && fe.parentNode.removeChild(fe);
            }
            function $() {
                ye && ye.remove(), we && we.remove(), we && we.unbind();
            }
            function Z() {
                ge && ge.remove(), be && be.remove(), ke && ke.off("input", j), clearTimeout(ve);
            }
            function ee(e) {
                var t = e.user, n = e.connection, r = e.page;
                De = t.anonymous, Fe = t.premium, Oe = t, Qe(n.online), ke && ke.updateState({
                    user: t,
                    connection: n,
                    page: r
                }), te();
            }
            function te() {
                var e = ke && ke.errorData() || {};
                e.enabled = ze, e.checking = Ve, e.anonymous = De, e.premium = Fe, e.user = Oe, 
                e.fieldWasFocused = Re, e.emailFeedbackEnabled = ke && ke.emailFeedbackEnabled, 
                we && we.update(e), ye && ye.set("show", je), Ze.initialized === !0 && B();
            }
            function ne() {
                return ye.max;
            }
            function re() {
                var e = ke && ke.errorData() || {}, t = Oe && Oe.experiments || {};
                return {
                    offline: Ge,
                    checking: Ve,
                    enabled: ze,
                    anonymous: De,
                    premium: Fe,
                    experiments: t,
                    show: je,
                    visible: Ae,
                    wasMinimized: Le,
                    minimized: Ie,
                    hovered: Pe,
                    isFieldEmpty: Te,
                    isFieldHovered: _e,
                    fieldWasFocused: Re,
                    isEditorInited: Me,
                    errors: e
                };
            }
            var oe = e.app, ie = e.user, ae = e.page, se = e.connection, ce = e.field, le = e.type, ue = e.actions, de = e.createSocket, fe = void 0, pe = void 0, me = void 0, he = void 0, ge = void 0, be = void 0, ve = void 0, _e = void 0, ye = void 0, we = void 0, ke = void 0, Ce = {
                visibility: "hidden"
            }, xe = ce.ownerDocument, Ee = "iframe" === le, Se = Ee ? a(ce) : ce, Te = 0 === (ce.value || ce.textContent || "").trim().length, Ne = !1, Pe = !1, Ae = !1, je = !1, Ie = !1, Le = !1, Me = !1, Re = !1, Oe = ie, De = ie.anonymous, Fe = ie.premium, Be = p.pageStyles(xe).getFixesForCurrentDomain(), Ue = k.State(ae.disabledFields, ue.toggleField), We = ce, Ve = !1, Ge = !se.online, ze = !0, He = void 0, qe = void 0, Ke = void 0, Ye = void 0, Qe = function(e) {
                Ge !== !e && (Ge = !e, ye && ye.set("minimize", e), te(), ke && ke[Ge ? "offline" : "online"](), 
                ze && me && me[Ge ? "enable" : "disable"]());
            }, Je = function(e) {
                if (ze !== e) {
                    var t = e && !ze, n = v.isSafari() && t;
                    ze = e, Ue.changeFieldState(ce, We, !e), ye && ye.set("maximize", e), e ? (we.hide(), 
                    c()) : J(), te(), n && (pe.style.display = "none", v.asyncCall(function() {
                        return pe.style.display = "";
                    }));
                }
            }, Xe = function et() {
                f.unlisten(Se, "focus", et), ze = !Ue.isFieldDisabled(ce), Ie = !ze, ze || Je(!1), 
                B();
            }, $e = function() {
                return pe;
            }, Ze = {
                online: function() {
                    return Qe(!0);
                },
                offline: function() {
                    return Qe(!1);
                },
                enable: function() {
                    return Je(!0);
                },
                disable: function() {
                    return Je(!1);
                },
                remove: X,
                getEl: $e,
                getState: re,
                updateState: ee,
                getPosState: ne,
                onViewClick: F,
                onChangeState: D,
                show: z,
                hide: H,
                update: te,
                checking: q,
                cancelChecking: Y,
                initialized: !1
            };
            return n(), Ze;
        }
        var c = e("babel-runtime/core-js/object/assign"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("react"), d = e("react-dom"), f = e("../dom"), p = e("../sites"), m = e("../editor"), h = e("../tracking"), g = e("../infinity-checker"), b = e("../elements/error-tooltip"), v = e("../util"), _ = e("./pos"), y = e("./path"), w = e("./menu"), k = e("./state"), C = e("./view"), x = e("./popup"), E = {
            textarea_btn: "_e725ae-textarea_btn",
            status: "_e725ae-status",
            field_hovered: "_e725ae-field_hovered",
            btn_text: "_e725ae-btn_text",
            not_focused: "_e725ae-not_focused",
            errors_100: "_e725ae-errors_100",
            anonymous: "_e725ae-anonymous",
            show: "_e725ae-show",
            errors: "_e725ae-errors",
            checking: "_e725ae-checking",
            has_errors: "_e725ae-has_errors",
            disabled: "_e725ae-disabled",
            transform_wrap: "_e725ae-transform_wrap",
            offline: "_e725ae-offline",
            plus_only: "_e725ae-plus_only",
            minimized: "_e725ae-minimized",
            hovered: "_e725ae-hovered",
            minimize_transition: "_e725ae-minimize_transition"
        }, S = 300, T = 864e5;
        n.Button = s;
    }, {
        "../dom": 228,
        "../editor": 230,
        "../elements/error-tooltip": 234,
        "../infinity-checker": 274,
        "../sites": 303,
        "../tracking": 316,
        "../util": 322,
        "./menu": 205,
        "./path": 208,
        "./popup": 210,
        "./pos": 213,
        "./state": 216,
        "./view": 217,
        "babel-runtime/core-js/object/assign": 36,
        react: "react",
        "react-dom": "react-dom"
    } ],
    203: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            function n(e) {
                function n(e, n) {
                    k.set(e, u.Button({
                        field: e,
                        app: h,
                        createSocket: t,
                        user: x,
                        page: E,
                        connection: S,
                        type: n,
                        actions: y
                    }, w));
                }
                m(e), e.textareas.forEach(function(e) {
                    return n(e, "textarea");
                }), e.contenteditables.forEach(function(e) {
                    return n(e, "contenteditable");
                }), e.iframes.forEach(function(e) {
                    return n(e, "iframe");
                }), e.htmlghosts.forEach(function(e) {
                    return n(e, "htmlghost");
                });
            }
            function r(e) {
                if (console.log("remove", e), k) {
                    var t = k.get(e);
                    t && t.remove(), k["delete"](e);
                }
            }
            function o() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "on";
                w && ("on" === e ? (w.on("add", n), w.on("remove", r)) : (w.off("add", n), w.off("remove", r)));
            }
            function i(e) {
                x = e.user, S = e.connection, E = e.page, f(e.connection.bgNotConnected), h.elements && h.elements.updateState(e), 
                k && k.forEach(function(t) {
                    return t.updateState(e);
                });
            }
            function f(e) {
                if (e && C) c.timers.start(d), s.logger.lostBgPageConnection(); else if (!e && !C) {
                    var t = c.timers.stop(d);
                    s.logger.restoreBgPageConnection(t);
                }
                C = !e;
            }
            function p() {
                o("off"), k && (k.forEach(function(e) {
                    return e.remove();
                }), k.clear()), k = null, h.elements && h.elements.clear(), h.elements = null, w && (w.reset(), 
                w.stop()), w = null;
            }
            function m(e) {
                try {
                    console.log("add", e);
                } catch (t) {
                    console.log("fields added");
                }
            }
            var h = e.app, g = e.doc, b = e.connection, v = e.user, _ = e.page, y = e.actions, w = l.PageFields({
                doc: g,
                page: _
            }), k = new a["default"](), C = !0, x = v, E = _, S = b;
            return f(b.bgNotConnected), o("on"), n(w.get()), {
                add: n,
                updateState: i,
                remove: r,
                clear: p
            };
        }
        var i = e("babel-runtime/core-js/map"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("../tracking"), c = e("../timers"), l = e("../page-fields"), u = e("./button"), d = "life_without_bg_connection";
        n.Buttons = o;
    }, {
        "../page-fields": 297,
        "../timers": 310,
        "../tracking": 316,
        "./button": 202,
        "babel-runtime/core-js/map": 35
    } ],
    204: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("react-dom"), v = e("../../dom"), _ = {
            hoverMenu: "_970ef1-hoverMenu",
            opened: "_970ef1-opened",
            btn: "_970ef1-btn",
            line: "_970ef1-line",
            panel: "_970ef1-panel",
            premium: "_970ef1-premium",
            btn_premium: "_970ef1-btn_premium",
            btn_grammarly: "_970ef1-btn_grammarly",
            anonymous: "_970ef1-anonymous",
            panelText: "_970ef1-panelText",
            critical: "_970ef1-critical",
            disabled: "_970ef1-disabled",
            referralArea: "_970ef1-referralArea",
            btn_disable: "_970ef1-btn_disable",
            initial: "_970ef1-initial",
            checking: "_970ef1-checking",
            counter: "_970ef1-counter",
            counter100: "_970ef1-counter100",
            buttonArea: "_970ef1-buttonArea",
            referralText: "_970ef1-referralText",
            feedback: "_970ef1-feedback",
            tooltip: "_970ef1-tooltip",
            tooltip_grammarly: "_970ef1-tooltip_grammarly",
            tooltip_premium: "_970ef1-tooltip_premium",
            tooltip_disable: "_970ef1-tooltip_disable",
            plus: "_970ef1-plus",
            tooltip_referral: "_970ef1-tooltip_referral",
            referral: "_970ef1-referral",
            tooltip_visible: "_970ef1-tooltip_visible",
            tooltip_hidden: "_970ef1-tooltip_hidden"
        }, y = function(e) {
            function t() {
                (0, l["default"])(this, t);
                var e = (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).call(this));
                return e.onMouseEnterHandler = e.onMouseEnterHandler.bind(e), e.onMouseLeaveHandler = e.onMouseLeaveHandler.bind(e), 
                e.onMouseClick = e.onMouseClick.bind(e), e;
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "onMouseEnterHandler",
                value: function() {
                    var e = this, t = 1350;
                    this.tooltipTimeout = setTimeout(function() {
                        e.props.data.onTooltip({
                            active: !0,
                            el: b.findDOMNode(e),
                            text: e.props.data.text,
                            cls: e.props.data.type
                        });
                    }, t);
                }
            }, {
                key: "onMouseLeaveHandler",
                value: function() {
                    clearTimeout(this.tooltipTimeout), this.props.data.onTooltip({
                        active: !1,
                        text: this.props.data.text,
                        cls: this.props.data.type
                    });
                }
            }, {
                key: "onMouseClick",
                value: function(e) {
                    this.props.data.click && this.props.data.click(e), "disable" === this.props.data.type && this.onMouseLeaveHandler();
                }
            }, {
                key: "render",
                value: function() {
                    var e, t = this.props.data, n = v.cs((e = {}, (0, i["default"])(e, _.btn, !0), (0, 
                    i["default"])(e, _["btn_" + t.type], !0), (0, i["default"])(e, _.counter, null != t.count && t.count > 0), 
                    (0, i["default"])(e, _.counter100, null != t.count && t.count > 99), e));
                    return g.createElement("div", {
                        className: _.buttonArea
                    }, g.createElement("div", {
                        className: n,
                        onClick: this.onMouseClick,
                        onMouseEnter: this.onMouseEnterHandler,
                        onMouseLeave: this.onMouseLeaveHandler,
                        "data-action": t.actionType,
                        tabIndex: -1
                    }, t.count && t.count > 0 ? t.count : null));
                }
            } ]), t;
        }(g.Component);
        n.MenuBtn = y;
    }, {
        "../../dom": 228,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        react: "react",
        "react-dom": "react-dom"
    } ],
    205: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            function n(e) {
                function t() {
                    U.showDialog({
                        caller: "button_hover"
                    }), b.fire("correct-btn-clicked"), h.timers.start("open_editor");
                }
                function n() {
                    b.fire("hook-clicked", "button_hover"), r();
                }
                function r() {
                    var e = l.getUpgradeUrlFromMatches({
                        baseUrl: f.URLS.upgrade,
                        returnUrl: "",
                        appType: "popup",
                        matches: U.getMatches()
                    });
                    e = p.addParamsToUpgradeURL(e, B.anonymous === !0 ? "signupHook" : "upHook", B.anonymous === !0 ? "extensionPremiumCta" : "buttonHover"), 
                    m.emitBackground("open-url", e);
                }
                if (!U.isOffline()) {
                    var o = e.target;
                    u.hasClass(o, _.btn_premium) ? z.premium ? t() : n() : u.hasClass(o, _.btn_grammarly) && t(), 
                    setTimeout(N, 200);
                }
            }
            function r() {
                z.enabled ? (z.enabled = !1, j.disable(), N()) : (j.enable(), z.enabled = !0), b.fire("btn-disable-in-field", z.enabled), 
                k();
            }
            function o(e) {
                z = e, B = e.user, k();
            }
            function i(e) {
                U = e;
            }
            function w(e) {
                var t = d.getAbsRect(A), n = t.top, r = t.left, o = !j.getPosState() && z.enabled;
                return e && (r -= e.clientWidth, n -= e.clientHeight / 2), n += o ? Q : K, r -= o ? Y : q, 
                !o && M.menuPosLeft && (r = M.menuPosLeft(U, r, z)), (0, a["default"])({}, F, "translate(" + r + "px, " + n + "px)");
            }
            function k() {
                var e = C(z, w(), O), t = c.findDOMNode(e);
                return C(z, w(t), R);
            }
            function C(e, t, o) {
                return c.render(s.createElement(g.HoverMenuView, {
                    style: t,
                    click: n,
                    disableClick: r,
                    state: e,
                    opened: G,
                    el: D,
                    insertGmailFeedback: function(e) {
                        void 0 !== U && (U.insertGmailFeedback(e), j.update());
                    },
                    hide: N
                }), o);
            }
            function x() {
                u.listen(L.documentElement, "mousemove", S), U && U.on("iframe-mousemove", S);
            }
            function E() {
                var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                G && !e || (u.unlisten(L.documentElement, "mousemove", S), U && U.off("iframe-mousemove", S));
            }
            function S(e) {
                var t = u.resolveEl(e.target, y.textarea_btn);
                if (t && t !== A) return N();
                if (u.hasClass(A, y.offline)) return N();
                var n = u.resolveEl(e.target, _.hoverMenu);
                return t || n === H ? e.target.classList.contains(y.btn_text) ? N() : void T() : N();
            }
            function T() {
                var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                W && W.isActive || (V && !z.offline && z.fieldWasFocused || e) && (G || (G = !0, 
                t(!0), z.emailFeedbackEnabled === !0 && b.fire("email-perception-button-hover"), 
                k()));
            }
            function N() {
                G && (G = !1, t(!1), k());
            }
            function P() {
                E(), R.parentNode && R.parentNode.removeChild(R), O.parentNode && O.parentNode.removeChild(O), 
                D.parentNode && D.parentNode.removeChild(D);
            }
            var A = e.el, j = e.btn, I = e.onboardingPopup, L = A.ownerDocument, M = v.pageStyles(L).getFixesForCurrentDomain(), R = L.createElement("div"), O = L.createElement("div"), D = L.createElement("div"), F = u.transformProp(L), B = e.user, U = e.editor, W = I, V = !0, G = !1, z = {
                critical: 0,
                plus: 0,
                offline: !1,
                enabled: e.enabled,
                initial: !1,
                checking: !1,
                fieldWasFocused: !!e.fieldWasFocused
            }, H = c.findDOMNode(k()), q = -26, K = 11, Y = -13, Q = 2;
            return u.addClass(R, "gr-top-z-index"), u.addClass(R, "gr-top-zero"), R.setAttribute("tabindex", "-1"), 
            O.style.cssText = "visibility: hidden;top: -9999px;position: absolute;opacity: 0", 
            D.style.cssText = "visibility: hidden;top: -9999px;position: absolute;opacity: 0", 
            L.documentElement.insertBefore(R, L.body), L.documentElement.insertBefore(O, L.body), 
            L.documentElement.insertBefore(D, L.body), {
                show: T,
                hide: N,
                bind: x,
                unbind: E,
                remove: P,
                render: k,
                menuEl: H,
                update: o,
                onclick: n,
                updateEditor: i,
                isOpened: function() {
                    return G;
                },
                isEnabled: function() {
                    return V;
                },
                disable: function() {
                    V = !1;
                },
                enable: function() {
                    V = !0;
                },
                getState: function() {
                    return z;
                },
                setOnboarding: function(e) {
                    W = e;
                }
            };
        }
        var i = e("babel-runtime/helpers/defineProperty"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("react"), c = e("react-dom"), l = e("lib/grammarly-editor"), u = e("../../dom"), d = e("../../position"), f = e("../../config"), p = e("lib/url"), m = e("../../message"), h = e("../../timers"), g = e("./view"), b = e("../../tracking"), v = e("../../sites"), _ = {
            hoverMenu: "_970ef1-hoverMenu",
            opened: "_970ef1-opened",
            btn: "_970ef1-btn",
            line: "_970ef1-line",
            panel: "_970ef1-panel",
            premium: "_970ef1-premium",
            btn_premium: "_970ef1-btn_premium",
            btn_grammarly: "_970ef1-btn_grammarly",
            anonymous: "_970ef1-anonymous",
            panelText: "_970ef1-panelText",
            critical: "_970ef1-critical",
            disabled: "_970ef1-disabled",
            referralArea: "_970ef1-referralArea",
            btn_disable: "_970ef1-btn_disable",
            initial: "_970ef1-initial",
            checking: "_970ef1-checking",
            counter: "_970ef1-counter",
            counter100: "_970ef1-counter100",
            buttonArea: "_970ef1-buttonArea",
            referralText: "_970ef1-referralText",
            feedback: "_970ef1-feedback",
            tooltip: "_970ef1-tooltip",
            tooltip_grammarly: "_970ef1-tooltip_grammarly",
            tooltip_premium: "_970ef1-tooltip_premium",
            tooltip_disable: "_970ef1-tooltip_disable",
            plus: "_970ef1-plus",
            tooltip_referral: "_970ef1-tooltip_referral",
            referral: "_970ef1-referral",
            tooltip_visible: "_970ef1-tooltip_visible",
            tooltip_hidden: "_970ef1-tooltip_hidden"
        }, y = {
            textarea_btn: "_e725ae-textarea_btn",
            status: "_e725ae-status",
            field_hovered: "_e725ae-field_hovered",
            btn_text: "_e725ae-btn_text",
            not_focused: "_e725ae-not_focused",
            errors_100: "_e725ae-errors_100",
            anonymous: "_e725ae-anonymous",
            show: "_e725ae-show",
            errors: "_e725ae-errors",
            checking: "_e725ae-checking",
            has_errors: "_e725ae-has_errors",
            disabled: "_e725ae-disabled",
            transform_wrap: "_e725ae-transform_wrap",
            offline: "_e725ae-offline",
            plus_only: "_e725ae-plus_only",
            minimized: "_e725ae-minimized",
            hovered: "_e725ae-hovered",
            minimize_transition: "_e725ae-minimize_transition"
        };
        n.createMenu = o;
    }, {
        "../../config": 224,
        "../../dom": 228,
        "../../message": 287,
        "../../position": 298,
        "../../sites": 303,
        "../../timers": 310,
        "../../tracking": 316,
        "./view": 207,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/grammarly-editor": 267,
        "lib/url": 321,
        react: "react",
        "react-dom": "react-dom"
    } ],
    206: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("../../dom"), v = {
            hoverMenu: "_970ef1-hoverMenu",
            opened: "_970ef1-opened",
            btn: "_970ef1-btn",
            line: "_970ef1-line",
            panel: "_970ef1-panel",
            premium: "_970ef1-premium",
            btn_premium: "_970ef1-btn_premium",
            btn_grammarly: "_970ef1-btn_grammarly",
            anonymous: "_970ef1-anonymous",
            panelText: "_970ef1-panelText",
            critical: "_970ef1-critical",
            disabled: "_970ef1-disabled",
            referralArea: "_970ef1-referralArea",
            btn_disable: "_970ef1-btn_disable",
            initial: "_970ef1-initial",
            checking: "_970ef1-checking",
            counter: "_970ef1-counter",
            counter100: "_970ef1-counter100",
            buttonArea: "_970ef1-buttonArea",
            referralText: "_970ef1-referralText",
            feedback: "_970ef1-feedback",
            tooltip: "_970ef1-tooltip",
            tooltip_grammarly: "_970ef1-tooltip_grammarly",
            tooltip_premium: "_970ef1-tooltip_premium",
            tooltip_disable: "_970ef1-tooltip_disable",
            plus: "_970ef1-plus",
            tooltip_referral: "_970ef1-tooltip_referral",
            referral: "_970ef1-referral",
            tooltip_visible: "_970ef1-tooltip_visible",
            tooltip_hidden: "_970ef1-tooltip_hidden"
        }, _ = function(e) {
            function t() {
                return (0, l["default"])(this, t), (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "render",
                value: function() {
                    var e, t = this.props.data || {}, n = this.props.measure, r = b.cs((e = {}, (0, 
                    i["default"])(e, v.tooltip, !0), (0, i["default"])(e, v.tooltip_visible, t.active && !n), 
                    (0, i["default"])(e, v.tooltip_hidden, !t.active && !n), (0, i["default"])(e, v["tooltip_" + t.cls], !0), 
                    e)), o = void 0;
                    return t.active && !n && (o = {
                        right: 0
                    }), g.createElement("div", {
                        style: o,
                        className: r,
                        ref: "tooltip",
                        dangerouslySetInnerHTML: {
                            __html: t.text
                        }
                    });
                }
            } ]), t;
        }(g.Component);
        n.Tooltip = _;
    }, {
        "../../dom": 228,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        react: "react"
    } ],
    207: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("react-dom"), v = e("./action"), _ = e("./tooltip"), y = e("../../dom"), w = {
            hoverMenu: "_970ef1-hoverMenu",
            opened: "_970ef1-opened",
            btn: "_970ef1-btn",
            line: "_970ef1-line",
            panel: "_970ef1-panel",
            premium: "_970ef1-premium",
            btn_premium: "_970ef1-btn_premium",
            btn_grammarly: "_970ef1-btn_grammarly",
            anonymous: "_970ef1-anonymous",
            panelText: "_970ef1-panelText",
            critical: "_970ef1-critical",
            disabled: "_970ef1-disabled",
            referralArea: "_970ef1-referralArea",
            btn_disable: "_970ef1-btn_disable",
            initial: "_970ef1-initial",
            checking: "_970ef1-checking",
            counter: "_970ef1-counter",
            counter100: "_970ef1-counter100",
            buttonArea: "_970ef1-buttonArea",
            referralText: "_970ef1-referralText",
            feedback: "_970ef1-feedback",
            tooltip: "_970ef1-tooltip",
            tooltip_grammarly: "_970ef1-tooltip_grammarly",
            tooltip_premium: "_970ef1-tooltip_premium",
            tooltip_disable: "_970ef1-tooltip_disable",
            plus: "_970ef1-plus",
            tooltip_referral: "_970ef1-tooltip_referral",
            referral: "_970ef1-referral",
            tooltip_visible: "_970ef1-tooltip_visible",
            tooltip_hidden: "_970ef1-tooltip_hidden"
        }, k = function(e) {
            function t() {
                (0, l["default"])(this, t);
                var e = (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
                return e.state = {
                    tooltip: {
                        active: !1,
                        text: "",
                        cls: ""
                    }
                }, e.onTooltip = function(t) {
                    var n = b.render(g.createElement(_.Tooltip, {
                        data: t,
                        measure: !0
                    }), e.props.el);
                    setTimeout(function() {
                        t.width = b.findDOMNode(n).clientWidth, e.setState({
                            tooltip: t
                        });
                    }, 10);
                }, e;
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "getTooltipText",
                value: function(e) {
                    return e.enabled ? "Disable in this text field" : "Enable Grammarly here";
                }
            }, {
                key: "render",
                value: function() {
                    var e, t = this, n = this.props, r = n.state, o = r.critical, a = r.plus, s = y.cs((e = {}, 
                    (0, i["default"])(e, w.hoverMenu, !0), (0, i["default"])(e, w.initial, r.initial), 
                    (0, i["default"])(e, w.premium, r.premium), (0, i["default"])(e, w.anonymous, r.anonymous), 
                    (0, i["default"])(e, w.checking, r.checking), (0, i["default"])(e, w.disabled, r.enabled === !1), 
                    (0, i["default"])(e, w.critical, !!o), (0, i["default"])(e, w.plus, !!a), (0, i["default"])(e, w.opened, n.opened), 
                    e)), c = r.anonymous ? "Log in to enable personalized<br/>checks and other features" : "Edit in Grammarly", l = r.premium ? "See advanced corrections" : "Upgrade to make advanced corrections", u = this.getTooltipText(r);
                    return g.createElement("div", {
                        className: s,
                        style: n.style
                    }, g.createElement("div", {
                        className: w.panel
                    }, g.createElement(_.Tooltip, {
                        data: this.state.tooltip
                    }), g.createElement(v.MenuBtn, {
                        data: {
                            type: "disable",
                            size: "small",
                            text: u,
                            click: n.disableClick,
                            onTooltip: this.onTooltip
                        }
                    }), g.createElement("div", {
                        className: w.line
                    }), r.enabled === !0 && r.emailFeedbackEnabled && g.createElement("span", {
                        onClick: function(e) {
                            t.props.insertGmailFeedback && (t.props.insertGmailFeedback(e.altKey), t.props.hide());
                        },
                        className: w.feedback
                    }, "Ask for feedback"), a ? g.createElement(v.MenuBtn, {
                        data: {
                            type: "premium",
                            size: "small",
                            text: l,
                            count: a,
                            click: n.click,
                            onTooltip: this.onTooltip
                        }
                    }) : null, g.createElement(v.MenuBtn, {
                        data: {
                            type: "grammarly",
                            actionType: "editor",
                            size: "small",
                            text: c,
                            click: n.click,
                            count: o,
                            onTooltip: this.onTooltip
                        }
                    })));
                }
            } ]), t;
        }(g.Component);
        n.HoverMenuView = k;
    }, {
        "../../dom": 228,
        "./action": 204,
        "./tooltip": 206,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        react: "react",
        "react-dom": "react-dom"
    } ],
    208: [ function(e, t, n) {
        "use strict";
        function r(e) {
            function t(e, t) {
                return t.left >= e.left && t.top >= e.top ? "se" : t.left >= e.left && t.top <= e.top ? "ne" : t.left <= e.left && t.top <= e.top ? "nw" : t.left <= e.left && t.top >= e.top ? "sw" : void 0;
            }
            function n(e, t, n, r) {
                var o = r.left + r.width + s, i = r.left - s, a = r.top + r.height + s, c = r.top - s, l = n.left - s, u = n.left + n.width + s, d = n.top - s, f = n.top + n.height + s, p = u > o ? u : o;
                return "se" === e && t.x >= l && t.x <= p && t.y >= d && t.y <= a || ("ne" === e && t.x >= l && t.x <= p && t.y >= c && t.y <= f || ("nw" === e && t.x >= i && t.x <= u && t.y >= c && t.y <= f || "sw" === e && t.x >= i && t.x <= u && t.y >= d && t.y <= a));
            }
            function r(e) {
                var t = e.getBoundingClientRect();
                return {
                    height: t.height,
                    width: t.width,
                    top: t.top,
                    left: t.left
                };
            }
            function o(e) {
                var o = r(i), s = r(a), c = t(o, s);
                return n(c, e, o, s);
            }
            var i = e.editorEl, a = e.btnEl, s = e.padding;
            return o;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.getWithinButtonPath = r;
    }, {} ],
    209: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("react-dom"), g = e("lib/dom"), b = e("lib/elements/signin/button"), v = e("lib/tracking"), _ = {
            gButtonPopup: "_9d9f60-gButtonPopup",
            emailPerception: "_9d9f60-emailPerception",
            text: "_9d9f60-text",
            title: "_9d9f60-title",
            popupFooter: "_9d9f60-popupFooter",
            onboarding: "_9d9f60-onboarding",
            emailPerceptionFlipped: "_9d9f60-emailPerceptionFlipped",
            isFliped: "_9d9f60-isFliped",
            link: "_9d9f60-link",
            close: "_9d9f60-close"
        }, y = function(e) {
            function t() {
                (0, s["default"])(this, t);
                var e = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return e.cancel = function() {
                    e.props.remove(), v.fire("email-perception-popup-cancel");
                }, e.state = {
                    styles: {}
                }, e;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    var e = this, t = h.findDOMNode(this.refs.gButtonPopup);
                    this._requestAnimationFrame = requestAnimationFrame(function() {
                        if (t.style.opacity = "1", t.style.transform) {
                            var e = t.style.transform.split(" ");
                            e[2] = "scale(1)", t.style.transform = e.join(" ");
                        }
                    }), this.setState(function() {
                        return {
                            styles: e.props.styles
                        };
                    }), v.fire("email-perception-popup-show");
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    cancelAnimationFrame(this._requestAnimationFrame);
                }
            }, {
                key: "render",
                value: function() {
                    var e = this, t = g.cs(_.gButtonPopup, _[this.props.type]);
                    return m.createElement("div", {
                        ref: "gButtonPopup",
                        className: t,
                        style: this.state.styles
                    }, m.createElement("p", {
                        className: _.title
                    }, "What do your readers think?"), m.createElement("p", {
                        className: _.text
                    }, "Ask the recipients if your message is concise and easy to read."), m.createElement(b.Button, {
                        onClick: function() {
                            return e.props.action();
                        },
                        cls: "onboarding",
                        styles: {
                            width: "180px"
                        },
                        text: "Ask for feedback"
                    }), m.createElement("button", {
                        className: _.close,
                        onClick: this.cancel
                    }), m.createElement("div", {
                        className: g.cs(_.popupFooter, this.props.isFlipped && _.isFliped)
                    }, "▲"));
                }
            } ]), t;
        }(m.Component);
        n.EmailPerceptionPopup = y;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/elements/signin/button": 249,
        "lib/tracking": 316,
        react: "react",
        "react-dom": "react-dom"
    } ],
    210: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/assign"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("react"), p = e("react-dom"), m = e("./onboarding"), h = e("./email-perception"), g = e("lib/position"), b = e("lib/dom"), v = e("lib/message"), _ = {
            onboarding: {
                height: 170,
                left: 329,
                top: 162,
                topFlip: 35
            },
            emailPerception: {
                height: 292,
                left: -45,
                top: 250,
                topFlip: 0
            },
            emailPerceptionFlipped: {
                height: 170,
                left: 329,
                top: 162,
                topFlip: 35
            }
        }, y = 250, w = function() {
            function e(t) {
                var n = this, r = t.doc, o = t.el, a = t.editor, c = t.user, u = t.type, d = t.action;
                (0, l["default"])(this, e), this._getStyles = function(e) {
                    var t = g.getAbsRect(n.el), r = t.top, o = t.left, a = b.transformProp(n._doc), c = o - n._offsets.left, l = n._isFlipped ? r + n._offsets.topFlip : r - n._offsets.top, u = e ? "scale(.7)" : "scale(1)";
                    return (0, s["default"])({}, (0, i["default"])({}, a, "translate(" + c + "px, " + l + "px) " + u));
                }, this._windowResize = function() {
                    var e = n._getStyles();
                    n.component.setState(function() {
                        return {
                            styles: e
                        };
                    });
                };
                var f = o.getBoundingClientRect();
                if (this._type = u, this._offsets = _[u], "emailPerception" === u) {
                    var p = window.outerWidth - o.getBoundingClientRect().right < y;
                    p && (this._type = "emailPerceptionFlipped", this._offsets = _[this._type]);
                }
                this._doc = r, this.editorId = a.id, this.editor = a, this.el = o, this.user = c, 
                this.isActive = !0, "onboarding" !== u && "emailPerceptionFlipped" !== u || (this._isFlipped = f.top < this._offsets.height), 
                void 0 !== d && (this.action = d), this.showTimeout = setTimeout(function() {
                    return n._show();
                }, 700);
            }
            return (0, d["default"])(e, [ {
                key: "openDialog",
                value: function() {
                    this.remove(), v.emitFocusedTab("show-dialog", {
                        data: {},
                        editorId: this.editorId,
                        user: this.user,
                        isOnboarding: !0
                    });
                }
            }, {
                key: "remove",
                value: function() {
                    b.unlisten(window, "resize", this._windowResize, !1), clearTimeout(this.showTimeout), 
                    this.container && p.unmountComponentAtNode(this.container), this.container && this.container.parentNode && this.container.parentNode.removeChild(this.container), 
                    this.isActive = !1;
                }
            }, {
                key: "_checkContainer",
                value: function() {
                    this.container || (this.container = this._doc.createElement("gbutton-popup"), this._doc.documentElement.appendChild(this.container));
                }
            }, {
                key: "_show",
                value: function() {
                    var e = this, t = void 0;
                    this._checkContainer();
                    var n = this._getStyles(!0);
                    t = "onboarding" === this._type ? f.createElement(m.OnboardingPopup, {
                        isFlipped: this._isFlipped,
                        styles: n,
                        remove: function() {
                            return e.remove();
                        },
                        action: function() {
                            return e.openDialog();
                        }
                    }) : f.createElement(h.EmailPerceptionPopup, {
                        isFlipped: this._isFlipped,
                        type: this._type,
                        styles: n,
                        remove: function() {
                            return e.remove();
                        },
                        action: function() {
                            e.remove(), e.action();
                        }
                    }), this.component = p.render(t, this.container), b.listen(window, "resize", this._windowResize, !1);
                }
            } ]), e;
        }();
        n.Popup = w;
    }, {
        "./email-perception": 209,
        "./onboarding": 211,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/dom": 228,
        "lib/message": 287,
        "lib/position": 298,
        react: "react",
        "react-dom": "react-dom"
    } ],
    211: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("react-dom"), g = e("lib/dom"), b = e("lib/elements/signin/button"), v = e("lib/tracking"), _ = {
            gButtonPopup: "_9d9f60-gButtonPopup",
            emailPerception: "_9d9f60-emailPerception",
            text: "_9d9f60-text",
            title: "_9d9f60-title",
            popupFooter: "_9d9f60-popupFooter",
            onboarding: "_9d9f60-onboarding",
            emailPerceptionFlipped: "_9d9f60-emailPerceptionFlipped",
            isFliped: "_9d9f60-isFliped",
            link: "_9d9f60-link",
            close: "_9d9f60-close"
        }, y = function(e) {
            function t() {
                (0, s["default"])(this, t);
                var e = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return e.cancel = function() {
                    e.props.remove(), v.fire("onboarding-popup-cancel");
                }, e.state = {
                    styles: {}
                }, e;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    var e = this, t = h.findDOMNode(this.refs.gButtonPopup);
                    this._requestAnimationFrame = requestAnimationFrame(function() {
                        if (t.style.opacity = "1", t.style.transform) {
                            var e = t.style.transform.split(" ");
                            e[2] = "scale(1)", t.style.transform = e.join(" ");
                        }
                    }), this.setState(function() {
                        return {
                            styles: e.props.styles
                        };
                    }), v.fire("onboarding-popup-show");
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    cancelAnimationFrame(this._requestAnimationFrame);
                }
            }, {
                key: "render",
                value: function() {
                    var e = this;
                    return m.createElement("div", {
                        ref: "gButtonPopup",
                        className: g.cs(_.gButtonPopup, _.onboarding),
                        style: this.state.styles
                    }, m.createElement("p", {
                        className: _.title
                    }, "Grammarly is Now Active"), m.createElement("p", {
                        className: _.text
                    }, "Want to see how it works?"), m.createElement(b.Button, {
                        onClick: function() {
                            return e.props.action();
                        },
                        cls: "onboarding",
                        styles: {
                            width: "180px"
                        },
                        text: "take a quick tour"
                    }), m.createElement("button", {
                        className: _.link,
                        onClick: this.cancel
                    }, "No, thanks"), m.createElement("div", {
                        className: g.cs(_.popupFooter, this.props.isFlipped && _.isFliped)
                    }, "▲"));
                }
            } ]), t;
        }(m.Component);
        n.OnboardingPopup = y;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/elements/signin/button": 249,
        "lib/tracking": 316,
        react: "react",
        "react-dom": "react-dom"
    } ],
    212: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("lib/sites"), l = e("./intersect"), u = function() {
            function e() {
                (0, i["default"])(this, e), this._check = function(e, t) {
                    return t && e !== t ? t : void 0;
                };
            }
            return (0, s["default"])(e, [ {
                key: "getStateIfChanged",
                value: function(e, t, n, r, o, i) {
                    var a = e.minimize, s = e.maximize, u = 200, d = o || 0, f = t.ownerDocument, p = c.pageStyles(f).getFixesForCurrentDomain(), m = i ? "maximize" : "minimize";
                    if (a || s) {
                        var h = p.forceMinimize && p.forceMinimize(r);
                        if (h || a && !s) return this._check(m, "minimize");
                        if (!n || !a && s) return this._check(m, "maximize");
                        var g = void 0, b = l.getIntersect(t, n);
                        b && d && d > 0 && (this.textLengthWhenMinimized = d, g = "minimize");
                        var v = this.textLengthWhenMinimized && this.textLengthWhenMinimized - d > u, _ = !this.textLengthWhenMinimized || v || 0 === d;
                        return g = _ ? "maximize" : "minimize", this._check(m, g);
                    }
                }
            } ]), e;
        }();
        n.Minimizer = u;
    }, {
        "./intersect": 214,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/sites": 303
    } ],
    213: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("lodash"), l = e("lib/window-events"), u = e("lib/util"), d = e("lib/dom"), f = e("./position"), p = e("./condition"), m = function() {
            function e(t, n, r) {
                var o = t.btnEl, a = t.fieldEl, s = t.sourceEl, l = t.custom, m = t.isTextarea, h = t.initCondition, g = this;
                (0, i["default"])(this, e), this._onPosUpdate = n, this._onStateChange = r, this.state = {
                    minimize: !1,
                    maximize: !0,
                    editor: null,
                    show: !1
                }, this.max = !0, this.windowEvents = {
                    paste: function() {
                        return g.debouncedUpdate();
                    },
                    resize: function() {
                        return g.update();
                    },
                    keyup: function() {
                        d.isFocused(g.fieldEl) && g.debouncedUpdate();
                    }
                }, this.checkResize = function() {
                    try {
                        if (g.position) {
                            var e = g.position.resize();
                            e && g.debouncedUpdate();
                        }
                    } catch (t) {
                        console.error(t), u.cancelInterval(g.checkResize);
                    }
                }, this.debouncedUpdate = c.debounce(function() {
                    return g.update();
                }, 50), this.update = function() {
                    if (g.state.show && g.position) {
                        g._onPosUpdate({
                            visibility: "hidden"
                        }), g._onPosUpdate(g.position.get(g.max));
                        var e = g.state.editor;
                        if (e) {
                            var t = e.ghostarea ? e.ghostarea.gh.clone.firstChild : g.fieldEl, n = e.getText().trim().length, r = g.minimizer && g.minimizer.getStateIfChanged(g.state, g.btnEl, t, g.fieldEl, n, g.max);
                            "undefined" != typeof r && (g.max = "maximize" === r, g._onStateChange(), g.update());
                        }
                    }
                }, this.remove = function() {
                    g.listeners("off"), g.minimizer = null, g.position && g.position.remove(), g.position = null;
                }, this.fieldEl = a, this.btnEl = o, this.max = h, this.state.minimize = !h, this.state.maximize = h, 
                this.position = f.createPositioner(o, s, l, m), this.minimizer = new p.Minimizer(), 
                this.listeners();
            }
            return (0, s["default"])(e, [ {
                key: "set",
                value: function(e, t) {
                    this.state[e] = t, this.update();
                }
            }, {
                key: "listeners",
                value: function() {
                    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "on";
                    "on" === e ? (l.on(this.windowEvents, null, !0), d.on.call(this.fieldEl, "scroll", this.debouncedUpdate), 
                    u.interval(this.checkResize, 200)) : (l.off(this.windowEvents, null, !0), d.off.call(this.fieldEl, "scroll", this.debouncedUpdate), 
                    u.cancelInterval(this.checkResize));
                }
            } ]), e;
        }();
        n.Pos = m;
    }, {
        "./condition": 212,
        "./position": 215,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "lib/dom": 228,
        "lib/util": 322,
        "lib/window-events": 323,
        lodash: "lodash"
    } ],
    214: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            var n = document.createElement("div");
            n.className = t, n.style.top = e.top + "px", n.style.left = e.left + "px", n.style.height = e.height + "px", 
            n.style.width = e.width + "px", n.style.position = "absolute", n.style.border = "1px dashed red", 
            n.style.zIndex = "1000000", n.style.pointerEvents = "none", document.body.appendChild(n);
        }
        function i(e, t) {
            return e.left + e.width > t.left && (e.bottom > t.top && e.bottom < t.bottom || e.top < t.bottom && e.top > t.top);
        }
        function a(e, t) {
            var n = document.body.scrollTop;
            return u && (0, l["default"])(document.querySelectorAll(".gr-evade")).forEach(function(e) {
                return e.parentElement && e.parentElement.removeChild(e);
            }), e.map(function(e) {
                return {
                    top: e.top + n,
                    bottom: e.bottom + n,
                    left: e.left,
                    width: e.width,
                    height: e.height
                };
            }).some(function(e) {
                return u && o(e, "gr-evade"), i(e, t);
            });
        }
        function s(e, t) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, r = e.getBoundingClientRect();
            if (!r) return !1;
            r = {
                top: r.top + document.body.scrollTop - d + n,
                bottom: r.bottom + document.body.scrollTop + d + n,
                left: r.left - d + n,
                width: r.width,
                height: r.height
            };
            var o = document.createRange();
            o.selectNodeContents(t);
            var i = t.clientWidth, s = (0, l["default"])(o.getClientRects()).filter(function(e) {
                var t = e.width;
                return t < i;
            });
            return a(s, r);
        }
        var c = e("babel-runtime/core-js/array/from"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = !1, d = 2;
        n.getIntersect = s;
    }, {
        "babel-runtime/core-js/array/from": 31
    } ],
    215: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            function n() {
                var e = f.getPos(t, void 0), n = e.x !== x.x || e.y !== x.y;
                return !(E.clientWidth === t.clientWidth && E.clientHeight === t.clientHeight && !n) && (x = e, 
                !0);
            }
            function r() {
                if (!C) {
                    E = (0, u["default"])({
                        offsetHeight: t.offsetHeight,
                        clientWidth: t.clientWidth,
                        clientHeight: t.clientHeight
                    }, p.compStyle(t, "border-bottom-width", "border-right-width", "resize", "padding-top", "padding-bottom", "overflowX", "overflow", "padding-right"), f.getAbsRect(t)), 
                    E.canBeResized = [ "both", "horizontal", "vertical" ].includes(E.resize);
                    var n = f.getAbsRect(e), r = n.left, o = n.top;
                    E.left += S - r, E.top += T - o, h || "scroll" === E.overflowX || "scroll" === E.overflow || (E.height = Math.max(E.height, E.offsetHeight));
                }
            }
            function o(e) {
                if (e) return 0;
                var t = parseInt(E["padding-right"], 10);
                return t > 0 ? -t / 2 + 2 : -5;
            }
            function i(e, t) {
                var n = e ? v : _;
                return e ? t ? (n - E.height) / 2 : -8 : 0;
            }
            function s() {
                var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0], n = {
                    visibility: ""
                };
                if (m) return (0, u["default"])(n, k.btnCustomStyles ? k.btnCustomStyles(e, t) : {});
                r();
                var s = !e && E.canBeResized ? -10 : 0, l = E.clientHeight < g, d = i(e, l) + o(e), f = e || l ? 0 : -7, p = e ? v : _, h = k.btnDiff ? k.btnDiff(t) : [ 0, 0 ], b = (0, 
                c["default"])(h, 2), y = b[0], x = b[1], N = E.left + E.width - parseInt(E["border-right-width"], 10) - p + d + y, P = E.top + E.height - parseInt(E["border-bottom-width"], 10) - p + d + f + x + s;
                return N === S && P === T ? n : ((0, u["default"])(n, w ? (0, a["default"])({}, w, "translate(" + N + "px, " + P + "px)") : {}), 
                C = !0, S = N, T = P, n);
            }
            function l() {
                p.off.call(e, b, N);
            }
            var m = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], h = arguments.length > 3 && void 0 !== arguments[3] && arguments[3], g = 25, b = p.transitionEndEventName(), v = 22, _ = 8, y = e.ownerDocument, w = p.transformProp(y), k = d.pageStyles(y).getFixesForCurrentDomain(), C = !1, x = f.getPos(t, void 0), E = void 0, S = 0, T = 0, N = function() {
                C = !1, r();
            };
            return p.on.call(e, b, N), r(), {
                get: s,
                resize: n,
                remove: l
            };
        }
        var i = e("babel-runtime/helpers/defineProperty"), a = r(i), s = e("babel-runtime/helpers/slicedToArray"), c = r(s), l = e("babel-runtime/core-js/object/assign"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("lib/sites"), f = e("lib/position"), p = e("lib/dom");
        n.createPositioner = o;
    }, {
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/slicedToArray": 52,
        "lib/dom": 228,
        "lib/position": 298,
        "lib/sites": 303
    } ],
    216: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            function e(e, n) {
                var r = s.pageStyles(e.ownerDocument).getFixesForCurrentDomain(), o = r.fieldStateForDomain && r.fieldStateForDomain(e);
                if (o) return o;
                var i = n && "IFRAME" === n.tagName, a = i ? n : e, c = [ a.getAttribute("id") || "", a.getAttribute("name") || "" ].filter(Boolean);
                return c.length || c.push(t(a)), i && c.push(n.ownerDocument.location.host || ""), 
                c.join(":");
            }
            function t(e, t) {
                return e && e.id && !t ? '//*[@id="' + e.id + '"]' : n(e);
            }
            function n(e) {
                for (var t = []; e && 1 === e.nodeType; e = e.parentNode) {
                    for (var n = 0, r = e.previousSibling; r; r = r.previousSibling) r.nodeType !== Node.DOCUMENT_TYPE_NODE && r.nodeName === e.nodeName && ++n;
                    var o = e.nodeName.toLowerCase(), i = n ? "[" + (n + 1) + "]" : "";
                    t.splice(0, 0, o + i);
                }
                return t.length ? "/" + t.join("/") : null;
            }
            function r(t, n) {
                var r = e(t, n);
                return i[r];
            }
            function o(t, n, r) {
                var o = e(t, n);
                i[o] !== r && c((0, a["default"])({}, o, r));
            }
            var i = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, c = arguments[1];
            return {
                getSelector: e,
                isFieldDisabled: r,
                changeFieldState: o
            };
        }
        var i = e("babel-runtime/helpers/defineProperty"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("../sites");
        n.State = o;
    }, {
        "../sites": 303,
        "babel-runtime/helpers/defineProperty": 48
    } ],
    217: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("lodash"), b = e("react"), v = e("../dom"), _ = e("../util"), y = {
            textarea_btn: "_e725ae-textarea_btn",
            status: "_e725ae-status",
            field_hovered: "_e725ae-field_hovered",
            btn_text: "_e725ae-btn_text",
            not_focused: "_e725ae-not_focused",
            errors_100: "_e725ae-errors_100",
            anonymous: "_e725ae-anonymous",
            show: "_e725ae-show",
            errors: "_e725ae-errors",
            checking: "_e725ae-checking",
            has_errors: "_e725ae-has_errors",
            disabled: "_e725ae-disabled",
            transform_wrap: "_e725ae-transform_wrap",
            offline: "_e725ae-offline",
            plus_only: "_e725ae-plus_only",
            minimized: "_e725ae-minimized",
            hovered: "_e725ae-hovered",
            minimize_transition: "_e725ae-minimize_transition"
        }, w = function(e) {
            function t() {
                return (0, l["default"])(this, t), (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "render",
                value: function() {
                    var e, t = this, n = this.props.state, r = n.anonymous, o = n.premium, a = n.errors.critical, s = a > 0 && !n.checking, c = !n.enabled, l = n.offline, u = g([ y.textarea_btn ]).push(v.cs((e = {}, 
                    (0, i["default"])(e, y.show, n.show), (0, i["default"])(e, y.minimized, n.minimized), 
                    (0, i["default"])(e, y.minimize_transition, n.wasMinimized), (0, i["default"])(e, y.errors, s), 
                    (0, i["default"])(e, y.has_errors, a > 0), (0, i["default"])(e, y.errors_100, a > 99), 
                    (0, i["default"])(e, y.offline, l), (0, i["default"])(e, y.checking, n.checking && !l && !c), 
                    (0, i["default"])(e, y.disabled, c), (0, i["default"])(e, y.plus_only, o && !s && n.errors.plus > 0), 
                    (0, i["default"])(e, y.anonymous, r), (0, i["default"])(e, y.hovered, n.hovered), 
                    (0, i["default"])(e, y.field_hovered, n.isFieldHovered), (0, i["default"])(e, y.not_focused, !n.fieldWasFocused), 
                    e))).join(" "), d = v.camelizeAttrs(this.props.inlineStyle), f = s && a ? a : " ", p = "Found " + a + " " + _.declension(a, [ "error", "errors" ]) + " in text";
                    return a || (p = "Protected by Grammarly"), b.createElement("div", {
                        onClick: function(e) {
                            return t.props.onViewClick(e);
                        },
                        style: d,
                        className: u
                    }, b.createElement("div", {
                        className: y.transform_wrap
                    }, b.createElement("div", {
                        title: p,
                        className: y.status
                    }, f)));
                }
            } ]), t;
        }(b.Component);
        n.ButtonComponent = w;
    }, {
        "../dom": 228,
        "../util": 322,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        lodash: "lodash",
        react: "react"
    } ],
    218: [ function(e, t, n) {
        "use strict";
        function r() {
            return a.isFacebookSite() ? s.facebookRewriteFunction : a.isJiraSite() ? c.jiraRewriteFunction : a.isBlackboardSite() ? l.blackboardRewriteFunction : null;
        }
        function o() {
            var e = r();
            e && i(document, e, []);
        }
        function i(e, t, n) {
            var r = e.createElement("script");
            n = n || [];
            var o = t.toString(), i = n.join(",");
            return r.innerHTML = "(function(){(" + o + ")(" + i + ") })()", e.documentElement.appendChild(r), 
            r;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("lib/location"), s = e("./scripts/facebook"), c = e("./scripts/jira"), l = e("./scripts/blackboard");
        n.getClientScriptFunction = r, n.injectClientScriptIfNeeded = o, n.addScript = i;
    }, {
        "./scripts/blackboard": 220,
        "./scripts/facebook": 221,
        "./scripts/jira": 223,
        "lib/location": 286
    } ],
    219: [ function(e, t, n) {
        "use strict";
        function r(e) {
            if ("TEXTAREA" !== e.tagName) try {
                var t = e.ownerDocument, n = o.sanitize(e.getAttribute("data-gramm_id")), r = "document.querySelector(\"[data-gramm_id='" + n + "']\")";
                return i.addScript(t, a.rewriteInnerHTML, [ r ]);
            } catch (s) {
                return void console.log("error rewrite " + s);
            }
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("dompurify"), i = e("./index"), a = e("./scripts/inner-html");
        n.rewriteInnerHTML = r;
    }, {
        "./index": 218,
        "./scripts/inner-html": 222,
        dompurify: "dompurify"
    } ],
    220: [ function(e, t, n) {
        "use strict";
        function r() {
            function e(e, t) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 10;
                if (e) {
                    for (;e && e !== document.body && !t(e) && n > 0; ) e = e.parentElement, n--;
                    return e && t(e);
                }
            }
            function t(t) {
                return e(t, function(e) {
                    return e.classList && e.classList.contains("editor-element");
                });
            }
            function n(e) {
                return "function" == typeof e.matches && e.matches("grammarly-card, grammarly-card *, .gr-top-zero, .gr-top-zero *");
            }
            function r(e, t) {
                var n = t && t.getAttribute("data-action");
                "editor" !== n && "login" !== n && e.focus();
            }
            function o(e) {
                var o = e.target, s = e.relatedTarget || e.explicitOriginalTarget || document.elementFromPoint(i, a);
                s && o && t(o) && n(s) && (e.stopImmediatePropagation(), r(o, s));
            }
            var i = 0, a = 0;
            document.addEventListener("blur", o, !0), document.addEventListener("DOMContentLoaded", function() {
                document.addEventListener("mousemove", function(e) {
                    i = e.clientX, a = e.clientY;
                }, !0);
            });
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.blackboardRewriteFunction = r;
    }, {} ],
    221: [ function(e, t, n) {
        "use strict";
        function r() {
            function e(e) {
                var t = {
                    target: document.activeElement,
                    _inherits_from_prototype: !0,
                    defaultPrevented: !1,
                    preventDefault: function() {}
                };
                for (var n in e) t[n] = e[n];
                return t;
            }
            function t(e, t) {
                var r = n[e];
                r && r.forEach(function(e) {
                    e(t);
                });
            }
            var n = {};
            document.addEventListener("document-paste-activeElement-gr", function(n) {
                t("paste", e({
                    clipboardData: {
                        getData: function() {
                            return n.detail || "";
                        },
                        items: [ "text/plain" ]
                    }
                }));
            }), document.addEventListener("document-mousedown-mouseup-activeElement-gr", function() {
                t("mousedown", e({
                    type: "mousedown"
                })), t("mouseup", e({
                    type: "mouseup"
                }));
            }), document.addEventListener("document-backspace-activeElement-gr", function() {
                t("keydown", e({
                    keyCode: 8,
                    which: 8,
                    charCode: 0,
                    type: "keydown"
                }));
            });
            var r = document.addEventListener.bind(document);
            document.addEventListener = function(e, t, o) {
                var i = n[e] || [];
                i.push(t), n[e] = i, r(e, t, o);
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.facebookRewriteFunction = r;
    }, {} ],
    222: [ function(e, t, n) {
        "use strict";
        function r(e) {
            function t(e) {
                if (e.parentNode) if (e.childNodes.length > 1) {
                    for (var t = document.createDocumentFragment(); e.childNodes.length > 0; ) t.appendChild(e.childNodes[0]);
                    e.parentNode.replaceChild(t, e);
                } else e.firstChild ? e.parentNode.replaceChild(e.firstChild, e) : e.parentNode.removeChild(e);
            }
            function n(e) {
                if (e) try {
                    for (var n = e.querySelectorAll(".gr_"), r = n.length, o = 0; o < r; o++) t(n[o]);
                } catch (i) {}
            }
            function r(e) {
                try {
                    Object.defineProperty(e, "innerHTML", {
                        get: function() {
                            try {
                                var t = e.ownerDocument.createRange();
                                t.selectNodeContents(e);
                                var r = t.cloneContents(), o = document.createElement("div");
                                return o.appendChild(r), n(o), o.innerHTML;
                            } catch (i) {
                                return "";
                            }
                        },
                        set: function(t) {
                            try {
                                var n = e.ownerDocument.createRange();
                                n.selectNodeContents(e), n.deleteContents();
                                var r = n.createContextualFragment(t);
                                e.appendChild(r);
                            } catch (o) {}
                        }
                    });
                } catch (t) {}
            }
            if (e) {
                var o = e.cloneNode;
                e.cloneNode = function(t) {
                    var i = o.call(e, t);
                    if (e.classList.contains("mceContentBody")) i.innerHTML = e.innerHTML, n(i); else try {
                        r(i);
                    } catch (a) {}
                    return i;
                }, r(e);
            }
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.rewriteInnerHTML = r;
    }, {} ],
    223: [ function(e, t, n) {
        "use strict";
        function r() {
            function e(e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n = document.createEvent("CustomEvent");
                n.initCustomEvent(e + "-gr", !0, !0, t), document.dispatchEvent(n);
            }
            function t(e, t) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 10;
                if (e) {
                    for (;e && e !== document.body && !t(e) && n > 0; ) e = e.parentElement, n--;
                    return e && t(e);
                }
            }
            function n(e) {
                return t(e, function(e) {
                    return e.classList && (e.classList.contains("inline-edit-fields") || e.classList.contains("editable-field"));
                });
            }
            function r(e) {
                return "function" == typeof e.matches && e.matches("grammarly-card, grammarly-card *,.gr-top-zero, .gr-top-zero *,[class*=-gButtonPopup], [class*=-gButtonPopup] *,[class*=-onboardingDialog], [class*=-onboardingDialog] *");
            }
            function o(e, t) {
                var n = t && t.getAttribute("data-action");
                "editor" !== n && "login" !== n && e.focus();
            }
            function i(e) {
                var t = e.target, i = e.relatedTarget || e.explicitOriginalTarget || document.elementFromPoint(a, s);
                i && t && n(t) && r(i) && (e.stopImmediatePropagation(), o(t, i));
            }
            var a = 0, s = 0;
            document.addEventListener("blur", i, !0), document.addEventListener("DOMContentLoaded", function() {
                function t() {
                    return "jira" === document.body.id && document.body.getAttribute("data-version") || document.querySelector("input[type=hidden][title=JiraVersion]");
                }
                t() ? (e("jira-inline-support", {
                    activated: !0
                }), document.addEventListener("mousemove", function(e) {
                    a = e.clientX, s = e.clientY;
                }, !0)) : (e("jira-inline-support", {
                    activated: !1
                }), document.removeEventListener("blur", i, !0));
            });
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.jiraRewriteFunction = r;
    }, {} ],
    224: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            (0, l["default"])(d.URLS, e);
        }
        function i(e, t, n) {
            var r = p[e][n] || [];
            return r && t && t.some(function(e) {
                return r.includes(e);
            });
        }
        var a = e("babel-runtime/helpers/toConsumableArray"), s = r(a), c = e("babel-runtime/core-js/object/assign"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("spark-md5"), d = e("./newConfig"), f = e("./newConfig");
        n.isTestsMode = f.isTestsMode, n.getVersion = f.getVersion, n.getUuid = f.getUuid, 
        n.ENV = f.ENV, n.MIXPANEL = f.MIXPANEL, n.STATSC = f.STATSC, n.GRAMMARLY_DOMAIN = f.GRAMMARLY_DOMAIN, 
        n.DAPI = f.DAPI, n.URLS = f.URLS, n.appName = f.appName, n.gnarAppName = f.gnarAppName, 
        n.FELOG = {
            key: "b37252e300204b00ad697fe1d3b979e1",
            project: "15",
            pingTimeout: 6e5
        }, n.GNAR = {
            url: "https://gnar.grammarly.com",
            domain: ".grammarly.com"
        }, n.updateUrls = o, n.news = [ "The G logo gets out of the way when you're typing", "Switch between American and British English", "Quickly disable checking in certain types of text fields", "A fully redesigned and improved interface" ], 
        n.newsId = n.news.length && u.hash(n.news.join("\n")), n.userFields = [ "id", "email", "firstName", "anonymous", "type", "subscriptionFree", "experiments", "isTest", "premium", "settings", "registrationDate", "mimic", "groups", "extensionInstallDate", "fixed_errors", "referral" ], 
        n.userFields.push("token"), n.FEATURES = {
            EXAMPLE_FEATURE: "example_feature"
        };
        var p = {
            example_feature: {
                Free: [],
                Premium: []
            }
        };
        n.isFeatureDisabled = i, n.nextVerClass = "gr_ver_2", n.grammarlyAttrs = [ "data-gramm_editor", "data-gramm", "data-gramm_id", "gramm_editor" ], 
        n.restrictedAttrs = [].concat((0, s["default"])(n.grammarlyAttrs), [ "readonly", "disabled", "pm-container", "data-synchrony", [ "class", "redactor-editor" ], [ "class", "redactor_box" ], [ "aria-label", "Search Facebook" ] ]), 
        n.restrictedParentAttrs = "[data-reactid]", n.externalEvents = [ "changed-user", "changed-plan", "changed-dialect", "cleanup", "editor-fix", "enable-email-perception" ], 
        n.development = "127.0.0.1:3117" === document.location.host;
    }, {
        "./newConfig": 288,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/toConsumableArray": 53,
        "spark-md5": "spark-md5"
    } ],
    225: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = {
                log: f._f
            };
            m.forEach(function(t) {
                e[t] = g[t];
            }), h.console = e;
        }
        function i() {
            p.on("bg-log", function(e) {
                var t;
                (t = console)[e.method].apply(t, [ "BG LOG" ].concat((0, d["default"])(e.args)));
            });
        }
        function a() {
            i();
            var e = {};
            m.concat("log").forEach(function(t) {
                e[t] = function() {
                    for (var e = arguments.length, n = Array(e), r = 0; r < e; r++) n[r] = arguments[r];
                    try {
                        b.push({
                            method: t,
                            args: n
                        }), g[t]((0, l["default"])(n));
                    } catch (o) {}
                };
            }), h.console = e;
        }
        function s() {
            var e = b.concat();
            return b.length = 0, e;
        }
        var c = e("babel-runtime/core-js/json/stringify"), l = r(c), u = e("babel-runtime/helpers/toConsumableArray"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("./util"), p = e("./message"), m = [ "info", "warn", "error", "time", "timeEnd", "debug" ], h = window, g = console;
        n.disableConsoleLog = o;
        var b = [];
        n.setSeleniumCompatibility = a, n.flushLog = s;
    }, {
        "./message": 287,
        "./util": 322,
        "babel-runtime/core-js/json/stringify": 34,
        "babel-runtime/helpers/toConsumableArray": 53
    } ],
    226: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/symbol"), i = r(o), a = e("babel-runtime/core-js/object/assign"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./dom"), l = e("./util"), u = e("./position"), d = e("emitter"), f = e("react"), p = e("./tracking"), m = e("react-dom"), h = e("dompurify"), g = e("./window-events"), b = e("./elements/tooltip"), v = e("./inline-cards/icons"), _ = {
            container: "_c4f153-container",
            flip: "_c4f153-flip",
            flipSyn: "_c4f153-flipSyn",
            card: "_c4f153-card",
            bigTitle: "_c4f153-bigTitle",
            unknownWordTitle: "_c4f153-unknownWordTitle",
            btnDictLabelWithIcon: "_c4f153-btnDictLabelWithIcon",
            explanation: "_c4f153-explanation",
            replacement: "_c4f153-replacement",
            maxWidthReached: "_c4f153-maxWidthReached",
            item: "_c4f153-item",
            logoIcon: "_c4f153-logoIcon",
            ignoreIcon: "_c4f153-ignoreIcon",
            undoIcon: "_c4f153-undoIcon",
            dictionaryIcon: "_c4f153-dictionaryIcon",
            wikiIcon: "_c4f153-wikiIcon",
            footer: "_c4f153-footer",
            footerButton: "_c4f153-footerButton",
            btnIgnore: "_c4f153-btnIgnore",
            icon: "_c4f153-icon",
            btnLogo: "_c4f153-btnLogo",
            btnPersonalize: "_c4f153-btnPersonalize",
            personalizeMessage: "_c4f153-personalizeMessage",
            attn: "_c4f153-attn",
            cardAddedToDict: "_c4f153-cardAddedToDict",
            addedToDictTitle: "_c4f153-addedToDictTitle",
            dictionaryDescription: "_c4f153-dictionaryDescription",
            undo: "_c4f153-undo",
            dictLink: "_c4f153-dictLink",
            dictionaryAddedIcon: "_c4f153-dictionaryAddedIcon",
            synTitle: "_c4f153-synTitle",
            synList: "_c4f153-synList",
            synListSingle: "_c4f153-synListSingle",
            synListTitle: "_c4f153-synListTitle",
            synListNumber: "_c4f153-synListNumber",
            synSubitems: "_c4f153-synSubitems",
            synItem: "_c4f153-synItem",
            dict: "_c4f153-dict",
            dictContent: "_c4f153-dictContent",
            dictItemCounter: "_c4f153-dictItemCounter",
            dictItem: "_c4f153-dictItem",
            qualifier: "_c4f153-qualifier",
            dictFooterItem: "_c4f153-dictFooterItem",
            wikiLink: "_c4f153-wikiLink",
            wiki: "_c4f153-wiki",
            gr__tooltip_empty: "gr__tooltip_empty",
            gr__tooltip: "gr__tooltip",
            "gr-notfound-tooltip": "gr-notfound-tooltip",
            "gr__tooltip-content": "gr__tooltip-content",
            "gr__tooltip-logo": "gr__tooltip-logo",
            gr__flipped: "gr__flipped"
        };
        n.DictionaryCard = f.createClass({
            displayName: "DictionaryCard",
            getDefaultProps: function() {
                return {
                    pos: {
                        rect: {
                            top: 0,
                            left: 0,
                            width: 0
                        },
                        sourceRect: {
                            width: 0
                        },
                        delta: {
                            right: 0
                        },
                        className: "",
                        visible: !1
                    },
                    data: void 0,
                    visible: !1
                };
            },
            render: function() {
                var e = {}, t = this.props.pos;
                e.top = t.rect.top, e.left = t.rect.left, e.visibility = this.props.visible ? "" : "hidden";
                var n = this.props.data;
                return f.createElement("div", {
                    className: _.container,
                    style: e
                }, f.createElement("div", {
                    tabIndex: -1,
                    className: c.cs(_.card, _.dict, t.rect.flip && _.flip)
                }, f.createElement("div", {
                    className: _.dictContent
                }, n.defs.map(function(e, t) {
                    var r = e.replace(/^([:,]\s)/, "");
                    return r = r[0].toUpperCase() + r.substring(1, r.length), f.createElement("div", {
                        key: t,
                        className: c.cs(1 === n.defs.length ? _.dictSingle : _.dictItem)
                    }, n.defs.length > 1 && f.createElement("span", {
                        className: _.dictItemCounter
                    }, t + 1, ". "), f.createElement("span", {
                        dangerouslySetInnerHTML: {
                            __html: h.sanitize(r)
                        }
                    }));
                })), f.createElement("div", {
                    className: _.footer
                }, n.url && "wiki" === n.origin && f.createElement("div", {
                    className: c.cs(_.item, _.wiki)
                }, f.createElement("a", {
                    href: encodeURI(n.url),
                    target: "_blank",
                    className: _.wikiLink
                }, f.createElement(v.WikiIcon, {
                    className: c.cs(_.icon, _.wikiIcon)
                }), " More on Wikipedia")), f.createElement("div", {
                    className: c.cs(_.item, _.dictFooterItem)
                }, f.createElement(v.LogoIcon, {
                    className: c.cs(_.icon, _.logoIcon)
                }), " Definitions by Grammarly"))));
            }
        });
        var y = (0, s["default"])(function() {
            function e(e) {
                w.innerHTML = h.sanitize(e);
                var t = w.querySelector("span.qualifier");
                return t ? (t.innerHTML = t.innerHTML.replace("(", "").replace(")", ""), t.className = _.qualifier, 
                w.innerHTML) : e;
            }
            function t(e) {
                return e.replace(/&lt;(sup|sub)&gt;(.*?)&lt;(\/sup|\/sub)&gt;/, "<$1>$2<$3>").replace(/&amp;(?=\w{1,8};)/, "&");
            }
            function r(n, r) {
                var i = {
                    ownerDocument: y,
                    getBoundingClientRect: function() {
                        return r.pos;
                    },
                    getClientRects: function() {
                        return [ r.pos ];
                    }
                };
                if (S = n, S.defs && S.defs.length) {
                    var a = u.getAbsRect(i);
                    S.title = r.el.toString(), S.defs = S.defs.splice(0, 3).map(e).map(t), x = o(!1), 
                    E = m.findDOMNode(x.component), T = u.posToRect(E, a), o();
                } else C.enable(), C.show({
                    posEl: r.el,
                    text: "No definition found"
                });
                g.on(N, null, !0), p.logger.dictCardShowAction();
            }
            function o() {
                var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
                return c.renderReactWithParent(f.createElement(n.DictionaryCard, {
                    pos: T,
                    data: S,
                    visible: e
                }), y.documentElement, k, "grammarly-card");
            }
            function a() {
                x && x.remove(), g.off(N, null, !0), P.emit("hide"), C.disable(), C.hide(), x = null, 
                p.logger.dictCardHideAction();
            }
            function s(e) {
                27 === l.keyCode(e) && a();
            }
            function v(e) {
                "dictionary-card" !== document.body.className && (c.inEl(e.target, E) || a());
            }
            var y = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document, w = y.createElement("div"), k = (0, 
            i["default"])("DictionaryCard"), C = b.createTooltip({
                cls: c.cs("gr-notfound-tooltip", _.gr__tooltip_empty),
                enabled: !1,
                doc: y
            }), x = void 0, E = void 0, S = void 0, T = void 0, N = {
                click: v,
                keydown: s,
                scroll: a,
                resize: a
            }, P = d({
                show: r,
                hide: a,
                unescapeSuperscript: t
            });
            return P;
        }, {
            component: n.DictionaryCard
        });
        n.Card = y;
    }, {
        "./dom": 228,
        "./elements/tooltip": 256,
        "./inline-cards/icons": 275,
        "./position": 298,
        "./tracking": 316,
        "./util": 322,
        "./window-events": 323,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/symbol": 44,
        dompurify: "dompurify",
        emitter: "emitter",
        react: "react",
        "react-dom": "react-dom"
    } ],
    227: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            function t() {
                u && u.release(), u = null, l = null;
            }
            function n(e) {
                return d(this, void 0, void 0, a["default"].mark(function t() {
                    var n, r;
                    return a["default"].wrap(function(t) {
                        for (;;) switch (t.prev = t.next) {
                          case 0:
                            if (n = !!e.el.startContainer && g.matchesSelector(e.el.startContainer.parentNode, ".gr-grammar-card, .gr-grammar-card *, .gr-dictionary-card, .gr-dictionary-card *"), 
                            !n || o) {
                                t.next = 3;
                                break;
                            }
                            return t.abrupt("return");

                          case 3:
                            return y = "gr-selection-anim-dict " + b.nextVerClass, i.animate(e.el, y), l = e, 
                            r = {}, t.prev = 7, t.next = 10, m.fetch(b.URLS.dictionary, {
                                data: (0, c["default"])({}, e.data)
                            });

                          case 10:
                            if (r = t.sent, l === e) {
                                t.next = 13;
                                break;
                            }
                            return t.abrupt("return");

                          case 13:
                            t.next = 18;
                            break;

                          case 15:
                            t.prev = 15, t.t0 = t["catch"](7), p.logger.fetchDefinitionsFail();

                          case 18:
                            i.complete(), s.show(r, e), n && i.remove();

                          case 21:
                          case "end":
                            return t.stop();
                        }
                    }, t, this, [ [ 7, 15 ] ]);
                }));
            }
            var r = e.doc, o = e.cardInspection, i = new _.SelectionAnimator(r), s = v.Card(r), l = void 0, u = new h.SelectionElement(r, n, i.remove), y = void 0;
            return s.on("hide", i.remove), f({
                clear: t
            });
        }
        var i = e("babel-runtime/regenerator"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s), l = e("babel-runtime/core-js/promise"), u = r(l), d = function(e, t, n, r) {
            return new (n || (n = u["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("emitter"), p = e("./tracking"), m = e("./request"), h = e("./selection"), g = e("./dom"), b = e("./config"), v = e("./dictionary-card"), _ = e("./selection-animator");
        n.dictionary = o;
    }, {
        "./config": 224,
        "./dictionary-card": 226,
        "./dom": 228,
        "./request": 300,
        "./selection": 302,
        "./selection-animator": 301,
        "./tracking": 316,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/regenerator": 55,
        emitter: "emitter"
    } ],
    228: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            var n = (t || document).createElement("div");
            return n.innerHTML = e.trim(), n.firstElementChild;
        }
        function i(e, t, n) {
            var r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "div", o = t, i = o[n] = o[n] || {};
            i.el || (i.el = o.ownerDocument.createElement(r), o.appendChild(i.el));
            var a = se.render(e, i.el);
            return null == i.remove && (i.remove = function() {
                delete o[n], o.removeChild(i.el), se.unmountComponentAtNode(i.el);
            }), {
                component: a,
                remove: i.remove.bind(i),
                el: i.el
            };
        }
        function a(e, t) {
            for (var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1e3, r = 0, o = e; o.parentNode && r < n; ) {
                if ("string" != typeof t && t === o) return !0;
                if (o.id === t || o === t) return !0;
                o = o.parentNode;
            }
            return !1;
        }
        function s(e, t) {
            return !(!e || void 0 === e.className) && e.classList.contains(t);
        }
        function c(e, t) {
            if (e && e.classList) return e.classList.remove(t);
        }
        function l(e, t) {
            if (e) {
                if (t.indexOf(" ") === -1) return e.classList.add(t);
                for (var n = t.split(" "), r = 0; r < n.length; r++) e.classList.add(n[r]);
            }
        }
        function u(e, t, n) {
            t ? l(e, n) : c(e, n);
        }
        function d(e, t) {
            for (var n = e.parentNode; null !== n; ) {
                if (m(n, t)) return n;
                n = n.parentNode;
            }
            return !1;
        }
        function f(e) {
            for (var t = e.parentNode; null !== t; ) {
                if (p(t)) return t;
                t = t.parentNode;
            }
            return !1;
        }
        function p(e) {
            return "true" === e.contentEditable || "plaintext-only" === e.contentEditable;
        }
        function m(e, t) {
            if (!e) return !1;
            var n = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector;
            return !!n && n.apply(e, [ t ]);
        }
        function h(e) {
            return document.activeElement && "IFRAME" === document.activeElement.tagName ? e === e.ownerDocument.activeElement : document.activeElement && "BODY" === document.activeElement.tagName ? e === document.activeElement : e === document.activeElement;
        }
        function g(e, t, n, r) {
            var o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
            if (null != e) {
                var i = e;
                if ("string" != typeof t) return ce.each(t, function(e, t) {
                    g(i, t, e, r);
                });
                if (n) {
                    var a = i[de] || [];
                    return i[de] = a, r ? (i[de] = a.filter(function(e) {
                        return !(e.event === t && e.cb === n);
                    }), i.removeEventListener(t, n, o)) : (a.push({
                        event: t,
                        cb: n
                    }), i.addEventListener(t, n, o)), {
                        el: i,
                        event: t,
                        cb: n,
                        bubble: o
                    };
                }
            }
        }
        function b(e, t, n, r) {
            var o = e;
            t || null == o[de] ? g(o, t, n, !0, r) : o[de].forEach(function(e) {
                return b(o, e.event, e.cb, e.bubble);
            });
        }
        function v(e, t, n) {
            var r = this;
            return this.addEventListener(e, t, n), {
                off: function() {
                    return _.apply(r, [ e, t, n ]);
                }
            };
        }
        function _(e, t, n) {
            this.removeEventListener(e, t, n);
        }
        function y(e, t) {
            var n = this, r = function o(r) {
                t(r), _.call(n, e, o);
            };
            v.call(this, e, r);
        }
        function w(e, t) {
            var n = document.createEvent("CustomEvent");
            n.initCustomEvent(e, !0, !0, t), this.dispatchEvent(n);
        }
        function k(e) {
            var t = getComputedStyle(e, void 0);
            return "none" !== t.getPropertyValue("display") && "hidden" !== t.getPropertyValue("visibility") && e.clientHeight > 0;
        }
        function C() {
            for (var e = arguments.length, t = Array(e), n = 0; n < e; n++) t[n] = arguments[n];
            return t.reduce(function(e, t) {
                return e.concat(ce.isObject(t) ? (0, ae["default"])(t).filter(function(e) {
                    return t[e];
                }) : t);
            }, []).filter(function(e) {
                return Boolean(e);
            }).join(" ");
        }
        function x(e, t) {
            return "number" != typeof t || fe[T(e)] ? t : t + "px";
        }
        function E(e) {
            return e.replace(/-+(.)?/g, function(e, t) {
                return t ? t.toUpperCase() : "";
            });
        }
        function S(e) {
            return ce.transform(e, function(e, t, n) {
                return e[E(n)] = t;
            });
        }
        function T(e) {
            return e.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase();
        }
        function N(e, t, n) {
            if (arguments.length < 3) {
                var r = e;
                if (!r) return;
                var o = getComputedStyle(r, "");
                if ("string" == typeof t) return r.style[E(t)] || o.getPropertyValue(t);
                if (ce.isArray(t)) {
                    var i = {};
                    return ce.each(t, function(e, t) {
                        i[E(e)] = r.style[E(e)] || o.getPropertyValue(e);
                    }), i;
                }
            }
            var a = "";
            if (ce.isString(t)) n || 0 === n ? a = T(t) + ":" + x(t, n) : e.style.removeProperty(T(t)); else {
                t = t;
                for (var s in t) t[s] || 0 === t[s] ? a += T(s) + ":" + x(s, t[s]) + ";" : e.style.removeProperty(T(s));
            }
            return e.style.cssText += ";" + a;
        }
        function P(e, t) {
            if (t && e) {
                var n = N(e, (0, ae["default"])(t));
                return N(e, t), function() {
                    return N(e, n);
                };
            }
        }
        function A(e, t) {
            for (var n = e.parentNode; null !== n; ) {
                if (n.tagName === t) return n;
                n = n.parentNode;
            }
            return null;
        }
        function j(e, t, n) {
            for (var r = e.parentNode; null !== r; ) {
                if (r.dataset && r.dataset[t] && r.dataset[t] == n) return r;
                r = r.parentNode;
            }
        }
        function I(e, t) {
            return s(e, t) ? e : L(e, t);
        }
        function L(e, t) {
            for (var n = e.parentNode; null !== n; ) {
                if (s(n, t)) return n;
                n = n.parentNode;
            }
            return !1;
        }
        function M(e, t) {
            if (!e) return !1;
            for (var n = e; n.parentNode; ) {
                if (s(n, t)) return n;
                n = n.parentNode;
            }
            return !1;
        }
        function R() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
            return e ? R.call(this.parentNode, --e) : this;
        }
        function O(e, t) {
            if (!e) return !1;
            for (var n = e; n.parentNode; ) {
                if (t === n.parentNode) return n;
                n = n.parentNode;
            }
            return !1;
        }
        function D(e, t) {
            var n = t.parentNode;
            if (null === n) throw new ue.AssertionError("Expected non-null parent");
            n.lastChild === t ? n.appendChild(e) : n.insertBefore(e, t.nextSibling);
        }
        function F(e, t) {
            ue.assertNonNull(t.parentNode, "parent node").insertBefore(e, t);
        }
        function B(e, t) {
            t = t || document;
            for (var n = e; n; ) {
                if (n === t) return !0;
                n = n.parentNode;
            }
            return !1;
        }
        function U(e) {
            var t = void 0, n = void 0, r = {
                ctrl: !1,
                meta: !1,
                shift: !1,
                alt: !1
            }, o = ce.extend(r, e);
            try {
                t = o.el.ownerDocument.createEvent("KeyEvents"), n = o.el.ownerDocument.defaultView, 
                t.initKeyEvent(o.type, !0, !0, n, o.ctrl, o.alt, o.shift, o.meta, 0, 0);
            } catch (i) {
                t = o.el.ownerDocument.createEvent("UIEvents"), t.initUIEvent.bind(t)(void 0, !0, !0, window, 1), 
                t.keyCode = 0, t.which = 0, t.charCode = 0, t.ctrlKey = o.ctrl, t.altKey = o.alt, 
                t.shiftKey = o.shift, t.metaKey = o.meta;
            }
            o.el.dispatchEvent(t);
        }
        function W(e) {
            return "undefined" != typeof e.hidden ? e.hidden : "undefined" != typeof e.mozHidden ? e.mozHidden : "undefined" != typeof e.webkitHidden ? e.webkitHidden : "undefined" != typeof e.msHidden && e.msHidden;
        }
        function V(e) {
            return "undefined" != typeof e.hidden ? "visibilitychange" : "undefined" != typeof e.mozHidden ? "mozvisibilitychange" : "undefined" != typeof e.webkitHidden ? "webkitvisibilitychange" : "undefined" != typeof e.msHidden && "msvisibilitychange";
        }
        function G() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document;
            return "undefined" != typeof e.body.style.transform ? "transform" : "undefined" != typeof e.body.style.WebkitTransform ? "WebkitTransform" : "undefined" != typeof e.body.style.MozTransform ? "MozTransform" : void 0;
        }
        function z(e) {
            if (e) {
                var t = e.ownerDocument;
                if (t) {
                    var n = t.defaultView || window;
                    if (n) {
                        var r = n.getComputedStyle(e, void 0);
                        if (r) {
                            for (var o = arguments.length, i = Array(o > 1 ? o - 1 : 0), a = 1; a < o; a++) i[a - 1] = arguments[a];
                            return 1 === i.length ? r.getPropertyValue(i[0]) : i.reduce(function(e, t) {
                                return (0, oe["default"])({}, e, (0, ne["default"])({}, t, r.getPropertyValue(t)));
                            }, {});
                        }
                    }
                }
            }
        }
        function H(e) {
            return e.split(" ").map(function(e) {
                return "." !== e[0] ? "." + e : e;
            }).join("").trim();
        }
        function q(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            if (n.length > 0) {
                var o = [];
                return o.push(q(e)), n.forEach(function(e) {
                    return o.push(q(e));
                }), o.join(", ");
            }
            return e = e.split(", ").map(function(e) {
                return "." !== e[0] ? "." + e : e;
            }).join(", ").trim(), e + ", " + e + " *";
        }
        function K() {
            var e = document.createElement("fakeelement"), t = {
                animation: "animationend",
                MozAnimation: "animationend",
                WebkitAnimation: "webkitAnimationEnd"
            };
            for (var n in t) if (void 0 !== e.style[n]) return t[n];
        }
        function Y() {
            var e = document.createElement("fakeelement"), t = {
                transition: "transitionend",
                MozTransition: "transitionend",
                WebkitTransition: "webkitTransitionEnd"
            };
            for (var n in t) if (t.hasOwnProperty(n) && void 0 !== e.style[n]) return t[n];
        }
        function Q(e) {
            if ("undefined" != typeof window.GR_INLINE_STYLES) {
                var t = e.createElement("style");
                t.innerHTML = window.GR_INLINE_STYLES;
                try {
                    e.querySelector("head").appendChild(t);
                } catch (n) {
                    console.log("can't append style", n);
                }
            }
        }
        function J(e, t) {
            e.setAttribute("data-gramm_id", t), e.setAttribute("data-gramm", "true");
        }
        function X(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n = document.createEvent("CustomEvent");
            n.initCustomEvent(e + "-gr", !0, !0, t), document.dispatchEvent(n);
        }
        function $(e, t) {
            var n = e.getSelection();
            n.removeAllRanges(), n.addRange(t);
        }
        function Z(e, t) {
            var n = e.createRange();
            n.setStart(t.anchorNode, t.anchorOffset), n.setEnd(t.focusNode, t.focusOffset), 
            $(e, n);
        }
        function ee(e, t) {
            return null === e ? null : e.matches(t) ? e : e.querySelector(t) || ee(e.parentElement, t);
        }
        var te = e("babel-runtime/helpers/defineProperty"), ne = r(te), re = e("babel-runtime/core-js/object/assign"), oe = r(re), ie = e("babel-runtime/core-js/object/keys"), ae = r(ie);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var se = e("react-dom"), ce = e("lodash"), le = e("./util"), ue = e("stdlib");
        n.createEl = o, n.renderReactWithParent = i, n.inEl = a, n.hasClass = s, n.removeClass = c, 
        n.addClass = l, n.toggleClass = u, n.getParentBySel = d, n.parentIsContentEditable = f, 
        n.isContentEditable = p, n.matchesSelector = m, n.isFocused = h;
        var de = le.guid();
        n.listen = g, n.unlisten = b, n.on = v, n.off = _, n.once = y, n.emit = w, n.isVisible = k, 
        n.cs = C;
        var fe = {
            "column-count": 1,
            columns: 1,
            "font-weight": 1,
            "line-height": 1,
            opacity: 1,
            "z-index": 1,
            zoom: 1
        };
        n.maybeAddPx = x, n.camelize = E, n.camelizeAttrs = S, n.dasherize = T, n.css = N, 
        n.setCustomCss = P, n.getParentByTag = A, n.getParentByData = j, n.resolveEl = I, 
        n.getParent = L, n.parentHasClass = M, n.getParentByDepth = R, n.isParent = O, n.insertAfter = D, 
        n.insertBefore = F, n.elementInDocument = B, n.runKeyEvent = U, n.docHidden = W, 
        n.visibilityEvent = V, n.transformProp = G, n.compStyle = z, n.classSelector = H, 
        n.selectorAll = q, n.whichAnimationEndEvent = K, n.transitionEndEventName = Y, n.addIframeCss = Q, 
        n.setGRAttributes = J, n.emitDomEvent = X, n.addRange = $, n.setDomRange = Z, n.closestEl = ee;
    }, {
        "./util": 322,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/defineProperty": 48,
        lodash: "lodash",
        "react-dom": "react-dom",
        stdlib: 327
    } ],
    229: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            function n() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "on", t = y.visibilityEvent(we);
                "on" === e ? (v.on("beforeunload", te), f.on("editor-set-state", D), f.on("dialog-closed", F), 
                f.on("focus-editor", B), f.on("after-refresh-dialog", V), be.on("track", k.track), 
                be.on("fix", se), be.on("serviceState", O), be.on("addedSynonym", L), be.on("afterReplace", s), 
                be.dom.on("badCursorPositionRetryFail", m.logger.cursorJump), be.dom.on("badCursorPosition", m.logger.badCursorPosition), 
                be.on("iframe-mousemove", M), i(!0), t && y.listen(we, t, Y), y.listen(we, "grammarly:reset", R), 
                _e && y.listen(we.documentElement, "mousemove", C), re.card && (re.card.on("show", P), 
                re.card.on("hide", A), re.card.on("toeditor", j), re.card.on("addtodict", I))) : (v.off("beforeunload", te), 
                f.off("editor-set-state", D), f.off("dialog-closed", F), f.off("focus-editor", B), 
                f.off("after-refresh-dialog", V), be.off("track", k.track), be.off("fix", se), be.off("serviceState", O), 
                be.off("addedSynonym", L), be.off("afterReplace", s), be.dom.off("badCursorPositionRetryFail", m.logger.cursorJump), 
                be.dom.off("badCursorPosition", m.logger.badCursorPosition), be.off("iframe-mousemove", M), 
                i(!0), t && y.unlisten(we, t, Y), y.unlisten(we, "grammarly:reset", R), _e && y.unlisten(we.documentElement, "mousemove", C), 
                re.card && (re.card.off("show", P), re.card.off("hide", A), re.card.off("toeditor", j), 
                re.card.off("addtodict", I)));
            }
            function r() {
                d.timers.start(ne + "run"), n("on"), ke(), me = b.rewriteInnerHTML(ve), be.getText() && be.emit("sending", void 0), 
                ee(ae.enabledDefs), xe && G();
            }
            function o(e) {
                var t = e.user, n = e.page, r = de;
                de = n.dialectStrong || n.dialectWeak, i(), fe = t.anonymous, ee(n.enabledDefs), 
                r !== de && be.hardReset();
            }
            function i(e) {
                de || pe ? pe && (de || e) && be.off("finished", x) : (pe = !0, be.on("finished", x));
            }
            function s(e) {
                Array.isArray(ae.afterReplaceEvents) && ae.afterReplaceEvents.forEach(function(e) {
                    return y.emit.call(ve, e);
                });
                try {
                    var t = document.createEvent("HTMLEvents");
                    t.initEvent("input", !1, !0), be.el.dispatchEvent(t);
                } catch (t) {}
                return e && e.remove();
            }
            function C(e) {
                be.emit("iframe-mousemove", e);
            }
            function x(e) {
                var t = e.dialect;
                t && "undefined" !== t && (ce(t), de = t, i());
            }
            function E(e, t, n) {
                var r = document.createElement("div"), o = document.createElement("div"), i = '<span style="color: #E4E6F2; margin: 0 6px;"> | </span>', a = "color: #1255CC; text-decoration: none;", s = t + "?docId=" + encodeURIComponent(n), c = function(e, t, n) {
                    var r = t + "&canBeBetter=" + encodeURIComponent(n ? "false" : "true");
                    return '<a style="' + a + '" href="' + r + '">' + e + "</a>";
                };
                return o.style.display = "inline-block", o.style.background = "#F3F5F8", o.style.padding = "12px 17px", 
                o.style.borderRadius = "5px", o.style.border = "1px solid #E2E5EB", o.innerHTML = '<span style="margin-right: 15px;">' + e + "</span> " + c("Yes", s, !0) + " " + i + " " + c("Can be better", s, !1), 
                r.appendChild(document.createElement("div").appendChild(document.createElement("br"))), 
                r.appendChild(o), r.appendChild(document.createElement("div").appendChild(document.createElement("br"))), 
                r;
            }
            function S(e, t, n) {
                var r = document.createElement("div"), o = document.createElement("div"), i = "https://s3.amazonaws.com/features-team-extension/email-feedback/email-feedback-signature.png", a = "\n      letter-spacing: 0.5px;\n      color: #1FB8A1;\n      text-decoration: none;\n      font-weight: bold;\n      display: inline-block;\n      font-size: 13px;\n      width: 49.6%;\n      text-align: center;\n      padding: 13px 0 15px;", s = "\n      width: 25px;\n      height: 19px;\n      margin-right: 10px;\n      vertical-align: middle;", c = "\n      width: 335px;\n      letter-spacing: 0.2px;\n      text-align: center;\n      background: #F9FAFF;\n      border-bottom: 1px solid #E4E6F2;\n      border-radius:3px 3px 0 0;\n      font-family: HelveticaNeue-Bold;\n      font-size: 13px;\n      color: #222;\n      line-height: 16px;\n      padding: 14px 0 14px 0;\n      display: inline-block;", l = t + "?docId=" + encodeURIComponent(n), u = function(e, t, n) {
                    var r = t + "&canBeBetter=" + encodeURIComponent(n ? "false" : "true"), o = n ? "border-right: 1px solid #E4E6F2;" + a : "" + a;
                    return '<a style="' + o + '" href="' + r + '">' + e + "</a>";
                };
                return o.style.display = "inline-block", o.style.borderRadius = "3px 3px 0 0", o.style.border = "1px solid #E2E5EB", 
                o.innerHTML = '<span style="' + c + '">\n      <img style="' + s + '" src="' + i + '" alt="smp"/>' + e + "</span><br/>\n      " + u("Yes", l, !0) + u("Can be better", l, !1), 
                r.appendChild(document.createElement("div").appendChild(document.createElement("br"))), 
                r.appendChild(o), r.appendChild(document.createElement("div").appendChild(document.createElement("br"))), 
                r;
            }
            function T(e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "https://grammarly.com/email-feedback", n = "Was my message clear?", r = e ? E(n, t, ne) : S(n, t, ne), o = be.el.querySelector(".gmail_extra") || be.el.querySelector(".gmail_quote");
                null === o ? be.el.appendChild(r) : be.el.insertBefore(r, o);
                var i = new KeyboardEvent("keydown", {
                    bubbles: !0,
                    cancelable: !0,
                    key: " ",
                    shiftKey: !0
                });
                be.el.dispatchEvent(i), be.emailFeedbackEnabled = !1, U();
                var a = y.closestEl(be.el, 'input[name="subjectbox"]') || y.closestEl(be.el, 'input[placeholder="Subject"]'), s = null !== a ? a.value : "";
                le(s, ne), m.call("gnar.track", "askForFeedback-button-click", {
                    textSize: be.getText().length
                });
            }
            function N(e) {
                e && be.setState(e), be.api.ws.reconnect();
            }
            function P(e) {
                var t = be.matches.byId(e);
                t && (be.emit("context", void 0), t.editorId = be.id, t.select(), re.card && re.card.setData(t));
            }
            function A() {
                W();
            }
            function j(e) {
                e === be.id && (be.showDialog({
                    caller: "card"
                }), d.timers.start("open_editor"));
            }
            function I(e) {
                e.match && e.match.editorId !== be.id || (fe ? (e.hide(), be.showDialog({
                    caller: "card"
                })) : e.match && e.match.addToDict());
            }
            function L(e) {
                e.editorId = be.id, re.card && re.card.showSynonyms(e);
            }
            function M() {
                re.card && re.card.setOuterIframe(ye);
            }
            function R() {
                console.log("reseting capi session..."), N();
            }
            function O(e) {
                if ("capi" === e.type) return e.available ? void (xe && H()) : G();
            }
            function D(e) {
                e.editorId === be.id && (be.setState(e), Ee && (Ee = !1, te()));
            }
            function F(e) {
                e === be.id && (W(), be.isHtmlGhost || U());
            }
            function B(e) {
                e === be.id && U();
            }
            function U() {
                be.srcEl && be.srcEl.focus();
            }
            function W() {
                be.selectedMatch && (re.card && re.card.removeLoading(be.selectedMatch.getEl()), 
                be.selectedMatch.deselect());
            }
            function V(e) {
                e.editorId === be.id && N(e);
            }
            function G() {
                xe = !0, be.clearData(), be.api.close(), be.render();
            }
            function z() {
                return xe;
            }
            function H() {
                xe = !1, N();
            }
            function q() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t = e.caller, n = {
                    data: be.getState(),
                    caller: t
                };
                re.dialog && re.dialog.preActivate(), be.emit("show-dialog", void 0), y.emitDomEvent("show-dialog"), 
                f.emitFocusedTab("show-dialog", n);
            }
            function K() {
                var e = ve.ownerDocument.createRange();
                e.selectNodeContents(ve);
                var t = e.cloneContents(), n = document.createElement("div");
                n.appendChild(t);
                for (var r = n.querySelectorAll("img"), o = r.length, i = 0; i < o; i++) r[i].src = r[i].src;
                return n.innerHTML;
            }
            function Y() {
                return y.docHidden(we) ? X() : void $();
            }
            function Q(e) {
                return xe ? [] : e.filter(function(e) {
                    return e.free && !e.hidden;
                });
            }
            function J(e) {
                return !!y.matchesSelector(e, ".b-card.Synonyms .btn-close") || !y.matchesSelector(e, ".b-card.Synonyms, .b-card.Synonyms *");
            }
            function X() {}
            function $() {}
            function Z() {
                var e = be.getMatches();
                return {
                    critical: e.filter(function(e) {
                        return e.free && e.inDom;
                    }).length,
                    plus: e.filter(function(e) {
                        return !e.free;
                    }).length
                };
            }
            function ee(e) {
                be.enabledSynonyms !== e && (be.enabledSynonyms = e, e ? be.synonyms.fieldEnable() : be.synonyms.disable());
            }
            function te(e) {
                if (!Ce || e) {
                    Ce = !0;
                    var t = be.dom.getCleanHtml && be.dom.getCleanHtml();
                    if (t && (be.el.innerHTML = t), n("off"), be.api.ws.emit("cleanup-socket-on-editor-remove"), 
                    be.exit(), console.log("exit"), ve.removeAttribute && _.restrictedAttrs.forEach(ve.removeAttribute.bind(ve)), 
                    _e && _.restrictedAttrs.forEach(be.srcEl.removeAttribute.bind(be.srcEl)), me && me.parentNode && me.parentNode.removeChild(me), 
                    ve.setAttribute("spellcheck", "true"), h.isHtmlGhostSite()) {
                        var r = ve.parentElement && ve.parentElement.parentElement;
                        r && r.removeAttribute("spellcheck");
                    }
                    be.emit("exit", void 0);
                }
            }
            var ne = (e.el || e.srcEl).getAttribute("gramm_id") || p.guid(), re = e.app, oe = e.user, ie = e.actions, ae = e.page, se = ie.incFixed, ce = ie.changeWeakDialect, le = ie.saveFeedbackData, ue = e.editorType.htmlghost, de = ae.dialectStrong || ae.dialectWeak, fe = oe.anonymous, pe = void 0, me = void 0;
            (0, c["default"])(e, {
                capiUrl: _.URLS.capi,
                createWs: t,
                docid: ne,
                textareaWrapSelector: '[gramm_id="' + ne + '"]',
                animatorContainer: e.el.ownerDocument.documentElement,
                getAnimatorElPos: g.getAbsRect,
                dialect: de,
                exposeRawMatch: !0,
                canRemoveSynonym: J,
                filter: Q,
                getContainerId: function() {
                    return f.promiseBackground("get-containerIdOrUndefined").then(function(e) {
                        return e ? e : a["default"].reject(void 0);
                    });
                }
            });
            var he = p.getBrowser(), ge = "other" === he ? "extension" : "extension_" + he;
            (0, c["default"])(u.capi, {
                CLIENT_NAME: ge,
                clientVersion: _.getVersion(),
                extDomain: ae.domain
            }), ue && (e.dom = w.HtmlGhostDom), l.MatchPositions = function() {
                return {
                    generateMatchPositions: p._f
                };
            }, e.matchPrefix = _.nextVerClass;
            var be = l.GrammarlyEditor(e), ve = be.el, _e = e.posSourceEl && "IFRAME" === e.posSourceEl.tagName, ye = e.srcEl || ve, we = ve.ownerDocument, ke = be.run, Ce = !1, xe = !e.connection.online, Ee = !1;
            (0, c["default"])(be, {
                id: ne,
                srcEl: ye,
                camouflage: p._f,
                isHtmlGhost: ue,
                run: r,
                errorData: Z,
                showDialog: q,
                isOffline: z,
                offline: G,
                online: H,
                updateState: o,
                outerIframe: e.outerIframe,
                cleanupText: p._f,
                activate: p._f,
                toggleBtn: p._f,
                remove: te,
                reset: N,
                insertGmailFeedback: T,
                emailFeedbackEnabled: ae.emailFeedbackEnabled
            });
            var Se = be.getMatchClass;
            return be.getMatchClass = function(e, t) {
                var n = Se(e, t);
                return n += " gr_inline_cards", n += e.renderedOnce || p.isSafari() ? " gr_disable_anim_appear" : " gr_run_anim", 
                e.renderedOnce = !0, n;
            }, be.dom.changeSelection = p._f, be.matches.fromReplaced = be.matches.fromReplace = be.matches.byId, 
            be.current = be.getFiltered, be.started = !1, be.el.setAttribute("data-gramm_editor", "true"), 
            be.getHtml && (be.getHtml = K), be;
        }
        var i = e("babel-runtime/core-js/promise"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("lib/grammarly-editor"), u = e("lib/grammarly-editor/capi"), d = e("../timers"), f = e("../message"), p = e("../util"), m = e("../tracking"), h = (e("../benchmark"), 
        e("lib/ghost/html-ghost-locator")), g = e("../position"), b = e("../client-script/inner-html"), v = e("../window-events"), _ = e("../config"), y = e("../dom"), w = e("../ghost/html-ghost"), k = e("./track");
        n.createEditor = o;
    }, {
        "../benchmark": 201,
        "../client-script/inner-html": 219,
        "../config": 224,
        "../dom": 228,
        "../ghost/html-ghost": 263,
        "../message": 287,
        "../position": 298,
        "../timers": 310,
        "../tracking": 316,
        "../util": 322,
        "../window-events": 323,
        "./track": 231,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/promise": 43,
        "lib/ghost/html-ghost-locator": 262,
        "lib/grammarly-editor": 267,
        "lib/grammarly-editor/capi": 264
    } ],
    230: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t, n = e.app, r = e.type, o = e.doc, i = e.field, c = e.connection, u = e.page, d = e.user, p = e.actions, m = e.createSocket;
            return n.elements = n.elements || f.initElements({
                app: n,
                doc: o,
                user: d,
                actions: p,
                page: u
            }), "iframe" === r ? s(n, i, c, u, d, p, m) : a(n, i, (t = {}, (0, l["default"])(t, r, !0), 
            (0, l["default"])(t, "value", r), t), c, u, d, p, m);
        }
        function i(e, t) {
            if (d.setGRAttributes(e, t), e.setAttribute("spellcheck", "false"), p.isHtmlGhostSite()) {
                var n = e.parentElement && e.parentElement.parentElement;
                n && n.setAttribute("spellcheck", "false");
            }
        }
        function a(e, t, n, r, o, a, s, c) {
            function l(t, l) {
                return i(t, l), m.createEditor({
                    id: l,
                    el: t,
                    app: e,
                    connection: r,
                    page: o,
                    user: a,
                    actions: s,
                    editorType: n
                }, c);
            }
            var d = u.guid();
            return "contenteditable" === n.value ? l(t, d) : h.createGhostArea(l, t, d);
        }
        function s(e, t, n, r, o, a, s) {
            var c = u.guid(), l = t.contentDocument, f = l.body;
            return i(t, c), t.setAttribute("gramm-ifr", "true"), d.addIframeCss(l), i(f, c), 
            t.style.height = t.style.height || getComputedStyle(t).height, m.createEditor({
                el: f,
                app: e,
                connection: n,
                page: r,
                user: o,
                actions: a,
                srcEl: t,
                posSourceEl: t,
                editorType: {
                    contenteditable: !0,
                    value: "contenteditable"
                }
            }, s);
        }
        var c = e("babel-runtime/helpers/defineProperty"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("../util"), d = e("../dom"), f = e("../elements"), p = e("lib/ghost/html-ghost-locator"), m = e("./editor"), h = e("../ghost/ghostarea");
        n.createGrammarlyEditor = o;
    }, {
        "../dom": 228,
        "../elements": 237,
        "../ghost/ghostarea": 261,
        "../util": 322,
        "./editor": 229,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/ghost/html-ghost-locator": 262
    } ],
    231: [ function(e, t, n) {
        "use strict";
        function r() {}
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.track = r;
    }, {} ],
    232: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            if (e) {
                if (!e.length) return e;
                if (1 === e.length || !t) return e[0];
                var n = t.pageX || t.clientX, r = t.pageY || t.clientY, o = void 0;
                return e.forEach(function(e) {
                    var t = e.top, i = e.left, a = e.width, s = e.height;
                    r >= t && r <= t + s && n >= i && n <= i + a && (o = e);
                }), o || e[0];
            }
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i), s = e("babel-runtime/core-js/symbol"), c = r(s), l = e("babel-runtime/core-js/object/get-prototype-of"), u = r(l), d = e("babel-runtime/helpers/classCallCheck"), f = r(d), p = e("babel-runtime/helpers/createClass"), m = r(p), h = e("babel-runtime/helpers/possibleConstructorReturn"), g = r(h), b = e("babel-runtime/helpers/inherits"), v = r(b);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var _ = e("react"), y = e("react-dom"), w = e("emitter"), k = e("../timers"), C = e("../util"), x = e("../window-events"), E = e("../tracking"), S = e("../position"), T = e("../dom"), N = e("./hint"), P = e("./tooltip"), A = e("../inline-cards"), j = {
            container: "_c4f153-container",
            flip: "_c4f153-flip",
            flipSyn: "_c4f153-flipSyn",
            card: "_c4f153-card",
            bigTitle: "_c4f153-bigTitle",
            unknownWordTitle: "_c4f153-unknownWordTitle",
            btnDictLabelWithIcon: "_c4f153-btnDictLabelWithIcon",
            explanation: "_c4f153-explanation",
            replacement: "_c4f153-replacement",
            maxWidthReached: "_c4f153-maxWidthReached",
            item: "_c4f153-item",
            logoIcon: "_c4f153-logoIcon",
            ignoreIcon: "_c4f153-ignoreIcon",
            undoIcon: "_c4f153-undoIcon",
            dictionaryIcon: "_c4f153-dictionaryIcon",
            wikiIcon: "_c4f153-wikiIcon",
            footer: "_c4f153-footer",
            footerButton: "_c4f153-footerButton",
            btnIgnore: "_c4f153-btnIgnore",
            icon: "_c4f153-icon",
            btnLogo: "_c4f153-btnLogo",
            btnPersonalize: "_c4f153-btnPersonalize",
            personalizeMessage: "_c4f153-personalizeMessage",
            attn: "_c4f153-attn",
            cardAddedToDict: "_c4f153-cardAddedToDict",
            addedToDictTitle: "_c4f153-addedToDictTitle",
            dictionaryDescription: "_c4f153-dictionaryDescription",
            undo: "_c4f153-undo",
            dictLink: "_c4f153-dictLink",
            dictionaryAddedIcon: "_c4f153-dictionaryAddedIcon",
            synTitle: "_c4f153-synTitle",
            synList: "_c4f153-synList",
            synListSingle: "_c4f153-synListSingle",
            synListTitle: "_c4f153-synListTitle",
            synListNumber: "_c4f153-synListNumber",
            synSubitems: "_c4f153-synSubitems",
            synItem: "_c4f153-synItem",
            dict: "_c4f153-dict",
            dictContent: "_c4f153-dictContent",
            dictItemCounter: "_c4f153-dictItemCounter",
            dictItem: "_c4f153-dictItem",
            qualifier: "_c4f153-qualifier",
            dictFooterItem: "_c4f153-dictFooterItem",
            wikiLink: "_c4f153-wikiLink",
            wiki: "_c4f153-wiki",
            gr__tooltip_empty: "gr__tooltip_empty",
            gr__tooltip: "gr__tooltip",
            "gr-notfound-tooltip": "gr-notfound-tooltip",
            "gr__tooltip-content": "gr__tooltip-content",
            "gr__tooltip-logo": "gr__tooltip-logo",
            gr__flipped: "gr__flipped"
        }, I = {}, L = function(e) {
            function t() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n = e.doc, r = void 0 === n ? document : n, o = e.domCls, i = void 0 === o ? "" : o, a = e.isAnonymous, s = void 0 !== a && a;
                (0, f["default"])(this, t);
                var l = (0, g["default"])(this, (t.__proto__ || (0, u["default"])(t)).call(this));
                l.isAnonymous = !1, l.show = function(e, t) {
                    return l.emit("show", e.id), l.updatePos(e, t), k.timers.start(I.id), E.logger.cardShowAction(), 
                    l;
                }, l.hide = function() {
                    if (I.hint.visible) {
                        I.container.el.style.display = "none", l.setState({
                            animate: !1,
                            visible: !1,
                            match: {}
                        });
                        var e = I.notfound && I.notfound.isEnabled();
                        if (I.notfound.disable(), I.notfound.hide(), l.emit("hide", l.match || void 0), 
                        I.hint.currentEl && l.removeLoading(I.hint.currentEl), k.timers.stop(I.id), l.match) {
                            var t = l.match.syn;
                            t ? E.logger.synonymCardHideAction(e) : E.logger.cardHideAction();
                        }
                        return e && E.logger.synonymCardHideAction(e), l.match = null, I.container.el.style.display = "", 
                        l;
                    }
                }, l.animHide = function() {
                    return l.setState({
                        animate: !0
                    }), T.once.call(I.el, T.whichAnimationEndEvent(), l.hide), l;
                }, l.openEditor = function() {
                    I.hint.currentEl && l.removeLoading(I.hint.currentEl), l.emit("toeditor", l.match ? l.match.editorId : void 0), 
                    l.hide();
                }, l.animateReplacement = function(e, t, n) {
                    l.emit("animateReplacement", {
                        matchId: e,
                        replacement: t,
                        visibleReplacement: n
                    });
                }, l.addToDict = function() {
                    l.setState({
                        addedToDict: !0
                    }), l.emit("addtodict", {
                        match: l.match,
                        hide: l.hide,
                        animHide: l.animHide
                    });
                }, l.inTarget = function(e) {
                    var t = e.target, n = e.clientX, r = e.clientY, o = e.detail, i = I.hint.currentEl, a = (T.parentHasClass(t, I.cls) || T.hasClass(t, I.cls)) && (!i || !T.hasClass(i, "g-selection-anim")), s = l.elementsFromPoint(n, r).some(function(e) {
                        return T.hasClass(e, I.cls);
                    });
                    return !(!s || !I.hint.visible || 1 !== o) || (a ? i && i !== t ? (I.hint.fastHide(), 
                    void l.removeLoading(i)) : (l.addLoading(t), !0) : void (!I.hint.visible && i && l.removeLoading(i)));
                }, l.addLoading = function(e) {
                    return !T.hasClass(e, I.pCls) && T.addClass(e, I.pCls);
                }, l.removeLoading = function(e) {
                    T.hasClass(e, I.pCls) && T.removeClass(e, I.pCls), T.hasClass(e, "g-selection-anim") && e.parentNode && e.parentNode.removeChild(e);
                }, l.showSynonyms = function(e) {
                    return e.animEl && 0 !== e.animEl.getClientRects().length ? (I.hint.currentEl && l.hide(), 
                    I.hint.currentEl = e.animEl, e.synonyms && 0 === e.synonyms.meanings.length ? (I.notfound.enable(), 
                    I.notfound.show({
                        posEl: e.animEl,
                        text: "No synonyms found",
                        outerIframe: I.iframe
                    }), E.logger.synonymCardShowAction(!0)) : (l.setData(e), l.updatePos(e.animEl), 
                    l.setState({
                        visible: !0
                    }), E.logger.synonymCardShowAction(!1)), I.hint.setVisible(!0), k.timers.start(I.id), 
                    l) : l;
                }, l.setOuterIframe = function(e) {
                    var t = e.contentDocument;
                    !e || t && e === I.iframe || (I.iframe = e, I.hint.setDocs(I.doc, t));
                }, l.isAnonymous = s;
                var d = (0, c["default"])("GrammarCard"), p = "gr_", m = l.render(d, r), h = y.findDOMNode(m.component), b = new N.HintImpl({
                    doc: r,
                    hint: h,
                    hideDelay: 500,
                    inTarget: l.inTarget,
                    cls: I.cls,
                    delay: 400,
                    onshow: l.show,
                    onhide: l.hide
                }).bind();
                return I = {
                    id: d,
                    notfound: P.createTooltip({
                        cls: T.cs("gr-notfound-tooltip", j.gr__tooltip_empty),
                        enabled: !1,
                        doc: r
                    }),
                    windowEvents: {
                        keydown: l.hide,
                        scroll: l.hide,
                        resize: l.hide
                    },
                    doc: r,
                    domCls: i,
                    cls: p,
                    pCls: "gr-progress",
                    container: m,
                    el: h,
                    hint: b
                }, l.hint = b, x.on(I.windowEvents, null, !0), l;
            }
            return (0, v["default"])(t, e), (0, m["default"])(t, [ {
                key: "updateState",
                value: function() {
                    var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                    this.isAnonymous = e;
                }
            }, {
                key: "elementsFromPoint",
                value: function(e, t) {
                    return e && t ? I.doc.elementsFromPoint ? I.doc.elementsFromPoint(e, t) : [ I.doc.elementFromPoint(e, t) ] : [];
                }
            }, {
                key: "setState",
                value: function(e) {
                    I.container.component.setState(e);
                }
            }, {
                key: "setData",
                value: function(e) {
                    return e ? (this.setState({
                        match: e,
                        visible: !0,
                        addedToDict: !1
                    }), this.match = e, this) : this;
                }
            }, {
                key: "updatePos",
                value: function(e, t) {
                    if (null == e.parentNode) {
                        if (!e.id) return void this.hide();
                        var n = I.doc.querySelector(".gr_" + e.id);
                        if (!n) return void this.hide();
                        I.hint.currentEl = e = n;
                    }
                    var r = S.getAllAbsRects(e, I.iframe), i = (0, a["default"])(S.posToRect(I.el, o(r, t)), {
                        width: I.el.clientWidth,
                        height: I.el.clientHeight
                    });
                    i.rect.flip && (i.rect.top = i.rect.top + I.el.clientHeight), E.call("gnar.track", "cardOpened", {
                        direction: i.rect.flip ? "top" : "bottom",
                        pixelsToBottom: Math.round(i.height + i.delta.bottom),
                        cardHeight: i.height,
                        ratio: 1 + Math.round(10 * i.delta.bottom / i.height) / 10
                    }), this.setState({
                        pos: i
                    });
                }
            }, {
                key: "render",
                value: function(e, t) {
                    var n = this, r = {
                        isAnonymous: function() {
                            return n.isAnonymous;
                        },
                        hide: this.hide,
                        openEditor: this.openEditor,
                        animateReplacement: this.animateReplacement,
                        addToDict: this.addToDict
                    };
                    return T.renderReactWithParent(_.createElement(A.PositionedCard, r), t.documentElement, e, "grammarly-card");
                }
            }, {
                key: "remove",
                value: function() {
                    I.hint.unbind(), x.off(I.windowEvents, null, !0), I.container.remove();
                }
            } ]), t;
        }(C.createClass(w));
        n.Card = L;
    }, {
        "../dom": 228,
        "../inline-cards": 276,
        "../position": 298,
        "../timers": 310,
        "../tracking": 316,
        "../util": 322,
        "../window-events": 323,
        "./hint": 235,
        "./tooltip": 256,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/core-js/symbol": 44,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        emitter: "emitter",
        react: "react",
        "react-dom": "react-dom"
    } ],
    233: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            function t(e, t) {
                var n = W.anonymous === !1 && e.anonymous === !1 && W.premium !== e.premium, r = te !== t.dialectStrong;
                W = e, te = t.dialectStrong, Z && Z.updateUser(e), n && U.refresh(), r && U.send({
                    action: "hard-reset"
                });
            }
            function n(e) {
                var t = "off" === e;
                S.toggleClass(B.body, t, "gr-disable-scroll"), S.toggleClass(B.documentElement, t, "gr-disable-scroll");
            }
            function r() {
                $ && !W.anonymous && f();
            }
            function o(e) {
                return new y.OnboardingDialog({
                    doc: B,
                    user: e,
                    saveAnonymousProps: q
                });
            }
            function i(e, t) {
                return new _.SigninDialog({
                    doc: B,
                    user: e,
                    placement: t
                });
            }
            function a(e) {
                n("off"), ee = o(W), ee.one("hide", function() {
                    n("on"), k.emitFocusedTab("focus-editor", e);
                });
            }
            function s(e, t) {
                n("off"), Z = i(t, e), Z.one("hide", function() {
                    n("on"), k.emitFocusedTab("focus-editor", $.editorId), x.logger.signinClose(C.timers.stop(K));
                }), x.logger.signinOpen(), x.fire("login-attempt", e);
            }
            function c() {
                X = !0, Q = B.querySelector(A), Q || (Q = b.findDOMNode(S.renderReactWithParent(g.createElement(L, null), B.documentElement, w.guid()).component)), 
                J = Q.querySelector(j("back"));
            }
            function l() {
                var e = {
                    "mail.google.com": "Gmail",
                    "facebook.com": "Facebook",
                    "twitter.com": "Twitter"
                }, t = E.getDomain();
                return "Back to " + (t && e[t] || document.title);
            }
            function u(e) {
                e.stopPropagation(), O();
            }
            function d() {
                k.emitFocusedTab("dialog-closed", $.editorId);
            }
            function f() {
                if (Y) {
                    U.el.style.background = "";
                    var e = re;
                    return re = function(t) {
                        re = e, U.refresh(), k.emitFocusedTab("after-refresh-dialog", t);
                    }, void O();
                }
                U.refresh();
            }
            function p(e) {
                k.emitBackground(T.MessageTypes.iframeMode, {
                    iframeMode: e,
                    id: $.socketId
                });
            }
            function m() {
                W.anonymous || U.activate();
            }
            function v(e) {
                var t = e.data, n = e.caller, r = e.isOnboarding, o = e.editorId;
                return C.timers.start(K), $ = t, r ? a(o) : W.anonymous ? s(n, W) : (U.activate(), 
                void N(t));
            }
            function N(e) {
                X || c(), Q.style.opacity = "0", S.addClass(Q, "gr-_show");
                var t = h.extend({
                    favicon: E.getFavicon(),
                    page: l()
                }, e);
                U.send(t), p(!0), setTimeout(function() {
                    return Q.style.opacity = "1";
                }, 100), n("off"), S.listen(B.body, "keydown", F, !1), S.listen(J, "click", u, !1), 
                S.listen(Q, "click", u, !1), Y = !0;
            }
            function I(e) {
                var t = e.action;
                "edit" === t && re(e), "close" === t && O(), "initialized" === t && (R(e), setTimeout(function() {
                    return U.el.style.background = "transparent";
                }, 300)), "socket" === t && k.emitBackground(T.MessageTypes.client, e), "setSettings" === t && z(e.data), 
                "tracking" === t && e.method && x.call(e.method, e.param, e.props), "popup-editor-fix" === t && H(), 
                "open-url" === t && (x.fire("hook-clicked", e.placement), k.emitBackground("open-url", e.url));
            }
            function M(e, t) {
                $ && e.socketId === $.socketId && (t("ok"), e.action = "socket", U.send(e));
            }
            function R(e) {
                var t = "Premium" === e.userType ? "freemium-plus" : "freemium";
                B.documentElement.setAttribute("data-type", t);
            }
            function O() {
                Y && (Y = !1, n("on"), Q.style.opacity = "0", S.removeClass(Q, "gr-_show"), S.removeClass(Q, P), 
                S.unlisten(B.body, "keydown", F, !1), S.unlisten(J, "click", u, !1), S.unlisten(Q, "click", u, !1), 
                U.send({
                    action: "hide"
                }), p(!1), d());
            }
            function D() {
                window === window.top && (k.off("show-dialog", v), k.off("hide-dialog", O), k.off("reset", r), 
                k.off(T.MessageTypes.serverIframe, M)), U.deactivate(), U.off("message", I);
                var e = Q && Q.parentNode;
                e && e.parentNode && e.parentNode.removeChild(e);
            }
            function F(e) {
                if (w.keyCode(e) === w.ESC_KEY && Y) return e.stopPropagation(), e.preventDefault(), 
                O();
            }
            var B = e.doc, U = e.iframe, W = e.user, V = e.page, G = e.actions, z = G.updateSettings, H = G.incFixed, q = G.saveAnonymousProps, K = "Dialog", Y = !1, Q = void 0, J = void 0, X = void 0, $ = void 0, Z = void 0, ee = void 0, te = V && V.dialectStrong, ne = {
                show: v,
                hide: O,
                updateState: t,
                preActivate: m,
                render: c,
                getSignin: i,
                remove: D,
                refresh: f
            };
            U && U.on("message", I), window === window.top && (k.on("show-dialog", v), k.on("hide-dialog", O), 
            k.on("reset", r), k.on(T.MessageTypes.serverIframe, M));
            var re = function(e) {
                k.emitFocusedTab("editor-set-state", e);
            };
            return ne;
        }
        var i = e("babel-runtime/core-js/object/get-prototype-of"), a = r(i), s = e("babel-runtime/helpers/classCallCheck"), c = r(s), l = e("babel-runtime/helpers/createClass"), u = r(l), d = e("babel-runtime/helpers/possibleConstructorReturn"), f = r(d), p = e("babel-runtime/helpers/inherits"), m = r(p);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var h = e("lodash"), g = e("react"), b = e("react-dom"), v = e("./iframe"), _ = e("./signin-dialog"), y = e("./onboarding-dialog"), w = e("../util"), k = e("../message"), C = e("../timers"), x = e("../tracking"), E = e("../location"), S = e("../dom"), T = e("universal/shared/socket"), N = "gr_-editor", P = "gr-iframe-first-load", A = "." + N, j = function(e) {
            return "." + N + "_" + e;
        }, I = function(e) {
            return N + "_" + e;
        }, L = function(e) {
            function t() {
                return (0, c["default"])(this, t), (0, f["default"])(this, (t.__proto__ || (0, a["default"])(t)).apply(this, arguments));
            }
            return (0, m["default"])(t, e), (0, u["default"])(t, [ {
                key: "render",
                value: function() {
                    var e = N + " " + P;
                    return g.createElement("div", {
                        className: e,
                        style: {
                            display: "none"
                        }
                    }, g.createElement("div", {
                        className: I("back")
                    }), g.createElement(v.IframeComponent, null));
                }
            } ]), t;
        }(g.Component);
        n.DialogComponent = L, n.Dialog = o;
    }, {
        "../dom": 228,
        "../location": 286,
        "../message": 287,
        "../timers": 310,
        "../tracking": 316,
        "../util": 322,
        "./iframe": 236,
        "./onboarding-dialog": 238,
        "./signin-dialog": 247,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        lodash: "lodash",
        react: "react",
        "react-dom": "react-dom",
        "universal/shared/socket": 344
    } ],
    234: [ function(e, t, n) {
        "use strict";
        function r(e) {
            function t(e) {
                i.hasClass(e.target, "fr-reload-tab") && (a.logger.tabReloadClick(), setTimeout(function() {
                    return window.location.reload(!0);
                }, 200));
            }
            var n = e.el, r = e.win, s = e.outerIframe, c = o.createTooltip({
                posEl: n,
                html: "<span class='fr-tooltip-title'>Cannot connect to Grammarly.</span> Please <span class='fr-reload-tab'>reload</span> the browser tab and check your internet connection. <span class='fr-dialog-br'></span>Don't lose your work! Copy any unsaved text before you reload the tab.",
                doc: n.ownerDocument,
                cls: "fr-btn-offline-tooltip",
                outerIframe: s,
                enabled: !1
            });
            i.listen(r, "click", t);
            var l = c.remove;
            return c.remove = function() {
                l(), i.unlisten(r, "click", t);
            }, c;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./tooltip"), i = e("../dom"), a = e("../tracking");
        n.createErrorTooltip = r;
    }, {
        "../dom": 228,
        "../tracking": 316,
        "./tooltip": 256
    } ],
    235: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/assign"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("../util"), d = e("../dom"), f = function() {
            function e(t) {
                var n = this;
                (0, s["default"])(this, e), this.hideDelay = 10, this.onshow = function(e, t) {}, 
                this.onhide = u._f, this.onmousemove = function(e, t) {}, this.onInnerMouseMove = function(e) {}, 
                this.inTarget = function(e) {
                    var t = e.target, r = d.parentHasClass(t, n.cls) || d.hasClass(t, n.cls);
                    if (r) return !n.currentEl || n.currentEl === t || void n.fastHide();
                }, this.bind = function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : n.doc;
                    return n.doc2 && n.doc2 !== t && n.bind(e, n.doc2), d.listen(t.body, "resize", n.fastHide, e), 
                    d.listen(t, {
                        gramMouse: n.mousemove,
                        mousemove: n.mousemove,
                        scroll: n.fastHide
                    }, u._f, e), d.listen(t, "click", n.click, e, !0), d.listen(n.hint, "mousemove", n.innerMouseMove, e), 
                    n;
                }, this.setDocs = function(e, t) {
                    n.unbind(), (0, i["default"])(n, {
                        doc: e,
                        doc2: t
                    }), n.bind();
                }, this.unbind = function(e) {
                    return n.bind(!0, e);
                }, this.fastHide = function() {
                    n.onhide(), n.cancelTimeout("show"), n.cancelTimeout("hide"), n.visible = !1, n.currentEl = null;
                }, this.innerMouseMove = function(e) {
                    n.onInnerMouseMove(e), e.preventDefault(), e.stopPropagation(), n.cancelTimeout("hide");
                }, this.click = function(e) {
                    return !n.elInHint(e.target) && !n.inTarget(e) && n.fastHide();
                }, this.elInHint = function(e) {
                    return e && (d.inEl(e, n.hint) || e === n.hint);
                }, this.mousemove = function(e) {
                    var t = e.target;
                    if ("IFRAME" !== t.tagName) {
                        if (e.detail && e.detail.el && (t = e.detail.el, e = {
                            target: t,
                            clientX: e.detail.e.clientX,
                            clientY: e.detail.e.clientY
                        }), u.isSafari() && "mousemove" === e.type) {
                            if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return n.mouseMoveCoordinates = e.x + "-" + e.y;
                            if (n.mouseMoveCoordinates === e.x + "-" + e.y) return;
                        }
                        if (n.elInHint(t)) return n.onmousemove(e, !0), n.cancelTimeout("show"), void n.cancelTimeout("hide");
                        if (!n.inTarget(e)) return n.onmousemove(e, !1), void (n.visible ? n.hide() : n.cancelTimeout("show"));
                        n.onmousemove(e, !0), n.visible || (n.show(e, t), n.cancelTimeout("hide"), n.currentEl = t);
                    }
                }, this.show = function(e, t) {
                    return n.showTimeout ? n : (n.cancelTimeout("hide"), n.showTimeout = setTimeout(function() {
                        n.cancelTimeout("show"), (n.elInHint(t) || n.inTarget(e)) && (n.visible = !0, n.onshow(t, {
                            pageX: e.pageX,
                            pageY: e.pageY,
                            clientX: e.clientX,
                            clientY: e.clientY
                        }));
                    }, n.delay), n);
                }, this.hide = function() {
                    return n.hideTimeout ? n : (n.hideTimeout = setTimeout(function() {
                        n.onhide(), n.visible = !1, n.currentEl = null;
                    }, n.hideDelay), n);
                }, (0, i["default"])(this, t);
            }
            return (0, l["default"])(e, [ {
                key: "cancelTimeout",
                value: function(e) {
                    "show" === e && this.showTimeout ? (clearTimeout(this.showTimeout), this.showTimeout = null) : "hide" === e && this.hideTimeout && (clearTimeout(this.hideTimeout), 
                    this.hideTimeout = null);
                }
            }, {
                key: "setVisible",
                value: function(e) {
                    this.visible = e, this.cancelTimeout("hide");
                }
            } ]), e;
        }();
        n.HintImpl = f;
    }, {
        "../dom": 228,
        "../util": 322,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    236: [ function(e, t, n) {
        "use strict";
        function r(e) {
            function t(e) {
                v = e;
            }
            function r() {
                function e() {
                    (_ || (_ = b.querySelector(n.selector), C.el = _, _)) && (u.listen(window.top, "message", m, !1), 
                    _.srcdoc || o(t), u.addClass(_, "gr-freemium-ifr"), y = !0, C.activated = y);
                }
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : s._f;
                y || e();
            }
            function o() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : s._f, t = window.GR_INLINE_POPUP || "";
                _.setAttribute("srcdoc", t), u.once.call(_, "load", function() {
                    try {
                        window.ACTIVATE_GR_POPUP && window.ACTIVATE_GR_POPUP(_.contentWindow, _.contentDocument, a), 
                        e();
                    } catch (t) {
                        console.error("Cannot activate popup", t), l.logger.popupLoadError(t && t.message, t && t.name);
                    }
                });
            }
            function d() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : s._f;
                _ ? g() : r(e);
            }
            function f(e, t) {
                return k || t ? void p(e) : w.push(e);
            }
            function p(e) {
                e.grammarly = !0;
                try {
                    _.contentWindow.postMessage(e, "*");
                } catch (t) {
                    console.error("iframe send error", t);
                }
            }
            function m(e) {
                var t = e.data;
                if (t && t.grammarly) {
                    var n = t.action;
                    if ("user" === n) return g();
                    if (k = !0, "initialized" === n && w) {
                        c.timers.stop("open_editor");
                        w.forEach(function(e) {
                            return C.send(e);
                        });
                    }
                    c.timers.stop("open_editor");
                    "accepted" === n && (w = []), C.emit("message", t);
                }
            }
            function h() {
                u.unlisten(window.top, "message", m, !1);
            }
            function g() {
                p({
                    action: "user",
                    user: v
                });
            }
            var b = e.doc, v = e.user, _ = void 0, y = void 0, w = [], k = !1, C = i({
                activate: r,
                refresh: d,
                send: f,
                selector: n.selector,
                baseCls: n.baseCls,
                updateState: t,
                deactivate: h
            });
            return C;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("react"), i = e("emitter"), a = e("dompurify"), s = e("../util"), c = e("../timers"), l = e("../tracking"), u = e("../dom");
        n.baseCls = "gr_-ifr", n.selector = "." + n.baseCls, n.IframeComponent = function() {
            return o.createElement("iframe", {
                className: n.baseCls + " gr-_dialog-content"
            });
        }, n.iFrame = r;
    }, {
        "../dom": 228,
        "../timers": 310,
        "../tracking": 316,
        "../util": 322,
        dompurify: "dompurify",
        emitter: "emitter",
        react: "react"
    } ],
    237: [ function(e, t, n) {
        "use strict";
        function r(e) {
            function t(e) {
                var t = e.user, n = e.page;
                r.iframe && r.iframe.updateState(t), r.dialog && r.dialog.updateState(t, n), r.card && r.card.updateState(t.anonymous);
            }
            function n() {
                r.iframe && r.iframe.deactivate(), r.dialog && r.dialog.remove(), r.card && r.card.remove(), 
                r.iframe = null, r.dialog = null, r.card = null;
            }
            var r = e.app, s = e.doc, c = void 0 === s ? document : s, l = e.user, u = e.page, d = e.actions, f = r.iframe = o.iFrame({
                doc: c,
                user: l
            });
            return r.dialog = i.Dialog({
                doc: c,
                iframe: f,
                user: l,
                actions: d,
                page: u
            }), r.dialog.render(), r.card = new a.Card({
                doc: c,
                isAnonymous: l.anonymous
            }), {
                clear: n,
                updateState: t
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./iframe"), i = e("./dialog"), a = e("./card");
        n.initElements = r;
    }, {
        "./card": 232,
        "./dialog": 233,
        "./iframe": 236
    } ],
    238: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("react-dom"), g = e("lib/util"), b = e("lib/dom"), v = e("./onboarding-dialog"), _ = e("emitter"), y = function(e) {
            function t(e) {
                var n = e.doc, r = e.container, o = e.user, a = e.saveAnonymousProps;
                (0, s["default"])(this, t);
                var c = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return c.updateUser = function(e) {
                    c.user = e, c.render();
                }, c.onKey = function(e) {
                    g.keyCode(e) === g.ESC_KEY && c.dialogComponent && c.dialogComponent.onClose();
                }, c.onClose = function() {
                    c.emit("hide"), c.remove();
                }, c.doc = n, c.user = o, c.saveAnonymousProps = a, r && (c.container = r), c.render(), 
                c;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "checkContainer",
                value: function() {
                    this.container || (this.container = this.doc.createElement("onboarding_dialog"), 
                    this.doc.documentElement.appendChild(this.container), b.listen(this.doc.defaultView, "keydown", this.onKey, !1));
                }
            }, {
                key: "render",
                value: function() {
                    var e = this.user;
                    this.checkContainer(), this.dialogComponent = h.render(m.createElement(v.OnboardingDialogComponent, {
                        username: e && e.firstName || "",
                        isAnonymous: !e || e.anonymous,
                        saveAnonymousProps: this.saveAnonymousProps,
                        onClose: this.onClose
                    }), this.container);
                }
            }, {
                key: "remove",
                value: function() {
                    b.unlisten(this.doc.defaultView, "keydown", this.onKey, !1), this.container && h.unmountComponentAtNode(this.container), 
                    this.container.parentNode && this.container.parentNode.removeChild(this.container);
                }
            } ]), t;
        }(g.createClass(_));
        n.OnboardingDialog = y;
    }, {
        "./onboarding-dialog": 239,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        emitter: "emitter",
        "lib/dom": 228,
        "lib/util": 322,
        react: "react",
        "react-dom": "react-dom"
    } ],
    239: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("react-dom"), v = e("lib/util"), _ = e("lib/dom"), y = e("../onboarding"), w = e("lib/tracking"), k = {
            onboardingDialog: "_9375ba-onboardingDialog",
            viewContainer: "_9375ba-viewContainer",
            view: "_9375ba-view",
            windows: "_9375ba-windows",
            footer: "_9375ba-footer",
            hide: "_9375ba-hide",
            content: "_9375ba-content",
            btnClose: "_9375ba-btnClose"
        }, C = function(e) {
            function t() {
                (0, l["default"])(this, t);
                var e = (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
                return e.state = {
                    hide: !1
                }, e.onClose = function(t) {
                    t && t.stopPropagation(), e.setState({
                        hide: !0
                    });
                    var n = b.findDOMNode(e.refs["onboarding-dialog-el"]), r = e.refs.onboarding;
                    void 0 !== r && r.state.stepIndex === r.steps.length - 1 && w.fire("onboardingTutorialLetsWrite-button-click"), 
                    n && n.addEventListener("animationend", function() {
                        return e.props.onClose();
                    });
                }, e;
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "render",
                value: function() {
                    var e, t = _.cs((e = {}, (0, i["default"])(e, k.onboardingDialog, !0), (0, i["default"])(e, k.hide, this.state.hide), 
                    (0, i["default"])(e, k.windows, v.isWindows()), e));
                    return g.createElement("div", {
                        ref: "onboarding-dialog-el",
                        className: t
                    }, g.createElement("div", {
                        className: k.content
                    }, g.createElement("div", {
                        className: k.viewContainer
                    }, g.createElement(y.Onboarding, {
                        ref: "onboarding",
                        isAnonymous: this.props.isAnonymous,
                        onClose: this.onClose,
                        saveAnonymousProps: this.props.saveAnonymousProps
                    }))), g.createElement("div", {
                        className: k.btnClose,
                        onClick: this.onClose
                    }));
                }
            } ]), t;
        }(g.Component);
        n.OnboardingDialogComponent = C;
    }, {
        "../onboarding": 241,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/tracking": 316,
        "lib/util": 322,
        react: "react",
        "react-dom": "react-dom"
    } ],
    240: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react"), o = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        };
        n.FinishStep = function(e) {
            var t = e.onClose;
            return r.createElement("div", {
                className: o.step
            }, r.createElement("div", {
                className: o.content
            }, r.createElement("div", {
                className: o.title
            }, "You’re fully protected!"), r.createElement("div", {
                className: o.text
            }, "Now, whenever you see the green Grammarly logo, it means that Grammarly has not found any mistakes. Happy writing!"), r.createElement("button", {
                className: o.button,
                onClick: function() {
                    return t();
                }
            }, "let's write")));
        };
    }, {
        react: "react"
    } ],
    241: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("./start"), g = e("./info"), b = e("./finish"), v = e("./personalize"), _ = e("./registration"), y = e("lib/tracking"), w = e("lib/dom"), k = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        }, C = function(e) {
            function t() {
                (0, s["default"])(this, t);
                var e = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return e.transforms = [ "0", "18px", "36px", "36px", "54px" ], e.classes = [ "start", "info", "personolize", "registration", "finish" ], 
                e.nextStep = function() {
                    e.setState({
                        stepIndex: e.state.stepIndex + 1
                    });
                }, e.lastStep = function() {
                    e.setState({
                        stepIndex: e.steps.length - 1
                    });
                }, e.videoLoaded = function() {
                    clearTimeout(e.placeholderTimeout), y.logger.onboardingVideoLoaded();
                }, e.state = {
                    stepIndex: 0,
                    placeholder: !1
                }, e;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "componentWillMount",
                value: function() {
                    var e = this;
                    this.steps = [ m.createElement(h.StartStep, {
                        nextStep: this.nextStep
                    }), m.createElement(g.InfoStep, {
                        nextStep: this.nextStep,
                        lastStep: this.lastStep
                    }), m.createElement(v.PersonalizeStep, {
                        nextStep: this.props.isAnonymous ? this.nextStep : this.lastStep,
                        lastStep: this.lastStep,
                        saveAnonymousProps: this.props.saveAnonymousProps
                    }), m.createElement(_.RegistrationStep, {
                        nextStep: this.nextStep,
                        lastStep: this.lastStep
                    }), m.createElement(b.FinishStep, {
                        nextStep: this.nextStep,
                        onClose: this.props.onClose
                    }) ], this.placeholderTimeout = setTimeout(function() {
                        e.setState({
                            stepIndex: e.state.stepIndex,
                            placeholder: !0
                        });
                    }, 1500);
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    clearTimeout(this.placeholderTimeout);
                }
            }, {
                key: "componentDidMount",
                value: function() {
                    y.fire("onboardingTutorial-popup-show");
                }
            }, {
                key: "render",
                value: function() {
                    var e = {
                        transform: "translateX(" + this.transforms[this.state.stepIndex] + ")"
                    }, t = w.cs(k[this.classes[this.state.stepIndex]], this.state.placeholder && k.placeholder);
                    return m.createElement("div", {
                        className: t
                    }, m.createElement("video", {
                        className: k.startVideo,
                        autoPlay: !0,
                        loop: !0,
                        preload: "auto",
                        onLoadedData: this.videoLoaded
                    }, m.createElement("source", {
                        src: "https://s3.amazonaws.com/features-team-extension/onboarding/1cards.mp4",
                        type: "video/mp4"
                    })), m.createElement("video", {
                        className: k.infoVideo,
                        autoPlay: !0,
                        loop: !0,
                        preload: "auto"
                    }, m.createElement("source", {
                        src: "https://s3.amazonaws.com/features-team-extension/onboarding/2personalization.mp4",
                        type: "video/mp4"
                    })), m.createElement("video", {
                        className: k.finishVideo,
                        autoPlay: !0,
                        loop: !0,
                        preload: "auto"
                    }, m.createElement("source", {
                        src: "https://s3.amazonaws.com/features-team-extension/onboarding/3gbutton.mp4",
                        type: "video/mp4"
                    })), this.steps[this.state.stepIndex] || null, m.createElement("div", {
                        className: k.slider
                    }, m.createElement("div", {
                        className: k.sliderActive,
                        style: e
                    }), m.createElement("div", {
                        className: k.sliderItem
                    }), m.createElement("div", {
                        className: k.sliderItem
                    }), m.createElement("div", {
                        className: k.sliderItem
                    }), m.createElement("div", {
                        className: k.sliderItem
                    })));
                }
            } ]), t;
        }(m.Component);
        n.Onboarding = C;
    }, {
        "./finish": 240,
        "./info": 242,
        "./personalize": 243,
        "./registration": 244,
        "./start": 246,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/tracking": 316,
        react: "react"
    } ],
    242: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react"), o = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        }, i = e("lib/tracking");
        n.InfoStep = function(e) {
            var t = e.nextStep, n = e.lastStep;
            return r.createElement("div", {
                className: o.step
            }, r.createElement("div", {
                className: o.content
            }, r.createElement("div", {
                className: o.title
            }, "Personalize Grammarly ", r.createElement("br", null), " for More Relevant Checking"), r.createElement("div", {
                className: o.text
            }, "Write more effectively by letting Grammarly", r.createElement("br", null), " know a little bit about your preferences."), r.createElement("button", {
                className: o.button,
                onClick: function() {
                    t(), i.fire("onboardingTutorialPersonalize-button-click");
                }
            }, "personalize"), r.createElement("button", {
                className: o.link,
                onClick: function() {
                    return n();
                }
            }, "skip")));
        };
    }, {
        "lib/tracking": 316,
        react: "react"
    } ],
    243: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/keys"), i = r(o), a = e("babel-runtime/helpers/defineProperty"), s = r(a), c = e("babel-runtime/core-js/object/assign"), l = r(c), u = e("babel-runtime/core-js/object/get-prototype-of"), d = r(u), f = e("babel-runtime/helpers/classCallCheck"), p = r(f), m = e("babel-runtime/helpers/createClass"), h = r(m), g = e("babel-runtime/helpers/possibleConstructorReturn"), b = r(g), v = e("babel-runtime/helpers/inherits"), _ = r(v);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var y = e("react"), w = e("./select"), k = e("lib/dom"), C = e("lib/tracking"), x = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        }, E = [ {
            val: "work",
            title: "WORK"
        }, {
            val: "school",
            title: "SCHOOL"
        }, {
            val: "otherProjects",
            title: "OTHER PROJECTS"
        } ], S = [ {
            val: "american",
            title: "AMERICAN ENGLISH"
        }, {
            val: "british",
            title: "BRITISH ENGLISH"
        } ], T = [ {
            val: "english",
            title: "ENGLISH"
        }, {
            val: "notEnglish",
            title: "NOT ENGLISH"
        } ], N = [ {
            val: "beginner",
            title: "BEGINNER"
        }, {
            val: "intermediate",
            title: "INTERMEDIATE"
        }, {
            val: "advanced",
            title: "ADVANCED"
        } ], P = function(e) {
            function t() {
                (0, p["default"])(this, t);
                var e = (0, b["default"])(this, (t.__proto__ || (0, d["default"])(t)).call(this));
                return e.change = function(t, n) {
                    e.setState({
                        isSaveActive: !0,
                        values: (0, l["default"])(e.state.values, (0, s["default"])({}, t, n))
                    });
                }, e.onSaveClick = function() {
                    var t = e.state, n = t.isSaveActive, r = t.values;
                    if (n !== !1) {
                        var o = (0, i["default"])(r).reduce(function(e, t) {
                            return r[t] !== w.DEFAULT_SELECT_VALUE && (e[t] = r[t]), e;
                        }, {});
                        e.props.saveAnonymousProps(o), e.props.nextStep(), C.fire("onboardingTutorialSave-button-click"), 
                        C.fire("login-attempt", "onboarding_personalization");
                    }
                }, e.state = {
                    values: {
                        writingType: w.DEFAULT_SELECT_VALUE,
                        dialectStrong: w.DEFAULT_SELECT_VALUE,
                        primaryLanguage: w.DEFAULT_SELECT_VALUE,
                        grammarSkills: w.DEFAULT_SELECT_VALUE
                    },
                    isSaveActive: !1
                }, e;
            }
            return (0, _["default"])(t, e), (0, h["default"])(t, [ {
                key: "getProgressInPercents",
                value: function() {
                    var e = this, t = (0, i["default"])(this.state.values), n = t.filter(function(t) {
                        return e.state.values[t] !== w.DEFAULT_SELECT_VALUE;
                    }).length;
                    return Math.round(n / t.length * 100);
                }
            }, {
                key: "render",
                value: function() {
                    var e = this, t = this.getProgressInPercents(), n = {
                        transform: "scaleX(" + t / 100 + ")"
                    };
                    return y.createElement("div", {
                        className: k.cs(x.step, x.personalize)
                    }, y.createElement("div", {
                        className: x.content
                    }, y.createElement("div", {
                        className: x.title
                    }, "Personalize"), y.createElement("div", {
                        className: x.progress
                    }, "Your preferences are ", y.createElement("span", {
                        className: x.progressValue
                    }, t, "%"), " custom", y.createElement("div", {
                        className: x.bar
                    }, y.createElement("div", {
                        className: x.barValue,
                        style: n
                    }))), y.createElement("div", {
                        className: x.grid
                    }, y.createElement("div", {
                        "data-name": "writingType",
                        className: x.item
                    }, y.createElement("div", {
                        className: x.name
                    }, "Most of my writing is for"), y.createElement(w.Select, {
                        id: "writingType",
                        options: E,
                        value: this.state.values.writingType,
                        onChange: this.change
                    }), y.createElement("div", {
                        className: x.description
                    }, "Our algorithms will show corrections relevant to your writing style")), y.createElement("div", {
                        "data-name": "dialectStrong",
                        className: x.item
                    }, y.createElement("div", {
                        className: x.name
                    }, "I prefer to write in"), y.createElement(w.Select, {
                        id: "dialectStrong",
                        options: S,
                        value: this.state.values.dialectStrong,
                        onChange: this.change
                    }), y.createElement("div", {
                        className: x.description
                    }, "Select which dialectical conventions we should follow")), y.createElement("div", {
                        "data-name": "primaryLanguage",
                        className: x.item
                    }, y.createElement("div", {
                        className: x.name
                    }, "My primary language is"), y.createElement(w.Select, {
                        id: "primaryLanguage",
                        options: T,
                        value: this.state.values.primaryLanguage,
                        onChange: this.change
                    }), y.createElement("div", {
                        className: x.description
                    }, "This setting helps us understand your needs better")), y.createElement("div", {
                        "data-name": "grammarSkills",
                        className: x.item
                    }, y.createElement("div", {
                        className: x.name
                    }, "My grammar skills are"), y.createElement(w.Select, {
                        id: "grammarSkills",
                        options: N,
                        value: this.state.values.grammarSkills,
                        onChange: this.change
                    }), y.createElement("div", {
                        className: x.description
                    }, "Our algorithms will show corrections relevant to your writing level")))), y.createElement("footer", {
                        className: x.footer
                    }, y.createElement("button", {
                        className: k.cs(x.button, !this.state.isSaveActive && x.inactive),
                        onClick: function() {
                            return e.onSaveClick();
                        }
                    }, "save"), y.createElement("button", {
                        className: x.link,
                        onClick: function() {
                            return e.props.lastStep();
                        }
                    }, "later")));
                }
            } ]), t;
        }(y.Component);
        n.PersonalizeStep = P;
    }, {
        "./select": 245,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/tracking": 316,
        react: "react"
    } ],
    244: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("../signin/form"), g = e("lib/dom"), b = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        }, v = function(e) {
            function t() {
                return (0, s["default"])(this, t), (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).apply(this, arguments));
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "render",
                value: function() {
                    var e = this;
                    return m.createElement("div", {
                        className: g.cs(b.step, b.registration)
                    }, m.createElement(h.Form, {
                        ref: "login",
                        showOnboardingVersion: !0,
                        username: "",
                        placement: "onboarding_personalization",
                        onSuccess: function() {
                            return e.props.lastStep();
                        }
                    }), m.createElement("button", {
                        className: g.cs(b.link, b.skipSettings),
                        onClick: function() {
                            return e.props.lastStep();
                        }
                    }, "Don’t save my settings"));
                }
            } ]), t;
        }(m.Component);
        n.RegistrationStep = v;
    }, {
        "../signin/form": 252,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        react: "react"
    } ],
    245: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react"), o = {
            selectWrap: "_ca9ab0-selectWrap",
            select: "_ca9ab0-select"
        };
        n.DEFAULT_SELECT_VALUE = "", n.Select = function(e) {
            var t = e.id, i = e.value, a = e.options, s = e.onChange;
            return r.createElement("div", {
                className: o.selectWrap
            }, r.createElement("select", {
                className: o.select,
                onChange: function(e) {
                    var n = e.target;
                    return s(t, n.value);
                },
                value: i,
                style: {
                    color: i === n.DEFAULT_SELECT_VALUE ? "#9399A7" : "#00B281"
                }
            }, i === n.DEFAULT_SELECT_VALUE && r.createElement("option", {
                key: t + "_default}",
                value: n.DEFAULT_SELECT_VALUE
            }, "SELECT"), a.map(function(e) {
                var n = e.val, o = e.title;
                return r.createElement("option", {
                    key: t + "_" + n,
                    value: n
                }, o);
            })));
        };
    }, {
        react: "react"
    } ],
    246: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react"), o = {
            start: "_2333f7-start",
            info: "_2333f7-info",
            finish: "_2333f7-finish",
            startVideo: "_2333f7-startVideo",
            infoVideo: "_2333f7-infoVideo",
            finishVideo: "_2333f7-finishVideo",
            step: "_2333f7-step",
            content: "_2333f7-content",
            title: "_2333f7-title",
            text: "_2333f7-text",
            button: "_2333f7-button",
            inactive: "_2333f7-inactive",
            link: "_2333f7-link",
            personalize: "_2333f7-personalize",
            registration: "_2333f7-registration",
            progress: "_2333f7-progress",
            bar: "_2333f7-bar",
            progressValue: "_2333f7-progressValue",
            barValue: "_2333f7-barValue",
            grid: "_2333f7-grid",
            item: "_2333f7-item",
            name: "_2333f7-name",
            description: "_2333f7-description",
            footer: "_2333f7-footer",
            skipSettings: "_2333f7-skipSettings",
            slider: "_2333f7-slider",
            sliderItem: "_2333f7-sliderItem",
            sliderActive: "_2333f7-sliderActive",
            placeholder: "_2333f7-placeholder"
        }, i = e("lib/tracking");
        n.StartStep = function(e) {
            var t = e.nextStep;
            return r.createElement("div", {
                className: o.step
            }, r.createElement("div", {
                className: o.content
            }, r.createElement("div", {
                className: o.title
            }, "Defeat Tricky Mistakes", r.createElement("br", null), " With One Click"), r.createElement("div", {
                className: o.text
            }, "Simply hover your mouse over underlined words and click once on your preferred correction."), r.createElement("button", {
                className: o.button,
                onClick: function() {
                    t(), i.fire("onboardingTutorialNext-button-click");
                }
            }, "next")));
        };
    }, {
        "lib/tracking": 316,
        react: "react"
    } ],
    247: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("react-dom"), g = e("lib/util"), b = e("lib/dom"), v = e("./signin-dialog"), _ = e("emitter"), y = function(e) {
            function t(e) {
                var n = e.doc, r = e.container, o = e.user, a = e.placement;
                (0, s["default"])(this, t);
                var c = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return c.updateUser = function(e) {
                    c.user = e, c.render();
                }, c.onKey = function(e) {
                    c.dialogComponent && c.dialogComponent.refs && c.dialogComponent.refs.form.onKey(e);
                }, c.onClose = function() {
                    c.emit("hide"), c.remove();
                }, c.doc = n, c.user = o, c.placement = a, r && (c.container = r), c.render(), c;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "checkContainer",
                value: function() {
                    this.container || (this.container = this.doc.createElement("signin_dialog"), this.doc.documentElement.appendChild(this.container), 
                    b.listen(this.doc.defaultView, "keydown", this.onKey, !1));
                }
            }, {
                key: "render",
                value: function() {
                    var e = this.user;
                    this.checkContainer(), this.dialogComponent = h.render(m.createElement(v.SigninDialogComponent, {
                        username: e && e.firstName || "",
                        onClose: this.onClose,
                        placement: this.placement
                    }), this.container);
                }
            }, {
                key: "remove",
                value: function() {
                    b.unlisten(this.doc.defaultView, "keydown", this.onKey, !1), this.container && h.unmountComponentAtNode(this.container), 
                    this.container.parentNode && this.container.parentNode.removeChild(this.container);
                }
            } ]), t;
        }(g.createClass(_));
        n.SigninDialog = y;
    }, {
        "./signin-dialog": 248,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        emitter: "emitter",
        "lib/dom": 228,
        "lib/util": 322,
        react: "react",
        "react-dom": "react-dom"
    } ],
    248: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("react-dom"), g = e("lib/util"), b = e("lib/dom"), v = e("../signin/form"), _ = {
            signinDialog: "_4c65eb-signinDialog",
            viewContainer: "_4c65eb-viewContainer",
            view: "_4c65eb-view",
            windows: "_4c65eb-windows",
            footer: "_4c65eb-footer",
            content: "_4c65eb-content",
            btnClose: "_4c65eb-btnClose"
        }, y = function(e) {
            function t() {
                (0, s["default"])(this, t);
                var e = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).apply(this, arguments));
                return e.onClick = function(t) {
                    b.matchesSelector(t.target, "." + _.content + ", ." + _.content + " *") || e.onClose(t);
                }, e.onClose = function(t) {
                    t && t.stopPropagation();
                    var n = h.findDOMNode(e.refs["signin-dialog-el"]), r = h.findDOMNode(e.refs["signin-content"]);
                    r && n && (r.style.opacity = "0", n.style.opacity = "0"), e._closeTimeout = setTimeout(function() {
                        return e.props.onClose();
                    }, 500);
                }, e;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    var e = h.findDOMNode(this.refs["signin-dialog-el"]), t = h.findDOMNode(this.refs["signin-content"]);
                    this._requestAnimationFrame = requestAnimationFrame(function() {
                        t.style.opacity = "0", e.style.opacity = "0", requestAnimationFrame(function() {
                            e.style.opacity = "1", t.style.opacity = "1";
                        });
                    });
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    clearTimeout(this._closeTimeout), cancelAnimationFrame(this._requestAnimationFrame);
                }
            }, {
                key: "render",
                value: function() {
                    var e = b.cs(_.signinDialog, g.isWindows() && _.windows), t = {
                        opacity: 0
                    }, n = {
                        opacity: 0
                    };
                    return m.createElement("div", {
                        ref: "signin-dialog-el",
                        onClick: this.onClick,
                        className: e,
                        style: t
                    }, m.createElement("div", {
                        ref: "signin-content",
                        className: _.content,
                        style: n
                    }, m.createElement("div", {
                        className: _.viewContainer
                    }, m.createElement(v.Form, {
                        ref: "form",
                        placement: this.props.placement,
                        username: this.props.username,
                        onClose: this.onClose
                    }))), m.createElement("div", {
                        className: _.btnClose,
                        onClick: this.onClose
                    }));
                }
            } ]), t;
        }(m.Component);
        n.SigninDialogComponent = y;
    }, {
        "../signin/form": 252,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/util": 322,
        react: "react",
        "react-dom": "react-dom"
    } ],
    249: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("lib/dom"), v = {
            buttonContainer: "_9a2bae-buttonContainer",
            buttonSpinner: "_9a2bae-buttonSpinner",
            button: "_9a2bae-button",
            loading: "_9a2bae-loading",
            onboarding: "_9a2bae-onboarding"
        }, _ = 290, y = function(e) {
            var t = e.className;
            return g.createElement("div", {
                className: "gr_-spinner " + t
            }, g.createElement("div", {
                className: "gr_-bounce1"
            }), g.createElement("div", {
                className: "gr_-bounce2"
            }), g.createElement("div", {
                className: "gr_-bounce3"
            }));
        }, w = function(e) {
            function t() {
                (0, l["default"])(this, t);
                var e = (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
                return e.onClick = function(t) {
                    t.preventDefault(), e.props.loading || e.props.onClick(t);
                }, e;
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "render",
                value: function() {
                    var e, t = this.props, n = t.loading, r = t.cls, o = n ? "" : this.props.text, a = this.props.styles || {
                        width: _
                    }, s = b.cs((e = {}, (0, i["default"])(e, v.buttonContainer, !0), (0, i["default"])(e, v[r], void 0 !== r), 
                    (0, i["default"])(e, v.loading, n), e));
                    return g.createElement("div", {
                        className: s,
                        style: a
                    }, n && g.createElement(y, {
                        className: v.buttonSpinner
                    }), g.createElement("button", {
                        type: "button",
                        style: a,
                        className: v.button,
                        onClick: this.onClick
                    }, o));
                }
            } ]), t;
        }(g.Component);
        n.Button = w;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        react: "react"
    } ],
    250: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/extends"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("react"), b = e("./input"), v = {
            inputs: "_194465-inputs",
            hidden: "_194465-hidden"
        }, _ = [ {
            label: "Name",
            name: "name",
            type: "text"
        }, {
            label: "Email",
            name: "email",
            type: "text"
        }, {
            label: "Password",
            name: "password",
            type: "password"
        } ], y = function(e) {
            function t() {
                return (0, l["default"])(this, t), (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).apply(this, arguments));
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "setFocus",
                value: function() {
                    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.props.fields[0], t = this.refs[e].refs.input;
                    if (t.focus(), t.value) {
                        var n = t.value.length;
                        t.setSelectionRange(n, n);
                    }
                }
            }, {
                key: "render",
                value: function() {
                    var e = this;
                    return g.createElement("fieldset", {
                        className: v.inputs
                    }, g.createElement("input", {
                        className: v.hidden,
                        type: "text",
                        name: "fakeusernameremembered"
                    }), g.createElement("input", {
                        className: v.hidden,
                        type: "password",
                        name: "fakepasswordremembered"
                    }), _.filter(function(t) {
                        var n = t.name;
                        return e.props.fields.indexOf(n) > -1;
                    }).map(function(t, n) {
                        return g.createElement(b.Input, (0, i["default"])({}, t, {
                            ref: t.name,
                            onSet: e.props.onSet(t.name),
                            value: e.props.formData[t.name],
                            validation: e.props.validation[t.name],
                            onValidate: e.props.onValidate(t.name),
                            forceValidation: e.props.forceValidation,
                            key: n
                        }));
                    }));
                }
            } ]), t;
        }(g.Component);
        n.Fieldset = y;
    }, {
        "./input": 253,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/extends": 49,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        react: "react"
    } ],
    251: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react"), o = e("lib/config"), i = {
            footer: "_4ea68c-footer"
        };
        n.Footer = function() {
            return r.createElement("div", {
                className: i.footer
            }, "By signing up, you agree to our ", r.createElement("a", {
                tabIndex: -1,
                target: "__blank",
                href: o.URLS.terms
            }, "Terms and Conditions"), " and ", r.createElement("a", {
                tabIndex: -1,
                target: "__blank",
                href: o.URLS.policy
            }, "Privacy Policy"), ".  You also agree to receive product-related emails from Grammarly, which you can unsubscribe from at any time.");
        };
    }, {
        "lib/config": 224,
        react: "react"
    } ],
    252: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/regenerator"), i = r(o), a = e("babel-runtime/helpers/defineProperty"), s = r(a), c = e("babel-runtime/core-js/object/get-prototype-of"), l = r(c), u = e("babel-runtime/helpers/classCallCheck"), d = r(u), f = e("babel-runtime/helpers/createClass"), p = r(f), m = e("babel-runtime/helpers/possibleConstructorReturn"), h = r(m), g = e("babel-runtime/helpers/inherits"), b = r(g), v = e("babel-runtime/core-js/object/assign"), _ = r(v), y = e("babel-runtime/core-js/object/keys"), w = r(y), k = e("babel-runtime/core-js/promise"), C = r(k), x = function(e, t, n, r) {
            return new (n || (n = C["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var E = e("react"), S = e("./button"), T = e("./footer"), N = e("../signin/fieldset"), P = e("lib/dom"), A = e("lib/tracking"), j = e("lib/util"), I = e("./welcome"), L = e("./login-success"), M = e("lib/message"), R = e("lib/config"), O = e("lib/url"), D = {
            form: "_2a5207-form",
            login: "_2a5207-login",
            register: "_2a5207-register",
            loginSuccess: "_2a5207-loginSuccess",
            welcome: "_2a5207-welcome",
            title: "_2a5207-title",
            subTitle: "_2a5207-subTitle",
            wrapper: "_2a5207-wrapper",
            personalizedTitle: "_2a5207-personalizedTitle",
            titleContainer: "_2a5207-titleContainer",
            personalizedTitleSub: "_2a5207-personalizedTitleSub",
            hidden: "_2a5207-hidden",
            validation: "_2a5207-validation",
            fakefield: "_2a5207-fakefield",
            navigation: "_2a5207-navigation",
            loading: "_2a5207-loading",
            navigationItem: "_2a5207-navigationItem",
            loginNav: "_2a5207-loginNav",
            toLogin: "_2a5207-toLogin",
            forgotLink: "_2a5207-forgotLink",
            onboardingVersion: "_2a5207-onboardingVersion",
            freeLabel: "_2a5207-freeLabel"
        };
        n.validationMessages = {
            fail: "Something went wrong. Please try again later.",
            invalidUser: "Invalid email address/password combination.",
            required: "Required",
            shortPassword: "Use 6 characters or more",
            incorrectEmail: "Incorrect",
            emailExists: 'Already in use. Do you need to <a data-view="login">Log in</a>?'
        }, n.validate = function(e, t) {
            var r = (0, w["default"])(e).reduce(function(r, o) {
                var i = e[o];
                return i && "" !== i ? ("password" === o && "register" === t && i.length < 6 && (r[o] = n.validationMessages.shortPassword), 
                "email" !== o || j.isValidEmail(i) || (r[o] = n.validationMessages.incorrectEmail), 
                r) : (r[o] = n.validationMessages.required, r);
            }, {});
            return r._valid = 0 === (0, w["default"])(r).length, r;
        }, n.extendWithServerValidation = function(e, t) {
            if (!t.error) return (0, _["default"])({}, e, {
                _valid: !0
            });
            var r = void 0, o = void 0, i = {};
            try {
                i = JSON.parse(t.error);
            } catch (a) {}
            return "Conflict" === t.error || "already_exists" === i.error ? o = n.validationMessages.emailExists : r = "Unauthorized" === t.error || "user_not_authorized" === i.error ? n.validationMessages.invalidUser : n.validationMessages.fail, 
            (0, _["default"])({}, e, {
                error: r,
                email: o,
                _valid: !1
            });
        }, n.getResetPassLink = function(e) {
            return R.URLS.resetPassword + (e ? "?email=" + encodeURIComponent(e) : "");
        };
        var F = function(e) {
            function t() {
                (0, d["default"])(this, t);
                var e = (0, h["default"])(this, (t.__proto__ || (0, l["default"])(t)).call(this));
                return e.forceValidation = !1, e.onClick = function(t) {
                    "login" === t.target.dataset.view && e.changeView("login");
                }, e.changeView = function(t) {
                    var n = e.state.data;
                    "login" !== t && "register" !== t || (n.password = ""), e.setState((0, _["default"])({}, e.state, {
                        view: t,
                        data: n,
                        validation: {
                            _valid: !0
                        }
                    })), e.forceValidation = !1;
                }, e.onValidate = function(t) {
                    return function(r) {
                        var o = e.state, i = o.validation, a = o.view;
                        i[t] = n.validate((0, s["default"])({}, t, r), a)[t], delete i.error, e.setState((0, 
                        _["default"])({}, e.state, {
                            validation: i
                        }));
                    };
                }, e.onSet = function(t) {
                    return function(n) {
                        var r = e.state.data;
                        r[t] = n, e.setState((0, _["default"])({}, e.state, {
                            data: r
                        }));
                    };
                }, e.getFormData = function(t) {
                    var n = (0, _["default"])({}, e.state.data);
                    return t && n.hasOwnProperty(t) && delete n[t], n;
                }, e.onKey = function(t) {
                    if (j.keyCode(t) === j.ESC_KEY && e.props.onClose && e.props.onClose(), j.keyCode(t) === j.ENTER_KEY) {
                        var n = t.target;
                        if ("A" === n.tagName) return;
                        e.onSubmit();
                    }
                }, e.onGoPremium = function() {
                    A.fire("upgrade-after-register"), M.emitBackground("open-url", O.getUpgradeURL("upHook", "anonPopupCard"));
                }, e.onSubmit = function() {
                    if (!e.state.loading) {
                        var t = e.state.view;
                        "login" === t && e.onAuth("signin", e.getFormData("name")), "register" === t && e.onAuth("signup", e.getFormData());
                    }
                }, e.focusForm = function(t, n) {
                    "start" === t && e.setFocus("login" === n ? "email" : "name"), "end" === t && e.refs.end.focus();
                }, e.state = {
                    view: "register",
                    validation: {
                        _valid: !0
                    },
                    loading: !1,
                    data: {
                        name: "",
                        email: "",
                        password: ""
                    }
                }, e;
            }
            return (0, b["default"])(t, e), (0, p["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    var e = this, t = "login" === this.state.view ? "email" : "name";
                    setTimeout(function() {
                        e.setFocus(t);
                    }, 350);
                }
            }, {
                key: "componentDidUpdate",
                value: function(e, t) {
                    var n = this.state.view;
                    if (("login" === n || "register" === n) && t.view !== n) {
                        var r = "login" === n ? "email" : "name";
                        this.setFocus(r);
                    }
                }
            }, {
                key: "onAuth",
                value: function(e, t) {
                    return x(this, void 0, void 0, i["default"].mark(function r() {
                        var o, a, s;
                        return i["default"].wrap(function(r) {
                            for (;;) switch (r.prev = r.next) {
                              case 0:
                                if (o = n.validate(t, this.state.view), this.forceValidation = !0, !o._valid) {
                                    r.next = 18;
                                    break;
                                }
                                return this.setState((0, _["default"])({}, this.state, {
                                    loading: !0
                                })), a = void 0, r.prev = 5, r.next = 8, M.promiseBackground(e, {
                                    form: t,
                                    placement: this.props.placement
                                });

                              case 8:
                                a = r.sent, r.next = 15;
                                break;

                              case 11:
                                r.prev = 11, r.t0 = r["catch"](5), r.t0.message && r.t0.message.includes("rejected by timeout") && A.logger.loginNoBgPageConnection(r.t0.message), 
                                a = {
                                    error: !0
                                };

                              case 15:
                                o = n.extendWithServerValidation(o, a), r.next = 20;
                                break;

                              case 18:
                                return this.setState((0, _["default"])({}, this.state, {
                                    validation: o,
                                    loading: !1
                                })), r.abrupt("return");

                              case 20:
                                if (!o._valid) {
                                    r.next = 23;
                                    break;
                                }
                                return s = "signup" === e ? "welcome" : "loginSuccess", r.abrupt("return", this.props.onSuccess ? this.props.onSuccess() : this.changeView(s));

                              case 23:
                                this.setState((0, _["default"])({}, this.state, {
                                    validation: o,
                                    loading: !1
                                }));

                              case 24:
                              case "end":
                                return r.stop();
                            }
                        }, r, this, [ [ 5, 11 ] ]);
                    }));
                }
            }, {
                key: "setFocus",
                value: function(e) {
                    this.refs.fieldset.setFocus(e);
                }
            }, {
                key: "loginView",
                value: function() {
                    var e = this, t = [ "email", "password" ];
                    return E.createElement("div", {
                        className: D.wrapper
                    }, this.state.validation.error && E.createElement("div", {
                        className: D.validation
                    }, this.state.validation.error), E.createElement("input", {
                        className: D.fakefield,
                        type: "text",
                        name: "fakeformstart",
                        onFocus: function() {
                            return e.focusForm("end");
                        }
                    }), E.createElement(N.Fieldset, {
                        forceValidation: this.forceValidation,
                        validation: this.state.validation,
                        onValidate: this.onValidate,
                        onSet: this.onSet,
                        ref: "fieldset",
                        formData: this.state.data,
                        fields: t
                    }), E.createElement("div", {
                        className: D.loginNav
                    }, E.createElement(S.Button, {
                        loading: this.state.loading,
                        onClick: this.onSubmit,
                        styles: {
                            width: 120
                        },
                        text: "Log In"
                    }), E.createElement("a", {
                        target: "__blank",
                        href: n.getResetPassLink(this.state.data.email),
                        ref: "end",
                        className: P.cs(D.navigationItem, D.forgotLink)
                    }, "Forgot password?")), E.createElement("input", {
                        className: D.fakefield,
                        type: "text",
                        name: "fakeformend",
                        onFocus: function() {
                            return e.focusForm("start", "login");
                        }
                    }));
                }
            }, {
                key: "registerView",
                value: function() {
                    var e = this, t = [ "name", "email", "password" ];
                    return E.createElement("div", {
                        className: D.wrapper
                    }, E.createElement("input", {
                        className: D.fakefield,
                        type: "text",
                        name: "fakeformstart",
                        onFocus: function() {
                            return e.focusForm("end");
                        }
                    }), E.createElement("div", {
                        className: D.navigation
                    }, "Already have an account? ", E.createElement("span", {
                        tabIndex: 0,
                        ref: "end",
                        onClick: function() {
                            return e.changeView("login");
                        },
                        className: D.navigationItem
                    }, "Log In")), E.createElement(N.Fieldset, {
                        ref: "fieldset",
                        forceValidation: this.forceValidation,
                        validation: this.state.validation,
                        onValidate: this.onValidate,
                        onSet: this.onSet,
                        formData: this.state.data,
                        fields: t
                    }), E.createElement(S.Button, {
                        loading: this.state.loading,
                        onClick: this.onSubmit,
                        text: "personalize grammarly"
                    }), E.createElement(T.Footer, null), E.createElement("input", {
                        className: D.fakefield,
                        type: "text",
                        name: "fakeformend",
                        onFocus: function() {
                            return e.focusForm("start", "register");
                        }
                    }));
                }
            }, {
                key: "render",
                value: function() {
                    var e = this, t = "login" === this.state.view, n = P.cs(D.form, this.state.loading && D.loading, D[this.state.view], this.props.showOnboardingVersion && D.onboardingVersion);
                    if ("welcome" === this.state.view) return E.createElement(I.Welcome, {
                        isShow: !0,
                        onClose: function() {
                            return e.props.onClose && e.props.onClose();
                        },
                        onGoPremium: function() {
                            return e.onGoPremium();
                        }
                    });
                    if ("loginSuccess" === this.state.view) return E.createElement(L.LoginSuccess, {
                        username: this.props.username,
                        onClose: function() {
                            return e.props.onClose && e.props.onClose();
                        }
                    });
                    var r = t ? this.props.showOnboardingVersion ? E.createElement("div", null, E.createElement("div", {
                        className: D.title
                    }, "Member Login"), E.createElement("div", {
                        className: D.subTitle
                    }, "to save your personalization settings")) : E.createElement("div", null, E.createElement("div", {
                        className: D.title
                    }, "Grammarly Member Login")) : this.props.showOnboardingVersion ? E.createElement("div", null, E.createElement("div", {
                        className: D.title
                    }, "Create an account"), E.createElement("div", {
                        className: D.subTitle
                    }, "to save your personalization settings"), E.createElement("div", {
                        className: D.freeLabel
                    }, "It’s free")) : E.createElement("div", {
                        className: D.personalizedTitle
                    }, "Personalize Grammarly", E.createElement("div", {
                        className: D.personalizedTitleSub
                    }, "to your writing needs"));
                    return E.createElement("form", {
                        className: n,
                        onClick: this.onClick
                    }, E.createElement("div", {
                        className: D.titleContainer
                    }, r), t ? this.loginView() : this.registerView(), t && E.createElement("div", {
                        className: D.toLogin
                    }, "New to Grammarly?", E.createElement("span", {
                        tabIndex: 0,
                        onClick: function() {
                            return e.changeView("register");
                        },
                        className: D.navigationItem
                    }, "Create a free account")));
                }
            } ]), t;
        }(E.Component);
        n.Form = F;
    }, {
        "../signin/fieldset": 250,
        "./button": 249,
        "./footer": 251,
        "./login-success": 254,
        "./welcome": 255,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "babel-runtime/regenerator": 55,
        "lib/config": 224,
        "lib/dom": 228,
        "lib/message": 287,
        "lib/tracking": 316,
        "lib/url": 321,
        "lib/util": 322,
        react: "react"
    } ],
    253: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = e("lib/util"), g = e("lib/util"), b = e("lib/dom"), v = {
            input: "_d80b1b-input",
            label: "_d80b1b-label",
            windows: "_d80b1b-windows",
            inputElement: "_d80b1b-inputElement",
            validation: "_d80b1b-validation"
        }, _ = function(e) {
            function t() {
                (0, s["default"])(this, t);
                var e = (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).apply(this, arguments));
                return e.id = h.guid(), e.state = {
                    cancelValidation: !0,
                    dirty: !1
                }, e.onBlur = function() {
                    e.setState({
                        cancelValidation: !1
                    }), e.props.onValidate(e.value);
                }, e.onChange = function() {
                    e.setState({
                        cancelValidation: !0,
                        dirty: !0
                    }), e.props.onSet(e.value);
                }, e;
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "getValidation",
                value: function() {
                    return (this.props.validation && !this.state.cancelValidation && this.state.dirty || this.props.forceValidation) && m.createElement("div", {
                        className: v.validation,
                        dangerouslySetInnerHTML: {
                            __html: this.props.validation
                        }
                    });
                }
            }, {
                key: "render",
                value: function() {
                    var e = this.props, t = e.name, n = e.type, r = e.label, o = e.value, i = {
                        name: t,
                        type: n,
                        value: o,
                        id: this.id,
                        ref: "input",
                        required: !0,
                        spellCheck: !1,
                        onBlur: this.onBlur,
                        onChange: this.onChange,
                        className: v.inputElement
                    };
                    return m.createElement("div", {
                        className: b.cs(v.input, g.isWindows() && v.windows)
                    }, this.getValidation(), m.createElement("input", i), m.createElement("label", {
                        htmlFor: this.id,
                        className: v.label
                    }, r));
                }
            }, {
                key: "value",
                get: function() {
                    return this.refs.input.value;
                }
            } ]), t;
        }(m.Component);
        n.Input = _;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/dom": 228,
        "lib/util": 322,
        react: "react"
    } ],
    254: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("react"), h = {
            loginSuccess: "_5f9912-loginSuccess",
            windows: "_5f9912-windows",
            name: "_5f9912-name",
            label: "_5f9912-label"
        }, g = function(e) {
            function t() {
                return (0, s["default"])(this, t), (0, d["default"])(this, (t.__proto__ || (0, i["default"])(t)).apply(this, arguments));
            }
            return (0, p["default"])(t, e), (0, l["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    this.props.onClose && setTimeout(this.props.onClose, 1500);
                }
            }, {
                key: "render",
                value: function() {
                    return m.createElement("div", {
                        className: h.loginSuccess
                    }, this.props.username ? m.createElement("div", {
                        className: h.label
                    }, "Welcome back, ", m.createElement("span", {
                        className: h.name
                    }, this.props.username), "!") : m.createElement("div", {
                        className: h.label
                    }, "Welcome back!"));
                }
            } ]), t;
        }(m.Component);
        n.LoginSuccess = g;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        react: "react"
    } ],
    255: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/defineProperty"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("react"), s = {
            welcome: "_66b3a6-welcome",
            windows: "_66b3a6-windows",
            image: "_66b3a6-image",
            content: "_66b3a6-content",
            show: "_66b3a6-show",
            title: "_66b3a6-title",
            text: "_66b3a6-text",
            close: "_66b3a6-close",
            learnMore: "_66b3a6-learnMore",
            goPremium: "_66b3a6-goPremium"
        }, c = e("lib/dom"), l = e("lib/util"), u = e("./button");
        n.Welcome = function(e) {
            var t, n = e.isShow, r = e.onClose, o = e.onGoPremium, d = c.cs((t = {}, (0, i["default"])(t, s.welcome, !0), 
            (0, i["default"])(t, s.show, n), (0, i["default"])(t, s.windows, l.isWindows()), 
            t));
            return a.createElement("div", {
                className: d
            }, a.createElement("div", {
                className: s.image
            }), a.createElement("div", {
                className: s.content
            }, a.createElement("div", {
                className: s.title
            }, "Welcome to Grammarly"), a.createElement("div", {
                className: s.text
            }, "Wave good-bye to the most frequent and pesky ", a.createElement("br", null), "writing mistakes."), a.createElement("div", {
                className: s.goPremium
            }, a.createElement("span", {
                className: s.checks
            }, "Go Premium and get 150+ additional", a.createElement("br", null), " advanced checks."), " ", a.createElement("a", {
                onClick: o,
                className: s.learnMore
            }, "Learn more")), a.createElement("div", {
                className: s.close
            }, a.createElement(u.Button, {
                onClick: r,
                text: "Continue to Your Text"
            }))));
        };
    }, {
        "./button": 249,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/dom": 228,
        "lib/util": 322,
        react: "react"
    } ],
    256: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = document.querySelector(".gr__tooltip");
            return e || (e = u.createEl('<span class="gr__tooltip"><span class="gr__tooltip-content"></span><i class="gr__tooltip-logo"></i><span class="gr__triangle"></span></span>'), 
            document.documentElement.appendChild(e)), e;
        }
        function i() {
            function e() {
                m.fastHide();
            }
            function t(e) {
                var t = e.target;
                return u.inEl(t, d.posEl);
            }
            function n() {
                d.posEl && (f && f.parentNode && f.parentNode.removeChild(f), u.unlisten(d.doc, "scroll", e), 
                d.moveListenerDoc && u.unlisten(d.moveListenerDoc, "scroll", e));
            }
            function r() {
                h && (h = !1, f && (f.style.opacity = "0", f.style.top = "-9999px", m && m.setVisible(!1), 
                f.className = f.className.replace(d.cls, "")));
            }
            function i() {
                d.cls += " gr-no-transition", a(), setTimeout(function() {
                    d.cls = d.cls.replace(" gr-no-transition", ""), u.removeClass(f, "gr-no-transition");
                }, 100);
            }
            function a() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : d, t = e.posEl, n = void 0 === t ? d.posEl : t, r = e.html, o = void 0 === r ? d.html : r, i = e.text, a = void 0 === i ? d.text : i, c = e.cls, b = void 0 === c ? d.cls : c, v = e.doc, _ = void 0 === v ? d.doc : v, y = e.outerIframe, w = void 0 === y ? d.outerIframe : y;
                if ((0, s["default"])(d, {
                    posEl: n,
                    html: o,
                    text: a,
                    cls: b,
                    doc: _,
                    outerIframe: w
                }), g) {
                    h = !0, m && m.setVisible(!0), a && f.setAttribute("data-content", a), o && (p.innerHTML = o), 
                    f.className = "gr__tooltip", b && u.addClass(f, b), u.removeClass(f, "gr__flipped");
                    var k = l.getAbsRect(n, w), C = l.posToRect(f, k), x = C.rect, E = x.top, S = x.left;
                    u.css(f, {
                        top: E,
                        left: S
                    }), C && C.rect && !C.rect.flip && u.addClass(f, "gr__flipped");
                    var T = f.clientWidth, N = f.querySelector(".gr__triangle"), P = k.width / 2;
                    P > T && (P = 0), C.delta.right <= 0 && (P -= C.delta.right), P -= parseInt(getComputedStyle(f).getPropertyValue("margin-left"), 10), 
                    N && (N.style.marginLeft = P + "px"), f.style.opacity = "1";
                }
            }
            var d = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, f = o(), p = void 0, m = void 0, h = void 0, g = void 0 === d.enabled || d.enabled;
            p = f.querySelector(".gr__tooltip-content"), d.posEl && (d.moveListenerDoc = d.outerIframe ? d.outerIframe.contentDocument : d.doc, 
            m = new c.HintImpl({
                doc: d.moveListenerDoc,
                doc2: d.doc,
                hint: f,
                hideDelay: 500,
                delay: 0,
                onshow: function() {
                    return a();
                },
                onhide: r,
                inTarget: t
            }), u.listen(d.doc, "scroll", e), u.listen(d.moveListenerDoc, "scroll", e), m.bind());
            var b = {
                show: a,
                fastShow: i,
                hide: r,
                remove: n,
                el: f,
                enable: function() {
                    g = !0;
                },
                disable: function() {
                    g = !1;
                },
                isEnabled: function() {
                    return g;
                }
            };
            return b;
        }
        var a = e("babel-runtime/core-js/object/assign"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./hint"), l = e("../position"), u = e("../dom");
        n.createTooltip = i;
    }, {
        "../dom": 228,
        "../position": 298,
        "./hint": 235,
        "babel-runtime/core-js/object/assign": 36
    } ],
    257: [ function(e, t, n) {
        "use strict";
        function r(e) {
            var t = document.createElement("script");
            t.innerHTML = e, document.head.appendChild(t), t.parentNode && t.parentNode.removeChild(t);
        }
        function o() {
            c.initContentScript(), r("window.GR_EXTENSION_ID='" + s.getUuid() + "'"), r("\n    window.GR_EXTENSION_SEND = function(key, data) {\n      if (!key) throw new TypeError('cant be called without message')\n      var e = document.createEvent('CustomEvent')\n      e.initCustomEvent('external:' + key, true, true, data)\n      document.dispatchEvent(e)\n    }\n  "), 
            s.externalEvents.map(function(e) {
                return "external:" + e;
            }).forEach(function(e) {
                return a.on.call(document, e, function(t) {
                    var n = t.detail;
                    console.log("external event", e, n), i.emitBackground(e, n);
                });
            });
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var i = e("./message"), a = e("./dom"), s = e("./config"), c = e("./tracking");
        n.addExternalEventListeners = o;
    }, {
        "./config": 224,
        "./dom": 228,
        "./message": 287,
        "./tracking": 316
    } ],
    258: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("lib/tracking/felogPixel"), o = e("lib/tracking/telemetry"), i = {}, a = new o.Telemetry(r.sendEventPixel);
        n.failover = function() {
            function e() {
                setTimeout(o, c), i.index_load = !1;
            }
            function t() {
                setTimeout(s, l), i.app_load = !1;
            }
            function n(e) {
                i[e] = !0;
            }
            function r(e, t) {}
            function o() {
                r("index_load", "extension_loading"), i.index_load || a.pageLoadTimeout();
            }
            function s() {
                r("app_load", "extension_app_loading"), i.app_load || a.appLoadTimeout();
            }
            var c = 12e4, l = 12e4, u = {
                startPageLoadTimer: e,
                startAppLoadTimer: t,
                success: n,
                setPageLoadTimeout: function(e) {
                    return c = e;
                },
                setAppLoadTimeout: function(e) {
                    return l = e;
                }
            };
            return u;
        }();
    }, {
        "lib/tracking/felogPixel": 315,
        "lib/tracking/telemetry": 319
    } ],
    259: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            t.setDomSelection = function(t) {
                var n = o.getNodeByTextPos(e, t.begin), r = o.getNodeByTextPos(e, t.end);
                i.setDomRange(e.ownerDocument, {
                    anchorNode: n.node,
                    anchorOffset: t.begin - n.pos,
                    focusNode: r.node,
                    focusOffset: t.end - r.pos
                });
            }, t.setCursor = function(e) {
                t.cursor = e;
            }, t.fireDomEvent = function(e) {
                a.isFF() && i.emitDomEvent("document-mousedown-mouseup-activeElement");
                var t = " " === e || e.trim() ? "paste" : "backspace";
                i.emitDomEvent("document-" + t + "-activeElement", e);
            }, t.doReplace = function(e, n) {
                t.safeFocus(), t.setDomSelection(e), a.asyncCall(function() {
                    return t.fireDomEvent(n);
                });
            }, t.setTextareaValue = function(n) {
                t.safeFocus(), e.ownerDocument.getSelection().selectAllChildren(e), a.asyncCall(function() {
                    t.fireDomEvent(n.trimRight()), a.asyncCall(t._setCursor, 100);
                }, a.isSafari() ? 100 : 10);
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("@grammarly-npm/wrap"), i = e("lib/dom"), a = e("lib/util");
        n.extendDom = r;
    }, {
        "@grammarly-npm/wrap": 30,
        "lib/dom": 228,
        "lib/util": 322
    } ],
    260: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            function t() {
                k();
            }
            function n(e) {
                var t = P.getBoundingClientRect(), n = x(e.clientX - t.left, e.clientY - t.top, t.left, t.top);
                if (n) {
                    n.e = e, e.stopPropagation();
                    var r = document.createEvent("CustomEvent");
                    r.initCustomEvent("gramMouse", !0, !0, n), j.dispatchEvent(r);
                }
            }
            function r(e) {
                return e ? e.toString().split(" ").map(function(e) {
                    return isNaN(parseFloat(e)) && e.indexOf("px") === -1 ? e : Math.floor(parseFloat(e)) + "px";
                }).join(" ") : e + "";
            }
            function o() {
                var e = I.getComputedStyle(P);
                if (!e) return {};
                var t = function(t) {
                    return e.getPropertyValue(t);
                }, n = function(e) {
                    var n = {};
                    return e.map(function(e) {
                        n[e] = t(e), "z-index" === e && "auto" === n[e] && P.style.zIndex && (n[e] = P.style.zIndex);
                    }), n;
                }, o = {
                    parent: n([ "border", "border-radius", "box-sizing", "height", "width", "margin", "padding", "z-index", "border-top-width", "border-right-width", "border-left-width", "border-bottom-width", "border-top-style", "border-right-style", "border-left-style", "border-bottom-style", "padding-top", "padding-left", "padding-bottom", "padding-right", "margin-top", "margin-left", "margin-bottom", "margin-right" ]),
                    child: n([ "font", "font-size", "font-family", "text-align", "line-height", "letter-spacing", "text-shadow" ]),
                    src: n([ "position", "margin-top", "line-height", "font-size", "font-family", "z-index" ])
                }, i = o.parent["z-index"];
                if (o.parent["z-index"] = i && "auto" !== i ? (parseInt(i, 10) - 1).toString() : "0", 
                o.parent.marginTop = r(o.parent.marginTop), o.src.marginTop = r(o.src.marginTop), 
                o.parent.margin = r(o.parent.margin), o.parent.padding = r(o.parent.padding), (o.parent["border-top-width"] || o.parent["border-left-width"]) && (o.parent["border-style"] = "solid"), 
                o.parent.border) {
                    var a = o.parent.border.split(" ");
                    o.parent["border-width"] = a[0], a.length > 1 && (o.parent["border-style"] = a[1]), 
                    delete o.parent.border;
                }
                if (o.parent["border-color"] = "transparent !important", "absolute" === o.src.position || "relative" === o.src.position ? o.parent = u.extend(o.parent, n([ "top", "left" ])) : o.src.position = "relative", 
                z = K.customDefaultBg && K.customDefaultBg(P) || z || t("background"), d.isFF() && !z && (z = [ "background-color", "background-image", "background-repeat", "background-attachment", "background-position" ].map(t).join(" ")), 
                o.parent.background = z, d.isFF()) {
                    var s = parseInt(t("border-right-width"), 10) - parseInt(t("border-left-width"), 10), c = P.offsetWidth - P.clientWidth - s;
                    o.child["padding-right"] = c - 1 + "px";
                }
                return "start" === t("text-align") && (o.child["text-align"] = "ltr" === t("direction") ? "left" : "right"), 
                o;
            }
            function i(e) {
                V = e, g();
            }
            function a(e) {
                var t = {
                    background: "transparent !important",
                    "z-index": e["z-index"] || 1,
                    position: e.position,
                    "line-height": e["line-height"],
                    "font-size": e["font-size"],
                    "-webkit-transition": "none",
                    transition: "none"
                };
                parseInt(e["margin-top"], 10) > 0 && m.css(P.parentNode, {
                    width: "auto",
                    overflow: "hidden"
                });
                var n = I.devicePixelRatio > 1;
                if (n) {
                    var r = e["font-family"];
                    0 === r.indexOf("Consolas") && (r = r.replace("Consolas,", "Menlo, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace, serif"), 
                    R.child["font-family"] = r, t["font-family"] = r);
                }
                m.css(P, t);
            }
            function g() {
                var e = o();
                U || (a(e.src), G = !!P.previousElementSibling && "left" === m.css(P.previousElementSibling, "float"), 
                d.interval(g, 500), W || (W = !0, m.listen(P, J)), U = !0), R.parent.marginTop = r(R.parent.marginTop), 
                e = u.merge(e, R), e.child.height = P.scrollHeight, K.fieldRestoreInlineStyles && K.fieldRestoreInlineStyles(P, e), 
                K.ghostHeight && (e.child.height = K.ghostHeight(e.child.height)), K.getContainerTextAlign && (e.child.textAlign = K.getContainerTextAlign(P));
                var t = u.merge(O, {
                    "data-id": M,
                    "data-gramm_id": M,
                    "data-gramm": "gramm",
                    "data-gramm_editor": !0,
                    dir: P.getAttribute("dir")
                });
                D || (D = j.createElement("grammarly-ghost"), D.setAttribute("spellcheck", "false"), 
                m.insertBefore(D, A)), L.matchPrefix && (t.className = L.matchPrefix), K.ghostHeight && (e.parent.height = K.ghostHeight(e.parent.height));
                var n = l.render(c.createElement(b, {
                    style: e,
                    attrs: t,
                    val: V
                }), D);
                F = l.findDOMNode(n), B = F.firstElementChild, F.contentEditable = "true", Y.clone = F, 
                Y.cloneVal = B, v(), _(), y(), 0 === P.offsetHeight ? S() : T(), Y.emit("render");
            }
            function v() {
                if (G) {
                    if (P.getBoundingClientRect().left === F.getBoundingClientRect().left && P.getBoundingClientRect().top === F.getBoundingClientRect().top) return G = !1;
                    var e = P.getBoundingClientRect(), t = P.parentNode.getBoundingClientRect(), n = e.left - t.left, r = e.top - t.top, o = "translate(" + n + "px, " + r + "px)";
                    R.parent["-webkit-transform"] = o, R.parent.transform = o;
                }
            }
            function _() {
                function e(e, r, o) {
                    var i = o ? [ P, F ] : [ t, n ];
                    R.parent[r] = parseInt((parseInt(F.style[r], 10) + i[0][e] - i[1][e]).toString(), 10) + "px";
                }
                var t = p.getAbsRect(P), n = p.getAbsRect(F);
                if (n.left !== t.left && e("left", "marginLeft", !1), n.top !== t.top && e("top", "marginTop", !1), 
                F.clientWidth === P.clientWidth || d.isFF() ? n.width !== t.width && (O.width = t.width) : n.width !== t.width ? F.style.width = t.width.toString() : e("clientWidth", "width", !0), 
                d.isFF()) {
                    var r = m.css(P.parentNode, [ "margin-left", "margin-top", "position" ]);
                    r && (r.marginLeft || r.marginTop) && "static" === r.position && (P.parentNode.style.position = "relative", 
                    P.parentNode.style.overflow = "");
                }
                n.height !== t.height && (R.parent.height = t.height);
            }
            function y() {
                function e(e, t) {
                    return f.isFacebookSite() ? e.nextElementSibling && e.nextElementSibling.childNodes[0] !== t : e.nextElementSibling !== t;
                }
                var t = function(e) {
                    return j.contains && j.contains(e) || m.elementInDocument(e, j);
                };
                D && t(P) && (!e(D, P) && t(D) || m.insertBefore(D, A));
            }
            function w(e) {
                return F.querySelector(".gr_" + e);
            }
            function k() {
                var e = L.current();
                q = [];
                for (var t = F.scrollTop, n = 0; n < e.length; n++) {
                    var r = e[n], o = w(r.id);
                    if (o) {
                        C(o);
                        var i = p.getPos(o, F), a = {
                            x1: i.x,
                            x2: i.x + o.offsetWidth,
                            y1: i.y,
                            y2: i.y + o.offsetHeight + 5
                        }, s = {
                            match: r,
                            el: o,
                            box: a
                        };
                        q.push(s);
                        var c = o.textContent, l = c && c.trim().split(" ").length > 1;
                        if (l) {
                            var d = o.getClientRects();
                            d.length < 2 || (s.rects = u.map(d, function(e) {
                                return {
                                    x1: e.left,
                                    x2: e.right,
                                    y1: e.top + t,
                                    y2: e.bottom + t
                                };
                            }));
                        }
                    }
                }
            }
            function C(e) {
                if (e) {
                    var t = e.parentNode;
                    if (t) {
                        var n = t.getAttribute("style");
                        n && e.setAttribute("style", n);
                    }
                    e.classList.contains("gr_disable_anim_appear") || e.addEventListener("animationend", function() {
                        return e.classList.add("gr_disable_anim_appear");
                    }), m.css(e, {
                        display: "",
                        padding: "",
                        margin: "",
                        width: ""
                    });
                }
            }
            function x(e, t, n, r) {
                for (var o = F.scrollTop, i = 0; i < q.length; i++) {
                    var a = q[i], s = a.box;
                    if (e >= s.x1 && e <= s.x2 && t >= s.y1 - o && t <= s.y2 - o) return a;
                    if (a.rects) for (var c = 0; c < a.rects.length; c++) {
                        var l = a.rects[c], u = e + n, d = t + r;
                        if (u >= l.x1 && u <= l.x2 && d >= l.y1 - o && d <= l.y2 - o) return a;
                    }
                }
            }
            function E() {
                clearTimeout(H), d.cancelInterval(g);
            }
            function S() {
                D.style.display = "none", d.isSafari() && (P.style.background = "", P.style.backgroundColor = ""), 
                P.style.background = z, d.cancelInterval(g), setTimeout(function() {
                    return Y.emit("render");
                }, 300), U = !1, D.parentNode && D.parentNode.removeChild(D);
            }
            function T() {
                U || (D.style.display = "", D.parentNode || m.insertBefore(D, A), g(), Q());
            }
            function N() {
                E(), m.unlisten(P, J), S();
            }
            var P = e.el, A = f.isFacebookSite() ? P.parentNode : P, j = P.ownerDocument, I = j.defaultView, L = e.editor || {
                current: function() {
                    return [];
                }
            }, M = e.id, R = {
                parent: {},
                child: {}
            }, O = {}, D = void 0, F = void 0, B = void 0, U = !1, W = void 0, V = "", G = !1, z = void 0, H = void 0, q = [], K = h.pageStyles(j).getFixesForCurrentDomain(), Y = s({
                render: g,
                getStyle: o,
                setText: i,
                generateAlertPositions: k,
                remove: N,
                hide: S,
                show: T
            }), Q = function() {
                try {
                    R.child.height = P.scrollHeight, F.scrollTop = P.scrollTop, clearTimeout(H), H = setTimeout(Q, 100);
                } catch (e) {
                    Q = d._f;
                }
            }, J = {
                mousemove: n,
                mouseenter: t,
                keyup: Q,
                scroll: Q
            };
            return Y;
        }
        var i = e("babel-runtime/helpers/extends"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("emitter"), c = e("react"), l = e("react-dom"), u = e("lodash"), d = e("../util"), f = e("lib/location"), p = e("../position"), m = e("../dom"), h = e("../sites"), g = {
            style: {
                child: {
                    display: "inline-block",
                    "line-height": "initial",
                    color: "transparent",
                    overflow: "hidden",
                    "text-align": "left",
                    "float": "initial",
                    clear: "none",
                    "box-sizing": "border-box",
                    "vertical-align": "baseline",
                    "white-space": "pre-wrap",
                    width: "100%",
                    margin: 0,
                    padding: 0,
                    border: 0
                },
                parent: {
                    position: "absolute",
                    color: "transparent",
                    "border-color": "transparent !important",
                    overflow: "hidden",
                    "white-space": "pre-wrap"
                },
                src: {}
            },
            attrs: {},
            val: ""
        }, b = c.createClass({
            displayName: "GhostComponent",
            getDefaultProps: function() {
                return g;
            },
            render: function() {
                var e = u.merge(g.style, this.props.style), t = this.props.attrs, n = m.camelizeAttrs(e.parent), r = m.camelizeAttrs(e.child), o = this.props.val;
                return t.gramm = !0, c.createElement("div", (0, a["default"])({
                    style: n
                }, t), c.createElement("span", {
                    style: r,
                    dangerouslySetInnerHTML: {
                        __html: o
                    }
                }), c.createElement("br", null));
            }
        });
        n.createGhost = o;
    }, {
        "../dom": 228,
        "../position": 298,
        "../sites": 303,
        "../util": 322,
        "babel-runtime/helpers/extends": 49,
        emitter: "emitter",
        "lib/location": 286,
        lodash: "lodash",
        react: "react",
        "react-dom": "react-dom"
    } ],
    261: [ function(e, t, n) {
        "use strict";
        function r(e, t, n) {
            function r() {
                return F = e(U.el, U.id), F.on("exit", N), F.dom.insertGhost = C, L = s.createGhost({
                    id: n,
                    el: t,
                    editor: F
                }), U.gh = L, F.ghostarea = U, F._run = F.run, F.run = d, F;
            }
            function d() {
                f("on"), M = !0, D = p(), F._run(), L && L.show();
            }
            function f() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "on";
                "on" === e ? (o.listen(t, "input", h), o.listen(t, "keyup", w), o.listen(t, "keydown", k), 
                o.listen(A, "click", b, void 0, !0)) : (o.unlisten(t, "input", h), o.unlisten(t, "keyup", w), 
                o.unlisten(t, "keydown", k), o.unlisten(A, "click", b)), L && L[e]("render", _), 
                F[e]("rendered", E), F.isHtmlGhost || (F[e]("beforeReplace", g), F[e]("afterReplace", x));
            }
            function p() {
                return "TEXTAREA" === t.tagName ? t.value : t.parentNode ? u.getText(t) : "";
            }
            function m(e) {
                t.value = e;
            }
            function h() {
                M && (D = p());
            }
            function g() {
                O = t.scrollTop;
            }
            function b(e) {
                if (a.isFacebookSite() && o.matchesSelector(e.target, B)) return y();
            }
            function v() {
                var e = P.createEvent("TextEvent");
                e.initTextEvent ? F.latestCursor.s === F.latestCursor.e && (e.initTextEvent("textInput", !0, !0, null, String.fromCharCode(8203), 1, "en-US"), 
                setTimeout(function() {
                    F.saveCursor(), F.skipInputEvents(), t.dispatchEvent(e), setTimeout(function() {
                        m(p().replace(String.fromCharCode(8203), "")), F.restoreCursor(), F.skipInputEvents(!1);
                    }, 50);
                }, 50)) : (o.runKeyEvent({
                    el: t,
                    type: "keydown"
                }), o.runKeyEvent({
                    el: t,
                    type: "keyup"
                })), t.scrollTop = O, D = p();
            }
            function _() {
                if ((0 === D.length && p().length > 0 || R) && (D = p(), R = !1), M) {
                    D = D.replace(new RegExp(String.fromCharCode(8203), "g"), "");
                    var e = c.diffPos(D, p()), t = 1 !== D.indexOf("@") && p().indexOf("@") === -1;
                    e.delta >= 2 && 0 === e.s && (j || I) && !t && y();
                }
            }
            function y() {
                M && (S(), F.clearData());
            }
            function w(e) {
                F.camouflage();
            }
            function k(e) {
                I = 13 === i.keyCode(e);
            }
            function C() {
                return L.render(), {
                    clone: L.clone,
                    cloneVal: L.cloneVal
                };
            }
            function x() {
                setTimeout(v, 50);
            }
            function E() {
                L && L.generateAlertPositions();
            }
            function S() {
                M && L && L.hide();
            }
            function T() {
                M = !0, L && L.show();
            }
            function N() {
                f("off"), F && (F.off("exit", N), F.remove(), F = null), U.emit("exit"), t.removeAttribute("data-gramm"), 
                t.removeAttribute("data-txt_gramm_id"), L && (L.remove(), L = null);
            }
            var P = t.ownerDocument, A = P.defaultView, j = !1, I = !1, L = void 0, M = !1, R = void 0, O = void 0, D = p(), F = void 0;
            t.setAttribute("data-gramm", ""), t.setAttribute("data-txt_gramm_id", n);
            var B = "div[role=navigation] li[role=listitem] *", U = l({
                el: t,
                id: n,
                hideClone: S,
                showClone: T,
                insertGhost: C,
                remove: N,
                run: d
            });
            return r();
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("../dom"), i = e("../util"), a = e("lib/location"), s = e("./ghost"), c = e("@grammarly-npm/textdiff"), l = e("emitter"), u = e("@grammarly-npm/wrap");
        n.createGhostArea = r;
    }, {
        "../dom": 228,
        "../util": 322,
        "./ghost": 260,
        "@grammarly-npm/textdiff": 16,
        "@grammarly-npm/wrap": 30,
        emitter: "emitter",
        "lib/location": 286
    } ],
    262: [ function(e, t, n) {
        "use strict";
        function r() {
            return s && a.HTML_GHOST_SITES.includes(s);
        }
        function o() {
            return "[contenteditable]";
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var i = e("lib/location"), a = e("../page-config/defaults"), s = i.getDomain();
        n.isHtmlGhostSite = r, n.getHtmlGhostSelector = o;
    }, {
        "../page-config/defaults": 292,
        "lib/location": 286
    } ],
    263: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("@grammarly-npm/under"), o = e("@grammarly-npm/wrap"), i = e("lib/util"), a = e("./facebook-ghost"), s = e("lib/location");
        n.HtmlGhostDom = function(e) {
            var t = e.editor, n = e.el, c = n.ownerDocument, l = r.HtmlDom(e), u = r.TextareaDom(e);
            return u.safeFocus = function() {
                var e = c.body.scrollTop;
                n.focus(), c.body.scrollTop = e;
            }, u.getCursor = function() {
                return l.getCursor();
            }, u.setCursor = function(e) {
                u.cursor = e, u._setCursor();
            }, u._setCursor = function() {
                o.invalidateNode(n), l.setCursor(u.cursor);
            }, u.getText = function() {
                return n.parentNode ? (o.invalidateNode(n), delete n.__getText, o.getText(n)) : "";
            }, u.replace = function(e, n, r) {
                t.inputListener.ignorePaste = !0, u.doReplace(e, n), e.replaced = !r, e.inDom = !r, 
                t.inputListener.ignorePaste = !1;
            }, u.doReplace = function(e, t) {
                var n = u.getText();
                n = n.substring(0, e.s) + t + n.substr(e.e), u.setTextareaValueSync(n), i.asyncCall(u._setCursor);
            }, u.setTextareaValueSync = function(e) {
                n.innerText = e, o.invalidateNode(n), u.safeFocus();
            }, u.setTextareaValue = function(e) {
                u.safeFocus(), i.asyncCall(function() {
                    n.innerText = e, o.invalidateNode(n);
                });
            }, s.isFacebookSite() && a.extendDom(n, u), u;
        };
    }, {
        "./facebook-ghost": 259,
        "@grammarly-npm/under": 26,
        "@grammarly-npm/wrap": 30,
        "lib/location": 286,
        "lib/util": 322
    } ],
    264: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("emitter"), o = e("lodash"), i = e("@grammarly-npm/websocket");
        n.capi = r({
            CLIENT_NAME: "web",
            PROTOCOL_VERSION: "1.0",
            clientVersion: "",
            extDomain: "",
            token: null,
            debug: !1,
            setToken: function(e) {
                n.capi.token = e, n.capi.emit("ready", n.capi.token);
            },
            onReady: function(e) {
                return n.capi.token ? e(n.capi.token) : void n.capi.one("ready", e);
            },
            createClient: function(e) {
                function t(e) {
                    var t = u[e.error];
                    if (t) {
                        t.intervals || (t.intervals = [], t.lastErrSent = 0), t.lastErr = Date.now(), t.intervals.push(t.lastErr), 
                        t.intervals.length < t.maxCount && (m.ws.reconnect(), m.start());
                        var n = t.lastErr - t.intervals[t.intervals.length - (t.maxCount + 1)] < 6e4;
                        t.intervals.length > t.maxCount && n && t.lastErr - t.lastErrSent > 6e4 && (m.emit(t.emitMsg, {
                            msg: e,
                            count: t.intervals.length,
                            intervals: t.intervals
                        }), t.lastErrSent = t.lastErr), "not_authorized" === e.error && t.intervals.length > t.maxCount && (t.intervals = []);
                    }
                }
                function a(e, t, n) {
                    return t.rev = m.rev++, o.isFunction(n) && m.one([ "finished", t.rev.toString() ], n), 
                    s(e, t), t.rev;
                }
                function s(e, t, n) {
                    t = t || {}, t.action = e, t.id = m.messageId++;
                    var r = +new Date();
                    return m.one([ t.action.toString(), t.id.toString() ], function() {
                        o.isFunction(n) && n(t), m.emit("stats:timing", {
                            key: "performance:capi_time",
                            value: +new Date() - r,
                            tags: [ "op:" + e ]
                        });
                    }), m.ws.send(t), t.id;
                }
                var c = !e.silentLogs, l = 9e5, u = {
                    runtime_error: {
                        maxCount: 10,
                        emitMsg: "frequent_runtime_error"
                    },
                    not_authorized: {
                        maxCount: 5,
                        emitMsg: "frequent_not_authorized_error"
                    }
                }, d = !1, f = 0;
                e = o.extend({
                    connectionTimeout: 1e3,
                    sid: null,
                    useQueue: 30,
                    useStandBy: l,
                    resetQueueOnReconnect: !0
                }, e);
                var p = e.createWs || i, m = r({
                    rev: 0,
                    messageId: 0,
                    options: e,
                    genre: null,
                    ws: p(e),
                    checkText: function(e, t, n, r) {
                        return m.check(e, t, n, void 0, r);
                    },
                    submitOt: function(e, t, n, r) {
                        return m.rev = t, n = n || {}, a("submit_ot", o.extend({
                            ch: e
                        }, n), r);
                    },
                    checkNoSynonymsText: function(e, t, n, r) {
                        return m.check(e, t, n, "NOSYNONYMS", r);
                    },
                    checkGrammar: function(e, t, n, r) {
                        return m.check(e, t, n, "GRAMMAR", r);
                    },
                    checkSpell: function(e, t, n, r) {
                        return m.check(e, t, n, "SPELL", r);
                    },
                    checkStyle: function(e, t, n, r) {
                        return m.check(e, t, n, "STYLE", r);
                    },
                    checkSynonyms: function(e, t, n, r) {
                        return m.check(e, t, n, "SYNONYMS", r);
                    },
                    acknowledged: function(e) {
                        return m.feedback(e, "acknowledged");
                    },
                    ignore: function(e) {
                        return m.feedback(e, "ignore");
                    },
                    ignoreAll: function(e) {
                        return m.feedback(e, "ignore_all");
                    },
                    addToDictionary: function(e) {
                        return s("add_to_dict", {
                            word: e.value
                        });
                    },
                    feedback: function(e, t) {
                        return s("feedback", {
                            sentenceNo: e.sentence_no,
                            alertId: String(e.sid),
                            text: e.value,
                            type: t
                        });
                    },
                    check: function(e, t, n, r, o) {
                        return a("submit", {
                            text: e,
                            begin: t,
                            end: n,
                            checks: r
                        }, o);
                    },
                    start: function() {
                        var t = {
                            token: n.capi.token,
                            sid: e.sid,
                            docid: e.docid,
                            client: n.capi.CLIENT_NAME,
                            protocolVersion: n.capi.PROTOCOL_VERSION
                        };
                        return e.dialect && (t.dialect = e.dialect), n.capi.clientVersion && (t.clientVersion = n.capi.clientVersion), 
                        n.capi.extDomain && (t.extDomain = n.capi.extDomain), s("start", t);
                    },
                    plagiarism: function(e, t) {
                        return a("plagiarism", {
                            text: e
                        }, t);
                    },
                    undo: function(e, t) {
                        return s("undo", {
                            alertId: e,
                            sentenceId: t
                        });
                    },
                    drop: function(e, t) {
                        return s("drop", {
                            alertId: e,
                            sentenceId: t
                        });
                    },
                    synonyms: function(e) {
                        return s("synonyms", {
                            rev: m.rev - 1,
                            begin: e
                        });
                    },
                    stop: function() {
                        return s("stop");
                    },
                    logout: function() {
                        return s("logout");
                    },
                    close: function() {
                        return m.ws.close();
                    },
                    wsPause: function() {
                        return m.ws.wsPause();
                    },
                    wsPlay: function() {
                        return m.ws.wsPlay();
                    },
                    sendContainerId: function(e) {
                        return s("option", {
                            name: "gnar_containerId",
                            value: e
                        });
                    }
                }), h = function() {
                    function e() {
                        clearTimeout(r), r = setTimeout(function() {
                            m.ws.isConnected() || (m.emit("serviceState", {
                                type: "capi",
                                available: !1
                            }), o = !0);
                        }, n);
                    }
                    function t() {
                        clearTimeout(r), o && m.emit("serviceState", {
                            type: "capi",
                            available: !0
                        }), o = !1;
                    }
                    var n = 6e4, r = void 0, o = !1;
                    return {
                        setAvailable: t,
                        checkOnline: e
                    };
                }();
                return m.ws.on("message", function(e) {
                    if (e.action) {
                        var n = e.action.toLowerCase();
                        if ("finished" === n && void 0 !== e.rev) return m.emit([ n, e.rev.toString() ], e), 
                        m.emit(n, e);
                        if ("cannot_find_synonym" === e.error) {
                            var r = {
                                synonyms: {
                                    meanings: []
                                },
                                action: "synonyms",
                                id: e.id,
                                type: "syn"
                            };
                            return m.emit("synonyms", r);
                        }
                        if ("error" === n) return t(e), m.emit("capiError", e);
                        if ("alert" === n && void 0 !== e.rev) return m.emit([ n, e.rev.toString() ], e), 
                        m.emit(n, e);
                        e.id && m.emit([ n, e.id ], e), m.emit(n, e);
                    }
                }), m.on("start", function(e) {
                    m.emit("socketStart"), c && console.log("Got START with sid %s", e.sid), e.sid && (m.options.sid = e.sid);
                }), m.ws.connect(), m.start(), m.ws.on("connect", function() {
                    m.emit("socketConnect"), h.setAvailable();
                }), m.ws.on("error", function(e) {
                    h.checkOnline(), "disconnected" !== e && (m.emit("socketError", e), d || (f++, m.emit("socketFailCount", f)), 
                    d = !0);
                }), m.ws.on("reconnect", function() {
                    m.start(), m.emit("socketReconnect"), h.setAvailable(), d && (m.emit("socketReconnectAfterError"), 
                    d = !1);
                }), m.ws.delegate(m, "disconnect"), m;
            }
        });
    }, {
        "@grammarly-npm/websocket": 28,
        emitter: "emitter",
        lodash: "lodash"
    } ],
    265: [ function(e, t, n) {
        "use strict";
        function r(e, t, n) {
            if (e.length <= 4) return t;
            var r = o.textdiff(e, t);
            if (!r.from) return t;
            n = n || "b";
            var i = '<span class="' + n + '">', a = "</span>";
            return 1 === r.newFragment.length && r.from > 0 && e[r.from - 1] === r.newFragment && (r.newFragment = r.newFragment + r.newFragment, 
            r.from -= 1), 1 !== r.oldFragment.length || r.newFragment.length || t[r.from - 1] !== r.oldFragment || (r.newFragment = r.oldFragment, 
            r.from -= 1), r.newFragment.length > 3 ? t : t = e.substring(0, r.from) + i + r.newFragment + a + e.substring(r.to);
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("@grammarly-npm/textdiff");
        n.differ = r;
    }, {
        "@grammarly-npm/textdiff": 16
    } ],
    266: [ function(e, t, n) {
        "use strict";
        function r() {
            var e = document.createElement("div");
            return e.setAttribute("contenteditable", "PLAINTEXT-ONLY"), "plaintext-only" === e.contentEditable;
        }
        function o(e, t) {
            t = t || "all";
            var n = [ 160, 10, 8, 32, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8203, 8287, 12288 ];
            e && (n = n.filter(function(t) {
                return e.indexOf(t) === -1;
            }));
            for (var r = [], o = 0; o < n.length; o++) r[o] = String.fromCharCode(n[o]);
            var i = "";
            switch (t) {
              case "single":
                break;

              case "all":
              default:
                i = "+";
            }
            return new RegExp("[" + r.join("") + "]" + i, "g");
        }
        function i(e) {
            return !e || (e = e.replace(n.QUOTE_RE, ""), n.SEPARATORS.indexOf(e) !== -1 || e.match(n.ALL_SPACE_RE));
        }
        function a(e, t, n) {
            var r = e.substring(t - 1, t), o = e.substring(n, n + 1);
            return i(r) && i(o) || t === n;
        }
        function s(e, t, n) {
            var r = e.substring(t, e.length), o = 0, a = "";
            if (0 === r.length) return n ? {
                inc: o,
                word: ""
            } : "";
            for (var s = ""; r.length > 0 && i(r[0]); ) s += r.substring(0, 1), r = r.substring(1, r.length), 
            o++;
            for (var c = 0; c < r.length; c++) {
                var l = r[c];
                if (i(l)) return n ? {
                    inc: o,
                    word: a,
                    sep: s
                } : a;
                a += l;
            }
            return n ? {
                inc: o,
                word: a,
                sep: s
            } : a;
        }
        function c(e, t) {
            for (var n = e.substring(0, t), r = ""; i(n[n.length - 1]) && n.length > 0; ) n = n.substring(0, n.length - 1);
            for (t = n.length - 1; t >= 0; ) {
                var o = n[t];
                if (i(o)) return r;
                r = o + r, t--;
            }
            return r;
        }
        function l(e, t) {
            var n = t, r = e.substr(n, 2), o = e.substr(n - 1, 2);
            for (o && o.match(h) && (t--, n = t, r = e.substr(n, 2)); r && !r.match(h); ) n++, 
            r = e.substr(n, 2);
            var i = n + 2;
            for (n = t, r = e.substring(n - 2, n); r && n - 2 > 0 && !r.match(h); ) n--, r = e.substring(n - 2, n);
            var a = n;
            return a - 2 <= 0 && (a = 0), {
                s: a,
                e: i
            };
        }
        function u(e, t) {
            for (var n = 0, r = t; void 0 !== e[r] && !i(e[r]); ) r++, n++;
            return n;
        }
        function d(e, t) {
            for (var n = 0, r = t; void 0 !== e[r] && !i(e[r]); ) r--, n++;
            return n;
        }
        function f(e, t) {
            if (!e || e === t) return {
                x: 0,
                y: 0
            };
            var n = {
                x: e.offsetLeft,
                y: e.offsetTop
            }, r = f(e.offsetParent, t);
            return n.x += r.x, n.y += r.y, n;
        }
        function p(e) {
            if (!e) return 0;
            var t = e.replace(/[\W\d]/gi, " ").trim().replace(/\s+/gi, " ").split(" ");
            return 1 === t.length && "" === t[0] ? 0 : t.length;
        }
        function m(e, t) {
            2 === t.length && t.push(t[1]);
            var n = 2;
            return e % 10 === 1 && e % 100 !== 11 && (n = 0), e % 10 >= 2 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) && (n = 1), 
            t[n];
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n._f = function() {}, n.supportsPlaintextEditables = r, n.getSpaceConstant = o, 
        n.ALL_SPACE_RE = o(), n.SEPARATORS = ',.;:()§&$%!@#?*~+}{[]|/"`-<>…“”\n', n.QUOTE_RE = /["'”’‚‛‟„“]/g, 
        n.isSep = i, n.wordSeparated = a, n.getNextWord = s, n.getPrevWord = c;
        var h = /[!?.]\s|\n/g;
        n.getSentenceByPos = l, n.getNextSepOffset = u, n.getPrevSepOffset = d, n.getPos = f, 
        n.wordCount = p, n.declension = m;
    }, {} ],
    267: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/typeof"), i = r(o), a = e("babel-runtime/core-js/object/assign"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("lodash"), l = e("@grammarly-npm/wrap"), u = e("@grammarly-npm/under"), d = e("./match-extensions"), f = e("./text-api"), p = e("./synonyms"), m = e("./track"), h = e("./editor-util");
        n.GrammarlyEditor = function(e) {
            function t() {
                N.inputListener.start(), N.dom.start(), e.value && N.setText(e.value), e.matches && N.addMatches(e.matches), 
                N.api.update(N.currentText), N.check();
            }
            function n(e) {
                var t = "object" === ("undefined" == typeof e ? "undefined" : (0, i["default"])(e)) && e.id ? e.id : e, n = N.bySid(t.toString());
                if (N._removedByServer.push(t), I.rmMatchesBufferCache(t), n && (N.emit("serverRemove", n), 
                n.cancelServerRemove)) return void delete n.cancelServerRemove;
                if (n) return I.forceRemove(n);
                var r = N.matches.getRemoved()[t];
                r && (S && console.log("remove-already-removed-match"), I.forceRemove(r));
            }
            function r(e) {
                return P(e);
            }
            function o(e) {
                return e.tagName && R.indexOf(e.tagName.toLowerCase()) === -1 && "gmail_quote" !== e.className;
            }
            function a(e, t, n) {
                return "tmp_id" === n.id.toString() || (!!n.syn || t);
            }
            function g(e) {
                var t = {
                    matches: N.serializeMatches(N.matches.get(), !0),
                    editorId: N.id,
                    cursor: N.latestCursor,
                    socketId: N.api.ws.socketId,
                    api: N.api.getState(),
                    selectedMatchId: N.selectedMatch && N.selectedMatch.id
                };
                return N.getHtml && !e ? (0, s["default"])({}, t, {
                    html: N.getHtml(),
                    whiteSpace: N.el.__white_space
                }) : (0, s["default"])({}, t, {
                    text: N.getText(!0)
                });
            }
            function b(e) {
                N.clearData(), e.html && (N.el.__white_space = N.el.style.whiteSpace = e.whiteSpace || "normal"), 
                N.one("afterReplace", function() {
                    N.api.setState(e.api), N.addMatches(e.matches), e.cursor || (e.cursor = {
                        s: 0,
                        e: 0
                    }), N.isHtmlGhost || N.el.focus();
                    var t = N.getMatches().filter(function(e) {
                        return e.syn;
                    }).length > 0;
                    t && N.synonyms.registerRemove(), N.setCursor(e.cursor), N.latestCursor = e.cursor, 
                    N.render();
                }), void 0 !== e.html ? N.setHtml(e.html) : N.setText(e.text);
            }
            function v() {
                T.checkPlagiarism(N.currentText);
            }
            function _(e) {
                T.synonyms(e);
            }
            function y() {
                A.plagiarismActive() && j();
            }
            function w() {
                B();
            }
            function k() {
                if (N.getText) {
                    var e = N.getText(), t = h.wordCount(e), n = t > 0 ? N.getFiltered().length / t : 0;
                    N.emit("track", {
                        type: "timing",
                        data: {
                            "performance:text_stats.error_rate": Math.round(1e3 * n) / 1e3,
                            "performance:text_stats.text_size_chars": e.length,
                            "performance:text_stats.text_size_words": t
                        }
                    });
                }
            }
            function C() {
                for (var e = N.el.querySelectorAll(".gr-alert"), t = e.length, n = 0; n < t; n++) {
                    var r = e[n], o = r.nextSibling;
                    o && 3 === o.nodeType && (r.__sentCorruptedUnderline || u.Util.hasClass(r, "Punctuation") || o.textContent[0].match(/\w/) && (N.emit("corruptedUnderline", {
                        text: r.textContent,
                        id: r.id,
                        className: r.className,
                        siblingText: o.textContent.substring(0, 20)
                    }), r.__sentCorruptedUnderline = !0));
                }
                F = setTimeout(C, 5e3);
            }
            function x() {
                N.synonyms.fieldEnable();
            }
            function E() {
                N.api.close(), N.synonyms.disable(), clearTimeout(F);
            }
            var S = !e.silentLogs, T = f.TextApi(e), N = u.Editor((0, s["default"])({}, e, {
                api: T,
                isValidNode: o,
                isValidMatchForNode: a,
                editorType: e.editorType.value
            }));
            N.matchPrefix = e.matchPrefix;
            var P = e.filter || function(e) {
                return e;
            }, A = e.apps || {
                plagiarismActive: function() {
                    return !1;
                }
            }, j = c.throttle(v, e.plagiarismCheckDelay || 2e3), I = N.matches, L = d.MatchExtensions({
                silentLogs: e.silentLogs,
                editor: N,
                matches: I,
                exposeRawMatch: e.exposeRawMatch
            }), M = "textarea" === e.editorType.value, R = [ "pre", "code", "blockquote" ], O = [ "gmail_quote" ], D = l;
            D.skipTag(c.union(D.skipTag(), R)), D.skipClass(c.union(D.skipClass(), O)), c.extend(N, {
                checkPlagiarism: v,
                getSynonyms: _,
                filter: P,
                apps: A,
                matchFilter: r,
                synonyms: p.Synonyms({
                    editor: N,
                    canRemove: e.canRemoveSynonym,
                    textareaWrapSelector: e.textareaWrapSelector,
                    animatorContainer: e.animatorContainer,
                    getAnimatorElPos: e.getAnimatorElPos,
                    exposeSynApi: e.exposeSynApi
                }),
                getState: g,
                setState: b,
                run: t,
                ot_alert_intersection: 0,
                isTextarea: M
            }, L), N.on("change", y), N.on("input", w), N.on("keydown", w), N.on("exit", E), 
            N.on("fieldEnable", x), N.on("startInvalidateNode", T.wsPause), N.on("endInvalidateNode", T.wsPlay), 
            T.delegate(N, "plagiarismChecked"), T.delegate(N, "capiError"), T.delegate(N, "serviceState"), 
            T.delegate(N, "socketConnect"), T.delegate(N, "socketStart"), T.delegate(N, "socketReconnect"), 
            T.delegate(N, "socketReconnectAfterError"), T.delegate(N, "socketFailCount"), T.delegate(N, "disconnect"), 
            T.delegate(N, "socketError"), T.delegate(N, "frequent_runtime_error"), T.delegate(N, "too_many_runtime_error"), 
            T.delegate(N, "frequent_not_authorized_error"), T.delegate(N, "finished"), T.on("remove", n), 
            m.track(N), D.error = function(e) {
                N.emit("track", {
                    type: "increment",
                    key: "wrap_error." + e
                });
            };
            var F = void 0;
            M || C();
            var B = c.debounce(k, 5e3);
            e.autorun && t();
            var U = N.api.feedback;
            return N.api.feedback = function(e, t) {
                U(e, t);
            }, N;
        }, n.getUpgradeUrlFromMatches = function(e) {
            function t(e) {
                var t = "";
                return c.each(e, function(e, n) {
                    "" !== t && (t += "&"), t += encodeURI(String(n)) + "=" + e;
                }), t;
            }
            function n(e) {
                var t = r(e), n = {};
                return c.each(t, function(e) {
                    var t = e.group, r = e.category.replace("_", ""), o = [ t, r ].join(":");
                    void 0 === n[o] && (n[o] = 0), n[o] += 1;
                }), n;
            }
            function r(e) {
                return c.filter(e, function(e) {
                    return e.hidden;
                });
            }
            var o = n(e.matches), i = e.returnUrl, a = e.queryParams || {}, s = {}, l = {};
            return i && (s.return_url = encodeURIComponent(i)), e.appType && (s.app_type = e.appType), 
            l = c.extend(o, s, a), e.baseUrl + "?" + t(l);
        };
    }, {
        "./editor-util": 266,
        "./match-extensions": 268,
        "./synonyms": 271,
        "./text-api": 272,
        "./track": 273,
        "@grammarly-npm/under": 26,
        "@grammarly-npm/wrap": 30,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/typeof": 54,
        lodash: "lodash"
    } ],
    268: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/json/stringify"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("lodash"), s = e("./editor-util"), c = e("./match-transformer");
        n.MatchExtensions = function(e) {
            function t(e, t) {
                var n = e.syn ? " gr-syn" : " gr-alert";
                return e._e - e._s === 1 && "a" !== t.substring(e._s, e._e).toLowerCase() && (n += " gr_tiny"), 
                e.selected && (n += " sel"), n += e.gramm ? " gr_gramm" : " gr_spell", e.replaced && (n += " gr_replaced"), 
                e.notClickableTitle && "ContextualSpelling" !== e.group && (n += " gr_hide"), e.free || (n += " gr_premium"), 
                n;
            }
            function n(e, t) {
                if (e.skipUpdatePos = "Plagiarism" === e.category || "syn" === e.type, c.processMatch(e, t, {
                    exposeRawMatch: P
                }), "syn" === e.type) return N.emit("syn", e), !0;
            }
            function r(e) {
                return a.find(T.get(), {
                    sid: e
                });
            }
            function o(e, t) {
                for (var n = [], r = 0; r < e.length; r++) {
                    var o = e[r];
                    "ContextualSpelling" === o.group && n.push(s.getSentenceByPos(t, o.s));
                }
                return e.filter(function(e) {
                    if ("ContextualSpelling" === e.group || "Plagiarism" === e.group || e.syn) return !0;
                    for (var t = 0; t < n.length; t++) {
                        var r = n[t];
                        if (e.s > r.s && e.s < r.e) return !1;
                    }
                    return !0;
                });
            }
            function l(e) {
                var t = T.get();
                if ("Plagiarism" !== e.category) {
                    for (var n = 0; n < t.length; n++) {
                        var r = t[n];
                        if (r.category === e.category && "Plagiarism" !== r.category) {
                            var o = T.isIntersected(e, r) && v(e, r);
                            if (o) return r;
                        }
                    }
                    return !1;
                }
            }
            function u(e) {
                function t(e, t) {
                    return e.s === t.s && e.e === t.e || (e.s === t.s || e.e === t.e) && e.value.replace(/\s+/g, "") === t.value.replace(/\s+/g, "");
                }
                var n = T.get();
                if ("Plagiarism" !== e.category) for (var r = 0; r < n.length; r++) {
                    var o = n[r];
                    if (t(e, o)) {
                        if (e.priority < o.priority) return -1;
                        if (e.priority > o.priority) return r;
                    }
                }
            }
            function d(e, t) {
                var n = T.get(), r = u(e);
                if (r === -1) return void (S && console.log("%c skip adding match with lower priority", "color:rgba(239, 110, 105, 0.8)", e.value, e));
                r && r > -1 && (S && console.log("%c remove same match with lower priority", "color:rgba(239, 110, 105, 0.8)", n[r].value, n[r]), 
                n.splice(r, 1));
                var o = l(e);
                if (o) return S && console.log("%c remove, match of same category is overlaping with", "color:rgba(239, 110, 105, 0.8)", e.value, o), 
                void T.matchUpdater.extendWithoutAdding(n, e);
                var i = e.v.indexOf(" ") !== -1, c = e.v.indexOf("'") !== -1 || e.v.indexOf("’") !== -1, d = ",," === e.v || ".." === e.v;
                if (!(a.isUndefined(e.rFirst) || s.wordSeparated(t, e.s, e.e) || i || s.isSep(e.v.trim()) || c || d)) return S && console.log("%c match is part of word '%s'", "color:rgba(239, 110, 105, 0.8)", e.value, e), 
                void T.emit("match_is_part_of_word");
                if ("IgnoredPatterns" === e.category || "IgnoredWords" === e.category) return void (S && console.log("%c remove ignored", "color:rgba(239, 110, 105, 0.8)", e));
                var p = t.substring(e.s, e.e);
                if (e.todo.indexOf("add a comma") !== -1 && ("," === t.substring(e.e, e.e + 1) || "," === p[p.length - 1])) return e.removed = !0, 
                void (S && console.log("%c lost add a comma match, comma is here", "color:rgba(239, 110, 105, 0.8)", e));
                if (e.todo.indexOf("add an article") !== -1 && (" an" === p || " the" === p || " a" === p)) return void (S && console.log("%c lost add an article match", "color:rgba(239, 110, 105, 0.8)", e));
                var m = s.getPrevWord(t, e.s) + " " + e.value, h = m === e.rFirst || m === e.secondArticle;
                if (h) return void (S && console.log("%c lost add an article match, article already fixed", "color:rgba(239, 110, 105, 0.8)", e));
                if (f(e)) return void (S && console.log("skip AccidentallyConfused match see https://grammarly.atlassian.net/browse/FT-1172"));
                var g = T.tryToAdd(e, t);
                return !!g || void 0;
            }
            function f(e) {
                for (var t = T.get(), n = 0; n < t.length; n++) {
                    var r = t[n];
                    if (e.s === r.s && e.e === r.e && "AccidentallyConfused" === e.category && ("CommonlyConfused" === r.category || "Misspelled" === r.category)) return !0;
                }
                return !1;
            }
            function p(e, t, n, r) {
                var o = e.value, i = !s.wordSeparated(t, n, r), a = " " === o[0] && " " === o[o.length - 1], c = o.indexOf(",") !== -1, l = o.indexOf(";") !== -1, u = A.indexOf(o) !== -1, d = e.rFirst === t.substring(n, r + 1), f = s.getPrevWord(t, n) + " " + o, p = f === e.rFirst || f === e.secondArticle, m = "ArticleUse" === e.category && e.todo.indexOf("change") !== -1 && e.next !== s.getNextWord(t, r), h = "Plagiarism" === e.category, g = "ClosingPunctuation" === e.category;
                return i && !a && !c && !u && !l && !g && !h || d || p || m;
            }
            function m(e) {
                var t = N.getText(), n = T.tryToAdd(e, t, t);
                n && (N.addMethodsToMatch(e), N.saveCursor(), N.render(), N.restoreCursor(), N.emit("addedSynonym", e));
            }
            function h() {
                N.saveCursor(), T.get().forEach(function(e) {
                    e.syn && N.emit("removeSyn", e);
                }), g(), N.dom.removeBySelector(".gr-syn"), N.restoreCursor();
            }
            function g() {
                for (var e = T.get(), t = 0; t < e.length; t++) e[t].deselect(), e[t].syn && (T.remove(e[t]), 
                t--);
            }
            function b(e, t, n) {
                e.syn && (N.latestCursor.s = N.latestCursor.e = N.latestCursor.s - t + n.length);
            }
            function v(e, t) {
                return e.rFirst === t.rFirst && (0, i["default"])(e.r) === (0, i["default"])(t.r);
            }
            function _(e, t, n) {
                if (!e.syn && !t.syn) return n && e.v.toLowerCase() === t.v.toLowerCase() && e.category === t.category && v(e, t);
            }
            function y(e, t) {
                e.sid = t.id, e.sentence_no = t.sentence_no, e.header = t.header, e.cls = t.cls, 
                e.details = t.details, e.explanation = t.explanation, e.todo = t.todo, e.notClickableTitle = t.notClickableTitle, 
                e.showTitle = t.showTitle, S && console.log("updated match with server id", e);
            }
            function w(e) {
                return !e.syn;
            }
            function k(e) {
                return "Plagiarism" === e.category ? {
                    next: !0
                } : {
                    remove: !1
                };
            }
            function C(e, t) {
                I(e, t), delete e.selected, e.serverRemove || T.addRemoved(e);
            }
            function x(e) {
                return e.addedToDict || e.ignored || e.serverRemove;
            }
            function E(e, t) {
                return e = e || T.get(), e = e.filter(function(e) {
                    return !e.replaced;
                }), t || (e = e.filter(function(e) {
                    return !e.syn;
                })), e = e.map(function(e) {
                    var t = {}, n = e;
                    for (var r in e) ("r" === r || "origReplacements" === r || "rHtml" === r || "examples" === r || "references" === r || "syn" === r || "synonyms" === r || "transforms" === r || "rawMatch" === r || !a.isFunction(n[r]) && !a.isObject(n[r]) && "selected" !== r && "inDom" !== r || a.isArray(n[r]) || "header" === r) && (t[r] = n[r]);
                    return t;
                });
            }
            var S = !e.silentLogs, T = e.matches, N = e.editor, P = e.exposeRawMatch, A = a.map(",.;:", function(e) {
                return e + " ";
            }), j = {
                getMatchClass: t,
                processMatch: n,
                beforeReplace: b,
                processRemove: k,
                matchRemoved: p,
                matchesEqual: _,
                extendMatch: y,
                canAddRemovedMatch: x,
                canShiftMatchEnd: w,
                removeSyn: h,
                tryToAdd: d,
                serializeMatches: E,
                addSyn: m,
                filterBySpelling: o,
                bySid: r
            }, I = T.remove;
            return T.remove = C, j;
        };
    }, {
        "./editor-util": 266,
        "./match-transformer": 269,
        "babel-runtime/core-js/json/stringify": 34,
        lodash: "lodash"
    } ],
    269: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = /^(?:(.*): ){1}(.+)$/, n = [];
            if (!e) return [];
            for (var r = P.createEl("<div>" + e + "</div>", document), o = r.querySelectorAll("p"), i = 0; i < o.length; i++) {
                for (var a = o[i].querySelectorAll("span"), s = [], c = 0; c < a.length; c++) {
                    var l = a[c], u = l.innerHTML, d = "Comment", f = l.classList[0] || "grey", p = u.match(t);
                    p && (u = p[2], d = p[1]), s.push({
                        type: d,
                        color: f,
                        example: u
                    });
                }
                s.length && n.push(s);
            }
            return n;
        }
        function i(e) {
            var t = e.split(/\n|<br\/?>/gi);
            t.splice(0, 4);
            for (var n = [], r = 0; r < t.length; r++) {
                var o = t[r], i = o.match(/<strong>(.*?)\:<\/strong>(.*?)$/i), a = void 0, s = void 0;
                i && (a = i[1], s = i[2].replace("_br", "")), n.push({
                    type: a,
                    descr: s
                });
            }
            return n;
        }
        function a(e) {
            return e.details || "";
        }
        function s(e) {
            return e.explanation && e.explanation.replace(/<\/?p[^>]*>/g, "").trim();
        }
        function c(e) {
            "Plagiarism" === e.category && (e.references = i(e.details), e.explanation = "A part of your paper is matching some text from the Web. Please make sure that this text is properly referenced.", 
            e.header = "Unoriginal text: " + N.wordCount(e.text) + " words", e.href = e.extra_properties.url || "", 
            e.href_title = (e.extra_properties.url || "").replace("https://", "").replace("http://", ""));
        }
        function l(e, t) {
            var n = "", r = !1;
            if (e && 0 !== e.length) {
                t.onlyDel = !0;
                for (var o = 0; o < e.length; o++) {
                    var i = e[o], a = e[o + 1] && e[o + 1].ins, s = e[o + 1] && e[o + 1].del;
                    if (E.isUndefined(i.sep)) {
                        var c = void 0;
                        if (i.ins) {
                            t.onlyDel = !1, r && (n += "<span class='arr'> → </span>");
                            var l = "";
                            ".,:;_".indexOf(i.ins) !== -1 && (l = "thin"), c = i.ins, r && (c = T.differ(r, i.ins), 
                            t.del = r, r = null), n += "<span class='ins " + l + "'>" + c + "</span>";
                        }
                        if (i.del) {
                            if (i.del.length > 1) {
                                c = i.del, a && (c = T.differ(a, i.del));
                                var u = "del ";
                                i.del.match(/["'”][.,;]/) && (u += "del-qdot "), i.del.match(/,,/) && (u = "red sign double-commas");
                                var d = i.del.replace(/,/g, "").split(" ").filter(Boolean) || [];
                                if (i.del.match(/^,(.*?),$/) && i.del.length > 2 && d.length > 1) {
                                    u = "red";
                                    var f = "<span class='sign " + u + "'>,</span>";
                                    n = "<span class='" + u + "'>" + (f + d.shift()) + "..." + (d.pop() + f) + "</span>", 
                                    t.onlyDel = !1;
                                    break;
                                }
                                n += "<span class='" + u + "'>" + c + "</span>";
                            } else {
                                var p = i.del.match(/[a-z]/i) ? " del del-letter" : " sign";
                                "’" === i.del && (p += " apostrophe"), n += "<span class='red" + p + "'>" + i.del + "</span>";
                            }
                            r = i.del;
                        }
                        var m = i.w;
                        if (m) {
                            var h = "word";
                            s && (h += " del-word"), a && (h += " ins-word"), m = "<span class='" + h + "'>" + m + "</span>";
                        }
                        m && (n += m);
                    } else n += "<span class='arr'> → </span>", r = null;
                }
                return n;
            }
        }
        function u(e, t) {
            if (t) {
                var n = E.template("<span class='replacement'><span class='btn-r' data-value='<%- r %>'><%= title %></span></span>"), r = "";
                return 2 === t.length && t[0].del && t[1].ins && (r = E.template("<span><span class='ins sec'><%= ins %></span></span>")({
                    ins: t[1].ins
                })), 3 === t.length && t[0].del && t[2].ins && (r = E.template("<span><span class='ins sec'><%= ins %></span></span>")({
                    ins: t[2].ins
                })), t[0].w && (r = E.template("<span><%= w %><span class='ins sec'><%= ins %></span></span>")({
                    w: t[0].w,
                    ins: t[1].ins
                })), t[0].ins && (r = E.template("<span><span class='ins sec'><%= ins %></span><%= w %></span>")({
                    ins: t[0].ins,
                    w: t[1].w
                })), n({
                    r: e,
                    title: r
                });
            }
        }
        function d(e, t) {
            var n = [], r = m(e[0]);
            r || (t.cls += " replaceWithoutSep");
            for (var o = 1; o < e.length; o++) {
                var i = f(e[o], r);
                n.push({
                    label: l(i, t) || t.origReplacements[o],
                    value: t.origReplacements[o]
                });
            }
            return n;
        }
        function f(e, t) {
            var n = [], r = !1, o = !1;
            return n = e.filter(function(e) {
                return t ? r ? e : (e.del && (o = !0), void ((e.sep || o && e.ins) && (r = !0))) : e;
            });
        }
        function p(e, t) {
            for (var n = "", r = E.template("<span class='replacement replacement-<%= index %>'><span class='btn-r' data-value='<%- r %>'><span><%= parts %></span></span></span>"), o = [], i = [], a = !1, s = !1, c = void 0, u = 0; u < e[0].length; u++) {
                var d = e[0][u];
                if (i.push(d), d.ins && (s = !0), d.sep || c && d.ins) {
                    a = !0;
                    break;
                }
                d.del && (c = !0);
            }
            var p = 0;
            n = l(i, t) || "", a || (p++, n = r({
                r: t.origReplacements[0],
                parts: l(i, t),
                index: 0
            })), a && s && p++;
            var m = e[0] && e[0][1] && e[0][1].del;
            if (m && m.match(/^,(.*?),$/) && m.length > 2) return n;
            for (var h = p; h < e.length; h++) {
                var g = f(e[h], a);
                o.push(r({
                    r: t.origReplacements[h],
                    parts: l(g, t) || t.origReplacements[h],
                    index: h
                }));
            }
            return n + o.join("");
        }
        function m(e) {
            if (!e) return !1;
            for (var t = !1, n = 0; n < e.length; n++) {
                if (e[n].sep || e[n].ins && t) return !0;
                e[n].del && (t = !0);
            }
            return !1;
        }
        function h(e, t) {
            if ((e.length > 2 || m(e[0]) || t.longTitle) && "Articles" !== t.category && !t.showTitle) return t.cls += " multiReplace", 
            m(e[0]) || (t.cls += " replaceWithoutSep"), t.multiReplace = !0, p(e, t);
            if (1 === e.length || t.showTitle) return l(e[0], t);
            if (2 === e.length || "Articles" === t.category || "Determiners" === t.category) {
                t.cls += " doubleReplace", t.doubleReplace = !0;
                var n = u(t.rFirst, e[0]);
                return (n || "") + u(t.r[0], e[1]);
            }
            return "";
        }
        function g(e) {
            for (var t = e.del, n = 0; n < e.r.length; n++) {
                var r = e.r[n];
                e.r[n] = T.differ(t, r);
            }
        }
        function b(e) {
            e = e.replace("→", "<span class='sep'></span>");
            for (var t = P.createEl("<div>" + e + "</div>"), n = [], r = 0; r < t.childNodes.length; r++) {
                var o = t.childNodes[r];
                3 !== o.nodeType ? (o.classList.contains("sep") && n.push({
                    sep: !0
                }), o.classList.contains("gr_grammar_ins") && n.push({
                    ins: o.innerHTML
                }), o.classList.contains("gr_grammar_del") && n.push({
                    del: o.innerHTML
                })) : n.push({
                    w: o.nodeValue
                });
            }
            return n;
        }
        function v(e) {
            if (e.notClickableTitle && !e.showTitle) return [];
            if (!e.transforms) return [];
            var t = e.transforms;
            return t.map(function(e) {
                return b(e);
            });
        }
        function _(e) {
            var t = e.title, n = e.transforms;
            if (n && n[0] && 2 === n[0].length) {
                var r = n[0];
                (r[0].w && r[1].ins || r[1].w && r[0].ins) && (e.cls += " only-ins"), (r[0].w && r[1].del || r[1].w && r[0].del) && (e.cls += " only-del"), 
                (r[0].ins && r[1].del || r[1].ins && r[0].del) && (e.cls += " ins-del");
            }
            if (n && n[0]) {
                var o = n[0].reduce(function(e, t) {
                    var n = t[(0, x["default"])(t).shift()].toString() || "";
                    return Math.max(e, n.length);
                }, 0);
                o > 20 && (e.notClickableTitle = !0, e.longTitle = !0, e.replacementHint = k("Click to " + e.todo), 
                n = n.map(function(e) {
                    return e.filter(function(e) {
                        return e.ins;
                    });
                }));
            }
            return t = h(n, e), n.length && (e.rHtml = d(n, e)), t || (t = e.v), e.replaceInCard && (e.replaceInCard = t), 
            e.notClickableTitle && (t = e.title), t;
        }
        function y(e) {
            delete e.text, delete e.rid, delete e.action, delete e.undone;
        }
        function w(e, t, n) {
            n && n.exposeRawMatch && (e.rawMatch = E.cloneDeep(e)), e.id = (e.id || A()).toString(), 
            e.s = e.begin, e.e = e.end, e._s = e.s, e._e = e.e, "Plagiarism" === e.group && (e.highlightBegin = e.s, 
            e.highlightEnd = e.e), void 0 !== e.highlightBegin && void 0 !== e.highlightEnd && e.highlightBegin === e.highlightEnd && e.text.length > 0 && (e.highlightBegin = e.s, 
            e.highlightEnd = e.e), void 0 !== e.highlightBegin && (e._s = e.highlightBegin), 
            void 0 !== e.highlightEnd && (e._e = e.highlightEnd), e.sd = e._s - e.s, e.ed = e._e - e.e, 
            e._value = t.substring(e._s, e._e), "Spelling" === e.group && (e.group = "ContextualSpelling");
            var r = e.extra_properties && "true" === e.extra_properties.enhancement;
            e.cls = e.group, e.origReplacements = (e.replacements || []).concat(), e.rFirst = e.replacements && !r && e.replacements.splice(0, 1)[0], 
            e.rFirst = e.rFirst && e.rFirst.replace(/\s+/g, " "), e.noReplacments = e.rFirst === !1 || void 0 === e.rFirst, 
            e.showTitle = e.noReplacments || e.extra_properties && "true" === e.extra_properties.show_title, 
            e.replaceInCard = !e.noReplacments && e.extra_properties && "true" === e.extra_properties.show_title, 
            e.didYouMean = !e.noReplacments && e.extra_properties && "true" === e.extra_properties.did_you_mean, 
            e.enhancement = e.replacements && e.replacements.length && r, e.notClickableTitle = e.noReplacments || e.showTitle || e.didYouMean, 
            e.priority = parseInt(String(e.extra_properties && e.extra_properties.priority || 0), 10), 
            e.r = e.replacements || [], e.rHtml = e.rHtml || [], e.v = e.text, e.oldVal = e.v, 
            e.sid = e.id, e.originalTransforms = e.transforms || [], e.transforms = v(e), e.header = _(e), 
            e.details = a(e), e.originalTodo = e.todo || "", e.originalExamples = e.examples || "", 
            e.examples = o(e.originalExamples), e.explanation = s(e), c(e), e.l = e.e - e.s, 
            e.multi = e.r.length > 0, e.spell = "ContextualSpelling" === e.group, e.gramm = !e.spell, 
            e.showAcceptButton = "ContextualSpelling" !== e.group && e.noReplacments && (e.replacements || []).length < 1, 
            e.showReplacements = Boolean("Misspelled" === e.category && e.r.length), e.showAddToDictionary = Boolean(e.spell && "General" === e.point && ("Misspelled" === e.category || "Unknown" === e.category)), 
            e.showReplacementsInText = !0, e.multiReplace && (e.showReplacements = !0, e.showReplacementsInText = !1, 
            e.showReplacementsOnTop = !0), e.cls && e.cls.indexOf("doubleReplace") !== -1 && (e.showReplacements = !1, 
            e.showReplacementsInText = !1), (e.showTitle || e.longTitle) && (e.showReplacements = !1, 
            e.showReplacementsOnTop = !1, e.showReplacementsInText = !1), e.showReplacements && e.del && g(e), 
            e.enhancement && (e.category = "_" + e.category, e.title = N.declension(e.r.length, [ "Suggested enhancement:", "Suggested enhancements:" ])), 
            "spelling" === e.todo && (e.todo = "correct"), ("" === e.todo && !e.rFirst || "Plagiarism" === e.category || e.notClickableTitle) && (e.todo = "expand card"), 
            "" === e.todo && e.rFirst && (e.todo = "correct"), e.value = e.v, e.todo = k("Click to " + e.todo), 
            y(e);
        }
        function k(e) {
            var t = document.createElement("div");
            return t.innerHTML = e, t.textContent;
        }
        var C = e("babel-runtime/core-js/object/keys"), x = r(C);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var E = e("lodash"), S = e("@grammarly-npm/under"), T = e("./differ"), N = e("./editor-util"), P = S.Util, A = P.guid;
        n.examples = o, n.header = _, n.processMatch = w;
    }, {
        "./differ": 265,
        "./editor-util": 266,
        "@grammarly-npm/under": 26,
        "babel-runtime/core-js/object/keys": 41,
        lodash: "lodash"
    } ],
    270: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("@grammarly-npm/under");
        n.SelectionAnimator = function(e) {
            function t(t, r) {
                if (n(), 0 !== t.length) {
                    var o = t[0], u = void 0;
                    if (l = t[t.length - 1] || o, c = "g-selection-anim " + e.editor.matchPrefix, s = o.ownerDocument.createElement("div"), 
                    s.className = c, e.getAnimatorElPos) u = e.getAnimatorElPos(o); else if (r) {
                        var d = o.ownerDocument.querySelector(r);
                        if (d) {
                            var f = o.getBoundingClientRect(), p = l.getBoundingClientRect(), m = d.getBoundingClientRect();
                            u = {
                                left: f.left - m.left,
                                right: p.right - m.right,
                                top: f.top - m.top,
                                bottom: f.bottom - m.bottom,
                                width: p.right - f.left,
                                height: f.height
                            };
                        }
                    } else u = t[0].getBoundingClientRect();
                    if (u) {
                        a(s, {
                            top: u.top + u.height,
                            left: u.left,
                            width: 0
                        });
                        var h = Math.ceil(u.width / 8), g = u.width - h;
                        s.setAttribute("data-width", String(e.editor.matchPrefix ? Math.ceil(u.width) : u.width)), 
                        e.animatorContainer.appendChild(s), setTimeout(function() {
                            s.style.width = g + "px";
                        }, 10);
                    }
                    i.el = s;
                }
            }
            function n() {
                for (var t = e.animatorContainer ? e.animatorContainer.ownerDocument : document, n = t.querySelectorAll(".g-selection-anim"), r = n.length, o = 0; o < r; o++) {
                    var i = n[o];
                    i.parentNode && i.parentNode.removeChild(n[o]);
                }
            }
            function o() {
                if (s) return s.getAttribute("data-width") ? void a(s, {
                    webkitTransitionDuration: "0.2s",
                    MozTransitionDuration: "0.2s",
                    transitionDuration: "0.2s",
                    width: parseInt(s.getAttribute("data-width"), 10)
                }) : n();
            }
            var i = {
                animate: t,
                remove: n,
                complete: o,
                el: document.documentElement
            }, a = r.Util.css, s = void 0, c = void 0, l = void 0;
            return i;
        };
    }, {
        "@grammarly-npm/under": 26
    } ],
    271: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./selection-animator"), o = e("@grammarly-npm/under"), i = e("@grammarly-npm/wrap"), a = e("emitter"), s = e("lodash");
        n.Synonyms = function(e) {
            function t() {
                x(b, "dblclick", u);
            }
            function n() {
                l(), E(b, "dblclick", u);
            }
            function c(e) {
                y.animate([ e.getEl() ], C), setTimeout(y.complete, 120);
            }
            function l() {
                y.remove();
            }
            function u(e) {
                g.selectedMatch && g.selectedMatch.deselect();
                var t = g.getSelection(), n = t.value;
                if (/^\s?[a-z']+\s?$/i.test(n) && !(n.length < 2)) {
                    if (!g.isTextarea) {
                        for (var r = g.el.ownerDocument.getSelection().anchorNode || e.target.parentNode, o = h.skipClass(), i = h.skipTag(), a = 0; a < o.length; a++) i.push("." + o[a]);
                        if (r.tagName || (r = r.parentNode), k(r, i.join(","))) return;
                    }
                    g.getSynonyms(t.s), f(t), d();
                }
            }
            function d() {
                function t(n) {
                    n.isTrigger || 0 === n.clientX || e.canRemove(n.target) && (l(), E(_.body, "click", t), 
                    E(_.body, "input", t), E(_.body, "keydown", t), s.find(g.getMatches(), {
                        syn: !0
                    }) && (g.removeSyn(), g.emit("rendered")));
                }
                x(_.body, "click", t), x(_.body, "input", t), x(_.body, "keydown", t);
            }
            function f(e) {
                var t = e.s, n = e.e, r = e.value;
                r.indexOf(" ") === r.length - 1 && (n -= 1, r = e.text.substr(t, n - t)), S = e;
                var o = g.dom.renderRange({
                    s: t,
                    e: n
                });
                y.animate(o, C);
                for (var i = o.length, a = 0; a < i; a++) h.unwrap(o[a]);
                g.setCursor(e);
            }
            function p(e) {
                y.complete();
                var t = S.s, n = S.e, r = S.value;
                return g.getSelection().value !== r ? void console.log("selection changed") : (r.indexOf(" ") === r.length - 1 && (n -= 1, 
                r = S.text.substr(t, n - t)), e.error ? console.warn("Error occured: ", e.error) : (s.extend(e, {
                    app: "synonyms",
                    addReplace: !0,
                    cls: "Synonyms",
                    syn: !0,
                    expanded: !0,
                    begin: t,
                    end: n,
                    highlightBegin: t,
                    highlightEnd: n,
                    id: w(),
                    s: t,
                    e: n,
                    _s: t,
                    _e: n,
                    ed: 0,
                    sd: 0,
                    l: n - t,
                    auto: !1,
                    v: r,
                    serverRemove: !0,
                    value: r,
                    oldVal: r,
                    animEl: y.el,
                    todo: ""
                }), v && s.extend(e, {
                    removeUnderline: l
                }), g.removeSyn(), void g.addSyn(e)));
            }
            var m = o.Util, h = i, g = e.editor, b = e.editor.el, v = e.exposeSynApi, _ = b.ownerDocument, y = r.SelectionAnimator({
                editor: e.editor,
                getAnimatorElPos: e.getAnimatorElPos,
                animatorContainer: e.animatorContainer
            });
            e.canRemove = e.canRemove || function(e) {
                return !1;
            };
            var w = m.guid, k = m.matchesSelector, C = e.textareaWrapSelector || "#editor .svg-wrap", x = m.listen, E = m.unlisten;
            x(b, "dblclick", u);
            var S = void 0;
            g.on("syn", p);
            var T = a({
                completeAnimation: c,
                removeUnderline: l,
                registerRemove: d,
                disable: n,
                fieldEnable: t
            });
            return T;
        };
    }, {
        "./selection-animator": 270,
        "@grammarly-npm/under": 26,
        "@grammarly-npm/wrap": 30,
        emitter: "emitter",
        lodash: "lodash"
    } ],
    272: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/json/stringify"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("lodash"), s = e("@grammarly-npm/changesets"), c = e("./capi");
        n.TextApi = function(e) {
            function t(e) {
                if (e !== C.text) {
                    var t = s.diff(C.text, e);
                    C.text = e, t.length && C.changes.push(t);
                }
            }
            function n() {
                C.changes = [], C.text = "", C.sentRev = 0, k.rev = 0;
            }
            function r() {
                var e = C.text;
                n(), t(e), b();
            }
            function o() {
                return {
                    changes: C.changes.map(function(e) {
                        return e.pack();
                    }),
                    text: C.text,
                    sentRev: C.sentRev
                };
            }
            function l(e) {
                C.text = e.text, C.changes = e.changes.map(function(e) {
                    return s.unpack(e);
                }), C.sentRev = e.sentRev, k.rev = e.sentRev;
            }
            function u(e) {
                _ && console.log("MIDDLE LOG: finished: " + (0, i["default"])(e));
                var t = e.removed || [];
                t.forEach(function(e) {
                    return C.emit("remove", e);
                }), C.emit("finish", e);
            }
            function d(e) {
                for (var t = 0; t < e.length; t++) {
                    var n = e[t];
                    n.begin = n.s, n.end = n.e, n.highlightBegin = n._s, n.highlightEnd = n._e, p(n), 
                    n.s = n.begin, n.e = n.end, n._s = n.highlightBegin, n._e = n.highlightEnd;
                }
            }
            function f(e, t) {
                _ && console.log("MIDDLE LOG: received match: " + (0, i["default"])(t), e, C.changes.length), 
                p(t), t.type = e, C.emit("add", t);
            }
            function p(e) {
                for (var t = e.begin, n = e.rev + 1; n < C.changes.length; n++) m(C.changes[n], e);
                e.rev = C.changes.length - 1, e.begin !== t && _ && console.log("DIFF", e), e.begin > C.text.length && (_ && console.log("match offset error", e), 
                C.emit("match-has-wrong-revision", e));
            }
            function m(e, t) {
                e.sequencify().forEach(function(e) {
                    h(e, t, "begin", "end"), h(e, t, "highlightBegin", "highlightEnd");
                });
            }
            function h(e, t, n, r) {
                e.pos + e.len >= t[n] && e.pos + e.len < t[r] && C.emit("ot_alert_intersection"), 
                "+" === e.type ? (t[n] < 0 || e.pos <= t[n]) && (t[n] += e.len, t[r] += e.len) : "-" === e.type && e.pos < t[n] && (t[n] -= e.len, 
                t[r] -= e.len);
            }
            function g(e) {
                C.emit("sending"), k.plagiarism(e, function() {
                    return C.emit("plagiarismChecked");
                });
            }
            function b() {
                var t = C.changes.slice(C.sentRev).map(function(e) {
                    return e.pack();
                });
                if (t.length) {
                    C.emit("sending");
                    var n = {};
                    e.extendParams && e.extendParams(n), k.submitOt(t, C.changes.length - 1, n, u), 
                    C.sentRev = C.changes.length;
                }
            }
            function v() {
                w().then(function(e) {
                    k.sendContainerId(e);
                })["catch"](function(e) {
                    _ && console.error("Cannot send containerId", e);
                });
            }
            var _ = !e.silentLogs, y = e.capi || c.capi.createClient, w = e.getContainerId, k = y({
                sid: e.sid,
                docid: e.docid,
                createWs: e.createWs,
                url: e.capiUrl,
                dialect: e.dialect,
                silentLogs: e.silentLogs
            });
            k.on("alert", f.bind(null, "error")), k.on("synonyms", f.bind(null, "syn")), k.on("socketReconnect", r), 
            k.on("disconnect", n), k.on("socketStart", v);
            var C = a.extend({
                text: "",
                changes: [],
                sentRev: 0,
                send: b,
                update: t,
                updateMatchesToCurrentRevision: d,
                updateMatch: p,
                restart: r,
                reset: n,
                checkPlagiarism: g,
                getState: o,
                setState: l,
                onadd: f,
                onfinish: u
            }, k);
            return C;
        };
    }, {
        "./capi": 264,
        "@grammarly-npm/changesets": 1,
        "babel-runtime/core-js/json/stringify": 34,
        lodash: "lodash"
    } ],
    273: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/keys"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.track = function(e) {
            function t(e) {
                return e && c[e] && c[e].request ? Date.now() - c[e].request : 0;
            }
            function n(t) {
                var n = e.id + t.rev;
                l && console.log("SUBMIT_OT", n), c[n] = {
                    request: Date.now()
                };
            }
            function r(n) {
                var r = e.id + n.rev, o = r + n.id, i = t(r);
                l && console.log("GET_ALERT", i), c[o] = {
                    time: Date.now(),
                    type: "first"
                }, c[r] && (c[r].first ? (c[r].last = i, c[o].type = "last") : c[r].first = i);
            }
            function o(t) {
                var n = e.id + t.rev, r = c[n], o = 0 === t.rev ? "first." : "", i = {};
                r && r.first && (i["performance:checks." + o + "request_to_first_response"] = r.first, 
                r.last && (i["checks." + o + "request_to_last_response:performance"] = r.last), 
                e.emit("track", {
                    type: "timing",
                    data: i
                }), l && console.log("finish:", t.rev, e.id, i));
            }
            function a() {
                var t = e.getMatches().filter(function(t) {
                    return !t.tracked && t.renderTs && c[e.id + t.rev + t.id] && c[e.id + t.rev];
                }).reduce(function(t, n) {
                    var r = c[e.id + n.rev + n.id], o = r.type, i = n.renderTs - c[e.id + n.rev].request, a = 0 === n.rev ? "first." : "";
                    return n.tracked = !0, t["performance:checks." + a + "request_to_" + o + "_render"] = i, 
                    t["performance:checks." + a + "response_to_" + o + "_render"] = n.renderTs - r.time, 
                    t;
                }, {});
                (0, i["default"])(t).length && (e.emit("track", {
                    type: "timing",
                    data: t
                }), l && console.log("render times: ", t));
            }
            function s(t) {
                var n = !!t.renderTs;
                e.emit("track", {
                    type: "increment",
                    key: "performance:removed_checks.removed_alerts" + (n ? "_rendered" : "")
                }), l && console.log("match:", n, t.renderTs);
            }
            var c = {}, l = !1;
            e.id = e.id || "", e.on("rendered", function() {
                try {
                    a();
                } catch (e) {}
            }), e.api.on("submit_ot", n), e.api.on("finish", o), e.api.on("alert", r), e.api.on("ot_alert_intersection", function() {
                e.ot_alert_intersection++;
            }), e.api.on("stats:timing", function(t) {
                var n = {};
                n[t.key] = t.value, e.emit("track", {
                    type: "timing",
                    data: n
                });
            }), e.matches.on("remove", s), e.matches.on("lost_match_value_in_text", function() {
                e.emit("track", {
                    type: "increment",
                    key: "lost_match_value_in_text:old"
                });
            }), e.matches.on("match_is_part_of_word", function() {
                e.emit("track", {
                    type: "increment",
                    key: "match_is_part_of_word:old"
                });
            }), e.matches.on("remove", s);
        };
    }, {
        "babel-runtime/core-js/object/keys": 41
    } ],
    274: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            function n() {
                r(), u = setTimeout(m, s), d = setTimeout(m, 1e3 * c[0]), f = setTimeout(m, 1e3 * c[1]), 
                p = setTimeout(m, 1e3 * c[2]);
            }
            function r() {
                l = 0, u && clearTimeout(u), d && clearTimeout(d), f && clearTimeout(f), p && clearTimeout(p);
            }
            var s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : i, c = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : [ 30, 60, 120 ], l = 0, u = null, d = null, f = null, p = null, m = function h() {
                return l < a ? (s === i && e(), u = setTimeout(h, s), void l++) : (o.logger.infinityCheckResetFail(s), 
                void console.error("Infinity check reset fails, change to the offline state."));
            };
            return {
                start: n,
                finish: r
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./tracking"), i = 2e4, a = 3;
        n.infinityChecker = r;
    }, {
        "./tracking": 316
    } ],
    275: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("react");
        n.LogoIcon = function(e) {
            var t = e.className;
            return r.createElement("svg", {
                className: t,
                width: "18",
                height: "18",
                viewBox: "0 0 18 18"
            }, r.createElement("g", {
                transform: "translate(-7 -7)",
                fill: "none",
                fillRule: "evenodd"
            }, r.createElement("circle", {
                fill: "#00AE84",
                cx: "16",
                cy: "16",
                r: "9.008"
            }), r.createElement("path", {
                d: "M17.318 17.843c.052.297.335.504.64.504h.963l.56-.074c-.895 1.297-2.438 1.897-4.13 1.638-1.38-.214-2.566-1.14-3.065-2.437-1.134-2.942 1.03-5.75 3.84-5.75 1.468 0 2.75.852 3.49 1.882.193.304.58.385.864.185.267-.185.342-.533.178-.815-1.014-1.578-2.84-2.593-4.906-2.46-2.677.193-4.854 2.37-5.003 5.04-.18 3.103 2.295 5.637 5.382 5.637 1.618 0 3.065-.703 4.056-1.837l-.12.652v.585c0 .304.21.586.508.637.395.074.738-.23.738-.608v-3.52H17.93c-.38.008-.687.35-.612.74z",
                fill: "#FFF"
            })));
        }, n.IgnoreIcon = function(e) {
            var t = e.className;
            return r.createElement("span", {
                className: t,
                dangerouslySetInnerHTML: {
                    __html: '\n            <svg width="32" height="32" viewBox="0 0 32 32">\n              <defs>\n                <path d="M21,12.5 L21,20.1308289 C21,21.7154283 19.6513555,23 17.9996703,23 L14.0003297,23 C12.3432934,23 11,21.7124939 11,20.1308289 L11,12.5 L11,12.5" id="d70af4_ignoreIconUse"></path>\n                <mask data-mask-color="d70af4_ignoreIcon" id="d70af4_ignoreIconMask" x="-1" y="0" width="9.5" height="10.5">\n                  <use data-fix="d70af4_ignoreIcon" xlink:href="#d70af4_ignoreIconUse"/>\n                </mask>\n              </defs>\n              <g stroke="#D2D4DD" fill="none" fill-rule="evenodd">\n                <path d="M9 10.6h14" stroke-width="1.2"/>\n                <g stroke-width="1.2">\n                  <path d="M14.6 14v6M17.4 14v6"/>\n                </g>\n                <use mask="url(#d70af4_ignoreIconMask)" stroke-width="2.4" xlink:href="#d70af4_ignoreIconUse"/>\n                <path d="M18.5 11V9c0-1.1045695-.8982606-2-1.9979131-2h-1.0041738C14.3944962 7 13.5 7.8877296 13.5 9v2" stroke-width="1.2"/>\n              </g>\n            </svg>\n      '
                }
            });
        }, n.DictionaryIcon = function(e) {
            var t = e.className;
            return r.createElement("span", {
                className: t,
                dangerouslySetInnerHTML: {
                    __html: '\n        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n          <defs>\n            <mask id="57da07_dictionaryIconMask" x="0" y="0" width="10" height="15" fill="#fff">\n              <path id="57da07_dictionaryIconUse" d="M11 9h10v15l-4.8857422-4L11 24z"/>\n            </mask>\n          </defs>\n          <use mask="url(#57da07_dictionaryIconMask)" xlink:href="#57da07_dictionaryIconUse" stroke-width="2.4" stroke="#D2D4DD" fill="none"/>\n        </svg>\n      '
                }
            });
        }, n.DictionaryAddedIcon = function(e) {
            var t = e.className;
            return r.createElement("svg", {
                className: t,
                width: "15",
                height: "23",
                viewBox: "0 0 15 23"
            }, r.createElement("path", {
                d: "M14.773 22.573V.39h-14v22.183l7-5.326",
                fill: "#15C49A",
                fillRule: "evenodd"
            }));
        }, n.WikiIcon = function(e) {
            var t = e.className;
            return r.createElement("svg", {
                className: t,
                width: "32",
                height: "32",
                viewBox: "0 0 32 32"
            }, r.createElement("path", {
                d: "M13.633 21l2.198-4.264L17.64 21h.633l3.756-8.643c.21-.485.62-.776 1.057-.842V11H20.05v.515c.402.09.83.24 1.02.666l-2.758 6.363c-.5-1.06-1.01-2.22-1.498-3.375.504-1.07.915-2.064 1.533-3.04.36-.576.948-.59 1.25-.618V11h-3.23v.51c.404 0 1.242.037.868.822l-.936 1.97-.993-2.19c-.155-.342.145-.57.635-.596L15.938 11h-3.633v.51c.433.015 1.043.013 1.268.38.694 1.274 1.158 2.598 1.79 3.898l-1.636 3.06-2.75-6.323c-.31-.713.425-.943.903-1.002L11.874 11H8v.51c.535.178 1.225.974 1.418 1.376 1.447 3.027 2.176 5.057 3.557 8.114h.658z",
                fill: "#D2D4DD",
                fillRule: "evenodd"
            }));
        }, n.UndoIcon = function(e) {
            var t = e.className;
            return r.createElement("svg", {
                className: t,
                width: "32",
                height: "32",
                viewBox: "0 0 32 32"
            }, r.createElement("g", {
                stroke: "#D2D4DD",
                fill: "none",
                fillRule: "evenodd",
                strokeLinecap: "round"
            }, r.createElement("path", {
                d: "M11.518 8.412l-4.26 4.224L11.5 16.88"
            }), r.createElement("path", {
                d: "M16.192 22.236h4.23c2.642 0 4.784-2.147 4.784-4.783 0-2.642-2.15-4.784-4.787-4.784H8.1"
            })));
        };
    }, {
        react: "react"
    } ],
    276: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t, r, o, i, a) {
            switch (e.kind) {
              case "common":
                return y.createElement(j, {
                    model: e,
                    onIgnore: t,
                    onAddToDictionary: r,
                    onEditor: o,
                    onLogin: i,
                    isAddedToDictionary: a
                });

              case "synonyms":
                return y.createElement(n.CardSynonyms, {
                    model: e,
                    onEditor: o,
                    onLogin: i
                });

              default:
                ;
                return null;
            }
        }
        var i = e("babel-runtime/core-js/object/get-prototype-of"), a = r(i), s = e("babel-runtime/helpers/classCallCheck"), c = r(s), l = e("babel-runtime/helpers/createClass"), u = r(l), d = e("babel-runtime/helpers/possibleConstructorReturn"), f = r(d), p = e("babel-runtime/helpers/inherits"), m = r(p), h = e("babel-runtime/helpers/extends"), g = r(h);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var b = e("lib/config"), v = e("lib/message"), _ = e("lib/inline-cards/model/grammarly_editor_alert"), y = e("react"), w = e("./utils/react"), k = e("../dom"), C = e("../tracking"), x = e("./model/card"), E = e("./replacement"), S = e("./icons"), T = {
            container: "_c4f153-container",
            flip: "_c4f153-flip",
            flipSyn: "_c4f153-flipSyn",
            card: "_c4f153-card",
            bigTitle: "_c4f153-bigTitle",
            unknownWordTitle: "_c4f153-unknownWordTitle",
            btnDictLabelWithIcon: "_c4f153-btnDictLabelWithIcon",
            explanation: "_c4f153-explanation",
            replacement: "_c4f153-replacement",
            maxWidthReached: "_c4f153-maxWidthReached",
            item: "_c4f153-item",
            logoIcon: "_c4f153-logoIcon",
            ignoreIcon: "_c4f153-ignoreIcon",
            undoIcon: "_c4f153-undoIcon",
            dictionaryIcon: "_c4f153-dictionaryIcon",
            wikiIcon: "_c4f153-wikiIcon",
            footer: "_c4f153-footer",
            footerButton: "_c4f153-footerButton",
            btnIgnore: "_c4f153-btnIgnore",
            icon: "_c4f153-icon",
            btnLogo: "_c4f153-btnLogo",
            btnPersonalize: "_c4f153-btnPersonalize",
            personalizeMessage: "_c4f153-personalizeMessage",
            attn: "_c4f153-attn",
            cardAddedToDict: "_c4f153-cardAddedToDict",
            addedToDictTitle: "_c4f153-addedToDictTitle",
            dictionaryDescription: "_c4f153-dictionaryDescription",
            undo: "_c4f153-undo",
            dictLink: "_c4f153-dictLink",
            dictionaryAddedIcon: "_c4f153-dictionaryAddedIcon",
            synTitle: "_c4f153-synTitle",
            synList: "_c4f153-synList",
            synListSingle: "_c4f153-synListSingle",
            synListTitle: "_c4f153-synListTitle",
            synListNumber: "_c4f153-synListNumber",
            synSubitems: "_c4f153-synSubitems",
            synItem: "_c4f153-synItem",
            dict: "_c4f153-dict",
            dictContent: "_c4f153-dictContent",
            dictItemCounter: "_c4f153-dictItemCounter",
            dictItem: "_c4f153-dictItem",
            qualifier: "_c4f153-qualifier",
            dictFooterItem: "_c4f153-dictFooterItem",
            wikiLink: "_c4f153-wikiLink",
            wiki: "_c4f153-wiki",
            gr__tooltip_empty: "gr__tooltip_empty",
            gr__tooltip: "gr__tooltip",
            "gr-notfound-tooltip": "gr-notfound-tooltip",
            "gr__tooltip-content": "gr__tooltip-content",
            "gr__tooltip-logo": "gr__tooltip-logo",
            gr__flipped: "gr__flipped"
        }, N = function(e) {
            var t = e.title, n = e.className;
            return y.createElement("div", (0, g["default"])({
                className: n
            }, w.setInnerHTML(t.toLowerCase(), [ "i", "b" ])));
        }, P = function(e) {
            var t = e.title, n = e.explanation;
            return y.createElement("div", null, y.createElement(N, {
                className: T.bigTitle,
                title: t
            }), y.createElement("div", (0, g["default"])({
                className: T.explanation
            }, w.setInnerHTML(n, [ "i", "b" ]))));
        };
        n.FooterButton = function(e) {
            var t = e.className, n = e.onClick, r = e.children;
            return y.createElement("div", {
                className: k.cs(T.footerButton, t),
                role: "button",
                onClick: function(e) {
                    e.stopPropagation(), n();
                }
            }, r);
        }, n.GrammarlyFooter = function(e) {
            var t = e.isUserAuthenticated, r = e.onEditor, o = e.onLogin;
            return t ? y.createElement(n.FooterButton, {
                className: k.cs(T.item, T.btnLogo),
                onClick: r
            }, y.createElement(S.LogoIcon, {
                className: k.cs(T.icon, T.logoIcon)
            }), " See more in Grammarly") : y.createElement(n.FooterButton, {
                className: k.cs(T.btnPersonalize, T.item),
                onClick: o
            }, y.createElement("div", {
                className: T.personalizeMessage
            }, y.createElement("span", {
                className: T.attn
            }, "ATTN:"), " You’re missing many ", y.createElement("br", null), " key Grammarly features."), y.createElement(S.LogoIcon, {
                className: k.cs(T.icon, T.logoIcon)
            }), " Personalize for free");
        }, n.CardCommonContent = function(e) {
            var t = e.model, r = e.onAddToDictionary, o = e.onIgnore, i = e.onEditor, a = e.onLogin, s = t.getFooterProps();
            return y.createElement("div", {
                className: k.cs(T.card)
            }, t.isTextCard ? !t.isUnknowWord && y.createElement(P, {
                title: t.title,
                explanation: t.explanation
            }) : y.createElement("div", {
                className: T.replacement
            }, y.createElement(E.Replacement, {
                itemClassName: T.item,
                replacement: t.getReplacements()
            })), y.createElement("div", {
                className: T.footer
            }, s.hasAddToDictionary && y.createElement(n.FooterButton, {
                className: k.cs(T.btnDict, T.item),
                onClick: function() {
                    return r();
                }
            }, t.isUnknowWord && y.createElement(N, {
                className: T.unknownWordTitle,
                title: t.title
            }), y.createElement("span", {
                className: k.cs(T.btnDictLabelWithIcon)
            }, y.createElement(S.DictionaryIcon, {
                className: k.cs(T.icon, T.dictionaryIcon)
            }), " Add to dictionary")), y.createElement(n.FooterButton, {
                className: k.cs(T.btnIgnore, T.item),
                onClick: function() {
                    return o();
                }
            }, y.createElement(S.IgnoreIcon, {
                className: k.cs(T.icon, T.ignoreIcon)
            }), " Ignore"), y.createElement(n.GrammarlyFooter, {
                onEditor: i,
                onLogin: a,
                isUserAuthenticated: t.isUserAuthenticated
            })));
        };
        var A = function(e) {
            var t = e.word;
            return y.createElement("div", {
                className: k.cs(T.card, T.cardAddedToDict)
            }, y.createElement("div", {
                className: T.addedToDictTitle
            }, y.createElement(S.DictionaryAddedIcon, {
                className: T.dictionaryAddedIcon
            }), " ", t), y.createElement("div", {
                className: T.dictionaryDescription
            }, "is now in your ", y.createElement("div", {
                onClick: function() {
                    v.emitBackground("open-url", b.URLS.appPersonalDictionary);
                },
                className: T.dictLink
            }, "personal dictionary")));
        }, j = function(e) {
            function t() {
                (0, c["default"])(this, t);
                var e = (0, f["default"])(this, (t.__proto__ || (0, a["default"])(t)).apply(this, arguments));
                return e.state = {
                    isAddedToDictionary: e.props.isAddedToDictionary
                }, e;
            }
            return (0, m["default"])(t, e), (0, u["default"])(t, [ {
                key: "render",
                value: function() {
                    var e = this, t = this.props.model;
                    return this.state.isAddedToDictionary ? y.createElement(A, {
                        word: t.highlightText
                    }) : y.createElement(n.CardCommonContent, {
                        onAddToDictionary: function() {
                            e.setState({
                                isAddedToDictionary: !0
                            }), e.props.onAddToDictionary();
                        },
                        onIgnore: this.props.onIgnore,
                        onEditor: this.props.onEditor,
                        onLogin: this.props.onLogin,
                        model: t
                    });
                }
            } ]), t;
        }(y.Component);
        n.CardCommon = j;
        var I = function(e) {
            var t = e.meanings;
            switch (t.length) {
              case 0:
                return y.createElement("span", null);

              case 1:
                return y.createElement("div", {
                    className: k.cs(T.synList, T.synListSingle)
                }, y.createElement("div", {
                    className: T.synSubitems
                }, y.createElement(E.Replacement, {
                    replacement: t[0].list,
                    itemClassName: T.synItem
                })));

              default:
                return y.createElement("div", {
                    className: T.synList
                }, t.map(function(e, t) {
                    return y.createElement("div", {
                        key: t,
                        className: T.synListItem
                    }, y.createElement("div", {
                        className: T.synListTitle
                    }, y.createElement("span", {
                        className: T.synListNumber
                    }, t + 1, "."), e.title), y.createElement("div", {
                        className: T.synSubitems
                    }, y.createElement(E.Replacement, {
                        replacement: e.list,
                        itemClassName: T.synItem
                    })));
                }));
            }
        };
        n.CardSynonyms = function(e) {
            var t = e.model, r = e.onEditor, o = e.onLogin;
            return y.createElement("div", {
                className: k.cs(T.card, T.synCard)
            }, y.createElement("div", {
                className: T.synTitle
            }, "Synonyms:"), y.createElement(I, {
                meanings: t.meanings
            }), y.createElement("div", {
                className: T.footer
            }, y.createElement(n.GrammarlyFooter, {
                onEditor: r,
                onLogin: o,
                isUserAuthenticated: t.isUserAuthenticated
            })));
        };
        var L = 288, M = function(e) {
            function t() {
                (0, c["default"])(this, t);
                var e = (0, f["default"])(this, (t.__proto__ || (0, a["default"])(t)).apply(this, arguments));
                return e.state = {
                    isMaxWidth: !1
                }, e;
            }
            return (0, m["default"])(t, e), (0, u["default"])(t, [ {
                key: "componentDidMount",
                value: function() {
                    this.el && this.el.firstElementChild && this.el.firstElementChild.clientWidth === L && this.setState({
                        isMaxWidth: !0
                    });
                }
            }, {
                key: "render",
                value: function() {
                    var e = this, t = this.props, n = t.model, r = t.onIgnore, i = t.onAddToDictionary, a = t.onEditor, s = t.onLogin, c = t.isAddedToDictionary;
                    return y.createElement("div", {
                        onClick: function(e) {
                            return e.stopPropagation();
                        },
                        key: n.id,
                        ref: function(t) {
                            return e.el = t;
                        },
                        className: k.cs(this.state.isMaxWidth && T.maxWidthReached)
                    }, o(n, r, i, a, s, c));
                }
            } ]), t;
        }(y.Component);
        n.Card = M;
        var R = function(e) {
            function t() {
                (0, c["default"])(this, t);
                var e = (0, f["default"])(this, (t.__proto__ || (0, a["default"])(t)).apply(this, arguments));
                return e.state = {
                    pos: {
                        rect: {
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0,
                            flip: !1
                        },
                        sourceRect: {
                            width: 0
                        },
                        delta: {
                            right: 0,
                            left: 0,
                            bottom: 0,
                            top: 0
                        },
                        className: "",
                        visible: !1
                    },
                    addedToDict: !1,
                    match: {},
                    visible: !1
                }, e.handlers = function(t, n, r) {
                    var o = e.state.match, i = e.props;
                    if (e.state.addedToDict) return void C.fire("show-dictionary");
                    if (t) switch (t) {
                      case "replace":
                        i.animateReplacement(String(o.id), n, r), o.replace(n, !1), i.hide(), o.syn ? C.logger.synonymReplacementAction() : C.logger.cardReplacementAction();
                        break;

                      case "ignore":
                        o.ignore(), i.hide(), C.logger.cardIgnoreAction();
                        break;

                      case "hide":
                        i.hide();
                        break;

                      case "anim-hide":
                        i.hide();
                        break;

                      case "editor":
                        i.openEditor();
                        break;

                      case "login":
                        i.openEditor();
                        break;

                      case "add":
                        i.addToDict(), C.logger.cardAddToDictAction();
                    }
                }, e;
            }
            return (0, m["default"])(t, e), (0, u["default"])(t, [ {
                key: "createCardModel",
                value: function(e, t) {
                    var n = this;
                    switch (e.kind) {
                      case "common":
                        return new x.CommonCardModelImpl(e, function(e, t) {
                            return n.handlers("replace", e, t);
                        }, t);

                      case "synonym":
                        return new x.SynonymsCardModelImpl(e, function(e) {
                            return n.handlers("replace", e);
                        }, t);

                      default:
                        ;
                        return null;
                    }
                }
            }, {
                key: "render",
                value: function() {
                    var e = this, t = this.state, n = t.pos, r = t.match, o = t.visible, i = t.addedToDict, a = n.rect, s = a.flip, c = {
                        top: a.top,
                        left: a.left,
                        visibility: o ? "" : "hidden"
                    };
                    if (!o) return y.createElement("div", null);
                    var l = _.createAlert(r), u = this.createCardModel(l, !this.props.isAnonymous());
                    return y.createElement("div", {
                        style: c,
                        className: k.cs(T.container, s && T.flip, s && "synonyms" === u.kind && T.flipSyn)
                    }, y.createElement(M, {
                        model: u,
                        onIgnore: function() {
                            return e.handlers("ignore");
                        },
                        onAddToDictionary: function() {
                            return e.handlers("add");
                        },
                        isAddedToDictionary: i,
                        onLogin: function() {
                            return e.handlers("login");
                        },
                        onEditor: function() {
                            return e.handlers("editor");
                        }
                    }));
                }
            } ]), t;
        }(y.Component);
        n.PositionedCard = R;
    }, {
        "../dom": 228,
        "../tracking": 316,
        "./icons": 275,
        "./model/card": 279,
        "./replacement": 282,
        "./utils/react": 284,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/extends": 49,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/config": 224,
        "lib/inline-cards/model/grammarly_editor_alert": 281,
        "lib/message": 287,
        react: "react"
    } ],
    277: [ function(e, t, n) {
        "use strict";
        function r(e) {
            var t = {
                Spelling: i.contextualSpelling,
                ContextualSpelling: i.contextualSpelling,
                Grammar: i.grammar,
                Style: i.style,
                SentenceStructure: i.sentenceStructure,
                Punctuation: i.punctuation
            };
            if (void 0 === t[e]) throw new TypeError("Unknown alert group " + e);
            return t[e];
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./alert_replacement");
        n.createReplacement = o.createReplacement, n.createSimpleReplacement = o.createSimpleReplacement;
        var i;
        !function(e) {
            e[e.contextualSpelling = 0] = "contextualSpelling", e[e.grammar = 1] = "grammar", 
            e[e.sentenceStructure = 2] = "sentenceStructure", e[e.punctuation = 3] = "punctuation", 
            e[e.style = 4] = "style", e[e.plagiarism = 5] = "plagiarism", e[e.synonym = 6] = "synonym";
        }(i = n.AlertGroup || (n.AlertGroup = {})), n.alertGroupFromString = r;
    }, {
        "./alert_replacement": 278
    } ],
    278: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            return {
                re: new RegExp("^(" + e + ")(.*)$"),
                createResult: t
            };
        }
        function i(e) {
            function t(e) {
                var t = !0, n = !1, r = void 0;
                try {
                    for (var o, i = (0, l["default"])(u); !(t = (o = i.next()).done); t = !0) {
                        var a = o.value, s = e.match(a.re);
                        if (null !== s) return [ a.createResult(s), s[s.length - 1] ];
                    }
                } catch (c) {
                    n = !0, r = c;
                } finally {
                    try {
                        !t && i["return"] && i["return"]();
                    } finally {
                        if (n) throw r;
                    }
                }
            }
            for (var n = e, r = []; n.length > 0; ) {
                var o = t(n);
                if (void 0 === o) throw new Error("Coudln't parse transform");
                if ("insert" === o[0].type) {
                    var i = r[r.length - 1];
                    i && "delete" === i.type && r.push({
                        type: "arrow"
                    });
                }
                r.push(o[0]), n = o[1];
            }
            return r;
        }
        function a(e, t) {
            return {
                newText: t,
                transform: i(e)
            };
        }
        function s(e) {
            var t = [ {
                type: "insert",
                text: e
            } ];
            return {
                newText: e,
                transform: t
            };
        }
        var c = e("babel-runtime/core-js/get-iterator"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = [ o("(?:\\<span class='gr_grammar_del'\\>([\\S\\s]*?)\\</span\\>)", function(e) {
            return {
                type: "delete",
                text: e[2]
            };
        }), o("(?:\\<span class='gr_grammar_ins'\\>([\\S\\s]*?)\\</span\\>)", function(e) {
            return {
                type: "insert",
                text: e[2]
            };
        }), o("(→)", function(e) {
            return {
                type: "arrow"
            };
        }), o("([^<>→]+)", function(e) {
            return {
                type: "text",
                text: e[1]
            };
        }) ];
        n.parseTransformHtml = i, n.createReplacement = a, n.createSimpleReplacement = s;
    }, {
        "babel-runtime/core-js/get-iterator": 32
    } ],
    279: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a), c = e("babel-runtime/helpers/possibleConstructorReturn"), l = r(c), u = e("babel-runtime/helpers/inherits"), d = r(u), f = e("babel-runtime/helpers/classCallCheck"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("./alert"), h = e("./card_replacement"), g = function _(e, t) {
            (0, p["default"])(this, _), this.isUserAuthenticated = t, this.id = e.id, this.title = e.title, 
            this.explanation = e.explanation, this.details = e.details;
        };
        n.CardModelBaseImpl = g;
        var b = function(e) {
            function t(e, n, r) {
                (0, p["default"])(this, t);
                var o = (0, l["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this, e, r));
                return o._alert = e, o._replace = n, o.isUserAuthenticated = r, o.kind = "common", 
                o.details = o._alert.details, o.todo = o._alert.todo, o.isUnknowWord = "Unknown" === o._alert.category, 
                o.highlightText = o._alert.highlightText, o.extraProperties = o._alert.extraProperties, 
                o.hasAcknowledgeButton = 0 === o._alert.replacements.length && o._alert.group !== m.AlertGroup.contextualSpelling, 
                o.hasAddToDictionary = !!o._alert.extraProperties.hasAddToDictionary, o.isTextCard = h.isNoReplacement(o._alert.replacements), 
                o.title = o._getTitle(), o;
            }
            return (0, d["default"])(t, e), (0, s["default"])(t, [ {
                key: "_getTitle",
                value: function() {
                    return this.isUnknowWord ? "Unknown word" : "Misspelled" === this._alert.category ? "" : this._alert.extraProperties.isDidYouMean || this.extraProperties.isShowTitle ? "Check word usage" : this._alert.todo;
                }
            }, {
                key: "getFooterProps",
                value: function() {
                    return {
                        hasAcknowledgeButton: this.hasAcknowledgeButton,
                        hasAddToDictionary: this.hasAddToDictionary
                    };
                }
            }, {
                key: "getReplacements",
                value: function() {
                    var e = this._alert.replacements;
                    return h.isNoReplacement(e) ? new h.EmptyReplacement() : new h.CardReplacementList(this.title, e, this._replace);
                }
            } ]), t;
        }(g);
        n.CommonCardModelImpl = b;
        var v = function y(e, t, n) {
            var r = this;
            (0, p["default"])(this, y), this._alert = e, this._replace = t, this.isUserAuthenticated = n, 
            this.kind = "synonyms", this.meanings = this._alert.meanings.map(function(e) {
                return {
                    title: e.title,
                    list: new h.CardReplacementFlatList("", e.replacements, function(e) {
                        return r._replace(e);
                    })
                };
            }), this.isActive = !1, this.isAnyMeanings = Boolean(this.meanings.length), this.id = this._alert.id, 
            this.title = this._alert.title, this.explanation = "", this.details = "";
        };
        n.SynonymsCardModelImpl = v;
    }, {
        "./alert": 277,
        "./card_replacement": 280,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51
    } ],
    280: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            return !e || 0 === e.length;
        }
        function i(e) {
            return e.slice(e.findIndex(function(e) {
                return "arrow" === e.type;
            }) + 1).filter(function(e) {
                return "delete" !== e.type;
            }).map(function(e) {
                return "insert" === e.type || "text" === e.type ? e.text : "";
            }).join("");
        }
        var a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/possibleConstructorReturn"), l = r(c), u = e("babel-runtime/helpers/inherits"), d = r(u), f = e("babel-runtime/helpers/classCallCheck"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m;
        !function(e) {
            e[e.single = 0] = "single", e[e.list = 1] = "list", e[e.flatList = 2] = "flatList", 
            e[e.empty = 3] = "empty";
        }(m = n.CardReplacementTemplate || (n.CardReplacementTemplate = {})), n.isNoReplacement = o;
        var h = function _() {
            (0, p["default"])(this, _), this.template = m.empty, this.headerText = "";
        };
        n.EmptyReplacement = h;
        var g = function y(e, t, n) {
            var r = this;
            (0, p["default"])(this, y), this.headerText = e, this._replacement = t, this._onReplace = n, 
            this.transform = this._replacement.transform, this.onReplace = function() {
                return r._onReplace(r._replacement.newText);
            }, this.template = m.single;
        };
        n.CardReplacementSingle = g;
        var b = function w(e, t, n) {
            var r = this;
            (0, p["default"])(this, w), this.headerText = e, this.replacements = t, this._onReplace = n, 
            this.template = m.list, this.getOnReplace = function(e) {
                return function() {
                    r._onReplace(e.newText, i(e.transform));
                };
            };
        };
        n.CardReplacementList = b;
        var v = function(e) {
            function t(e, n, r) {
                (0, p["default"])(this, t);
                var o = (0, l["default"])(this, (t.__proto__ || (0, s["default"])(t)).call(this, e, n, r));
                return o.headerText = e, o.template = m.flatList, o;
            }
            return (0, d["default"])(t, e), t;
        }(b);
        n.CardReplacementFlatList = v;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51
    } ],
    281: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = e.rawMatch;
            return d.assert("synonym" !== t.action, "Do not use `getBasicAlertFields` for synonyms."), 
            {
                id: t.id.toString(),
                hidden: t.hidden,
                category: t.category,
                isFree: t.free,
                highlightText: t.highlightText,
                range: {
                    start: t.begin,
                    end: t.end
                },
                group: f.alertGroupFromString(t.group)
            };
        }
        function i(e) {
            var t = e.rawMatch, n = Number(t.synonyms.pos), r = t.synonyms.token, o = n + r.length;
            return {
                id: String(e.id),
                hidden: !1,
                category: t.category,
                isFree: !0,
                highlightText: r,
                range: {
                    start: n,
                    end: o
                },
                group: f.AlertGroup.synonym
            };
        }
        function a(e) {
            var t = "common", n = e.rawMatch, r = n.extra_properties, i = o(e), a = {
                title: n.title,
                details: n.details,
                explanation: n.explanation
            }, s = (0, u["default"])(i, a), c = {
                kind: t,
                todo: n.todo,
                replacements: (n.transforms || []).map(function(e, t) {
                    return f.createReplacement(e, n.replacements[t]);
                }),
                extraProperties: {
                    hasAddToDictionary: !!r.add_to_dict,
                    isDidYouMean: !!r.did_you_mean,
                    isShowTitle: !!r.show_title,
                    isEnchancement: !!r.enhancement,
                    plagiarismUrl: r.url,
                    sentence: r.sentence,
                    priority: r.priority ? parseInt(r.priority, 10) : 0
                }
            };
            return (0, u["default"])(s, c);
        }
        function s(e) {
            var t = "synonym", n = e.rawMatch, r = i(e), o = {
                title: n.synonyms.token,
                details: "",
                explanation: ""
            }, a = (0, u["default"])(r, o), s = {
                kind: t,
                meanings: n.synonyms.meanings.map(function(e) {
                    return {
                        title: e.meaning,
                        replacements: e.synonyms.map(function(e) {
                            return f.createSimpleReplacement(e.derived);
                        })
                    };
                }),
                replacements: (n.replacements || []).map(f.createSimpleReplacement)
            };
            return (0, u["default"])(a, s);
        }
        function c(e) {
            var t = e.rawMatch;
            if (!t.group && "synonyms" === t.action) return s(e);
            var n = f.alertGroupFromString(e.rawMatch.group);
            switch (n) {
              default:
                return a(e);
            }
        }
        var l = e("babel-runtime/core-js/object/assign"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("stdlib"), f = e("./alert");
        n.createAlert = c;
    }, {
        "./alert": 277,
        "babel-runtime/core-js/object/assign": 36,
        stdlib: 327
    } ],
    282: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = e.filter(function(e) {
                return "insert" === e.type || "delete" === e.type;
            });
            return t.length > 0 ? t[t.length - 1].type + "Replacement" : "";
        }
        function i(e, t) {
            var n = e.slice(t).filter(function(e) {
                return "insert" === e.type;
            });
            return n.length > 0 ? n[0].text : "";
        }
        function a(e, t) {
            var n = e.slice(0, t).filter(function(e) {
                return "delete" === e.type;
            });
            return n.length > 0 ? n[0].text : "";
        }
        function s(e, t) {
            return !!e[t + 1] && "delete" === e[t + 1].type;
        }
        function c(e, t) {
            return !!e[t + 1] && "text" === e[t + 1].type;
        }
        function l(e, t) {
            return !!e[t + 1] && "insert" === e[t + 1].type;
        }
        function u(e) {
            return 0 === e.filter(function(e) {
                return "insert" !== e.type && "text" !== e.type;
            }).length;
        }
        function d(e) {
            return e.slice(e.findIndex(function(e) {
                return "arrow" === e.type;
            }) + 1);
        }
        function f(e, t, n, r, o) {
            return k.createElement("span", {
                className: C.cs(T.insertPart, n && T.insertWithWord, E.isSinglePunctuation(e) && T.insertPunctuation, E.isQuestion(e) && T.insertQuestion, r && T.nextIsWord),
                key: o
            }, E.highlightDiff(t, e));
        }
        function p(e, t, n) {
            return k.createElement("span", {
                className: C.cs(T.deletePart, E.isQuoteWithPunctuation(e) && T.deleteQuoteWithPunctuation, E.isPunctuation(e) && T.deletePunctuation, E.isColonOrSemicolon(e) && T.deleteColonOrSemicolon, E.isComma(e) && T.deleteComma, E.isExclamation(e) && T.deleteExclamation, E.isDash(e) && T.deleteDash, E.isQuestion(e) && T.deleteQuestion, E.isEllipsis(e) && T.deleteEllipsis, E.isQuote(e) && T.deleteQuote, E.isPeriod(e) && T.deletePeriod, E.isParenthesis(e) && T.deleteParenthesis, E.isDoubleComma(e) && T.deleteDoubleComma, E.isAphostrophe(e) && T.deleteAphostrophe, E.isLetter(e) && T.deleteLetter, E.isPunctuationAndLetter(e) && T.deletePunctuationBeforeLetter),
                key: n
            }, E.highlightDiff(t, e));
        }
        function m(e, t, n, r) {
            return k.createElement("span", {
                className: C.cs(T.wordPart, t && T.wordBeforeDelete, n && T.wordBeforeInsert),
                key: r
            }, e);
        }
        function h(e, t, n) {
            return k.createElement("span", {
                key: n,
                className: T[o(e)],
                onClick: S.stopPropagation(t)
            }, d(e).map(function(t, n) {
                switch (t.type) {
                  case "delete":
                    return p(t.text, i(e, n), n);

                  case "insert":
                    return f(t.text, a(e, n), u(e), c(e, n), n);

                  case "text":
                    return m(t.text, s(e, n), l(e, n), n);

                  default:
                    throw new Error("Part " + t + " should not exist");
                }
            }));
        }
        function g(e, t) {
            return k.createElement("div", (0, w["default"])({
                className: T.title,
                onClick: S.stopPropagation(t)
            }, S.setInnerHTML(e)));
        }
        function b(e, t) {
            return k.createElement("div", {
                className: C.cs(T.singleReplacement, t)
            }, k.createElement("div", null, h(e.transform, e.onReplace)));
        }
        function v(e, t, n) {
            return k.createElement("div", {
                className: T.listReplacement
            }, e.replacements.map(function(r, o) {
                return k.createElement("div", {
                    key: o,
                    className: C.cs(T.listItemReplacementWrapper, n, t && T.flattenListItemReplacementWrapper, 0 === o && !e.headerText && T.listItemReplacementNoHeader),
                    onClick: e.getOnReplace(r)
                }, 0 === o && e.headerText && g(e.headerText, e.getOnReplace(r)), k.createElement("span", {
                    className: T.listItemReplacement
                }, h(r.transform, e.getOnReplace(r), o)));
            }));
        }
        function _(e, t) {
            switch (e.template) {
              case x.CardReplacementTemplate.single:
                return b(e, t);

              case x.CardReplacementTemplate.list:
                return v(e, !1, t);

              case x.CardReplacementTemplate.flatList:
                return v(e, !0, t);

              default:
                throw new Error("Replacement template " + x.CardReplacementTemplate[e.template] + " is not supported");
            }
        }
        var y = e("babel-runtime/helpers/extends"), w = r(y);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var k = e("react"), C = e("../../dom"), x = e("../model/card_replacement"), E = e("./utils"), S = e("../utils/react"), T = {
            title: "_abcbcc-title",
            replacement: "_abcbcc-replacement",
            singleReplacement: "_abcbcc-singleReplacement",
            listItemReplacement: "_abcbcc-listItemReplacement",
            sideCommas: "_abcbcc-sideCommas",
            orReplacement: "_abcbcc-orReplacement",
            insertReplacement: "_abcbcc-insertReplacement",
            longReplacement: "_abcbcc-longReplacement",
            didYouMean: "_abcbcc-didYouMean",
            wordPart: "_abcbcc-wordPart",
            wordBeforeInsert: "_abcbcc-wordBeforeInsert",
            insertPart: "_abcbcc-insertPart",
            insertPunctuation: "_abcbcc-insertPunctuation",
            deleteReplacement: "_abcbcc-deleteReplacement",
            deletePart: "_abcbcc-deletePart",
            wordBeforeDelete: "_abcbcc-wordBeforeDelete",
            deletePunctuation: "_abcbcc-deletePunctuation",
            deleteColonOrSemicolon: "_abcbcc-deleteColonOrSemicolon",
            deleteParenthesis: "_abcbcc-deleteParenthesis",
            deleteQuestion: "_abcbcc-deleteQuestion",
            deleteExclamation: "_abcbcc-deleteExclamation",
            deletePeriod: "_abcbcc-deletePeriod",
            deleteQuote: "_abcbcc-deleteQuote",
            deleteDash: "_abcbcc-deleteDash",
            deleteEllipsis: "_abcbcc-deleteEllipsis",
            deleteQuoteWithPunctuation: "_abcbcc-deleteQuoteWithPunctuation",
            deleteApostrophe: "_abcbcc-deleteApostrophe",
            deletePunctuationBeforeLetter: "_abcbcc-deletePunctuationBeforeLetter",
            deleteLetter: "_abcbcc-deleteLetter",
            deleteDoubleComma: "_abcbcc-deleteDoubleComma",
            insertQuestion: "_abcbcc-insertQuestion",
            nextIsWord: "_abcbcc-nextIsWord",
            listReplacement: "_abcbcc-listReplacement",
            arrowPart: "_abcbcc-arrowPart",
            bold: "_abcbcc-bold",
            orSeparator: "_abcbcc-orSeparator",
            didYouMeanLabel: "_abcbcc-didYouMeanLabel",
            listItemReplacementNoHeader: "_abcbcc-listItemReplacementNoHeader",
            listItemReplacementWrapper: "_abcbcc-listItemReplacementWrapper",
            flattenListItemReplacementWrapper: "_abcbcc-flattenListItemReplacementWrapper"
        };
        n.Replacement = function(e) {
            return k.createElement("div", {
                className: C.cs(T.replacement)
            }, _(e.replacement, e.itemClassName));
        };
    }, {
        "../../dom": 228,
        "../model/card_replacement": 280,
        "../utils/react": 284,
        "./utils": 283,
        "babel-runtime/helpers/extends": 49,
        react: "react"
    } ],
    283: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return null !== e && e.replace(/\s/g, "").length < 3 && null !== e.match(C);
        }
        function o(e) {
            return null !== e && e.replace(/\s/g, "").length < 3 && null !== e.match(/[;:]/);
        }
        function i(e) {
            return null !== e && 1 === e.replace(/\s/g, "").length && r(e);
        }
        function a(e) {
            return null !== e && null !== e.match(/["'”][.,;]/);
        }
        function s(e) {
            return '"' === e || "”" === e || "“" === e;
        }
        function c(e) {
            return null !== e && null !== e.match(/,,/);
        }
        function l(e) {
            return null !== e && e.match(/[.,;:!?\\\/…\-—()]\s*[a-z]/i);
        }
        function u(e) {
            return "’" === e;
        }
        function d(e) {
            return "," === e;
        }
        function f(e) {
            return "!" === e;
        }
        function p(e) {
            return "-" === e || "—" === e;
        }
        function m(e) {
            return "?" === e;
        }
        function h(e) {
            return "." === e;
        }
        function g(e) {
            return "…" === e;
        }
        function b(e) {
            return ")" === e || "(" === e;
        }
        function v(e) {
            return null !== e && 1 === e.length && null !== e.match(/[a-z]/i);
        }
        function _(e, t) {
            if (e.length <= 4) return y.createElement("span", null, t);
            var n = w.textdiff(e, t), r = n.from, o = n.to, i = n.oldFragment, a = n.newFragment, s = 1 === a.length && r > 0 && e[r - 1] === a, c = 1 === i.length && 0 === a.length && t[r - 1] === i, l = r, u = a;
            return (s || c) && (l = r - 1), s && (u = a + a), c && (u = i), u.length > 3 ? y.createElement("span", null, t) : y.createElement("span", null, e.substring(0, l), y.createElement("span", {
                className: k.bold
            }, u), e.substring(o));
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var y = e("react"), w = e("@grammarly-npm/textdiff"), k = {
            title: "_abcbcc-title",
            replacement: "_abcbcc-replacement",
            singleReplacement: "_abcbcc-singleReplacement",
            listItemReplacement: "_abcbcc-listItemReplacement",
            sideCommas: "_abcbcc-sideCommas",
            orReplacement: "_abcbcc-orReplacement",
            insertReplacement: "_abcbcc-insertReplacement",
            longReplacement: "_abcbcc-longReplacement",
            didYouMean: "_abcbcc-didYouMean",
            wordPart: "_abcbcc-wordPart",
            wordBeforeInsert: "_abcbcc-wordBeforeInsert",
            insertPart: "_abcbcc-insertPart",
            insertPunctuation: "_abcbcc-insertPunctuation",
            deleteReplacement: "_abcbcc-deleteReplacement",
            deletePart: "_abcbcc-deletePart",
            wordBeforeDelete: "_abcbcc-wordBeforeDelete",
            deletePunctuation: "_abcbcc-deletePunctuation",
            deleteColonOrSemicolon: "_abcbcc-deleteColonOrSemicolon",
            deleteParenthesis: "_abcbcc-deleteParenthesis",
            deleteQuestion: "_abcbcc-deleteQuestion",
            deleteExclamation: "_abcbcc-deleteExclamation",
            deletePeriod: "_abcbcc-deletePeriod",
            deleteQuote: "_abcbcc-deleteQuote",
            deleteDash: "_abcbcc-deleteDash",
            deleteEllipsis: "_abcbcc-deleteEllipsis",
            deleteQuoteWithPunctuation: "_abcbcc-deleteQuoteWithPunctuation",
            deleteApostrophe: "_abcbcc-deleteApostrophe",
            deletePunctuationBeforeLetter: "_abcbcc-deletePunctuationBeforeLetter",
            deleteLetter: "_abcbcc-deleteLetter",
            deleteDoubleComma: "_abcbcc-deleteDoubleComma",
            insertQuestion: "_abcbcc-insertQuestion",
            nextIsWord: "_abcbcc-nextIsWord",
            listReplacement: "_abcbcc-listReplacement",
            arrowPart: "_abcbcc-arrowPart",
            bold: "_abcbcc-bold",
            orSeparator: "_abcbcc-orSeparator",
            didYouMeanLabel: "_abcbcc-didYouMeanLabel",
            listItemReplacementNoHeader: "_abcbcc-listItemReplacementNoHeader",
            listItemReplacementWrapper: "_abcbcc-listItemReplacementWrapper",
            flattenListItemReplacementWrapper: "_abcbcc-flattenListItemReplacementWrapper"
        }, C = /["'”“.,;:!?\\\/…\-—()]/;
        n.isPunctuation = r, n.isColonOrSemicolon = o, n.isSinglePunctuation = i, n.isQuoteWithPunctuation = a, 
        n.isQuote = s, n.isDoubleComma = c, n.isPunctuationAndLetter = l, n.isAphostrophe = u, 
        n.isComma = d, n.isExclamation = f, n.isDash = p, n.isQuestion = m, n.isPeriod = h, 
        n.isEllipsis = g, n.isParenthesis = b, n.isLetter = v, n.highlightDiff = _;
    }, {
        "@grammarly-npm/textdiff": 16,
        react: "react"
    } ],
    284: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            return {
                dangerouslySetInnerHTML: {
                    __html: i.sanitize(e, t)
                }
            };
        }
        function o(e) {
            return function(t) {
                t.stopPropagation(), e(t);
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var i = e("./string");
        n.setInnerHTML = r, n.stopPropagation = o;
    }, {
        "./string": 285
    } ],
    285: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e ? e[0].toUpperCase() + e.slice(1) : "";
        }
        function o(e) {
            return e ? e.replace(/(?:^|[-_])(\w)/g, function(e, t) {
                return t ? t.toUpperCase() : "";
            }) : "";
        }
        function i() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", t = arguments[1];
            return e && "undefined" != typeof window ? t ? l.sanitize(e, {
                ALLOWED_TAGS: t
            }) : l.sanitize(e) : "";
        }
        function a(e, t) {
            var n = e.match(t);
            return n && n[1];
        }
        function s(e) {
            return e.split(/\s+/)[0];
        }
        function c(e, t, n) {
            return 1 === e ? t : n;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("dompurify");
        n.nbsp = String.fromCharCode(160), n.capitalize = r, n.camelize = o, n.sanitize = i, 
        n.getFirstMatch = a, n.getFirstWord = s, n.pluralize = c;
    }, {
        dompurify: "dompurify"
    } ],
    286: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = this, t = b.getApi(), n = t.tabs;
            return v.SafePromise.create(function(t) {
                return m(e, void 0, void 0, d["default"].mark(function r() {
                    var e, o;
                    return d["default"].wrap(function(r) {
                        for (;;) switch (r.prev = r.next) {
                          case 0:
                            return e = setTimeout(function() {
                                return n.getActiveTabUrl().then(t);
                            }, 2e3), r.next = 3, n.getActiveTabUrl();

                          case 3:
                            o = r.sent, clearTimeout(e), t(o);

                          case 6:
                          case "end":
                            return r.stop();
                        }
                    }, r, this);
                }));
            });
        }
        function i(e) {
            var t = e && e.ownerDocument || document, n = t.location || t.defaultView.location;
            return n ? _(n.hostname) : "";
        }
        function a() {
            return p["default"].race([ o().then(s), h.delay(1e4).then(function() {
                throw new Error("Request to tabs.getCurrentTabUrl rejected by timeout");
            }) ]);
        }
        function s(e) {
            if (h.isFF() && /^about:/.test(e)) return e;
            var t = document.createElement("a");
            return t.href = e, _(t.hostname);
        }
        function c(e) {
            var t = e && e.ownerDocument || document, n = t.location || t.defaultView.location;
            return n ? n.pathname + n.search : "";
        }
        function l() {
            for (var e = new RegExp("^(?:[a-z]+:)?//", "i"), t = "", n = document.getElementsByTagName("link"), r = 0; r < n.length; r++) {
                var o = n[r], i = '"' + o.getAttribute("rel") + '"', a = /(\"icon )|( icon\")|(\"icon\")|( icon )/i;
                i.search(a) !== -1 && (t = o.getAttribute("href"));
            }
            return t || (t = "favicon.ico"), e.test(t) ? t : "/" !== t[0] ? "//" + document.location.host + document.location.pathname + t : "//" + document.location.host + t;
        }
        var u = e("babel-runtime/regenerator"), d = r(u), f = e("babel-runtime/core-js/promise"), p = r(f), m = function(e, t, n, r) {
            return new (n || (n = p["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var h = e("./util"), g = e("./page-config/defaults"), b = e("extension-api"), v = e("stdlib"), _ = function(e) {
            return e.replace("www.", "");
        };
        n.currentUrl = o, n.getDomain = i, n.promiseGetDomain = a, n.domainFromUrl = s, 
        n.isFacebookSite = function() {
            return g.FACEBOOK_SITES.includes(i());
        }, n.isJiraSite = function() {
            return /\.atlassian\.net/.test(i());
        }, n.isBlackboardSite = function() {
            return /\.blackboard\.com/.test(i());
        }, n.getUrl = c, n.getFavicon = l;
    }, {
        "./page-config/defaults": 292,
        "./util": 322,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/regenerator": 55,
        "extension-api": 184,
        stdlib: 327
    } ],
    287: [ function(e, t, n) {
        (function(t) {
            "use strict";
            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                };
            }
            function o(e, t) {
                function n() {
                    a(e, n);
                    for (var r = arguments.length, o = Array(r), i = 0; i < r; i++) o[i] = arguments[i];
                    t.apply(this, o);
                }
                i(e, n);
            }
            function i(e, t) {
                if ("__bgerror" === e) return void C.on("__bgerror", t);
                var r = x[e] = x[e] || [];
                if (r.push(t), 1 === r.length) try {
                    k.listen(e, function() {
                        var e = !0, t = !1, n = void 0;
                        try {
                            for (var o, i = (0, h["default"])(r); !(e = (o = i.next()).done); e = !0) {
                                var a = o.value;
                                a.apply(void 0, arguments);
                            }
                        } catch (s) {
                            t = !0, n = s;
                        } finally {
                            try {
                                !e && i["return"] && i["return"]();
                            } finally {
                                if (t) throw n;
                            }
                        }
                    });
                } catch (o) {
                    n.emitError(o);
                }
            }
            function a(e, t) {
                if ("__bgerror" === e) return void C.off("__bgerror", t);
                var n = x[e];
                if (n) {
                    var r = n.indexOf(t);
                    r !== -1 && n.splice(r, 1), 0 === n.length && delete x[e];
                }
            }
            function s(e) {
                try {
                    switch (k.kind) {
                      case "background-message-api":
                        k.broadcast(e, {});
                        break;

                      default:
                        throw new Error("emitTabs can be used only on background");
                    }
                } catch (t) {
                    n.emitError(t);
                }
            }
            function c(e, t) {
                var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, o = arguments[3], i = o || function() {};
                try {
                    if (!e) throw TypeError("emitTo can't be used without destination point");
                    switch (k.kind) {
                      case "background-message-api":
                        k.sendTo(e, t, r, i);
                        break;

                      default:
                        throw new Error("emitTo can be used only on background");
                    }
                } catch (a) {
                    n.emitError(a);
                }
            }
            function l(e, t) {
                try {
                    k.toFocused(e, t);
                } catch (r) {
                    n.emitError(r);
                }
            }
            function u(e, t, r) {
                try {
                    switch (k.kind) {
                      case "content-script-message-api":
                        k.broadcastBackground(e, t, r);
                        break;

                      default:
                        throw new Error("emitBackground can be used only in content script");
                    }
                } catch (o) {
                    n.emitError(o);
                }
            }
            function d(e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1e4, o = new p["default"](function(r, o) {
                    try {
                        switch (k.kind) {
                          case "content-script-message-api":
                            k.broadcastBackground(e, t, r, o);
                            break;

                          default:
                            throw new Error("promiseBackground can be used only on client scripts");
                        }
                    } catch (i) {
                        o(i), n.emitError(i);
                    }
                });
                return p["default"].race([ o, v.delay(r).then(function() {
                    throw new Error("Request to bg page (" + k + ") rejected by timeout");
                }) ]);
            }
            var f = e("babel-runtime/core-js/promise"), p = r(f), m = e("babel-runtime/core-js/get-iterator"), h = r(m);
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var g = e("lodash"), b = e("emitter"), v = e("./util"), _ = e("./dom"), y = e("extension-api"), w = t.env.SANDBOX ? {
                message: {
                    broadcastBackground: v._f,
                    listen: v._f,
                    toFocused: v._f
                }
            } : y.getApi(), k = w.message, C = b({}), x = {};
            n.emitError = g.throttle(function(e) {
                return C.emit("__bgerror", e);
            }, 1e3), v.isBg() && _.listen(document, "grammarly:offline", function() {
                return n.emitError("proxy dead");
            }, void 0), n.one = o, n.on = i, n.off = a, n.emitTabs = s, n.emitTo = c, n.emitFocusedTab = l, 
            n.emitBackground = u, n.promiseBackground = d;
        }).call(this, e("_process"));
    }, {
        "./dom": 228,
        "./util": 322,
        _process: 170,
        "babel-runtime/core-js/get-iterator": 32,
        "babel-runtime/core-js/promise": 43,
        emitter: "emitter",
        "extension-api": 184,
        lodash: "lodash"
    } ],
    288: [ function(e, t, n) {
        "use strict";
        function r() {
            if (a()) {
                var e = void 0;
                try {
                    e = firefox;
                } catch (t) {
                    e = {};
                }
                return !!e.runtime;
            }
            return s() || l();
        }
        function o() {
            return !!window.__extensionTestsMode;
        }
        function i() {
            return "87677a2c52b84ad3a151a4a72f5bd3c4";
        }
        function a() {
            return window.navigator.userAgent.indexOf("Firefox") !== -1;
        }
        function s() {
            return !!window.chrome && /google/i.test(navigator.vendor);
        }
        function c() {
            return /^((?!chrome).)*safari/i.test(navigator.userAgent);
        }
        function l() {
            return /edge/i.test(navigator.userAgent);
        }
        function u() {
            return c() && navigator.userAgent.indexOf("Version/8.0") !== -1;
        }
        function d() {
            return navigator.appVersion.indexOf("Win") !== -1;
        }
        function f() {
            return !!window.IS_BG;
        }
        function p() {
            var e = !1;
            try {
                e = safari.extension.globalPage.contentWindow !== window;
            } catch (t) {}
            return e;
        }
        function m() {
            return !!window.IS_POPUP;
        }
        function h() {
            return f() || m();
        }
        function g() {
            return s() ? "chrome" : a() ? "firefox" : c() ? "safari" : "other";
        }
        function b() {
            var e = "unknown";
            try {
                if (c()) return safari.extension.displayVersion;
                if (s()) {
                    var t = chrome.runtime.getManifest();
                    return t.version;
                }
                if (a()) {
                    var n = firefox.runtime.getManifest();
                    return n.version;
                }
                return e;
            } catch (r) {
                return console.error(r), e;
            }
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.isWE = r, n.isTestsMode = o, n.getUuid = i, n.isFF = a, n.isChrome = s, n.isSafari = c, 
        n.isEdge = l, n.isSafari8 = u, n.isWindows = d, n.isBg = f, n.isSafariSettingsPopup = p, 
        n.isPopup = m, n.isBgOrPopup = h, n.getBrowser = g, n.getVersion = b, n.ENV = "prod";
        var v = "c10dd64c87f70ef5563a63c368797e8c";
        n.MIXPANEL = {
            qaKey: "7a5c95b5cba1b225d00cc3ba1c410c78",
            key: v,
            cookie: "mp_" + v + "_mixpanel"
        }, n.STATSC = {
            URL: "https://stats-public.grammarly.io/",
            PREFIX: "grammarly.ui"
        }, n.GRAMMARLY_DOMAIN = "grammarly.com";
        var _ = "https://www." + n.GRAMMARLY_DOMAIN;
        n.DAPI = "https://data." + n.GRAMMARLY_DOMAIN;
        var y = "https://app." + n.GRAMMARLY_DOMAIN, w = "https://auth." + n.GRAMMARLY_DOMAIN + "/v3", k = w + "/user", C = _ + "/after_install_page", x = "https://emailfeedback." + n.GRAMMARLY_DOMAIN;
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
            authCreatePage: w + "/redirect-anonymous?location=" + C,
            userOrAnonymous: k + "/oranonymous",
            authSignin: w + "/login",
            authSignup: w + "/signup",
            signin: _ + "/signin",
            signup: _ + "/signup",
            resetPassword: _ + "/resetpassword",
            saveEmailFeedback: x + "/api/feedback/",
            raven: "felog.grammarly.io",
            newFelog: "https://f-log-extension.grammarly.io",
            referral: _ + "/referral?page=extension",
            welcomeC: _ + "/extension-success",
            upgrade: _ + "/upgrade",
            uninstall: _ + "/extension-uninstall",
            terms: _ + "/terms",
            policy: _ + "/privacy-policy",
            pageConfigUrl: "https://d3cv4a9a9wh0bt.cloudfront.net/browserplugin/config.json"
        };
        var E = g().slice(0, 1).toUpperCase() + g().slice(1);
        n.appName = "extension" + E, n.gnarAppName = g() + "Ext";
    }, {} ],
    289: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/keys"), i = r(o), a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u), f = e("babel-runtime/helpers/possibleConstructorReturn"), p = r(f), m = e("babel-runtime/helpers/inherits"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("lib/util"), b = e("./defaults"), v = e("lib/location"), _ = e("./config-loader"), y = function(e) {
            function t(e) {
                (0, l["default"])(this, t);
                var n = (0, p["default"])(this, (t.__proto__ || (0, s["default"])(t)).call(this, e));
                return n.invalidate = function() {
                    return n.load();
                }, n;
            }
            return (0, h["default"])(t, e), (0, d["default"])(t, [ {
                key: "getByPage",
                value: function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : v.getUrl();
                    if (e) {
                        var n = (0, i["default"])(e).find(function(e) {
                            return new RegExp(e).test(t);
                        });
                        return n ? e[n] : void 0;
                    }
                }
            }, {
                key: "get",
                value: function(e, t) {
                    var n = this.config.pageConfig[e] || this.config.subdomains.find(function(t) {
                        return new RegExp("\\." + g.escapeRegExp(t.domain) + "$").test(e);
                    }) || this.config.partials.find(function(t) {
                        return e.includes(t.domain);
                    });
                    if (n && n.enabled === !1) return n;
                    var r = this.getByPage(n && n.pages, t), o = r || n || {};
                    return o.enabled = o.enabled !== !1, o;
                }
            }, {
                key: "toReload",
                value: function(e) {
                    return 0 === e.indexOf("http") && b.SITES_TO_RELOAD.some(function(t) {
                        return e.includes(t);
                    });
                }
            } ]), t;
        }(_.ConfigLoader);
        n.Config = y;
    }, {
        "./config-loader": 290,
        "./defaults": 292,
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "lib/location": 286,
        "lib/util": 322
    } ],
    290: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/regenerator"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/core-js/promise"), d = r(u), f = function(e, t, n, r) {
            return new (n || (n = d["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p = e("./localforage"), m = e("lib/request"), h = e("lib/config"), g = e("lib/tracking"), b = e("./meta"), v = e("./utils"), _ = e("./decorator"), y = e("lib/profiler"), w = 6e4, k = "Config missed", C = "Config malformed", x = function() {
            function e(t) {
                (0, s["default"])(this, e), this._prefs = t;
            }
            return (0, l["default"])(e, [ {
                key: "init",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        var t;
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return y.Profiler.start("pageConfig_init"), t = void 0, e.next = 4, this.isSkipConfig();

                              case 4:
                                if (!e.sent) {
                                    e.next = 8;
                                    break;
                                }
                                console.warn("Config: use default config in DEBUG mode (skipConfig=true)"), e.next = 11;
                                break;

                              case 8:
                                return e.next = 10, this.loadFromStorage();

                              case 10:
                                t = e.sent;

                              case 11:
                                return this.config = t ? t : {}, e.next = 14, new b.Meta().load();

                              case 14:
                                return this.meta = e.sent, y.Profiler.stop("pageConfig_init"), e.abrupt("return", this);

                              case 17:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            }, {
                key: "isSkipConfig",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                if (e.t0 = !1, !e.t0) {
                                    e.next = 5;
                                    break;
                                }
                                return e.next = 4, this._prefs.get("skipConfig");

                              case 4:
                                e.t0 = e.sent;

                              case 5:
                                return e.abrupt("return", e.t0);

                              case 6:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            }, {
                key: "load",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        var t, n, r, o;
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                if (t = this.meta.config, n = t.date, r = t.interval, !(n + r > Date.now())) {
                                    e.next = 5;
                                    break;
                                }
                                return o = (n + r - Date.now()) / 1e3 / 60, console.info("Config: next update in " + o.toFixed(2) + " m"), 
                                e.abrupt("return");

                              case 5:
                                return console.info("Config: going to update config from CDN..."), e.abrupt("return", this.updateFromCDN());

                              case 7:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            }, {
                key: "updateFromCDN",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        var t, n;
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return t = void 0, e.prev = 1, e.next = 4, m.fetch(h.URLS.pageConfigUrl, {
                                    timeout: w
                                });

                              case 4:
                                if (t = e.sent, v.isValid(t)) {
                                    e.next = 7;
                                    break;
                                }
                                throw new Error(C);

                              case 7:
                                this.config = t, this.save(t), e.next = 17;
                                break;

                              case 11:
                                e.prev = 11, e.t0 = e["catch"](1), g.logger.pageConfigCDNError(e.t0.message), n = "Config: can't get valid config - " + e.t0.message, 
                                console.warn(n, t), this.saveOnError(n);

                              case 17:
                              case "end":
                                return e.stop();
                            }
                        }, e, this, [ [ 1, 11 ] ]);
                    }));
                }
            }, {
                key: "loadFromStorage",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        var t;
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return e.prev = 0, e.next = 3, p.localforage.getItem("config");

                              case 3:
                                if (t = e.sent) {
                                    e.next = 6;
                                    break;
                                }
                                throw new Error(k);

                              case 6:
                                if (v.isValid(t)) {
                                    e.next = 8;
                                    break;
                                }
                                throw new Error(C);

                              case 8:
                                return console.info("Config: loaded from local storage successfully"), e.abrupt("return", t);

                              case 12:
                                return e.prev = 12, e.t0 = e["catch"](0), k === e.t0.message || g.logger.pageConfigLocalStorageError(e.t0.message, e.t0.name), 
                                console.warn("Config: cannot get valid config from storage: " + e.t0), e.abrupt("return", void 0);

                              case 17:
                              case "end":
                                return e.stop();
                            }
                        }, e, this, [ [ 0, 12 ] ]);
                    }));
                }
            }, {
                key: "save",
                value: function(e) {
                    var t = e.interval, n = e.protocolVersion, r = e.version;
                    p.localforage.setItem("config", e), this.fireVersionUpdate(r, this.meta.config.version), 
                    this.meta.set({
                        date: this.getCurrentTimestamp(),
                        status: "success",
                        interval: t,
                        protocolVersion: n,
                        version: r
                    }), console.info("Config: new config saved to local storage successfully:", e.version, e);
                }
            }, {
                key: "saveOnError",
                value: function(e) {
                    var t = this.meta.config, n = t.interval, r = t.protocolVersion, o = t.version;
                    this.meta.set({
                        date: this.getCurrentTimestamp(),
                        status: "failed",
                        interval: n,
                        protocolVersion: r,
                        version: o,
                        info: e
                    });
                }
            }, {
                key: "fireVersionUpdate",
                value: function(e, t) {
                    e && t !== e && g.logger.pageConfigUpdated(t, e);
                }
            }, {
                key: "getCurrentTimestamp",
                value: function() {
                    return Date.now();
                }
            }, {
                key: "config",
                set: function(e) {
                    e = e || {}, this._config = _.decorateConfig(e);
                },
                get: function() {
                    return this._config;
                }
            } ]), e;
        }();
        n.ConfigLoader = x;
    }, {
        "./decorator": 291,
        "./localforage": 294,
        "./meta": 295,
        "./utils": 296,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/regenerator": 55,
        "lib/config": 224,
        "lib/profiler": 299,
        "lib/request": 300,
        "lib/tracking": 316
    } ],
    291: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = _.merge({
                pageConfig: {}
            }, e);
            return t.pageConfig || (t.pageConfig = {}), t;
        }
        function i(e) {
            return y.decorate(e);
        }
        var a = e("babel-runtime/helpers/defineProperty"), s = r(a), c = e("babel-runtime/core-js/object/keys"), l = r(c), u = e("babel-runtime/core-js/object/assign"), d = r(u), f = e("babel-runtime/helpers/classCallCheck"), p = r(f), m = e("babel-runtime/helpers/createClass"), h = r(m);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var g = e("../config"), b = e("./defaults"), v = e("../util"), _ = e("lodash");
        n.deepCopyWithDefault = o;
        var y = function() {
            function e() {
                (0, p["default"])(this, e);
            }
            return (0, h["default"])(e, null, [ {
                key: "decorate",
                value: function(e) {
                    return e = e || {}, e = this.filterByVersion(e), e = this.withDefault(e), e = this.parseBooleans(e), 
                    e = this.parseBrowserValues(e), e = this.filterInvalidPageRegexp(e), e = this.collectSubdomains(e), 
                    e = this.collectPartials(e);
                }
            }, {
                key: "withDefault",
                value: function(e) {
                    e = o(e);
                    var t = b.PAGE_CONFIG && b.PAGE_CONFIG.pageConfig || {};
                    b.OVERRIDE_PAGE_CONFIG || {};
                    return e.pageConfig = _.merge({}, t, e.pageConfig), e;
                }
            }, {
                key: "filterByVersion",
                value: function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : g.getVersion();
                    e = o(e);
                    var n = e.pageConfig;
                    return e.pageConfig = (0, l["default"])(n).filter(function(e) {
                        var r = n[e], o = r.version;
                        return !o || "*" === o || 1 !== v.versionComparator(t, o);
                    }).reduce(function(t, n) {
                        return (0, d["default"])({}, t, (0, s["default"])({}, n, e.pageConfig[n]));
                    }, {}), e;
                }
            }, {
                key: "parseBooleans",
                value: function(e) {
                    function t(e) {
                        return !(e === !1 || "false" === e);
                    }
                    function n(e) {
                        return !!e && t(e);
                    }
                    e = o(e);
                    var r = e.pageConfig;
                    return (0, l["default"])(r).forEach(function(e) {
                        r[e] || (r[e] = {});
                        var o = r[e];
                        o.enabled = t(o.enabled), o.matchInclusions = n(o.matchInclusions), o.matchSubdomains = n(o.matchSubdomains), 
                        o.pages && (0, l["default"])(o.pages).forEach(function(e) {
                            o.pages[e].enabled = t(o.pages[e].enabled);
                        });
                    }), e;
                }
            }, {
                key: "parseBrowserValues",
                value: function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : v.getBrowser();
                    e = o(e);
                    var n = e.pageConfig;
                    return (0, l["default"])(n).map(function(e) {
                        var r = n[e] && n[e].disabledBrowsers;
                        r && r.includes(t) && (n[e].enabled = !1);
                    }), e;
                }
            }, {
                key: "filterInvalidPageRegexp",
                value: function(e) {
                    e = o(e);
                    var t = e.pageConfig;
                    return (0, l["default"])(t).forEach(function(e) {
                        var n = t[e];
                        n.pages && (n.pages = (0, l["default"])(n.pages).filter(function(e) {
                            try {
                                return new RegExp(e);
                            } catch (t) {
                                return !1;
                            }
                        }).reduce(function(e, t) {
                            return (0, d["default"])({}, e, (0, s["default"])({}, t, n.pages[t]));
                        }, {}));
                    }), e;
                }
            }, {
                key: "collectSubdomains",
                value: function(e) {
                    e = o(e);
                    var t = e.pageConfig;
                    e.subdomains = [];
                    try {
                        e.subdomains = (0, l["default"])(t).filter(function(e) {
                            return t[e].matchSubdomains;
                        }).map(function(e) {
                            return (0, d["default"])({
                                domain: e
                            }, t[e]);
                        });
                    } catch (n) {
                        console.warn("Cannot collect subdomains from config");
                    }
                    return e;
                }
            }, {
                key: "collectPartials",
                value: function(e) {
                    e = o(e);
                    var t = e.pageConfig;
                    e.partials = [];
                    try {
                        e.partials = (0, l["default"])(t).filter(function(e) {
                            return t[e].matchInclusions;
                        }).map(function(e) {
                            return (0, d["default"])({
                                domain: e
                            }, t[e]);
                        });
                    } catch (n) {
                        console.warn("Cannot collect partials from config");
                    }
                    return e;
                }
            } ]), e;
        }();
        n.RawConfigDecorator = y, n.decorateConfig = i;
    }, {
        "../config": 224,
        "../util": 322,
        "./defaults": 292,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/helpers/defineProperty": 48,
        lodash: "lodash"
    } ],
    292: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o, i = e("babel-runtime/helpers/defineProperty"), a = r(i), s = e("babel-runtime/helpers/toConsumableArray"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("lodash"), u = e("lib/config");
        n.PROTOCOL_VERSION = "1.0", n.SITES_TO_RELOAD = [ "inbox.google.com", "mail.google.com", "yahoo.com", "mail.live.com", "facebook.com", "tumblr.com", "stackoverflow.com", "wordpress.com", "wordpress.org", "blogspot.com" ], 
        n.FACEBOOK_SITES = [ "facebook.com", "messenger.com", "work.fb.com", "business.facebook.com" ], 
        n.HTML_GHOST_SITES = [ "twitter.com" ].concat((0, c["default"])(n.FACEBOOK_SITES)), 
        n.CUSTOM_UNSUPPORTED_MESSAGES = {
            "drive.google.com": {
                title: "Google Drive",
                message: 'We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class="openGrammarly" href="' + u.URLS.app + '">Grammarly Editor</a>.'
            },
            "docs.google.com": {
                title: "Google Drive",
                message: 'We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class="openGrammarly" href="' + u.URLS.app + '">Grammarly Editor</a>.'
            },
            "chrome.google.com": {
                title: "Web Store"
            }
        };
        var d = 18e5;
        n.PAGE_CONFIG_DEFAULT_INTERVAL = d, n.PAGE_CONFIG_UPDATE_INTERVALS = [ 6e5, n.PAGE_CONFIG_DEFAULT_INTERVAL, 36e5, 108e5, 432e5, 864e5, 31536e6 ], 
        n.OVERRIDE_PAGE_CONFIG = {}, n.PAGE_CONFIG_INTERNAL = (o = {
            version: {
                enabled: !1,
                servicePage: !0
            },
            extensions: {
                enabled: !1,
                servicePage: !0
            },
            settings: {
                enabled: !1,
                servicePage: !0
            },
            "com.safari.grammarlyspellcheckergrammarchecker": {
                enabled: !1,
                matchInclusions: !0,
                servicePage: !0
            }
        }, (0, a["default"])(o, "app." + u.GRAMMARLY_DOMAIN, {
            enabled: !1,
            grammarlyEditor: !0
        }), (0, a["default"])(o, "linkedin.com", {
            pages: {
                "/messaging": {
                    afterReplaceEvents: [ "input" ]
                }
            }
        }), (0, a["default"])(o, "plus.google.com", {
            afterReplaceEvents: [ "keyup" ],
            minFieldHeight: 0,
            minFieldWidth: 0
        }), (0, a["default"])(o, "facebook.com", {
            minFieldHeight: 0,
            fields: [ {
                name: "caption_text"
            } ]
        }), (0, a["default"])(o, "mail.google.com", {
            fields: [ {
                name: "to"
            }, {
                name: "cc"
            }, {
                name: "bcc"
            }, {
                className: "vO"
            } ],
            subframes: !1
        }), (0, a["default"])(o, "drive.google.com", {
            track: !0
        }), (0, a["default"])(o, "docs.google.com", {
            track: !0
        }), (0, a["default"])(o, "app.asana.com", {
            fields: [ {
                className: "task-row-text-input"
            } ]
        }), (0, a["default"])(o, "tumblr.com", {
            fields: [ {
                attr: [ "aria-label", "Post title" ]
            }, {
                attr: [ "aria-label", "Type or paste a URL" ]
            } ]
        }), (0, a["default"])(o, "chrome.google.com", {
            dontShowDisabledBadge: !0
        }), o);
        var f = {
            "hootsuite.com": {
                enabled: !1
            },
            "chrome.google.com": {
                enabled: !1
            },
            "facebook.com": {
                enabled: !0,
                pages: {
                    ".*/notes": {
                        enabled: !1
                    }
                }
            },
            "onedrive.live.com": {
                enabled: !1
            },
            "docs.com": {
                enabled: !1
            },
            "sp.docs.com": {
                enabled: !1
            },
            "docs.google.com": {
                enabled: !1
            },
            "drive.google.com": {
                enabled: !1
            },
            "texteditor.nsspot.net": {
                enabled: !1
            },
            "jsbin.com": {
                enabled: !1
            },
            "jsfiddle.net": {
                enabled: !1
            },
            "quora.com": {
                enabled: !1
            },
            "paper.dropbox.com": {
                enabled: !1
            },
            "mail.live.com": {
                enabled: !1,
                matchInclusions: !0
            },
            "imperavi.com": {
                enabled: !1
            },
            "usecanvas.com": {
                enabled: !1
            }
        };
        n.PAGE_CONFIG = {
            pageConfig: l.merge({}, f, n.PAGE_CONFIG_INTERNAL)
        };
    }, {
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/toConsumableArray": 53,
        "lib/config": 224,
        lodash: "lodash"
    } ],
    293: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./config-base"), o = e("universal/bg/prefs"), i = e("extension-api"), a = new o.PrefsImpl(i.getApi().preferences);
        n.pageConfig = new r.Config(a);
    }, {
        "./config-base": 289,
        "extension-api": 184,
        "universal/bg/prefs": 330
    } ],
    294: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/promise"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = "Grammarly", s = 1, c = "configuration", l = void 0;
        try {
            l = e("localforage"), l.config({
                name: a,
                version: s,
                size: 4194304,
                storeName: c
            });
        } catch (u) {
            console.error("Fallback to memory storage", u);
            var d = {};
            l = {
                getItem: function(e) {
                    return i["default"].resolve(d[e]);
                },
                setItem: function(e, t) {
                    return d[e] = t, i["default"].resolve(t);
                },
                clear: function() {
                    d = {}, i["default"].resolve(!0);
                }
            };
        }
        n.localforage = l;
    }, {
        "babel-runtime/core-js/promise": 43,
        localforage: "localforage"
    } ],
    295: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/regenerator"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/core-js/promise"), d = r(u), f = function(e, t, n, r) {
            return new (n || (n = d["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p = e("./localforage"), m = e("./utils"), h = "lastConfigUpdate", g = function() {
            function e() {
                (0, s["default"])(this, e);
            }
            return (0, l["default"])(e, [ {
                key: "load",
                value: function() {
                    return f(this, void 0, void 0, i["default"].mark(function e() {
                        var t;
                        return i["default"].wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                              case 0:
                                return e.next = 2, p.localforage.getItem(h);

                              case 2:
                                return t = e.sent, this.set(t), e.abrupt("return", this);

                              case 5:
                              case "end":
                                return e.stop();
                            }
                        }, e, this);
                    }));
                }
            }, {
                key: "set",
                value: function(e) {
                    var t = e || {}, n = t.protocolVersion, r = t.version, o = t.status, i = t.info, a = t.date, s = t.interval;
                    return this._meta = {
                        date: Number(a) || 0,
                        interval: m.getInterval(Number(s)),
                        protocolVersion: n,
                        version: r,
                        status: o,
                        info: i
                    }, p.localforage.setItem(h, this._meta);
                }
            }, {
                key: "config",
                get: function() {
                    return this._meta;
                }
            } ]), e;
        }();
        n.Meta = g;
    }, {
        "./localforage": 294,
        "./utils": 296,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/regenerator": 55
    } ],
    296: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            if (e && e.pageConfig && (0, s["default"])(e).length && (0, s["default"])(e.pageConfig).length && (!e.protocolVersion || e.protocolVersion === c.PROTOCOL_VERSION)) return !0;
        }
        function i(e) {
            return c.PAGE_CONFIG_UPDATE_INTERVALS.includes(e) ? e : c.PAGE_CONFIG_DEFAULT_INTERVAL;
        }
        var a = e("babel-runtime/core-js/object/keys"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./defaults");
        n.isValid = o, n.getInterval = i;
    }, {
        "./defaults": 292,
        "babel-runtime/core-js/object/keys": 41
    } ],
    297: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = i(e), n = j.isFacebookSite();
            return !t || n || M.draftjs || (M.draftjs = !0), !t || n;
        }
        function i(e) {
            return e.hasAttribute("contenteditable") && e.querySelector('[data-contents="true"] > [data-editor], [data-block]');
        }
        function a(e) {
            function t() {
                he = !0, ge = new MutationObserver(r), ge.observe(de.body, {
                    childList: !0,
                    subtree: !0
                }), P.interval(s, ne);
            }
            function n(e) {
                function t(e) {
                    return o.indexOf(e) !== -1 && Boolean(r.push(e));
                }
                var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], o = C.flatten(C.transform(ue, function(e, t) {
                    return e.push(t);
                }, []));
                if (t(e) || !e.children) return r;
                for (var i = 0; i < e.children.length; i++) n(e.children[i], r);
                return r;
            }
            function r(e) {
                var t, r;
                (t = []).concat.apply(t, (0, y["default"])((r = []).concat.apply(r, (0, y["default"])(e.map(function(e) {
                    var t = e.removedNodes;
                    return [].concat((0, y["default"])((0, v["default"])(t))).map(function(e) {
                        return n(e);
                    });
                }))))).forEach(d);
            }
            function i() {
                he && (P.cancelInterval(s), ge.disconnect(), he = !1);
            }
            function a() {
                return [].concat((0, y["default"])(ue)).filter(function(e) {
                    return ae(e) || !e.offsetHeight;
                });
            }
            function s() {
                a().forEach(d);
                var e = J();
                _(e) || be.emit("add", e);
            }
            function l() {
                C.each(ue, function(e) {
                    return e.forEach(F);
                }), ue = h(), be.emit("add", J()), t();
            }
            function d(e) {
                re.has(e) && (re.get(e).off(), re["delete"](e)), [ "textareas", "contenteditables", "iframes", "htmlghosts" ].forEach(function(t) {
                    var n = ue[t].indexOf(e);
                    n !== -1 && ue[t].splice(n, 1);
                }), be.emit("remove", e);
            }
            function p() {
                return g["default"].wrap(function(e) {
                    for (;;) switch (e.prev = e.next) {
                      case 0:
                        return e.delegateYield(this.textareas, "t0", 1);

                      case 1:
                        return e.delegateYield(this.contenteditables, "t1", 2);

                      case 2:
                        return e.delegateYield(this.iframes, "t2", 3);

                      case 3:
                        return e.delegateYield(this.htmlghosts, "t3", 4);

                      case 4:
                      case "end":
                        return e.stop();
                    }
                }, te[0], this);
            }
            function h() {
                return (0, f["default"])({
                    textareas: [],
                    contenteditables: [],
                    iframes: [],
                    htmlghosts: []
                }, m["default"], p);
            }
            function b(e) {
                de = e, pe = de.location.hostname, me = new RegExp("://" + pe), fe = de.defaultView, 
                ee && (ce = C.isNumber(ee.minFieldHeight) ? ee.minFieldHeight : ce, le = C.isNumber(ee.minFieldWidth) ? ee.minFieldHeight : le);
            }
            function _(e) {
                return 0 === e.textareas.length && 0 === e.contenteditables.length && 0 === e.iframes.length && 0 === e.htmlghosts.length;
            }
            function w(e) {
                if (!ee) return !0;
                if (ee.enabled === !1) return !1;
                if (!ee.fields && ee.enabled === !0) return !0;
                var t = function(t) {
                    var n = (0, u["default"])(t, 2), r = n[0], o = n[1];
                    return e.getAttribute(r) === o;
                };
                return !ee.fields.some(function(n) {
                    var r = n.name, o = n.id, i = n.className, a = n.attr;
                    return r && r === e.name || o && o === e.id || i && A.hasClass(e, i) || a && Array.isArray(a) && t(a);
                });
            }
            function j() {
                return !de.location || 0 === de.location.href.indexOf("about:") || 0 === de.location.href.indexOf("chrome:") || !de.body || 0 === de.body.childNodes.length;
            }
            function M() {
                return "interactive" !== de.readyState && "complete" !== de.readyState;
            }
            function R() {
                var e = de.documentElement.getBoundingClientRect();
                return e.height < se && fe.innerHeight < se || e.width < se;
            }
            function O(e) {
                return e.clientHeight < ce || e.clientWidth < le;
            }
            function D(e, t) {
                var n = E.restrictedAttrs.filter(function(e) {
                    return !t || "readonly" !== e;
                }).some(function(t) {
                    return Array.isArray(t) ? e.hasAttribute(t[0]) && e.getAttribute(t[0]).includes(t[1]) : e.hasAttribute(t);
                });
                return n || "rtl" === e.getAttribute("dir");
            }
            function F(e) {
                if ([].concat((0, y["default"])(E.grammarlyAttrs), [ "spellcheck" ]).forEach(function(t) {
                    return e.removeAttribute(t);
                }), T.isHtmlGhostSite()) {
                    var t = e.parentElement && e.parentElement.parentElement;
                    t && t.removeAttribute("spellcheck");
                }
            }
            function B(e) {
                return A.getParentBySel(e, E.restrictedParentAttrs);
            }
            function U(e, t) {
                return o(e) && !D(e, t) && !O(e) && (A.isVisible(e) && w(e) || A.hasClass(e, "grammDemo"));
            }
            function W(e, t) {
                return [].concat((0, y["default"])((0, v["default"])(de.querySelectorAll(e)))).filter(function(e) {
                    return U(e, t);
                });
            }
            function V() {
                return W("textarea", !1);
            }
            function G() {
                return oe ? [] : W('[contenteditable]:not([contenteditable="false"]):not([data-reactid])', !0).filter(function(e) {
                    return !B(e);
                });
            }
            function z() {
                return oe ? W(T.getHtmlGhostSelector(), !1) : [];
            }
            function H(e) {
                if (I.href = e.src, (0 !== e.src.indexOf("http") || me.test(e.src)) && "about:blank" !== e.src && (!e.src || e.src.indexOf("javascript:") !== -1 || I.protocol === document.location.protocol && I.hostname === document.location.hostname && I.port === document.location.port) && !A.hasClass(e, N.baseCls)) {
                    var t = null;
                    try {
                        t = e.contentDocument;
                    } catch (n) {
                        return;
                    }
                    if ((!t || t.body) && t && !D(e, !1) && !D(t.body, !1) && w(e)) {
                        var r = t.querySelector("html") || {
                            hasAttribute: function(e) {
                                return !1;
                            }
                        };
                        if (("on" === t.designMode || t.body.hasAttribute("contenteditable") || "false" === t.body.getAttribute("contenteditable") || r.hasAttribute("contenteditable") || "false" === r.getAttribute("contenteditable")) && !O(e)) return P.isFF() && "on" === t.designMode && (t.designMode = "off", 
                        t.body.setAttribute("contenteditable", "true")), !0;
                    }
                }
            }
            function q() {
                return [].concat((0, y["default"])((0, v["default"])(de.querySelectorAll("iframe")))).filter(H);
            }
            function K(e) {
                ue = C.mapValues(ue, function(t, n) {
                    return [].concat(t, e[n]);
                }), ue[m["default"]] = p;
            }
            function Y(e, t) {
                return C.difference(e[t], ue[t]);
            }
            function Q(e, t) {
                var n = Y(e, t);
                return ie.shouldRemove ? n.filter(function(e) {
                    return !ie.shouldRemove(e);
                }) : n;
            }
            function J() {
                var e = X(), t = (0, f["default"])({
                    textareas: Q(e, "textareas"),
                    contenteditables: Q(e, "contenteditables"),
                    iframes: Q(e, "iframes"),
                    htmlghosts: Q(e, "htmlghosts")
                }, m["default"], p);
                return K(t), t;
            }
            function X() {
                var e = h();
                return j() || M() || R() ? e : (0, c["default"])({}, e, {
                    textareas: V(),
                    contenteditables: G(),
                    iframes: q(),
                    htmlghosts: z()
                });
            }
            var $ = e.doc, Z = void 0 === $ ? document : $, ee = e.page, te = [ p ].map(g["default"].mark), ne = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : L, re = new k["default"](), oe = T.isHtmlGhostSite(), ie = S.pageStyles(Z).getFixesForCurrentDomain(), ae = ie.shouldRemove || P._f, se = 150, ce = 35, le = 300, ue = h(), de = void 0, fe = void 0, pe = void 0, me = void 0, he = void 0, ge = void 0;
            b(Z);
            var be = x({
                get: J,
                reset: l,
                remove: d,
                stop: i
            }), ve = be.on;
            return be.on = function(e, n) {
                return he || t(), ve(e, n), {
                    un: function() {}
                };
            }, be;
        }
        var s = e("babel-runtime/core-js/object/assign"), c = r(s), l = e("babel-runtime/helpers/slicedToArray"), u = r(l), d = e("babel-runtime/helpers/defineProperty"), f = r(d), p = e("babel-runtime/core-js/symbol/iterator"), m = r(p), h = e("babel-runtime/regenerator"), g = r(h), b = e("babel-runtime/core-js/array/from"), v = r(b), _ = e("babel-runtime/helpers/toConsumableArray"), y = r(_), w = e("babel-runtime/core-js/map"), k = r(w);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var C = e("lodash"), x = e("emitter"), E = e("./config"), S = e("./sites"), T = e("./ghost/html-ghost-locator"), N = e("./elements/iframe"), P = e("./util"), A = e("./dom"), j = e("./location"), I = document.createElement("a"), L = 1e3, M = {
            draftjs: !1
        };
        n.PageFields = a;
    }, {
        "./config": 224,
        "./dom": 228,
        "./elements/iframe": 236,
        "./ghost/html-ghost-locator": 262,
        "./location": 286,
        "./sites": 303,
        "./util": 322,
        "babel-runtime/core-js/array/from": 31,
        "babel-runtime/core-js/map": 35,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/symbol/iterator": 45,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/slicedToArray": 52,
        "babel-runtime/helpers/toConsumableArray": 53,
        "babel-runtime/regenerator": 55,
        emitter: "emitter",
        lodash: "lodash"
    } ],
    298: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            return i(e, t)[0];
        }
        function i(e, t) {
            var n = [ {
                top: 0,
                left: 0,
                height: 0,
                width: 0
            } ];
            if (!e) return n;
            var r = e.ownerDocument, i = r.documentElement, a = e.getClientRects(), s = i.scrollTop || r.body.scrollTop, c = i.scrollLeft || r.body.scrollLeft, l = t && t.contentDocument;
            if (0 === a.length) return n;
            var u = (0, m["default"])(a).map(function(e) {
                return {
                    top: e.top + s,
                    left: e.left + c,
                    height: e.height,
                    width: e.width
                };
            });
            if (l && l.documentElement && l.documentElement === i) {
                var d = o(t);
                u = u.map(function(e) {
                    return (0, f["default"])({}, e, {
                        top: e.top + d.top - s,
                        left: e.left + d.left - c
                    });
                });
            }
            return u;
        }
        function a(e, t) {
            var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], r = e.ownerDocument, o = l(r), i = e.clientWidth, a = e.clientHeight, s = {
                top: 0,
                left: 0,
                flip: !1
            }, c = {
                top: t.top - r.body.scrollTop - a,
                left: t.left - i,
                bottom: r.body.scrollTop + o.height - t.top - t.height - a,
                right: r.body.scrollLeft + o.width - t.left - i
            };
            return c.bottom < 0 && c.bottom < c.top || n ? (s.top = t.top - a + 3, s.flip = !0) : (s.top = t.top + t.height - 3, 
            s.flip = !1), c.right < 0 ? s.left = o.width - i : s.left = t.left, {
                rect: s,
                delta: c,
                sourceRect: t
            };
        }
        function s(e, t) {
            function n(e, t) {
                s[e] += i[t] / 2 - a[t] / 2, o[e] > s[e] && (s[e] = o[e]), o[e] + o[t] < s[e] + a[t] && (s[e] = o[e] + o[t] - a[t]);
            }
            var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "top:center", o = c(), i = t.getBoundingClientRect(), a = e.getBoundingClientRect(), s = {
                top: 0,
                left: 0,
                flipY: !1,
                flipX: !1
            }, l = {
                top: i.top - o.top,
                left: i.left - o.left,
                bottom: -i.bottom + o.bottom,
                right: -i.right + o.right
            }, u = r.split(":");
            return s.top = i.top, "center" === u[0] ? n("top", "height") : "top" === u[0] ? l.top > a.height ? s.top -= a.height : (s.top += i.height, 
            s.flipY = !0) : "bottom" === u[0] && (l.bottom > a.height ? s.top += i.height : (s.top -= a.height, 
            s.flipY = !0)), s.left = i.left, "center" === u[1] ? n("left", "width") : "left" === u[1] ? (s.left += i.width - a.width, 
            l.left + i.width < a.width && (s.left = o.left)) : "right" === u[1] && l.right + i.width < a.width && (s.left += i.width + l.right - a.width), 
            s;
        }
        function c() {
            var e = document.createElement("div");
            e.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0;", document.documentElement.insertBefore(e, document.documentElement.firstChild);
            var t = e.getBoundingClientRect();
            return document.documentElement.removeChild(e), t;
        }
        function l(e) {
            var t = e.documentElement.clientTop || e.body.clientTop || 0, n = e.documentElement.clientLeft || e.body.clientLeft || 0, r = e.documentElement.scrollLeft || e.body.scrollLeft, o = e.documentElement.scrollTop || e.body.scrollTop, i = e.defaultView.innerHeight, a = e.defaultView.innerWidth;
            return {
                width: a,
                height: i,
                scrollTop: o - t,
                scrollLeft: r - n,
                top: t,
                left: n
            };
        }
        function u(e, t) {
            if (!e || e === t) return {
                x: 0,
                y: 0
            };
            var n = {
                x: e.offsetLeft,
                y: e.offsetTop
            }, r = u(e.offsetParent, t);
            return n.x += r.x, n.y += r.y, n;
        }
        var d = e("babel-runtime/core-js/object/assign"), f = r(d), p = e("babel-runtime/core-js/array/from"), m = r(p);
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.getAbsRect = o, n.getAllAbsRects = i, n.posToRect = a, n.posToEl = s, n.getPos = u;
    }, {
        "babel-runtime/core-js/array/from": 31,
        "babel-runtime/core-js/object/assign": 36
    } ],
    299: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/regenerator"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c), u = e("babel-runtime/core-js/promise"), d = r(u), f = function(e, t, n, r) {
            return new (n || (n = d["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p = e("lib/timers"), m = e("lib/tracking"), h = function() {
            function e() {
                var t = this;
                (0, s["default"])(this, e), this.timings = {}, this.track = function(e) {
                    for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
                    return f(t, void 0, void 0, i["default"].mark(function a() {
                        return i["default"].wrap(function(t) {
                            for (;;) switch (t.prev = t.next) {
                              case 0:
                                return t.abrupt("return", this._track.apply(this, [ !1, e ].concat(r)));

                              case 1:
                              case "end":
                                return t.stop();
                            }
                        }, a, this);
                    }));
                }, this.trackAsync = function(e) {
                    for (var n = arguments.length, r = Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
                    return f(t, void 0, void 0, i["default"].mark(function a() {
                        return i["default"].wrap(function(t) {
                            for (;;) switch (t.prev = t.next) {
                              case 0:
                                return t.abrupt("return", this._track.apply(this, [ !0, e ].concat(r)));

                              case 1:
                              case "end":
                                return t.stop();
                            }
                        }, a, this);
                    }));
                }, this._track = function(e, n) {
                    for (var r = arguments.length, o = Array(r > 2 ? r - 2 : 0), a = 2; a < r; a++) o[a - 2] = arguments[a];
                    return f(t, void 0, void 0, i["default"].mark(function s() {
                        var t;
                        return i["default"].wrap(function(r) {
                            for (;;) switch (r.prev = r.next) {
                              case 0:
                                if (t = n.name + (e ? "__sync" : ""), p.timers.start(t), r.prev = 2, !e) {
                                    r.next = 8;
                                    break;
                                }
                                return r.next = 6, n.apply(void 0, o);

                              case 6:
                                r.next = 9;
                                break;

                              case 8:
                                n.apply(void 0, o);

                              case 9:
                                r.next = 14;
                                break;

                              case 11:
                                throw r.prev = 11, r.t0 = r["catch"](2), r.t0;

                              case 14:
                                return r.prev = 14, this.timings[t] = p.timers.stop(t), r.finish(14);

                              case 17:
                              case "end":
                                return r.stop();
                            }
                        }, s, this, [ [ 2, 11, 14, 17 ] ]);
                    }));
                };
            }
            return (0, l["default"])(e, [ {
                key: "start",
                value: function(e) {
                    p.timers.start(e);
                }
            }, {
                key: "stop",
                value: function(e) {
                    this.timings[e] = p.timers.stop(e);
                }
            } ], [ {
                key: "start",
                value: function(e) {
                    p.timers.start(e);
                }
            }, {
                key: "stop",
                value: function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 3e4, n = p.timers.stop(e);
                    return n > t && (console.warn("profiler_" + e + "_time_exceeded", n), "pageConfig_init" === e && m.logger.tooLongPageConfigInit(n), 
                    "updateUser" === e && m.logger.tooLongUserUpdateTime(n)), n;
                }
            } ]), e;
        }();
        n.Profiler = h;
    }, {
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/regenerator": 55,
        "lib/timers": 310,
        "lib/tracking": 316
    } ],
    300: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            if (e.data && (e.query || "post" !== e.method) && (e.url += "?" + s(e.data)), e.data && "post" === e.method && !e.query && !e.body) {
                try {
                    e.body = (0, d["default"])(e.data);
                } catch (t) {
                    e.body = {}, console.warn(t);
                }
                e.headers = e.headers || {}, e.headers["Content-Type"] = e.headers["Content-Type"] || "application/json", 
                delete e.data;
            }
            return e.credentials = "include", e;
        }
        function i(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            return t.url = e, o(t), p.isBg() || m.isTestsMode() ? a(t) : h.promiseBackground("fetch", t).then(function(e) {
                if (f.isObject(e) && e.error) throw new Error(e.error);
                return e;
            });
        }
        function a(e) {
            function t(t) {
                return t.ok ? t[e.isText ? "text" : "json"]() : t.text().then(function(e) {
                    throw {
                        name: "RequestError",
                        body: e,
                        statusCode: t.status,
                        message: t.statusText
                    };
                });
            }
            var n = e.url;
            return delete e.url, n ? l["default"].race([ window.fetch(n, e).then(t).then(function(e) {
                if ("string" != typeof e && e && e.error) throw new Error(e.error);
                return e;
            }), p.delay(e.timeout || g).then(function() {
                throw new Error("Fetch request to " + n + " rejected by timeout");
            }) ]) : l["default"].reject(new Error("Url is not defined in fetch request"));
        }
        function s(e) {
            var t = "", n = function(n) {
                if (Array.isArray(e[n])) {
                    if (e[n].length) {
                        var r = e[n].map(function(e) {
                            return n + "=" + e;
                        }).join("&");
                        t += "" + (t.length ? "&" : "") + r;
                    }
                } else t += "" + (t.length ? "&" : "") + n + "=" + encodeURIComponent(e[n]);
            };
            for (var r in e) n(r);
            return t;
        }
        var c = e("babel-runtime/core-js/promise"), l = r(c), u = e("babel-runtime/core-js/json/stringify"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("lodash"), p = e("./util"), m = e("./config"), h = e("./message"), g = 1e4;
        p.isBg() && h.on("fetch", function(e, t) {
            return a(e).then(t, function(e) {
                return t({
                    error: e.message
                });
            });
        }), n.transformOptions = o, n.fetch = i, n.paramStr = s;
    }, {
        "./config": 224,
        "./message": 287,
        "./util": 322,
        "babel-runtime/core-js/json/stringify": 34,
        "babel-runtime/core-js/promise": 43,
        lodash: "lodash"
    } ],
    301: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/assign"), i = r(o), a = e("babel-runtime/core-js/symbol"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/createClass"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("react"), p = e("./position"), m = e("./dom"), h = function(e) {
            var t = e.style, n = e.className;
            return f.createElement("div", {
                style: t,
                className: "g-selection-anim " + n
            });
        }, g = function() {
            function e() {
                var t = this, n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document;
                (0, l["default"])(this, e), this._doc = n, this._id = (0, s["default"])("SelectionAnimator"), 
                this._cls = "", this._width80 = 0, this._width20 = 0, this._component = null, this.render = function() {
                    t._component = m.renderReactWithParent(f.createElement(h, {
                        style: (0, i["default"])({}, t._style),
                        className: t._cls
                    }), t._doc.documentElement, t._id);
                }, this.remove = function() {
                    t._component && (t._component.remove(), t._component = null);
                }, this.complete = function() {
                    t._style.WebkitTransitionDuration = "0.2s", t._style.MozTransitionDuration = "0.2s", 
                    t._style.transitionDuration = "0.2s", t._style.width = t._width80 + t._width20, 
                    t._component && t.render();
                };
            }
            return (0, d["default"])(e, [ {
                key: "animate",
                value: function(e) {
                    var t = this, n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
                    this._cls = n;
                    var r = p.getAbsRect(e);
                    this._style = {
                        top: r.top + r.height + 1,
                        left: r.left,
                        width: 0,
                        height: 2
                    }, this._width20 = Math.ceil(r.width / 8), this._width80 = r.width - this._width20, 
                    setTimeout(function() {
                        t._style.width = t._width80, t.render();
                    }, 10), setTimeout(function() {
                        t.complete();
                    }, 500), this.render();
                }
            } ]), e;
        }();
        n.SelectionAnimator = g;
    }, {
        "./dom": 228,
        "./position": 298,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/symbol": 44,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        react: "react"
    } ],
    302: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            return e.getRangeAt(0).getBoundingClientRect();
        }
        function i(e, t) {
            var n = e.anchorNode;
            if (!n) return !1;
            var r = l.restrictedAttrs.map(function(e) {
                return Array.isArray(e) ? "[" + e[0] + '="' + e[1] + '"]' : "[" + e + "]";
            }).join(","), o = t.activeElement, i = e.toString().trim(), a = "TEXTAREA" !== n.tagName && "INPUT" !== n.tagName, s = !o || "INPUT" !== o.tagName && "TEXTAREA" !== o.tagName, c = !u.isContentEditable(n), d = !u.getParentBySel(n, r) && !u.matchesSelector(n, r), f = !u.getParentBySel(n, "[contenteditable=true],[contenteditable=plaintext-only]") && !u.parentIsContentEditable(n);
            return !!(i && a && s && c && d && f);
        }
        function a(e, t, n) {
            if (!e) return null;
            for (var r = e.split(/[.;!?]/g), o = 0, i = 0, a = 0; a < r.length; a++) {
                if (i = o + r[a].length, t >= o && n <= i) return {
                    v: r[a],
                    s: t - o,
                    e: n - o
                };
                o = i + 1;
            }
            return null;
        }
        var s = e("babel-runtime/helpers/classCallCheck"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("./config"), u = e("./dom");
        n.isValidSelection = i;
        var d = function f(e, t, n) {
            var r = this;
            (0, c["default"])(this, f), this._doc = e, this._selectHandler = t, this._deselectHandler = n, 
            this._select = !1, this.release = function() {
                return u.unlisten(r._doc, "click", r.check);
            }, this.check = function(e) {
                var t = e.detail;
                if (2 !== t) return void (r._select && (r._deselectHandler(), r._select = !1));
                r._select = !0;
                var n = r._doc.getSelection();
                if (i(n, r._doc)) {
                    var s = n.anchorNode.textContent, c = n.toString();
                    if (!c.match(/[0-9_±!@#$%^&*:"|<>?~().,:}{’=']/)) {
                        var l = {
                            v: c,
                            s: 0,
                            e: c.length
                        }, u = n.getRangeAt(0);
                        if (u.ownerDocument = r._doc, n.anchorNode === n.focusNode) {
                            var d = n.anchorOffset, f = d + c.length;
                            l = a(s, d, f);
                        }
                        null !== l && r._selectHandler({
                            data: {
                                v: l.v,
                                s: l.s,
                                e: l.e,
                                w: c
                            },
                            pos: o(n),
                            el: u
                        });
                    }
                }
            }, u.listen(e, "click", this.check);
        };
        n.SelectionElement = d;
    }, {
        "./config": 224,
        "./dom": 228,
        "babel-runtime/helpers/classCallCheck": 46
    } ],
    303: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            return e.find(function(e) {
                return i(t, e.split(":"));
            });
        }
        function i(e, t) {
            var n = (0, p["default"])(t, 2), r = n[0], o = n[1], i = e.getAttribute(r);
            return Boolean(i && (i === o || i.includes(o) && r + ":" + o));
        }
        function a(e) {
            return e.dataset && e.dataset.testid;
        }
        function s() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document, t = m.getDomain(e.documentElement), n = _[t];
            return {
                addDomainClass: function() {
                    e.documentElement.classList.add("gr__" + t.replace(/\./g, "_"));
                },
                customizeElements: function() {
                    n && g(n).each(function(t, n) {
                        return (0, d["default"])(e.querySelectorAll(n)).forEach(function(e) {
                            return g.extend(e.style || {}, t);
                        });
                    });
                },
                getFixesForCurrentDomain: function() {
                    var e = w[t];
                    if (e) return e;
                    var n = (0, l["default"])(w).filter(function(e) {
                        return e.includes("*");
                    }).find(function(e) {
                        return t.indexOf(e.replace("*", "")) > -1;
                    });
                    return n && w[n] || {};
                }
            };
        }
        var c = e("babel-runtime/core-js/object/keys"), l = r(c), u = e("babel-runtime/core-js/array/from"), d = r(u), f = e("babel-runtime/helpers/slicedToArray"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("./location"), h = e("./util"), g = e("lodash"), b = e("./client-script"), v = e("./dom"), _ = {
            "translate.google.com": {
                "#gt-clear": {
                    zIndex: "2"
                }
            },
            "linkedin.com": {
                ".mentions-highlighter": {
                    zIndex: "0"
                }
            },
            "us.nakedwines.com": {
                ".postbutton": {
                    display: "inline-block"
                }
            }
        }, y = function() {
            var e = void 0;
            return function() {
                return "undefined" == typeof e && (e = !!document.querySelector("c-wiz")), e;
            };
        }(), w = {
            "twitter.com": {
                btnDiff: function(e) {
                    if ("tweet-box-dm-conversation" === e.id) return [ -25, 1 ];
                    var t = e.parentElement && e.parentElement.parentElement && e.parentElement.parentElement.querySelector(".EmojiPicker");
                    return null != t && t.offsetHeight > 0 ? [ -25, 3 ] : e.clientHeight > 40 || "tweet-box-home-timeline" !== e.id ? [ 0, 0 ] : [ -30, 0 ];
                },
                fieldRestoreInlineStyles: function(e, t) {
                    "tweet-box-dm-conversation" === e.id && e.style.zIndex !== t.src["z-index"] && (e.style.zIndex = t.src["z-index"], 
                    e.style.position = t.src.position, e.style.transition = "none", e.style.background = "transparent");
                }
            },
            "linkedin.com": {
                fieldStateForDomain: function(e) {
                    if ("IFRAME" === e.tagName && e.id) return e.id.replace(/\d*\d/, "");
                    var t = [ "class:trans" ];
                    return o(t, e);
                },
                menuPosLeft: function(e, t, n) {
                    return !h.isSafari() || n.enabled ? t : t - 7;
                }
            },
            "*.slack.com": {
                forceMinimize: function(e) {
                    return e.clientHeight > 40;
                },
                btnCustomContainer: function(e) {
                    return e;
                },
                btnCustomStyles: function(e, t) {
                    var n = t.clientHeight < 40 ? 25 : 0;
                    return e ? {
                        right: 10 + n,
                        bottom: 10,
                        left: "auto",
                        top: "auto"
                    } : {
                        right: -10,
                        bottom: -2,
                        left: "auto",
                        top: "auto"
                    };
                },
                customDefaultBg: function(e) {
                    return e.parentNode && e.parentNode.parentNode && e.parentNode.parentNode.classList.contains("offline") ? "rgb(253, 241, 193)" : "rgb(255, 255, 255)";
                }
            },
            "*.zendesk.com": {
                customDefaultBg: function(e) {
                    return e.classList.contains("ember-text-area") && (e.parentNode && e.parentNode.parentNode && e.parentNode.parentNode.parentNode && !e.parentNode.parentNode.parentNode.classList.contains("is-public") ? "#fff6d9" : "#fff") || null;
                }
            },
            "facebook.com": {
                fieldStateForDomain: function(e) {
                    var t = [ "role:textbox", "testid:ufi_comment_composer", "testid:react-composer-root" ], n = function(e, t) {
                        var n = (0, p["default"])(t, 2), r = (n[0], n[1]);
                        return e.dataset && e.dataset.testid === r ? "testid:" + r : !!v.getParentByData(e, "testid", r) && "testid:" + r;
                    };
                    return t.find(function(t) {
                        var r = t.split(":"), o = (0, p["default"])(r, 2), a = o[0], s = o[1];
                        return "testid" === a ? Boolean(n(e, [ a, s ])) : i(e, [ a, s ]);
                    });
                },
                ghostHeight: function(e) {
                    var t = parseInt(e, 10);
                    return t > 0 ? t + 1 + "px" : t + "px";
                },
                menuPosLeft: function(e, t) {
                    return e && e.el.name && "xhpc_message_text" === e.el.name ? Math.ceil(t) : t;
                },
                forceMinimize: function(e) {
                    return "ufi_reply_composer" === a(e);
                },
                getContainerTextAlign: function(e) {
                    var t = a(e);
                    if ("status-attachment-mentions-input" === t) {
                        var n = v.getParentByDepth.call(e, 4);
                        return n.style.textAlign;
                    }
                },
                btnCustomContainer: function(e) {
                    var t = a(e);
                    if ("ufi_comment_composer" === t || "ufi_reply_composer" === t) return e;
                    if ("status-attachment-mentions-input" === t) {
                        var n = v.getParentByDepth.call(e, 4);
                        return n.parentNode.style.position = "relative", n;
                    }
                    if (e.name && "xhpc_message_text" === e.name) return e;
                    var r = v.getParentByData(e, "testid", "react-composer-root");
                    if (r) {
                        var o = v.getParentByDepth.call(e, 3);
                        return o.parentNode.style.position = "relative", o;
                    }
                    return "webMessengerRecentMessages" === e.getAttribute("aria-controls") ? e : void 0;
                },
                btnCustomStyles: function(e, t) {
                    var n = "auto", r = "auto";
                    if ("webMessengerRecentMessages" === t.getAttribute("aria-controls")) return e ? {
                        right: 10,
                        bottom: 10,
                        left: n,
                        top: r
                    } : {
                        right: -5,
                        bottom: 2,
                        left: n,
                        top: r
                    };
                    var o = a(t);
                    if ("ufi_comment_composer" === o) {
                        var i = 15, s = -4, c = -14, l = v.getParentByDepth.call(t, 6).querySelector(".UFICommentAttachmentButtons"), u = e ? 0 : -(l.clientWidth + i), d = e ? s : c;
                        return {
                            right: u,
                            bottom: d,
                            left: n,
                            top: r
                        };
                    }
                    if ("ufi_reply_composer" === o || t.hasAttribute("aria-haspopup") && t.hasAttribute("aria-owns")) {
                        var f = 17, p = -4, m = -8, h = v.getParentByDepth.call(t, 6).querySelector(".UFICommentAttachmentButtons"), g = e ? 0 : -(h.clientWidth + f), b = e ? p : m;
                        return {
                            right: g,
                            bottom: b,
                            left: n,
                            top: r
                        };
                    }
                    var _ = e ? 10 : -8, y = e ? 10 : -5, w = v.getParentByData(t, "testid", "react-composer-root");
                    if (w) {
                        var k = 30, C = -12, x = 6, E = -3, S = w.querySelectorAll('[aria-label="Post a sticker"], [aria-label="Insert an emoji"]').length > 0;
                        S && (_ = e ? k : C, y = e ? x : E);
                    }
                    return t.name && "xhpc_message_text" === t.name && (y = 50), {
                        right: _,
                        bottom: y,
                        left: n,
                        top: r
                    };
                }
            },
            "mail.google.com": {
                btnCustomContainer: function(e) {
                    var t = v.getParentByTag(e, "TABLE"), n = t && v.getParentByTag(t, "TABLE"), r = n && n.querySelector('[command="Files"]');
                    return n && r ? v.getParentByTag(r, "TABLE") : null;
                },
                btnCustomStyles: function(e) {
                    return e ? {
                        right: 10,
                        top: -30,
                        left: "auto"
                    } : {
                        right: -2,
                        top: -25,
                        left: "auto"
                    };
                },
                shouldRemove: function(e) {
                    var t = v.getParentByTag(e, "TABLE");
                    if (t) {
                        var n = v.getParentByTag(t, "TABLE");
                        if (n) {
                            var r = n.querySelector('[role=toolbar][aria-label="Spell Check"]');
                            return r && r.offsetParent;
                        }
                    }
                }
            },
            "inbox.google.com": {
                btnCustomContainer: function(e) {
                    return e.parentNode;
                },
                btnCustomStyles: function(e) {
                    return e ? {
                        right: 12,
                        top: "auto",
                        left: "auto",
                        bottom: 62
                    } : {
                        right: -5,
                        top: "auto",
                        left: "auto",
                        bottom: 60
                    };
                }
            },
            "medium.com": {
                btnDiff: function(e) {
                    return v.parentHasClass(e, "postArticle--full") ? [ -75, 0, !1 ] : [ 0, 0, !1 ];
                }
            },
            "plus.google.com": {
                forceMinimize: function(e) {
                    return e.clientHeight < 30;
                },
                btnCustomContainer: function(e) {
                    var t = function(e) {
                        return /comment/i.test(e.getAttribute("aria-label") || "");
                    };
                    return y() && t(e) ? e.parentNode : e;
                },
                btnCustomStyles: function(e) {
                    var t = y() ? -12 : -18, n = y() ? -5 : -10;
                    return e ? {
                        right: 10,
                        bottom: 10,
                        left: "auto",
                        top: "auto"
                    } : {
                        right: t,
                        bottom: n,
                        left: "auto",
                        top: "auto"
                    };
                },
                fieldParentCustomStyle: function() {
                    var e = {
                        "padding-bottom": "2px",
                        "overflow-x": "hidden"
                    };
                    return y() ? e : {};
                }
            },
            "app.asana.com": {
                forceMinimize: function(e) {
                    return !!e.classList.contains("task-comments-input") && (!!(e.parentNode && e.parentNode.parentNode && e.parentNode.parentNode.parentNode) && !e.parentNode.parentNode.parentNode.classList.contains("focused"));
                }
            },
            "youtube.com": {
                btnDiff: function(e) {
                    return v.hasClass(e, "comment-simplebox-text") ? [ 15, 15 ] : [ 0, 0 ];
                }
            },
            "socialflow.com": {
                fieldParentCustomStyle: function(e) {
                    return e ? {
                        width: ""
                    } : {};
                }
            }
        };
        n.pageStyles = s, function() {
            function e() {
                if (window.randomize) {
                    var e = window.randomize;
                    window.randomize = function(t) {
                        try {
                            if (t.data) {
                                var n = JSON.parse(t.data);
                                n[0] && n[0].parentWindowLocation && e(t);
                            }
                        } catch (r) {}
                    };
                }
            }
            var t = m.getDomain();
            (t.indexOf("chase.com") > -1 || t.indexOf("chaseonline.com") > -1) && b.addScript(document, [ e ]);
        }();
    }, {
        "./client-script": 218,
        "./dom": 228,
        "./location": 286,
        "./util": 322,
        "babel-runtime/core-js/array/from": 31,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/slicedToArray": 52,
        lodash: "lodash"
    } ],
    304: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return {
                type: n.UPDATE_CONNECTION,
                data: {
                    bgNotConnected: !0,
                    online: !1
                },
                reason: e,
                sync: !1
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.UPDATE_CONNECTION = "connection/UPDATE_CONNECTION", n.bgPageDown = r;
    }, {} ],
    305: [ function(e, t, n) {
        "use strict";
        function r(e) {
            var t = i.createMirrorStore(e, {
                bgPageDown: s.bgPageDown
            }, a.reducer), n = t.store, r = t.actions;
            return o.on("__bgerror", r.bgPageDown), {
                store: n,
                actions: r
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("lib/message"), i = e("lib/store-mirror"), a = e("./reducer"), s = e("./actions");
        n.createAndObserve = r;
    }, {
        "./actions": 304,
        "./reducer": 306,
        "lib/message": 287,
        "lib/store-mirror": 308
    } ],
    306: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t = arguments[1], n = t.type, r = t.data;
            switch (n) {
              case s.UPDATE_CONNECTION:
                return (0, a["default"])({}, e, {
                    connection: (0, a["default"])({}, e.connection, r)
                });

              default:
                return e;
            }
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("./actions");
        n.reducer = o;
    }, {
        "./actions": 304,
        "babel-runtime/core-js/object/assign": 36
    } ],
    307: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            function n() {
                var n = e.getState();
                d.isEmpty(n) || d.isEqual(r, n) || (r = n, t(n));
            }
            var r = void 0;
            return f.asyncCall(n), e.subscribe(n);
        }
        var i = e("babel-runtime/helpers/defineProperty"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s), l = e("babel-runtime/core-js/object/keys"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("lodash"), f = e("lib/util");
        n.observeStore = o, n.bindActions = function(e, t) {
            return (0, u["default"])(e).filter(function(t) {
                return e[t];
            }).reduce(function(n, r) {
                return (0, c["default"])(n, (0, a["default"])({}, r, function() {
                    var n = e[r].apply(e, arguments), o = "undefined" == typeof n.sync || n.sync;
                    return t((0, c["default"])({}, n, {
                        sync: o
                    }));
                }));
            }, {});
        };
    }, {
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/util": 322,
        lodash: "lodash"
    } ],
    308: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n = arguments[2], r = function() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : h, t = arguments[1], r = e.page || e.config || {}, o = r.domain;
                return t.sync && l.emitBackground("dispatch", (0, a["default"])({}, t, {
                    domain: o
                })), t.type === m ? (0, a["default"])({}, e, t.data) : n ? n(e, t) : e;
            }, o = c.createStore(r, {}, c.applyMiddleware(p)), i = d.bindActions((0, a["default"])({}, u.pureActions, t), o.dispatch);
            return l.on("state", function(e) {
                f.asyncCall(function() {
                    return o.dispatch({
                        type: m,
                        data: e
                    });
                }, 0);
            }), d.observeStore(o, e), {
                store: o,
                actions: i
            };
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("redux-logger"), c = e("redux"), l = e("lib/message"), u = e("universal/bg/store"), d = e("./helpers"), f = e("../util"), p = s({
            level: "debug",
            collapsed: function() {
                return !0;
            },
            predicate: function() {
                return !1;
            }
        }), m = "store/SYNC", h = {
            page: {},
            connection: {}
        };
        n.createMirrorStore = o;
    }, {
        "../util": 322,
        "./helpers": 307,
        "babel-runtime/core-js/object/assign": 36,
        "lib/message": 287,
        redux: "redux",
        "redux-logger": "redux-logger",
        "universal/bg/store": 340
    } ],
    309: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            function e(e) {
                l.listen(document, e, function(t) {
                    var n = t.value;
                    u.emitBackground(e, n);
                });
            }
            function t(e) {
                var t = [];
                return (0, c["default"])(e, function(e, n) {
                    if ("object" === ("undefined" == typeof n ? "undefined" : (0, a["default"])(n)) && null !== n) {
                        if (t.indexOf(n) !== -1) return;
                        t.push(n);
                    }
                    return n;
                });
            }
            function n() {
                l.emitDomEvent("console-log", t(d.flushLog()));
            }
            function r() {
                u.emitBackground("get-tracker-log", {}, function(e) {
                    return l.emitDomEvent("tracker-log", e);
                });
            }
            function o() {
                u.emitBackground("get-capi-log", {}, function(e) {
                    return l.emitDomEvent("capi-log", e);
                });
            }
            function i() {
                u.emitBackground("get-extid", {}, function(e) {
                    return l.emitDomEvent("extid", e);
                });
            }
            function s() {
                u.emitBackground("get-localforage", {}, function(e) {
                    return l.emitDomEvent("localforage", e);
                });
            }
            function f(e) {
                u.emitBackground("set-localforage", {
                    key: e.key,
                    value: e.value
                }, function(e) {
                    return l.emitDomEvent("localforage", e);
                });
            }
            function p(e) {
                var t = e.key;
                u.emitBackground("get-pref", {
                    key: t
                }, function(e) {
                    return l.emitDomEvent("pref", {
                        key: t,
                        value: e
                    });
                });
            }
            function m(e) {
                var t = e.key, n = e.value;
                u.emitBackground("set-pref", {
                    key: t,
                    value: n
                });
            }
            [ "bg-reload", "reset", "qa-relogin", "disable-auth", "enable-auth", "disable-defs", "enable-defs", "disable-domain", "enable-domain", "uninstall", "set-popup-url", "set-premium-user", "set-fake-capi", "run-fake-capi", "disable-send-state-to-tabs", "enable-send-state-to-tabs" ].forEach(e), 
            l.listen(document, "get-extid", i), l.listen(document, "get-capi-log", o), l.listen(document, "get-tracker-log", r), 
            l.listen(document, "get-console-log", n), l.listen(document, "get-localforage", s), 
            l.listen(document, "set-localforage", f), l.listen(document, "get-pref", p), l.listen(document, "set-prefs", m);
        }
        var i = e("babel-runtime/helpers/typeof"), a = r(i), s = e("babel-runtime/core-js/json/stringify"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("./dom"), u = e("./message"), d = e("./console");
        n.api = o;
    }, {
        "./console": 225,
        "./dom": 228,
        "./message": 287,
        "babel-runtime/core-js/json/stringify": 34,
        "babel-runtime/helpers/typeof": 54
    } ],
    310: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = {};
        n.timers = {
            start: function(e) {
                r[e] = Date.now();
            },
            stop: function(e) {
                var t = this.passed(e);
                return delete r[e], t;
            },
            passed: function(e) {
                return e && r[e] ? Date.now() - r[e] : 0;
            }
        };
    }, {} ],
    311: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = window.fetch.bind(window), t = y.LoggingImpl.DefaultLogAppender.createRootLogger("gnar", y.Logging.LogLevel.INFO, new y.LoggingImpl.GetFelogClient(m.URLS.newFelog, m.appName, m.getVersion(), m.ENV, e)), n = y.TimeSeriesImpl.MetricsStorage.createRoot("gnar", m.URLS.newFelog, e), r = new _.BackendStorage(e, g.GNAR.url), o = new _.ChromeCookieStorage(g.GNAR.url, g.GNAR.domain), i = new _.WebExtensionsCookieStorage(g.GNAR.url, g.GNAR.domain), a = new _.ContainerIdManager(h.isChrome() ? o : h.isFF() ? i : r, [ new _.CookieStorage(g.GNAR.domain), new _.LocalStorage(), new _.MemoryStorage() ], t.getLogger("containerId"), n.getCounter("containerId"), h.isChrome() ? 1e3 : 5e3);
            return new _.GnarClientImpl(g.GNAR.url, m.gnarAppName, g.getVersion(), e, a, t, n, (!0));
        }
        function i() {
            return d(this, void 0, void 0, c["default"].mark(function e() {
                return c["default"].wrap(function(e) {
                    for (;;) switch (e.prev = e.next) {
                      case 0:
                        try {
                            b.tracker().gnar = o();
                        } catch (t) {
                            v.logger.gnarClientInitFail(t && t.message);
                        }

                      case 1:
                      case "end":
                        return e.stop();
                    }
                }, e, this);
            }));
        }
        function a(e) {
            function t(e, t) {
                t && e && (f(e, null), f(e, t, o));
            }
            var n = e.dapi, r = p.getDomain(), o = {
                path: "/",
                domain: r,
                expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            };
            t("__fngrprnt__", n);
        }
        var s = e("babel-runtime/regenerator"), c = r(s), l = e("babel-runtime/core-js/promise"), u = r(l), d = function(e, t, n, r) {
            return new (n || (n = u["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("cookie"), p = e("../location"), m = e("../config"), h = e("../util"), g = e("../config"), b = e("./tracker"), v = e("./logger"), _ = e("@grammarly-npm/gnarclientweb"), y = e("@grammarly-npm/telemetry.ts");
        n.init = i, n.processCookiesFromGrammarly = a, n.getContainerIdOrUndefined = function() {
            return d(void 0, void 0, void 0, c["default"].mark(function e() {
                return c["default"].wrap(function(e) {
                    for (;;) switch (e.prev = e.next) {
                      case 0:
                        return e.prev = 0, e.next = 3, b.tracker().gnar.getContainerId();

                      case 3:
                        return e.abrupt("return", e.sent);

                      case 6:
                        return e.prev = 6, e.t0 = e["catch"](0), e.abrupt("return", void 0);

                      case 9:
                      case "end":
                        return e.stop();
                    }
                }, e, this, [ [ 0, 6 ] ]);
            }));
        };
    }, {
        "../config": 224,
        "../location": 286,
        "../util": 322,
        "./logger": 317,
        "./tracker": 320,
        "@grammarly-npm/gnarclientweb": 5,
        "@grammarly-npm/telemetry.ts": 8,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/regenerator": 55,
        cookie: "cookie"
    } ],
    312: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            var o = function(t) {
                console.warn("tracking call " + e + " failed, reason: ", t);
            };
            if (h.isBg()) h.asyncCall(function() {
                var t;
                try {
                    switch (a(e, n), e) {
                      case p.CALL_HANDLER_ID:
                        var r = n[0], s = n.slice(1);
                        (t = p.methods)[r].apply(t, (0, u["default"])(s));
                        break;

                      default:
                        i(e, n);
                    }
                } catch (c) {
                    o(c);
                }
            }, 20); else {
                var s = 1e4, c = void 0, l = function() {
                    return clearInterval(c);
                }, d = function(e) {
                    l(), o(e);
                };
                c = window.setTimeout(function() {
                    return d("timeout call through bg page");
                }, s), m.emitBackground("tracking-call", {
                    msg: e,
                    data: n
                }, l);
            }
        }
        function i(e, t) {
            var n = e.split("."), r = n.pop(), o = n.reduce(function(e, t) {
                return t in e ? e[t] : {};
            }, g.tracker());
            return o && r && o[r] ? void o[r].apply(o, (0, u["default"])(t)) : console.error("No method " + e + " in tracker object");
        }
        function a(e, t) {
            console.info(e, t);
        }
        function s() {
            var e = w.slice(0);
            return w.length = 0, e;
        }
        var c = e("babel-runtime/core-js/object/assign"), l = (r(c), e("babel-runtime/helpers/toConsumableArray")), u = r(l), d = e("babel-runtime/core-js/object/keys"), f = r(d);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var p, m = e("../message"), h = e("../util"), g = e("./tracker"), b = e("./felogPixel"), v = e("../config"), _ = e("./felogClient"), y = e("lib/request");
        !function(e) {
            var t, n = h.isBg() ? new _.DefaultFelogClient(v.URLS.newFelog, v.appName, v.getVersion(), v.ENV, y.fetch.bind(window)) : void 0;
            !function(e) {
                function t(e, t, r, o) {
                    if (!n) throw Error("felogClient unavailable");
                    n.sendEvent(e, t, r, o)["catch"](function(n) {
                        return b.sendEventPixel(e, t, r, o);
                    });
                }
                e.sendFelog = t;
            }(t = e.methods || (e.methods = {})), e.CALL_HANDLER_ID = "tracking/RPC";
        }(p || (p = {})), n.callBgPage = (0, f["default"])(p.methods).reduce(function(e, t) {
            return e[t] = function() {
                for (var e = arguments.length, n = Array(e), r = 0; r < e; r++) n[r] = arguments[r];
                return o.apply(void 0, [ p.CALL_HANDLER_ID, t ].concat(n));
            }, e;
        }, {});
        var w = [];
        n.call = o, n.getLog = s;
    }, {
        "../config": 224,
        "../message": 287,
        "../util": 322,
        "./felogClient": 314,
        "./felogPixel": 315,
        "./tracker": 320,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/toConsumableArray": 53,
        "lib/request": 300
    } ],
    313: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t, n, r, o, i, c, l) {
            var u = {
                message: i,
                logger: o,
                level: s.toFelogString(c),
                application: e,
                version: t,
                env: n
            };
            return l && (u.extra = l), r + "/log?json=" + encodeURIComponent((0, a["default"])(u));
        }
        var i = e("babel-runtime/core-js/json/stringify"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s;
        !function(e) {
            e[e.INFO = 0] = "INFO", e[e.WARN = 1] = "WARN", e[e.ERROR = 2] = "ERROR";
        }(s = n.LogLevel || (n.LogLevel = {})), function(e) {
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
        }(s = n.LogLevel || (n.LogLevel = {})), n.felogRequestUrl = o;
    }, {
        "babel-runtime/core-js/json/stringify": 34
    } ],
    314: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o), a = e("babel-runtime/helpers/createClass"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("@grammarly-npm/telemetry.ts/lib/timeseries_impl"), l = e("./felog"), u = function() {
            function e(t, n, r, o, a) {
                (0, i["default"])(this, e), this._baseUrl = t, this._appName = n, this._appVersion = r, 
                this._env = o, this._fetch = a, this._metrics = c.MetricsStorage.createRoot(this._env + "." + this._appName, this._baseUrl, this._fetch);
            }
            return (0, s["default"])(e, [ {
                key: "sendEvent",
                value: function(e, t, n, r) {
                    return this._fetch(l.felogRequestUrl(this._appName, this._appVersion, this._env, this._baseUrl, e, t, n, r), {
                        mode: "no-cors",
                        method: "get",
                        cache: "no-cache"
                    }).then(function(e) {})["catch"](function(e) {});
                }
            }, {
                key: "sendCounter",
                value: function(e, t) {
                    this._metrics.getCounter(e).increment(t);
                }
            }, {
                key: "sendTimer",
                value: function(e, t) {
                    this._metrics.getTimer(e).recordTime(t);
                }
            } ]), e;
        }();
        n.DefaultFelogClient = u;
    }, {
        "./felog": 313,
        "@grammarly-npm/telemetry.ts/lib/timeseries_impl": 13,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    315: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t, n, r) {
            var o = document.createElement("img");
            return o.src = c.felogRequestUrl(s.appName, s.getVersion(), s.ENV, s.URLS.newFelog, e, t, n, r), 
            a["default"].resolve();
        }
        var i = e("babel-runtime/core-js/promise"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("../newConfig"), c = e("./felog");
        n.sendEventPixel = o;
    }, {
        "../newConfig": 288,
        "./felog": 313,
        "babel-runtime/core-js/promise": 43
    } ],
    316: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var t = e("./bgonly"), n = t.init, r = t.processCookiesFromGrammarly;
            n()["catch"](function(e) {
                return p.logger.bgTrackingInitFail();
            }), h = e("./on").on, u.on("tracking-fire", function(e) {
                var t = e.msg, n = e.data;
                return i.apply(void 0, [ t ].concat((0, c["default"])(n)));
            }), u.on("tracker-init", r), u.on("tracking-call", function(e) {
                var t = e.msg, n = e.data, r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : l._f;
                f.call.apply(f, [ t ].concat((0, c["default"])(n))), r();
            }), i("activity-ping");
        }
        function i(e) {
            for (var t = arguments.length, n = Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
            if (l.isBg()) {
                if (!h[e]) return console.error("No handler specified for message: " + e);
                l.asyncCall(function() {
                    var t;
                    return (t = h)[e].apply(t, n);
                }, 20);
            } else u.emitBackground("tracking-fire", {
                msg: e,
                data: n
            });
        }
        function a() {
            function t() {
                n++, n > i && clearInterval(o);
                var e = {
                    mpCookie: r(d.MIXPANEL.cookie),
                    gnar: r("gnar_containerId"),
                    dapi: r("__fngrprnt__")
                };
                e.mpCookie && (clearInterval(o), u.emitBackground("tracker-init", e));
            }
            var n = 0, r = e("cookie");
            r["default"] && (r = r["default"]);
            var o = setInterval(t, 500), i = 10;
        }
        var s = e("babel-runtime/helpers/toConsumableArray"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("../util"), u = e("../message"), d = e("../config"), f = e("./call"), p = e("./logger");
        n.logger = p.logger;
        var m = e("./call");
        n.call = m.call, n.getLog = m.getLog;
        var h = {};
        n.initBg = o, n.fire = i, n.initContentScript = a;
    }, {
        "../config": 224,
        "../message": 287,
        "../util": 322,
        "./bgonly": 311,
        "./call": 312,
        "./logger": 317,
        "./on": 318,
        "babel-runtime/helpers/toConsumableArray": 53,
        cookie: "cookie"
    } ],
    317: [ function(e, t, n) {
        "use strict";
        function r() {
            window.addEventListener("error", function(e) {
                return n.logger.unhandledBgPageException(e);
            }), window.addEventListener("unhandledrejection", function(e) {
                return n.logger.unhandledBgPageRejection(e);
            });
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o = e("./call"), i = e("./telemetry"), a = e("../newConfig");
        n.logger = new i.Telemetry(o.callBgPage.sendFelog.bind(o.callBgPage)), a.isBg() && (console.info("Installing unhandled error loggers..."), 
        r());
    }, {
        "../newConfig": 288,
        "./call": 312,
        "./telemetry": 319
    } ],
    318: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o, i = e("babel-runtime/helpers/defineProperty"), a = r(i), s = e("babel-runtime/regenerator"), c = r(s), l = e("babel-runtime/helpers/slicedToArray"), u = r(l), d = e("babel-runtime/core-js/promise"), f = r(d), p = function(e, t, n, r) {
            return new (n || (n = f["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = e("../util"), h = e("./call"), g = e("./logger"), b = e("universal/bg/prefs"), v = e("extension-api");
        n.on = (o = {}, (0, a["default"])(o, "activity-ping", function() {}), (0, a["default"])(o, "daily-ping", function(e, t) {
            return p(this, void 0, void 0, c["default"].mark(function n() {
                var r, o, i, a, s, l, d;
                return c["default"].wrap(function(n) {
                    for (;;) switch (n.prev = n.next) {
                      case 0:
                        if (e) {
                            n.next = 2;
                            break;
                        }
                        return n.abrupt("return");

                      case 2:
                        return h.call("gnar.pingMaybe"), r = new b.PrefsImpl(v.getApi().preferences), n.next = 6, 
                        r.get("pingDate");

                      case 6:
                        if (o = n.sent, "string" != typeof o && (o = ""), i = o.split("|"), a = (0, u["default"])(i, 2), 
                        s = a[0], l = a[1], d = t ? "cookiesDisabled" : e, !(s && s > Date.now() && l === d)) {
                            n.next = 12;
                            break;
                        }
                        return n.abrupt("return");

                      case 12:
                        return g.logger.dailyPing(), n.next = 15, r.set("pingDate", [ m.getNextPingDate(), d ].join("|"));

                      case 15:
                      case "end":
                        return n.stop();
                    }
                }, n, this);
            }));
        }), (0, a["default"])(o, "app_signin_success", function(e) {
            h.call("gnar.track", "userLoginForm/accepted", {
                placement: e
            });
        }), (0, a["default"])(o, "app_signup_success", function(e) {
            h.call("gnar.track", "userAccountSignupForm/accepted", {
                placement: e
            });
        }), (0, a["default"])(o, "signin-error", function(e) {
            e.errorType = "Server-Side", h.call("gnar.track", "userLoginForm/rejected");
        }), (0, a["default"])(o, "signup-error", function(e) {
            e.errorType = "Server-Side", h.call("gnar.track", "userAccountSignupForm/rejected");
        }), (0, a["default"])(o, "upgrade-after-register", function() {
            return p(this, void 0, void 0, c["default"].mark(function e() {
                return c["default"].wrap(function(e) {
                    for (;;) switch (e.prev = e.next) {
                      case 0:
                        h.call("gnar.track", "Account_Type_Selected");

                      case 1:
                      case "end":
                        return e.stop();
                    }
                }, e, this);
            }));
        }), (0, a["default"])(o, "hook-clicked", function(e) {
            h.call("gnar.track", "upgradeHookClicked", {
                placement: e
            }), g.logger.userUpgradeClick(e);
        }), (0, a["default"])(o, "correct-btn-clicked", function() {
            h.call("gnar.track", "gbuttonClicked"), g.logger.gButtonClick();
        }), (0, a["default"])(o, "btn-disable-in-field", function(e) {
            h.call("gnar.track", "checkingInFieldToggled", {
                enabled: e
            }), g.logger.checkingToggledInField(e);
        }), (0, a["default"])(o, "button-change-state", function() {}), (0, a["default"])(o, "login-attempt", function(e) {
            h.call("gnar.track", "signInClicked", {
                placement: e
            });
        }), (0, a["default"])(o, "show-dictionary", function() {
            h.call("gnar.track", "showDictionary");
        }), (0, a["default"])(o, "referral-shown", function(e) {
            h.call("gnar.track", "referral/referralNotificationShown", {
                placement: e
            });
        }), (0, a["default"])(o, "referral-clicked", function(e) {
            h.call("gnar.track", "referral/referralButtonClicked", {
                placement: e
            });
        }), (0, a["default"])(o, "tab-connected", function(e, t, n) {
            var r = t.enabled, o = n.cookiesDisabled;
            this["daily-ping"](e, o), r || g.logger.disabledOnDomain();
        }), (0, a["default"])(o, "session-invalidate", function(e, t, n, r, o) {
            var i = e.id, a = e.anonymous, s = e.isTest;
            i !== t.id && (h.call("gnar.setUser", i, s), this["daily-ping"](i, r)), n && g.logger.sessionInvalidated(n, i !== t.id), 
            t.email && !t.anonymous && a && g.logger.unexpectedAnonymous({
                email: t.email,
                token: t.token,
                grauth: t.grauth,
                tokenEqualsGrauth: t.token === t.grauth,
                cookiesDisabled: r,
                reason: n
            });
        }), (0, a["default"])(o, "set-dapi-prop", function(e, t) {
            "dialectWeak" === e && h.call("gnar.track", "languageWeakPreference", {
                dialect: t
            }), g.logger.dapiPropInitialized(e, t);
        }), (0, a["default"])(o, "change-dialect", function(e) {
            var t = e.language, n = e.dialectWeak, r = {
                language: t
            };
            n && (r.sameAsWeak = t === n), h.call("gnar.track", "languageStrongPreference", r);
        }), (0, a["default"])(o, "change-defs", function(e) {
            h.call("gnar.track", "definitionsToggled", e), g.logger.toggleExtensionDefs(e.enabled);
        }), (0, a["default"])(o, "change-grammar", function(e) {
            h.call("gnar.track", "checkingToggled", e), g.logger.toggleExtension(e.enabled);
        }), (0, a["default"])(o, "popup-open", function() {
            h.call("gnar.track", "browserToolbarButtonClicked");
        }), (0, a["default"])(o, "popup-open-on-unsupported", function() {
            h.call("gnar.track", "browserToolbarButtonClicked/unsupported");
        }), (0, a["default"])(o, "cookie-overflow", function(e, t) {
            g.logger.cookieOverflow(e, t);
        }), (0, a["default"])(o, "premium-popup-show", function() {
            h.call("gnar.track", "upgradeReferralPopupShown");
        }), (0, a["default"])(o, "premium-popup-upgrade-click", function() {
            h.call("gnar.track", "upgradeReferralPremiumBtnClicked");
        }), (0, a["default"])(o, "premium-popup-referral-click", function() {
            h.call("gnar.track", "upgradeReferralInviteBtnClicked");
        }), (0, a["default"])(o, "email-perception-popup-show", function() {
            h.call("gnar.track", "askForFeedback-popup-show"), g.logger.emailPerceptionPopupShow();
        }), (0, a["default"])(o, "email-perception-popup-cancel", function() {
            h.call("gnar.track", "askForFeedback-popup-cancel"), g.logger.emailPerceptionPopupCancel();
        }), (0, a["default"])(o, "email-perception-button-hover", function() {
            h.call("gnar.track", "askForFeedback-button-hover"), g.logger.emailPerceptiongButtonHover();
        }), (0, a["default"])(o, "onboarding-popup-show", function() {
            h.call("gnar.track", "onboarding-popup-show"), g.logger.onboardingPopupShow();
        }), (0, a["default"])(o, "onboarding-popup-cancel", function() {
            h.call("gnar.track", "onboarding-popup-cancel"), g.logger.onboardingPopupCancel();
        }), (0, a["default"])(o, "onboardingTutorial-popup-show", function() {
            h.call("gnar.track", "onboardingTutorial-popup-show"), g.logger.onboardingTutorialShow();
        }), (0, a["default"])(o, "onboardingTutorialNext-button-click", function() {
            h.call("gnar.track", "onboardingTutorialNext-button-click");
        }), (0, a["default"])(o, "onboardingTutorialPersonalize-button-click", function() {
            h.call("gnar.track", "onboardingTutorialPersonalize-button-click");
        }), (0, a["default"])(o, "onboardingTutorialSave-button-click", function() {
            h.call("gnar.track", "onboardingTutorialSave-button-click");
        }), (0, a["default"])(o, "onboardingTutorialLetsWrite-button-click", function() {
            h.call("gnar.track", "onboardingTutorialLetsWrite-button-click");
        }), o);
    }, {
        "../util": 322,
        "./call": 312,
        "./logger": 317,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/slicedToArray": 52,
        "babel-runtime/regenerator": 55,
        "extension-api": 184,
        "universal/bg/prefs": 330
    } ],
    319: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/json/stringify"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/createClass"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var u = e("./felog"), d = function() {
            function e(t) {
                var n = this;
                (0, s["default"])(this, e), this._sendFelog = t, this.pageLoadTimeout = function() {
                    n._send("cs.connection.failover.pageLoad.timeout", "content script init failed", u.LogLevel.ERROR);
                }, this.appLoadTimeout = function() {
                    n._send("cs.connection.failover.appLoad.timeout", "extension init timed out", u.LogLevel.ERROR);
                }, this.differentStateDomain = function(e) {
                    n._send("cs.state.differentDomain", "received state for different domain", u.LogLevel.INFO, {
                        stateDomain: e
                    });
                }, this.restoredBgConnection = function(e) {
                    n._send("cs.connection.bg.restored", "bg page connection restored", u.LogLevel.INFO, {
                        timeWithoutConnection: e
                    });
                }, this.initWithoutBgConnection = function() {
                    n._send("cs.connection.bg.disconnected", "no connection to bg page", u.LogLevel.INFO);
                }, this.fetchDefinitionsFail = function() {
                    n._send("cs.connection.api.definition.failed", "definitions fetch failed", u.LogLevel.WARN);
                }, this.infinityCheckResetFail = function(e) {
                    n._send("cs.connection.infiniteCheck.failed", "infinite check reset failed", u.LogLevel.ERROR, {
                        delay: e
                    });
                }, this.tooLongPageConfigInit = function(e) {
                    n._send("cs.pageConfig.init.exceeded", "page config init timeout", u.LogLevel.WARN, {
                        initTime: e
                    });
                }, this.tooLongUserUpdateTime = function(e) {
                    n._send("bg.state.user.update.exceeded", "user state update took too long", u.LogLevel.WARN, {
                        updateTime: e
                    });
                }, this.lostBgPageConnection = function() {
                    n._send("cs.gbutton.bgСonnection.lost", "gbutton connection to bg page lost", u.LogLevel.INFO);
                }, this.restoreBgPageConnection = function(e) {
                    n._send("cs.gbutton.bgСonnection.restored", "gbutton connection to bg page restored", u.LogLevel.INFO, {
                        time: e
                    });
                }, this.badCursorPosition = function() {
                    n._send("cs.editor.badCursorPosition", "incorrect cursor position in grammarly-editor", u.LogLevel.INFO);
                }, this.cursorJump = function() {
                    n._send("cs.editor.cursorJump", "cursor jump detected", u.LogLevel.WARN);
                }, this.signinOpen = function() {
                    n._send("cs.signin.open", "sign in dialog opened", u.LogLevel.INFO);
                }, this.signinClose = function(e) {
                    n._send("cs.signin.close", "sign in dialog closed", u.LogLevel.INFO, {
                        openTime: e
                    });
                }, this.tabReloadClick = function() {
                    n._send("cs.gbutton.reload.click", "gbutton reload clicked", u.LogLevel.WARN);
                }, this.popupLoadError = function(e, t) {
                    n._send("cs.popup.load.error", "could not open pop-up editor", u.LogLevel.ERROR, {
                        message: e,
                        name: t
                    });
                }, this.loginNoBgPageConnection = function(e) {
                    n._send("debug.cs.connection.signin.bg.timeout", "can not connect to bg page on login", u.LogLevel.INFO, {
                        message: e
                    });
                }, this.pageConfigCDNError = function(e) {
                    n._send("cs.pageConfig.cdn.error", "could not read page config", u.LogLevel.ERROR, {
                        message: e
                    });
                }, this.pageConfigLocalStorageError = function(e, t) {
                    n._send("cs.pageConfig.localStorage.error", "could not read page config from localStorage", u.LogLevel.INFO, {
                        message: e,
                        name: t
                    });
                }, this.pageConfigUpdated = function(e, t) {
                    n._send("cs.pageConfig.updated", "page config updated", u.LogLevel.INFO, {
                        oldVersion: e,
                        newVersion: t
                    });
                }, this.settingsPopupTimeout = function() {
                    n._send("settings.popup.init.timeout", "settings popup open timeout", u.LogLevel.WARN);
                }, this.settingsUsupportedShow = function(e) {
                    n._send("settings.popup.state.unsupported.show", "page unsupported message shown", u.LogLevel.INFO, {
                        popupType: e
                    });
                }, this.settingsPopupToggled = function(e) {
                    n._send("settings.popup.experiment.toggle", "settings popup disabled/enabled for experiment on /personalize page", u.LogLevel.INFO, {
                        isPopupDisabled: e
                    });
                }, this.socketBgError = function() {
                    n._send("bg.socket.error", "bg page socket error", u.LogLevel.WARN);
                }, this.capiNotAuthorizedLoop = function(e, t) {
                    n._send("debug.socket.notAuthorizedLoop", "could not authenticate on capi and auth", u.LogLevel.INFO, {
                        authDegradation: e,
                        cookiesDisabled: t
                    });
                }, this.socketDisabledCookie = function() {
                    n._send("debug.socket.disabledCookies", "disabled cookies after failed authentication", u.LogLevel.INFO);
                }, this.socketBgRestored = function(e) {
                    n._send("debug.bg.socket.restored", "capi session restored", u.LogLevel.INFO, {
                        tryCount: e
                    });
                }, this.socketBgReconnectFail = function(e, t) {
                    n._send("bg.socket.reconnect.fail", "could not restore ws connection", u.LogLevel.WARN, {
                        token: e,
                        tryCount: t
                    });
                }, this.socketCsError = function() {
                    n._send("cs.socket.error", "content script socket error", u.LogLevel.WARN);
                }, this.soketCsErrorMsg = function(e) {
                    n._send("cs.socket.errorMsg", "capi error", u.LogLevel.WARN, {
                        message: e
                    });
                }, this.gnarClientInitFail = function(e) {
                    n._send("gnar.bg.tracking.gnar.init.fail", "gnar init failed", u.LogLevel.WARN, {
                        message: e
                    });
                }, this.bgTrackingInitFail = function() {
                    n._send("debug.tracking.init.fail", "bg page tracking library init failed", u.LogLevel.INFO);
                }, this.dailyPing = function() {
                    n._send("debug.dailyPing", "daily ping", u.LogLevel.INFO);
                }, this.userUpgradeClick = function(e) {
                    n._send("cs.ui.action.upgradeClick", "upgrade hook clicked", u.LogLevel.INFO, {
                        placement: e
                    });
                }, this.gButtonClick = function() {
                    n._send("cs.ui.gbutton.click", "gbutton clicked", u.LogLevel.INFO);
                }, this.checkingToggledInField = function(e) {
                    n._send("cs.ui.gbutton.toggleInField", "checking toggled in field", u.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.disabledOnDomain = function() {
                    n._send("cs.state.disabledOnDomain", "checking disabled for domain", u.LogLevel.INFO);
                }, this.sessionInvalidated = function(e, t) {
                    n._send("bg.session.invalidated", "user session invalidated", u.LogLevel.INFO, {
                        reason: e,
                        userChanged: t
                    });
                }, this.unexpectedAnonymous = function(e) {
                    n._send("debug.bg.session.unexpectedAnonymous", "user changed to anonymous", u.LogLevel.INFO, e);
                }, this.dapiPropInitialized = function(e, t) {
                    n._send("bg.settings.dapi.prop.init", "save property to the DAPI", u.LogLevel.INFO, {
                        name: e,
                        value: t
                    });
                }, this.getDapiPropError = function(e, t) {
                    n._send("bg.connection.dapi.getProp.error", "could not get dapi property", u.LogLevel.WARN, {
                        property: e,
                        body: t
                    });
                }, this.setDapiPropError = function(e, t) {
                    n._send("bg.connection.dapi.setProp.error", "could not set dapi property", u.LogLevel.WARN, {
                        property: e,
                        body: t
                    });
                }, this.toggleExtensionDefs = function(e) {
                    n._send("bg.settings.definitions.toggle", "definitions toggled for domain", u.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.toggleExtension = function(e) {
                    n._send("bg.settings.extension.toggle", "extension toggled for domain", u.LogLevel.INFO, {
                        enabled: e
                    });
                }, this.cookieOverflow = function(e, t) {
                    n._send("debug.bg.state.cookie.overflow", "cookie is too big", u.LogLevel.INFO, {
                        size: e,
                        biggestCookie: t
                    });
                }, this.externalChangePlan = function() {
                    n._send("bg.api.external.changePlan", "plan changed from editor", u.LogLevel.INFO);
                }, this.externalChangeDialect = function() {
                    n._send("bg.api.external.changeDialect", "dialect changed from editor", u.LogLevel.INFO);
                }, this.externalChangeUser = function() {
                    n._send("bg.api.external.changeUsed", "user changed from editor", u.LogLevel.INFO);
                }, this.externalLogout = function() {
                    n._send("bg.api.external.logout", "user logged out form editor", u.LogLevel.INFO);
                }, this.externalEnableEmailPerception = function() {
                    n._send("bg.api.external.enableEmailPerception", "user enabled email perception feature on the funnel", u.LogLevel.INFO);
                }, this.bgPageStartFail = function(e, t) {
                    n._send("bg.start.fail", "bg page start failed", u.LogLevel.ERROR, {
                        message: e,
                        stack: t
                    });
                }, this.bgPageInitTimeout = function(e) {
                    n._send("bg.state.start.timeout", "bg page init timeout", u.LogLevel.WARN, {
                        initTime: e
                    });
                }, this.bgPageInitFail = function(e) {
                    n._send("bg.state.init.fail", "bg page init failed", u.LogLevel.ERROR, {
                        initAttempts: e
                    });
                }, this.extensionUpdated = function(e, t) {
                    n._send("bg.state.updated", "extension updated", u.LogLevel.INFO, {
                        currentVersion: e,
                        previousVersion: t
                    });
                }, this.extensionUpdateFail = function(e) {
                    n._send("bg.state.update.fail", "extension update failed", u.LogLevel.INFO, {
                        previousVersion: e
                    });
                }, this.cannotGetInstallSource = function() {
                    n._send("bg.getSource.fail", "failed to get extension install source", u.LogLevel.WARN);
                }, this.extensionInstall = function(e) {
                    n._send("bg.state.install", "extension installed", u.LogLevel.INFO, {
                        source: e
                    });
                }, this.chromeForcedToUpdate = function(e) {
                    n._send("bg.chrome.forcedToUpdate", "chrome forced update", u.LogLevel.INFO, {
                        newVersion: e
                    });
                }, this.chromeContentScriptLoadError = function(e, t) {
                    n._send("bg.chrome.cs.load.error", "content script execution error", u.LogLevel.WARN, {
                        message: e,
                        type: t
                    });
                }, this.reloadNotificationShow = function() {
                    n._send("bg.ui.notification.tabsReload.show", "extension reload notification shown", u.LogLevel.WARN);
                }, this.reloadNotificationClick = function() {
                    n._send("bg.ui.notification.tabsReload.click", "reload notification clicked", u.LogLevel.INFO);
                }, this.fetchUserFail = function(e, t, r) {
                    n._send("bg.user.fetch.fail", "failed to update user", u.LogLevel.WARN, {
                        body: t,
                        statusCode: r,
                        reason: e
                    });
                }, this.fetchMimicFail = function(e, t) {
                    n._send("bg.user.mimic.fail", "mimic request failed", u.LogLevel.WARN, {
                        body: e,
                        statusCode: t
                    });
                }, this.fetchCookieFail = function() {
                    n._send("bg.cookie.fail", "could not get grauth from cookie", u.LogLevel.WARN);
                }, this.fetchSettingsFail = function(e, t) {
                    n._send("bg.user.settings.fail", "could not get settings from auth", u.LogLevel.WARN, {
                        body: e,
                        statusCode: t
                    });
                }, this.frequentCookieChanges = function(e) {
                    n._send("debug.cookie.onChange.error", "cookie change too frequent", u.LogLevel.INFO, {
                        canceled: e
                    });
                }, this.initializePropFromDapi = function(e) {
                    n._send("bg.state.dapi.prop.initialize", "set property from dapi", u.LogLevel.INFO, {
                        name: e
                    });
                }, this.emailPerceptionPopupShow = function() {
                    n._send("cs.emailPerception.popup.show", "show email perception popup on gmail/inbox domain", u.LogLevel.INFO);
                }, this.emailPerceptionPopupCancel = function() {
                    n._send("cs.emailPerception.popup.cancel", "user canceled email perception popup on gmail/inbox", u.LogLevel.INFO);
                }, this.emailPerceptiongButtonHover = function() {
                    n._send("cs.emailPerception.gbutton.hover", "user hovered gButton and ask for feedback btn is shown on gmail/inbox", u.LogLevel.INFO);
                }, this.onboardingPopupShow = function() {
                    n._send("cs.onboarding.popup.show", "show onboarding popup to user after first time extension install", u.LogLevel.INFO);
                }, this.onboardingPopupCancel = function() {
                    n._send("cs.onboarding.popup.cancel", "user canceled onboarding popup", u.LogLevel.INFO);
                }, this.onboardingTutorialShow = function() {
                    n._send("cs.onboarding.tutorial.show", "opened onboarding dialog after popup", u.LogLevel.INFO);
                }, this.onboardingVideoLoaded = function() {
                    n._send("cs.onboarding.tutorial.video.loaded", "load video data for onboarding tutorial", u.LogLevel.INFO);
                }, this.saveEmailFeedbackError = function(e) {
                    n._send("bg.emailfeedback.save.error", "failed to save email feedback", u.LogLevel.INFO, {
                        body: e
                    });
                }, this.incognitoInit = function() {
                    n._send("bg.incognito.init", "extension initialized in incognito mode", u.LogLevel.INFO);
                }, this.disabledCookiesInit = function() {
                    n._send("bg.cookie.disabled", "extension initialized with disabled cookies", u.LogLevel.INFO);
                }, this.proxyInit = function() {
                    n._send("proxy.init", "proxy script initialized", u.LogLevel.INFO);
                }, this.proxyPortDisconnected = function(e, t) {
                    n._send("proxy.disconnect", "proxy port disconnected", u.LogLevel.INFO, {
                        port: e,
                        error: t
                    });
                }, this.unhandledBgPageException = function(e) {
                    n._send("bg.unhandledException", "unhandled exception on background page", u.LogLevel.ERROR, {
                        message: e.error ? e.error.message : e.message
                    });
                }, this.unhandledBgPageRejection = function(e) {
                    n._send("bg.unhandledRejection", "unhandled promise rejection on background page", u.LogLevel.ERROR, {
                        message: null != e.reason ? "string" == typeof e.reason ? e.reason : e.reason.message : void 0
                    });
                }, this.storageMigrationSucceeded = function() {
                    n._send("bg.storageMigration.success", "storage migration succeeded", u.LogLevel.INFO, {});
                }, this.storageMigrationFailed = function(e) {
                    n._send("bg.storageMigration.failure", "storage migration failed", u.LogLevel.ERROR, {
                        message: e && e.message
                    });
                }, this.cardShowAction = function() {
                    n._send("cs.editor.card.show", "show card action", u.LogLevel.INFO);
                }, this.cardHideAction = function() {
                    n._send("cs.editor.card.hide", "hide card action", u.LogLevel.INFO);
                }, this.cardReplacementAction = function() {
                    n._send("cs.editor.card.replacement", "click on the replacement in the card", u.LogLevel.INFO);
                }, this.cardAddToDictAction = function() {
                    n._send("cs.editor.card.addToDict", "click add to dictionary button in the card", u.LogLevel.INFO);
                }, this.cardIgnoreAction = function() {
                    n._send("cs.editor.card.ignore", "click ignore button in the card", u.LogLevel.INFO);
                }, this.synonymCardShowAction = function(e) {
                    n._send("cs.editor.synonym.show", "show synonymous card action", u.LogLevel.INFO, {
                        notFoundCard: e
                    });
                }, this.synonymCardHideAction = function(e) {
                    n._send("cs.editor.synonym.hide", "hide synonymous card action", u.LogLevel.INFO, {
                        notFoundCard: e
                    });
                }, this.synonymReplacementAction = function() {
                    n._send("cs.editor.synonym.replacement", "click on the replacement in the synonym", u.LogLevel.INFO);
                }, this.dictCardShowAction = function() {
                    n._send("cs.editor.dict.show", "show dictionary card action", u.LogLevel.INFO);
                }, this.dictCardHideAction = function() {
                    n._send("cs.editor.dict.hide", "hide dictionary card action", u.LogLevel.INFO);
                };
            }
            return (0, l["default"])(e, [ {
                key: "_send",
                value: function(e, t, n, r) {
                    var o = void 0;
                    try {
                        o = (0, i["default"])(r);
                    } catch (a) {
                        o = "Failed to stringify event properties: '" + a + "', '" + (a && a.message) + "'", 
                        console.warn(o, "for " + t + "@" + e);
                    }
                    try {
                        this._sendFelog(e, t, n, null != r ? {
                            json: o
                        } : void 0);
                    } catch (a) {
                        console.warn("Failed to send felog for " + t + "@" + e + ": '" + a + "', '" + (a && a.message) + "'");
                    }
                }
            } ]), e;
        }();
        n.Telemetry = d;
    }, {
        "./felog": 313,
        "babel-runtime/core-js/json/stringify": 34,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47
    } ],
    320: [ function(e, t, n) {
        "use strict";
        function r() {
            return window.tracker = window.tracker || {}, window.tracker;
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.tracker = r;
    }, {} ],
    321: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            return e + "=" + encodeURIComponent(t);
        }
        function o(e, t) {
            return r("utm_medium", l) + "&" + r("utm_source", e) + "&" + r("utm_campaign", t);
        }
        function i(e, t) {
            return c.URLS.signup + "?" + o(e, t);
        }
        function a(e, t) {
            return c.URLS.upgrade + "?" + o(e, t);
        }
        function s(e, t, n) {
            return e + "&" + o(t, n);
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("./newConfig"), l = "internal";
        n.getSignUpURL = i, n.getUpgradeURL = a, n.addParamsToUpgradeURL = s;
    }, {
        "./newConfig": 288
    } ],
    322: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = [ "freeeeeeee@grammarly.com", "premiumuser@grammarly.com" ].indexOf(e) !== -1;
            return !t && /^.*@grammarly.com$/.test(e);
        }
        function i() {
            return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
        }
        function a(e) {
            return !!(e && e.constructor && e.call && e.apply);
        }
        function s(e, t) {
            function n() {
                function n() {
                    o(), e();
                }
                function o() {
                    var o = setTimeout(n, t);
                    r[e] = o;
                }
                o();
            }
            var r = s.items = s.items || {}, o = r[e];
            if (o || t) return o && !t ? (clearTimeout(o), void delete r[e]) : void n();
        }
        function c(e) {
            s(e);
        }
        function l() {
            return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
        }
        function u() {
            return l() + l() + "-" + l() + "-" + l() + "-" + l() + "-" + l() + l() + l();
        }
        function d() {}
        function f() {
            return !0;
        }
        function p() {
            window.chrome && window.chrome.runtime && window.chrome.runtime.reload ? window.chrome.runtime.reload() : window.location.reload();
        }
        function m(e) {
            if (e.location) {
                var t = "mail.google.com" == e.location.host, n = e.querySelector("iframe#js_frame") && e.querySelector("iframe#sound_frame");
                return t || n;
            }
        }
        function h(e) {
            return /^[-!#$%&\'*+\\.\/0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\.\/0-9=?A-Z^_`a-z{|}~]+$/.test(e);
        }
        function g(e) {
            return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        function b(e, t) {
            return t[1 == e ? 0 : 1];
        }
        function v(e) {
            return K.transform(e, function(e, t) {
                return e[t] = d;
            });
        }
        function _(e, t, n) {
            var r = {}, o = function() {
                var o = "_memoize_" + (t ? t.apply(this, arguments) : arguments[0]);
                return window.hasOwnProperty.call(r, o) ? r[o] : (n && setTimeout(function() {
                    delete r[o];
                }, n), r[o] = e.apply(this, arguments));
            };
            return o;
        }
        function y(e, t) {
            return (0, G["default"])(t).reduce(function(n, r) {
                return (0, W["default"])({}, n, (0, B["default"])({}, r, function() {
                    for (var n = arguments.length, o = Array(n), i = 0; i < n; i++) o[i] = arguments[i];
                    return e.then(function() {
                        return t[r].apply(t, o);
                    });
                }));
            }, {});
        }
        function w(e) {
            return new H["default"](function(t) {
                return e(t);
            });
        }
        function k(e, t) {
            return Math.floor(Math.random() * (t - e + 1)) + e;
        }
        function C(e) {
            return new H["default"](function(t) {
                return setTimeout(t, e);
            });
        }
        function x(e) {
            if (e) {
                var t = new Date(e);
                if ("Invalid Date" !== t.toString()) return X[t.getMonth()] + " " + t.getDate() + ", " + t.getFullYear();
            }
        }
        function E(e) {
            var t = function() {};
            return t.prototype = e(), t;
        }
        function S() {
            function e(e) {
                return e.split(".").map(function(e) {
                    return Number(e) || 0;
                });
            }
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "", r = e(t), o = e(n), i = Array(Math.abs(r.length - o.length)).fill(0);
            if (r.length > o.length ? o.push.apply(o, (0, D["default"])(i)) : r.push.apply(r, (0, 
            D["default"])(i)), r.every(function(e, t) {
                return e === o[t];
            })) return 0;
            for (var a = 0, s = r.length; a < s; a++) {
                if (r[a] > o[a]) return 1;
                if (r[a] < o[a]) return -1;
            }
            return -1;
        }
        function T() {
            return q(this, void 0, void 0, R["default"].mark(function e() {
                return R["default"].wrap(function(e) {
                    for (;;) switch (e.prev = e.next) {
                      case 0:
                        if (Q.isWE()) {
                            e.next = 2;
                            break;
                        }
                        return e.abrupt("return", null);

                      case 2:
                        return e.prev = 2, e.next = 5, H["default"].race([ new H["default"](function(e) {
                            return window.chrome.runtime.sendMessage("ping", e);
                        }), C(1e4).then(function(e) {
                            return "timeouted";
                        }) ]);

                      case 5:
                        return e.abrupt("return", e.sent);

                      case 8:
                        return e.prev = 8, e.t0 = e["catch"](2), e.abrupt("return", "orphaned");

                      case 11:
                      case "end":
                        return e.stop();
                    }
                }, e, this, [ [ 2, 8 ] ]);
            }));
        }
        function N(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 10;
            setTimeout(e, t);
        }
        function P() {
            function e(e) {
                if (a.length > 0) {
                    var t = a.shift();
                    t(e);
                } else o ? i.push(e) : i[0] = e;
            }
            function t() {
                return i.length ? H["default"].resolve(i.shift()) : new H["default"](function(e) {
                    return a.push(e);
                });
            }
            var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r = n.buffered, o = void 0 === r || r, i = [], a = [];
            return {
                take: t,
                put: e
            };
        }
        function A(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 100;
            if (!e) return NaN;
            var n = Y.createHash("superfasthash");
            return parseInt(n.hash(e), 16) % t;
        }
        function j(e) {
            return e.which || e.charCode || e.keyCode || 0;
        }
        function I() {
            var e = new Date();
            return e.getHours() > 2 && e.setDate(e.getDate() + 1), e.setHours(3), e.setMinutes(Math.floor(60 * Math.random())), 
            e.getTime();
        }
        function L(e) {
            return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        var M = e("babel-runtime/regenerator"), R = r(M), O = e("babel-runtime/helpers/toConsumableArray"), D = r(O), F = e("babel-runtime/helpers/defineProperty"), B = r(F), U = e("babel-runtime/core-js/object/assign"), W = r(U), V = e("babel-runtime/core-js/object/keys"), G = r(V), z = e("babel-runtime/core-js/promise"), H = r(z), q = function(e, t, n, r) {
            return new (n || (n = H["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var K = e("lodash"), Y = e("non-crypto-hash"), Q = e("./newConfig"), J = e("./newConfig");
        n.isTestsMode = J.isTestsMode, n.getBrowser = J.getBrowser, n.isBg = J.isBg, n.isBgOrPopup = J.isBgOrPopup, 
        n.isSafariSettingsPopup = J.isSafariSettingsPopup, n.isChrome = J.isChrome, n.isFF = J.isFF, 
        n.isPopup = J.isPopup, n.isSafari = J.isSafari, n.isEdge = J.isEdge, n.isSafari8 = J.isSafari8, 
        n.isWE = J.isWE, n.isWindows = J.isWindows, n.isGrammarlyEmail = o, n.chromeBgError = i, 
        n.isFunction = a, n.interval = s, function(e) {
            e.items = {};
        }(s = n.interval || (n.interval = {})), n.cancelInterval = c, n.guid = u, n._f = d, 
        n._F = f, n.bgPageReload = p, n.isGmail = m, n.isValidEmail = h, n.formatNumber = g, 
        n.declension = b, n.stub = v, n.memoize = _, n.syncWait = y, n.promisify = w, n.getRandomIntInclusive = k, 
        n.delay = C;
        var X = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        n.formatDate = x, n.createClass = E, n.versionComparator = S, n.isBgAlive = T, n.asyncCall = N, 
        n.createChannel = P, n.normalizedHashCode = A, n.keyCode = j, n.SECOND = 1e3, n.MINUTE = 60 * n.SECOND, 
        n.HOUR = 60 * n.MINUTE, n.DAY = 24 * n.HOUR, n.ESC_KEY = 27, n.ENTER_KEY = 13, n.pastDays = function(e) {
            return Math.round(Math.abs(+new Date() - +new Date(e)) / n.DAY);
        }, n.getNextPingDate = I, n.escapeRegExp = L;
    }, {
        "./newConfig": 288,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/toConsumableArray": 53,
        "babel-runtime/regenerator": 55,
        lodash: "lodash",
        "non-crypto-hash": "non-crypto-hash"
    } ],
    323: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t, n, r) {
            var o = r ? t + "_forced" : t, i = {
                listeners: []
            }, a = function() {
                var e = i.listeners.indexOf(n);
                e > -1 && i.listeners.splice(e, 1);
            };
            if ("on" === e || "once" === e) {
                if (m[o] = m[o] || {
                    domEventListener: function(t) {
                        p.emit(o, t), "once" === e && a();
                    },
                    listeners: []
                }, i = m[o], i.domEventListener) {
                    var s = function(e) {
                        i.domEventListener && i.domEventListener((0, u["default"])({
                            originalEvent: e,
                            preventDefault: f._f,
                            stopPropagation: f._f
                        }, e.detail));
                    };
                    i.listenerWrapper = i.listenerWrapper || s;
                }
                0 === i.listeners.length && (i.domEventListener && window.addEventListener(t, i.domEventListener, r), 
                i.listenerWrapper && window.addEventListener(t + "-gr", i.listenerWrapper, r)), 
                i.listeners.push(n);
            }
            if ("un" === e) {
                var c = m[o];
                if (!c) return;
                a(), 0 === c.listeners.length && (c.domEventListener && window.addEventListener(t, c.domEventListener, r), 
                c.listenerWrapper && window.addEventListener(t + "-gr", c.listenerWrapper, r));
            }
            p[e](o, n);
        }
        var i = e("babel-runtime/core-js/object/keys"), a = r(i), s = e("babel-runtime/helpers/typeof"), c = r(s), l = e("babel-runtime/core-js/object/assign"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("emitter"), f = e("./util"), p = d({}), m = {}, h = function(e) {
            return function(t, n) {
                var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                "object" === ("undefined" == typeof t ? "undefined" : (0, c["default"])(t)) ? (0, 
                a["default"])(t).map(function(n) {
                    return o(e, n, t[n], r);
                }) : n && o(e, t, n, r);
            };
        };
        n.on = h("on"), n.off = h("un"), n.once = h("one");
    }, {
        "./util": 322,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/helpers/typeof": 54,
        emitter: "emitter"
    } ],
    324: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            var n;
            return (n = []).concat.apply(n, (0, g["default"])(t.map(e)));
        }
        function i(e, t, n) {
            for (var r = [ t ], o = t, i = 0; i < n.length; i++) o = e(o, n[i]), r.push(o);
            return r;
        }
        function a(e) {
            return e.reduce(function(e, t) {
                return t > e ? t : e;
            }, e[0]);
        }
        function s(e, t) {
            return 0 === e.length ? void 0 : e.reduce(function(e, n) {
                var r = t(n);
                return r > e[1] ? [ n, r ] : e;
            }, [ e[0], t(e[0]) ])[0];
        }
        function c(e) {
            return e.slice().reverse();
        }
        function l(e, t) {
            for (var n = [], r = [], o = 0, i = 0, a = 0; a < t.length; a++) e(t[a]) ? n[o++] = t[a] : r[i++] = t[a];
            return [ n, r ];
        }
        function u(e, t) {
            if (e < 1) throw new Error("Invalid chunk size, expected > 0");
            if (0 === t.length) return [ [] ];
            for (var n = [], r = 0; r < Math.ceil(t.length / e); r++) n.push(t.slice(r * e, (r + 1) * e));
            return n;
        }
        function d(e, t) {
            for (var n = [], r = e(t); void 0 !== r; ) n.push(r[0]), r = e(r[1]);
            return n;
        }
        function f(e, t) {
            return void 0 !== t ? (0, m["default"])(Array(t - e), function(t, n) {
                return n + e;
            }) : (0, m["default"])(Array(e), function(e, t) {
                return t;
            });
        }
        var p = e("babel-runtime/core-js/array/from"), m = r(p), h = e("babel-runtime/helpers/toConsumableArray"), g = r(h);
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.flatMap = o, n.scan = i, n.maximum = a, n.maximumBy = s, n.reverse = c, n.partition = l, 
        n.chunkBySize = u, n.unfold = d, n.range = f;
    }, {
        "babel-runtime/core-js/array/from": 31,
        "babel-runtime/helpers/toConsumableArray": 53
    } ],
    325: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            if (!e) throw new m(t);
        }
        function i(e, t) {
            if (null == e) throw new m(function() {
                return t ? "Expected " + t + " to be non-null" : "Expected non-null";
            });
            return e;
        }
        var a = e("babel-runtime/core-js/object/get-prototype-of"), s = r(a), c = e("babel-runtime/helpers/classCallCheck"), l = r(c), u = e("babel-runtime/helpers/possibleConstructorReturn"), d = r(u), f = e("babel-runtime/helpers/inherits"), p = r(f);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var m = function(e) {
            function t(e) {
                return (0, l["default"])(this, t), (0, d["default"])(this, (t.__proto__ || (0, s["default"])(t)).call(this, "Assertion failed: " + (e ? "string" == typeof e ? e : e() : "(unnamed)")));
            }
            return (0, p["default"])(t, e), t;
        }(Error);
        n.AssertionError = m, n.assert = o, n.assertNonNull = i;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51
    } ],
    326: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/helpers/classCallCheck"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("emitter"), s = function c() {
            var e = this, t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            (0, i["default"])(this, c), this.on = function(t, n) {
                return e._internalEmitter.on(t, n);
            }, this.one = function(t, n) {
                return e._internalEmitter.one(t, n);
            }, this.off = function(t, n) {
                return e._internalEmitter.off(t, n);
            }, this.emit = function(t, n) {
                return e._internalEmitter.emit(t, n);
            }, this.delegate = function(t, n, r) {
                return e._internalEmitter.delegate(t, n, r);
            }, this._internalEmitter = a(t);
        };
        n.Emitter = s;
    }, {
        "babel-runtime/helpers/classCallCheck": 46,
        emitter: "emitter"
    } ],
    327: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var r = e("./assert");
        n.assert = r.assert, n.assertNonNull = r.assertNonNull, n.AssertionError = r.AssertionError;
        var o = e("./promise");
        n.SafePromise = o.SafePromise;
        var i = e("./array");
        n.Arr = i;
        var a = e("./object");
        n.Obj = a;
    }, {
        "./array": 324,
        "./assert": 325,
        "./object": 328,
        "./promise": 329
    } ],
    328: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e, t) {
            var n = {};
            return (0, l["default"])(t).forEach(function(r) {
                return n[r] = e(r, t[r]);
            }), n;
        }
        function i(e, t) {
            var n = {};
            return (0, l["default"])(t).forEach(function(r) {
                e(r, t[r]) && (n[r] = t[r]);
            }), n;
        }
        function a(e) {
            return (0, l["default"])(e).map(function(t) {
                return e[t];
            });
        }
        function s(e) {
            return (0, l["default"])(e).map(function(t) {
                return [ t, e[t] ];
            });
        }
        var c = e("babel-runtime/core-js/object/keys"), l = r(c);
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.map = o, n.filter = i, n.values = a, n.pairs = s;
    }, {
        "babel-runtime/core-js/object/keys": 41
    } ],
    329: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/promise"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a;
        !function(e) {
            function t(e) {
                return new i["default"](e);
            }
            function n() {
                var e = void 0, t = void 0, n = new i["default"](function(n, r) {
                    e = n, t = r;
                });
                return {
                    promise: n,
                    resolve: function(t) {
                        e(t);
                    },
                    reject: function(e) {
                        t(e);
                    }
                };
            }
            function r(e) {
                return t(function(t, n) {
                    return t(e());
                });
            }
            e.create = t, e.createCompletionSource = n, e.sync = r;
        }(a = n.SafePromise || (n.SafePromise = {}));
    }, {
        "babel-runtime/core-js/promise": 43
    } ],
    330: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/json/stringify"), i = r(o), a = e("babel-runtime/core-js/object/keys"), s = r(a), c = e("babel-runtime/helpers/typeof"), l = r(c), u = e("babel-runtime/helpers/defineProperty"), d = r(u), f = e("babel-runtime/core-js/object/assign"), p = r(f), m = e("babel-runtime/helpers/classCallCheck"), h = r(m), g = e("babel-runtime/regenerator"), b = r(g), v = e("babel-runtime/core-js/promise"), _ = r(v), y = function(e, t, n, r) {
            return new (n || (n = _["default"]))(function(o, i) {
                function a(e) {
                    try {
                        c(r.next(e));
                    } catch (t) {
                        i(t);
                    }
                }
                function s(e) {
                    try {
                        c(r["throw"](e));
                    } catch (t) {
                        i(t);
                    }
                }
                function c(e) {
                    e.done ? o(e.value) : new n(function(t) {
                        t(e.value);
                    }).then(a, s);
                }
                c((r = r.apply(e, t || [])).next());
            });
        };
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var w = function(e, t) {
            return y(void 0, void 0, void 0, b["default"].mark(function n() {
                var r;
                return b["default"].wrap(function(n) {
                    for (;;) switch (n.prev = n.next) {
                      case 0:
                        return n.prev = 0, n.next = 3, t.get(e);

                      case 3:
                        if (r = n.sent, "undefined" !== r) {
                            n.next = 8;
                            break;
                        }
                        return n.abrupt("return", void 0);

                      case 8:
                        return n.abrupt("return", r && JSON.parse(r));

                      case 9:
                        n.next = 19;
                        break;

                      case 11:
                        if (n.prev = 11, n.t0 = n["catch"](0), !n.t0 || !n.t0.toString().includes("SyntaxError")) {
                            n.next = 18;
                            break;
                        }
                        throw t.remove(e), new Error("'" + e + "' has unparseable value, removing");

                      case 18:
                        throw n.t0;

                      case 19:
                      case "end":
                        return n.stop();
                    }
                }, n, this, [ [ 0, 11 ] ]);
            }));
        }, k = function C(e) {
            var t = this;
            (0, h["default"])(this, C), this._api = e, this.get = function(e) {
                return y(t, void 0, void 0, b["default"].mark(function n() {
                    var t, r, o, i = this;
                    return b["default"].wrap(function(n) {
                        for (;;) switch (n.prev = n.next) {
                          case 0:
                            if (t = Array.isArray(e), r = void 0, n.prev = 2, !t) {
                                n.next = 11;
                                break;
                            }
                            return e = e, n.next = 7, _["default"].all(e.map(function(e) {
                                return w(e, i._api);
                            }));

                          case 7:
                            o = n.sent, r = e.reduce(function(e, t, n) {
                                return (0, p["default"])(e, (0, d["default"])({}, t, o[n]));
                            }, {}), n.next = 15;
                            break;

                          case 11:
                            return e = e, n.next = 14, w(e, this._api);

                          case 14:
                            r = n.sent;

                          case 15:
                            n.next = 21;
                            break;

                          case 17:
                            n.prev = 17, n.t0 = n["catch"](2), t && (r = {}), console.warn("prefs get error:", n.t0);

                          case 21:
                            return n.abrupt("return", r);

                          case 22:
                          case "end":
                            return n.stop();
                        }
                    }, n, this, [ [ 2, 17 ] ]);
                }));
            }, this.set = function(e, n) {
                return y(t, void 0, void 0, b["default"].mark(function r() {
                    var t = this;
                    return b["default"].wrap(function(r) {
                        for (;;) switch (r.prev = r.next) {
                          case 0:
                            if (null === e || "object" !== ("undefined" == typeof e ? "undefined" : (0, l["default"])(e))) {
                                r.next = 5;
                                break;
                            }
                            return r.next = 3, _["default"].all((0, s["default"])(e).map(function(n) {
                                return t.set(n, e[n]);
                            }));

                          case 3:
                            r.next = 14;
                            break;

                          case 5:
                            return r.prev = 5, n = void 0 === n ? "undefined" : (0, i["default"])(n), r.next = 9, 
                            this._api.set(e, n);

                          case 9:
                            r.next = 14;
                            break;

                          case 11:
                            r.prev = 11, r.t0 = r["catch"](5), console.warn("prefs set error", r.t0);

                          case 14:
                          case "end":
                            return r.stop();
                        }
                    }, r, this, [ [ 5, 11 ] ]);
                }));
            }, this.all = function() {
                return y(t, void 0, void 0, b["default"].mark(function e() {
                    var t, n, r;
                    return b["default"].wrap(function(e) {
                        for (;;) switch (e.prev = e.next) {
                          case 0:
                            return e.next = 2, this._api.getAll();

                          case 2:
                            t = e.sent;
                            for (n in t) if ("undefined" === t[n]) t[n] = void 0; else try {
                                r = t[n], t[n] = r && JSON.parse(r);
                            } catch (o) {}
                            return e.abrupt("return", t);

                          case 5:
                          case "end":
                            return e.stop();
                        }
                    }, e, this);
                }));
            }, this.remove = function(e) {
                try {
                    return t._api.remove(e);
                } catch (n) {
                    return console.warn("prefs remove error", n), _["default"].resolve();
                }
            }, this.clearAll = function() {
                try {
                    return t._api.removeAll()["catch"](function(e) {
                        return console.warn("prefs clearAll error", e);
                    });
                } catch (e) {
                    return console.warn("prefs clearAll error", e), _["default"].resolve();
                }
            };
        };
        n.PrefsImpl = k;
    }, {
        "babel-runtime/core-js/json/stringify": 34,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/core-js/object/keys": 41,
        "babel-runtime/core-js/promise": 43,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/defineProperty": 48,
        "babel-runtime/helpers/typeof": 54,
        "babel-runtime/regenerator": 55
    } ],
    331: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/assign"), i = r(o);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var a = e("./user/actions"), s = e("./settings/actions"), c = e("./connection/actions");
        n.pureActions = (0, i["default"])({}, a, c, s);
    }, {
        "./connection/actions": 332,
        "./settings/actions": 334,
        "./user/actions": 338,
        "babel-runtime/core-js/object/assign": 36
    } ],
    332: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return {
                type: n.t.UPDATE_CONNECTION,
                data: e
            };
        }
        function o(e) {
            return {
                type: n.t.ONLINE_STATE,
                online: e
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.t = {
            UPDATE_CONNECTION: "connection/UPDATE_CONNECTION",
            ONLINE_STATE: "connection/ONLINE_STATE"
        }, n.updateConnection = r, n.onlineConnection = o;
    }, {} ],
    333: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : n.defaultConnection, t = arguments[1], r = t.type, o = t.data, i = t.online;
            switch (r) {
              case s.t.ONLINE_STATE:
                return (0, a["default"])({}, e, {
                    online: i
                });

              case s.t.UPDATE_CONNECTION:
                return (0, a["default"])({}, e, o);

              default:
                return e;
            }
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("./actions");
        n.defaultConnection = {
            networkOffline: !window.navigator.onLine,
            cookiesDisabled: navigator.cookieEnabled === !1,
            online: !0
        }, n.connectionReducer = o;
    }, {
        "./actions": 332,
        "babel-runtime/core-js/object/assign": 36
    } ],
    334: [ function(e, t, n) {
        "use strict";
        function r(e, t) {
            return {
                type: n.t.SET_DAPI_PROP,
                propKey: e,
                data: t
            };
        }
        function o(e) {
            return {
                type: n.t.CHANGE_WEAK_DIALECT,
                data: e
            };
        }
        function i(e) {
            return {
                type: n.t.CHANGE_STRONG_DIALECT,
                data: e
            };
        }
        function a(e) {
            return {
                type: n.t.SETTINGS_INITIAL,
                data: e
            };
        }
        function s(e) {
            return {
                type: n.t.TOGGLE_DEFS,
                enabledDefs: e
            };
        }
        function c(e, t) {
            return {
                type: n.t.TOGGLE_SITE,
                domain: t,
                enabled: e
            };
        }
        function l(e, t) {
            return {
                type: n.t.TOGGLE_FIELD,
                domain: t,
                data: e
            };
        }
        function u() {
            return {
                type: n.t.SEEN_NEWS
            };
        }
        function d() {
            return {
                type: n.t.SHOW_ONBOARDING
            };
        }
        function f() {
            return {
                type: n.t.SEEN_ONBOARDING
            };
        }
        function p(e) {
            return {
                type: n.t.SHOW_NEWS,
                showNews: e
            };
        }
        function m() {
            return {
                type: n.t.SEEN_REFERRALS
            };
        }
        function h() {
            return {
                type: n.t.CLICK_REFERRALS
            };
        }
        function g(e) {
            return {
                type: n.t.TOGGLE_POPUP,
                isPopupDisabled: e
            };
        }
        function b(e) {
            return {
                type: n.t.ENABLE_EMAIL_FEEDBACK,
                domain: e
            };
        }
        function v(e) {
            return {
                type: n.t.SAVE_ANONYMOUS_PROPERTIES,
                props: e
            };
        }
        function _(e) {
            return {
                type: n.t.SEEN_EMAIL_PERCEPTION_POPUP,
                seenEmailPerceptionPopupDate: e
            };
        }
        function y(e, t) {
            return {
                type: n.t.SAVE_FEEDBACK_DATA,
                subject: e,
                docId: t
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.t = {
            SETTINGS_INITIAL: "settings/SETTINGS_INITIAL",
            TOGGLE_DEFS: "settings/TOGGLE_DEFS",
            TOGGLE_SITE: "settings/TOGGLE_SITE",
            TOGGLE_FIELD: "settings/TOGGLE_FIELD",
            TOGGLE_POPUP: "settings/TOGGLE_POPUP",
            SHOW_NEWS: "settings/SHOW_NEWS",
            SEEN_NEWS: "settings/SEEN_NEWS",
            SEEN_REFERRALS: "settings/SEEN_REFERRALS",
            CLICK_REFERRALS: "settings/CLICK_REFERRALS",
            SHOW_ONBOARDING: "settings/SHOW_ONBOARDING",
            SEEN_ONBOARDING: "settings/SEEN_ONBOARDING",
            SET_DAPI_PROP: "settings/SET_DAPI_PROP",
            CHANGE_WEAK_DIALECT: "settings/CHANGE_WEAK_DIALECT",
            CHANGE_STRONG_DIALECT: "settings/CHANGE_STRONG_DIALECT",
            SAVE_ANONYMOUS_PROPERTIES: "settings/SAVE_ANONYMOUS_PROPERTIES",
            ENABLE_EMAIL_FEEDBACK: "settings/ENABLE_EMAIL_FEEDBACK",
            SAVE_FEEDBACK_DATA: "settings/SAVE_FEEDBACK_DATA",
            SEEN_EMAIL_PERCEPTION_POPUP: "settings/EMAIL_PERCEPTION_POPUP_SEEN"
        }, n.DAPI_ACTIONS = [ n.t.CHANGE_WEAK_DIALECT, n.t.CHANGE_STRONG_DIALECT ], n.CACHED_ACTIONS = [ n.t.TOGGLE_DEFS, n.t.TOGGLE_SITE, n.t.TOGGLE_FIELD, n.t.SEEN_NEWS, n.t.SEEN_REFERRALS, n.t.CLICK_REFERRALS, n.t.SHOW_ONBOARDING, n.t.SEEN_ONBOARDING, n.t.SEEN_EMAIL_PERCEPTION_POPUP ], 
        n.setDapiProp = r, n.changeWeakDialect = o, n.changeStrongDialect = i, n.initialSettings = a, 
        n.toggleDefs = s, n.toggleSite = c, n.toggleField = l, n.seenNews = u, n.showOnboarding = d, 
        n.seenOnboarding = f, n.showNews = p, n.seenReferrals = m, n.clickReferrals = h, 
        n.togglePopup = g, n.enableEmailFeedback = b, n.saveAnonymousProps = v, n.seenEmailPerceptionPopup = _, 
        n.saveFeedbackData = y;
    }, {} ],
    335: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t = arguments[1], n = t.type, r = t.data, o = void 0 === r ? {} : r, i = t.domain, s = t.enabledDefs, d = t.enabled, f = t.showNews, p = t.isPopupDisabled, m = t.seenEmailPerceptionPopupDate, h = t.propKey, g = e[i] || {};
            switch (n) {
              case u.t.SETTINGS_INITIAL:
                return (0, c["default"])({}, e, o);

              case u.t.TOGGLE_DEFS:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        enabledDefs: s
                    })
                });

              case u.t.TOGGLE_SITE:
                return (0, c["default"])({}, e, (0, a["default"])({}, i, (0, c["default"])({}, g, {
                    enabled: d
                })));

              case u.t.TOGGLE_FIELD:
                return (0, c["default"])({}, e, (0, a["default"])({}, i, (0, c["default"])({}, e[i], {
                    disabledFields: (0, c["default"])({}, g.disabledFields, o)
                })));

              case u.t.ENABLE_EMAIL_FEEDBACK:
                return (0, c["default"])({}, e, (0, a["default"])({}, i, (0, c["default"])({}, e[i], {
                    emailFeedbackEnabled: !0
                })));

              case u.t.SHOW_NEWS:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        showNews: f
                    })
                });

              case u.t.SHOW_ONBOARDING:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        showOnboarding: !0
                    })
                });

              case u.t.SEEN_ONBOARDING:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        showOnboarding: !1
                    })
                });

              case u.t.SEEN_EMAIL_PERCEPTION_POPUP:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        seenEmailPerceptionPopupDate: m
                    })
                });

              case u.t.SEEN_NEWS:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        seenNewsVersion: l.newsId
                    })
                });

              case u.t.TOGGLE_POPUP:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        isPopupDisabled: p
                    })
                });

              case u.t.SEEN_REFERRALS:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        referralNewsBadge: !0
                    })
                });

              case u.t.CLICK_REFERRALS:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, {
                        referralWasClicked: !0
                    })
                });

              case u.t.SET_DAPI_PROP:
                return (0, c["default"])({}, e, {
                    common: (0, c["default"])({}, e.common, (0, a["default"])({}, h, o))
                });

              default:
                return e;
            }
        }
        var i = e("babel-runtime/helpers/defineProperty"), a = r(i), s = e("babel-runtime/core-js/object/assign"), c = r(s);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var l = e("lib/config"), u = e("./actions");
        n.settingsReducer = o;
    }, {
        "./actions": 334,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/defineProperty": 48,
        "lib/config": 224
    } ],
    336: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return {
                type: n.t.SET_ACTIVE_TAB,
                data: e
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.t = {
            SET_ACTIVE_TAB: "tabs/SET_ACTIVE_TAB"
        }, n.setActiveTab = r;
    }, {} ],
    337: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, t = arguments[1], n = t.type, r = t.data;
            switch (n) {
              case s.t.SET_ACTIVE_TAB:
                return (0, a["default"])({}, e, {
                    active: r
                });

              default:
                return e;
            }
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("./actions");
        n.tabsReducer = o;
    }, {
        "./actions": 336,
        "babel-runtime/core-js/object/assign": 36
    } ],
    338: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return {
                type: n.t.SET_USER,
                data: e
            };
        }
        function o(e) {
            return {
                type: n.t.SET_SETTINGS,
                data: e
            };
        }
        function i(e) {
            return {
                type: n.t.SESSION_INVALIDATE,
                reason: e
            };
        }
        function a() {
            return {
                type: n.t.INC_FIXED
            };
        }
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.t = {
            SET_USER: "user/SET_USER",
            SET_SETTINGS: "user/SET_SETTINGS",
            SESSION_INVALIDATE: "user/SESSION_INVALIDATE",
            INC_FIXED: "user/INC_FIXED"
        }, n.setUser = r, n.setSettings = o, n.sessionInvalidate = i, n.incFixed = a;
    }, {} ],
    339: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : n.defaultUser, t = arguments[1], r = t.type, o = t.data, i = void 0 === o ? {} : o;
            switch (r) {
              case s.t.SET_USER:
                return i;

              case s.t.SET_SETTINGS:
                return (0, a["default"])({}, e, {
                    settings: i
                });

              case s.t.INC_FIXED:
                var c = e.fixed_errors + 1;
                return (0, a["default"])({}, e, {
                    fixed_errors: c
                });

              default:
                return e;
            }
        }
        var i = e("babel-runtime/core-js/object/assign"), a = r(i);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var s = e("./actions");
        n.defaultUser = {
            anonymous: !0,
            premium: !1
        }, n.userReducer = o;
    }, {
        "./actions": 338,
        "babel-runtime/core-js/object/assign": 36
    } ],
    340: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        function o(e) {
            var t = f.combineReducers({
                user: g.userReducer,
                tabs: b.tabsReducer,
                settings: h.settingsReducer,
                connection: m.connectionReducer
            }), n = d({
                level: "debug",
                colors: {
                    title: function() {
                        return "green";
                    }
                }
            });
            return f.createStore(t, {}, f.applyMiddleware(e, n));
        }
        var i = e("babel-runtime/regenerator"), a = r(i), s = e("babel-runtime/helpers/createClass"), c = r(s), l = e("babel-runtime/helpers/classCallCheck"), u = r(l);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var d = e("redux-logger"), f = e("redux"), p = e("redux-saga"), m = e("./state/connection/reducer"), h = e("./state/settings/reducer"), g = e("./state/user/reducer"), b = e("./state/tabs/reducer"), v = e("lib/config"), _ = e("./state/actions"), y = e("./state/actions");
        n.pureActions = y.pureActions;
        var w = e("redux-saga/effects"), k = e("lib/page-config"), C = function E(e, t) {
            var n = this;
            (0, u["default"])(this, E), this._store = e, this._userSagas = t, this.refreshUser = function() {
                for (var e, t = arguments.length, r = Array(t), o = 0; o < t; o++) r[o] = arguments[o];
                return (e = n._store).runSaga.apply(e, [ n._userSagas.externalUpdateUser.bind(n._userSagas) ].concat(r)).done;
            }, this.signin = function(e) {
                return n._store.runSaga(n._userSagas.authRequest.bind(n._userSagas), v.URLS.authSignin, e, "app_signin_success").done;
            }, this.signup = function(e) {
                return n._store.runSaga(n._userSagas.authRequest.bind(n._userSagas), v.URLS.authSignup, e, "app_signup_success").done;
            };
        };
        n.AuthSagaRunners = C;
        var x = function() {
            function e(t, n, r, i) {
                var a = this;
                (0, u["default"])(this, e), this._userSagas = t, this._settingsSagas = n, this._tabsSagas = r, 
                this._connectionSagas = i;
                var s = p["default"](t.start.bind(t), n.start.bind(n), i.start.bind(i));
                this.store = o(s), this.runSaga = s.run, this.initStore = function() {
                    return s.run(a._startupFlow.bind(a)).done.then(function() {
                        a.store.subscribe(function() {
                            return s.run(r.sendStateToTabs.bind(r));
                        });
                    });
                }, this.actions = f.bindActionCreators(_.pureActions, this.store.dispatch);
            }
            return (0, c["default"])(e, [ {
                key: "_startupFlow",
                value: a["default"].mark(function t() {
                    return a["default"].wrap(function(e) {
                        for (;;) switch (e.prev = e.next) {
                          case 0:
                            return e.next = 2, [ w.call([ this._settingsSagas, this._settingsSagas.setInitialSettings ]), w.call([ k.pageConfig, k.pageConfig.init ]), w.call([ this._userSagas, this._userSagas.updateUser ], {
                                failoverFromCache: !0
                            }) ];

                          case 2:
                            return e.next = 4, w.fork([ this._connectionSagas, this._connectionSagas.monitorIsIncognito ]);

                          case 4:
                            return e.next = 6, w.call([ this._tabsSagas, this._tabsSagas.start ]);

                          case 6:
                          case "end":
                            return e.stop();
                        }
                    }, t, this);
                })
            } ]), e;
        }();
        n.StoreControllerImpl = x;
    }, {
        "./state/actions": 331,
        "./state/connection/reducer": 333,
        "./state/settings/reducer": 335,
        "./state/tabs/reducer": 337,
        "./state/user/reducer": 339,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/createClass": 47,
        "babel-runtime/regenerator": 55,
        "lib/config": 224,
        "lib/page-config": 293,
        redux: "redux",
        "redux-logger": "redux-logger",
        "redux-saga": "redux-saga",
        "redux-saga/effects": 171
    } ],
    341: [ function(e, t, n) {
        "use strict";
        e("index");
    }, {
        index: 199
    } ],
    342: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/assign"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var c = e("universal/shared/socket"), l = e("lib/util"), u = e("emitter"), d = e("./socket"), f = function p(e, t) {
            var n = this;
            (0, s["default"])(this, p), this._logger = e, this._message = t, this._sockets = {}, 
            this.createSocket = function(e) {
                var t = e.socketId || l.guid(), r = {
                    socketId: t,
                    useStandBy: e.useStandBy,
                    url: e.url
                }, o = function() {};
                n._sockets[t] || (n._sockets[t] = new d.ContentScriptSocket(t, function(e, t) {
                    n._message.emitBackground(c.MessageTypes.client, (0, i["default"])({}, r, {
                        method: e,
                        arg: t
                    })), "close" === e && o();
                }));
                var a = n._sockets[t];
                return a.one("disconnect", o), a.one("cleanup-socket-on-editor-remove", function() {
                    delete n._sockets[t];
                }), a.on("error", n._onError), a;
            }, this._onError = function(e) {
                if ("disconnected" !== e) {
                    var t = {};
                    "string" == typeof e ? t.msg = e : e.error && (t.readyState = e.error.currentTarget && e.error.currentTarget.readyState, 
                    t.returnValue = e.error.returnValue), n._logger.socketCsError(), console.error("capi error", e), 
                    window.emit || u(window), window.emit("bgerror", e || "when send message to the socket");
                }
            }, this._onMessage = function(e, t) {
                var r = n._sockets[e.socketId];
                if (r) {
                    var o = e.msg || {};
                    o.action && "error" === o.action.toLowerCase() && n._logger.soketCsErrorMsg(o), 
                    t("ok"), r.emit(e.event, e.msg);
                }
            }, t.on(c.MessageTypes.server, this._onMessage);
        };
        n.ContentScriptSocketManager = f;
    }, {
        "./socket": 343,
        "babel-runtime/core-js/object/assign": 36,
        "babel-runtime/helpers/classCallCheck": 46,
        emitter: "emitter",
        "lib/util": 322,
        "universal/shared/socket": 344
    } ],
    343: [ function(e, t, n) {
        "use strict";
        function r(e) {
            return e && e.__esModule ? e : {
                "default": e
            };
        }
        var o = e("babel-runtime/core-js/object/get-prototype-of"), i = r(o), a = e("babel-runtime/helpers/classCallCheck"), s = r(a), c = e("babel-runtime/helpers/possibleConstructorReturn"), l = r(c), u = e("babel-runtime/helpers/inherits"), d = r(u);
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var f = e("stdlib/emitter"), p = function(e) {
            function t(e, n) {
                (0, s["default"])(this, t);
                var r = (0, l["default"])(this, (t.__proto__ || (0, i["default"])(t)).call(this));
                return r.socketId = e, r._send = n, r.send = function(e) {
                    return r._send("send", e);
                }, r.close = function() {
                    return r._send("close");
                }, r.connect = function(e) {
                    return r._send("connect", e);
                }, r.reconnect = function(e) {
                    return r._send("reconnect", e);
                }, r.release = function() {
                    return r._send("release");
                }, r.wsPlay = function() {
                    return r._send("wsPlay");
                }, r.wsPause = function() {
                    return r._send("wsPause");
                }, r.toString = function() {
                    return "[object SocketClient]";
                }, r;
            }
            return (0, d["default"])(t, e), t;
        }(f.Emitter);
        n.ContentScriptSocket = p;
    }, {
        "babel-runtime/core-js/object/get-prototype-of": 40,
        "babel-runtime/helpers/classCallCheck": 46,
        "babel-runtime/helpers/inherits": 50,
        "babel-runtime/helpers/possibleConstructorReturn": 51,
        "stdlib/emitter": 326
    } ],
    344: [ function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }), n.MessageTypes = {
            server: "socket-server",
            client: "socket-client",
            serverIframe: "socket-server-iframe",
            iframeMode: "iframe-mode"
        };
    }, {} ]
}, {}, [ 177 ]);