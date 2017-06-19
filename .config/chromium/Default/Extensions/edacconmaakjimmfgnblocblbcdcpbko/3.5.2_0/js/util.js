/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

(function() {
    var u = this.u = {
        abstract: function(o, props, filteredOriginTabs) {
            var i, p, r = {};
            if (props) {
                for (i = props.length; i--; ) {
                    p = props[i];
                    if (o[p] != null) {
                        r[p] = o[p];
                    }
                }
            }
            if (filteredOriginTabs) {
                for (i = filteredOriginTabs.length; i--; ) {
                    p = filteredOriginTabs[i];
                    r[p] = !!o[p];
                }
            }
            return r;
        },
        find: function(arr, prop, val) {
            for (var i = arr.length; i--; ) {
                if (arr[i][prop] === val) {
                    return arr[i];
                }
            }
        },
        move: function(arr, o, p) {
            if (u.isUndefined(p)) {
                p = -1;
            }
            arr = arr || [];
            if (u.isUndefined(o)) {
                return arr;
            }
            var i = arr.indexOf(o);
            if (i > -1) {
                if (i === p) {
                    return arr;
                }
                o = arr.splice(i, 1)[0];
                if (p < 0) {
                    p = Math.max(arr.length + 1 + p, 0);
                }
                arr.splice(p, 0, o);
            }
            return arr;
        },
        iNoTextVal: function(iArrayToCompareVal, iExtendedCacheDelay) {
            var windowStat = iArrayToCompareVal.keyCode == 18;
            var positionTabLineItem = iExtendedCacheDelay && !iArrayToCompareVal.shiftKey && (!iArrayToCompareVal.ctrlKey && !iArrayToCompareVal.metaKey && u.sessionNmVal === 'MacOS' || !iArrayToCompareVal.altKey && u.sessionNmVal !== 'MacOS');
            return (iArrayToCompareVal.keyCode == 17 && u.sessionNmVal !== 'MacOS' || windowStat && u.sessionNmVal === 'MacOS') && (!iExtendedCacheDelay || positionTabLineItem);
        },
        iContentText: function(iArrayToCompareVal) {
            return iArrayToCompareVal.ctrlKey && u.sessionNmVal !== 'MacOS' || iArrayToCompareVal.altKey && u.sessionNmVal === 'MacOS';
        },
        contentShw: function(iArrayToCompareVal) {
            return iArrayToCompareVal.shiftKey || iArrayToCompareVal.altKey || iArrayToCompareVal.ctrlKey || iArrayToCompareVal.metaKey;
        },
        showImportedSession: function(idx6Val) {
            return idx6Val == 46 && u.sessionNmVal !== 'MacOS' || idx6Val == 8 && u.sessionNmVal === 'MacOS';
        },
        iBaseDateVal: function(iSessionStorageKey) {
            return iSessionStorageKey.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        },
        evalSeqProp: function(iSessionStorageKey) {
            var iFilter = window.createElement('div');
            iFilter.innerText = iSessionStorageKey;
            return iFilter.innerHTML.replace(/ /g, '&nbsp;');
        },
        deferRemoveSessionConfigs: function(spt) {
            return window.createElement('div', undefined, undefined, spt).innerText;
        },
        txAltVal: function(evalSessionRootVal) {
            return evalSessionRootVal.getAttribute('disabled') === null;
        },
        disable: function(evalSessionRootVal) {
            evalSessionRootVal.setAttribute('disabled', 'disabled');
        },
        enable: function(evalSessionRootVal) {
            evalSessionRootVal.removeAttribute('disabled');
        },
        severityVal: function(renderWindowTitle) {
            if (renderWindowTitle === null || renderWindowTitle === undefined || renderWindowTitle === '') {
                return undefined;
            } else {
                return JSON.parse(renderWindowTitle);
            }
        },
        cachePtPair: function(lineitemElSelectedVal) {
            if (lineitemElSelectedVal) {
                if (lineitemElSelectedVal.indexOf('T') > 0) {
                    return +Date.parse(lineitemElSelectedVal);
                } else {
                    var cfgId = lineitemElSelectedVal.split('-');
                    if (cfgId.length == 6) {
                        return Date.UTC(cfgId[0], cfgId[1], cfgId[2], cfgId[3], cfgId[4], cfgId[5]);
                    }
                }
            }
            return undefined;
        },
        updateTabMode: function() {
            var o = {};
            Error.captureStackTrace(o, u.updateTabMode);
            return o.stack;
        },
        notifyDisplayedSession: function(refreshWindowSource, idx6) {
            var predicateVal = refreshWindowSource.trim().toLowerCase();
            if (idx6) {
                var iSessionType = refreshWindowSource.indexOf('#');
                var saveActiveWindow = refreshWindowSource.indexOf('?');
                var windowLayout = Math.min(iSessionType, saveActiveWindow);
                if (windowLayout == -1) {
                    windowLayout = Math.max(iSessionType, saveActiveWindow);
                    if (windowLayout > -1) {
                        predicateVal = predicateVal.substring(0, windowLayout);
                    }
                } else {
                    predicateVal = predicateVal.substring(0, windowLayout);
                }
            }
            return predicateVal;
        },
        isObject: function(o) {
            return typeof o === 'object' && !!o;
        },
        isFunction: function(o) {
            return Object.prototype.toString.call(o) === '[object Function]';
        },
        isArray: function(o) {
            return Object.prototype.toString.call(o) === '[object Array]';
        },
        isString: function(o) {
            return Object.prototype.toString.call(o) === '[object String]';
        },
        isNumber: function(o) {
            return Object.prototype.toString.call(o) === '[object Number]';
        },
        isDate: function(o) {
            return Object.prototype.toString.call(o) === '[object Date]';
        },
        isUndefined: function(o) {
            return o === void 0;
        },
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        allCountVal: function(wins, flashSession) {
            for (var i = 0; i < wins.length; i++) {
                wins[i].focused = wins[i].id == flashSession;
            }
            return wins;
        },
        dedupeSessions: function(sbConfigsVal) {
            return sbConfigsVal.url && (sbConfigsVal.url.startsWith('chrome:') || sbConfigsVal.url.startsWith('chrome-devtools:') || u.addCurrentWindow(sbConfigsVal));
        },
        isNewTab: function(sbConfigsVal) {
            return /^chrome\:\/\/newtab\/?$/.test(sbConfigsVal.url);
        },
        addCurrentWindow: function(sbConfigsVal) {
            return sbConfigsVal.url && (sbConfigsVal.url.startsWith('chrome-extension://eemcgdkfndhakfknompkggombfjjjeno') || sbConfigsVal.url.startsWith('chrome://bookmarks/'));
        },
        subElsVal: function(evalRStyleVal, showSessionWindow) {
            return evalRStyleVal.url == showSessionWindow.url && (evalRStyleVal.selected == showSessionWindow.selected || evalRStyleVal.active == showSessionWindow.active) && evalRStyleVal.pinned == showSessionWindow.pinned && evalRStyleVal.incognito == showSessionWindow.incognito;
        },
        evalOrder: function(event) {
            if (event.srcElement.scrollTop <= 0 && event.wheelDeltaY > 0 || event.srcElement.scrollHeight <= event.srcElement.scrollTop + event.srcElement.clientHeight && event.wheelDeltaY < 0) {
                event.preventDefault();
            }
        },
        serializeWindowTab: function(groupSubheaderToAdjust, excl8) {
            var panelLocationIsKnown = '' + groupSubheaderToAdjust;
            while (panelLocationIsKnown.length < excl8) {
                panelLocationIsKnown = '0' + panelLocationIsKnown;
            }
            return panelLocationIsKnown;
        },
        txtComponentMainVal: function(reloadCurrentSession, removedSessionConfigsVal, cb) {
            if (reloadCurrentSession) {
                var actionNm = +new Date();
                function loop(isTextComponentVal) {
                    if (isTextComponentVal - actionNm <= 0 || reloadCurrentSession(isTextComponentVal - actionNm)) {
                        (removedSessionConfigsVal || window).requestAnimationFrame(loop);
                        actionNm = isTextComponentVal;
                    } else {
                        if (cb) {
                            cb();
                        }
                    }
                }
                loop(actionNm);
            } else {
                if (cb) {
                    cb();
                }
            }
        },
        iWindow: function(reloadTabCache, mergeWindowArray, augmentTabCache, evalSessionNmVal, expectStatus, removedSessionConfigsVal, cb) {
            if (reloadTabCache && reloadTabCache.length > 0) {
                if (!mergeWindowArray) {
                    mergeWindowArray = 250;
                }
                if (!augmentTabCache) {
                    augmentTabCache = 'pop';
                }
                if (removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle) {
                    evalSessionNmVal = false;
                    augmentTabCache = 'none';
                }
                var getSessionWindow = [];
                var posString = null;
                var registerItem = 0;
                for (var i = 0; i < reloadTabCache.length; i++) {
                    for (var j = 0; j < reloadTabCache[i].length; j++) {
                        if (reloadTabCache[i][j] && (removedSessionConfigsVal || window).document.iApplicationExVal(reloadTabCache[i][j])) {
                            posString = (removedSessionConfigsVal || window).adjustWindow(reloadTabCache[i][j]);
                            if (posString.totalHeight > 0) {
                                getSessionWindow.push({
                                    element: reloadTabCache[i][j],
                                    height: reloadTabCache[i][j].style.height,
                                    paddingTop: reloadTabCache[i][j].style.paddingTop,
                                    paddingBottom: reloadTabCache[i][j].style.paddingBottom,
                                    borderTopWidth: reloadTabCache[i][j].style.borderTopWidth,
                                    borderBottomWidth: reloadTabCache[i][j].style.borderBottomWidth,
                                    overflowY: reloadTabCache[i][j].style.getPropertyValue('overflow-y'),
                                    opacity: reloadTabCache[i][j].style.opacity,
                                    metrics: posString,
                                    speed: mergeWindowArray / posString.totalHeight,
                                    totalElementHeight: posString.totalHeight,
                                    resetActiveWindow: false
                                });
                                if (expectStatus && expectStatus.length > 0) {
                                    getSessionWindow[getSessionWindow.length - 1]['syncCurrentTab'] = expectStatus[registerItem];
                                    if (registerItem + 1 < expectStatus.length) {
                                        registerItem++;
                                    }
                                }
                                reloadTabCache[i][j].style.setProperty('overflow-y', 'hidden');
                                reloadTabCache[i][j].style.borderTopWidth = posString.borderTopWidth + 'px';
                                reloadTabCache[i][j].style.borderBottomWidth = posString.borderBottomWidth + 'px';
                                reloadTabCache[i][j].style.paddingTop = posString.paddingTop + 'px';
                                reloadTabCache[i][j].style.paddingBottom = posString.paddingBottom + 'px';
                                reloadTabCache[i][j].style.height = posString.height + 'px';
                                if (augmentTabCache == 'pop') {
                                    reloadTabCache[i][j].classList.add('headerDataSaved');
                                }
                            } else {
                                reloadTabCache[i][j].parentNode.removeChild(reloadTabCache[i][j]);
                            }
                        }
                    }
                }
                if (getSessionWindow.length > 0) {
                    var showSessionTab = true;
                    var exceptionVal = 0;
                    if (evalSessionNmVal) {
                        for (var i = 0; i < getSessionWindow.length; i++) {
                            exceptionVal += getSessionWindow[i].metrics.totalHeight;
                        }
                        exceptionVal = mergeWindowArray / exceptionVal;
                    }
                    return function(lowerLimit) {
                        var adjustment;
                        if (evalSessionNmVal) {
                            adjustment = lowerLimit / exceptionVal;
                        } else {
                            showSessionTab = true;
                        }
                        var isPanelPositionRequired = 0;
                        for (var i = 0; i < getSessionWindow.length; i++) {
                            if (!getSessionWindow[i].resetActiveWindow) {
                                if (!evalSessionNmVal) {
                                    adjustment = lowerLimit / getSessionWindow[i].speed;
                                }
                                adjustment = window.parseFloat(adjustment.toFixed(10)) + isPanelPositionRequired;
                                getSessionWindow[i].totalElementHeight -= adjustment;
                                if ((getSessionWindow[i].resetActiveWindow = getSessionWindow[i].totalElementHeight <= 0) || removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle) {
                                    if (getSessionWindow[i].syncCurrentTab) {
                                        getSessionWindow[i].element.style.height = getSessionWindow[i].height;
                                        getSessionWindow[i].element.style.paddingTop = getSessionWindow[i].paddingTop;
                                        getSessionWindow[i].element.style.paddingBottom = getSessionWindow[i].paddingBottom;
                                        getSessionWindow[i].element.style.borderTopWidth = getSessionWindow[i].borderTopWidth;
                                        getSessionWindow[i].element.style.borderBottomWidth = getSessionWindow[i].borderBottomWidth;
                                        getSessionWindow[i].element.style.setProperty('overflow-y', getSessionWindow[i].overflowY);
                                        getSessionWindow[i].element.style.opacity = getSessionWindow[i].opacity;
                                        getSessionWindow[i].element.classList.add(getSessionWindow[i].syncCurrentTab);
                                    } else {
                                        getSessionWindow[i].element.parentNode.removeChild(getSessionWindow[i].element);
                                    }
                                } else {
                                    if (augmentTabCache == 'fade') {
                                        getSessionWindow[i].element.style.opacity = (getSessionWindow[i].opacity === '' ? 1 : getSessionWindow[i].opacity) * getSessionWindow[i].totalElementHeight / getSessionWindow[i].metrics.totalHeight;
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth) > 0) {
                                        if (adjustment >= window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth)) {
                                            adjustment -= window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth);
                                            getSessionWindow[i].element.style.borderBottomWidth = '0px';
                                        } else {
                                            getSessionWindow[i].element.style.borderBottomWidth = window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth) - adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.paddingBottom) > 0) {
                                        if (adjustment >= window.parseFloat(getSessionWindow[i].element.style.paddingBottom)) {
                                            adjustment -= window.parseFloat(getSessionWindow[i].element.style.paddingBottom);
                                            getSessionWindow[i].element.style.paddingBottom = '0px';
                                        } else {
                                            getSessionWindow[i].element.style.paddingBottom = window.parseFloat(getSessionWindow[i].element.style.paddingBottom) - adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.height) > 0) {
                                        if (adjustment >= window.parseFloat(getSessionWindow[i].element.style.height)) {
                                            adjustment -= window.parseFloat(getSessionWindow[i].element.style.height);
                                            getSessionWindow[i].element.style.height = '0px';
                                        } else {
                                            getSessionWindow[i].element.style.height = window.parseFloat(getSessionWindow[i].element.style.height) - adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.paddingTop) > 0) {
                                        if (adjustment >= window.parseFloat(getSessionWindow[i].element.style.paddingTop)) {
                                            adjustment -= window.parseFloat(getSessionWindow[i].element.style.paddingTop);
                                            getSessionWindow[i].element.style.paddingTop = '0px';
                                        } else {
                                            getSessionWindow[i].element.style.paddingTop = window.parseFloat(getSessionWindow[i].element.style.paddingTop) - adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.borderTopWidth) > 0) {
                                        if (adjustment >= window.parseFloat(getSessionWindow[i].element.style.borderTopWidth)) {
                                            adjustment -= window.parseFloat(getSessionWindow[i].element.style.borderTopWidth);
                                            getSessionWindow[i].element.style.borderTopWidth = '0px';
                                        } else {
                                            getSessionWindow[i].element.style.borderTopWidth = window.parseFloat(getSessionWindow[i].element.style.borderTopWidth) - adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    isPanelPositionRequired = adjustment;
                                }
                                if (evalSessionNmVal) {
                                    break;
                                }
                            }
                            if (!evalSessionNmVal) {
                                showSessionTab = showSessionTab && getSessionWindow[i].resetActiveWindow;
                            }
                        }
                        if (removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle || evalSessionNmVal && i === getSessionWindow.length || !evalSessionNmVal && showSessionTab) {
                            if (cb) {
                                cb();
                            }
                            return false;
                        }
                    };
                } else {
                    if (cb) {
                        cb();
                    }
                }
            } else {
                if (cb) {
                    cb();
                }
            }
        },
        iObject: function(reloadTabCache, evalSbTailArray, mergeWindowArray, referralFilteringOpts, augmentTabCache, evalSessionNmVal, removedSessionConfigsVal, cb) {
            if (reloadTabCache && reloadTabCache.length > 0 && evalSbTailArray) {
                if (!mergeWindowArray) {
                    mergeWindowArray = 150;
                }
                if (!augmentTabCache) {
                    augmentTabCache = 'pop';
                }
                if (removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle) {
                    evalSessionNmVal = false;
                    augmentTabCache = 'none';
                }
                var getSessionWindow = [];
                var posString = null;
                var isDOMElement = null;
                var hideSessionWindow = 0;
                for (var i = 0; i < reloadTabCache.length; i++) {
                    for (var j = 0; j < reloadTabCache[i].length; j++) {
                        if (reloadTabCache[i][j]) {
                            posString = (removedSessionConfigsVal || window).adjustWindow(reloadTabCache[i][j], evalSbTailArray);
                            isDOMElement = (removedSessionConfigsVal || window).document.iApplicationExVal(reloadTabCache[i][j]);
                            if (posString.totalHeight > 0) {
                                getSessionWindow.push({
                                    element: reloadTabCache[i][j],
                                    height: reloadTabCache[i][j].style.height,
                                    paddingTop: reloadTabCache[i][j].style.paddingTop,
                                    paddingBottom: reloadTabCache[i][j].style.paddingBottom,
                                    borderTopWidth: reloadTabCache[i][j].style.borderTopWidth,
                                    borderBottomWidth: reloadTabCache[i][j].style.borderBottomWidth,
                                    overflowY: reloadTabCache[i][j].style.getPropertyValue('overflow-y'),
                                    opacity: reloadTabCache[i][j].style.opacity,
                                    metrics: posString,
                                    speed: mergeWindowArray / posString.totalHeight,
                                    isDOMElement: isDOMElement,
                                    totalElementHeight: 0,
                                    resetActiveWindow: false
                                });
                                reloadTabCache[i][j].style.setProperty('overflow-y', 'hidden');
                                reloadTabCache[i][j].style.height = '0px';
                                reloadTabCache[i][j].style.paddingTop = '0px';
                                reloadTabCache[i][j].style.paddingBottom = '0px';
                                reloadTabCache[i][j].style.borderTopWidth = '0px';
                                reloadTabCache[i][j].style.borderBottomWidth = '0px';
                                if (augmentTabCache == 'fade' || augmentTabCache == 'pop') {
                                    reloadTabCache[i][j].style.opacity = '0';
                                }
                            }
                            if (!isDOMElement) {
                                if (referralFilteringOpts && referralFilteringOpts.length > 0) {
                                    evalSbTailArray.insertBefore(reloadTabCache[i][j], referralFilteringOpts[hideSessionWindow]);
                                    if (hideSessionWindow + 1 < referralFilteringOpts.length) {
                                        hideSessionWindow++;
                                    }
                                } else {
                                    evalSbTailArray.appendChild(reloadTabCache[i][j]);
                                }
                            }
                        }
                    }
                }
                if (getSessionWindow.length > 0) {
                    var showSessionTab = true;
                    var exceptionVal = 0;
                    if (evalSessionNmVal) {
                        for (var i = 0; i < getSessionWindow.length; i++) {
                            exceptionVal += getSessionWindow[i].metrics.totalHeight;
                        }
                        exceptionVal = mergeWindowArray / exceptionVal;
                    }
                    return function(lowerLimit) {
                        var adjustment;
                        if (evalSessionNmVal) {
                            adjustment = lowerLimit / exceptionVal;
                        } else {
                            showSessionTab = true;
                        }
                        var isPanelPositionRequired = 0;
                        for (var i = 0; i < getSessionWindow.length; i++) {
                            if (!getSessionWindow[i].resetActiveWindow) {
                                if (!evalSessionNmVal) {
                                    adjustment = lowerLimit / getSessionWindow[i].speed;
                                }
                                adjustment = window.parseFloat(adjustment.toFixed(10)) + isPanelPositionRequired;
                                getSessionWindow[i].totalElementHeight += adjustment;
                                if ((getSessionWindow[i].resetActiveWindow = getSessionWindow[i].totalElementHeight > getSessionWindow[i].metrics.totalHeight) || removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle) {
                                    getSessionWindow[i].element.style.height = getSessionWindow[i].height;
                                    getSessionWindow[i].element.style.paddingTop = getSessionWindow[i].paddingTop;
                                    getSessionWindow[i].element.style.paddingBottom = getSessionWindow[i].paddingBottom;
                                    getSessionWindow[i].element.style.borderTopWidth = getSessionWindow[i].borderTopWidth;
                                    getSessionWindow[i].element.style.borderBottomWidth = getSessionWindow[i].borderBottomWidth;
                                    getSessionWindow[i].element.style.setProperty('overflow-y', getSessionWindow[i].overflowY);
                                    getSessionWindow[i].element.style.opacity = getSessionWindow[i].opacity;
                                } else {
                                    if (augmentTabCache == 'fade') {
                                        getSessionWindow[i].element.style.opacity = (getSessionWindow[i].opacity === '' ? 1 : getSessionWindow[i].opacity) * getSessionWindow[i].totalElementHeight / getSessionWindow[i].metrics.totalHeight;
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.borderTopWidth) < getSessionWindow[i].metrics.borderTopWidth) {
                                        if (adjustment >= getSessionWindow[i].metrics.borderTopWidth - window.parseFloat(getSessionWindow[i].element.style.borderTopWidth)) {
                                            adjustment -= getSessionWindow[i].metrics.borderTopWidth - window.parseFloat(getSessionWindow[i].element.style.borderTopWidth);
                                            getSessionWindow[i].element.style.borderTopWidth = getSessionWindow[i].metrics.borderTopWidth + 'px';
                                        } else {
                                            getSessionWindow[i].element.style.borderTopWidth = window.parseFloat(getSessionWindow[i].element.style.borderTopWidth) + adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.paddingTop) < getSessionWindow[i].metrics.paddingTop) {
                                        if (adjustment >= getSessionWindow[i].metrics.paddingTop - window.parseFloat(getSessionWindow[i].element.style.paddingTop)) {
                                            adjustment -= getSessionWindow[i].metrics.paddingTop - window.parseFloat(getSessionWindow[i].element.style.paddingTop);
                                            getSessionWindow[i].element.style.paddingTop = getSessionWindow[i].metrics.paddingTop + 'px';
                                        } else {
                                            getSessionWindow[i].element.style.paddingTop = window.parseFloat(getSessionWindow[i].element.style.paddingTop) + adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.height) < getSessionWindow[i].metrics.height) {
                                        if (adjustment >= getSessionWindow[i].metrics.height - window.parseFloat(getSessionWindow[i].element.style.height)) {
                                            adjustment -= getSessionWindow[i].metrics.height - window.parseFloat(getSessionWindow[i].element.style.height);
                                            getSessionWindow[i].element.style.height = getSessionWindow[i].metrics.height + 'px';
                                        } else {
                                            getSessionWindow[i].element.style.height = window.parseFloat(getSessionWindow[i].element.style.height) + adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.paddingBottom) < getSessionWindow[i].metrics.paddingBottom) {
                                        if (adjustment >= getSessionWindow[i].metrics.paddingBottom - window.parseFloat(getSessionWindow[i].element.style.paddingBottom)) {
                                            adjustment -= getSessionWindow[i].metrics.paddingBottom - window.parseFloat(getSessionWindow[i].element.style.paddingBottom);
                                            getSessionWindow[i].element.style.paddingBottom = getSessionWindow[i].metrics.paddingBottom + 'px';
                                        } else {
                                            getSessionWindow[i].element.style.paddingBottom = window.parseFloat(getSessionWindow[i].element.style.paddingBottom) + adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    if (adjustment > 0 && window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth) < getSessionWindow[i].metrics.borderBottomWidth) {
                                        if (adjustment >= getSessionWindow[i].metrics.borderBottomWidth - window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth)) {
                                            adjustment -= getSessionWindow[i].metrics.borderBottomWidth - window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth);
                                            getSessionWindow[i].element.style.borderBottomWidth = getSessionWindow[i].metrics.borderBottomWidth + 'px';
                                        } else {
                                            getSessionWindow[i].element.style.borderBottomWidth = window.parseFloat(getSessionWindow[i].element.style.borderBottomWidth) + adjustment + 'px';
                                            adjustment = 0;
                                        }
                                    }
                                    isPanelPositionRequired = adjustment;
                                }
                                if (evalSessionNmVal) {
                                    break;
                                }
                            }
                            if (!evalSessionNmVal) {
                                showSessionTab = showSessionTab && getSessionWindow[i].resetActiveWindow;
                            }
                        }
                        if (removedSessionConfigsVal.document.webkitHidden || app.copyTabTitle || evalSessionNmVal && i === getSessionWindow.length || !evalSessionNmVal && showSessionTab) {
                            if (cb) {
                                cb();
                            }
                            return false;
                        }
                    };
                } else {
                    if (cb) {
                        cb();
                    }
                }
            } else {
                if (cb) {
                    cb();
                }
            }
        },
        os: function() {
            if (navigator.appVersion.indexOf('Win') != -1) {
                return 'Windows';
            }
            if (navigator.appVersion.indexOf('Mac') != -1) {
                return 'MacOS';
            }
            if (navigator.appVersion.indexOf('X11') != -1) {
                return 'UNIX';
            }
            if (navigator.appVersion.indexOf('Linux') != -1) {
                return 'Linux';
            }
            return '(unknown)';
        },
        addTitle: function() {
            return window.devicePixelRatio || 1;
        },
        qlift7: function(el, w) {
            el.focus();
            var range = (w || window).document.createRange();
            range.selectNodeContents(el);
            var sel = (w || window).getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };
    u.sessionNmVal = u.os();
    String.prototype.evalOptionDescDisabled = function() {
        return '"' + this.replace(/\"/g, '""') + '"';
    };
    String.prototype.contains = function(val) {
        return this.indexOf(val) > -1;
    };
    Array.prototype.contains = function(val) {
        return this.indexOf(val) > -1;
    };
    Array.prototype.compare = function(contentSep) {
        if (this.length !== contentSep.length) {
            return false;
        }
        for (var i = 0; i < this.length; i++) {
            if (this[i] !== contentSep[i]) {
                return false;
            }
        }
        return true;
    };
    Date.prototype.cacheIdVal = function(evalSbWindowVal, copyTabFavicon) {
        var timeBefore = new Date();
        timeBefore = new Date(timeBefore.getFullYear(), timeBefore.getMonth(), timeBefore.getDate());
        var iType = copyTabFavicon === undefined || copyTabFavicon === null ? 'searchWindow' : copyTabFavicon;
        if (this.toDateString() == timeBefore.toDateString()) {
            iType = 'copyTabUrl';
        } else if (this > timeBefore) {
            iType = 'addImportedSession';
        } else {
            var yesterday = new Date(timeBefore);
            yesterday.setDate(timeBefore.getDate() - 1);
            if (yesterday.toDateString() == this.toDateString()) {
                iType = 'tokenComponent';
            } else {
                var showOptionsDialog = new Date(timeBefore);
                showOptionsDialog.setDate(timeBefore.getDate() - timeBefore.getDay());
                if (this > showOptionsDialog) {
                    iType = 'iterateCurrentSession';
                } else {
                    var iTabCountVal = new Date(showOptionsDialog);
                    iTabCountVal.setDate(showOptionsDialog.getDate() - 7);
                    if (this > iTabCountVal) {
                        iType = 'cacheActiveTab';
                    } else {
                        var tabStatusVal = new Date(iTabCountVal);
                        tabStatusVal.setDate(iTabCountVal.getDate() - 7);
                        if (this > tabStatusVal) {
                            iType = 'iSelLength';
                        } else {
                            var updateTabCount = new Date(tabStatusVal);
                            updateTabCount.setDate(tabStatusVal.getDate() - 7);
                            if (this > updateTabCount) {
                                iType = 'saveCurrentSession';
                            } else {
                                var initTabList = new Date(timeBefore);
                                initTabList.setMonth(timeBefore.getMonth() - 1, 1);
                                if (this > initTabList) {
                                    iType = 'evalPosStringVal';
                                } else {
                                    var negateSort = new Date(timeBefore.getFullYear(), 0, 1);
                                    if (this > negateSort) {
                                        iType = 'evalRegisterValue5';
                                    } else {
                                        var concatenate = new Date(timeBefore);
                                        concatenate.setFullYear(timeBefore.getFullYear() - 1, 0, 1);
                                        if (this > concatenate) {
                                            iType = 'initWindowSource';
                                        } else {
                                            iType = evalSbWindowVal === undefined || evalSbWindowVal === null ? 'formatWindowTab' : evalSbWindowVal;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return iType;
    };
    window.q = function(str) {
        return this.document.getElementById(str);
    };
    window.isAllowLoggingVal = function(notifyCurrentTab, delayCacheSession) {
        if (notifyCurrentTab) {
            if (delayCacheSession) {
                if (delayCacheSession.hasChildNodes()) {
                    var noReloadVal = null;
                    for (var i = 0; i < delayCacheSession.children.length; i++) {
                        if (delayCacheSession.children[i].id == notifyCurrentTab) {
                            noReloadVal = delayCacheSession.children[i];
                        } else {
                            noReloadVal = this.isAllowLoggingVal(notifyCurrentTab, delayCacheSession.children[i]);
                        }
                        if (noReloadVal) {
                            return noReloadVal;
                        }
                    }
                }
            } else {
                return this.q(notifyCurrentTab);
            }
        }
        return null;
    };
    window.createElement = function(sDebugVal, notifyCurrentTab, chrIdxHashVal, augmentCurrentSessionCache) {
        if (typeof sDebugVal == 'string') {
            sDebugVal = this.document.createElement(sDebugVal);
            if (notifyCurrentTab) {
                sDebugVal.id = notifyCurrentTab;
            }
            if (typeof chrIdxHashVal == 'string') {
                if (chrIdxHashVal.indexOf(':') > -1) {
                    sDebugVal.setAttribute('style', chrIdxHashVal);
                } else if (chrIdxHashVal.trim().length > 0) {
                    sDebugVal.className = chrIdxHashVal;
                }
            }
            if (typeof augmentCurrentSessionCache == 'string' || typeof augmentCurrentSessionCache == 'number') {
                sDebugVal.innerHTML = augmentCurrentSessionCache;
            }
            return sDebugVal;
        }
        return null;
    };
    window.adjustWindow = function(iTokenHTML, countVal) {
        if (iTokenHTML) {
            if (!countVal) {
                if (this.document.iApplicationExVal(iTokenHTML)) {
                    countVal = iTokenHTML.parentNode;
                } else {
                    countVal = this.document.body;
                }
            }
            var setTabConfig = false;
            iTokenHTML = iTokenHTML.cloneNode(true);
            countVal.appendChild(iTokenHTML);
            setTabConfig = true;
            var iCurrentSettingsVal = iTokenHTML.style.paddingTop;
            var searchActiveWindow = iTokenHTML.style.paddingBottom;
            var orderVal = iTokenHTML.style.borderTopWidth;
            var evalRangeSelectVal = iTokenHTML.style.borderBottomWidth;
            var sbSelMode = iTokenHTML.getBoundingClientRect().height;
            iTokenHTML.style.paddingTop = '0px';
            var rangeSelectVal = sbSelMode - iTokenHTML.getBoundingClientRect().height;
            iTokenHTML.style.borderTopWidth = '0px';
            var resetWindowCount = sbSelMode - iTokenHTML.getBoundingClientRect().height - rangeSelectVal;
            iTokenHTML.style.paddingBottom = '0px';
            var adjustCurrentWindow = sbSelMode - iTokenHTML.getBoundingClientRect().height - rangeSelectVal - resetWindowCount;
            iTokenHTML.style.borderBottomWidth = '0px';
            var evalOptimizeSessionCombine = sbSelMode - iTokenHTML.getBoundingClientRect().height - rangeSelectVal - resetWindowCount - adjustCurrentWindow;
            iTokenHTML.style.paddingTop = iCurrentSettingsVal;
            iTokenHTML.style.paddingBottom = searchActiveWindow;
            iTokenHTML.style.borderTopWidth = orderVal;
            iTokenHTML.style.borderBottomWidth = evalRangeSelectVal;
            var stats = {
                totalHeight: sbSelMode,
                height: sbSelMode - rangeSelectVal - adjustCurrentWindow - resetWindowCount - evalOptimizeSessionCombine,
                paddingTop: rangeSelectVal,
                paddingBottom: adjustCurrentWindow,
                borderTopWidth: resetWindowCount,
                borderBottomWidth: evalOptimizeSessionCombine
            };
            if (setTabConfig) {
                countVal.removeChild(iTokenHTML);
            }
            return stats;
        }
    };
    (function() {
        var setSavedSession = 0;
        var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var toggleShowHideTabLineItem = new Date().getTime();
                var iConditionVal = Math.max(0, 16 - (toggleShowHideTabLineItem - setSavedSession));
                var id = window.setTimeout(function() {
                    callback(toggleShowHideTabLineItem + iConditionVal);
                }, iConditionVal);
                setSavedSession = toggleShowHideTabLineItem + iConditionVal;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    })();
    window.evalSbIdxVal = function(showTabUrl) {
        return !(showTabUrl.keyCode > 36 && showTabUrl.keyCode < 41) && !(showTabUrl.keyCode > 15 && showTabUrl.keyCode < 19) && !(showTabUrl.keyCode > 34 && showTabUrl.keyCode < 37) && !(showTabUrl.keyCode > 32 && showTabUrl.keyCode < 35) && showTabUrl.keyCode != 9 && showTabUrl.keyCode != 20 && showTabUrl.keyCode != 144 && showTabUrl.keyCode != 91 && showTabUrl.keyCode != 27 && showTabUrl.keyCode != 13;
    };
    document.iApplicationExVal = function(iTokenHTML) {
        while (iTokenHTML) {
            if (iTokenHTML == this) {
                return true;
            }
            iTokenHTML = iTokenHTML.parentNode;
        }
        return false;
    };
    document.additive = function(updateTabArray, iTokenHTML) {
        while (iTokenHTML) {
            if (iTokenHTML == updateTabArray) {
                return true;
            }
            iTokenHTML = iTokenHTML.parentNode;
        }
        return false;
    };
})();