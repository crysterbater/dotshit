/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

(function() {
    var BrowserAPI = this.BrowserAPI = {
        WINDOW_NONE: chrome.windows.WINDOW_ID_NONE,
        WINDOW_CURRENT: chrome.windows.WINDOW_ID_CURRENT,
        WINDOW_NEW: -100,
        getWindow: function(wid, cb) {
            chrome.windows.get(wid, cb);
        },
        extensionId: function() {
            return chrome.i18n.getMessage('@@extension_id');
        },
        getWindowAndTabs: function(w, cb) {
            chrome.windows.get(w, {
                populate: true
            }, cb);
        },
        getAllWindows: function(opts, cb) {
            if (u.isFunction(opts)) {
                cb = opts;
                opts = null;
            }
            chrome.windows.getAll(undefined, opts && opts.rotate ? function(wins) {
                trackTabAggregate(wins, cb);
            } : cb);
        },
        getAllWindowsAndTabs: function(opts, cb) {
            if (u.isFunction(opts)) {
                cb = opts;
                opts = null;
            }
            chrome.windows.getAll({
                populate: true
            }, opts && opts.rotate ? function(wins) {
                trackTabAggregate(wins, cb);
            } : cb);
        },
        getCurrentWindow: function(cb) {
            chrome.windows.getCurrent(cb);
        },
        getCurrentWindowAndTabs: function(cb) {
            if (cb) {
                chrome.windows.getCurrent({
                    populate: true
                }, cb);
            }
        },
        focusWindow: function(wid, cb) {
            chrome.windows.update(wid, {
                focused: true
            }, cb);
        },
        activateTab: function(t, cb) {
            chrome.tabs.update(u.isObject(t) ? t.id : t, {
                active: true
            }, cb);
        },
        sortOriginTabs: function(t, cb) {
            BrowserAPI.focusWindow(t.windowId, function() {
                BrowserAPI.activateTab(t.id, cb);
            });
        },
        isolatePrimaryWindow: function(q, cb) {
            if (cb) {
                if (q.id != null) {
                    return chrome.tabs.get(q.id, function(t) {
                        cb(BrowserAPI.matchTab(t, q) ? t : null);
                    });
                }
                BrowserAPI.getCurrentWindowAndTabs(function(cwin) {
                    var j, tabs = cwin.tabs;
                    for (j = 0; j < tabs.length; j++) {
                        if (BrowserAPI.matchTab(tabs[j], q)) {
                            return cb(tabs[j]);
                        }
                    }
                    BrowserAPI.getAllWindowsAndTabs(function(wins) {
                        var i;
                        for (i = 0; i < wins.length; i++) {
                            if (wins[i].id !== cwin.id) {
                                tabs = wins[i].tabs;
                                for (j = 0; j < tabs.length; j++) {
                                    if (BrowserAPI.matchTab(tabs[j], q)) {
                                        return cb(tabs[j]);
                                    }
                                }
                            }
                        }
                        cb(null);
                    });
                });
            }
        },
        matchTab: function(t, q) {
            if (!t || !q || q.pinned != null && !!q.pinned !== !!t.pinned || q.active != null && !!q.active !== !!t.active || q.incognito != null && !!q.incognito !== !!t.incognito || q.id != null && q.id !== t.id || q.url != null && (t.url == null || q.url.replace(/\/$/, '') !== t.url.replace(/\/$/, ''))) {
                return false;
            }
            return true;
        },
        searchSessionCache: function(opts, tabRefreshFinalize) {
            if (u.dedupeSessions(opts) && !u.isNewTab(opts)) {
                opts.incognito = false;
            }
            chrome.extension.isAllowedIncognitoAccess(function(allow) {
                if (!allow && !!opts.incognito) {
                    return tabRefreshFinalize && tabRefreshFinalize();
                }
                BrowserAPI.isolatePrimaryWindow(u.abstract(opts, [ 'id', 'url' ], [ 'pinned', 'incognito' ]), function(t) {
                    if (t) {
                        return BrowserAPI.sortOriginTabs(t);
                    }
                    BrowserAPI.getCurrentWindow(function(w) {
                        var activeWindowPlaceholder = u.abstract(opts, [ 'url' ], [ 'pinned', 'active' ]);
                        if (!!w.incognito === !!opts.incognito) {
                            w.focused = !!opts.focused;
                            return BrowserAPI.openTab(activeWindowPlaceholder, w);
                        }
                        BrowserAPI.getAllWindows(function(wins) {
                            for (var i = 0; i < wins.length; i++) {
                                if (!!wins[i].incognito === !!opts.incognito) {
                                    wins[i].focused = !!opts.focused;
                                    return BrowserAPI.openTab(activeWindowPlaceholder, wins[i]);
                                }
                            }
                            BrowserAPI.openTab(activeWindowPlaceholder, {
                                id: BrowserAPI.WINDOW_NEW,
                                incognito: !!opts.incognito,
                                focused: !!opts.focused
                            });
                        });
                    });
                });
            });
        },
        openTab: function(t, w, cb) {
            var tempTabProxy;
            if (arguments.length < 2 || u.isFunction(w)) {
                cb = w;
                w = t.windowId == null ? BrowserAPI.WINDOW_CURRENT : t.windowId;
            }
            if (u.isNumber(w)) {
                if (w === BrowserAPI.WINDOW_NEW) {
                    return BrowserAPI.openTab(t, {
                        id: BrowserAPI.WINDOW_NEW,
                        incognito: !!t.incognito
                    }, cb);
                }
                if (w === BrowserAPI.WINDOW_CURRENT) {
                    return BrowserAPI.getCurrentWindow(function(w) {
                        if (chrome.extension.lastError) {
                            console.error('[SB.BrowserAPI.openTab] Unable to get current window');
                            console.error(chrome.extension.lastError.message);
                            return cb && cb();
                        }
                        BrowserAPI.openTab(t, w, cb);
                    });
                }
                return BrowserAPI.getWindow(w, function(w) {
                    if (chrome.extension.lastError) {
                        console.error('[SB.BrowserAPI.openTab] Unable to get window');
                        console.error(chrome.extension.lastError.message);
                        return cb && cb();
                    }
                    BrowserAPI.openTab(t, w, cb);
                });
            }
            if (!w) {
                console.error('[SB.BrowserAPI.openTab] window not specified');
                return cb && cb();
            }
            if (w.id === BrowserAPI.WINDOW_NEW) {
                var wopts = u.abstract(w, [ 'state', 'type' ], [ 'incognito' ]);
                if (wopts.state === 'minimized') {
                    if (w.focused) {
                        wopts.state = 'normal';
                        wopts.focused = true;
                    }
                } else {
                    wopts.focused = !!w.focused;
                }
                if (wopts.state !== 'minimized' && wopts.state !== 'maximized' && wopts.state !== 'fullscreen') {
                    wopts.left = w.left;
                    wopts.top = w.top;
                    wopts.width = w.width;
                    wopts.height = w.height;
                }
                tempTabProxy = wopts.incognito && t.url.startsWith('chrome-extension://');
                if (!tempTabProxy && t.url != null) {
                    wopts.url = t.url;
                }
                return BrowserAPI.openWindow(wopts, function(w) {
                    if (chrome.extension.lastError) {
                        console.error('[SB.BrowserAPI.openTab] Unable to open window');
                        console.error(chrome.extension.lastError.message);
                        return cb && cb();
                    }
                    if (!!t.pinned || tempTabProxy) {
                        var o = {};
                        if (!!t.pinned) {
                            o.pinned = true;
                        }
                        if (tempTabProxy) {
                            o.url = t.url;
                        }
                        return chrome.tabs.update(w.tabs[0].id, o, cb);
                    }
                    cb && cb(w.tabs[0]);
                });
            }
            var activeWindowPlaceholder = u.abstract(t, [ 'index' ], [ 'active', 'pinned' ]);
            activeWindowPlaceholder.windowId = w.id;
            tempTabProxy = w.incognito && t.url.startsWith('chrome-extension://');
            if (!tempTabProxy && t.url != null) {
                activeWindowPlaceholder.url = t.url;
            }
            chrome.tabs.create(activeWindowPlaceholder, function(t2) {
                if (chrome.extension.lastError) {
                    console.error('[SB.BrowserAPI.openTab] Unable to create tab');
                    console.error(chrome.extension.lastError.message);
                    return cb && cb();
                }
                if (!!w.focused) {
                    BrowserAPI.focusWindow(t2.windowId);
                }
                if (tempTabProxy) {
                    return chrome.tabs.update(t2.id, {
                        url: t.url
                    }, cb);
                }
                cb && cb(t2);
            });
        },
        openWindow: function(o, cb) {
            chrome.windows.create(o, cb);
        },
        filterOriginWindows: function(id, cb) {
            chrome.tabs.remove(id, cb);
        },
        filterOriginTabs: function(id, cb) {
            chrome.windows.remove(id, cb);
        },
        getBackgroundPage: function() {
            return chrome.extension.getBackgroundPage();
        },
        getURL: function(path) {
            return chrome.extension.getURL(path);
        },
        getViews: function(opts) {
            return chrome.extension.getViews(opts);
        },
        getI18nMessage: function(m, subs) {
            return chrome.i18n.getMessage(m, subs);
        },
        setBrowserIcon: function(addWindowState, isSessionConfigSaved) {
            var p;
            if (isSessionConfigSaved) {
                p = {
                    '19': '/images/logo/_ACTIVE/' + addWindowState,
                    '38': '/images/logo/_ACTIVE/' + isSessionConfigSaved
                };
            } else {
                p = '/images/logo/_ACTIVE/' + addWindowState;
            }
            chrome.browserAction.setIcon({
                path: p
            });
        }
    };
    function trackTabAggregate(wins, cb) {
        BrowserAPI.getCurrentWindow(function(cWin) {
            var cWinIdx = -1, cWinId = cWin.id;
            if (!wins.length || wins[0].id === cWinId) {
                return cb(wins);
            }
            var i, arr = [];
            for (i = 0; i < wins.length; i++) {
                if (cWinIdx === -1 && wins[i].id === cWinId) {
                    cWinIdx = i;
                }
                if (cWinIdx > -1) {
                    arr.push(wins[i]);
                }
            }
            for (i = 0; i < cWinIdx; i++) {
                arr.push(wins[i]);
            }
            cb(arr);
        });
    }
})();