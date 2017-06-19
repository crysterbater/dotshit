(function () {
    'use strict';
    let main = document.querySelector('#main');

    let boxes;
    chrome.runtime.getBackgroundPage(function (win) {
        window.box = win.box;
        boxes = box.getAll();
    });

    let onloaded = false;
    window.addEventListener('load', function () {
        util.getCurrentTabs(function (result) {
            main.tabs = result;
        });
    });
})();