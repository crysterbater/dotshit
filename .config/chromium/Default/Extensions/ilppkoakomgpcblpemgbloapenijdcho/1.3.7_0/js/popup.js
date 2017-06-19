var popup = {
  rulesObj: {},
  tabId: null,
  categoryList: {},
  categoryOrder: [],
  categoryUrlIdMap: {},
  list: [],
  cutUrlRe: /[?#]/,
  domCache: {
    body: document.querySelector('.container .body'),
    head: document.querySelector('.container .head'),
    menu: document.querySelector('.container .menu')
  },
  blackList: [
    [/^[^/]+\/\/([^/]+\.)?youtube\./, 'youtube'],
    [/^[^/]+\/\/([^/]+\.)?googlevideo\./, 'youtube']
  ],
  bytesToString: function(sizeList, bytes, nan) {
    "use strict";
    nan = nan || 'n/a';
    if (bytes <= 0) {
      return nan;
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i === 0) {
      return (bytes / Math.pow(1024, i)) + ' ' + sizeList[i];
    }
    var toFixed = 0;
    if (i > 2) {
      toFixed = 2;
    }
    return (bytes / Math.pow(1024, i)).toFixed(toFixed) + ' ' + sizeList[i];
  },
  setHeadWidth: function() {
    "use strict";
    var varCache = this.setHeadWidth;

    var head = this.domCache.head;
    var container = this.domCache.body;

    var width = head.clientWidth - container.clientWidth;

    if (varCache.lastWidth === width) {
      return;
    }
    varCache.lastWidth = width;

    head.style.paddingRight = width + 'px';
  },
  qualityMatch: /[^0-9a-z](240|360|480|720|sd|hd)[^0-9a-z]/ig,
  qualityHover: function(fileName) {
    "use strict";
    var fragment = document.createDocumentFragment();
    var lastPos = 0;
    fileName.replace(this.qualityMatch, function(text, quality, pos) {
      var prevText = fileName.substr(lastPos, pos - lastPos + 1);
      if (prevText.length > 0) {
        fragment.appendChild(document.createTextNode(prevText));
      }
      lastPos = pos;

      fragment.appendChild(mono.create('b', {text: quality}));
      lastPos += quality.length + 1;
    });

    var prevText = fileName.substr(lastPos, fileName.length + lastPos);
    if (prevText.length > 0) {
      fragment.appendChild(document.createTextNode(prevText));
    }

    return fragment;
  },
  rmPreview: function(parent) {
    "use strict";
    var prevList = (parent || document).querySelectorAll('.item.preview');
    for (var node, i = 0; node = prevList[i]; i++) {
      node.parentNode.removeChild(node);
    }
  },
  onItemClick: function(obj) {
    "use strict";
    var row = obj.el;
    var item = obj.api;

    setTimeout(function() {
      return this.resizePopup();
    }.bind(this), 0);

    var next = row.nextElementSibling;
    if (next && next.classList.contains('preview')) {
      next.parentNode.removeChild(next);
      return;
    }

    var player;
    if (['mp3'].indexOf(item.ext) !== -1) {
      player = mono.create('audio', {
        src: item.dlUrl || item.url,
        controls: true,
        autoplay: true
      });
    } else
    if (['mp4', 'webm'].indexOf(item.ext) !== -1) {
      player = mono.create('video', {
        src: item.dlUrl || item.url,
        controls: true,
        autoplay: true
      });
    }


    var preview = mono.create('div', {
      class: ['item', 'preview'],
      append: [
        !player ? 'Preview is not supported!' : player
      ]
    });

    this.rmPreview();

    if (!next) {
      row.parentNode.appendChild(preview);
    } else {
      row.parentNode.insertBefore(preview, next);
    }
  },
  getStatusBtn: function (obj) {
    var _this = this;
    var rule = this.rulesObj[obj.api.rule] || {};

    var node = mono.create('a', {
      class: ['action-btn', 'icon-request'],
      href: '#request',
      title: 'Request data',
      on: ['click', function(e) {
        e.preventDefault();

        var onReady = function () {
          node.parentNode.replaceChild(obj.previewBtnNode, node);
          obj.statusBtnNode = null;
        };

        if (rule.onRequestData) {
          rule.onRequestData(obj, onReady);
        } else {
          onReady();
        }
      }]
    });

    return node;
  },
  getPreviewBtn: function(obj) {
    "use strict";
    var _this = this;
    var rule = this.rulesObj[obj.api.rule] || {};

    var node = mono.create('a', {
      class: ['action-btn', 'icon-preview'],
      href: '#preview',
      title: 'Preview',
      on: ['click', function(e) {
        e.preventDefault();

        var onReady = function () {
          _this.onItemClick(obj);
        };

        if (rule.onPreview) {
          rule.onPreview(obj, onReady);
        } else {
          onReady();
        }
      }]
    });

    return node;
  },
  setDownloadedState: function(obj, isDownloaded) {
    "use strict";
    if (isDownloaded === undefined) {
      isDownloaded = obj.api.downloaded;
    }

    obj.api.downloaded = !!isDownloaded;

    if (isDownloaded) {
      obj.el.classList.add('downloaded');
    } else {
      obj.el.classList.remove('downloaded');
    }
  },
  downloadItem: function(obj) {
    "use strict";
    this.setDownloadedState(obj, 1);
    mono.sendMessage({action: 'download', info: obj.api});
    mono.isFF && mono.addon.postMessage('hidePopup');
  },
  getDownloadBtn: function(obj) {
    "use strict";
    var _this = this;
    var rule = this.rulesObj[obj.api.rule] || {};

    var node = mono.create('a', {
      class: ['action-btn', 'icon-download'],
      href: '#downlaod',
      title: 'Download',
      on: ['click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var onReady = function () {
          _this.downloadItem(obj);
        };

        if (rule.onDownload) {
          rule.onDownload(obj, onReady);
        } else {
          onReady();
        }
      }]
    });

    rule.onCreateDownloadBtn && rule.onCreateDownloadBtn(obj.api, node);

    return node;
  },
  createItem: function(item) {
    "use strict";
    var _this = this;
    var obj = {api: item};
    var rule = this.rulesObj[obj.api.rule] || {};

    var getSizeText = function () {
      var size = obj.api.headers['content-length'];
      return size && _this.bytesToString(size) || '';
    };

    var getFormatText = function () {
      return obj.api.ext || obj.api.format || '';
    };

    var getFilenameNode = function () {
      return _this.qualityHover(String(obj.api.filename));
    };

    var getUrl = function () {
      return obj.api.dlUrl || obj.api.url;
    };


    obj.previewBtnNode = _this.getPreviewBtn(obj);
    obj.downloadBtnNode = _this.getDownloadBtn(obj);

    if (rule.requireData && rule.requireData(obj.api)) {
      obj.statusBtnNode = _this.getStatusBtn(obj);
    }

    obj.el = mono.create('div', {
      class: ['item', obj.api.type],
      append: [
        mono.create('div', {
          class: ['col', 'action'],
          append: [
            obj.statusBtnNode || obj.previewBtnNode,
            obj.downloadBtnNode
          ]
        }),
        mono.create('div', {
          class: ['col', 'title'],
          append: [
            obj.titleNode = mono.create('a', {
              title: getUrl(),
              href: getUrl(),
              target: '_blank',
              append: [getFilenameNode()],
              on: ['click', function(e) {
                e.preventDefault();

                obj.downloadBtnNode.dispatchEvent(new CustomEvent('click'));
              }]
            })
          ]
        }),
        mono.create('div', {
          class: ['col', 'format'],
          append: [
            obj.formatNode = mono.create('div', {
              class: 'formatBadge',
              text: getFormatText()
            })
          ]
        }),
        obj.sizeNode = mono.create('div', {
          class: ['col', 'size'],
          text: getSizeText()
        })
      ],
      on: ['click', function(e) {
        if (e.target.tagName === 'A') {
          return;
        }

        var onReady = function () {
          _this.onItemClick(obj);
        };

        if (rule.onItemClick) {
          rule.onItemClick(obj, onReady);
        } else {
          onReady();
        }
      }]
    });

    obj.update = function () {
      obj.titleNode.textContent = '';
      obj.titleNode.appendChild(getFilenameNode());
      obj.titleNode.href = getUrl();
      obj.titleNode.title = getUrl();

      obj.formatNode.textContent = getFormatText();
      obj.sizeNode.textContent = getSizeText();
    };

    this.setDownloadedState(obj);

    return obj;
  },
  categoryCollapse: function(category, state, isAuto) {
    "use strict";

    if (state === undefined) {
      state = !category.isCallapsed;
    } else {
      state = !!state;
    }

    if (category.isCallapsed === state) {
      return;
    }

    var isForce = !!category.isForce;
    if (isForce && isAuto) {
      return;
    }

    if (state) {
      this.rmPreview(category.el);
      category.el.classList.add('collapse');
      category.isCallapsed = state;
    } else {
      category.el.classList.remove('collapse');
      category.isCallapsed = state;
    }

    if (!isAuto) {
      category.isForce = true;
    }

    this.resizePopup();
  },
  onCategoryHeadClick: function(category) {
    "use strict";
    category.collapse();
  },
  createCategoryItem: function(id, url) {
    "use strict";
    var _this = this;
    var category = {
      isCallapsed: false,
      isForce: false,
      timeStamp: 0,
      dDbl: {},
      itemList: [],
      itemOrder: []
    };

    category.collapse = this.categoryCollapse.bind(this, category);

    var text = url;
    // text = text.split(/\//).slice(0, 5).join('/');

    category.el = mono.create('div', {
      class: ['category'],
      append: [
        mono.create('div', {
          class: ['item', 'head'],
          data: {
            id: id
          },
          on: ['click', this.onCategoryHeadClick.bind(this, category)],
          append: [
            mono.create('div', {
              class: ['col', 'action'],
              append: [
                mono.create('i', {
                  class: ['action-btn', 'icon-arrow']
                })
              ]
            }),
            mono.create('div', {
              class: ['col', 'title'],
              append: [
                mono.create('span', {
                  class: 'url',
                  text: text,
                  title: url
                })
              ]
            })
          ]
        }),
        category.body = mono.create('div', {
          class: ['body']
        })
      ]
    });

    category.remove = function() {
      if (category.el.parentNode) {
        category.el.parentNode.removeChild(category.el);
      }
      delete _this.categoryList[id];
      delete _this.categoryUrlIdMap[id];
    };

    return category;
  },
  emptyItem: function() {
    "use strict";
    return mono.create('div', {
      class: ['item', 'empty'],
      text: '(empty)'
    });
  },
  sortInsertList: function(sortedList, currentList, table) {
    var insertList = [], fromIndex = 0, fragmentList = null, i, item, pos, node;
    for (i = 0; item = sortedList[i]; i++) {
      if (currentList[i] === item) continue;
      fromIndex = i;
      fragmentList = document.createDocumentFragment();
      while (sortedList[i] !== undefined && sortedList[i] !== currentList[i]) {
        ((pos = currentList.indexOf(sortedList[i], i)) !== -1) && currentList.splice(pos, 1);
        currentList.splice(i, 0, sortedList[i]);
        fragmentList.appendChild(sortedList[i].el);
        i++;
      }
      insertList.push({pos: fromIndex, list: fragmentList});
    }
    for (i = 0; item = insertList[i]; i++) {
      !(node = table.childNodes[item.pos]) ? table.appendChild(item.list) : table.insertBefore(item.list, node);
    }
  },
  writeList: function(list) {
    "use strict";
    var _this = this;
    var isEmptyList = this.list.length === 0;
    var categoryList = this.categoryList;
    var categoryUrlIdMap = this.categoryUrlIdMap;
    list.forEach(function (item) {
      var pageUrl = item.pageUrl.split(_this.cutUrlRe)[0];

      var categoryId = categoryUrlIdMap[pageUrl];
      if (!categoryId) {
        categoryId = categoryUrlIdMap[pageUrl] = Object.keys(categoryUrlIdMap).length + 1;
      }

      var category = categoryList[categoryId];
      if (!category) {
        category = categoryList[categoryId] = _this.createCategoryItem(categoryId, pageUrl);
      }

      var dDbl = category.dDbl;

      var exObj = dDbl[item.url];
      if (exObj) {
        exObj.api = item;
        return;
      }

      var obj = dDbl[item.url] = _this.createItem(item);

      category.itemList.push(obj);

      if (category.timeStamp < item.timeStamp) {
        category.timeStamp = item.timeStamp;
      }

      _this.list.push(category);
    });

    if (isEmptyList) {
      this.domCache.body.textContent = '';
    }

    if (this.list.length === 0) {
      this.domCache.body.appendChild(this.emptyItem());
      return;
    }

    var categoryOrder = Object.keys(categoryList).map(function(item) {
      var category = categoryList[item];

      var sortedList = category.itemList.sort(function(a, b) {
        return a.api.timeStamp > b.api.timeStamp ? -1 : 1;
      });

      _this.sortInsertList(sortedList, category.itemOrder, category.body);

      category.itemOrder = sortedList.slice();

      return category;
    });

    categoryOrder.sort(function(a, b) {
      return a.timeStamp > b.timeStamp ? -1 : 1;
    });

    this.sortInsertList(categoryOrder, this.categoryOrder, this.domCache.body);

    this.categoryOrder = categoryOrder;

    categoryOrder.slice(1).forEach(function(item) {
      item.collapse(1, 1);
    });

    var first = categoryOrder[0];
    if (first.isCallapsed && !first.isForce) {
      first.collapse(0, 1);
    }

    this.setHeadWidth();
  },
  updateListItem: function (item) {
    var categoryList = this.categoryList;
    var categoryUrlIdMap = this.categoryUrlIdMap;

    var pageUrl = item.pageUrl.split(this.cutUrlRe)[0];

    var categoryId = categoryUrlIdMap[pageUrl];
    if (!categoryId) {
      return;
    }

    var category = categoryList[categoryId];
    if (!category) {
      return;
    }

    var dDbl = category.dDbl;

    var exObj = dDbl[item.url];
    if (!exObj) {
      return;
    }

    exObj.api = item;

    exObj.update();
  },
  blackListMsg: function(urlDetails) {
    "use strict";

    var text = 'I can\'t download from this site :(';

    if (urlDetails.blackListReason === 'youtube') {
      text = 'Sorry, due to YouTube Policy we do not support downloading from YouTube';
    }

    this.domCache.body.textContent = '';
    this.domCache.body.appendChild(mono.create('div', {
      class: ['item', 'blackList'],
      text: text
    }));
  },
  inBlackList: function(url) {
    "use strict";
    var details = {
      url: url
    };

    details.inBlackList = this.blackList.some(function(item) {
      if (item[0].test(url)) {
        details.blackListReason = item[1];
        return true;
      }
    });

    return details;
  },
  requestResources: function() {
    "use strict";
    var _this = this;
    return mono.getActiveWindowActiveTab(function(tabList) {
      var tab = tabList[0];
      var tabId = -1;
      var tabUrl = '';

      if (tab) {
        tabId = tab.id;
        tabUrl = tab.url;
      }

      _this.tabId = tabId;

      var urlDetails = _this.inBlackList(tabUrl);
      if (urlDetails.inBlackList) {
        _this.blackListMsg(urlDetails);

        document.body.classList.remove('loading');

        _this.resizePopup();
        return;
      }

      return mono.sendMessage({action: 'getResList', tabId: tabId}, function(response) {
        _this.writeList(response.resList);

        document.body.classList.remove('loading');

        _this.resizePopup();
        return;
      });
    });
  },
  clearList: function() {
    "use strict";
    this.list.forEach(function(item) {
      item.remove();
    });

    this.list.splice(0);
    this.categoryOrder.splice(0);

    document.body.dispatchEvent(new CustomEvent('updateMenu'));
  },
  prepareSocialUrl: function(type) {
    var social = {
      'social-fb': {
        url: 'http://www.facebook.com/sharer.php?s=100&p[url]={url}&p[title]={title}&p[summary]={desc}&p[images][0]={img}'
      },
      'social-google-plus': {
        url: 'https://plus.google.com/share?url={url}'
      }
    };

    var socialData = {
      url: 'http://videodownloaderpro.net',
      img: 'http://videodownloaderpro.net/assets/icon_128.png',
      title: 'Video Downloader Pro',
      desc: ''
    };

    return social[type].url
      .replace('{url}', encodeURIComponent(socialData.url))
      .replace('{img}', encodeURIComponent(socialData.img))
      .replace('{title}', encodeURIComponent(socialData.title))
      .replace('{desc}', encodeURIComponent(socialData.desc));
  },
  bindSocialBtn: function() {
    "use strict";
    var fbBtn = document.querySelector('.social-fb-btn');
    fbBtn.href = this.prepareSocialUrl('social-fb');

    var gpBtn = document.querySelector('.social-google-plus-btn');
    gpBtn.href = this.prepareSocialUrl('social-google-plus');
  },
  getBrowserLanguage: function () {
    var langCode = '';

    if (!langCode && typeof navigator === 'object') {
      langCode = navigator.language;
    }

    if (!langCode || typeof langCode !== 'string') {
      langCode = 'en';
    }

    return langCode.toLowerCase().substr(0, 2);
  },
  bindMenuBtn: function() {
    "use strict";
    var _this = this;
    var language = this.getBrowserLanguage();

    var helpBtn = document.querySelector('.help-btn');
    if (['ru', 'uk'].indexOf(language) !== -1) {
      helpBtn.href = 'https://savefrom.userecho.com/forums/13-video-downloader-proru/?lang=ru';
    } else {
      helpBtn.href = 'https://savefrom.userecho.com/forums/12-video-downloader-proen/?lang=en';
    }
    helpBtn = null;

    var onClick = function(e) {
      e.preventDefault();
      if (_this.domCache.menu.classList.contains('show')) {
        _this.domCache.menu.classList.remove('show');
      } else {
        _this.domCache.menu.classList.add('show');
        document.body.dispatchEvent(new CustomEvent('updateMenu'));
      }
    };

    var btnList = [].slice.call(document.querySelectorAll('.menu-btn, .menu-layer'));
    btnList.forEach(function(btn) {
      btn.addEventListener('click', onClick);
    });

    this.bindSocialBtn();
  },
  bindClearBtn: function() {
    "use strict";
    var _this = this;
    var btn = document.querySelector('.clear-btn');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      mono.sendMessage({action: 'clear', tabId: _this.tabId}, function() {
        _this.clearList();
        _this.requestResources();
      });
    });

    var count = btn.querySelector('.item-count');
    document.body.addEventListener('updateMenu', function() {
      count.textContent = '(' + _this.list.length + ')';
    });
  },
  actionList: {
    update: function(msg) {
      "use strict";
      var diff = msg.diff.filter(function(item) {
        return item.tabId === this.tabId;
      }.bind(this));

      if (diff.length === 0) {
        return;
      }

      this.writeList(diff);

      this.resizePopup();
    },
    clearPopup: function(msg) {
      "use strict";
      if (msg.tabId !== this.tabId) {
        return;
      }

      this.clearList();
      this.requestResources();
    }
  },
  onMessage: function(msg, response) {
    "use strict";
    if (msg && msg.action) {
      var fn = this.actionList[msg.action];
      return fn && fn.call(this, msg, response);
    }
  },
  resizePopup: function() {
    "use strict";
    if (!mono.isFF) {
      return;
    }

    var width =  document.body.scrollWidth;
    var height =  document.body.scrollHeight;

    mono.sendMessage({action: 'resize', width: width, height: height}, null, 'service');
  },
  bindBlankLinks: function() {
    "use strict";
    var onClick = function() {
      mono.addon.postMessage('hidePopup');
    };

    [].slice.call(document.querySelectorAll('[target="_blank"]')).forEach(function(node) {
      node.addEventListener('click', onClick);
    });
  },
  run: function() {
    "use strict";
    this.bytesToString = this.bytesToString.bind(this, 'B,kB,MB,GB,TB,PB,EB,ZB,YB'.split(','));

    mono.onMessage.addListener(this.onMessage.bind(this));

    this.requestResources();

    this.bindClearBtn();
    this.bindMenuBtn();

    mono.isFF && window.addEventListener('resize', this.resizePopup.bind(this));
    mono.isFF && this.bindBlankLinks();
  }
};

//@insert

mono.onReady(function() {
  "use strict";
  return popup.run();
});