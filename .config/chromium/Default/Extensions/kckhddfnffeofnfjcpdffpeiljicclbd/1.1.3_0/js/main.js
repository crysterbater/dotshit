var Column,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.Columns = window.Columns || {};

window.Columns.Column = Column = (function() {
  var handleHandler;

  function Column(properties, dontCalculateColor) {
    this.editMode = bind(this.editMode, this);
    var key, thmb;
    this.className = this.constructor.name;
    if (properties) {
      for (key in properties) {
        if (typeof properties[key] !== 'function') {
          this[key] = properties[key];
        }
      }
    }
    if (!dontCalculateColor && !this.color) {
      thmb = document.createElement("img");
      thmb.addEventListener("load", (function(_this) {
        return function() {
          var ct;
          ct = new ColorThief(thmb);
          return _this.color = ct.getColor(thmb);
        };
      })(this));
      thmb.src = this.thumb;
    }
    if (!this.config) {
      this.config = {};
    }
    if (!this.cache) {
      this.cache = [];
    }
    this.refreshing = false;
    this.reloading = true;
    this._refreshing = false;
  }

  Column.prototype.error = function(holderElement) {
    var colEl, error;
    holderElement.setAttribute("hidden", "");
    colEl = holderElement.parentElement;
    error = colEl.querySelector(".error");
    error.removeAttribute("hidden");
    error.offsetTop;
    return error.style.opacity = 1;
  };

  Column.prototype.settings = function(cb) {
    var _d, dialog;
    if (this.dialog) {
      dialog = document.createElement(this.dialog);
      dialog.config = this.config;
      dialog.column = this;
      document.body.appendChild(dialog);
      _d = null;
      dialog.toggle = function() {
        if (!_d) {
          _d = this.shadowRoot.querySelector("tabbie-dialog");
        }
        return _d.toggle();
      };
      dialog.toggle();
      return dialog.shadowRoot.querySelector("tabbie-dialog").shadowRoot.querySelector("paper-button.ok").addEventListener("click", function() {
        this.config = dialog.config;
        tabbie.sync(this);
        dialog.toggle();
        if (typeof cb === 'function') {
          return cb(dialog);
        }
      });
    } else if (typeof cb === 'function') {
      return cb(dialog);
    }
  };

  Column.prototype.refresh = function(columnElement, holderElement) {};

  Column.prototype.attemptAdd = function(successCallback) {
    if (typeof successCallback === 'function') {
      return successCallback();
    }
  };

  handleHandler = void 0;

  Column.prototype.editMode = function(enable) {
    var editable, getPercentage, handle, i, j, len, len1, preview, ref, ref1, results, results1, target, trans;
    trans = tabbie.meta.byId("core-transition-center");
    handle = this.columnElement.querySelector("html /deep/ .handle");
    if (enable) {
      getPercentage = (function(_this) {
        return function(target, width) {
          var absolute, base, final;
          if (width) {
            base = document.querySelector(".grid-sizer").clientWidth;
            absolute = Math.round((target.style.width.substring(0, target.style.width.length - 2)) / base);
            final = absolute * 25;
            if (final === 0) {
              final = 25;
            }
          } else {
            base = document.querySelector(".grid-sizer").clientHeight;
            absolute = Math.round((target.style.height.substring(0, target.style.height.length - 2)) / base);
            final = absolute * 50;
            if (final === 0) {
              final = 50;
            }
          }
          if (final > 100) {
            final = 100;
          }
          console.info("[getPercentage] width?", width, "base", base, "absolute", absolute, "final", final, "%");
          return final;
        };
      })(this);
      preview = document.createElement("div");
      preview.classList.add("resize-preview");
      preview.style.visibility = "hidden";
      document.querySelector(".column-holder").appendChild(preview);
      target = this.columnElement;
      handle.addEventListener("mousedown", this.handleHandler = (function(_this) {
        return function(event) {
          var mouseUpBound, msmv, startX, startY;
          event.preventDefault();
          target.style.transition = "none";
          startX = event.clientX - target.clientWidth;
          startY = event.clientY - target.clientHeight;
          mouseUpBound = false;
          console.log("startY", startY, "startX", startX);
          return document.addEventListener("mousemove", msmv = function(event) {
            var msp, newX, newY;
            event.preventDefault();
            newX = event.clientX - startX;
            newY = event.clientY - startY;
            if (preview.style.visibility !== "visible") {
              preview.style.visibility = "visible";
              preview.style.top = target.style.top;
              preview.style.left = target.style.left;
            }
            preview.style.width = getPercentage(target, true) + "%";
            preview.style.height = getPercentage(target, false) + "%";
            target.style.zIndex = 107;
            target.style.width = newX + 'px';
            target.style.height = newY + 'px';
            if (!mouseUpBound) {
              mouseUpBound = true;
              return document.addEventListener("mouseup", msp = function(event) {
                var heightPerc, trnstn, widthPerc;
                event.preventDefault();
                document.removeEventListener("mousemove", msmv);
                document.removeEventListener("mouseup", msp);
                target.style.transition = "width 250ms, height 250ms";
                widthPerc = getPercentage(target, true);
                heightPerc = getPercentage(target, false);
                target.style.width = widthPerc + "%";
                target.style.height = heightPerc + "%";
                _this.width = widthPerc / 25;
                _this.height = heightPerc / 50;
                preview.style.visibility = "hidden";
                tabbie.sync(_this);
                return target.addEventListener("webkitTransitionEnd", trnstn = function() {
                  target.removeEventListener("webkitTransitionEnd", trnstn);
                  target.style.zIndex = 1;
                  return tabbie.packery.layout();
                });
              });
            }
          });
        };
      })(this));
      handle.style.visibility = "visible";
      this.draggie.enable();
      this.columnElement.classList.add("draggable");
      ref = this.editables;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        editable = ref[i];
        editable.removeAttribute("hidden");
        editable.offsetTop;
        results.push(trans.go(editable, {
          opened: true
        }));
      }
      return results;
    } else {
      if (this.handleHandler) {
        handle.removeEventListener("mousedown", this.handleHandler);
      }
      handle.style.visibility = "hidden";
      this.draggie.disable();
      this.columnElement.classList.remove("draggable");
      ref1 = this.editables;
      results1 = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        editable = ref1[j];
        trans.go(editable, {
          opened: false
        });
        results1.push(trans.listenOnce(editable, trans.completeEventName, function(e) {
          return e.setAttribute("hidden", "");
        }, [editable]));
      }
      return results1;
    }
  };

  Column.prototype.render = function(columnElement, holderElement) {
    var e, editable, i, len, progress, ref, spinner, timeout, trans;
    if (this.flex) {
      holderElement.classList.add("flex");
    } else {
      holderElement.classList.remove("flex");
    }
    this.columnElement = columnElement;
    trans = tabbie.meta.byId("core-transition-center");
    ref = this.columnElement.querySelectorAll("html /deep/ .editable");
    for (i = 0, len = ref.length; i < len; i++) {
      editable = ref[i];
      if (!this.dialog && editable.classList.contains("settings")) {
        continue;
      }
      trans.setup(editable);
      this.editables.push(editable);
    }
    spinner = columnElement.querySelector("html /deep/ paper-spinner");
    progress = columnElement.querySelector("html /deep/ paper-progress");
    try {
      Object.defineProperty(this, "loading", {
        get: function() {
          return spinner.active;
        },
        set: function(val) {
          return spinner.active = val;
        }
      });
      timeout = false;
      return Object.defineProperty(this, "refreshing", {
        get: function() {
          return this._refreshing;
        },
        set: function(val) {
          this._refreshing = false;
          if (val) {
            return progress.style.opacity = 1;
          } else {
            if (timeout) {
              clearTimeout(timeout);
            }
            return timeout = setTimeout(function() {
              return progress.style.opacity = 0;
            }, 400);
          }
        }
      });
    } catch (error1) {
      e = error1;
      return console.warn(e);
    }
  };

  Column.prototype.className = "";

  Column.prototype.color = "";

  Column.prototype.columnElement = null;

  Column.prototype.editables = [];

  Column.prototype.draggie = null;

  Column.prototype.syncedProperties = ["cache", "config", "className", "id", "color", "width", "height", "name", "url", "baseUrl", "link", "thumb", "custom"];

  Column.prototype.name = "Empty column";

  Column.prototype.width = 1;

  Column.prototype.height = 1;

  Column.prototype.dialog = null;

  Column.prototype.thumb = "img/column-unknown.png";

  Column.prototype.config = {};

  Column.prototype.cache = [];

  Column.prototype.loading = true;

  Column.prototype.refreshing = false;

  Column.prototype.flex = false;

  Column.prototype.custom = false;

  Column.prototype.toJSON = function() {
    var key, result;
    result = {};
    for (key in this) {
      if (this.syncedProperties.indexOf(key) !== -1) {
        result[key] = this[key];
      }
    }
    return result;
  };

  return Column;

})();

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.FeedColumn = (function(superClass) {
  extend(FeedColumn, superClass);

  function FeedColumn() {
    return FeedColumn.__super__.constructor.apply(this, arguments);
  }

  FeedColumn.prototype.element = false;

  FeedColumn.prototype.url = false;

  FeedColumn.prototype.responseType = 'json';

  FeedColumn.prototype.dataPath = null;

  FeedColumn.prototype.childPath = null;

  FeedColumn.prototype.baseUrl = false;

  FeedColumn.prototype.infiniteScroll = false;

  FeedColumn.prototype.page = 1;

  FeedColumn.prototype.draw = function(data, holderElement) {
    var card, child, converted, el, hack, i, item, items, j, k, l, len, len1, len2, nodes, num, parser, results, xmlDoc;
    this.loading = false;
    if (this.flex) {
      holderElement.classList.add("flex");
    } else {
      holderElement.classList.remove("flex");
    }
    if (!this.element) {
      console.warn("Please define the 'element' property on your column class!");
      return;
    }
    if (this.dataPath) {
      data = eval("data." + this.dataPath);
    }
    if (this.responseType === 'xml') {
      parser = new DOMParser;
      xmlDoc = parser.parseFromString(data, 'text/xml');
      items = xmlDoc.getElementsByTagName(this.xmlTag);
      data = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        converted = {};
        nodes = item.childNodes;
        for (j = 0, len1 = nodes.length; j < len1; j++) {
          el = nodes[j];
          converted[el.nodeName] = el.textContent;
        }
        data.push(converted);
      }
    }
    for (k = 0, len2 = data.length; k < len2; k++) {
      child = data[k];
      card = document.createElement(this.element);
      if (this.childPath) {
        child = eval("child." + this.childPath);
      }
      card.item = child;
      holderElement.appendChild(card);
    }
    results = [];
    for (num = l = 0; l <= 10; num = ++l) {
      if (!this.flex) {
        continue;
      }
      hack = document.createElement(this.element);
      hack.className = "hack";
      results.push(holderElement.appendChild(hack));
    }
    return results;
  };

  FeedColumn.prototype.refresh = function(columnElement, holderElement, adding) {
    this.refreshing = true;
    if (this.infiniteScroll && adding) {
      if (!this.baseUrl) {
        this.baseUrl = this.url;
      }
      this.url = this.baseUrl.replace("{PAGENUM}", this.page);
    } else if (this.page === "") {
      this.url = this.baseUrl.replace("{PAGENUM}", "");
    } else if (this.baseUrl) {
      this.url = this.baseUrl;
    }
    if (this.url.includes("{PAGENUM}")) {
      this.url = this.url.replace("{PAGENUM}", "");
    }
    if (!this.url) {
      console.warn("Please define the 'url' property on your column class!");
      return;
    }
    return fetch(this.url).then((function(_this) {
      return function(response) {
        var dataType;
        if (response.status === 200) {
          dataType = 'json';
          if (_this.responseType === 'xml') {
            dataType = 'text';
          }
          return Promise.resolve(response[dataType]());
        } else {
          return Promise.reject(new Error(response.statusText));
        }
      };
    })(this)).then((function(_this) {
      return function(data) {
        var hack, i, len, ref;
        _this.refreshing = false;
        _this.cache = data;
        tabbie.sync(_this);
        if (!adding) {
          holderElement.innerHTML = "";
        }
        if (_this.flex) {
          ref = holderElement.querySelectorAll(".hack");
          for (i = 0, len = ref.length; i < len; i++) {
            hack = ref[i];
            hack.remove();
          }
        }
        return _this.draw(_this.cache, holderElement);
      };
    })(this))["catch"]((function(_this) {
      return function(error) {
        console.error(error);
        _this.refreshing = false;
        _this.loading = false;
        if (!_this.cache || _this.cache.length === 0) {
          return _this.error(holderElement);
        }
      };
    })(this));
  };

  FeedColumn.prototype.render = function(columnElement, holderElement) {
    FeedColumn.__super__.render.call(this, columnElement, holderElement);
    if (this.infiniteScroll) {
      holderElement.addEventListener("scroll", (function(_this) {
        return function() {
          if (!_this.refreshing && holderElement.scrollTop + holderElement.clientHeight >= holderElement.scrollHeight - 100) {
            if (typeof _this.page === 'number') {
              _this.page++;
            }
            return _this.refresh(columnElement, holderElement, true);
          }
        };
      })(this));
    }
    if (Object.keys(this.cache).length) {
      this.draw(this.cache, holderElement);
    }
    return this.refresh(columnElement, holderElement);
  };

  return FeedColumn;

})(Columns.Column);

var Tabbie, tabbie,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Tabbie = (function() {
  Tabbie.prototype.version = "1.1";

  Tabbie.prototype.editMode = false;

  function Tabbie() {
    this.resortUsedColumns = bind(this.resortUsedColumns, this);
    this.resortColumns = bind(this.resortColumns, this);
    this.createColumnFromFeedly = bind(this.createColumnFromFeedly, this);
    this.register = bind(this.register, this);
    this.render = bind(this.render, this);
    this.tour = bind(this.tour, this);
    this.renderBookmarkTree = bind(this.renderBookmarkTree, this);
    this.syncAll = bind(this.syncAll, this);
    this.sync = bind(this.sync, this);
    this.layoutChanged = bind(this.layoutChanged, this);
    this.autoRefresh = bind(this.autoRefresh, this);
    this.noColumnsCheck = bind(this.noColumnsCheck, this);
    console.time("polymer-ready");
    window.addEventListener('polymer-ready', this.render);
  }

  Tabbie.prototype.renderColumns = function() {
    var column, j, len, ref, results;
    ref = this.usedColumns;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      column = ref[j];
      if (typeof column !== 'undefined') {
        results.push(this.addColumn(column, true));
      }
    }
    return results;
  };

  Tabbie.prototype.addColumn = function(column, dontsave) {
    var columnEl, holder, holderEl, item, j, len, pItem, ref;
    if (!column.id) {
      column.id = Math.round(Math.random() * 1000000);
    }
    if (!dontsave) {
      this.usedColumns.push(column);
      this.syncAll();
    }
    columnEl = document.createElement("item-column");
    columnEl.column = column;
    holder = document.querySelector(".column-holder");
    holder.appendChild(columnEl);
    this.packery.addItems([columnEl]);
    columnEl.style.width = (25 * column.width) + "%";
    columnEl.style.height = (50 * column.height) + "%";
    holderEl = columnEl.querySelector("html /deep/ paper-shadow .holder");
    column.render(columnEl, holderEl);
    column.draggie = new Draggabilly(columnEl, {
      handle: "html /deep/ core-toolbar /deep/ paper-icon-button.drag"
    });
    column.draggie.disable();
    this.packery.bindDraggabillyEvents(column.draggie);
    if (column.config.position) {
      ref = this.packery.items;
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.element === columnEl) {
          pItem = item;
        }
      }
      pItem.goTo(column.config.position.x, column.config.position.y);
    }
    columnEl.addEventListener("column-delete", (function(_this) {
      return function() {
        var toast;
        toast = document.getElementById("removed_toast_wrapper");
        toast.column = column;
        toast.restore = function() {
          var newcolumn;
          newcolumn = new Columns[column.className](column);
          _this.addColumn(newcolumn);
          return _this.packery.layout();
        };
        document.getElementById("removed_toast").show();
        _this.packery.remove(columnEl);
        _this.usedColumns = _this.usedColumns.filter(function(c) {
          return c.id !== column.id;
        });
        return _this.syncAll();
      };
    })(this));
    columnEl.addEventListener("column-refresh", (function(_this) {
      return function() {
        return column.refresh(columnEl, holderEl);
      };
    })(this));
    columnEl.addEventListener("column-settings", (function(_this) {
      return function() {
        return column.settings(function() {
          return column.refresh(columnEl, holderEl);
        });
      };
    })(this));
    if (this.editMode) {
      column.editMode(true);
    }
    return columnEl.animate([
      {
        opacity: 0
      }, {
        opacity: 1
      }
    ], {
      direction: 'alternate',
      duration: 500
    });
  };

  Tabbie.prototype.noColumnsCheck = function() {
    var op;
    if (this.packery.items.length > 0) {
      op = 0;
    } else {
      op = 1;
    }
    return document.querySelector(".no-columns-container").style.opacity = op;
  };

  Tabbie.prototype.autoRefresh = function() {
    return setInterval(function() {
      var column, j, len, ref, results;
      ref = document.querySelectorAll("item-column");
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        column = ref[j];
        results.push(column.shadowRoot.querySelector("[icon='refresh']").dispatchEvent(new MouseEvent("click")));
      }
      return results;
    }, 1000 * 60 * 5);
  };

  Tabbie.prototype.layoutChanged = function() {
    var c, column, columnEl, columnId, item, j, k, l, len, len1, newconfig, position, ref, ref1, ref2, v;
    this.noColumnsCheck();
    ref = document.querySelectorAll("item-column");
    for (j = 0, len = ref.length; j < len; j++) {
      columnEl = ref[j];
      item = this.packery.getItem(columnEl);
      position = item.position;
      columnId = columnEl.querySelector("html /deep/ paper-shadow").templateInstance.model.column.id;
      ref1 = this.usedColumns;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        c = ref1[l];
        if (c.id === columnId) {
          column = c;
        }
      }
      newconfig = {};
      ref2 = column.config;
      for (k in ref2) {
        v = ref2[k];
        if (column.config.hasOwnProperty(k)) {
          newconfig[k] = v;
        }
      }
      newconfig.position = position;
      column.config = newconfig;
    }
    return this.syncAll();
  };

  Tabbie.prototype.sync = function(column, dontSyncAll) {
    this.usedColumns = this.usedColumns.map(function(c) {
      if (c.id === column.id) {
        c = column;
      }
      return c;
    });
    if (!dontSyncAll) {
      return this.syncAll();
    }
  };

  Tabbie.prototype.syncAll = function() {
    var column, j, len, ref, used;
    used = [];
    ref = this.usedColumns;
    for (j = 0, len = ref.length; j < len; j++) {
      column = ref[j];
      used.push(column.toJSON());
    }
    store.set("usedColumns", this.resortUsedColumns(used));
    store.set("customColumns", this.customColumns.map(function(column) {
      return column.toJSON();
    }));
    return store.set("lastRes", [document.body.clientHeight, document.body.clientWidth]);
  };

  Tabbie.prototype.renderBookmarkTree = function(holder, tree, level) {
    var item, j, len, paper, results;
    console.log("renderBookmarkTree level: ", level, " tree: ", tree);
    results = [];
    for (j = 0, len = tree.length; j < len; j++) {
      item = tree[j];
      paper = document.createElement("bookmark-item");
      paper.item = item;
      paper.level = level;
      paper.showdate = level === 0;
      paper.folder = !!item.children;
      paper.title = item.title;
      if (level !== 0) {
        paper.setAttribute("hidden", "");
      }
      paper.id = item.id;
      if (paper.folder) {
        paper.addEventListener("click", function() {
          var loopie;
          loopie = (function(_this) {
            return function(items) {
              var el, l, len1, results1;
              results1 = [];
              for (l = 0, len1 = items.length; l < len1; l++) {
                item = items[l];
                console.info("loopie id", item.id, "parent", item.parentId);
                el = holder.querySelector("[id='" + item.id + "']");
                el.opened = _this.opened;
                if (_this.opened) {
                  el.setAttribute("hidden", "");
                } else {
                  el.removeAttribute("hidden");
                }
                if (item.children && _this.opened) {
                  results1.push(loopie(item.children));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            };
          })(this);
          loopie(this.item.children, true);
          return this.opened = !this.opened;
        });
      }
      if (!paper.folder) {
        paper.url = item.url;
        paper.date = item.dateAdded;
      }
      holder.appendChild(paper);
      if (paper.folder) {
        results.push(this.renderBookmarkTree(holder, item.children, level + 1));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Tabbie.prototype.tour = function() {
    return setTimeout(function() {
      var steps;
      steps = document.querySelectorAll("tour-step");
      return steps[0].async((function(_this) {
        return function() {
          var currStep, endTour, j, len, step, tourEnded, tours;
          currStep = 0;
          tourEnded = false;
          tours = document.querySelector("#tours");
          tours.endTour = endTour = function() {
            store.set("notour", true);
            return tourEnded = true;
          };
          tours.openFabs = function(e) {
            if (e.detail) {
              return document.querySelector(".fabs").dispatchEvent(new MouseEvent('mouseenter'));
            } else {
              return document.querySelector(".fabs").dispatchEvent(new MouseEvent('mouseleave'));
            }
          };
          for (j = 0, len = steps.length; j < len; j++) {
            step = steps[j];
            step.addEventListener("core-overlay-open", function(e) {
              if (e.detail || tourEnded) {
                return;
              }
              currStep++;
              step = steps[currStep];
              if (typeof step === 'undefined') {
                return endTour();
              } else {
                return step.toggle();
              }
            });
          }
          return steps[0].toggle();
        };
      })(this));
    }, 1000);
  };

  Tabbie.prototype.render = function() {
    var adddialog, allFabs, closeSearch, col, cols, column, columnchooser, customColumns, fab, fabs, i, j, l, len, len1, len2, len3, len4, m, n, newcol, o, query, ref, ref1, res, search, searchBar, searchProgress, searchSuggestions, timeout, trans, updateFab, updatediag;
    console.timeEnd('polymer-ready');
    console.time('tabbie render');
    if (!store.has("notour")) {
      this.tour();
    }
    if (!(cols = store.get("usedColumns"))) {
      this.usedColumns = [];
    } else {
      for (i = j = 0, len = cols.length; j < len; i = ++j) {
        col = cols[i];
        if (typeof Columns[col.className] === 'undefined') {
          delete cols[i];
          continue;
        }
        newcol = new Columns[col.className](col);
        cols[i] = newcol;
      }
      this.usedColumns = cols;
    }
    this.meta = document.getElementById("meta");
    ref = this.columnNames;
    for (l = 0, len1 = ref.length; l < len1; l++) {
      column = ref[l];
      if (typeof Columns[column] !== 'undefined') {
        this.columns.push(new Columns[column]({}, true));
      }
    }
    customColumns = store.get("customColumns", []);
    for (m = 0, len2 = customColumns.length; m < len2; m++) {
      column = customColumns[m];
      this.customColumns.push(new Columns[column.className](column));
    }
    ref1 = this.customColumns;
    for (n = 0, len3 = ref1.length; n < len3; n++) {
      column = ref1[n];
      this.columns.push(column);
    }
    this.resortColumns();
    this.packery = new Packery(document.querySelector(".column-holder"), {
      columnWidth: ".grid-sizer",
      rowHeight: ".grid-sizer",
      itemSelector: "item-column"
    });
    this.packery.on("dragItemPositioned", this.layoutChanged);
    this.packery.on("layoutComplete", this.layoutChanged);
    this.packery.on("removeComplete", (function(_this) {
      return function() {
        return _this.packery.layout();
      };
    })(this));
    this.renderColumns();
    this.noColumnsCheck();
    this.autoRefresh();
    res = store.get("lastRes", false);
    if (res && (res[0] !== document.body.clientHeight || res[1] !== document.body.clientWidth)) {
      this.packery.layout();
    }
    document.querySelector("#about").async((function(_this) {
      return function() {
        var item, len4, o, ref2, results;
        ref2 = document.querySelectorAll("#about paper-item");
        results = [];
        for (o = 0, len4 = ref2.length; o < len4; o++) {
          item = ref2[o];
          results.push(item.addEventListener("click", function() {
            if (this.getAttribute("href")) {
              return window.open(this.getAttribute("href"));
            }
          }));
        }
        return results;
      };
    })(this));
    fabs = document.querySelector(".fabs");
    allFabs = [".fab-edit", ".fab-about", ".fab-update"];
    allFabs = allFabs.map(function() {
      return document.querySelector(arguments[0]);
    });
    trans = this.meta.byId("core-transition-center");
    for (o = 0, len4 = allFabs.length; o < len4; o++) {
      fab = allFabs[o];
      trans.setup(fab);
      fab.removeAttribute("hidden");
    }
    fabs.addEventListener("mouseenter", function() {
      var len5, p, results;
      results = [];
      for (p = 0, len5 = allFabs.length; p < len5; p++) {
        fab = allFabs[p];
        results.push(trans.go(fab, {
          opened: true
        }));
      }
      return results;
    });
    fabs.addEventListener("mouseleave", function() {
      var len5, p, results;
      results = [];
      for (p = 0, len5 = allFabs.length; p < len5; p++) {
        fab = allFabs[p];
        results.push(trans.go(fab, {
          opened: false
        }));
      }
      return results;
    });
    document.querySelector(".fab-edit").addEventListener("click", (function(_this) {
      return function(e) {
        var active, len5, p, ref2, results;
        if (active = e.target.classList.contains("active")) {
          e.target.classList.remove("active");
        } else {
          e.target.classList.add("active");
        }
        _this.editMode = !active;
        ref2 = _this.usedColumns;
        results = [];
        for (p = 0, len5 = ref2.length; p < len5; p++) {
          column = ref2[p];
          results.push(column.editMode(!active));
        }
        return results;
      };
    })(this));
    document.querySelector(".fab-about").addEventListener("click", (function(_this) {
      return function() {
        var aboutdialog, fabanim, templ;
        aboutdialog = document.querySelector("#about");
        templ = aboutdialog.querySelector("html /deep/ template");
        templ.version = _this.version;
        templ.polymerVersion = Polymer.version;
        fabanim = document.createElement("fab-anim");
        fabanim.classList.add("fab-anim-about");
        aboutdialog.toggle(function() {
          return fabanim.remove();
        });
        document.body.appendChild(fabanim);
        return fabanim.play();
      };
    })(this));
    updateFab = document.querySelector(".fab-update");
    if (store.has("hideUpdateButton" + this.version)) {
      updateFab.parentNode.style.display = "none";
    }
    updatediag = document.querySelector("#update");
    updatediag.querySelector(".hide-button").addEventListener("click", (function(_this) {
      return function() {
        store.set("hideUpdateButton" + _this.version, "1");
        document.querySelector(".fab-update-wrapper");
        updatediag.toggle();
        return updateFab.parentNode.style.display = "none";
      };
    })(this));
    updateFab.addEventListener("click", (function(_this) {
      return function() {
        var fabanim;
        fabanim = document.createElement("fab-anim");
        fabanim.classList.add("fab-anim-update");
        updatediag.toggle(function() {
          return fabanim.remove();
        });
        document.body.appendChild(fabanim);
        return fabanim.play();
      };
    })(this));
    columnchooser = document.querySelector("html /deep/ column-chooser");
    columnchooser.columns = this.columns;
    adddialog = document.querySelector("#addcolumn");
    search = document.querySelector("#searchdialog");
    searchBar = search.querySelector(".search-bar");
    searchProgress = search.querySelector(".search-progress");
    searchSuggestions = search.querySelector("auto-suggestions");
    search.replaceHeader([searchBar, searchProgress]);
    closeSearch = function() {
      return search.toggle(function() {
        searchBar.value = "";
        return searchSuggestions.suggestions = [];
      });
    };
    searchSuggestions.addEventListener("suggestion-chosen", (function(_this) {
      return function(e) {
        _this.createColumnFromFeedly(e.detail);
        return closeSearch();
      };
    })(this));
    query = "";
    timeout = void 0;
    searchBar.addEventListener("keydown", (function(_this) {
      return function(e) {
        var prevent;
        prevent = true;
        switch (e.keyCode) {
          case 40:
            searchSuggestions.highlightDown();
            break;
          case 38:
            searchSuggestions.highlightUp();
            break;
          case 13:
            searchSuggestions.highlightChosen();
            break;
          case 27:
            closeSearch();
            break;
          default:
            prevent = false;
        }
        if (prevent) {
          return e.preventDefault();
        }
      };
    })(this));
    searchBar.addEventListener("keyup", (function(_this) {
      return function(e) {
        if (query !== searchBar.value) {
          query = searchBar.value;
          if (!query) {
            searchSuggestions.suggestions = [];
            searchSuggestions.error = false;
            return;
          }
          if (timeout) {
            clearTimeout(timeout);
          }
          return timeout = setTimeout(function() {
            searchProgress.setAttribute("active", "");
            return fetch("https://feedly.com/v3/search/auto-complete?query=" + query + "&sites=10&topics=0&libraries=0&locale=en-US").then(function(response) {
              if (response.status === 200) {
                return Promise.resolve(response);
              } else {
                return Promise.reject(new Error(response.statusText));
              }
            }).then(function(response) {
              return response.json();
            }).then(function(json) {
              searchSuggestions.suggestions = json.sites;
              searchSuggestions.error = false;
              return searchProgress.removeAttribute("active");
            })["catch"](function(error) {
              searchProgress.removeAttribute("active");
              console.error(error);
              searchSuggestions.suggestions = [];
              return searchSuggestions.error = true;
            });
          }, 300);
        }
      };
    })(this));
    adddialog.addButton('add', function() {
      return chrome.permissions.request({
        origins: ["https://feedly.com/", "http://storage.googleapis.com/"]
      }, (function(_this) {
        return function(granted) {
          if (granted) {
            search.toggle();
            return searchBar.focus();
          }
        };
      })(this));
    });
    columnchooser.async((function(_this) {
      return function() {
        return columnchooser.shadowRoot.addEventListener("click", function(e) {
          if (!e.target.matches(".grid .column paper-ripple")) {
            return;
          }
          column = e.target.templateInstance.model.column;
          return column.attemptAdd(function() {
            var newcolumn;
            adddialog.toggle();
            newcolumn = new Columns[column.className](column);
            _this.addColumn(newcolumn);
            return _this.packery.layout();
          });
        });
      };
    })(this));
    columnchooser.addEventListener("delete-column", (function(_this) {
      return function(e) {
        var colEl, len5, p, ref2;
        ref2 = columnchooser.shadowRoot.querySelectorAll(".column");
        for (p = 0, len5 = ref2.length; p < len5; p++) {
          colEl = ref2[p];
          if (colEl.templateInstance.model.column === e.detail) {
            columnchooser.packery.remove(colEl);
          }
        }
        _this.customColumns.splice(_this.customColumns.indexOf(e.detail), 1);
        return _this.syncAll();
      };
    })(this));
    document.querySelector(".fab-add").addEventListener("click", (function(_this) {
      return function() {
        var fabanim;
        fabanim = document.createElement("fab-anim");
        fabanim.classList.add("fab-anim-add");
        adddialog.toggle(function() {
          return fabanim.remove();
        }, function() {
          return columnchooser.shown();
        });
        document.body.appendChild(fabanim);
        return fabanim.play();
      };
    })(this));
    document.querySelector(".bookmarks-drawer-button").addEventListener("click", function() {
      var settings;
      settings = document.querySelector(".settings");
      return chrome.permissions.request({
        permissions: ["bookmarks"],
        origins: ["chrome://favicon/*"]
      }, (function(_this) {
        return function(granted) {
          var drawer;
          if (granted) {
            drawer = document.querySelector("app-drawer.bookmarks");
            drawer.show();
            drawer.addEventListener("opened-changed", function() {
              if (this.opened) {
                return settings.classList.add("force");
              } else {
                return settings.classList.remove("force");
              }
            });
            chrome.bookmarks.getRecent(20, function(tree) {
              var recent;
              console.log(tree);
              recent = drawer.querySelector(".recent");
              recent.innerHTML = "";
              return tabbie.renderBookmarkTree(recent, tree, 0);
            });
            return chrome.bookmarks.getTree(function(tree) {
              var all;
              tree = tree[0].children;
              console.log("tree", tree);
              all = drawer.querySelector(".all");
              all.innerHTML = "";
              return tabbie.renderBookmarkTree(all, tree, 0);
            });
          }
        };
      })(this));
    });
    document.querySelector(".top-drawer-button").addEventListener("click", function() {
      var settings;
      settings = document.querySelector(".settings");
      return chrome.permissions.request({
        permissions: ["topSites"],
        origins: ["chrome://favicon/*"]
      }, (function(_this) {
        return function(granted) {
          if (granted) {
            return chrome.topSites.get(function(sites) {
              var drawer, len5, p, paper, results, site;
              console.log(sites);
              drawer = document.querySelector("app-drawer.top");
              drawer.innerHTML = "";
              drawer.show();
              drawer.addEventListener("opened-changed", function() {
                if (this.opened) {
                  return settings.classList.add("force");
                } else {
                  return settings.classList.remove("force");
                }
              });
              results = [];
              for (p = 0, len5 = sites.length; p < len5; p++) {
                site = sites[p];
                paper = document.createElement("bookmark-item");
                paper.showdate = false;
                paper.title = site.title;
                paper.url = site.url;
                results.push(drawer.appendChild(paper));
              }
              return results;
            });
          }
        };
      })(this));
    });
    document.querySelector(".app-drawer-button").addEventListener("click", function() {
      var settings;
      settings = document.querySelector(".settings");
      return chrome.permissions.request({
        permissions: ["management"],
        origins: ["chrome://favicon/*"]
      }, (function(_this) {
        return function(granted) {
          if (granted) {
            return chrome.management.getAll(function(extensions) {
              var app, drawer, e, extension, len5, p, results;
              drawer = document.querySelector("app-drawer.apps");
              drawer.innerHTML = "";
              drawer.show();
              drawer.addEventListener("opened-changed", function() {
                if (this.opened) {
                  return settings.classList.add("force");
                } else {
                  return settings.classList.remove("force");
                }
              });
              results = [];
              for (p = 0, len5 = extensions.length; p < len5; p++) {
                extension = extensions[p];
                if (!(extension.type.indexOf("app") !== -1 && !extension.disabled)) {
                  continue;
                }
                console.log(extension);
                app = document.createElement("app-item");
                try {
                  app.name = extension.name;
                  app.icon = extension.icons[extension.icons.length - 1].url;
                  app.id = extension.id;
                } catch (error1) {
                  e = error1;
                  console.warn(e);
                }
                app.addEventListener("click", function() {
                  return chrome.management.launchApp(this.id);
                });
                results.push(drawer.appendChild(app));
              }
              return results;
            });
          }
        };
      })(this));
    });
    console.timeEnd('tabbie render');
    return document.querySelector(".recently-drawer-button").addEventListener("click", function() {
      var settings;
      settings = document.querySelector(".settings");
      return chrome.permissions.request({
        permissions: ["sessions", "tabs"],
        origins: ["chrome://favicon/*"]
      }, (function(_this) {
        return function(granted) {
          if (granted) {
            return chrome.sessions.getRecentlyClosed(function(sites) {
              var drawer, len5, p, paper, results, site;
              console.log(sites);
              drawer = document.querySelector("app-drawer.recently");
              drawer.innerHTML = "";
              drawer.show();
              drawer.addEventListener("opened-changed", function() {
                if (this.opened) {
                  return settings.classList.add("force");
                } else {
                  return settings.classList.remove("force");
                }
              });
              results = [];
              for (p = 0, len5 = sites.length; p < len5; p++) {
                site = sites[p];
                paper = document.createElement("recently-item");
                if (site.hasOwnProperty("tab")) {
                  paper.window = 0;
                  paper.url = site.tab.url;
                  paper.title = site.tab.title;
                  paper.sessId = site.tab.sessionId;
                } else {
                  paper.window = 1;
                  paper.tab_count = site.window.tabs.length;
                  paper.sessId = site.window.sessionId;
                }
                paper.addEventListener("click", function() {
                  chrome.sessions.restore(this.sessId);
                  return drawer.hide();
                });
                results.push(drawer.appendChild(paper));
              }
              return results;
            });
          }
        };
      })(this));
    });
  };

  Tabbie.prototype.register = function(columnName) {
    return this.columnNames.push(columnName);
  };

  Tabbie.prototype.createColumnFromFeedly = function(feedly) {
    var column, thumb;
    if (feedly.visualUrl) {
      thumb = feedly.visualUrl;
    } else {
      thumb = "img/column-unknown.png";
    }
    column = new Columns.CustomColumn({
      name: feedly.title,
      link: feedly.website,
      baseUrl: "https://feedly.com/v3/streams/contents?count=20&streamId=" + encodeURIComponent(feedly.feedId) + "&continuation={PAGENUM}",
      thumb: thumb,
      custom: true
    });
    this.customColumns.push(column);
    this.columns.push(column);
    this.resortColumns();
    return this.syncAll();
  };

  Tabbie.prototype.resortColumns = function() {
    return this.columns.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  Tabbie.prototype.resortUsedColumns = function(used) {
    used = used.map(function(clmn) {
      if (!clmn.config.position) {
        clmn.config.position = {
          x: 0,
          y: 0
        };
      }
      return clmn;
    });
    return used.sort(function(a, b) {
      return a.config.position.y - b.config.position.y || a.config.position.x - b.config.position.x;
    });
  };

  Tabbie.prototype.customColumns = [];

  Tabbie.prototype.packery = null;

  Tabbie.prototype.columns = [];

  Tabbie.prototype.columnNames = [];

  Tabbie.prototype.usedColumns = [];

  return Tabbie;

})();

tabbie = new Tabbie;

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Apps = (function(superClass) {
  extend(Apps, superClass);

  function Apps() {
    this.attemptAdd = bind(this.attemptAdd, this);
    return Apps.__super__.constructor.apply(this, arguments);
  }

  Apps.prototype.name = "Apps";

  Apps.prototype.thumb = "img/column-apps.png";

  Apps.prototype.flex = true;

  Apps.prototype.link = "chrome://apps";

  Apps.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      permissions: ["management"],
      origins: ["chrome://favicon/*"]
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          if (typeof successCallback === 'function') {
            return successCallback();
          }
        }
      };
    })(this));
  };

  Apps.prototype.refresh = function(columnElement, holderElement) {
    holderElement.innerHTML = "";
    return chrome.management.getAll((function(_this) {
      return function(extensions) {
        var app, e, extension, hack, i, j, len, num, results;
        for (i = 0, len = extensions.length; i < len; i++) {
          extension = extensions[i];
          if (!(extension.type.indexOf("app") !== -1 && !extension.disabled)) {
            continue;
          }
          console.log(extension);
          app = document.createElement("app-item");
          try {
            app.name = extension.name;
            app.icon = extension.icons[extension.icons.length - 1].url;
            app.id = extension.id;
          } catch (error) {
            e = error;
            console.warn(e);
          }
          app.addEventListener("click", function() {
            return chrome.management.launchApp(this.id);
          });
          holderElement.appendChild(app);
        }
        results = [];
        for (num = j = 0; j <= 10; num = ++j) {
          if (!_this.flex) {
            continue;
          }
          hack = document.createElement("app-item");
          hack.className = "hack";
          results.push(holderElement.appendChild(hack));
        }
        return results;
      };
    })(this));
  };

  Apps.prototype.render = function(columnElement, holderElement) {
    Apps.__super__.render.call(this, columnElement, holderElement);
    this.refreshing = false;
    this.loading = false;
    return this.refresh(columnElement, holderElement);
  };

  return Apps;

})(Columns.Column);

