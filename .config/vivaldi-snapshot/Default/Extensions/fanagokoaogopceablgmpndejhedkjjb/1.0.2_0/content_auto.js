function correctUrl(url){
    if(url){
        if(url.indexOf('http') == -1){
            url = location.protocol + '//' + location.host + url;
        }
        return url;
    }else{
        return false;
    }
}

var all = [];

$('*[src*=".swf"]').each(function(){
    var src = correctUrl($(this).attr('src'));
    if(src) all.push(src);
});

$('*[data*=".swf"]').each(function(){
    var src = correctUrl($(this).attr('data'));
    if(src) all.push(src);
});

$('*[value*=".swf"]').each(function(){
    var src = correctUrl($(this).attr('value'));
    if(src) all.push(src);
});

setTimeout(function(){
    if(all.length > 0){
        chrome.extension.sendRequest(
            {all:all},
            function(response){}
        );
    }
},500);