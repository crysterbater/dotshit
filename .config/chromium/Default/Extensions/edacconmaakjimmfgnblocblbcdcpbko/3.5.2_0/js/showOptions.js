/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

BrowserAPI.getCurrentWindow(function(w) {
    var v = BrowserAPI.getViews({
        windowId: w.id,
        type: 'tab'
    });
    var sbUrl = BrowserAPI.getURL('main.html');
    var doCloseWindow = false;
    for (var i = 0; i < v.length; i++) {
        if (v[i].location.href.substring(0, sbUrl.length) === sbUrl) {
            v[i].lxMid();
            doCloseWindow = true;
            break;
        }
    }
    if (doCloseWindow) {
        window.close();
    } else {
        history.replaceState(null, '', sbUrl + '#o');
        window.location.reload();
    }
});