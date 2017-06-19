/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

function windowArray(unifySavedSession, errorDetailsVal) {
    if (u.txAltVal(unifySavedSession) && !unifySavedSession.classList.contains('iFlashCount')) {
        if (errorDetailsVal) {
            $(errorDetailsVal).addClass('startsWithVal');
        }
        unifySavedSession.classList.add('iTitleTextVal');
        return true;
    }
    return false;
}

function resetActiveTab(unifySavedSession, errorDetailsVal) {
    if (u.txAltVal(unifySavedSession) && !unifySavedSession.classList.contains('iFlashCount')) {
        if (errorDetailsVal) {
            $(errorDetailsVal).removeClass('startsWithVal');
        }
        unifySavedSession.classList.remove('iTitleTextVal');
        unifySavedSession.classList.remove('idx3Val');
        return true;
    }
    return false;
}

function propVal(unifySavedSession, errorDetailsVal) {
    $('body').addClass('resp');
    if (event.which === 1 && event.button === 0 && u.txAltVal(unifySavedSession)) {
        if (errorDetailsVal) {
            errorDetailsVal.style.borderRightColor = 'hsl(0, 0%, 88%)';
        }
        unifySavedSession.classList.add('idx3Val');
        return true;
    }
    return false;
}

function renderSessionWindow(unifySavedSession, errorDetailsVal) {
    $('body').removeClass('resp');
    if (u.txAltVal(unifySavedSession)) {
        if (errorDetailsVal) {
            errorDetailsVal.style.borderRightColor = '';
        }
        unifySavedSession.classList.remove('idx3Val');
        return true;
    }
    return false;
}

function getSessionRoot(unifySavedSession) {
    if (event.which === 1 && event.button === 0 && u.txAltVal(unifySavedSession)) {
        return true;
    }
    return false;
}

function cachePtAreaVal(unifySavedSession, cb) {
    if (windowArray(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function refreshTabUrl(unifySavedSession, errorDetailsVal, cb) {
    if (windowArray(unifySavedSession, errorDetailsVal)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function session1(unifySavedSession, cb) {
    if (resetActiveTab(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function formatCurrentTab(unifySavedSession, errorDetailsVal, cb) {
    if (resetActiveTab(unifySavedSession, errorDetailsVal)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function popActiveTab(unifySavedSession, cb) {
    if (propVal(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function tokenComponentImgVal(unifySavedSession, cb) {
    if (renderSessionWindow(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function getPreviousSession(unifySavedSession, cb) {
    if (getSessionRoot(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function recoverySession(unifySavedSession, cb) {
    if (propVal(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function dirtyVal(unifySavedSession, cb) {
    if (renderSessionWindow(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function augmentActiveWindow(unifySavedSession, cb) {
    if (getSessionRoot(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function session1WindowIdx(unifySavedSession, cb, errorDetailsVal) {
    if (propVal(unifySavedSession, errorDetailsVal)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function cacheActiveSessionTab(unifySavedSession, cb) {
    if (renderSessionWindow(unifySavedSession)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function iIncludeSeqProp(unifySavedSession, evalQualifyingArrayVal, errorDetailsVal, cb) {
    if (getSessionRoot(unifySavedSession)) {
        iWindows(unifySavedSession, q(evalQualifyingArrayVal), errorDetailsVal);
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function limitedSetOfWindowsVal(unifySavedSession, evalQualifyingArrayVal, errorDetailsVal, cb) {
    if (getSessionRoot(unifySavedSession)) {
        iWindows(unifySavedSession, q(evalQualifyingArrayVal), errorDetailsVal);
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
        }
    }
}

function syncTabState(localeNm, cb) {
    if (event.which === 1 && u.txAltVal(localeNm)) {
        if (cb) {
            var iSearchTermVal = [];
            for (var i = 2; i < arguments.length; i++) {
                iSearchTermVal.push(arguments[i]);
            }
            cb.apply(cb, iSearchTermVal);
            isRangeDirBackVal();
        }
    }
    event.stopPropagation();
    event.preventDefault();
}

function iWindows(unifySavedSession, iDirty, errorDetailsVal) {
    if (iDirty.classList.contains('invisible')) {
        iCaretVal(unifySavedSession, iDirty, errorDetailsVal);
        return true;
    } else {
        evalSessionStorageKey(unifySavedSession, iDirty);
        isRangeDirBackVal();
        return false;
    }
}

function iCaretVal(unifySavedSession, iDirty, errorDetailsVal) {
    if (u.txAltVal(unifySavedSession) && !iDirty.classList.contains('visible')) {
        isRangeDirBackVal();
        unifySavedSession.classList.add('iFlashCount');
        iDirty.classList.add('visible');
        iDirty.classList.remove('invisible');
        if (errorDetailsVal) {
            errorDetailsVal.style.borderRightColor = 'hsl(0, 0%, 88%)';
        }
    }
}

function evalSessionStorageKey(unifySavedSession, iDirty) {
    var panelLocationIsKnown;
    if (u.txAltVal(unifySavedSession) && !iDirty.classList.contains('invisible')) {
        unifySavedSession.classList.remove('iFlashCount');
        unifySavedSession.classList.remove('idx3Val');
        unifySavedSession.classList.remove('iTitleTextVal');
        iDirty.classList.add('invisible');
        if (iDirty.classList.contains('visible')) {
            panelLocationIsKnown = true;
            iDirty.classList.remove('visible');
        } else {
            panelLocationIsKnown = false;
        }
    }
    return panelLocationIsKnown;
}