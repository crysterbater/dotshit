function injectContentScripts() {
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        var url = tabs[j].url;
        if (url.indexOf('chrome') == 0 || url.indexOf('about') == 0) {
          continue;
        }
        chrome.tabs.insertCSS(
            tabs[j].id,
            {file: 'hackerVision.css', allFrames: true});
        chrome.tabs.executeScript(
            tabs[j].id,
            {file: 'hackerVision.js', allFrames: true});
      }
    }
  });
};

function updateTabs() {
  var msg = {
    'enabled': getEnabled()
  };
  chrome.windows.getAll({'populate': true}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        var url = tabs[j].url;
        if (isDisallowedUrl(url)) {
          continue;
        }
        var msg = {
      	  'enabled': getEnabled(),
          'scheme': getSiteScheme(siteFromUrl(url))
  	    };
        chrome.tabs.sendRequest(tabs[j].id, msg);
      }
    }
  });
};

function toggleEnabled() {
  setEnabled(!getEnabled());
  updateTabs();
}

function toggleSite(url) {
  var site = siteFromUrl(url);
  var scheme = getSiteScheme(site);
  if (scheme > 0) {
    scheme = 0;
  } else if (getDefaultScheme() > 0) {
    scheme = getDefaultScheme();
  } else {
    scheme = DEFAULT_SCHEME;
  }
  setSiteScheme(site, scheme);
  updateTabs();
}

function init() {
  injectContentScripts();
  updateTabs();

  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      var disKey = localStorage['licStatus'];

      if (request['toggle_global'] && disKey !== 'FREE_TRIAL_EXPIRED') {
        toggleEnabled();
      }
      if (request['toggle_site'] && disKey !== 'FREE_TRIAL_EXPIRED') {
        toggleSite(sender.tab ? sender.tab.url : 'www.example.com');
      }
      if (request['init']) {
        var scheme = getDefaultScheme();
        if (sender.tab) {
          scheme = getSiteScheme(siteFromUrl(sender.tab.url));
        }
        var msg = {
  	      'enabled': getEnabled(),
          'scheme': scheme
	      };
        sendResponse(msg);
      }
    });

  document.addEventListener('storage', function(evt) {
    updateTabs();
    chrome.storage.sync;
  }, false);

  if (navigator.appVersion.indexOf("Mac") != -1) {
    chrome.browserAction.setTitle({'title': 'Hacker Vision'});
  }
};

init();
