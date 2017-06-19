// Copyright (c) 2017 - Martin Sermak

var EDITION = "CHROME";

if (navigator.userAgent.toLowerCase().indexOf('opr/') != -1)
	EDITION = "OPERA";

if (navigator.userAgent.toLowerCase().indexOf('vivaldi/') != -1)
	EDITION = "VIVALDI";

var noURL = chrome.extension.getURL('google.html');

document.getElementById("infobox").innerHTML = "&laquo; Cannot Detect Browser &raquo;";

if (EDITION == "CHROME")
{
	document.getElementById("icontab").disabled = true;
	document.getElementById("icontab").style.color = "#BBB";
	document.getElementById("infobox").innerHTML = "&laquo; Chrome Browser Detected &raquo;";
}

if (EDITION == "OPERA")
{
	document.getElementById("navigation").disabled = true;
	document.getElementById("navigation").style.color = "#BBB";
	document.getElementById("infobox").innerHTML = "&laquo; Opera Browser Detected &raquo;";
}

if (EDITION == "VIVALDI")
{
	document.getElementById("icontab").disabled = true;
	document.getElementById("icontab").style.color = "#BBB";
	document.getElementById("navigation").disabled = true;
	document.getElementById("navigation").style.color = "#BBB";
	document.getElementById("infobox").innerHTML = "&laquo; Vivaldi Browser Detected &raquo;";
}

document.getElementById("ex1").innerHTML = "Sample &nbsp;&raquo;&nbsp; "+noURL+"!steal-focus";
document.getElementById("ex2").innerHTML = "Sample &nbsp;&raquo;&nbsp; "+noURL;

if (window.location.search.substring(1).indexOf("installed") != -1)
{
	var tmp = document.getElementById("infobox").innerHTML;
	document.getElementById("infobox").innerHTML = "&laquo; Extension Installed &raquo;";
	setTimeout(function() { document.getElementById("infobox").innerHTML = tmp; }, 6000);
}

if (window.location.search.substring(1).indexOf("updated") != -1)
{
	var tmp = document.getElementById("infobox").innerHTML;
	document.getElementById("infobox").innerHTML = "&laquo; Extension Updated &raquo;";
	setTimeout(function() { document.getElementById("infobox").innerHTML = tmp; }, 6000);
}

document.getElementById("reset").addEventListener("click",function()
{
	document.getElementById("url").value = noURL;
});

document.getElementById("save").addEventListener("click",function()
{
	var myurl = document.getElementById("url").value.toLowerCase();

	if (myurl.indexOf("://startpage") != -1 || myurl.indexOf("://newtab") != -1)
		document.getElementById("url").value = noURL;

	if (myurl.indexOf("http://") == -1 && myurl.indexOf("https://") == -1 && myurl.indexOf("file:///") == -1 && myurl.indexOf("chrome-extension://") == -1 && myurl.indexOf("about:") == -1)
		document.getElementById("url").value = noURL;

	chrome.storage.local.set({"homepage":document.getElementById("url").value});
	chrome.storage.local.set({"agent":document.getElementById("agent").value});
	chrome.storage.local.set({"newtab":document.getElementById("newtab").selectedIndex});
	chrome.storage.local.set({"icontab":document.getElementById("icontab").selectedIndex});
	chrome.storage.local.set({"detection":document.getElementById("detection").selectedIndex});
	chrome.storage.local.set({"protection":document.getElementById("protection").selectedIndex});
	chrome.storage.local.set({"yourage":document.getElementById("yourage").selectedIndex});
	chrome.storage.local.set({"quality":document.getElementById("quality").selectedIndex});
	chrome.storage.local.set({"override":document.getElementById("override").selectedIndex});
	chrome.storage.local.set({"language":document.getElementById("language").value});
	chrome.storage.local.set({"navigation":document.getElementById("navigation").selectedIndex});

	var tmp = document.getElementById("infobox").innerHTML;
	document.getElementById("infobox").innerHTML = "&laquo; Options Saved Successfully &raquo;";
	setTimeout(function() { document.getElementById("infobox").innerHTML = tmp; }, 4000);
	document.getElementById("save").blur();
});

document.getElementById("pdf").addEventListener("click",function()
{
	window.open("http://www.sermak.ca/PTHelp.pdf","_blank");
});

