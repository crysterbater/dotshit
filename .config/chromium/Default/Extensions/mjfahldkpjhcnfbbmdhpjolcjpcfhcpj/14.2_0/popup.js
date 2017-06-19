// Copyright (c) 2017 - Martin Sermak

document.getElementById("settings").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'settings'});
	window.close();
});

document.getElementById("extend").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'extend'});
	window.close();
});

document.getElementById("download").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'download'});
	window.close();
});

document.getElementById("history").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'history'});
	window.close();
});

document.getElementById("bookmark").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'bookmark'});
	window.close();
});

document.getElementById("options").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'options'});
	window.close();
});

document.getElementById("translate").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'translate'});
	window.close();
});

document.getElementById("cache").addEventListener("click",function()
{
	chrome.runtime.sendMessage({popup: 'cache'});
	window.close();
});
