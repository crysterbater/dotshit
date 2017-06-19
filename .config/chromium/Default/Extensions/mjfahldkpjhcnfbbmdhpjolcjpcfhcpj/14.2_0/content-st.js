// Copyright (c) 2017 - Martin Sermak

var navigation = 0;		// 0 is Off, 1 is On
var position = null;

// read preferences
chrome.runtime.sendMessage({agent: "ask"}, function(response) { ChangeAgent(response.answer); });
chrome.runtime.sendMessage({navigation: "ask"}, function(response) { navigation = response.answer; });

// change User Agent
function ChangeAgent(agent)
{
	if (agent == "Default") return;

	var AGScript = "Object.defineProperty(navigator, 'userAgent', { get:function() { return '"+agent+"'; }, configurable:true });";
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.textContent = AGScript;
	document.documentElement.appendChild(script);
	script.parentNode.removeChild(script);
}

// Show Icons when using Right Click + Mouse Move
function onScreen(dir)
{
	var DIVL = "<div style='all:initial; position:fixed; display:block; margin:auto auto auto 120px; top:0px; bottom:0px; left:0px; right:0px; width:200px; height:200px; z-index:2147483646;'>"+
		"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='#F20' opacity='0.8' d='M8 16c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm2-12v8L4 8l6-4z'/></svg></div>";
	var DIVR = "<div style='all:initial; position:fixed; display:block; margin:auto 120px auto auto; top:0px; bottom:0px; left:0px; right:0px; width:200px; height:200px; z-index:2147483646;'>"+
		"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='#F20' opacity='0.8' d='M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM6 12V4l6 4-6 4z'/></svg></div>";

	var div = document.getElementById("DVI75");
	if (div) div.parentNode.removeChild(div);
	div = document.createElement("div");
	div.id = "DVI75";
	if (dir == 'left') { div.innerHTML = DIVL; setTimeout(function() { div.parentNode.removeChild(div); window.history.back(); }, 250); }
	if (dir == 'right') { div.innerHTML = DIVR; setTimeout(function() { div.parentNode.removeChild(div); window.history.forward(); }, 250); }
	document.documentElement.appendChild(div);
}

// Add navigation to Chrome using Right Click + Mouse Move
window.addEventListener("contextmenu", function(event)
{
	if (navigation == 1 && position != null) event.preventDefault();
}, true);

// Add navigation to Chrome using Right Click + Mouse Move
window.addEventListener("mouseup", function(event)
{
	if (navigation == 1 && position != null)
	{
		if (position - event.clientX > 30) { onScreen('left'); return false; }
		if (position - event.clientX < -30) { onScreen('right'); return false; }
		position = null;
	}
}, true);

// Add navigation to Chrome using Right Click + Mouse Move
window.addEventListener("mousedown", function(event)
{
	position = null;
	if (navigation == 1 && event.button == 2) position = event.clientX;
}, true);
