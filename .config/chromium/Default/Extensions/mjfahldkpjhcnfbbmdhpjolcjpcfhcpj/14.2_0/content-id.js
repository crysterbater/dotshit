// Copyright (c) 2017 - Martin Sermak

var detection = 2;		// 0 is v2, 1 is v1, 2 is Off
var protection = 1;		// 0 is On, 1 is Off
var language = "en";
var scpressed = 0;		// Shift+Ctrl
var ctpressed = 0;		// Ctrl

// read preferences
chrome.runtime.sendMessage({detection: "ask"}, function(response) { detection = response.answer; });
chrome.runtime.sendMessage({protection: "ask"}, function(response) { protection = response.answer; });
chrome.runtime.sendMessage({language: "ask"}, function(response) { language = response.answer; });

// repopulate preferences when changed
chrome.storage.onChanged.addListener(function(changes,namespace)
{
	for (key in changes)
	{
		if (key == 'detection') detection = changes[key].newValue;
		if (key == 'protection') protection = changes[key].newValue;
		if (key == 'language') language = changes[key].newValue;
	}
});

// Remove Element when Right Clicked + Ctrl Key
window.addEventListener("contextmenu", function(event)
{
	if (ctpressed && event.target)
	{
		event.preventDefault();
		event.target.parentNode.removeChild(event.target);
	}
});

// Remove Element when Right Clicked + Ctrl Key
window.addEventListener("keydown", function(event)
{
	if (!ctpressed && event.ctrlKey)
	{
		ctpressed = 1;
		setTimeout(function() { ctpressed = 0; }, 200);
	}
});

// Capture Ctrl+Shift and perform translation
window.addEventListener("keydown", function(event)
{
	function ScanResponse()
	{
		if (http.readyState == 4)
		{
			var serverResponse = http.responseText;
			var regex = /\["(.*?)",".*?\d\]/ig;
			var results = [];
			var result;

			while (result = regex.exec(serverResponse))
				results.push(result[1]);

			var part;
			result = "";

			while ((part = results.pop()) != null)
				result = part.split("\\n").join(". ") + result;

			// DIV injection script to display translation popup

			var DIVContent = "<div style=\"all:initial; position:fixed; display:block; overflow:hidden; margin:auto; top:0px; bottom:0px; left:0px; right:0px; "+
				"background:#F9F9F9; width:450px; height:175px; z-index:2147483646; padding:10px; border-radius:5px; border:1px solid #888; font-family:Verdana; "+
				"font-size:11pt; color:#000; text-align:left; box-shadow:1px 1px 12px -3px #000;\"><div style=\"position:absolute; display:block; cursor:pointer; "+
				"top:2px; right:2px; width:15px; height:15px; background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPAgMAAABGuH3ZAAAACVBMVEUAAADVgID"+
				"///+dkUTnAAAAAXRSTlMAQObYZgAAADFJREFUCNdjEA0NDWAIDQ0NgRBhU6OAxNIsIHflSiCRtRRIRE0Fs8BiYFmIOoQ2sCkAYEAXDR2/JAoAAAAASUVORK5CYII=');\"></div>"+result+"</div>\n";

			var div = document.getElementById("DVI75");
			if (div) div.parentNode.removeChild(div);
			div = document.createElement("div");
			div.id = "DVI75";
			div.innerHTML = DIVContent;
			document.documentElement.appendChild(div);

			div.firstChild.firstChild.addEventListener("click", function() { this.parentNode.parentNode.remove(); });
		}
	}

	if (language != "off" && !scpressed && event.ctrlKey && event.shiftKey)
	{
		if (window.getSelection().type != "Range") return;

		if (window.getSelection().toString().length > 400)
			var myText = encodeURIComponent(window.getSelection().toString().substr(0,400));
		else
			var myText = encodeURIComponent(window.getSelection().toString());

		scpressed = 1;
		setTimeout(function() { scpressed = 0; }, 200);

		var http = new XMLHttpRequest();
		http.open("GET", "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl="+language+"&dt=t&q="+myText, true);
		http.onreadystatechange = ScanResponse;
		http.send(null);
	}
});

// here's our YouTube script ...
function YouTubeAge(ident,count)
{
	var restricted = document.getElementById("watch7-player-age-gate-content");
	var unavailable = document.getElementById("player-unavailable");

	// keep trying to find age restriction
	if (!restricted && count < 20)
		setTimeout(function() { count++; YouTubeAge(ident,count); }, 300);

	if (restricted && unavailable)
	{
		var YouTubeID = window.location.search.split("v=")[1];

		if (YouTubeID.indexOf("&") != -1)
			YouTubeID = YouTubeID.substring(0, YouTubeID.indexOf("&"));

		unavailable.innerHTML = "<iframe id=\"YTI75\" class=\""+unavailable.getAttribute("class")+"\" src=\"//www.youtube.com/embed/"+YouTubeID+"?showinfo=0&autoplay=1&enablejsapi=1\" allowfullscreen></iframe>";

		chrome.runtime.sendMessage({quality: "ask"}, function(response) { if (response.answer == 1) YouTubeQuality(1); });
	}
}

// here's our YouTube script ...
function YouTubeQuality(iframe)
{
	// YouTube injection script to force quality

	var YTScript = "function ForcePlayer(tries) { "+
		"var restart = 1; "+
		"var strings = [\"tiny\", \"small\", \"medium\", \"large\"]; "+
		"if (window.location.href.toLowerCase().indexOf(\"www.youtube.com/watch\") == -1) restart = 0; "+
		"var possible = \"ignore\"; "+
		"if (player.getAvailableQualityLevels().indexOf(\"hd720\") != -1) possible = \"hd720\"; "+
		"if (player.getAvailableQualityLevels().indexOf(\"hd1080\") != -1) possible = \"hd1080\"; "+
		"if (possible == \"ignore\") restart = 0; "+
		"var current = player.getPlaybackQuality(); "+
		"if (current == \"hd1080\" || current == \"hd720\") restart = 0; "+
		"if (possible == \"hd1080\" && strings.indexOf(current) != -1) player.setPlaybackQuality(\"hd1080\"); "+
		"if (possible == \"hd720\" && strings.indexOf(current) != -1) player.setPlaybackQuality(\"hd720\"); "+
		"if (restart == 1 && tries > 0) setTimeout(ForcePlayer, 500, tries-1); }\n"+
		"function FindPlayer() { "+
		"var proceed = 0; "+
		"if ("+iframe+" == 0) "+
		"player = document.querySelector('[aria-label=\"YouTube Video Player\"]'); "+
		"if ("+iframe+" == 1) "+
		"player = document.getElementById(\"YTI75\").contentWindow.document.querySelector('[aria-label=\"YouTube Video Player\"]'); "+
		"if (player != null) proceed = player.getAvailableQualityLevels().length; "+
		"if (proceed < 1) setTimeout(FindPlayer, 200); "+
		"if (proceed > 0) setTimeout(ForcePlayer, 500, 10); }\n"+
		"setTimeout(FindPlayer, 500);\n";

	var script = document.createElement("script");
	script.type = "text/javascript";
	script.textContent = YTScript;
	document.documentElement.appendChild(script);
	script.parentNode.removeChild(script);
}

// if we're on YouTube, run a script ...
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse)
{
	if (message.youtube && window.location.href == message.youtube)
	{
		chrome.runtime.sendMessage({yourage: "ask"}, function(response) { if (response.answer == 1) YouTubeAge(message.youtube,0); });
		chrome.runtime.sendMessage({quality: "ask"}, function(response) { if (response.answer == 1) YouTubeQuality(0); });
	}
});

