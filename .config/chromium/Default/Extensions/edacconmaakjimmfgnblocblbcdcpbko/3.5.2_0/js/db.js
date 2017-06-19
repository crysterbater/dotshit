/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

function extractSessionTransactions(filename, version, name, size) {
    this.db = openDatabase(filename, version, name, size);
    this.suppressSel = function(positionActiveWindow, cacheImportedSession, iLeafLineitemTypeVal) {
        this.db.transaction(function(tx) {
            var evalRemovedSessionConfigs = function(reviseVal) {
                if (positionActiveWindow.length > 0) {
                    tx.executeSql(positionActiveWindow.shift(), [], function(tx, data) {
                        evalRemovedSessionConfigs((data ? data.rowsAffected : 0) + reviseVal);
                    }, iLeafLineitemTypeVal);
                } else {
                    cacheImportedSession(tx, reviseVal);
                }
            };
            evalRemovedSessionConfigs(0);
        });
    };
    this.rowsReturned = function(data) {
        if (data && data.rows && data.rows.length > 0 && data.rows.item(0)) {
            return data.rows.length;
        } else {
            return 0;
        }
    };
    this.evalOnlyCountDupes = function(data) {
        if (data && data.rows && data.rows.length > 0 && data.rows.item(0)) {
            return data.rows.item(0);
        } else {
            return undefined;
        }
    };
}