tabbie.register("Apps");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Behance = (function(superClass) {
  extend(Behance, superClass);

  function Behance() {
    return Behance.__super__.constructor.apply(this, arguments);
  }

  Behance.prototype.name = "Behance";

  Behance.prototype.width = 2;

  Behance.prototype.thumb = "img/column-behance.png";

  Behance.prototype.link = "https://www.behance.net/";

  Behance.prototype.element = "behance-item";

  Behance.prototype.url = "https://api.behance.net/v2/projects?page={PAGENUM}&api_key=IRZkzuavyQ8XBNihD290wtgt4AlwYo6X";

  Behance.prototype.dataPath = "projects";

  Behance.prototype.flex = true;

  Behance.prototype.infiniteScroll = true;

  return Behance;

})(Columns.FeedColumn);

tabbie.register("Behance");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Bookmarks = (function(superClass) {
  extend(Bookmarks, superClass);

  function Bookmarks() {
    this.attemptAdd = bind(this.attemptAdd, this);
    return Bookmarks.__super__.constructor.apply(this, arguments);
  }

  Bookmarks.prototype.name = "Bookmarks";

  Bookmarks.prototype.thumb = "img/column-bookmarks.png";

  Bookmarks.prototype.link = "chrome://bookmarks";

  Bookmarks.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      permissions: ["bookmarks"],
      origins: ["chrome://favicon/*"]
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          if (typeof successCallback === 'function') {
            return successCallback();
          }
        }
      };
    })(this));
  };

  Bookmarks.prototype.refresh = function(columnElement, holderElement) {
    var all, recent;
    this.tabs.innerHTML = "";
    recent = document.createElement("div");
    recent.classList.add("recent");
    this.tabs.appendChild(recent);
    all = document.createElement("div");
    all.classList.add("all");
    this.tabs.appendChild(all);
    chrome.bookmarks.getRecent(20, (function(_this) {
      return function(tree) {
        return tabbie.renderBookmarkTree(recent, tree, 0);
      };
    })(this));
    return chrome.bookmarks.getTree((function(_this) {
      return function(tree) {
        tree = tree[0].children;
        return tabbie.renderBookmarkTree(all, tree, 0);
      };
    })(this));
  };

  Bookmarks.prototype.render = function(columnElement, holderElement) {
    Bookmarks.__super__.render.call(this, columnElement, holderElement);
    this.refreshing = false;
    this.loading = false;
    holderElement.innerHTML = "";
    this.tabs = document.createElement("bookmark-tabs");
    holderElement.appendChild(this.tabs);
    return this.refresh(columnElement, holderElement);
  };

  return Bookmarks;

})(Columns.Column);

tabbie.register("Bookmarks");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.ClosedTabs = (function(superClass) {
  extend(ClosedTabs, superClass);

  function ClosedTabs() {
    this.attemptAdd = bind(this.attemptAdd, this);
    return ClosedTabs.__super__.constructor.apply(this, arguments);
  }

  ClosedTabs.prototype.name = "Closed tabs";

  ClosedTabs.prototype.thumb = "img/column-closedtabs.png";

  ClosedTabs.prototype.link = "chrome://history";

  ClosedTabs.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      permissions: ["sessions", "tabs"],
      origins: ["chrome://favicon/*"]
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          if (typeof successCallback === 'function') {
            return successCallback();
          }
        }
      };
    })(this));
  };

  ClosedTabs.prototype.refresh = function(columnElement, holderElement) {
    holderElement.innerHTML = "";
    return chrome.sessions.getRecentlyClosed((function(_this) {
      return function(sites) {
        var i, len, paper, results, site;
        results = [];
        for (i = 0, len = sites.length; i < len; i++) {
          site = sites[i];
          paper = document.createElement("recently-item");
          if (site.hasOwnProperty("tab")) {
            paper.window = 0;
            paper.url = site.tab.url;
            paper.title = site.tab.title;
            paper.sessId = site.tab.sessionId;
          } else {
            paper.window = 1;
            paper.tab_count = site.window.tabs.length;
            paper.sessId = site.window.sessionId;
          }
          paper.addEventListener("click", function() {
            return chrome.sessions.restore(this.sessId);
          });
          results.push(holderElement.appendChild(paper));
        }
        return results;
      };
    })(this));
  };

  ClosedTabs.prototype.render = function(columnElement, holderElement) {
    ClosedTabs.__super__.render.call(this, columnElement, holderElement);
    this.refreshing = false;
    this.loading = false;
    return this.refresh(columnElement, holderElement);
  };

  return ClosedTabs;

})(Columns.Column);

tabbie.register("ClosedTabs");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Codepen = (function(superClass) {
  extend(Codepen, superClass);

  function Codepen() {
    return Codepen.__super__.constructor.apply(this, arguments);
  }

  Codepen.prototype.name = "Codepen";

  Codepen.prototype.width = 2;

  Codepen.prototype.thumb = "img/column-codepen.png";

  Codepen.prototype.link = "https://codepen.io";

  Codepen.prototype.element = "codepen-item";

  Codepen.prototype.url = "http://codepen.io/picks/feed/";

  Codepen.prototype.responseType = "xml";

  Codepen.prototype.xmlTag = "item";

  Codepen.prototype.flex = true;

  Codepen.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      origins: ['http://codepen.io/']
    }, (function(_this) {
      return function(granted) {
        if (granted && typeof successCallback === 'function') {
          return successCallback();
        }
      };
    })(this));
  };

  return Codepen;

})(Columns.FeedColumn);

tabbie.register("Codepen");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.CustomColumn = (function(superClass) {
  extend(CustomColumn, superClass);

  function CustomColumn() {
    this.attemptAdd = bind(this.attemptAdd, this);
    this.draw = bind(this.draw, this);
    return CustomColumn.__super__.constructor.apply(this, arguments);
  }

  CustomColumn.prototype.element = "feedly-item";

  CustomColumn.prototype.responseType = "json";

  CustomColumn.prototype.page = "";

  CustomColumn.prototype.infiniteScroll = true;

  CustomColumn.prototype.draw = function(data, holderElement) {
    if (typeof data.length !== 'number') {
      this.page = data.continuation;
      data = data.items;
      this.cache = data;
    }
    return CustomColumn.__super__.draw.call(this, data, holderElement);
  };

  CustomColumn.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      origins: ["https://feedly.com/"]
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          if (typeof successCallback === "function") {
            return successCallback();
          }
        }
      };
    })(this));
  };

  return CustomColumn;

})(Columns.FeedColumn);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.DesignerNews = (function(superClass) {
  extend(DesignerNews, superClass);

  function DesignerNews() {
    return DesignerNews.__super__.constructor.apply(this, arguments);
  }

  DesignerNews.prototype.name = "DesignerNews";

  DesignerNews.prototype.width = 1;

  DesignerNews.prototype.thumb = "img/column-designernews.png";

  DesignerNews.prototype.link = "https://www.designernews.co/";

  DesignerNews.prototype.url = "https://api.designernews.co/api/v2/stories/";

  DesignerNews.prototype.element = "dn-item";

  DesignerNews.prototype.dataPath = "stories";

  return DesignerNews;

})(Columns.FeedColumn);

tabbie.register("DesignerNews");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Dribbble = (function(superClass) {
  extend(Dribbble, superClass);

  function Dribbble() {
    return Dribbble.__super__.constructor.apply(this, arguments);
  }

  Dribbble.prototype.name = "Dribbble";

  Dribbble.prototype.width = 2;

  Dribbble.prototype.thumb = "img/column-dribble.png";

  Dribbble.prototype.link = "https://dribbble.com";

  Dribbble.prototype.element = "dribbble-item";

  Dribbble.prototype.url = "https://api.dribbble.com/v1/shots?page={PAGENUM}&access_token=74f8fb9f92c1f79c4bc3662f708dfdce7cd05c3fc67ac84ae68ff47568b71a1f";

  Dribbble.prototype.infiniteScroll = true;

  Dribbble.prototype.flex = true;

  return Dribbble;

})(Columns.FeedColumn);

tabbie.register("Dribbble");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.GitHub = (function(superClass) {
  extend(GitHub, superClass);

  function GitHub() {
    return GitHub.__super__.constructor.apply(this, arguments);
  }

  GitHub.prototype.name = "GitHub";

  GitHub.prototype.width = 1;

  GitHub.prototype.thumb = "img/column-github.png";

  GitHub.prototype.link = "https://github.com";

  GitHub.prototype.element = "github-item";

  GitHub.prototype.dataPath = "items";

  GitHub.prototype.dialog = "github-dialog";

  GitHub.prototype.refresh = function(columnElement, holderElement) {
    var date, language, period;
    if (typeof this.config.period === "undefined") {
      this.config.period = 1;
    }
    switch (this.config.period) {
      case 0:
        period = "month";
        break;
      case 1:
        period = "week";
        break;
      case 2:
        period = "day";
    }
    if (typeof this.config.language === "undefined") {
      this.config.language = 0;
    }
    switch (this.config.language) {
      case 0:
        language = "";
        break;
      case 1:
        language = "+language:CSS";
        break;
      case 2:
        language = "+language:HTML";
        break;
      case 3:
        language = "+language:Java";
        break;
      case 4:
        language = "+language:JavaScript";
        break;
      case 5:
        language = "+language:PHP";
        break;
      case 6:
        language = "+language:Python";
        break;
      case 7:
        language = "+language:Ruby";
    }
    date = new moment;
    date.subtract(1, period);
    this.url = "https://api.github.com/search/repositories?q=created:>=" + date.format("YYYY-MM-DD") + language + "&sort=stars&order=desc";
    return GitHub.__super__.refresh.call(this, columnElement, holderElement);
  };

  return GitHub;

})(Columns.FeedColumn);

tabbie.register("GitHub");


    //util functions kindly stolen from https://github.com/ebidel/polymer-gmail/

    function getValueForHeaderField(headers, field) {
        for (var i = 0, header; header = headers[i]; ++i) {
            if (header.name == field || header.name == field.toLowerCase()) {
                return header.value;
            }
        }
        return null;
    }

    function fixUpMessages(resp) {
        var messages = resp.result.messages;

        for (var j = 0, m; m = messages[j]; ++j) {
            var headers = m.payload.headers;
            var keep = ['subject', 'snippet', 'id', 'threadId']
            message = {}
            keep.forEach(function(key) {
                message[key] = m[key]
            })

            // Example: Thu Sep 25 2014 14:43:18 GMT-0700 (PDT) -> Sept 25.
            var date = new Date(getValueForHeaderField(headers, 'Date'));
            message.date = date.toDateString().split(' ').slice(1, 3).join(' ');
            message.to = getValueForHeaderField(headers, 'To');
            message.subject = getValueForHeaderField(headers, 'Subject');

            var fromHeaders = getValueForHeaderField(headers, 'From');
            var fromHeaderMatches = fromHeaders.match(new RegExp(/"?(.*?)"?\s?<(.*)>/));

            message.from = {};

            // Use name if one was found. Otherwise, use email address.
            if (fromHeaderMatches) {
                // If no a name, use email address for displayName.
                message.from.name = fromHeaderMatches[1].length ? fromHeaderMatches[1] : fromHeaderMatches[2];
                message.from.email = fromHeaderMatches[2];
            } else {
                message.from.name = fromHeaders.split('@')[0];
                message.from.email = fromHeaders;
            }
            message.from.name = message.from.name.split('@')[0]; // Ensure email is split.

            message.unread = m.labelIds.indexOf("UNREAD") != -1;
            message.starred = m.labelIds.indexOf("STARRED") != -1;

            messages[j] = message
        }

        return messages;
    }
;
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Gmail = (function(superClass) {
  extend(Gmail, superClass);

  function Gmail() {
    this.draw = bind(this.draw, this);
    this.logOut = bind(this.logOut, this);
    return Gmail.__super__.constructor.apply(this, arguments);
  }

  Gmail.prototype.name = "Gmail";

  Gmail.prototype.thumb = "img/column-gmail.png";

  Gmail.prototype.dialog = "gmail-dialog";

  Gmail.prototype.link = "https://mail.google.com/";

  Gmail.prototype.holderEl = void 0;

  Gmail.prototype.columnEl = void 0;

  Gmail.prototype.logOut = function() {
    this.holderEl.innerHTML = "";
    this.loading = true;
    delete this.config.user;
    this.cache = [];
    tabbie.sync(this);
    return chrome.identity.getAuthToken({
      interactive: false
    }, (function(_this) {
      return function(token) {
        if (!chrome.runtime.lastError) {
          return chrome.identity.removeCachedAuthToken({
            token: token
          }, function() {
            return fetch("https://accounts.google.com/o/oauth2/revoke?token=" + token)["catch"](function() {
              return setTimeout(function() {
                _this.loading = false;
                return _this.refresh(_this.columnEl, _this.holderEl);
              }, 1000);
            });
          });
        }
      };
    })(this));
  };

  Gmail.prototype.draw = function(data, holderElement) {
    var child, i, item, len, results;
    this.loading = false;
    this.refreshing = false;
    holderElement.innerHTML = "";
    results = [];
    for (i = 0, len = data.length; i < len; i++) {
      item = data[i];
      child = document.createElement("gmail-item");
      child.item = item;
      results.push(holderElement.appendChild(child));
    }
    return results;
  };

  Gmail.prototype.render = function(columnElement, holderElement) {
    Gmail.__super__.render.call(this, columnElement, holderElement);
    this.columnEl = columnElement;
    this.holderEl = holderElement;
    if (Object.keys(this.cache).length) {
      this.draw(this.cache, holderElement);
    }
    return this.refresh(columnElement, holderElement);
  };

  Gmail.prototype.gapiLoaded = false;

  Gmail.prototype.errored = false;

  Gmail.prototype.refresh = function(columnElement, holderElement) {
    var gapiEl;
    if (!this.config.colors) {
      this.config.colors = {};
    }
    this.refreshing = true;
    gapiEl = document.createElement("google-client-api");
    columnElement.appendChild(gapiEl);
    setTimeout((function(_this) {
      return function() {
        if (!_this.gapiLoaded) {
          _this.errored = true;
          _this.refreshing = false;
          _this.loading = false;
          return _this.error(holderElement);
        }
      };
    })(this), 5000);
    return gapiEl.addEventListener("api-load", (function(_this) {
      return function() {
        _this.gapiLoaded = true;
        console.info('gapi loaded');
        return chrome.identity.getAuthToken({
          interactive: false
        }, function(token) {
          var auth;
          if (!chrome.runtime.lastError) {
            gapi.auth.setToken({
              access_token: token,
              duration: "52000",
              state: "https://www.googleapis.com/auth/gmail.modify"
            });
            console.log("Auth token data", gapi.auth.getToken());
            return gapi.client.load("gmail", "v1", function() {
              var gmail;
              if (!_this.config.user) {
                gapi.client.load("plus", "v1", function() {
                  var batch;
                  console.info("gplus loaded");
                  batch = gapi.client.newBatch();
                  batch.add(gapi.client.plus.people.get({
                    userId: 'me'
                  }));
                  batch.add(gapi.client.gmail.users.getProfile({
                    userId: 'me'
                  }));
                  return batch.then(function(resp) {
                    var item, k, key, ref, results, value;
                    _this.config.user = {};
                    ref = resp.result;
                    results = [];
                    for (k in ref) {
                      item = ref[k];
                      results.push((function() {
                        var ref1, results1;
                        ref1 = item.result;
                        results1 = [];
                        for (key in ref1) {
                          value = ref1[key];
                          results1.push(this.config.user[key] = value);
                        }
                        return results1;
                      }).call(_this));
                    }
                    return results;
                  });
                });
              }
              console.info("user", _this.config.user);
              console.info("gmail loaded");
              gmail = gapi.client.gmail.users;
              return gmail.threads.list({
                userId: 'me',
                q: 'in:inbox'
              }).then(function(resp) {
                var batch;
                batch = gapi.client.newBatch();
                if (!resp.result.threads) {
                  _this.draw([], holderElement);
                  return;
                }
                resp.result.threads.forEach(function(thread) {
                  var req;
                  req = gmail.threads.get({
                    userId: 'me',
                    id: thread.id
                  });
                  return batch.add(req);
                });
                return batch.then(function(resp) {
                  var fixed, item, key, message, messages, ref;
                  messages = [];
                  ref = resp.result;
                  for (key in ref) {
                    item = ref[key];
                    fixed = fixUpMessages(item);
                    message = fixed[0];
                    message.amount = fixed.length;
                    if (!_this.config.colors[message.from.email]) {
                      message.color = _this.config.colors[message.from.email] = Please.make_color()[0];
                    } else {
                      message.color = _this.config.colors[message.from.email];
                    }
                    messages.push(message);
                  }
                  messages = messages.sort(function(a, b) {
                    var ax, bx;
                    ax = parseInt(a.id, 16);
                    bx = parseInt(b.id, 16);
                    if (ax > bx) {
                      return -1;
                    } else {
                      return 1;
                    }
                  });
                  _this.cache = messages;
                  tabbie.sync(_this);
                  return _this.draw(messages, holderElement);
                });
              });
            });
          } else {
            _this.loading = false;
            _this.refreshing = false;
            auth = document.createElement("gmail-auth");
            auth.addEventListener("sign-in", function() {
              return _this.render(columnElement, holderElement);
            });
            holderElement.innerHTML = "";
            return holderElement.appendChild(auth);
          }
        });
      };
    })(this));
  };

  return Gmail;

})(Columns.Column);

