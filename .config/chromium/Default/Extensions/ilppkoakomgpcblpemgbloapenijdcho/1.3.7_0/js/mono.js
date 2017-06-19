var mono = (typeof mono !== 'undefined') ? mono : null;

(function(base, factory) {
  "use strict";
  if (mono && mono.isLoaded) {
    return;
  }

  var _mono = mono;
  var fn = function (addon) {
    return factory(_mono, addon);
  };

  if (typeof window !== "undefined") {
    mono = base(fn);
    return;
  }

}(
  function base(factory) {
    if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
      return factory();
    }

    var base = {
      isLoaded: true,
      onReadyStack: [],
      onReady: function() {
        base.onReadyStack.push([this, arguments]);
      },
      loadModuleStack: [],
      loadModule: function() {
        base.loadModuleStack.push([this, arguments]);
      }
    };

    var onLoad = function() {
      document.removeEventListener('DOMContentLoaded', onLoad, false);
      window.removeEventListener('load', onLoad, false);

      mono = factory();

      var item;
      while (item = base.onReadyStack.shift()) {
        mono.onReady.apply(item[0], item[1]);
      }

      while (item = base.loadModuleStack.shift()) {
        mono.loadModule.apply(item[0], item[1]);
      }
    };

    document.addEventListener('DOMContentLoaded', onLoad, false);
    window.addEventListener('load', onLoad, false);

    return base;
  },
  function initMono(_mono, _addon) {
var browserApi = function() {
  "use strict";
  var isInject = location.protocol !== 'chrome-extension:' || location.host !== chrome.runtime.id;
  var isBgPage = false;
  !isInject && (function () {
    isBgPage = location.pathname.indexOf('_generated_background_page.html') !== -1;
    if (!isBgPage && chrome.runtime.hasOwnProperty('getBackgroundPage')) {
      try {
        chrome.runtime.getBackgroundPage(function (bgWin) {
          isBgPage = bgWin === window;
        });
      } catch (e) {}
    }
  })();

  var emptyFn = function() {};

  /**
   * @param {Function} fn
   * @returns {Function}
   */
  var onceFn = function(fn) {
    return function(msg) {
      if (fn) {
        fn(msg);
        fn = null;
      }
    };
  };

  /**
   * @returns {Number}
   */
  var getTime = function () {
    return parseInt(Date.now() / 1000);
  };

  var msgTools = {
    id: 0,
    idPrefix: Math.floor(Math.random() * 1000),
    /**
     * @returns {String}
     */
    getId: function() {
      return this.idPrefix + '_' + (++this.id);
    },
    /**
     * @typedef {Object} Sender
     * @property {Object} [tab]
     * @property {number} tab.callbackId
     * @property {number} [frameId]
     */
    /**
     * @param {string} id
     * @param {Sender} sender
     * @returns {Function}
     */
    asyncSendResponse: function(id, sender) {
      return function(message) {
        message.responseId = id;

        if (sender.tab && sender.tab.id >= 0) {
          if (sender.frameId !== undefined) {
            chrome.tabs.sendMessage(sender.tab.id, message, {
              frameId: sender.frameId
            });
          } else {
            chrome.tabs.sendMessage(sender.tab.id, message);
          }
        } else {
          chrome.runtime.sendMessage(message);
        }
      };
    },
    listenerList: [],
    /**
     * @typedef {Object} MonoMsg
     * @property {boolean} mono
     * @property {string} [hook]
     * @property {string} idPrefix
     * @property {string} [callbackId]
     * @property {boolean} [async]
     * @property {boolean} isBgPage
     * @property {string} [responseId]
     * @property {boolean} hasCallback
     * @property {*} data
     */
    /**
     * @param {MonoMsg} message
     * @param {Sender} sender
     * @param {Function} _sendResponse
     */
    listener: function(message, sender, _sendResponse) {
      var _this = msgTools;
      var sendResponse = null;
      if (message && message.mono && !message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
        if (!message.hasCallback) {
          sendResponse = emptyFn;
        } else {
          sendResponse = _this.asyncSendResponse(message.callbackId, sender);
        }

        var responseFn = onceFn(function(msg) {
          var message = _this.wrap(msg);
          sendResponse(message);
          sendResponse = null;
        });

        _this.listenerList.forEach(function(fn) {
          if (message.hook === fn.hook) {
            fn(message.data, responseFn);
          }
        });
      }
    },
    async: {},
    /**
     *
     * @param {MonoMsg} message
     * @param {Sender} sender
     * @param {Function} sendResponse
     */
    asyncListener: function(message, sender, sendResponse) {
      var _this = msgTools;
      if (message && message.mono && message.responseId && message.idPrefix !== _this.idPrefix && message.isBgPage !== isBgPage) {
        var item = _this.async[message.responseId];
        var fn = item && item.fn;
        if (fn) {
          delete _this.async[message.responseId];
          if (!Object.keys(_this.async).length) {
            chrome.runtime.onMessage.removeListener(_this.asyncListener);
          }

          fn(message.data);
        }
      }

      _this.gc();
    },
    /**
     * @param {*} [msg]
     * @returns {MonoMsg}
     */
    wrap: function(msg) {
      return {
        mono: true,
        data: msg,
        idPrefix: this.idPrefix,
        isBgPage: isBgPage
      };
    },
    /**
     * @param {string} id
     * @param {Function} responseCallback
     */
    wait: function(id, responseCallback) {
      this.async[id] = {
        fn: responseCallback,
        time: getTime()
      };

      if (!chrome.runtime.onMessage.hasListener(this.asyncListener)) {
        chrome.runtime.onMessage.addListener(this.asyncListener);
      }

      this.gc();
    },
    gcTimeout: 0,
    gc: function () {
      var now = getTime();
      if (this.gcTimeout < now) {
        var expire = 180;
        var async = this.async;
        this.gcTimeout = now + expire;
        Object.keys(async).forEach(function (responseId) {
          if (async[responseId].time + expire < now) {
            delete async[responseId];
          }
        });

        if (!Object.keys(async).length) {
          chrome.runtime.onMessage.removeListener(this.asyncListener);
        }
      }
    }
  };

  var api = {
    isChrome: true,
    /**
     * @param {*} msg
     * @param {Function} [responseCallback]
     */
    sendMessageToActiveTab: function(msg, responseCallback) {
      var message = msgTools.wrap(msg);

      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var tabId = tabs[0] && tabs[0].id;
        if (tabId >= 0) {
          var hasCallback = !!responseCallback;
          message.hasCallback = hasCallback;
          if (hasCallback) {
            message.callbackId = msgTools.getId();
            msgTools.wait(message.callbackId, responseCallback);
          }

          chrome.tabs.sendMessage(tabId, message, emptyFn);
        }
      });
    },
    /**
     * @param {*} msg
     * @param {Function} [responseCallback]
     * @param {String} [hook]
     */
    sendMessage: function(msg, responseCallback, hook) {
      var message = msgTools.wrap(msg);
      hook && (message.hook = hook);

      var hasCallback = !!responseCallback;
      message.hasCallback = hasCallback;
      if (hasCallback) {
        message.callbackId = msgTools.getId();
        msgTools.wait(message.callbackId, responseCallback);
      }

      chrome.runtime.sendMessage(message, emptyFn);
    },
    onMessage: {
      /**
       * @param {Function} callback
       * @param {Object} [details]
       */
      addListener: function(callback, details) {
        details = details || {};
        details.hook && (callback.hook = details.hook);

        if (msgTools.listenerList.indexOf(callback) === -1) {
          msgTools.listenerList.push(callback);
        }

        if (!chrome.runtime.onMessage.hasListener(msgTools.listener)) {
          chrome.runtime.onMessage.addListener(msgTools.listener);
        }
      },
      /**
       * @param {Function} callback
       */
      removeListener: function(callback) {
        var pos = msgTools.listenerList.indexOf(callback);
        if (pos !== -1) {
          msgTools.listenerList.splice(pos, 1);
        }

        if (!msgTools.listenerList.length) {
          chrome.runtime.onMessage.removeListener(msgTools.listener);
        }
      }
    }
  };

  var initChromeStorage = function() {
    return {
      /**
       * @param {String|[String]|Object|null|undefined} [keys]
       * @param {Function} callback
       */
      get: function(keys, callback) {
        chrome.storage.local.get(keys, callback);
      },
      /**
       * @param {Object} items
       * @param {Function} [callback]
       */
      set: function(items, callback) {
        chrome.storage.local.set(items, callback);
      },
      /**
       * @param {String|[String]} [keys]
       * @param {Function} [callback]
       */
      remove: function(keys, callback) {
        chrome.storage.local.remove(keys, callback);
      },
      /**
       * @param {Function} [callback]
       */
      clear: function(callback) {
        chrome.storage.local.clear(callback);
      }
    };
  };
  if (chrome.storage) {
    api.storage = initChromeStorage();
  }

  var _navigator = null;
  /**
   * @returns {{language: String, platform: String, userAgent: String}}
   */
  api.getNavigator = function () {
    if (_navigator) {
      return _navigator;
    }

    _navigator = {};
    ['language', 'platform', 'userAgent'].forEach(function(key) {
      _navigator[key] = navigator[key] || '';
    });

    return _navigator;
  };

  (function checkCompatibility() {
    var ua = api.getNavigator().userAgent;
    var uaRe = /Chrome\/(\d+)/;
    if (uaRe.test(ua)) {
      var version = parseInt(ua.match(uaRe)[1]);
      api.isChromeVersion = version;
      if (version < 31) {
        api.noMouseEnter = true;
      }
    }
  })();

  /**
   * @param {string} url
   * @param {boolean} [active]
   */
  api.openTab = function (url, active) {
    active = (active === undefined) ? true : !!active;
    return chrome.tabs.create({
      url: url,
      active: active
    });
  };

  /**
   * @param {Function} cb
   */
  api.getActiveTabUrl = function (cb) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      var tab = tabs[0];
      return cb(tab && tab.url || '');
    });
  };

  /**
   * @param {Function} cb
   * @param {number} [delay]
   * @returns {number}
   */
  api.setTimeout = function (cb, delay) {
    return setTimeout(cb, delay);
  };

  /**
   * @param {number} timeout
   */
  api.clearTimeout = function(timeout) {
    return clearTimeout(timeout);
  };

  /**
   * @returns {string}
   */
  api.getVersion = function () {
    return chrome.runtime.getManifest().version;
  };

  /**
   * @param {String} locale
   * @param {Function} cb
   */
  api.getLanguage = function (locale, cb) {
    var convert = function(messages) {
      var language = {};
      for (var key in messages) {
        if (messages.hasOwnProperty(key)) {
          language[key] = messages[key].message;
        }
      }
      return language;
    };

    var url = '_locales/{locale}/messages.json';

    mono.request({
      url: url.replace('{locale}', locale),
      json: true
    }, function(err, resp, json) {
      if (err) {
        cb(err);
      } else {
        cb(null, convert(json));
      }
    });
  };

  api.getLoadedLocale = function () {
    return chrome.i18n.getMessage('lang');
  };

  api.getActiveWindowActiveTab = function(cb) {
    "use strict";
    return chrome.tabs.query({active: true, currentWindow: true}, cb);
  };
  api.getActiveTabs = function(cb) {
    "use strict";
    return chrome.tabs.query({active: true}, cb);
  };
  api.setBadgeText = function(text, tabId) {
    "use strict";
    return chrome.browserAction.setBadgeText({text: text, tabId: tabId});
  };
  /**
   * @param {{url: string, filename: string|undefined}} details
   * @returns {*}
   */
  api.downloadFile = function(details) {
    "use strict";
    return chrome.downloads.download(details);
  };
  api.tabsOnTabActivatedListener = function(cb) {
    "use strict";
    return chrome.tabs.onActivated.addListener(cb);
  };
  api.tabsOnRemovedListener = function(cb) {
    "use strict";
    return chrome.tabs.onRemoved.addListener(cb);
  };
  api.tabsOnUpdateListener = function(cb) {
    "use strict";
    return chrome.tabs.onUpdated.addListener(cb);
  };
  api.windowsOnCreatedListener = function(cb) {
    "use strict";
    return chrome.windows.onCreated.addListener(cb);
  };
  api.windowsOnRemovedListener = function(cb) {
    "use strict";
    return chrome.windows.onRemoved.addListener(cb);
  };
  api.webRequestOnHeadersReceivedListener = function(cb) {
    "use strict";
    return chrome.webRequest.onHeadersReceived.addListener(cb, {
      urls: ["<all_urls>"]
    }, ["responseHeaders"]);
  };
  api.getAppId = function() {
    "use strict";
    return 'vdp-chrome';
  };

  return {
    api: api
  };
};

    var mono = browserApi(_addon).api;
    mono.isLoaded = true;
    mono.onReady = function(cb) {
      return cb();
    };

    //> utils

    /**
     * @param {string} head
     * @returns {Object}
     */
    mono.parseXhrHeader = function(head) {
      head = head.split(/\r?\n/);
      var headers = {};
      head.forEach(function(line) {
        "use strict";
        var sep = line.indexOf(':');
        if (sep === -1) {
          return;
        }
        var key = line.substr(0, sep).trim().toLowerCase();
        var value = line.substr(sep + 1).trim();
        headers[key] = value;
      });
      return headers;
    };

    /**
     * @callback requestResponse
     * @param {string|null} err
     * @param {Object} res
     * @param {string|Object|Array} data
     */
    /**
     * @param {Object|string} obj
     * @param {string} obj.url
     * @param {string} [obj.method] GET|POST
     * @param {string} [obj.type] GET|POST
     * @param {string} [obj.data]
     * @param {boolean} [obj.cache]
     * @param {Object} [obj.headers]
     * @param {string} [obj.contentType]
     * @param {boolean} [obj.json]
     * @param {boolean} [obj.xml]
     * @param {number} [obj.timeout]
     * @param {string} [obj.mimeType]
     * @param {boolean} [obj.withCredentials]
     * @param {boolean} [obj.localXHR]
     * @param {requestResponse} [origCb]
     * @returns {{abort: function}}
     */
    mono.request = function(obj, origCb) {
      "use strict";
      var result = {};
      var cb = function(e, response, body) {
        cb = null;
        if (request.timeoutTimer) {
          mono.clearTimeout(request.timeoutTimer);
        }

        var err = null;
        if (e) {
          err = String(e.message || e) || 'ERROR';
        }
        origCb && origCb(err, response, body);
      };

      var getResponse = function(body) {
        var response = {};

        response.statusCode = xhr.status;
        response.statusText = xhr.statusText;

        var headers = null;
        var allHeaders = xhr.getAllResponseHeaders();
        if (typeof allHeaders === 'string') {
          headers = mono.parseXhrHeader(allHeaders);
        }
        response.headers = headers || {};

        response.body = body;

        return response;
      };

      if (typeof obj !== 'object') {
        obj = {url: obj};
      }

      var url = obj.url;

      var method = obj.method || obj.type || 'GET';
      method = method.toUpperCase();

      var data = obj.data;
      if (typeof data !== "string") {
        data = mono.param(data);
      }

      if (data && method === 'GET') {
        url += (/\?/.test(url) ? '&' : '?') + data;
        data = undefined;
      }

      if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
        url += (/\?/.test(url) ? '&' : '?') + '_=' + Date.now();
      }

      obj.headers = obj.headers || {};

      if (data) {
        obj.headers["Content-Type"] = obj.contentType || obj.headers["Content-Type"] || 'application/x-www-form-urlencoded; charset=UTF-8';
      }

      var request = {};
      request.url = url;
      request.method = method;

      data && (request.data = data);
      obj.json && (request.json = true);
      obj.xml && (request.xml = true);
      obj.timeout && (request.timeout = obj.timeout);
      obj.mimeType && (request.mimeType = obj.mimeType);
      obj.withCredentials && (request.withCredentials = true);
      Object.keys(obj.headers).length && (request.headers = obj.headers);

      if (request.timeout > 0) {
        request.timeoutTimer = mono.setTimeout(function() {
          cb && cb(new Error('ETIMEDOUT'));
          xhr.abort();
        }, request.timeout);
      }

      var xhrSuccessStatus = {
        0: 200,
        1223: 204
      };

      var xhr = mono.request.getTransport(obj.localXHR);
      xhr.open(request.method, request.url, true);

      if (mono.isModule && request.xml) {
        request.mimeType = 'text/xml';
      }
      if (request.mimeType) {
        xhr.overrideMimeType(request.mimeType);
      }
      if (request.withCredentials) {
        xhr.withCredentials = true;
      }
      for (var key in request.headers) {
        xhr.setRequestHeader(key, request.headers[key]);
      }

      var readyCallback = xhr.onload = function() {
        var status = xhrSuccessStatus[xhr.status] || xhr.status;
        try {
          if (status >= 200 && status < 300 || status === 304) {
            var body = xhr.responseText;
            if (request.json) {
              body = JSON.parse(body);
            } else
            if (request.xml) {
              if (mono.isModule) {
                body = xhr.responseXML;
              } else {
                body = (new DOMParser()).parseFromString(body, "text/xml");
              }
            } else
            if (typeof body !== 'string') {
              console.error('Response is not string!', body);
              throw new Error('Response is not string!');
            }
            return cb && cb(null, getResponse(body), body);
          }
          throw new Error(xhr.status + ' ' + xhr.statusText);
        } catch (e) {
          return cb && cb(e);
        }
      };

      var errorCallback = xhr.onerror = function() {
        cb && cb(new Error(xhr.status + ' ' + xhr.statusText));
      };

      var stateChange = null;
      if (xhr.onabort !== undefined) {
        xhr.onabort = errorCallback;
      } else {
        stateChange = function () {
          if (xhr.readyState === 4) {
            cb && mono.setTimeout(function () {
              return errorCallback();
            });
          }
        };
      }

      if (mono.isSafari && mono.badXhrHeadRedirect && request.method === 'HEAD') {
        stateChange = (function(cb) {
          if (xhr.readyState > 1) {
            // Safari 5 on HEAD 302 redirect fix
            mono.setTimeout(function() {
              xhr.abort();
            });
            return readyCallback();
          }

          return cb && cb();
        }).bind(null, stateChange);
      }

      if (stateChange) {
        xhr.onreadystatechange = stateChange;
      }

      try {
        xhr.send(request.data || null);
      } catch (e) {
        mono.setTimeout(function() {
          cb && cb(e);
        });
      }

      result.abort = function() {
        cb = null;
        xhr.abort();
      };

      return result;
    };

    mono.request.getTransport = function() {
      if (mono.isModule) {
        return new (require('sdk/net/xhr').XMLHttpRequest)();
      }

      return new XMLHttpRequest();
    };

    mono.extend = function() {
      var obj = arguments[0];
      for (var i = 1, len = arguments.length; i < len; i++) {
        var item = arguments[i];
        for (var key in item) {
          if (item[key] !== undefined) {
            obj[key] = item[key];
          }
        }
      }
      return obj;
    };

    mono.param = function(obj) {
      if (typeof obj === 'string') {
        return obj;
      }
      var itemsList = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        if (obj[key] === undefined || obj[key] === null) {
          obj[key] = '';
        }
        itemsList.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key]));
      }
      return itemsList.join('&');
    };

    /**
     * @param {string|Element|DocumentFragment} tagName
     * @param {Object} obj
     * @returns {Element|DocumentFragment}
     */
    mono.create = function(tagName, obj) {
      "use strict";
      var el;
      var func;
      if (typeof tagName !== 'object') {
        el = document.createElement(tagName);
      } else {
        el = tagName;
      }
      for (var attr in obj) {
        var value = obj[attr];
        if (func = mono.create.hook[attr]) {
          func(el, value);
          continue;
        }
        el[attr] = value;
      }
      return el;
    };
    mono.create.hook = {
      text: function(el, value) {
        "use strict";
        el.textContent = value;
      },
      data: function(el, value) {
        "use strict";
        for (var item in value) {
          el.dataset[item] = value[item];
        }
      },
      class: function(el, value) {
        "use strict";
        if (Array.isArray(value)) {
          for (var i = 0, len = value.length; i < len; i++) {
            el.classList.add(value[i]);
          }
        } else {
          el.setAttribute('class', value);
        }
      },
      style: function(el, value) {
        "use strict";
        if (typeof value === 'object') {
          for (var item in value) {
            var key = item;
            if (key === 'float') {
              key = 'cssFloat';
            }
            var _value = value[item];
            if (Array.isArray(_value)) {
              for (var i = 0, len = _value.length; i < len; i++) {
                el.style[key] = _value[i];
              }
            } else {
              el.style[key] = _value;
            }
          }
        } else {
          el.setAttribute('style', value);
        }
      },
      append: function(el, value) {
        "use strict";
        if (!Array.isArray(value)) {
          value = [value];
        }
        for (var i = 0, len = value.length; i < len; i++) {
          var node = value[i];
          if (!node && node !== 0) {
            continue;
          }
          if (typeof node !== 'object') {
            node = document.createTextNode(node);
          }
          el.appendChild(node);
        }
      },
      on: function(el, eventList) {
        "use strict";
        if (typeof eventList[0] !== 'object') {
          eventList = [eventList];
        }
        for (var i = 0, len = eventList.length; i < len; i++) {
          var args = eventList[i];
          if (!Array.isArray(args)) {
            continue;
          }
          mono.on(el, args[0], args[1], args[2]);
        }
      },
      onCreate: function(el, value) {
        "use strict";
        value.call(el, el);
      }
    };

    mono.urlPatternToStrRe = function(value) {
      "use strict";
      if (value === '<all_urls>') {
        return '^https?:\\/\\/.+$';
      }

      var m = value.match(/(\*|http|https|file|ftp):\/\/([^\/]+)(?:\/(.*))?/);
      if (!m) {
        throw new Error("Invalid url-pattern");
      }

      var scheme = m[1];
      if (scheme === '*') {
        scheme = 'https?';
      }

      var host = m[2];
      if (host === '*') {
        host = '.+';
      } else {
        host = mono.escapeRegex(host);
        host = host.replace(/^\\\*\\\./, '(?:[^\/]+\\.)?');
        host = host.replace(/\\\.\\\*$/g, '\\.[a-z\\.]{2,}');
      }

      var pattern = ['^', scheme, ':\\/\\/', host];

      var path = m[3];
      if (!path) {
        pattern.push('$');
      } else
      if (path === '*') {
        path = '(?:|\/.*)';
        pattern.push(path);
        pattern.push('$');
      } else
      if (path) {
        path = '\/' + path;
        path = mono.escapeRegex(path);
        path = path.replace(/\\\*/g, '.*');
        pattern.push(path);
        pattern.push('$');
      }

      return pattern.join('');
    };

    mono.isIframe = function() {
      if (mono.isFF) {
        return window.parent !== window;
      }
      return window.top !== window.self;
    };

    mono.loadModule = (function () {
      var moduleNameList = [];
      var moduleList = [];
      var loadedModuleList = [];

      var moduleLoad = function(data) {
        var item, availFn, isAvailable, moduleName, fn;
        while (item = moduleList.shift()) {
          moduleName = item[0];
          fn = item[1];
          availFn = item[2];

          isAvailable = !availFn;
          try {
            !isAvailable && (isAvailable = availFn(data));
          } catch (e) {
            mono.error('Module available error!', e);
          }

          if (isAvailable) {
            loadedModuleList.push(moduleName);
            try {
              fn(moduleName, data);
            } catch (e) {
              mono.error('Module error!', e);
            }
          }
        }
      };

      var requestData = function() {
        "use strict";
        var limit = 20;

        var onceResponse = mono.onceFn(function (data) {
          getData = null;

          mono.global.language = data.getLanguage;
          mono.global.preference = data.getPreference;

          return moduleLoad(data);
        });

        var getData = function () {
          setTimeout(function () {
            limit--;
            if (limit < 0) {
              getData = null;
            }
            getData && getData();
          }, 250);

          mono.sendMessage({action: 'getModuleData'}, onceResponse);
        };
        getData();
      };

      var loader = function(moduleName, cb, isAsyncAvailable, syncIsAvailable) {
        if (moduleNameList.indexOf(moduleName) === -1) {
          moduleNameList.push(moduleName);

          var isAvailable = !syncIsAvailable;
          try {
            !isAvailable && (isAvailable = syncIsAvailable());
          } catch (e) {
            mono.error('Module available error!', e);
          }

          if (isAvailable) {
            moduleList.push(arguments);
            if (moduleList.length === 1) {
              requestData();
            }
          }
        } else {
          mono.debug('Module exists', moduleName);
        }
      };

      loader.moduleLoadedList = loadedModuleList;
      loader.moduleList = moduleList;

      return loader;
    })();

    mono.on = function(el, type, onEvent, capture) {
      el.addEventListener(type, onEvent, capture);
    };

    mono.off = function(el, type, onEvent, capture) {
      el.removeEventListener(type, onEvent, capture);
    };

    mono.global = {};

    /**
     * @param {string} url
     * @param {Object} [details]
     * @param {boolean} [details.params] Input params only [false]
     * @param {string} [details.sep] Separator [&]
     * @param {boolean} [details.noDecode] Disable decode keys [false]
     * @returns {{}}
     */
    mono.parseUrl = function(url, details) {
      details = details || {};
      var query = null;
      if (!details.params && /\?/.test(url)) {
        query = url.match(/[^\?]+\?(.+)/)[1];
      } else {
        query = url;
      }
      var separator = details.sep || '&';
      var dblParamList = query.split(separator);
      var params = {};
      for (var i = 0, len = dblParamList.length; i < len; i++) {
        var item = dblParamList[i];
        var keyValue = item.split('=');
        var key = keyValue[0];
        var value = keyValue[1] || '';
        if (!details.noDecode) {
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
        } else {
          params[key] = value;
        }
      }
      return params;
    };

    /**
     * @param {string} text
     * @returns {string}
     */
    mono.decodeUnicodeEscapeSequence = function(text) {
      try {
        return JSON.parse(JSON.stringify(text)
          .replace(mono.decodeUnicodeEscapeSequence.re, '$1'));
      } catch (e) {
        return text;
      }
    };
    mono.decodeUnicodeEscapeSequence.re = /\\(\\u[0-9a-f]{4})/g;

    mono.fileName = {
      maxLength: 80,

      rtrim: /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

      illegalRe: /[\/\?<>\\:\*\|"]/g,

      controlRe: /[\x00-\x1f\x80-\x9f]/g,

      reservedRe: /^\.+/,

      trim: function(text) {
        return text.replace(this.rtrim, '');
      },

      partsRe: /^(.+)\.([a-z0-9]{1,4})$/i,

      getParts: function (name) {
        return name.match(this.partsRe);
      },

      specialChars: ('nbsp,iexcl,cent,pound,curren,yen,brvbar,sect,uml,copy,ordf,laquo,not,shy,reg,macr,deg,plusmn,sup2' +
      ',sup3,acute,micro,para,middot,cedil,sup1,ordm,raquo,frac14,frac12,frac34,iquest,Agrave,Aacute,Acirc,Atilde,Auml' +
      ',Aring,AElig,Ccedil,Egrave,Eacute,Ecirc,Euml,Igrave,Iacute,Icirc,Iuml,ETH,Ntilde,Ograve,Oacute,Ocirc,Otilde,Ouml' +
      ',times,Oslash,Ugrave,Uacute,Ucirc,Uuml,Yacute,THORN,szlig,agrave,aacute,acirc,atilde,auml,aring,aelig,ccedil' +
      ',egrave,eacute,ecirc,euml,igrave,iacute,icirc,iuml,eth,ntilde,ograve,oacute,ocirc,otilde,ouml,divide,oslash' +
      ',ugrave,uacute,ucirc,uuml,yacute,thorn,yuml').split(','),
      specialCharsList: [['amp','quot','lt','gt'], [38,34,60,62]],

      specialCharsRe: /&([^;]{2,6});/g,

      /**
       * @param {string} text
       * @returns {string}
       */
      decodeSpecialChars: function(text) {
        var _this = this;
        return text.replace(this.specialCharsRe, function(text, word) {
          var code = null;
          if (word[0] === '#') {
            code = parseInt(word.substr(1));
            if (isNaN(code)) {
              return '';
            }
            return String.fromCharCode(code);
          }

          var pos = _this.specialCharsList[0].indexOf(word);
          if (pos !== -1) {
            code = _this.specialCharsList[1][pos];
            return String.fromCharCode(code);
          }

          pos = _this.specialChars.indexOf(word);
          if (pos !== -1) {
            code = pos + 160;
            return String.fromCharCode(code);
          }

          return '';
        });
      },

      rnRe: /\r?\n/g,

      re1: /[\*\?"]/g,

      re2: /</g,

      re3: />/g,

      spaceRe: /[\s\t\uFEFF\xA0]+/g,

      dblRe: /(\.|!|\?|_|,|\-|:|\+){2,}/g,

      re4: /[\.,:;\/\-_\+=']$/g,

      /**
       * @param {string} name
       * @returns {string}
       */
      modify: function (name) {
        if (!name) {
          return '';
        }

        name = mono.decodeUnicodeEscapeSequence(name);

        try {
          name = decodeURIComponent(name);
        } catch (err) {
          name = unescape(name);
        }

        name = this.decodeSpecialChars(name);

        name = name.replace(this.rnRe, ' ');

        name = this.trim(name);

        name = name.replace(this.re1, '')
          .replace(this.re2, '(')
          .replace(this.re3, ')')
          .replace(this.spaceRe, ' ')
          .replace(this.dblRe, '$1')
          .replace(this.illegalRe, '_')
          .replace(this.controlRe, '')
          .replace(this.reservedRe, '')
          .replace(this.re4, '');

        if (name.length <= this.maxLength) {
          return name;
        }

        var parts = this.getParts(name);
        if (parts && parts.length == 3) {
          parts[1] = parts[1].substr(0, this.maxLength);
          return parts[1] + '.' + parts[2];
        }

        return name;
      }
    };

    /**
     * @param {function} cb
     */
    mono.asyncCall = function(cb) {
      "use strict";
      mono.setTimeout(function () {
        cb();
      }, 0);
    };

    /**
     * @param {Function} cb
     * @param {Object} [scope]
     * @returns {Function}
     */
    mono.asyncFn = function (cb, scope) {
      return function () {
        var context = scope || this;
        var args = arguments;
        mono.setTimeout(function () {
          cb.apply(context, args);
        }, 0);
      };
    };

    /**
     * @param {Function} cb
     * @param {Object} [scope]
     * @returns {Function}
     */
    mono.onceFn = function (cb, scope) {
      return function () {
        if (cb) {
          var context = scope || this;
          cb.apply(context, arguments);
          cb = null;
        }
      };
    };

    /**
     * @param {string} html
     * @param {RegExp|RegExp[]} match
     * @returns {string[]}
     */
    mono.getPageScript = function(html, match) {
      "use strict";
      if (match && !Array.isArray(match)) {
        match = [match];
      }
      var scriptList = [];
      html.replace(/<script(?:|\s[^>]+[^\/])>/g, function(text, offset) {
        offset += text.length;
        var endPos = html.indexOf('<\/script>', offset);
        if (endPos !== -1) {
          var content = html.substr(offset, endPos - offset);
          if (match) {
            match.every(function(r) {
              return r.test(content);
            }) && scriptList.push(content);
          } else {
            scriptList.push(content);
          }
        }
      });
      return scriptList;
    };

    /**
     * @param {string} html
     * @param {RegExp|RegExp[]} match
     * @returns {Object[]}
     */
    mono.findJson = function(html, match) {
      "use strict";
      if (match && !Array.isArray(match)) {
        match = [match];
      }
      var rawJson = [];
      var obj = {
        '{': 0,
        '[': 0
      };
      var map = {'}': '{', ']': '['};
      var jsonSymbols = /[{}\]\[":0-9.,-]/;
      var whiteSpace = /[\r\n\s\t]/;
      var jsonText = '';
      for (var i = 0, symbol; symbol = html[i]; i++) {
        if (symbol === '"') {
          var end = i;
          while (end !== -1 && (end === i || html[end - 1] === '\\')) {
            end = html.indexOf('"', end + 1);
          }
          if (end === -1) {
            end = html.length - 1;
          }
          jsonText += html.substr(i, end - i + 1);
          i = end;
          continue;
        }

        if (!jsonSymbols.test(symbol)) {
          if (symbol === 't' && html.substr(i, 4) === 'true') {
            jsonText += 'true';
            i+=3;
          } else
          if (symbol === 'f' && html.substr(i, 5) === 'false') {
            jsonText += 'false';
            i+=4;
          } else
          if (symbol === 'n' && html.substr(i, 4) === 'null') {
            jsonText += 'null';
            i+=3;
          } else
          if (!whiteSpace.test(symbol)) {
            obj['{'] = 0;
            obj['['] = 0;
            jsonText = '';
          }
          continue;
        }

        jsonText += symbol;

        if (symbol === '{' || symbol === '[') {
          if (!obj['{'] && !obj['[']) {
            jsonText = symbol;
          }
          obj[symbol]++;
        } else
        if (symbol === '}' || symbol === ']') {
          obj[map[symbol]]--;
          if (!obj['{'] && !obj['[']) {
            rawJson.push(jsonText);
          }
        }
      }
      var jsonList = [];
      for (var i = 0, item; item = rawJson[i]; i++) {
        if (item === '{}' || item === '[]') {
          continue;
        }
        try {
          if (match) {
            match.every(function(r) {
              return r.test(item);
            }) && jsonList.push(JSON.parse(item));
          } else {
            jsonList.push(JSON.parse(item));
          }
        } catch(e) {
          // console.log('bad json', item);
        }
      }
      return jsonList;
    };

    /**
     * @param {string} value
     * @returns {string}
     */
    mono.escapeRegex = function(value) {
      "use strict";
      return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
    };

    mono.debug = function () {
      if (mono.debugMode) {
        var args = [].slice.call(arguments);
        args.unshift('sf');
        console.trace.apply(console, args);
      }
    };

    mono.error = function () {
      var args = [].slice.call(arguments);
      args.unshift('sf');
      console.error.apply(console, arguments);
    };

    _mono && (function(tmpMono) {
      "use strict";
      _mono = null;
      var args, list = tmpMono.loadModuleStack;
      if (list) {
        while (args = list.shift()) {
          mono.asyncFn(mono.loadModule).apply(mono, args);
        }
      }
    })(_mono);
    //<utils

    //@insert

    return mono;
  }
));