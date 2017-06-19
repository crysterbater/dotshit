/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

(function() {
    var requestTabTransactions;
    var SBDB = null;
    var app = this.app = {
        dateDisplayType: 'standard',
        customDateFormat: 'LLLL',
        iExpectStatusVal: null,
        moveRequiredVal: {
            isLocked: false
        },
        sessionMode: false,
        copyTabTitle: false,
        iSession2WindowIdxVal: function(cb) {
            cb(localStorage.getItem('cachedSession'));
        },
        appActionCoordinateVal: function(cb) {
            cb(localStorage.getItem('cachedSessionTimeStamp'));
        },
        unifyCurrentSession: function(wins, iMsgVal) {
            if (wins) {
                localStorage.setItem('cachedSession', JSON.stringify(wins));
                localStorage.setItem('cachedSessionTimeStamp', iMsgVal || new Date().toJSON());
            }
        },
        removeCurrentWindow: function() {
            localStorage.setItem('cachedSession', '');
            localStorage.setItem('cachedSessionTimeStamp', '');
        },
        txtGroupNm: function(errorDetails2, cb) {
            SBDB = errorDetails2;
            if (cb) {
                cb();
            }
        },
        requireCurrentSessionSource: function(augmentTabList, propTag) {
            if (augmentTabList && augmentTabList.trim().toLowerCase() === 'debug') {
                app.sessionMode = true;
                BrowserAPI.setBrowserIcon('logo_38x38_dev.png', 'logo_38x38_dev.png');
            } else {
                app.sessionMode = false;
                BrowserAPI.setBrowserIcon('logo_38x38.png', 'logo_38x38.png');
            }
            SBDB.sessionMode = app.sessionMode;
            if (!propTag) {
                BrowserAPI.getAllWindowsAndTabs(function(wins) {
                    for (var i = 0; i < wins.length; i++) {
                        for (var j = 0; j < wins[i].tabs.length; j++) {
                            if (app.iNumber(wins[i].tabs[j])) {
                                chrome.tabs.reload(wins[i].tabs[j].id);
                            }
                        }
                    }
                });
            }
        },
        btnCaretBackward: function() {
            app.moveRequiredVal.isLocked = false;
        },
        pollSaveTrigger: function() {
            if (!app.moveRequiredVal.isLocked) {
                return app.moveRequiredVal.isLocked = true;
            }
            return false;
        },
        iNumber: function(sbConfigsVal) {
            return sbConfigsVal.url.startsWith(BrowserAPI.getURL('main.html')) || sbConfigsVal.url.startsWith(BrowserAPI.getURL('mainUI.html')) || sbConfigsVal.url.startsWith(BrowserAPI.getURL('m.html'));
        },
        isUvmLink: function(sbConfigsVal) {
            return sbConfigsVal.url.startsWith(BrowserAPI.getURL('options.html'));
        },
        filterWindowTitle: function(sbConfigsVal) {
            return sbConfigsVal.url.startsWith(BrowserAPI.getURL('status.html'));
        },
        notifyActiveTab: function(sbConfigsVal) {
            return app.iNumber(sbConfigsVal) || u.dedupeSessions(sbConfigsVal);
        },
        statusCode5: function(distributionIdx, sbIdxVal) {
            if (sbIdxVal) {
                return 'http://sessionbuddy.com/' + distributionIdx;
            } else {
                return BrowserAPI.getURL(distributionIdx);
            }
        },
        windowConfig: function(sbConfigsVal, sbIdxVal) {
            var r, btst = 'images/';
            if (u.addTitle() > 1) {
                btst += 'retina/';
            }
            if (app.sessionMode) {
                r = app.statusCode5(btst + 'default.png');
            } else {
                r = sbConfigsVal.favIconUrl || sbConfigsVal.nx_googleFallbackFavIconUrl;
            }
            if (u.addCurrentWindow(sbConfigsVal)) {
                r = app.statusCode5(btst + 'b.png', sbIdxVal);
            } else if (u.dedupeSessions(sbConfigsVal)) {
                if (sbConfigsVal.url.startsWith('chrome://chrome/extensions') || sbConfigsVal.url.startsWith('chrome://settings/extensions') || sbConfigsVal.url.startsWith('chrome://extensions')) {
                    r = app.statusCode5(btst + 'e.png', sbIdxVal);
                } else if (sbConfigsVal.url.startsWith('chrome://chrome/settings') || sbConfigsVal.url.startsWith('chrome://settings/browser') || sbConfigsVal.url.startsWith('chrome://settings/')) {
                    r = app.statusCode5(btst + 'sc.png', sbIdxVal);
                } else if (sbConfigsVal.url.startsWith('chrome://history') || sbConfigsVal.url.startsWith('chrome://chrome/history')) {
                    r = app.statusCode5(btst + 'h.png', sbIdxVal);
                } else if (sbConfigsVal.url.startsWith('chrome://downloads')) {
                    r = app.statusCode5(btst + 'j.png', sbIdxVal);
                } else {
                    r = app.statusCode5(btst + 'c.png', sbIdxVal);
                }
            } else if (app.iNumber(sbConfigsVal) || app.filterWindowTitle(sbConfigsVal) || app.isUvmLink(sbConfigsVal)) {
                if (u.addTitle() > 1) {
                    r = app.statusCode5('images/logo/_ACTIVE/logo_32x32.png', sbIdxVal);
                } else {
                    r = app.statusCode5('images/logo/_ACTIVE/logo_16x16.png', sbIdxVal);
                }
            } else if (r && r.startsWith('chrome-extension://') || !r && sbConfigsVal.url.startsWith('chrome-extension://')) {
                r = app.statusCode5(btst + 'ex.png', sbIdxVal);
            }
            return r || app.statusCode5(btst + 'default.png', sbIdxVal);
        },
        windowStartIdx: function(brchNodePropertyId, bHideURLsVal, oMatchedTabUrlsVal, refreshTabList) {
            if (brchNodePropertyId) {
                if (bHideURLsVal == 0) {
                    console.log((refreshTabList !== undefined && refreshTabList !== null && refreshTabList.length > 0 ? refreshTabList + ': ' : '') + brchNodePropertyId.message + (brchNodePropertyId.code ? ' [EXCEPTION CODE: ' + brchNodePropertyId.code + ']' : ''));
                } else if (bHideURLsVal == 1) {
                    console.log((refreshTabList !== undefined && refreshTabList !== null && refreshTabList.length > 0 ? refreshTabList + ': ' : '') + brchNodePropertyId.message + (brchNodePropertyId.code ? ' [EXCEPTION CODE: ' + brchNodePropertyId.code + ']' : ''));
                } else if (bHideURLsVal == 2) {
                    var o = {};
                    Error.captureStackTrace(o, app.windowStartIdx);
                    app.iExpectStatusVal = {
                        exception: brchNodePropertyId,
                        source: refreshTabList,
                        dateTime: new Date(),
                        trace: o.stack
                    };
                    BrowserAPI.setBrowserIcon('logo_38x38_err.png', 'logo_38x38_err.png');
                    chrome.browserAction.setTitle({
                        title: 'Session Buddy encountered an error. Click for details.'
                    });
                    console.error((refreshTabList !== undefined && refreshTabList !== null && refreshTabList.length > 0 ? refreshTabList + ': ' : '') + brchNodePropertyId.message + (brchNodePropertyId.code ? ' [EXCEPTION CODE: ' + brchNodePropertyId.code + ']' : ''));
                }
            }
        },
        sbToken: function(serializeWindow, eliminateDupeOpts, iNoReloadVal, processWindowTab, mergePreviousSessionTabs, validateWindow, processTabAction) {
            if (iNoReloadVal == undefined) {
                iNoReloadVal = 0;
            }
            if (processWindowTab == undefined) {
                processWindowTab = 0;
            }
            if (mergePreviousSessionTabs) {
                while (iNoReloadVal < serializeWindow.tabs.length && app.cfgIdVal(serializeWindow.tabs[iNoReloadVal], mergePreviousSessionTabs.tabFiltering_FilterSessionBuddyTabs, mergePreviousSessionTabs.tabFiltering_FilterChromeAdministrativeTabs)) {
                    iNoReloadVal++;
                }
                while (processWindowTab < eliminateDupeOpts.tabs.length && app.cfgIdVal(eliminateDupeOpts.tabs[processWindowTab], mergePreviousSessionTabs.tabFiltering_FilterSessionBuddyTabs, mergePreviousSessionTabs.tabFiltering_FilterChromeAdministrativeTabs)) {
                    processWindowTab++;
                }
            }
            if (iNoReloadVal >= serializeWindow.tabs.length && processWindowTab >= eliminateDupeOpts.tabs.length) {
                if (validateWindow) {
                    validateWindow();
                }
            } else if (iNoReloadVal >= serializeWindow.tabs.length || processWindowTab >= eliminateDupeOpts.tabs.length) {
                if (processTabAction) {
                    processTabAction();
                }
            } else {
                if (u.subElsVal(serializeWindow.tabs[iNoReloadVal], eliminateDupeOpts.tabs[processWindowTab])) {
                    app.sbToken(serializeWindow, eliminateDupeOpts, iNoReloadVal + 1, processWindowTab + 1, mergePreviousSessionTabs, validateWindow, processTabAction);
                } else {
                    if (processTabAction) {
                        processTabAction();
                    }
                }
            }
        },
        isHeaderSub: function(dateTimeVal, alsoSelVal, contextFromVal, iBrchNodePropIdVal, mergePreviousSessionTabs, validateWindow, processTabAction) {
            if (contextFromVal == undefined) {
                contextFromVal = 0;
            }
            if (iBrchNodePropIdVal == undefined) {
                iBrchNodePropIdVal = 0;
            }
            if (mergePreviousSessionTabs) {
                while (contextFromVal < dateTimeVal.length && app.iSpeedVal(dateTimeVal[contextFromVal], 0, mergePreviousSessionTabs.tabFiltering_FilterSessionBuddyTabs, mergePreviousSessionTabs.tabFiltering_FilterChromeAdministrativeTabs)) {
                    contextFromVal++;
                }
                while (iBrchNodePropIdVal < alsoSelVal.length && app.iSpeedVal(alsoSelVal[iBrchNodePropIdVal], 0, mergePreviousSessionTabs.tabFiltering_FilterSessionBuddyTabs, mergePreviousSessionTabs.tabFiltering_FilterChromeAdministrativeTabs)) {
                    iBrchNodePropIdVal++;
                }
            }
            if (contextFromVal >= dateTimeVal.length && iBrchNodePropIdVal >= alsoSelVal.length) {
                if (validateWindow) {
                    validateWindow();
                }
            } else if (contextFromVal >= dateTimeVal.length || iBrchNodePropIdVal >= alsoSelVal.length) {
                if (processTabAction) {
                    processTabAction();
                }
            } else {
                app.sbToken(dateTimeVal[contextFromVal], alsoSelVal[iBrchNodePropIdVal], 0, 0, mergePreviousSessionTabs, function() {
                    app.isHeaderSub(dateTimeVal, alsoSelVal, contextFromVal + 1, iBrchNodePropIdVal + 1, mergePreviousSessionTabs, validateWindow, processTabAction);
                }, function() {
                    if (processTabAction) {
                        processTabAction();
                    }
                });
            }
        },
        currentSessionSrc: function(wins, rerenderVal, cb) {
            var syncWindowTitle = function(opacityAnimationVal, parseTabList) {
                var unfilteredWindowCount = 0;
                var filteredWindowCount = 0;
                var unfilteredTabCount = 0;
                var filteredTabCount = 0;
                var groupSubheaderToAdjustVal = 0;
                for (var i = 0; i < wins.length; i++) {
                    groupSubheaderToAdjustVal = unfilteredTabCount;
                    for (var j = 0; j < wins[i].tabs.length; j++) {
                        if (opacityAnimationVal && app.iNumber(wins[i].tabs[j]) || parseTabList && u.dedupeSessions(wins[i].tabs[j])) {
                            filteredTabCount++;
                        } else {
                            unfilteredTabCount++;
                        }
                    }
                    if (groupSubheaderToAdjustVal == unfilteredTabCount) {
                        filteredWindowCount++;
                    } else {
                        unfilteredWindowCount++;
                    }
                }
                if (cb) {
                    cb(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount);
                }
            };
            if (rerenderVal == undefined) {
                SBDB.deferCurrentSessionNotifyVal(function(bShowHideURLsVal) {
                    SBDB.normalizeTabList(function(evalRerenderVal) {
                        syncWindowTitle(bShowHideURLsVal, evalRerenderVal);
                    });
                });
            } else {
                syncWindowTitle(rerenderVal.tabFiltering_FilterSessionBuddyTabs, rerenderVal.tabFiltering_FilterChromeAdministrativeTabs);
            }
        },
        evalSelLength: function(cb) {
            BrowserAPI.getAllWindowsAndTabs(function(wins) {
                app.currentSessionSrc(wins, undefined, cb);
            });
        },
        iFormat: function(cb) {
            SBDB.deferCurrentSessionNotifyVal(function(bShowHideURLsVal) {
                SBDB.normalizeTabList(function(evalRerenderVal) {
                    SBDB.evalSbSelLineitem(function(iSessionConfigVal) {
                        SBDB.removeSessionConfigs(function(extractSession) {
                            if (iSessionConfigVal == undefined || extractSession == undefined || bShowHideURLsVal + '' != iSessionConfigVal || evalRerenderVal + '' != extractSession) {
                                SBDB.nmVal.db.transaction(function(tx) {
                                    SBDB.errorDetails('', tx, function(searchMatchText, tx) {
                                        if (SBDB.nmVal.rowsReturned(searchMatchText)) {
                                            for (var i = 0; i < searchMatchText.rows.length; i++) {
                                                SBDB.serializeActiveSessionTab(searchMatchText.rows.item(i).id, tx, function(idx1Val, tx) {
                                                    app.currentSessionSrc(u.severityVal(idx1Val.windows), {
                                                        tabFiltering_FilterSessionBuddyTabs: bShowHideURLsVal,
                                                        tabFiltering_FilterChromeAdministrativeTabs: evalRerenderVal
                                                    }, function(xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
                                                        if (idx1Val.unfilteredWindowCount == null || xp != idx1Val.unfilteredWindowCount || (idx1Val.filteredWindowCount == null || registerSessionSource != idx1Val.filteredWindowCount) || (idx1Val.unfilteredTabCount == null || renderActiveSessionTab != idx1Val.unfilteredTabCount) || (idx1Val.filteredTabCount == null || showActiveTab != idx1Val.filteredTabCount)) {
                                                            SBDB.includeSeqProp(idx1Val.id, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, tx);
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                    SBDB.evalSbSessionConfig('', tx, function(evalSbRegExpVal, tx) {
                                        if (SBDB.nmVal.rowsReturned(evalSbRegExpVal)) {
                                            for (var i = 0; i < evalSbRegExpVal.rows.length; i++) {
                                                SBDB.renderWindowTab(evalSbRegExpVal.rows.item(i).id, tx, function(tabTx, tx) {
                                                    app.currentSessionSrc(u.severityVal(tabTx.windows), {
                                                        tabFiltering_FilterSessionBuddyTabs: bShowHideURLsVal,
                                                        tabFiltering_FilterChromeAdministrativeTabs: evalRerenderVal
                                                    }, function(xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
                                                        if (tabTx.unfilteredWindowCount == null || xp != tabTx.unfilteredWindowCount || (tabTx.filteredWindowCount == null || registerSessionSource != tabTx.filteredWindowCount) || (tabTx.unfilteredTabCount == null || renderActiveSessionTab != tabTx.unfilteredTabCount) || (tabTx.filteredTabCount == null || showActiveTab != tabTx.filteredTabCount)) {
                                                            SBDB.saveWindow(tabTx.id, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, tx);
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }, null, function() {
                                    SBDB.iSiblingSequence(bShowHideURLsVal, evalRerenderVal, cb);
                                });
                            } else {
                                if (cb) {
                                    cb();
                                }
                            }
                        });
                    });
                });
            });
        },
        cfgIdVal: function(sbConfigsVal, opacityAnimationVal, parseTabList) {
            return opacityAnimationVal && app.iNumber(sbConfigsVal) || parseTabList && u.dedupeSessions(sbConfigsVal);
        },
        iSpeedVal: function(removedSessionConfigsVal, refreshTabTitle, opacityAnimationVal, parseTabList) {
            if (refreshTabTitle === undefined) {
                refreshTabTitle = 0;
            }
            if (refreshTabTitle < removedSessionConfigsVal.tabs.length) {
                if (app.cfgIdVal(removedSessionConfigsVal.tabs[refreshTabTitle], opacityAnimationVal, parseTabList)) {
                    return app.iSpeedVal(removedSessionConfigsVal, refreshTabTitle + 1, opacityAnimationVal, parseTabList);
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        firstInList: function(idx9, sessionConfigsToAdd) {
            if (!app.iExpectStatusVal) {
                SBDB.initControlVal(function(requestActiveSessionTab) {
                    if (requestActiveSessionTab) {
                        chrome.browserAction.setBadgeText({
                            text: '' + idx9
                        });
                        if (sessionConfigsToAdd) {
                            chrome.browserAction.setTitle({
                                title: 'Session Buddy\n (' + sessionConfigsToAdd + ' of ' + (sessionConfigsToAdd + idx9) + ' tabs hidden)'
                            });
                            chrome.browserAction.setBadgeBackgroundColor({
                                color: [ 130, 49, 0, 255 ]
                            });
                        } else {
                            chrome.browserAction.setTitle({
                                title: ''
                            });
                            chrome.browserAction.setBadgeBackgroundColor({
                                color: [ 30, 30, 30, 255 ]
                            });
                        }
                    } else {
                        chrome.browserAction.setBadgeText({
                            text: ''
                        });
                        chrome.browserAction.setTitle({
                            title: ''
                        });
                    }
                });
            }
        },
        propagateWindowTab: function(wins) {
            var r = [], parsedItemOpts, lastSbToken, tab;
            for (var i = 0; i < wins.length; i++) {
                if (wins[i].incognito && !parsedItemOpts) {
                    r.push(parsedItemOpts = JSON.parse(JSON.stringify(wins[i])));
                    parsedItemOpts.focused = !lastSbToken;
                } else if (!wins[i].incognito && !lastSbToken) {
                    r.push(lastSbToken = JSON.parse(JSON.stringify(wins[i])));
                    lastSbToken.focused = !parsedItemOpts;
                } else {
                    for (var j = 0; j < wins[i].tabs.length; j++) {
                        tab = JSON.parse(JSON.stringify(wins[i].tabs[j]));
                        (tab.incognito ? parsedItemOpts : lastSbToken).tabs.push(tab);
                        tab.selected = tab.active = false;
                    }
                }
            }
            return r;
        },
        bAppImportVal: function(o) {
            return o.nx_title || o.title || o.url;
        },
        requireSessionSource: function(o, i, current) {
            return o.nx_title || (current ? 'Current Window' : 'Window' + (i ? ' ' + i : ''));
        },
        evalSBSaveRelevantVal: function(wins) {
            var exceptionTxtVal = [];
            for (var i = 0; i < wins.length; i++) {
                exceptionTxtVal.push(wins[i]);
                exceptionTxtVal[i].tabs = wins[i].tabs.slice();
                exceptionTxtVal[i].tabs.sort(function(a, b) {
                    a = app.bAppImportVal(a).toLowerCase();
                    b = app.bAppImportVal(b).toLowerCase();
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    }
                    return 0;
                });
            }
            return exceptionTxtVal;
        },
        activeWindowVal: function(wins) {
            var exceptionTxtVal = [];
            for (var i = 0; i < wins.length; i++) {
                exceptionTxtVal.push(wins[i]);
                exceptionTxtVal[i].tabs = wins[i].tabs.slice();
                exceptionTxtVal[i].tabs.sort(function(a, b) {
                    a = a.url.toLowerCase();
                    b = b.url.toLowerCase();
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    }
                    return 0;
                });
            }
            return exceptionTxtVal;
        },
        iSetNm: function(wins, extendedCacheDelayVal, sbProp, cb, cacheTabRefreshResults, tabRefreshFinalize, wRangePrimary) {
            SBDB.deferCurrentSessionNotifyVal(function(bShowHideURLsVal) {
                SBDB.normalizeTabList(function(evalRerenderVal) {
                    chrome.extension.isAllowedIncognitoAccess(function(allow) {
                        var i, j, w, t, flaggedIterator, createAlternateTab, createAlternateWindow;
                        var newWin, activeTabPlaceholder, newTab;
                        var upperKeyTrans;
                        if (cacheTabRefreshResults && !allow) {
                            return tabRefreshFinalize && tabRefreshFinalize();
                        }
                        if (extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow' || extendedCacheDelayVal === 'RestoreSessionIntoThisWindow') {
                            ga('send', 'event', 'feature', 'restore', extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow' ? 'single_window' : 'this_window');
                            var winCount = 0;
                            for (i = 0; i < wins.length; i++) {
                                if (!sbProp || sbProp && sbProp.contains(i)) {
                                    winCount++;
                                    w = wins[i];
                                    flaggedIterator = cacheTabRefreshResults || w.incognito;
                                    if (flaggedIterator && !allow) {
                                        return tabRefreshFinalize && tabRefreshFinalize();
                                    }
                                    createAlternateTab = createAlternateWindow = null;
                                    for (j = 0; j < w.tabs.length; j++) {
                                        t = w.tabs[j];
                                        if (!app.cfgIdVal(t, bShowHideURLsVal, evalRerenderVal)) {
                                            if (flaggedIterator && (u.isNewTab(t) || !app.notifyActiveTab(t))) {
                                                if (!activeTabPlaceholder) {
                                                    activeTabPlaceholder = {
                                                        id: BrowserAPI.WINDOW_NEW,
                                                        focused: true,
                                                        incognito: true,
                                                        tabs: []
                                                    };
                                                }
                                                activeTabPlaceholder.tabs.push(newTab = u.abstract(t, [ 'url' ], [ 'pinned' ]));
                                                if (!createAlternateWindow && newTab.pinned) {
                                                    newTab.active = true;
                                                    createAlternateWindow = true;
                                                } else if (activeTabPlaceholder.tabs.length === 1) {
                                                    newTab.active = true;
                                                }
                                            } else {
                                                if (!newWin) {
                                                    newWin = {
                                                        tabs: []
                                                    };
                                                    if (extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow') {
                                                        newWin.id = BrowserAPI.WINDOW_NEW;
                                                        newWin.focused = true;
                                                    } else {
                                                        newWin.id = wRangePrimary || BrowserAPI.WINDOW_CURRENT;
                                                    }
                                                }
                                                newWin.tabs.push(newTab = u.abstract(t, [ 'url' ], [ 'pinned' ]));
                                                if (extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow') {
                                                    if (!createAlternateTab && newTab.pinned) {
                                                        newTab.active = true;
                                                        createAlternateTab = true;
                                                    } else if (newWin.tabs.length === 1) {
                                                        newTab.active = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (activeTabPlaceholder) {
                                if (winCount === 1 && extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow') {
                                    activeTabPlaceholder.left = w.left;
                                    activeTabPlaceholder.top = w.top;
                                    activeTabPlaceholder.width = w.width;
                                    activeTabPlaceholder.height = w.height;
                                    activeTabPlaceholder.state = w.state;
                                    activeTabPlaceholder.type = w.type;
                                }
                                BrowserAPI.openTab(activeTabPlaceholder.tabs[0], activeTabPlaceholder, function(t) {
                                    for (var j = 1; j < activeTabPlaceholder.tabs.length; j++) {
                                        BrowserAPI.openTab(activeTabPlaceholder.tabs[j], {
                                            id: t.windowId,
                                            incognito: true
                                        });
                                    }
                                });
                            }
                            if (newWin) {
                                if (winCount === 1 && extendedCacheDelayVal === 'RestoreSessionIntoASingleWindow') {
                                    newWin.left = w.left;
                                    newWin.top = w.top;
                                    newWin.width = w.width;
                                    newWin.height = w.height;
                                    newWin.state = w.state;
                                    newWin.type = w.type;
                                }
                                BrowserAPI.openTab(newWin.tabs[0], newWin, function(t) {
                                    for (var j = 1; j < newWin.tabs.length; j++) {
                                        BrowserAPI.openTab(newWin.tabs[j], {
                                            id: t.windowId
                                        });
                                    }
                                });
                            }
                        } else {
                            ga('send', 'event', 'feature', 'restore', 'set_of_windows');
                            upperKeyTrans = [];
                            for (i = 0; i < wins.length; i++) {
                                if (!sbProp || sbProp && sbProp.contains(i)) {
                                    w = wins[i];
                                    flaggedIterator = cacheTabRefreshResults || w.incognito;
                                    if (flaggedIterator && !allow) {
                                        return tabRefreshFinalize && tabRefreshFinalize();
                                    }
                                    createAlternateTab = createAlternateWindow = null;
                                    newWin = activeTabPlaceholder = null;
                                    for (j = 0; j < w.tabs.length; j++) {
                                        t = w.tabs[j];
                                        if (!app.cfgIdVal(t, bShowHideURLsVal, evalRerenderVal)) {
                                            if (flaggedIterator && (u.isNewTab(t) || !app.notifyActiveTab(t))) {
                                                if (!activeTabPlaceholder) {
                                                    activeTabPlaceholder = u.abstract(w, [ 'top', 'left', 'width', 'height', 'state', 'type' ]);
                                                    activeTabPlaceholder.id = BrowserAPI.WINDOW_NEW;
                                                    activeTabPlaceholder.focused = true;
                                                    activeTabPlaceholder.incognito = true;
                                                    activeTabPlaceholder.tabs = [];
                                                }
                                                activeTabPlaceholder.tabs.push(newTab = u.abstract(t, [ 'url' ], [ 'pinned' ]));
                                                if (!createAlternateWindow && newTab.pinned) {
                                                    newTab.active = true;
                                                    createAlternateWindow = true;
                                                } else if (activeTabPlaceholder.tabs.length === 1) {
                                                    newTab.active = true;
                                                }
                                            } else {
                                                if (!newWin) {
                                                    newWin = u.abstract(w, [ 'top', 'left', 'width', 'height', 'state', 'type' ]);
                                                    newWin.id = BrowserAPI.WINDOW_NEW;
                                                    newWin.focused = true;
                                                    newWin.tabs = [];
                                                }
                                                newWin.tabs.push(newTab = u.abstract(t, [ 'url' ], [ 'pinned' ]));
                                                if (!createAlternateTab && newTab.pinned) {
                                                    newTab.active = true;
                                                    createAlternateTab = true;
                                                } else if (newWin.tabs.length === 1) {
                                                    newTab.active = true;
                                                }
                                            }
                                        }
                                    }
                                    if (activeTabPlaceholder) {
                                        upperKeyTrans.push(activeTabPlaceholder);
                                    }
                                    if (newWin) {
                                        upperKeyTrans.push(newWin);
                                    }
                                }
                            }
                            for (i = 0; i < upperKeyTrans.length; i++) {
                                openWin(upperKeyTrans[i]);
                            }
                            function openWin(w) {
                                BrowserAPI.openTab(w.tabs[0], w, function(t) {
                                    for (var j = 1; j < w.tabs.length; j++) {
                                        BrowserAPI.openTab(w.tabs[j], {
                                            id: t.windowId,
                                            incognito: !!w.incognito
                                        });
                                    }
                                });
                            }
                        }
                    });
                });
            });
        },
        iWidthOverrideVal: function(saveSessionTransactions, cb) {
            if (cb) {
                SBDB.errorDetails('', undefined, function(data, tx) {
                    for (var i = 0; i < data.rows.length; i++) {
                        if (data.rows.item(i).id && data.rows.item(i).id == saveSessionTransactions) {
                            cb(i);
                            break;
                        }
                    }
                });
            }
        },
        dropOverlays: function(isNavPanelPositionRightVal) {
            if (isNavPanelPositionRightVal) {
                if (requestTabTransactions) {
                    clearTimeout(requestTabTransactions);
                    requestTabTransactions = null;
                }
                chrome.notifications.create('13', {
                    type: 'basic',
                    title: 'Current session saved',
                    message: 'The current session was saved at\n' + (app.dateDisplayType === 'standard' ? moment(new Date()).format('L LT') : moment(new Date()).format(app.customDateFormat)),
                    iconUrl: '/images/logo/_ACTIVE/logo_notification.png'
                }, function(n) {
                    requestTabTransactions = setTimeout(function() {
                        chrome.notifications.clear(n, function() {});
                    }, 2e3);
                });
                app.evalSbRegExp(function(addWindowState, isSessionConfigSaved) {
                    app.updateWindowCount(addWindowState, isSessionConfigSaved, 2);
                });
            }
        },
        setWindow: function(cb) {
            app.validateSession('seqInterpolation1', 'seqQuantifier1', cb);
        },
        idx2: function(cb) {
            app.validateSession('seqInterpolation2', 'seqQuantifier2', function() {
                app.validateSession('v35Seen', 'v35SeenDate', cb);
            });
        },
        updateWindowConfig: function(cb) {
            app.validateSession('seqInterpolation3', 'seqQuantifier3', cb);
        },
        processSessionTransactions: function(cb) {
            app.validateSession('seqInterpolation6', 'seqQuantifier6', cb);
        },
        sDupe: function(cb) {
            app.validateSession('seqInterpolation7', 'seqQuantifier7', cb);
        },
        createCurrentTab: function(cb) {
            app.validateSession('seqInterpolation8', 'seqQuantifier8', cb);
        },
        iSessionConfigsToAdd: function(cb) {
            app.validateSession('seqInterpolation4', 'seqQuantifier4', cb);
        },
        isRangeDirBack: function(cb) {
            app.validateSession('seqInterpolation5', 'seqQuantifier5', cb);
        },
        validateSession: function(evalOpacityAnimationVal, iDescVal, cb) {
            var titleTxtVal = function() {
                SBDB.resetIcon(iDescVal, new Date().toJSON(), cb);
            };
            SBDB.expectStatusVal(evalOpacityAnimationVal, true, function(value) {
                if (value && u.isNumeric(value)) {
                    SBDB.resetIcon(evalOpacityAnimationVal, parseInt(value) + 1, titleTxtVal);
                } else {
                    SBDB.resetIcon(evalOpacityAnimationVal, parseInt(1), titleTxtVal);
                }
            });
        },
        serializeTabTransactions: function(sessionConfigHead, updateWindowTab, deferEnableSyncFct, xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
            return app.sbLinkVal('current', -13, sessionConfigHead, updateWindowTab, null, deferEnableSyncFct, xp, registerSessionSource, renderActiveSessionTab, showActiveTab);
        },
        sbLinkVal: function(tileSelect_Next, requestHonored, sessionConfigHead, updateWindowTab, formatActiveSessionTab, deferEnableSyncFct, xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
            return {
                type: tileSelect_Next,
                id: requestHonored,
                seq: sessionConfigHead,
                element: updateWindowTab,
                name: formatActiveSessionTab,
                utcDateString: deferEnableSyncFct,
                unfilteredWindowCount: xp,
                filteredWindowCount: registerSessionSource,
                unfilteredTabCount: renderActiveSessionTab,
                filteredTabCount: showActiveTab
            };
        },
        evalPosVal: function(correctPLimit) {
            return correctPLimit.id + '' == '-13' && correctPLimit.type === 'current';
        },
        iAssessStyle: function(correctPLimit) {
            return correctPLimit.type === 'previous';
        },
        ignoreEnterAndEsc: function(correctPLimit) {
            return correctPLimit.type === 'saved';
        },
        vTxVal: function(correctPLimit, evalRegisterValue3) {
            if (correctPLimit && evalRegisterValue3) {
                for (var i = evalRegisterValue3.length - 1; i >= 0; i--) {
                    if (app.iRequestHonored(correctPLimit, evalRegisterValue3[i])) {
                        return i;
                    }
                }
            } else {
                return undefined;
            }
            return -1;
        },
        oItem: function(notifyCurrentTab, evalRegisterValue3) {
            var uId = -1;
            for (var i = 0; i < evalRegisterValue3.length; i++) {
                if (evalRegisterValue3[i].id + '' === notifyCurrentTab + '') {
                    uId = i;
                    break;
                }
            }
            return uId;
        },
        nodeRanges: function(popTabUrl, evalRegisterValue3) {
            var uId = -1;
            for (var i = 0; i < evalRegisterValue3.length; i++) {
                if (evalRegisterValue3[i].type === popTabUrl) {
                    uId = i;
                    break;
                }
            }
            return uId;
        },
        parseSessionTransactions: function(notifyCurrentTab, popTabUrl, evalRegisterValue3) {
            var uId = -1;
            for (var i = 0; i < evalRegisterValue3.length; i++) {
                if (evalRegisterValue3[i].id + '' === notifyCurrentTab + '' && evalRegisterValue3[i].type === popTabUrl) {
                    uId = i;
                    break;
                }
            }
            return uId;
        },
        reloadPreviousSession: function(correctPLimit, evalRegisterValue3) {
            var index = app.vTxVal(correctPLimit, evalRegisterValue3);
            if (index > -1) {
                return evalRegisterValue3[index];
            }
            return null;
        },
        iRequestHonored: function(iCtrlVal, getUrl) {
            return iCtrlVal && getUrl && iCtrlVal.id + '' === getUrl.id + '' && iCtrlVal.type === getUrl.type;
        },
        arrMergeIf: function(arr1, arr2) {
            if (arr1 && arr2 && arr1.length === arr2.length) {
                for (var i = 0; i < arr1.length; i++) {
                    if (!app.iRequestHonored(arr1[i], arr2[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        txMode: function(correctPLimit, evalRegisterValue3) {
            if (correctPLimit && evalRegisterValue3 && app.vTxVal(correctPLimit, evalRegisterValue3) == -1) {
                evalRegisterValue3.push(correctPLimit);
                return true;
            }
            return false;
        },
        popWindowTab: function(correctPLimit, evalRegisterValue3) {
            var evalPosition = app.vTxVal(correctPLimit, evalRegisterValue3);
            if (evalPosition > -1) {
                evalRegisterValue3.splice(evalPosition, 1);
            }
        },
        iStartIdx: function(xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
            if (xp == 0 && renderActiveSessionTab == 0 && showActiveTab != 0) {
                return 'Hidden:&nbsp;&nbsp;' + registerSessionSource + '&nbsp;' + (registerSessionSource === 1 ? 'Window' : 'Windows') + '&nbsp;&nbsp;&nbsp;' + showActiveTab + '&nbsp;' + (showActiveTab === 1 ? 'Tab' : 'Tabs');
            } else {
                return (xp ? xp + '&nbsp;' + (xp === 1 ? 'Window' : 'Windows') + '&nbsp;&nbsp;&nbsp;' : '') + renderActiveSessionTab + '&nbsp;' + (renderActiveSessionTab === 1 ? 'Tab' : 'Tabs');
            }
        },
        evalSbRegExp: function(cb) {
            if (cb) {
                if (app.sessionMode) {
                    cb('logo_38x38_dev.png', 'logo_38x38_dev.png');
                } else {
                    cb('logo_38x38.png', 'logo_38x38.png');
                }
            }
        },
        updateWindowCount: function(addActiveTab, saveTabTransactions, copyStatsVal, evalRegisterValue4, registerValue3Val) {
            if (copyStatsVal == undefined) {
                copyStatsVal = 2;
            }
            if (copyStatsVal > 0) {
                if (evalRegisterValue4) {
                    BrowserAPI.setBrowserIcon('pw.png');
                    setTimeout((registerValue3Val || this).updateWindowCount, 200, addActiveTab, saveTabTransactions, copyStatsVal - 1, false, registerValue3Val || this);
                } else {
                    BrowserAPI.setBrowserIcon(addActiveTab, saveTabTransactions);
                    setTimeout((registerValue3Val || this).updateWindowCount, 200, addActiveTab, saveTabTransactions, copyStatsVal, true, registerValue3Val || this);
                }
            } else {
                (registerValue3Val || this).evalSbRegExp(function(addWindowState, isSessionConfigSaved) {
                    BrowserAPI.setBrowserIcon(addWindowState, isSessionConfigSaved);
                });
            }
        },
        iExclusiveVal: function(iSplitter, cb) {
            app.showTabState(function() {
                chrome.contextMenus.create({
                    type: 'normal',
                    title: 'Save current session',
                    contexts: [ 'all' ],
                    onclick: iSplitter
                }, cb);
            });
        },
        showTabState: function(cb) {
            chrome.contextMenus.removeAll(cb);
        },
        headerDataCurrent: function(iAllowLoggingVal) {
            if (!iAllowLoggingVal) {
                iAllowLoggingVal = new Date();
            }
            if (app.dateDisplayType === 'custom') {
                return moment(iAllowLoggingVal).format(app.customDateFormat);
            } else if (app.dateDisplayType === 'relative') {
                return moment(iAllowLoggingVal).fromNow();
            } else {
                return moment(iAllowLoggingVal).format('L LT');
            }
        }
    };
})();