var j = document.createElement('script');
j.src = chrome.extension.getURL('js/jquery-2.1.3.min.js');
(document.head || document.documentElement).appendChild(j);
var s = document.createElement('script');
s.src = chrome.extension.getURL('js/main.js');
(document.head || document.documentElement).appendChild(s);

var body = $("body");

function setMode(mode, intro, outro, shortTime){
    body.attr("ytSkipper",mode);
    body.attr("ytSkipper-intro",intro);
    body.attr("ytSkipper-outro",outro);
    body.attr("ytSkipper-shortVid",shortTime);
}

function getSettings(){
    chrome.storage.sync.get(["mode","intro","outro", "shortVid"],function(data){
        var mode = data.mode.slice(0,1) || "adaptive";
        var introTime = data.intro || 0;
        var outroTime = data.outro || 0;
        var shortTime = data.shortVid || 0;
        setMode(mode, introTime, outroTime, shortTime);
    });
}

getSettings();
chrome.storage.onChanged.addListener(getSettings);