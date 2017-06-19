/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

try {
    var recordDateTime = window.File && window.FileReader && window.FileList && window.Blob && !!new Blob();
} catch (ex) {}

function iWindow1Val(wins, arrayToCompare, tokenComponentImg, orientation_top, extractSessionRoot, cb, formatActiveSessionTab, description) {
    iPredicateVal.SBDB.fieldNm(function(rangeCumulative) {
        iPredicateVal.SBDB.deferCurrentSessionNotifyVal(function(bShowHideURLsVal) {
            iPredicateVal.SBDB.normalizeTabList(function(evalRerenderVal) {
                iPredicateVal.SBDB.iSessionConfig2Val(function(findActiveWindow) {
                    iPredicateVal.SBDB.setWindowTab(function(sbAnnotationVal) {
                        var iWindowSeq = createElement('div', 'revisionIdx');
                        if (description) {
                            var desc = iWindowSeq.appendChild(createElement('div'));
                            desc.className = 'tabsUnder';
                            desc.innerHTML = description;
                        }
                        var copySessionWindow;
                        var unfilteredWindowCount = 0;
                        var filteredWindowCount = 0;
                        var unfilteredTabCount = 0;
                        var filteredTabCount = 0;
                        var filterTab = 0;
                        for (var i = 0; i < wins.length; i++) {
                            if (extractSessionRoot) {
                                wins[i].focused = false;
                            }
                            if (app.iSpeedVal(wins[i], 0, bShowHideURLsVal, evalRerenderVal)) {
                                filteredWindowCount++;
                                filteredTabCount += wins[i].tabs.length;
                            } else {
                                unfilteredWindowCount++;
                                filterTab = 0;
                                for (var j = 0; j < wins[i].tabs.length; j++) {
                                    if (app.cfgIdVal(wins[i].tabs[j], bShowHideURLsVal, evalRerenderVal)) {
                                        filteredTabCount++;
                                    } else {
                                        unfilteredTabCount++;
                                        filterTab++;
                                        if (filterTab == 1) {
                                            iWindowSeq.appendChild(copySessionWindow = setWindowSource(wins[i].tabs[j], i + 1, j + 1, sbAnnotationVal, arrayToCompare, false, findActiveWindow, orientation_top));
                                        } else {
                                            iWindowSeq.appendChild(setWindowSource(wins[i].tabs[j], i + 1, j + 1, sbAnnotationVal, arrayToCompare, false, findActiveWindow, orientation_top));
                                        }
                                    }
                                }
                                iWindowSeq.insertBefore(copyTabState(wins[i], i + 1, unfilteredWindowCount, filterTab, unfilteredWindowCount == 1, arrayToCompare, tokenComponentImg, rangeCumulative), copySessionWindow);
                            }
                        }
                        if (unfilteredTabCount < 1) {
                            q('evalSbNm').setAttribute('class', 'iSelLengthVal');
                            if (filteredTabCount < 1) {
                                copyImportedSession('no tabs');
                            } else {
                                copyImportedSession(filteredTabCount + ' tab' + (filteredTabCount > 1 ? 's in this session are' : ' in this session is') + ' hidden. <span id="openWindowInvert" style="text-decoration:underline;cursor:pointer;">Click here</span> to adjust Tab Filter settings.');
                                q('openWindowInvert').addEventListener('click', function() {
                                    iIdVal(q('session1WindowIdxVal'));
                                    saveDisplayedSession('saveImportedSession');
                                }, false);
                            }
                        } else {
                            q('evalSbNm').setAttribute('class', 'evalSbNm');
                            $('.bypassSessionMode, .revise, .iFirstInList, .syncDesc').qtip('destroy', true);
                            var container = q('evalSbNm');
                            while (container.firstChild) {
                                container.removeChild(container.firstChild);
                            }
                            container.appendChild(iWindowSeq);
                        }
                        selectWindowTab = wins;
                        orientationVal = new Date();
                        if (notifyWindowTab) {
                            q('assessStyleVal').style.display = 'block';
                            q('evalSbNm').style.top = '236px';
                            q('iSessionConfig').style.top = '236px';
                            reloadSavedSession(wins, notifyWindowTab, bShowHideURLsVal, evalRerenderVal, function(sbConfigs, renderUrl, btnCaretForward) {
                                var iText = formatActiveSessionTab && formatActiveSessionTab.toLowerCase().indexOf(notifyWindowTab.toLowerCase()) > -1 ? 'the session name' : '';
                                var extractTabStatus = renderUrl > 0 ? renderUrl + (renderUrl === 1 ? ' tab title' : ' tab titles') : '';
                                var refreshSessionSource = btnCaretForward > 0 ? btnCaretForward + (btnCaretForward === 1 ? ' tab URL' : ' tab URLs') : '';
                                var isFilteredWindowVisible = false;
                                if (iText && extractTabStatus && refreshSessionSource) {
                                    q('iSession1').innerText = '"' + notifyWindowTab + '" matches ' + iText + ', ' + extractTabStatus + ', and ' + refreshSessionSource;
                                    isFilteredWindowVisible = true;
                                } else if (iText && (extractTabStatus || refreshSessionSource)) {
                                    q('iSession1').innerText = '"' + notifyWindowTab + '" matches ' + iText + ' and ' + extractTabStatus + refreshSessionSource;
                                    isFilteredWindowVisible = true;
                                } else if (extractTabStatus && refreshSessionSource) {
                                    q('iSession1').innerText = '"' + notifyWindowTab + '" matches ' + extractTabStatus + ' and ' + refreshSessionSource;
                                    isFilteredWindowVisible = true;
                                } else if (iText || extractTabStatus || refreshSessionSource) {
                                    q('iSession1').innerText = '"' + notifyWindowTab + '" matches ' + iText + extractTabStatus + refreshSessionSource;
                                    isFilteredWindowVisible = true;
                                }
                                if (isFilteredWindowVisible) {
                                    q('assessStyleVal').classList.remove('val8');
                                } else {
                                    if (addSessionConfigs.evalSCtrlKeyVal.length > 1) {
                                        q('iSession1').innerText = '"' + notifyWindowTab + '" does not match any tabs in the selected sessions';
                                    } else {
                                        q('iSession1').innerText = '"' + notifyWindowTab + '" has no matches in the selected session';
                                    }
                                    q('assessStyleVal').classList.add('val8');
                                }
                            });
                        } else {
                            q('assessStyleVal').style.display = 'none';
                            q('evalSbNm').style.top = '183px';
                            q('iSessionConfig').style.top = '183px';
                        }
                        if (cb) {
                            cb(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount);
                        }
                    });
                });
            });
        });
    });
}

function isRangeDirBackVal() {
    $('.tabTruncateIdx').each(function() {
        createTempWindow($(this));
    });
    $('#primaryTabOuterButton').addClass('invisible').parent().find('.bypassSessionMode').qtip('enable');
    return evalSessionStorageKey(q('headerErrVal'), q('initTabLayout')) || evalSessionStorageKey(q('iMsg'), q('iBaseDate')) || evalSessionStorageKey(q('bMergeSaveElVal'), q('iCountVal'));
}

function stylePrimaryTileEl(iTokenHTML) {
    iTokenHTML.style.setProperty('-webkit-border-bottom-left-radius', '0px');
    iTokenHTML.style.setProperty('-webkit-border-bottom-right-radius', '0px');
    iTokenHTML.style.setProperty('border-bottom-color', 'hsl(219, 44%, 94%)');
}

function stylePrimaryTabEl(sessionStorageKeyVal, registerSessionWindow) {
    sessionStorageKeyVal.style.setProperty('-webkit-border-bottom-left-radius', '');
    sessionStorageKeyVal.style.setProperty('-webkit-border-bottom-right-radius', '');
    sessionStorageKeyVal.style.setProperty('border-bottom-color', '');
    registerSessionWindow.style.setProperty('-webkit-border-top-left-radius', '');
    registerSessionWindow.style.setProperty('-webkit-border-top-right-radius', '');
    registerSessionWindow.style.setProperty('border-top-color', '');
}

