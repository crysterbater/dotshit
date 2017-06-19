// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


chrome.contextMenus.create({
    id : "text_selection",
    title: chrome.i18n.getMessage("ClipSelectedText"),
    contexts: ["selection"]
}), chrome.contextMenus.create({
    id: "simplified_article",
    title: chrome.i18n.getMessage("SimplifiedArticle"),
    contexts: ["all"]
}), chrome.contextMenus.create({
    id: "snapshot",
    title: chrome.i18n.getMessage("SnapshotThisPage"),
    contexts: ["all"]
}), chrome.contextMenus.create({
    id: "bookmark",
    title: chrome.i18n.getMessage("SavePageLink"),
    contexts: ["all"]
});



chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {

    chrome.tabs.query({active: true, currentWindow: true}, function (tabsArray) {
        chrome.tabs.executeScript(tabsArray[0].id, {
            code: "loadDataFromRightClick('" + info.menuItemId + "', '" + info.scrUrl + "');"
        }, function(result) {
            if(!navigator.onLine) {
                return;
            }
        });
    }); 
    
}