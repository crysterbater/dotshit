/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

function sbDialogs(sDebug, updateUrl, nmMatchText, initSessionCache, selectRequestHonored, evalOverallSpeedVal, syncWindowTab) {
    var addSessionConfigs = this;
    var selTile = $(this.evalSbLocaleDesc = sDebug);
    this.deferDedupeSessionsVal = null;
    this.getSavedSession = selectRequestHonored;
    this.hideTab = evalOverallSpeedVal;
    this.augmentMatchText = syncWindowTab;
    this.reloadTabList = u.isNumeric(updateUrl) && updateUrl > 0 && updateUrl || 0;
    this.iComponentVal = false;
    this.currentLink = nmMatchText !== false;
    this.deferAppException = initSessionCache !== false;
    this.modelConfig = false;
    this.initCurrentWindow = null;
    this.evalSCtrlKeyVal = null;
    this.sessionConfigIdxVal = null;
    this.filterActiveSessionTab = 0;
    this.findSessionTab = 0;
    this.showTabList = 0;
    this.renderActiveWindow = 0;
    this.sbWindowVal = 0;
    this.addSessionConfigsVal = 0;
    this.copyTabLineItem = false;
    this.trackActiveTab = null;
    this.currentSessionCacheVal = [];
    this.txtComponent = null;
    this.elHidden = null;
    this.iNode = null;
    this.sessionConfigsAll = true;
    this.openTabInvert = null;
    selTile.on('click mousedown', '.nto', function(ev) {
        if (ev.target.classList.contains('selectedLineitems')) {
            if (ev.type === 'click' && ev.which === 1 && !u.iContentText(ev) && !ev.shiftKey) {
                $(ev.target).qtip('destroy', true);
                app.pollSaveTrigger();
                addSessionConfigs.evalSessionMerge([ this ], false, function(allowUserIntAction, addSessionStatus, evalOrientation, iPixelWidth) {
                    if (addSessionConfigs.hideTab) {
                        addSessionConfigs.hideTab(allowUserIntAction, addSessionStatus, evalOrientation, iPixelWidth);
                    }
                    app.btnCaretBackward();
                });
            }
        } else if (ev.type === 'mousedown') {
            addSessionConfigs.elHidden = this;
            addSessionConfigs.rateActionQualifier(this, addSessionConfigs.notifySessionListener(u.iContentText(ev), ev.shiftKey), function(findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab) {
                if (u.iContentText(ev) || ev.shiftKey) {
                    addSessionConfigs.sessionStateVal();
                } else {
                    addSessionConfigs.foundTabCandidates();
                }
                addSessionConfigs.getSavedSession(findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab);
            }, 'none', true);
        }
    });
    selTile.on('mousedown', '#sbDialogs', function() {
        if (addSessionConfigs.elHidden) {
            addSessionConfigs.currentSessionCacheVal.length = 0;
            addSessionConfigs.currentSessionCacheVal.push(addSessionConfigs.txtComponent = addSessionConfigs.trackActiveTab = addSessionConfigs.elHidden);
            addSessionConfigs.elHidden = null;
        } else {
            addSessionConfigs.trackActiveTab = null;
        }
    });
    selTile.on('mouseover', '#sbDialogs', function(ev) {
        if (addSessionConfigs.trackActiveTab && ev.target != addSessionConfigs.deferDedupeSessionsVal && ev.which == 1 && !u.iContentText(ev) && !ev.shiftKey) {
            var searchTabTransactions = addSessionConfigs.trackActiveTab.compareDocumentPosition(ev.target) === Node.DOCUMENT_POSITION_PRECEDING;
            var iFilter = addSessionConfigs.iDesc(addSessionConfigs.trackActiveTab, searchTabTransactions, undefined, 'none', false);
            var reloadTab = 0;
            while (iFilter && (!searchTabTransactions && iFilter.compareDocumentPosition(ev.target) !== Node.DOCUMENT_POSITION_PRECEDING || searchTabTransactions && ev.target.compareDocumentPosition(iFilter) !== Node.DOCUMENT_POSITION_PRECEDING)) {
                addSessionConfigs.iWin(iFilter, 'head');
                addSessionConfigs.currentSessionCacheVal.push(iFilter);
                reloadTab++;
                addSessionConfigs.txtComponent = iFilter;
                iFilter = addSessionConfigs.iDesc(iFilter, searchTabTransactions, undefined, 'none', false);
            }
            iFilter = ev.target;
            while (iFilter != addSessionConfigs.deferDedupeSessionsVal && iFilter.parentNode != addSessionConfigs.deferDedupeSessionsVal) {
                iFilter = iFilter.parentNode;
            }
            if (iFilter && iFilter.parentNode === addSessionConfigs.deferDedupeSessionsVal) {
                var copyWindowStatus = iFilter;
                if (addSessionConfigs.evalSelActionType(iFilter)) {
                    addSessionConfigs.txtComponent = iFilter;
                } else {
                    iFilter = addSessionConfigs.iDesc(copyWindowStatus, !searchTabTransactions, undefined, 'head', false);
                    if (iFilter) {
                        addSessionConfigs.txtComponent = iFilter;
                    }
                }
                iFilter = addSessionConfigs.iDesc(copyWindowStatus, searchTabTransactions, undefined, 'head', false);
                while (iFilter) {
                    addSessionConfigs.iWin(iFilter, 'none');
                    var evalSbNodeRanges = addSessionConfigs.currentSessionCacheVal.indexOf(iFilter);
                    if (evalSbNodeRanges > -1) {
                        addSessionConfigs.currentSessionCacheVal.splice(evalSbNodeRanges, 1);
                    }
                    reloadTab--;
                    iFilter = addSessionConfigs.iDesc(iFilter, searchTabTransactions, undefined, 'head', false);
                }
                if (copyWindowStatus === addSessionConfigs.trackActiveTab) {
                    iFilter = addSessionConfigs.iDesc(copyWindowStatus, true, undefined, 'head', false);
                    while (iFilter) {
                        addSessionConfigs.iWin(iFilter, 'none');
                        var evalSbNodeRanges = addSessionConfigs.currentSessionCacheVal.indexOf(iFilter);
                        if (evalSbNodeRanges > -1) {
                            addSessionConfigs.currentSessionCacheVal.splice(evalSbNodeRanges, 1);
                        }
                        reloadTab--;
                        iFilter = addSessionConfigs.iDesc(iFilter, true, undefined, 'head', false);
                    }
                }
            }
            if (reloadTab) {
                clearTimeout(addSessionConfigs.iNode);
                addSessionConfigs.iNode = setTimeout(function() {
                    addSessionConfigs.uiObf(addSessionConfigs.txtComponent, addSessionConfigs.currentSessionCacheVal);
                }, 200);
            }
        }
    });
    selTile.on('mouseup mouseleave', function() {
        if (addSessionConfigs.trackActiveTab) {
            clearTimeout(addSessionConfigs.iNode);
            if (addSessionConfigs.currentSessionCacheVal.length > 1) {
                addSessionConfigs.uiObf(addSessionConfigs.txtComponent, addSessionConfigs.currentSessionCacheVal);
            }
            addSessionConfigs.trackActiveTab = null;
            addSessionConfigs.evalWindowRestoreOptions();
        }
    });
    selTile.on('mouseenter', '.selectedLineitems', function(ev) {
        $(this).qtip({
            overwrite: false,
            show: {
                delay: 500,
                event: ev.type,
                ready: true
            },
            content: {
                text: 'Delete session'
            },
            position: {
                my: 'bottom right',
                at: 'top center',
                adjust: {
                    x: 5,
                    y: -9
                }
            },
            style: {
                tip: {
                    corner: true,
                    width: 12,
                    mimic: 'bottom center',
                    offset: 7
                }
            }
        });
    });
    selTile.on('mouseleave', '.selectedLineitems', function(ev) {
        $(this).qtip('destroy', true);
    });
    this.injectSessionData = function(how) {
        if (addSessionConfigs.trackActiveTab) {
            clearTimeout(addSessionConfigs.iNode);
            if (addSessionConfigs.currentSessionCacheVal.length > 1) {
                addSessionConfigs.uiObf(addSessionConfigs.txtComponent, addSessionConfigs.currentSessionCacheVal);
            }
            addSessionConfigs.trackActiveTab = null;
        }
        addSessionConfigs.evalWindowRestoreOptions(how);
    };
    this.sbAddedToken = function(evalOutMatchedTabsVal, cb) {
        if (evalOutMatchedTabsVal) {
            var sBSaveRelevant = [];
            var queryOriginator = [];
            var sbTailArrayVal = [];
            var iFilter = null;
            var addTabArray = null;
            var trackDisplayedSession = null;
            var tabSet = [];
            var lxMtypeVal = [];
            for (var i = evalOutMatchedTabsVal.length - 1; i >= 0; i--) {
                if (!this.updateWindow(evalOutMatchedTabsVal[i].id, evalOutMatchedTabsVal[i].type)) {
                    if (evalOutMatchedTabsVal[i].type == 'current') {
                        iFilter = this.firstInListVal();
                        this.filterActiveSessionTab++;
                        this.renderActiveWindow++;
                        if (cb || this.augmentMatchText) {
                            lxMtypeVal.push(evalOutMatchedTabsVal[i]);
                        }
                    } else if (evalOutMatchedTabsVal[i].type == 'previous') {
                        iFilter = this.iExtendedCacheDelayVal();
                        this.findSessionTab++;
                        this.sbWindowVal++;
                        if (cb || this.augmentMatchText) {
                            lxMtypeVal.push(evalOutMatchedTabsVal[i]);
                        }
                    } else if (evalOutMatchedTabsVal[i].type == 'saved') {
                        iFilter = this.queryMode();
                        this.showTabList++;
                        this.addSessionConfigsVal++;
                        if (cb || this.augmentMatchText) {
                            lxMtypeVal.push(evalOutMatchedTabsVal[i]);
                        }
                    } else {
                        continue;
                    }
                    var annotationIdVal = null;
                    var orientation = null;
                    var isSessionConfigCurrent = 0;
                    var cacheDisplayedSession = false;
                    while (iFilter) {
                        if (this.isElementType_GroupSubheader(iFilter)) {
                            if (annotationIdVal) {
                                orientation = annotationIdVal;
                            }
                            annotationIdVal = iFilter;
                        } else if (this.evalSelActionType(iFilter) && u.cachePtPair(evalOutMatchedTabsVal[i].utcDateString) <= +iFilter.dataset.d) {
                            if (this.tabTxVal(iFilter)) {
                                isSessionConfigCurrent++;
                            }
                        } else if (this.evalSelActionType(iFilter) || this.cacheSessionSource(iFilter)) {
                            addTabArray = this.hideTabUrl(evalOutMatchedTabsVal[i].id, evalOutMatchedTabsVal[i].type, evalOutMatchedTabsVal[i].name, evalOutMatchedTabsVal[i].utcDateString, evalOutMatchedTabsVal[i].unfilteredWindowCount, evalOutMatchedTabsVal[i].filteredWindowCount, evalOutMatchedTabsVal[i].unfilteredTabCount, evalOutMatchedTabsVal[i].filteredTabCount, 'none', false, true);
                            if (evalOutMatchedTabsVal[i].type == 'previous' && isSessionConfigCurrent >= this.reloadTabList && !this.iComponentVal) {
                                cacheDisplayedSession = true;
                            }
                            setNmVal = new Date(+addTabArray.dataset.d).cacheIdVal('evalRevise', 'searchWindow');
                            if (annotationIdVal && annotationIdVal.dataset.i == setNmVal) {
                                this.deferDedupeSessionsVal.insertBefore(addTabArray, iFilter);
                                if (cacheDisplayedSession) {
                                    this.iWin(addTabArray, undefined, true);
                                } else {
                                    sBSaveRelevant.push(addTabArray);
                                    if (evalOutMatchedTabsVal[i].type == 'previous' && !this.iComponentVal) {
                                        trackDisplayedSession = iFilter;
                                        while (trackDisplayedSession && !this.cacheSessionSource(trackDisplayedSession)) {
                                            if (this.tabTxVal(trackDisplayedSession)) {
                                                isSessionConfigCurrent++;
                                                if (isSessionConfigCurrent >= this.reloadTabList) {
                                                    if (this.isElementType_GroupSubheader(trackDisplayedSession.previousElementSibling)) {
                                                        queryOriginator.push(trackDisplayedSession.previousElementSibling);
                                                        sbTailArrayVal.push('iRequestVal');
                                                    }
                                                    queryOriginator.push(trackDisplayedSession);
                                                    sbTailArrayVal.push('nto_static');
                                                    break;
                                                }
                                            }
                                            trackDisplayedSession = trackDisplayedSession.nextElementSibling;
                                        }
                                    }
                                }
                            } else {
                                if (this.cacheSessionSource(iFilter)) {
                                    if (cacheDisplayedSession) {
                                        this.requestCurrentTab(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, this.formatCurrentWindow(iFilter.previousElementSibling) ? this.deferDedupeSessionsVal.removeChild(iFilter.previousElementSibling) : false, false), iFilter));
                                    } else {
                                        sBSaveRelevant.push(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, this.formatCurrentWindow(iFilter.previousElementSibling) ? this.deferDedupeSessionsVal.removeChild(iFilter.previousElementSibling) : false, false), iFilter));
                                    }
                                    this.deferDedupeSessionsVal.insertBefore(addTabArray, iFilter);
                                    if (cacheDisplayedSession) {
                                        this.iWin(addTabArray, undefined, true);
                                    } else {
                                        sBSaveRelevant.push(addTabArray);
                                        if (evalOutMatchedTabsVal[i].type == 'previous' && !this.iComponentVal) {
                                            trackDisplayedSession = iFilter;
                                            while (trackDisplayedSession && !this.cacheSessionSource(trackDisplayedSession)) {
                                                if (this.tabTxVal(trackDisplayedSession)) {
                                                    isSessionConfigCurrent++;
                                                    if (isSessionConfigCurrent >= this.reloadTabList) {
                                                        if (this.isElementType_GroupSubheader(trackDisplayedSession.previousElementSibling)) {
                                                            queryOriginator.push(trackDisplayedSession.previousElementSibling);
                                                            sbTailArrayVal.push('iRequestVal');
                                                        }
                                                        queryOriginator.push(trackDisplayedSession);
                                                        sbTailArrayVal.push('nto_static');
                                                        break;
                                                    }
                                                }
                                                trackDisplayedSession = trackDisplayedSession.nextElementSibling;
                                            }
                                        }
                                    }
                                } else if (this.isElementType_GroupSubheader(iFilter.previousElementSibling)) {
                                    if (!orientation || setNmVal != orientation.dataset.i) {
                                        if (cacheDisplayedSession) {
                                            this.requestCurrentTab(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, !orientation, false), iFilter.previousElementSibling));
                                        } else {
                                            sBSaveRelevant.push(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, !orientation, false), iFilter.previousElementSibling));
                                        }
                                    }
                                    tabSet.push(iFilter.previousElementSibling);
                                    this.deferDedupeSessionsVal.insertBefore(addTabArray, iFilter.previousElementSibling);
                                    if (cacheDisplayedSession) {
                                        this.iWin(addTabArray, undefined, true);
                                    } else {
                                        sBSaveRelevant.push(addTabArray);
                                        if (evalOutMatchedTabsVal[i].type == 'previous' && !this.iComponentVal) {
                                            trackDisplayedSession = iFilter;
                                            while (trackDisplayedSession && !this.cacheSessionSource(trackDisplayedSession)) {
                                                if (this.tabTxVal(trackDisplayedSession)) {
                                                    isSessionConfigCurrent++;
                                                    if (isSessionConfigCurrent >= this.reloadTabList) {
                                                        if (this.isElementType_GroupSubheader(trackDisplayedSession.previousElementSibling)) {
                                                            queryOriginator.push(trackDisplayedSession.previousElementSibling);
                                                            sbTailArrayVal.push('iRequestVal');
                                                        }
                                                        queryOriginator.push(trackDisplayedSession);
                                                        sbTailArrayVal.push('nto_static');
                                                        break;
                                                    }
                                                }
                                                trackDisplayedSession = trackDisplayedSession.nextElementSibling;
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        }
                        iFilter = iFilter.nextElementSibling;
                    }
                }
            }
            var spliceIndex = -1;
            for (var i = sBSaveRelevant.length - 1; i >= 0; i--) {
                if (spliceIndex > -1 && this.isElementType_GroupSubheader(sBSaveRelevant[i])) {
                    sBSaveRelevant.splice(i, 1);
                    if (spliceIndex > 0 && this.isElementType_GroupSubheader(queryOriginator[spliceIndex - 1])) {
                        queryOriginator.splice(spliceIndex - 1, 1);
                    }
                    spliceIndex = -1;
                } else if ((spliceIndex = queryOriginator.indexOf(sBSaveRelevant[i])) > -1) {
                    sBSaveRelevant.splice(i, 1);
                    queryOriginator.splice(spliceIndex, 1);
                }
            }
            var that = this;
            var refreshCurrentSessionCache = u.iObject([ sBSaveRelevant ], this.deferDedupeSessionsVal, null, null, 'fade', false, window);
            var formatVal = u.iWindow([ queryOriginator ], null, 'fade', true, sbTailArrayVal, window);
            var txVal = refreshCurrentSessionCache != null;
            var revisionIdxVal = formatVal != null;
            u.txtComponentMainVal(function(lowerLimit) {
                if (txVal !== false) {
                    txVal = refreshCurrentSessionCache(lowerLimit);
                }
                if (revisionIdxVal !== false) {
                    revisionIdxVal = formatVal(lowerLimit);
                }
                return txVal !== false || revisionIdxVal !== false;
            }, window, function() {
                for (var i = 0; i < tabSet.length; i++) {
                    tabSet[i].style.paddingTop = '';
                }
                that.deferEnableSel();
                that.iTabConfig(q('iTokenEl'), that.findSessionTab, that.sbWindowVal);
                that.iTabConfig(q('addedConfigs'), that.showTabList, that.addSessionConfigsVal);
                var iString = false;
                for (var i = that.evalSCtrlKeyVal.length - 1; i >= 0; i--) {
                    if (that.vSessionCache(that.evalSCtrlKeyVal[i])) {
                        that.iWin(that.evalSCtrlKeyVal[i], 'none');
                        that.evalSCtrlKeyVal.splice(i, 1);
                        iString = true;
                    }
                }
                if (that.vSessionCache(that.initCurrentWindow)) {
                    that.iWin(that.initCurrentWindow, 'none');
                    if (that.evalSCtrlKeyVal.length > 0) {
                        that.initCurrentWindow = that.evalSCtrlKeyVal[that.evalSCtrlKeyVal.length - 1];
                    } else {
                        that.initCurrentWindow = that.addIcon(that.initCurrentWindow, undefined, undefined, false, null, false);
                    }
                    that.iWin(that.initCurrentWindow, 'head');
                    iString = true;
                }
                if (cb || that.augmentMatchText) {
                    if (cb) {
                        if (lxMtypeVal.length === 0 && evalOutMatchedTabsVal.length > 0) {
                            cb(false);
                        } else {
                            cb(true, lxMtypeVal);
                        }
                    } else if (that.augmentMatchText) {
                        if (lxMtypeVal.length === 0 && evalOutMatchedTabsVal.length > 0) {
                            that.augmentMatchText(false);
                        } else {
                            that.augmentMatchText(true, lxMtypeVal);
                        }
                    }
                }
                if (iString && that.getSavedSession) {
                    that.getSavedSession(true, that.sbRange(), that.elHiddenVal(), false);
                    addSessionConfigs.injectSessionData();
                }
            });
        }
    };
    this.cacheWindowTab = function(data9, cb) {
        if (this.evalSCtrlKeyVal.length === 0) {
            this.evalSessionMerge([ this.initCurrentWindow ], data9, cb);
        } else {
            this.evalSessionMerge(this.evalSCtrlKeyVal, data9, cb);
        }
    };
    this.processSessionRoot = function(evalRegisterValue3, data9, cb) {
        if (evalRegisterValue3 && evalRegisterValue3.length > 0) {
            var copyRecoverySession = [];
            var iFilter = null;
            for (var i = evalRegisterValue3.length - 1; i >= 0; i--) {
                if (iFilter = this.updateSessionStatus(evalRegisterValue3[i])) {
                    copyRecoverySession.push(iFilter);
                }
            }
            this.evalSessionMerge(copyRecoverySession, data9, cb);
        }
    };
    this.evalSessionMerge = function(searchTabList, data9, cb) {
        var evalSessionMergeVal = addSessionConfigs.sbRange();
        var updateCurrentSessionCache = addSessionConfigs.elHiddenVal();
        var leafLineitemTypeVal = searchTabList.slice();
        if (leafLineitemTypeVal) {
            for (var i = leafLineitemTypeVal.length - 1; i >= 0; i--) {
                if (!this.syncIdx(leafLineitemTypeVal[i])) {
                    leafLineitemTypeVal.splice(i, 1);
                }
            }
            if (leafLineitemTypeVal.length > 0) {
                var orderStringVal = null;
                var isNmVal = this.syncActiveSessionTab(this.firstInListVal(), leafLineitemTypeVal);
                var removeCurrentTab = this.syncActiveSessionTab(this.iExtendedCacheDelayVal(), leafLineitemTypeVal);
                var evalOffset = this.syncActiveSessionTab(this.queryMode(), leafLineitemTypeVal);
                if (!data9 && leafLineitemTypeVal.contains(this.initCurrentWindow)) {
                    for (var i = this.evalSCtrlKeyVal.length - 1; i >= 0; i--) {
                        if (!leafLineitemTypeVal.contains(this.evalSCtrlKeyVal[i])) {
                            orderStringVal = this.evalSCtrlKeyVal[i];
                            break;
                        }
                    }
                    if (!orderStringVal) {
                        var tabConfig = null;
                        if (removeCurrentTab.sessionMergeVal > 0 && removeCurrentTab.popWindowCache > 0) {
                            tabConfig = this.addIcon(this.iExtendedCacheDelayVal(), 'previous', undefined, true, [ leafLineitemTypeVal ], false);
                        }
                        orderStringVal = this.addIcon(this.initCurrentWindow, undefined, undefined, false, [ leafLineitemTypeVal ], false, tabConfig ? [ tabConfig ] : undefined);
                    }
                }
                var that = this;
                var reg1 = leafLineitemTypeVal.length * 7 + 90;
                var qualifyingArrayVal = null;
                if (removeCurrentTab.sessionMergeVal > 0) {
                    var arrProcessPhase = [];
                    var iFilter = that.iDesc(that.iExtendedCacheDelayVal(), false, 'previous', undefined, true);
                    while (iFilter && leafLineitemTypeVal.contains(iFilter)) {
                        iFilter = that.iDesc(iFilter, false, 'previous', undefined, true);
                    }
                    for (var i = 0; i < removeCurrentTab.sessionMergeVal && iFilter; i++) {
                        arrProcessPhase.push(iFilter);
                        this.iWin(iFilter, undefined, false);
                        if (iFilter.previousSibling && that.adjustTabList(iFilter.previousSibling)) {
                            arrProcessPhase.push(iFilter.previousSibling);
                            iFilter.previousSibling.className = 'addSessionRoot';
                        }
                        iFilter = that.iDesc(iFilter, false, 'previous', undefined, true);
                        while (iFilter && leafLineitemTypeVal.contains(iFilter)) {
                            iFilter = that.iDesc(iFilter, false, 'previous', undefined, true);
                        }
                    }
                    if (arrProcessPhase.length > 0) {
                        qualifyingArrayVal = u.iObject([ arrProcessPhase ], this.deferDedupeSessionsVal, reg1, null, 'none', true, window);
                    }
                }
                var vDistributionIdx = null;
                var sbSummaryConfig = null;
                var delayCacheSessionVal = null;
                if (isNmVal.popWindowCache === 0 && isNmVal.evalReq === 0 && (isNmVal.appStatusVal > 0 || isNmVal.sessionMergeVal > 0)) {
                    vDistributionIdx = u.iObject([ [ that.endActions() ] ], this.deferDedupeSessionsVal, reg1, [ that.iRemovedSessionConfigs() ], 'fade', true, window);
                }
                if (removeCurrentTab.popWindowCache === 0 && removeCurrentTab.evalReq === 0 && (removeCurrentTab.appStatusVal > 0 || removeCurrentTab.sessionMergeVal > 0)) {
                    sbSummaryConfig = u.iObject([ [ that.endActions() ] ], this.deferDedupeSessionsVal, reg1, [ that.setActiveWindow() ], 'fade', true, window);
                }
                if (evalOffset.popWindowCache === 0 && evalOffset.evalReq === 0 && (evalOffset.appStatusVal > 0 || evalOffset.sessionMergeVal > 0)) {
                    delayCacheSessionVal = u.iObject([ [ that.endActions() ] ], this.deferDedupeSessionsVal, reg1, [ that.registerValue4Val() ], 'fade', true, window);
                }
                var resetSessionState = [];
                var iTokenComponentElVal = [];
                for (var i = leafLineitemTypeVal.length - 1; i >= 0; i--) {
                    if (that.tabTxVal(leafLineitemTypeVal[i])) {
                        resetSessionState.push(leafLineitemTypeVal[i]);
                    } else {
                        iTokenComponentElVal.push(leafLineitemTypeVal[i]);
                    }
                }
                var actionType = u.iWindow([ removeCurrentTab.iBaseline, resetSessionState ], reg1, 'pop', true, null, window);
                var areaNmVal = u.iWindow([ isNmVal.iBaseline, evalOffset.iBaseline, iTokenComponentElVal ], reg1, 'pop', false, null, window);
                setTimeout(function() {
                    var iSessionNmVal = qualifyingArrayVal != null;
                    var iSessionCount = vDistributionIdx != null;
                    var deferRemoveSessionConfigsVal = sbSummaryConfig != null;
                    var pos3 = delayCacheSessionVal != null;
                    var iAllowOverrideVal = actionType != null;
                    var data8 = areaNmVal != null;
                    u.txtComponentMainVal(function(lowerLimit) {
                        if (iSessionNmVal !== false) {
                            iSessionNmVal = qualifyingArrayVal(lowerLimit);
                        }
                        if (iSessionCount !== false) {
                            iSessionCount = vDistributionIdx(lowerLimit);
                        }
                        if (deferRemoveSessionConfigsVal !== false) {
                            deferRemoveSessionConfigsVal = sbSummaryConfig(lowerLimit);
                        }
                        if (pos3 !== false) {
                            pos3 = delayCacheSessionVal(lowerLimit);
                        }
                        if (iAllowOverrideVal !== false) {
                            iAllowOverrideVal = actionType(lowerLimit);
                        }
                        if (data8 !== false) {
                            data8 = areaNmVal(lowerLimit);
                        }
                        return iSessionNmVal !== false || iSessionCount !== false || deferRemoveSessionConfigsVal !== false || pos3 !== false || iAllowOverrideVal !== false || data8 !== false;
                    }, window, function() {
                        that.filterActiveSessionTab -= isNmVal.appStatusVal + isNmVal.sessionMergeVal;
                        that.findSessionTab -= removeCurrentTab.appStatusVal + removeCurrentTab.sessionMergeVal;
                        that.showTabList -= evalOffset.appStatusVal + evalOffset.sessionMergeVal;
                        that.renderActiveWindow -= isNmVal.appStatusVal + isNmVal.sessionMergeVal;
                        that.sbWindowVal -= removeCurrentTab.appStatusVal + removeCurrentTab.sessionMergeVal;
                        that.addSessionConfigsVal -= evalOffset.appStatusVal + evalOffset.sessionMergeVal;
                        that.deferEnableSel();
                        that.iTabConfig(q('iTokenEl'), that.findSessionTab, that.sbWindowVal);
                        that.iTabConfig(q('addedConfigs'), that.showTabList, that.addSessionConfigsVal);
                        var iString = false;
                        for (var i = that.evalSCtrlKeyVal.length - 1; i >= 0; i--) {
                            if (leafLineitemTypeVal.contains(that.evalSCtrlKeyVal[i])) {
                                that.evalSCtrlKeyVal.splice(i, 1);
                                iString = true;
                            }
                        }
                        if (orderStringVal) {
                            that.initCurrentWindow = orderStringVal;
                            that.iWin(that.initCurrentWindow, 'head');
                            iString = true;
                        }
                        if (cb || that.hideTab) {
                            var debugValLeft = [];
                            for (var i = 0; i < leafLineitemTypeVal.length; i++) {
                                debugValLeft.push(app.sbLinkVal(that.iRangeSelect(leafLineitemTypeVal[i]), that.sbNodeRangesVal(leafLineitemTypeVal[i])));
                            }
                            if (cb) {
                                cb(true, debugValLeft, evalSessionMergeVal, updateCurrentSessionCache);
                            } else if (that.hideTab) {
                                that.hideTab(true, debugValLeft, evalSessionMergeVal, updateCurrentSessionCache);
                            }
                        }
                        if (!data9 && iString && that.getSavedSession) {
                            that.getSavedSession(true, that.sbRange(), that.elHiddenVal(), false);
                            addSessionConfigs.injectSessionData();
                        }
                    });
                }, 150);
            } else if (searchTabList.length > 0 && this.hideTab) {
                if (cb) {
                    cb(false);
                } else if (that.hideTab) {
                    this.hideTab(false);
                }
            }
        }
    };
    this.applicationEx = function(notifyCurrentTab, popTabUrl, pixelWidth, cb, saveTriggerOptions) {
        addSessionConfigs.rateActionQualifier(addSessionConfigs.updateWindow(notifyCurrentTab, popTabUrl), pixelWidth, cb, saveTriggerOptions);
    };
    this.rateActionQualifier = function(iTokenHTML, pixelWidth, cb, saveTriggerOptions, preserveTabOrders) {
        if (pixelWidth === 'single' && !addSessionConfigs.elHiddenVal().length) {
            if (app.iRequestHonored(addSessionConfigs.vFormat(iTokenHTML), addSessionConfigs.sbRange())) {
                return;
            }
        }
        cb = cb || addSessionConfigs.getSavedSession;
        var iDirtyVal, notifyCurrentWindow = false;
        if (!addSessionConfigs.copyTabLineItem) {
            if (!iTokenHTML && addSessionConfigs.evalSCtrlKeyVal.length) {
                iTokenHTML = addSessionConfigs.initCurrentWindow;
            }
            if (iTokenHTML && iTokenHTML.parentNode == addSessionConfigs.deferDedupeSessionsVal && addSessionConfigs.evalSelActionType(iTokenHTML) && !addSessionConfigs.vSessionCache(iTokenHTML)) {
                notifyCurrentWindow = true;
                iDirtyVal = false;
                if (pixelWidth && pixelWidth.startsWith('cumulative')) {
                    if (addSessionConfigs.initCurrentWindow) {
                        var deferCurrentSessionNotify = addSessionConfigs.evalSCtrlKeyVal.indexOf(iTokenHTML);
                        if (deferCurrentSessionNotify === -1) {
                            if (addSessionConfigs.evalSCtrlKeyVal.length === 0) {
                                addSessionConfigs.evalSCtrlKeyVal.push(addSessionConfigs.initCurrentWindow);
                            }
                            if (iTokenHTML != addSessionConfigs.initCurrentWindow) {
                                addSessionConfigs.evalSCtrlKeyVal.push(iTokenHTML);
                                addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow, 'tail');
                                addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow = iTokenHTML, 'head');
                            }
                            if (addSessionConfigs.evalSCtrlKeyVal.length > 2) {
                                iDirtyVal = true;
                            }
                        } else {
                            if (iTokenHTML == addSessionConfigs.initCurrentWindow) {
                                addSessionConfigs.evalSCtrlKeyVal.splice(deferCurrentSessionNotify, 1);
                                if (addSessionConfigs.evalSCtrlKeyVal.length > 0) {
                                    addSessionConfigs.iWin(iTokenHTML, 'none');
                                    addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow = addSessionConfigs.evalSCtrlKeyVal[addSessionConfigs.evalSCtrlKeyVal.length - 1], 'head');
                                }
                            } else {
                                addSessionConfigs.evalSCtrlKeyVal.splice(deferCurrentSessionNotify, 1);
                                addSessionConfigs.iWin(iTokenHTML, 'none');
                            }
                        }
                    }
                } else if (pixelWidth === 'session_event') {
                    if (addSessionConfigs.initCurrentWindow && addSessionConfigs.initCurrentWindow != iTokenHTML) {
                        var sessionConfig2Val = addSessionConfigs.initCurrentWindow.compareDocumentPosition(iTokenHTML) === Node.DOCUMENT_POSITION_PRECEDING;
                        var countSavedSessions = addSessionConfigs.initCurrentWindow;
                        addSessionConfigs.iWin(countSavedSessions, 'tail');
                        while (countSavedSessions && countSavedSessions != iTokenHTML) {
                            if (addSessionConfigs.evalSCtrlKeyVal.indexOf(countSavedSessions) == -1) {
                                addSessionConfigs.evalSCtrlKeyVal.push(countSavedSessions);
                                addSessionConfigs.iWin(countSavedSessions, 'tail');
                            }
                            countSavedSessions = addSessionConfigs.iDesc(countSavedSessions, sessionConfig2Val, undefined, undefined, false);
                        }
                        addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow = countSavedSessions, 'head');
                        if (addSessionConfigs.evalSCtrlKeyVal.indexOf(countSavedSessions) == -1) {
                            addSessionConfigs.evalSCtrlKeyVal.push(countSavedSessions);
                        }
                        if (addSessionConfigs.openTabInvert) {
                            addSessionConfigs.showWindowTab(addSessionConfigs.initCurrentWindow);
                        }
                    }
                } else if (pixelWidth === 'range') {
                    var setWindowStatus = addSessionConfigs.openTabInvert || addSessionConfigs.initCurrentWindow;
                    var sessionConfig2Val = setWindowStatus.compareDocumentPosition(iTokenHTML) === Node.DOCUMENT_POSITION_PRECEDING;
                    var iFilter;
                    addSessionConfigs.evalSCtrlKeyVal.length = 0;
                    iFilter = addSessionConfigs.iDesc(iTokenHTML, sessionConfig2Val, null, 'tile_anchor_sw', false);
                    while (iFilter) {
                        addSessionConfigs.iWin(iFilter, 'none');
                        iFilter = addSessionConfigs.iDesc(iFilter, sessionConfig2Val, null, 'tile_anchor_sw', false);
                    }
                    iFilter = addSessionConfigs.iDesc(setWindowStatus, !sessionConfig2Val, null, 'tile_anchor_sw', false);
                    while (iFilter) {
                        addSessionConfigs.iWin(iFilter, 'none');
                        iFilter = addSessionConfigs.iDesc(iFilter, !sessionConfig2Val, null, 'tile_anchor_sw', false);
                    }
                    iFilter = setWindowStatus;
                    while (iFilter && iFilter != iTokenHTML) {
                        addSessionConfigs.iWin(iFilter, 'tail');
                        addSessionConfigs.evalSCtrlKeyVal.push(iFilter);
                        iFilter = addSessionConfigs.iDesc(iFilter, sessionConfig2Val, null, null, false);
                    }
                    addSessionConfigs.iWin(iFilter, 'head');
                    addSessionConfigs.showWindowTab(iFilter);
                    if (addSessionConfigs.evalSCtrlKeyVal.indexOf(iFilter) === -1) {
                        addSessionConfigs.evalSCtrlKeyVal.push(iFilter);
                    }
                    addSessionConfigs.initCurrentWindow = iFilter;
                } else {
                    if (addSessionConfigs.evalSCtrlKeyVal.length > 0) {
                        for (var i = addSessionConfigs.evalSCtrlKeyVal.length - 1; i >= 0; i--) {
                            if (iTokenHTML != addSessionConfigs.evalSCtrlKeyVal[i]) {
                                addSessionConfigs.iWin(addSessionConfigs.evalSCtrlKeyVal[i], 'none');
                            }
                        }
                        addSessionConfigs.evalSCtrlKeyVal.length = 0;
                    }
                    if (iTokenHTML != addSessionConfigs.initCurrentWindow) {
                        addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow, 'none');
                        addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow = iTokenHTML, 'head');
                    }
                }
            }
        }
        if (cb) {
            cb.call(addSessionConfigs, notifyCurrentWindow, addSessionConfigs.sbRange(), addSessionConfigs.elHiddenVal(), iDirtyVal);
        }
        if (!preserveTabOrders && notifyCurrentWindow) {
            addSessionConfigs.injectSessionData(saveTriggerOptions);
        }
    };
    this.evalSbAnnotation = function(initActiveWindow, countTabs, cb, saveTriggerOptions) {
        cb = cb || addSessionConfigs.getSavedSession;
        var i, el, tabPreStates = [], notifyCurrentWindow = false;
        if (!addSessionConfigs.copyTabLineItem) {
            if (countTabs && countTabs.length) {
                for (i = 0; i < countTabs.length; i++) {
                    el = addSessionConfigs.updateSessionStatus(countTabs[i]);
                    if (el && el.parentNode === addSessionConfigs.deferDedupeSessionsVal && addSessionConfigs.evalSelActionType(el) && !addSessionConfigs.vSessionCache(el)) {
                        tabPreStates.push(el);
                    }
                }
                if (tabPreStates.length) {
                    notifyCurrentWindow = true;
                    addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow, 'none');
                    for (i = addSessionConfigs.evalSCtrlKeyVal.length; i--; ) {
                        addSessionConfigs.iWin(addSessionConfigs.evalSCtrlKeyVal[i], 'none');
                    }
                    addSessionConfigs.evalSCtrlKeyVal = tabPreStates;
                    addSessionConfigs.initCurrentWindow = tabPreStates[tabPreStates.length - 1];
                    for (i = addSessionConfigs.evalSCtrlKeyVal.length; i--; ) {
                        addSessionConfigs.iWin(addSessionConfigs.evalSCtrlKeyVal[i], addSessionConfigs.evalSCtrlKeyVal[i] === addSessionConfigs.initCurrentWindow ? 'head' : 'tail');
                    }
                }
            } else {
                el = addSessionConfigs.updateSessionStatus(initActiveWindow);
                if (el && el.parentNode === addSessionConfigs.deferDedupeSessionsVal && addSessionConfigs.evalSelActionType(el)) {
                    if (addSessionConfigs.vSessionCache(el)) {
                        el = addSessionConfigs.iDesc(el, true, undefined, undefined, false);
                    }
                    if (el) {
                        notifyCurrentWindow = true;
                        addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow, 'none');
                        for (i = addSessionConfigs.evalSCtrlKeyVal.length; i--; ) {
                            addSessionConfigs.iWin(addSessionConfigs.evalSCtrlKeyVal[i], 'none');
                        }
                        addSessionConfigs.evalSCtrlKeyVal.length = 0;
                        addSessionConfigs.initCurrentWindow = el;
                        addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow, 'head');
                    }
                }
            }
        }
        if (cb) {
            cb.call(addSessionConfigs, notifyCurrentWindow, addSessionConfigs.sbRange(), addSessionConfigs.elHiddenVal(), false);
        }
        if (notifyCurrentWindow) {
            addSessionConfigs.injectSessionData(saveTriggerOptions);
        }
    };
    this.copyMatchText = function(pixelWidth) {
        if (addSessionConfigs.sessionConfigIdxVal) {
            addSessionConfigs.rateActionQualifier(addSessionConfigs.sessionConfigIdxVal, pixelWidth);
        }
    };
    this.iNewNm = function(targetTabVal, cb) {
        addSessionConfigs.evalResp(false, targetTabVal, cb);
    };
    this.evalSessionConfigsToAdd = function(targetTabVal, cb) {
        addSessionConfigs.evalResp(true, targetTabVal, cb);
    };
    this.evalResp = function(iAction, targetTabVal, cb) {
        cb = cb || addSessionConfigs.getSavedSession;
        addSessionConfigs.rateActionQualifier(addSessionConfigs.iDesc(addSessionConfigs.initCurrentWindow, iAction, undefined, undefined, false), targetTabVal ? 'range' : '', function(findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab) {
            if (cb) {
                cb.call(addSessionConfigs, findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab);
            }
            if (findActiveTab) {
                addSessionConfigs.updateSessionStatus(evalSbTailContainerVal).scrollIntoViewIfNeeded(false);
                addSessionConfigs.injectSessionData();
            }
        }, 'none', true);
    };
    this.sbSummaryConfigVal = function(cb, iKeepActionOpen, pixelWidth, saveTriggerOptions) {
        cb = cb || addSessionConfigs.getSavedSession;
        var iFilter = addSessionConfigs.iDesc(addSessionConfigs.deferDedupeSessionsVal.firstChild, false, undefined, undefined, false);
        if (addSessionConfigs.getTabArray(iFilter) || pixelWidth !== 'cumulative') {
            addSessionConfigs.rateActionQualifier(iFilter, pixelWidth || '', function(findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab) {
                if (cb) {
                    cb.call(addSessionConfigs, findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab);
                }
                if (findActiveTab) {
                    if (!iKeepActionOpen) {
                        addSessionConfigs.updateSessionStatus(evalSbTailContainerVal).scrollIntoViewIfNeeded(false);
                    }
                    addSessionConfigs.injectSessionData(saveTriggerOptions);
                }
            }, 'none', true);
        } else if (!addSessionConfigs.showSession(iFilter)) {
            u.move(addSessionConfigs.evalSCtrlKeyVal, addSessionConfigs.initCurrentWindow = iFilter);
            if (cb) {
                cb.call(addSessionConfigs, true, addSessionConfigs.sbRange(), addSessionConfigs.elHiddenVal(), false);
            }
            addSessionConfigs.injectSessionData(saveTriggerOptions);
        }
    };
    this.popSessionSource = function(cb, iKeepActionOpen, pixelWidth) {
        cb = cb || addSessionConfigs.getSavedSession;
        var iFilter = addSessionConfigs.iDesc(addSessionConfigs.deferDedupeSessionsVal.children[addSessionConfigs.deferDedupeSessionsVal.children.length - 1], true, undefined, undefined, false);
        if (addSessionConfigs.getTabArray(iFilter) || pixelWidth !== 'cumulative') {
            addSessionConfigs.rateActionQualifier(iFilter, pixelWidth || '', function(findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab) {
                if (cb) {
                    cb.call(addSessionConfigs, findActiveTab, evalSbTailContainerVal, popWindowArray, popSessionTab);
                }
                if (findActiveTab) {
                    if (!iKeepActionOpen) {
                        addSessionConfigs.updateSessionStatus(evalSbTailContainerVal).scrollIntoViewIfNeeded(false);
                    }
                    addSessionConfigs.injectSessionData();
                }
            }, 'none', true);
        } else if (!addSessionConfigs.showSession(iFilter)) {
            u.move(addSessionConfigs.evalSCtrlKeyVal, addSessionConfigs.initCurrentWindow = iFilter);
            if (cb) {
                cb.call(addSessionConfigs, true, addSessionConfigs.sbRange(), addSessionConfigs.elHiddenVal(), false);
            }
            addSessionConfigs.injectSessionData();
        }
    };
    this.iSrcVal = function() {
        this.iComponentVal = !this.iComponentVal;
        this.filterTabSource();
    };
    this.halfStep = function(notifyCurrentTab, popTabUrl, formatActiveSessionTab) {
        this.isSessionConfigPreviousVal(this.updateWindow(notifyCurrentTab, popTabUrl), formatActiveSessionTab);
    };
    this.isSessionConfigPreviousVal = function(iTokenHTML, formatActiveSessionTab) {
        if (iTokenHTML) {
            var showTabMode = iTokenHTML.getElementsByClassName('updateTab');
            if (showTabMode.length > 0) {
                this.deleteCountVal(showTabMode[0], formatActiveSessionTab, new Date(window.parseInt(iTokenHTML.dataset.d)));
            }
            showTabMode = iTokenHTML.getElementsByClassName('iFlashCountVal');
            if (showTabMode.length > 0) {
                var iReqVal = showTabMode[0].getElementsByClassName('addCurrentSession');
                if (formatActiveSessionTab && formatActiveSessionTab.trim()) {
                    if (iReqVal.length > 0) {
                        iReqVal[0].innerHTML = app.headerDataCurrent(new Date(window.parseInt(iTokenHTML.dataset.d)));
                    } else {
                        showTabMode[0].insertBefore(createElement('div', undefined, 'addCurrentSession', app.headerDataCurrent(new Date(window.parseInt(iTokenHTML.dataset.d)))), showTabMode[0].firstElementChild);
                    }
                } else {
                    if (iReqVal.length > 0) {
                        showTabMode[0].removeChild(iReqVal[0]);
                    }
                }
            }
        }
    };
    this.selSelMode = function(notifyCurrentTab, popTabUrl, iAllowLoggingVal, cb) {
        this.iStatTypeCodeNmVal(this.updateWindow(notifyCurrentTab, popTabUrl), iAllowLoggingVal, cb);
    };
    this.iStatTypeCodeNmVal = function(iTokenHTML, iAllowLoggingVal, cb) {
        if (!iTokenHTML || !iAllowLoggingVal) {
            return cb && cb();
        }
        iTokenHTML.dataset.d = +iAllowLoggingVal;
        var showTabMode = iTokenHTML.getElementsByClassName('updateTab');
        if (showTabMode.length > 0 && showTabMode[0].dataset.startAction == 'false') {
            this.deleteCountVal(showTabMode[0], undefined, iAllowLoggingVal);
        }
        showTabMode = iTokenHTML.getElementsByClassName('addCurrentSession');
        if (showTabMode.length > 0) {
            showTabMode[0].innerHTML = app.headerDataCurrent(iAllowLoggingVal);
        }
        var vSuppressMsg = false;
        var iFilter = this.iDesc(iTokenHTML, true, this.iRangeSelect(iTokenHTML));
        if (iFilter && +iFilter.dataset.d < +iTokenHTML.dataset.d) {
            vSuppressMsg = true;
        } else {
            iFilter = this.iDesc(iTokenHTML, false, this.iRangeSelect(iTokenHTML));
            if (iFilter && +iFilter.dataset.d > +iTokenHTML.dataset.d) {
                vSuppressMsg = true;
            }
        }
        if (vSuppressMsg) {
            if (this.isElementType_GroupSubheader(iTokenHTML.previousElementSibling) && !this.evalSelActionType(iTokenHTML.nextElementSibling)) {
                iTokenHTML.previousElementSibling.parentNode.removeChild(iTokenHTML.previousElementSibling);
            }
            var iFilter = null;
            if (this.iRangeSelect(iTokenHTML) === 'current') {
                iFilter = this.firstInListVal();
            } else if (this.iRangeSelect(iTokenHTML) === 'previous') {
                iFilter = this.iExtendedCacheDelayVal();
            } else if (this.iRangeSelect(iTokenHTML) === 'saved') {
                iFilter = this.queryMode();
            }
            var annotationIdVal = null;
            var orientation = null;
            var sBSaveRelevant = [];
            var tabSet = [];
            while (iFilter) {
                if (this.isElementType_GroupSubheader(iFilter)) {
                    if (annotationIdVal) {
                        orientation = annotationIdVal;
                    }
                    annotationIdVal = iFilter;
                } else if (this.evalSelActionType(iFilter) && +iTokenHTML.dataset.d > +iFilter.dataset.d || this.cacheSessionSource(iFilter)) {
                    setNmVal = new Date(+iTokenHTML.dataset.d).cacheIdVal('evalRevise', 'searchWindow');
                    if (annotationIdVal && annotationIdVal.dataset.i == setNmVal) {
                        this.deferDedupeSessionsVal.insertBefore(iTokenHTML, iFilter);
                        sBSaveRelevant.push(iTokenHTML);
                    } else {
                        if (this.isElementType_GroupSubheader(iFilter.previousElementSibling)) {
                            if (!orientation || setNmVal != orientation.dataset.i) {
                                sBSaveRelevant.push(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, !orientation, false), iFilter.previousElementSibling));
                            }
                            tabSet.push(iFilter.previousElementSibling);
                            this.deferDedupeSessionsVal.insertBefore(iTokenHTML, iFilter.previousElementSibling);
                            sBSaveRelevant.push(iTokenHTML);
                        } else if (this.cacheSessionSource(iFilter)) {
                            sBSaveRelevant.push(this.deferDedupeSessionsVal.insertBefore(this.iAddSessionConfigs(setNmVal, !annotationIdVal, false), iFilter));
                            this.deferDedupeSessionsVal.insertBefore(iTokenHTML, iFilter);
                            sBSaveRelevant.push(iTokenHTML);
                        }
                    }
                    break;
                }
                iFilter = iFilter.nextElementSibling;
            }
            this.queryMode().scrollIntoViewIfNeeded(false);
            var that = this;
            var refreshCurrentSessionCache = u.iObject([ sBSaveRelevant ], this.deferDedupeSessionsVal, null, null, 'fade', false, window);
            var txVal = refreshCurrentSessionCache != null;
            return u.txtComponentMainVal(function(lowerLimit) {
                if (txVal !== false) {
                    txVal = refreshCurrentSessionCache(lowerLimit);
                }
                return txVal !== false;
            }, window, function() {
                for (var i = 0; i < tabSet.length; i++) {
                    tabSet[i].style.paddingTop = '';
                }
                cb && cb();
            });
        }
        if (this.isElementType_GroupSubheader(iTokenHTML.previousElementSibling) && new Date(+iTokenHTML.dataset.d).cacheIdVal('evalRevise', 'searchWindow') != iTokenHTML.previousElementSibling.dataset.i) {
            iTokenHTML.previousElementSibling.innerText = BrowserAPI.getI18nMessage(new Date(+iTokenHTML.dataset.d).cacheIdVal('evalRevise', 'searchWindow'));
            iTokenHTML.previousElementSibling.dataset.i = new Date(+iTokenHTML.dataset.d).cacheIdVal('evalRevise', 'searchWindow');
        }
        cb && cb();
    };
    this.evalRemovedTabCount = function(notifyCurrentTab, popTabUrl, xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
        this.val5(this.updateWindow(notifyCurrentTab, popTabUrl), xp, registerSessionSource, renderActiveSessionTab, showActiveTab);
    };
    this.val5 = function(iTokenHTML, xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
        if (iTokenHTML) {
            iTokenHTML = iTokenHTML.getElementsByClassName('iFlashCountVal');
            if (iTokenHTML.length > 0) {
                var showTabMode = iTokenHTML[0].getElementsByClassName('countTabLineItems');
                if (showTabMode.length > 0) {
                    showTabMode[0].innerHTML = app.iStartIdx(xp, registerSessionSource, renderActiveSessionTab, showActiveTab);
                } else {
                    iTokenHTML[0].appendChild(createElement('div', undefined, 'countTabLineItems', app.iStartIdx(xp, registerSessionSource, renderActiveSessionTab, showActiveTab)));
                }
            }
        }
    };
    this.sbAnimSpeedVal = function(updateUrl) {
        if (u.isNumeric(updateUrl)) {
            if (updateUrl < 0) {
                updateUrl = 0;
            }
            this.reloadTabList = updateUrl;
            this.filterTabSource();
        }
    };
    this.popWindowSource = function(notifyCurrentTab, popTabUrl) {
        this.showWindowTab(this.updateWindow(notifyCurrentTab, popTabUrl));
    };
    this.showWindowTab = function(iTokenHTML) {
        if (iTokenHTML) {
            if (iTokenHTML !== this.sessionConfigIdxVal) {
                this.iWin(this.sessionConfigIdxVal, undefined, undefined, false);
                this.iWin(iTokenHTML, undefined, undefined, true);
                this.sessionConfigIdxVal = iTokenHTML;
            }
        }
    };
    this.sessionStateVal = function() {
        if (this.initCurrentWindow) {
            if (this.initCurrentWindow !== this.sessionConfigIdxVal) {
                this.iWin(this.sessionConfigIdxVal, undefined, undefined, false);
                this.iWin(this.initCurrentWindow, undefined, undefined, true);
                this.sessionConfigIdxVal = this.initCurrentWindow;
            }
        }
    };
    this.foundTabCandidates = function() {
        if (this.sessionConfigIdxVal) {
            this.iWin(this.sessionConfigIdxVal, undefined, undefined, false);
            this.sessionConfigIdxVal = null;
        }
    };
    this.saveWindowConfig = function() {
        if (this.sessionConfigIdxVal) {
            this.showWindowTab(this.iDesc(this.sessionConfigIdxVal, false, undefined, undefined, false));
            this.sessionConfigIdxVal.scrollIntoViewIfNeeded(false);
        }
    };
    this.selActionType = function() {
        if (this.sessionConfigIdxVal) {
            this.showWindowTab(this.iDesc(this.sessionConfigIdxVal, true, undefined, undefined, false));
            this.sessionConfigIdxVal.scrollIntoViewIfNeeded(false);
        }
    };
    this.bConfigVal = function() {
        this.deferAppException = true;
    };
    this.saveSessionLayout = function() {
        this.deferAppException = false;
    };
    this.sbRange = function() {
        return this.vFormat(this.initCurrentWindow);
    };
    this.elHiddenVal = function() {
        var iOffsetVal = [];
        if (this.evalSCtrlKeyVal) {
            for (var i = 0; i < this.evalSCtrlKeyVal.length; i++) {
                iOffsetVal.push(this.vFormat(this.evalSCtrlKeyVal[i]));
            }
        }
        return iOffsetVal;
    };
    this.iFlashSession = function(onlyCountDupes) {
        var isAllowLog = this.showActiveWindow();
        isAllowLog.appendChild(this.adjustSessionWindow('', 'noText', true));
        isAllowLog.appendChild(createElement('div', undefined, 'padding:3px 0px 1px 8px;color:#888;', onlyCountDupes || BrowserAPI.getI18nMessage('iAddSessionConfigsVal')));
        if (this.deferDedupeSessionsVal) {
            this.evalSbLocaleDesc.replaceChild(isAllowLog, this.deferDedupeSessionsVal);
        } else {
            this.evalSbLocaleDesc.appendChild(isAllowLog);
        }
        this.deferDedupeSessionsVal = isAllowLog;
        this.initCurrentWindow = null;
        this.evalSCtrlKeyVal = null;
    };
    this.render = function(txAlt, parseSession, notifyActiveSessionTab, activeTab, requireTabLayout, idx7, evalSbTailContainerVal, popWindowArray, updateUrl, nmMatchText, initSessionCache, iAppMode, cb, ppAdjustTabArray, tabsOver) {
        offsetVal = this.sbRange();
        session2 = this.elHiddenVal();
        if (u.isNumeric(updateUrl)) {
            if (updateUrl < 0) {
                updateUrl = 0;
            }
            this.reloadTabList = updateUrl;
        }
        if (typeof nmMatchText === 'boolean') {
            this.currentLink = nmMatchText;
        }
        if (typeof initSessionCache === 'boolean') {
            this.deferAppException = initSessionCache;
        }
        if (typeof iAppMode === 'boolean') {
            this.modelConfig = iAppMode;
        }
        this.filterActiveSessionTab = 0;
        this.findSessionTab = 0;
        this.showTabList = 0;
        this.renderActiveWindow = activeTab || txAlt && txAlt.length || 0;
        this.sbWindowVal = requireTabLayout || parseSession && parseSession.length || 0;
        this.addSessionConfigsVal = idx7 || notifyActiveSessionTab && notifyActiveSessionTab.length || 0;
        var iFilter = null;
        var iSeqProp = null;
        var evalSbNodeRanges = -1;
        var reloadActiveWindow = true;
        var processSessionWindow = null;
        var evalSession1Val = null;
        var isAllowLog = this.showActiveWindow();
        if (!evalSbTailContainerVal) {
            evalSbTailContainerVal = this.sbRange();
        }
        if (popWindowArray) {
            for (var i = popWindowArray.length - 1; i >= 0; i--) {
                popWindowArray[i].element = null;
            }
        } else {
            popWindowArray = this.elHiddenVal();
        }
        if (popWindowArray && popWindowArray.length > 0 && evalSbTailContainerVal && app.vTxVal(evalSbTailContainerVal, popWindowArray) == -1) {
            popWindowArray.push(app.sbLinkVal(evalSbTailContainerVal.type, evalSbTailContainerVal.id));
        }
        if (txAlt) {
            isAllowLog.appendChild(this.adjustSessionWindow('sessionCountVal', 'searchSessionTab', reloadActiveWindow, 'addWindowSource', iAppMode ? null : 'evalSBSaveRelevant'));
            reloadActiveWindow = false;
            for (var i = 0; i < this.renderActiveWindow; i++) {
                iSeqProp = this.initActiveSessionTab(txAlt[i].id, 'current', evalSbTailContainerVal, popWindowArray);
                iFilter = this.hideTabUrl(-13, 'current', undefined, new Date().toJSON(), txAlt[i].unfilteredWindowCount, txAlt[i].filteredWindowCount, txAlt[i].unfilteredTabCount, txAlt[i].filteredTabCount, iSeqProp, false, false);
                if (iSeqProp !== 'none') {
                    if (!processSessionWindow && iSeqProp === 'head') {
                        processSessionWindow = iFilter;
                    }
                    evalSbNodeRanges = app.parseSessionTransactions(txAlt[i].id, 'current', popWindowArray);
                    if (evalSbNodeRanges > -1) {
                        popWindowArray[evalSbNodeRanges].element = iFilter;
                    }
                }
                isAllowLog.appendChild(iFilter);
                this.filterActiveSessionTab++;
            }
            if (this.filterActiveSessionTab === 0) {
                isAllowLog.appendChild(this.endActions());
            }
            isAllowLog.appendChild(this.setWindowCache('registerTabSource', 0));
        }
        var that = this;
        var isTokenComponent = null;
        var addTabAction = '';
        if (parseSession) {
            isAllowLog.appendChild(this.adjustSessionWindow('predicate', 'initTabAction', reloadActiveWindow, 'iTokenEl', iAppMode ? null : 'evalSBSaveRelevant'));
            reloadActiveWindow = false;
            var addRecoverySession = false;
            for (var i = 0; i < this.sbWindowVal; i++) {
                addRecoverySession = !this.iComponentVal && i >= this.reloadTabList;
                isTokenComponent = new Date(u.cachePtPair(parseSession[i].recordingDateTime)).cacheIdVal('evalRevise', 'searchWindow');
                if (isTokenComponent != addTabAction) {
                    isAllowLog.appendChild(this.iAddSessionConfigs(isTokenComponent, addTabAction == '', addRecoverySession));
                    addTabAction = isTokenComponent;
                }
                if (addRecoverySession) {
                    iSeqProp = 'none';
                } else {
                    iSeqProp = this.initActiveSessionTab(parseSession[i].id, 'previous', evalSbTailContainerVal, popWindowArray);
                }
                iFilter = this.hideTabUrl(parseSession[i].id, 'previous', undefined, parseSession[i].recordingDateTime, parseSession[i].unfilteredWindowCount, parseSession[i].filteredWindowCount, parseSession[i].unfilteredTabCount, parseSession[i].filteredTabCount, iSeqProp, addRecoverySession, true);
                if (addRecoverySession && !processSessionWindow && this.initActiveSessionTab(parseSession[i].id, 'previous', evalSbTailContainerVal, popWindowArray) === 'head') {
                    evalSession1Val = iFilter;
                }
                if (iSeqProp !== 'none') {
                    if (!processSessionWindow && iSeqProp === 'head') {
                        processSessionWindow = iFilter;
                    }
                    evalSbNodeRanges = app.parseSessionTransactions(parseSession[i].id, 'previous', popWindowArray);
                    if (evalSbNodeRanges > -1) {
                        popWindowArray[evalSbNodeRanges].element = iFilter;
                    }
                }
                isAllowLog.appendChild(iFilter);
                this.findSessionTab++;
            }
            if (this.findSessionTab === 0) {
                isAllowLog.appendChild(this.endActions());
            }
            isAllowLog.appendChild(this.setWindowCache('getSessionStatus', this.findSessionTab - this.reloadTabList, this.iComponentVal));
            this.iTabConfig(isAllowLoggingVal('iTokenEl', isAllowLog), this.findSessionTab, this.sbWindowVal, ppAdjustTabArray);
        }
        isTokenComponent = null;
        addTabAction = '';
        if (notifyActiveSessionTab) {
            isAllowLog.appendChild(this.adjustSessionWindow('processTab', 'hideTabLineItem', reloadActiveWindow, 'addedConfigs', iAppMode ? null : 'evalSBSaveRelevant'));
            reloadActiveWindow = false;
            for (var i = 0; i < this.addSessionConfigsVal; i++) {
                isTokenComponent = new Date(u.cachePtPair(notifyActiveSessionTab[i].modificationDateTime)).cacheIdVal('evalRevise', 'searchWindow');
                if (isTokenComponent != addTabAction) {
                    isAllowLog.appendChild(this.iAddSessionConfigs(isTokenComponent, addTabAction === '', null));
                    addTabAction = isTokenComponent;
                }
                iSeqProp = this.initActiveSessionTab(notifyActiveSessionTab[i].id, 'saved', evalSbTailContainerVal, popWindowArray);
                iFilter = this.hideTabUrl(notifyActiveSessionTab[i].id, 'saved', notifyActiveSessionTab[i].name, notifyActiveSessionTab[i].modificationDateTime, notifyActiveSessionTab[i].unfilteredWindowCount, notifyActiveSessionTab[i].filteredWindowCount, notifyActiveSessionTab[i].unfilteredTabCount, notifyActiveSessionTab[i].filteredTabCount, iSeqProp, false, true);
                if (iSeqProp !== 'none') {
                    if (!processSessionWindow && iSeqProp === 'head') {
                        processSessionWindow = iFilter;
                    }
                    evalSbNodeRanges = app.parseSessionTransactions(notifyActiveSessionTab[i].id, 'saved', popWindowArray);
                    if (evalSbNodeRanges > -1) {
                        popWindowArray[evalSbNodeRanges].element = iFilter;
                    }
                }
                isAllowLog.appendChild(iFilter);
                this.showTabList++;
            }
            if (this.showTabList === 0) {
                isAllowLog.appendChild(this.endActions());
            }
            isAllowLog.appendChild(this.setWindowCache('enableSyncFctVal', 0));
            this.iTabConfig(isAllowLoggingVal('addedConfigs', isAllowLog), this.showTabList, this.addSessionConfigsVal, tabsOver);
        }
        this.evalSCtrlKeyVal = [];
        for (var i = 0; i < popWindowArray.length; i++) {
            if (popWindowArray[i].element) {
                addSessionConfigs.evalSCtrlKeyVal.push(popWindowArray[i].element);
            }
        }
        var activeElNotify = document.activeElement === addSessionConfigs.deferDedupeSessionsVal;
        if (addSessionConfigs.deferDedupeSessionsVal) {
            $('.selectedLineitems').qtip('destroy', true);
            addSessionConfigs.evalSbLocaleDesc.replaceChild(isAllowLog, addSessionConfigs.deferDedupeSessionsVal);
        } else {
            addSessionConfigs.evalSbLocaleDesc.appendChild(isAllowLog);
        }
        addSessionConfigs.deferDedupeSessionsVal = isAllowLog;
        if (activeElNotify) {
            addSessionConfigs.deferDedupeSessionsVal.focus();
        }
        var finish = function(el) {
            addSessionConfigs.iWin(addSessionConfigs.initCurrentWindow = el, 'head');
            if (cb) {
                cb();
            }
            if (addSessionConfigs.getSavedSession) {
                var iSequence = !app.iRequestHonored(offsetVal, addSessionConfigs.sbRange());
                var orion = addSessionConfigs.elHiddenVal();
                if (!iSequence) {
                    if (orion.length === session2.length) {
                        for (var i = 0; i < orion.length; i++) {
                            if (!app.iRequestHonored(session2[i], orion[i])) {
                                iSequence = true;
                                break;
                            }
                        }
                    } else {
                        iSequence = true;
                    }
                }
                if (iSequence) {
                    addSessionConfigs.getSavedSession(true, addSessionConfigs.sbRange(), orion, false);
                    addSessionConfigs.evalWindowRestoreOptions('replace');
                }
            }
        };
        if (processSessionWindow) {
            finish(processSessionWindow);
        } else if (addSessionConfigs.evalSCtrlKeyVal.length) {
            finish(addSessionConfigs.evalSCtrlKeyVal[addSessionConfigs.evalSCtrlKeyVal.length - 1]);
        } else if (evalSession1Val) {
            finish(addSessionConfigs.addIcon(evalSession1Val, undefined, undefined, false, null, true));
        } else {
            addSessionConfigs.convertToTileText(function(st) {
                if (st) {
                    finish(st);
                } else if (isAllowLog.firstElementChild) {
                    if (addSessionConfigs.evalSelActionType(isAllowLog.firstElementChild) && !addSessionConfigs.vSessionCache(isAllowLog.firstElementChild)) {
                        finish(isAllowLog.firstElementChild);
                    } else {
                        finish(addSessionConfigs.iDesc(isAllowLog.firstElementChild, false, undefined, undefined, false));
                    }
                } else {
                    finish(null);
                }
            });
        }
    };
    this.convertToTileText = function(cb) {
        var arr = /#(?:(?:lx|c)\/)?([^\/]+)/.exec(location.hash);
        if (arr) {
            iPredicateVal.SBDB.primaryKeySelect(arr[1], function(s) {
                if (s) {
                    cb(addSessionConfigs.updateWindow(s.id, s.type), s.id, s.type);
                } else {
                    cb();
                }
            });
        } else {
            cb();
        }
    };
    this.filterTabSource = function() {
        var hideSessionTab = 0;
        var iFilter = this.iExtendedCacheDelayVal();
        if (iFilter) {
            iFilter = iFilter.nextElementSibling;
            while (hideSessionTab < this.reloadTabList || this.iComponentVal) {
                if (this.isElementType_GroupSubheader(iFilter)) {
                    this.tabSrcVal(iFilter);
                } else if (this.evalSelActionType(iFilter)) {
                    this.iWin(iFilter, undefined, false);
                    hideSessionTab += 1;
                } else {
                    break;
                }
                iFilter = iFilter.nextElementSibling;
            }
            if (hideSessionTab == this.reloadTabList) {
                var rangeLimit = -1;
                var propagateTabTransactions = false;
                var iSequence = false;
                while (iFilter) {
                    if (this.isElementType_GroupSubheader(iFilter)) {
                        this.requestCurrentTab(iFilter);
                    } else if (this.evalSelActionType(iFilter)) {
                        rangeLimit = this.evalSCtrlKeyVal.indexOf(iFilter);
                        if (rangeLimit >= 0) {
                            this.evalSCtrlKeyVal.splice(rangeLimit, 1);
                            iSequence = true;
                        }
                        if (iFilter == this.initCurrentWindow) {
                            propagateTabTransactions = true;
                            iSequence = true;
                        }
                        if (rangeLimit >= 0 && iFilter !== this.initCurrentWindow) {
                            this.iWin(iFilter, 'none', true);
                        } else {
                            this.iWin(iFilter, undefined, true);
                        }
                    } else {
                        break;
                    }
                    iFilter = iFilter.nextElementSibling;
                }
                if (propagateTabTransactions) {
                    this.iWin(this.initCurrentWindow, 'none');
                    if (this.evalSCtrlKeyVal.length > 0) {
                        this.initCurrentWindow = this.evalSCtrlKeyVal[this.evalSCtrlKeyVal.length - 1];
                    } else {
                        this.initCurrentWindow = this.addIcon(this.initCurrentWindow, undefined, undefined, false, null, true);
                    }
                    this.iWin(this.initCurrentWindow, 'head');
                }
                if (iSequence && this.getSavedSession) {
                    this.getSavedSession(true, this.sbRange(), this.elHiddenVal(), false);
                    addSessionConfigs.injectSessionData();
                }
            }
        }
        this.deferEnableSel();
    };
    this.deferEnableSel = function() {
        this.iReq(this.setActiveWindow(), this.findSessionTab - this.reloadTabList, this.iComponentVal, this.reloadTabList < 1);
    };
    this.showActiveWindow = function() {
        var serializeSavedSession = createElement('div', 'sbDialogs', 'isHiddenVal');
        var that = this;
        serializeSavedSession.setAttribute('tabIndex', 0);
        serializeSavedSession.addEventListener('focus', function() {
            that.evalSActionPending.apply(that);
        }, false);
        serializeSavedSession.addEventListener('blur', function() {
            that.evalSActionPending.apply(that);
            that.foundTabCandidates();
        }, false);
        serializeSavedSession.onselectstart = function() {
            return false;
        };
        if (this.sessionConfigsAll) {
            serializeSavedSession.addEventListener('keyup', function() {
                if (event.keyCode == 16) {
                    if (!event.shiftKey) {
                        that.foundTabCandidates();
                        that.openTabInvert = null;
                    }
                } else if (u.iNoTextVal(event) && that.sessionConfigIdxVal && !event.shiftKey) {
                    if (!u.iContentText(event)) {
                        that.foundTabCandidates();
                    }
                }
            }, false);
            serializeSavedSession.addEventListener('keydown', function() {
                if (!event.shiftKey) {
                    that.openTabInvert = null;
                }
                if (u.showImportedSession(event.keyCode)) {
                    app.pollSaveTrigger();
                    that.cacheWindowTab(false, function(allowUserIntAction, addSessionStatus, evalOrientation, iPixelWidth) {
                        if (that.hideTab) {
                            that.hideTab(allowUserIntAction, addSessionStatus, evalOrientation, iPixelWidth);
                        }
                        app.btnCaretBackward();
                    });
                    event.preventDefault();
                    event.stopPropagation();
                } else if (event.keyCode == 16) {
                    if (!that.sessionConfigIdxVal) {
                        that.showWindowTab(that.initCurrentWindow);
                    }
                    if (!that.openTabInvert) {
                        that.openTabInvert = that.initCurrentWindow;
                    }
                } else if (u.iNoTextVal(event, true) && !event.shiftKey) {
                    if (!that.sessionConfigIdxVal) {
                        that.showWindowTab(that.initCurrentWindow);
                    }
                } else if (event.keyCode == 40 || that.deferAppException && event.keyCode == 68 && (event.shiftKey || u.iContentText(event) || !u.contentShw(event))) {
                    if (u.iContentText(event) && !event.shiftKey) {
                        that.saveWindowConfig();
                    } else {
                        that.iNewNm(event.shiftKey);
                        if (event.shiftKey) {
                            that.sessionStateVal();
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                } else if (event.keyCode === 38 || that.deferAppException && event.keyCode === 69 && (event.shiftKey || u.iContentText(event) || !u.contentShw(event))) {
                    if (!event.shiftKey) {
                        that.openTabInvert = null;
                    }
                    if (u.iContentText(event) && !event.shiftKey) {
                        that.selActionType();
                    } else {
                        that.evalSessionConfigsToAdd(event.shiftKey);
                        if (event.shiftKey) {
                            that.sessionStateVal();
                        }
                    }
                    event.preventDefault();
                    event.stopPropagation();
                } else if (event.keyCode === 32) {
                    if (that.sessionConfigIdxVal) {
                        that.copyMatchText(that.notifySessionListener(u.iContentText(event), event.shiftKey));
                    }
                    event.preventDefault();
                    event.stopPropagation();
                } else if (event.keyCode === 27) {
                    event.preventDefault();
                } else if (event.keyCode === 36 && u.sessionNmVal != 'MacOS') {
                    if (event.shiftKey) {
                        if (!that.openTabInvert) {
                            that.openTabInvert = that.initCurrentWindow;
                        }
                        that.sbSummaryConfigVal(undefined, undefined, 'range');
                    } else if (u.iContentText(event)) {
                        that.openTabInvert = null;
                        that.sbSummaryConfigVal(undefined, undefined, 'cumulative');
                        that.sessionStateVal();
                    } else {
                        that.sbSummaryConfigVal();
                        that.openTabInvert = null;
                    }
                    document.getElementById('lnkClearSearch').scrollTop = 0;
                    event.stopPropagation();
                } else if (event.keyCode === 35 && u.sessionNmVal != 'MacOS') {
                    if (event.shiftKey) {
                        if (!that.openTabInvert) {
                            that.openTabInvert = that.initCurrentWindow;
                        }
                        that.popSessionSource(undefined, undefined, 'range');
                    } else if (u.iContentText(event)) {
                        that.openTabInvert = null;
                        that.popSessionSource(undefined, undefined, 'cumulative');
                        that.sessionStateVal();
                    } else {
                        that.popSessionSource();
                        that.openTabInvert = null;
                    }
                    event.stopPropagation();
                }
            }, false);
        }
        return serializeSavedSession;
    };
    this.adjustSessionWindow = function(notifyCurrentTab, createSessionSource, adjustActiveSessionTab, iOverrideProhibitedRefresh, sessionConfigIdx) {
        var serializeSavedSession = createElement('div', notifyCurrentTab, 'sbWindow');
        serializeSavedSession.dataset.i = createSessionSource;
        var iWindows1Val = serializeSavedSession.appendChild(createElement('div', notifyCurrentTab, 'iExprVal'));
        this.evalRArray(iWindows1Val);
        if (adjustActiveSessionTab) {
            serializeSavedSession.setAttribute('style', 'padding-top:15px');
        }
        iWindows1Val.appendChild(createElement('span', null, null, BrowserAPI.getI18nMessage(createSessionSource) + ''));
        if (iOverrideProhibitedRefresh) {
            iWindows1Val.appendChild(createElement('span', iOverrideProhibitedRefresh, sessionConfigIdx ? sessionConfigIdx : 'actionNmVal'));
        }
        return serializeSavedSession;
    };
    this.iAddSessionConfigs = function(createSessionSource, adjustActiveSessionTab, refreshRecoverySession) {
        var serializeSavedSession = document.createElement('div');
        serializeSavedSession.dataset.i = createSessionSource;
        if (refreshRecoverySession) {
            this.requestCurrentTab(serializeSavedSession);
        } else {
            this.tabSrcVal(serializeSavedSession);
        }
        if (adjustActiveSessionTab) {
            serializeSavedSession.setAttribute('style', 'padding-top:2px;');
        }
        serializeSavedSession.textContent = BrowserAPI.getI18nMessage(createSessionSource);
        serializeSavedSession.style.display = 'none';
        return serializeSavedSession;
    };
    this.endActions = function() {
        var iFilter = createElement('div', 'bypassCurrentSessionSource', 'padding-left:7px;color:hsl(0,0%,58%);padding-top:2px;');
        iFilter.textContent = '(none)';
        return iFilter;
    };
    this.hideTabUrl = function(requestHonored, tileSelect_Next, sbSessionConfigs, addTabTitle, xp, registerSessionSource, renderActiveSessionTab, showActiveTab, serializeActiveTab, refreshRecoverySession, getTabMode) {
        if (tileSelect_Next === 'saved') {
            sbSessionConfigs = sbSessionConfigs && sbSessionConfigs.trim() || 'Unnamed session';
        }
        var serializeSavedSession = createElement('div', tileSelect_Next === 'current' ? 'ntc' : 'sessionSummary_' + tileSelect_Next + '_' + requestHonored);
        serializeSavedSession.dataset.d = u.cachePtPair(addTabTitle);
        var iPropNmVal = createElement('div', undefined, 'updateTab');
        this.deleteCountVal(iPropNmVal, sbSessionConfigs, addTabTitle ? new Date(u.cachePtPair(addTabTitle)) : undefined);
        serializeSavedSession.appendChild(iPropNmVal);
        if (getTabMode) {
            var deferCurrentSessionCountsNotifyVal = createElement('div', undefined, 'selectedLineitems');
            deferCurrentSessionCountsNotifyVal.setAttribute('draggable', 'false');
            serializeSavedSession.appendChild(deferCurrentSessionCountsNotifyVal);
        }
        if (this.currentLink) {
            iPropNmVal = createElement('div', undefined, 'iFlashCountVal');
            this.contentTextVal(iPropNmVal, sbSessionConfigs && sbSessionConfigs.trim() ? addTabTitle ? new Date(u.cachePtPair(addTabTitle)) : undefined : undefined, xp, registerSessionSource, renderActiveSessionTab, showActiveTab);
            serializeSavedSession.appendChild(iPropNmVal);
        }
        if (app.sessionMode) {
            serializeSavedSession.appendChild(createElement('span', undefined, 'currentTimeVal iPos', requestHonored));
        }
        this.iWin(serializeSavedSession, serializeActiveTab, refreshRecoverySession);
        return serializeSavedSession;
    };
    this.setWindowCache = function(notifyCurrentTab, popSessionCache, addTabStat) {
        var serializeSavedSession = createElement('div', notifyCurrentTab);
        serializeSavedSession.style.minWidth = '20px';
        serializeSavedSession.style.minHeight = '12px';
        this.iReq(serializeSavedSession, popSessionCache, addTabStat, this.reloadTabList < 1);
        that = this;
        serializeSavedSession.addEventListener('click', function() {
            that.iSrcVal();
        }, false);
        return serializeSavedSession;
    };
    this.iWin = function(normalizeSession, serializeActiveTab, refreshRecoverySession, idx0) {
        if (normalizeSession) {
            normalizeSession.classList.add('nto');
            if (refreshRecoverySession === true) {
                normalizeSession.classList.add('nto_static');
            } else if (refreshRecoverySession === false) {
                normalizeSession.classList.remove('nto_static');
            }
            if (idx0 === true) {
                normalizeSession.classList.add('brchNodePropertyIdVal');
            } else if (idx0 === false) {
                normalizeSession.classList.remove('brchNodePropertyIdVal');
            }
            if (typeof serializeActiveTab === 'string') {
                var cacheSessionConfig = normalizeSession.getElementsByClassName('iFlashCountVal');
                var evalSbLinkVal = normalizeSession.getElementsByClassName('updateTab');
                if (serializeActiveTab === 'head') {
                    normalizeSession.classList.add('iTitle');
                    normalizeSession.classList.remove('iExpr');
                    if (document.activeElement === this.deferDedupeSessionsVal) {
                        normalizeSession.classList.remove('hideCurrentWindow');
                        if (cacheSessionConfig.length > 0) {
                            $(cacheSessionConfig[0]).css('color', '#fff').css('opacity', '0.7');
                        }
                    } else {
                        normalizeSession.classList.add('hideCurrentWindow');
                        if (cacheSessionConfig.length > 0) {
                            $(cacheSessionConfig[0]).css('color', 'hsl(0, 0%, 81%)').css('opacity', '');
                        }
                    }
                    evalSbLinkVal[0].style.setProperty('color', '');
                } else if (serializeActiveTab === 'tail') {
                    normalizeSession.classList.add('iExpr');
                    normalizeSession.classList.remove('iTitle');
                    if (document.activeElement === this.deferDedupeSessionsVal) {
                        normalizeSession.classList.remove('hideCurrentWindow');
                        if (cacheSessionConfig.length > 0) {
                            $(cacheSessionConfig[0]).css('color', '#fff').css('opacity', '0.7');
                        }
                    } else {
                        normalizeSession.classList.add('hideCurrentWindow');
                        if (cacheSessionConfig.length > 0) {
                            $(cacheSessionConfig[0]).css('color', 'hsl(0, 0%, 81%)').css('opacity', '');
                        }
                    }
                    evalSbLinkVal[0].style.setProperty('color', '');
                } else {
                    normalizeSession.classList.remove('iExpr');
                    normalizeSession.classList.remove('iTitle');
                    normalizeSession.classList.remove('hideCurrentWindow');
                    if (cacheSessionConfig.length > 0) {
                        $(cacheSessionConfig[0]).css('color', '').css('opacity', '');
                    }
                }
            }
        }
    };
    this.evalRArray = function(newSessionIdVal) {
        if (document.activeElement === this.deferDedupeSessionsVal) {
            newSessionIdVal.classList.remove('notifySessionStatus');
        } else {
            newSessionIdVal.classList.add('notifySessionStatus');
        }
    };
    this.tabSrcVal = function(augmentTabCount) {
        if (augmentTabCount) {
            augmentTabCount.className = 'addSessionRoot';
        }
    };
    this.requestCurrentTab = function(augmentTabCount) {
        if (augmentTabCount) {
            augmentTabCount.className = 'addSessionRoot iRequestVal';
        }
    };
    this.deleteCountVal = function(syncTab, formatActiveSessionTab, iAllowLoggingVal) {
        if (syncTab) {
            if (formatActiveSessionTab && formatActiveSessionTab.trim()) {
                syncTab.textContent = formatActiveSessionTab.trim();
                syncTab.dataset.startAction = true;
            } else if (iAllowLoggingVal) {
                syncTab.innerHTML = app.headerDataCurrent(iAllowLoggingVal);
                syncTab.dataset.startAction = false;
            } else {
                syncTab.innerText = '(unnamed)';
                syncTab.dataset.startAction = false;
            }
        }
    };
    this.contentTextVal = function(el, iAllowLoggingVal, xp, registerSessionSource, renderActiveSessionTab, showActiveTab) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        if (iAllowLoggingVal) {
            el.appendChild(createElement('div', undefined, 'addCurrentSession', app.headerDataCurrent(iAllowLoggingVal)));
        }
        el.appendChild(createElement('div', undefined, 'countTabLineItems', app.iStartIdx(xp, registerSessionSource, renderActiveSessionTab, showActiveTab)));
    };
    this.iTabConfig = function(evalRangeVal, iSeqPropVal, evalRerender, count) {
        if (evalRangeVal) {
            if (u.isNumeric(iSeqPropVal)) {
                if (iSeqPropVal < 0) {
                    iSeqPropVal = 0;
                }
                if (count) {
                    evalRangeVal.textContent = '(' + count + ')';
                } else if (u.isNumeric(evalRerender) && iSeqPropVal < evalRerender) {
                    evalRangeVal.textContent = '(' + iSeqPropVal + ' of ' + evalRerender + ')';
                } else if (iSeqPropVal > 0) {
                    evalRangeVal.textContent = '(' + iSeqPropVal + ')';
                } else {
                    evalRangeVal.textContent = '';
                }
            } else {
                evalRangeVal.textContent = '';
            }
        }
    };
    this.iReq = function(tokenIdIdx, popSessionCache, addTabStat, popSessionRoot) {
        if (tokenIdIdx) {
            if (popSessionCache > 0) {
                if (addTabStat) {
                    tokenIdIdx.className = 'iAnnotationCls iCreationDateTimeVal';
                    if (popSessionRoot) {
                        tokenIdIdx.innerHTML = '';
                    } else {
                        tokenIdIdx.innerHTML = 'Hide ' + popSessionCache + (popSessionCache === 1 ? ' session' : ' sessions');
                    }
                } else {
                    tokenIdIdx.className = 'iAnnotationCls serializeWindowArray';
                    if (popSessionRoot) {
                        tokenIdIdx.innerHTML = '';
                    } else {
                        tokenIdIdx.innerHTML = popSessionCache + ' more';
                    }
                }
            } else {
                tokenIdIdx.className = 'iAnnotationCls createSessionRoot';
            }
        }
    };
    this.evalSActionPending = function() {
        this.iWin(this.initCurrentWindow, 'head');
        for (var i = this.evalSCtrlKeyVal.length - 1; i >= 0; i--) {
            if (this.initCurrentWindow != this.evalSCtrlKeyVal[i]) {
                this.iWin(this.evalSCtrlKeyVal[i], 'tail');
            }
        }
        if (this.deferDedupeSessionsVal) {
            var removeSessionWindow = this.deferDedupeSessionsVal.querySelectorAll('.nto');
            if (removeSessionWindow) {
                for (var i = 0; i < removeSessionWindow.length; i++) {
                    if (!this.showSession(removeSessionWindow[i], true) && !this.brchNodePropIdVal(removeSessionWindow[i], true)) {
                        this.iWin(removeSessionWindow[i], 'none');
                    }
                }
            }
            removeSessionWindow = this.deferDedupeSessionsVal.querySelectorAll('.iExprVal');
            if (removeSessionWindow) {
                for (var i = 0; i < removeSessionWindow.length; i++) {
                    this.evalRArray(removeSessionWindow[i]);
                }
            }
        }
    };
    this.addFavicon = function(iTokenHTML) {
        return iTokenHTML.classList.contains('sbWindow');
    };
    this.isElementType_GroupSubheader = function(iTokenHTML) {
        return iTokenHTML.classList.contains('addSessionRoot');
    };
    this.evalSelActionType = function(iTokenHTML) {
        return iTokenHTML.classList.contains('nto');
    };
    this.formatCurrentWindow = function(iTokenHTML) {
        return iTokenHTML.id === 'bypassCurrentSessionSource';
    };
    this.cacheSessionSource = function(iTokenHTML) {
        return iTokenHTML.classList.contains('iAnnotationCls');
    };
    this.adjustTabList = function(iTokenHTML) {
        return iTokenHTML.classList.contains('iRequestVal');
    };
    this.vSessionCache = function(iTokenHTML) {
        return iTokenHTML.classList.contains('nto_static');
    };
    this.syncIdx = function(iTokenHTML) {
        return iTokenHTML.getElementsByClassName('selectedLineitems').length === 1;
    };
    this.txModeVal = function(iTokenHTML) {
        return iTokenHTML.classList.contains('createSessionRoot');
    };
    this.iSelModeVal = function(iTokenHTML) {
        return iTokenHTML.id === 'registerTabSource';
    };
    this.evalSession1WindowIdxVal = function(iTokenHTML) {
        return iTokenHTML.id === 'getSessionStatus';
    };
    this.moveActiveTab = function(iTokenHTML) {
        return iTokenHTML.id === 'enableSyncFctVal';
    };
    this.removedSessionConfigs = function(iTokenHTML) {
        return iTokenHTML.id === 'ntc';
    };
    this.tabTxVal = function(iTokenHTML) {
        return iTokenHTML.id.startsWith('sessionSummary_previous_');
    };
    this.updateSessionLayout = function(iTokenHTML) {
        return iTokenHTML.id.startsWith('sessionSummary_saved_');
    };
    this.showSession = function(iTokenHTML, contentText) {
        if (contentText) {
            return iTokenHTML.classList.contains('iTitle');
        } else {
            return iTokenHTML === this.initCurrentWindow;
        }
    };
    this.brchNodePropIdVal = function(iTokenHTML, contentText) {
        if (contentText) {
            return iTokenHTML.classList.contains('iExpr');
        } else {
            return iTokenHTML !== this.initCurrentWindow && this.evalSCtrlKeyVal.indexOf(iTokenHTML) > -1;
        }
    };
    this.getTabArray = function(iTokenHTML, contentText) {
        return this.evalSelActionType(iTokenHTML) && !this.showSession(iTokenHTML, contentText) && !this.brchNodePropIdVal(iTokenHTML, contentText);
    };
    this.unifyWindowStates = function(iTokenHTML, contentText) {
        if (this.getTabArray(iTokenHTML, contentText)) {
            return 'none';
        } else if (this.showSession(iTokenHTML, contentText)) {
            return 'head';
        } else if (this.brchNodePropIdVal(iTokenHTML, contentText)) {
            return 'tail';
        }
        return undefined;
    };
    this.iRangeSelect = function(iTokenHTML) {
        if (this.removedSessionConfigs(iTokenHTML)) {
            return 'current';
        } else if (this.tabTxVal(iTokenHTML)) {
            return 'previous';
        } else if (this.updateSessionLayout(iTokenHTML)) {
            return 'saved';
        }
        return undefined;
    };
    this.sbNodeRangesVal = function(iTokenHTML) {
        if (this.removedSessionConfigs(iTokenHTML)) {
            return -13;
        } else if (this.tabTxVal(iTokenHTML)) {
            return iTokenHTML.id.substring('sessionSummary_previous_'.length);
        } else if (this.updateSessionLayout(iTokenHTML)) {
            return iTokenHTML.id.substring('sessionSummary_saved_'.length);
        }
        return undefined;
    };
    this.firstInListVal = function(augmentWindowTab) {
        return isAllowLoggingVal('sessionCountVal', augmentWindowTab);
    };
    this.iExtendedCacheDelayVal = function(augmentWindowTab) {
        return isAllowLoggingVal('predicate', augmentWindowTab);
    };
    this.queryMode = function(augmentWindowTab) {
        return isAllowLoggingVal('processTab', augmentWindowTab);
    };
    this.initSessionSource = function(augmentWindowTab) {
        if (!augmentWindowTab) {
            augmentWindowTab = this.deferDedupeSessionsVal;
        }
        return isAllowLoggingVal('ntc', augmentWindowTab);
    };
    this.updateWindow = function(requestHonored, tileSelect_Next, augmentWindowTab) {
        if (!augmentWindowTab) {
            augmentWindowTab = this.deferDedupeSessionsVal;
        }
        if (tileSelect_Next === 'current') {
            return this.initSessionSource(augmentWindowTab);
        } else if (requestHonored && tileSelect_Next) {
            return isAllowLoggingVal('sessionSummary_' + tileSelect_Next + '_' + requestHonored, augmentWindowTab);
        }
        return null;
    };
    this.updateSessionStatus = function(correctPLimit, augmentWindowTab) {
        return this.updateWindow(correctPLimit.id, correctPLimit.type, augmentWindowTab);
    };
    this.iRemovedSessionConfigs = function(augmentWindowTab) {
        return isAllowLoggingVal('registerTabSource', augmentWindowTab);
    };
    this.setActiveWindow = function(augmentWindowTab) {
        return isAllowLoggingVal('getSessionStatus', augmentWindowTab);
    };
    this.registerValue4Val = function(augmentWindowTab) {
        return isAllowLoggingVal('enableSyncFctVal', augmentWindowTab);
    };
    this.iDesc = function(sbAnnotation, addSessionTransactions, popTabUrl, serializeActiveTab, refreshRecoverySession, enableSelVal) {
        if (!sbAnnotation) {
            sbAnnotation = this.initCurrentWindow;
        }
        if (sbAnnotation) {
            if (addSessionTransactions) {
                sbAnnotation = sbAnnotation.previousElementSibling;
            } else {
                sbAnnotation = sbAnnotation.nextElementSibling;
            }
            while (sbAnnotation && (!this.evalSelActionType(sbAnnotation) || !(enableSelVal && enableSelVal.contains(sbAnnotation)) && (typeof popTabUrl === 'string' && (popTabUrl !== 'current' || !this.removedSessionConfigs(sbAnnotation)) && (popTabUrl !== 'previous' || !this.tabTxVal(sbAnnotation)) && (popTabUrl !== 'saved' || !this.updateSessionLayout(sbAnnotation)) && (popTabUrl.toLowerCase() !== 'tile_anchor_se' && popTabUrl.toLowerCase() !== 'tile_anchor_nw' || !this.tabTxVal(sbAnnotation) && !this.updateSessionLayout(sbAnnotation)) || typeof serializeActiveTab === 'string' && (serializeActiveTab !== 'head' || !this.showSession(sbAnnotation, true)) && (serializeActiveTab !== 'tail' || !this.brchNodePropIdVal(sbAnnotation, true)) && (serializeActiveTab !== 'none' || !this.getTabArray(sbAnnotation, true)) && (serializeActiveTab.toLowerCase() !== 'tile_anchor_sw' && serializeActiveTab.toLowerCase() !== 'tile_anchor_ne' || !this.showSession(sbAnnotation, true) && !this.brchNodePropIdVal(sbAnnotation, true)) || !(refreshRecoverySession === undefined || refreshRecoverySession === null || (this.vSessionCache(sbAnnotation) ? refreshRecoverySession : !refreshRecoverySession))))) {
                if (addSessionTransactions) {
                    sbAnnotation = sbAnnotation.previousElementSibling;
                } else {
                    sbAnnotation = sbAnnotation.nextElementSibling;
                }
            }
        }
        return sbAnnotation;
    };
    this.addIcon = function(evalSbNodeRangesVal, popTabUrl, serializeActiveTab, refreshRecoverySession, currentSessionNotifyVal, sBSaveRelevantVal, enableSelVal) {
        var sessionConfigsToRemove = function(iTokenHTML) {
            if (enableSelVal && enableSelVal.contains(iTokenHTML)) {
                return false;
            }
            if (currentSessionNotifyVal) {
                for (var i = currentSessionNotifyVal.length - 1; i >= 0; i--) {
                    if (currentSessionNotifyVal[i].indexOf(iTokenHTML) > -1) {
                        return true;
                    }
                }
            }
            return false;
        };
        var iFilter = this.iDesc(evalSbNodeRangesVal, sBSaveRelevantVal, popTabUrl, serializeActiveTab, refreshRecoverySession, enableSelVal);
        while (iFilter && sessionConfigsToRemove(iFilter)) {
            iFilter = this.iDesc(iFilter, sBSaveRelevantVal, popTabUrl, serializeActiveTab, refreshRecoverySession, enableSelVal);
        }
        if (!iFilter) {
            iFilter = this.iDesc(evalSbNodeRangesVal, !sBSaveRelevantVal, popTabUrl, serializeActiveTab, refreshRecoverySession, enableSelVal);
            while (iFilter && sessionConfigsToRemove(iFilter)) {
                iFilter = this.iDesc(iFilter, !sBSaveRelevantVal, popTabUrl, serializeActiveTab, refreshRecoverySession, enableSelVal);
            }
        }
        return iFilter;
    };
    this.vFormat = function(normalizeSession, msgNmVal, iOrder) {
        if (msgNmVal) {
            msgNmVal = u.sessionConfigsToRemoveVal(normalizeSession);
        } else {
            msgNmVal = undefined;
        }
        if (iOrder) {
            iOrder = normalizeSession;
        } else {
            iOrder = undefined;
        }
        if (normalizeSession && this.evalSelActionType(normalizeSession)) {
            if (this.removedSessionConfigs(normalizeSession)) {
                return app.serializeTabTransactions(msgNmVal, iOrder);
            } else {
                var setSessionMode = normalizeSession.id.split('_');
                return app.sbLinkVal(setSessionMode[1], setSessionMode[2], msgNmVal, iOrder);
            }
        }
        return null;
    };
    this.initActiveSessionTab = function(requestHonored, tileSelect_Next, evalSbTailContainerVal, popWindowArray) {
        if (!evalSbTailContainerVal) {
            evalSbTailContainerVal = this.sbRange();
        }
        if (!popWindowArray) {
            popWindowArray = this.elHiddenVal();
        }
        if (evalSbTailContainerVal && evalSbTailContainerVal.id + '' == requestHonored + '' && evalSbTailContainerVal.type == tileSelect_Next) {
            return 'head';
        } else if (app.parseSessionTransactions(requestHonored, tileSelect_Next, popWindowArray) > -1) {
            if (popWindowArray.length > 1) {
                return 'tail';
            } else {
                return 'head';
            }
        } else {
            return 'none';
        }
    };
    this.notifySessionListener = function(saveMatchText, extractTab) {
        return extractTab ? 'range' : saveMatchText ? 'cumulative' : 'single';
    };
    this.uiObf = function(iSessionConfigHeadVal, resetWindow) {
        if (this.initCurrentWindow != iSessionConfigHeadVal || !this.evalSCtrlKeyVal.compare(resetWindow)) {
            this.initCurrentWindow = iSessionConfigHeadVal;
            this.evalSCtrlKeyVal = resetWindow.slice();
            if (this.getSavedSession) {
                this.getSavedSession(true, this.sbRange(), this.elHiddenVal(), false);
            }
        }
    };
    this.syncActiveSessionTab = function(selectedLineitemsVal, evalSessionConfigsToRemoveVal) {
        if (!selectedLineitemsVal) {
            return {
                iBaseline: 0,
                iTriggerNmVal: null,
                appStatusVal: 0,
                sessionMergeVal: 0,
                popWindowCache: 0,
                evalReq: 0
            };
        }
        var iOffsetVal = [];
        var filterWindowArray = null;
        var countWindows = true;
        var setNm = null;
        var sbGroupVal = 0;
        var augmentTab = 0;
        var iRegisterValue5 = 0;
        var createPreviousSession = 0;
        selectedLineitemsVal = selectedLineitemsVal.nextElementSibling;
        while (selectedLineitemsVal) {
            if (this.isElementType_GroupSubheader(selectedLineitemsVal)) {
                if (filterWindowArray) {
                    if (countWindows) {
                        iOffsetVal.push(filterWindowArray);
                    } else if (setNm === null) {
                        setNm = filterWindowArray;
                    }
                }
                filterWindowArray = selectedLineitemsVal;
                countWindows = true;
            } else if (this.evalSelActionType(selectedLineitemsVal)) {
                if (evalSessionConfigsToRemoveVal.contains(selectedLineitemsVal)) {
                    if (this.vSessionCache(selectedLineitemsVal)) {
                        augmentTab++;
                    } else {
                        sbGroupVal++;
                    }
                } else {
                    if (this.vSessionCache(selectedLineitemsVal)) {
                        createPreviousSession++;
                    } else {
                        iRegisterValue5++;
                    }
                    if (countWindows) {
                        countWindows = false;
                    }
                }
            } else {
                if (filterWindowArray) {
                    if (countWindows) {
                        iOffsetVal.push(filterWindowArray);
                    } else if (setNm === null) {
                        setNm = filterWindowArray;
                    }
                }
                break;
            }
            selectedLineitemsVal = selectedLineitemsVal.nextElementSibling;
        }
        return {
            iBaseline: iOffsetVal,
            iTriggerNmVal: setNm,
            appStatusVal: augmentTab,
            sessionMergeVal: sbGroupVal,
            popWindowCache: createPreviousSession,
            evalReq: iRegisterValue5
        };
    };
    this.iterateTabSeries = function(tabFilterPredicate) {
        if (tabFilterPredicate && tabFilterPredicate.data) {
            var s = history.state;
            if (!s) {
                return true;
            }
            if (s.data) {
                return !app.iRequestHonored(s.data.head, tabFilterPredicate.data.head) || !app.arrMergeIf(s.data.all, tabFilterPredicate.data.all);
            }
        }
    };
    this.processTabStateComponents = function(tabPreState, tabPostStates) {
        var title;
        if (tabPostStates && tabPostStates.length) {
            title = tabPostStates.length + ' Session' + (tabPostStates.length !== 1 ? 's' : '');
        } else if (tabPreState.type === 'current') {
            title = 'Current Session';
        } else if (tabPreState.type === 'previous') {
            title = 'Previous Session';
        } else if (tabPreState.type === 'saved') {
            if (tabPreState.name) {
                title = tabPreState.name;
            } else {
                title = 'Unnamed session';
            }
        }
        if (title) {
            document.title = title + ' - Session Buddy';
        }
    };
    this.cullSelectedTabs = function(o, cb) {
        if (o.data.head.type === 'saved' && !o.data.all.length) {
            iPredicateVal.SBDB.contextToVal(o.data.head.id, function(iShowWindows) {
                if (iShowWindows.name) {
                    o.data.head.name = iShowWindows.name;
                }
                if (iShowWindows.gid) {
                    o.data.head.gid = iShowWindows.gid;
                }
                cb(o);
            });
        } else if (o.data.head.type === 'previous' && !o.data.all.length) {
            iPredicateVal.SBDB.evalRegisterValue1(o.data.head.id, function(iShowWindows) {
                if (iShowWindows.gid) {
                    o.data.head.gid = iShowWindows.gid;
                }
                cb(o);
            });
        } else {
            cb(o);
        }
    };
    this.evalWindowRestoreOptions = function(how, type) {
        how = how || 'push';
        type = type || 'selection';
        if (how === 'none') {
            return;
        }
        if (type === 'selection') {
            var o = {
                type: type,
                data: {
                    head: addSessionConfigs.sbRange(),
                    all: addSessionConfigs.elHiddenVal()
                }
            };
            addSessionConfigs.cullSelectedTabs(o, function(o) {
                if (addSessionConfigs.iterateTabSeries(o) && how !== 'title') {
                    (how === 'replace' ? history.replaceState : history.pushState).call(history, o, '', 'main.html' + (o.data.head.gid ? '#' + o.data.head.gid : ''));
                }
                addSessionConfigs.processTabStateComponents(o.data.head, o.data.all);
            });
        }
    };
}