tabbie.register("Gmail");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.HackerNews = (function(superClass) {
  extend(HackerNews, superClass);

  function HackerNews() {
    return HackerNews.__super__.constructor.apply(this, arguments);
  }

  HackerNews.prototype.name = "HackerNews";

  HackerNews.prototype.thumb = "img/column-hackernews.png";

  HackerNews.prototype.url = "https://api.pnd.gs/v1/sources/hackerNews/popular";

  HackerNews.prototype.element = "hn-item";

  HackerNews.prototype.link = "https://news.ycombinator.com/";

  return HackerNews;

})(Columns.FeedColumn);

tabbie.register("HackerNews");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Lobsters = (function(superClass) {
  extend(Lobsters, superClass);

  function Lobsters() {
    this.refresh = bind(this.refresh, this);
    return Lobsters.__super__.constructor.apply(this, arguments);
  }

  Lobsters.prototype.name = "Lobste.rs";

  Lobsters.prototype.width = 1;

  Lobsters.prototype.thumb = "img/column-lobsters.png";

  Lobsters.prototype.link = "https://lobste.rs/";

  Lobsters.prototype.url = "https://lobste.rs/hottest.json";

  Lobsters.prototype.element = "lobsters-item";

  Lobsters.prototype.dialog = "lobsters-dialog";

  Lobsters.prototype.refresh = function(holderEl, columnEl) {
    var listing;
    if (!this.config.listing) {
      this.config.listing = 0;
    }
    switch (this.config.listing) {
      case 0:
        listing = "hottest";
        break;
      case 1:
        listing = "newest";
    }
    this.url = "https://lobste.rs/" + listing + ".json";
    return Lobsters.__super__.refresh.call(this, holderEl, columnEl);
  };

  return Lobsters;

})(Columns.FeedColumn);

tabbie.register("Lobsters");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.ProductHunt = (function(superClass) {
  extend(ProductHunt, superClass);

  function ProductHunt() {
    this.refresh = bind(this.refresh, this);
    return ProductHunt.__super__.constructor.apply(this, arguments);
  }

  ProductHunt.prototype.name = "ProductHunt";

  ProductHunt.prototype.thumb = "img/column-producthunt.png";

  ProductHunt.prototype.element = "ph-item";

  ProductHunt.prototype.dataPath = "posts";

  ProductHunt.prototype.link = "https://www.producthunt.com";

  ProductHunt.prototype.dialog = "ph-dialog";

  ProductHunt.prototype.width = 1;

  ProductHunt.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      origins: ['https://api.producthunt.com/']
    }, (function(_this) {
      return function(granted) {
        if (granted && typeof successCallback === 'function') {
          return successCallback();
        }
      };
    })(this));
  };

  ProductHunt.prototype.draw = function(data, holderElement) {
    if (!this.config.type) {
      this.config.type = "list";
    }
    this.element = this.config.type === "list" ? "ph-item" : "ph-thumb";
    this.flex = this.element === "ph-thumb";
    data.posts = data.posts.map(function(item, index) {
      item.index = index + 1;
      return item;
    });
    return ProductHunt.__super__.draw.call(this, data, holderElement);
  };

  ProductHunt.prototype.refresh = function(columnElement, holderElement) {
    return fetch("https://api.producthunt.com/v1/oauth/token", {
      method: "post",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: "6c7ae468245e828676be999f5a42e6e50e0101ca99480c4eefbeb981d56f310d",
        client_secret: "00825be2da634a7d80bc4dc8d3cbdd54bcaa46d4273101227c27dbd68accdb77",
        grant_type: "client_credentials"
      })
    }).then(function(response) {
      if (response.status === 200) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    }).then(function(response) {
      return response.json();
    }).then((function(_this) {
      return function(json) {
        _this.url = "https://api.producthunt.com/v1/posts?access_token=" + json.access_token;
        return ProductHunt.__super__.refresh.call(_this, columnElement, holderElement);
      };
    })(this))["catch"]((function(_this) {
      return function(error) {
        console.error(error);
        _this.refreshing = false;
        _this.loading = false;
        if (!_this.cache || _this.cache.length === 0) {
          return _this.error(holderElement);
        }
      };
    })(this));
  };

  return ProductHunt;

})(Columns.FeedColumn);

tabbie.register("ProductHunt");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.PushBullet = (function(superClass) {
  extend(PushBullet, superClass);

  function PushBullet() {
    this.render = bind(this.render, this);
    this.logOut = bind(this.logOut, this);
    this.draw = bind(this.draw, this);
    this.refresh = bind(this.refresh, this);
    return PushBullet.__super__.constructor.apply(this, arguments);
  }

  PushBullet.prototype.name = "PushBullet";

  PushBullet.prototype.thumb = "img/column-pushbullet.png";

  PushBullet.prototype.dialog = "pushbullet-dialog";

  PushBullet.prototype.socket = void 0;

  PushBullet.prototype.api = void 0;

  PushBullet.prototype.colEl = void 0;

  PushBullet.prototype.holEl = void 0;

  PushBullet.prototype.link = "https://www.pushbullet.com";

  PushBullet.prototype.refresh = function(columnElement, holderElement) {
    this.refreshing = true;
    return this.api.user((function(_this) {
      return function(error, user) {
        _this.config.user = user;
        tabbie.sync(_this);
        return _this.api.pushHistory(function(error, history) {
          var i, item, len, ref;
          _this.refreshing = false;
          user.myself = true;
          ref = history.pushes;
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            if (item.direction === 'self') {
              item.from = user;
            }
          }
          _this.cache = history;
          tabbie.sync(_this);
          return _this.draw(history, holderElement);
        });
      };
    })(this));
  };

  PushBullet.prototype.draw = function(data, holderElement) {
    var el, i, item, len, ref, results;
    this.loading = false;
    holderElement.innerHTML = "";
    ref = data.pushes;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (!item.active) {
        continue;
      }
      el = document.createElement("pushbullet-item");
      el.item = item;
      results.push(holderElement.appendChild(el));
    }
    return results;
  };

  PushBullet.prototype.logOut = function() {
    delete this.config.access_token;
    delete this.config.user;
    tabbie.sync(this);
    return this.render(this.colEl, this.holEl);
  };

  PushBullet.prototype.render = function(columnElement, holderElement) {
    var auth;
    PushBullet.__super__.render.call(this, columnElement, holderElement);
    this.api = window.PushBullet;
    this.colEl = columnElement;
    this.holEl = holderElement;
    if (!this.config.access_token) {
      this.loading = false;
      this.refreshing = false;
      auth = document.createElement("pushbullet-auth");
      auth.addEventListener("sign-in", (function(_this) {
        return function(event) {
          _this.config.access_token = event.detail;
          tabbie.sync(_this);
          return _this.render(columnElement, holderElement);
        };
      })(this));
      holderElement.innerHTML = "";
      return holderElement.appendChild(auth);
    } else {
      this.api.APIKey = this.config.access_token;
      if (Object.keys(this.cache).length) {
        this.draw(this.cache, holderElement);
      }
      this.refresh(columnElement, holderElement);
      this.socket = new WebSocket('wss://stream.pushbullet.com/websocket/' + this.config.access_token);
      return this.socket.onmessage = (function(_this) {
        return function(e) {
          var data;
          data = JSON.parse(e.data);
          if (data.type === "tickle" && data.subtype === "push") {
            return _this.refresh(columnElement, holderElement);
          }
        };
      })(this);
    }
  };

  return PushBullet;

})(Columns.Column);

tabbie.register("PushBullet");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.Reddit = (function(superClass) {
  extend(Reddit, superClass);

  function Reddit() {
    this.logout = bind(this.logout, this);
    this.login = bind(this.login, this);
    this.getToken = bind(this.getToken, this);
    this.render = bind(this.render, this);
    this.refresh = bind(this.refresh, this);
    return Reddit.__super__.constructor.apply(this, arguments);
  }

  Reddit.prototype.name = "Reddit";

  Reddit.prototype.width = 1;

  Reddit.prototype.dialog = "reddit-dialog";

  Reddit.prototype.thumb = "img/column-reddit.png";

  Reddit.prototype.link = "https://www.reddit.com/";

  Reddit.prototype.element = "reddit-item";

  Reddit.prototype.dataPath = "data.children";

  Reddit.prototype.childPath = "data";

  Reddit.prototype.cid = "qr6drw45JFCXfw";

  Reddit.prototype.refresh = function(columnElement, holderElement) {
    var cb, listing;
    this.refreshing = true;
    if (!this.config.subreddit) {
      this.config = {
        listing: 0,
        subreddit: "funny",
        option: "subreddit",
        multireddit: "empw/m/electronicmusic"
      };
    }
    console.info("config.option", this.config.option);
    switch (this.config.option) {
      case "subreddit":
        switch (this.config.listing) {
          case 0:
            listing = "hot";
            break;
          case 1:
            listing = "new";
            break;
          case 2:
            listing = "top";
        }
        this.url = "https://www.reddit.com/r/" + this.config.subreddit + "/" + listing + ".json";
        return Reddit.__super__.refresh.call(this, columnElement, holderElement);
      case "multireddit":
        this.url = "https://www.reddit.com/user/" + this.config.multireddit + ".json";
        return Reddit.__super__.refresh.call(this, columnElement, holderElement);
      case "frontpage":
        cb = (function(_this) {
          return function() {
            return fetch("https://oauth.reddit.com/.json", {
              headers: {
                "Authorization": "bearer " + _this.config.access_token,
                "Accept": "application/json"
              }
            }).then(function(response) {
              if (response.status === 200) {
                return Promise.resolve(response.json());
              } else if (response.status === 401) {
                _this.holderElement.innerHTML = "";
                _this.holderElement.appendChild(document.createElement("reddit-error"));
                delete _this.config.access_token;
                delete _this.config.refresh_token;
                delete _this.config.expire;
                tabbie.sync(_this);
                return Promise.reject(new Error(response.statusText));
              } else {
                return Promise.reject(new Error(response.statusText));
              }
            }).then(function(data) {
              _this.refreshing = false;
              _this.cache = data;
              tabbie.sync(_this);
              holderElement.innerHTML = "";
              return _this.draw(data, holderElement);
            })["catch"](function(error) {
              console.error(error);
              _this.refreshing = false;
              return _this.loading = false;
            });
          };
        })(this);
        if (Math.floor(new Date().getTime() / 1000) > this.config.expire) {
          return this.getToken(false, cb);
        } else {
          return cb();
        }
        break;
      default:
        return console.error("Reddit column: Invalid config.option ???");
    }
  };

  Reddit.prototype.render = function(columnElement1, holderElement1) {
    this.columnElement = columnElement1;
    this.holderElement = holderElement1;
    return Reddit.__super__.render.call(this, this.columnElement, this.holderElement);
  };

  Reddit.prototype.getToken = function(code, cb) {
    var body;
    if (code) {
      body = "grant_type=authorization_code&code=" + code + "&redirect_uri=https%3A%2F%2F" + chrome.runtime.id + ".chromiumapp.org%2Freddit";
    } else {
      body = "grant_type=refresh_token&refresh_token=" + this.config.refresh_token + "&redirect_uri=https%3A%2F%2F" + chrome.runtime.id + ".chromiumapp.org%2Freddit";
    }
    return fetch("https://www.reddit.com/api/v1/access_token", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(this.cid + ":")
      },
      body: body
    }).then((function(_this) {
      return function(response) {
        if (response.status === 200) {
          return Promise.resolve(response.json());
        } else {
          return Promise.reject(new Error(response.statusText));
        }
      };
    })(this)).then((function(_this) {
      return function(data) {
        _this.config.access_token = data.access_token;
        if (code) {
          _this.config.refresh_token = data.refresh_token;
        }
        _this.config.expire = Math.floor(new Date().getTime() / 1000) + data.expires_in;
        console.info("access_token", _this.config.access_token, "refresh_token", _this.config.refresh_token, "expire time", _this.config.expire);
        tabbie.sync(_this);
        if (typeof cb === 'function') {
          return cb();
        }
      };
    })(this))["catch"]((function(_this) {
      return function(e) {
        return console.error(e);
      };
    })(this));
  };

  Reddit.prototype.login = function() {
    return chrome.permissions.request({
      origins: ['https://oauth.reddit.com/', 'https://www.reddit.com/']
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          return chrome.identity.launchWebAuthFlow({
            url: "https://www.reddit.com/api/v1/authorize?client_id=" + _this.cid + "&response_type=code&state=hellothisisaeasteregg&redirect_uri=https%3A%2F%2F" + chrome.runtime.id + ".chromiumapp.org%2Freddit&duration=permanent&scope=read",
            interactive: true
          }, function(redirect_url) {
            var code;
            if (redirect_url) {
              code = /code=([a-zA-Z0-9_\-]*)/.exec(redirect_url)[1];
              return _this.getToken(code);
            }
          });
        }
      };
    })(this));
  };

  Reddit.prototype.logout = function() {
    delete this.config.access_token;
    return tabbie.sync(this);
  };

  return Reddit;

})(Columns.FeedColumn);

tabbie.register("Reddit");

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.SpeedDial = (function(superClass) {
  extend(SpeedDial, superClass);

  function SpeedDial() {
    return SpeedDial.__super__.constructor.apply(this, arguments);
  }

  SpeedDial.prototype.name = "SpeedDial";

  SpeedDial.prototype.dialog = "speed-dial-dialog";

  SpeedDial.prototype.thumb = "img/column-speeddial.png";

  SpeedDial.prototype.flex = true;

  SpeedDial.prototype.element = "speed-dial-item";

  SpeedDial.prototype.link = "";

  SpeedDial.prototype.refresh = function(columnElement, holderElement) {
    var app, e, hack, i, j, len, num, ref, results, website;
    holderElement.innerHTML = "";
    if (!this.config.websites) {
      this.config = {
        websites: []
      };
    }
    ref = this.config.websites;
    for (i = 0, len = ref.length; i < len; i++) {
      website = ref[i];
      app = document.createElement("speed-dial-item");
      try {
        app.name = website.name;
        app.icon = website.icon.url;
        app.url = website.url;
      } catch (error) {
        e = error;
        console.warn(e);
      }
      holderElement.appendChild(app);
    }
    results = [];
    for (num = j = 0; j <= 10; num = ++j) {
      if (!this.flex) {
        continue;
      }
      hack = document.createElement("speed-dial-item");
      hack.className = "hack";
      results.push(holderElement.appendChild(hack));
    }
    return results;
  };

  SpeedDial.prototype.render = function(columnElement, holderElement) {
    SpeedDial.__super__.render.call(this, columnElement, holderElement);
    this.refreshing = false;
    this.loading = false;
    return this.refresh(columnElement, holderElement);
  };

  return SpeedDial;

})(Columns.Column);

tabbie.register("SpeedDial");

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Columns.TopSites = (function(superClass) {
  extend(TopSites, superClass);

  function TopSites() {
    this.attemptAdd = bind(this.attemptAdd, this);
    return TopSites.__super__.constructor.apply(this, arguments);
  }

  TopSites.prototype.name = "Top sites";

  TopSites.prototype.thumb = "img/column-topsites.png";

  TopSites.prototype.attemptAdd = function(successCallback) {
    return chrome.permissions.request({
      permissions: ["topSites"],
      origins: ["chrome://favicon/*"]
    }, (function(_this) {
      return function(granted) {
        if (granted) {
          if (typeof successCallback === 'function') {
            return successCallback();
          }
        }
      };
    })(this));
  };

  TopSites.prototype.refresh = function(columnElement, holderElement) {
    return chrome.topSites.get((function(_this) {
      return function(sites) {
        var i, len, paper, results, site;
        holderElement.innerHTML = "";
        results = [];
        for (i = 0, len = sites.length; i < len; i++) {
          site = sites[i];
          paper = document.createElement("bookmark-item");
          paper.showdate = false;
          paper.title = site.title;
          paper.url = site.url;
          results.push(holderElement.appendChild(paper));
        }
        return results;
      };
    })(this));
  };

  TopSites.prototype.render = function(columnElement, holderElement) {
    TopSites.__super__.render.call(this, columnElement, holderElement);
    this.refreshing = false;
    this.loading = false;
    return this.refresh(columnElement, holderElement);
  };

  return TopSites;

})(Columns.Column);

