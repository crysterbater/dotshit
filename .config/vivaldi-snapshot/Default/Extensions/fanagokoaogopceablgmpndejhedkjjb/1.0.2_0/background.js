var ext_name = chrome.app.getDetails().name;

function checkFirstStart(){
    if(!get('first_start')){
        set('first_start',true);
        set('items','[]');
    }
}

function get(name){
    var val = localStorage[name];
    if(!val || val == 'false'){
        return false;
    }
    return val;
}

function set(name,val){
    localStorage[name] = val;
}

function getItems(){
    var items = get('items');
    if(items){
        return JSON.parse(items);
    }else{
        setItems([]);
        return [];
    }
}

function setItems(items){
    if(items){
        set('items',JSON.stringify(items));
    }
}

function deleteItem(pos){
    var items = getItems();
    items.splice(pos,1);
    setItems(items);
}

function addFlash(url){
    var l = getItems();
    var is = false;
    for(var i in l){
        if(l[i] == url){
            is = true;
        }
    }
    if(!is){
        l.push(url);
        setItems(l);
    }
}

function createContextMenu(){
    chrome.contextMenus.removeAll(function(){});
    chrome.contextMenus.create({
        'title': chrome.app.getDetails().name,
        'id': 'flashplayercontext1'
    });
    chrome.contextMenus.create({
        'title': 'Add all flashes from this page to Playlist',
        'parentId': 'flashplayercontext1',
        'onclick': function(e){
            var manual_detect = get('manual_detect');
            if(manual_detect){
                checkFlash('code',manual_detect);
            }else{
                checkFlash('file','content_manual.js');
            }
            //_gaq.push(['_trackEvent','context','add']);
            showNotify(ext_name,'Flashes has been added to your list.');
        }
    });
    chrome.contextMenus.create({
        'title': 'Go to FullScreen Player',
        'parentId': 'flashplayercontext1',
        'onclick': function(e){
            window.open('tab.html','_blank');
            //_gaq.push(['_trackEvent','context','detail']);
        }
    });
    chrome.contextMenus.create({
        'title': 'Go to Options',
        'parentId': 'flashplayercontext1',
        'onclick': function(e){
            window.open('options.html','_blank');
            //_gaq.push(['_trackEvent','context','options']);
        }
    });
}

function contentDetect(tab){
    var default_detect = get('default_detect');
    if(default_detect){
        checkFlash('code',default_detect);
    }
    if(get('auto_detect_enable')){
        var auto_detect = get('auto_detect');
        if(auto_detect){
            checkFlash('code',auto_detect);
        }else{
            checkFlash('file','content_auto.js');
        }
    }
}

function checkFlash(type,str){
    if(type=='file'){
        chrome.tabs.executeScript(null,{file:'jquery.js',runAt:'document_end'},function(){
            chrome.tabs.executeScript(null,{file:str,runAt:'document_end'},function(){});
        });
    }else if(type=='code'){
        chrome.tabs.executeScript(null,{file:'jquery.js',runAt:'document_end'},function(){
            chrome.tabs.executeScript(null,{code:decodeURIComponent(str),runAt:'document_end'},function(){});
        });
    }
}

function showNotify(title,text){
    var id = 'id_' + Math.floor((Math.random()*1000000)+1);
    chrome.notifications.create(id,{   
        type: 'basic', 
        iconUrl: 'img/ico_128.png', 
        title: title, 
        message: text,
        priority: 0
    },function(){});
}

// init

$(document).ready(function(){
    
    if(!get('items')){
        set('items','[]');
    }
    
    //initConfig();
    checkFirstStart();
    createContextMenu();

});

// listeners

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(changeInfo.status == 'complete' && (tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1)){
        contentDetect(tab);
    }
});

chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
    if(request.url){
        addFlash(request.url);
    }else if(request.all){
        set('temp_req_cont',JSON.stringify(request.all));
        chrome.notifications.create('86fsah4gn53g_'+(new Date()).getTime(),{   
            type: 'basic', 
            iconUrl: 'img/ico_128.png', 
            title: 'Flashes detected!', 
            message: 'Click for add flashes from this page to Playlist',
            priority: 0
        },function(){});
    }
});

chrome.notifications.onClicked.addListener(function(e){
    var urls = get('temp_req_cont');
    if(urls){
        var parse_urls = JSON.parse(urls);
        for(var i in parse_urls){
            addFlash(parse_urls[i]);
        }
        chrome.extension.sendRequest(
            {options_refresh:true},
            function(response){}
        );
        //_gaq.push(['_trackEvent','notify','click']);
    }
});

/*var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-64425944-1']);
_gaq.push(['_trackPageview']);
(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = 'https://stats.g.doubleclick.net/dc.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();*/