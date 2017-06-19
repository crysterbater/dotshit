// Copyright (c) 2017 - Martin Sermak

var EDITION = "CHROME";

if (navigator.userAgent.toLowerCase().indexOf('opr/') != -1)
	EDITION = "OPERA";

if (navigator.userAgent.toLowerCase().indexOf('vivaldi/') != -1)
	EDITION = "VIVALDI";

var homepage = 0;
var agent = "Default";
var newtab = 0;
var icontab = 0;
var detection = 0;
var protection = 0;
var yourage = 0;
var quality = 0;
var override = 0;
var language = "en";
var navigation = 0;

// read preferences
chrome.storage.local.get(null,function(items)
{
	for (key in items)
	{
		if (key == 'homepage') homepage = items[key];
		if (key == 'agent') agent = items[key];
		if (key == 'newtab') newtab = items[key];
		if (key == 'icontab') icontab = items[key];
		if (key == 'detection') detection = items[key];
		if (key == 'protection') protection = items[key];
		if (key == 'yourage') yourage = items[key];
		if (key == 'quality') quality = items[key];
		if (key == 'language') language = items[key];
		if (key == 'navigation') navigation = items[key];
	}

	if (EDITION == "CHROME" && agent == "Chromify")
		agent = "Default";
	if (EDITION == "OPERA" && agent == "Chromify")
		agent = navigator.userAgent.replace(/ OPR\/[^\s]+/g, '');
	if (EDITION == "VIVALDI" && agent == "Chromify")
		agent = navigator.userAgent.replace(/ Vivaldi\/[^\s]+/g, '');
});

// repopulate preferences when changed
chrome.storage.onChanged.addListener(function(changes,namespace)
{
	for (key in changes)
	{
		if (key == 'homepage') homepage = changes[key].newValue;
		if (key == 'agent') agent = changes[key].newValue;
		if (key == 'newtab') newtab = changes[key].newValue;
		if (key == 'icontab') icontab = changes[key].newValue;
		if (key == 'detection') detection = changes[key].newValue;
		if (key == 'protection') protection = changes[key].newValue;
		if (key == 'yourage') yourage = changes[key].newValue;
		if (key == 'quality') quality = changes[key].newValue;
		if (key == 'language') language = changes[key].newValue;
		if (key == 'navigation') navigation = changes[key].newValue;
	}

	if (EDITION == "CHROME" && agent == "Chromify")
		agent = "Default";
	if (EDITION == "OPERA" && agent == "Chromify")
		agent = navigator.userAgent.replace(/ OPR\/[^\s]+/g, '');
	if (EDITION == "VIVALDI" && agent == "Chromify")
		agent = navigator.userAgent.replace(/ Vivaldi\/[^\s]+/g, '');
});

// run on install or after update
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason == "install")
	{
		var optpage = chrome.extension.getURL('options.html?installed');
		chrome.tabs.create({url:optpage,active:true});
	}
	else if (details.reason == "update")
	{
		var optpage = chrome.extension.getURL('options.html?updated');
		chrome.tabs.create({url:optpage,active:true});
	}
});

// override User Agent
chrome.webRequest.onBeforeSendHeaders.addListener(function(details)
{
	if (agent != "Default" && details.url.toLowerCase().startsWith("https://extension-updates.opera.com") != true && details.url.toLowerCase().startsWith("https://clients2.google.com") != true)
	{
		for (var i=0; i<details.requestHeaders.length; i++)
		{
			if (details.requestHeaders[i].name === 'User-Agent')
			{
				details.requestHeaders[i].value = agent;
				break;
			}
		}
	}
	return {requestHeaders:details.requestHeaders};
}, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);

