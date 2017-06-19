var util = window.util = {};

util.getCurrentTabs = function (callback) {
    chrome.tabs.query({
        pinned: false,
        currentWindow: true
    }, function (result) {
        var arr = [];
        result.forEach(function (tab) {
            tab.url.indexOf('chrome') !== 0 && arr.push({
                icon: tab.favIconUrl,
                url: tab.url,
                title: tab.title,
                id: tab.id
            });
        });
        callback(arr);
    });
};

util.selectTab = function (id, callback) {
    chrome.tabs.update(+id, {
        highlighted: true
    }, callback || function () {});
};

util.closeTabs = function (id, callback) {
    chrome.tabs.remove(id, callback || function () {});
};

util.copyObject = function copyObject(source, target) {
    if (!target) target = {};
    for (var key in source) {
        if (!source.hasOwnProperty(key)) {
            break;
        }
        if (typeof source[key] === 'object') {
            if (source[key].constructor.name === 'Array') {
                target[key] = [];
            }
            else target[key] = {};
            copyObject(source[key], target[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};