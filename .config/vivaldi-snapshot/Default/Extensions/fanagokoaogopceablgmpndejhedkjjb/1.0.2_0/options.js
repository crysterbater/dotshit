function get(e){var t=localStorage[e];if(!t||t=="false"){return false}return t}
function set(e,t){localStorage[e]=t}

function getlist(){
    var list = get('items');
    if(list){
        return JSON.parse(list);
    }else{
        setlist([]);
        return [];
    }
}

function setlist(list){
    if(list){
        set('items',JSON.stringify(list));
    }
}

function initCheck(id){
    if(get(id)){
        $('#'+id).attr('checked','checked');
    }
}

function changeCheck(id){
    if(get(id)){
        set(id,false);
        $('#'+id).removeAttr('checked');
        //_gaq.push(['_trackEvent','checkbox',id,'disable']);
    }else{
        set(id,true);
        $('#'+id).attr('checked','checked');
        //_gaq.push(['_trackEvent','checkbox',id,'enable']);
    }
}

function addFlash(url){
    var l = getlist();
    var is = false;
    for(var i in l){
        if(l[i] == url){
            is = true;
        }
    }
    if(!is){
        l.push(url);
        setlist(l);
    }
    //_gaq.push(['_trackEvent','options','add']);
}

function renderlist(){
    var listElm = $('#list');
    listElm.empty();
    var list = getlist();
    for(var i in list){
        var flash = $('<div class="flash" data-id="' + i + '"></div>');
        listElm.append(flash);
        flash.append(
            $('<span class="url" data-url="' + list[i] + '"><img src="img/play.png" class="play" alt="" />' + list[i] + '</span>').click(function(){
                $('#list .flash .url').removeClass('active');
                $(this).addClass('active');
                var url = $(this).attr('data-url');
                $('#flash iframe').attr('src',url);
                //_gaq.push(['_trackEvent','options','play']);
            })
        );
        flash.append(
            $('<img src="img/remove.png" class="remove" alt="" />').click(function(){
                if(confirm('Really do you remove this flash?')){
                    var id = $(this).parent('.flash').attr('data-id');
                    var list = getlist();
                    list.splice(id,1);
                    setlist(list);
                    renderlist();
                    //_gaq.push(['_trackEvent','options','remove']);
                }
            })
        );
    }
}

$(document).ready(function(){
    
    renderlist();
    
    $('#add input[type="button"]').click(function(){
        var val = $('#add input[type="text"]').val();
        if(val && val.indexOf('.swf')!=-1){
            $('#add input[type="text"]').val('');
            addFlash(val);
            renderlist();
        }else{
            alert('Url must be type SWF!');
        }
    });
    
    $('.tab').click(function(){
        window.open('tab.html','_blank');
        //_gaq.push(['_trackEvent','options','open detail']);
        window.close();
    });
    
    $('input[type=checkbox]').each(function(){
        if($(this).hasClass('check_locstor')){
            initCheck($(this).attr('id'));
        }
    });
    
    $('input[type=checkbox]').change(function(){
        if($(this).hasClass('check_locstor')){
            changeCheck($(this).attr('id'));
        }
    });
    
});

chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
    if(request.url){
        setTimeout(function(){
            renderlist();
        },1000);
    }
});

/*var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-64425944-1']);
_gaq.push(['_trackPageview']);
_gaq.push(['_trackEvent','options','start page']);
(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = 'https://stats.g.doubleclick.net/dc.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();*/