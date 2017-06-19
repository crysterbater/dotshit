/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

console.log('LOAD ' + new Date().toLocaleTimeString());

console.log('-----------------------------');

var installationID, doNotSync, evalSbLocaleDescVal, iTokenComponent, SBDB, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, updateTabUrl = false, iTagNm = false;

function requestCurrentWindow(trackWinIdx) {
    SBDB.iApplicationEx(undefined, function(windowIdx) {
        if (windowIdx) {
            if (windowIdx.action === 'createTabList') {
                popTabTitle({
                    id: 'showActiveSessionTab'
                });
                SBDB.appMsgVal(u.severityVal(windowIdx.register1), false, function(cacheIcon) {
                    SBDB.idx7Val(undefined, u.severityVal(windowIdx.register1), function(setMatchText) {
                        var keepActionOpenVal = optProp(setMatchText.rows);
                        SBDB.addCurrentSessionSource(undefined, u.severityVal(windowIdx.register1), function(initSessionConfig) {
                            keepActionOpenVal = keepActionOpenVal.concat(createCurrentWindow(initSessionConfig.rows));
                            popTabTitle({
                                id: 'propagateImportedSession',
                                data: {
                                    iRegisterValue3: keepActionOpenVal,
                                    sbTokenAddedCbVal: false,
                                    iTabId: u.severityVal(windowIdx.register2),
                                    iStartCountingAt: u.severityVal(windowIdx.register3)
                                },
                                iBackwards: trackWinIdx
                            });
                            popTabTitle({
                                id: 'propagateImportedSession',
                                data: {
                                    iRegisterValue3: keepActionOpenVal
                                },
                                fctRefVal: trackWinIdx
                            });
                        });
                    });
                });
            } else if (windowIdx.action === 'evalRegisterValue2Val') {
                popTabTitle({
                    id: 'showActiveSessionTab'
                });
                SBDB.appMsgVal([ u.severityVal(windowIdx.register2) ], true, function(cacheIcon) {
                    SBDB.appMsgVal(u.severityVal(windowIdx.register1), false, function(cacheIcon) {
                        SBDB.idx7Val(undefined, u.severityVal(windowIdx.register1), function(setMatchText) {
                            var keepActionOpenVal = optProp(setMatchText.rows);
                            SBDB.addCurrentSessionSource(undefined, u.severityVal(windowIdx.register1), function(initSessionConfig) {
                                keepActionOpenVal = keepActionOpenVal.concat(createCurrentWindow(initSessionConfig.rows));
                                popTabTitle({
                                    id: 'iChildCountVal',
                                    data: {
                                        evalSbTokenDeletedCb: [ u.severityVal(windowIdx.register2) ],
                                        iOnlyCountDupes: keepActionOpenVal,
                                        sbTokenAddedCbVal: true,
                                        iTabId: u.severityVal(windowIdx.register2),
                                        iStartCountingAt: u.severityVal(windowIdx.register3),
                                        sActionPendingVal: true
                                    },
                                    iBackwards: trackWinIdx
                                });
                                popTabTitle({
                                    id: 'iChildCountVal',
                                    data: {
                                        evalSbTokenDeletedCb: [ u.severityVal(windowIdx.register2) ],
                                        iOnlyCountDupes: keepActionOpenVal
                                    },
                                    fctRefVal: trackWinIdx
                                });
                            });
                        });
                    });
                });
            } else if (windowIdx.action === 'iSearchTermsVal') {
                popTabTitle({
                    id: 'stopAnimationVal',
                    data: {
                        windows: u.severityVal(windowIdx.register1),
                        extractWindowTitle: u.severityVal(windowIdx.register2)
                    },
                    iBackwards: trackWinIdx
                });
                popTabTitle({
                    id: 'showActiveSessionTab'
                });
            }
        }
    });
}

