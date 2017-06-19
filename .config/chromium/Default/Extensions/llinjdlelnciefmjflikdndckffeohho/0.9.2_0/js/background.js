(function () {
    'use strict';
    window.openTabs = function(tabs) {
        tabs.forEach(function (val) {
            open(val.url);
        });
    };

    /** context menu */
    let boxMenus = {};
    box.addEventListener('change', generateMenuItem);
    generateMenuItem();

    function generateMenuItem() {
        chrome.contextMenus.removeAll(function () {
            let boxes = box.copyAll();
            for (let key in boxes) {
                boxMenus[key] = chrome.contextMenus.create({
                    title: key,
                    onclick: handleMenuClick,
                    id: key
                });
            }
        });
    }

    function handleMenuClick(info, tab) {
        if (info.pageUrl.indexOf('chrome') !== 0) {
            box.appendTabs(info.menuItemId, tab);
        }
    }
})();