function popSession() {
    this.isNm = 500;
    this.nmVal = new extractSessionTransactions('SB', '1.0', 'Session Buddy', 5 * 1024 * 1024);
    this.cache = [];
    this.idx2Val = false;
    this.isValid = function() {
        return this.nmVal && this.nmVal.db;
    };
    this.isConfigured = function(cb) {
        if (this.isValid()) {
            var that = this;
            try {
                this.nmVal.db.readTransaction(function(tx) {
                    try {
                        tx.executeSql('SELECT * FROM sqlite_master WHERE type=\'table\' AND (name=\'Settings\' OR name=\'UserSettings\' OR name=\'SavedSessions\' OR name=\'PreviousSessions\')', [], function(tx, data) {
                            cb(that.nmVal.rowsReturned(data) === 4);
                        }, function(tx, err) {
                            app.windowStartIdx({
                                message: 'SQLError: ' + err.message,
                                type: 'SB'
                            }, 2, app.sessionMode, '70395123');
                        });
                    } catch (ex) {
                        app.windowStartIdx(ex, 2, that.idx2Val, '322532283');
                    }
                });
            } catch (ex) {
                app.windowStartIdx(ex, 2, that.idx2Val, '99038458');
            }
        } else {
            app.windowStartIdx({
                message: 'Invalid SBDB',
                type: 'SB'
            }, 2, app.sessionMode, '70395117');
        }
    };
    this.expectStatusVal = function(iClean, sbClr, cb) {
        if (u.isFunction(sbClr)) {
            cb = sbClr;
            sbClr = true;
        }
        this.ignoreEnterAndEscVal('Settings', iClean, sbClr, cb);
    };
    this.resetIcon = function(iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal) {
        this.evalPosIdxVal('Settings', iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal);
    };
    this.idx8Val = function(iClean, sbClr, cb) {
        if (u.isFunction(sbClr)) {
            cb = sbClr;
            sbClr = true;
        }
        this.ignoreEnterAndEscVal('UserSettings', iClean, sbClr, cb);
    };
    this.evalOutRemovedSessionConfigs = function(iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal) {
        this.evalPosIdxVal('UserSettings', iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal);
    };
    this.addTabIcon = function(extractCurrentTab, iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal) {
        if (extractCurrentTab) {
            this.evalPosIdxVal('UserSettings', iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal);
        } else {
            cacheImportedSession(extractCurrentTab);
        }
    };
    this.requestVal = function(iFormatVal, cb) {
        if (this.isValid()) {
            var that = this;
            this.nmVal.db.readTransaction(function(tx) {
                tx.executeSql('SELECT key, value FROM ' + iFormatVal, [], function(tx, data) {
                    if (that.nmVal.rowsReturned(data)) {
                        if (cb) {
                            cb(data.rows);
                        }
                    } else {
                        if (cb) {
                            cb(undefined);
                        }
                    }
                }, function(tx, err) {
                    console.error(err, iFormatVal);
                    if (cb) {
                        cb(undefined);
                    }
                });
            });
        }
    };
    this.ignoreEnterAndEscVal = function(iFormatVal, iClean, sbClr, cb) {
        if (this.isValid() && iClean) {
            var iAlsoSelect = this.isFilterAsyncVal(iFormatVal, iClean);
            if (iAlsoSelect) {
                if (cb) {
                    cb(iAlsoSelect.value);
                }
            } else {
                var that = this;
                this.nmVal.db.readTransaction(function(tx) {
                    tx.executeSql('SELECT value FROM ' + iFormatVal + ' WHERE key=?', [ iClean ], function(tx, data) {
                        if (that.nmVal.rowsReturned(data)) {
                            if (sbClr != true) {
                                that.rangeVal(iFormatVal, iClean, data.rows.item(0).value);
                            }
                            if (cb) {
                                cb(data.rows.item(0).value);
                            }
                        } else {
                            if (cb) {
                                cb(undefined);
                            }
                        }
                    }, function(tx, err) {
                        console.error(err, iFormatVal, iClean, sbClr);
                        if (cb) {
                            cb(undefined);
                        }
                    });
                });
            }
        }
    };
    this.evalPosIdxVal = function(iFormatVal, iClean, isFilterAsync, cacheImportedSession, iLeafLineitemTypeVal) {
        if (this.isValid() && iClean) {
            if (isFilterAsync === true) {
                isFilterAsync = 'true';
            }
            if (isFilterAsync === false) {
                isFilterAsync = 'false';
            }
            var that = this;
            this.nmVal.db.transaction(function(tx) {
                tx.executeSql('SELECT value FROM ' + iFormatVal + ' WHERE key=?', [ iClean ], function(tx, data) {
                    if (that.nmVal.rowsReturned(data)) {
                        if (data.rows.item(0).value != isFilterAsync) {
                            tx.executeSql('UPDATE ' + iFormatVal + ' SET value=? WHERE key=?', [ isFilterAsync, iClean ], function(tx, data) {
                                var iAlsoSelect = that.isFilterAsyncVal(iFormatVal, iClean);
                                if (iAlsoSelect) {
                                    iAlsoSelect.value = isFilterAsync;
                                }
                                if (cacheImportedSession) {
                                    cacheImportedSession(data, isFilterAsync);
                                }
                            }, function(tx, err) {
                                if (iLeafLineitemTypeVal) {
                                    iLeafLineitemTypeVal(err);
                                }
                            });
                        } else {
                            if (cacheImportedSession) {
                                cacheImportedSession(data, isFilterAsync);
                            }
                        }
                    } else {
                        tx.executeSql('INSERT INTO ' + iFormatVal + ' (key, value) VALUES (?,?)', [ iClean, isFilterAsync ], function(tx, data) {
                            var iAlsoSelect = that.isFilterAsyncVal(iFormatVal, iClean);
                            if (iAlsoSelect) {
                                iAlsoSelect.value = isFilterAsync;
                            }
                            if (cacheImportedSession) {
                                cacheImportedSession(data, isFilterAsync);
                            }
                        }, function(tx, err) {
                            if (iLeafLineitemTypeVal) {
                                iLeafLineitemTypeVal(err);
                            }
                        });
                    }
                });
            });
        }
    };
    this.isFilterAsyncVal = function(iFormatVal, extendedCacheDelay) {
        if (this.cache && iFormatVal) {
            var currentSettings = this.lnkClearSearchVal(iFormatVal);
            if (currentSettings) {
                for (var i = 0; i < currentSettings.area.length; i++) {
                    if (currentSettings.area[i].key == extendedCacheDelay) {
                        return currentSettings.area[i];
                    }
                }
            }
        }
        return undefined;
    };
    this.lnkClearSearchVal = function(iFormatVal) {
        if (this.cache && iFormatVal) {
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i].renderImportedSession == iFormatVal) {
                    return this.cache[i];
                }
            }
        }
        return undefined;
    };
    this.rangeVal = function(iFormatVal, extendedCacheDelay, iRestoreTypeVal) {
        if (this.cache && iFormatVal && extendedCacheDelay) {
            var iAlsoSelect = this.isFilterAsyncVal(iFormatVal, extendedCacheDelay);
            if (iAlsoSelect && iAlsoSelect.value != iRestoreTypeVal) {
                iAlsoSelect.value = iRestoreTypeVal;
            } else {
                var currentSettings = this.lnkClearSearchVal(iFormatVal);
                if (!currentSettings) {
                    currentSettings = this.cache[this.cache.push({
                        renderImportedSession: iFormatVal,
                        area: []
                    }) - 1];
                }
                currentSettings.area.push({
                    key: extendedCacheDelay,
                    value: iRestoreTypeVal
                });
            }
        }
    };
    this.idx7Val = function(iNewNmVal, iStringVal, cb, evalRevisionIdx, limit, offset) {
        var i;
        if (!iNewNmVal) {
            iNewNmVal = 'modificationDateTime desc, id desc';
        } else {
            iNewNmVal = iNewNmVal.trim().toLowerCase();
            if (iNewNmVal.startsWith('order by')) {
                iNewNmVal = iNewNmVal.substring(8);
                iNewNmVal = iNewNmVal.trim();
            }
        }
        var augmentSavedSession = '';
        if (evalRevisionIdx) {
            for (i = 0; i < evalRevisionIdx.length; i++) {
                if (evalRevisionIdx[i].type === 'saved') {
                    if (augmentSavedSession.length > 0) {
                        augmentSavedSession += ',';
                    }
                    augmentSavedSession += evalRevisionIdx[i].id;
                }
            }
        }
        var sEnabledVal = '';
        if (iStringVal) {
            var popSessionTransactions = '';
            var lineitemsAddedCb = '';
            if (typeof iStringVal === 'string') {
                iStringVal = iStringVal.replace(/'/g, '\'\'');
                sEnabledVal = '(name like \'%' + iStringVal + '%\' OR windows like \'%' + iStringVal + '%\') ';
            } else if (typeof iStringVal === 'object') {
                lineitemsAddedCb = '';
                for (i = 0; i < iStringVal.length; i++) {
                    if (!iStringVal[i].type || iStringVal[i].type && iStringVal[i].type === 'saved') {
                        popSessionTransactions = '';
                        if (iStringVal[i].id) {
                            if (popSessionTransactions.length > 0) {
                                popSessionTransactions += ' AND ';
                            }
                            popSessionTransactions += 'id=' + iStringVal[i].id;
                        }
                        if (popSessionTransactions.length > 0) {
                            if (lineitemsAddedCb.length > 0) {
                                lineitemsAddedCb += ' OR ';
                            }
                            lineitemsAddedCb += '(' + popSessionTransactions + ')';
                        }
                    }
                }
                if (lineitemsAddedCb.length > 0) {
                    sEnabledVal = '(' + lineitemsAddedCb + ') ';
                }
            }
            if (sEnabledVal.length > 0) {
                if (augmentSavedSession.length > 0) {
                    sEnabledVal = 'AND ((id in (' + augmentSavedSession + ')) OR (' + sEnabledVal + '))';
                } else {
                    sEnabledVal = 'AND ' + sEnabledVal;
                }
            }
        }
        if (iStringVal && sEnabledVal.length == 0) {
            if (cb) {
                cb({
                    rows: []
                });
            }
        } else {
            var that = this;
            this.nmVal.db.readTransaction(function(tx) {
                tx.executeSql('SELECT id, name, generationDateTime, creationDateTime, modificationDateTime, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount FROM SavedSessions WHERE deleted != \'true\' ' + sEnabledVal + 'ORDER BY ' + iNewNmVal + (limit ? ' LIMIT ' + limit : '') + (offset ? ' OFFSET ' + offset : ''), [], function(tx, data) {
                    if (data && data.rows && cb) {
                        if (limit) {
                            tx.executeSql('SELECT count(*) as cnt FROM SavedSessions WHERE deleted != \'true\' ' + sEnabledVal, [], function(tx, initSessionConfig) {
                                if (initSessionConfig && initSessionConfig.rows) {
                                    cb(data, initSessionConfig.rows.item(0).cnt);
                                }
                            }, function(tx, err) {
                                app.windowStartIdx(err, 2, that.idx2Val, '6499203');
                            });
                        } else {
                            cb(data);
                        }
                    }
                }, function(tx, err) {
                    app.windowStartIdx(err, 2, that.idx2Val, '3224123123');
                });
            });
        }
    };
    this.evalSbSessionConfig = function(copySessionState, tx, cb) {
        if (cb) {
            var that = this;
            var syncWindowTitle = function(tx) {
                tx.executeSql('SELECT id FROM SavedSessions WHERE deleted != \'true\'', [], function(tx, data) {
                    if (data && data.rows && cb) {
                        cb(data, tx);
                    }
                }, function(tx, err) {
                    app.windowStartIdx(err, 2, that.idx2Val, '892804029');
                });
            };
            if (tx == undefined) {
                this.nmVal.db.transaction(syncWindowTitle);
            } else {
                syncWindowTitle(tx);
            }
        }
    };
    this.filterAdjascentTabs = function(cb, copySessionState, tx) {
        if (cb) {
            var that = this, sumP = 's';
            var syncWindowTitle = function(tx) {
                tx.executeSql('SELECT count(*) AS ' + sumP + ' FROM SavedSessions WHERE deleted != \'true\'', [], function(tx, data) {
                    if (data && data.rows && data.rows.length === 1) {
                        cb(data.rows.item(0)[sumP]);
                    }
                }, function(tx, err) {
                    app.windowStartIdx(err, 2, that.idx2Val, '892804034');
                });
            };
            if (u.isUndefined(tx)) {
                this.nmVal.db.transaction(syncWindowTitle);
            } else {
                syncWindowTitle(tx);
            }
        }
    };
    this.addCurrentSessionSource = function(iNewNmVal, iStringVal, cb, evalRevisionIdx, limit, offset) {
        var i;
        if (cb) {
            if (!iNewNmVal) {
                iNewNmVal = 'recordingDateTime desc, id desc';
            } else {
                iNewNmVal = iNewNmVal.trim().toLowerCase();
                if (iNewNmVal.startsWith('order by')) {
                    iNewNmVal = iNewNmVal.substring(8);
                    iNewNmVal = iNewNmVal.trim();
                }
            }
            var augmentSavedSession = '';
            if (evalRevisionIdx) {
                for (i = 0; i < evalRevisionIdx.length; i++) {
                    if (evalRevisionIdx[i].type === 'previous') {
                        if (augmentSavedSession.length > 0) {
                            augmentSavedSession += ',';
                        }
                        augmentSavedSession += evalRevisionIdx[i].id;
                    }
                }
            }
            var sEnabledVal = '';
            if (iStringVal) {
                var popSessionTransactions = '';
                var lineitemsAddedCb = '';
                if (typeof iStringVal === 'string') {
                    iStringVal = iStringVal.replace(/'/g, '\'\'');
                    sEnabledVal = 'windows like \'%' + iStringVal + '%\' ';
                } else if (typeof iStringVal === 'object') {
                    lineitemsAddedCb = '';
                    for (i = 0; i < iStringVal.length; i++) {
                        if (!iStringVal[i].type || iStringVal[i].type && iStringVal[i].type === 'previous') {
                            popSessionTransactions = '';
                            if (iStringVal[i].id) {
                                if (popSessionTransactions.length > 0) {
                                    popSessionTransactions += ' AND ';
                                }
                                popSessionTransactions += 'id=' + iStringVal[i].id;
                            }
                            if (popSessionTransactions.length > 0) {
                                if (lineitemsAddedCb.length > 0) {
                                    lineitemsAddedCb += ' OR ';
                                }
                                lineitemsAddedCb += '(' + popSessionTransactions + ')';
                            }
                        }
                    }
                    if (lineitemsAddedCb.length > 0) {
                        sEnabledVal = '(' + lineitemsAddedCb + ') ';
                    }
                }
                if (sEnabledVal.length > 0) {
                    if (augmentSavedSession.length > 0) {
                        sEnabledVal = 'AND ((id in (' + augmentSavedSession + ')) OR (' + sEnabledVal + '))';
                    } else {
                        sEnabledVal = 'AND ' + sEnabledVal;
                    }
                }
            }
            if (iStringVal && sEnabledVal.length == 0) {
                cb({
                    rows: []
                });
            } else {
                var that = this;
                this.nmVal.db.readTransaction(function(tx) {
                    tx.executeSql('SELECT id, recordingDateTime, creationDateTime, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount FROM PreviousSessions WHERE deleted != \'true\' ' + sEnabledVal + 'ORDER BY ' + iNewNmVal + (limit ? ' LIMIT ' + limit : '') + (offset ? ' OFFSET ' + offset : ''), [], function(tx, data) {
                        if (data && data.rows) {
                            if (limit) {
                                tx.executeSql('SELECT count(*) as cnt FROM PreviousSessions WHERE deleted != \'true\' ' + sEnabledVal, [], function(tx, initSessionConfig) {
                                    if (initSessionConfig && initSessionConfig.rows) {
                                        cb(data, initSessionConfig.rows.item(0).cnt);
                                    }
                                }, function(tx, err) {
                                    app.windowStartIdx(err, 2, that.idx2Val, '647939203');
                                });
                            } else {
                                cb(data);
                            }
                        }
                    }, function(tx, err) {
                        app.windowStartIdx(err, 2, that.idx2Val, '677939203');
                    });
                });
            }
        }
    };
    this.errorDetails = function(copySessionState, tx, cb) {
        var that = this;
        if (cb) {
            var syncWindowTitle = function(tx) {
                tx.executeSql('SELECT id FROM PreviousSessions WHERE deleted != \'true\' ORDER BY id DESC', [], function(tx, data) {
                    if (data && data.rows && cb) {
                        cb(data, tx);
                    }
                }, function(tx, err) {
                    app.windowStartIdx(err, 2, that.idx2Val, '89930458');
                });
            };
            if (tx == undefined) {
                this.nmVal.db.transaction(syncWindowTitle);
            } else {
                syncWindowTitle(tx);
            }
        }
    };
    this.setWindowTab = function(cb) {
        this.idx8Val('sessionRender_RenderSessionURL', false, function(value) {
            cb(value === 'true');
        });
    };
    this.iSessionConfig2Val = function(cb) {
        this.idx8Val('sessionRender_ShowAdminTabsInItalic', false, function(value) {
            cb(value === 'true');
        });
    };
    this.setTabStatus = function(cb) {
        this.idx8Val('isClickOriginDeleteVal', false, function(value) {
            cb(value === 'true');
        });
    };
    this.iWindow2TabIdx = function(cb) {
        this.idx8Val('sessionRender_ShowSessionCountsInNavigationPane', false, function(value) {
            cb(value === 'true');
        });
    };
    this.initControlVal = function(cb) {
        this.idx8Val('sessionRender_ShowExtensionBadge', false, function(value) {
            cb(value === 'true');
        });
    };
    this.limitVal = function(cb) {
        this.idx8Val('sessionSave_AskForName', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.getConfCloseVal = function(cb) {
        this.idx8Val('sessionSave_ConfirmClose', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.setTabTransaction = function(cb) {
        this.idx8Val('sessionMerge_WarnOnMerge', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.iSetNmVal = function(cb) {
        this.idx8Val('sessionEdit_HideDuplicateTabsInMerge', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.iContextFromVal = function(cb) {
        this.idx8Val('appMode', false, function(value) {
            if (cb) {
                cb(value || '');
            }
        });
    };
    this.iSessionStorageKeyVal = function(cb) {
        this.idx8Val('copyTabTitle', false, function(value) {
            if (cb) {
                cb(value === 'true');
            }
        });
    };
    this.addSession = function(cb) {
        this.idx8Val('sessionEdit_IgnoreUrlParamsInTabCompare', false, function(value) {
            if (cb) {
                cb(value === 'true');
            }
        });
    };
    this.iWindowIdVal = function(cb) {
        this.idx8Val('automaticallyRecordSessions', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.findSession = function(cb) {
        this.idx8Val('sessionSave_ShowSaveCurrentInRightClickMenus', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.detailTxt = function(cb) {
        this.idx8Val('enableKeyboardShortcuts', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.wrx = function(cb) {
        this.idx8Val('customDateFormat', false, function(value) {
            if (cb) {
                cb(value || 'LLLL');
            }
        });
    };
    this.setSessionWindow = function(cb) {
        this.idx8Val('dateDisplayType', false, function(value) {
            if (cb) {
                if (value === 'custom' || value === 'relative') {
                    cb(value);
                } else {
                    cb('standard');
                }
            }
        });
    };
    this.filterCurrentWindow = function(cb) {
        this.idx8Val('sessionExport_Format', true, function(value) {
            if (value === 'CSV' || value === 'JSON' || value === 'HTML' || value === 'Markdown') {
                if (cb) {
                    cb(value);
                }
            } else {
                if (cb) {
                    cb('Text');
                }
            }
        });
    };
    this.adjustCurrentTab = function(cb) {
        this.idx8Val('sessionExport_Scope', true, function(value) {
            if (value === 'all' || value === 'previous' || value === 'saved') {
                if (cb) {
                    cb(value);
                }
            } else {
                if (cb) {
                    cb('selected');
                }
            }
        });
    };
    this.neutralizeWindowFocus = function(cb) {
        this.idx8Val('sessionSummaryRender_ShowAnnotation', false, function(value) {
            cb(value !== 'false');
        });
    };
    this.evalSessionConfigsToAddVal = function(cb) {
        this.idx8Val('sessionSummaryRender_PanelWidth', true, function(value) {
            if (u.isNumeric(value)) {
                if (cb) {
                    cb(parseInt(value));
                }
            } else {
                if (cb) {
                    cb(260);
                }
            }
        });
    };
    this.iShowWindowsVal = function(cb) {
        var that = this;
        this.idx8Val('sessionSummaryRender_PreviousSessionQueueSize', false, function(value) {
            if (u.isNumeric(value) && parseInt(value) > -1 && parseInt(value) <= that.isNm) {
                if (cb) {
                    cb(parseInt(value));
                }
            } else {
                if (cb) {
                    cb(3);
                }
            }
        });
    };
    this.fieldNm = function(cb) {
        this.idx8Val('showWindowCounts', true, function(value) {
            cb(value === 'true');
        });
    };
    this.iPosString = function(cb) {
        this.idx8Val('sessionExport_ShowWindows', true, function(value) {
            cb(value === 'true');
        });
    };
    this.mergeTabs = function(cb) {
        this.idx8Val('sessionExport_ShowSessions', true, function(value) {
            cb(value === 'true');
        });
    };
    this.evalOffsetVal = function(cb) {
        this.idx8Val('sessionExport_ShowTitles', true, function(value) {
            cb(value === 'true');
        });
    };
    this.filterSessionSource = function(cb) {
        this.idx8Val('sessionExport_ShowURLs', true, function(value) {
            cb(value !== 'false');
        });
    };
    this.deferCurrentSessionNotifyVal = function(cb) {
        this.idx8Val('tabFiltering_FilterSessionBuddyTabs', false, function(value) {
            if (cb) {
                cb(value !== 'false');
            }
        });
    };
    this.evalSbSelLineitem = function(cb) {
        this.expectStatusVal('tabCountsFilterSetting_SessionBuddyTabs', false, function(value) {
            if (cb) {
                cb(value);
            }
        });
    };
    this.normalizeTabList = function(cb) {
        this.idx8Val('tabFiltering_FilterChromeAdministrativeTabs', false, function(value) {
            cb(value === 'true');
        });
    };
    this.removeSessionConfigs = function(cb) {
        this.expectStatusVal('tabCountsFilterSetting_ChromeAdministrativeTabs', false, function(value) {
            cb(value);
        });
    };
    this.evalRespVal = function(wins, formatActiveSessionTab, bMergeVal, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, cb, iRegisterValue1Val, cacheSessionRoot, gid, reportOnly) {
        if (wins) {
            var that = this;
            this.nmVal.db.transaction(function(tx) {
                var headerDataSavedVal = new Date().toJSON();
                if (!iRegisterValue1Val) {
                    iRegisterValue1Val = headerDataSavedVal;
                }
                if (!cacheSessionRoot) {
                    cacheSessionRoot = headerDataSavedVal;
                }
                tx.executeSql('INSERT INTO SavedSessions (name, generationDateTime, creationDateTime, modificationDateTime, tags, users, deleted, thumbnail, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, windows) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [ formatActiveSessionTab ? formatActiveSessionTab.trim() || null : null, bMergeVal ? bMergeVal : null, iRegisterValue1Val, cacheSessionRoot, [], [], 'false', gid || null, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, JSON.stringify(wins) ], function(tx, data) {
                    tx.executeSql('SELECT last_insert_rowid();', [], function(tx, data) {
                        if (that.nmVal.rowsReturned(data)) {
                            var rowid = that.nmVal.evalOnlyCountDupes(data)['last_insert_rowid()'];
                            if (gid) {
                                finish();
                            } else {
                                tx.executeSql('UPDATE SavedSessions SET thumbnail=\'' + xid() + '\' WHERE id=?', [ rowid ], finish);
                            }
                            function finish() {
                                if (cb) {
                                    cb(rowid, cacheSessionRoot);
                                }
                                if (!reportOnly) {
                                    ga('send', 'event', 'tx', 'add', 'lx', renderActiveSessionTab + showActiveTab);
                                    querySessionAction('added_lx_tab_count', renderActiveSessionTab + showActiveTab);
                                }
                            }
                        }
                    }, function(tx, winIdxStartAt) {
                        app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '903948203');
                        if (cb) {
                            cb(null, null);
                        }
                        return true;
                    });
                }, function(tx, winIdxStartAt) {
                    app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '3224123123');
                    if (cb) {
                        cb(null, null);
                    }
                });
            });
        } else {
            if (cb) {
                cb(null, null);
            }
        }
    };
    this.trackTabPlacement = function(notifyCurrentTab, formatActiveSessionTab, cb) {
        this.iKeepActionOpenVal(notifyCurrentTab, undefined, formatActiveSessionTab, undefined, undefined, undefined, undefined, undefined, function(notifyCurrentTab, putTabPlaceholder) {
            cb(notifyCurrentTab && putTabPlaceholder);
        });
    };
    this.iKeepActionOpenVal = function(notifyCurrentTab, wins, formatActiveSessionTab, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, sessionConfig2, cb) {
        if (notifyCurrentTab) {
            this.nmVal.db.transaction(function(tx) {
                var horizontalOrientationArray = [], verticalOrientation = [];
                if (wins) {
                    horizontalOrientationArray.push('windows');
                    verticalOrientation.push(JSON.stringify(wins));
                }
                if (!u.isUndefined(xp)) {
                    horizontalOrientationArray.push('unfilteredWindowCount');
                    verticalOrientation.push(xp);
                }
                if (!u.isUndefined(registerSessionSource)) {
                    horizontalOrientationArray.push('filteredWindowCount');
                    verticalOrientation.push(registerSessionSource);
                }
                if (!u.isUndefined(renderActiveSessionTab)) {
                    horizontalOrientationArray.push('unfilteredTabCount');
                    verticalOrientation.push(renderActiveSessionTab);
                }
                if (!u.isUndefined(showActiveTab)) {
                    horizontalOrientationArray.push('filteredTabCount');
                    verticalOrientation.push(showActiveTab);
                }
                if (sessionConfig2 || horizontalOrientationArray.length) {
                    horizontalOrientationArray.push('modificationDateTime');
                    verticalOrientation.push(sessionConfig2 || (sessionConfig2 = new Date().toJSON()));
                }
                if (!u.isUndefined(formatActiveSessionTab)) {
                    horizontalOrientationArray.push('name');
                    verticalOrientation.push(formatActiveSessionTab);
                }
                if (horizontalOrientationArray.length) {
                    verticalOrientation.push(notifyCurrentTab);
                    tx.executeSql('UPDATE SavedSessions SET ' + horizontalOrientationArray.join('=?, ') + '=? WHERE id=?', verticalOrientation, function(tx, data) {
                        if (cb) {
                            cb(notifyCurrentTab, data.rowsAffected, sessionConfig2 || null);
                        }
                    }, function(tx, winIdxStartAt) {
                        console.error('8534682039: ' + winIdxStartAt);
                        if (cb) {
                            cb(null, 0);
                        }
                    });
                } else if (cb) {
                    cb(notifyCurrentTab, 0);
                }
            });
        }
    };
    this.iBrchNodePropId = function(notifyCurrentTab, wins, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, cb) {
        if (notifyCurrentTab) {
            this.nmVal.db.transaction(function(tx) {
                var horizontalOrientationArray = [], verticalOrientation = [];
                if (wins) {
                    horizontalOrientationArray.push('windows');
                    verticalOrientation.push(JSON.stringify(wins));
                }
                if (!u.isUndefined(xp)) {
                    horizontalOrientationArray.push('unfilteredWindowCount');
                    verticalOrientation.push(xp);
                }
                if (!u.isUndefined(registerSessionSource)) {
                    horizontalOrientationArray.push('filteredWindowCount');
                    verticalOrientation.push(registerSessionSource);
                }
                if (!u.isUndefined(renderActiveSessionTab)) {
                    horizontalOrientationArray.push('unfilteredTabCount');
                    verticalOrientation.push(renderActiveSessionTab);
                }
                if (!u.isUndefined(showActiveTab)) {
                    horizontalOrientationArray.push('filteredTabCount');
                    verticalOrientation.push(showActiveTab);
                }
                if (horizontalOrientationArray.length) {
                    verticalOrientation.push(notifyCurrentTab);
                    tx.executeSql('UPDATE PreviousSessions SET ' + horizontalOrientationArray.join('=?, ') + '=? WHERE id=?', verticalOrientation, function(tx, data) {
                        if (cb) {
                            cb(notifyCurrentTab, data.rowsAffected);
                        }
                    }, function(tx, winIdxStartAt) {
                        console.error('8534692994: ' + winIdxStartAt);
                        if (cb) {
                            cb(null, 0);
                        }
                    });
                } else if (cb) {
                    cb(notifyCurrentTab, 0);
                }
            });
        }
    };
    this.selActionTypeVal = function(wins, iSelActionTypeVal, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, cb, iRegisterValue1Val, hoverLinksVal, reportOnly) {
        if (wins) {
            var that = this;
            this.nmVal.db.transaction(function(tx) {
                tx.executeSql('SELECT id FROM PreviousSessions ORDER BY id DESC', [], function(tx, data) {
                    if (that.nmVal.rowsReturned(data) >= that.isNm) {
                        tx.executeSql('DELETE FROM PreviousSessions WHERE id<?', [ data.rows.item(that.isNm - 2).id ]);
                    }
                });
            });
            this.nmVal.db.transaction(function(tx) {
                if (!iRegisterValue1Val) {
                    iRegisterValue1Val = new Date().toJSON();
                }
                tx.executeSql('INSERT into PreviousSessions (recordingDateTime, creationDateTime, users, deleted, thumbnail, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, windows) VALUES (?,?,?,?,?,?,?,?,?,?)', [ iSelActionTypeVal ? iSelActionTypeVal : null, iRegisterValue1Val, [], 'false', hoverLinksVal || null, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, JSON.stringify(wins) ], function(tx, data) {
                    tx.executeSql('SELECT last_insert_rowid();', [], function(tx, data) {
                        if (that.nmVal.rowsReturned(data)) {
                            tx.executeSql('UPDATE PreviousSessions SET thumbnail=\'' + xid() + '\' WHERE id=?', [ that.nmVal.evalOnlyCountDupes(data)['last_insert_rowid()'] ], function() {
                                if (cb) {
                                    cb(that.nmVal.evalOnlyCountDupes(data)['last_insert_rowid()'], iSelActionTypeVal);
                                }
                                if (!reportOnly) {}
                            });
                        }
                    });
                }, function(tx, winIdxStartAt) {
                    app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '72322015293');
                    if (cb) {
                        cb(null, null);
                    }
                });
            });
        }
    };
    this.appMsgVal = function(searchCurrentWindow, trackTabTransactions, cb) {
        if (searchCurrentWindow) {
            var currentSettingsVal = [];
            var allowUndoTrigger = [];
            var i;
            for (i = 0; i < searchCurrentWindow.length; i++) {
                if (searchCurrentWindow[i].type === 'previous') {
                    currentSettingsVal.push(searchCurrentWindow[i].id);
                } else if (searchCurrentWindow[i].type === 'saved') {
                    allowUndoTrigger.push(searchCurrentWindow[i].id);
                }
            }
            var that = this;
            this.nmVal.db.transaction(function(tx) {
                tx.executeSql('UPDATE SavedSessions SET deleted=\'' + (trackTabTransactions ? 'true' : 'false') + '\' WHERE id IN (' + allowUndoTrigger.join(',') + ')', [], function(tx, setMatchText) {
                    tx.executeSql('UPDATE PreviousSessions SET deleted=\'' + (trackTabTransactions ? 'true' : 'false') + '\' WHERE id IN (' + currentSettingsVal.join(',') + ')', [], function(tx, initSessionConfig) {
                        if (cb) {
                            cb(setMatchText.rowsAffected + initSessionConfig.rowsAffected);
                        }
                        var dga = 0;
                        for (i = setMatchText.rowsAffected; i--; ) {
                            setTimeout(function(trackTabTransactions) {
                                ga('send', 'event', 'tx', trackTabTransactions ? 'delete' : 'undelete', 'lx');
                            }, dga * 1100, trackTabTransactions);
                            dga++;
                        }
                        for (i = initSessionConfig.rowsAffected; i--; ) {
                            setTimeout(function(trackTabTransactions) {
                                ga('send', 'event', 'tx', trackTabTransactions ? 'delete' : 'undelete', 'lx_previous');
                            }, dga * 1100, trackTabTransactions);
                            dga++;
                        }
                    }, function(tx, err) {
                        app.windowStartIdx(err, 2, that.idx2Val, '7213487');
                    });
                }, function(tx, err) {
                    app.windowStartIdx(err, 2, that.idx2Val, '94472347');
                });
            });
        }
    };
    this.sessionConfigsAllVal = function(cb) {
        var that = this;
        this.nmVal.db.transaction(function(tx) {
            tx.executeSql('DELETE FROM SavedSessions WHERE deleted=\'true\'', [], function(tx, setMatchText) {
                tx.executeSql('DELETE FROM PreviousSessions WHERE deleted=\'true\'', [], function(tx, initSessionConfig) {
                    if (cb) {
                        cb(setMatchText.rowsAffected + initSessionConfig.rowsAffected);
                    }
                }, function(tx, winIdxStartAt) {
                    app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '489314871092');
                });
            }, function(tx, winIdxStartAt) {
                app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '52897234972');
            });
        });
    };
    this.elMetricsVal = function(cb) {
        var that = this;
        this.nmVal.db.transaction(function(tx) {
            tx.executeSql('DELETE FROM PreviousSessions', [], function(tx, initSessionConfig) {
                if (cb) {
                    cb(initSessionConfig.rowsAffected);
                }
            }, function(tx, err) {
                app.windowStartIdx(err, 2, that.idx2Val, '2423954');
            });
        });
    };
    this.contextToVal = function(notifyCurrentTab, cb) {
        var that = this;
        this.nmVal.db.readTransaction(function(tx) {
            tx.executeSql('SELECT id, name, generationDateTime, creationDateTime, modificationDateTime, deleted, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, thumbnail AS gid FROM SavedSessions WHERE id=?', [ notifyCurrentTab ], function(tx, data) {
                if (that.nmVal.rowsReturned(data)) {
                    cb(data.rows.item(0));
                } else {
                    cb(undefined);
                }
            });
        });
    };
    this.primaryKeySelect = function(keyFilterParms, cb) {
        var that = this;
        this.nmVal.db.readTransaction(function(tx) {
            tx.executeSql('SELECT id, \'saved\' AS type, name, generationDateTime, creationDateTime, modificationDateTime, deleted, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount FROM SavedSessions WHERE deleted != \'true\' AND thumbnail=?', [ keyFilterParms ], function(tx, data) {
                if (that.nmVal.rowsReturned(data)) {
                    cb(data.rows.item(0));
                } else {
                    tx.executeSql('SELECT id, \'previous\' AS type, recordingDateTime, creationDateTime, deleted, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount FROM PreviousSessions WHERE thumbnail=?', [ keyFilterParms ], function(tx, data) {
                        if (that.nmVal.rowsReturned(data)) {
                            cb(data.rows.item(0));
                        } else {
                            cb(undefined);
                        }
                    });
                }
            });
        });
    };
    this.evalRegisterValue1 = function(notifyCurrentTab, cb) {
        var that = this;
        this.nmVal.db.readTransaction(function(tx) {
            tx.executeSql('SELECT id, recordingDateTime, creationDateTime, deleted, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, thumbnail AS gid FROM PreviousSessions WHERE id=?', [ notifyCurrentTab ], function(tx, data) {
                if (that.nmVal.rowsReturned(data)) {
                    cb(data.rows.item(0));
                } else {
                    cb(undefined);
                }
            });
        });
    };
    this.serializeActiveSessionTab = function(val3, tx, cb) {
        if (cb) {
            var qualifierInjectionStr, that = this;
            if (val3 === void 0) {
                qualifierInjectionStr = 'deleted != \'true\'';
            } else if (toString.call(val3) === '[object Array]') {
                qualifierInjectionStr = 'id in (' + val3.join(',') + ')';
            } else {
                qualifierInjectionStr = 'id=' + val3;
            }
            var syncWindowTitle = function(tx) {
                tx.executeSql('SELECT id, thumbnail, recordingDateTime, creationDateTime, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, windows FROM PreviousSessions WHERE ' + qualifierInjectionStr + ' ORDER BY id DESC', [], function(tx, data) {
                    if (that.nmVal.rowsReturned(data)) {
                        if (val3 === void 0 || toString.call(val3) === '[object Array]') {
                            cb(data.rows, tx);
                        } else {
                            cb(data.rows.item(0), tx);
                        }
                    } else {
                        cb(undefined);
                    }
                });
            };
            if (tx) {
                syncWindowTitle(tx);
            } else {
                this.nmVal.db.transaction(syncWindowTitle);
            }
        }
    };
    this.renderWindowTab = function(val3, tx, cb) {
        if (cb) {
            var qualifierInjectionStr, that = this;
            if (val3 === void 0) {
                qualifierInjectionStr = 'deleted != \'true\'';
            } else if (toString.call(val3) === '[object Array]') {
                qualifierInjectionStr = 'id in (' + val3.join(',') + ')';
            } else {
                qualifierInjectionStr = 'id=' + val3;
            }
            var syncWindowTitle = function(tx) {
                tx.executeSql('SELECT id, thumbnail, name, generationDateTime, creationDateTime, modificationDateTime, unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount, windows, tags FROM SavedSessions WHERE ' + qualifierInjectionStr + ' ORDER BY id DESC', [], function(tx, data) {
                    if (that.nmVal.rowsReturned(data)) {
                        if (val3 === void 0 || toString.call(val3) === '[object Array]') {
                            cb(data.rows, tx);
                        } else {
                            cb(data.rows.item(0), tx);
                        }
                    } else {
                        cb(undefined);
                    }
                });
            };
            if (tx) {
                syncWindowTitle(tx);
            } else {
                this.nmVal.db.transaction(syncWindowTitle);
            }
        }
    };
    this.includeSeqProp = function(notifyCurrentTab, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, tx, cb) {
        var that = this;
        var syncWindowTitle = function(tx) {
            tx.executeSql('UPDATE PreviousSessions SET unfilteredWindowCount=?, filteredWindowCount=?, unfilteredTabCount=?, filteredTabCount=? WHERE id=?', [ xp, registerSessionSource, renderActiveSessionTab, showActiveTab, notifyCurrentTab ], function(tx, data) {
                if (cb) {
                    cb(tx);
                }
            }, function(tx, err) {
                app.windowStartIdx(err, 2, that.idx2Val, '4290842');
            });
        };
        if (tx == undefined) {
            this.nmVal.db.transaction(syncWindowTitle);
        } else {
            syncWindowTitle(tx);
        }
    };
    this.saveWindow = function(notifyCurrentTab, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, tx, cb) {
        var that = this;
        var syncWindowTitle = function(tx) {
            tx.executeSql('UPDATE SavedSessions SET unfilteredWindowCount=?, filteredWindowCount=?, unfilteredTabCount=?, filteredTabCount=? WHERE id=?', [ xp, registerSessionSource, renderActiveSessionTab, showActiveTab, notifyCurrentTab ], function(tx, data) {
                if (cb) {
                    cb(tx);
                }
            }, function(tx, err) {
                app.windowStartIdx(err, 2, that.idx2Val, '94776492');
            });
        };
        if (tx == undefined) {
            this.nmVal.db.transaction(syncWindowTitle);
        } else {
            syncWindowTitle(tx);
        }
    };
    this.iSiblingSequence = function(opacityAnimationVal, parseTabList, cb) {
        var that = this;
        this.resetIcon('tabCountsFilterSetting_SessionBuddyTabs', opacityAnimationVal, function() {
            that.resetIcon('tabCountsFilterSetting_ChromeAdministrativeTabs', parseTabList, cb);
        });
    };
    this.lastFrameVal = function(trackWinIdx, registerTab, recoverySessionVal, cb, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache) {
        if (registerTab && trackWinIdx) {
            if (!iSearchRequest) {
                iSearchRequest = null;
            }
            if (!extractCurrentSession) {
                extractCurrentSession = null;
            }
            if (!optDefaultRTypeVal) {
                optDefaultRTypeVal = null;
            }
            if (!countWindowTabs) {
                countWindowTabs = null;
            }
            if (!updateSessionCache) {
                updateSessionCache = null;
            }
            var that = this;
            this.nmVal.db.transaction(function(tx) {
                tx.executeSql('INSERT INTO Undo (creationDateTime, tabIdentifier, action, description, register1, register2, register3, register4, register5) VALUES (?,?,?,?,?,?,?,?,?)', [ new Date().toJSON(), trackWinIdx, registerTab, recoverySessionVal, iSearchRequest, extractCurrentSession, optDefaultRTypeVal, countWindowTabs, updateSessionCache ], function(tx, data) {
                    if (cb) {
                        cb();
                    }
                }, function(tx, winIdxStartAt) {
                    app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '0398373');
                });
            });
        }
    };
    this.cachePtPairVal = function(trackWinIdx, cb) {
        var bMerge = '';
        var iRangeVal = [];
        var that = this;
        if (trackWinIdx) {
            bMerge = 'SELECT id, action FROM Undo WHERE tabIdentifier=? ORDER BY creationDateTime DESC, id DESC';
            iRangeVal = [ trackWinIdx ];
        } else {
            bMerge = 'SELECT id, action FROM Undo ORDER BY creationDateTime DESC, id DESC';
            iRangeVal = [];
        }
        this.nmVal.db.transaction(function(tx) {
            tx.executeSql(bMerge, iRangeVal, function(tx, data) {
                if (that.nmVal.rowsReturned(data)) {
                    if (cb) {
                        cb(data.rows.item(0));
                    }
                } else {
                    if (cb) {
                        cb(null);
                    }
                }
            }, function(tx, winIdxStartAt) {
                app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '7298372');
            });
        });
    };
    this.iApplicationEx = function(trackWinIdx, cb) {
        var bMerge = '';
        var iRangeVal = [];
        var that = this;
        if (trackWinIdx) {
            bMerge = 'SELECT id FROM Undo WHERE tabIdentifier=? ORDER BY creationDateTime DESC, id DESC';
            iRangeVal = [ trackWinIdx ];
        } else {
            bMerge = 'SELECT id FROM Undo ORDER BY creationDateTime DESC, id DESC';
            iRangeVal = [];
        }
        this.nmVal.db.transaction(function(tx) {
            tx.executeSql(bMerge, iRangeVal, function(tx, data) {
                if (that.nmVal.rowsReturned(data)) {
                    tx.executeSql('SELECT * FROM Undo WHERE id=?', [ data.rows.item(0).id ], function(tx, initSessionConfig) {
                        if (that.nmVal.rowsReturned(initSessionConfig)) {
                            tx.executeSql('DELETE FROM Undo WHERE id=?', [ data.rows.item(0).id ], function(tx, d5) {
                                if (cb) {
                                    cb(initSessionConfig.rows.item(0));
                                }
                            }, function(tx, winIdxStartAt) {
                                app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '83409345');
                            });
                        } else {
                            if (cb) {
                                cb(null);
                            }
                        }
                    }, function(tx, winIdxStartAt) {
                        app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '8923483');
                    });
                } else {
                    if (cb) {
                        cb(null);
                    }
                }
            }, function(tx, winIdxStartAt) {
                app.windowStartIdx(winIdxStartAt, 2, that.idx2Val, '0398373');
            });
        });
    };
}