// helper for findLink
function urlTerminate(c)
{
	return ((c == '[') || (c == ']') || (c == '(') || (c == ')') || (c == ' ') || (c == '\'') || (c == '\"') || (c == '\n') || (c == '\t'));
}

// helper for findLink
function urlFixup(c)
{
	return ((c == '.') || (c == ',') || (c == ' '));
}

// double click routine helper
function findLink(fromIndex, toIndex, allText)
{
	// parse the url
	while (fromIndex >= 0 && !urlTerminate(allText[fromIndex])) fromIndex--;
	if (urlTerminate(allText[fromIndex])) fromIndex++;
	while (toIndex < allText.length && !urlTerminate(allText[toIndex])) toIndex++;	
	var url = allText.substring(fromIndex, toIndex).replace(/[^\x20-\x7E]+/g, '');

	// fix remaining url
	fromIndex = 0;
	toIndex = url.length - 1;
	while (urlFixup(url[fromIndex])) fromIndex++;
	while (urlFixup(url[toIndex])) toIndex--;

	return (url.substring(fromIndex, toIndex+1).trim());
}

// double click routines
window.addEventListener("dblclick", function(event)
{
	if (detection == 2 || event.ctrlKey || window.getSelection().type != "Range") return;

	var selectStart = window.getSelection().anchorOffset;
	var selectEnd = window.getSelection().focusOffset;
	if (selectStart == selectEnd || selectEnd - selectStart < 2) return;

	// v1 detection
	if (detection == 1)
	{
		var selectNode = window.getSelection().anchorNode;
		var selectNodeTxt = selectNode.textContent;
		var selectNodeNext = selectNode.nextSibling;
		var selectNodePrev = selectNode.previousSibling;

		// select parent node when needed - fix some variables
		if (selectEnd - selectStart == selectNodeTxt.length)
		{
			selectNode = window.getSelection().anchorNode.parentNode;
			selectNodeTxt = selectNode.textContent;
			selectNodeNext = selectNode.nextSibling;
			selectNodePrev = selectNode.previousSibling;
		}

		// select grand parent node when needed - fix some variables
		if (selectEnd - selectStart > selectNodeTxt.length)
		{
			selectNode = window.getSelection().anchorNode.parentNode.parentNode;
			selectNodeTxt = selectNode.textContent;
			selectNodeNext = selectNode.nextSibling;
			selectNodePrev = selectNode.previousSibling;
		}

		var selectNodeNextTxt = '';
		var selectNodePrevTxt = '';

		// go right and expand selection
		while (selectNodeNext && selectNodeNext.nodeName.toLowerCase() != "br" && selectNodeNextTxt.length < 150)
		{
			selectNodeNextTxt = selectNodeNextTxt + selectNodeNext.textContent;
			selectNodeNext = selectNodeNext.nextSibling;
		}

		// go left and expand selection
		while (selectNodePrev && selectNodePrev.nodeName.toLowerCase() != "br" && selectNodePrevTxt.length < 150)
		{
			selectNodePrevTxt = selectNodePrev.textContent + selectNodePrevTxt;
			selectNodePrev = selectNodePrev.previousSibling;
		}

		var bigSelection = selectNodePrevTxt + selectNodeTxt + selectNodeNextTxt;
		var link = findLink(selectNodePrevTxt.length+selectStart, selectNodePrevTxt.length+selectEnd, bigSelection);

		if (link.indexOf(".") != -1 && link.indexOf(" ") == -1)
		{
			if (link.toLowerCase().indexOf("http://") == 0 || link.toLowerCase().indexOf("https://") == 0 || link.toLowerCase().indexOf("ftp://") == 0)
				chrome.runtime.sendMessage({openURL: link});
			else if (link.length > 5)
				chrome.runtime.sendMessage({openURL: "http://"+link});
		}
	}

	// v2 detection
	if (detection == 0)
	{
		// create a random 8 digit number and insert into document
		var randId = Math.floor(Math.random()*(90000000)+10000000);
		var selectRange = document.caretRangeFromPoint(event.clientX, event.clientY);
		selectRange.insertNode(document.createTextNode(randId));

		// find the random number in the document to get offset
		var everything = document.body.innerText;
		var offset = everything.indexOf(randId);

		// restore document
		selectRange.deleteContents();
		window.getSelection().anchorNode.parentNode.normalize();

		// extract chunk from innerText
		everything = document.body.innerText;
		var extract = everything.substring(offset-250, offset+250);

		// correct if extract is really short
		var endCorr = everything.length - (offset + 250);
		var begCorr = offset - 250;
		while (endCorr < 0) { endCorr++; extract = extract + "-"; }
		while (begCorr < 0) { begCorr++; extract = "-" + extract; }

		var link = findLink(250, 250, extract);

		if (link.indexOf(".") != -1 && link.indexOf(" ") == -1)
		{
			if (link.toLowerCase().indexOf("http://") == 0 || link.toLowerCase().indexOf("https://") == 0 || link.toLowerCase().indexOf("ftp://") == 0)
				chrome.runtime.sendMessage({openURL: link});
			else if (link.length > 5)
				chrome.runtime.sendMessage({openURL: "http://"+link});
		}
	}
});