// override with custom page
function OpenCustomTab()
{
	chrome.tabs.query({currentWindow:true,active:true},function(tab)
	{
		if (homepage.toLowerCase().indexOf("!steal-focus") != -1 || EDITION == "VIVALDI")
		{
			chrome.tabs.update(tab[0].id,{url:homepage.replace("!steal-focus", ""),active:true});
		}
		else
		{
			chrome.tabs.create({url:homepage,active:true,index:tab[0].index+1});
			chrome.tabs.remove(tab[0].id);
		}
	});
}

// override with custom page
function CustomTab()
{
	if (homepage == 0)
	{
		chrome.storage.local.get('homepage',function(item)
		{
			if (item.homepage)
				homepage = item.homepage;
			else
				homepage = chrome.extension.getURL('google.html');

			OpenCustomTab();
		});
	}
	else
		OpenCustomTab();
}

// load custom page when start page button clicked
chrome.webNavigation.onCommitted.addListener(function(tab)
{
	if (EDITION == "OPERA")
	{
		if (icontab == 1 && tab.url.toLowerCase().endsWith("://startpage/") == true) CustomTab();
	}
});

// load custom page when new tab opened
chrome.tabs.onCreated.addListener(function(tab)
{
	if (EDITION == "OPERA")
	{
		if (newtab == 0 && tab.url.toLowerCase().endsWith("://startpage/") == true) CustomTab();
	}
});

// right click menu clicked?
chrome.contextMenus.onClicked.addListener(function(info,tab)
{
	if (info.menuItemId == "openTo")
	{
		var openURL = info.selectionText.trim();

		// right click and open selected link in new tab
		if (openURL.toLowerCase().indexOf("http://") != -1 || openURL.toLowerCase().indexOf("https://") != -1 || openURL.toLowerCase().indexOf("ftp://") != -1)
		{
			chrome.tabs.query({currentWindow:true,active:true},function(tab)
			{
				chrome.tabs.create({url:openURL,active:true,openerTabId:tab[0].id,index:tab[0].index+1});
			});
		}
		else
		{
			chrome.tabs.query({currentWindow:true,active:true},function(tab)
			{
				chrome.tabs.create({url:"http://"+openURL,active:true,openerTabId:tab[0].id,index:tab[0].index+1});
			});
		}
	}

	if (info.menuItemId == "imageTo")
	{
		// right click and reverse image search in new tab
		chrome.tabs.query({currentWindow:true,active:true},function(tab)
		{
			chrome.tabs.create({url:"https://images.google.com/searchbyimage?image_url="+encodeURIComponent(info.srcUrl),active:true,openerTabId:tab[0].id,index:tab[0].index+1});
		});
	}
});

// run code when tabs are updated
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab)
{
	// check if we're on YouTube?
	if (changeInfo.status == "complete" && tab.url.toLowerCase().indexOf("www.youtube.com/watch") != -1)
		chrome.tabs.sendMessage(tab.id,{youtube:tab.url});

	// do we want to override new tab?
	if (EDITION == "CHROME")
	{
		if (newtab == 0 && typeof changeInfo.url != "undefined" && changeInfo.url.toLowerCase().endsWith("://newtab/") == true && changeInfo.status == "loading") CustomTab();
	}

	// do we want to override new tab?
	if (EDITION == "VIVALDI")
	{
		var url = tab.url.toLowerCase();
		if (newtab == 0 && url.indexOf("/components/startpage/startpage.html") != -1 && url.indexOf("section=history") == -1 && url.indexOf("section=bookmarks") == -1 && changeInfo.status == "complete") CustomTab();
	}
});

// setup right click menu
chrome.contextMenus.create({title:"Open URL in New Tab",contexts:["selection"],id:"openTo"});
chrome.contextMenus.create({title:"Reverse Image Search",contexts:["image"],targetUrlPatterns:["*://*/*"],id:"imageTo"});