function styleSecondaryTileEl(iTokenHTML) {
    iTokenHTML.style.setProperty('-webkit-border-top-left-radius', '0px');
    iTokenHTML.style.setProperty('-webkit-border-top-right-radius', '0px');
    iTokenHTML.style.setProperty('border-top-color', 'hsl(219, 44%, 94%)');
}

function styleSecondaryTabEl(sessionStorageKeyVal, registerSessionWindow) {
    sessionStorageKeyVal.style.setProperty('-webkit-border-top-left-radius', '');
    sessionStorageKeyVal.style.setProperty('-webkit-border-top-right-radius', '');
    sessionStorageKeyVal.style.setProperty('border-top-color', '');
    registerSessionWindow.style.setProperty('-webkit-border-bottom-left-radius', '');
    registerSessionWindow.style.setProperty('-webkit-border-bottom-right-radius', '');
    registerSessionWindow.style.setProperty('border-bottom-color', '');
}

function seal(sessionStorageKeyVal, registerSessionWindow) {
    stylePrimaryTileEl(sessionStorageKeyVal);
    styleSecondaryTileEl(registerSessionWindow);
}

var activeTabVal = null;

var severity;

var extractMatchText;

var createWindowTab;

function iTabSeqVal() {
    if (iPredicateVal.matchTextVal('Platform: ' + q('createSessionTab').innerText + '\n' + 'Language: ' + q('popWindowConfig').innerText + '\n' + 'User Agent: ' + q('parseCurrentWindow').innerText + '\n' + 'Pixel Ratio: ' + u.addTitle() + '\n' + 'SB ID: ' + q('evalSbNmVal').innerText + '\n' + 'SB Version: ' + q('showWindowCount').innerText + '\n' + 'SB Status: ' + q('btnCaretClrVal').innerText + '\n')) {
        clearTimeout(iExclusive);
        document.querySelector('#requireMove').style.opacity = '1';
        iExclusive = setTimeout(function() {
            document.querySelector('#requireMove').style.opacity = '0';
        }, 1e3);
    }
}

function childCount() {
    vTransition();
}

function bypassTabSource() {
    vTransition(function() {
        setWindowCount();
    });
}

function sbSessionConfigVal() {
    if (iPredicateVal.matchTextVal(q('copyTabArray').value)) {
        ga('send', 'event', 'feature', 'export_clipboard', updateSessionRoot());
        $('#iPropNm').html('Copied');
        clearTimeout(toggleSessionMode);
        $('#iPropNm').fadeIn('fast');
        toggleSessionMode = setTimeout(function() {
            $('#iPropNm').fadeOut('slow');
        }, 1500);
    }
}