function evalSessionRoot(trackWinIdx, cb) {
    var bMerge = '';
    var iRangeVal = [];
    if (trackWinIdx) {
        bMerge = 'DELETE FROM Undo WHERE tabIdentifier=?';
        iRangeVal = [ trackWinIdx ];
    } else {
        bMerge = 'DELETE FROM Undo';
        iRangeVal = [];
    }
    SBDB.nmVal.db.transaction(function(tx) {
        tx.executeSql(bMerge, iRangeVal, function(tx, setMatchText) {
            if (cb) {
                cb();
            }
        }, function(tx, winIdxStartAt) {
            app.windowStartIdx(winIdxStartAt, 2, app.sessionMode, '87534360394');
        });
    });
}

function iLinear(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache) {
    evalSessionRoot(undefined, function() {
        timerToCall(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache);
    });
}

function sbNodeRanges(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache) {
    evalSessionRoot(trackWinIdx, function() {
        timerToCall(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache);
    });
}

function timerToCall(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache) {
    SBDB.lastFrameVal(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache);
}

function createCurrentWindow(data6) {
    var r = [], item;
    if (data6) {
        for (var i = 0; i < data6.length; i++) {
            item = data6.item(i);
            r.push(app.sbLinkVal('previous', item.id, undefined, undefined, undefined, item.recordingDateTime, item.unfilteredWindowCount, item.filteredWindowCount, item.unfilteredTabCount, item.filteredTabCount));
        }
    }
    return r;
}

function optProp(data6) {
    var r = [], item;
    if (data6) {
        for (var i = 0; i < data6.length; i++) {
            item = data6.item(i);
            r.push(app.sbLinkVal('saved', item.id, undefined, undefined, item.name, item.modificationDateTime, item.unfilteredWindowCount, item.filteredWindowCount, item.unfilteredTabCount, item.filteredTabCount));
        }
    }
    return r;
}

