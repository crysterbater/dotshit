(typeof mono === 'undefined') && (mono = {loadModule: function() {this.loadModuleStack.push(arguments);},loadModuleStack: []});

mono.loadModule('aviaBar', function(moduleName, initData) {
  "use strict";

  (function(modules) {
    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) return installedModules[moduleId].exports;
      var module = installedModules[moduleId] = {
        exports: {},
        id: moduleId,
        loaded: !1
      };
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.loaded = !0;
      return module.exports;
    }
    var installedModules = {};
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
  })([ function(module, exports, __webpack_require__) {
    (function(Promise, utils, CustomError, tbr, api) {
      __webpack_require__(27)(function() {
        "use strict";
        Promise.resolve().then(function() {
          __webpack_require__(19)(utils);
          __webpack_require__(21)(utils);
          if (!document.body) throw new CustomError("Not document!");
          if (utils.isFrame()) throw new CustomError("Inside frame!");
          if (utils.isDeny()) throw new CustomError("Is deny!");
          tbr.hostname = location.hostname;
          var profileInfo = __webpack_require__(3)();
          if (!profileInfo) {
            tbr.error("Profile is not exists!", location.href);
            throw new CustomError("Profile is not exists!");
          }
          api.sendMessagePromise = function(msg) {
            return new Promise(function(resolve) {
              try {
                api.sendMessage(msg, resolve);
              } catch (err) {
                tbr.error("API error", err);
                throw new CustomError("API error");
              }
            });
          };
          return api.sendMessagePromise({
            action: "tbrGetInfo"
          }).then(function(info) {
            utils.extend(tbr.appInfo, info);
            tbr.log("Version", tbr.version);
            tbr.log("Set info", info);
            if (!info.id) throw new CustomError("Partner id is not set!");
            var promise = null;
            tbr.appInfo.useTemplates && (promise = api.sendMessagePromise({
              action: "tbrGetTemplate",
              id: profileInfo.id
            }));
            return promise;
          }).then(function(profileJson) {
            tbr.currentProfile = __webpack_require__(6)(profileInfo, profileJson);
            if (!tbr.currentProfile) {
              tbr.error("Invalid location!", location.href);
              throw new CustomError("Invalid location!");
            }
          }).then(function() {
            return api.sendMessagePromise({
              action: "tbrIsAllow",
              hostname: tbr.hostname
            }).then(function(result) {
              if (!result) {
                tbr.log("Bar is closed!", tbr.hostname);
                throw new CustomError("Bar is closed!");
              }
              if (utils.tbrExists()) throw new CustomError("Bar exists!");
              if (!utils.mutationWatcher.isAvailable()) throw new CustomError("MutationObserver is not support!");
              utils.tbrSetGlobal();
              tbr.language = __webpack_require__(7);
            });
          });
        }).then(function() {
          var main = tbr.main;
          main.avia = __webpack_require__(9)();
          main.hotel = __webpack_require__(10)();
          main.cars = __webpack_require__(11)();
          main.currency = __webpack_require__(12)();
          main.bar = __webpack_require__(13)();
          main.watcher = __webpack_require__(20)();
          main.watcher.initProfile(tbr.currentProfile);
        }).catch(function(err) {
          if (err instanceof CustomError) tbr.log(err.message); else {
            tbr.error("Init error!", err);
            tbr.trackError(err);
          }
        });
      });
    }).call(exports, __webpack_require__(26), __webpack_require__(2), __webpack_require__(25), __webpack_require__(8), __webpack_require__(1));
  }, function(module, exports) {
    var api = {
      sendMessage: function(msg, response) {
        mono.sendMessage(msg, response);
      },
      getUILanguage: function() {
        if ("undefined" != typeof chrome && chrome.i18n && chrome.i18n.getUILanguage) return chrome.i18n.getUILanguage();
      }
    };
    module.exports = api;
  }, function(module, exports, __webpack_require__) {
    (function(Promise, CustomError) {
      var utils = {};
      utils.extend = function() {
        var obj = arguments[0];
        for (var i = 1, len = arguments.length; i < len; i++) {
          var item = arguments[i];
          for (var key in item) void 0 !== item[key] && (obj[key] = item[key]);
        }
        return obj;
      };
      utils.param = function(obj) {
        if ("string" == typeof obj) return obj;
        var itemsList = [];
        for (var key in obj) if (obj.hasOwnProperty(key)) {
          void 0 !== obj[key] && null !== obj[key] || (obj[key] = "");
          itemsList.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }
        return itemsList.join("&");
      };
      (function() {
        utils.create = function(tagName, obj) {
          var el;
          var func;
          el = "object" != typeof tagName ? document.createElement(tagName) : tagName;
          for (var attr in obj) {
            var value = obj[attr];
            (func = hook[attr]) ? func(el, value) : el[attr] = value;
          }
          return el;
        };
        var hook = {
          text: function(el, value) {
            el.textContent = value;
          },
          data: function(el, value) {
            for (var item in value) el.dataset[item] = value[item];
          },
          class: function(el, value) {
            if (Array.isArray(value)) for (var i = 0, len = value.length; i < len; i++) el.classList.add(value[i]); else el.setAttribute("class", value);
          },
          style: function(el, value) {
            if ("object" == typeof value) for (var item in value) {
              var key = item;
              "float" === key && (key = "cssFloat");
              var _value = value[item];
              if (Array.isArray(_value)) for (var i = 0, len = _value.length; i < len; i++) el.style[key] = _value[i]; else el.style[key] = _value;
            } else el.setAttribute("style", value);
          },
          append: function(el, value) {
            Array.isArray(value) || (value = [ value ]);
            for (var i = 0, len = value.length; i < len; i++) {
              var node = value[i];
              if (node || 0 === node) {
                "object" != typeof node && (node = document.createTextNode(node));
                el.appendChild(node);
              }
            }
          },
          on: function(el, eventList) {
            "object" != typeof eventList[0] && (eventList = [ eventList ]);
            for (var i = 0, len = eventList.length; i < len; i++) {
              var args = eventList[i];
              Array.isArray(args) && utils.on(el, args[0], args[1], args[2]);
            }
          },
          onCreate: function(el, value) {
            value.call(el, el);
          }
        };
      })();
      utils.on = function(el, type, onEvent, capture) {
        el.addEventListener(type, onEvent, capture);
      };
      utils.off = function(el, type, onEvent, capture) {
        el.removeEventListener(type, onEvent, capture);
      };
      utils.jsLink = function(node, onClick) {
        var url = node.href;
        var click = function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.open(url);
          onClick && onClick();
        };
        node.addEventListener("click", function(e) {
          click(e);
        });
        node.addEventListener("mouseup", function(e) {
          var isMiddle = 1 === e.button || 2 === e.which;
          isMiddle && click(e);
        });
        return node;
      };
      utils.parseUrl = function(url, details) {
        details = details || {};
        var query = null;
        var paramsRe;
        paramsRe = details.paramsRe ? details.paramsRe : /[^?]+\?(.+)/;
        var m = !details.params && paramsRe.exec(url);
        query = m ? m[1] : url;
        var separator = details.sep || "&";
        var dblParamList = query.split(separator);
        var params = {};
        for (var i = 0, len = dblParamList.length; i < len; i++) {
          var item = dblParamList[i];
          var keyValue = item.split("=");
          var key = keyValue[0];
          var value = keyValue[1] || "";
          if (details.noDecode) params[key] = value; else {
            try {
              key = decodeURIComponent(key);
            } catch (err) {
              key = unescape(key);
            }
            try {
              params[key] = decodeURIComponent(value);
            } catch (err) {
              params[key] = unescape(value);
            }
          }
        }
        return params;
      };
      utils.debounce = function(fn, delay) {
        var timer = null;
        return function() {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function() {
            fn.apply(context, args);
          }, delay);
        };
      };
      utils.getPageScript = function(html, match) {
        match && !Array.isArray(match) && (match = [ match ]);
        var scriptList = [];
        html.replace(/<script(?:|\s[^>]+[^\/])>/g, function(text, offset) {
          offset += text.length;
          var endPos = html.indexOf("</script>", offset);
          if (endPos !== -1) {
            var content = html.substr(offset, endPos - offset);
            match ? match.every(function(r) {
                return r.test(content);
              }) && scriptList.push(content) : scriptList.push(content);
          }
        });
        return scriptList;
      };
      utils.findJson = function(html, match) {
        match && !Array.isArray(match) && (match = [ match ]);
        var rawJson = [];
        var obj = {
          "{": 0,
          "[": 0
        };
        var map = {
          "}": "{",
          "]": "["
        };
        var jsonSymbols = /[{}\]\[":0-9.,-]/;
        var whiteSpace = /[\r\n\s\t]/;
        var jsonText = "";
        for (var symbol, i = 0; symbol = html[i]; i++) if ('"' !== symbol) {
          if (jsonSymbols.test(symbol)) {
            jsonText += symbol;
            if ("{" === symbol || "[" === symbol) {
              obj["{"] || obj["["] || (jsonText = symbol);
              obj[symbol]++;
            } else if ("}" === symbol || "]" === symbol) {
              obj[map[symbol]]--;
              obj["{"] || obj["["] || rawJson.push(jsonText);
            }
          } else if ("t" === symbol && "true" === html.substr(i, 4)) {
            jsonText += "true";
            i += 3;
          } else if ("f" === symbol && "false" === html.substr(i, 5)) {
            jsonText += "false";
            i += 4;
          } else if ("n" === symbol && "null" === html.substr(i, 4)) {
            jsonText += "null";
            i += 3;
          } else if (!whiteSpace.test(symbol)) {
            obj["{"] = 0;
            obj["["] = 0;
            jsonText = "";
          }
        } else {
          var end = i;
          for (;end !== -1 && (end === i || "\\" === html[end - 1]); ) end = html.indexOf('"', end + 1);
          end === -1 && (end = html.length - 1);
          jsonText += html.substr(i, end - i + 1);
          i = end;
        }
        var jsonList = [];
        for (var item, i = 0; item = rawJson[i]; i++) if ("{}" !== item && "[]" !== item) try {
          match ? match.every(function(r) {
              return r.test(item);
            }) && jsonList.push(JSON.parse(item)) : jsonList.push(JSON.parse(item));
        } catch (e) {}
        return jsonList;
      };
      utils.style2Text = function(cssStyleObj, parentSelector) {
        var list = [];
        Array.isArray(cssStyleObj) || (cssStyleObj = [ cssStyleObj ]);
        parentSelector && !Array.isArray(parentSelector) && (parentSelector = [ parentSelector ]);
        var styleToText = function(selectorArr, styleObj) {
          var content = [];
          for (var item in styleObj) {
            var value = styleObj[item];
            "cssFloat" === item && (item = "float");
            var key = item.replace(/([A-Z])/g, function(text, letter) {
              return "-" + letter.toLowerCase();
            });
            content.push(key + ":" + value);
          }
          return content.length ? [ selectorArr.join(","), "{", content.join(";"), "}" ].join("") : "";
        };
        var inheritSelector = function(section, selector) {
          Array.isArray(selector) || (selector = [ selector ]);
          if (parentSelector) {
            var _selector = [];
            var join = section.join || "" === section.join ? section.join : " ";
            parentSelector.forEach(function(parentSelector) {
              selector.forEach(function(selector) {
                _selector.push(parentSelector + join + selector);
              });
            });
            selector = _selector;
          }
          return selector;
        };
        cssStyleObj.forEach(function(section) {
          var inhSelector = null;
          var media = section.media;
          var selector = section.selector;
          var style = section.style;
          var append = section.append;
          if (media && append) list.push([ media, "{", utils.style2Text(append, parentSelector), "}" ].join("")); else if (selector || style) {
            inhSelector = inheritSelector(section, selector);
            list.push(styleToText(inhSelector, style));
            append && list.push(utils.style2Text(append, inhSelector));
          } else for (var key in section) if ([ "append", "join" ].indexOf(key) === -1) {
            selector = key;
            style = section[key];
            append = style.append;
            append && delete style.append;
            inhSelector = inheritSelector(section, selector);
            list.push(styleToText(inhSelector, style));
            append && list.push(utils.style2Text(append, inhSelector));
          }
        });
        return list.join("");
      };
      utils.styleReset = {
        animation: "none 0s ease 0s 1 normal none running",
        backfaceVisibility: "visible",
        background: "transparent none repeat 0 0 / auto auto padding-box border-box scroll",
        border: "medium none currentColor",
        borderCollapse: "separate",
        borderImage: "none",
        borderRadius: "0",
        borderSpacing: "0",
        bottom: "auto",
        boxShadow: "none",
        boxSizing: "content-box",
        captionSide: "top",
        clear: "none",
        clip: "auto",
        color: "inherit",
        columns: "auto",
        columnCount: "auto",
        columnFill: "balance",
        columnGap: "normal",
        columnRule: "medium none currentColor",
        columnSpan: "1",
        columnWidth: "auto",
        content: "normal",
        counterIncrement: "none",
        counterReset: "none",
        cursor: "auto",
        direction: "ltr",
        display: "inline",
        emptyCells: "show",
        float: "none",
        font: "normal normal normal normal medium/normal inherit",
        height: "auto",
        hyphens: "none",
        left: "auto",
        letterSpacing: "normal",
        listStyle: "disc outside none",
        margin: "0",
        maxHeight: "none",
        maxWidth: "none",
        minHeight: "0",
        minWidth: "0",
        opacity: "1",
        orphans: "0",
        outline: "medium none invert",
        overflow: "visible",
        overflowX: "visible",
        overflowY: "visible",
        padding: "0",
        pageBreakAfter: "auto",
        pageBreakBefore: "auto",
        pageBreakInside: "auto",
        perspective: "none",
        perspectiveOrigin: "50% 50%",
        position: "static",
        right: "auto",
        tabSize: "8",
        tableLayout: "auto",
        textAlign: "inherit",
        textAlignLast: "auto",
        textDecoration: "none solid currentColor",
        textIndent: "0",
        textShadow: "none",
        textTransform: "none",
        top: "auto",
        transform: "none",
        transformOrigin: "50% 50% 0",
        transformStyle: "flat",
        transition: "none 0s ease 0s",
        unicodeBidi: "normal",
        verticalAlign: "baseline",
        visibility: "visible",
        whiteSpace: "normal",
        widows: "0",
        width: "auto",
        wordSpacing: "normal",
        zIndex: "auto",
        all: "initial"
      };
      utils.bridge = function(details) {
        details.args = details.args || [];
        void 0 === details.timeout && (details.timeout = 300);
        var scriptId = "sf-bridge-" + parseInt(1e3 * Math.random()) + "-" + Date.now();
        var listener = function(e) {
          window.removeEventListener("sf-bridge-" + scriptId, listener);
          var data;
          data = e.detail ? JSON.parse(e.detail) : void 0;
          details.cb(data);
        };
        window.addEventListener("sf-bridge-" + scriptId, listener);
        var wrapFunc = "(" + function(func, args, scriptId, timeout) {
            var node = document.getElementById(scriptId);
            node && node.parentNode.removeChild(node);
            var fired = !1;
            var done = function(data) {
              if (!fired) {
                fired = !0;
                var event = new CustomEvent("sf-bridge-" + scriptId, {
                  detail: JSON.stringify(data)
                });
                window.dispatchEvent(event);
              }
            };
            timeout && setTimeout(function() {
              done();
            }, timeout);
            args.push(done);
            func.apply(null, args);
          }.toString() + ")(" + [ details.func.toString(), JSON.stringify(details.args), JSON.stringify(scriptId), parseInt(details.timeout) ].join(",") + ");";
        var script = document.createElement("script");
        script.id = scriptId;
        script.textContent = wrapFunc;
        document.body.appendChild(script);
      };
      utils.mutationWatcher = {
        getMutationObserver: function() {
          var MutationObserverCtor = null;
          "undefined" != typeof MutationObserver ? MutationObserverCtor = MutationObserver : "undefined" != typeof WebKitMutationObserver ? MutationObserverCtor = WebKitMutationObserver : "undefined" != typeof MozMutationObserver ? MutationObserverCtor = MozMutationObserver : "undefined" != typeof JsMutationObserver && (MutationObserverCtor = JsMutationObserver);
          return MutationObserverCtor;
        },
        isAvailable: function() {
          return !!this.getMutationObserver();
        },
        disconnect: function(details) {
          details.observer.disconnect();
        },
        connect: function(details) {
          details.observer.observe(details.target, details.config);
        },
        joinMutations: function(mutations) {
          var jMutations = [];
          var targetList = [];
          var obj, hasNodes, jObj = {};
          var mutation, i, node, tIndex;
          for (;mutation = mutations.shift(); ) {
            tIndex = targetList.indexOf(mutation.target);
            if (tIndex === -1) {
              tIndex = targetList.push(mutation.target) - 1;
              jObj[tIndex] = {
                target: mutation.target,
                added: [],
                removed: []
              };
            }
            obj = jObj[tIndex];
            hasNodes = void 0;
            for (i = 0; node = mutation.addedNodes[i]; i++) if (1 === node.nodeType) {
              obj.added.push(node);
              hasNodes = !0;
            }
            for (i = 0; node = mutation.removedNodes[i]; i++) if (1 === node.nodeType) {
              obj.removed.push(node);
              hasNodes = !0;
            }
            if (void 0 !== hasNodes && void 0 === obj.inList) {
              obj.inList = !0;
              jMutations.push(obj);
            }
          }
          return jMutations;
        },
        isMatched: null,
        prepareMatched: function() {
          if (!this.isMatched) {
            var el = document.createElement("div");
            "function" == typeof el.matches ? this.isMatched = function(node, selector) {
              return node.matches(selector);
            } : "function" == typeof el.matchesSelector ? this.isMatched = function(node, selector) {
              return node.matchesSelector(selector);
            } : "function" == typeof el.webkitMatchesSelector ? this.isMatched = function(node, selector) {
              return node.webkitMatchesSelector(selector);
            } : "function" == typeof el.mozMatchesSelector ? this.isMatched = function(node, selector) {
              return node.mozMatchesSelector(selector);
            } : "function" == typeof el.oMatchesSelector ? this.isMatched = function(node, selector) {
              return node.oMatchesSelector(selector);
            } : "function" == typeof el.msMatchesSelector && (this.isMatched = function(node, selector) {
                return node.msMatchesSelector(selector);
              });
            el = null;
          }
        },
        match: function(details, summaryList, mutation) {
          var _this = this;
          var node, i, query, n;
          var queries = details.queries;
          var hasChanges = !1;
          [ "added", "removed" ].forEach(function(type) {
            var nodeList = mutation[type];
            for (n = 0; node = nodeList[n]; n++) for (i = 0; query = queries[i]; i++) if (void 0 === query.is || query.is === type) {
              var nodeArr = summaryList[i][type];
              _this.isMatched(node, query.css) === !0 ? nodeArr.push(node) : nodeArr.push.apply(nodeArr, node.querySelectorAll(query.css));
              hasChanges === !1 && (hasChanges = void 0 !== nodeArr[0]);
            }
          });
          return hasChanges;
        },
        filterTarget: function(queries, node) {
          var i, query;
          for (i = 0; query = queries[i]; i++) if (this.isMatched(node, query.css) === !0) return !0;
          return !1;
        },
        run: function(_details) {
          var _this = this;
          var details = {
            config: {
              childList: !0,
              subtree: !0
            },
            target: document.body,
            filterTarget: []
          };
          utils.extend(details, _details);
          details._disconnect = this.disconnect.bind(this, details);
          details._connect = this.connect.bind(this, details);
          details._match = this.match.bind(this, details);
          var _summaryList = [];
          for (var i = 0; i < details.queries.length; i++) _summaryList.push({
            added: [],
            removed: []
          });
          _summaryList = JSON.stringify(_summaryList);
          this.prepareMatched();
          var mObserver = this.getMutationObserver();
          details.observer = new mObserver(function(mutations) {
            var jMutations = _this.joinMutations(mutations);
            if (0 !== jMutations.length) {
              var hasChanges = !1;
              var mutation;
              var summaryList = JSON.parse(_summaryList);
              for (;mutation = jMutations.shift(); ) _this.filterTarget(details.filterTarget, mutation.target) === !1 && details._match(summaryList, mutation) === !0 && (hasChanges = !0);
              hasChanges === !0 && details.callback(summaryList);
            }
          });
          details.start = function() {
            details._disconnect();
            details._connect();
            var hasChanges = !1;
            var summaryList = JSON.parse(_summaryList);
            var mutation = {
              added: [ details.target ],
              removed: []
            };
            details._match(summaryList, mutation) && (hasChanges = !0);
            hasChanges === !0 && details.callback(summaryList);
          };
          details.stop = function() {
            details._disconnect();
          };
          details.start();
          return details;
        }
      };
      utils.request = function(details) {
        "object" != typeof details && (details = {
          url: details
        });
        var xhrSuccessStatus = {
          0: 200,
          1223: 204
        };
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", details.url, !0);
          xhr.onload = function() {
            var status = xhrSuccessStatus[xhr.status] || xhr.status;
            (status >= 200 && status < 300 || 304 === status) && "string" == typeof xhr.responseText ? resolve({
              body: xhr.responseText
            }) : reject(new CustomError(xhr.status + " " + xhr.statusText));
          };
          xhr.onerror = xhr.onabort = function() {
            reject(new CustomError(xhr.status + " " + xhr.statusText));
          };
          xhr.send();
        });
      };
      utils.tbrExists = function() {
        return !!document.body.parentNode.dataset.travelBar;
      };
      utils.tbrSetGlobal = function() {
        return document.body.parentNode.dataset.travelBar = "1";
      };
      utils.isFrame = function() {
        return document.defaultView.self !== document.defaultView.top;
      };
      utils.isDeny = function() {
        return /^https?:\/\/(?:[^\/]+\.)?(aviasales|search\.hotellook)\.[a-z.]{2,}(?:|\/.*)$/.test(document.referrer);
      };
      utils.stripStack = function(stack) {
        var m = /([^\s(]+\/)([^\/\s]+\.js)/.exec(stack);
        if (m) {
          var path = m[1];
          var fn = m[2];
          var shortFn = fn;
          shortFn = shortFn.replace(".lite", "l");
          shortFn = shortFn.replace(".min", "m");
          shortFn = shortFn.replace("travelBar", "t");
          stack = shortFn + ":" + stack.split(path + fn).join("js");
        }
        stack = stack.replace(/\r/g, "").replace(/\s*\n\s*/g, ">").replace(/\s{2,}/g, " ").replace(/https?:\/(?:\/[^\/]+)+\/([^\/]+\.js)/g, "$1");
        return stack;
      };
      module.exports = utils;
    }).call(exports, __webpack_require__(26), __webpack_require__(25));
  }, function(module, exports, __webpack_require__) {
    var getProfileName = function() {
      var origin = location.origin || location.protocol + "//" + location.hostname;
      var urlPatternToStrRe = __webpack_require__(4);
      var siteList = __webpack_require__(5);
      var patternArray = Object.keys(siteList);
      var patternRe;
      var result = {};
      for (var id, i = 0; id = patternArray[i]; i++) {
        patternRe = new RegExp(urlPatternToStrRe(id));
        if (patternRe.test(origin)) {
          result.pattern = id;
          result.id = siteList[id];
          break;
        }
      }
      result.id || (result = null);
      return result;
    };
    module.exports = getProfileName;
  }, function(module, exports) {
    var escapeRegex = function(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    };
    var urlPatternToStrRe = function(value) {
      if ("<all_urls>" === value) return "^https?:\\/\\/.+$";
      var m = /(\*|http|https|file|ftp):\/\/([^\/]+)(?:\/(.*))?/.exec(value);
      if (!m) throw new Error("Invalid url-pattern");
      var scheme = m[1];
      "*" === scheme && (scheme = "https?");
      var host = m[2];
      if ("*" === host) host = ".+"; else {
        host = escapeRegex(host);
        host = host.replace(/^\\\*\\\./, "(?:[^/]+\\.)?");
        host = host.replace(/\\\.\\\*$/g, "\\.[a-z\\.]{2,}");
      }
      var pattern = [ "^", scheme, ":\\/\\/", host ];
      var path = m[3];
      if (path) {
        if ("*" === path) {
          path = "(?:|/.*)";
          pattern.push(path);
          pattern.push("$");
        } else if (path) {
          path = "/" + path;
          path = escapeRegex(path);
          path = path.replace(/\\\*/g, ".*");
          pattern.push(path);
          pattern.push("$");
        }
      } else pattern.push("$");
      return pattern.join("");
    };
    module.exports = urlPatternToStrRe;
  }, function(module, exports, __webpack_require__) {
    var patternIdList = {
      "*://*.ozon.travel/*": "ozon_travel",
      "*://*.onetwotrip.com/*": "onetwotrip_com",
      "*://*.aeroflot.ru/*": "aeroflot_ru",
      "*://*.momondo.*/*": "momondo_com",
      "*://*.anywayanyday.com/*": "anywayanyday_com",
      "*://*.svyaznoy.travel/*": "svyaznoy_travel",
      "*://avia.tickets.ru/*": "tickets_ru",
      "*://*.s7.ru/*": "s7_ru",
      "*://*.kupibilet.ru/*": "kupibilet_ru",
      "*://*.trip.ru/*": "trip_ru",
      "*://*.sindbad.ru/*": "sindbad_ru",
      "*://*.aviakassa.ru/*": "aviakassa_ru",
      "*://*.biletix.ru/*": "biletix_ru",
      "*://*.utair.ru/*": "utair_ru",
      "*://*.kayak.*/*": "kayak_com",
      "*://*.orbitz.com/*": "travelocity_com",
      "*://*.travelocity.com/*": "travelocity_com",
      "*://*.expedia.com/*": "travelocity_com",
      "*://*.priceline.com/*": "priceline_com",
      "*://booking.airasia.com/*": "airasia_com",
      "*://*.ryanair.com/*": "ryanair_com",
      "*://*.booking.*/*": "booking_com",
      "*://*.agoda.*/*": "agoda_com",
      "*://*.hotels.com/*": "hotels_com",
      "*://*.ostrovok.ru/*": "ostrovok_ru",
      "*://*.travel.ru/*": "travel_ru",
      "*://*.oktogo.ru/*": "oktogo_ru",
      "*://*.roomguru.ru/*": "roomguru_ru",
      "*://*.tripadvisor.ru/*": "tripadvisor_ru",
      "*://*.hilton.ru/*": "hilton_com",
      "*://*.hilton.com/*": "hilton_com",
      "*://*.marriott.com/*": "marriott_com",
      "*://*.hostelworld.com/*": "hostelworld_com",
      "*://*.tiket.com/*": "tiket_com",
      "*://*.hotelsclick.com/*": "hotelsclick_com",
      "*://*.hotelscombined.com/*": "hotelscombined_com",
      "*://*.avis.*/*": "avis_com",
      "*://*.budget.com/*": "budget_com",
      "*://*.wizzair.com/*": "wizzair_com",
      "*://*.emirates.com/*": "emirates_com",
      "*://*.delta.com/*": "delta_com",
      "*://*.hertz.com/*": "hertz_com",
      "*://*.europcar.com/*": "europcar_com"
    };
    patternIdList["*://*.skyscanner.*/*"] = "skyscanner_com";
    module.exports = patternIdList;
  }, function(module, exports, __webpack_require__) {
    (function(tbr, CustomError) {
      var getPageProfile = function(profileInfo, profileJson) {
        var profileDetails;
        if (profileJson) profileDetails = __webpack_require__(24)(profileJson); else {
          var profileList = __webpack_require__(22)();
          var pattern = profileInfo.pattern;
          var profileFn = profileList[pattern];
          if (!profileFn) {
            tbr.error("Template is not found!", pattern);
            throw new CustomError("Template is not found!");
          }
          profileDetails = profileFn();
        }
        Array.isArray(profileDetails) || (profileDetails = [ profileDetails ]);
        var details = null;
        profileDetails.some(function(item) {
          if (!item.locationCheck) {
            details = item;
            return !0;
          }
          if (item.locationCheck(location.href)) {
            details = item;
            return !0;
          }
        });
        return details;
      };
      module.exports = getPageProfile;
    }).call(exports, __webpack_require__(8), __webpack_require__(25));
  }, function(module, exports, __webpack_require__) {
    (function(api) {
      var getLanguage = function() {
        var langCode = function() {
          var langCode = "";
          api.getUILanguage && (langCode = api.getUILanguage());
          langCode || (langCode = navigator.language);
          langCode && "string" == typeof langCode || (langCode = "en");
          return langCode.toLowerCase().substr(0, 2);
        }();
        var lang = {
          ru: {
            lang: "ru",
            foundOneWay: "Найден билет дешевле",
            foundTwoWay: "Билеты дешевле",
            view: "Посмотреть",
            origin: "Туда:",
            destination: "Обратно:",
            close: "Закрыть",
            foundHotel: "Найдена лучшая цена",
            aroundHotel: "Рядом есть отель лучше",
            checkIn: "Дата заезда:",
            checkOut: "Дата отъезда:",
            inMonth: "в %month%",
            calLabel: "Выгодное предложение!",
            suggests: "Ещё отели",
            foundCars: "Забронируй со скидкой!",
            carsView: "Сэкономить",
            e1_foundOneWay: "Есть билеты дешевле",
            e1_view: "Сэкономить",
            e2_foundHotel: "Хотите сэкономить?",
            e2_pricePre: "за",
            e2_view: "Забронировать дешевле"
          },
          en: {
            lang: "en",
            foundOneWay: "Found a better price",
            foundTwoWay: "Better price",
            view: "Learn more",
            origin: "Depart:",
            destination: "Return:",
            close: "Close",
            foundHotel: "Found a better price",
            aroundHotel: "Found a better hotel around",
            checkIn: "Check-in:",
            checkOut: "Check-out:",
            inMonth: "in %month%",
            calLabel: "Get a better deal!",
            suggests: "More hotels",
            foundCars: "Get discount on booking!",
            carsView: "Book now!"
          }
        };
        "uk" === langCode && (langCode = "ru");
        return lang[langCode] || lang.en;
      };
      module.exports = getLanguage();
    }).call(exports, __webpack_require__(1));
  }, function(module, exports, __webpack_require__) {
    (function(api) {
      var tbr = {
        appName: "tbr",
        appId: "tbr.mono",
        version: "20170428.080600",
        language: null,
        appInfo: {},
        errorMap: {
          LOW_PRICE_IS_NOT_FOUND: 10,
          REQUEST_ABORTED: 11,
          CCY_NOT_SUPPORT: 42,
          AVIA_BACK_FAIL: 110,
          HOTEL_BACK_FAIL: 120,
          CARS_BACK_FAIL: 160
        },
        main: {}
      };
      tbr.error = function() {
        if (tbr.appInfo.debug) {
          var args = [ "tbr" ];
          args.push.apply(args, arguments);
          console.error.apply(console, args);
        }
      };
      tbr.log = function() {
        if (tbr.appInfo.debug) {
          var args = [ "tbr" ];
          args.push.apply(args, arguments);
          console.log.apply(console, args);
        }
      };
      tbr.emit = function(type) {
        if (tbr.appInfo[type]) {
          var args = [].slice.call(arguments, 1);
          try {
            api.sendMessage({
              action: "tbrEvent",
              type: type,
              data: args
            });
          } catch (err) {
            tbr.error("Emit error", err);
          }
        }
      };
      var errors = [];
      tbr.trackError = function(err) {
        var utils = __webpack_require__(2);
        var stack = "";
        stack = "string" == typeof err.stack ? err.stack : [ err.filename, err.lineno, err.name, err.message ].join(" ");
        stack = utils.stripStack(stack);
        if (errors.indexOf(stack) === -1) {
          errors.push(stack);
          tbr.emit("directTrack", {
            t: "exception",
            exd: stack.substr(0, 150),
            an: tbr.appName,
            aid: tbr.appId,
            av: tbr.version,
            tid: "UA-7055055-10"
          });
        }
      };
      module.exports = tbr;
    }).call(exports, __webpack_require__(1));
  }, function(module, exports, __webpack_require__) {
    (function(tbr, Promise, utils, CustomError) {
      var getAvia = function() {
        var main = tbr.main;
        var cache = {};
        var getPrice = function(params, priceParams) {
          var price = null;
          priceParams.price ? price = priceParams.price : priceParams.minPriceOut && priceParams.minPriceIn ? price = priceParams.minPriceOut + priceParams.minPriceIn : priceParams.minPriceOut ? price = priceParams.minPriceOut : priceParams.minPriceIn && (price = priceParams.minPriceIn);
          return price;
        };
        var requestAirports = function() {
          return cache.airportCityCodeMap ? Promise.resolve() : utils.request({
            url: "https://api.travelbar.tools/v1/tp/data/airports.json?" + utils.param({
              partnerId: tbr.appInfo.id
            })
          }).then(function(response) {
            var airports = JSON.parse(response.body);
            var airportCityCodeMap = {};
            airports.forEach(function(item) {
              item.code && item.city_code && (airportCityCodeMap[item.code] = item.city_code);
            });
            cache.airportCityCodeMap = airportCityCodeMap;
          });
        };
        var requestCities = function() {
          return cache.cityMap ? Promise.resolve() : utils.request({
            url: "https://api.travelbar.tools/v1/tp/data/cities.json?" + utils.param({
              partnerId: tbr.appInfo.id
            })
          }).then(function(response) {
            var cities = JSON.parse(response.body);
            var cityMap = {};
            cities.forEach(function(item) {
              item.code && item.name && (cityMap[item.code] = {
                name: item.name,
                name_translations: item.name_translations
              });
            });
            cache.cityMap = cityMap;
          });
        };
        var getCityName = function(code) {
          return Promise.all([ requestCities(), requestAirports() ]).then(function() {
            var name = null;
            var city = cache.cityMap[code];
            if (!city) {
              code = cache.airportCityCodeMap[code];
              city = cache.cityMap[code];
            }
            if (city) {
              var localName = city.name_translations && city.name_translations[tbr.language.lang];
              name = localName || city.name;
            }
            return name;
          });
        };
        var requestPrices = function(pageInfo) {
          var data = {
            origin: pageInfo.origin,
            destination: pageInfo.destination,
            depart_date: pageInfo.dateStart,
            return_date: pageInfo.dateEnd,
            currency: pageInfo.currency,
            locale: tbr.language.lang,
            partnerId: tbr.appInfo.id
          };
          return utils.request({
            url: "https://api.travelbar.tools/v1/avia/prices?" + utils.param(data)
          }).then(function(response) {
            var aviaResponse = JSON.parse(response.body);
            if (!(aviaResponse && aviaResponse.success && aviaResponse.currency && Array.isArray(aviaResponse.data))) {
              tbr.error("API is not success!", response.body);
              throw new CustomError("AVIA_BACK_FAIL");
            }
            return aviaResponse;
          });
        };
        var convertCurrency = function(results, fromCurrency, toCurrency) {
          var fromCcy = fromCurrency.toUpperCase();
          var toCcy = toCurrency.toUpperCase();
          return fromCcy === toCcy ? Promise.resolve() : main.currency.load().then(function() {
            if (!main.currency.exists(toCcy) || !main.currency.exists(fromCcy)) {
              tbr.error("Currency is not support!", toCcy, fromCcy);
              throw new CustomError("CCY_NOT_SUPPORT");
            }
            results.forEach(function(item) {
              item.converted_value = main.currency.convert(item.value, fromCcy, toCcy);
            });
          });
        };
        var requestData = function(pageInfo) {
          return requestPrices(pageInfo).then(function(aviaResponse) {
            return convertCurrency(aviaResponse.data, aviaResponse.currency, pageInfo.currency).then(function() {
              return aviaResponse;
            });
          });
        };
        var getLowPrice = function(results) {
          var lowValue = null;
          results.forEach(function(item) {
            var value = item.converted_value || item.value;
            (null === lowValue || lowValue > value) && (lowValue = value);
          });
          return lowValue;
        };
        return {
          getCityName: getCityName,
          onGetData: function(pageInfo) {
            tbr.log("Info", pageInfo);
            if (pageInfo.barRequestData) tbr.log("Data from API was requested, before. Skip"); else {
              pageInfo.barRequestData = !0;
              var currentBar = main.bar.current;
              currentBar && main.watcher.clearInfoObj(pageInfo);
              tbr.emit("track", {
                cd: "flightrequestdata",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "cheapflight",
                ea: "requestData",
                el: tbr.hostname,
                cd: "flightrequestdata",
                t: "event"
              });
              var onAbort = function(err) {
                var eventName = "discard";
                var errorMessage = err.message;
                "betterPrice" === errorMessage && (eventName = errorMessage);
                tbr.emit("track", {
                  ec: "cheapflight",
                  ea: eventName,
                  el: tbr.hostname,
                  t: "event"
                });
                var index = tbr.errorMap[errorMessage];
                if (index) {
                  var label = [ index, pageInfo.origin, pageInfo.destination, pageInfo.price, pageInfo.currency, pageInfo.dateStart, pageInfo.dateEnd || "" ].join(";");
                  tbr.emit("directTrack", {
                    ec: "cheapflightError",
                    ea: tbr.hostname,
                    el: label,
                    t: "event",
                    an: tbr.appName,
                    aid: tbr.appId,
                    av: tbr.version,
                    tid: "UA-7055055-10"
                  });
                }
              };
              main.bar.isAborted = !1;
              requestData(pageInfo).then(function(aviaResponse) {
                if (main.bar.isAborted) throw new CustomError("REQUEST_ABORTED");
                var lowPrice = getLowPrice(aviaResponse.data);
                if (null === lowPrice) {
                  tbr.error("Low price is not found!", pageInfo.price);
                  throw new CustomError("LOW_PRICE_IS_NOT_FOUND");
                }
                tbr.emit("track", {
                  cd: "flightresponsedata",
                  t: "screenview"
                });
                tbr.emit("track", {
                  ec: "cheapflight",
                  ea: "responseData",
                  el: tbr.hostname,
                  cd: "flightresponsedata",
                  t: "event"
                });
                main.bar.aviaBarSaveInHistory(pageInfo, aviaResponse);
                var hasLowerPrice = lowPrice >= pageInfo.price;
                hasLowerPrice && tbr.log("Has lower price!", lowPrice, pageInfo.price);
                tbr.appInfo.debug && (hasLowerPrice = !1);
                if (hasLowerPrice) throw new CustomError("betterPrice");
                return main.bar.create({
                  type: "avia",
                  prices: aviaResponse,
                  pageInfo: pageInfo
                });
              }).catch(function(err) {
                if (err instanceof CustomError) tbr.log(err.message); else {
                  tbr.error(err);
                  tbr.trackError(err);
                }
                currentBar && currentBar.close();
                onAbort(err);
              });
            }
          },
          page: {
            getData: function(params, priceParams) {
              var checkKeys = [ "origin", "destination", "dateStart", "currency", "price" ];
              var data = {
                origin: params.origin,
                destination: params.destination,
                dateStart: params.dateStart,
                dateEnd: params.dateEnd,
                currency: params.currency,
                price: getPrice(params, priceParams)
              };
              var r = checkKeys.every(function(key) {
                return !!data[key];
              });
              return r ? data : null;
            },
            getPriceId: function(params) {
              var idKeys = [ "origin", "destination", "dateStart", "dateEnd", "currency" ];
              var id = [];
              var r = idKeys.every(function(key) {
                var value = params[key];
                id.push(value);
                return "dateEnd" === key || !!value;
              });
              return r ? id.join(";") : null;
            }
          }
        };
      };
      module.exports = getAvia;
    }).call(exports, __webpack_require__(8), __webpack_require__(26), __webpack_require__(2), __webpack_require__(25));
  }, function(module, exports, __webpack_require__) {
    (function(tbr, utils, CustomError, Promise) {
      var getHotel = function() {
        var main = tbr.main;
        var getPrice = function(params, priceParams) {
          var price = null;
          if (priceParams.price) price = priceParams.price; else if (priceParams.oneDayPrice && params.dayCount) price = priceParams.oneDayPrice * params.dayCount; else if (priceParams.oneDayPrice && params.dateIn && params.dateOut) {
            var dateIn = new Date(params.dateIn);
            var dateOut = new Date(params.dateOut);
            var dayCount = Math.round((dateOut.getTime() - dateIn.getTime()) / 24 / 60 / 60 / 1e3);
            price = priceParams.oneDayPrice * dayCount;
          }
          return price;
        };
        var getLowPrices = function(prices) {
          var value = null;
          var suggestsValue = null;
          prices.forEach(function(item) {
            var _value = item.converted_value || item.value;
            item.isSuggest ? (null === suggestsValue || _value < suggestsValue) && (suggestsValue = _value) : (null === value || _value < value) && (value = _value);
          });
          return [ value, suggestsValue ];
        };
        var requestHotelQueryPrices = function(pageInfo, index) {
          var data = {
            hotel_name: pageInfo.query[index],
            checkIn: pageInfo.dateIn,
            checkOut: pageInfo.dateOut,
            adults: pageInfo.adults,
            currency: pageInfo.currency,
            locale: tbr.language.lang,
            partnerId: tbr.appInfo.id
          };
          return utils.request({
            url: "https://api.travelbar.tools/v1/hotel/prices?" + utils.param(data)
          }).then(function(response) {
            var hotelResponse = JSON.parse(response.body);
            if (!(hotelResponse && hotelResponse.success && hotelResponse.currency && Array.isArray(hotelResponse.data))) {
              tbr.error("API is not success!", response.body);
              throw new CustomError("HOTEL_BACK_FAIL");
            }
            return hotelResponse;
          });
        };
        var requestHotelPrices = function(pageInfo) {
          var promise = Promise.reject();
          var lastSuggestsResponse = null;
          pageInfo.query.forEach(function(query, index) {
            promise = promise.catch(function() {
              return requestHotelQueryPrices(pageInfo, index).then(function(hotelResponse) {
                if (!hotelResponse.hasTarget) {
                  lastSuggestsResponse = hotelResponse;
                  throw new Error("Target is not exists!");
                }
                return hotelResponse;
              });
            });
          });
          promise = promise.catch(function(err) {
            if (!lastSuggestsResponse) throw err;
            return lastSuggestsResponse;
          });
          return promise;
        };
        var convertCurrency = function(results, fromCurrency, toCurrency) {
          var fromCcy = fromCurrency.toUpperCase();
          var toCcy = toCurrency.toUpperCase();
          return fromCcy === toCcy ? Promise.resolve() : main.currency.load().then(function() {
            if (!main.currency.exists(toCcy) || !main.currency.exists(fromCcy)) {
              tbr.error("Currency is not support!", toCcy, fromCcy);
              throw new CustomError("CCY_NOT_SUPPORT");
            }
            results.forEach(function(item) {
              item.converted_value = main.currency.convert(item.value, fromCcy, toCcy);
            });
          });
        };
        var requestHotelData = function(pageInfo) {
          return requestHotelPrices(pageInfo).then(function(hotelResponse) {
            return convertCurrency(hotelResponse.data, hotelResponse.currency, pageInfo.currency).then(function() {
              return hotelResponse;
            });
          });
        };
        return {
          onGetData: function(pageInfo) {
            tbr.log("Info", pageInfo);
            if (pageInfo.barRequestData) tbr.log("Data from API was requested, before. Skip"); else {
              pageInfo.barRequestData = !0;
              var currentBar = main.bar.current;
              currentBar && main.watcher.clearInfoObj(pageInfo);
              var onAbort = function(err) {
                var eventName = "discard";
                var errorMessage = err.message;
                "betterPrice" === errorMessage && (eventName = errorMessage);
                tbr.emit("track", {
                  ec: "hotel",
                  ea: eventName,
                  el: tbr.hostname,
                  t: "event"
                });
                var index = tbr.errorMap[errorMessage];
                if (index) {
                  var query = pageInfo.query[0];
                  var label = [ index, tbr.language.lang, pageInfo.dateIn, pageInfo.dateOut, pageInfo.adults, pageInfo.price, pageInfo.currency, query ].join(";");
                  tbr.emit("directTrack", {
                    ec: "hotelError",
                    ea: tbr.hostname,
                    el: label,
                    t: "event",
                    an: tbr.appName,
                    aid: tbr.appId,
                    av: tbr.version,
                    tid: "UA-7055055-10"
                  });
                }
              };
              tbr.emit("track", {
                cd: "hotelrequestdata",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "hotel",
                ea: "requestData",
                el: tbr.hostname,
                cd: "hotelrequestdata",
                t: "event"
              });
              main.bar.isAborted = !1;
              requestHotelData(pageInfo).then(function(hotelResponse) {
                if (main.bar.isAborted) throw new CustomError("REQUEST_ABORTED");
                tbr.emit("track", {
                  cd: "hotelresponsedata",
                  t: "screenview"
                });
                tbr.emit("track", {
                  ec: "hotel",
                  ea: "responseData",
                  el: tbr.hostname,
                  cd: "hotelresponsedata",
                  t: "event"
                });
                var lowPrices = getLowPrices(hotelResponse.data);
                var lowPrice = lowPrices[0];
                var lowSuggestPrice = lowPrices[1];
                var maxSuggestPrice = pageInfo.price + .2 * pageInfo.price;
                var targetPriceIsLow = lowPrice && lowPrice < pageInfo.price;
                var showSuggest = !1;
                var suggestPriceIsLow = !1;
                targetPriceIsLow || (suggestPriceIsLow = showSuggest = lowSuggestPrice && lowSuggestPrice < maxSuggestPrice);
                targetPriceIsLow || suggestPriceIsLow || tbr.log("Has low price!", lowPrices, pageInfo.price);
                tbr.appInfo.debug && (lowPrice ? targetPriceIsLow = !0 : suggestPriceIsLow && (suggestPriceIsLow = showSuggest = !0));
                if (!targetPriceIsLow && !suggestPriceIsLow) throw new CustomError("betterPrice");
                return main.bar.create({
                  type: "hotel",
                  showSuggestPrice: showSuggest,
                  prices: hotelResponse,
                  pageInfo: pageInfo
                });
              }).catch(function(err) {
                if (err instanceof CustomError) tbr.log(err.message); else {
                  tbr.error(err);
                  tbr.trackError(err);
                }
                currentBar && currentBar.close();
                onAbort(err);
              });
            }
          },
          page: {
            getData: function(params, priceParams) {
              var checkKeys = [ "query", "dateIn", "dateOut", "currency", "adults", "price" ];
              var data = {
                query: params.query,
                dateIn: params.dateIn,
                dateOut: params.dateOut,
                currency: params.currency,
                adults: params.adults,
                price: getPrice(params, priceParams)
              };
              var r = checkKeys.every(function(key) {
                return !!data[key];
              });
              return r ? data : null;
            },
            getPriceId: function(params) {
              var idKeys = [ "dateIn", "dateOut", "currency", "adults" ];
              var id = [];
              var r = idKeys.every(function(key) {
                var value = params[key];
                id.push(value);
                return !!value;
              });
              return r ? id.join(";") : null;
            }
          }
        };
      };
      module.exports = getHotel;
    }).call(exports, __webpack_require__(8), __webpack_require__(2), __webpack_require__(25), __webpack_require__(26));
  }, function(module, exports, __webpack_require__) {
    (function(tbr, utils, CustomError, Promise) {
      var getCars = function() {
        var main = tbr.main;
        var getPrice = function(params, priceParams) {
          var price = null;
          priceParams.price && (price = priceParams.price);
          return price;
        };
        var requestCarsPrice = function(pageInfo) {
          var data = {
            pickUpLocationId: pageInfo.pickUpLocationId,
            pickUpDate: pageInfo.pickUpDate,
            dropOffLocationId: pageInfo.dropOffLocationId,
            dropOffDate: pageInfo.dropOffDate,
            driverAge: pageInfo.driverAge,
            currency: pageInfo.currency,
            locale: tbr.language.lang,
            partnerId: tbr.appInfo.id
          };
          return utils.request({
            url: "https://api.travelbar.tools/v1/cars/prices?" + utils.param(data)
          }).then(function(response) {
            var carsResponse = JSON.parse(response.body);
            if (!(carsResponse && carsResponse.success && carsResponse.currency && Array.isArray(carsResponse.data))) {
              tbr.error("API is not success!", response.body);
              throw new CustomError("CARS_BACK_FAIL");
            }
            return carsResponse;
          });
        };
        var convertCurrency = function(results, fromCurrency, toCurrency) {
          var fromCcy = fromCurrency.toUpperCase();
          var toCcy = toCurrency.toUpperCase();
          return fromCcy === toCcy ? Promise.resolve() : main.currency.load().then(function() {
            if (!main.currency.exists(toCcy) || !main.currency.exists(fromCcy)) {
              tbr.error("Currency is not support!", toCcy, fromCcy);
              throw new CustomError("CCY_NOT_SUPPORT");
            }
            results.forEach(function(item) {
              item.converted_value = main.currency.convert(item.value, fromCcy, toCcy);
            });
          });
        };
        var requestData = function(pageInfo) {
          return requestCarsPrice(pageInfo).then(function(carsResponse) {
            return convertCurrency(carsResponse.data, carsResponse.currency, pageInfo.currency).then(function() {
              return carsResponse;
            });
          });
        };
        var getLowPrice = function(results) {
          var lowValue = null;
          results.forEach(function(item) {
            var value = item.converted_value || item.value;
            (null === lowValue || lowValue > value) && (lowValue = value);
          });
          return lowValue;
        };
        return {
          onGetData: function(pageInfo) {
            tbr.log("Info", pageInfo);
            if (pageInfo.barRequestData) tbr.log("Data from API was requested, before. Skip"); else {
              pageInfo.barRequestData = !0;
              var currentBar = main.bar.current;
              currentBar && main.watcher.clearInfoObj(pageInfo);
              var onAbort = function(err) {
                var eventName = "discard";
                var errorMessage = err.message;
                "betterPrice" === errorMessage && (eventName = errorMessage);
                tbr.emit("track", {
                  ec: "cars",
                  ea: eventName,
                  el: tbr.hostname,
                  t: "event"
                });
                var index = tbr.errorMap[errorMessage];
                if (index) {
                  var label = [ index, tbr.language.lang, pageInfo.pickUpLocationId, pageInfo.dropOffLocationId, pageInfo.driverAge, pageInfo.price, pageInfo.currency, pageInfo.pickUpDate, pageInfo.dropOffDate ].join(";");
                  tbr.emit("directTrack", {
                    ec: "carsError",
                    ea: tbr.hostname,
                    el: label,
                    t: "event",
                    an: tbr.appName,
                    aid: tbr.appId,
                    av: tbr.version,
                    tid: "UA-7055055-10"
                  });
                }
              };
              tbr.emit("track", {
                cd: "carsrequestdata",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "cars",
                ea: "requestData",
                el: tbr.hostname,
                cd: "carsrequestdata",
                t: "event"
              });
              main.bar.isAborted = !1;
              requestData(pageInfo).then(function(carsResponse) {
                if (main.bar.isAborted) throw new CustomError("REQUEST_ABORTED");
                var lowPrice = getLowPrice(carsResponse.data);
                if (null === lowPrice) {
                  tbr.error("Low price is not found!", pageInfo.price);
                  throw new CustomError("LOW_PRICE_IS_NOT_FOUND");
                }
                tbr.emit("track", {
                  cd: "carsresponsedata",
                  t: "screenview"
                });
                tbr.emit("track", {
                  ec: "cars",
                  ea: "responseData",
                  el: tbr.hostname,
                  cd: "carsresponsedata",
                  t: "event"
                });
                var hasLowerPrice = lowPrice >= pageInfo.price;
                hasLowerPrice && tbr.log("Has lower price!", lowPrice, pageInfo.price);
                tbr.appInfo.debug && (hasLowerPrice = !1);
                if (hasLowerPrice) throw new CustomError("betterPrice");
                return main.bar.create({
                  type: "cars",
                  prices: carsResponse,
                  pageInfo: pageInfo
                });
              }).catch(function(err) {
                if (err instanceof CustomError) tbr.log(err.message); else {
                  tbr.error(err);
                  tbr.trackError(err);
                }
                currentBar && currentBar.close();
                onAbort(err);
              });
            }
          },
          page: {
            getData: function(params, priceParams) {
              var checkKeys = [ "pickUpLocationId", "pickUpDate", "dropOffLocationId", "dropOffDate", "driverAge", "currency", "price" ];
              var data = {
                pickUpLocationId: params.pickUpLocationId,
                pickUpDate: params.pickUpDate,
                dropOffLocationId: params.dropOffLocationId,
                dropOffDate: params.dropOffDate,
                driverAge: params.driverAge,
                currency: params.currency,
                price: getPrice(params, priceParams)
              };
              var r = checkKeys.every(function(key) {
                return !!data[key];
              });
              return r ? data : null;
            },
            getPriceId: function(params) {
              var idKeys = [ "pickUpLocationId", "pickUpDate", "dropOffLocationId", "dropOffDate", "driverAge", "currency" ];
              var id = [];
              var r = idKeys.every(function(key) {
                var value = params[key];
                id.push(value);
                return !!value;
              });
              return r ? id.join(";") : null;
            }
          }
        };
      };
      module.exports = getCars;
    }).call(exports, __webpack_require__(8), __webpack_require__(2), __webpack_require__(25), __webpack_require__(26));
  }, function(module, exports, __webpack_require__) {
    (function(Promise, utils, tbr) {
      var getCurrency = function() {
        var cache = null;
        return {
          exists: function(currency) {
            return !!cache[currency];
          },
          load: function() {
            return cache ? Promise.resolve(cache) : utils.request({
              url: "https://api.travelbar.tools/v1/as/currencies/all_currencies_rates?" + utils.param({
                partnerId: tbr.appInfo.id
              })
            }).then(function(response) {
              var obj = JSON.parse(response.body);
              var _cache = {};
              Object.keys(obj).forEach(function(key) {
                _cache[key.toUpperCase()] = obj[key];
              });
              return cache = _cache;
            });
          },
          convert: function(price, fromCcy, toCcy) {
            toCcy = toCcy.toUpperCase();
            fromCcy = fromCcy.toUpperCase();
            var fromCourse = cache[fromCcy];
            var toCourse = cache[toCcy];
            return price * fromCourse / toCourse;
          }
        };
      };
      module.exports = getCurrency;
    }).call(exports, __webpack_require__(26), __webpack_require__(2), __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr, utils, CustomError, api) {
      var getBarUi = function() {
        var main = tbr.main;
        var barHeight = 55;
        var origPageStyle = {};
        var getRandomInt = function(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        };
        var marginPage = function(bar, show) {
          var barWEl = bar.wDom.wGet(bar.body.node);
          var htmlNode = document.body.parentNode;
          if (show) {
            origPageStyle.marginTop = htmlNode.style.marginTop;
            origPageStyle.transition = htmlNode.style.transition;
            htmlNode.style.transition = "margin-top 0.2s";
            barWEl.removeCheckStyles("marginTop");
            barWEl.setStyle("marginTop", "-" + barHeight + "px");
            barWEl.setStyle("transition", "margin-top 0.2s");
            setTimeout(function() {
              htmlNode.style.marginTop = barHeight + "px";
              barWEl.setStyle("marginTop", "");
              htmlNode.style.setProperty && htmlNode.style.setProperty("margin-top", barHeight + "px", "important");
              setTimeout(function() {
                htmlNode.style.transition = origPageStyle.transition;
                barWEl.setStyle("transition", "");
                var onMouseMove = function() {
                  document.removeEventListener("mousemove", onMouseMove);
                  setTimeout(function() {
                    barWEl.addCheckStyles("marginTop");
                  }, 250);
                };
                document.addEventListener("mousemove", onMouseMove);
              }, 250);
            }, 0);
            var onShow = tbr.currentProfile.onShow;
            onShow && onShow(barHeight);
          } else {
            htmlNode.style.marginTop = origPageStyle.marginTop;
            var onHide = tbr.currentProfile.onHide;
            onHide && onHide();
          }
        };
        var getRandomIndex = function(len) {
          var value = getRandomInt(0, 100);
          var percent = 100 / len;
          var index = 0;
          if (len > 0 && percent > 0) for (;value > percent; ) {
            value -= percent;
            index++;
          }
          return index;
        };
        var wrapAviaBarContent = function(pageInfo, content) {
          var isCalendar = content.isCalendar;
          if (!isCalendar) {
            var modList = [ "" ];
            "ru" === tbr.language.lang && modList.push(function() {
              content.barTitle = tbr.language.e1_foundOneWay;
              content.open = tbr.language.e1_view;
            });
            var index = getRandomIndex(modList.length);
            var fn = modList[index];
            fn && fn();
          }
        };
        var wrapHotelBarContent = function(pageInfo, content) {
          var isSuggest = content.isSuggest;
          if (!isSuggest) {
            var modList = [ "" ];
            "ru" === tbr.language.lang && modList.push(function() {
              content.barTitle = tbr.language.e2_foundHotel;
              content.priceText = utils.create(document.createDocumentFragment(), {
                append: [ tbr.language.e2_pricePre + " ", utils.getPriceNode(content.currency, content.value) ]
              });
              content.open = tbr.language.e2_view;
            });
            var index = getRandomIndex(modList.length);
            var fn = modList[index];
            fn && fn();
          }
        };
        var Bar = function(details) {
          var _this = this;
          this.hostname = tbr.hostname;
          this.type = details.type;
          this.details = details;
          this.isClosed = !1;
          this.isRemoved = !1;
          this.container = document.createDocumentFragment();
          var WDom = __webpack_require__(17);
          var WSheets = __webpack_require__(18);
          var StyleWatcher = __webpack_require__(16);
          this.styleWatcher = new StyleWatcher(this, function(wNode, key, value, refValues) {
            _this.onBarChangeStyle(wNode, key, value, refValues);
          });
          this.wDom = new WDom();
          this.wSheets = new WSheets();
          this.barContent = this.getBarContent();
          this.body = this.getBody();
          this.content = this.getContent();
          this.wDom.wGet(this.body.content).appendChild(this.content.node);
          this.style = this.getStyle();
          this.container.appendChild(this.body.node);
          this.container.appendChild(this.style.node);
          this.wDom.wGet(this.container);
          this.wDom.wGet(this.style.node);
          var ChangeWatcher = __webpack_require__(14);
          var RemoveWatcher = __webpack_require__(15);
          var onChangeNode = function(mutation) {
            _this.onBarChange(mutation);
          };
          this.body.changeWatcher = new ChangeWatcher(this.body.node, onChangeNode);
          this.body.changeWatcher.start();
          this.style.changeWatcher = new ChangeWatcher(this.style.node, onChangeNode);
          this.style.changeWatcher.start();
          var onRemoveNode = function(mutation) {
            _this.onBarRemove(mutation);
          };
          this.body.removeWatcher = new RemoveWatcher(this.body.node, onRemoveNode);
          this.style.removeWatcher = new RemoveWatcher(this.style.node, onRemoveNode);
        };
        var onBarChangeFired = 1;
        Bar.prototype.onBarChange = function(mutation) {
          var _this = this;
          var type = mutation.type;
          var target = mutation.target;
          var result = null;
          var wEl = _this.wDom.get(target);
          if (wEl) {
            try {
              "attributes" === type ? result = wEl.checkAttributes(mutation.attributeName) : "characterData" === type ? result = wEl.checkCharacterData() : "childList" === type && (result = wEl.checkChildList());
            } catch (err) {
              tbr.error(err);
              tbr.trackError(err);
            }
            if (!result) {
              tbr.error(type, mutation);
              onBarChangeFired-- > 0 && tbr.emit("directTrack", {
                ec: "block",
                ea: "mutation:" + type,
                el: _this.hostname,
                t: "event",
                an: tbr.appName,
                aid: tbr.appId,
                av: tbr.version,
                tid: "UA-7055055-10"
              });
            }
          } else tbr.error("wEl not found", mutation);
        };
        var onBarChangeStyleFired = 1;
        Bar.prototype.onBarChangeStyle = function(wNode, key, value, refValues) {
          var _this = this;
          var result = wNode.fixStyleProperty(key, value, refValues);
          if (!result) {
            tbr.error("onBarChangeStyle", key, value, refValues, wNode);
            onBarChangeStyleFired-- > 0 && tbr.emit("directTrack", {
              ec: "block",
              ea: "style",
              el: _this.hostname,
              t: "event",
              an: tbr.appName,
              aid: tbr.appId,
              av: tbr.version,
              tid: "UA-7055055-10"
            });
          }
        };
        var onBarRemoveFired = 1;
        Bar.prototype.onBarRemove = function(mutation) {
          var _this = this;
          tbr.error("removed", mutation);
          tbr.main.watcher.closeCurrentBar();
          onBarRemoveFired-- > 0 && tbr.emit("directTrack", {
            ec: "block",
            ea: "removed",
            el: _this.hostname,
            t: "event",
            an: tbr.appName,
            aid: tbr.appId,
            av: tbr.version,
            tid: "UA-7055055-10"
          });
        };
        Bar.prototype.trackByVendor = function(data) {
          var map = {
            aviasales: "as",
            skyscanner: "sc"
          };
          var vendor = this.barContent.vendor;
          var prefix = map[vendor];
          if (prefix) {
            data.ec += "-" + prefix;
            return tbr.emit("track", data);
          }
          return tbr.error("Prefix is not found!", vendor);
        };
        Bar.prototype.getAviaBarContent = function() {
          var _this = this;
          var details = this.details;
          var pageInfo = details.pageInfo;
          var wSheet = _this.wSheets.getSheet();
          var prices = details.prices;
          var getAviaBarItemIndex = function(priceList) {
            var minDate = null;
            var minItem = null;
            priceList.forEach(function(item) {
              var m = /(\d{4}.\d{2}.\d{2})/.exec(item.depart_date);
              if (m) {
                var date = m[1];
                if (null === minDate || minDate > date) {
                  minDate = date;
                  minItem = null;
                }
                date === minDate && (null === minItem || item.value < minItem.value) && (minItem = item);
              }
            });
            var index = priceList.indexOf(minItem);
            tbr.log("Bar item", index, minItem);
            tbr.log("Result prices", priceList);
            return index;
          };
          var barItem = prices.data[getAviaBarItemIndex(prices.data)];
          if (!barItem) {
            tbr.error("Bar item is not found!", details);
            return null;
          }
          var isCalendar = !!barItem.monthPrice;
          var isOneWay = !pageInfo.dateEnd;
          var content = {
            value: barItem.converted_value || barItem.value,
            currency: pageInfo.currency,
            origin: barItem.origin,
            originName: barItem.originName,
            destination: barItem.destination,
            destinationName: barItem.destinationName,
            dateStart: barItem.depart_date,
            dateEnd: barItem.return_date,
            open: tbr.language.view,
            monthPrice: !!barItem.monthPrice,
            vendor: barItem.vendor || "aviasales",
            url: barItem.url,
            isCalendar: isCalendar,
            isOneWay: isOneWay
          };
          isCalendar ? content.priceText = utils.getPriceNode(content.currency, content.value) : content.priceText = utils.create(document.createDocumentFragment(), {
            append: function() {
              var nodes = [];
              if (pageInfo.price > content.value) {
                wSheet.add({
                  redPrice: {
                    textDecoration: "line-through",
                    color: "#F44336"
                  }
                });
                nodes.push(utils.create("span", {
                  class: wSheet.classes.redPrice,
                  append: [ utils.getPriceNode(content.currency, pageInfo.price) ]
                }));
                nodes.push(String.fromCharCode(160));
              } else tbr.error("Red price is hidden", pageInfo.price, content.value);
              nodes.push(utils.getPriceNode(content.currency, content.value));
              return nodes;
            }()
          });
          if (isCalendar) {
            content.barTitle = tbr.language.calLabel;
            content.dateText = tbr.language.inMonth.replace("%month%", utils.getCalMonth(content.dateStart));
          } else if (isOneWay) {
            content.barTitle = tbr.language.foundOneWay;
            content.dateText = utils.getDate(content.dateStart, !0);
          } else {
            content.barTitle = tbr.language.foundTwoWay;
            content.dateText = utils.getDateInterval(content.dateStart, content.dateEnd);
          }
          if (!content.originName || !content.destinationName) {
            tbr.error("City name is not found!", content.origin, content.destination);
            throw new CustomError("City name is not found!");
          }
          wrapAviaBarContent(pageInfo, content);
          return content;
        };
        Bar.prototype.getHotelBarContent = function() {
          var details = this.details;
          var pageInfo = details.pageInfo;
          var prices = details.prices;
          var getHotelBarItem = function(prices) {
            var barItem = null;
            var isSuggest = !!details.showSuggestPrice;
            prices.data.filter(function(item) {
              return isSuggest === !!item.isSuggest;
            }).forEach(function(item) {
              (null === barItem || barItem.value > item.value) && (barItem = item);
            });
            var suggestItemList = [];
            prices.data.forEach(function(item) {
              item.isSuggest && item !== barItem && suggestItemList.push(item);
            });
            return {
              barItem: barItem,
              suggestItemList: suggestItemList
            };
          };
          var pricesObj = getHotelBarItem(prices);
          var barItem = pricesObj.barItem;
          if (!barItem) {
            tbr.error("Bar item is not found!", details);
            return null;
          }
          var getHotelContent = function(barItem) {
            var isSuggest = !!barItem.isSuggest;
            ("number" != typeof barItem.stars || barItem < 0 || barItem.stars > 5) && (barItem.stars = 0);
            var content = {
              name: barItem.name,
              stars: barItem.stars,
              value: barItem.converted_value || barItem.value,
              currency: pageInfo.currency,
              dateIn: pageInfo.dateIn,
              dateOut: pageInfo.dateOut,
              open: tbr.language.view,
              url: barItem.deeplink,
              isSuggest: isSuggest
            };
            content.priceText = utils.getPriceNode(content.currency, content.value);
            isSuggest ? content.barTitle = tbr.language.aroundHotel : content.barTitle = tbr.language.foundHotel;
            content.dateText = utils.getDateInterval(content.dateIn, content.dateOut);
            return content;
          };
          var content = getHotelContent(barItem);
          content.suggestList = pricesObj.suggestItemList.map(getHotelContent);
          content.suggestList.sort(function(a, b) {
            return a.value < b.value ? -1 : 1;
          });
          wrapHotelBarContent(pageInfo, content);
          return content;
        };
        Bar.prototype.getCarsBarContent = function() {
          var _this = this;
          var details = this.details;
          var pageInfo = details.pageInfo;
          var prices = details.prices;
          var wSheet = _this.wSheets.getSheet();
          var getCarsBarItem = function(priceList) {
            var barItem = null;
            priceList.forEach(function(item) {
              (!barItem || barItem.value > item.value) && (barItem = item);
            });
            return barItem;
          };
          var barItem = getCarsBarItem(prices.data);
          if (!barItem) {
            tbr.error("Bar item is not found!", details);
            return null;
          }
          var content = {
            value: barItem.converted_value || barItem.value,
            currency: pageInfo.currency,
            vehicleName: barItem.vehicleName,
            pickUpLocName: barItem.pickUpLocName,
            pickUpLocCode: barItem.pickUpLocCode,
            pickUpDate: barItem.pickUpDate,
            dropOffLocName: barItem.dropOffLocName,
            dropOffLocCode: barItem.dropOffLocCode,
            dropOffDate: barItem.dropOffDate,
            url: barItem.url
          };
          content.priceText = utils.create(document.createDocumentFragment(), {
            append: function() {
              var nodes = [];
              if (pageInfo.price > content.value) {
                wSheet.add({
                  redPrice: {
                    textDecoration: "line-through",
                    color: "#F44336"
                  }
                });
                nodes.push(utils.create("span", {
                  class: wSheet.classes.redPrice,
                  append: [ utils.getPriceNode(content.currency, pageInfo.price) ]
                }));
                nodes.push(String.fromCharCode(160));
              } else tbr.error("Red price is hidden", pageInfo.price, content.value);
              nodes.push(utils.getPriceNode(content.currency, content.value));
              return nodes;
            }()
          });
          content.pickUpText = content.pickUpLocName;
          content.pickUpLocCode && (content.pickUpText += ", " + content.pickUpLocCode);
          content.dropOffText = content.dropOffLocName;
          content.dropOffLocCode && (content.dropOffText += ", " + content.dropOffLocCode);
          content.isOnePoint = content.pickUpText === content.dropOffText;
          if (content.isOnePoint) content.dateText = utils.getDateInterval(content.pickUpDate, content.dropOffDate); else {
            content.pickUpDateText = utils.getDate(content.pickUpDate, !0);
            content.dropOffDateText = utils.getDate(content.dropOffDate, !0);
          }
          content.barTitle = tbr.language.foundCars;
          content.open = tbr.language.carsView;
          return content;
        };
        Bar.prototype.getBarContent = function() {
          return "avia" === this.type ? this.getAviaBarContent() : "hotel" === this.type ? this.getHotelBarContent() : "cars" === this.type ? this.getCarsBarContent() : void 0;
        };
        Bar.prototype.insertAviaBar = function() {
          var _this = this;
          _this.wDom;
          var wSheet = _this.wSheets.getSheet();
          var barContent = this.barContent;
          var content = document.createDocumentFragment();
          wSheet.add({
            cell: {
              fallbacks: {
                display: "inline-block"
              }
            }
          });
          wSheet.add({
            title: {
              extend: "cell",
              fontSize: "20px",
              fontWeight: "bold",
              margin: "auto 10px",
              lineHeight: "23px",
              verticalAlign: "middle"
            },
            "@media only screen and (max-width: 1150px)": {
              title: {
                fontSize: "18px"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              title: {
                fontSize: "14px",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.title,
            append: [ barContent.barTitle ]
          }));
          wSheet.add({
            flightInfoCell: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex",
                WebkitFlexGrow: 2
              },
              display: "flex",
              flexGrow: 2,
              verticalAlign: "middle",
              overflow: "hidden"
            }
          });
          var flightInfoCell = utils.create("div", {
            class: wSheet.classes.flightInfoCell
          });
          content.appendChild(flightInfoCell);
          wSheet.add({
            info: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex"
              },
              display: "flex",
              height: "38px",
              border: "1px solid rgba(0,0,0,0.10)",
              margin: "auto 10px",
              borderRadius: "19px",
              padding: "0 15px",
              overflow: "hidden"
            },
            "@media only screen and (max-width: 1050px)": {
              info: {
                marginLeft: "5px",
                marginRight: "5px",
                paddingLeft: "5px",
                paddingRight: "5px"
              }
            }
          });
          var flightInfoWrapper = utils.create("div", {
            class: wSheet.classes.info
          });
          flightInfoCell.appendChild(flightInfoWrapper);
          wSheet.add({
            point: {
              display: "inline-block",
              verticalAlign: "middle",
              margin: "auto 0",
              textOverflow: "ellipsis",
              color: "#000",
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden"
            }
          });
          var getPoint = function(name) {
            return utils.create("div", {
              class: wSheet.classes.point,
              title: name,
              text: name
            });
          };
          wSheet.add({
            flightWrapper: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex"
              },
              display: "flex",
              verticalAlign: "middle",
              overflow: "hidden",
              margin: "auto 0",
              lineHeight: "36px"
            }
          });
          var flightWrapper = utils.create("div", {
            class: wSheet.classes.flightWrapper
          });
          flightInfoWrapper.appendChild(flightWrapper);
          flightWrapper.appendChild(getPoint(barContent.originName));
          wSheet.add({
            wayIcon: {
              display: "inline-block",
              verticalAlign: "middle",
              margin: "auto 6px",
              "& svg": {
                display: "block",
                opacity: "0.4"
              }
            }
          });
          var wayIcon = null;
          wayIcon = barContent.isOneWay ? this.getOneWaySvg() : this.getTwoWaySvg();
          flightWrapper.appendChild(utils.create("div", {
            class: wSheet.classes.wayIcon,
            append: wayIcon
          }));
          flightWrapper.appendChild(getPoint(barContent.destinationName));
          wSheet.add({
            dates: {
              extend: "cell",
              verticalAlign: "middle",
              margin: "auto 0 auto 10px",
              fontSize: "14px",
              color: "#978f6c"
            },
            "@media only screen and (max-width: 1050px)": {
              dates: {
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          var flightDates = utils.create("div", {
            class: wSheet.classes.dates
          });
          flightInfoWrapper.appendChild(flightDates);
          flightDates.appendChild(document.createTextNode(barContent.dateText));
          wSheet.add({
            price: {
              verticalAlign: "middle",
              fontSize: "20px",
              fontWeight: "bold",
              margin: "auto 10px",
              lineHeight: "23px",
              color: "#4b9f00",
              "& *": {
                fontWeight: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              price: {
                fontSize: "16px",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.price,
            append: [ barContent.priceText ]
          }));
          wSheet.add({
            openBtn: {
              extend: "cell",
              verticalAlign: "middle",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#FFF !important",
              margin: "auto 10px",
              padding: "10px 25px",
              backgroundColor: "#4b9f00 !important",
              borderRadius: "19px",
              textDecoration: "none !important",
              "&:hover": {
                backgroundColor: "#66ad26 !important",
                color: "#FFF !important"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              openBtn: {
                fontSize: "14px",
                marginLeft: "5px",
                marginRight: "5px",
                paddingLeft: "10px",
                paddingRight: "10px"
              }
            }
          });
          var moreBtn = utils.create("a", {
            class: wSheet.classes.openBtn,
            href: barContent.url,
            target: "_blank",
            append: [ barContent.open ]
          });
          utils.jsLink(moreBtn, function(e) {
            _this.content.onClick();
          });
          var moreBtnClick = function() {
            window.open(barContent.url);
            _this.content.onClick();
          };
          content.appendChild(moreBtn);
          var onAppend = function() {
            tbr.emit("track", {
              cd: "flightshow",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "cheapflight",
              ea: "show",
              el: _this.hostname,
              cd: "flightshow",
              t: "event"
            });
            if (barContent.isCalendar) tbr.emit("track", {
              cd: "flight_calendar_show",
              t: "screenview"
            }); else {
              _this.trackByVendor({
                ec: "cheapflight",
                ea: "show",
                el: _this.hostname,
                cd: "flightshow",
                t: "event"
              });
              tbr.emit("track", {
                cd: "flight_betterprice_show",
                t: "screenview"
              });
            }
          };
          var onReplace = function() {
            tbr.emit("track", {
              ec: "cheapflight",
              ea: "update",
              el: _this.hostname,
              t: "event"
            });
            if (barContent.isCalendar) tbr.emit("track", {
              cd: "flight_calendar_update",
              t: "screenview"
            }); else {
              _this.trackByVendor({
                ec: "cheapflight",
                ea: "update",
                el: _this.hostname,
                t: "event"
              });
              tbr.emit("track", {
                cd: "flight_betterprice_update",
                t: "screenview"
              });
            }
          };
          var onShow = function() {
            barContent.isCalendar && tbr.emit("track", {
              ec: "cheapflight",
              ea: "calendarPrice",
              el: _this.hostname,
              t: "event"
            });
          };
          var onClick = function() {
            tbr.emit("track", {
              cd: "flightclick",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "cheapflight",
              ea: "click",
              el: _this.hostname,
              cd: "flightclick",
              t: "event"
            });
            if (barContent.isCalendar) {
              tbr.emit("track", {
                cd: "flight_calendar_click",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "cheapflight",
                ea: "calendarclick",
                el: _this.hostname,
                cd: "flight_calendar_click",
                t: "event"
              });
            } else {
              tbr.emit("track", {
                cd: "flight_betterprice_click",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "cheapflight",
                ea: "betterpriceclick",
                el: _this.hostname,
                cd: "flight_betterprice_click",
                t: "event"
              });
              _this.trackByVendor({
                ec: "cheapflight",
                ea: "betterpriceclick",
                el: _this.hostname,
                cd: "flight_betterprice_click",
                t: "event"
              });
            }
          };
          var onClose = function() {
            tbr.emit("track", {
              ec: "cheapflight",
              ea: "close",
              el: _this.hostname,
              t: "event"
            });
            _this.trackByVendor({
              ec: "cheapflight",
              ea: "close",
              el: _this.hostname,
              t: "event"
            });
          };
          return {
            node: content,
            moreBtn: moreBtn,
            moreBtnClick: moreBtnClick,
            onAppend: onAppend,
            onReplace: onReplace,
            onShow: onShow,
            onClick: onClick,
            onClose: onClose
          };
        };
        Bar.prototype.insertCarsBar = function() {
          var _this = this;
          _this.wDom;
          var wSheet = _this.wSheets.getSheet();
          var barContent = this.barContent;
          var content = document.createDocumentFragment();
          wSheet.add({
            cell: {
              fallbacks: {
                display: "inline-block"
              },
              verticalAlign: "middle",
              margin: "auto 5px"
            }
          });
          wSheet.add({
            title: {
              extend: "cell",
              fontSize: "20px",
              margin: "auto 10px"
            },
            "@media only screen and (max-width: 1150px)": {
              title: {
                fontSize: "18px"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              title: {
                fontSize: "14px",
                fontWeight: "bold",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.title,
            append: [ barContent.barTitle ]
          }));
          wSheet.add({
            pointCell: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex",
                WebkitFlexDirection: "column"
              },
              display: "flex",
              flexDirection: "column"
            }
          });
          if (barContent.isOnePoint) {
            wSheet.add({
              lineDateCell: {
                color: "#666"
              }
            });
            content.appendChild(utils.create("div", {
              class: wSheet.classes.pointCell,
              append: [ utils.create("div", {
                text: barContent.pickUpText
              }), utils.create("div", {
                class: wSheet.classes.lineDateCell,
                text: barContent.dateText
              }) ]
            }));
          } else {
            content.appendChild(utils.create("div", {
              class: wSheet.classes.pointCell,
              append: [ utils.create("div", {
                text: barContent.pickUpText
              }), utils.create("div", {
                text: barContent.dropOffText
              }) ]
            }));
            wSheet.add({
              dateCellPoint: {
                extend: "cell",
                fallbacks: {
                  display: "-webkit-flex",
                  WebkitFlexDirection: "column"
                },
                display: "flex",
                flexDirection: "column",
                marginLeft: 0,
                color: "#666"
              }
            });
            content.appendChild(utils.create("div", {
              class: wSheet.classes.dateCellPoint,
              append: [ utils.create("div", {
                text: barContent.pickUpDateText
              }), utils.create("div", {
                text: barContent.dropOffDateText
              }) ]
            }));
          }
          wSheet.add({
            carCell: {
              extend: "cell",
              fallbacks: {
                WebkitFlexGrow: 1
              },
              flexGrow: 1,
              margin: "auto 10px",
              fontWeight: "bold",
              fontSize: "18px",
              overflow: "hidden",
              "& span": {
                textOverflow: "ellipsis",
                overflow: "hidden"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              carCell: {
                fontSize: "14px",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          var car = utils.create("div", {
            class: wSheet.classes.carCell,
            append: [ utils.create("span", {
              text: barContent.vehicleName
            }) ]
          });
          content.appendChild(car);
          wSheet.add({
            price: {
              extend: "cell",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#4b9f00",
              "& *": {
                fontWeight: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              price: {
                fontSize: "16px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.price,
            append: [ barContent.priceText ]
          }));
          wSheet.add({
            openBtn: {
              extend: "cell",
              fontSize: "16px",
              color: "#FFF !important",
              padding: "10px 20px",
              backgroundColor: "#4b9f00 !important",
              borderRadius: "19px",
              textDecoration: "none !important",
              "&:hover": {
                backgroundColor: "#66ad26 !important",
                color: "#FFF !important"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              openBtn: {
                fontSize: "14px",
                paddingLeft: "10px",
                paddingRight: "10px"
              }
            }
          });
          var moreBtn = utils.create("a", {
            class: wSheet.classes.openBtn,
            href: barContent.url,
            target: "_blank",
            append: [ barContent.open ]
          });
          utils.jsLink(moreBtn, function(e) {
            _this.content.onClick();
          });
          var moreBtnClick = function() {
            window.open(barContent.url);
            _this.content.onClick();
          };
          content.appendChild(moreBtn);
          var onAppend = function() {
            tbr.emit("track", {
              cd: "carsshow",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "cars",
              ea: "show",
              el: _this.hostname,
              cd: "carsshow",
              t: "event"
            });
          };
          var onReplace = function() {
            tbr.emit("track", {
              ec: "cars",
              ea: "update",
              el: _this.hostname,
              t: "event"
            });
          };
          var onShow = function() {};
          var onClick = function() {
            tbr.emit("track", {
              cd: "carsclick",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "cars",
              ea: "click",
              el: _this.hostname,
              cd: "carsclick",
              t: "event"
            });
          };
          var onClose = function() {
            tbr.emit("track", {
              ec: "cars",
              ea: "close",
              el: _this.hostname,
              t: "event"
            });
          };
          return {
            node: content,
            moreBtn: moreBtn,
            moreBtnClick: moreBtnClick,
            onAppend: onAppend,
            onReplace: onReplace,
            onShow: onShow,
            onClick: onClick,
            onClose: onClose
          };
        };
        Bar.prototype.getHotelSuggests = function(suggestList) {
          var _this = this;
          var wDom = _this.wDom;
          var getLayerPosition = function(moreBtn) {
            var getPosition = function(node) {
              var box = node.getBoundingClientRect();
              return {
                top: Math.round(box.top),
                left: Math.round(box.left + window.pageXOffset)
              };
            };
            var getSize = function(node) {
              return {
                width: node.offsetWidth,
                height: node.offsetHeight
              };
            };
            var btnPositionObj = getPosition(moreBtn);
            var btnSizeObj = getSize(moreBtn);
            var layerWidth = 720;
            var layerHeight = 480;
            var layerTop = btnPositionObj.top + btnSizeObj.height;
            var layerRight = 10;
            layerTop += 18;
            return {
              width: layerWidth,
              height: layerHeight,
              right: layerRight,
              top: layerTop
            };
          };
          var createSuggests = function(moreBtn) {
            var wSheet = _this.wSheets.getSheet();
            var updatePosition = function() {
              var position = getLayerPosition(moreBtn);
              var wLayer = wDom.wGet(layer);
              wLayer.setStyle("width", position.width + "px");
              wLayer.setStyle("maxHeight", position.height + "px");
              wLayer.setStyle("right", position.right + "px");
              wLayer.setStyle("top", position.top + "px");
            };
            wSheet.add({
              layer: {
                display: "block",
                backgroundColor: "#fff",
                padding: "30px 0",
                margin: 0,
                overflow: "auto",
                boxSizing: "border-box",
                border: "1px solid #ccc",
                boxShadow: "0 10px 20px rgba(0,0,0,.4)",
                position: "fixed",
                zIndex: "2147483647",
                cursor: "default"
              }
            });
            var layer = utils.create("div", {
              class: wSheet.classes.layer,
              on: [ "click", function(e) {
                e.stopPropagation();
              } ]
            });
            wSheet.add({
              layerClose: {
                display: "block",
                position: "absolute",
                top: "5px",
                right: "5px",
                opacity: "0.3",
                "&:hover": {
                  opacity: "0.7"
                }
              }
            });
            layer.appendChild(utils.create("a", {
              class: wSheet.classes.layerClose,
              href: "#tbr-suggests-close",
              title: tbr.language.close,
              append: [ utils.create(_this.getCloseSvg("20")) ],
              on: [ "click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                hideLayer();
              } ]
            }));
            var suggests = layer.appendChild(utils.create("div"));
            wSheet.add({
              suggest: {
                display: "table",
                width: "100%",
                height: "40px",
                fontSize: "15px",
                padding: "0 30px",
                boxSizing: "border-box",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#fcefb4"
                }
              },
              suggestCell: {
                display: "table-cell",
                width: "100px",
                verticalAlign: "middle",
                padding: "0 5px",
                textAlign: "center"
              },
              suggestName: {
                extend: "suggestCell",
                width: "auto",
                textAlign: "left"
              },
              suggestStars: {
                extend: "suggestCell",
                width: "90px",
                paddingTop: "2px"
              },
              suggestDate: {
                extend: "suggestCell",
                width: "150px",
                fontSize: "14px",
                color: "#4a4a4a"
              },
              suggestPrice: {
                extend: "suggestCell",
                fontWeight: "bold"
              },
              suggestOpenBtn: {
                padding: "6px 15px",
                color: "#fff !important",
                backgroundColor: "#4b9f00",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: "normal",
                whiteSpace: "pre",
                "&:hover": {
                  backgroundColor: "#66ad26 !important"
                }
              }
            });
            suggestList.slice(0, 6).forEach(function(item) {
              var getStar = function(one) {
                var style = {};
                one && (style.verticalAlign = "text-bottom");
                return utils.create(_this.getStarSvg("#F0BE22", "16"), {
                  style: style
                });
              };
              var fullStarsBody = utils.create("span");
              for (var i = 0; i < item.stars; i++) fullStarsBody.appendChild(getStar());
              suggests.appendChild(utils.create("div", {
                class: wSheet.classes.suggest,
                on: [ "click", function(e) {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(item.url);
                  onClick();
                } ],
                append: [ utils.create("div", {
                  class: wSheet.classes.suggestName,
                  text: item.name
                }), utils.create("div", {
                  class: wSheet.classes.suggestStars,
                  append: [ fullStarsBody ]
                }), utils.create("div", {
                  class: wSheet.classes.suggestDate,
                  text: item.dateText
                }), utils.create("div", {
                  class: wSheet.classes.suggestPrice,
                  append: [ item.priceText ]
                }), utils.create("div", {
                  class: wSheet.classes.suggestCell,
                  append: [ utils.jsLink(utils.create("a", {
                    class: wSheet.classes.suggestOpenBtn,
                    target: "_blank",
                    href: item.url,
                    text: item.open
                  }), function(e) {
                    onClick();
                  }) ]
                }) ]
              }));
            });
            var container = document.createDocumentFragment();
            container.appendChild(layer);
            wDom.wGet(_this.body.node).appendChild(container);
            var onClick = function() {
              tbr.emit("track", {
                cd: "hotelclick",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "hotel",
                ea: "suggestClick",
                el: _this.hostname,
                cd: "hotelclick",
                t: "event"
              });
            };
            var onShow = function() {
              tbr.emit("track", {
                ec: "hotel",
                ea: "suggestsShow",
                el: _this.hostname,
                cd: "hotelshow",
                t: "event"
              });
            };
            var onBodyClick = function() {
              document.body.removeEventListener("click", onBodyClick);
              hideLayer();
            };
            var showLayer = function() {
              suggestObj.show = !0;
              document.body.addEventListener("click", onBodyClick);
              wDom.wGet(layer).setStyle("display", "block");
              updatePosition();
              onShow();
            };
            var hideLayer = function() {
              suggestObj.show = !1;
              wDom.wGet(layer).setStyle("display", "none");
              clearTimeout(hideTimer);
            };
            var onToggle = function() {
              "none" === layer.style.display ? showLayer() : hideLayer();
            };
            var suggestObj = {
              show: !0,
              toggle: onToggle
            };
            wSheet.sync();
            showLayer();
            var hideTimer = null;
            var hideOnMouseLeave = function(layer) {
              layer.addEventListener("mouseenter", function() {
                clearTimeout(hideTimer);
              });
              layer.addEventListener("mouseleave", function() {
                clearTimeout(hideTimer);
                hideTimer = setTimeout(function() {
                  suggestObj.show && hideLayer();
                }, 1500);
              });
            };
            hideOnMouseLeave(layer);
            return suggestObj;
          };
          var getBtn = function() {
            var wSheet = _this.wSheets.getSheet();
            wSheet.add({
              cell: {
                fallbacks: {
                  display: "inline-block"
                }
              }
            });
            wSheet.add({
              moreBtn: {
                extend: "cell",
                verticalAlign: "middle",
                fontSize: "14px",
                fontWeight: "normal !important",
                color: "#000 !important",
                margin: "auto 5px",
                padding: "8px 18px",
                backgroundColor: "rgba(255, 255, 255, 0.30) !important",
                borderRadius: "19px",
                boxShadow: "0 0 1px rgba(0,0,0,0.40)",
                textDecoration: "none !important",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.70) !important",
                  color: "#000 !important"
                }
              },
              "@media only screen and (max-width: 1050px)": {
                moreBtn: {
                  fontSize: "12px",
                  marginLeft: "2px",
                  marginRight: "2px",
                  paddingLeft: "7px",
                  paddingRight: "7px"
                }
              }
            });
            var suggestLayer = null;
            var closeLocked = !1;
            var toggleSuggestLayer = function() {
              suggestLayer ? closeLocked || suggestLayer.toggle() : suggestLayer = createSuggests(moreBtn);
            };
            var moreBtn = utils.create("a", {
              class: wSheet.classes.moreBtn,
              href: "#tbr-suggests",
              append: [ tbr.language.suggests ],
              on: [ "click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                clearTimeout(showTimer);
                toggleSuggestLayer();
              } ]
            });
            var showTimer = null;
            var bindShowOnMouseOver = function(btn) {
              btn.addEventListener("mouseenter", function() {
                clearTimeout(showTimer);
                showTimer = setTimeout(function() {
                  if (!suggestLayer || !suggestLayer.show) {
                    toggleSuggestLayer();
                    clearTimeout(closeLocked);
                    closeLocked = setTimeout(function() {
                      closeLocked = !1;
                    }, 500);
                  }
                }, 250);
              });
              btn.addEventListener("mouseleave", function() {
                clearTimeout(showTimer);
              });
            };
            bindShowOnMouseOver(moreBtn);
            return moreBtn;
          };
          return getBtn();
        };
        Bar.prototype.insertHotelBar = function() {
          var _this = this;
          _this.wDom;
          var wSheet = _this.wSheets.getSheet();
          var barContent = this.barContent;
          var content = document.createDocumentFragment();
          wSheet.add({
            cell: {
              fallbacks: {
                display: "inline-block"
              }
            }
          });
          wSheet.add({
            title: {
              extend: "cell",
              fontSize: "20px",
              fontWeight: "bold",
              margin: "auto 10px",
              lineHeight: "23px",
              verticalAlign: "middle"
            },
            "@media only screen and (max-width: 1150px)": {
              title: {
                fontSize: "18px"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              title: {
                fontSize: "14px",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.title,
            append: [ barContent.barTitle ]
          }));
          wSheet.add({
            hotelInfoCell: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex",
                WebkitFlexGrow: 2
              },
              display: "flex",
              flexGrow: 2,
              verticalAlign: "middle",
              overflow: "hidden"
            }
          });
          var hotelInfoCell = utils.create("div", {
            class: wSheet.classes.hotelInfoCell
          });
          content.appendChild(hotelInfoCell);
          var getStar = function(one) {
            var style = {};
            one && (style.verticalAlign = "text-bottom");
            return utils.create(_this.getStarSvg(null, "16"), {
              style: style
            });
          };
          wSheet.add({
            starsFull: {
              display: "inline-block",
              verticalAlign: "middle",
              margin: "auto 0",
              marginTop: "3px"
            },
            "@media only screen and (max-width: 1050px)": {
              starsFull: {
                display: "none"
              }
            }
          });
          var fullStarsBody = utils.create("span", {
            class: wSheet.classes.starsFull
          });
          for (var i = 0; i < barContent.stars; i++) fullStarsBody.appendChild(getStar());
          var getStarText = function() {
            var starText = "";
            for (var i = 0; i < barContent.stars; i++) starText += String.fromCharCode(9733);
            starText && (starText = " " + starText);
            return starText;
          };
          wSheet.add({
            info: {
              extend: "cell",
              fallbacks: {
                display: "-webkit-flex"
              },
              display: "flex",
              height: "38px",
              border: "1px solid rgba(0,0,0,0.10)",
              margin: "auto 10px",
              borderRadius: "19px",
              padding: "0 15px",
              boxSizing: "border-box",
              lineHeight: "36px",
              overflow: "hidden"
            },
            hotel: {
              textOverflow: "ellipsis",
              margin: "auto",
              color: "#000",
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden"
            },
            "@media only screen and (max-width: 1050px)": {
              info: {
                marginLeft: "5px",
                marginRight: "5px",
                paddingLeft: "5px",
                paddingRight: "5px"
              }
            }
          });
          var hotelInfoWrapper = utils.create("div", {
            class: wSheet.classes.info,
            append: [ utils.create("span", {
              class: wSheet.classes.hotel,
              title: barContent.name + getStarText(),
              text: barContent.name
            }) ]
          });
          hotelInfoCell.appendChild(hotelInfoWrapper);
          hotelInfoWrapper.appendChild(fullStarsBody);
          if (barContent.stars > 0) {
            wSheet.add({
              starsShort: {
                display: "none",
                verticalAlign: "middle",
                margin: "auto 0 auto 5px"
              },
              "@media only screen and (max-width: 1050px)": {
                starsShort: {
                  display: "inline-block"
                }
              }
            });
            var shortStarsBody = utils.create("span", {
              class: wSheet.classes.starsShort,
              append: [ barContent.stars, getStar(!0) ]
            });
            hotelInfoWrapper.appendChild(shortStarsBody);
          }
          wSheet.add({
            dates: {
              extend: "cell",
              verticalAlign: "middle",
              margin: "auto 0 auto 10px",
              fontSize: "14px",
              color: "#978f6c"
            },
            "@media only screen and (max-width: 1050px)": {
              dates: {
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          var bookingDates = utils.create("div", {
            class: wSheet.classes.dates,
            text: barContent.dateText
          });
          hotelInfoWrapper.appendChild(bookingDates);
          wSheet.add({
            price: {
              extend: "cell",
              verticalAlign: "middle",
              fontSize: "20px",
              fontWeight: "bold",
              margin: "auto 10px",
              lineHeight: "23px",
              color: "#4b9f00",
              "& *": {
                fontWeight: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              price: {
                fontSize: "16px",
                marginLeft: "5px",
                marginRight: "5px"
              }
            }
          });
          content.appendChild(utils.create("div", {
            class: wSheet.classes.price,
            append: [ barContent.priceText ]
          }));
          wSheet.add({
            openBtn: {
              extend: "cell",
              verticalAlign: "middle",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#FFF !important",
              margin: "auto 10px",
              padding: "10px 25px",
              backgroundColor: "#4b9f00 !important",
              borderRadius: "19px",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "#66ad26 !important",
                color: "#FFF !important"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              openBtn: {
                fontSize: "14px",
                marginLeft: "5px",
                marginRight: "5px",
                paddingLeft: "10px",
                paddingRight: "10px"
              }
            }
          });
          var moreBtn = utils.create("a", {
            class: wSheet.classes.openBtn,
            href: barContent.url,
            target: "_blank",
            append: [ barContent.open ]
          });
          utils.jsLink(moreBtn, function(e) {
            _this.content.onClick();
          });
          var moreBtnClick = function() {
            window.open(barContent.url);
            _this.content.onClick();
          };
          content.appendChild(moreBtn);
          if (barContent.suggestList.length) {
            var suggestsBtn = _this.getHotelSuggests(barContent.suggestList);
            content.appendChild(suggestsBtn);
          }
          var onAppend = function() {
            tbr.emit("track", {
              cd: "hotelshow",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "hotel",
              ea: "show",
              el: _this.hostname,
              cd: "hotelshow",
              t: "event"
            });
            if (_this.barContent.isSuggest) {
              tbr.emit("track", {
                cd: "hotelNearbyShow",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "hotel",
                ea: "nearbyShow",
                el: _this.hostname,
                cd: "hotelNearbyShow",
                t: "event"
              });
            }
          };
          var onReplace = function() {
            tbr.emit("track", {
              ec: "hotel",
              ea: "update",
              el: _this.hostname,
              t: "event"
            });
            if (_this.barContent.isSuggest) {
              tbr.emit("track", {
                cd: "hotelNearbyUpdate",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "hotel",
                ea: "nearbyUpdate",
                el: _this.hostname,
                cd: "hotelNearbyUpdate",
                t: "event"
              });
            }
          };
          var onShow = function() {};
          var onClick = function() {
            tbr.emit("track", {
              cd: "hotelclick",
              t: "screenview"
            });
            tbr.emit("track", {
              ec: "hotel",
              ea: "click",
              el: _this.hostname,
              cd: "hotelclick",
              t: "event"
            });
            if (_this.barContent.isSuggest) {
              tbr.emit("track", {
                cd: "hotelNearbyClick",
                t: "screenview"
              });
              tbr.emit("track", {
                ec: "hotel",
                ea: "nearbyClick",
                el: _this.hostname,
                cd: "hotelNearbyClick",
                t: "event"
              });
            }
          };
          var onClose = function() {
            tbr.emit("track", {
              ec: "hotel",
              ea: "close",
              el: _this.hostname,
              t: "event"
            });
          };
          return {
            node: content,
            moreBtn: moreBtn,
            moreBtnClick: moreBtnClick,
            onAppend: onAppend,
            onReplace: onReplace,
            onShow: onShow,
            onClick: onClick,
            onClose: onClose
          };
        };
        Bar.prototype.getContent = function() {
          return "hotel" === this.type ? this.insertHotelBar() : "avia" === this.type ? this.insertAviaBar() : "cars" === this.type ? this.insertCarsBar() : void 0;
        };
        Bar.prototype.getStyle = function() {
          var _this = this;
          var wNode = _this.wDom.createElement("style", {}, _this.wSheets.toString());
          _this.wSheets.onChange = function() {
            wNode.setText(_this.wSheets.toString());
          };
          return {
            node: wNode.getNode()
          };
        };
        Bar.prototype.getCloseSvg = function(width, height) {
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          var svgNS = svg.namespaceURI;
          svg.setAttribute("width", width || "80");
          svg.setAttribute("height", height || width || "80");
          svg.setAttribute("viewBox", "0 0 80 80");
          var color = "#000";
          var path = document.createElementNS(svgNS, "path");
          svg.appendChild(path);
          path.setAttribute("fill", color);
          path.setAttribute("d", "M56.971 52.729L44.243 40l12.728-12.728-4.242-4.243L40 35.757 27.272 23.029l-4.243 4.243L35.757 40 23.029 52.729l4.243 4.242L40 44.243l12.729 12.728z");
          return svg;
        };
        Bar.prototype.getOneWaySvg = function() {
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          var svgNS = svg.namespaceURI;
          svg.setAttribute("width", "24px");
          svg.setAttribute("height", "24px");
          svg.setAttribute("viewBox", "4 4 24 24");
          var color = "#000";
          var path = document.createElementNS(svgNS, "path");
          svg.appendChild(path);
          path.setAttribute("fill", color);
          path.setAttribute("d", "M4.538 16.618h21.626l-4.48 4.463a.537.537 0 0 0 0 .761c.21.211.551.211.761 0l5.328-5.327a.543.543 0 0 0 0-.762l-5.328-5.327a.537.537 0 0 0-.761 0 .537.537 0 0 0 0 .761l4.48 4.354H4.538a.538.538 0 1 0 0 1.077z");
          return svg;
        };
        Bar.prototype.getTwoWaySvg = function() {
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          var svgNS = svg.namespaceURI;
          svg.setAttribute("width", "24px");
          svg.setAttribute("height", "24px");
          svg.setAttribute("viewBox", "4 4 24 24");
          var color = "#000";
          var path = document.createElementNS(svgNS, "path");
          svg.appendChild(path);
          path.setAttribute("fill", color);
          path.setAttribute("d", "M27.391 10.382H5.764l4.481-4.463a.538.538 0 0 0-.761-.761l-5.328 5.328a.542.542 0 0 0 0 .761l5.328 5.328a.538.538 0 0 0 .761-.761L5.764 11.46H27.39a.539.539 0 0 0 .001-1.078zM4.538 21.618h21.626l-4.48 4.463a.537.537 0 0 0 0 .761c.21.211.551.211.761 0l5.328-5.327a.543.543 0 0 0 0-.762l-5.328-5.327a.537.537 0 0 0-.761 0 .537.537 0 0 0 0 .761l4.48 4.354H4.538a.538.538 0 1 0 0 1.077z");
          return svg;
        };
        Bar.prototype.getStarSvg = function(color, width, height) {
          var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          var svgNS = svg.namespaceURI;
          svg.setAttribute("width", width || "24");
          svg.setAttribute("height", height || width || "24");
          svg.setAttribute("viewBox", "0 0 24 24");
          color = color || "#000";
          var path = document.createElementNS(svgNS, "path");
          svg.appendChild(path);
          path.setAttribute("fill", color);
          path.setAttribute("d", "M9.362 9.158l-5.268.584c-.19.023-.358.15-.421.343s0 .394.14.521c1.566 1.429 3.919 3.569 3.919 3.569-.002 0-.646 3.113-1.074 5.19a.504.504 0 0 0 .196.506.494.494 0 0 0 .538.027c1.844-1.047 4.606-2.623 4.606-2.623l4.604 2.625c.168.092.379.09.541-.029a.5.5 0 0 0 .195-.505l-1.07-5.191s2.353-2.14 3.918-3.566a.499.499 0 0 0-.279-.865c-2.108-.236-5.27-.586-5.27-.586l-2.183-4.83a.499.499 0 1 0-.909 0l-2.183 4.83z");
          return svg;
        };
        Bar.prototype.getBody = function() {
          var _this = this;
          var wDom = _this.wDom;
          var wSheet = _this.wSheets.getSheet();
          wSheet.add({
            body: {
              extend: utils.styleReset,
              backgroundColor: "#fcefb4",
              color: "#000",
              cursor: "pointer",
              marginTop: "0px",
              display: "table !important",
              opacity: "1 !important",
              position: "fixed",
              top: "0px",
              left: "0px",
              fontWeight: "normal",
              font: "normal normal 14px Arial, sans-serif",
              width: "100%",
              height: barHeight + "px",
              lineHeight: "normal",
              zIndex: "2147483647",
              "&:hover": {
                backgroundColor: "#ffeb91"
              }
            },
            itemLeft: {
              display: "table-cell",
              verticalAlign: "middle"
            },
            itemLeftCloseBtn: {
              marginLeft: "4px",
              marginTop: "10px"
            },
            itemMiddle: {
              display: "table-cell",
              verticalAlign: "middle",
              textAlign: "center"
            },
            content: {
              maxWidth: "1100px",
              display: "inline-block",
              width: "100%",
              textAlign: "left",
              position: "relative"
            },
            contentChild: {
              fallbacks: [ {
                display: "block"
              }, {
                WebkitAlignItems: "center",
                WebkitFlexDirection: "row",
                display: "-webkit-flex"
              } ],
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              whiteSpace: "pre"
            },
            closeBtn: {
              width: "45px",
              opacity: "0.3",
              display: "block",
              height: "45px",
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                opacity: "0.7"
              }
            },
            rightPadding: {
              width: "45px",
              display: "table-cell",
              verticalAlign: "middle"
            },
            "@media only screen and (max-width: 1150px)": {
              content: {
                maxWidth: "960px"
              }
            },
            "@media only screen and (max-width: 1050px)": {
              content: {
                maxWidth: "810px"
              },
              closeBtn: {
                width: "24px"
              },
              rightPadding: {
                width: "24px"
              }
            },
            "@media only screen and (max-width: 850px)": {
              content: {
                maxWidth: "700px"
              }
            }
          });
          var content = null;
          var node = utils.create("div", {
            class: wSheet.classes.body,
            style: {
              position: "fixed",
              top: "0px",
              left: "0px",
              display: "table",
              width: "100%",
              height: "55px",
              lineHeight: "normal",
              opacity: "1",
              zIndex: "2147483647"
            },
            on: [ "click", function(e) {
              e.stopPropagation();
              e.preventDefault();
              _this.content.moreBtnClick();
            } ],
            append: [ utils.create("div", {
              class: wSheet.classes.itemLeft,
              append: utils.create("a", {
                class: wSheet.classes.closeBtn,
                href: "#close",
                title: tbr.language.close,
                on: [ "click", function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  _this.close(!0);
                  _this.content.onClose();
                } ],
                append: utils.create(_this.getCloseSvg("24"), {
                  class: wSheet.classes.itemLeftCloseBtn
                })
              })
            }), utils.create("div", {
              class: wSheet.classes.itemMiddle,
              append: utils.create("div", {
                class: wSheet.classes.content,
                append: content = utils.create("div", {
                  class: wSheet.classes.contentChild
                })
              })
            }), utils.create("div", {
              class: wSheet.classes.rightPadding
            }) ]
          });
          var wNode = wDom.wGet(node);
          wNode.setCheckStyles([ "display", "position", "top", "left", "marginTop", "marginLeft", "marginRight", "marginBottom", "opacity", "zIndex", "transform", "visibility" ]);
          var stopProp = function(e) {
            e.stopPropagation();
          };
          var pointerEvents = [ "pointerdown", "pointerenter", "pointerleave", "pointermove", "pointerout", "pointerover", "pointerup" ];
          var mouseEvents = [ "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseout", "mouseup" ];
          var captures = [ !1, !0 ];
          pointerEvents.concat(mouseEvents).forEach(function(name) {
            captures.forEach(function(capture) {
              "mouseenter" === name && capture || node.addEventListener(name, stopProp, capture);
            });
          });
          return {
            node: node,
            content: content
          };
        };
        Bar.prototype.insertBody = function(node) {
          var parent = document.body;
          var profile = tbr.currentProfile;
          var selector = profile.bodySelector;
          if (selector) {
            "function" == typeof selector && (selector = profile.bodySelector());
            var _parent = document.querySelector(selector);
            _parent ? parent = _parent : tbr.error("Body insert container is not found!");
          }
          parent.appendChild(node);
        };
        Bar.prototype.insertStyle = function(node) {
          var parent = document.body;
          var profile = tbr.currentProfile;
          var selector = profile.styleSelector;
          if (selector) {
            "function" == typeof selector && (selector = profile.styleSelector());
            var _parent = document.querySelector(selector);
            _parent ? parent = _parent : tbr.error("Style insert container is not found!");
          }
          parent.appendChild(node);
        };
        Bar.prototype.destroy = function() {
          this.styleWatcher.destroy();
          this.body.changeWatcher.destroy();
          this.style.changeWatcher.destroy();
          this.body.removeWatcher.destroy();
          this.style.removeWatcher.destroy();
          this.wDom.destroy();
        };
        Bar.prototype.remove = function() {
          if (!this.isRemoved) {
            this.isRemoved = !0;
            this.destroy();
            var parent = this.body.node.parentNode;
            parent && parent.removeChild(this.body.node);
            parent = this.style.node.parentNode;
            parent && parent.removeChild(this.style.node);
          }
        };
        Bar.prototype.insert = function() {
          var body = this.body;
          var style = this.style;
          marginPage(this, !0);
          this.insertBody(body.node);
          this.body.removeWatcher.start();
          this.insertStyle(style.node);
          this.style.removeWatcher.start();
          this.styleWatcher.start();
        };
        Bar.prototype.replace = function(previewBar) {
          previewBar.isRemoved = !0;
          previewBar.isClosed = !0;
          previewBar.destroy();
          var previewBody = previewBar.body;
          var body = this.body;
          var previewStyle = previewBar.style;
          var style = this.style;
          var parent = previewBody.node.parentNode;
          parent ? parent.replaceChild(body.node, previewBody.node) : this.insertBody(body.node);
          body.removeWatcher.start();
          parent = previewStyle.node.parentNode;
          parent ? parent.replaceChild(style.node, previewStyle.node) : this.insertStyle(style.node);
          style.removeWatcher.start();
          this.styleWatcher.start();
        };
        Bar.prototype.close = function(byUser) {
          var _this = this;
          try {
            if (!this.isClosed) {
              this.isClosed = !0;
              this.remove();
              marginPage(this, !1);
              if (byUser) {
                main.watcher.stopObserver();
                return api.sendMessage({
                  action: "tbrCloseBar",
                  hostname: _this.hostname
                });
              }
            }
          } catch (err) {
            tbr.trackError(err);
          }
        };
        return {
          current: null,
          create: function(details) {
            var previewBar = this.current;
            var bar = this.current = new Bar(details);
            var isReplace = !1;
            if (previewBar && !previewBar.isClosed) {
              isReplace = !0;
              bar.replace(previewBar);
            } else bar.insert();
            isReplace ? bar.content.onReplace() : bar.content.onAppend();
            bar.content.onShow();
          },
          aviaBarSaveInHistory: function(pageInfo, aviaResponse) {
            if (tbr.appInfo.history) {
              var origin = "";
              var originName = "";
              var destination = "";
              var destinationName = "";
              aviaResponse.data.some(function(item) {
                origin = item.origin;
                originName = item.originName;
                destination = item.destination;
                destinationName = item.destinationName;
                return !0;
              });
              if (origin && originName && destination && destinationName) {
                var data = {
                  origin: origin,
                  originCity: originName,
                  destination: destination,
                  destinationCity: destinationName,
                  dateStart: pageInfo.dateStart,
                  dateEnd: pageInfo.dateEnd,
                  time: parseInt(Date.now() / 1e3)
                };
                return tbr.emit("history", data);
              }
            }
          }
        };
      };
      module.exports = getBarUi;
    }).call(exports, __webpack_require__(8), __webpack_require__(2), __webpack_require__(25), __webpack_require__(1));
  }, function(module, exports, __webpack_require__) {
    (function(utils) {
      var ChangeWatcher = function(node, onChange) {
        var Observer = utils.mutationWatcher.getMutationObserver();
        var observer = new Observer(function(mutations) {
          for (var mutation, i = 0; mutation = mutations[i]; i++) "attributes" === mutation.type ? onChange(mutation) : "characterData" === mutation.type ? onChange(mutation) : "childList" === mutation.type && onChange(mutation);
        });
        var config = {
          childList: !0,
          subtree: !0,
          attributes: !0,
          attributeOldValue: !0,
          characterData: !0,
          characterDataOldValue: !0
        };
        this.disconnect = function() {
          observer.disconnect();
        };
        this.connect = function() {
          observer.observe(node, config);
        };
        this.start = function() {
          this.connect();
        };
        this.destroy = function() {
          this.disconnect();
        };
      };
      module.exports = ChangeWatcher;
    }).call(exports, __webpack_require__(2));
  }, function(module, exports, __webpack_require__) {
    (function(utils, tbr) {
      var RemoveWatcher = function(node, onRemove) {
        var slice = [].slice;
        var Observer = utils.mutationWatcher.getMutationObserver();
        var observer = new Observer(function(mutations) {
          var pos;
          for (var mutation, i = 0; mutation = mutations[i]; i++) if (mutation.removedNodes.length) {
            pos = slice.call(mutation.removedNodes).indexOf(node);
            if (pos !== -1) {
              onRemove(mutation);
              break;
            }
          }
        });
        var changeConfig = {
          childList: !0
        };
        this.disconnect = function() {
          observer.disconnect();
        };
        this.connect = function() {
          var parent = node.parentNode;
          if (!parent) return tbr.error("RemoveWatcher parent is null", node);
          observer.observe(node.parentNode, changeConfig);
        };
        this.start = function() {
          this.connect();
        };
        this.destroy = function() {
          this.disconnect();
        };
      };
      module.exports = RemoveWatcher;
    }).call(exports, __webpack_require__(2), __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr) {
      var StyleWatcher = function(bar, onChange) {
        this.onChange = onChange;
        this.destroyed = !1;
        this.bar = bar;
        this.timer = null;
      };
      StyleWatcher.prototype.start = function() {
        var _this = this;
        var onTimer = function() {
          if (!_this.destroyed) {
            _this.check();
            initTimer();
          }
        };
        var initTimer = function() {
          _this.stop();
          _this.timer = setTimeout(onTimer, 5e3);
        };
        onTimer();
        initTimer();
      };
      StyleWatcher.prototype.stop = function() {
        clearTimeout(this.timer);
      };
      var normalizeCssValue = function(value) {
        var m = /(.+)!important/.exec(value);
        m && (value = m[1].trim());
        return value;
      };
      var toStyleKey = function(key) {
        "float" === key && (key = "cssFloat");
        return key.replace(/-([a-z])/g, function(text, letter) {
          return letter.toUpperCase();
        });
      };
      var getStyle = function(wSheets, wNode) {
        var key, value, style = null;
        if (!wNode.cssStyle) {
          var node = wNode.refNode;
          var className = node.classList[0];
          node && className && (style = wSheets.getStyleBySelector("." + className));
          wNode.cssStyle = style || {};
        }
        var styles = [];
        styles.unshift(wNode.customStyle);
        styles.unshift(wNode.inlineStyle);
        styles.unshift(wNode.cssStyle);
        styles.unshift(wNode.nativeStyle);
        var allStyles = {};
        for (;style = styles.shift(); ) for (key in style) {
          value = style[key];
          key = toStyleKey(key);
          Array.isArray(value) || (value = [ value ]);
          value = value.map(normalizeCssValue);
          allStyles[key] = value;
        }
        return allStyles;
      };
      StyleWatcher.prototype.check = function() {
        var _this = this;
        var bar = this.bar;
        var wDom = this.bar.wDom;
        var wSheets = this.bar.wSheets;
        var testNode = function(node) {
          if (node.parentNode) {
            var wNode = wDom.get(node);
            if (wNode) {
              var checkStyle = wNode.checkStyles;
              if (checkStyle.length) {
                var refStyle = getStyle(wSheets, wNode);
                var style = getComputedStyle(node);
                checkStyle.forEach(function(prop) {
                  var value = style[prop];
                  var refValue = refStyle[prop];
                  void 0 !== refValue && void 0 !== value && refValue.indexOf(value) === -1 && _this.onChange(wNode, prop, style[prop], refValue);
                });
              }
            } else tbr.error("wNode is not found", node);
          }
        };
        testNode(bar.body.node);
      };
      StyleWatcher.prototype.destroy = function() {
        this.destroyed = !0;
        this.stop();
      };
      module.exports = StyleWatcher;
    }).call(exports, __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr) {
      var slice = [].slice;
      var FIX_LIMIT = 50;
      var buildNode = function(tagName, props) {
        var func, value;
        var el = document.createElement(tagName);
        for (var prop in props) {
          value = props[prop];
          func = buildHooks[prop];
          func ? func(el, value) : el[prop] = value;
        }
        return el;
      };
      var buildHooks = {
        class: function(el, classList) {
          classList.forEach(function(className) {
            el.classList.add(className);
          });
        },
        style: function(el, styleObj) {
          for (var prop in styleObj) {
            var value = styleObj[prop];
            "float" === prop && (prop = "cssFloat");
            el.style[prop] = value;
          }
        }
      };
      var WNode = function(wDom, node) {
        var _this = this;
        _this.wDom = wDom;
        _this.node = node;
        _this.refNode = node.cloneNode(!1);
        _this.events = [];
        _this.customStyle = {};
        _this.inlineStyle = {};
        _this.cssStyle = null;
        _this.nativeStyle = {};
        _this.checkStyles = [];
        _this.fixLimits = {};
        var wChildNode;
        for (var childNode, i = 0; childNode = node.childNodes[i]; i++) {
          wChildNode = _this.wDom.wGet(childNode);
          _this.refNode.appendChild(wChildNode.refNode);
        }
      };
      WNode.prototype.setCheckStyles = function(props) {
        var _this = this;
        _this.checkStyles = props;
      };
      WNode.prototype.addCheckStyles = function(prop) {
        var _this = this;
        var pos = _this.checkStyles.indexOf(prop);
        pos === -1 && _this.checkStyles.push(prop);
      };
      WNode.prototype.removeCheckStyles = function(prop) {
        var _this = this;
        var pos = _this.checkStyles.indexOf(prop);
        pos !== -1 && _this.checkStyles.splice(pos, 1);
      };
      WNode.prototype.appendChild = function(childNode) {
        var _this = this;
        var wChildNode = _this.wDom.wGet(childNode);
        _this.refNode.appendChild(wChildNode.refNode);
        _this.node.appendChild(wChildNode.node);
      };
      WNode.prototype.removeChild = function(childNode) {
        var _this = this;
        var wChildNode = _this.wDom.get(childNode);
        if (!wChildNode) throw new Error("wNode is not found!");
        _this.refNode.removeChild(wChildNode.refNode);
        _this.node.removeChild(wChildNode.node);
      };
      WNode.prototype.setText = function(text) {
        var _this = this;
        _this.refNode.textContent = "";
        _this.node.textContent = "";
        _this.appendChild(document.createTextNode(text));
      };
      WNode.prototype.addEventListener = function(type, listener, useCapture) {
        var _this = this;
        _this.node.addEventListener(type, listener, useCapture);
        useCapture = !!useCapture;
        _this.events.push({
          type: type,
          listener: listener,
          useCapture: useCapture
        });
      };
      WNode.prototype.removeEventListener = function(type, listener, useCapture) {
        var _this = this;
        _this.node.removeEventListener(type, listener, useCapture);
        var index = -1;
        useCapture = !!useCapture;
        _this.events.some(function(item, i) {
          if (item.type === type && item.useCapture === useCapture && item.listener === listener) {
            index = i;
            return !0;
          }
        });
        index !== -1 && _this.events.splice(index, 1);
      };
      WNode.prototype.setStyle = function(prop, value) {
        var _this = this;
        _this.refNode.style[prop] = value;
        _this.node.style[prop] = value;
        "" === value ? delete _this.inlineStyle[prop] : _this.inlineStyle[prop] = value;
      };
      var toCssProp = function(key) {
        "cssFloat" === key && (key = "float");
        return key.replace(/([A-Z])/g, function(text, letter) {
          return "-" + letter.toLowerCase();
        });
      };
      WNode.prototype.setStyleProperty = function(prop, value, priority) {
        var _this = this;
        if (_this.refNode.style.setProperty) {
          var cssProp = toCssProp(prop);
          _this.refNode.style.setProperty(cssProp, value, priority);
          _this.node.style.setProperty(cssProp, value, priority);
          "" === value ? delete _this.inlineStyle[prop] : _this.inlineStyle[prop] = value;
        } else _this.setStyle(prop, value);
      };
      WNode.prototype.addClass = function(className) {
        var _this = this;
        _this.refNode.classList.add(className);
        _this.node.classList.add(className);
      };
      WNode.prototype.removeClass = function(className) {
        var _this = this;
        _this.refNode.classList.remove(className);
        _this.node.classList.remove(className);
      };
      WNode.prototype.checkChildList = function() {
        var _this = this;
        var fixLimits = _this.fixLimits;
        var result = !0;
        void 0 === fixLimits.checkChildList && (fixLimits.checkChildList = FIX_LIMIT);
        var fixChildNodes = !1;
        var i, childNode, refChildNode, nextNode;
        for (i = 0; refChildNode = _this.refNode.childNodes[i]; i++) {
          var wChildNode = _this.wDom.getByRef(refChildNode);
          childNode = wChildNode.node;
          nextNode = _this.node.childNodes[i];
          if (nextNode !== childNode) if (fixLimits.checkChildList > 0) {
            nextNode ? _this.node.insertBefore(childNode, nextNode) : _this.node.appendChild(childNode);
            fixChildNodes = !0;
            tbr.log("Fix checkChildList insert node", childNode);
          } else {
            result = !1;
            tbr.error("Fix checkChildList insert limited");
          }
        }
        var childLen = _this.refNode.childNodes.length;
        var rmNodes = slice.call(_this.node.childNodes, childLen);
        if (rmNodes.length) if (fixLimits.checkChildList > 0) {
          for (i = 0, childNode; childNode = rmNodes[i]; i++) if (childNode.parentNode) {
            childNode.parentNode.removeChild(childNode);
            fixChildNodes = !0;
            tbr.log("Fix checkChildList remove node", childNode);
          }
        } else {
          result = !1;
          tbr.error("Fix checkChildList remove limited");
        }
        fixChildNodes && fixLimits.checkChildList--;
        return result;
      };
      WNode.prototype.checkAttributes = function(name) {
        var _this = this;
        var fixLimits = _this.fixLimits;
        var key = "checkAttributes_" + name;
        void 0 === fixLimits[key] && (fixLimits[key] = FIX_LIMIT);
        var result = !0;
        var value = _this.node.getAttribute(name);
        var refValue = _this.refNode.getAttribute(name);
        if (refValue !== value) if (fixLimits[key]-- > 0) {
          null === refValue ? _this.node.removeAttribute(name) : _this.node.setAttribute(name, refValue);
          tbr.log("Fix attributes", name, value, ">", refValue);
        } else {
          result = !1;
          tbr.error("Fix attributes limited");
        }
        return result;
      };
      WNode.prototype.checkCharacterData = function() {
        var _this = this;
        var fixLimits = _this.fixLimits;
        var key = "checkCharacterData";
        void 0 === fixLimits[key] && (fixLimits[key] = FIX_LIMIT);
        var result = !0;
        var value = _this.node.textContent;
        var refValue = _this.refNode.textContent;
        if (value !== refValue) if (fixLimits[key]-- > 0) {
          _this.node.textContent = _this.refNode.textContent;
          tbr.log("Fix characterData", value, ">", refValue);
        } else {
          result = !1;
          tbr.error("Fix characterData limited");
        }
        return result;
      };
      WNode.prototype.fixStyleProperty = function(prop, value, refValues) {
        var _this = this;
        var fixLimits = _this.fixLimits;
        var key = "fixStyleProperty" + prop;
        var result = !0;
        if (fixLimits[key]) {
          result = !1;
          tbr.error("Fix styleProperty limited");
        } else {
          fixLimits[key] = !0;
          refValues.forEach(function(refValue) {
            _this.setStyleProperty(prop, refValue, "important");
            tbr.log("Fix styleProperty", prop, value, ">", refValues);
          });
        }
        return result;
      };
      WNode.prototype.getNode = function() {
        var _this = this;
        return _this.node;
      };
      WNode.prototype.buildNode = function() {
        var _this = this;
        var node = _this.refNode.cloneNode(!1);
        var i, wChildNode, refChildNode;
        for (i = 0; refChildNode = _this.refNode.childNodes[i]; i++) {
          wChildNode = _this.wDom.getByRef(refChildNode);
          node.appendChild(wChildNode.buildNode());
        }
        _this.events.forEach(function(item) {
          node.addEventListener(item.type, item.listener, item.useCapture);
        });
        return node;
      };
      var WDom = function() {
        var _this = this;
        _this.wElements = [];
        _this.refElements = [];
        _this.elements = [];
      };
      WDom.prototype.createElement = function(tagName, props, children) {
        var _this = this;
        var node = buildNode(tagName, props);
        var childNodes = slice.call(arguments, 2);
        for (var childNode, i = 0; childNode = childNodes[i]; i++) {
          "object" != typeof childNode && (childNode = document.createTextNode(childNode));
          node.appendChild(childNode);
        }
        return _this.wGet(node);
      };
      WDom.prototype.get = function(node) {
        var _this = this;
        var wElement = null;
        var pos = _this.elements.indexOf(node);
        pos !== -1 && (wElement = _this.wElements[pos]);
        return wElement;
      };
      WDom.prototype.getByRef = function(node) {
        var _this = this;
        var wElement = null;
        var pos = _this.refElements.indexOf(node);
        pos !== -1 && (wElement = _this.wElements[pos]);
        return wElement;
      };
      WDom.prototype.wrap = function(node) {
        var _this = this;
        return new WNode(_this, node);
      };
      WDom.prototype.wGet = function(node) {
        var _this = this;
        var wNode = _this.get(node);
        if (null === wNode) {
          wNode = _this.wrap(node);
          _this.addWNode(wNode);
        }
        return wNode;
      };
      WDom.prototype.addWNode = function(wNode) {
        var _this = this;
        _this.elements.push(wNode.node);
        _this.refElements.push(wNode.refNode);
        _this.wElements.push(wNode);
      };
      WDom.prototype.removeWNode = function(wNode) {
        var _this = this;
        var pos = _this.wElements.indexOf(wNode);
        if (pos !== -1) {
          _this.elements.splice(pos, 1);
          _this.refElements.splice(pos, 1);
          _this.wElements.splice(pos, 1);
        }
      };
      WDom.prototype.destroy = function() {
        var _this = this;
        _this.elements.splice(0);
        _this.refElements.splice(0);
        _this.wElements.splice(0);
      };
      module.exports = WDom;
    }).call(exports, __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr) {
      var debugLog = function() {
        tbr.log.apply(null, arguments);
      };
      var _extends = function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
        }
        return target;
      };
      var rndDDbl = {};
      var getRnd = function() {
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var limit = 10;
        var rnd = "t";
        do {
          limit--;
          for (var i = 0; i < 21; i++) rnd += possible.charAt(Math.floor(Math.random() * possible.length));
        } while (rndDDbl[rnd] && limit > 0);
        rndDDbl[rnd] = 1;
        return rnd;
      };
      var jssMediaPlugin = function() {
        var ConditionalRule = function(selector, styles, options) {
          this.type = "conditional";
          this.selector = selector;
          this.options = options;
          this.rules = new RulesContainer(_extends({}, options, {
            parent: this
          }));
          for (var name in styles) this.rules.add(name, styles[name]);
          this.rules.process();
        };
        ConditionalRule.prototype.getRule = function(name) {
          return this.rules.get(name);
        };
        ConditionalRule.prototype.indexOf = function(rule) {
          return this.rules.indexOf(rule);
        };
        ConditionalRule.prototype.addRule = function(name, style, options) {
          var rule = this.rules.add(name, style, options);
          this.options.jss.plugins.onProcessRule(rule);
          return rule;
        };
        ConditionalRule.prototype.toString = function() {
          var inner = this.rules.toString();
          return inner ? this.selector + "{" + inner + "}" : "";
        };
        return {
          onCreateRule: function(name, decl, options) {
            return /^@media/.test(name) ? new ConditionalRule(name, decl, options) : null;
          }
        };
      }();
      var jssExtendPlugin = function() {
        var isObject = function(obj) {
          return obj && "object" == typeof obj && !Array.isArray(obj);
        };
        var extend = function(style, rule, sheet) {
          var newStyle = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
          if ("string" == typeof style.extend) {
            if (sheet) {
              var refRule = sheet.getRule(style.extend);
              if (refRule) if (refRule === rule) debugLog("[JSS] A rule tries to extend itself \r\n", rule); else if (refRule.options.parent) {
                var originalStyle = refRule.options.parent.rules.raw[style.extend];
                extend(originalStyle, rule, sheet, newStyle);
              }
            }
          } else if (Array.isArray(style.extend)) for (var index = 0; index < style.extend.length; index++) extend(style.extend[index], rule, sheet, newStyle); else for (var prop in style.extend) if ("extend" === prop) extend(style.extend.extend, rule, sheet, newStyle); else if (isObject(style.extend[prop])) {
            newStyle[prop] || (newStyle[prop] = {});
            extend(style.extend[prop], rule, sheet, newStyle[prop]);
          } else {
            newStyle.hasOwnProperty(prop) && delete newStyle[prop];
            newStyle[prop] = style.extend[prop];
          }
          for (var _prop in style) if ("extend" !== _prop) if ("fallbacks" === _prop && newStyle[_prop]) {
            Array.isArray(newStyle[_prop]) || (newStyle[_prop] = [ newStyle[_prop] ]);
            var origStyle = style[_prop];
            Array.isArray(origStyle) || (origStyle = [ origStyle ]);
            newStyle[_prop] = newStyle[_prop].concat(JSON.parse(JSON.stringify(origStyle)));
          } else if (isObject(newStyle[_prop]) && isObject(style[_prop])) extend(style[_prop], rule, sheet, newStyle[_prop]); else if (isObject(style[_prop])) newStyle[_prop] = extend(style[_prop], rule, sheet); else {
            newStyle.hasOwnProperty(_prop) && delete newStyle[_prop];
            newStyle[_prop] = style[_prop];
          }
          return newStyle;
        };
        return {
          onProcessStyle: function(style, rule, sheet) {
            return style.extend ? extend(style, rule, sheet) : style;
          }
        };
      }();
      var jssNestedPlugin = function() {
        function getReplaceRef(container) {
          return function(match, name) {
            var rule = container.getRule(name);
            if (rule) return rule.selector;
            debugLog("[JSS] Could not find the referenced rule " + name + ". \r\n", rule);
            return name;
          };
        }
        function replaceParentRefs(nestedProp, parentProp) {
          var parentSelectors = parentProp.split(separatorRegExp);
          var nestedSelectors = nestedProp.split(separatorRegExp);
          var result = "";
          for (var i = 0; i < parentSelectors.length; i++) {
            var parent = parentSelectors[i];
            for (var j = 0; j < nestedSelectors.length; j++) {
              var nested = nestedSelectors[j];
              result && (result += ", ");
              result += hasAnd(nested) ? nested.replace(parentRegExp, parent) : parent + " " + nested;
            }
          }
          return result;
        }
        function getOptions(rule, container, options) {
          if (options) return _extends({}, options, {
            index: options.index + 1
          });
          var nestingLevel = rule.options.nestingLevel;
          nestingLevel = void 0 === nestingLevel ? 1 : nestingLevel + 1;
          return _extends({}, rule.options, {
            nestingLevel: nestingLevel,
            index: container.indexOf(rule) + 1
          });
        }
        var separatorRegExp = /\s*,\s*/g;
        var parentRegExp = /&/g;
        var refRegExp = /\$([\w-]+)/g;
        var hasAnd = function(str) {
          return str.indexOf("&") !== -1;
        };
        return {
          onProcessStyle: function(style, rule) {
            if ("regular" !== rule.type) return style;
            var container = rule.options.parent;
            var options = void 0;
            var replaceRef = void 0;
            for (var prop in style) {
              var isNested = hasAnd(prop);
              var isNestedConditional = "@" === prop[0];
              if (isNested || isNestedConditional) {
                options = getOptions(rule, container, options);
                if (isNested) {
                  var selector = replaceParentRefs(prop, rule.selector);
                  replaceRef || (replaceRef = getReplaceRef(container));
                  selector = selector.replace(refRegExp, replaceRef);
                  container.addRule(selector, style[prop], _extends({}, options, {
                    selector: selector
                  }));
                } else if (isNestedConditional) {
                  var styleObj = {};
                  styleObj[rule.name] = style[prop];
                  container.addRule(prop, styleObj, options);
                }
                delete style[prop];
              }
            }
            return style;
          }
        };
      }();
      var jssCamelCasePlugin = function() {
        var regExp = /([A-Z])/g;
        var replace = function(str) {
          return "-" + str.toLowerCase();
        };
        var convertCase = function(style) {
          var converted = {};
          for (var prop in style) {
            var value = style[prop];
            "cssFloat" === prop && (prop = "float");
            prop = prop.replace(regExp, replace);
            converted[prop] = value;
          }
          style.fallbacks && (Array.isArray(style.fallbacks) ? converted.fallbacks = style.fallbacks.map(convertCase) : converted.fallbacks = convertCase(style.fallbacks));
          return converted;
        };
        return {
          onProcessStyle: function(style) {
            if (Array.isArray(style)) {
              for (var index = 0; index < style.length; index++) style[index] = convertCase(style[index]);
              return style;
            }
            return convertCase(style);
          }
        };
      }();
      var RegularRule = function(name, style, options) {
        this.type = "regular";
        var generateClassName = options.generateClassName;
        this.name = name;
        this.className = "";
        this.options = options;
        this.style = style;
        options.className ? this.className = options.className : generateClassName && (this.className = generateClassName(this, options.sheet));
        this.selector = options.selector || "." + this.className;
      };
      var toCssValue = function(value) {
        return Array.isArray(value) ? Array.isArray(value[0]) ? toCssValue(value.map(function(value) {
          return value.join(" ");
        })) : value.join(", ") : value;
      };
      var toCss = function(selector, style) {
        var fallbacks = style.fallbacks;
        var result = "";
        if (fallbacks) if (Array.isArray(fallbacks)) for (var index = 0; index < fallbacks.length; index++) {
          var fallback = fallbacks[index];
          for (var prop in fallback) {
            var value = fallback[prop];
            null != value && (result += prop + ": " + toCssValue(value) + ";");
          }
        } else for (var _prop in fallbacks) {
          var _value = fallbacks[_prop];
          null != _value && (result += _prop + ": " + toCssValue(_value) + ";");
        }
        for (var _prop2 in style) {
          var _value2 = style[_prop2];
          "function" == typeof _value2 && (_value2 = style["$" + _prop2]);
          null != _value2 && "fallbacks" !== _prop2 && (result += _prop2 + ": " + toCssValue(_value2) + ";");
        }
        if (!result) return result;
        result = selector + " {" + result + "}";
        return result;
      };
      RegularRule.prototype.toString = function() {
        return toCss(this.selector, this.style);
      };
      var RulesContainer = function(options) {
        this.map = {};
        this.raw = {};
        this.index = [];
        this.options = options;
        this.classes = options.classes;
      };
      var cloneStyle = function(style) {
        if (null == style) return style;
        var typeOfStyle = typeof style;
        if ("string" === typeOfStyle || "number" === typeOfStyle) return style;
        if (Array.isArray(style)) return style.map(cloneStyle);
        var newStyle = {};
        for (var name in style) {
          var value = style[name];
          "object" == typeof value ? newStyle[name] = cloneStyle(value) : newStyle[name] = value;
        }
        return newStyle;
      };
      var createRule = function(name, decl, options) {
        var jss = options.jss;
        var declCopy = cloneStyle(decl);
        if (jss) {
          var rule = jss.plugins.onCreateRule(name, declCopy, options);
          if (rule) return rule;
        }
        name && "@" === name[0] && debugLog("[JSS] Unknown at-rule", name);
        return new RegularRule(name, declCopy, options);
      };
      RulesContainer.prototype.add = function(name, style, options) {
        var _options = this.options, parent = _options.parent, sheet = _options.sheet, jss = _options.jss, Renderer = _options.Renderer, generateClassName = _options.generateClassName;
        options = _extends({
          classes: this.classes,
          parent: parent,
          sheet: sheet,
          jss: jss,
          Renderer: Renderer,
          generateClassName: generateClassName
        }, options);
        options.className || (options.className = this.classes[name]);
        this.raw[name] = style;
        var rule = createRule(name, style, options);
        this.register(rule);
        var index = void 0 === options.index ? this.index.length : options.index;
        this.index.splice(index, 0, rule);
        return rule;
      };
      RulesContainer.prototype.get = function(name) {
        return this.map[name];
      };
      RulesContainer.prototype.indexOf = function(rule) {
        return this.index.indexOf(rule);
      };
      RulesContainer.prototype.process = function() {
        var plugins = this.options.jss.plugins;
        this.index.slice(0).forEach(plugins.onProcessRule, plugins);
      };
      RulesContainer.prototype.register = function(rule) {
        rule.name && (this.map[rule.name] = rule);
        rule.className && rule.name && (this.classes[rule.name] = rule.className);
        rule.selector && (this.map[rule.selector] = rule);
      };
      RulesContainer.prototype.toString = function() {
        var str = "";
        for (var index = 0; index < this.index.length; index++) {
          var rule = this.index[index];
          var css = rule.toString();
          css && (str += css);
        }
        return str;
      };
      var StyleSheet = function(options) {
        var index = "number" == typeof options.index ? options.index : 0;
        this.classes = {};
        this.options = _extends({
          sheet: this,
          parent: this,
          classes: this.classes,
          index: index
        }, options);
        this.rules = new RulesContainer(this.options);
      };
      StyleSheet.prototype.addRule = function(name, style, options) {
        var rule = this.rules.add(name, style, options);
        this.options.jss.plugins.onProcessRule(rule);
        return rule;
      };
      StyleSheet.prototype.add = StyleSheet.prototype.addRules = function(styles, options) {
        var added = [];
        for (var name in styles) added.push(this.addRule(name, styles[name], options));
        return added;
      };
      StyleSheet.prototype.getRule = function(name) {
        return this.rules.get(name);
      };
      StyleSheet.prototype.indexOf = function(rule) {
        return this.rules.indexOf(rule);
      };
      StyleSheet.prototype.toString = function() {
        return this.rules.toString();
      };
      StyleSheet.prototype.sync = function() {
        this.options.jss.onChange();
      };
      var PluginsRegistry = function() {
        this.hooks = {
          onCreateRule: [],
          onProcessRule: [],
          onProcessStyle: [],
          onProcessSheet: [],
          onChangeValue: []
        };
      };
      PluginsRegistry.prototype.onCreateRule = function(name, decl, options) {
        for (var i = 0; i < this.hooks.onCreateRule.length; i++) {
          var rule = this.hooks.onCreateRule[i](name, decl, options);
          if (rule) return rule;
        }
        return null;
      };
      PluginsRegistry.prototype.onProcessRule = function(rule) {
        if (!rule.isProcessed) {
          var sheet = rule.options.sheet;
          for (var i = 0; i < this.hooks.onProcessRule.length; i++) this.hooks.onProcessRule[i](rule, sheet);
          rule.style && this.onProcessStyle(rule.style, rule, sheet);
          rule.isProcessed = !0;
        }
      };
      PluginsRegistry.prototype.onProcessStyle = function(style, rule, sheet) {
        for (var i = 0; i < this.hooks.onProcessStyle.length; i++) rule.style = style = this.hooks.onProcessStyle[i](style, rule, sheet);
      };
      PluginsRegistry.prototype.onProcessSheet = function(sheet) {
        for (var i = 0; i < this.hooks.onProcessSheet.length; i++) this.hooks.onProcessSheet[i](sheet);
      };
      PluginsRegistry.prototype.onChangeValue = function(value, prop, rule) {
        var processedValue = value;
        for (var i = 0; i < this.hooks.onChangeValue.length; i++) processedValue = this.hooks.onChangeValue[i](processedValue, prop, rule);
        return processedValue;
      };
      PluginsRegistry.prototype.use = function(plugin) {
        for (var name in plugin) this.hooks[name] ? this.hooks[name].push(plugin[name]) : debugLog("[JSS] Unknown hook", name);
      };
      var WSheets = function() {
        this.sheets = [];
        this.plugins = new PluginsRegistry();
        this.plugins.use(jssMediaPlugin);
        this.plugins.use(jssExtendPlugin);
        this.plugins.use(jssNestedPlugin);
        this.plugins.use(jssCamelCasePlugin);
      };
      WSheets.prototype.getSheet = function() {
        var _this = this;
        var sheet = new StyleSheet({
          jss: _this,
          generateClassName: getRnd
        });
        _this.sheets.push(sheet);
        return sheet;
      };
      WSheets.prototype.toString = function() {
        var _this = this;
        var result = [];
        _this.sheets.forEach(function(sheet) {
          result.push(sheet.toString());
        });
        return result.join("");
      };
      var fallbacksToKeyValueArray = function(style) {
        var cssStyle = {};
        var fallbacks = style.fallbacks;
        if (fallbacks) {
          Array.isArray(fallbacks) || (fallbacks = [ fallbacks ]);
          fallbacks.forEach(function(style) {
            for (var key in style) {
              cssStyle[key] || (cssStyle[key] = []);
              cssStyle[key].push(style[key]);
            }
          });
        }
        var key, value;
        for (key in style) if ("fallbacks" !== key) {
          value = style[key];
          if (cssStyle[key]) {
            Array.isArray(cssStyle[key]) || (cssStyle[key] = [ cssStyle[key] ]);
            cssStyle[key].push(value);
          } else cssStyle[key] = value;
        }
        return cssStyle;
      };
      WSheets.prototype.getStyleBySelector = function(selector) {
        var _this = this;
        var style = {};
        _this.sheets.some(function(sheet) {
          var rule = sheet.rules.map[selector];
          if (rule) {
            style = rule.style;
            return !0;
          }
        });
        return fallbacksToKeyValueArray(style);
      };
      WSheets.prototype.onChange = function() {};
      module.exports = WSheets;
    }).call(exports, __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr) {
      module.exports = function(utils) {
        var cultureInfo = {
          ru: {
            weekdaysShort: "Вс_Пн_Вт_Ср_Чт_Пт_Сб".split("_"),
            months: "января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),
            monthsCal: "январе_феврале_марте_апреле_мае_июне_июле_августе_сентябре_октябре_ноябре_декабре".split("_"),
            monthsShort: "янв._февр._мар._апр._мая_июн._июл._авг._сент._окт._нояб._дек.".split("_"),
            dateFormat: "d MMMM, E",
            dateFormatNoWeekdays: "d MMMM",
            timeFormat: "H:mm",
            dateTimeFormat: "d MMM, H:mm",
            dateIntervalFormat: "d — d MMMM",
            dateMonthIntervalFormat: "d MMM — d MMM"
          },
          en: {
            weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
            months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
            monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
            dateFormat: "MMMM d, E",
            dateFormatNoWeekdays: "MMMM d",
            timeFormat: "h:mm a",
            dateTimeFormat: "MMM d, h:mm a",
            dateIntervalFormat: "MMMM d — d",
            dateMonthIntervalFormat: "d MMM — d MMM"
          },
          de: {
            weekdaysShort: "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
            months: "Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
            monthsShort: "Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sep._Okt._Nov._Dez.".split("_"),
            dateFormat: "E, d. MMMM",
            dateFormatNoWeekdays: "d. MMMM",
            timeFormat: "H:mm",
            dateTimeFormat: "d. MMM, H:mm",
            dateIntervalFormat: "d. — d. MMMM",
            dateMonthIntervalFormat: "d. MMM — d. MMM"
          }
        };
        var ccyFormats = {
          USD: {
            symbol: "$",
            standard: "¤#,##0.00",
            details: {
              symbolRight: !1,
              symbolSep: "",
              toFixed: 2,
              round: !1,
              group: ",",
              decimal: "."
            }
          },
          EUR: {
            symbol: "€",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !1,
              group: ".",
              decimal: ","
            }
          },
          RUB: {
            symbol: "₽",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !0,
              group: " ",
              decimal: ","
            },
            getNode: function() {
              var link = document.querySelector("link.sf-price-font");
              if (!link) {
                link = utils.create("link", {
                  class: "sf-price-font",
                  href: "https://fonts.googleapis.com/css?family=PT+Sans:bold",
                  rel: "stylesheet",
                  type: "text/css"
                });
                document.head.appendChild(link);
              }
              return utils.create("span", {
                text: this.symbol,
                style: {
                  fontFamily: '"PT Sans", Arial, serif'
                }
              });
            }
          },
          BYR: {
            symbol: "р.",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !0,
              group: " ",
              decimal: ","
            }
          },
          BYN: {
            symbol: "р.",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !0,
              group: " ",
              decimal: ","
            }
          },
          KZT: {
            symbol: "T",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !0,
              group: " ",
              decimal: ","
            }
          },
          UAH: {
            symbol: "₴",
            standard: "#,##0.00 ¤",
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !0,
              group: " ",
              decimal: ","
            }
          },
          THB: {
            symbol: "฿",
            details: {
              symbolRight: !1,
              symbolSep: "",
              toFixed: 2,
              round: !0,
              group: ",",
              decimal: "."
            }
          }
        };
        var dateTemplateParse = function(template, culture, time, time2) {
          var h;
          var dbl = {};
          template = template.replace(/([a-zA-Z]+)/g, function(text, value) {
            var timeItem = null;
            if (time2) if (dbl[value]) timeItem = time2; else {
              dbl[value] = !0;
              timeItem = time;
            } else timeItem = time;
            switch (value) {
              case "d":
                return timeItem.getUTCDate();

              case "MMMM":
                return culture.months[timeItem.getUTCMonth()];

              case "MMM":
                return culture.monthsShort[timeItem.getUTCMonth()];

              case "h":
                h = timeItem.getUTCHours();
                h %= 12;
                h || (h = 12);
                return h;

              case "H":
                return timeItem.getUTCHours();

              case "mm":
                var m = timeItem.getUTCMinutes();
                m < 10 && (m = "0" + m);
                return m;

              case "a":
                var a = "AM";
                h = timeItem.getUTCHours();
                h >= 12 && (a = "PM");
                return a;

              case "E":
                return culture.weekdaysShort[timeItem.getUTCDay()];
            }
          });
          return template;
        };
        var getPrice = function(ccy, value) {
          var cultureCcy = ccyFormats[ccy];
          cultureCcy || (cultureCcy = {
            symbol: ccy,
            details: {
              symbolRight: !0,
              symbolSep: " ",
              toFixed: 2,
              round: !1,
              group: ",",
              decimal: "."
            }
          });
          var details = cultureCcy.details;
          value = details.round ? Math.round(value) : value.toFixed(details.toFixed);
          var splitValue = value.toString().split(".");
          var b = splitValue[1];
          var fixedValue = "";
          for (var i = 0; i < details.toFixed; i++) fixedValue += "0";
          b === fixedValue && (b = "");
          var a = splitValue[0];
          a = a.split("").reverse().join("");
          a = a.replace(/(\d{3})/g, "$1,");
          a = a.split("").reverse().join("");
          "," === a[0] && (a = a.substr(1));
          a = a.split(",");
          a = a.join(details.group);
          splitValue = [ a ];
          b && splitValue.push(b);
          var strValue = splitValue.join(details.decimal);
          var arr = [ strValue ];
          if (details.symbolRight) {
            details.symbolSep && arr.push(details.symbolSep);
            arr.push(cultureCcy.symbol);
          } else {
            details.symbolSep && arr.unshift(details.symbolSep);
            arr.unshift(cultureCcy.symbol);
          }
          var strValueSymbol = arr.join("");
          return {
            string: strValueSymbol,
            value: strValue,
            cultureCcy: cultureCcy
          };
        };
        var getNewDate = function(_date) {
          var date = _date;
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(_date) && (date = _date + "Z");
          return new Date(date);
        };
        utils.getCityName = function(cityCode) {
          return tbr.main.avia.getCityName(cityCode);
        };
        utils.getDate = function(value, noWeekdays, isShort) {
          var time = getNewDate(value);
          var culture = cultureInfo[tbr.language.lang] || cultureInfo.en;
          var template = culture.dateFormat;
          noWeekdays && (template = culture.dateFormatNoWeekdays);
          isShort && (template = "d");
          template = dateTemplateParse(template, culture, time);
          return template;
        };
        utils.getCalMonth = function(value) {
          var time = getNewDate(value);
          var culture = cultureInfo[tbr.language.lang] || cultureInfo.en;
          return (culture.monthsCal || culture.months)[time.getUTCMonth()];
        };
        utils.getDateTime = function(value) {
          var time = getNewDate(value);
          var culture = cultureInfo[tbr.language.lang] || cultureInfo.en;
          var template = culture.dateTimeFormat;
          template = dateTemplateParse(template, culture, time);
          return template;
        };
        utils.getDateInterval = function(valueA, valueB) {
          var timeA = getNewDate(valueA);
          var timeB = getNewDate(valueB);
          var culture = cultureInfo[tbr.language.lang] || cultureInfo.en;
          var template = null;
          template = timeA.getUTCFullYear() === timeB.getUTCFullYear() && timeA.getUTCMonth() === timeB.getUTCMonth() ? culture.dateIntervalFormat : culture.dateMonthIntervalFormat;
          template = dateTemplateParse(template, culture, timeA, timeB);
          return template;
        };
        utils.getPriceNode = function(currency, value) {
          var priceObj = getPrice(currency, value);
          var cultureCcy = priceObj.cultureCcy;
          var details = cultureCcy.details;
          var getSymbol = function() {
            return cultureCcy.getNode ? cultureCcy.getNode() : cultureCcy.symbol;
          };
          var symbolSep = details.symbolSep;
          " " === symbolSep && (symbolSep = String.fromCharCode(160));
          var arr = [ priceObj.value ];
          if (details.symbolRight) {
            symbolSep && arr.push(symbolSep);
            arr.push(getSymbol());
          } else {
            symbolSep && arr.unshift(symbolSep);
            arr.unshift(getSymbol());
          }
          return utils.create(document.createDocumentFragment(), {
            append: arr
          });
        };
      };
    }).call(exports, __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    (function(tbr, utils, Promise) {
      var getWatcher = function() {
        var main = tbr.main;
        var watchTemplateObj = {
          price: function(profile, summary, item) {
            var page = profile.page;
            item.key || (item.key = "price");
            for (var node, n = 0; node = summary.added[n]; n++) {
              var price = utils.preparePrice(node.textContent);
              page.setPrice(item.key, price);
            }
          },
          currency: function(profile, summary, item) {
            var page = profile.page;
            item.key || (item.key = "currency");
            for (var node, n = 0; node = summary.added[n]; n++) {
              var text = node.textContent;
              var ccy = text && text.replace(/[\s\t]/g, "");
              item.currencyMap && item.currencyMap[ccy] && (ccy = item.currencyMap[ccy]);
              page.set(item.key, ccy);
            }
          }
        };
        var Page = function(profile) {
          var _this = this;
          var type = null;
          var params = {};
          var priceObj = {};
          var getPriceObj = function(priceId) {
            var obj = priceObj[priceId];
            obj || (priceObj[priceId] = obj = {});
            return obj;
          };
          var removePrice = function() {
            for (var key in priceObj) delete priceObj[key];
          };
          var isEq = function(a, b) {
            return Array.isArray(a) && b ? JSON.stringify(a) === JSON.stringify(b) : a === b;
          };
          var onFormChange = function() {
            if (type) {
              var priceId = main[type].page.getPriceId(params);
              var info = getInfoObj();
              delete info.barRequestData;
              removePrice();
              priceId ? profile.matchPrice = !0 : profile.matchPrice = !1;
            }
          };
          var onPriceChange = utils.debounce(function(priceParams) {
            var data = main[type].page.getData(params, priceParams);
            data && _this.setData(type, data);
          }, 50);
          this.setData = function(type, params) {
            params.type = type;
            var info = getInfoObj();
            for (var key in params) info[key] = params[key];
            onGetPageInfo(params);
          };
          this.setType = function(theType) {
            type = theType;
          };
          this.set = function(key, value) {
            value = utils.validate(key, value);
            var cValue = params[key];
            if (!isEq(value, cValue)) {
              params[key] = value;
              tbr.log("Page set", key, value);
              onFormChange();
            }
          };
          this.get = function(key) {
            return params[key] || null;
          };
          this.setPrice = function(key, value) {
            value = utils.validate(key, value);
            if (!value) return tbr.error("setPrice error, value is not valid", key, value);
            if (!type) return tbr.error("setPrice error, type is not found!", params);
            var priceId = main[type].page.getPriceId(params);
            var data = getPriceObj(priceId);
            var cValue = data[key];
            if (value && cValue !== value && (!cValue || cValue > value)) {
              data[key] = value;
              tbr.log("Page setPrice", key, value);
              onPriceChange(data);
            }
          };
          this.clear = function() {
            tbr.log("Page clear");
            profile.matchPrice = !1;
            type = null;
            for (var key in params) params[key] = null;
          };
        };
        var Watcher = function(profile, watchObj) {
          var observer = null;
          var watch = function(profile, watchObj) {
            var queries = [];
            var keys = [];
            Object.keys(watchObj).forEach(function(key) {
              var query = watchObj[key].query;
              Array.isArray(query) || (query = [ query ]);
              return query.forEach(function(query) {
                keys.push(key);
                queries.push(query);
              });
            });
            return utils.mutationWatcher.run({
              callback: function(summaryList) {
                for (var summary, i = 0; summary = summaryList[i]; i++) if (0 !== summary.added.length || 0 !== summary.removed.length) {
                  var item = watchObj[keys[i]];
                  profile.summaryStack.push([ item, summary ]);
                }
              },
              queries: queries
            });
          };
          this.stop = function() {
            observer && observer.stop();
            observer = null;
          };
          this.start = function() {
            observer && observer.stop();
            observer = watch(profile, watchObj);
          };
          this.destroy = this.stop;
        };
        var SummaryStack = function(profile) {
          var _this = this;
          var stack = [];
          var templateObj = watchTemplateObj;
          var next = function() {
            var stackItem = stack[0];
            if (stackItem) {
              var item = stackItem[0];
              var summary = stackItem[1];
              var promise = Promise.resolve();
              if (!item.isPrice || profile.matchPrice) {
                item.cb && (promise = promise.then(function() {
                  return item.cb(profile, summary);
                }));
                item.template && (promise = promise.then(function() {
                  var template = templateObj[item.template];
                  return template(profile, summary, item);
                }));
              }
              promise.catch(function(err) {
                tbr.error("Parse item error!", err);
                tbr.trackError(err);
              }).then(function() {
                var pos = stack.indexOf(stackItem);
                pos !== -1 && stack.splice(pos, 1);
                next();
              });
            }
          };
          var checkStack = function() {
            var len = stack.length;
            len > 30 && stack.shift();
            if (1 === len) return next();
          };
          _this.push = function(data) {
            stack.push(data);
            return checkStack();
          };
        };
        var Profile = function(details) {
          var _this = this;
          var watchObj = {};
          for (var key in details.formWatcher) watchObj[key] = details.formWatcher[key];
          for (var key in details.priceWatcher) {
            watchObj[key] = details.priceWatcher[key];
            watchObj[key].isPrice = !0;
          }
          _this.matchPrice = !1;
          _this.summaryStack = new SummaryStack(_this);
          _this.watcher = new Watcher(_this, watchObj);
          _this.page = new Page(_this);
          _this.watcher.start();
          _this.destroy = function() {
            _this.watcher && _this.watcher.destroy();
          };
        };
        var profile = null;
        var infoList = {};
        var getInfoObj = function() {
          var url = location.href;
          var info = infoList[url];
          info || (info = infoList[url] = {});
          return info;
        };
        var onGetPageInfo = function() {
          var pageInfo = getInfoObj();
          var obj = main[pageInfo.type];
          return obj ? obj.onGetData(pageInfo) : tbr.error("Type is not found!", pageInfo);
        };
        return {
          closeCurrentBar: function() {
            var currentBar = main.bar.current;
            main.bar.isAborted = !0;
            currentBar && !currentBar.isClosed && currentBar.close();
          },
          stopObserver: function() {
            profile && profile.destroy();
          },
          clearInfoObj: function(pageInfo) {
            for (var url in infoList) infoList[url] !== pageInfo && delete infoList[url];
          },
          initProfile: function(profileDetails) {
            profile && profile.destroy();
            profile = new Profile(profileDetails);
          }
        };
      };
      module.exports = getWatcher;
    }).call(exports, __webpack_require__(8), __webpack_require__(2), __webpack_require__(26));
  }, function(module, exports, __webpack_require__) {
    (function(Promise, tbr) {
      module.exports = function(utils) {
        utils.waitResponse = function(delay, limit, fn) {
          return new Promise(function(resolve) {
            var waitResponse = utils.waitResponse;
            (function timer(retry) {
              tbr.log("waitResponse retry", retry);
              waitResponse.timer && clearTimeout(waitResponse.timer);
              if (!(retry < 0)) return fn(function(err) {
                if (err) waitResponse.timer = setTimeout(function() {
                  waitResponse.timer = null;
                  return timer(--retry);
                }, delay); else {
                  tbr.log("waitResponse get response!");
                  resolve();
                }
              });
              tbr.error("waitResponse response is empty!");
              resolve();
            })(limit);
          });
        };
        utils.getParamsFromPage = function(varList) {
          return new Promise(function(resolve) {
            var isObjMode = !1;
            if ("object" == typeof varList && !Array.isArray(varList)) {
              isObjMode = Object.keys(varList);
              varList = isObjMode.map(function(key) {
                return varList[key];
              });
            }
            utils.bridge({
              args: [ varList ],
              func: function(varList, cb) {
                var rList = [];
                varList.forEach(function(item) {
                  var path = item;
                  var args = null;
                  if ("string" != typeof path) {
                    path = item.path;
                    args = item.args;
                  }
                  var vars = path.split(".");
                  var obj;
                  var key;
                  var result = window;
                  for (;vars.length; ) {
                    obj = result;
                    key = vars.shift();
                    try {
                      result = obj[key];
                    } catch (e) {
                      result = null;
                      break;
                    }
                  }
                  if (args) try {
                    result = obj[key].apply(obj, args);
                  } catch (e) {
                    result = null;
                  }
                  rList.push(result);
                });
                return cb(rList);
              },
              cb: function(_data) {
                var data = _data;
                if (isObjMode) {
                  data = {};
                  _data && _data.forEach(function(item, index) {
                    data[isObjMode[index]] = item;
                  });
                }
                return resolve(data);
              }
            });
          });
        };
        utils.validatorMap = {
          origin: "validateIataCode",
          destination: "validateIataCode",
          pickUpLocationId: "validateIataCode",
          dropOffLocationId: "validateIataCode",
          dateStart: "validateDate",
          dateEnd: "validateDate",
          dateIn: "validateDate",
          dateOut: "validateDate",
          pickUpDate: "validateDateTime",
          dropOffDate: "validateDateTime",
          currency: "validateCcy",
          adults: "validateAdults",
          price: "validatePrice",
          oneDayPrice: "validatePrice",
          minPriceIn: "validatePrice",
          minPriceOut: "validatePrice",
          minPriceBoth: "validatePrice",
          query: "validateQuery",
          dayCount: "validateNumber",
          driverAge: "validateNumber"
        };
        utils.validate = function(key, value) {
          var validateFnName = utils.validatorMap[key];
          validateFnName ? value = utils[validateFnName](value) : tbr.error("validator is not found!", key, value);
          return value;
        };
        utils.validateIataCode = function(value) {
          if (/^[A-Z]{3}$/.test(value)) return value.toUpperCase();
          tbr.error("City validation error!", value);
          return null;
        };
        utils.validateDate = function(value) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
          if (/^\d{4}-\d{2}$/.test(value)) return value;
          tbr.error("Date validation error!", value);
          return null;
        };
        utils.validateDateTime = function(value) {
          if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
            tbr.error("DateTime validation error!", value);
            value = null;
          }
          return value;
        };
        utils.validateCcy = function(value) {
          if (/^[A-Z]{3}$/.test(value)) return value;
          tbr.error("Currency validation error!", value);
          return null;
        };
        utils.validateNumber = function(value) {
          var int = parseInt(value);
          if (isNaN(int)) {
            tbr.error("Number validation error!", value);
            return null;
          }
          return int;
        };
        utils.validateAdults = function(value) {
          var int = utils.validateNumber(value);
          if (!int || int < 1) {
            tbr.error("Adults validation error!", value);
            return null;
          }
          return int;
        };
        utils.validateQuery = function(value) {
          if (Array.isArray(value) && value.length) return value;
          tbr.error("Query validation error!", value);
          return null;
        };
        utils.validatePrice = function(value) {
          if (!/^\d+(\.\d+)?$/.test(value)) {
            tbr.error("Price validation error!", value);
            return null;
          }
          return value;
        };
        utils.preparePrice = function(value) {
          if (!value) {
            tbr.log("Price is empty!", value);
            return null;
          }
          value = value.replace(",", ".");
          value = value.replace(/[^\d.]/g, "");
          value = value.replace(/\.(\d{3,})/, "$1");
          var m = value.match(/(\d+)(\.\d+)?/);
          if (!m) {
            tbr.log("Price is empty 2!", value);
            return null;
          }
          value = m[1];
          m[2] && (value += m[2]);
          value = parseFloat(value);
          if (isNaN(value)) {
            tbr.log("Price is NaN!", value);
            return null;
          }
          return value;
        };
        utils.reFormatDate = function(value, re, template) {
          var result = null;
          var m = re.exec(value);
          m && (result = template.replace(/\$(\d)/g, function(text, index) {
            return m[index];
          }));
          return result;
        };
        utils.normalizeDate = function(year, month, date, details) {
          details = details || {};
          if (!year && month && date) {
            var now = new Date();
            var cYear = now.getFullYear();
            var cDate = now.getDate();
            var cMonth = now.getMonth() + 1;
            var intMonth;
            intMonth = details.monthMap && void 0 !== details.monthMap[month] ? details.monthMap[month] : parseInt(month);
            var intDate = parseInt(date);
            (cMonth > intMonth || cMonth === intMonth && intDate < cDate) && (cYear += 1);
            intMonth < 10 && (intMonth = "0" + intMonth);
            intDate < 10 && (intDate = "0" + intDate);
            return utils.validateDate([ cYear, intMonth, intDate ].join("-"));
          }
          return null;
        };
        var codeSymbol = {
          USD: "$",
          EUR: "€",
          AZN: "₼",
          GBP: "£",
          CNY: "¥",
          GEL: "₾",
          TRY: "₺",
          RUB: "₽",
          UAH: "₴"
        };
        var fCcyRe = null;
        utils.findCurrency = function(text) {
          if (!fCcyRe) {
            var words = [];
            for (var key in codeSymbol) words.push(key, codeSymbol[key]);
            fCcyRe = new RegExp("(" + words.join("|").replace(/\$/, "\\$&") + ")");
          }
          var m = fCcyRe.exec(text);
          if (m) for (var key in codeSymbol) if (key === m[1] || codeSymbol[key] === m[1]) return key;
          return null;
        };
        utils.getDateAfterDays = function(startDate, days) {
          var time = new Date(startDate).getTime();
          time += 24 * days * 60 * 60 * 1e3;
          var now = new Date(time);
          var cYear = now.getUTCFullYear();
          var cMonth = now.getUTCMonth() + 1;
          var cDate = now.getUTCDate();
          cMonth < 10 && (cMonth = "0" + cMonth);
          cDate < 10 && (cDate = "0" + cDate);
          return utils.validateDate([ cYear, cMonth, cDate ].join("-"));
        };
        utils.getCurrentDate = function() {
          var now = new Date();
          var year = now.getUTCFullYear();
          var month = now.getUTCMonth() + 1;
          month < 10 && (month = "0" + month);
          var date = now.getUTCDate();
          date < 10 && (date = "0" + date);
          return [ year, month, date ].join("-");
        };
        utils.convertTime12to24 = function(time) {
          var m = /(\d+):(\d+)\s+(PM|AM)/.exec(time);
          if (m) {
            m[1] = parseInt(m[1]);
            m[2] = parseInt(m[2]);
            "PM" === m[3] && m[1] < 12 && (m[1] += 12);
            "AM" === m[3] && 12 === m[1] && (m[1] -= 12);
            m[1] < 10 && (m[1] = "0" + m[1]);
            m[2] < 10 && (m[2] = "0" + m[2]);
            return m[1] + ":" + m[2];
          }
        };
      };
    }).call(exports, __webpack_require__(26), __webpack_require__(8));
  }, function(module, exports, __webpack_require__) {
    "use strict";
    var kitFn = __webpack_require__(23);
    kitFn.addSite("skyscanner_com", "*://*.skyscanner.*/*", [ kitFn.details({
      locationCheck: [ /\/transport\/flights\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#content-main",
            is: "added"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "Skyscanner.ComponentContext.originIataCode",
              destination: "Skyscanner.ComponentContext.destinationIataCode",
              dateStart: "Skyscanner.ComponentContext.outboundDate",
              dateEnd: "Skyscanner.ComponentContext.inboundDate",
              currency: "Skyscanner.ComponentContext.currency"
            }).then(function(dataObj) {
              kitFn.setType("avia", profile);
              kitFn.setParam("origin", dataObj.origin, profile);
              kitFn.setParam("destination", dataObj.destination, profile);
              kitFn.setParam("dateStart", dataObj.dateStart, profile);
              kitFn.setParam("dateEnd", dataObj.dateEnd, profile);
              kitFn.setParam("currency", dataObj.currency, profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".card.result .mainquote-price",
            is: "added"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("momondo_com", "*://*.momondo.*/*", [ kitFn.details({
      locationCheck: [ /\/flightsearch\// ],
      formWatcher: {
        ctr: {
          query: [ {
            css: "#flight-list",
            is: "added"
          }, {
            css: ".results",
            is: "removed"
          } ],
          cb: function(profile) {
            kitFn.setType("avia", profile);
            var params = kitFn.parseUrl(/[?#](.+)/, /[&#]/);
            kitFn.setParam("origin", params.SO0, profile);
            kitFn.setParam("destination", params.SD0, profile);
            kitFn.setParam("dateStart", kitFn.matchTemplate(params.SDP0, /(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"), profile);
            kitFn.setParam("dateEnd", kitFn.matchTemplate(params.SDP1, /(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"), profile);
          }
        },
        ccy: {
          query: {
            css: ".ticketinfo .price .unit",
            is: "added"
          },
          template: "currency"
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".ticketinfo .price .value",
            is: "added"
          },
          template: "price"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom("#mui-header").style("marginTop", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("#mui-header").style("marginTop", 0);
      }
    }) ]);
    kitFn.addSite("ozon_travel", "*://*.ozon.travel/*", [ kitFn.details({
      locationCheck: [ /\/flight\/search\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".content"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "a.data.SearchParams.CodeFrom1",
              destination: "a.data.SearchParams.CodeTo1",
              dateStart: "a.data.SearchParams.Date1",
              dateEnd: "a.data.SearchParams.Date2",
              Date3: "a.data.SearchParams.Date3",
              CodeFrom2: "a.data.SearchParams.CodeFrom2",
              CodeTo2: "a.data.SearchParams.CodeTo2"
            }).then(function(dataObj) {
              if (dataObj.Date3) {
                kitFn.error("More two params.");
                return kitFn.pageClear(profile);
              }
              if (dataObj.CodeFrom2 && (dataObj.origin !== dataObj.CodeTo2 || dataObj.destination !== dataObj.CodeFrom2)) {
                kitFn.error("More one way!", dataObj);
                return kitFn.pageClear(profile);
              }
              kitFn.setType("avia", profile);
              kitFn.setParam("origin", dataObj.origin, profile);
              kitFn.setParam("destination", dataObj.destination, profile);
              kitFn.setParam("dateStart", dataObj.dateStart, profile);
              kitFn.setParam("dateEnd", dataObj.dateEnd, profile);
            });
          }
        },
        ccy: {
          query: {
            css: ".tariffs .price",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setParam("currency", kitFn.dom(".field-currency .u-input").text(), profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".tariffs .price",
            is: "added"
          },
          template: "price"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom("header.main-header").style("marginTop", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("header.main-header").style("marginTop", 0);
      }
    }), kitFn.details({
      locationCheck: [ /\/hotel_by_accommodation\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".hotel-head"
          },
          cb: function(profile) {
            var params = kitFn.parseUrl();
            if (params.NumOfRooms && 1 != params.NumOfRooms) kitFn.log("More one room", params.NumOfRooms); else {
              params.Dlts || kitFn.log("Adults is not found!");
              var dates = kitFn.matchUrl(/in(\d{4}-\d{2}-\d{2})out(\d{4}-\d{2}-\d{2})/);
              if (dates) {
                var name = kitFn.string(kitFn.dom("h1.hotel-head-main-title").text()).trim().end();
                kitFn.setType("hotel", profile);
                kitFn.setParam("dateIn", dates[1], profile);
                kitFn.setParam("dateOut", dates[2], profile);
                kitFn.setParam("adults", params.Dlts || 2, profile);
                kitFn.setParam("currency", kitFn.dom(".currency-sign.rouble").len() && "RUB", profile);
                return kitFn.getParamsFromPage({
                  name: "a.data.name",
                  city: "a.data.cityName"
                }).then(function(dataObj) {
                  var query = [];
                  dataObj.name && kitFn.array(query).push(dataObj.name);
                  name && name !== dataObj.name && kitFn.array(query).push(name);
                  dataObj.city ? kitFn.array(query).slice().forEach(function(name) {
                    kitFn.array(query).push(name + " " + dataObj.city);
                  }) : kitFn.log("Hotel city is not found!");
                  kitFn.setParam("query", query, profile);
                });
              }
              kitFn.log("Dates is not found!");
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".tariff .tariff-price .tariff-price-current .tariff-price-current-value"
          },
          template: "price"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom("header.main-header").style("marginTop", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("header.main-header").style("marginTop", 0);
      }
    }) ]);
    kitFn.addSite("onetwotrip_com", "*://*.onetwotrip.com/*", [ kitFn.details({
      locationCheck: [ /\/(?:flights|aviabilety|aviabileti|fluege|vuelos|loty|ucus)/ ],
      formWatcher: {
        ctr: {
          query: [ {
            css: "#layout_results",
            is: "added"
          }, {
            css: ".loader",
            is: "removed"
          }, {
            css: "#avia_structure",
            is: "added"
          } ],
          cb: function(profile) {
            kitFn.pageClear(profile);
            var params = kitFn.matchUrl(/#(\d{2})(\d{2})(\w{3})(\w{3})(\d{2})?(\d{2})?/);
            if (params) {
              var pOrigin = params[3];
              var pDestination = params[4];
              var pDateStart = kitFn.normalizeDate(null, params[2], params[1]);
              if (params[5] && params[6]) var pDateEnd = kitFn.normalizeDate(null, params[6], params[5]);
            }
            return kitFn.getParamsFromPage({
              origin: "xcnt_transport_from",
              destination: "xcnt_transport_to",
              dateStart: "xcnt_transport_depart_date",
              dateEnd: "xcnt_transport_return_date",
              currency: "tw.currency",
              type: "xcnt_transport_type"
            }).then(function(dataObj) {
              if ("air" === dataObj.type) {
                kitFn.setType("avia", profile);
                if (params) {
                  kitFn.setParam("origin", pOrigin, profile);
                  kitFn.setParam("destination", pDestination, profile);
                  kitFn.setParam("dateStart", pDateStart, profile);
                  kitFn.setParam("dateEnd", pDateEnd, profile);
                } else {
                  kitFn.setParam("origin", dataObj.origin, profile);
                  kitFn.setParam("destination", dataObj.destination, profile);
                  kitFn.setParam("dateStart", kitFn.matchTemplate(dataObj.dateStart, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"), profile);
                  kitFn.setParam("dateEnd", kitFn.matchTemplate(dataObj.dateEnd, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"), profile);
                }
                kitFn.setParam("currency", dataObj.currency, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".price_button .money-formatted"
          },
          template: "price"
        }
      },
      bodySelector: "body",
      styleSelector: "head",
      onShow: function(barHeight) {
        kitFn.dom("body").style("marginTop", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("body").style("marginTop", 0);
      }
    }), kitFn.details({
      locationCheck: [ /\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".hotelDetail"
          },
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            var params = kitFn.parseUrl();
            kitFn.setParam("dateIn", params.date_start, profile);
            kitFn.setParam("dateOut", params.date_end, profile);
            var adults = kitFn.exec(params.persons, /([0-9]+)/);
            adults && kitFn.setParam("adults", adults[1], profile);
            var hotelName = kitFn.string(kitFn.dom("h1#hc_name").text()).trim().end();
            if (hotelName) {
              var query = [];
              kitFn.array(query).push(hotelName);
              var city = kitFn.string(kitFn.dom(".hc_address span").text()).trim().end();
              city && kitFn.array(query).push(hotelName + " " + city);
              kitFn.setParam("query", query, profile);
              return kitFn.getParamsFromPage({
                currency: "tw.bonus.currency"
              }).then(function(dataObj) {
                kitFn.setParam("currency", params.display_currency || dataObj.currency, profile);
              });
            }
          }
        },
        new_changePage: {
          query: {
            css: "#app .qYeCQ._15p8O > ._2R7qE",
            is: "removed"
          },
          cb: function(profile) {
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        },
        new_ctr: {
          query: {
            css: "#app .qYeCQ._15p8O > ._2R7qE",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            var params = kitFn.parseUrl();
            kitFn.setParam("dateIn", params.date_start, profile);
            kitFn.setParam("dateOut", params.date_end, profile);
            var adults = kitFn.exec(params.adults, /([0-9]+)/);
            adults && kitFn.setParam("adults", adults[1], profile);
            var hotelName = kitFn.string(kitFn.dom(".qYeCQ._15p8O > ._2R7qE .eeLSn").text()).trim().end();
            if (hotelName) {
              var query = [];
              kitFn.array(query).push(hotelName);
              var city = kitFn.string(kitFn.dom(".qYeCQ._15p8O > ._2R7qE > a").text()).trim().end();
              city && kitFn.array(query).push(hotelName + " " + city);
              kitFn.setParam("query", query, profile);
            }
          }
        },
        new_ccy: {
          query: {
            css: "#app .qYeCQ._15p8O > ._2R7qE ._3_B1t ._1LaLb ._2ZYVd"
          },
          cb: function(profile) {
            var priceValue = kitFn.dom(".qYeCQ._15p8O > ._2R7qE ._3_B1t ._1LaLb ._2ZYVd").text();
            if (priceValue) {
              var ccy = kitFn.findCurrency(priceValue);
              ccy && kitFn.setParam("currency", ccy, profile);
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#rooms .oViews .offer .priceContent .price > .number > em > .leftNumber"
          },
          cb: function(profile, summary) {
            var ccy = kitFn.dom("#labelPerson .link3.selected[data-num]").data("num");
            if (ccy) {
              kitFn.setParam("currency", ccy, profile);
              var type = kitFn.dom("#labelPerson .link.selected[data-num]").data("num");
              if (type) {
                type = 0 == type ? "oneDayPrice" : "price";
                kitFn.array(summary.added).forEach(function(node) {
                  kitFn.setPrice(type, kitFn.preparePrice(node.textContent), profile);
                });
              }
            }
          }
        },
        new_price: {
          query: {
            css: "#app .qYeCQ._15p8O > ._2R7qE ._3_B1t ._1LaLb ._2ZYVd"
          },
          cb: function(profile) {
            var priceValue = kitFn.dom(".qYeCQ._15p8O > ._2R7qE ._3_B1t ._1LaLb ._2ZYVd").text();
            var priceType = kitFn.dom(".qYeCQ._15p8O > ._2R7qE ._3_B1t ._1LaLb ._20oib").text();
            if (priceValue && priceType) {
              var type = kitFn.test(priceType, /за 1 ночь/);
              type = type ? "oneDayPrice" : "price";
              kitFn.setPrice(type, kitFn.preparePrice(priceValue), profile);
            }
          }
        }
      }
    }) ]);
    kitFn.addSite("kayak_com", "*://*.kayak.*/*", [ kitFn.details({
      locationCheck: [ /\/flights\// ],
      formWatcher: {
        ctr: {
          query: {
            css: [ "#resbody", "#searchResultsList" ]
          },
          cb: function(profile) {
            var params = kitFn.matchUrl(/flights\/(\w{3})-(\w{3})\/(\d{4}-\d{2}-\d{2})(?:\/(\d{4}-\d{2}-\d{2}))?(?:\/(\w{3})-\w{3})?/);
            if (params && !params[5]) return kitFn.getParamsFromPage({
              origin: "R9.globals.analytics.pixelContext.originCode",
              destination: "R9.globals.analytics.pixelContext.destinationCode",
              dateStart: "R9.globals.analytics.pixelContext.departureDate",
              dateEnd: "R9.globals.analytics.pixelContext.returnDate",
              currency: "R9.globals.analytics.pixelContext.site_currency",
              tripType: "R9.globals.analytics.pixelContext.roundTrip",
              dateStartEn: "R9.globals.analytics.pixelContext.depart_date",
              dateEndEn: "R9.globals.analytics.pixelContext.return_date"
            }).then(function(dataObj) {
              kitFn.setType("avia", profile);
              if (params) {
                kitFn.setParam("origin", params[1], profile);
                kitFn.setParam("destination", params[2], profile);
                kitFn.setParam("dateStart", params[3], profile);
                kitFn.setParam("dateEnd", params[4], profile);
              } else {
                kitFn.setParam("origin", dataObj.origin, profile);
                kitFn.setParam("destination", dataObj.destination, profile);
                var dateStart = dataObj.dateStart || dataObj.dateStartEn;
                dateStart = kitFn.matchTemplate(dateStart, /(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = dataObj.dateEnd || dataObj.dateEndEn;
                dateEnd = kitFn.matchTemplate(dateEnd, /(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateEnd", dateEnd, profile);
              }
              kitFn.setParam("currency", dataObj.currency, profile);
            });
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: [ ".flightresult .results_price", ".book-price .bigPrice" ]
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("travelocity_com", [ "*://*.travelocity.com/*", "*://*.orbitz.com/*", "*://*.expedia.com/*" ], [ kitFn.details({
      locationCheck: [ /Hotel-Information/ ],
      formWatcher: {
        ctr: {
          query: [ {
            css: ".hotelInformation",
            is: "added"
          } ],
          cb: function(profile) {
            return kitFn.waitUntil(function() {
              return kitFn.getParamsFromPage({
                pageId: "IntentMediaProperties.page_id"
              }).then(function(dataObj) {
                return !!dataObj.pageId;
              });
            }, 3e4, 250).then(function() {
              return kitFn.getParamsFromPage({
                city: "IntentMediaProperties.hotel_city_name",
                name: "IntentMediaProperties.hotel_supplier",
                adults: "IntentMediaProperties.adults",
                rooms: "IntentMediaProperties.hotel_rooms",
                dateIn: "IntentMediaProperties.travel_date_start",
                dateOut: "IntentMediaProperties.travel_date_end",
                currency: "IntentMediaProperties.site_currency",
                pageId: "IntentMediaProperties.page_id"
              }).then(function(dataObj) {
                if ("hotel.details" !== dataObj.pageId || dataObj.rooms > 1 || !dataObj.name) kitFn.pageClear(profile); else {
                  kitFn.setType("hotel", profile);
                  var query = [ dataObj.name ];
                  dataObj.city && kitFn.array(query).unshift(dataObj.name + " " + dataObj.city);
                  kitFn.setParam("query", query, profile);
                  kitFn.setParam("adults", dataObj.adults, profile);
                  kitFn.setParam("currency", dataObj.currency, profile);
                  var dateIn = kitFn.matchTemplate(dataObj.dateIn, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                  kitFn.setParam("dateIn", dateIn, profile);
                  var dateOut = kitFn.matchTemplate(dataObj.dateOut, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                  kitFn.setParam("dateOut", dateOut, profile);
                }
              });
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#rooms-and-rates .room-price-info-wrapper .room-price"
          },
          template: "price",
          key: "oneDayPrice"
        }
      }
    }), kitFn.details({
      locationCheck: [ /\/Flights-Search/ ],
      formWatcher: {
        ctr: {
          query: {
            css: "#flightModuleList"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "IntentMediaProperties.flight_origin",
              destination: "IntentMediaProperties.flight_destination",
              dateStart: "IntentMediaProperties.travel_date_start",
              dateEnd: "IntentMediaProperties.travel_date_end",
              currency: "IntentMediaProperties.site_currency",
              type: "IntentMediaProperties.product_category",
              tripType: "IntentMediaProperties.trip_type"
            }).then(function(dataObj) {
              if ("flights" === dataObj.type) {
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", dataObj.origin, profile);
                kitFn.setParam("destination", dataObj.destination, profile);
                kitFn.setParam("currency", dataObj.currency, profile);
                var dateStart = kitFn.matchTemplate(dataObj.dateStart, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = null;
                "ROUND_TRIP" === dataObj.tripType && (dateEnd = kitFn.matchTemplate(dataObj.dateEnd, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
                kitFn.setParam("dateEnd", dateEnd, profile);
              } else kitFn.pageClear(profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#flightModuleList .offer-price .visuallyhidden"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("priceline_com", "*://*.priceline.com/*", [ kitFn.details({
      locationCheck: [ /\/fly(\/#)?\/search\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".fly-search-listings-container"
          },
          cb: function(profile) {
            var m = kitFn.matchUrl(/\/search\/([^-\/]+)-([^-\/]+)-([^-\/]+)\/(?:([^-\/]+)-([^-\/]+)-([^-\/]+)\/)?/);
            if (m) {
              kitFn.setType("avia", profile);
              var origin = kitFn.array(kitFn.string(m[1]).split(":")).get(0);
              kitFn.setParam("origin", origin, profile);
              var destination = kitFn.array(kitFn.string(m[2]).split(":")).get(0);
              kitFn.setParam("destination", destination, profile);
              var dateStart = kitFn.matchTemplate(m[3], /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateStart", dateStart, profile);
              var dateEnd = kitFn.matchTemplate(m[6], /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateEnd", dateEnd, profile);
              return kitFn.getParamsFromPage({
                currency: "pclntms.dataDictionary.currencyCode"
              }).then(function(dataObj) {
                kitFn.setParam("currency", dataObj.currency, profile);
              });
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".fly-itinerary .details .price"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("aeroflot_ru", "*://*.aeroflot.ru/*", [ kitFn.details({
      locationCheck: [ /\/webqtrip.html/ ],
      formWatcher: {
        ctr: {
          query: {
            css: ".flight-list"
          },
          cb: function(profile) {
            var dataArr = null;
            var dataRe = /"itineraryAirportPairs":(\[[^\]]+])/;
            kitFn.array(kitFn.getPageScript(kitFn.dom("body").html(), dataRe)).some(function(script) {
              var m = kitFn.exec(script, dataRe);
              m = m && m[1];
              if (m) return kitFn.array(kitFn.findJson(m)).some(function(arr) {
                if (!(kitFn.array(arr).len() > 2)) {
                  dataArr = arr;
                  return !0;
                }
                kitFn.error("More two way!");
              });
            });
            if (dataArr) {
              var originData = dataArr[0];
              if (originData) {
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", originData.departureCode, profile);
                kitFn.setParam("destination", originData.arrivalCode, profile);
                var dateStart = kitFn.matchTemplate(originData.date, /(\d{4})\/(\d{2})\/(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = null;
                var destData = dataArr[1];
                destData && (dateEnd = kitFn.matchTemplate(destData.date, /(\d{4})\/(\d{2})\/(\d{2})/, "$1-$2-$3"));
                kitFn.setParam("dateEnd", dateEnd, profile);
                var ccy = kitFn.exec(kitFn.dom("body").html(), /"currency":"([^"]{3})"/);
                ccy && kitFn.setParam("currency", ccy[1], profile);
              } else kitFn.error("Origin data is not found!", dataArr);
            } else kitFn.error("Data is not found!");
          }
        }
      },
      priceWatcher: {
        minPriceOut: {
          query: {
            css: "#outbounds .flight-list .prices-all .prices-amount"
          },
          template: "price",
          key: "minPriceOut"
        },
        minPriceIn: {
          query: {
            css: "#inbounds .flight-list .prices-all .prices-amount"
          },
          template: "price",
          key: "minPriceIn"
        },
        priceBoth: {
          query: {
            css: "#both .flight-list .prices-all .prices-amount"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("anywayanyday_com", "*://*.anywayanyday.com/*", [ kitFn.details({
      locationCheck: [ /\/avia\/offers\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".offers-tickets-container"
          },
          cb: function(profile) {
            var m = kitFn.matchUrl(/\/avia\/offers\/(\d{2})(\d{2})(\w{3})(\w{3})(?:(\d{2})(\d{2})(\w{3})(\w{3}))?/);
            if (m) {
              kitFn.array(m).shift();
              kitFn.setType("avia", profile);
              var isOneWay = !m[4];
              if (isOneWay || m[2] === m[7] && m[3] === m[6]) {
                kitFn.setParam("origin", m[2], profile);
                kitFn.setParam("destination", m[3], profile);
                var dateStart = kitFn.normalizeDate(null, m[1], m[0]);
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = !isOneWay && kitFn.normalizeDate(null, m[5], m[4]);
                kitFn.setParam("dateEnd", dateEnd, profile);
              } else kitFn.error("More one way in URL!", m);
            }
          }
        },
        ccy: {
          query: {
            css: ".header-sidebar-DropdownCurrency .b-menu-item-button-text"
          },
          template: "currency"
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".offers-tickets-container .fareTickets .b-price"
          },
          template: "price"
        }
      },
      onShow: function(height) {
        kitFn.dom("#app").style("top", height + "px");
        kitFn.dom("#app .page-top").style("top", height + "px");
      },
      onHide: function() {
        kitFn.dom("#app").style("top", 0);
        kitFn.dom("#app .page-top").style("top", 0);
      }
    }), kitFn.details({
      locationCheck: [ /hotels\.anywayanyday.+\/offers/ ],
      formWatcher: {
        ctr: {
          query: [ {
            css: ".hotel-rooms",
            is: "added"
          }, {
            css: ".hotel-rooms_load",
            is: "removed"
          } ],
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            var params = kitFn.parseUrl(/[?#](.+)/, /[&#]/);
            var dateIn = kitFn.matchTemplate(params.fromDate, /(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
            var dateOut = kitFn.matchTemplate(params.toDate, /(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
            kitFn.setParam("dateIn", dateIn, profile);
            kitFn.setParam("dateOut", dateOut, profile);
            kitFn.setParam("adults", params.adults || params.adults0, profile);
            return kitFn.waitUntil(function() {
              return kitFn.dom("div.hotelName").len();
            }, 3e4, 250).then(function() {
              var name = kitFn.string(kitFn.dom("div.hotelName").text()).trim().end();
              if (name) {
                var query = [];
                kitFn.array(query).push(name);
                var baseParams = kitFn.parseUrl();
                var place = kitFn.exec(baseParams.cityId, /(.+)\/(.+)/);
                if (place) {
                  kitFn.array(query).push(name + " " + place[1]);
                  kitFn.array(query).push(name + " " + place[1] + " " + place[2]);
                }
                kitFn.setParam("query", query, profile);
              } else kitFn.error("Hotel name is not found!");
            });
          }
        },
        ccy: {
          query: {
            css: ".header-sidebar-DropdownCurrency .b-menu-item-button-text"
          },
          template: "currency"
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".hotel-rooms .hotel-offer .hotel-offer_price-value .b-price"
          },
          template: "price"
        }
      },
      onShow: function(height) {
        kitFn.dom("#app").style("top", height + "px");
        kitFn.dom("#app .page-top").style("top", height + "px");
      },
      onHide: function() {
        kitFn.dom("#app").style("top", 0);
        kitFn.dom("#app .page-top").style("top", 0);
      }
    }) ]);
    kitFn.addSite("svyaznoy_travel", "*://*.svyaznoy.travel/*", [ kitFn.details({
      locationCheck: [ /\/hotels\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".d__hotelPage"
          },
          cb: function(profile) {
            var params = kitFn.parseUrl();
            var hotelName = kitFn.string(kitFn.dom(".d__hotel__title").text()).trim().end();
            if (hotelName) {
              if (1 == params.rooms) {
                kitFn.setType("hotel", profile);
                kitFn.setParam("dateIn", params.arrival_date, profile);
                kitFn.setParam("dateOut", params.departure_date, profile);
                kitFn.setParam("adults", params.adults, profile);
                return kitFn.getParamsFromPage({
                  name: "_pageData.contentModel.name",
                  city: "_pageData.contentModel.cities.name",
                  currency: "_pageData.contentModel.currencycode"
                }).then(function(dataObj) {
                  kitFn.setParam("currency", dataObj.currency, profile);
                  hotelName === dataObj.name && (hotelName = null);
                  var query = [];
                  dataObj.name && kitFn.array(query).push(dataObj.name);
                  hotelName && kitFn.array(query).push(hotelName);
                  dataObj.city && kitFn.array(query).slice(0).forEach(function(name) {
                    kitFn.array(query).push(name + " " + dataObj.city);
                  });
                  kitFn.setParam("query", query, profile);
                });
              }
              kitFn.error("More one room!");
            } else kitFn.error("Hotel name is not found!");
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".d__hotel__rooms-container .d__hotel__rooms__room__header__price span"
          },
          template: "price"
        }
      }
    }), kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: "#results"
          }, {
            css: "#results_best .b-buy__price"
          } ],
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "currentSearch.from_code",
              destination: "currentSearch.to_code",
              dateStart: "currentSearch.from_date",
              dateEnd: "currentSearch.to_date",
              type: "curDir"
            }).then(function(dataObj) {
              if ("/avia" === dataObj.type) {
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", dataObj.origin, profile);
                kitFn.setParam("destination", dataObj.destination, profile);
                var dateStart = kitFn.matchTemplate(dataObj.dateStart, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = kitFn.matchTemplate(dataObj.dateEnd, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                kitFn.setParam("dateEnd", dateEnd, profile);
                kitFn.dom(".i-icon._rub").len() && kitFn.setParam("currency", "RUB", profile);
              } else kitFn.pageClear(profile);
            });
          }
        },
        ccy: {
          query: {
            css: ".i-icon._rub",
            is: "added"
          },
          cb: function(profile, summary) {
            summary.added.length && kitFn.setParam("currency", "RUB", profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: [ {
            css: "#results_best .b-buy__price"
          }, {
            css: ".box-results-best .best-results-price"
          } ],
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("tickets_ru", "*://avia.tickets.ru/*", [ kitFn.details({
      locationCheck: [ /\/search\/results/ ],
      formWatcher: {
        ctr: {
          query: {
            css: ".result_block"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "avia_form_search_params.from_code",
              destination: "avia_form_search_params.to_code",
              dateStart: "avia_form_search_params.departure_date",
              dateEnd: "avia_form_search_params.departure_date1",
              fromCode1: "avia_form_search_params.from_code1",
              toCode1: "avia_form_search_params.to_code1",
              type: "cur_domain_name"
            }).then(function(dataObj) {
              if ("avia" === dataObj.type) {
                kitFn.setType("avia", profile);
                if (!dataObj.dateEnd || dataObj.origin === dataObj.toCode1 && dataObj.destination === dataObj.fromCode1) {
                  kitFn.setParam("origin", dataObj.origin, profile);
                  kitFn.setParam("destination", dataObj.destination, profile);
                  var dateStart = kitFn.matchTemplate(dataObj.dateStart, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                  kitFn.setParam("dateStart", dateStart, profile);
                  var dateEnd = kitFn.matchTemplate(dataObj.dateEnd, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                  kitFn.setParam("dateEnd", dateEnd, profile);
                } else kitFn.error("More one way", dataObj);
              } else {
                kitFn.error("Is not avia page!");
                kitFn.pageClear(profile);
              }
            });
          }
        },
        ccy: {
          query: {
            css: ".currency-change-block .nav-currency .iradio_minimal.checked + label"
          },
          template: "currency",
          currencyMap: {
            RUR: "RUB"
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#offers_table .item-block .price-block strong span:not(.hidden)"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("s7_ru", "*://*.s7.ru/*", [ kitFn.details({
      locationCheck: [ /\/selectExactDateSearchFlights\.action/ ],
      formWatcher: {
        ctr: {
          query: [ {
            css: "#expandSearchForm"
          } ],
          cb: function(profile) {
            var origin = kitFn.dom("#expandSearchForm input#departureLocationIataCode").value();
            var destination = kitFn.dom("#expandSearchForm input#arrivalLocationIataCode").value();
            var dateStart = kitFn.dom("#expandSearchForm input#departureDates").value();
            dateStart && (dateStart = kitFn.matchTemplate(dateStart, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
            var dateEnd = kitFn.dom('#expandSearchForm input[name="model.arrivalDate"]').value();
            dateEnd && (dateEnd = kitFn.matchTemplate(dateEnd, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
            var currency = kitFn.dom('#expandSearchForm input[name="model.currencyType"]').value();
            kitFn.setType("avia", profile);
            kitFn.setParam("origin", origin, profile);
            kitFn.setParam("destination", destination, profile);
            kitFn.setParam("dateStart", dateStart, profile);
            kitFn.setParam("dateEnd", dateEnd, profile);
            kitFn.setParam("currency", currency, profile);
          }
        }
      },
      priceWatcher: {
        priceOut: {
          query: {
            css: '#ibe_exact_outbound_flight_table .select-flights span[data-qa="amount"]'
          },
          template: "price",
          key: "minPriceOut"
        },
        travelWithPriceOut: {
          query: {
            css: '#exact_outbound_flight_table .select-tariff span[data-qa="amount"]'
          },
          template: "price",
          key: "minPriceOut"
        },
        priceIn: {
          query: {
            css: '#ibe_exact_inbound_flight_table .select-flights span[data-qa="amount"]'
          },
          template: "price",
          key: "minPriceIn"
        },
        travelWithPriceIn: {
          query: {
            css: '#exact_inbound_flight_table .select-tariff span[data-qa="amount"]'
          },
          template: "price",
          key: "minPriceIn"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom("body").style("marginTop", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("body").style("marginTop", 0);
      }
    }) ]);
    kitFn.addSite("kupibilet_ru", "*://*.kupibilet.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".results-list-wrap"
          }, {
            css: ".preloader"
          } ],
          cb: function(profile) {
            var m = kitFn.matchUrl(/\/search\/(?:\w\d{3})(\d{2})(\w{3})(\w{3})(\w{3})(?:(\d{2})(\w{3})(\w{3})?)?/);
            if (m) {
              kitFn.array(m).shift();
              if (m[6]) kitFn.error("More two way!", m); else {
                var isOneWay = !m[4];
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", m[2], profile);
                kitFn.setParam("destination", m[3], profile);
                var monthMap = {
                  JAN: 1,
                  FEB: 2,
                  MAR: 3,
                  APR: 4,
                  MAY: 5,
                  JUN: 6,
                  JUL: 7,
                  AUG: 8,
                  SEP: 9,
                  OCT: 10,
                  NOV: 11,
                  DEC: 12
                };
                var dateStart = kitFn.normalizeDate(null, m[1], m[0], {
                  monthMap: monthMap
                });
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = !isOneWay && kitFn.normalizeDate(null, m[5], m[4], {
                    monthMap: monthMap
                  });
                kitFn.setParam("dateEnd", dateEnd, profile);
                kitFn.dom(".fa-rub").len() && kitFn.setParam("currency", "RUB", profile);
              }
            }
          }
        },
        ccy: {
          query: {
            css: "div.ReactVirtualized__Grid__innerScrollContainer > div > div:nth-child(1) > div ~ div > div > span",
            is: "added"
          },
          cb: function(profile, summary) {
            kitFn.array(summary.added).some(function(node) {
              if (kitFn.test(node.textContent, /₽/)) {
                kitFn.setParam("currency", "RUB", profile);
                return !0;
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "div.ReactVirtualized__Grid__innerScrollContainer > div > div:nth-child(1) > div ~ div > div > span",
            is: "added"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("trip_ru", "*://*.trip.ru/*", [ kitFn.details({
      locationCheck: [ /\/flights\/searches\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#results-container"
          },
          cb: function(profile) {
            var url = null;
            var re = /e_travel_flights_search/;
            kitFn.dom().getAll("#flights_view_type_tabs a").some(function(node) {
              if (kitFn.test(node.href, re)) {
                url = node.href;
                return !0;
              }
            });
            if (url) {
              var params = kitFn.parseUrl(url);
              kitFn.setType("avia", profile);
              var origin = params["e_travel_flights_search[from]"];
              kitFn.setParam("origin", origin, profile);
              var destination = params["e_travel_flights_search[to]"];
              kitFn.setParam("destination", destination, profile);
              var dateStart = params["e_travel_flights_search[departure]"];
              kitFn.setParam("dateStart", dateStart, profile);
              var dateEnd = params["e_travel_flights_search[return]"];
              kitFn.setParam("dateEnd", dateEnd, profile);
              var ccy = kitFn.dom("#localization_selector_currency").value();
              ccy && kitFn.setParam("currency", ccy, profile);
            } else kitFn.error("Search url is not found!");
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".flights-product-details .price span > a"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("sindbad_ru", "*://*.sindbad.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".trips"
          }, {
            css: ".wait_loop"
          } ],
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "App.searchModel.attributes.request.src",
              destination: "App.searchModel.attributes.request.dst",
              dateStart: "App.searchModel.attributes.request.date_out",
              dateEnd: "App.searchModel.attributes.request.date_in"
            }).then(function(dataObj) {
              kitFn.setType("avia", profile);
              kitFn.setParam("origin", dataObj.origin, profile);
              kitFn.setParam("destination", dataObj.destination, profile);
              kitFn.setParam("dateStart", dataObj.dateStart, profile);
              kitFn.setParam("dateEnd", dataObj.dateEnd, profile);
              kitFn.dom(".ruble").len() && kitFn.setParam("currency", "RUB", profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".trips .trip-worth .trip-worth__price",
            is: "added"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("aviakassa_ru", "*://*.aviakassa.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".AviaResultList__Groups"
          } ],
          cb: function(profile) {
            var url = kitFn.getUrl();
            var isAvia = kitFn.test(url, /\/avia\/results\//);
            var params = kitFn.exec(url, /(RT|OW)\w\d{6}(\w{3})(\w{3})(\d{4})(\d{2})(\d{2})(?:(\w{3})(\w{3})(\d{4})(\d{2})(\d{2}))?/);
            if (isAvia && params) {
              kitFn.array(params).shift();
              var origin = params[1];
              var destination = params[2];
              if ("RT" !== params[0] || origin === params[7] && destination === params[6]) {
                var dateStart = kitFn.array([ params[3], params[4], params[5] ]).join("-");
                var dateEnd = null;
                params[8] && params[9] && params[10] && (dateEnd = kitFn.array([ params[8], params[9], params[10] ]).join("-"));
                kitFn.pageClear(profile);
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", origin, profile);
                kitFn.setParam("destination", destination, profile);
                kitFn.setParam("dateStart", dateStart, profile);
                kitFn.setParam("dateEnd", dateEnd, profile);
              } else kitFn.closeCurrentBar();
            } else kitFn.closeCurrentBar();
          }
        },
        ccy: {
          query: {
            css: ".AviaResultList__Groups .Card .Price__Value"
          },
          cb: function(profile) {
            kitFn.dom(".Price__Value").some(function(node) {
              var parent = node.parentNode;
              if (parent) {
                var ccy = kitFn.dom(parent).text();
                if (kitFn.test(ccy, /руб/)) {
                  kitFn.setParam("currency", "RUB", profile);
                  return !0;
                }
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".AviaResultList__Groups .Card .Price__Value"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("biletix_ru", "*://*.biletix.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".flights"
          }, {
            css: ".progress-ajax-border"
          } ],
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              origin: "xcnt_transport_from",
              destination: "xcnt_transport_to",
              dateStart: "xcnt_transport_depart_date",
              dateEnd: "xcnt_transport_return_date",
              type: "APRT_DATA.searchTickets.type"
            }).then(function(dataObj) {
              if ("avia" === dataObj.type) {
                kitFn.setType("avia", profile);
                kitFn.setParam("origin", dataObj.origin, profile);
                kitFn.setParam("destination", dataObj.destination, profile);
                var dateStart = kitFn.matchTemplate(dataObj.dateStart, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateStart", dateStart, profile);
                var dateEnd = kitFn.matchTemplate(dataObj.dateEnd, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                kitFn.setParam("dateEnd", dateEnd, profile);
                var ccy = kitFn.dom('#currency_form .selected input[name="currency"]').value();
                "RUR" === ccy && (ccy = "RUB");
                kitFn.setParam("currency", ccy, profile);
              } else kitFn.pageClear(profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".offers .offer .price .caption"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("utair_ru", "*://*.utair.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".directions_wrapper"
          }, {
            css: ".progress-text"
          } ],
          cb: function(profile) {
            kitFn.setType("avia", profile);
            var origin = kitFn.dom(".location.departure .code").text();
            kitFn.setParam("origin", origin, profile);
            var destination = kitFn.dom(".location.arrival .code").text();
            kitFn.setParam("destination", destination, profile);
            var ccy = kitFn.dom('input#matrix_currency[name="currency"]').value();
            ccy && kitFn.setParam("currency", ccy, profile);
            return kitFn.getParamsFromPage({
              dateStart: "cfg_split_fares.selected_date_to",
              dateEnd: "cfg_split_fares.selected_date_back"
            }).then(function(dataObj) {
              var dateStart = kitFn.matchTemplate(dataObj.dateStart, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateStart", dateStart, profile);
              var dateEnd = kitFn.matchTemplate(dataObj.dateEnd, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateEnd", dateEnd, profile);
            });
          }
        }
      },
      priceWatcher: {
        priceOut: {
          query: {
            css: ".direction.direction-to .price"
          },
          template: "price",
          key: "minPriceOut"
        },
        priceIn: {
          query: {
            css: ".direction.direction-back .price"
          },
          template: "price",
          key: "minPriceIn"
        }
      }
    }) ]);
    kitFn.addSite("booking_com", "*://*.booking.*/*", [ kitFn.details({
      locationCheck: [ /\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#hotelTmpl"
          },
          cb: function(profile) {
            var hotelName = kitFn.string(kitFn.dom("#hp_hotel_name").text()).trim().end();
            if (hotelName) return kitFn.getParamsFromPage({
              city: "utag_data.city_name",
              country: "utag_data.country_name",
              dateIn: "utag_data.date_in",
              dateOut: "utag_data.date_out",
              currency: "utag_data.currency",
              adults: "utag_data.adults"
            }).then(function(dataObj) {
              kitFn.setType("hotel", profile);
              var query = [ hotelName ];
              dataObj.city && dataObj.country ? kitFn.array(query).unshift(hotelName + " " + dataObj.city + " " + dataObj.country) : dataObj.city ? kitFn.array(query).unshift(hotelName + " " + dataObj.city) : dataObj.country && kitFn.array(query).unshift(hotelName + " " + dataObj.country);
              kitFn.setParam("query", query, profile);
              kitFn.setParam("dateIn", dataObj.dateIn, profile);
              kitFn.setParam("dateOut", dataObj.dateOut, profile);
              kitFn.setParam("currency", dataObj.currency, profile);
              kitFn.setParam("adults", dataObj.adults, profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".booking_summary .roomPrice strong.rooms-table-room-price"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("agoda_com", "*://*.agoda.*/*", [ kitFn.details({
      locationCheck: [ /\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".hotel-header-section"
          },
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            return kitFn.getParamsFromPage({
              checkIn: "rtag_checkin",
              checkOut: "rtag_checkout",
              adults: "agoda.searchBoxConfig.defaultOccupancy.adults",
              children: "agoda.searchBoxConfig.defaultOccupancy.children",
              rooms: "agoda.searchBoxConfig.defaultOccupancy.rooms",
              defaultText: "agoda.searchBoxConfig.defaultText",
              city: "rtag_cityname"
            }).then(function(dataObj) {
              if (1 === dataObj.rooms) {
                kitFn.setParam("dateIn", dataObj.checkIn, profile);
                kitFn.setParam("dateOut", dataObj.checkOut, profile);
                kitFn.setParam("adults", dataObj.adults, profile);
                var hotelName = dataObj.defaultText;
                var enName = kitFn.exec(hotelName, /\((.+)\)$/);
                enName = enName && enName[1];
                enName && (hotelName = kitFn.string(hotelName).replace("(" + enName + ")", "").end());
                var query = [ hotelName ];
                enName && kitFn.array(query).push(enName);
                if (dataObj.city) {
                  enName && kitFn.array(query).unshift(enName + " " + dataObj.city);
                  kitFn.array(query).unshift(hotelName + " " + dataObj.city);
                }
                kitFn.setParam("query", query, profile);
              }
            });
          }
        },
        ccy: {
          query: {
            css: [ "#room-grid-table .price .pricing.display", "#room-grid-table .price span.room-grouping-room-price", "#room-grid-table .price-panel .sellprice" ]
          },
          cb: function(profile) {
            var ccy = kitFn.dom("#currency").text();
            kitFn.setParam("currency", ccy, profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: [ "#room-grid-table .price .pricing.display", "#room-grid-table .price span.room-grouping-room-price", "#room-grid-table .price-panel .sellprice" ]
          },
          template: "price",
          key: "oneDayPrice"
        }
      }
    }) ]);
    kitFn.addSite("hotels_com", "*://*.hotels.com/*", [ kitFn.details({
      locationCheck: [ /\/hotel\/|\/ho\d+\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#property-details"
          },
          cb: function(profile) {
            var name = kitFn.string(kitFn.dom('.vcard h1[itemprop="name"]').text()).trim().end();
            return kitFn.getParamsFromPage({
              dateIn: "commonDataBlock.search.checkinDate",
              dateOut: "commonDataBlock.search.checkoutDate",
              name: "commonDataBlock.property.hotelName",
              country: "commonDataBlock.property.country",
              city: "commonDataBlock.property.city",
              currency: "commonDataBlock.property.featuredPrice.currency",
              rooms: "commonDataBlock.search.numRooms",
              searchRooms: "commonDataBlock.search.rooms"
            }).then(function(dataObj) {
              if (1 == dataObj.rooms && 1 === kitFn.array(dataObj.searchRooms).len()) {
                kitFn.setType("hotel", profile);
                name === dataObj.name && (name = null);
                var query = [];
                dataObj.name && kitFn.array(query).push(dataObj.name);
                name && kitFn.array(query).push(name);
                kitFn.array(query).slice(0).forEach(function(name) {
                  if (name) {
                    var place = [];
                    place = kitFn.getVersion() <= 1 ? kitFn.array([ dataObj.city, dataObj.country ]).filter(function(place) {
                      return !!place;
                    }) : kitFn.array([ dataObj.city, dataObj.country ]).filter(function(place) {
                      return !!place;
                    }).end();
                    place.length && kitFn.array(query).unshift(kitFn.array([ name, kitFn.array(place).join(" ") ]).join(" "));
                  }
                });
                kitFn.setParam("query", query, profile);
                kitFn.setParam("dateIn", dataObj.dateIn, profile);
                kitFn.setParam("dateOut", dataObj.dateOut, profile);
                kitFn.setParam("currency", dataObj.currency, profile);
                var adults = dataObj.searchRooms[0].numAdults;
                kitFn.setParam("adults", adults, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#rooms-and-rates .current-price"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("ostrovok_ru", "*://*.ostrovok.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: {
            css: [ ".rate-pricevalue", ".zen-roomspagerate-price-value", ".hotel-metaroom-rate-pricevalue" ]
          },
          cb: function(profile) {
            if (kitFn.matchUrl(/b2b\.ostrovok\.ru/)) kitFn.pageClear(profile); else {
              var isRoom = kitFn.testUrl(/\/rooms\//);
              var isHotel = kitFn.testUrl(/\/hotel\//);
              if (isRoom || isHotel) {
                var name = kitFn.dom("h1.zen-roomspage-title-name").text();
                if (!name) {
                  var nameNode = kitFn.dom("h1.hotel-header-title").remove(".preferred").text();
                  name = kitFn.string(nameNode).trim().end();
                }
                if (name) return kitFn.getParamsFromPage({
                  dateIn: "qubit_event.page_checkin_date",
                  dateOut: "qubit_event.page_checkout_date",
                  city: "qubit_event.page_city",
                  country: "qubit_event.page_country",
                  adults: "qubit_event.page_adults",
                  currency: "qubit_event.product_currency"
                }).then(function(dataObj) {
                  kitFn.setType("hotel", profile);
                  var query = [ name ];
                  dataObj.city && dataObj.country ? kitFn.array(query).unshift(name + " " + dataObj.city + " " + dataObj.country) : dataObj.city ? kitFn.array(query).unshift(name + " " + dataObj.city) : dataObj.country && kitFn.array(query).unshift(name + " " + dataObj.country);
                  kitFn.setParam("query", query, profile);
                  kitFn.setParam("adults", dataObj.adults, profile);
                  kitFn.setParam("currency", dataObj.currency, profile);
                  var dateIn = kitFn.matchTemplate(dataObj.dateIn, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                  kitFn.setParam("dateIn", dateIn, profile);
                  var dateOut = kitFn.matchTemplate(dataObj.dateOut, /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
                  kitFn.setParam("dateOut", dateOut, profile);
                });
              } else kitFn.pageClear(profile);
            }
          }
        },
        changePage: {
          query: {
            css: "h1.zen-roomspage-title-name",
            is: "removed"
          },
          cb: function(profile) {
            kitFn.log("page change!");
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: [ ".rate-pricevalue", ".zen-roomspagerate-price-value", ".hotel-metaroom-rate-pricevalue" ]
          },
          cb: function(profile, summary) {
            kitFn.array(summary.added).forEach(function(node) {
              kitFn.array(kitFn.dom(node).childText()).forEach(function(text) {
                kitFn.setPrice("price", kitFn.preparePrice(kitFn.string(text).replace("тыс.", "000").end()), profile);
              });
            });
          }
        }
      }
    }) ]);
    kitFn.addSite("travel_ru", "*://*.travel.ru/*", [ kitFn.details({
      locationCheck: [ /\/hotels\// ],
      formWatcher: {
        ctr: {
          query: {
            css: [ ".TPWL-hotels-one-rooms-item-price-value" ]
          },
          cb: function(profile) {
            var ccy = kitFn.exec(kitFn.dom(".TPWL-currency-switcher__selected").text(), /([A-Z]{3})/);
            ccy = ccy && ccy[1];
            var name = kitFn.string(kitFn.dom(".TPWL-hotels-one-title").text()).trim().end();
            name || (name = kitFn.string(kitFn.dom("h1.b-hotel_title").text()).trim().end());
            if (ccy && name) {
              var params = kitFn.parseUrl();
              kitFn.setType("hotel", profile);
              var dateIn = kitFn.matchTemplate(params.checkIn, /(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateIn", dateIn, profile);
              var dateOut = kitFn.matchTemplate(params.checkOut, /(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");
              kitFn.setParam("dateOut", dateOut, profile);
              kitFn.setParam("query", [ name ], profile);
              var adults = kitFn.dom("#room_type").value();
              "family" === adults && (adults = 4);
              kitFn.setParam("adults", adults, profile);
              kitFn.setParam("currency", ccy, profile);
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: [ ".TPWL-hotels-one-rooms-item-price-value" ]
          },
          template: "price"
        }
      }
    }), kitFn.details({
      locationCheck: [ /\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".b-av .b-av-rate_price_rub"
          },
          cb: function(profile) {
            var ccy = kitFn.exec(kitFn.dom(".b-currency-trigger button").text(), /([A-Z]{3})/);
            ccy = ccy && ccy[1];
            var name = kitFn.string(kitFn.dom("h1.b-hotel_title").text()).trim().end();
            if (ccy && name) {
              var params = kitFn.parseUrl();
              kitFn.setType("hotel", profile);
              var dateIn = kitFn.matchTemplate(params.in, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
              kitFn.setParam("dateIn", dateIn, profile);
              var dateOut = kitFn.matchTemplate(params.out, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
              kitFn.setParam("dateOut", dateOut, profile);
              var query = [ name ];
              var hotelName = kitFn.dom(".breadcrumb > li.active > span[title]").attr("title");
              hotelName && kitFn.array(query).push(hotelName);
              kitFn.setParam("query", query, profile);
              kitFn.setParam("adults", params.occ, profile);
              kitFn.setParam("currency", ccy, profile);
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".b-av .b-av-rate_price_rub"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("oktogo_ru", "*://*.oktogo.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: {
            css: '.priceContainer *[data-price="period-price"] span.rub'
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              name: "APRT_DATA.currentProduct.name",
              dateIn: "APRT_DATA.searchTickets.dateFrom",
              dateOut: "APRT_DATA.searchTickets.dateTill",
              adults: "APRT_DATA.searchTickets.count",
              currency: "currency",
              type: "APRT_DATA.searchTickets.type",
              country: "APRT_DATA.searchTickets.country",
              city: "APRT_DATA.searchTickets.dest"
            }).then(function(dataObj) {
              var name = kitFn.string(dataObj.name).trim().end();
              if ("hotel" === dataObj.type && name) {
                kitFn.setType("hotel", profile);
                var query = [ name ];
                dataObj.city && dataObj.country ? kitFn.array(query).unshift(name + " " + dataObj.city + " " + dataObj.country) : dataObj.city ? kitFn.array(query).unshift(name + " " + dataObj.city) : dataObj.country && kitFn.array(query).unshift(name + " " + dataObj.country);
                kitFn.setParam("query", query, profile);
                kitFn.setParam("currency", dataObj.currency, profile);
                var params = kitFn.parseUrl();
                if (params.in && params.out) {
                  var dateIn = kitFn.matchTemplate(params.in, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                  kitFn.setParam("dateIn", dateIn, profile);
                  var dateOut = kitFn.matchTemplate(params.out, /(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1");
                  kitFn.setParam("dateOut", dateOut, profile);
                } else {
                  kitFn.setParam("dateIn", dataObj.dateIn, profile);
                  kitFn.setParam("dateOut", dataObj.dateOut, profile);
                }
                params.occ ? kitFn.setParam("adults", params.occ, profile) : kitFn.setParam("adults", dataObj.adults, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: '.priceContainer *[data-price="period-price"] span.rub'
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("roomguru_ru", "*://*.roomguru.ru/*", [ kitFn.details({
      locationCheck: [ /\/Hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#ratesSearchResultsHolder"
          },
          cb: function(profile) {
            var name = kitFn.string(kitFn.dom("h1.hc_htl_intro_name").text()).trim().end();
            if (name) {
              var params = kitFn.parseUrl();
              var adults = params.adults_1;
              var place = kitFn.exec(params.destination, /place:(.+)/);
              place = place && kitFn.string(place[1]).trim().end();
              var query = [ name ];
              place && kitFn.array(query).unshift(name + " " + place);
              return kitFn.getParamsFromPage({
                fields: "HC.Common.fields",
                gCurrencyCode: "gCurrencyCode"
              }).then(function(dataObj) {
                var fields = dataObj.fields;
                var ccy = dataObj.gCurrencyCode;
                if (fields && ccy) {
                  kitFn.setType("hotel", profile);
                  kitFn.setParam("query", query, profile);
                  kitFn.setParam("adults", adults, profile);
                  kitFn.setParam("dateIn", fields.checkin, profile);
                  kitFn.setParam("dateOut", fields.checkout, profile);
                  kitFn.setParam("currency", ccy, profile);
                }
              });
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#hc_htl_pm_rates_content .hc_tbl_col2 #TotalLink"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("tripadvisor_ru", "*://*.tripadvisor.ru/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: [ {
            css: ".viewDealChevrons .price"
          }, {
            css: ".meta .prw_rup .price"
          } ],
          cb: function(profile) {
            var queryName = kitFn.string(kitFn.dom("h1.header").text()).trim().end();
            var altName = kitFn.string(kitFn.dom("h1.heading_name .altHead").text()).trim().end();
            var name = kitFn.string(kitFn.dom("h1.heading_name").remove(".altHead").text()).trim().end();
            var tree = kitFn.dom("div[data-targetEvent='offerClickTrackingTree']").html();
            if (tree) {
              var ccy = kitFn.exec(tree, /\\PC:([A-Z]{3})\\/);
              ccy = ccy && ccy[1];
              var dateIn = kitFn.exec(tree, /\\CI:(\d{4}-\d{2}-\d{2})\\/);
              dateIn = dateIn && dateIn[1];
              var dateOut = kitFn.exec(tree, /\\CO:(\d{4}-\d{2}-\d{2})\\/);
              dateOut = dateOut && dateOut[1];
              if (name && ccy && dateIn && dateOut) return kitFn.getParamsFromPage({
                adultsCount: {
                  path: "ta.retrieve",
                  args: [ "multiDP.adultsCount" ]
                }
              }).then(function(dataObj) {
                if (dataObj && dataObj.adultsCount) {
                  kitFn.setType("hotel", profile);
                  kitFn.setParam("dateIn", dateIn, profile);
                  kitFn.setParam("dateOut", dateOut, profile);
                  kitFn.setParam("currency", ccy, profile);
                  var query = [ name ];
                  altName && kitFn.array(query).push(altName);
                  queryName && kitFn.array(query).unshift(queryName);
                  kitFn.setParam("query", query, profile);
                  kitFn.setParam("adults", dataObj.adultsCount, profile);
                }
              });
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: [ {
            css: ".viewDealChevrons .price"
          }, {
            css: ".meta .prw_rup .price"
          } ],
          template: "price",
          key: "oneDayPrice"
        }
      }
    }) ]);
    kitFn.addSite("hilton_com", [ "*://*.hilton.com/*", "*://*.hilton.ru/*" ], [ kitFn.details({
      locationCheck: [ /\/reservation\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#roomViewRegularView"
          },
          cb: function(profile) {
            var name = kitFn.string(kitFn.dom("h1.hotelNameNoLink").text()).trim().end();
            var roomsAdults = kitFn.string(kitFn.dom(".sumOccupancy").text()).trim().end();
            var ccy = kitFn.dom("select#changeCurrency").value();
            if (name && roomsAdults && ccy) return kitFn.getParamsFromPage({
              dateInfo: "digitalData.page.attributes.propertySearchDateInfo"
            }).then(function(dataObj) {
              if (dataObj.dateInfo) {
                kitFn.setType("hotel", profile);
                var query = [ name ];
                kitFn.setParam("query", query, profile);
                roomsAdults = kitFn.match(roomsAdults, /(\d+)/g);
                if (roomsAdults && "1" == roomsAdults[0]) {
                  kitFn.setParam("adults", roomsAdults[1], profile);
                  kitFn.setParam("currency", ccy, profile);
                  var searchDetails = kitFn.string(dataObj.dateInfo).split(":");
                  var dateIn = searchDetails && searchDetails[1];
                  dateIn = kitFn.matchTemplate(dateIn, /(\d{2})(\d{2})(\d{4})/, "$3-$1-$2");
                  kitFn.setParam("dateIn", dateIn, profile);
                  var dateOut = searchDetails && searchDetails[2];
                  dateOut = kitFn.matchTemplate(dateOut, /(\d{2})(\d{2})(\d{4})/, "$3-$1-$2");
                  kitFn.setParam("dateOut", dateOut, profile);
                }
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".priceamount-wrapper .priceamount"
          },
          cb: function(profile, summary) {
            kitFn.array(summary.added).forEach(function(node) {
              var value = kitFn.dom(node).remove("del").text();
              kitFn.setPrice("oneDayPrice", kitFn.preparePrice(value), profile);
            });
          }
        }
      }
    }) ]);
    kitFn.addSite("marriott_com", "*://*.marriott.com/*", [ kitFn.details({
      locationCheck: [ /\/reservation\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".results-container"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              dataLayer: "dataLayer"
            }).then(function(dataObj) {
              if (dataObj.dataLayer && !(dataObj.dataLayer.numRooms > 1)) {
                kitFn.setType("hotel", profile);
                var name = dataObj.dataLayer.prop_name;
                var query = [ name ];
                dataObj.dataLayer.prop_address_city && kitFn.array(query).unshift(name + " " + dataObj.dataLayer.prop_address_city);
                kitFn.setParam("query", query, profile);
                var adults = dataObj.dataLayer.numGuestsPerRoom;
                kitFn.setParam("adults", adults, profile);
                var currency = null;
                if (!currency) {
                  currency = kitFn.exec(kitFn.dom(".m-pricing-block span.t-nightly").text(), /([A-Z]{3})\//);
                  currency = currency && currency[1];
                }
                if (!currency) {
                  currency = kitFn.exec(kitFn.dom("head").html(), /tm_currency_type\s*:\s*"(\w{3})"/);
                  currency = currency && currency[1];
                }
                currency || (currency = dataObj.dataLayer.prop_currency_type);
                kitFn.setParam("currency", currency, profile);
                var dateIn = dataObj.dataLayer.chckInDat;
                dateIn = kitFn.matchTemplate(dateIn, /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2");
                kitFn.setParam("dateIn", dateIn, profile);
                var dateOut = dataObj.dataLayer.chckOutDate;
                dateOut = kitFn.matchTemplate(dateOut, /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2");
                kitFn.setParam("dateOut", dateOut, profile);
                kitFn.setParam("dayCount", dataObj.dataLayer.nmbNights, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".results-container .t-price"
          },
          template: "price",
          key: "oneDayPrice"
        }
      }
    }) ]);
    kitFn.addSite("hostelworld_com", "*://*.hostelworld.com/*", [ kitFn.details({
      locationCheck: [ /\/hosteldetails/ ],
      formWatcher: {
        ctr: {
          query: {
            css: ".resultcolumn"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              dataLayer: "dataLayer",
              currency: "$.currency.code"
            }).then(function(dataObj) {
              if (kitFn.array(dataObj.dataLayer).len()) {
                var query = [];
                var name = null;
                kitFn.array(dataObj.dataLayer).forEach(function(obj) {
                  if (obj && "production" === obj.gtmApplicationEnv) {
                    name = obj.gtmPropertyName;
                    var city = kitFn.dom('input[name="city"]').value();
                    var country = kitFn.dom('input[name="country"]').value();
                    city && country ? kitFn.array(query).push(kitFn.array([ name, city, country ]).join(" ")) : city ? kitFn.array(query).push(kitFn.array([ name, city ]).join(" ")) : country && kitFn.array(query).push(kitFn.array([ name, country ]).join(" "));
                    kitFn.array(query).push(name);
                    kitFn.setParam("dateIn", obj.gtmArrivalDate, profile);
                    kitFn.setParam("dateOut", obj.gtmDepartureDate, profile);
                    kitFn.setParam("adults", obj.gtmTotalGuestCount, profile);
                    kitFn.setParam("dayCount", obj.gtmTotalGuestCount, profile);
                  }
                });
                kitFn.setType("hotel", profile);
                kitFn.setParam("query", query, profile);
                kitFn.setParam("currency", dataObj.currency, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".rooms tr > td > .averageprice.currency"
          },
          template: "price",
          key: "oneDayPrice"
        }
      }
    }) ]);
    kitFn.addSite("tiket_com", "*://*.tiket.com/*", [ kitFn.details({
      locationCheck: [ /\/hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: ".tipe-kamar"
          },
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            var params = kitFn.parseUrl();
            var room = params.room;
            room || (room = kitFn.dom("#room2").value());
            if (1 === kitFn.parseInt(room)) {
              var name = kitFn.string(kitFn.dom(".head h1").text()).trim().end();
              var query = [ name ];
              var address = kitFn.string(kitFn.dom('.head span[itemprop="address"]').text()).trim().end();
              address && kitFn.array(query).unshift(name + " " + address);
              var place = kitFn.exec(kitFn.getTitle(), /\(([^)]+)\)/);
              place = place && kitFn.string(place[1]).trim().end();
              place && kitFn.array(query).unshift(name + " " + place);
              kitFn.setParam("query", query, profile);
              var dateIn = params.startdate;
              dateIn || (dateIn = kitFn.dom("#hotelcheckin2").value());
              kitFn.setParam("dateIn", dateIn, profile);
              var dateOut = null;
              params.startdate && params.night && (dateOut = kitFn.getDateAfterDays(params.startdate, params.night));
              dateOut || (dateOut = kitFn.dom("#hotelcheckout2").value());
              kitFn.setParam("dateOut", dateOut, profile);
              var adult = params.adult;
              adult || (adult = kitFn.dom("#adult2").value());
              kitFn.setParam("adults", adult, profile);
              var ccy = kitFn.string(kitFn.dom(".nav .dropdown > a").text()).trim().end();
              kitFn.setParam("currency", ccy, profile);
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".tipe-kamar .price > .currency"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("hotelsclick_com", "*://*.hotelsclick.com/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: {
            css: [ ".cnt.hotel li.room" ]
          },
          cb: function(profile) {
            var roomTypeAdultMap = {
              DBC: 3,
              DBL: 2,
              EXTRA: 1,
              JRS: 2,
              QUD: 4,
              SGL: 1,
              STR: 2,
              TRC: 4,
              TRP: 3,
              TSU: 1,
              TWC: 3,
              TWN: 2
            };
            var roomType = kitFn.dom('select[name="roomtype"]').value();
            var rooms = kitFn.dom('input[name="rooms"]').value() || 1;
            var adults = kitFn.object(roomTypeAdultMap).prop(roomType);
            if (adults && 1 == rooms) {
              var dateIn = kitFn.dom('input[name="checkin"]').value();
              var dateOut = kitFn.dom('input[name="checkout"]').value();
              kitFn.setType("hotel", profile);
              var query = [];
              var name = kitFn.string(kitFn.dom('.title_cnt .name h1 span[itemprop="name"]').text()).trim().end();
              if (name) {
                kitFn.array(query).push(name);
                var hotelInfo = kitFn.string(kitFn.dom(".title_cnt .address > a").text()).trim().end();
                if (hotelInfo) {
                  var cityCountry = kitFn.array(kitFn.string(hotelInfo).split("-")).slice(-1).get(0);
                  cityCountry && kitFn.array(query).unshift(name + " " + cityCountry);
                }
              }
              var currency = kitFn.dom('input[name="currency"]').value();
              kitFn.setParam("query", query, profile);
              kitFn.setParam("dateIn", dateIn, profile);
              kitFn.setParam("dateOut", dateOut, profile);
              kitFn.setParam("adults", adults, profile);
              kitFn.setParam("currency", currency, profile);
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".cnt.hotel li.room li.total > span"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("hotelscombined_com", "*://*.hotelscombined.com/*", [ kitFn.details({
      locationCheck: [ /\/Hotel\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#hc_htl_pm_rates_content"
          },
          cb: function(profile) {
            kitFn.setType("hotel", profile);
            var params = kitFn.parseUrl();
            if (1 == params.Rooms) {
              var name = kitFn.string(kitFn.dom("h1.hc_htl_intro_name").text()).trim().end();
              var query = [ name ];
              var place = kitFn.exec(kitFn.dom("head").html(), /HC\.Affiliate\.setCurrentPlaceName\('([^']+)'\)/);
              place = place && place[1];
              place && kitFn.array(query).unshift(name + " " + place);
              kitFn.setParam("query", query, profile);
              kitFn.setParam("dateIn", params.checkin, profile);
              kitFn.setParam("dateOut", params.checkout, profile);
              kitFn.setParam("adults", params.adults_1, profile);
              return kitFn.getParamsFromPage({
                currency: "HC.gCurrencyCode"
              }).then(function(dataObj) {
                kitFn.setParam("currency", dataObj.currency || params.currencyCode, profile);
              });
            }
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#hc_htl_pm_rates_content #TotalLink"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("airasia_com", "*://booking.airasia.com/*", [ kitFn.details({
      locationCheck: [ /\/Flight\// ],
      formWatcher: {
        ctr: {
          query: {
            css: "#availabilityForm"
          },
          cb: function(profile) {
            var params = kitFn.parseUrl();
            kitFn.setType("avia", profile);
            if (!params.dd3) {
              kitFn.setParam("origin", params.o1, profile);
              kitFn.setParam("destination", params.d1, profile);
              var currentDate = kitFn.getCurrentDate();
              var dateStart = params.dd1;
              dateStart < currentDate && (dateStart = currentDate);
              kitFn.setParam("dateStart", dateStart, profile);
              var dateEnd = params.dd2;
              dateEnd && dateEnd < dateStart && (dateEnd = dateStart);
              kitFn.setParam("dateEnd", dateEnd, profile);
              return kitFn.getParamsFromPage({
                currency: "currencyCodeJson.userCurrency"
              }).then(function(dataObj) {
                kitFn.setParam("currency", params.cc || dataObj.currency, profile);
              });
            }
          }
        }
      },
      priceWatcher: {
        minPriceOut: {
          query: {
            css: "#availabilityForm .avail-fare.depart .avail-fare-price"
          },
          template: "price",
          key: "minPriceOut"
        },
        minPriceIn: {
          query: {
            css: "#availabilityForm .avail-fare.return .avail-fare-price"
          },
          template: "price",
          key: "minPriceIn"
        }
      }
    }) ]);
    kitFn.addSite("ryanair_com", "*://*.ryanair.com/*", [ kitFn.details({
      formWatcher: {
        changePage: {
          query: {
            css: ".flight-list",
            is: "removed"
          },
          cb: function(profile) {
            kitFn.log("page change!");
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        },
        ctr: {
          query: {
            css: ".flight-list"
          },
          cb: function(profile) {
            return kitFn.getParamsFromPage({
              searchCityPair: "dataLayer.searchCityPair",
              searchDepartureDate: "dataLayer.searchDepartureDate",
              searchArrivalDate: "dataLayer.searchArrivalDate",
              currency: "dataLayer.currency"
            }).then(function(dataObj) {
              var origin = "";
              var destination = "";
              var pairs = kitFn.string(dataObj.searchCityPair).split(">");
              if (3 === pairs.length) {
                if (pairs[2] === pairs[0]) {
                  origin = pairs[0];
                  destination = pairs[1];
                }
              } else if (2 === pairs.length) {
                origin = pairs[0];
                destination = pairs[1];
              }
              var dateStart = kitFn.matchTemplate(dataObj.searchDepartureDate, /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
              var dateEnd = kitFn.matchTemplate(dataObj.searchArrivalDate, /(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
              var currency = dataObj.currency;
              currency === !1 && (currency = "EUR");
              kitFn.setType("avia", profile);
              kitFn.setParam("origin", origin, profile);
              kitFn.setParam("destination", destination, profile);
              kitFn.setParam("dateStart", dateStart, profile);
              kitFn.setParam("dateEnd", dateEnd, profile);
              kitFn.setParam("currency", currency, profile);
            });
          }
        }
      },
      priceWatcher: {
        minPriceOut: {
          query: {
            css: '.flight-list div[type="outbound"] + .flight-list-wrapper span.flights-table-price__price'
          },
          template: "price",
          key: "minPriceOut"
        },
        minPriceIn: {
          query: {
            css: '.flight-list div[type="inbound"] + .flight-list-wrapper span.flights-table-price__price'
          },
          template: "price",
          key: "minPriceIn"
        }
      }
    }) ]);
    kitFn.addSite("avis_com", "*://*.avis.*/*", [ kitFn.details({
      locationCheck: [ /avis\.com\/(.+\/)?reservation/ ],
      formWatcher: {
        changePage: {
          query: {
            css: ".vehicle-availability .container-fluid .step2dtl",
            is: "removed"
          },
          cb: function(profile) {
            kitFn.log("page change!");
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        },
        ctr: {
          query: {
            css: ".vehicle-availability .container-fluid .step2dtl",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setType("cars", profile);
            return kitFn.getParamsFromPage({
              reservationModel: "sessionStorage.ngStorage-reservationModel"
            }).then(function(dataObj) {
              var obj = kitFn.jsonParse(dataObj.reservationModel);
              if (null !== obj) {
                kitFn.setParam("pickUpLocationId", obj.pickInfo, profile);
                var pickUpDate = obj.pickUpDate + "T" + kitFn.convertTime12to24(obj.pickUpTime);
                kitFn.setParam("pickUpDate", pickUpDate, profile);
                kitFn.setParam("dropOffLocationId", obj.dropInfo, profile);
                var dropOffDate = obj.dropDate + "T" + kitFn.convertTime12to24(obj.dropTime);
                kitFn.setParam("dropOffDate", dropOffDate, profile);
                kitFn.setParam("driverAge", obj.personalInfoRQ.age, profile);
                var currency = kitFn.dom('a[ng-bind="vm.userCurrency"]').text();
                kitFn.setParam("currency", obj.userSelectedCurrency || currency, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".row.avilablecar.available-car-box .payamntr"
          },
          template: "price"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom(".navbar.navbar-fixed-top").style("top", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom(".navbar.navbar-fixed-top").style("top", 0);
      }
    }), kitFn.details({
      locationCheck: [ /&return-search=/ ],
      formWatcher: {
        ctr: {
          query: {
            css: ".search-results-wrapper",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setType("cars", profile);
            var params = kitFn.parseUrl();
            var hireLocation = params["hire-location"];
            var returnLocation = params["return-location"] || hireLocation;
            var dateFrom = params["date-from"];
            var timeFrom = params["time-from"];
            var dateTo = params["date-to"];
            var timeTo = params["time-to"];
            var age = 30;
            kitFn.setParam("pickUpLocationId", hireLocation, profile);
            var pickUpDate = kitFn.matchTemplate(dateFrom + "T" + timeFrom, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2})(\d{2})/, "$3-$2-$1T$4:$5");
            kitFn.setParam("pickUpDate", pickUpDate, profile);
            kitFn.setParam("dropOffLocationId", returnLocation, profile);
            var dropOffDate = kitFn.matchTemplate(dateTo + "T" + timeTo, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2})(\d{2})/, "$3-$2-$1T$4:$5");
            kitFn.setParam("dropOffDate", dropOffDate, profile);
            kitFn.setParam("driverAge", age, profile);
            var currency = kitFn.findCurrency(kitFn.dom(".car-result-module.type-car .price").text());
            kitFn.setParam("currency", currency, profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".search-results-wrapper .car-result-module.type-car .price"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("budget_com", "*://*.budget.com/*", [ kitFn.details({
      locationCheck: [ /\/home\.ex|\/reservation/ ],
      formWatcher: {
        ctr: {
          query: {
            css: ".row.available-car-box"
          },
          cb: function(profile) {
            kitFn.setType("cars", profile);
            return kitFn.getParamsFromPage({
              reservationModel: "sessionStorage.ngStorage-reservationModel"
            }).then(function(dataObj) {
              var info = kitFn.jsonParse(dataObj.reservationModel);
              if (info) {
                kitFn.setParam("pickUpLocationId", info.pickInfo, profile);
                kitFn.setParam("dropOffLocationId", info.dropInfo || info.pickInfo, profile);
                info.personalInfoRQ && kitFn.setParam("driverAge", info.personalInfoRQ.age, profile);
                if (info.userSelectedCurrency) kitFn.setParam("currency", info.userSelectedCurrency, profile); else {
                  var ccy = kitFn.dom('a[ng-bind="vm.userCurrency"]').text();
                  kitFn.setParam("currency", ccy, profile);
                }
                var pickUpTime = kitFn.convertTime12to24(info.pickUpTime);
                var pickUpDate = info.pickUpDate;
                pickUpDate && pickUpTime && kitFn.setParam("pickUpDate", pickUpDate + "T" + pickUpTime, profile);
                var dropOffTime = kitFn.convertTime12to24(info.dropTime);
                var dropOffDate = info.dropDate;
                dropOffTime && dropOffDate && kitFn.setParam("dropOffDate", dropOffDate + "T" + dropOffTime, profile);
              } else kitFn.pageClear(profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: ".row.available-car-box .payamntr"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("wizzair_com", "*://*.wizzair.com/*", [ kitFn.details({
      formWatcher: {
        ctr: {
          query: {
            css: "#booking-flow-step-select-flight",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setType("avia", profile);
            var data = kitFn.matchUrl(/\/booking\/select-flight\/([A-Z]{3})\/([A-Z]{3})\/(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2}|null)\/(\d+)\/(\d+)\/(\d+)/);
            if (data) {
              kitFn.setParam("origin", data[1], profile);
              kitFn.setParam("destination", data[2], profile);
              kitFn.setParam("dateStart", data[3], profile);
              var dateEnd = data[4];
              "null" === dateEnd && (dateEnd = null);
              kitFn.setParam("dateEnd", dateEnd, profile);
              var dateStartInput = kitFn.dom("#fare-selector-outbound .js-selected input.booking-flow__flight-select__chart__day__input").value();
              var dateEndInput = kitFn.dom("#fare-selector-return .js-selected input.booking-flow__flight-select__chart__day__input").value();
              dateStartInput && kitFn.setParam("dateStart", dateStartInput, profile);
              dateEndInput && kitFn.setParam("dateEnd", dateEndInput, profile);
            }
          }
        },
        ccy: {
          query: {
            css: ".fare__price__current",
            is: "added"
          },
          cb: function(profile, summary) {
            var dateStartInput = kitFn.dom("#fare-selector-outbound .js-selected input.booking-flow__flight-select__chart__day__input").value();
            var dateEndInput = kitFn.dom("#fare-selector-return .js-selected input.booking-flow__flight-select__chart__day__input").value();
            dateStartInput && kitFn.setParam("dateStart", dateStartInput, profile);
            dateEndInput && kitFn.setParam("dateEnd", dateEndInput, profile);
            var ccy = null;
            kitFn.array(summary.added).some(function(node) {
              ccy = kitFn.findCurrency(node.textContent);
              return ccy;
            });
            ccy && kitFn.setParam("currency", ccy, profile);
          }
        },
        changePage: {
          query: {
            css: "#booking-flow-step-select-flight",
            is: "removed"
          },
          cb: function(profile) {
            kitFn.log("page change!");
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        }
      },
      priceWatcher: {
        priceOut: {
          query: {
            css: "#fare-selector-outbound .fare__price__current"
          },
          template: "price",
          key: "minPriceOut"
        },
        priceIn: {
          query: {
            css: "#fare-selector-return .fare__price__current"
          },
          template: "price",
          key: "minPriceIn"
        }
      },
      onShow: function(barHeight) {
        kitFn.dom("aside.booking-flow__itinerary").style("top", barHeight + "px");
        kitFn.dom("div.booking-flow__sticky-header").style("top", barHeight + "px");
      },
      onHide: function() {
        kitFn.dom("aside.booking-flow__itinerary").style("top", 0);
        kitFn.dom("div.booking-flow__sticky-header").style("top", 0);
      }
    }) ]);
    kitFn.addSite("emirates_com", "*://*.emirates.com/*", [ kitFn.details({
      locationCheck: [ /\/SelectPrice\.aspx/ ],
      formWatcher: {
        ctr: {
          query: {
            css: "#ctl00_c_dvOBBResult"
          },
          cb: function(profile) {
            kitFn.setType("avia", profile);
            return kitFn.getParamsFromPage({
              dataLayer: "dataLayer",
              dateStart: "flightDateOutIBE",
              dateEnd: "flightDateBackIBE"
            }).then(function(dataObj) {
              var info = null;
              kitFn.array(dataObj.dataLayer).some(function(item) {
                if (item.flightRoute) {
                  info = item;
                  return !0;
                }
              });
              if (info) {
                if (kitFn.array(kitFn.string(info.flightRoute).split("-")).len() > 3) return;
                var dateEnd = dataObj.dateEnd;
                dataObj.dateStart === dateEnd && (dateEnd = null);
                kitFn.setParam("origin", info.originSearchIBE, profile);
                kitFn.setParam("destination", info.destinationSearchIBE, profile);
                kitFn.setParam("dateStart", dataObj.dateStart, profile);
                kitFn.setParam("dateEnd", dateEnd, profile);
                kitFn.setParam("currency", info.pooFlightCurrencyCode, profile);
              }
            });
          }
        }
      },
      priceWatcher: {
        minPriceOut: {
          query: {
            css: ".flight-list.outbound-list .flight-fares-content .flight-fares-table .curr-only"
          },
          template: "price",
          key: "minPriceOut"
        },
        minPriceIn: {
          query: {
            css: ".flight-list.inbound-list .flight-fares-content .flight-fares-table .curr-only"
          },
          template: "price",
          key: "minPriceIn"
        }
      }
    }) ]);
    kitFn.addSite("delta_com", "*://*.delta.com/*", [ kitFn.details({
      locationCheck: [ /\/air-shopping\/findFlights\.action/ ],
      formWatcher: {
        ctr: {
          query: {
            css: "#_fareDisplayContainer_tmplHolder"
          },
          cb: function(profile) {
            kitFn.setType("avia", profile);
            return kitFn.getParamsFromPage({
              origin: "delta.airShopping.originCode",
              destination: "delta.airShopping.destinationCode",
              dateStart: "delta.airShopping.originDate",
              dayCount: "delta.airShopping.differenceInDays",
              tripType: "delta.airShopping.tripType"
            }).then(function(dataObj) {
              if (kitFn.array([ "ROUND_TRIP", "ONE_WAY" ]).indexOf(dataObj.tripType) !== -1) {
                kitFn.setParam("origin", dataObj.origin, profile);
                kitFn.setParam("destination", dataObj.destination, profile);
                kitFn.setParam("dateStart", dataObj.dateStart, profile);
                "ROUND_TRIP" === dataObj.tripType && kitFn.setParam("dateEnd", kitFn.getDateAfterDays(dataObj.dateStart, dataObj.dayCount), profile);
              } else kitFn.log("Unsupported type");
            });
          }
        },
        ccy: {
          query: {
            css: "#redeemMilesToggle"
          },
          cb: function(profile) {
            var btn = kitFn.dom('#redeemMilesToggle label.btn.checked[for="revenueSearch"]').text();
            var m = kitFn.exec(btn, /([A-Z]{3})/);
            m && kitFn.setParam("currency", m[1], profile);
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#_fareDisplayContainer_tmplHolder .tableHeaderHolderFare .priceHolder"
          },
          template: "price"
        }
      }
    }) ]);
    kitFn.addSite("hertz_com", "*://*.hertz.com/*", [ kitFn.details({
      locationCheck: [ /\/rentacar\/reservation\// ],
      formWatcher: {
        changePage: {
          query: [ {
            css: "#itn-location",
            is: "added"
          } ],
          cb: function(profile) {
            kitFn.closeCurrentBar();
            kitFn.pageClear(profile);
          }
        },
        ctr: {
          query: {
            css: "#res-vehicles-page"
          },
          cb: function(profile) {
            kitFn.setType("cars", profile);
            return kitFn.getParamsFromPage({
              pickup_date: "htz.homepage.json.data.model.formData.pickupDay",
              pickup_time: "htz.homepage.json.data.model.formData.pickupTime",
              return_date: "htz.homepage.json.data.model.formData.dropoffDay",
              return_time: "htz.homepage.json.data.model.formData.dropoffTime",
              pickup_location: "htz.homepage.json.data.model.formData.pickupHiddenEOAG",
              return_location: "htz.homepage.json.data.model.formData.dropoffHiddenEOAG",
              age: "htz.homepage.json.data.model.formData.ageSelector",
              militaryClock: "htz.homepage.json.data.model.formData.militaryClock"
            }).then(function(dataObj) {
              kitFn.setParam("pickUpLocationId", kitFn.string(dataObj.pickup_location).substr(0, 3).end(), profile);
              var pickUpDate = dataObj.pickup_date + "T" + dataObj.pickup_time;
              var dropOffDate = dataObj.return_date + "T" + dataObj.return_time;
              if (dataObj.militaryClock) {
                pickUpDate = kitFn.matchTemplate(pickUpDate, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2}):(\d{2})/, "$3-$2-$1T$4:$5");
                dropOffDate = kitFn.matchTemplate(dropOffDate, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2}):(\d{2})/, "$3-$2-$1T$4:$5");
              } else {
                pickUpDate = kitFn.matchTemplate(pickUpDate, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2}):(\d{2})/, "$3-$1-$2T$4:$5");
                dropOffDate = kitFn.matchTemplate(dropOffDate, /(\d{2})\/(\d{2})\/(\d{4})T(\d{2}):(\d{2})/, "$3-$1-$2T$4:$5");
              }
              kitFn.setParam("pickUpDate", pickUpDate, profile);
              var return_location = dataObj.return_location;
              return_location || (return_location = dataObj.pickup_location);
              kitFn.setParam("dropOffLocationId", kitFn.string(return_location).substr(0, 3).end(), profile);
              kitFn.setParam("dropOffDate", dropOffDate, profile);
              kitFn.setParam("driverAge", dataObj.age, profile);
            });
          }
        },
        ccy: {
          query: {
            css: "#res-vehicles-page .price-wrapper",
            is: "added"
          },
          cb: function(profile, summary) {
            var currentCcy = kitFn.getParam("currency", profile);
            !currentCcy && kitFn.array(summary.added).some(function(node) {
              var ccy = kitFn.dom(node).find(".price + span").text();
              if (ccy) {
                kitFn.setParam("currency", ccy, profile);
                return !0;
              }
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#res-vehicles-page .price-wrapper",
            is: "added"
          },
          cb: function(profile, summary) {
            kitFn.array(summary.added).forEach(function(node) {
              var isRate = kitFn.dom(node).find(".rate").len();
              var approxTotalPriceNode = kitFn.dom(node).find(".approx-total-price").text();
              var price = "";
              price = isRate && approxTotalPriceNode ? kitFn.preparePrice(approxTotalPriceNode) : kitFn.preparePrice(kitFn.dom(node).find(".price").text());
              var ccy = kitFn.dom(node).find(".price + span").text();
              price && ccy && kitFn.getParam("currency", profile) === ccy && kitFn.setPrice("price", price, profile);
            });
          }
        }
      }
    }) ]);
    kitFn.addSite("europcar_com", "*://*.europcar.com/*", [ kitFn.details({
      locationCheck: [ /\/DotcarClient\/step2\.action/ ],
      formWatcher: {
        ctr: {
          query: {
            css: "#contents .main-content",
            is: "added"
          },
          cb: function(profile) {
            kitFn.setType("cars", profile);
            return kitFn.getParamsFromPage({
              pickup_date: "tc_vars.select_checkout_date",
              pickup_time: "tc_vars.select_checkout_time",
              return_date: "tc_vars.select_checkin_date",
              return_time: "tc_vars.select_checkin_time",
              pickup_location: "tc_vars.select_checkout_station_code",
              return_location: "tc_vars.select_checkin_station_code"
            }).then(function(dataObj) {
              kitFn.setParam("pickUpLocationId", kitFn.string(dataObj.pickup_location).substr(0, 3).end(), profile);
              var pickUpDate = kitFn.matchTemplate(dataObj.pickup_date + "T" + dataObj.pickup_time, /(\d{4})(\d{2})(\d{2})T(\d{2})h(\d{2})/, "$1-$2-$3T$4:$5");
              kitFn.setParam("pickUpDate", pickUpDate, profile);
              var return_location = dataObj.return_location;
              return_location || (return_location = dataObj.pickup_location);
              kitFn.setParam("dropOffLocationId", kitFn.string(return_location).substr(0, 3).end(), profile);
              var dropOffDate = kitFn.matchTemplate(dataObj.return_date + "T" + dataObj.return_time, /(\d{4})(\d{2})(\d{2})T(\d{2})h(\d{2})/, "$1-$2-$3T$4:$5");
              kitFn.setParam("dropOffDate", dropOffDate, profile);
              var age = kitFn.dom('select[name="driverAge"]').value();
              age > 26 && (age = 26);
              kitFn.setParam("driverAge", age, profile);
              var ccy = null;
              kitFn.dom().getAll(".vehicle-block .price-info .price").some(function(node) {
                var m = kitFn.exec(kitFn.dom(node).text(), /([A-Z]{3})/);
                if (m) {
                  ccy = m[1];
                  return !0;
                }
              });
              kitFn.setParam("currency", ccy, profile);
            });
          }
        }
      },
      priceWatcher: {
        price: {
          query: {
            css: "#contents .main-content ul .vehicle-block .price-info .price"
          },
          template: "price"
        }
      }
    }) ]);
    module.exports = function() {
      return kitFn.getSitePatternObj();
    };
  }, function(module, exports, __webpack_require__) {
    (function(utils, tbr, Promise) {
      "use strict";
      var kitFn = {};
      kitFn.setType = function(type, profile) {
        profile.page.setType(type);
      };
      kitFn.setParam = function(type, value, profile) {
        profile.page.set(type, value);
      };
      kitFn.getParam = function(type, profile) {
        return profile.page.get(type);
      };
      kitFn.setPrice = function(type, value, profile) {
        profile.page.setPrice(type, value);
      };
      kitFn.pageClear = function(profile) {
        profile.page.clear();
      };
      kitFn.preparePrice = function(str) {
        return utils.preparePrice(str);
      };
      kitFn.getParamsFromPage = function(params) {
        return utils.getParamsFromPage(params);
      };
      kitFn.locationCheck = function(reList) {
        Array.isArray(reList) || (reList = [ reList ]);
        return function(url) {
          return reList.some(function(re) {
            return re.test(url);
          });
        };
      };
      kitFn.domWatcher = function(prop) {
        return prop;
      };
      kitFn.details = function(prop) {
        var result = {};
        for (var key in prop) "locationCheck" === key ? result[key] = kitFn.locationCheck(prop[key]) : "formWatcher" === key || "priceWatcher" === key ? result[key] = kitFn.domWatcher(prop[key]) : result[key] = prop[key];
        return result;
      };
      kitFn.parseUrl = function(url, paramsRe, sep) {
        if (url && "string" != typeof url) {
          sep = paramsRe;
          paramsRe = url;
          url = null;
        }
        return utils.parseUrl(url || location.href, {
          sep: sep,
          paramsRe: paramsRe
        });
      };
      kitFn.matchUrl = function(re) {
        return re.exec(location.href);
      };
      kitFn.testUrl = function(re) {
        return re.test(location.href);
      };
      kitFn.dom = function(node) {
        var DomWrapResult = function(elements) {
          var self = this;
          this.style = function(prop, value) {
            elements.forEach(function(element) {
              element.style[prop] = value;
            });
            return self;
          };
          this.remove = function(selector) {
            elements = elements.map(function(element) {
              return element.cloneNode(!0);
            });
            elements.forEach(function(element) {
              [].slice.call(element.querySelectorAll(selector)).forEach(function(node) {
                node.parentNode.removeChild(node);
              });
            });
            return self;
          };
          this.filter = function(fn) {
            elements.filter(fn);
            return self;
          };
          this.getAll = function(selector) {
            elements = [].slice.call(document.querySelectorAll(selector));
            return self;
          };
          this.get = function(selector) {
            elements.splice(0);
            var element = document.querySelector(selector);
            element && elements.push(element);
            return self;
          };
          this.wrap = function(node) {
            node.nodeType ? elements = [ node ] : node.length && (elements = [].slice.call(node));
            return self;
          };
          this.find = function(selector) {
            var result = [];
            elements.some(function(element) {
              var node = element.querySelector(selector);
              node && result.push(node);
              return !0;
            });
            elements = result;
            return self;
          };
          this.findAll = function(selector) {
            var result = [];
            elements.some(function(element) {
              result = [].slice.call(element.querySelectorAll(selector));
              return !0;
            });
            elements = result;
            return self;
          };
          this.forEach = function(fn) {
            elements.forEach(fn);
          };
          this.some = function(fn) {
            return elements.some(fn);
          };
          this.value = function() {
            var value = "";
            elements.some(function(element) {
              value = element.value;
              return !0;
            });
            return value;
          };
          this.childText = function() {
            var strings = [];
            elements.forEach(function(element) {
              var childNode, i = 0;
              for (;childNode = element.childNodes[i]; ) {
                i++;
                3 === childNode.nodeType && strings.push(childNode.textContent);
              }
            });
            return strings;
          };
          this.html = function() {
            var value = "";
            elements.some(function(element) {
              value = element.innerHTML;
              return !0;
            });
            return value;
          };
          this.text = function() {
            var value = "";
            elements.some(function(element) {
              value = element.textContent;
              return !0;
            });
            return value;
          };
          this.len = function() {
            return elements.length;
          };
          this.data = function(prop) {
            var value;
            elements.some(function(element) {
              value = element.dataset[prop];
              return !0;
            });
            return value;
          };
          this.prop = function(prop) {
            var value;
            elements.some(function(element) {
              value = element[prop];
              return !0;
            });
            return value;
          };
          this.attr = function(prop) {
            var value;
            elements.some(function(element) {
              value = element.getAttribute(prop);
              return !0;
            });
            return value;
          };
          this.css = function(prop) {
            var value, computed;
            elements.some(function(element) {
              computed = window.getComputedStyle(element);
              if (computed) {
                value = computed.getPropertyValue(prop) || computed[prop];
                void 0 !== value && (value = "" + value);
              }
              return !0;
            });
            return value;
          };
          this.end = function() {
            return elements;
          };
        };
        return "string" == typeof node ? new DomWrapResult([]).get(node) : node ? new DomWrapResult([]).wrap(node) : new DomWrapResult([]);
      };
      kitFn.string = function(string) {
        var StringWrapResult = function(string) {
          var self = this;
          "string" != typeof string && (string = "");
          this.replace = function(re, pattern) {
            string = string.replace(re, pattern);
            return self;
          };
          this.slice = function(beginSlice, endSlice) {
            string = string.slice(beginSlice, endSlice);
            return self;
          };
          this.substr = function(start, len) {
            string = string.substr(start, len);
            return self;
          };
          this.trim = function() {
            string = string.trim();
            return self;
          };
          this.toUpperCase = function() {
            string = string.toUpperCase();
            return self;
          };
          this.toLowerCase = function() {
            string = string.toLowerCase();
            return self;
          };
          this.charAt = function(index) {
            string = string.charAt(index);
            return self;
          };
          this.search = function(re) {
            return string.search(re);
          };
          this.match = function(re) {
            return string.match(re);
          };
          this.indexOf = function(value, index) {
            return string.indexOf.apply(string, arguments);
          };
          this.lastIndexOf = function(value, index) {
            return string.lastIndexOf.apply(string, arguments);
          };
          this.split = function(str, limit) {
            return string.split(str, limit);
          };
          this.charCodeAt = function(index) {
            return string.charCodeAt(index);
          };
          this.end = function() {
            return string;
          };
          this.len = function() {
            return string.length;
          };
        };
        return new StringWrapResult(string);
      };
      kitFn.array = function(array) {
        var ArrayWrapResult = function(array) {
          var self = this;
          Array.isArray(array) || (array = null);
          this.slice = function(begin, end) {
            array && (array = array.slice(begin, end));
            return self;
          };
          this.splice = function(start, deleteCount) {
            array && (array = array.splice.apply(array, arguments));
            return self;
          };
          this.filter = function(fn) {
            array && (array = array.filter(fn));
            return self;
          };
          this.reverse = function() {
            array && array.reverse();
            return self;
          };
          this.sort = function(fn) {
            array && array.sort(fn);
            return self;
          };
          this.concat = function() {
            array && (array = array.concat.apply(array, arguments));
            return self;
          };
          this.map = function(fn) {
            array && (array = array.map(fn));
            return self;
          };
          this.pop = function() {
            var result = null;
            array && (result = array.pop());
            return result;
          };
          this.push = function(value) {
            var result = null;
            array && (result = array.push.apply(array, arguments));
            return result;
          };
          this.shift = function() {
            var result = null;
            array && (result = array.shift());
            return result;
          };
          this.unshift = function(value) {
            var result = null;
            array && (result = array.unshift.apply(array, arguments));
            return result;
          };
          this.forEach = function(fn) {
            array && array.forEach(fn);
          };
          this.some = function(fn) {
            var result = null;
            array && (result = array.some(fn));
            return result;
          };
          this.every = function(fn) {
            var result = null;
            array && (result = array.every(fn));
            return result;
          };
          this.join = function(str) {
            var result = null;
            array && (result = array.join(str));
            return result;
          };
          this.indexOf = function(str, index) {
            var result = null;
            array && (result = array.indexOf.apply(array, arguments));
            return result;
          };
          this.lastIndexOf = function(str, index) {
            var result = null;
            array && (result = array.lastIndexOf.apply(array, arguments));
            return result;
          };
          this.get = function(index) {
            var result = null;
            Array.isArray(array) && (result = array[index]);
            return result;
          };
          this.len = function() {
            var result = null;
            array && (result = array.length);
            return result;
          };
          this.end = function() {
            return array;
          };
        };
        return new ArrayWrapResult(array);
      };
      kitFn.object = function(object) {
        var ObjectWrapResult = function(object) {
          "object" != typeof object && (object = null);
          this.keys = function() {
            if (object && "object" == typeof object) return Object.keys(object);
          };
          this.prop = function(prop) {
            if (object && "object" == typeof object) return object[prop];
          };
          this.end = function() {
            return object;
          };
        };
        return new ObjectWrapResult(object);
      };
      kitFn.matchTemplate = function(str, re, pattern) {
        return utils.reFormatDate(str, re, pattern);
      };
      kitFn.match = function(value, re) {
        var result = null;
        "string" == typeof value && (result = value.match(re));
        return result;
      };
      kitFn.exec = function(value, re) {
        return re.exec(value);
      };
      kitFn.test = function(value, re) {
        return re.test(value);
      };
      kitFn.normalizeDate = function(year, month, date, details) {
        return utils.normalizeDate(year, month, date, details);
      };
      kitFn.closeCurrentBar = function() {
        tbr.main.watcher.closeCurrentBar();
      };
      kitFn.log = function() {
        tbr.log.apply(null, arguments);
      };
      kitFn.error = function() {
        tbr.error.apply(null, arguments);
      };
      kitFn.getPageScript = function(str, re) {
        return utils.getPageScript(str, re);
      };
      kitFn.findJson = function(str, re) {
        return utils.findJson(str, re);
      };
      kitFn.parseInt = function(str) {
        return parseInt(str);
      };
      kitFn.parseFloat = function(value) {
        return parseFloat(value);
      };
      kitFn.isNaN = function(value) {
        return isNaN(value);
      };
      kitFn.getTitle = function() {
        return document.title;
      };
      kitFn.getUrl = function() {
        return location.href;
      };
      kitFn.getDateAfterDays = function(date, days) {
        return utils.getDateAfterDays(date, days);
      };
      kitFn.getCurrentDate = function() {
        return utils.getCurrentDate();
      };
      kitFn.convertTime12to24 = function(value) {
        return utils.convertTime12to24(value);
      };
      kitFn.jsonParse = function(value) {
        var result = null;
        try {
          result = JSON.parse(value);
        } catch (e) {}
        return result;
      };
      kitFn.jsonStringify = function(object) {
        return JSON.stringify(object);
      };
      kitFn.findCurrency = function(value) {
        return utils.findCurrency(value);
      };
      var siteIdDetails = {};
      var sitePatternDetails = {};
      kitFn.addSite = function(id, patternList, details) {
        siteIdDetails[id] = details;
        Array.isArray(patternList) || (patternList = [ patternList ]);
        patternList.forEach(function(pattern) {
          sitePatternDetails[pattern] = function() {
            return details;
          };
        });
      };
      kitFn.getSitePatternObj = function() {
        return sitePatternDetails;
      };
      kitFn.getSiteIdObj = function() {
        return siteIdDetails;
      };
      kitFn.pause = function(timeout) {
        return new Promise(function(resolve) {
          setTimeout(resolve, timeout);
        });
      };
      kitFn.waitUntil = function(condition, timeout, interval) {
        timeout || (timeout = 500);
        interval || (interval = 500);
        var isTimeout = !1;
        var timeoutTimer = setTimeout(function() {
          isTimeout = !0;
        }, timeout);
        var check = function() {
          return new Promise(function(resolve) {
            resolve(condition());
          }).catch(function(err) {
            tbr.error("waitUntil condition error", err);
          }).then(function(result) {
            if (result || isTimeout) {
              clearTimeout(timeoutTimer);
              return result;
            }
            return new Promise(function(resolve) {
              setTimeout(resolve, interval);
            }).then(check);
          });
        };
        return check();
      };
      kitFn.getVersion = function() {
        return 2;
      };
      module.exports = kitFn;
    }).call(exports, __webpack_require__(2), __webpack_require__(8), __webpack_require__(26));
  }, function(module, exports, __webpack_require__) {
    var kit = function(commands) {
      var kitFn = __webpack_require__(23);
      var skipResult = {};
      var commandAction = {
        return: function(scope, command, _value) {
          command && (_value = command.value);
          var result;
          void 0 !== _value && (result = runCommand(scope, _value));
          return scope.return = result;
        },
        "{}": function(scope, command, _prop) {
          command && (_prop = command.prop);
          var result = {};
          for (var key in _prop) result[key] = runCommand(scope, _prop[key]);
          return result;
        },
        "[]": function(scope, command, __values) {
          command && (__values = command.values);
          var result = [];
          if (__values) for (var i = 0, len = __values.length; i < len; i++) result.push(runCommand(scope, __values[i]));
          return result;
        },
        function: function(scope, command, name, __args, _statement) {
          if (command) {
            _statement = command.statement;
            name = command.name;
            __args = command.args || [];
          } else {
            var args = [].slice.call(arguments, 2);
            _statement = args.pop();
            __args = args.pop();
            name = args.shift();
          }
          var result = function() {
            var localScope = Object.create(scope);
            localScope.__parent__scope__ = scope;
            for (var i = 0, len = __args.length; i < len; i++) localScope[__args[i]] = arguments[i];
            runCommands(localScope, _statement);
            if (localScope.hasOwnProperty("return")) return localScope.return;
          };
          name && (scope[name] = result);
          return result;
        },
        var: function(scope, command, name, _value) {
          if (command) {
            name = command.name;
            _value = command.value;
          }
          scope[name] = runCommand(scope, _value);
          return skipResult;
        },
        raw: function(scope, command, data) {
          command && (data = command.data);
          return "object" == typeof data ? JSON.parse(JSON.stringify({
            w: data
          })).w : data;
        },
        if: function(scope, command, _condition, _then, _else) {
          if (command) {
            _condition = command.condition;
            _then = command.then;
            _else = command.else;
          }
          var result = skipResult;
          runCommand(scope, _condition) ? result = runCommands(scope, _then) : void 0 !== _else && (result = runCommands(scope, _else));
          return result;
        },
        re: function(scope, command, pattern, flags) {
          if (command) {
            pattern = command.pattern;
            flags = command.flags;
          }
          return new RegExp(pattern, flags);
        },
        setType: function(scope, command, _param, _profile) {
          if (command) {
            _profile = command.profile;
            _param = command.param;
          }
          var profile = runCommand(scope, _profile);
          kitFn.setType(runCommand(scope, _param), profile);
        },
        setParam: function(scope, command, _param, _value, _profile) {
          if (command) {
            _profile = command.profile;
            _param = command.param;
            _value = command.value;
          }
          var profile = runCommand(scope, _profile);
          kitFn.setParam(runCommand(scope, _param), runCommand(scope, _value), profile);
        },
        getParam: function(scope, command, _param, _profile) {
          if (command) {
            _profile = command.profile;
            _param = command.param;
          }
          var profile = runCommand(scope, _profile);
          return kitFn.getParam(runCommand(scope, _param), profile);
        },
        setPrice: function(scope, command, _type, _value, _profile) {
          if (command) {
            _profile = command.profile;
            _type = command.type;
            _value = command.value;
          }
          var profile = runCommand(scope, _profile);
          kitFn.setPrice(runCommand(scope, _type), runCommand(scope, _value), profile);
        },
        pageClear: function(scope, command, _profile) {
          command && (_profile = command.profile);
          var profile = runCommand(scope, _profile);
          kitFn.pageClear(profile);
        },
        preparePrice: function(scope, command, _value) {
          command && (_value = command.value);
          return kitFn.preparePrice(runCommand(scope, _value));
        },
        getParamsFromPage: function(scope, command, _params, __actions) {
          if (command) {
            _params = command.params;
            __actions = command.actions;
          }
          Array.isArray(__actions) && "function" !== __actions[0] || (__actions = [ [ "then", __actions ] ]);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.getParamsFromPage(runCommand(scope, _params));
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(cursor, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        locationCheck: function(scope, command, __reList) {
          command && (__reList = command.re);
          var reList = __reList.map(function(re) {
            return runCommand(scope, re);
          });
          return kitFn.locationCheck(reList);
        },
        domWatcher: function(scope, command, _prop) {
          command && (_prop = command.prop);
          var result = {};
          var item;
          for (var key in _prop) {
            item = _prop[key];
            item.cb && (item.cb = runCommand(scope, item.cb));
            result[key] = item;
          }
          return result;
        },
        details: function(scope, command, _prop) {
          command && (_prop = command.prop);
          var result = {};
          for (var key in _prop) "locationCheck" === key ? result[key] = runCommand(scope, {
            type: "locationCheck",
            re: _prop[key]
          }) : "formWatcher" === key || "priceWatcher" === key ? result[key] = runCommand(scope, {
            type: "domWatcher",
            prop: _prop[key]
          }) : result[key] = runCommand(scope, _prop[key]);
          return result;
        },
        parseUrl: function(scope, command, _url, _paramsRe, _sep) {
          if (command) {
            _url = command.url;
            _paramsRe = command.paramsRe;
            _sep = command.sep;
          }
          var url, paramsRe, sep;
          _url && (url = runCommand(scope, _url));
          _paramsRe && (paramsRe = runCommand(scope, _paramsRe));
          _sep && (sep = runCommand(scope, _sep));
          return kitFn.parseUrl(url, paramsRe, sep);
        },
        matchUrl: function(scope, command, _re) {
          command && (_re = command.re);
          return kitFn.matchUrl(runCommand(scope, _re));
        },
        testUrl: function(scope, command, _re) {
          command && (_re = command.re);
          return kitFn.testUrl(runCommand(scope, _re));
        },
        dom: function(scope, command, _node, __actions) {
          if (command) {
            _node = command.node;
            __actions = command.actions;
          } else {
            var args = [].slice.call(arguments, 2);
            __actions = args.pop();
            _node = args.shift();
          }
          var node;
          _node && (node = runCommand(scope, _node));
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.dom(node);
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(null, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        string: function(scope, command, _value, __actions) {
          if (command) {
            _value = command.value;
            __actions = command.actions;
          }
          var value = runCommand(scope, _value);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.string(value);
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(null, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        array: function(scope, command, _value, __actions) {
          if (command) {
            _value = command.value;
            __actions = command.actions;
          }
          var value = runCommand(scope, _value);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.array(value);
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(null, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        object: function(scope, command, _value, __actions) {
          if (command) {
            _value = command.value;
            __actions = command.actions;
          }
          var value = runCommand(scope, _value);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.object(value);
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(null, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        matchTemplate: function(scope, command, _str, _re, _pattern) {
          if (command) {
            _str = command.str;
            _re = command.re;
            _pattern = command.pattern;
          }
          var str = runCommand(scope, _str);
          var re = runCommand(scope, _re);
          var pattern = runCommand(scope, _pattern);
          return kitFn.matchTemplate(str, re, pattern);
        },
        match: function(scope, command, _value, _re) {
          if (command) {
            _value = command.value;
            _re = command.re;
          }
          return kitFn.match(runCommand(scope, _value), runCommand(scope, _re));
        },
        exec: function(scope, command, _value, _re) {
          if (command) {
            _value = command.value;
            _re = command.re;
          }
          return kitFn.exec(runCommand(scope, _value), runCommand(scope, _re));
        },
        test: function(scope, command, _value, _re) {
          if (command) {
            _value = command.value;
            _re = command.re;
          }
          return kitFn.test(runCommand(scope, _value), runCommand(scope, _re));
        },
        normalizeDate: function(scope, command, _year, _month, _date, _details) {
          if (command) {
            _year = command.year;
            _month = command.month;
            _date = command.date;
            _details = command.details;
          }
          var year = runCommand(scope, _year);
          var month = runCommand(scope, _month);
          var date = runCommand(scope, _date);
          var details = runCommand(scope, _details);
          return kitFn.normalizeDate(year, month, date, details);
        },
        closeCurrentBar: function() {
          kitFn.closeCurrentBar();
        },
        log: function(scope, command) {
          var args;
          args = command ? command.args : [].slice.call(arguments).slice(2);
          kitFn.log.apply(null, args.map(function(arg) {
            return runCommand(scope, arg);
          }));
        },
        error: function(scope, command) {
          var args;
          args = command ? command.args : [].slice.call(arguments).slice(2);
          kitFn.error.apply(null, args.map(function(arg) {
            return runCommand(scope, arg);
          }));
        },
        getPageScript: function(scope, command, _str, _re) {
          if (command) {
            _str = command.str;
            _re = command.re;
          }
          return kitFn.getPageScript(runCommand(scope, _str), runCommand(scope, _re));
        },
        findJson: function(scope, command, _str, _re) {
          if (command) {
            _str = command.str;
            _re = command.re;
          }
          return kitFn.findJson(runCommand(scope, _str), runCommand(scope, _re));
        },
        parseInt: function(scope, command, _value) {
          command && (_value = command.value);
          return kitFn.parseInt(runCommand(scope, _value));
        },
        parseFloat: function(scope, command, _value) {
          command && (_value = command.value);
          return kitFn.parseFloat(runCommand(scope, _value));
        },
        isNaN: function(scope, command, _value) {
          command && (_value = command.value);
          return kitFn.isNaN(runCommand(scope, _value));
        },
        getTitle: function(scope, command) {
          return kitFn.getTitle();
        },
        getUrl: function(scope, command) {
          return kitFn.getUrl();
        },
        getDateAfterDays: function(scope, command, _date, _days) {
          if (command) {
            _date = command.date;
            _days = command.days;
          }
          var date = runCommand(scope, _date);
          var days = runCommand(scope, _days);
          return kitFn.getDateAfterDays(date, days);
        },
        getCurrentDate: function(scope, command) {
          return kitFn.getCurrentDate();
        },
        convertTime12to24: function(scope, command, _value) {
          command && (_value = command.value);
          var value = runCommand(scope, _value);
          return kitFn.convertTime12to24(value);
        },
        jsonParse: function(scope, command, _value) {
          command && (_value = command.value);
          var value = runCommand(scope, _value);
          return kitFn.jsonParse(value);
        },
        jsonStringify: function(scope, command, _value) {
          command && (_value = command.value);
          var value = runCommand(scope, _value);
          return kitFn.jsonStringify(value);
        },
        findCurrency: function(scope, command, _value) {
          command && (_value = command.value);
          var value = runCommand(scope, _value);
          return kitFn.findCurrency(value);
        },
        pause: function(scope, command, _timeout, __actions) {
          if (command) {
            _timeout = command.time;
            __actions = command.actions;
          }
          Array.isArray(__actions) && "function" !== __actions[0] || (__actions = [ [ "then", __actions ] ]);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.pause(runCommand(scope, _timeout));
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(cursor, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        waitUntil: function(scope, command, _condition, _timeout, _interval, __actions) {
          if (command) {
            _condition = command.condition;
            _timeout = command.time;
            _interval = command.interval;
            __actions = command.actions;
          } else {
            var args = [].slice.call(arguments, 2);
            _condition = args.shift();
            __actions = args.pop();
            _timeout = args.shift();
            _interval = args.shift();
          }
          var condition = runCommand(scope, _condition);
          var timeout = runCommand(scope, _timeout);
          var interval = runCommand(scope, _interval);
          Array.isArray(__actions) && "function" !== __actions[0] || (__actions = [ [ "then", __actions ] ]);
          var actions = __actions.slice(0);
          var result, action, cursor = kitFn.waitUntil(condition, timeout, interval);
          for (;action = actions.shift(); ) {
            result = cursor[action[0]].apply(cursor, action.slice(1).map(function(_item) {
              return runCommand(scope, _item);
            }));
            cursor = result;
          }
          return result;
        },
        getVersion: function(scope, command) {
          return kitFn.getVersion();
        }
      };
      var operatorRe = /^([-+=*\/%><!&|^]+|in|instanceof)$/;
      (function() {
        var getVarScope = function(scope, variable) {
          var varScope = scope;
          for (;varScope && !varScope.hasOwnProperty(variable); ) varScope = varScope.__parent__scope__;
          return varScope;
        };
        var commands = commandAction;
        var arith_operators = {
          "+": function(a, b, u) {
            return u ? +b : a + b;
          },
          "-": function(a, b, u) {
            return u ? -b : a - b;
          },
          "*": function(a, b) {
            return a * b;
          },
          "/": function(a, b) {
            return a / b;
          },
          "%": function(a, b) {
            return a % b;
          },
          ">": function(a, b) {
            return a > b;
          },
          ">=": function(a, b) {
            return a >= b;
          },
          "<": function(a, b) {
            return a < b;
          },
          "<=": function(a, b) {
            return a <= b;
          },
          "==": function(a, b) {
            return a == b;
          },
          "===": function(a, b) {
            return a === b;
          },
          "!=": function(a, b) {
            return a != b;
          },
          "!==": function(a, b) {
            return a !== b;
          },
          "&": function(a, b) {
            return a & b;
          },
          "|": function(a, b) {
            return a | b;
          },
          "^": function(a, b) {
            return a ^ b;
          },
          "<<": function(a, b) {
            return a << b;
          },
          ">>": function(a, b) {
            return a >> b;
          },
          ">>>": function(a, b) {
            return a >>> b;
          }
        };
        Object.keys(arith_operators).forEach(function(key) {
          var operator = arith_operators[key];
          commands[key] = function(scope, command, _left, _right, _unary) {
            if (command) {
              _left = command.left;
              _right = command.right;
              _unary = command.unary;
            }
            var values;
            values = _unary ? [ 0, runCommand(scope, _left) ] : [ runCommand(scope, _left), runCommand(scope, _right) ];
            return operator(values[0], values[1], _unary);
          };
        });
        var bool_operators = {
          typeof: function(a) {
            return typeof a;
          },
          void: function(a) {
            return void a;
          },
          "!": function(a) {
            return !a;
          },
          "~": function(a) {
            return ~a;
          }
        };
        Object.keys(bool_operators).forEach(function(key) {
          var operator = bool_operators[key];
          commands[key] = function(scope, command, _left) {
            command && (_left = command.left);
            return operator(runCommand(scope, _left));
          };
        });
        var assign_operators = {
          "=": function(o, k, s, c) {
            return o[k] = runCommand(s, c);
          },
          "+=": function(o, k, s, c) {
            return o[k] += runCommand(s, c);
          },
          "-=": function(o, k, s, c) {
            return o[k] -= runCommand(s, c);
          },
          "*=": function(o, k, s, c) {
            return o[k] *= runCommand(s, c);
          },
          "/=": function(o, k, s, c) {
            return o[k] /= runCommand(s, c);
          },
          "%=": function(o, k, s, c) {
            return o[k] %= runCommand(s, c);
          },
          "<<=": function(o, k, s, c) {
            return o[k] <<= runCommand(s, c);
          },
          ">>=": function(o, k, s, c) {
            return o[k] >>= runCommand(s, c);
          },
          ">>>=": function(o, k, s, c) {
            return o[k] >>>= runCommand(s, c);
          },
          "&=": function(o, k, s, c) {
            return o[k] &= runCommand(s, c);
          },
          "^=": function(o, k, s, c) {
            return o[k] ^= runCommand(s, c);
          },
          "|=": function(o, k, s, c) {
            return o[k] |= runCommand(s, c);
          }
        };
        Object.keys(assign_operators).forEach(function(key) {
          var operator = assign_operators[key];
          commands[key] = function(scope, command, _left, _right) {
            if (command) {
              _left = command.left;
              _right = command.right;
            }
            var varScope = getVarScope(scope, _left);
            return operator(varScope, _left, scope, _right);
          };
        });
        var inc_operators = {
          "++": function(o, k, p) {
            return p ? ++o[k] : o[k]++;
          },
          "--": function(o, k, p) {
            return p ? --o[k] : o[k]--;
          }
        };
        Object.keys(inc_operators).forEach(function(key) {
          var operator = inc_operators[key];
          commands[key] = function(scope, command, _left, _prefix) {
            if (command) {
              _left = command.left;
              _prefix = command.prefix;
            }
            var varScope = getVarScope(scope, _left);
            return operator(varScope, _left, _prefix);
          };
        });
        var sab_operators = {
          in: function(s, a, b) {
            return runCommand(s, a) in runCommand(s, b);
          },
          instanceof: function(s, a, b) {
            return runCommand(s, a) instanceof runCommand(s, b);
          },
          "&&": function(s, a, b) {
            return runCommand(s, a) && runCommand(s, b);
          },
          "||": function(s, a, b) {
            return runCommand(s, a) || runCommand(s, b);
          }
        };
        Object.keys(sab_operators).forEach(function(key) {
          var operator = sab_operators[key];
          commands[key] = function(scope, command, _left, _right) {
            if (command) {
              _left = command.left;
              _right = command.right;
            }
            return operator(scope, _left, _right);
          };
        });
      })();
      var parseVariable = function(code) {
        var readString = function(code) {
          var char = code[0], pos = 0;
          for (;;) {
            pos = code.indexOf(char, pos + 1);
            if (pos === -1) {
              pos = code.length;
              break;
            }
            if ("\\" !== code[pos - 1]) break;
          }
          var str = "";
          try {
            str = '"' === char ? JSON.parse('"' + code.substr(1, pos - 1) + '"') : JSON.parse('"' + code.substr(1, pos - 1).replace(/\\'/g, "'").replace(/"/g, '\\"') + '"');
          } catch (e) {}
          return {
            data: str,
            i: pos
          };
        };
        var readIndex = function(code) {
          var result, items = [], item = "";
          for (var symbol, i = 1; symbol = code[i]; i++) if ('"' === symbol || "'" === symbol) {
            result = readString(code.substr(i));
            items.push(result.data);
            i += result.i;
          } else {
            if ("]" === symbol) break;
            item += symbol;
          }
          item && items.push(parseFloat(item));
          return {
            data: items[0],
            i: i
          };
        };
        var parseVar = function(code) {
          var items = [];
          var result, item = "";
          for (var symbol, i = 0; symbol = code[i]; i++) if ("." === symbol) {
            item && items.push(item);
            item = "";
          } else if ("[" === symbol) {
            item && items.push(item);
            item = "";
            result = readIndex(code.substr(i));
            items.push(result.data);
            i += result.i;
          } else item += symbol;
          item && items.push(item);
          return items;
        };
        var items;
        items = /[\["']/.test(code) ? parseVar(code) : code.split(".");
        return items;
      };
      var globalProperty = [ "Infinity", "NaN", "undefined" ];
      var globalPropertyValue = [ 1 / 0, NaN, void 0 ];
      var runCommand = function(scope, command) {
        var result;
        if ("object" == typeof command && null !== command) {
          var fn, commandLen;
          if (Array.isArray(command)) {
            commandLen = command.length;
            commandLen > 1 && "string" == typeof command[1] && (3 === commandLen ? operatorRe.test(command[1]) && (command = [ command[1], command[0], command[2] ]) : 2 === commandLen && "raw" !== command[0] && operatorRe.test(command[1]) && (command = [ command[1], command[0], !0 ]));
            fn = commandAction[command[0]];
            switch (commandLen) {
              case 1:
                result = fn(scope, null);
                break;

              case 2:
                result = fn(scope, null, command[1]);
                break;

              case 3:
                result = fn(scope, null, command[1], command[2]);
                break;

              case 4:
                result = fn(scope, null, command[1], command[2], command[3]);
                break;

              case 5:
                result = fn(scope, null, command[1], command[2], command[3], command[4]);
                break;

              default:
                result = fn.apply(null, [ scope, null ].concat(command.slice(1)));
            }
          } else {
            fn = commandAction[command.type];
            result = fn(scope, command);
          }
        } else if ("string" == typeof command) {
          var props = parseVariable(command);
          var root = scope;
          var prop;
          if (1 === props.length) {
            prop = props.shift();
            var pos = globalProperty.indexOf(prop);
            result = pos !== -1 ? globalPropertyValue[pos] : root[prop];
          } else for (;props.length; ) {
            prop = props.shift();
            if ([ "string", "object" ].indexOf(typeof root) === -1) throw new Error("Property type error!");
            result = root[prop];
            root = result;
          }
        } else result = command;
        return result;
      };
      var runCommands = function(scope, commands) {
        var prevResult, result = void 0;
        for (var i = 0, len = commands.length; i < len; i++) {
          var command = commands[i];
          prevResult = result;
          result = runCommand(scope, command);
          result === skipResult && (result = prevResult);
          if (scope.hasOwnProperty("return")) break;
        }
        return result;
      };
      Array.isArray(commands) && "string" != typeof commands[0] || (commands = [ commands ]);
      return runCommands({}, commands);
    };
    module.exports = kit;
  }, function(module, exports) {
    function CustomError(message) {
      this.name = "CustomError";
      this.message = message;
      if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor); else if ("function" == typeof Error && Error.constructor) {
        var newError = new Error();
        newError && (this.stack = newError.stack);
      }
    }
    CustomError.prototype = Object.create(Error.prototype);
    CustomError.prototype.constructor = CustomError;
    module.exports = CustomError;
  }, function(module, exports) {
    var Promise = function() {
      var Promise = null;
      Promise = "function" == typeof window.Promise && "function" == typeof window.Promise.resolve && "function" == typeof window.Promise.reject ? window.Promise : function() {
        /**
         @license
         Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
         This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
         The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
         The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
         Code distributed by Google as part of the polymer project is also
         subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
         */
        function MakePromise(asap) {
          function Promise(fn) {
            if ("object" != typeof this || "function" != typeof fn) throw new TypeError();
            this._state = null;
            this._value = null;
            this._deferreds = [];
            doResolve(fn, resolve.bind(this), reject.bind(this));
          }
          function handle(deferred) {
            var me = this;
            null !== this._state ? asap(function() {
              var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
              if ("function" == typeof cb) {
                var ret;
                try {
                  ret = cb(me._value);
                } catch (e) {
                  deferred.reject(e);
                  return;
                }
                deferred.resolve(ret);
              } else (me._state ? deferred.resolve : deferred.reject)(me._value);
            }) : this._deferreds.push(deferred);
          }
          function resolve(newValue) {
            try {
              if (newValue === this) throw new TypeError();
              if (newValue && ("object" == typeof newValue || "function" == typeof newValue)) {
                var then = newValue.then;
                if ("function" == typeof then) {
                  doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this));
                  return;
                }
              }
              this._state = !0;
              this._value = newValue;
              finale.call(this);
            } catch (e) {
              reject.call(this, e);
            }
          }
          function reject(newValue) {
            this._state = !1;
            this._value = newValue;
            finale.call(this);
          }
          function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) handle.call(this, this._deferreds[i]);
            this._deferreds = null;
          }
          function doResolve(fn, onFulfilled, onRejected) {
            var done = !1;
            try {
              fn(function(value) {
                if (!done) {
                  done = !0;
                  onFulfilled(value);
                }
              }, function(reason) {
                if (!done) {
                  done = !0;
                  onRejected(reason);
                }
              });
            } catch (ex) {
              if (done) return;
              done = !0;
              onRejected(ex);
            }
          }
          Promise.prototype.catch = function(onRejected) {
            return this.then(null, onRejected);
          };
          Promise.prototype.then = function(onFulfilled, onRejected) {
            var me = this;
            return new Promise(function(resolve, reject) {
              handle.call(me, {
                onFulfilled: onFulfilled,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
              });
            });
          };
          Promise.resolve = function(value) {
            return value && "object" == typeof value && value.constructor === Promise ? value : new Promise(function(resolve) {
              resolve(value);
            });
          };
          Promise.reject = function(value) {
            return new Promise(function(resolve, reject) {
              reject(value);
            });
          };
          return Promise;
        }
        var asap = "function" == typeof setImmediate && setImmediate || function(fn) {
            setTimeout(fn, 0);
          };
        return MakePromise(asap);
      }();
      (function(Promise) {
        Promise.all = Promise.all || function() {
            var args = Array.prototype.slice.call(1 === arguments.length && Array.isArray(arguments[0]) ? arguments[0] : arguments);
            return new Promise(function(resolve, reject) {
              function res(i, val) {
                try {
                  if (val && ("object" == typeof val || "function" == typeof val)) {
                    var then = val.then;
                    if ("function" == typeof then) {
                      then.call(val, function(val) {
                        res(i, val);
                      }, reject);
                      return;
                    }
                  }
                  args[i] = val;
                  0 === --remaining && resolve(args);
                } catch (ex) {
                  reject(ex);
                }
              }
              if (0 === args.length) return resolve([]);
              var remaining = args.length;
              for (var i = 0; i < args.length; i++) res(i, args[i]);
            });
          };
        Promise.race = Promise.race || function(values) {
            return new Promise(function(resolve, reject) {
              for (var i = 0, len = values.length; i < len; i++) values[i].then(resolve, reject);
            });
          };
      })(Promise);
      return Promise;
    }();
    module.exports = Promise;
  }, function(module, exports) {
    module.exports = function(callback) {
      if ([ "interactive", "complete" ].indexOf(document.readyState) !== -1) callback(); else {
        var onLoad = function() {
          document.removeEventListener("DOMContentLoaded", onLoad, !1);
          window.removeEventListener("load", onLoad, !1);
          callback();
        };
        document.addEventListener("DOMContentLoaded", onLoad, !1);
        window.addEventListener("load", onLoad, !1);
      }
    };
  } ]);

}, function isAvailable(initData) {
  "use strict";
  var preference = initData.getPreference;

  if (!preference.aviaBarEnabled) {
    return false;
  }

  return true;
}, function syncIsAvailable() {
  "use strict";
  if (mono.isIframe()) {
    return false;
  }

  var list = [
    '*://*.ozon.travel/*',
    '*://*.onetwotrip.com/*',

    '*://*.skyscanner.*/*',

    '*://*.aeroflot.ru/*',
    '*://*.momondo.*/*',
    '*://*.anywayanyday.com/*',
    '*://*.svyaznoy.travel/*',
    '*://avia.tickets.ru/*',
    '*://*.s7.ru/*',
    '*://*.kupibilet.ru/*',
    '*://*.trip.ru/*',
    '*://*.sindbad.ru/*',
    '*://*.aviakassa.ru/*',
    '*://*.biletix.ru/*',
    '*://*.utair.ru/*',

    '*://*.kayak.*/*',
    '*://*.orbitz.com/*',
    '*://*.travelocity.com/*',
    '*://*.expedia.com/*',
    '*://*.priceline.com/*',

    '*://booking.airasia.com/*',
    '*://*.ryanair.com/*',

    '*://*.booking.*/*',
    '*://*.agoda.*/*',
    '*://*.hotels.com/*',
    '*://*.ostrovok.ru/*',
    '*://*.travel.ru/*',
    '*://*.oktogo.ru/*',
    '*://*.roomguru.ru/*',
    '*://*.tripadvisor.ru/*',
    '*://*.hilton.ru/*',
    '*://*.hilton.com/*',
    '*://*.marriott.com/*',
    '*://*.hostelworld.com/*',
    '*://*.tiket.com/*',
    '*://*.hotelsclick.com/*',
    '*://*.hotelscombined.com/*',

    '*://*.avis.*/*',
    '*://*.budget.com/*',
    '*://*.wizzair.com/*',
    '*://*.emirates.com/*',
    '*://*.delta.com/*',
    "*://*.hertz.com/*",
    "*://*.europcar.com/*"
  ];

  for (var i = 0, item; item = list[i]; i++) {
    var re = new RegExp(mono.urlPatternToStrRe(item));
    if (re.test(location.protocol + '//' + location.hostname)) {
      mono.global.aviaBarProfile = item;
      mono.global.exAviaBar = true;
      return true;
    }
  }

  return false;
});