chrome.storage.local.get("homepage",function(e)
{
	if (typeof e.homepage == "undefined")
	{
		chrome.storage.local.set({"homepage":noURL});
		document.getElementById("url").value = noURL;
	}
	else
		document.getElementById("url").value = e.homepage;
});

document.getElementById("agselect").addEventListener("change",function()
{
	index = document.getElementById("agselect").selectedIndex;

	switch (index)
	{
		case 2:
			document.getElementById("agent").value = "Default"; break;
		case 3:
			document.getElementById("agent").value = "Chromify"; break;
		case 5:
			document.getElementById("agent").value = "Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1"; break;
		case 6:
			document.getElementById("agent").value = "Mozilla/5.0 (Linux; Android 5.0.1; Nexus 9 Build/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.109 Safari/537.36"; break;
		case 7:
			document.getElementById("agent").value = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36"; break;
		case 8:
			document.getElementById("agent").value = "Mozilla/5.0 (Windows NT 10.0; rv:42.0) Gecko/20100101 Firefox/42.0"; break;
		case 9:
			document.getElementById("agent").value = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136"; break;
		case 10:
			document.getElementById("agent").value = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"; break;
		case 11:
			document.getElementById("agent").value = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:42.0) Gecko/20100101 Firefox/42.0"; break;
		case 12:
			document.getElementById("agent").value = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50"; break;
		case 14:
			document.getElementById("agent").value = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"; break;
	}
});

chrome.storage.local.get("agent",function(e)
{
	if (typeof e.agent == "undefined")
	{
		chrome.storage.local.set({"agent":"Default"});
		document.getElementById("agent").value = "Default";
	}
	else
		document.getElementById("agent").value = e.agent;
});

chrome.storage.local.get("newtab",function(e)
{
	if (typeof e.newtab == "undefined")
	{
		chrome.storage.local.set({"newtab":0});
		document.getElementById("newtab").selectedIndex = 0;
	}
	else
		document.getElementById("newtab").selectedIndex = e.newtab;
});

chrome.storage.local.get("icontab",function(e)
{
	if (typeof e.icontab == "undefined")
	{
		chrome.storage.local.set({"icontab":0});
		document.getElementById("icontab").selectedIndex = 0;
	}
	else
		document.getElementById("icontab").selectedIndex = e.icontab;
});

chrome.storage.local.get("detection",function(e)
{
	if (typeof e.detection == "undefined")
	{
		chrome.storage.local.set({"detection":0});
		document.getElementById("detection").selectedIndex = 0;
	}
	else
		document.getElementById("detection").selectedIndex = e.detection;
});

chrome.storage.local.get("protection",function(e)
{
	if (typeof e.protection == "undefined")
	{
		chrome.storage.local.set({"protection":0});
		document.getElementById("protection").selectedIndex = 0;
	}
	else
		document.getElementById("protection").selectedIndex = e.protection;
});

chrome.storage.local.get("yourage",function(e)
{
	if (typeof e.yourage == "undefined")
	{
		chrome.storage.local.set({"yourage":0});
		document.getElementById("yourage").selectedIndex = 0;
	}
	else
		document.getElementById("yourage").selectedIndex = e.yourage;
});

chrome.storage.local.get("quality",function(e)
{
	if (typeof e.quality == "undefined")
	{
		chrome.storage.local.set({"quality":0});
		document.getElementById("quality").selectedIndex = 0;
	}
	else
		document.getElementById("quality").selectedIndex = e.quality;
});

chrome.storage.local.get("override",function(e)
{
	if (typeof e.override == "undefined")
	{
		chrome.storage.local.set({"override":0});
		document.getElementById("override").selectedIndex = 0;
	}
	else
		document.getElementById("override").selectedIndex = e.override;
});

chrome.storage.local.get("language",function(e)
{
	if (typeof e.language == "undefined")
	{
		chrome.storage.local.set({"language":"en"});
		document.getElementById("language").value = "en";
	}
	else
		document.getElementById("language").value = e.language;
});

chrome.storage.local.get("navigation",function(e)
{
	if (typeof e.navigation == "undefined")
	{
		chrome.storage.local.set({"navigation":0});
		document.getElementById("navigation").selectedIndex = 0;
	}
	else
		document.getElementById("navigation").selectedIndex = e.navigation;
});

// Fix Tab and return Focus back to URL
document.getElementById("pdf").addEventListener("blur", function(event)
{
	document.getElementById("url").focus();
});