function setUpSBDB(iWindowCount, cacheImportedSession) {
    var arr = [];
    arr.push('CREATE TABLE IF NOT EXISTS Settings (key TEXT PRIMARY KEY, value NUMERIC)');
    arr.push(sSet('dbSetupStatus', 10, true));
    arr.push(sSet('dbSetupStatusTimeStamp', new Date().toJSON(), true));
    arr.push(sSet('installationID', xid()));
    arr.push(sSet('installationTimeStamp', new Date().toJSON()));
    arr.push(sSet('versionMessageReceived', ''));
    arr.push('CREATE TABLE IF NOT EXISTS UserSettings (key TEXT PRIMARY KEY, value NUMERIC)');
    arr.push(usSet('dateDisplayType', 'relative'));
    arr.push(usSet('sessionSummaryRender_PreviousSessionQueueSize', 3));
    arr.push(usSet('sessionSummaryRender_PanelWidth', '260'));
    arr.push(usSet('sessionSummaryRender_ShowAnnotation', 'true'));
    arr.push(usSet('sessionRender_RenderSessionURL', 'false'));
    arr.push(usSet('sessionRender_ShowAdminTabsInItalic', 'false'));
    arr.push(usSet('sessionRender_ShowSessionCountsInNavigationPane', 'false'));
    arr.push(usSet('sessionMerge_WarnOnMerge', 'true'));
    arr.push(usSet('sessionSave_AskForName', 'true'));
    arr.push(usSet('sessionSave_ConfirmClose', 'true'));
    arr.push(usSet('sessionEdit_HideDuplicateTabsInMerge', 'true'));
    arr.push(usSet('customDateFormat', ''));
    arr.push(usSet('appMode', ''));
    arr.push(usSet('sessionEdit_IgnoreUrlParamsInTabCompare', 'false'));
    arr.push(usSet('sessionSave_ShowSaveCurrentInRightClickMenus', 'true'));
    arr.push(usSet('enableKeyboardShortcuts', 'true'));
    arr.push(usSet('sessionRender_ShowExtensionBadge', 'false'));
    arr.push(usSet('tabFiltering_FilterSessionBuddyTabs', 'true'));
    arr.push(usSet('tabFiltering_FilterChromeAdministrativeTabs', 'false'));
    arr.push(usSet('sessionExport_ShowWindows', 'false'));
    arr.push(usSet('sessionExport_ShowTitles', 'false'));
    arr.push(usSet('sessionExport_ShowURLs', 'true'));
    arr.push(usSet('sessionExport_Format', 'Text'));
    arr.push('CREATE TABLE IF NOT EXISTS Undo (id INTEGER PRIMARY KEY AUTOINCREMENT, creationDateTime NUMERIC, tabIdentifier TEXT, action TEXT, description TEXT, register1 TEXT, register2 TEXT, register3 TEXT, register4 TEXT, register5 TEXT)');
    arr.push('CREATE TABLE IF NOT EXISTS SavedSessions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, generationDateTime NUMERIC, creationDateTime NUMERIC, modificationDateTime NUMERIC, tags TEXT, users TEXT, deleted TEXT, thumbnail TEXT, windows TEXT, unfilteredWindowCount INTEGER, filteredWindowCount INTEGER, unfilteredTabCount INTEGER, filteredTabCount INTEGER)');
    arr.push('CREATE TABLE IF NOT EXISTS PreviousSessions (id INTEGER PRIMARY KEY AUTOINCREMENT, recordingDateTime NUMERIC, creationDateTime NUMERIC, users TEXT, deleted TEXT, thumbnail TEXT, windows TEXT, unfilteredWindowCount INTEGER, filteredWindowCount INTEGER, unfilteredTabCount INTEGER, filteredTabCount INTEGER)');
    arr.push('UPDATE Settings SET value=20 WHERE key=\'dbSetupStatus\'');
    arr.push('UPDATE Settings SET value=\'' + new Date().toJSON() + '\' WHERE key=\'dbSetupStatusTimeStamp\'');
    var headerDataSavedVal = new Date().toJSON();
    arr.push('INSERT INTO SavedSessions (name, generationDateTime, creationDateTime, modificationDateTime, tags, users, deleted, thumbnail, windows, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount) VALUES (\'Session Buddy\', \'' + headerDataSavedVal + '\', \'' + headerDataSavedVal + '\', \'' + headerDataSavedVal + '\', \'This session contains some bookmarks related to Session Buddy that may come in handy.\', null, \'false\', \'' + xid() + '\', \'[{"nx_title":"How to","state":"normal","type":"normal","tabs":[{"favIconUrl":"https://sessionbuddy.com/images/favicon.png","pinned":false,"title":"Back up Session Buddy Data","url":"https://sessionbuddy.com/backup-restore/"},{"favIconUrl":"https://sessionbuddy.com/images/favicon.png","pinned":false,"title":"Import and Export Session Buddy Data","url":"https://sessionbuddy.com/import-export/"},{"favIconUrl":"https://sessionbuddy.com/images/favicon.png","pinned":false,"title":"Customize Date and Time Formats","url":"https://sessionbuddy.com/date-formatting/"}]},{"nx_title":"Support","state":"normal","type":"normal","tabs":[{"favIconUrl":"https://sessionbuddy.com/images/favicon.png","pinned":false,"title":"Troubleshooting","url":"https://sessionbuddy.com/troubleshooting/"},{"favIconUrl":"https://groups.google.com/forum/favicon.ico","pinned":false,"title":"Session Buddy Forum","url":"https://groups.google.com/forum/?fromgroups#!forum/sessionbuddy-discuss"}]},{"nx_title":"Manage","state":"normal","type":"normal","tabs":[{"pinned":false,"title":"Settings","url":"chrome-extension://edacconmaakjimmfgnblocblbcdcpbko/options.html"},{"favIconUrl":"chrome://theme/IDR_EXTENSIONS_FAVICON@2x","pinned":false,"title":"Manage Extension","url":"chrome://extensions/?id=edacconmaakjimmfgnblocblbcdcpbko"},{"favIconUrl":"https://www.google.com/images/icons/product/chrome_web_store-32.png","pinned":false,"title":"Session Buddy in the Chrome Web Store","url":"https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko"}]}]\', 3, 0, 8, 0)');
    iWindowCount.nmVal.suppressSel(arr, cacheImportedSession, function(tx, err) {
        app.windowStartIdx(err, 2, app.sessionMode, '489302834');
        return true;
    });
    function sSet(k, v, overwrite) {
        return kvInsert(k, v, 'Settings', overwrite);
    }
    function usSet(k, v) {
        return kvInsert(k, v, 'UserSettings');
    }
    function kvInsert(k, v, table, overwrite) {
        if (u.isString(v)) {
            v = '\'' + v + '\'';
        }
        return 'INSERT OR ' + (overwrite ? 'REPLACE' : 'IGNORE') + ' INTO ' + table + ' (key, value) VALUES (\'' + k + '\', ' + v + ')';
    }
}

