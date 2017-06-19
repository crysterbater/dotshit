function addUrl(url){
    if(url){
        if(url.indexOf('http') == -1){
            url = location.protocol + '//' + location.host + url;
        }
        chrome.extension.sendRequest(
            {url:url},
            function(response){}
        );
    }
}

$('*[src*=".swf"]').each(function(){
    addUrl($(this).attr('src'));
});

$('*[data*=".swf"]').each(function(){
    addUrl($(this).attr('data'));
});

$('*[value*=".swf"]').each(function(){
    addUrl($(this).attr('value'));
});