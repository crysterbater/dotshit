typeof window === 'undefined' && (function() {
  mono = require('./../data/js/mono.js');
})();

var engine = {
  rulesObj: {},
  rulesArr: [
    {
      name: 'block',
      rules: [
        {key: 'url', re: /^[^/]+\/\/([^/]+\.)?googlevideo\.|^[^/]+\/\/([^/]+\.)?youtube\./}
      ]
    },
    {
      name: 'block',
      rules: [
        {key: 'url', re: /^https?:\/\/.+\.fbcdn\.net\/.+\?.+&bytestart=\d+&byteend=\d+$|^https?:\/\/.+\.(?:vimeocdn\.com|akamaihd\.net)\/.+\/chop\/segment-\d+\.m4s$|^https?:\/\/.+\.(?:dailymotion\.net|dailymotion\.com)\/.+\/frag\(\d+\)\/.+\/\d+_[^\/]+\.ts$|^https?:\/\/.+\.akamaihd\.net\/.+\/[^\/]+_chunk_\d+_[^\/]+\.flv$|^https?:\/\/.+\.ttvnw\.net\/.+\/index-.+$|^https?:\/\/hls\.goodgame\.ru\/.+\/([^\/]+\.(ts|m4a)|\d+\.m3u8\?.+)$/}
      ]
    },
    {
      name: 'videoAudio',
      rules: [
        {key: 'headers', item: 'content-type', re: /^(video|audio)\//}
      ]
    },
    {
      name: 'm3u8',
      rules: [
        {key: 'headers', item: 'content-type', re: /application\/vnd\.apple\.mpegurl/}
      ]
    }
  ],
  matchContentTypeRe: /^([^\/]+)\/(.+)$/,
  matchFileNameRe: /\/([^?#\/]+)(?:\?|#|$)/,
  matchHeaderFileNameRe: /filename="(.+)"$/,
  matchDomainRe: /:\/\/(?:[^@\/?#]+@)?([^\/?:#]+)/,
  typesRe: /^(?:stylesheet|script|image|sub_frame)$/,
  tabs: {},
  visibleTabs: [],
  winTabMap: {},
  storage: {},
  extra: {},
  isFirstRun: false,
  getDomain: function(url) {
    "use strict";
    if (typeof url !== 'string') {
      return null;
    }

    var domain = url.match(this.matchDomainRe);
    domain = domain && domain[1];
    return domain;
  },
  getFileNameInfo: function(item, headers) {
    "use strict";
    var info = {};
    var filename;
    var desc;
    if (desc = headers['content-disposition']) {
      filename = desc.match(this.matchHeaderFileNameRe);
      filename = filename && filename[1];
    }
    if (!filename) {
      filename = item.url.match(this.matchFileNameRe);
      filename = filename && filename[1];
    }
    if (filename) {
      filename = mono.fileName.modify(filename);
      
      var pos = filename.lastIndexOf('.');
      if (pos !== -1) {
        info.ext = filename.substr(pos + 1);
      }
    }
    info.filename = filename;

    return info;
  },
  readHeader: function(responseHeaders) {
    "use strict";
    var headers = {};
    for (var i = 0, item; item = responseHeaders[i]; i++) {
      headers[item.name.toLowerCase()] = item.value;
    }
    return headers;
  },
  updateBadge: function(tab) {
    "use strict";
    var count = tab.res.length;
    var text = '';
    if (count > 99) {
      text = '99+';
    } else
    if (count) {
      text = count.toString();
    }
    mono.setBadgeText(text, tab.id);
  },
  readTabRequestList: function(diff, tab) {
    "use strict";
    var _this = this;
    var item;
    var raw = tab.raw;
    var res = tab.res;
    var ddBl = tab.ddBl;

    if (!raw.length) {
      this.updateBadge(tab);
      return;
    }

    var headers = null;
    var ruleName = null;

    var getHeaders = function () {
      headers = _this.readHeader(item.responseHeaders)
    };

    var everyRule = function (rule) {
      var re = rule.re;
      var key = rule.key;
      if (key === 'headers') {
        !headers && getHeaders();
        return re.test(headers[rule.item]);
      } else {
        return re.test(item[key]);
      }
    };

    var someRules = function (item) {
      if (item.rules.every(everyRule)) {
        ruleName = item.name;
        return true;
      }
    };

    while (item = raw.shift()) {
      headers = null;
      ruleName = null;

      this.rulesArr.some(someRules);

      if (!ruleName || ruleName === 'block') {
        continue;
      }

      !headers && getHeaders();

      var contentType = headers['content-type'] || '';

      var type = contentType.toLowerCase().match(this.matchContentTypeRe);
      if (!type) {
        continue;
      }

      var fileNameInfo = this.getFileNameInfo(item, headers);

      var info = {
        tabId: item.tabId,
        statusCode: item.statusCode,
        method: item.method,
        url: item.url,
        headers: headers,
        filename: fileNameInfo.filename || '',
        type: type[1],
        ext: fileNameInfo.ext || '',
        format: type[2],
        count: 1,
        pageUrl: item.pageUrl,
        pageDomain: this.getDomain(item.pageUrl),
        timeStamp: item.timeStamp,
        rule: ruleName
      };

      var ruleObj = this.rulesObj[ruleName] || {};
      ruleObj.prepare && ruleObj.prepare(info);

      if (!info.url) {
        continue;
      }

      if (ddBl[info.url] !== undefined) {
        ddBl[info.url].count++;
        diff.push(ddBl[info.url]);
        continue;
      }

      ddBl[info.url] = info;
      diff.push(info);

      res.push(info);
    }

    this.updateBadge(tab);
  },
  readRequestList: function(tabs) {
    "use strict";
    var diff = [];

    if (tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        this.readTabRequestList(diff, tab);
      }
    } else {
      tabs = this.tabs;
      for (var tabId in tabs) {
        this.readTabRequestList(diff, tabs[tabId]);
      }
    }

    diff.length && mono.sendMessage({action: 'update', diff: diff}, null, mono.isFF && 'popupWin');
  },
  actionList: {
    getResList: function(msg, response) {
      "use strict";
      var tab = this.tabs[msg.tabId];
      var resList = tab && tab.res || [];

      return response({tabId: msg.tabId, resList: resList});
    },
    clear: function(msg, response) {
      "use strict";
      var tab = this.tabs[msg.tabId];
      if (tab) {
        tab.clear();
        this.updateBadge(tab);
      }
      return response();
    },
    download: function(msg) {
      "use strict";
      var _this = this;
      var info = msg.info;

      var url = info.dlUrl || info.url;
      var filename = info.filename;
      var pageDomain = info.pageDomain;

      for (var tabId in _this.tabs) {
        var tab = _this.tabs[tabId];
        var resList = tab && tab.res;
        resList && resList.forEach(function(item) {
          if (item.url === info.url) {
            item.downloaded = true;
          }
        });
      }

      mono.downloadFile({
        url: url,
        filename: filename || undefined
      });

      if (pageDomain) {
        engine.sendStatsInfo({
          ec: 'download',
          ea: 'hostname',
          el: pageDomain,
          t: 'event'
        });
      }
    },
    getModuleData: function(msg, response) {
      "use strict";
      var lang = 'en';
      var langCode = mono.getNavigator().language.substr(0, 2).toLowerCase();
      if (['ru', 'uk', 'be', 'kk'].indexOf(langCode) !== -1) {
        lang = 'ru';
      }

      return response({
        getLanguage: {
          lang: lang
        },
        getPreference: this.storage
      });
    },
    updateOption: function(message) {
      "use strict";
      var preferences = this.storage;
      var key = message.key;
      var value = message.value;
      var oldValue = preferences[key];

      preferences[key] = value;

      var obj = {};
      obj[key] = value;

      mono.storage.set(obj);

      if (oldValue !== value) {
        if (key === 'wsEnabled') {
          if (preferences.hasDCA) {
            if (value) {
              engine.extra.dca.enable();
            } else {
              engine.extra.dca.disable();
            }
          }
          if (preferences.hasSW) {
            if (value) {
              engine.extra.sw.enable();
            } else {
              engine.extra.sw.disable();
            }
          }
        }
      }
    }
  },
  onMessage: function(msg, response) {
    "use strict";
    if (msg && msg.action) {
      var fn = this.actionList[msg.action];
      return fn && fn.call(this, msg, response);
    }
  },
  getTabItem: function(tabId) {
    "use strict";
    var tab = this.tabs[tabId];
    if (tab) {
      return tab;
    }

    tab = {
      id: tabId,
      raw: [],
      res: [],
      ddBl: {},
      throttle: this.throttle(this.readRequestList.bind(this), 500),
      url: '<unknown>',
      clear: function() {
        for (var key in this.ddBl) {
          delete this.ddBl[key];
        }
        this.raw.splice(0);
        this.res.splice(0);
      }
    };

    return this.tabs[tabId] = tab;
  },
  onHeadersReceived: function(details) {
    "use strict";
    if (this.typesRe.test(details.type)) {
      return;
    }

    var tabId = details.tabId;

    if (tabId === -1) {
      return;
    }

    var tab = this.getTabItem(tabId);

    if (details.type === 'main_frame') {
      this.setTabUrl(tab, details.url);
    }
    
    if ( details.statusCode < 200
      || details.statusCode > 400
      || details.statusCode === 204) {
      return;
    }

    details.pageUrl = tab.url;

    tab.raw.push(details);

    if (this.visibleTabs.indexOf(tabId) !== -1) {
      tab.throttle([tab]);
    }
  },
  updateActiveTabList: function() {
    "use strict";
    var _this = this;
    var visibleTabs = this.visibleTabs;
    mono.getActiveTabs(function(tabs) {
      var tab, tabList = [];

      var currentTabs = tabs.map(function(_tab){
        var id = _tab.id;

        _this.winTabMap[_tab.windowId] = id;

        if (visibleTabs.indexOf(id) === -1 && (tab = _this.tabs[id])) {
          tabList.push(tab);
        }
        return id;
      });

      visibleTabs.splice(0);
      visibleTabs.push.apply(visibleTabs, currentTabs);

      tabList.length && _this.readRequestList(tabList);
    });
  },
  onTabActivated: function(activeInfo) {
    "use strict";
    var id = activeInfo.tabId;

    var oldId = this.winTabMap[activeInfo.windowId];
    this.winTabMap[activeInfo.windowId] = id;

    var pos = this.visibleTabs.indexOf(oldId);
    if (pos !== -1) {
      this.visibleTabs.splice(pos, 1);
    }
    this.visibleTabs.push(id);

    var tab = this.tabs[id];
    if (tab) {
      this.readRequestList([tab]);
    }

    mono.isFF && this.updateBadge(tab || {res: [], id: id});
  },
  onTabRemoved: function(tabId) {
    "use strict";
    delete this.tabs[tabId];
  },
  setTabUrl: function(tab, newUrl) {
    "use strict";
    if (tab.url === '<unknown>') {
      tab.url = newUrl;
      return;
    }

    // FF!
    if (tab.url === newUrl) {
      return;
    }

    var oldHostname = this.getDomain(tab.url);
    var newHostname = this.getDomain(newUrl);

    tab.url = newUrl;

    if (oldHostname !== newHostname) {
      tab.clear();
      this.updateBadge(tab);

      mono.sendMessage({action: 'clearPopup', tabId: tab.id}, null, mono.isFF && 'popupWin');
    }
  },
  onTabUpdate: function(tabId, changeInfo) {
    "use strict";
    if (!changeInfo.url) {
      return;
    }

    var tab = this.tabs[tabId];
    if (!tab) {
      return;
    }

    this.setTabUrl(tab, changeInfo.url);
  },
  onWindowCreate: function() {
    "use strict";
    this.updateActiveTabList();
  },
  onWindowRemoved: function(windowId) {
    "use strict";
    delete this.winTabMap[windowId];
    this.updateActiveTabList();
  },
  loadSettings: function(cb) {
    "use strict";
    var _this = this;
    mono.storage.get({
      uuid: null,
      aviaBarEnabled: 1,
      wsEnabled: 1
    }, function(storage) {
      storage.hasDCA = !!engine.extra.dca;
      storage.hasSW = !!engine.extra.sw;
      storage.hasWS = storage.hasDCA || storage.hasSW;

      engine.isFirstRun = storage.uuid === null;

      engine.storage = storage;

      cb && cb();
    });
  },
  saveSettings: function(cb) {
    "use strict";
    mono.storage.set(engine.storage, cb);
  },
  init: function() {
    "use strict";
    var _this = this;
    this.updateActiveTabList();

    mono.onMessage.addListener(this.onMessage.bind(this));

    mono.tabsOnTabActivatedListener(this.onTabActivated.bind(this));
    mono.windowsOnCreatedListener(this.onWindowCreate.bind(this));
    mono.windowsOnRemovedListener(this.onWindowRemoved.bind(this));

    mono.tabsOnRemovedListener(this.onTabRemoved.bind(this));
    mono.tabsOnUpdateListener(this.onTabUpdate.bind(this));

    mono.webRequestOnHeadersReceivedListener(this.onHeadersReceived.bind(this));

    this.loadSettings(function() {
      var preferences = _this.storage;

      if (preferences.hasDCA && preferences.wsEnabled) {
        engine.extra.dca && engine.extra.dca.enable();
      }

      if (preferences.hasSW && preferences.wsEnabled) {
        engine.extra.sw && engine.extra.sw.enable();
      }

      mono.setTimeout(function() {
        engine.sendPing();
      }, 5 * 60 * 1000);
    });
  }
};

(function () {// tbr
  var travelBar = {};
  travelBar.appInfo = {
    id: 'sf.vdp',
    useTemplates: true,
    track: true
  };

  var prepareStorage = function (storage, name) {
    var travelBar = storage[name];
    if (!travelBar || typeof travelBar !== 'object') {
      travelBar = storage[name] = {};
    }
    if (!Array.isArray(travelBar.blackList)) {
      travelBar.blackList = [];
    }
    if (!travelBar.templates || typeof travelBar.templates !== 'object') {
      travelBar.templates = {};
    }
    return travelBar;
  };

  engine.actionList.tbrGetInfo = function (msg, response) {
    return response(travelBar.appInfo);
  };
  engine.actionList.tbrIsAllow = function (msg, response) {
    mono.storage.get('aviaBar', function(storage) {
      var tbrStorage = prepareStorage(storage, 'aviaBar');

      var removed = tbrStorage.removed;
      if (removed) {
        return response(false);
      }

      var allow = true;

      var blackList = tbrStorage.blackList;

      var item = null;
      blackList.some(function(_item) {
        if (_item.hostname === msg.hostname) {
          item = _item;
          return true;
        }
      });

      if (item) {
        var now = parseInt(Date.now() / 1000);
        if (item.expire > now) {
          allow = false;
        } else {
          var pos = blackList.indexOf(item);
          blackList.splice(pos, 1);

          mono.storage.set(storage);
        }
      }

      return response(allow);
    });
    return true;
  };
  engine.actionList.tbrCloseBar = function (msg) {
    mono.storage.get('aviaBar', function (storage) {
      var tbrStorage = prepareStorage(storage, 'aviaBar');

      var blackList = tbrStorage.blackList;

      var item = null;
      blackList.some(function(_item) {
        if (_item.hostname === msg.hostname) {
          item = _item;
          return true;
        }
      });

      if (!item) {
        var now = parseInt(Date.now() / 1000);
        blackList.push({hostname: msg.hostname, expire: now + 5 * 60 * 60});

        mono.storage.set(storage);
      }
    });
  };
  engine.actionList.tbrGetTemplate = function (msg, response) {
    mono.storage.get('aviaBar', function (storage) {
      var tbrStorage = prepareStorage(storage, 'aviaBar');

      var templates = tbrStorage.templates;
      var template = templates[msg.id];
      if (!template) {
        templates[msg.id] = template = {};
      }

      var now = parseInt(Date.now() / 1000);
      if (template.expire > now) {
        response(template.data);
      } else {
        template.expire = now + 21600;

        mono.request({
          url: 'https://travelbar.tools/static/scheme/' + msg.id + '.json',
          timeout: 60 * 1000,
          json: true
        }, function (err, _response) {
          var data = _response.body;
          if (!err) {
            template.expire = now + 43200;
            template.data = data;

            Object.keys(templates).sort(function (a,b) {
              return templates[a].expire > templates[b].expire ? -1 : 1;
            }).slice(5).forEach(function (key) {
              delete templates[key];
            });
          }

          response(data);
          mono.storage.set(storage);
        });
      }
    });
    return true;
  };
  engine.actionList.tbrEvent = function (msg) {
    if (msg.type === 'track') {
      var details = msg.data[0];
      details.tid = 'UA-70432435-5';

      engine.sendStatsInfo(details);
    }
  };
})();


engine.throttle = function(fn, threshhold) {
  threshhold = threshhold || 250;
  var last;
  var deferTimer;
  return function () {
    var now = Date.now();
    var args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      mono.clearTimeout(deferTimer);
      deferTimer = mono.setTimeout(function () {
        last = now;
        fn.apply(null, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(null, args);
    }
  };
};

engine.getUuid = function() {
  "use strict";
  var uuid = engine.storage.uuid;
  if (typeof uuid === 'string' && uuid.length === 36) {
    return uuid;
  }

  uuid = engine.storage.uuid = this.generateUuid();
  engine.saveSettings();
  return uuid;
};

engine.generateUuid = function() {
  "use strict";
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

engine.sendPing = function() {
  "use strict";
  var _this = this;
  var onGetData = function(storage) {
    var now = parseInt(Date.now() / 1000);
    if (storage.statExpire > now) {
      return;
    }

    _this.sendStatsInfo({
      cd: 'init',
      t: 'screenview'
    }, {
      cb: function(err) {
        if (err) return;
        storage.statExpire = now + 24 * 60 * 60;
        mono.storage.set(storage);
      }
    });
  };

  mono.storage.get(['statExpire'], onGetData);
};

engine.sendStatsInfo = function(params, details) {
  "use strict";
  details = details || {};

  var defaultParams = {
    v: 1,
    ul: mono.getNavigator().language,
    tid: 'UA-67615552-1',
    cid: this.getUuid(),

    an: 'all-in-all',
    aid: mono.getAppId(),
    av: mono.getVersion()
  };

  for (var key in defaultParams) {
    if (!params.hasOwnProperty(key)) {
      params[key] = defaultParams[key];
    }
  }

  mono.request({
    url: 'https://www.google-analytics.com/collect?z=' + Date.now(),
    type: 'POST',
    data: mono.param(params),
    timeout: 60 * 1000
  }, details.cb);
};

//@insert

engine.moduleInit = function(addon, button, monoLib, extra) {
  mono = mono.init(addon);
  mono.monoLib = monoLib;
  mono.ffButton = button;

  mono.extend(engine.extra, extra);

  engine.init();
};

if (mono.isModule) {
  exports.init = engine.moduleInit;
} else
mono.onReady(function() {
  return engine.init();
});