!function(){"use strict";function n(){cjExtensions.settings.get("userList").then(function(n){n||cjExtensions.settings.set(defaultSettings)})}function t(){chrome.runtime.onInstalled?chrome.runtime.onInstalled.addListener(function(){n()}):n()}function e(){cjExtensions.settings.get("toolbarIcon").then(function(n){var t=n||"default";chrome.browserAction.setIcon({path:{19:"images/toolbar/"+t+"-19.png",38:"images/toolbar/"+t+"-38.png"}})})}chrome.runtime.onMessage.addListener(function(n){"reload_background_page"===n.action&&location.reload()}),chrome.runtime.onStartup&&chrome.runtime.onStartup.addListener(e),e(),t()}();