// privacy protection
window.addEventListener("mousedown", function(event)
{
	if (protection == 1) return;

	var target = event.target;

	// quick and dirty check to see if we're on a google page
	if (typeof target.baseURI != "undefined" && target.baseURI != null && target.baseURI.toLowerCase().indexOf(".google.") != -1)
	{
		// find the a href node
		while (typeof target.nodeName != "undefined" && target.nodeName != null && typeof target.parentNode != "undefined" && target.parentNode != null && target.nodeName.toLowerCase() != "a")
			target = target.parentNode;

		if (typeof target.href != "undefined" && target.href != null)
		{
			// split the google referral url to get the real target url
			var regex = /(url=)(.*?)(&)/ig;
			var match = regex.exec(target.href);

			if (match != null && match.length > 2)
			{
				var link = decodeURIComponent(match[2]);

				// make sure the real url is a valid one
				if (link.toLowerCase().indexOf("http://") == 0 || link.toLowerCase().indexOf("https://") == 0 || link.toLowerCase().indexOf("ftp://") == 0)
				{
					// on left click - disable google tracking and go to website
					if (event.button == "0")
					{
						target.outerHTML = target.outerHTML.replace("onmousedown=", "nomousedown=");
						if (event.ctrlKey)
							chrome.runtime.sendMessage({openURL: link});
						else
							chrome.runtime.sendMessage({updateURL: link});
					}

					// on right click - cleanup href link
					if (event.button == "2") target.href = link;
				}
			}
		}
	}
});
