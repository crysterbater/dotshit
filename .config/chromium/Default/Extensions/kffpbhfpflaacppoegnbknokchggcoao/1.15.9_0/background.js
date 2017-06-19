var manifest = chrome.runtime.getManifest(),
    uid,
    appSig = manifest.name + ' ' + manifest.version;
function uuid() {
    var d = new Date().getTime();
    if (typeof(window) !== 'undefined' && window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
function onInstalledHandler() {
    track('extension', 'install', appSig);
    var installSource = 0;
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            if (tab.highlighted) {
                // Install from webstore or home page.
                if (/(google\.com\/webstore)|(firefox\/addon)/.test(tab.url)) {
                    installSource = 1;
                }
                // Install from home page.
                else if (/(supportfreecontent\.com)/.test(tab.url)) {
                    installSource = 2;
                }
                // Install from the extension menu (most likely, unpacked extension).
                else if (/(chrome:\/\/extensions)/.test(tab.url)) {
                    installSource = 3;
                }
                // Inline install.
                else {
                    installSource = 4;
                }
                track('extension', 'install source', installSource);
                if (installSource !== 3) {
                    // Set uninstall URL.
                    if (chrome.runtime.setUninstallURL) {
                        chrome.runtime.setUninstallURL('http://www.supportfreecontent.com/install/thank-you');
                    }
                }
                if (installSource === 1 || installSource === 2) {
                    return chrome.tabs.update({ url: 'http://cl.supportfreecontent.com/cl/static/redirect.html?installSource=' + installSource + '&version=' + appSig});
                }
            }
        });
    });
}
function registerEvents() {
    // Install events.
    if (chrome.runtime.onInstalled) {
            chrome.runtime.onInstalled.addListener(function (details) {
            if (details.reason == 'install') {
                onInstalledHandler();
            }
            else if (details.reason == 'update') {
                track('extension', 'update', appSig);
            }
        });
    }
}
function initialized() {
    /*  For already navigated page, the doc loading and complete event won't fire again. We need to inject content script for each opened tab
        For Firefox extension, it will automatically inject to all opened tab specified in "content_scripts" */
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            if (/(http:\/\/localhost)|(google\.com\/webstore)|(firefox\/addon)/.test(tab.url) || /^http/.test(tab.url) === false) {
                return;
            }
            chrome.tabs.executeScript(tab.id, { file: 'content.js', allFrames: false, runAt: 'document_end' }, function () {
            });
        });
    });
    track('extension', 'init', appSig);
}
function init() {
    registerEvents();
    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get('uid', function (res) {
            if (!res.uid) {
                uid = uuid();
                chrome.storage.local.set({'uid': uid});
                if (!chrome.runtime.onInstalled) {
                    onInstalledHandler();
                }
            }
            else {
                uid = res.uid;
            }
            initialized();
        });
    }
    else {
        initialized();
    }
    setInterval(function () {
        track('extension', 'heartbeat', appSig);
    }, 1000 * 60 * 60);
}
function setupGA() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ // jshint ignore:line
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), // jshint ignore:line
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) // jshint ignore:line
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // jshint ignore:line
    ga('create', 'UA-63935000-29', 'auto');
    ga('set', 'checkProtocolTask', function () {});
    ga('require', 'displayfeatures');
}
setupGA();
function track(p1, p2, p3) {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', p1, p2, p3);
    }
}
init();