function actionTimeframeVal(extrapolateWins) {
    currentComponent(function(t) {
        try {
            argsVal(t, 'session_buddy_backup_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '.json');
            ga('send', 'event', 'feature', 'backup_file');
            maxCount('Backup file saved to <span class="evalSessionId">downloads folder</span>' + (extrapolateWins ? '<br><div><a id="imgVTag" style="text-decoration:underline;">Learn more about backups</a></div>' : ''), 0, 15 * 1e3);
        } catch (ex) {
            maxCount('Failed to save backup file', 2);
        }
    });
}

function argsVal(text, filename) {
    saveAs(new Blob([ '\ufeff', text ], {
        type: 'text/plain;charset=UTF-8'
    }), filename);
}

function iSearchTerm() {
    try {
        var ext = '.txt';
        switch (updateSessionRoot()) {
          case 'CSV':
            ext = '.csv';
            break;

          case 'JSON':
            ext = '.json';
            break;

          case 'HTML':
            ext = '.html';
            break;

          case 'Markdown':
            ext = '.md';
            break;
        }
        argsVal(q('copyTabArray').value, 'session_buddy_export_' + moment().format('YYYY_MM_DD_HH_mm_ss') + ext);
        ga('send', 'event', 'feature', 'export_file', updateSessionRoot());
        $('#iPropNm').html('Saved to <span class="evalSessionId" style="color:hsl(120, 52%, 30%);">downloads folder</span>');
        clearTimeout(toggleSessionMode);
        $('#iPropNm').fadeIn('fast');
        toggleSessionMode = setTimeout(function() {
            $('#iPropNm').fadeOut('slow');
        }, 5e3);
    } catch (ex) {}
}

function mode() {
    evalReg1(q('iSessionCountVal').value);
    vTransition();
}

function getTabCount() {
    iCondition(q('lxMtype').value, iCount);
}

function renderTabTitle() {
    if (q('setSession').checked) {
        iPredicateVal.SBDB.evalOutRemovedSessionConfigs('sessionMerge_WarnOnMerge', false);
    }
    prioritizeTab(addSessionConfigs.elHiddenVal(), function(psi) {
        evalRequestHonoredVal(psi);
    });
}

function iCount(iIdsVal, correctPLimit) {
    if (correctPLimit) {
        txType(iIdsVal, correctPLimit);
        vTransition();
        if (q('setSession').checked) {
            iPredicateVal.SBDB.evalOutRemovedSessionConfigs('sessionSave_AskForName', false);
        }
    }
}

function applicationExVal(cb) {
    iPredicateVal.SBDB.setTabStatus(function(iStatTypeCodeNm) {
        if (iStatTypeCodeNm) {
            $('html, body, input.evalSbGroupVal, .iWindowsVal').addClass('flashCountVal');
        } else {
            $('html, body, input.evalSbGroupVal, .iWindowsVal').removeClass('flashCountVal');
        }
        if (cb) {
            cb();
        }
    });
}

function val2() {
    vTransition();
    eventVal(function(subArrayVal, addTabSource, showCurrentWindow, updateSessionTab, iPositionVal, createTabArray, formatSessionWindow, evalSessionConfig2Val) {
        applicationExVal(function() {
            setActiveTab(formatSessionWindow, function() {
                syncSavedSession(updateSessionTab, function() {
                    if (iPositionVal) {
                        if (q('appActionCoordinate').checked) {
                            app.evalSelLength(function(unfilteredWindowCount, filteredWindowCount, unfilteredTabCount, filteredTabCount) {
                                app.firstInList(unfilteredTabCount, filteredTabCount);
                            });
                        } else {
                            app.firstInList();
                        }
                        iPredicateVal.codeVal();
                    }
                    iPredicateVal.evalSDupeVal();
                    var complete = function() {
                        iPredicateVal.popTabTitle({
                            id: 'propNm',
                            data: {
                                showCurrentWindow: showCurrentWindow,
                                subArrayVal: subArrayVal,
                                addTabSource: addTabSource,
                                createTabArray: createTabArray,
                                enableKeyboardShortcuts: q('btnCaretSelVal').checked
                            }
                        });
                    };
                    if (evalSessionConfig2Val) {
                        showCurrentWindow = true;
                        addTabSource = true;
                        iPredicateVal.SBDB.setSessionWindow(function(evalSelectedLineitems) {
                            app.dateDisplayType = evalSelectedLineitems;
                            iPredicateVal.SBDB.wrx(function(format) {
                                app.customDateFormat = format;
                                complete();
                            });
                        });
                    } else {
                        complete();
                    }
                });
            });
        });
    });
}

function setActiveTab(appStatus, cb) {
    if (appStatus) {
        if (q('evalRangeCumulative').checked) {
            iPredicateVal.addedConfigsVal();
            if (cb) {
                cb();
            }
        } else {
            clearTimeout(iPredicateVal.doNotSync);
            app.removeCurrentWindow();
            iPredicateVal.SBDB.elMetricsVal(function(positionCurrentWindow) {
                if (positionCurrentWindow > 0) {
                    console.log(positionCurrentWindow + (positionCurrentWindow === 1 ? ' previous session deleted' : ' previous sessions deleted'));
                }
            });
            if (cb) {
                cb();
            }
        }
    } else if (cb) {
        cb();
    }
}

function syncSavedSession(appStatus, cb) {
    if (appStatus) {
        app.iFormat(function() {
            iPredicateVal.codeVal();
            if (cb) {
                cb();
            }
        });
    } else if (cb) {
        cb();
    }
}

function copyTabList(appStatus, cb) {
    if (appStatus) {
        iIds(undefined, undefined, undefined, false, undefined, cb);
    } else if (cb) {
        cb();
    }
}

function newNm(appStatus, cb) {
    if (appStatus) {
        optimizeSessionSource(undefined, cb);
    } else if (cb) {
        cb();
    }
}

function concatenateVal(appStatus, cb) {
    if (appStatus) {
        iDate(addSessionConfigs.sbRange(), addSessionConfigs.elHiddenVal(), cb);
    } else if (cb) {
        cb();
    }
}

function saveDisplayedSession(extractPreviousSession, windowTab, iShift, cb) {
    var btnSM = function() {
        var iSessionConfig1Val = q('normalizeSessionTransactions').children;
        for (var i = 0; i < iSessionConfig1Val.length; i++) {
            if (iSessionConfig1Val[i] && iSessionConfig1Val[i].tagName && iSessionConfig1Val[i].tagName.toUpperCase() == 'DIV') {
                if (iSessionConfig1Val[i].id == extractPreviousSession) {
                    iSessionConfig1Val[i].style.display = 'block';
                } else {
                    iSessionConfig1Val[i].style.display = 'none';
                }
            }
        }
        if (!windowTab) {
            q('compressOpts').style.left = (document.body.clientWidth - $('#compressOpts').width()) / 2 + 'px';
        }
        if (!iShift) {
            q('compressOpts').style.top = '20px';
        }
        q('compressOpts').style.display = 'inline-block';
        q('opacityAnimation').style.display = 'block';
        q('opacityAnimation').style.height = document.body.clientHeight;
        q('opacityAnimation').style.width = document.body.clientWidth;
        q('compressOpts').className = 'compressOpts';
        q('opacityAnimation').className = 'iAdditiveVal';
        window.setTimeout(function() {
            if (cb) {
                cb();
            }
        }, 50);
    };
    adjustImportedSession = false;
    isRangeDirBackVal();
    iTypeVal('500');
    q('normalizeSessionTransactions').style.background = '#fff';
    q('sessionConfigVal').className = 'sbButton';
    q('sessionConfigVal').dataset.type = '';
    q('sessionConfigVal').style.display = 'none';
    q('sessionConfigVal').style.width = '60px';
    q('finalCssClsIdx').style.display = 'inline-block';
    q('finalCssClsIdx').innerHTML = 'Save';
    q('finalCssClsIdx').className = 'sbButton';
    q('finalCssClsIdx').dataset.type = '';
    q('finalCssClsIdx').style.width = '60px';
    q('iterateTabTransactions').style.display = 'inline-block';
    q('iterateTabTransactions').innerHTML = 'Cancel';
    q('iterateTabTransactions').className = 'sbButton';
    q('iterateTabTransactions').dataset.type = '4';
    q('iterateTabTransactions').style.width = '60px';
    u.enable(q('sessionConfigVal'));
    u.enable(q('finalCssClsIdx'));
    u.enable(q('iterateTabTransactions'));
    severity = childCount;
    extractMatchText = childCount;
    createWindowTab = childCount;
    q('evalSDupe').style.display = 'none';
    if (extractPreviousSession == 'adjustRecoverySession') {
        evalPos(windowTab, iShift, function() {
            q('evalSelectedLineitemsVal').select();
            q('evalSelectedLineitemsVal').value = '';
            u.disable(q('finalCssClsIdx'));
            btnSM();
        });
    } else if (extractPreviousSession == 'removeTabSource') {
        iIncludeSeqPropVal(windowTab, iShift, function() {
            reloadTabSource();
            btnSM();
        });
    } else if (extractPreviousSession == 'iRequestHonoredVal') {
        propNmVal(windowTab, iShift, function() {
            q('iSessionCountVal').focus();
            q('iSessionCountVal').select();
            btnSM();
        });
    } else if (extractPreviousSession == 'sessionModeVal') {
        addActiveSessionTab(windowTab, iShift, function() {
            q('lxMtype').focus();
            q('lxMtype').value = '';
            q('setSession').checked = false;
            q('noTextVal').innerText = 'Never ask for name';
            btnSM();
        });
    } else if (extractPreviousSession == 'wotBody') {
        invertWot(windowTab, iShift, function() {
            q('setSession').checked = false;
            q('noTextVal').innerText = 'Don\'t warn again';
            btnSM();
        });
    } else if (extractPreviousSession == 'syncPlacement') {
        updateTabIsolationRange(windowTab, iShift, function() {
            btnSM();
        });
    } else if (extractPreviousSession == 'exceptionTxt') {
        iRegisterValue1(windowTab, iShift, function() {
            q('setSession').checked = false;
            q('noTextVal').innerText = 'Don\'t ask again';
            btnSM();
        });
    } else if (extractPreviousSession == 'augmentActiveTab') {
        deltaRVal(windowTab, iShift, function() {
            btnSM();
        });
    } else if (extractPreviousSession == 'saveImportedSession') {
        adjustSession(windowTab, iShift, btnSM);
    }
}

function isDupeVal(cb, delay) {
    clearTimeout(countActiveWindows);
    countActiveWindows = setTimeout(function() {
        formatActiveTab(q('evalSelectedLineitemsVal').value.trim(), cb);
    }, delay || 1);
}

function sessionTypeVal(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (event.type !== 'drop' || event.which == 1 && !u.iContentText(event) && !event.shiftKey) {
        $('#evalSelectedLineitemsVal').removeClass('evalSelectedLineitemsVal-dragover');
        var files = ev.dataTransfer && ev.dataTransfer.files || ev.target.files;
        if (files.length > 0) {
            var rdr = new FileReader(), f = files[0];
            if (!f.type.match('image.*') || !f.type) {
                rdr.onload = function() {
                    return function(ev) {
                        q('evalSelectedLineitemsVal').value = ev.target.result;
                        $('#evalSelectedLineitemsVal').scrollTop(0).scrollLeft(0);
                        isDupeVal(toggleActiveTab);
                    };
                }();
                rdr.readAsText(f);
            } else {
                $('#extendedSessionConfig').show().text('Not a valid import file' + (f.type ? ' (' + f.type + ')' : '')).addClass('inferTypes');
            }
        }
    }
}

function evalPos(windowTab, iShift, cb) {
    iPredicateVal.SBDB.setTabStatus(function(iStatTypeCodeNm) {
        searchRequest('Import');
        iTypeVal('600');
        q('evalSelectedLineitemsVal').style.height = '';
        q('evalSelectedLineitemsVal').style.width = parseInt(q('compressOpts').style.width) - 37 + 'px';
        document.body.addEventListener('mousemove', bHideURLs, false);
        activeTabVal = effectiveIdx;
        $('#getTabTransactions').append('<span id="extendedSessionConfig" class="extendedSessionConfig">');
        if (recordDateTime) {
            $('#getTabTransactions').append($('<input type="file" id="requestHonoredVal" class="requestHonoredVal" title=" ">'));
            $('#getTabTransactions').append('<span id="iShowSuccessStatus" class="iShowSuccessStatus">');
            if (iStatTypeCodeNm) {
                $('#requestHonoredVal').addClass('flashCountVal');
            }
            $('#extendedSessionConfig').css('left', '107px');
            $('#requestHonoredVal').on('change', sessionTypeVal);
        }
        q('finalCssClsIdx').dataset.type = '4';
        q('finalCssClsIdx').innerHTML = 'Save';
        extractMatchText = bypassTabSource;
        q('evalSelectedLineitemsVal').value = '';
        if (cb) {
            cb();
        }
    });
}

function iIncludeSeqPropVal(windowTab, iShift, cb) {
    searchRequest('Export');
    if (recordDateTime) {
        iTypeVal('690');
    } else {
        iTypeVal('600');
    }
    q('copyTabArray').style.height = '';
    q('copyTabArray').style.width = parseInt(q('compressOpts').style.width) - 47 + 'px';
    document.body.addEventListener('mousemove', sDupeVal, false);
    activeTabVal = bImgShowURLsVal;
    q('getTabTransactions').appendChild(createElement('span', 'iPropNm', 'iPropNm'));
    q('iterateTabTransactions').innerHTML = 'Close';
    if (recordDateTime) {
        q('sessionConfigVal').dataset.type = '4';
        q('sessionConfigVal').style.width = '115px';
        q('sessionConfigVal').innerHTML = 'Copy to Clipboard';
        q('sessionConfigVal').style.display = 'inline-block';
        createWindowTab = sbSessionConfigVal;
        q('finalCssClsIdx').dataset.type = '4';
        q('finalCssClsIdx').style.width = '115px';
        q('finalCssClsIdx').innerHTML = 'Save to File';
        extractMatchText = iSearchTerm;
    } else {
        q('finalCssClsIdx').dataset.type = '4';
        q('finalCssClsIdx').style.width = '115px';
        q('finalCssClsIdx').innerHTML = 'Copy to Clipboard';
        extractMatchText = sbSessionConfigVal;
    }
    q('copyTabArray').rows = 10;
    iPredicateVal.SBDB.adjustCurrentTab(function(sessionConfig1Val) {
        iPredicateVal.SBDB.filterCurrentWindow(function(isCtrlKeyVal) {
            iPredicateVal.SBDB.iPosString(function(setTabAction) {
                iPredicateVal.SBDB.mergeTabs(function(initTabCache) {
                    iPredicateVal.SBDB.evalOffsetVal(function(isFilterRequired) {
                        iPredicateVal.SBDB.filterSessionSource(function(iCreationDateTime) {
                            q('sessionRootVal').checked = initTabCache;
                            q('evalRunningVal').checked = setTabAction;
                            q('evalOptionDescVal').checked = isFilterRequired;
                            q('cacheWindow').checked = iCreationDateTime;
                            q('sessionExport_Scope').value = sessionConfig1Val;
                            switch (isCtrlKeyVal) {
                              case 'CSV':
                                iIdVal(q('debugVal'));
                                break;

                              case 'JSON':
                                iIdVal(q('optArgs'));
                                break;

                              case 'HTML':
                                iIdVal(q('outMatchedTabsVal'));
                                break;

                              case 'Markdown':
                                iIdVal(q('currentTab'));
                                break;

                              default:
                                iIdVal(q('extractWindowArray'));
                            }
                            if (cb) {
                                cb();
                            }
                        });
                    });
                });
            });
        });
    });
}

function propNmVal(windowTab, iShift, cb) {
    searchRequest('Name Session');
    iTypeVal('350');
    q('iSessionCountVal').addEventListener('keydown', conditionVal, false);
    activeTabVal = windowMode;
    q('finalCssClsIdx').dataset.type = '4';
    q('finalCssClsIdx').innerHTML = 'OK';
    q('finalCssClsIdx').style.display = 'inline-block';
    extractMatchText = mode;
    if (cb) {
        cb();
    }
}

function conditionVal() {
    if (event.keyCode === 13) {
        evalReg1(this.value);
        vTransition(function() {
            q('sbDialogs').focus();
        });
    }
}

function addActiveSessionTab(windowTab, iShift, cb) {
    searchRequest('Save Session');
    iTypeVal('370');
    q('evalSDupe').style.display = 'inline';
    q('lxMtype').addEventListener('keydown', toggleWindowMode, false);
    q('finalCssClsIdx').dataset.type = '4';
    q('finalCssClsIdx').innerHTML = 'OK';
    q('finalCssClsIdx').style.display = 'inline-block';
    extractMatchText = getTabCount;
    iSessionConfigsAllVal = iCondition;
    activeTabVal = evalSbSessionConfigsVal;
    if (cb) {
        cb();
    }
}

function invertWot(windowTab, iShift, cb) {
    iTypeVal('370');
    q('evalSDupe').style.display = 'inline';
    q('finalCssClsIdx').dataset.type = '4';
    q('finalCssClsIdx').innerHTML = 'Yes';
    q('finalCssClsIdx').style.display = 'inline-block';
    q('iterateTabTransactions').innerHTML = 'No';
    if (cb) {
        cb();
    }
}

function updateTabIsolationRange(windowTab, iShift, cb) {
    iTypeVal('400');
    q('finalCssClsIdx').style.display = 'none';
    q('iterateTabTransactions').dataset.type = '4';
    q('iterateTabTransactions').innerHTML = 'OK';
    if (cb) {
        cb();
    }
}

function toggleWindowMode() {
    if (event.keyCode === 13) {
        iSessionConfigsAllVal(this.value, iCount);
    }
}

function iRegisterValue1(windowTab, iShift, cb) {
    searchRequest('Merge Selected Sessions');
    iTypeVal('380');
    q('evalSDupe').style.display = 'inline';
    q('iterateTabTransactions').innerHTML = 'No';
    q('finalCssClsIdx').dataset.type = '4';
    q('finalCssClsIdx').innerHTML = 'Yes';
    q('finalCssClsIdx').style.display = 'inline-block';
    extractMatchText = renderTabTitle;
    if (cb) {
        cb();
    }
}

function deltaRVal(windowTab, iShift, cb) {
    searchRequest('About Session Buddy');
    iTypeVal('500');
    q('finalCssClsIdx').style.display = 'none';
    q('iterateTabTransactions').innerHTML = 'Close';
    if (app.iExpectStatusVal) {
        q('btnCaretClrVal').innerText = 'Error';
        q('btnCaretClrVal').style.color = 'hsl(0, 60%, 50%)';
        q('popTabTransactions').style.color = 'hsl(0, 60%, 50%)';
        q('popTabTransactions').style.textDecoration = 'underline';
        q('popTabTransactions').style.fontWeight = 'bold';
    } else {
        q('btnCaretClrVal').innerText = 'OK';
        q('btnCaretClrVal').style.color = 'hsl(0, 0%, 30%)';
        q('popTabTransactions').style.color = 'hsl(0, 0%, 30%)';
        q('popTabTransactions').style.textDecoration = 'none';
        q('popTabTransactions').style.fontWeight = '300';
    }
    if (cb) {
        cb();
    }
}

function adjustSession(windowTab, iShift, cb) {
    chromeSessionAdapter = new Date();
    searchRequest('Session Buddy Settings');
    iTypeVal('600');
    q('finalCssClsIdx').dataset.type = '4';
    iPredicateVal.SBDB.fieldNm(function(rangeCumulative) {
        iPredicateVal.SBDB.setSessionWindow(function(contextFrom) {
            iPredicateVal.SBDB.wrx(function(insertUndoActionVal) {
                iPredicateVal.SBDB.detailTxt(function(iSplitterVal) {
                    iPredicateVal.SBDB.findSession(function(processCurrentWindow) {
                        iPredicateVal.SBDB.limitVal(function(searchRequestVal) {
                            iPredicateVal.SBDB.neutralizeWindowFocus(function(iTokenAddedCallback) {
                                iPredicateVal.SBDB.addSession(function(addMatchText) {
                                    iPredicateVal.SBDB.iSetNmVal(function(rerender) {
                                        iPredicateVal.SBDB.iSessionConfig2Val(function(contentShwVal) {
                                            iPredicateVal.SBDB.iWindow2TabIdx(function(reloadSessionWindow) {
                                                iPredicateVal.SBDB.setTabStatus(function(renderTab) {
                                                    iPredicateVal.SBDB.initControlVal(function(requestActiveSessionTab) {
                                                        iPredicateVal.SBDB.iShowWindowsVal(function(registerValue1Val) {
                                                            iPredicateVal.SBDB.iWindowIdVal(function(txtComponentMain) {
                                                                iPredicateVal.SBDB.deferCurrentSessionNotifyVal(function(requireTabAction) {
                                                                    iPredicateVal.SBDB.normalizeTabList(function(nodeVal) {
                                                                        iWindows1(q('evalRangeCumulative'), txtComponentMain);
                                                                        iWindows1(q('iContextToVal'), registerValue1Val);
                                                                        iWindows1(q('extractTabTransactions'), rerender);
                                                                        iWindows1(q('popTabAction'), addMatchText);
                                                                        iWindows1(q('intendedParentVal'), searchRequestVal);
                                                                        iWindows1(q('optionDescVal'), iTokenAddedCallback);
                                                                        iWindows1(q('appActionCoordinate'), requestActiveSessionTab);
                                                                        iWindows1(q('updateTitle'), processCurrentWindow);
                                                                        iWindows1(q('evalRevisionIdxVal'), rangeCumulative);
                                                                        iWindows1(q('sbSel'), contentShwVal);
                                                                        iWindows1(q('serializeSession'), reloadSessionWindow);
                                                                        iWindows1(q('mergeSessionTabs'), renderTab);
                                                                        iWindows1(q('evalSession1'), requireTabAction);
                                                                        iWindows1(q('evalRecoverySessionVal'), nodeVal);
                                                                        iWindows1(q('btnCaretSelVal'), iSplitterVal);
                                                                        iWindows1(q('addedTokenElVal'), contextFrom);
                                                                        iWindows1(q('adapterSelVal'), insertUndoActionVal);
                                                                        evalSbTokenAddedCb(q('evalRangeCumulative').checked);
                                                                        extractMatchText = val2;
                                                                        evalSessionCountVal();
                                                                        if (cb) {
                                                                            cb();
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
                            });
                        });
                    });
                });
            });
        });
    });
}

function iWindows1(addDisplayedSession, iRestoreTypeVal) {
    if (addDisplayedSession.type == 'checkbox') {
        addDisplayedSession.checked = iRestoreTypeVal;
    } else if (addDisplayedSession.type == 'radio') {
        var adjustWindowTab = document.getElementsByName(addDisplayedSession.name);
        if (adjustWindowTab) {
            for (var i = 0; i < adjustWindowTab.length; i++) {
                if (adjustWindowTab[i].value == iRestoreTypeVal) {
                    adjustWindowTab[i].checked = true;
                    break;
                }
            }
        }
    } else {
        addDisplayedSession.value = iRestoreTypeVal;
    }
    addDisplayedSession.dataset.init = iRestoreTypeVal;
}

function vTransition(cb) {
    if ($('#compressOpts').hasClass('getDisplayedSession') && $('#opacityAnimation').hasClass('parseScheme')) {
        if ($.isFunction(cb)) {
            cb();
        }
        return;
    }
    if (activeTabVal) {
        activeTabVal();
        activeTabVal = null;
    }
    q('compressOpts').className = 'compressOpts getDisplayedSession';
    q('opacityAnimation').className = 'parseScheme';
    window.setTimeout(function() {
        q('compressOpts').style.display = 'none';
        q('opacityAnimation').style.display = 'none';
        if ($.isFunction(cb)) {
            cb();
        }
    }, 300);
    if (document.additive(q('compressOpts'), document.activeElement)) {
        document.activeElement.blur();
    }
    adjustImportedSession = true;
    $('#iPropNm').remove();
    $('#requestHonoredVal').remove();
    $('#extendedSessionConfig').remove();
    $('#iShowSuccessStatus').off('change', sessionTypeVal);
    $('#iShowSuccessStatus').remove();
}

function unifyActiveWindows() {
    document.body.addEventListener('mousemove', tokenIdIdxVal, true);
    document.body.addEventListener('mouseup', currentTabVal, true);
    q('compressOpts').startX = event.clientX;
    q('compressOpts').startY = event.clientY;
    q('compressOpts').startLeft = window.parseInt(q('compressOpts').style.left);
    q('compressOpts').startTop = window.parseInt(q('compressOpts').style.top);
    return false;
}

function currentTabVal() {
    document.body.removeEventListener('mousemove', tokenIdIdxVal, true);
    document.body.removeEventListener('mouseup', currentTabVal, true);
    return false;
}

function tokenIdIdxVal() {
    q('compressOpts').style.left = q('compressOpts').startLeft + event.clientX - q('compressOpts').startX + 'px';
    q('compressOpts').style.top = q('compressOpts').startTop + event.clientY - q('compressOpts').startY + 'px';
    q('compressOpts').style.display = 'none';
    q('compressOpts').offsetHeight;
    q('compressOpts').style.display = 'inline-block';
    return false;
}

function searchRequest(hideActiveTab) {
    if (hideActiveTab || hideActiveTab === '') {
        q('descVal').innerHTML = hideActiveTab;
    }
}

function iTypeVal(evalSbTokenVal) {
    if (u.isNumeric(evalSbTokenVal)) {
        q('compressOpts').style.width = window.parseInt(evalSbTokenVal) + 'px';
    }
}

function reloadTabSource() {
    if (updateSessionRoot() === 'JSON') {
        $('#iWidthVal').hide();
        $('#session2Val').hide();
        $('#evalRegisterValue4Val').show();
        $('#searchTab').show();
    } else {
        $('#iWidthVal').show();
        $('#session2Val').show();
        $('#evalRegisterValue4Val').hide();
        $('#searchTab').hide();
    }
    if (q('copyTabArray').value) {
        u.enable(q('finalCssClsIdx'));
        u.enable(q('sessionConfigVal'));
    } else {
        u.disable(q('finalCssClsIdx'));
        u.disable(q('sessionConfigVal'));
    }
}

function sDupeVal() {
    iRestoreType(q('copyTabArray'), 47);
}

function bHideURLs() {
    iRestoreType(q('evalSelectedLineitemsVal'), 37);
}

function iRestoreType(iSession2, offset) {
    if (event && event.which == 1) {
        q('compressOpts').style.width = parseInt(iSession2.style.width) + offset + 'px';
    }
}

function effectiveIdx() {
    document.body.removeEventListener('mousemove', bHideURLs, false);
}

function windowMode() {
    document.body.removeEventListener('keydown', conditionVal, false);
}

function bImgShowURLsVal() {
    document.body.removeEventListener('mousemove', sDupeVal, false);
    iContextFrom();
}

function evalSbSessionConfigsVal() {
    document.body.removeEventListener('keydown', toggleWindowMode, false);
    app.btnCaretBackward();
}

function setWindowSource(sbConfigsVal, iTabVal, iWindow1, btnCaretBackwardVal, arrayToCompare, currentLinkVal, registerTabAction, orientation_top) {
    var formatSessionTab = createElement('div', 'idxItem_' + sbConfigsVal.id, 'formatImportedSession');
    var allowUserIntActionVal = createElement('div', undefined, 'allowUserIntActionVal');
    var iModelConfig;
    if (arrayToCompare && (orientation_top === false || orientation_top !== sbConfigsVal.id)) {
        iModelConfig = createElement('div', 'delItem_' + iTabVal + '_' + iWindow1, 'modelConfigVal');
        iModelConfig.classList.add(orientation_top === false ? '_windowOffset' : '_tabOffset');
        iModelConfig.dataset.wSeq = iTabVal;
        iModelConfig.dataset.tSeq = iWindow1;
        iModelConfig.dataset.tid = sbConfigsVal.id;
        iModelConfig.addEventListener('click', arrayToCompare, false);
        allowUserIntActionVal.appendChild(iModelConfig);
    } else {
        allowUserIntActionVal.appendChild(createElement('div', null, 'syncDesc'));
    }
    iModelConfig = createElement('img', undefined, 'popActiveWindow');
    iModelConfig.setAttribute('src', app.windowConfig(sbConfigsVal));
    allowUserIntActionVal.appendChild(iModelConfig);
    if (sbConfigsVal.pinned) {
        iModelConfig = createElement('div', undefined, 'revise');
        $(iModelConfig).qtip({
            content: {
                text: 'This tab is pinned'
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                adjust: {
                    y: -9
                }
            },
            show: {
                delay: 500
            },
            style: {
                tip: {
                    corner: true,
                    width: 12
                }
            }
        });
        allowUserIntActionVal.appendChild(iModelConfig);
    }
    var registerValue2Val = createElement('a', undefined, 'registerValue2Val');
    registerValue2Val.textContent = app.bAppImportVal(sbConfigsVal);
    if (notifyWindowTab) {
        registerValue2Val.innerHTML = iMsVal(registerValue2Val.textContent, refreshTabArray || (refreshTabArray = new RegExp(u.iBaseDateVal(notifyWindowTab), 'gi')), 'requestWindowTab');
    }
    if (orientation_top === sbConfigsVal.id) {
        registerValue2Val.classList.add('topWindowIdx');
    } else {
        registerValue2Val.setAttribute('href', sbConfigsVal.url);
        if (orientation_top === false) {
            registerValue2Val.addEventListener('click', function(ev) {
                ev.preventDefault();
                BrowserAPI.searchSessionCache({
                    focused: !u.iContentText(ev),
                    url: sbConfigsVal.url,
                    pinned: sbConfigsVal.pinned,
                    incognito: sbConfigsVal.incognito
                }, function() {
                    saveDisplayedSession('syncPlacement', undefined, undefined, function() {
                        searchRequest('Incognito Disabled');
                        $('#tabSyncProgress').html('Session Buddy can\'t open an incognito tab<br>while incognito is disabled');
                    });
                });
            }, false);
        } else {
            registerValue2Val.addEventListener('click', function(ev) {
                ev.preventDefault();
                BrowserAPI.searchSessionCache({
                    focused: true,
                    id: sbConfigsVal.id,
                    url: sbConfigsVal.url,
                    pinned: sbConfigsVal.pinned,
                    incognito: sbConfigsVal.incognito
                });
            }, false);
        }
    }
    allowUserIntActionVal.appendChild(registerValue2Val);
    if (registerTabAction && app.notifyActiveTab(sbConfigsVal)) {
        registerValue2Val.style.fontStyle = 'italic';
    }
    formatSessionTab.appendChild(allowUserIntActionVal);
    if (btnCaretBackwardVal) {
        allowUserIntActionVal = createElement('div', undefined, 'updateSessionConfig');
        allowUserIntActionVal.textContent = sbConfigsVal.url;
        if (notifyWindowTab) {
            allowUserIntActionVal.innerHTML = iMsVal(allowUserIntActionVal.textContent, refreshTabArray || (refreshTabArray = new RegExp(u.iBaseDateVal(notifyWindowTab), 'gi')), 'refreshSessionWindow');
        }
        formatSessionTab.appendChild(allowUserIntActionVal);
    }
    return formatSessionTab;
}

function filterPreviousSession() {
    return 'cfAlias';
}

function truncateTabIdx(el, tRangePrimary, isolateTabRange) {
    var t = $(el), w = t.closest('.val1');
    if (w.length) {
        var c = $('#evalSbNm');
        var m = c.find('#primaryTabOuterButton');
        m = (m.length ? m : $('<div id="primaryTabOuterButton" class="evalSession1WindowIdx invisible"><div id="SessionUnhoverStyleInvert" class="serializeSessionTransactions">Copy to new session</div><div id="SessionHoverStyleInvert" class="serializeSessionTransactions">Move to new session</div><div id="windowTruncateIdx" class="sessionConfig1"></div><div id="TabHoverStyleInverted" class="serializeSessionTransactions">Open</div><div id="TabHoverStyleInvert" class="serializeSessionTransactions">Open incognito</div><div id="WindowHoverStyleInverted" class="serializeSessionTransactions">Open tabs</div><div id="WindowHoverStyleInvert" class="serializeSessionTransactions">Focus</div><div id="windowAppendIdx" class="sessionConfig1"></div><div id="SessionHoverStyle" class="serializeSessionTransactions">Rename</div><div id="SessionHoverStyleInverted" class="serializeSessionTransactions">Toggle incognito</div><div id="tabAppendIdx" class="sessionConfig1"></div><div id="TabHoverStyle" class="serializeSessionTransactions">Delete</div><div id="WindowHoverStyle" class="serializeSessionTransactions">Close</div></div>')).prependTo(w).removeClass('invisible');
        m.removeClass('addTabImageCounts');
        switch (tRangePrimary) {
          case 0:
            $('#windowTruncateIdx').show();
            $('#windowAppendIdx').show();
            $('#tabAppendIdx').show();
            if (isolateTabRange) {
                $('#TabHoverStyleInverted').hide();
                $('#WindowHoverStyleInverted').hide();
                $('#SessionHoverStyleInverted').text('Remove incognito');
            } else {
                $('#TabHoverStyleInverted').show();
                $('#WindowHoverStyleInverted').show();
                $('#SessionHoverStyleInverted').text('Make incognito');
            }
            $('#WindowHoverStyleInvert').hide();
            $('#SessionUnhoverStyleInvert').show().text('Copy to new session');
            $('#SessionHoverStyleInvert').show().text('Move to new session');
            $('#SessionHoverStyle').show();
            $('#SessionHoverStyleInverted').show();
            $('#TabHoverStyle').show();
            $('#WindowHoverStyle').hide();
            break;

          case 1:
            $('#windowTruncateIdx').hide();
            $('#windowAppendIdx').hide();
            $('#tabAppendIdx').hide();
            $('#TabHoverStyleInverted').hide();
            $('#TabHoverStyleInvert').hide();
            $('#WindowHoverStyleInverted').hide();
            $('#WindowHoverStyleInvert').hide();
            $('#SessionUnhoverStyleInvert').show().text('Save');
            $('#SessionHoverStyleInvert').hide();
            $('#SessionHoverStyle').hide();
            $('#SessionHoverStyleInverted').hide();
            $('#TabHoverStyle').hide();
            $('#WindowHoverStyle').hide();
            break;

          case 2:
            $('#windowTruncateIdx').show();
            $('#windowAppendIdx').show();
            $('#tabAppendIdx').hide();
            $('#TabHoverStyleInverted').hide();
            $('#TabHoverStyleInvert').hide();
            $('#WindowHoverStyleInverted').hide();
            $('#WindowHoverStyleInvert').show();
            $('#SessionUnhoverStyleInvert').show().text('Save');
            $('#SessionHoverStyleInvert').show().text('Save & close');
            $('#SessionHoverStyle').hide();
            $('#SessionHoverStyleInverted').hide();
            $('#TabHoverStyle').hide();
            $('#WindowHoverStyle').show();
            break;

          case 3:
            $('#windowTruncateIdx').show();
            $('#windowAppendIdx').hide();
            $('#tabAppendIdx').hide();
            if (isolateTabRange) {
                $('#TabHoverStyleInverted').hide();
                $('#WindowHoverStyleInverted').hide();
            } else {
                $('#TabHoverStyleInverted').show();
                $('#WindowHoverStyleInverted').show();
            }
            $('#WindowHoverStyleInvert').hide();
            $('#SessionUnhoverStyleInvert').show().text('Copy to new session');
            $('#SessionHoverStyleInvert').hide();
            $('#SessionHoverStyle').hide();
            $('#SessionHoverStyleInverted').hide();
            $('#TabHoverStyle').hide();
            $('#WindowHoverStyle').hide();
            break;
        }
        if (m.get(0).getBoundingClientRect().bottom > q('evalSbNm').clientHeight + 168) {
            m.addClass('addTabImageCounts');
        }
    }
}

function copyTabState(removedSessionConfigsVal, leafLineitemRenderDelegate, sortVal, iTokenId, adjustActiveSessionTab, arrayToCompare, tokenComponentImg, pTarget) {
    var val1 = createElement('div', 'seqItem_' + removedSessionConfigsVal.id, 'val1');
    val1.dataset.wSeq = leafLineitemRenderDelegate;
    val1.dataset.wid = removedSessionConfigsVal.id;
    if (removedSessionConfigsVal.nx_title) {
        $(val1).data('nx_title', removedSessionConfigsVal.nx_title);
    }
    if (adjustActiveSessionTab) {
        val1.setAttribute('style', 'margin-top:0px;');
    }
    if (arrayToCompare && (tokenComponentImg === false || tokenComponentImg !== removedSessionConfigsVal.id)) {
        var sbTailContainer = createElement('div', 'delItem_' + leafLineitemRenderDelegate, 'modelConfigVal');
        sbTailContainer.classList.add(tokenComponentImg === false ? '_windowOffset' : '_tabOffset');
        sbTailContainer.dataset.wSeq = leafLineitemRenderDelegate;
        sbTailContainer.dataset.wid = removedSessionConfigsVal.id;
        sbTailContainer.addEventListener('mousedown', function(ev) {
            if (ev.target.parentElement.classList.contains('tabTruncateIdx')) {
                ev.stopPropagation();
            }
        }, false);
        sbTailContainer.addEventListener('click', function(ev) {
            if (ev.target.parentElement.classList.contains('tabTruncateIdx')) {
                ev.stopPropagation();
                ev.stopImmediatePropagation();
            }
        }, true);
        sbTailContainer.addEventListener('click', arrayToCompare, false);
        val1.appendChild(sbTailContainer);
    } else {
        var dgp = createElement('div', null, 'syncDesc');
        val1.appendChild(dgp);
    }
    var bypassSessionMode = document.createElement('div');
    bypassSessionMode.dataset.wid = removedSessionConfigsVal.id;
    bypassSessionMode.spellcheck = false;
    var iShowURLsVal;
    bypassSessionMode.setAttribute('class', 'bypassSessionMode');
    var tRangePrimary;
    if (tokenComponentImg === false) {
        if (arrayToCompare) {
            tRangePrimary = 0;
        } else {
            tRangePrimary = 3;
        }
        bypassSessionMode.addEventListener('mousedown', function(ev) {
            if (ev.target.parentElement.classList.contains('tabTruncateIdx')) {
                ev.stopPropagation();
            }
        }, false);
        bypassSessionMode.addEventListener('dblclick', function(ev) {
            if (ev.target.parentElement.classList.contains('tabTruncateIdx')) {
                ev.stopPropagation();
                return;
            }
            app.iSetNm(selectWindowTab, 'RestoreSessionIntoASingleWindow', [ leafLineitemRenderDelegate - 1 ], null, null, function() {
                saveDisplayedSession('syncPlacement', undefined, undefined, function() {
                    searchRequest('Incognito Disabled');
                    $('#tabSyncProgress').html('Session Buddy can\'t open an incognito window<br>while incognito is disabled');
                });
            });
            $(this).qtip('hide');
            ev.preventDefault();
        }, false);
        iShowURLsVal = 'Double-click to open&nbsp;&nbsp;&nbsp;&#8226;&nbsp;&nbsp;&nbsp;Right-click for more actions';
    } else if (tokenComponentImg === removedSessionConfigsVal.id) {
        tRangePrimary = 1;
        val1.classList.add('sEnabled');
        iShowURLsVal = 'Right-click for actions';
    } else {
        tRangePrimary = 2;
        bypassSessionMode.addEventListener('dblclick', function(ev) {
            if (ev.target.parentElement.classList.contains('tabTruncateIdx')) {
                ev.stopPropagation();
                return;
            }
            BrowserAPI.focusWindow(parseInt(this.dataset.wid));
            $(this).qtip('hide');
            ev.preventDefault();
        }, false);
        iShowURLsVal = 'Double-click to focus&nbsp;&nbsp;&nbsp;&#8226;&nbsp;&nbsp;&nbsp;Right-click for more actions';
    }
    bypassSessionMode.addEventListener('contextmenu', function(ev) {
        var w = $(ev.target).closest('.val1');
        if (w.hasClass('tabTruncateIdx')) {
            ev.preventDefault();
            return;
        }
        $(this).qtip('hide');
        $(this).qtip('disable');
        ev.preventDefault();
        truncateTabIdx(ev.target, tRangePrimary, removedSessionConfigsVal.incognito);
    }, false);
    $(bypassSessionMode).qtip({
        content: {
            text: iShowURLsVal
        },
        position: {
            my: 'left center',
            at: 'right center',
            adjust: {
                x: 10
            }
        },
        show: {
            delay: 400
        },
        style: {
            tip: {
                corner: true,
                width: 12
            }
        }
    });
    var iModelConfig = document.createElement('div');
    bypassSessionMode.style.maxWidth = 'calc(100% - 60px)';
    bypassSessionMode.style.marginLeft = '2px';
    if (removedSessionConfigsVal.incognito) {
        iModelConfig.className = 'iFirstInList';
        $(iModelConfig).qtip({
            content: {
                text: 'This window is incognito'
            },
            position: {
                my: 'bottom center',
                at: 'top center',
                adjust: {
                    y: -9
                }
            },
            show: {
                delay: 500
            },
            style: {
                tip: {
                    corner: true,
                    width: 12
                }
            }
        });
    } else {
        iModelConfig.className = 'pinnedTabsUnder';
    }
    val1.appendChild(iModelConfig);
    bypassSessionMode.textContent = app.requireSessionSource(removedSessionConfigsVal, null, tokenComponentImg === removedSessionConfigsVal.id);
    val1.appendChild(bypassSessionMode);
    if (iTokenId && iTokenId > 0 && pTarget) {
        var copySavedSession = createElement('span', undefined, 'requestTabAction');
        copySavedSession.textContent = iTokenId + (iTokenId === 1 ? ' tab' : ' tabs');
        val1.appendChild(copySavedSession);
    }
    return val1;
}

function iMsVal(txt, re, className) {
    var arr = [], r = '';
    txt.replace(re, function(iWindow2, oMatchedTabs) {
        arr.push({
            string: iWindow2,
            offset: oMatchedTabs
        });
    });
    var cursor = 0, match;
    for (var i = 0; i < arr.length; i++) {
        match = arr[i];
        r += u.evalSeqProp(txt.substring(cursor, match.offset)) + '<span class="' + className + '">' + u.evalSeqProp(match.string) + '</span>';
        cursor = match.offset + match.string.length;
    }
    r += u.evalSeqProp(txt.substring(cursor));
    return r;
}

function foundTabCandidatesVal(maxCountVal, finalCssClsIdxVal, iStringVal) {
    if (u.isString(maxCountVal)) {
        if (iStringVal && maxCountVal) {
            q('iFinalCssClsVal').innerHTML = iMsVal(maxCountVal, refreshTabArray || (refreshTabArray = new RegExp(u.iBaseDateVal(notifyWindowTab), 'gi')), 'enableSel');
        } else {
            q('iFinalCssClsVal').textContent = maxCountVal;
        }
    }
    if (finalCssClsIdxVal) {
        adjustTabCount(finalCssClsIdxVal);
    } else {
        evalSelLengthVal();
    }
}

function adjustTabCount(finalCssClsIdxVal) {
    $('#iFinalCssClsVal').qtip({
        content: {
            text: finalCssClsIdxVal
        },
        position: {
            my: 'bottom left',
            at: 'top left',
            adjust: {
                x: 5,
                y: -8
            }
        },
        show: {
            delay: 300
        },
        style: {
            tip: {
                corner: true,
                width: 12,
                mimic: 'bottom center',
                offset: 5
            }
        }
    });
    q('iFinalCssClsVal').classList.add('iWindowId');
    q('iFinalCssClsVal').addEventListener('click', filterActiveTab, false);
    q('iFinalCssClsVal').addEventListener('mouseover', sessionRoot, false);
}

function sessionRoot() {
    $('#iFinalCssClsVal').qtip('enable');
}

function evalSelLengthVal() {
    $('#iFinalCssClsVal').qtip('hide');
    $('#iFinalCssClsVal').qtip('disable');
    q('iFinalCssClsVal').classList.remove('iWindowId');
    q('iFinalCssClsVal').removeEventListener('click', filterActiveTab);
    q('iFinalCssClsVal').removeEventListener('mouseover', sessionRoot);
}

function isNavPanelPositionRight(sbClrVal, evalSbRange) {
    if (sbClrVal || sbClrVal === '') {
        q('currentTime').innerHTML = sbClrVal;
    }
    if (evalSbRange || evalSbRange === '') {
        q('evalSClickOriginDelete').innerHTML = evalSbRange;
    }
}

function copyImportedSession(hideActiveTab) {
    if (hideActiveTab || hideActiveTab === '') {
        q('evalSbNm').innerHTML = hideActiveTab;
    }
}

function selectSessionTab(overrideProhibitedRefresh, serializeTabConfig, popTotal, syncTabMode, setSessionStat, evalSbClr, chromeSessionBackerVal, updateWindowCache, sessionTile_selected, updateWindowMode, evalOptionDescDisabledVal, objectVal) {
    this.filterTabArray = overrideProhibitedRefresh;
    this.resetTabMode = serializeTabConfig;
    this.sessionStatVal = popTotal;
    this.currentWindowState = $(syncTabMode);
    this.sbLink = setSessionStat;
    this.additiveVal = evalSbClr;
    this.dtLog = chromeSessionBackerVal;
    this.hideWindow = updateWindowCache;
    this.vrnElement = sessionTile_selected;
    this.updateWindowTitle = updateWindowMode;
    this.donotCache = evalOptionDescDisabledVal;
    this.idx4Val = objectVal;
    var onlyCountDupesVal = 50;
    var tabStat = 368;
    var doSync = 284;
    var evalSequence = 182;
    var moveWindowTab = 84;
    this.augmentSession = false;
    this.debugValRightVal = null;
    var that = this;
    this.iRerender = function() {
        that.sbSessionConfigsVal();
        var offsetX2 = !that.hideWindow.classList.contains('invisible');
        var sClickOriginDeleteVal = !that.idx4Val.classList.contains('invisible');
        if (sClickOriginDeleteVal && that.sessionStatVal.clientWidth > tabStat + onlyCountDupesVal) {
            that.donotCache.style.maxWidth = that.sessionStatVal.clientWidth - tabStat + 'px';
            that.idx4Val.style.display = that.hideWindow.style.display = '';
            that.vrnElement.style.display = that.updateWindowTitle.style.display = 'inline-block';
        } else if (offsetX2 && that.sessionStatVal.clientWidth > doSync + onlyCountDupesVal) {
            that.donotCache.style.maxWidth = that.sessionStatVal.clientWidth - doSync + 'px';
            that.idx4Val.style.display = 'none';
            that.hideWindow.style.display = '';
            that.vrnElement.style.display = that.updateWindowTitle.style.display = 'inline-block';
        } else if (that.sessionStatVal.clientWidth > evalSequence + onlyCountDupesVal) {
            that.donotCache.style.maxWidth = that.sessionStatVal.clientWidth - evalSequence + 'px';
            that.idx4Val.style.display = that.hideWindow.style.display = 'none';
            that.vrnElement.style.display = that.updateWindowTitle.style.display = 'inline-block';
        } else if (that.sessionStatVal.clientWidth > moveWindowTab + onlyCountDupesVal) {
            that.donotCache.style.maxWidth = that.sessionStatVal.clientWidth - moveWindowTab + 'px';
            that.idx4Val.style.display = that.hideWindow.style.display = that.vrnElement.style.display = 'none';
            that.updateWindowTitle.style.display = 'inline-block';
        } else {
            that.donotCache.style.maxWidth = that.sessionStatVal.clientWidth + 'px';
            that.idx4Val.style.display = that.hideWindow.style.display = that.vrnElement.style.display = that.updateWindowTitle.style.display = 'none';
        }
    };
    this.sbSessionConfigsVal = function(addWindowStatus) {
        var normalizeSavedSession = that.sessionStatVal.clientWidth;
        var bw = 10;
        var colorSessionTile = bw + (addWindowStatus || maxCount() ? 340 : 40);
        if (normalizeSavedSession < colorSessionTile) {
            that.currentWindowState.width(normalizeSavedSession - bw);
        } else if (normalizeSavedSession < colorSessionTile + 98) {
            that.currentWindowState.width(normalizeSavedSession - (bw + 57));
        } else if (normalizeSavedSession < colorSessionTile + 145) {
            that.currentWindowState.width(normalizeSavedSession - (bw + 155));
        } else {
            that.currentWindowState.width(normalizeSavedSession - (bw + 212));
        }
    };
    this.sbTokenDeletedCbVal = function(respVal) {
        if (respVal < 130) {
            respVal = 130;
        } else if (respVal > 500) {
            respVal = 500;
        } else {
            respVal = respVal - 5;
        }
        that.dtLog.style.width = respVal + 'px';
        that.additiveVal.style.width = respVal - 71 + 'px';
        that.sbLink.style.left = respVal + 'px';
        that.sessionStatVal.style.left = respVal + 10 + 'px';
        that.filterTabArray = parseInt(that.dtLog.style.width);
        that.iRerender();
    };
    this.unifyTabLineItems = function() {
        that.dtLog.style.left = '0px';
        that.dtLog.style.right = '';
        that.dtLog.style.width = that.filterTabArray + 'px';
        that.additiveVal.style.width = that.filterTabArray - 71 + 'px';
        that.sbLink.style.left = that.filterTabArray + 'px';
        that.sbLink.style.right = '';
        that.sessionStatVal.style.left = that.filterTabArray + 11 + 'px';
        that.sessionStatVal.style.right = '0px';
        that.sessionStatVal.style.width = '';
        q('suppressOpts').style.padding = '0px 0px 0px 9px';
        q('lnkClearSearch').style.paddingRight = '5px';
        q('lnkClearSearch').style.marginRight = '0px';
        q('evalSbNm').style.marginRight = '';
        q('evalSbNm').style.marginLeft = '';
        q('iSpeed').style.marginRight = '11px';
        q('iSpeed').style.marginLeft = '35px';
        q('assessStyleVal').style.marginRight = '11px';
        q('assessStyleVal').style.marginLeft = '35px';
        q('processSessionState').style.marginLeft = '35px';
        q('processSessionState').style.marginRight = '0px';
        q('iCountVal').style.right = '11px';
        q('initTabLayout').style.right = '80px';
        q('iBaseDate').style.right = '14px';
        q('iUrl').style.right = '17px';
        q('iFinalCssClsVal').style.marginLeft = '0';
        q('session2WindowIdx').style.right = '13px';
        that.resetTabMode.style.display = 'block';
    };
    window.addEventListener('resize', function() {
        that.iRerender();
    }, false);
    that.unifyTabLineItems();
    that.iRerender();
}

function parseCurrentSession(evalSbTailContainer, cb) {
    if (cb) {
        iPredicateVal.SBDB.expectStatusVal('seqInterpolation2', true, function(iChildCount) {
            iPredicateVal.SBDB.expectStatusVal(evalSbTailContainer, true, function(selTypeVal) {
                if (!selTypeVal || !u.isNumeric(selTypeVal)) {
                    iPredicateVal.SBDB.resetIcon(evalSbTailContainer, window.parseInt(iChildCount) + 10, function() {
                        cb(false);
                    });
                } else {
                    cb(window.parseInt(selTypeVal) > -1 && window.parseInt(selTypeVal) < window.parseInt(iChildCount));
                }
            });
        });
    }
}

function copyWindow(evalSbTailContainer, queue3, cb) {
    iPredicateVal.SBDB.expectStatusVal('seqInterpolation2', true, function(iChildCount) {
        iPredicateVal.SBDB.resetIcon(evalSbTailContainer, window.parseInt(iChildCount) + queue3, cb);
    });
}

function setSessionSource(evalSbTailContainer, queue3) {
    iPredicateVal.SBDB.expectStatusVal('seqInterpolation2', true, function(iChildCount) {
        iPredicateVal.SBDB.expectStatusVal(evalSbTailContainer, true, function(selTypeVal) {
            if (selTypeVal > -1 && queue3 > window.parseInt(selTypeVal) - window.parseInt(iChildCount)) {
                iPredicateVal.SBDB.resetIcon(evalSbTailContainer, window.parseInt(iChildCount) + queue3);
            }
        });
    });
}

function saveVal(evalSbTailContainer, cb) {
    iPredicateVal.SBDB.resetIcon(evalSbTailContainer, -1, cb);
}