tabbie.register("TopSites");

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyIsIi9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLE1BQUE7RUFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFNLENBQUMsT0FBUCxJQUFrQjs7QUFDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFmLEdBQThCO0FBQzVCLE1BQUE7O0VBQWEsZ0JBQUMsVUFBRCxFQUFhLGtCQUFiOztBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxXQUFXLENBQUM7SUFFMUIsSUFBRyxVQUFIO0FBQW1CLFdBQUEsaUJBQUE7WUFBb0QsT0FBTyxVQUFXLENBQUEsR0FBQSxDQUFsQixLQUE0QjtVQUFoRixJQUFFLENBQUEsR0FBQSxDQUFGLEdBQVMsVUFBVyxDQUFBLEdBQUE7O0FBQXBCLE9BQW5COztJQUVBLElBQUcsQ0FBSSxrQkFBSixJQUEyQixDQUFJLElBQUMsQ0FBQSxLQUFuQztNQUNFLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNQLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDNUIsY0FBQTtVQUFBLEVBQUEsR0FBUyxJQUFBLFVBQUEsQ0FBVyxJQUFYO2lCQUNULEtBQUMsQ0FBQSxLQUFE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LEVBQWEsQ0FBQyxVQUFELENBQWI7TUFDQSxPQUFBLEVBQVMsQ0FBQyxvQkFBRCxDQURUO0tBREYsRUFHRSxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsT0FBRDtRQUNBLElBQUcsT0FBSDtVQUNFLElBQUcsT0FBTyxlQUFQLEtBQTBCLFVBQTdCO21CQUE2QyxlQUFBLENBQUEsRUFBN0M7V0FERjs7TUFEQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIRjtFQURVOztxQkFRWixPQUFBLEdBQVMsU0FBQyxhQUFELEVBQWdCLGFBQWhCO1dBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFoQixDQUFvQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsS0FBRDtBQUNsQixZQUFBO1FBQUEsYUFBYSxDQUFDLFNBQWQsR0FBMEI7QUFDMUI7YUFBQSx1Q0FBQTs7VUFDRSxLQUFBLEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZUFBdkI7VUFDUixLQUFLLENBQUMsUUFBTixHQUFpQjtVQUNqQixLQUFLLENBQUMsS0FBTixHQUFjLElBQUksQ0FBQztVQUNuQixLQUFLLENBQUMsR0FBTixHQUFZLElBQUksQ0FBQzt1QkFDakIsYUFBYSxDQUFDLFdBQWQsQ0FBMEIsS0FBMUI7QUFMRjs7TUFGa0I7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCO0VBRE87O3FCQVVULE1BQUEsR0FBUSxTQUFDLGFBQUQsRUFBZ0IsYUFBaEI7SUFDTixxQ0FBTSxhQUFOLEVBQXFCLGFBQXJCO0lBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxPQUFELEdBQVc7V0FDWCxJQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsYUFBeEI7RUFKTTs7OztHQXRCcUIsT0FBTyxDQUFDOztBQTRCdkMsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsVUFBaEIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5Db2x1bW5zID0gd2luZG93LkNvbHVtbnMgfHwge31cbndpbmRvdy5Db2x1bW5zLkNvbHVtbiA9IGNsYXNzIENvbHVtblxuICBjb25zdHJ1Y3RvcjogKHByb3BlcnRpZXMsIGRvbnRDYWxjdWxhdGVDb2xvcikgLT5cbiAgICBAY2xhc3NOYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcblxuICAgIGlmIHByb3BlcnRpZXMgdGhlbiBAW2tleV0gPSBwcm9wZXJ0aWVzW2tleV0gZm9yIGtleSBvZiBwcm9wZXJ0aWVzIHdoZW4gdHlwZW9mIHByb3BlcnRpZXNba2V5XSBpc250ICdmdW5jdGlvbidcblxuICAgIGlmIG5vdCBkb250Q2FsY3VsYXRlQ29sb3IgYW5kIG5vdCBAY29sb3JcbiAgICAgIHRobWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiaW1nXCJcbiAgICAgIHRobWIuYWRkRXZlbnRMaXN0ZW5lciBcImxvYWRcIiwgPT5cbiAgICAgICAgY3QgPSBuZXcgQ29sb3JUaGllZiB0aG1iXG4gICAgICAgIEBjb2xvciA9IGN0LmdldENvbG9yIHRobWJcbiAgICAgIHRobWIuc3JjID0gQHRodW1iXG5cbiAgICBpZiBub3QgQGNvbmZpZyB0aGVuIEBjb25maWcgPSB7fVxuICAgIGlmIG5vdCBAY2FjaGUgdGhlbiBAY2FjaGUgPSBbXVxuICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICBAcmVsb2FkaW5nID0gdHJ1ZVxuICAgIEBfcmVmcmVzaGluZyA9IGZhbHNlXG5cbiAgZXJyb3I6IChob2xkZXJFbGVtZW50KSAtPlxuICAgIGhvbGRlckVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsIFwiXCIpXG4gICAgY29sRWwgPSBob2xkZXJFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgZXJyb3IgPSBjb2xFbC5xdWVyeVNlbGVjdG9yKFwiLmVycm9yXCIpXG4gICAgZXJyb3IucmVtb3ZlQXR0cmlidXRlKFwiaGlkZGVuXCIpXG4gICAgZXJyb3Iub2Zmc2V0VG9wICNyZS1yZW5kZXIgaGFja1xuICAgIGVycm9yLnN0eWxlLm9wYWNpdHkgPSAxXG5cbiAgc2V0dGluZ3M6IChjYikgLT5cbiAgICBpZiBAZGlhbG9nXG4gICAgICBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IEBkaWFsb2dcbiAgICAgIGRpYWxvZy5jb25maWcgPSBAY29uZmlnXG4gICAgICBkaWFsb2cuY29sdW1uID0gQFxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBkaWFsb2dcbiAgICAgICN3YXJuaW5nLCBuYXN0eSBjb2RlIGFoZWFkXG4gICAgICBfZCA9IG51bGxcbiAgICAgIGRpYWxvZy50b2dnbGUgPSAtPlxuICAgICAgICBpZiBub3QgX2QgdGhlbiBfZCA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yIFwidGFiYmllLWRpYWxvZ1wiXG4gICAgICAgIF9kLnRvZ2dsZSgpXG4gICAgICBkaWFsb2cudG9nZ2xlKClcbiAgICAgIGRpYWxvZy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCJ0YWJiaWUtZGlhbG9nXCIpLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcInBhcGVyLWJ1dHRvbi5va1wiKS5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgLT5cbiAgICAgICAgQGNvbmZpZyA9IGRpYWxvZy5jb25maWdcbiAgICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgICBkaWFsb2cudG9nZ2xlKClcbiAgICAgICAgaWYgdHlwZW9mIGNiIGlzICdmdW5jdGlvbicgdGhlbiBjYiBkaWFsb2dcbiAgICBlbHNlIGlmIHR5cGVvZiBjYiBpcyAnZnVuY3Rpb24nIHRoZW4gY2IgZGlhbG9nXG5cbiAgcmVmcmVzaDogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG5cbiAgYXR0ZW1wdEFkZDogKHN1Y2Nlc3NDYWxsYmFjaykgLT5cbiAgICBpZiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG4gIGhhbmRsZUhhbmRsZXIgPSB1bmRlZmluZWRcbiAgZWRpdE1vZGU6IChlbmFibGUpID0+XG4gICAgdHJhbnMgPSB0YWJiaWUubWV0YS5ieUlkIFwiY29yZS10cmFuc2l0aW9uLWNlbnRlclwiXG4gICAgaGFuZGxlID0gQGNvbHVtbkVsZW1lbnQucXVlcnlTZWxlY3RvciBcImh0bWwgL2RlZXAvIC5oYW5kbGVcIlxuXG4gICAgaWYgZW5hYmxlXG4gICAgICBnZXRQZXJjZW50YWdlID0gKHRhcmdldCwgd2lkdGgpID0+XG4gICAgICAgIGlmIHdpZHRoXG4gICAgICAgICAgYmFzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ3JpZC1zaXplclwiKS5jbGllbnRXaWR0aFxuICAgICAgICAgIGFic29sdXRlID0gTWF0aC5yb3VuZCgodGFyZ2V0LnN0eWxlLndpZHRoLnN1YnN0cmluZygwLCB0YXJnZXQuc3R5bGUud2lkdGgubGVuZ3RoIC0gMikgKSAvIGJhc2UpXG4gICAgICAgICAgZmluYWwgPSBhYnNvbHV0ZSAqIDI1XG4gICAgICAgICAgaWYgZmluYWwgaXMgMCB0aGVuIGZpbmFsID0gMjVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGJhc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdyaWQtc2l6ZXJcIikuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgYWJzb2x1dGUgPSBNYXRoLnJvdW5kKCh0YXJnZXQuc3R5bGUuaGVpZ2h0LnN1YnN0cmluZygwLCB0YXJnZXQuc3R5bGUuaGVpZ2h0Lmxlbmd0aCAtIDIpICkgLyBiYXNlKVxuICAgICAgICAgIGZpbmFsID0gYWJzb2x1dGUgKiA1MFxuICAgICAgICAgIGlmIGZpbmFsIGlzIDAgdGhlbiBmaW5hbCA9IDUwXG5cbiAgICAgICAgaWYgZmluYWwgPiAxMDAgdGhlbiBmaW5hbCA9IDEwMFxuICAgICAgICBjb25zb2xlLmluZm8gXCJbZ2V0UGVyY2VudGFnZV0gd2lkdGg/XCIsIHdpZHRoLCBcImJhc2VcIiwgYmFzZSwgXCJhYnNvbHV0ZVwiLCBhYnNvbHV0ZSwgXCJmaW5hbFwiLCBmaW5hbCwgXCIlXCJcbiAgICAgICAgcmV0dXJuIGZpbmFsXG5cbiAgICAgIHByZXZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZGl2XCJcbiAgICAgIHByZXZpZXcuY2xhc3NMaXN0LmFkZCBcInJlc2l6ZS1wcmV2aWV3XCJcbiAgICAgIHByZXZpZXcuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29sdW1uLWhvbGRlclwiKS5hcHBlbmRDaGlsZCBwcmV2aWV3XG5cbiAgICAgICNyZXNpemUgbG9naWNcbiAgICAgIHRhcmdldCA9IEBjb2x1bW5FbGVtZW50XG4gICAgICBoYW5kbGUuYWRkRXZlbnRMaXN0ZW5lciBcIm1vdXNlZG93blwiLCBAaGFuZGxlSGFuZGxlciA9IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0YXJnZXQuc3R5bGUudHJhbnNpdGlvbiA9IFwibm9uZVwiXG4gICAgICAgIHN0YXJ0WCA9IGV2ZW50LmNsaWVudFggLSB0YXJnZXQuY2xpZW50V2lkdGhcbiAgICAgICAgc3RhcnRZID0gZXZlbnQuY2xpZW50WSAtIHRhcmdldC5jbGllbnRIZWlnaHRcbiAgICAgICAgbW91c2VVcEJvdW5kID0gZmFsc2VcbiAgICAgICAgY29uc29sZS5sb2cgXCJzdGFydFlcIiwgc3RhcnRZLCBcInN0YXJ0WFwiLCBzdGFydFhcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcIm1vdXNlbW92ZVwiLCBtc212ID0gKGV2ZW50KSA9PlxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBuZXdYID0gZXZlbnQuY2xpZW50WCAtIHN0YXJ0WFxuICAgICAgICAgIG5ld1kgPSBldmVudC5jbGllbnRZIC0gc3RhcnRZXG5cbiAgICAgICAgICBpZiBwcmV2aWV3LnN0eWxlLnZpc2liaWxpdHkgaXNudCBcInZpc2libGVcIlxuICAgICAgICAgICAgcHJldmlldy5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcbiAgICAgICAgICAgIHByZXZpZXcuc3R5bGUudG9wID0gdGFyZ2V0LnN0eWxlLnRvcFxuICAgICAgICAgICAgcHJldmlldy5zdHlsZS5sZWZ0ID0gdGFyZ2V0LnN0eWxlLmxlZnRcblxuICAgICAgICAgIHByZXZpZXcuc3R5bGUud2lkdGggPSBnZXRQZXJjZW50YWdlKHRhcmdldCwgdHJ1ZSkrXCIlXCJcbiAgICAgICAgICBwcmV2aWV3LnN0eWxlLmhlaWdodCA9IGdldFBlcmNlbnRhZ2UodGFyZ2V0LCBmYWxzZSkrXCIlXCJcblxuICAgICAgICAgIHRhcmdldC5zdHlsZS56SW5kZXggPSAxMDdcbiAgICAgICAgICB0YXJnZXQuc3R5bGUud2lkdGggID0gbmV3WCArICdweCdcbiAgICAgICAgICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gbmV3WSArICdweCdcblxuICAgICAgICAgIGlmIG5vdCBtb3VzZVVwQm91bmRcbiAgICAgICAgICAgIG1vdXNlVXBCb3VuZCA9IHRydWVcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJtb3VzZXVwXCIsIG1zcCA9IChldmVudCkgPT5cbiAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAjY2xlYW4gdXAgZXZlbnRzXG4gICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgXCJtb3VzZW1vdmVcIiwgbXNtdlxuICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyIFwibW91c2V1cFwiLCBtc3BcblxuICAgICAgICAgICAgICB0YXJnZXQuc3R5bGUudHJhbnNpdGlvbiA9IFwid2lkdGggMjUwbXMsIGhlaWdodCAyNTBtc1wiXG4gICAgICAgICAgICAgIHdpZHRoUGVyYyA9IGdldFBlcmNlbnRhZ2UgdGFyZ2V0LCB0cnVlXG4gICAgICAgICAgICAgIGhlaWdodFBlcmMgPSBnZXRQZXJjZW50YWdlIHRhcmdldCwgZmFsc2VcbiAgICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gd2lkdGhQZXJjICsgXCIlXCJcbiAgICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGhlaWdodFBlcmMgKyBcIiVcIlxuICAgICAgICAgICAgICBAd2lkdGggPSB3aWR0aFBlcmMgLyAyNVxuICAgICAgICAgICAgICBAaGVpZ2h0ID0gaGVpZ2h0UGVyYyAvIDUwXG4gICAgICAgICAgICAgIHByZXZpZXcuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgICAgICAgICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lciBcIndlYmtpdFRyYW5zaXRpb25FbmRcIiwgdHJuc3RuID0gLT5cbiAgICAgICAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciBcIndlYmtpdFRyYW5zaXRpb25FbmRcIiwgdHJuc3RuXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLnpJbmRleCA9IDFcbiAgICAgICAgICAgICAgICB0YWJiaWUucGFja2VyeS5sYXlvdXQoKVxuXG4gICAgICBoYW5kbGUuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXG4gICAgICBAZHJhZ2dpZS5lbmFibGUoKVxuICAgICAgQGNvbHVtbkVsZW1lbnQuY2xhc3NMaXN0LmFkZCBcImRyYWdnYWJsZVwiXG4gICAgICBmb3IgZWRpdGFibGUgaW4gQGVkaXRhYmxlc1xuICAgICAgICBlZGl0YWJsZS5yZW1vdmVBdHRyaWJ1dGUgXCJoaWRkZW5cIlxuICAgICAgICBlZGl0YWJsZS5vZmZzZXRUb3AgI2hhY2sgdGhhdCBmb3JjZXMgcmUtcmVuZGVyXG5cbiAgICAgICAgdHJhbnMuZ28gZWRpdGFibGUsXG4gICAgICAgICAgb3BlbmVkOiB0cnVlXG4gICAgZWxzZVxuICAgICAgaWYgQGhhbmRsZUhhbmRsZXIgdGhlbiBoYW5kbGUucmVtb3ZlRXZlbnRMaXN0ZW5lciBcIm1vdXNlZG93blwiLCBAaGFuZGxlSGFuZGxlclxuICAgICAgaGFuZGxlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBAZHJhZ2dpZS5kaXNhYmxlKClcbiAgICAgIEBjb2x1bW5FbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUgXCJkcmFnZ2FibGVcIlxuICAgICAgZm9yIGVkaXRhYmxlIGluIEBlZGl0YWJsZXNcbiAgICAgICAgdHJhbnMuZ28gZWRpdGFibGUsXG4gICAgICAgICAgb3BlbmVkOiBmYWxzZVxuXG4gICAgICAgIHRyYW5zLmxpc3Rlbk9uY2UgZWRpdGFibGUsIHRyYW5zLmNvbXBsZXRlRXZlbnROYW1lLCAoZSkgLT5cbiAgICAgICAgICBlLnNldEF0dHJpYnV0ZSBcImhpZGRlblwiLCBcIlwiXG4gICAgICAgICwgW2VkaXRhYmxlXVxuXG4gIHJlbmRlcjogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgaWYgQGZsZXggdGhlbiBob2xkZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQgXCJmbGV4XCJcbiAgICBlbHNlIGhvbGRlckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSBcImZsZXhcIlxuXG4gICAgQGNvbHVtbkVsZW1lbnQgPSBjb2x1bW5FbGVtZW50XG5cbiAgICB0cmFucyA9IHRhYmJpZS5tZXRhLmJ5SWQgXCJjb3JlLXRyYW5zaXRpb24tY2VudGVyXCJcbiAgICBmb3IgZWRpdGFibGUgaW4gQGNvbHVtbkVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCBcImh0bWwgL2RlZXAvIC5lZGl0YWJsZVwiXG4gICAgICBpZiBub3QgQGRpYWxvZyBhbmQgZWRpdGFibGUuY2xhc3NMaXN0LmNvbnRhaW5zIFwic2V0dGluZ3NcIiB0aGVuIGNvbnRpbnVlXG4gICAgICB0cmFucy5zZXR1cCBlZGl0YWJsZVxuICAgICAgQGVkaXRhYmxlcy5wdXNoIGVkaXRhYmxlXG5cbiAgICBzcGlubmVyID0gY29sdW1uRWxlbWVudC5xdWVyeVNlbGVjdG9yIFwiaHRtbCAvZGVlcC8gcGFwZXItc3Bpbm5lclwiXG4gICAgcHJvZ3Jlc3MgPSBjb2x1bW5FbGVtZW50LnF1ZXJ5U2VsZWN0b3IgXCJodG1sIC9kZWVwLyBwYXBlci1wcm9ncmVzc1wiXG5cbiAgICB0cnlcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBALCBcImxvYWRpbmdcIixcbiAgICAgICAgZ2V0OiAtPiBzcGlubmVyLmFjdGl2ZVxuICAgICAgICBzZXQ6ICh2YWwpIC0+IHNwaW5uZXIuYWN0aXZlID0gdmFsXG5cbiAgICAgIHRpbWVvdXQgPSBmYWxzZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEAsIFwicmVmcmVzaGluZ1wiLFxuICAgICAgICBnZXQ6IC0+IEBfcmVmcmVzaGluZ1xuICAgICAgICBzZXQ6ICh2YWwpIC0+XG4gICAgICAgICAgQF9yZWZyZXNoaW5nID0gZmFsc2VcbiAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgIHByb2dyZXNzLnN0eWxlLm9wYWNpdHkgPSAxXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgdGltZW91dCB0aGVuIGNsZWFyVGltZW91dCB0aW1lb3V0XG4gICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICBwcm9ncmVzcy5zdHlsZS5vcGFjaXR5ID0gMFxuICAgICAgICAgICAgLCA0MDBcbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLndhcm4oZSlcblxuICAjSW50ZXJuYWxseSB1c2VkIGZvciByZXN0b3Jpbmcvc2F2aW5nIGNvbHVtbnMgKGRvbid0IHRvdWNoKVxuICBjbGFzc05hbWU6IFwiXCJcblxuICAjQXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYmFzZWQgb24gdGh1bWIgaW1hZ2UgKGRvbid0IHRvdWNoKVxuICBjb2xvcjogXCJcIlxuXG4gICNtb3JlIGludGVybmFsIHNoaXpcbiAgY29sdW1uRWxlbWVudDogbnVsbFxuICBlZGl0YWJsZXM6IFtdXG4gIGRyYWdnaWU6IG51bGxcblxuICAjSW50ZXJuYWxseSB1c2VkIHRvIGRldGVybWluZSB3aGljaCBwcm9wZXJ0aWVzIHRvIGtlZXAgd2hlbiBzYXZpbmdcbiAgc3luY2VkUHJvcGVydGllczpbXG4gICAgXCJjYWNoZVwiLFxuICAgIFwiY29uZmlnXCIsXG4gICAgXCJjbGFzc05hbWVcIixcbiAgICBcImlkXCIsXG4gICAgXCJjb2xvclwiLFxuICAgIFwid2lkdGhcIixcbiAgICBcImhlaWdodFwiLFxuICAgIFwibmFtZVwiLFxuICAgIFwidXJsXCIsXG4gICAgXCJiYXNlVXJsXCIsXG4gICAgXCJsaW5rXCIsXG4gICAgXCJ0aHVtYlwiLFxuICAgIFwiY3VzdG9tXCJcbiAgXVxuXG4gICNDb2x1bW4gbmFtZVxuICBuYW1lOiBcIkVtcHR5IGNvbHVtblwiXG5cbiAgI0NvbHVtbiBncmlkIHdpZHRoICh3aWR0aCAqIDI1JSlcbiAgd2lkdGg6IDFcblxuICAjQ29sdW1uIGdyaWQgaGVpZ2h0IChoZWlnaHQgKiA1MCUpXG4gIGhlaWdodDogMVxuXG4gICNDb25maWd1cmF0aW9uIGRpYWxvZyBJRFxuICBkaWFsb2c6IG51bGxcblxuICAjVGh1bWJuYWlsIGltYWdlIHBhdGhcbiAgdGh1bWI6IFwiaW1nL2NvbHVtbi11bmtub3duLnBuZ1wiXG5cbiAgI0NvbmZpZ3VyYXRpb25zIHRyb3VnaCBkaWFsb2dzIGV0YyBnZXQgc2F2ZWQgaW4gaGVyZVxuICBjb25maWc6IHt9XG5cbiAgI0NhY2hlXG4gIGNhY2hlOiBbXVxuXG4gIGxvYWRpbmc6IHRydWVcbiAgcmVmcmVzaGluZzogZmFsc2VcblxuICAjSWYgc2V0IHRvIHRydWUsIHRoaXMgd2lsbCBjYXVzZSB0aGUgaG9sZGVyIHRvIGJlIGEgZmxleGJveFxuICBmbGV4OiBmYWxzZVxuXG4gICN3aGV0aGVyIHRvIGhhbmRlIGNvbHVtbiBhcyBhIGN1c3RvbSBjb2x1bW4gb3Igbm90XG4gIGN1c3RvbTogZmFsc2VcblxuICB0b0pTT046IC0+XG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHRba2V5XSA9IEBba2V5XSBmb3Iga2V5IG9mIEAgd2hlbiBAc3luY2VkUHJvcGVydGllcy5pbmRleE9mKGtleSkgaXNudCAtMVxuICAgIHJlc3VsdFxuIiwiIyBGZWVkQ29sdW1uIG1ha2VzIGl0IGVhc3kgdG8gbWFrZSBmZWVkLWJhc2VkIGNvbHVtbnMuXG4jIFN1bW1lZCB1cDogaXQgbWFrZXMgYSByZXF1ZXN0IGZyb20gYSBBUEkgZW5kcG9pbnQgdGhhdCByZXR1cm5zIGpzb24sXG4jIEl0IGxvb3BzIHRyb3VnaCBpdCdzIHJlc3VsdCwgYWRkcyBhIGVsZW1lbnQgZm9yIGVhY2ggaXRlbSBpbiB0aGUgbG9vcCwgc2V0cyAnaXRlbScgb24gdGhlIGVsZW1lbnQsIGFuZCBpdHMgaXQgdG8gdGhlIGhvbGRlci5cbiMgQWxzbyBhdXRvbWF0aWNhbGx5IHRha2VzIGNhcmUgb2YgY2FjaGluZy5cblxuY2xhc3MgQ29sdW1ucy5GZWVkQ29sdW1uIGV4dGVuZHMgQ29sdW1ucy5Db2x1bW5cblxuICAjIFRoZSBlbGVtZW50IG5hbWUgdGhhdCB3aWxsIGJlIGluc2VydGVkXG4gIGVsZW1lbnQ6IGZhbHNlXG5cbiAgIyBBUEkgZW5kcG9pbnRcbiAgdXJsOiBmYWxzZVxuXG4gICMgUmVzcG9uc2UgdHlwZSAoanNvbiwgeG1sKVxuICByZXNwb25zZVR5cGU6ICdqc29uJ1xuXG4gICMgUGF0aCBpbnNpZGUgcmV0dXJuZWQgSlNPTiBvYmplY3QgdGhhdCBoYXMgdGhlIGFycmF5IHdlJ2xsIGxvb3AgdHJvdWdoLlxuICAjIEV4YW1wbGU6IGRhdGEuY2hpbGRyZW4gd2hlbiByZXR1cm5lZCBvYmogZnJvbSBzZXJ2ZXIgaXMgeyBkYXRhOiB7IGNoaWxkcmVuOiBbXSB9IH1cbiAgIyBMZWF2ZSBudWxsIGZvciBubyBwYXRoIChpLmUuIHdoZW4gc2VydmVyIGRpcmVjdGx5IHJldHVybnMgYXJyYXkpXG4gIGRhdGFQYXRoOiBudWxsXG5cbiAgIyBTYW1lIGFzIGRhdGFQYXRoLCBidXQgZm9yIGl0ZW1zIGluIHRoZSBhcnJheSBpdHNlbGZcbiAgY2hpbGRQYXRoOiBudWxsXG5cbiAgYmFzZVVybDogZmFsc2VcbiAgaW5maW5pdGVTY3JvbGw6IGZhbHNlXG4gIHBhZ2U6IDFcblxuICBkcmF3OiAoZGF0YSwgaG9sZGVyRWxlbWVudCkgLT5cbiAgICBAbG9hZGluZyA9IGZhbHNlXG5cbiAgICBpZiBAZmxleCB0aGVuIGhvbGRlckVsZW1lbnQuY2xhc3NMaXN0LmFkZCBcImZsZXhcIlxuICAgIGVsc2UgaG9sZGVyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlIFwiZmxleFwiXG5cbiAgICBpZiBub3QgQGVsZW1lbnRcbiAgICAgIGNvbnNvbGUud2FybiBcIlBsZWFzZSBkZWZpbmUgdGhlICdlbGVtZW50JyBwcm9wZXJ0eSBvbiB5b3VyIGNvbHVtbiBjbGFzcyFcIlxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBAZGF0YVBhdGggdGhlbiBkYXRhID0gZXZhbCBcImRhdGEuXCIgKyBAZGF0YVBhdGhcblxuICAgIGlmIEByZXNwb25zZVR5cGUgaXMgJ3htbCdcbiAgICAgIHBhcnNlciA9IG5ldyBET01QYXJzZXJcbiAgICAgIHhtbERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcgZGF0YSwgJ3RleHQveG1sJ1xuICAgICAgaXRlbXMgPSB4bWxEb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUgQHhtbFRhZ1xuICAgICAgZGF0YSA9IFtdXG5cbiAgICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICAgIGNvbnZlcnRlZCA9IHt9XG4gICAgICAgIG5vZGVzID0gaXRlbS5jaGlsZE5vZGVzXG4gICAgICAgIGZvciBlbCBpbiBub2Rlc1xuICAgICAgICAgIGNvbnZlcnRlZFtlbC5ub2RlTmFtZV0gPSBlbC50ZXh0Q29udGVudFxuICAgICAgICBkYXRhLnB1c2ggY29udmVydGVkXG5cbiAgICBmb3IgY2hpbGQgaW4gZGF0YVxuICAgICAgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgQGVsZW1lbnRcbiAgICAgIGlmIEBjaGlsZFBhdGggdGhlbiBjaGlsZCA9IGV2YWwgXCJjaGlsZC5cIiArIEBjaGlsZFBhdGhcbiAgICAgIGNhcmQuaXRlbSA9IGNoaWxkXG4gICAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGNhcmRcblxuICAgICNuZWVkZWQgZm9yIHByb3BlciBmbGV4XG4gICAgZm9yIG51bSBpbiBbMC4uMTBdIHdoZW4gQGZsZXhcbiAgICAgIGhhY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IEBlbGVtZW50XG4gICAgICBoYWNrLmNsYXNzTmFtZSA9IFwiaGFja1wiXG4gICAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGhhY2tcblxuICByZWZyZXNoOiAoY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudCwgYWRkaW5nKSAtPlxuICAgIEByZWZyZXNoaW5nID0gdHJ1ZVxuICAgIFxuICAgIGlmIEBpbmZpbml0ZVNjcm9sbCBhbmQgYWRkaW5nXG4gICAgICBAYmFzZVVybCA9IEB1cmwgaWYgbm90IEBiYXNlVXJsXG4gICAgICBAdXJsID0gQGJhc2VVcmwucmVwbGFjZSBcIntQQUdFTlVNfVwiLCBAcGFnZVxuXG4gICAgZWxzZSBpZiBAcGFnZSA9PSBcIlwiIHRoZW4gQHVybCA9IEBiYXNlVXJsLnJlcGxhY2UgXCJ7UEFHRU5VTX1cIiwgXCJcIlxuICAgIGVsc2UgaWYgQGJhc2VVcmwgdGhlbiBAdXJsID0gQGJhc2VVcmxcblxuICAgIGlmIEB1cmwuaW5jbHVkZXMgXCJ7UEFHRU5VTX1cIiB0aGVuIEB1cmwgPSBAdXJsLnJlcGxhY2UgXCJ7UEFHRU5VTX1cIiwgXCJcIiAgIFxuXG4gICAgaWYgbm90IEB1cmxcbiAgICAgIGNvbnNvbGUud2FybiBcIlBsZWFzZSBkZWZpbmUgdGhlICd1cmwnIHByb3BlcnR5IG9uIHlvdXIgY29sdW1uIGNsYXNzIVwiXG4gICAgICByZXR1cm5cblxuICAgIGZldGNoKEB1cmwpXG4gICAgLnRoZW4gKHJlc3BvbnNlKSA9PlxuICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuICAgICAgICBkYXRhVHlwZSA9ICdqc29uJ1xuICAgICAgICBkYXRhVHlwZSA9ICd0ZXh0JyBpZiBAcmVzcG9uc2VUeXBlIGlzICd4bWwnXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSByZXNwb25zZVtkYXRhVHlwZV0oKVxuICAgICAgZWxzZSBQcm9taXNlLnJlamVjdCBuZXcgRXJyb3IgcmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuICAgICAgQGNhY2hlID0gZGF0YVxuICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiIGlmIG5vdCBhZGRpbmdcbiAgICAgIGlmIEBmbGV4IHRoZW4gaGFjay5yZW1vdmUoKSBmb3IgaGFjayBpbiBob2xkZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgXCIuaGFja1wiXG4gICAgICBAZHJhdyBAY2FjaGUsIGhvbGRlckVsZW1lbnRcbiAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuICAgICAgQGxvYWRpbmcgPSBmYWxzZVxuXG4gICAgICAjbm8gY2FjaGVkIGRhdGEgdG8gZGlzcGxheT8gc2hvdyBlcnJvclxuICAgICAgaWYgbm90IEBjYWNoZSBvciBAY2FjaGUubGVuZ3RoIGlzIDAgdGhlbiBAZXJyb3IgaG9sZGVyRWxlbWVudFxuXG4gIHJlbmRlcjogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuXG4gICAgaWYgQGluZmluaXRlU2Nyb2xsIHRoZW4gaG9sZGVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwic2Nyb2xsXCIsID0+XG4gICAgICBpZiBub3QgQHJlZnJlc2hpbmcgYW5kIGhvbGRlckVsZW1lbnQuc2Nyb2xsVG9wICsgaG9sZGVyRWxlbWVudC5jbGllbnRIZWlnaHQgPj0gaG9sZGVyRWxlbWVudC5zY3JvbGxIZWlnaHQgLSAxMDBcbiAgICAgICAgaWYgdHlwZW9mIEBwYWdlIGlzICdudW1iZXInIHRoZW4gQHBhZ2UrK1xuICAgICAgICBAcmVmcmVzaCBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50LCB0cnVlXG5cbiAgICBpZiBPYmplY3Qua2V5cyhAY2FjaGUpLmxlbmd0aFxuICAgICAgQGRyYXcgQGNhY2hlLCBob2xkZXJFbGVtZW50XG4gICAgQHJlZnJlc2ggY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuIiwiY2xhc3MgVGFiYmllXG5cbiAgdmVyc2lvbjogXCIxLjFcIlxuICBlZGl0TW9kZTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBjb25zb2xlLnRpbWUoXCJwb2x5bWVyLXJlYWR5XCIpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2x5bWVyLXJlYWR5JywgQHJlbmRlclxuXG4gIHJlbmRlckNvbHVtbnM6IC0+XG4gICAgQGFkZENvbHVtbiBjb2x1bW4sIHRydWUgZm9yIGNvbHVtbiBpbiBAdXNlZENvbHVtbnMgd2hlbiB0eXBlb2YgY29sdW1uIGlzbnQgJ3VuZGVmaW5lZCdcblxuICBhZGRDb2x1bW46IChjb2x1bW4sIGRvbnRzYXZlKSAtPlxuICAgIGlmIG5vdCBjb2x1bW4uaWQgdGhlbiBjb2x1bW4uaWQgPSBNYXRoLnJvdW5kIE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwXG5cbiAgICBpZiBub3QgZG9udHNhdmVcbiAgICAgIEB1c2VkQ29sdW1ucy5wdXNoIGNvbHVtblxuICAgICAgQHN5bmNBbGwoKVxuXG4gICAgY29sdW1uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiaXRlbS1jb2x1bW5cIlxuICAgIGNvbHVtbkVsLmNvbHVtbiA9IGNvbHVtblxuICAgIGhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgXCIuY29sdW1uLWhvbGRlclwiXG5cbiAgICBob2xkZXIuYXBwZW5kQ2hpbGQgY29sdW1uRWxcbiAgICBAcGFja2VyeS5hZGRJdGVtcyBbIGNvbHVtbkVsIF1cblxuICAgIGNvbHVtbkVsLnN0eWxlLndpZHRoID0gKDI1ICogY29sdW1uLndpZHRoKStcIiVcIlxuICAgIGNvbHVtbkVsLnN0eWxlLmhlaWdodCA9ICg1MCAqIGNvbHVtbi5oZWlnaHQpK1wiJVwiXG4gICAgaG9sZGVyRWwgPSBjb2x1bW5FbC5xdWVyeVNlbGVjdG9yKFwiaHRtbCAvZGVlcC8gcGFwZXItc2hhZG93IC5ob2xkZXJcIilcbiAgICBjb2x1bW4ucmVuZGVyIGNvbHVtbkVsLCBob2xkZXJFbFxuXG4gICAgY29sdW1uLmRyYWdnaWUgPSBuZXcgRHJhZ2dhYmlsbHkgY29sdW1uRWwsXG4gICAgICBoYW5kbGU6IFwiaHRtbCAvZGVlcC8gY29yZS10b29sYmFyIC9kZWVwLyBwYXBlci1pY29uLWJ1dHRvbi5kcmFnXCIsXG4gICAgY29sdW1uLmRyYWdnaWUuZGlzYWJsZSgpXG5cbiAgICBAcGFja2VyeS5iaW5kRHJhZ2dhYmlsbHlFdmVudHMgY29sdW1uLmRyYWdnaWVcblxuICAgIGlmIGNvbHVtbi5jb25maWcucG9zaXRpb25cbiAgICAgIHBJdGVtID0gaXRlbSBmb3IgaXRlbSBpbiBAcGFja2VyeS5pdGVtcyB3aGVuIGl0ZW0uZWxlbWVudCBpcyBjb2x1bW5FbFxuICAgICAgcEl0ZW0uZ29UbyBjb2x1bW4uY29uZmlnLnBvc2l0aW9uLngsIGNvbHVtbi5jb25maWcucG9zaXRpb24ueVxuXG4gICAgI2JpbmQgY29sdW1uIGV2ZW50c1xuICAgIGNvbHVtbkVsLmFkZEV2ZW50TGlzdGVuZXIgXCJjb2x1bW4tZGVsZXRlXCIsID0+XG4gICAgICB0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIFwicmVtb3ZlZF90b2FzdF93cmFwcGVyXCJcbiAgICAgIHRvYXN0LmNvbHVtbiA9IGNvbHVtblxuICAgICAgdG9hc3QucmVzdG9yZSA9ID0+XG4gICAgICAgIG5ld2NvbHVtbiA9IG5ldyBDb2x1bW5zW2NvbHVtbi5jbGFzc05hbWVdKGNvbHVtbilcbiAgICAgICAgQGFkZENvbHVtbiBuZXdjb2x1bW5cbiAgICAgICAgQHBhY2tlcnkubGF5b3V0KClcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVtb3ZlZF90b2FzdFwiKS5zaG93KClcbiAgICAgIEBwYWNrZXJ5LnJlbW92ZSBjb2x1bW5FbFxuICAgICAgQHVzZWRDb2x1bW5zID0gQHVzZWRDb2x1bW5zLmZpbHRlciAoYykgLT4gYy5pZCBpc250IGNvbHVtbi5pZFxuICAgICAgQHN5bmNBbGwoKVxuICAgIGNvbHVtbkVsLmFkZEV2ZW50TGlzdGVuZXIgXCJjb2x1bW4tcmVmcmVzaFwiLCA9PiBjb2x1bW4ucmVmcmVzaCBjb2x1bW5FbCwgaG9sZGVyRWxcbiAgICBjb2x1bW5FbC5hZGRFdmVudExpc3RlbmVyIFwiY29sdW1uLXNldHRpbmdzXCIsID0+XG4gICAgICBjb2x1bW4uc2V0dGluZ3MgLT4gY29sdW1uLnJlZnJlc2ggY29sdW1uRWwsIGhvbGRlckVsXG5cbiAgICBpZiBAZWRpdE1vZGUgdGhlbiBjb2x1bW4uZWRpdE1vZGUgdHJ1ZVxuXG4gICAgY29sdW1uRWwuYW5pbWF0ZSBbXG4gICAgICBvcGFjaXR5OiAwXG4gICAgLFxuICAgICAgb3BhY2l0eTogMVxuICAgIF1cbiAgICAsXG4gICAgICBkaXJlY3Rpb246ICdhbHRlcm5hdGUnLFxuICAgICAgZHVyYXRpb246IDUwMFxuXG4gIG5vQ29sdW1uc0NoZWNrOiA9PlxuICAgIGlmIEBwYWNrZXJ5Lml0ZW1zLmxlbmd0aCA+IDAgdGhlbiBvcCA9IDAgZWxzZSBvcCA9IDFcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5vLWNvbHVtbnMtY29udGFpbmVyXCIpLnN0eWxlLm9wYWNpdHkgPSBvcFxuXG4gIGF1dG9SZWZyZXNoOiA9PlxuICAgIHNldEludGVydmFsIC0+XG4gICAgICAjbmFzdHkgc3R1ZmYsIGJ1dCB0YWJiaWUgaGFzIGJlZW4gbmFzdHkgcHJvdG90eXBlIHN0dWZmIHNpbmNlIHRoZSBiZWdpbm5pbmdcbiAgICAgIGNvbHVtbi5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCJbaWNvbj0ncmVmcmVzaCddXCIpLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKSkgZm9yIGNvbHVtbiBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaXRlbS1jb2x1bW5cIilcbiAgICAsIDEwMDAgKiA2MCAqIDVcblxuICBsYXlvdXRDaGFuZ2VkOiAoKSA9PlxuICAgICAgQG5vQ29sdW1uc0NoZWNrKClcbiAgICAgIGZvciBjb2x1bW5FbCBpbiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaXRlbS1jb2x1bW5cIilcbiAgICAgICAgaXRlbSA9IEBwYWNrZXJ5LmdldEl0ZW0oY29sdW1uRWwpXG4gICAgICAgIHBvc2l0aW9uID0gaXRlbS5wb3NpdGlvblxuICAgICAgICBjb2x1bW5JZCA9IGNvbHVtbkVsLnF1ZXJ5U2VsZWN0b3IoXCJodG1sIC9kZWVwLyBwYXBlci1zaGFkb3dcIikudGVtcGxhdGVJbnN0YW5jZS5tb2RlbC5jb2x1bW4uaWRcbiAgICAgICAgY29sdW1uID0gYyBmb3IgYyBpbiBAdXNlZENvbHVtbnMgd2hlbiBjLmlkIGlzIGNvbHVtbklkXG5cbiAgICAgICAgI3doYXQgd2lsbCBub3cgZm9sbG93LCBpcyBhIGZpeCBmb3Igb25lIG9mIHRoZSBzdHJhbmdlc3QgdGhpbmdzIGkndmUgc2VlbiBpbiBhIHdoaWxlIGluIG15IDcrIHllYXIgcHJvZ3JhbW1pbmcgY2FyZWVyLlxuICAgICAgICAjb2sgbm90IHJlYWxseS4gYnV0IHN0aWxsLlxuICAgICAgICAjd2UgbmVlZCB0byBjbGVhciB0aGUgY29sdW1uJ3MgY29uZmlnLCBvciBlbHNlIGNoYW5nZXMgZ2V0IGNhcnJpZWQgb24gYWNyb3NzIG90aGVyIGNvbHVtbnNcbiAgICAgICAgI2RvIG5vdCBhc2sgbWUgd2h5IG9yIGhvdy5cbiAgICAgICAgbmV3Y29uZmlnID0ge31cbiAgICAgICAgbmV3Y29uZmlnW2tdID0gdiBmb3IgaywgdiBvZiBjb2x1bW4uY29uZmlnIHdoZW4gY29sdW1uLmNvbmZpZy5oYXNPd25Qcm9wZXJ0eSBrXG4gICAgICAgIG5ld2NvbmZpZy5wb3NpdGlvbiA9IHBvc2l0aW9uXG4gICAgICAgIGNvbHVtbi5jb25maWcgPSBuZXdjb25maWdcbiAgICAgIEBzeW5jQWxsKClcblxuICBzeW5jOiAoY29sdW1uLCBkb250U3luY0FsbCkgPT5cbiAgICBAdXNlZENvbHVtbnMgPSBAdXNlZENvbHVtbnMubWFwIChjKSAtPlxuICAgICAgaWYgYy5pZCBpcyBjb2x1bW4uaWQgdGhlbiBjID0gY29sdW1uXG4gICAgICBjXG4gICAgaWYgbm90IGRvbnRTeW5jQWxsIHRoZW4gQHN5bmNBbGwoKVxuXG4gIHN5bmNBbGw6ICgpID0+XG4gICAgdXNlZCA9IFtdXG4gICAgdXNlZC5wdXNoIGNvbHVtbi50b0pTT04oKSBmb3IgY29sdW1uIGluIEB1c2VkQ29sdW1uc1xuICAgIHN0b3JlLnNldCBcInVzZWRDb2x1bW5zXCIsIEByZXNvcnRVc2VkQ29sdW1ucyB1c2VkXG5cbiAgICBzdG9yZS5zZXQgXCJjdXN0b21Db2x1bW5zXCIsIEBjdXN0b21Db2x1bW5zLm1hcCAoY29sdW1uKSAtPiBjb2x1bW4udG9KU09OKClcblxuICAgIHN0b3JlLnNldCBcImxhc3RSZXNcIiwgW1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQsXG4gICAgICBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoXG4gICAgXVxuXG4gIHJlbmRlckJvb2ttYXJrVHJlZTogKGhvbGRlciwgdHJlZSwgbGV2ZWwpID0+XG4gICAgY29uc29sZS5sb2cgXCJyZW5kZXJCb29rbWFya1RyZWUgbGV2ZWw6IFwiLCBsZXZlbCwgXCIgdHJlZTogXCIsIHRyZWVcbiAgICBmb3IgaXRlbSBpbiB0cmVlXG4gICAgICBwYXBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJib29rbWFyay1pdGVtXCJcbiAgICAgIHBhcGVyLml0ZW0gPSBpdGVtXG4gICAgICBwYXBlci5sZXZlbCA9IGxldmVsXG4gICAgICBwYXBlci5zaG93ZGF0ZSA9IGxldmVsIGlzIDBcbiAgICAgIHBhcGVyLmZvbGRlciA9ICEhaXRlbS5jaGlsZHJlblxuICAgICAgcGFwZXIudGl0bGUgPSBpdGVtLnRpdGxlXG4gICAgICBpZiBsZXZlbCBpc250IDAgdGhlbiBwYXBlci5zZXRBdHRyaWJ1dGUgXCJoaWRkZW5cIiwgXCJcIiAjb25seSByb290IGl0ZW1zIGFyZSB2aXNpYmxlIG9uIGluaXRpYWwgcmVuZGVyXG4gICAgICBwYXBlci5pZCA9IGl0ZW0uaWRcblxuICAgICAgaWYgcGFwZXIuZm9sZGVyIHRoZW4gcGFwZXIuYWRkRXZlbnRMaXN0ZW5lciBcImNsaWNrXCIsIC0+XG4gICAgICAgIGxvb3BpZSA9IChpdGVtcykgPT5cbiAgICAgICAgICBmb3IgaXRlbSBpbiBpdGVtc1xuICAgICAgICAgICAgY29uc29sZS5pbmZvIFwibG9vcGllIGlkXCIsIGl0ZW0uaWQsIFwicGFyZW50XCIsIGl0ZW0ucGFyZW50SWRcbiAgICAgICAgICAgIGVsID0gaG9sZGVyLnF1ZXJ5U2VsZWN0b3IgXCJbaWQ9J1wiK2l0ZW0uaWQrXCInXVwiXG4gICAgICAgICAgICBlbC5vcGVuZWQgPSBAb3BlbmVkXG4gICAgICAgICAgICBpZiBAb3BlbmVkIHRoZW4gZWwuc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsIFwiXCIpXG4gICAgICAgICAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZShcImhpZGRlblwiKVxuXG4gICAgICAgICAgICBpZiBpdGVtLmNoaWxkcmVuIGFuZCBAb3BlbmVkIHRoZW4gbG9vcGllIGl0ZW0uY2hpbGRyZW5cblxuICAgICAgICBsb29waWUgQGl0ZW0uY2hpbGRyZW4sIHRydWVcblxuICAgICAgICBAb3BlbmVkID0gIUBvcGVuZWRcblxuICAgICAgaWYgbm90IHBhcGVyLmZvbGRlclxuICAgICAgICBwYXBlci51cmwgPSBpdGVtLnVybFxuICAgICAgICBwYXBlci5kYXRlID0gaXRlbS5kYXRlQWRkZWRcblxuICAgICAgaG9sZGVyLmFwcGVuZENoaWxkIHBhcGVyXG5cbiAgICAgIGlmIHBhcGVyLmZvbGRlclxuICAgICAgICBAcmVuZGVyQm9va21hcmtUcmVlIGhvbGRlciwgaXRlbS5jaGlsZHJlbiwgbGV2ZWwrMVxuXG4gIHRvdXI6ID0+XG4gICAgc2V0VGltZW91dCAtPlxuICAgICAgc3RlcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidG91ci1zdGVwXCIpXG4gICAgICBzdGVwc1swXS5hc3luYyA9PlxuICAgICAgICBjdXJyU3RlcCA9IDBcbiAgICAgICAgdG91ckVuZGVkID0gZmFsc2VcbiAgICAgICAgdG91cnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwiI3RvdXJzXCJcbiAgICAgICAgdG91cnMuZW5kVG91ciA9IGVuZFRvdXIgPSAtPlxuICAgICAgICAgIHN0b3JlLnNldCBcIm5vdG91clwiLCB0cnVlXG4gICAgICAgICAgdG91ckVuZGVkID0gdHJ1ZVxuICAgICAgICB0b3Vycy5vcGVuRmFicyA9IChlKSAtPlxuICAgICAgICAgIGlmIGUuZGV0YWlsXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZhYnNcIikuZGlzcGF0Y2hFdmVudCBuZXcgTW91c2VFdmVudCAnbW91c2VlbnRlcidcbiAgICAgICAgICBlbHNlIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmFic1wiKS5kaXNwYXRjaEV2ZW50IG5ldyBNb3VzZUV2ZW50ICdtb3VzZWxlYXZlJ1xuICAgICAgICBmb3Igc3RlcCBpbiBzdGVwc1xuICAgICAgICAgIHN0ZXAuYWRkRXZlbnRMaXN0ZW5lciBcImNvcmUtb3ZlcmxheS1vcGVuXCIsIChlKSAtPlxuICAgICAgICAgICAgaWYgZS5kZXRhaWwgb3IgdG91ckVuZGVkIHRoZW4gcmV0dXJuXG4gICAgICAgICAgICBjdXJyU3RlcCsrXG4gICAgICAgICAgICBzdGVwID0gc3RlcHNbY3VyclN0ZXBdXG4gICAgICAgICAgICBpZiB0eXBlb2Ygc3RlcCA9PSAndW5kZWZpbmVkJyB0aGVuIGVuZFRvdXIoKVxuICAgICAgICAgICAgZWxzZSBzdGVwLnRvZ2dsZSgpXG5cbiAgICAgICAgc3RlcHNbMF0udG9nZ2xlKClcbiAgICAsIDEwMDBcblxuICByZW5kZXI6ID0+XG4gICAgY29uc29sZS50aW1lRW5kKCdwb2x5bWVyLXJlYWR5JylcbiAgICBjb25zb2xlLnRpbWUoJ3RhYmJpZSByZW5kZXInKVxuXG4gICAgaWYgbm90IHN0b3JlLmhhcyBcIm5vdG91clwiIHRoZW4gQHRvdXIoKVxuXG4gICAgI2xvYWQgYWxsIGRlZmF1bHQgY29sdW1uc1xuICAgIGlmIG5vdCBjb2xzID0gc3RvcmUuZ2V0IFwidXNlZENvbHVtbnNcIiB0aGVuIEB1c2VkQ29sdW1ucyA9IFtdIGVsc2VcbiAgICAgIGZvciBjb2wsIGkgaW4gY29sc1xuICAgICAgICBpZiB0eXBlb2YgQ29sdW1uc1tjb2wuY2xhc3NOYW1lXSBpcyAndW5kZWZpbmVkJ1xuICAgICAgICAgIGRlbGV0ZSBjb2xzW2ldXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgbmV3Y29sID0gbmV3IENvbHVtbnNbY29sLmNsYXNzTmFtZV0oY29sKVxuICAgICAgICBjb2xzW2ldID0gbmV3Y29sXG4gICAgICBAdXNlZENvbHVtbnMgPSBjb2xzXG5cbiAgICAjZ2V0IG1ldGEgZnJvbSBkb21cbiAgICBAbWV0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIFwibWV0YVwiXG5cbiAgICAjbG9hZCBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uc1xuICAgIEBjb2x1bW5zLnB1c2ggbmV3IENvbHVtbnNbY29sdW1uXSB7fSwgdHJ1ZSBmb3IgY29sdW1uIGluIEBjb2x1bW5OYW1lcyB3aGVuIHR5cGVvZiBDb2x1bW5zW2NvbHVtbl0gaXNudCAndW5kZWZpbmVkJ1xuXG4gICAgI2xvYWQgY3VzdG9tIHVzZXIgbWFkZSBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICBjdXN0b21Db2x1bW5zID0gc3RvcmUuZ2V0IFwiY3VzdG9tQ29sdW1uc1wiLCBbXVxuICAgIEBjdXN0b21Db2x1bW5zLnB1c2ggbmV3IENvbHVtbnNbY29sdW1uLmNsYXNzTmFtZV0oY29sdW1uKSBmb3IgY29sdW1uIGluIGN1c3RvbUNvbHVtbnNcbiAgICBAY29sdW1ucy5wdXNoIGNvbHVtbiBmb3IgY29sdW1uIGluIEBjdXN0b21Db2x1bW5zXG5cbiAgICAjcmVzb3J0IGNvbHVtbnMgYnkgYWxwaGFiZXRcbiAgICBAcmVzb3J0Q29sdW1ucygpXG5cbiAgICAjbG9hZCBwYWNrZXJ5IChsYXlvdXQgbWFuYWdlcilcbiAgICBAcGFja2VyeSA9IG5ldyBQYWNrZXJ5IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29sdW1uLWhvbGRlclwiKSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5ncmlkLXNpemVyXCJcbiAgICAgIHJvd0hlaWdodDogXCIuZ3JpZC1zaXplclwiXG4gICAgICBpdGVtU2VsZWN0b3I6IFwiaXRlbS1jb2x1bW5cIixcblxuICAgICNwYWNrZXJ5IGJpbmRpbmdzXG4gICAgQHBhY2tlcnkub24gXCJkcmFnSXRlbVBvc2l0aW9uZWRcIiwgQGxheW91dENoYW5nZWRcbiAgICBAcGFja2VyeS5vbiBcImxheW91dENvbXBsZXRlXCIsIEBsYXlvdXRDaGFuZ2VkXG4gICAgQHBhY2tlcnkub24gXCJyZW1vdmVDb21wbGV0ZVwiLCA9PlxuICAgICAgQHBhY2tlcnkubGF5b3V0KClcblxuICAgICNyZW5kZXIgbG9hZGVkIGNvbHVtbnNcbiAgICBAcmVuZGVyQ29sdW1ucygpXG5cbiAgICBAbm9Db2x1bW5zQ2hlY2soKVxuICAgIEBhdXRvUmVmcmVzaCgpXG5cbiAgICByZXMgPSBzdG9yZS5nZXQgXCJsYXN0UmVzXCIsIGZhbHNlXG4gICAgaWYgcmVzIGFuZCAocmVzWzBdIGlzbnQgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgb3IgcmVzWzFdIGlzbnQgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCkgdGhlbiBAcGFja2VyeS5sYXlvdXQoKVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhYm91dFwiKS5hc3luYyA9PlxuICAgICAgZm9yIGl0ZW0gaW4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNhYm91dCBwYXBlci1pdGVtXCIpXG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lciBcImNsaWNrXCIsIC0+IGlmIEBnZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHRoZW4gd2luZG93Lm9wZW4gQGdldEF0dHJpYnV0ZShcImhyZWZcIilcblxuICAgIGZhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwiLmZhYnNcIlxuICAgIGFsbEZhYnMgPSBbXCIuZmFiLWVkaXRcIiwgXCIuZmFiLWFib3V0XCIsIFwiLmZhYi11cGRhdGVcIl1cbiAgICBhbGxGYWJzID0gYWxsRmFicy5tYXAgLT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBhcmd1bWVudHNbMF1cbiAgICB0cmFucyA9IEBtZXRhLmJ5SWQgXCJjb3JlLXRyYW5zaXRpb24tY2VudGVyXCJcblxuICAgIGZvciBmYWIgaW4gYWxsRmFic1xuICAgICAgdHJhbnMuc2V0dXAgZmFiXG4gICAgICBmYWIucmVtb3ZlQXR0cmlidXRlIFwiaGlkZGVuXCJcblxuICAgIGZhYnMuYWRkRXZlbnRMaXN0ZW5lciBcIm1vdXNlZW50ZXJcIiwgLT4gdHJhbnMuZ28gZmFiLCB7IG9wZW5lZDogdHJ1ZSB9IGZvciBmYWIgaW4gYWxsRmFic1xuICAgIGZhYnMuYWRkRXZlbnRMaXN0ZW5lciBcIm1vdXNlbGVhdmVcIiwgLT4gdHJhbnMuZ28gZmFiLCB7IG9wZW5lZDogZmFsc2UgfSBmb3IgZmFiIGluIGFsbEZhYnNcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmFiLWVkaXRcIikuYWRkRXZlbnRMaXN0ZW5lciBcImNsaWNrXCIsIChlKSA9PlxuICAgICAgaWYgYWN0aXZlID0gZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zIFwiYWN0aXZlXCIgdGhlbiBlLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlIFwiYWN0aXZlXCJcbiAgICAgIGVsc2UgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCBcImFjdGl2ZVwiXG5cbiAgICAgIEBlZGl0TW9kZSA9IG5vdCBhY3RpdmVcbiAgICAgIGNvbHVtbi5lZGl0TW9kZSBub3QgYWN0aXZlIGZvciBjb2x1bW4gaW4gQHVzZWRDb2x1bW5zXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZhYi1hYm91dFwiKS5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgPT5cbiAgICAgIGFib3V0ZGlhbG9nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBcIiNhYm91dFwiXG4gICAgICB0ZW1wbCA9IGFib3V0ZGlhbG9nLnF1ZXJ5U2VsZWN0b3IoXCJodG1sIC9kZWVwLyB0ZW1wbGF0ZVwiKVxuICAgICAgdGVtcGwudmVyc2lvbiA9IEB2ZXJzaW9uXG4gICAgICB0ZW1wbC5wb2x5bWVyVmVyc2lvbiA9IFBvbHltZXIudmVyc2lvblxuICAgICAgZmFiYW5pbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJmYWItYW5pbVwiXG4gICAgICBmYWJhbmltLmNsYXNzTGlzdC5hZGQgXCJmYWItYW5pbS1hYm91dFwiXG5cbiAgICAgIGFib3V0ZGlhbG9nLnRvZ2dsZSAtPlxuICAgICAgICBmYWJhbmltLnJlbW92ZSgpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgZmFiYW5pbVxuICAgICAgZmFiYW5pbS5wbGF5KClcblxuICAgIHVwZGF0ZUZhYiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmFiLXVwZGF0ZVwiKVxuICAgIGlmIHN0b3JlLmhhcyBcImhpZGVVcGRhdGVCdXR0b25cIitAdmVyc2lvbiB0aGVuIHVwZGF0ZUZhYi5wYXJlbnROb2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgIHVwZGF0ZWRpYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwiI3VwZGF0ZVwiXG4gICAgdXBkYXRlZGlhZy5xdWVyeVNlbGVjdG9yKFwiLmhpZGUtYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCA9PlxuICAgICAgc3RvcmUuc2V0IFwiaGlkZVVwZGF0ZUJ1dHRvblwiK0B2ZXJzaW9uLCBcIjFcIlxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYWItdXBkYXRlLXdyYXBwZXJcIilcbiAgICAgIHVwZGF0ZWRpYWcudG9nZ2xlKClcbiAgICAgIHVwZGF0ZUZhYi5wYXJlbnROb2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuXG4gICAgdXBkYXRlRmFiLmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCA9PlxuICAgICAgZmFiYW5pbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJmYWItYW5pbVwiXG4gICAgICBmYWJhbmltLmNsYXNzTGlzdC5hZGQgXCJmYWItYW5pbS11cGRhdGVcIlxuICAgICAgdXBkYXRlZGlhZy50b2dnbGUgLT5cbiAgICAgICAgZmFiYW5pbS5yZW1vdmUoKVxuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGZhYmFuaW1cbiAgICAgIGZhYmFuaW0ucGxheSgpXG5cbiAgICBjb2x1bW5jaG9vc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBcImh0bWwgL2RlZXAvIGNvbHVtbi1jaG9vc2VyXCJcbiAgICBjb2x1bW5jaG9vc2VyLmNvbHVtbnMgPSBAY29sdW1uc1xuXG4gICAgYWRkZGlhbG9nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBcIiNhZGRjb2x1bW5cIlxuICAgIHNlYXJjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgXCIjc2VhcmNoZGlhbG9nXCJcblxuICAgIHNlYXJjaEJhciA9IHNlYXJjaC5xdWVyeVNlbGVjdG9yIFwiLnNlYXJjaC1iYXJcIlxuICAgIHNlYXJjaFByb2dyZXNzID0gc2VhcmNoLnF1ZXJ5U2VsZWN0b3IgXCIuc2VhcmNoLXByb2dyZXNzXCJcbiAgICBzZWFyY2hTdWdnZXN0aW9ucyA9IHNlYXJjaC5xdWVyeVNlbGVjdG9yIFwiYXV0by1zdWdnZXN0aW9uc1wiXG5cbiAgICBzZWFyY2gucmVwbGFjZUhlYWRlciBbc2VhcmNoQmFyLCBzZWFyY2hQcm9ncmVzc11cblxuICAgIGNsb3NlU2VhcmNoID0gLT5cbiAgICAgIHNlYXJjaC50b2dnbGUgLT5cbiAgICAgICAgc2VhcmNoQmFyLnZhbHVlID0gXCJcIlxuICAgICAgICBzZWFyY2hTdWdnZXN0aW9ucy5zdWdnZXN0aW9ucyA9IFtdXG5cbiAgICBzZWFyY2hTdWdnZXN0aW9ucy5hZGRFdmVudExpc3RlbmVyIFwic3VnZ2VzdGlvbi1jaG9zZW5cIiwgKGUpID0+XG4gICAgICBAY3JlYXRlQ29sdW1uRnJvbUZlZWRseSBlLmRldGFpbFxuICAgICAgY2xvc2VTZWFyY2goKVxuXG4gICAgcXVlcnkgPSBcIlwiXG4gICAgdGltZW91dCA9IHVuZGVmaW5lZFxuXG4gICAgc2VhcmNoQmFyLmFkZEV2ZW50TGlzdGVuZXIgXCJrZXlkb3duXCIsIChlKSA9PlxuICAgICAgcHJldmVudCA9IHRydWVcbiAgICAgIHN3aXRjaCBlLmtleUNvZGVcbiAgICAgICAgd2hlbiA0MCB0aGVuIHNlYXJjaFN1Z2dlc3Rpb25zLmhpZ2hsaWdodERvd24oKVxuICAgICAgICB3aGVuIDM4IHRoZW4gc2VhcmNoU3VnZ2VzdGlvbnMuaGlnaGxpZ2h0VXAoKVxuICAgICAgICB3aGVuIDEzIHRoZW4gc2VhcmNoU3VnZ2VzdGlvbnMuaGlnaGxpZ2h0Q2hvc2VuKClcbiAgICAgICAgd2hlbiAyNyB0aGVuIGNsb3NlU2VhcmNoKClcbiAgICAgICAgZWxzZSBwcmV2ZW50ID0gZmFsc2VcblxuICAgICAgaWYgcHJldmVudCB0aGVuIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgc2VhcmNoQmFyLmFkZEV2ZW50TGlzdGVuZXIgXCJrZXl1cFwiLCAoZSkgPT5cbiAgICAgIGlmIHF1ZXJ5ICE9IHNlYXJjaEJhci52YWx1ZVxuICAgICAgICBxdWVyeSA9IHNlYXJjaEJhci52YWx1ZVxuXG4gICAgICAgIGlmIG5vdCBxdWVyeVxuICAgICAgICAgIHNlYXJjaFN1Z2dlc3Rpb25zLnN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgICBzZWFyY2hTdWdnZXN0aW9ucy5lcnJvciA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgdGltZW91dCB0aGVuIGNsZWFyVGltZW91dCB0aW1lb3V0XG5cbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBzZWFyY2hQcm9ncmVzcy5zZXRBdHRyaWJ1dGUoXCJhY3RpdmVcIiwgXCJcIik7XG4gICAgICAgICAgZmV0Y2ggXCJodHRwczovL2ZlZWRseS5jb20vdjMvc2VhcmNoL2F1dG8tY29tcGxldGU/cXVlcnk9XCIrcXVlcnkrXCImc2l0ZXM9MTAmdG9waWNzPTAmbGlicmFyaWVzPTAmbG9jYWxlPWVuLVVTXCJcbiAgICAgICAgICAudGhlbiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBpZiByZXNwb25zZS5zdGF0dXMgaXMgMjAwIHRoZW4gUHJvbWlzZS5yZXNvbHZlIHJlc3BvbnNlXG4gICAgICAgICAgICBlbHNlIFByb21pc2UucmVqZWN0IG5ldyBFcnJvciByZXNwb25zZS5zdGF0dXNUZXh0XG4gICAgICAgICAgLnRoZW4gKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuICAgICAgICAgIC50aGVuIChqc29uKSA9PlxuICAgICAgICAgICAgc2VhcmNoU3VnZ2VzdGlvbnMuc3VnZ2VzdGlvbnMgPSBqc29uLnNpdGVzXG4gICAgICAgICAgICBzZWFyY2hTdWdnZXN0aW9ucy5lcnJvciA9IGZhbHNlXG4gICAgICAgICAgICBzZWFyY2hQcm9ncmVzcy5yZW1vdmVBdHRyaWJ1dGUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgIHNlYXJjaFByb2dyZXNzLnJlbW92ZUF0dHJpYnV0ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgICAgICAgIHNlYXJjaFN1Z2dlc3Rpb25zLnN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgICAgIHNlYXJjaFN1Z2dlc3Rpb25zLmVycm9yID0gdHJ1ZVxuICAgICAgICAsIDMwMFxuXG4gICAgYWRkZGlhbG9nLmFkZEJ1dHRvbiAnYWRkJywgLT5cbiAgICAgIGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0XG4gICAgICAgIG9yaWdpbnM6IFtcImh0dHBzOi8vZmVlZGx5LmNvbS9cIiwgXCJodHRwOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS9cIl1cbiAgICAgICwgKGdyYW50ZWQpID0+XG4gICAgICAgIGlmIGdyYW50ZWRcbiAgICAgICAgICBzZWFyY2gudG9nZ2xlKClcbiAgICAgICAgICBzZWFyY2hCYXIuZm9jdXMoKVxuXG4gICAgY29sdW1uY2hvb3Nlci5hc3luYyA9PlxuICAgICAgY29sdW1uY2hvb3Nlci5zaGFkb3dSb290LmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCAoZSkgPT5cbiAgICAgICAgaWYgbm90IGUudGFyZ2V0Lm1hdGNoZXMgXCIuZ3JpZCAuY29sdW1uIHBhcGVyLXJpcHBsZVwiIHRoZW4gcmV0dXJuXG4gICAgICAgIGNvbHVtbiA9IGUudGFyZ2V0LnRlbXBsYXRlSW5zdGFuY2UubW9kZWwuY29sdW1uXG4gICAgICAgIGNvbHVtbi5hdHRlbXB0QWRkID0+XG4gICAgICAgICAgYWRkZGlhbG9nLnRvZ2dsZSgpXG4gICAgICAgICAgbmV3Y29sdW1uID0gbmV3IENvbHVtbnNbY29sdW1uLmNsYXNzTmFtZV0oY29sdW1uKVxuICAgICAgICAgIEBhZGRDb2x1bW4gbmV3Y29sdW1uXG4gICAgICAgICAgQHBhY2tlcnkubGF5b3V0KClcblxuICAgIGNvbHVtbmNob29zZXIuYWRkRXZlbnRMaXN0ZW5lciBcImRlbGV0ZS1jb2x1bW5cIiwgKGUpID0+XG4gICAgICBjb2x1bW5jaG9vc2VyLnBhY2tlcnkucmVtb3ZlIGNvbEVsIGZvciBjb2xFbCBpbiBjb2x1bW5jaG9vc2VyLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbChcIi5jb2x1bW5cIikgd2hlbiBjb2xFbC50ZW1wbGF0ZUluc3RhbmNlLm1vZGVsLmNvbHVtbiBpcyBlLmRldGFpbFxuIyAgICAgIEBjb2x1bW5zLnNwbGljZSBAY29sdW1ucy5pbmRleE9mKGUuZGV0YWlsKSwgMVxuICAgICAgQGN1c3RvbUNvbHVtbnMuc3BsaWNlIEBjdXN0b21Db2x1bW5zLmluZGV4T2YoZS5kZXRhaWwpLCAxXG5cbiAgICAgIEBzeW5jQWxsKClcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmFiLWFkZFwiKS5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgPT5cbiAgICAgIGZhYmFuaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZmFiLWFuaW1cIlxuICAgICAgZmFiYW5pbS5jbGFzc0xpc3QuYWRkIFwiZmFiLWFuaW0tYWRkXCJcblxuICAgICAgYWRkZGlhbG9nLnRvZ2dsZSAtPlxuICAgICAgICBmYWJhbmltLnJlbW92ZSgpXG4gICAgICAsIC0+IGNvbHVtbmNob29zZXIuc2hvd24oKVxuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGZhYmFuaW1cbiAgICAgIGZhYmFuaW0ucGxheSgpXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJvb2ttYXJrcy1kcmF3ZXItYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCAtPlxuICAgICAgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpXG4gICAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdFxuICAgICAgICBwZXJtaXNzaW9uczogW1wiYm9va21hcmtzXCJdLFxuICAgICAgICBvcmlnaW5zOiBbXCJjaHJvbWU6Ly9mYXZpY29uLypcIl1cbiAgICAgICwgKGdyYW50ZWQpID0+XG4gICAgICAgIGlmIGdyYW50ZWRcbiAgICAgICAgICBkcmF3ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwiYXBwLWRyYXdlci5ib29rbWFya3NcIlxuICAgICAgICAgIGRyYXdlci5zaG93KClcbiAgICAgICAgICBkcmF3ZXIuYWRkRXZlbnRMaXN0ZW5lciBcIm9wZW5lZC1jaGFuZ2VkXCIsIC0+XG4gICAgICAgICAgICBpZiBAb3BlbmVkIHRoZW4gc2V0dGluZ3MuY2xhc3NMaXN0LmFkZChcImZvcmNlXCIpIGVsc2Ugc2V0dGluZ3MuY2xhc3NMaXN0LnJlbW92ZShcImZvcmNlXCIpXG5cbiAgICAgICAgICBjaHJvbWUuYm9va21hcmtzLmdldFJlY2VudCAyMCwgKHRyZWUpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyB0cmVlXG4gICAgICAgICAgICByZWNlbnQgPSBkcmF3ZXIucXVlcnlTZWxlY3RvcihcIi5yZWNlbnRcIilcbiAgICAgICAgICAgIHJlY2VudC5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgICAgICB0YWJiaWUucmVuZGVyQm9va21hcmtUcmVlIHJlY2VudCwgdHJlZSwgMFxuXG4gICAgICAgICAgY2hyb21lLmJvb2ttYXJrcy5nZXRUcmVlICh0cmVlKSA9PlxuICAgICAgICAgICAgdHJlZSA9IHRyZWVbMF0uY2hpbGRyZW5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwidHJlZVwiLCB0cmVlXG4gICAgICAgICAgICBhbGwgPSBkcmF3ZXIucXVlcnlTZWxlY3RvcihcIi5hbGxcIilcbiAgICAgICAgICAgIGFsbC5pbm5lckhUTUwgPSBcIlwiXG5cbiAgICAgICAgICAgIHRhYmJpZS5yZW5kZXJCb29rbWFya1RyZWUgYWxsLCB0cmVlLCAwXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRvcC1kcmF3ZXItYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCAtPlxuICAgICAgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpXG4gICAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdFxuICAgICAgICBwZXJtaXNzaW9uczogW1widG9wU2l0ZXNcIl0sXG4gICAgICAgIG9yaWdpbnM6IFtcImNocm9tZTovL2Zhdmljb24vKlwiXVxuICAgICAgLCAoZ3JhbnRlZCkgPT5cbiAgICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICAgIGNocm9tZS50b3BTaXRlcy5nZXQgKHNpdGVzKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2cgc2l0ZXNcbiAgICAgICAgICAgIGRyYXdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJhcHAtZHJhd2VyLnRvcFwiKVxuICAgICAgICAgICAgZHJhd2VyLmlubmVySFRNTCA9IFwiXCJcbiAgICAgICAgICAgIGRyYXdlci5zaG93KClcbiAgICAgICAgICAgIGRyYXdlci5hZGRFdmVudExpc3RlbmVyIFwib3BlbmVkLWNoYW5nZWRcIiwgLT5cbiAgICAgICAgICAgICAgaWYgQG9wZW5lZCB0aGVuIHNldHRpbmdzLmNsYXNzTGlzdC5hZGQoXCJmb3JjZVwiKSBlbHNlIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JjZVwiKVxuICAgICAgICAgICAgZm9yIHNpdGUgaW4gc2l0ZXNcbiAgICAgICAgICAgICAgcGFwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiYm9va21hcmstaXRlbVwiXG4gICAgICAgICAgICAgIHBhcGVyLnNob3dkYXRlID0gZmFsc2VcbiAgICAgICAgICAgICAgcGFwZXIudGl0bGUgPSBzaXRlLnRpdGxlXG4gICAgICAgICAgICAgIHBhcGVyLnVybCA9IHNpdGUudXJsXG4gICAgICAgICAgICAgIGRyYXdlci5hcHBlbmRDaGlsZCBwYXBlclxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcHAtZHJhd2VyLWJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgLT5cbiAgICAgIHNldHRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKVxuICAgICAgY2hyb21lLnBlcm1pc3Npb25zLnJlcXVlc3RcbiAgICAgICAgcGVybWlzc2lvbnM6IFtcIm1hbmFnZW1lbnRcIl0sXG4gICAgICAgIG9yaWdpbnM6IFtcImNocm9tZTovL2Zhdmljb24vKlwiXVxuICAgICAgLCAoZ3JhbnRlZCkgPT5cbiAgICAgICAgICBpZiBncmFudGVkXG4gICAgICAgICAgICBjaHJvbWUubWFuYWdlbWVudC5nZXRBbGwgKGV4dGVuc2lvbnMpID0+XG4gICAgICAgICAgICAgIGRyYXdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJhcHAtZHJhd2VyLmFwcHNcIilcbiAgICAgICAgICAgICAgZHJhd2VyLmlubmVySFRNTCA9IFwiXCJcbiAgICAgICAgICAgICAgZHJhd2VyLnNob3coKVxuICAgICAgICAgICAgICBkcmF3ZXIuYWRkRXZlbnRMaXN0ZW5lciBcIm9wZW5lZC1jaGFuZ2VkXCIsIC0+XG4gICAgICAgICAgICAgICAgaWYgQG9wZW5lZCB0aGVuIHNldHRpbmdzLmNsYXNzTGlzdC5hZGQoXCJmb3JjZVwiKSBlbHNlIHNldHRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JjZVwiKVxuXG4gICAgICAgICAgICAgIGZvciBleHRlbnNpb24gaW4gZXh0ZW5zaW9ucyB3aGVuIGV4dGVuc2lvbi50eXBlLmluZGV4T2YoXCJhcHBcIikgaXNudCAtMSBhbmQgbm90IGV4dGVuc2lvbi5kaXNhYmxlZFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgIGFwcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJhcHAtaXRlbVwiXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICBhcHAubmFtZSA9IGV4dGVuc2lvbi5uYW1lXG4gICAgICAgICAgICAgICAgICBhcHAuaWNvbiA9IGV4dGVuc2lvbi5pY29uc1tleHRlbnNpb24uaWNvbnMubGVuZ3RoLTFdLnVybFxuICAgICAgICAgICAgICAgICAgYXBwLmlkID0gZXh0ZW5zaW9uLmlkXG4gICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuIGVcblxuICAgICAgICAgICAgICAgIGFwcC5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgLT4gY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIHRoaXMuaWRcbiAgICAgICAgICAgICAgICBkcmF3ZXIuYXBwZW5kQ2hpbGQgYXBwXG5cblxuICAgIGNvbnNvbGUudGltZUVuZCgndGFiYmllIHJlbmRlcicpXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJlY2VudGx5LWRyYXdlci1idXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lciBcImNsaWNrXCIsIC0+XG4gICAgICBzZXR0aW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIilcbiAgICAgIGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0XG4gICAgICAgIHBlcm1pc3Npb25zOiBbXCJzZXNzaW9uc1wiLCBcInRhYnNcIl0sXG4gICAgICAgIG9yaWdpbnM6IFtcImNocm9tZTovL2Zhdmljb24vKlwiXVxuICAgICAgLCAoZ3JhbnRlZCkgPT5cbiAgICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICAgIGNocm9tZS5zZXNzaW9ucy5nZXRSZWNlbnRseUNsb3NlZCAoc2l0ZXMpID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBzaXRlc1xuICAgICAgICAgICAgZHJhd2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImFwcC1kcmF3ZXIucmVjZW50bHlcIilcbiAgICAgICAgICAgIGRyYXdlci5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgICAgICBkcmF3ZXIuc2hvdygpXG4gICAgICAgICAgICBkcmF3ZXIuYWRkRXZlbnRMaXN0ZW5lciBcIm9wZW5lZC1jaGFuZ2VkXCIsIC0+XG4gICAgICAgICAgICAgIGlmIEBvcGVuZWQgdGhlbiBzZXR0aW5ncy5jbGFzc0xpc3QuYWRkKFwiZm9yY2VcIikgZWxzZSBzZXR0aW5ncy5jbGFzc0xpc3QucmVtb3ZlKFwiZm9yY2VcIilcbiAgICAgICAgICAgIGZvciBzaXRlIGluIHNpdGVzXG4gICAgICAgICAgICAgIHBhcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInJlY2VudGx5LWl0ZW1cIlxuICAgICAgICAgICAgICBpZiBzaXRlLmhhc093blByb3BlcnR5KFwidGFiXCIpXG4gICAgICAgICAgICAgICAgcGFwZXIud2luZG93ID0gMFxuICAgICAgICAgICAgICAgIHBhcGVyLnVybCA9IHNpdGUudGFiLnVybFxuICAgICAgICAgICAgICAgIHBhcGVyLnRpdGxlID0gc2l0ZS50YWIudGl0bGVcbiAgICAgICAgICAgICAgICBwYXBlci5zZXNzSWQgPSBzaXRlLnRhYi5zZXNzaW9uSWRcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHBhcGVyLndpbmRvdyA9IDFcbiAgICAgICAgICAgICAgICBwYXBlci50YWJfY291bnQgPSBzaXRlLndpbmRvdy50YWJzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBhcGVyLnNlc3NJZCA9IHNpdGUud2luZG93LnNlc3Npb25JZFxuXG4gICAgICAgICAgICAgIHBhcGVyLmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCAtPlxuICAgICAgICAgICAgICAgIGNocm9tZS5zZXNzaW9ucy5yZXN0b3JlIHRoaXMuc2Vzc0lkXG4gICAgICAgICAgICAgICAgZHJhd2VyLmhpZGUoKVxuXG4gICAgICAgICAgICAgIGRyYXdlci5hcHBlbmRDaGlsZCBwYXBlclxuXG4gIHJlZ2lzdGVyOiAoY29sdW1uTmFtZSkgPT5cbiAgICBAY29sdW1uTmFtZXMucHVzaCBjb2x1bW5OYW1lXG5cbiAgY3JlYXRlQ29sdW1uRnJvbUZlZWRseTogKGZlZWRseSkgPT5cblxuICAgICN0b2RvIGRvd25sb2FkIGFuZCBjb252ZXJ0IHRodW1iIHRvIGRhdGEgdXJsXG4gICAgaWYgZmVlZGx5LnZpc3VhbFVybCB0aGVuIHRodW1iID0gZmVlZGx5LnZpc3VhbFVybFxuICAgIGVsc2UgdGh1bWIgPSBcImltZy9jb2x1bW4tdW5rbm93bi5wbmdcIjtcblxuICAgIGNvbHVtbiA9IG5ldyBDb2x1bW5zLkN1c3RvbUNvbHVtblxuICAgICAgbmFtZTogZmVlZGx5LnRpdGxlXG4gICAgICBsaW5rOiBmZWVkbHkud2Vic2l0ZVxuICAgICAgYmFzZVVybDogXCJodHRwczovL2ZlZWRseS5jb20vdjMvc3RyZWFtcy9jb250ZW50cz9jb3VudD0yMCZzdHJlYW1JZD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChmZWVkbHkuZmVlZElkKSArIFwiJmNvbnRpbnVhdGlvbj17UEFHRU5VTX1cIlxuICAgICAgdGh1bWI6IHRodW1iLFxuICAgICAgY3VzdG9tOiB0cnVlXG5cbiAgICBAY3VzdG9tQ29sdW1ucy5wdXNoIGNvbHVtblxuICAgIEBjb2x1bW5zLnB1c2ggY29sdW1uXG4gICAgQHJlc29ydENvbHVtbnMoKVxuICAgIEBzeW5jQWxsKClcblxuICByZXNvcnRDb2x1bW5zOiA9PlxuICAgIEBjb2x1bW5zLnNvcnQgKGEsIGIpIC0+IGlmIGEubmFtZSA8IGIubmFtZSB0aGVuIC0xIGVsc2UgaWYgYS5uYW1lID4gYi5uYW1lIHRoZW4gMSBlbHNlIDBcblxuICByZXNvcnRVc2VkQ29sdW1uczogKHVzZWQpID0+XG4gICAgdXNlZCA9IHVzZWQubWFwIChjbG1uKSAtPlxuICAgICAgaWYgbm90IGNsbW4uY29uZmlnLnBvc2l0aW9uIHRoZW4gY2xtbi5jb25maWcucG9zaXRpb24gPSB7eDogMCwgeTogMH1cbiAgICAgIHJldHVybiBjbG1uXG5cbiAgICB1c2VkLnNvcnQgKGEsIGIpIC0+IGEuY29uZmlnLnBvc2l0aW9uLnkgLSBiLmNvbmZpZy5wb3NpdGlvbi55IG9yIGEuY29uZmlnLnBvc2l0aW9uLnggLSBiLmNvbmZpZy5wb3NpdGlvbi54O1xuXG4gIGN1c3RvbUNvbHVtbnM6IFtdXG4gIHBhY2tlcnk6IG51bGxcbiAgY29sdW1uczogW11cbiAgY29sdW1uTmFtZXM6IFtdLFxuICB1c2VkQ29sdW1uczogW11cblxudGFiYmllID0gbmV3IFRhYmJpZSIsImNsYXNzIENvbHVtbnMuQXBwcyBleHRlbmRzIENvbHVtbnMuQ29sdW1uXG4gIG5hbWU6IFwiQXBwc1wiXG4gIHRodW1iOiBcImltZy9jb2x1bW4tYXBwcy5wbmdcIlxuICBmbGV4OiB0cnVlXG4gIGxpbms6IFwiY2hyb21lOi8vYXBwc1wiXG5cbiAgYXR0ZW1wdEFkZDogKHN1Y2Nlc3NDYWxsYmFjaykgPT5cbiAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdFxuICAgICAgcGVybWlzc2lvbnM6IFtcIm1hbmFnZW1lbnRcIl0sXG4gICAgICBvcmlnaW5zOiBbXCJjaHJvbWU6Ly9mYXZpY29uLypcIl1cbiAgICAsIChncmFudGVkKSA9PlxuICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICBpZiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIGhvbGRlckVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIlxuICAgIGNocm9tZS5tYW5hZ2VtZW50LmdldEFsbCAoZXh0ZW5zaW9ucykgPT5cbiAgICAgIGZvciBleHRlbnNpb24gaW4gZXh0ZW5zaW9ucyB3aGVuIGV4dGVuc2lvbi50eXBlLmluZGV4T2YoXCJhcHBcIikgaXNudCAtMSBhbmQgbm90IGV4dGVuc2lvbi5kaXNhYmxlZFxuICAgICAgICBjb25zb2xlLmxvZyBleHRlbnNpb25cbiAgICAgICAgYXBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImFwcC1pdGVtXCJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgYXBwLm5hbWUgPSBleHRlbnNpb24ubmFtZVxuICAgICAgICAgIGFwcC5pY29uID0gZXh0ZW5zaW9uLmljb25zW2V4dGVuc2lvbi5pY29ucy5sZW5ndGgtMV0udXJsXG4gICAgICAgICAgYXBwLmlkID0gZXh0ZW5zaW9uLmlkXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICBjb25zb2xlLndhcm4gZVxuXG4gICAgICAgIGFwcC5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgLT4gY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIHRoaXMuaWRcbiAgICAgICAgaG9sZGVyRWxlbWVudC5hcHBlbmRDaGlsZCBhcHBcblxuICAgICAgI25lZWRlZCBmb3IgcHJvcGVyIGZsZXhcbiAgICAgIGZvciBudW0gaW4gWzAuLjEwXSB3aGVuIEBmbGV4XG4gICAgICAgIGhhY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiYXBwLWl0ZW1cIlxuICAgICAgICBoYWNrLmNsYXNzTmFtZSA9IFwiaGFja1wiXG4gICAgICAgIGhvbGRlckVsZW1lbnQuYXBwZW5kQ2hpbGQgaGFja1xuXG4gIHJlbmRlcjogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICBAbG9hZGluZyA9IGZhbHNlXG5cbiAgICBAcmVmcmVzaCBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG5cbnRhYmJpZS5yZWdpc3RlciBcIkFwcHNcIiIsImNsYXNzIENvbHVtbnMuQmVoYW5jZSBleHRlbmRzIENvbHVtbnMuRmVlZENvbHVtblxuICBuYW1lOiBcIkJlaGFuY2VcIlxuICB3aWR0aDogMlxuICB0aHVtYjogXCJpbWcvY29sdW1uLWJlaGFuY2UucG5nXCJcbiAgbGluazogXCJodHRwczovL3d3dy5iZWhhbmNlLm5ldC9cIlxuXG4gIGVsZW1lbnQ6IFwiYmVoYW5jZS1pdGVtXCJcbiAgdXJsOiBcImh0dHBzOi8vYXBpLmJlaGFuY2UubmV0L3YyL3Byb2plY3RzP3BhZ2U9e1BBR0VOVU19JmFwaV9rZXk9SVJaa3p1YXZ5UThYQk5paEQyOTB3dGd0NEFsd1lvNlhcIlxuXG4gIGRhdGFQYXRoOiBcInByb2plY3RzXCJcbiAgZmxleDogdHJ1ZVxuICBpbmZpbml0ZVNjcm9sbDogdHJ1ZVxuXG50YWJiaWUucmVnaXN0ZXIgXCJCZWhhbmNlXCIiLCJjbGFzcyBDb2x1bW5zLkJvb2ttYXJrcyBleHRlbmRzIENvbHVtbnMuQ29sdW1uXG4gIG5hbWU6IFwiQm9va21hcmtzXCJcbiAgdGh1bWI6IFwiaW1nL2NvbHVtbi1ib29rbWFya3MucG5nXCJcbiAgbGluazogXCJjaHJvbWU6Ly9ib29rbWFya3NcIlxuXG4gIGF0dGVtcHRBZGQ6IChzdWNjZXNzQ2FsbGJhY2spID0+XG4gICAgY2hyb21lLnBlcm1pc3Npb25zLnJlcXVlc3RcbiAgICAgIHBlcm1pc3Npb25zOiBbXCJib29rbWFya3NcIl0sXG4gICAgICBvcmlnaW5zOiBbXCJjaHJvbWU6Ly9mYXZpY29uLypcIl1cbiAgICAsIChncmFudGVkKSA9PlxuICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICBpZiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIEB0YWJzLmlubmVySFRNTCA9IFwiXCJcbiAgICByZWNlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZGl2XCJcbiAgICByZWNlbnQuY2xhc3NMaXN0LmFkZCBcInJlY2VudFwiXG4gICAgQHRhYnMuYXBwZW5kQ2hpbGQgcmVjZW50XG4gICAgYWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImRpdlwiXG4gICAgYWxsLmNsYXNzTGlzdC5hZGQgXCJhbGxcIlxuICAgIEB0YWJzLmFwcGVuZENoaWxkIGFsbFxuXG4gICAgY2hyb21lLmJvb2ttYXJrcy5nZXRSZWNlbnQgMjAsICh0cmVlKSA9PlxuICAgICAgdGFiYmllLnJlbmRlckJvb2ttYXJrVHJlZSByZWNlbnQsIHRyZWUsIDBcblxuICAgIGNocm9tZS5ib29rbWFya3MuZ2V0VHJlZSAodHJlZSkgPT5cbiAgICAgIHRyZWUgPSB0cmVlWzBdLmNoaWxkcmVuXG4gICAgICB0YWJiaWUucmVuZGVyQm9va21hcmtUcmVlIGFsbCwgdHJlZSwgMFxuXG4gIHJlbmRlcjogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICBAbG9hZGluZyA9IGZhbHNlXG5cbiAgICBob2xkZXJFbGVtZW50LmlubmVySFRNTCA9IFwiXCJcbiAgICBAdGFicyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJib29rbWFyay10YWJzXCJcbiAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIEB0YWJzXG5cbiAgICBAcmVmcmVzaCBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG5cbnRhYmJpZS5yZWdpc3RlciBcIkJvb2ttYXJrc1wiIiwiY2xhc3MgQ29sdW1ucy5DbG9zZWRUYWJzIGV4dGVuZHMgQ29sdW1ucy5Db2x1bW5cbiAgbmFtZTogXCJDbG9zZWQgdGFic1wiXG4gIHRodW1iOiBcImltZy9jb2x1bW4tY2xvc2VkdGFicy5wbmdcIlxuICBsaW5rOiBcImNocm9tZTovL2hpc3RvcnlcIlxuXG4gIGF0dGVtcHRBZGQ6IChzdWNjZXNzQ2FsbGJhY2spID0+XG4gICAgY2hyb21lLnBlcm1pc3Npb25zLnJlcXVlc3RcbiAgICAgIHBlcm1pc3Npb25zOiBbXCJzZXNzaW9uc1wiLCBcInRhYnNcIl0sXG4gICAgICBvcmlnaW5zOiBbXCJjaHJvbWU6Ly9mYXZpY29uLypcIl1cbiAgICAsIChncmFudGVkKSA9PlxuICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICBpZiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIGhvbGRlckVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIlxuICAgIGNocm9tZS5zZXNzaW9ucy5nZXRSZWNlbnRseUNsb3NlZCAoc2l0ZXMpID0+XG4gICAgICBmb3Igc2l0ZSBpbiBzaXRlc1xuICAgICAgICBwYXBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJyZWNlbnRseS1pdGVtXCJcbiAgICAgICAgaWYgc2l0ZS5oYXNPd25Qcm9wZXJ0eShcInRhYlwiKVxuICAgICAgICAgIHBhcGVyLndpbmRvdyA9IDBcbiAgICAgICAgICBwYXBlci51cmwgPSBzaXRlLnRhYi51cmxcbiAgICAgICAgICBwYXBlci50aXRsZSA9IHNpdGUudGFiLnRpdGxlXG4gICAgICAgICAgcGFwZXIuc2Vzc0lkID0gc2l0ZS50YWIuc2Vzc2lvbklkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYXBlci53aW5kb3cgPSAxXG4gICAgICAgICAgcGFwZXIudGFiX2NvdW50ID0gc2l0ZS53aW5kb3cudGFicy5sZW5ndGhcbiAgICAgICAgICBwYXBlci5zZXNzSWQgPSBzaXRlLndpbmRvdy5zZXNzaW9uSWRcblxuICAgICAgICBwYXBlci5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgLT5cbiAgICAgICAgICBjaHJvbWUuc2Vzc2lvbnMucmVzdG9yZSB0aGlzLnNlc3NJZFxuXG4gICAgICAgIGhvbGRlckVsZW1lbnQuYXBwZW5kQ2hpbGQgcGFwZXJcblxuICByZW5kZXI6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIHN1cGVyIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcbiAgICBAcmVmcmVzaGluZyA9IGZhbHNlXG4gICAgQGxvYWRpbmcgPSBmYWxzZVxuICAgIEByZWZyZXNoIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcblxudGFiYmllLnJlZ2lzdGVyIFwiQ2xvc2VkVGFic1wiIiwiY2xhc3MgQ29sdW1ucy5Db2RlcGVuIGV4dGVuZHMgQ29sdW1ucy5GZWVkQ29sdW1uXG4gIG5hbWU6IFwiQ29kZXBlblwiXG4gIHdpZHRoOiAyXG4gIHRodW1iOiBcImltZy9jb2x1bW4tY29kZXBlbi5wbmdcIlxuICBsaW5rOiBcImh0dHBzOi8vY29kZXBlbi5pb1wiXG5cbiAgZWxlbWVudDogXCJjb2RlcGVuLWl0ZW1cIlxuICB1cmw6IFwiaHR0cDovL2NvZGVwZW4uaW8vcGlja3MvZmVlZC9cIlxuICByZXNwb25zZVR5cGU6IFwieG1sXCJcbiAgeG1sVGFnOiBcIml0ZW1cIlxuICBmbGV4OiB0cnVlXG5cbiAgYXR0ZW1wdEFkZDogKHN1Y2Nlc3NDYWxsYmFjaykgLT5cbiAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdFxuICAgICAgb3JpZ2luczogWydodHRwOi8vY29kZXBlbi5pby8nXVxuICAgICwgKGdyYW50ZWQpID0+XG4gICAgICBpZiBncmFudGVkIGFuZCB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG50YWJiaWUucmVnaXN0ZXIgXCJDb2RlcGVuXCJcbiIsIiNDdXN0b21Db2x1bW4gaXMgcGFydCBvZiB0aGUgdGFiYmllIGNvcmUuXG4jYmxhYmxhXG5cbmNsYXNzIENvbHVtbnMuQ3VzdG9tQ29sdW1uIGV4dGVuZHMgQ29sdW1ucy5GZWVkQ29sdW1uXG4gIGVsZW1lbnQ6IFwiZmVlZGx5LWl0ZW1cIlxuICByZXNwb25zZVR5cGU6IFwianNvblwiXG4gIHBhZ2U6IFwiXCIsXG4gIGluZmluaXRlU2Nyb2xsOiB0cnVlLFxuXG4gIGRyYXc6IChkYXRhLCBob2xkZXJFbGVtZW50KSA9PlxuICAgIGlmIHR5cGVvZiBkYXRhLmxlbmd0aCBpc250ICdudW1iZXInXG4gICAgICBAcGFnZSA9IGRhdGEuY29udGludWF0aW9uXG4gICAgICBkYXRhID0gZGF0YS5pdGVtc1xuICAgICAgQGNhY2hlID0gZGF0YVxuICAgIHN1cGVyIGRhdGEsIGhvbGRlckVsZW1lbnRcblxuICBhdHRlbXB0QWRkOiAoc3VjY2Vzc0NhbGxiYWNrKSA9PlxuICAgIGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0XG4gICAgICBvcmlnaW5zOiBbXCJodHRwczovL2ZlZWRseS5jb20vXCJdXG4gICAgLCAoZ3JhbnRlZCkgPT5cbiAgICAgIGlmIGdyYW50ZWRcbiAgICAgICAgaWYgdHlwZW9mIHN1Y2Nlc3NDYWxsYmFjayBpcyBcImZ1bmN0aW9uXCIgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKTsiLCJjbGFzcyBDb2x1bW5zLkRlc2lnbmVyTmV3cyBleHRlbmRzIENvbHVtbnMuRmVlZENvbHVtblxuICBuYW1lOiBcIkRlc2lnbmVyTmV3c1wiXG4gIHdpZHRoOiAxXG4gIHRodW1iOiBcImltZy9jb2x1bW4tZGVzaWduZXJuZXdzLnBuZ1wiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cuZGVzaWduZXJuZXdzLmNvL1wiXG5cbiAgdXJsOiBcImh0dHBzOi8vYXBpLmRlc2lnbmVybmV3cy5jby9hcGkvdjIvc3Rvcmllcy9cIlxuICBlbGVtZW50OiBcImRuLWl0ZW1cIlxuICBkYXRhUGF0aDogXCJzdG9yaWVzXCJcblxudGFiYmllLnJlZ2lzdGVyIFwiRGVzaWduZXJOZXdzXCIiLCJjbGFzcyBDb2x1bW5zLkRyaWJiYmxlIGV4dGVuZHMgQ29sdW1ucy5GZWVkQ29sdW1uXG4gIG5hbWU6IFwiRHJpYmJibGVcIlxuICB3aWR0aDogMlxuICB0aHVtYjogXCJpbWcvY29sdW1uLWRyaWJibGUucG5nXCJcbiAgbGluazogXCJodHRwczovL2RyaWJiYmxlLmNvbVwiXG5cbiAgZWxlbWVudDogXCJkcmliYmJsZS1pdGVtXCJcbiAgdXJsOiBcImh0dHBzOi8vYXBpLmRyaWJiYmxlLmNvbS92MS9zaG90cz9wYWdlPXtQQUdFTlVNfSZhY2Nlc3NfdG9rZW49NzRmOGZiOWY5MmMxZjc5YzRiYzM2NjJmNzA4ZGZkY2U3Y2QwNWMzZmM2N2FjODRhZTY4ZmY0NzU2OGI3MWExZlwiXG5cbiAgaW5maW5pdGVTY3JvbGw6IHRydWVcbiAgZmxleDogdHJ1ZVxuXG50YWJiaWUucmVnaXN0ZXIgXCJEcmliYmJsZVwiIiwiY2xhc3MgQ29sdW1ucy5HaXRIdWIgZXh0ZW5kcyBDb2x1bW5zLkZlZWRDb2x1bW5cbiAgbmFtZTogXCJHaXRIdWJcIlxuICB3aWR0aDogMVxuICB0aHVtYjogXCJpbWcvY29sdW1uLWdpdGh1Yi5wbmdcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbVwiXG5cbiAgZWxlbWVudDogXCJnaXRodWItaXRlbVwiXG4gIGRhdGFQYXRoOiBcIml0ZW1zXCJcbiAgZGlhbG9nOiBcImdpdGh1Yi1kaWFsb2dcIlxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIGlmIHR5cGVvZiBAY29uZmlnLnBlcmlvZCBpcyBcInVuZGVmaW5lZFwiIHRoZW4gQGNvbmZpZy5wZXJpb2QgPSAxXG5cbiAgICBzd2l0Y2ggQGNvbmZpZy5wZXJpb2RcbiAgICAgIHdoZW4gMCB0aGVuIHBlcmlvZCA9IFwibW9udGhcIlxuICAgICAgd2hlbiAxIHRoZW4gcGVyaW9kID0gXCJ3ZWVrXCJcbiAgICAgIHdoZW4gMiB0aGVuIHBlcmlvZCA9IFwiZGF5XCJcblxuICAgIGlmIHR5cGVvZiBAY29uZmlnLmxhbmd1YWdlIGlzIFwidW5kZWZpbmVkXCIgdGhlbiBAY29uZmlnLmxhbmd1YWdlID0gMFxuXG4gICAgc3dpdGNoIEBjb25maWcubGFuZ3VhZ2VcbiAgICAgIHdoZW4gMCB0aGVuIGxhbmd1YWdlID0gXCJcIlxuICAgICAgd2hlbiAxIHRoZW4gbGFuZ3VhZ2UgPSBcIitsYW5ndWFnZTpDU1NcIlxuICAgICAgd2hlbiAyIHRoZW4gbGFuZ3VhZ2UgPSBcIitsYW5ndWFnZTpIVE1MXCJcbiAgICAgIHdoZW4gMyB0aGVuIGxhbmd1YWdlID0gXCIrbGFuZ3VhZ2U6SmF2YVwiXG4gICAgICB3aGVuIDQgdGhlbiBsYW5ndWFnZSA9IFwiK2xhbmd1YWdlOkphdmFTY3JpcHRcIlxuICAgICAgd2hlbiA1IHRoZW4gbGFuZ3VhZ2UgPSBcIitsYW5ndWFnZTpQSFBcIlxuICAgICAgd2hlbiA2IHRoZW4gbGFuZ3VhZ2UgPSBcIitsYW5ndWFnZTpQeXRob25cIlxuICAgICAgd2hlbiA3IHRoZW4gbGFuZ3VhZ2UgPSBcIitsYW5ndWFnZTpSdWJ5XCJcblxuXG4gICAgZGF0ZSA9IG5ldyBtb21lbnRcbiAgICBkYXRlLnN1YnRyYWN0KDEsIHBlcmlvZClcbiAgICBAdXJsID0gXCJodHRwczovL2FwaS5naXRodWIuY29tL3NlYXJjaC9yZXBvc2l0b3JpZXM/cT1jcmVhdGVkOj49XCIrZGF0ZS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpK2xhbmd1YWdlK1wiJnNvcnQ9c3RhcnMmb3JkZXI9ZGVzY1wiXG4gICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuXG50YWJiaWUucmVnaXN0ZXIgXCJHaXRIdWJcIiIsImBcbiAgICAvL3V0aWwgZnVuY3Rpb25zIGtpbmRseSBzdG9sZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZWJpZGVsL3BvbHltZXItZ21haWwvXG5cbiAgICBmdW5jdGlvbiBnZXRWYWx1ZUZvckhlYWRlckZpZWxkKGhlYWRlcnMsIGZpZWxkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBoZWFkZXI7IGhlYWRlciA9IGhlYWRlcnNbaV07ICsraSkge1xuICAgICAgICAgICAgaWYgKGhlYWRlci5uYW1lID09IGZpZWxkIHx8IGhlYWRlci5uYW1lID09IGZpZWxkLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVhZGVyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpeFVwTWVzc2FnZXMocmVzcCkge1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSByZXNwLnJlc3VsdC5tZXNzYWdlcztcblxuICAgICAgICBmb3IgKHZhciBqID0gMCwgbTsgbSA9IG1lc3NhZ2VzW2pdOyArK2opIHtcbiAgICAgICAgICAgIHZhciBoZWFkZXJzID0gbS5wYXlsb2FkLmhlYWRlcnM7XG4gICAgICAgICAgICB2YXIga2VlcCA9IFsnc3ViamVjdCcsICdzbmlwcGV0JywgJ2lkJywgJ3RocmVhZElkJ11cbiAgICAgICAgICAgIG1lc3NhZ2UgPSB7fVxuICAgICAgICAgICAga2VlcC5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2Vba2V5XSA9IG1ba2V5XVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgLy8gRXhhbXBsZTogVGh1IFNlcCAyNSAyMDE0IDE0OjQzOjE4IEdNVC0wNzAwIChQRFQpIC0+IFNlcHQgMjUuXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGdldFZhbHVlRm9ySGVhZGVyRmllbGQoaGVhZGVycywgJ0RhdGUnKSk7XG4gICAgICAgICAgICBtZXNzYWdlLmRhdGUgPSBkYXRlLnRvRGF0ZVN0cmluZygpLnNwbGl0KCcgJykuc2xpY2UoMSwgMykuam9pbignICcpO1xuICAgICAgICAgICAgbWVzc2FnZS50byA9IGdldFZhbHVlRm9ySGVhZGVyRmllbGQoaGVhZGVycywgJ1RvJyk7XG4gICAgICAgICAgICBtZXNzYWdlLnN1YmplY3QgPSBnZXRWYWx1ZUZvckhlYWRlckZpZWxkKGhlYWRlcnMsICdTdWJqZWN0Jyk7XG5cbiAgICAgICAgICAgIHZhciBmcm9tSGVhZGVycyA9IGdldFZhbHVlRm9ySGVhZGVyRmllbGQoaGVhZGVycywgJ0Zyb20nKTtcbiAgICAgICAgICAgIHZhciBmcm9tSGVhZGVyTWF0Y2hlcyA9IGZyb21IZWFkZXJzLm1hdGNoKG5ldyBSZWdFeHAoL1wiPyguKj8pXCI/XFxzPzwoLiopPi8pKTtcblxuICAgICAgICAgICAgbWVzc2FnZS5mcm9tID0ge307XG5cbiAgICAgICAgICAgIC8vIFVzZSBuYW1lIGlmIG9uZSB3YXMgZm91bmQuIE90aGVyd2lzZSwgdXNlIGVtYWlsIGFkZHJlc3MuXG4gICAgICAgICAgICBpZiAoZnJvbUhlYWRlck1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBubyBhIG5hbWUsIHVzZSBlbWFpbCBhZGRyZXNzIGZvciBkaXNwbGF5TmFtZS5cbiAgICAgICAgICAgICAgICBtZXNzYWdlLmZyb20ubmFtZSA9IGZyb21IZWFkZXJNYXRjaGVzWzFdLmxlbmd0aCA/IGZyb21IZWFkZXJNYXRjaGVzWzFdIDogZnJvbUhlYWRlck1hdGNoZXNbMl07XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5mcm9tLmVtYWlsID0gZnJvbUhlYWRlck1hdGNoZXNbMl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZnJvbS5uYW1lID0gZnJvbUhlYWRlcnMuc3BsaXQoJ0AnKVswXTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmZyb20uZW1haWwgPSBmcm9tSGVhZGVycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lc3NhZ2UuZnJvbS5uYW1lID0gbWVzc2FnZS5mcm9tLm5hbWUuc3BsaXQoJ0AnKVswXTsgLy8gRW5zdXJlIGVtYWlsIGlzIHNwbGl0LlxuXG4gICAgICAgICAgICBtZXNzYWdlLnVucmVhZCA9IG0ubGFiZWxJZHMuaW5kZXhPZihcIlVOUkVBRFwiKSAhPSAtMTtcbiAgICAgICAgICAgIG1lc3NhZ2Uuc3RhcnJlZCA9IG0ubGFiZWxJZHMuaW5kZXhPZihcIlNUQVJSRURcIikgIT0gLTE7XG5cbiAgICAgICAgICAgIG1lc3NhZ2VzW2pdID0gbWVzc2FnZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xuICAgIH1cbmBcblxuY2xhc3MgQ29sdW1ucy5HbWFpbCBleHRlbmRzIENvbHVtbnMuQ29sdW1uXG4gIG5hbWU6IFwiR21haWxcIlxuICB0aHVtYjogXCJpbWcvY29sdW1uLWdtYWlsLnBuZ1wiXG4gIGRpYWxvZzogXCJnbWFpbC1kaWFsb2dcIlxuICBsaW5rOiBcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tL1wiXG5cbiAgaG9sZGVyRWw6IHVuZGVmaW5lZFxuICBjb2x1bW5FbDogdW5kZWZpbmVkXG5cbiAgbG9nT3V0OiA9PlxuICAgICNjbGVhciBjb250ZW50LCBzaG93IHNwaW5uZXJcbiAgICBAaG9sZGVyRWwuaW5uZXJIVE1MID0gXCJcIlxuICAgIEBsb2FkaW5nID0gdHJ1ZVxuICAgIGRlbGV0ZSBAY29uZmlnLnVzZXJcbiAgICBAY2FjaGUgPSBbXVxuICAgIHRhYmJpZS5zeW5jIEBcblxuICAgIGNocm9tZS5pZGVudGl0eS5nZXRBdXRoVG9rZW5cbiAgICAgIGludGVyYWN0aXZlOiBmYWxzZVxuICAgICwgKHRva2VuKSA9PlxuICAgICAgaWYgIWNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICAjc3RlcCAxLCByZW1vdmUgdG9rZW4gZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGNocm9tZS5pZGVudGl0eS5yZW1vdmVDYWNoZWRBdXRoVG9rZW5cbiAgICAgICAgICB0b2tlbjogdG9rZW5cbiAgICAgICAgLCA9PlxuICAgICAgICAgICAgI3N0ZXAgMiwgcmV2b2tlIHRva2VuIEAgZ29vZ2xlXG4gICAgICAgICAgICBmZXRjaChcImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9yZXZva2U/dG9rZW49XCIgKyB0b2tlbilcbiAgICAgICAgICAgICAgLmNhdGNoID0+XG4gICAgICAgICAgICAgICAgI29rLCBzbyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgcGVybWlzc2lvbnMgdGhpcyB3ZSBjYW4ndCBjb21wbGV0ZSB0aGUgcmVxdWVzdCwgYnV0IHRoaXMgZG9lc24ndCBtYXR0ZXIsIGJlY2F1c2UgdGhlIHRva2VuIGlzIHJldm9rZWQgZWl0aGVyd2F5LlxuICAgICAgICAgICAgICAgICN3YWl0IDEgc2VjIGJlY2F1c2UgZWxzZSB3ZWlyZCB0aGluZ3Mgc3RhcnQgdG8gaGFwcGVuICh0b2tlbiBub3QgYWN0dWFsbHkgYmVpbmcgcmV2b2tlZCAvIGdldEF1dGhUb2tlbiByZXR1cm5pbmcgYSBuZXcgdG9rZW4pXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgICAgICAgQGxvYWRpbmcgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgQHJlZnJlc2ggQGNvbHVtbkVsLCBAaG9sZGVyRWxcbiAgICAgICAgICAgICAgICAsIDEwMDBcblxuICBkcmF3OiAoZGF0YSwgaG9sZGVyRWxlbWVudCkgPT5cbiAgICBAbG9hZGluZyA9IGZhbHNlXG4gICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuXG4gICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG5cbiAgICBmb3IgaXRlbSBpbiBkYXRhXG4gICAgICBjaGlsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJnbWFpbC1pdGVtXCJcbiAgICAgIGNoaWxkLml0ZW0gPSBpdGVtXG4gICAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGNoaWxkXG5cbiAgcmVuZGVyOiAoY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudCkgLT5cbiAgICBzdXBlciBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG5cbiAgICBAY29sdW1uRWwgPSBjb2x1bW5FbGVtZW50XG4gICAgQGhvbGRlckVsID0gaG9sZGVyRWxlbWVudFxuXG4gICAgaWYgT2JqZWN0LmtleXMoQGNhY2hlKS5sZW5ndGhcbiAgICAgIEBkcmF3IEBjYWNoZSwgaG9sZGVyRWxlbWVudFxuICAgIEByZWZyZXNoIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcblxuICBnYXBpTG9hZGVkOiBmYWxzZVxuICBlcnJvcmVkOiBmYWxzZVxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIGlmIG5vdCBAY29uZmlnLmNvbG9ycyB0aGVuIEBjb25maWcuY29sb3JzID0ge31cbiAgICBcbiAgICBAcmVmcmVzaGluZyA9IHRydWVcbiAgICBnYXBpRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZ29vZ2xlLWNsaWVudC1hcGlcIlxuICAgIGNvbHVtbkVsZW1lbnQuYXBwZW5kQ2hpbGQgZ2FwaUVsXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAjZ29vZ2xlLWNsaWVudC1hcGkgZG9lc24ndCBoYXZlIGEgZXZlbnQgZm9yIGVycm9ycyA7Xzsgc28ganVzdCB3YWl0IDUgc2VjcyBhbmQgc2VlIGlmIGdhcGkgaXMgYXZhaWxhYmxlXG4gICAgICBpZiBub3QgQGdhcGlMb2FkZWRcbiAgICAgICAgQGVycm9yZWQgPSB0cnVlXG4gICAgICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICAgICAgQGxvYWRpbmcgPSBmYWxzZVxuICAgICAgICBAZXJyb3IgaG9sZGVyRWxlbWVudFxuICAgICwgNTAwMFxuXG4gICAgZ2FwaUVsLmFkZEV2ZW50TGlzdGVuZXIgXCJhcGktbG9hZFwiLCA9PlxuICAgICAgQGdhcGlMb2FkZWQgPSB0cnVlXG4gICAgICBjb25zb2xlLmluZm8gJ2dhcGkgbG9hZGVkJ1xuICAgICAgY2hyb21lLmlkZW50aXR5LmdldEF1dGhUb2tlblxuICAgICAgICBpbnRlcmFjdGl2ZTogZmFsc2VcbiAgICAgICwgKHRva2VuKSA9PlxuICAgICAgICAgIGlmICFjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICAgIGdhcGkuYXV0aC5zZXRUb2tlblxuICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuLFxuICAgICAgICAgICAgICBkdXJhdGlvbjogXCI1MjAwMFwiLFxuICAgICAgICAgICAgICBzdGF0ZTogXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLm1vZGlmeVwiXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiQXV0aCB0b2tlbiBkYXRhXCIsIGdhcGkuYXV0aC5nZXRUb2tlbigpXG5cbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQgXCJnbWFpbFwiLCBcInYxXCIsID0+XG4gICAgICAgICAgICAgIGlmIG5vdCBAY29uZmlnLnVzZXJcbiAgICAgICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkIFwicGx1c1wiLCBcInYxXCIsID0+XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8gXCJncGx1cyBsb2FkZWRcIlxuICAgICAgICAgICAgICAgICAgYmF0Y2ggPSBnYXBpLmNsaWVudC5uZXdCYXRjaCgpXG4gICAgICAgICAgICAgICAgICBiYXRjaC5hZGQgZ2FwaS5jbGllbnQucGx1cy5wZW9wbGUuZ2V0XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogJ21lJ1xuICAgICAgICAgICAgICAgICAgYmF0Y2guYWRkIGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLmdldFByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiAnbWUnXG4gICAgICAgICAgICAgICAgICBiYXRjaC50aGVuIChyZXNwKSA9PlxuICAgICAgICAgICAgICAgICAgICBAY29uZmlnLnVzZXIgPSB7fVxuICAgICAgICAgICAgICAgICAgICBAY29uZmlnLnVzZXJba2V5XSA9IHZhbHVlIGZvciBrZXksIHZhbHVlIG9mIGl0ZW0ucmVzdWx0IGZvciBrLCBpdGVtIG9mIHJlc3AucmVzdWx0XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyBcInVzZXJcIiwgQGNvbmZpZy51c2VyXG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyBcImdtYWlsIGxvYWRlZFwiXG4gICAgICAgICAgICAgIGdtYWlsID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnNcbiAgICAgICAgICAgICAgZ21haWwudGhyZWFkcy5saXN0XG4gICAgICAgICAgICAgICAgdXNlcklkOiAnbWUnLFxuICAgICAgICAgICAgICAgIHE6ICdpbjppbmJveCdcbiAgICAgICAgICAgICAgLnRoZW4gKHJlc3ApID0+XG4gICAgICAgICAgICAgICAgYmF0Y2ggPSBnYXBpLmNsaWVudC5uZXdCYXRjaCgpXG5cbiAgICAgICAgICAgICAgICBpZiBub3QgcmVzcC5yZXN1bHQudGhyZWFkc1xuICAgICAgICAgICAgICAgICAgQGRyYXcgW10sIGhvbGRlckVsZW1lbnRcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgcmVzcC5yZXN1bHQudGhyZWFkcy5mb3JFYWNoICh0aHJlYWQpID0+XG4gICAgICAgICAgICAgICAgICByZXEgPSBnbWFpbC50aHJlYWRzLmdldFxuICAgICAgICAgICAgICAgICAgICB1c2VySWQ6ICdtZScsXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0aHJlYWQuaWRcbiAgICAgICAgICAgICAgICAgIGJhdGNoLmFkZCByZXFcblxuICAgICAgICAgICAgICAgIGJhdGNoLnRoZW4gKHJlc3ApID0+XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IFtdXG4gICAgICAgICAgICAgICAgICBmb3Iga2V5LCBpdGVtIG9mIHJlc3AucmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIGZpeGVkID0gZml4VXBNZXNzYWdlcyBpdGVtXG4gICAgICAgICAgICAgICAgICAgICNncmFiIGZpcnN0LCBhZGQgYW1vdW50IG9mIG1lc3NhZ2VzIGluIHRocmVhZCB0byBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBmaXhlZFswXVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmFtb3VudCA9IGZpeGVkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAjY2hlY2sgaWYgd2UgYWxyZWFkeSBnZW5lcmF0ZWQgYSBjb2xvciBmb3IgdGhpcyByZWNpcGllbnQsIGlmIG5vdCwgZ2VuZXJhdGUgaXQgJiBzYXZlIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBAY29uZmlnLmNvbG9yc1ttZXNzYWdlLmZyb20uZW1haWxdIHRoZW4gbWVzc2FnZS5jb2xvciA9IEBjb25maWcuY29sb3JzW21lc3NhZ2UuZnJvbS5lbWFpbF0gPSBQbGVhc2UubWFrZV9jb2xvcigpWzBdXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgbWVzc2FnZS5jb2xvciA9IEBjb25maWcuY29sb3JzW21lc3NhZ2UuZnJvbS5lbWFpbF1cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAjYmF0Y2ggcmV0dXJucyB0aHJlYWRzIGluIGEgcmFuZG9tIG9yZGVyLCBzbyByZXNvcnQgdGhlbSBiYXNlZCBvbiB0aGVpciBoZXggaWQnc1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZXMgPSBtZXNzYWdlcy5zb3J0IChhLCBiKSAtPlxuICAgICAgICAgICAgICAgICAgICBheCA9IHBhcnNlSW50IGEuaWQsIDE2XG4gICAgICAgICAgICAgICAgICAgIGJ4ID0gcGFyc2VJbnQgYi5pZCwgMTZcblxuICAgICAgICAgICAgICAgICAgICBpZiBheCA+IGJ4IHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgIEBjYWNoZSA9IG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICB0YWJiaWUuc3luYyBAXG4gICAgICAgICAgICAgICAgICBAZHJhdyBtZXNzYWdlcywgaG9sZGVyRWxlbWVudFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBsb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICAgICAgICAgIGF1dGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiZ21haWwtYXV0aFwiXG4gICAgICAgICAgICBhdXRoLmFkZEV2ZW50TGlzdGVuZXIgXCJzaWduLWluXCIsID0+XG4gICAgICAgICAgICAgIEByZW5kZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuICAgICAgICAgICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgICAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGF1dGhcblxudGFiYmllLnJlZ2lzdGVyIFwiR21haWxcIiIsImNsYXNzIENvbHVtbnMuSGFja2VyTmV3cyBleHRlbmRzIENvbHVtbnMuRmVlZENvbHVtblxuICBuYW1lOiBcIkhhY2tlck5ld3NcIlxuICB0aHVtYjogXCJpbWcvY29sdW1uLWhhY2tlcm5ld3MucG5nXCJcbiAgdXJsOiBcImh0dHBzOi8vYXBpLnBuZC5ncy92MS9zb3VyY2VzL2hhY2tlck5ld3MvcG9wdWxhclwiXG4gIGVsZW1lbnQ6IFwiaG4taXRlbVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9cIlxuXG50YWJiaWUucmVnaXN0ZXIgXCJIYWNrZXJOZXdzXCIiLCJjbGFzcyBDb2x1bW5zLkxvYnN0ZXJzIGV4dGVuZHMgQ29sdW1ucy5GZWVkQ29sdW1uXG4gIG5hbWU6IFwiTG9ic3RlLnJzXCJcbiAgd2lkdGg6IDFcbiAgdGh1bWI6IFwiaW1nL2NvbHVtbi1sb2JzdGVycy5wbmdcIlxuICBsaW5rOiBcImh0dHBzOi8vbG9ic3RlLnJzL1wiXG5cbiAgdXJsOiBcImh0dHBzOi8vbG9ic3RlLnJzL2hvdHRlc3QuanNvblwiXG4gIGVsZW1lbnQ6IFwibG9ic3RlcnMtaXRlbVwiXG4gIGRpYWxvZzogXCJsb2JzdGVycy1kaWFsb2dcIlxuXG4gIHJlZnJlc2g6IChob2xkZXJFbCwgY29sdW1uRWwpID0+XG4gICAgaWYgbm90IEBjb25maWcubGlzdGluZyB0aGVuIEBjb25maWcubGlzdGluZyA9IDBcblxuICAgIHN3aXRjaCBAY29uZmlnLmxpc3RpbmdcbiAgICAgIHdoZW4gMCB0aGVuIGxpc3RpbmcgPSBcImhvdHRlc3RcIlxuICAgICAgd2hlbiAxIHRoZW4gbGlzdGluZyA9IFwibmV3ZXN0XCJcblxuICAgIEB1cmwgPSBcImh0dHBzOi8vbG9ic3RlLnJzL1wiK2xpc3RpbmcrXCIuanNvblwiXG4gICAgc3VwZXIgaG9sZGVyRWwsIGNvbHVtbkVsXG5cbnRhYmJpZS5yZWdpc3RlciBcIkxvYnN0ZXJzXCIiLCJjbGFzcyBDb2x1bW5zLlByb2R1Y3RIdW50IGV4dGVuZHMgQ29sdW1ucy5GZWVkQ29sdW1uXG4gIG5hbWU6IFwiUHJvZHVjdEh1bnRcIlxuICB0aHVtYjogXCJpbWcvY29sdW1uLXByb2R1Y3RodW50LnBuZ1wiXG4gIGVsZW1lbnQ6IFwicGgtaXRlbVwiXG4gIGRhdGFQYXRoOiBcInBvc3RzXCJcbiAgbGluazogXCJodHRwczovL3d3dy5wcm9kdWN0aHVudC5jb21cIlxuICBkaWFsb2c6IFwicGgtZGlhbG9nXCJcbiAgd2lkdGg6IDFcblxuICBhdHRlbXB0QWRkOiAoc3VjY2Vzc0NhbGxiYWNrKSAtPlxuICAgIGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0XG4gICAgICBvcmlnaW5zOiBbJ2h0dHBzOi8vYXBpLnByb2R1Y3RodW50LmNvbS8nXVxuICAgICwgKGdyYW50ZWQpID0+XG4gICAgICAgIGlmIGdyYW50ZWQgYW5kIHR5cGVvZiBzdWNjZXNzQ2FsbGJhY2sgaXMgJ2Z1bmN0aW9uJyB0aGVuIHN1Y2Nlc3NDYWxsYmFjaygpXG5cbiAgZHJhdzogKGRhdGEsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgaWYgbm90IEBjb25maWcudHlwZSB0aGVuIEBjb25maWcudHlwZSA9IFwibGlzdFwiXG4gICAgQGVsZW1lbnQgPSBpZiBAY29uZmlnLnR5cGUgPT0gXCJsaXN0XCIgdGhlbiBcInBoLWl0ZW1cIiBlbHNlIFwicGgtdGh1bWJcIlxuICAgIEBmbGV4ID0gQGVsZW1lbnQgPT0gXCJwaC10aHVtYlwiXG5cbiAgICBkYXRhLnBvc3RzID0gZGF0YS5wb3N0cy5tYXAgKGl0ZW0sIGluZGV4KSAtPiBpdGVtLmluZGV4ID0gaW5kZXggKyAxOyBpdGVtXG5cbiAgICBzdXBlciBkYXRhLCBob2xkZXJFbGVtZW50XG5cbiAgcmVmcmVzaDogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpID0+XG4gICAgI3Byb2R1Y3RodW50IGFwaSByZXF1aXJlcyBhIHJlcXVlc3QgZm9yIGEgYWNjZXNzIHRva2VuXG4gICAgI3doZW4gd2UndmUgZ290IGFjY2VzcyB0b2tlbiwgd2UgY2FuIGdvIG9uIGFzIHVzdWFsXG5cbiAgICBmZXRjaCBcImh0dHBzOi8vYXBpLnByb2R1Y3RodW50LmNvbS92MS9vYXV0aC90b2tlblwiLFxuICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgIGhlYWRlcnM6XG4gICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeVxuICAgICAgICBjbGllbnRfaWQ6IFwiNmM3YWU0NjgyNDVlODI4Njc2YmU5OTlmNWE0MmU2ZTUwZTAxMDFjYTk5NDgwYzRlZWZiZWI5ODFkNTZmMzEwZFwiLFxuICAgICAgICBjbGllbnRfc2VjcmV0OiBcIjAwODI1YmUyZGE2MzRhN2Q4MGJjNGRjOGQzY2JkZDU0YmNhYTQ2ZDQyNzMxMDEyMjdjMjdkYmQ2OGFjY2RiNzdcIixcbiAgICAgICAgZ3JhbnRfdHlwZTogXCJjbGllbnRfY3JlZGVudGlhbHNcIlxuICAgIC50aGVuIChyZXNwb25zZSkgLT5cbiAgICAgIGlmIHJlc3BvbnNlLnN0YXR1cyBpcyAyMDAgdGhlbiBQcm9taXNlLnJlc29sdmUgcmVzcG9uc2VcbiAgICAgIGVsc2UgUHJvbWlzZS5yZWplY3QgbmV3IEVycm9yIHJlc3BvbnNlLnN0YXR1c1RleHRcbiAgICAudGhlbiAocmVzcG9uc2UpIC0+XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG4gICAgLnRoZW4gKGpzb24pID0+XG4gICAgICBAdXJsID0gXCJodHRwczovL2FwaS5wcm9kdWN0aHVudC5jb20vdjEvcG9zdHM/YWNjZXNzX3Rva2VuPVwiK2pzb24uYWNjZXNzX3Rva2VuXG4gICAgICBzdXBlciBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG4gICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICAgIEBsb2FkaW5nID0gZmFsc2VcblxuICAgICAgaWYgbm90IEBjYWNoZSBvciBAY2FjaGUubGVuZ3RoIGlzIDAgdGhlbiBAZXJyb3IgaG9sZGVyRWxlbWVudFxuXG5cbnRhYmJpZS5yZWdpc3RlciBcIlByb2R1Y3RIdW50XCIiLCJjbGFzcyBDb2x1bW5zLlB1c2hCdWxsZXQgZXh0ZW5kcyBDb2x1bW5zLkNvbHVtblxuICBuYW1lOiBcIlB1c2hCdWxsZXRcIlxuICB0aHVtYjogXCJpbWcvY29sdW1uLXB1c2hidWxsZXQucG5nXCJcbiAgZGlhbG9nOiBcInB1c2hidWxsZXQtZGlhbG9nXCJcbiAgc29ja2V0OiB1bmRlZmluZWRcbiAgYXBpOiB1bmRlZmluZWRcbiAgY29sRWw6IHVuZGVmaW5lZFxuICBob2xFbDogdW5kZWZpbmVkXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cucHVzaGJ1bGxldC5jb21cIlxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSA9PlxuICAgIEByZWZyZXNoaW5nID0gdHJ1ZVxuICAgIEBhcGkudXNlciAoZXJyb3IsIHVzZXIpID0+XG4gICAgICBAY29uZmlnLnVzZXIgPSB1c2VyXG4gICAgICB0YWJiaWUuc3luYyBAXG4gICAgICBAYXBpLnB1c2hIaXN0b3J5IChlcnJvciwgaGlzdG9yeSkgPT5cbiAgICAgICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuICAgICAgICB1c2VyLm15c2VsZiA9IHRydWVcbiAgICAgICAgaXRlbS5mcm9tID0gdXNlciBmb3IgaXRlbSBpbiBoaXN0b3J5LnB1c2hlcyB3aGVuIGl0ZW0uZGlyZWN0aW9uIGlzICdzZWxmJ1xuICAgICAgICBAY2FjaGUgPSBoaXN0b3J5XG4gICAgICAgIHRhYmJpZS5zeW5jIEBcbiAgICAgICAgQGRyYXcgaGlzdG9yeSwgaG9sZGVyRWxlbWVudFxuXG4gIGRyYXc6IChkYXRhLCBob2xkZXJFbGVtZW50KSA9PlxuICAgIEBsb2FkaW5nID0gZmFsc2VcbiAgICBob2xkZXJFbGVtZW50LmlubmVySFRNTCA9IFwiXCJcbiAgICBmb3IgaXRlbSBpbiBkYXRhLnB1c2hlc1xuICAgICAgaWYgbm90IGl0ZW0uYWN0aXZlIHRoZW4gY29udGludWVcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInB1c2hidWxsZXQtaXRlbVwiXG4gICAgICBlbC5pdGVtID0gaXRlbVxuICAgICAgaG9sZGVyRWxlbWVudC5hcHBlbmRDaGlsZCBlbFxuXG4gIGxvZ091dDogKCkgPT5cbiAgICBkZWxldGUgQGNvbmZpZy5hY2Nlc3NfdG9rZW5cbiAgICBkZWxldGUgQGNvbmZpZy51c2VyXG4gICAgdGFiYmllLnN5bmMgQFxuICAgIEByZW5kZXIgQGNvbEVsLCBAaG9sRWxcblxuICByZW5kZXI6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSA9PlxuICAgIHN1cGVyIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcbiAgICBAYXBpID0gd2luZG93LlB1c2hCdWxsZXRcbiAgICBAY29sRWwgPSBjb2x1bW5FbGVtZW50XG4gICAgQGhvbEVsID0gaG9sZGVyRWxlbWVudFxuXG4gICAgaWYgbm90IEBjb25maWcuYWNjZXNzX3Rva2VuXG4gICAgICBAbG9hZGluZyA9IGZhbHNlXG4gICAgICBAcmVmcmVzaGluZyA9IGZhbHNlXG4gICAgICBhdXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInB1c2hidWxsZXQtYXV0aFwiXG4gICAgICBhdXRoLmFkZEV2ZW50TGlzdGVuZXIgXCJzaWduLWluXCIsIChldmVudCkgPT5cbiAgICAgICAgQGNvbmZpZy5hY2Nlc3NfdG9rZW4gPSBldmVudC5kZXRhaWxcbiAgICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgICBAcmVuZGVyIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcbiAgICAgIGhvbGRlckVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIlxuICAgICAgaG9sZGVyRWxlbWVudC5hcHBlbmRDaGlsZCBhdXRoXG4gICAgZWxzZVxuICAgICAgQGFwaS5BUElLZXkgPSBAY29uZmlnLmFjY2Vzc190b2tlblxuXG4gICAgICBpZiBPYmplY3Qua2V5cyhAY2FjaGUpLmxlbmd0aFxuICAgICAgICBAZHJhdyBAY2FjaGUsIGhvbGRlckVsZW1lbnRcbiAgICAgIEByZWZyZXNoIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcblxuICAgICAgQHNvY2tldCA9IG5ldyBXZWJTb2NrZXQgJ3dzczovL3N0cmVhbS5wdXNoYnVsbGV0LmNvbS93ZWJzb2NrZXQvJyArIEBjb25maWcuYWNjZXNzX3Rva2VuXG4gICAgICBAc29ja2V0Lm9ubWVzc2FnZSA9IChlKSA9PlxuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSBlLmRhdGFcbiAgICAgICAgaWYgZGF0YS50eXBlIGlzIFwidGlja2xlXCIgYW5kIGRhdGEuc3VidHlwZSBpcyBcInB1c2hcIiB0aGVuIEByZWZyZXNoIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcblxudGFiYmllLnJlZ2lzdGVyIFwiUHVzaEJ1bGxldFwiIiwiY2xhc3MgQ29sdW1ucy5SZWRkaXQgZXh0ZW5kcyBDb2x1bW5zLkZlZWRDb2x1bW5cbiAgbmFtZTogXCJSZWRkaXRcIlxuICB3aWR0aDogMVxuICBkaWFsb2c6IFwicmVkZGl0LWRpYWxvZ1wiXG4gIHRodW1iOiBcImltZy9jb2x1bW4tcmVkZGl0LnBuZ1wiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cucmVkZGl0LmNvbS9cIlxuXG4gIGVsZW1lbnQ6IFwicmVkZGl0LWl0ZW1cIlxuICBkYXRhUGF0aDogXCJkYXRhLmNoaWxkcmVuXCJcbiAgY2hpbGRQYXRoOiBcImRhdGFcIlxuXG4gIGNpZDogXCJxcjZkcnc0NUpGQ1hmd1wiXG5cbiAgcmVmcmVzaDogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpID0+XG4gICAgQHJlZnJlc2hpbmcgPSB0cnVlXG5cbiAgICBpZiBub3QgQGNvbmZpZy5zdWJyZWRkaXRcbiAgICAgIEBjb25maWcgPVxuICAgICAgICBsaXN0aW5nOiAwXG4gICAgICAgIHN1YnJlZGRpdDogXCJmdW5ueVwiXG4gICAgICAgIG9wdGlvbjogXCJzdWJyZWRkaXRcIixcbiAgICAgICAgbXVsdGlyZWRkaXQ6IFwiZW1wdy9tL2VsZWN0cm9uaWNtdXNpY1wiXG5cbiAgICBjb25zb2xlLmluZm8gXCJjb25maWcub3B0aW9uXCIsIEBjb25maWcub3B0aW9uXG4gICAgc3dpdGNoIEBjb25maWcub3B0aW9uXG4gICAgICB3aGVuIFwic3VicmVkZGl0XCJcbiAgICAgICAgc3dpdGNoIEBjb25maWcubGlzdGluZ1xuICAgICAgICAgIHdoZW4gMCB0aGVuIGxpc3RpbmcgPSBcImhvdFwiXG4gICAgICAgICAgd2hlbiAxIHRoZW4gbGlzdGluZyA9IFwibmV3XCJcbiAgICAgICAgICB3aGVuIDIgdGhlbiBsaXN0aW5nID0gXCJ0b3BcIlxuXG4gICAgICAgIEB1cmwgPSBcImh0dHBzOi8vd3d3LnJlZGRpdC5jb20vci9cIitAY29uZmlnLnN1YnJlZGRpdCtcIi9cIitsaXN0aW5nK1wiLmpzb25cIlxuICAgICAgICBzdXBlciBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG4gICAgICB3aGVuIFwibXVsdGlyZWRkaXRcIlxuICAgICAgICBAdXJsID0gXCJodHRwczovL3d3dy5yZWRkaXQuY29tL3VzZXIvXCIrQGNvbmZpZy5tdWx0aXJlZGRpdCtcIi5qc29uXCJcbiAgICAgICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuICAgICAgd2hlbiBcImZyb250cGFnZVwiXG4gICAgICAgIGNiID0gPT5cbiAgICAgICAgICBmZXRjaCBcImh0dHBzOi8vb2F1dGgucmVkZGl0LmNvbS8uanNvblwiLFxuICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IFwiYmVhcmVyIFwiK0Bjb25maWcuYWNjZXNzX3Rva2VuXG4gICAgICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgLnRoZW4gKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMCB0aGVuIFByb21pc2UucmVzb2x2ZSByZXNwb25zZS5qc29uKClcbiAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDQwMVxuICAgICAgICAgICAgICBAaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgICAgICAgIEBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJyZWRkaXQtZXJyb3JcIlxuICAgICAgICAgICAgICBkZWxldGUgQGNvbmZpZy5hY2Nlc3NfdG9rZW5cbiAgICAgICAgICAgICAgZGVsZXRlIEBjb25maWcucmVmcmVzaF90b2tlblxuICAgICAgICAgICAgICBkZWxldGUgQGNvbmZpZy5leHBpcmVcbiAgICAgICAgICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdCBuZXcgRXJyb3IgcmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgICAgICAgICAgZWxzZSBQcm9taXNlLnJlamVjdCBuZXcgRXJyb3IgcmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuICAgICAgICAgICAgQGNhY2hlID0gZGF0YVxuICAgICAgICAgICAgdGFiYmllLnN5bmMgQFxuICAgICAgICAgICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgICAgICBAZHJhdyBkYXRhLCBob2xkZXJFbGVtZW50XG4gICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3JcbiAgICAgICAgICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICAgICAgICAgIEBsb2FkaW5nID0gZmFsc2VcblxuICAgICAgICAjY2hlY2sgaWYgdG9rZW4gaGFzIGV4cGlyZWRcbiAgICAgICAgaWYgTWF0aC5mbG9vcihuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDApID4gQGNvbmZpZy5leHBpcmVcbiAgICAgICAgICBAZ2V0VG9rZW4gZmFsc2UsIGNiXG4gICAgICAgIGVsc2UgY2IoKVxuICAgICAgZWxzZSBjb25zb2xlLmVycm9yIFwiUmVkZGl0IGNvbHVtbjogSW52YWxpZCBjb25maWcub3B0aW9uID8/P1wiXG5cbiAgcmVuZGVyOiAoQGNvbHVtbkVsZW1lbnQsIEBob2xkZXJFbGVtZW50KSA9PlxuICAgIHN1cGVyIEBjb2x1bW5FbGVtZW50LCBAaG9sZGVyRWxlbWVudFxuXG4gIGdldFRva2VuOiAoY29kZSwgY2IpID0+XG4gICAgI2lmIHdlIGhhdmUgYSBjb2RlLCB1c2UgdGhlIGNvZGUsIGlmIG5vdCwgYXNzdW1lIHdlJ3ZlIGdvdCBhIHJlZnJlc2hfdG9rZW5cbiAgICBpZiBjb2RlIHRoZW4gYm9keSA9IFwiZ3JhbnRfdHlwZT1hdXRob3JpemF0aW9uX2NvZGUmY29kZT1cIitjb2RlK1wiJnJlZGlyZWN0X3VyaT1odHRwcyUzQSUyRiUyRlwiK2Nocm9tZS5ydW50aW1lLmlkK1wiLmNocm9taXVtYXBwLm9yZyUyRnJlZGRpdFwiXG4gICAgZWxzZSBib2R5ID0gXCJncmFudF90eXBlPXJlZnJlc2hfdG9rZW4mcmVmcmVzaF90b2tlbj1cIitAY29uZmlnLnJlZnJlc2hfdG9rZW4rXCImcmVkaXJlY3RfdXJpPWh0dHBzJTNBJTJGJTJGXCIrY2hyb21lLnJ1bnRpbWUuaWQrXCIuY2hyb21pdW1hcHAub3JnJTJGcmVkZGl0XCJcblxuICAgIGZldGNoIFwiaHR0cHM6Ly93d3cucmVkZGl0LmNvbS9hcGkvdjEvYWNjZXNzX3Rva2VuXCIsXG4gICAgICBtZXRob2Q6IFwicG9zdFwiXG4gICAgICBoZWFkZXJzOlxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLFxuICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogXCJCYXNpYyBcIitidG9hKEBjaWQrXCI6XCIpXG4gICAgICBib2R5OiBib2R5XG4gICAgLnRoZW4gKHJlc3BvbnNlKSA9PlxuICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMCB0aGVuIFByb21pc2UucmVzb2x2ZSByZXNwb25zZS5qc29uKClcbiAgICAgIGVsc2UgUHJvbWlzZS5yZWplY3QgbmV3IEVycm9yIHJlc3BvbnNlLnN0YXR1c1RleHRcbiAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgIEBjb25maWcuYWNjZXNzX3Rva2VuID0gZGF0YS5hY2Nlc3NfdG9rZW5cbiAgICAgIGlmIGNvZGUgdGhlbiBAY29uZmlnLnJlZnJlc2hfdG9rZW4gPSBkYXRhLnJlZnJlc2hfdG9rZW5cbiAgICAgIEBjb25maWcuZXhwaXJlID0gTWF0aC5mbG9vcihuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDApICsgZGF0YS5leHBpcmVzX2luXG4gICAgICBjb25zb2xlLmluZm8gXCJhY2Nlc3NfdG9rZW5cIiwgQGNvbmZpZy5hY2Nlc3NfdG9rZW4sIFwicmVmcmVzaF90b2tlblwiLCBAY29uZmlnLnJlZnJlc2hfdG9rZW4sIFwiZXhwaXJlIHRpbWVcIiwgQGNvbmZpZy5leHBpcmVcbiAgICAgIHRhYmJpZS5zeW5jIEBcbiAgICAgIGlmIHR5cGVvZiBjYiBpcyAnZnVuY3Rpb24nIHRoZW4gY2IoKVxuICAgIC5jYXRjaCAoZSkgPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZSlcblxuICBsb2dpbjogPT5cbiAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdFxuICAgICAgb3JpZ2luczogWydodHRwczovL29hdXRoLnJlZGRpdC5jb20vJywgJ2h0dHBzOi8vd3d3LnJlZGRpdC5jb20vJ11cbiAgICAsIChncmFudGVkKSA9PlxuICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICBjaHJvbWUuaWRlbnRpdHkubGF1bmNoV2ViQXV0aEZsb3dcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly93d3cucmVkZGl0LmNvbS9hcGkvdjEvYXV0aG9yaXplP2NsaWVudF9pZD1cIitAY2lkK1wiJnJlc3BvbnNlX3R5cGU9Y29kZSZzdGF0ZT1oZWxsb3RoaXNpc2FlYXN0ZXJlZ2cmcmVkaXJlY3RfdXJpPWh0dHBzJTNBJTJGJTJGXCIrY2hyb21lLnJ1bnRpbWUuaWQrXCIuY2hyb21pdW1hcHAub3JnJTJGcmVkZGl0JmR1cmF0aW9uPXBlcm1hbmVudCZzY29wZT1yZWFkXCJcbiAgICAgICAgICBpbnRlcmFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgLCAocmVkaXJlY3RfdXJsKSA9PlxuICAgICAgICAgICAgaWYgcmVkaXJlY3RfdXJsXG4gICAgICAgICAgICAgIGNvZGUgPSAvY29kZT0oW2EtekEtWjAtOV9cXC1dKikvLmV4ZWMocmVkaXJlY3RfdXJsKVsxXVxuICAgICAgICAgICAgICBAZ2V0VG9rZW4gY29kZVxuXG4gIGxvZ291dDogPT5cbiAgICBkZWxldGUgQGNvbmZpZy5hY2Nlc3NfdG9rZW5cbiAgICB0YWJiaWUuc3luYyBAXG5cbnRhYmJpZS5yZWdpc3RlciBcIlJlZGRpdFwiIiwiY2xhc3MgQ29sdW1ucy5TcGVlZERpYWwgZXh0ZW5kcyBDb2x1bW5zLkNvbHVtblxuICBuYW1lOiBcIlNwZWVkRGlhbFwiXG4gIGRpYWxvZzogXCJzcGVlZC1kaWFsLWRpYWxvZ1wiXG4gIHRodW1iOiBcImltZy9jb2x1bW4tc3BlZWRkaWFsLnBuZ1wiXG4gIGZsZXg6IHRydWVcbiAgZWxlbWVudDogXCJzcGVlZC1kaWFsLWl0ZW1cIlxuICBsaW5rOiBcIlwiXG5cbiAgcmVmcmVzaDogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG5cbiAgICAjIGluaXRpYWxpemUgY29uZmlnXG4gICAgaWYgbm90IEBjb25maWcud2Vic2l0ZXNcbiAgICAgIEBjb25maWcgPVxuICAgICAgICB3ZWJzaXRlczogW11cblxuICAgICMgY3JlYXRlIGl0ZW1zXG4gICAgZm9yIHdlYnNpdGUgaW4gQGNvbmZpZy53ZWJzaXRlc1xuICAgICAgYXBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcInNwZWVkLWRpYWwtaXRlbVwiXG4gICAgICB0cnlcbiAgICAgICAgYXBwLm5hbWUgPSB3ZWJzaXRlLm5hbWVcbiAgICAgICAgYXBwLmljb24gPSB3ZWJzaXRlLmljb24udXJsXG4gICAgICAgIGFwcC51cmwgPSB3ZWJzaXRlLnVybFxuICAgICAgY2F0Y2ggZVxuICAgICAgICBjb25zb2xlLndhcm4gZVxuXG4gICAgICBob2xkZXJFbGVtZW50LmFwcGVuZENoaWxkIGFwcFxuXG4gICAgI25lZWRlZCBmb3IgcHJvcGVyIGZsZXhcbiAgICBmb3IgbnVtIGluIFswLi4xMF0gd2hlbiBAZmxleFxuICAgICAgaGFjayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJzcGVlZC1kaWFsLWl0ZW1cIlxuICAgICAgaGFjay5jbGFzc05hbWUgPSBcImhhY2tcIlxuICAgICAgaG9sZGVyRWxlbWVudC5hcHBlbmRDaGlsZCBoYWNrXG5cbiAgcmVuZGVyOiAoY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudCkgLT5cbiAgICBzdXBlciBjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50XG4gICAgQHJlZnJlc2hpbmcgPSBmYWxzZVxuICAgIEBsb2FkaW5nID0gZmFsc2VcblxuICAgIEByZWZyZXNoIGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnRcblxudGFiYmllLnJlZ2lzdGVyIFwiU3BlZWREaWFsXCJcbiIsImNsYXNzIENvbHVtbnMuVG9wU2l0ZXMgZXh0ZW5kcyBDb2x1bW5zLkNvbHVtblxuICBuYW1lOiBcIlRvcCBzaXRlc1wiXG4gIHRodW1iOiBcImltZy9jb2x1bW4tdG9wc2l0ZXMucG5nXCJcblxuICBhdHRlbXB0QWRkOiAoc3VjY2Vzc0NhbGxiYWNrKSA9PlxuICAgIGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0XG4gICAgICBwZXJtaXNzaW9uczogW1widG9wU2l0ZXNcIl0sXG4gICAgICBvcmlnaW5zOiBbXCJjaHJvbWU6Ly9mYXZpY29uLypcIl1cbiAgICAsIChncmFudGVkKSA9PlxuICAgICAgaWYgZ3JhbnRlZFxuICAgICAgICBpZiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrIGlzICdmdW5jdGlvbicgdGhlbiBzdWNjZXNzQ2FsbGJhY2soKVxuXG4gIHJlZnJlc2g6IChjb2x1bW5FbGVtZW50LCBob2xkZXJFbGVtZW50KSAtPlxuICAgIGNocm9tZS50b3BTaXRlcy5nZXQgKHNpdGVzKSA9PlxuICAgICAgaG9sZGVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXG4gICAgICBmb3Igc2l0ZSBpbiBzaXRlc1xuICAgICAgICBwYXBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJib29rbWFyay1pdGVtXCJcbiAgICAgICAgcGFwZXIuc2hvd2RhdGUgPSBmYWxzZVxuICAgICAgICBwYXBlci50aXRsZSA9IHNpdGUudGl0bGVcbiAgICAgICAgcGFwZXIudXJsID0gc2l0ZS51cmxcbiAgICAgICAgaG9sZGVyRWxlbWVudC5hcHBlbmRDaGlsZCBwYXBlclxuXG4gIHJlbmRlcjogKGNvbHVtbkVsZW1lbnQsIGhvbGRlckVsZW1lbnQpIC0+XG4gICAgc3VwZXIgY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuICAgIEByZWZyZXNoaW5nID0gZmFsc2VcbiAgICBAbG9hZGluZyA9IGZhbHNlXG4gICAgQHJlZnJlc2ggY29sdW1uRWxlbWVudCwgaG9sZGVyRWxlbWVudFxuXG50YWJiaWUucmVnaXN0ZXIgXCJUb3BTaXRlc1wiIl19