function popSessionConfig() {
    try {
        moment.locale([ window.navigator.language, 'en-US' ]);
        SBDB.iSessionStorageKeyVal(function(s) {
            app.copyTabTitle = s;
            SBDB.setSessionWindow(function(evalSelectedLineitems) {
                app.dateDisplayType = evalSelectedLineitems;
                SBDB.wrx(function(format) {
                    app.customDateFormat = format;
                    bShowURLsVal(function(instId2) {
                        installationID = instId2;
                        SBDB.installationID = instId2;
                        evalSessionRoot(undefined, function() {
                            sortCurrentTab(function(sbTab) {
                                app.iFormat(function() {
                                    evalSDupeVal(function() {
                                        SBDB.sessionConfigsAllVal(function(positionCurrentWindow) {
                                            if (positionCurrentWindow > 0) {
                                                console.log(positionCurrentWindow + (positionCurrentWindow === 1 ? ' session reaped.' : ' sessions reaped.'));
                                            }
                                            app.setWindow(function() {
                                                tblPlace();
                                                updateTabUrl = true;
                                                if (!app.iExpectStatusVal) {
                                                    showTab(function() {
                                                        codeVal(addedConfigsVal);
                                                    });
                                                }
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (ex) {
        app.windowStartIdx(ex, 2, app.sessionMode, '20349802938');
    }
}

function bShowURLsVal(cb) {
    SBDB.expectStatusVal('installationID', true, function(installationID) {
        var normalizeTabAliases = !installationID || installationID.length < 32;
        if (normalizeTabAliases) installationID = xid();
        SBDB.expectStatusVal('guidGen', true, function(iFlashSessionVal) {
            if (!iFlashSessionVal) {
                SBDB.nmVal.db.transaction(function(tx) {
                    tx.executeSql('SELECT id FROM PreviousSessions', null, function(tx, data) {
                        var arr = [];
                        for (var i = 0; i < data.rows.length; i++) {
                            arr.push('UPDATE PreviousSessions SET thumbnail=\'' + xid() + '\' WHERE id=' + data.rows.item(i).id + ' AND (thumbnail IS NULL OR thumbnail=\'\')');
                        }
                        SBDB.nmVal.suppressSel(arr, function(tx, rowsAffected) {
                            console.log('Generated ' + rowsAffected + ' Previous Session guids');
                            tx.executeSql('SELECT id FROM SavedSessions', null, function(tx, data) {
                                var arr = [];
                                for (var i = 0; i < data.rows.length; i++) {
                                    arr.push('UPDATE SavedSessions SET thumbnail=\'' + xid() + '\' WHERE id=' + data.rows.item(i).id + ' AND (thumbnail IS NULL OR thumbnail=\'\')');
                                }
                                SBDB.nmVal.suppressSel(arr, function(tx, rowsAffected) {
                                    console.log('Generated ' + rowsAffected + ' Saved Session guids');
                                    SBDB.resetIcon('guidGen', +new Date());
                                    if (normalizeTabAliases) {
                                        SBDB.resetIcon('installationID', installationID, function() {
                                            finish(installationID);
                                        });
                                    } else {
                                        finish(installationID);
                                    }
                                }, function(tx, winIdxStartAt) {
                                    app.windowStartIdx(winIdxStartAt, 2, app.sessionMode, '28942348');
                                });
                            }, function(tx, winIdxStartAt) {
                                app.windowStartIdx(winIdxStartAt, 2, app.sessionMode, '28942347');
                            });
                        }, function(tx, winIdxStartAt) {
                            app.windowStartIdx(winIdxStartAt, 2, app.sessionMode, '28942350');
                        });
                    }, function(tx, winIdxStartAt) {
                        app.windowStartIdx(winIdxStartAt, 2, app.sessionMode, '28942349');
                    });
                });
            } else {
                if (normalizeTabAliases) {
                    SBDB.resetIcon('installationID', installationID, function() {
                        finish(installationID);
                    });
                } else {
                    finish(installationID);
                }
            }
        });
    });
    function finish(installationID) {
        SBDB.expectStatusVal('userDistributionIndex', true, function(iStateVal) {
            if (!iStateVal) {
                SBDB.resetIcon('userDistributionIndex', Math.floor(Math.random() * 100) + 1);
            }
        });
        if (cb) {
            cb(installationID);
        }
    }
}

function sortCurrentTab(cb) {
    var wins;
    SBDB.iWindowIdVal(function(txtComponentMain) {
        if (txtComponentMain) {
            app.iSession2WindowIdxVal(function(activeWindow) {
                if (activeWindow && activeWindow !== '[]' && (wins = u.severityVal(activeWindow)) && u.isArray(wins) && wins.length && wins[0].hasOwnProperty('tabs') && wins[0].tabs.length) {
                    app.appActionCoordinateVal(function(iExpectStatus) {
                        app.currentSessionSrc(u.severityVal(activeWindow), undefined, function(xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
                            SBDB.selActionTypeVal(u.severityVal(activeWindow), iExpectStatus, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, function(sbTab) {
                                if (sbTab || sbTab === 0) {
                                    console.log('Generated Previous Session ' + sbTab + '; unfiltered windows: ' + xp + ', filtered windows: ' + registerSessionSource + ', unfiltered tabs: ' + renderActiveSessionTab + ', filtered tabs: ' + showActiveTab);
                                }
                                if (cb) {
                                    cb(sbTab);
                                }
                            });
                        });
                    });
                } else {
                    if (cb) {
                        cb(null);
                    }
                }
            });
        } else {
            if (cb) {
                cb(null);
            }
        }
    });
}

function showTab(cb) {
    app.evalSbRegExp(function(addWindowState, isSessionConfigSaved) {
        BrowserAPI.setBrowserIcon(addWindowState, isSessionConfigSaved);
        if (cb) {
            cb();
        }
    });
}

function tblPlace() {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.id === 'evalOutMatchedTabUrls') {
            chrome.tabs.update(sender.tab.id, {
                active: true
            });
        }
    });
    chrome.tabs.onAttached.addListener(deleteCount);
    chrome.tabs.onDetached.addListener(function() {
        deleteCount();
        queueVal();
    });
    chrome.tabs.onMoved.addListener(deleteCount);
    chrome.tabs.onCreated.addListener(function() {
        deleteCount();
        queueVal();
    });
    chrome.tabs.onRemoved.addListener(function() {
        evalSClickOriginDeleteVal();
        queueVal();
    });
    chrome.tabs.onUpdated.addListener(function() {
        deleteCount();
        queueVal();
    });
    chrome.windows.onCreated.addListener(function() {
        if (iTagNm) {
            iTagNm = false;
            sortCurrentTab(deleteCount);
        } else {
            deleteCount();
        }
    });
    chrome.windows.onRemoved.addListener(function() {
        BrowserAPI.getAllWindows(function(wins) {
            if (wins.length === 0) {
                clearTimeout(doNotSync);
                iTagNm = true;
            } else {
                evalSClickOriginDeleteVal();
            }
        });
    });
}

function deleteCount(offsetY4) {
    clearTimeout(doNotSync);
    clearTimeout(evalSbLocaleDescVal);
    SBDB.iWindowIdVal(offsetY4 ? selSelModeVal : primaryNode);
    evalSbLocaleDescVal = setTimeout(sortCurrentSession, 300);
}

function primaryNode(txtComponentMain) {
    if (txtComponentMain) {
        doNotSync = setTimeout(addedConfigsVal, 2e3);
    }
}

function selSelModeVal(txtComponentMain) {
    if (txtComponentMain) {
        doNotSync = setTimeout(addedConfigsVal, 3e4);
    }
}

function evalSClickOriginDeleteVal() {
    deleteCount(true);
}

function addedConfigsVal() {
    clearTimeout(doNotSync);
    BrowserAPI.getAllWindowsAndTabs(iCaret);
}

function iCaret(wins) {
    app.unifyCurrentSession(wins);
}

function sortCurrentSession() {
    BrowserAPI.getAllWindowsAndTabs(reloadSessionRoot);
}

function reloadSessionRoot(wins) {
    chrome.extension.sendMessage({
        id: 'augmentWindowArray',
        data: {
            date: +new Date()
        }
    });
}

function queueVal() {
    clearTimeout(iTokenComponent);
    iTokenComponent = setTimeout(codeVal, 300);
}

function codeVal(cb) {
    clearTimeout(iTokenComponent);
    if (cb) {
        app.evalSelLength(function(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount) {
            bodyNoSel(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount);
            cb();
        });
    } else {
        app.evalSelLength(bodyNoSel);
    }
}

function bodyNoSel(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount) {
    if (unfilteredWindowCount != window.unfilteredWindowCount || filteredWindowCount != window.filteredWindowCount || unfilteredTabCount != window.unfilteredTabCount || filteredTabCount != window.filteredTabCount) {
        app.firstInList(unfilteredTabCount, filteredTabCount);
        chrome.extension.sendMessage({
            id: 'dirty',
            data: {
                unfilteredWindowCount: unfilteredWindowCount,
                filteredWindowCount: filteredWindowCount,
                unfilteredTabCount: unfilteredTabCount,
                filteredTabCount: filteredTabCount,
                date: +new Date()
            }
        });
        window.unfilteredWindowCount = unfilteredWindowCount;
        window.filteredWindowCount = filteredWindowCount;
        window.unfilteredTabCount = unfilteredTabCount;
        window.filteredTabCount = filteredTabCount;
    }
}

function resetTabUrl() {
    if (app.iExpectStatusVal) {
        return chrome.tabs.create({
            url: 'status.html'
        });
    }
    if (!updateTabUrl) {
        return;
    }
    BrowserAPI.getCurrentWindowAndTabs(function(cwin) {
        var i, j;
        if (cwin.incognito) {
            return BrowserAPI.getAllWindowsAndTabs(function(wins) {
                var targetWid, win, tab;
                for (i = 0; i < wins.length; i++) {
                    win = wins[i];
                    if (!win.incognito) {
                        for (j = 0; j < win.tabs.length; j++) {
                            tab = win.tabs[j];
                            if (app.iNumber(tab)) {
                                return BrowserAPI.sortOriginTabs(tab);
                            }
                        }
                        targetWid = targetWid || win.id;
                    }
                }
                BrowserAPI.openTab({
                    url: 'main.html',
                    active: true
                }, {
                    id: targetWid == null ? BrowserAPI.WINDOW_NEW : targetWid,
                    focused: true
                });
            });
        }
        for (j = 0; j < cwin.tabs.length; j++) {
            tab = cwin.tabs[j];
            if (app.iNumber(tab)) {
                return BrowserAPI.activateTab(tab);
            }
        }
        for (j = 0; j < cwin.tabs.length; j++) {
            tab = cwin.tabs[j];
            if (tab.active) {
                if (u.isNewTab(tab)) {
                    return chrome.tabs.update({
                        url: 'main.html'
                    });
                }
                break;
            }
        }
        return chrome.tabs.create({
            url: 'main.html'
        });
    });
}

function evalSbAnimSpeedVal() {
    initCurrentTab();
    app.processSessionTransactions();
}

function initCurrentTab() {
    BrowserAPI.getAllWindowsAndTabs(function(wins) {
        app.currentSessionSrc(wins, undefined, function(xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
            SBDB.evalRespVal(wins, undefined, new Date().toJSON(), xp, registerSessionSource, renderActiveSessionTab, showActiveTab, function(sbTab, creationDateTime) {
                if (sbTab || sbTab === 0) {
                    try {
                        app.dropOverlays(true);
                        chrome.extension.sendMessage({
                            id: 'propagateImportedSession',
                            data: {
                                iRegisterValue3: [ {
                                    id: sbTab,
                                    type: 'saved',
                                    utcDateString: creationDateTime,
                                    name: undefined,
                                    unfilteredWindowCount: xp,
                                    filteredWindowCount: registerSessionSource,
                                    unfilteredTabCount: renderActiveSessionTab,
                                    filteredTabCount: showActiveTab
                                } ]
                            }
                        });
                    } catch (ex) {
                        console.error(ex);
                    }
                }
            });
        });
    });
}

function evalSDupeVal(cb) {
    SBDB.findSession(function(value) {
        if (value) {
            app.iExclusiveVal(evalSbAnimSpeedVal, cb);
        } else {
            app.showTabState(cb);
        }
    });
}

function matchTextVal(iSessionStorageKey) {
    if ((q('b').value = iSessionStorageKey).length) {
        q('b').select();
        document.execCommand('copy');
        return true;
    }
}

function popTabTitle(createWindowSource, cb) {
    if (cb) {
        chrome.extension.sendMessage(createWindowSource, cb);
    } else {
        chrome.extension.sendMessage(createWindowSource);
    }
}

function debug() {
    app.requireCurrentSessionSource('debug');
}

function nodebug() {
    app.requireCurrentSessionSource('');
}

var querySessionAction;

(function() {
    var m = chrome.runtime.getManifest(), iterationSeries = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1e3, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2e3, 3e3, 4e3, 5e3, 6e3, 7e3, 8e3, 9e3, 1e4, 11e3, 12e3, 13e3, 14e3, 15e3, 16e3, 17e3, 18e3, 19e3, 2e4, 3e4, 4e4, 5e4 ];
    if (m && m.content_security_policy) {
        m = m.content_security_policy.match('https?://.*?(?=;)');
        if (m && m.length && m[0].length) {
            (function(i, y, o, g, r, a, z) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments);
                }, i[r].l = 1 * new Date();
                a = y.createElement(o), z = y.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                z.parentNode.insertBefore(a, z);
            })(window, document, 'script', m[0] + '/analytics.js', 'ga');
            ga('create', 'UA-57872757-3', 'auto');
            ga('set', 'checkProtocolTask', function() {});
            querySessionAction = function(name, value) {
                if (value) {
                    var label;
                    for (var i = 0; i < iterationSeries.length; i++) {
                        if (value <= iterationSeries[i]) {
                            label = (i === 0 ? '1' : iterationSeries[i - 1] + 1) + '-' + iterationSeries[i];
                            break;
                        }
                    }
                    if (!label) {
                        label = iterationSeries[iterationSeries.length - 1] + '+';
                    }
                    ga('send', 'event', 'segment', name, label, value, {
                        nonInteraction: 1
                    });
                    return true;
                }
            };
        }
    }
    ga = window.ga || function() {};
    querySessionAction = querySessionAction || function() {};
    chrome.browserAction.onClicked.addListener(resetTabUrl);
    try {
        app.txtGroupNm(SBDB = new popSession(), function() {
            SBDB.isConfigured(function(c) {
                if (c) {
                    SBDB.expectStatusVal('dbSetupStatus', function(v) {
                        if (v == 20 || v == 22 || v == 25) {
                            popSessionConfig();
                        } else {
                            app.windowStartIdx({
                                message: 'Unexpected dbSetupStatus: ' + v,
                                type: 'SB'
                            }, 2, app.sessionMode, '703095823');
                        }
                    });
                } else {
                    setUpSBDB(SBDB, popSessionConfig);
                }
            });
        });
    } catch (ex) {
        app.windowStartIdx(ex, 2, app.sessionMode, '103948101');
    }
})();