// do we want to override page during startup?
chrome.runtime.onStartup.addListener(function()
{
	chrome.storage.local.get('override',function(item)
	{
		if (item.override)
			override = item.override;

		if (override == 1)
		{
			if (EDITION == "OPERA")
			{
				chrome.tabs.query({currentWindow:true},function(tab)
				{
					if (tab[0].url.toLowerCase().endsWith("://startpage/") == true) CustomTab();
				});
			}
			if (EDITION == "CHROME")
			{
				chrome.tabs.query({currentWindow:true},function(tab)
				{
					if (tab[0].url.toLowerCase().endsWith("://newtab/") == true) CustomTab();
				});
			}
			if (EDITION == "VIVALDI")
			{
				chrome.tabs.query({currentWindow:true},function(tab)
				{
					var url = tab[0].url.toLowerCase();
					if (url.indexOf("/components/startpage/startpage.html") != -1 && url.indexOf("section=history") == -1 && url.indexOf("section=bookmarks") == -1) CustomTab();
				});
			}
		}
	});
});

// communication inside extension - receiving end.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse)
{
	if (message.openURL)
	{
		chrome.tabs.query({currentWindow:true,active:true},function(tab)
		{
			chrome.tabs.create({url:message.openURL,active:true,openerTabId:tab[0].id,index:tab[0].index+1});
		});
	}

	if (message.updateURL)
	{
		chrome.tabs.query({currentWindow:true,active:true},function(tab)
		{
			chrome.tabs.update(tab[0].id,{url:message.updateURL,active:true});
		});
	}

	if (message.detection)
	{
		sendResponse({answer:detection});
		return true;
	}

	if (message.agent)
	{
		sendResponse({answer:agent});
		return true;
	}

	if (message.protection)
	{
		sendResponse({answer:protection});
		return true;
	}

	if (message.yourage)
	{
		sendResponse({answer:yourage});
		return true;
	}

	if (message.quality)
	{
		sendResponse({answer:quality});
		return true;
	}

	if (message.popup)
	{
		if (message.popup == "settings" && EDITION == "VIVALDI")
			chrome.tabs.create({url:"chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html"});

		if (message.popup == "settings" && EDITION != "VIVALDI")
			chrome.tabs.create({url:EDITION.toLowerCase()+"://settings/"});

		if (message.popup == "extend")
			chrome.tabs.create({url:EDITION.toLowerCase()+"://extensions/"});

		if (message.popup == "download")
			chrome.tabs.create({url:EDITION.toLowerCase()+"://downloads/"});

		if (message.popup == "history" && EDITION == "VIVALDI")
			chrome.tabs.create({url:"chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/startpage/startpage.html?section=history"});

		if (message.popup == "history" && EDITION != "VIVALDI")
			chrome.tabs.create({url:EDITION.toLowerCase()+"://history/"});

		if (message.popup == "bookmark" && EDITION == "VIVALDI")
			chrome.tabs.create({url:"chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/startpage/startpage.html?section=bookmarks"});

		if (message.popup == "bookmark" && EDITION != "VIVALDI")
			chrome.tabs.create({url:EDITION.toLowerCase()+"://bookmarks/"});

		if (message.popup == "options")
			chrome.runtime.openOptionsPage();

		if (message.popup == "translate" && language != "off")
		{
			chrome.tabs.query({currentWindow:true,active:true},function(tab)
			{
				chrome.tabs.create({url:"https://translate.google.com/translate?sl=auto&tl="+language+"&u="+encodeURIComponent(tab[0].url),active:true,openerTabId:tab[0].id,index:tab[0].index+1});
			});
		}

		if (message.popup == "cache")
		{
			chrome.tabs.query({currentWindow:true,active:true},function(tab)
			{
				chrome.tabs.create({url:"https://webcache.googleusercontent.com/search?q=cache:"+encodeURIComponent(tab[0].url),active:true,openerTabId:tab[0].id,index:tab[0].index+1});
			});
		}
	}

	if (message.language)
	{
		sendResponse({answer:language});
		return true;
	}

	if (message.navigation)
	{
		sendResponse({answer:navigation});
		return true;
	}

	return false;
});
