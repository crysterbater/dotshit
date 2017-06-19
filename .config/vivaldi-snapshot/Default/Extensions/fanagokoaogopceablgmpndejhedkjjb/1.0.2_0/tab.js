var bgPage = chrome.extension.getBackgroundPage();

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

function renderList(){
    var items = bgPage.getItems();
    var list = $('.list');
    for(var i=items.length-1; i>=0; i--){
        var item = items[i];
        var video = $('<span class="video" data-pos="' + i + '" data-id="' + item + '"></span>');
        list.append(video);
        var title = $('<span title="PLAY: ' + item + '" class="title">' + item + '</span>');
        title.click(function(){
            var id = $(this).parent('.video').attr('data-id');
            startPlay(id);
            $('.list .video').removeClass('active');
            $(this).parent('.video').addClass('active');
            //_gaq.push(['_trackEvent','detail','play']);
        });
        video.append(title);
        var del = $('<span title="Delete this item from playlist" alt="" class="icon delete"></span>');
        del.click(function(){
            var pos = $(this).parent('.video').attr('data-pos');
            if(confirm('Really do you want to delete this item?')){
                bgPage.deleteItem(pos);
                //_gaq.push(['_trackEvent','detail','remove']);
            }
            reloadList();
        });
        video.append(del);
        
        video.append($('<span class="clear"></span>'));
    }
    $(".list").getNiceScroll().resize().show();
}

function reloadList(){
    $('.list').html('');
    renderList();
}

function startPlay(id){
    $('.player iframe').attr('src',id);
    set('last_video',id);
}

function shareInit(){
    var url = encodeURIComponent('http://chrome.google.com/webstore/detail/' + chrome.app.getDetails().id);
    var text = encodeURIComponent(chrome.app.getDetails().name);
    $('#hlavni .share').html('<div class="item fb_share"><a href="http://www.facebook.com/share.php?u=' + url + '" title="Share on Facebook" target="_blank"><img src="img/facebook.png" alt=""></a></div><div class="item twt"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="https://platform.twitter.com/widgets/tweet_button.html?text=' + text + '%20' + url + '" style="width:70px; height:20px;"></iframe></div>');
}

$(document).ready(function(){
    
    renderList();
    
    var last_video = get('last_video');
    if(last_video){
        startPlay(last_video);
        $('.list .video[data-id="'+last_video+'"]').addClass('active');
    }
    
    $('.list').niceScroll({
        cursorcolor: '#eee',
        cursorwidth: '1',
        cursorborder: 'solid 1px #ccc',
        cursoropacitymin:0.6
    });
    
    $('.add_url').click(function(){
        window.open('options.html','_blank');
        //_gaq.push(['_trackEvent','detail','open options']);
        window.close();
    });
    
    setTimeout(function(){
        shareInit();
    },100);
	
});

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse){
        if(request.action == 'bg_add_new_item'){
            reloadList();
        }
    }
);

/*var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-64425944-1']);
_gaq.push(['_trackPageview']);
_gaq.push(['_trackEvent','detail','start page']);
(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = 'https://stats.g.doubleclick.net/dc.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();*/