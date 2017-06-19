'use strict';

chrome.contextMenus.create({
  title: 'Open Chrome Web Store',
  contexts: ['browser_action'],
  onclick: () => chrome.tabs.create({
    url: 'https://chrome.google.com/webstore/category/extensions'
  })
});
chrome.contextMenus.create({
  title: 'Open chrome://apps/',
  contexts: ['browser_action'],
  onclick: () => chrome.tabs.create({
    url: 'chrome://apps/'
  })
});
chrome.contextMenus.create({
  title: 'Open chrome://settings/',
  contexts: ['browser_action'],
  onclick: () => chrome.tabs.create({
    url: 'chrome://settings/'
  })
});
chrome.contextMenus.create({
  title: 'Open chrome://extensions/',
  contexts: ['browser_action'],
  onclick: () => chrome.tabs.create({
    url: 'chrome://extensions/'
  })
});
chrome.contextMenus.create({
  title: 'Open chrome://inspect/',
  contexts: ['browser_action'],
  onclick: () => chrome.tabs.create({
    url: 'chrome://inspect/'
  })
});

// faqs
chrome.storage.local.get('version', (obj) => {
  let version = chrome.runtime.getManifest().version;
  if (obj.version !== version) {
    chrome.storage.local.set({version}, () => {
      chrome.tabs.create({
        url: 'http://add0n.com/apps-launcher.html?version=' + version + '&type=' + (obj.version ? ('upgrade&p=' + obj.version) : 'install')
      });
    });
  }
});
