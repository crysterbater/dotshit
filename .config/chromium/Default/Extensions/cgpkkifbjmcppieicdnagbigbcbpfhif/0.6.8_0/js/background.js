chrome.browserAction.setBadgeBackgroundColor({"color":"#999"});
chrome.storage.onChanged.addListener(setBadge);
function setBadge(){
    chrome.storage.sync.get("mode", function(data){
        var mode = data.mode;
        switch(mode){
            case "strict" :
                toggleIcon(true);
                chrome.browserAction.setBadgeText({"text":"W"});
                break;
            case "adaptive" :
                toggleIcon(true);
                chrome.browserAction.setBadgeText({"text":"A"});
                break;
            case "user" :
                toggleIcon(true);
                chrome.browserAction.setBadgeText({"text":"U"});
                break;
            case "off" :
                toggleIcon(false);
                chrome.browserAction.setBadgeText({"text":""});
                break;
        }
    });
}

function toggleIcon(on){
    if(on){
        chrome.browserAction.setIcon({
            "path":"icons/19.png"
        });
    } else {
        chrome.browserAction.setIcon({
            "path":"icons/19_off.png"
        });
    }
}

setBadge();