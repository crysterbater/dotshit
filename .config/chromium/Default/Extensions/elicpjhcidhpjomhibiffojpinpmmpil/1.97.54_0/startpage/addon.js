$.extend({strstr: function(b,c,a){var d=0;b+="";d=b.indexOf(c);if(d==-1){return false}else{if(a){return b.substr(0,d)}else{return b.slice(d)}}}})


var fVideo=true;
var defaults=defaults2;

var VideoSites = defaults.VideoSites;

var userContent={};

var fr = {
slastInner:"",
fEditMode:false,
nPages:0,
nCurPage:0,
lpToplinkBottomFolder:0,
lpCurFolder:0,
nToplinks:0,
nToplinksPerPage:0,
nCurFolderLevel:0,
lpFolderStack:[{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""}],
n1x1Count:0,
nShoppingMode:0,
FilterList:new Array(),
FilterListCount:0,
curFilter:"",
fReadCookies:1,
nCurSearchProvider:0,
nToRender:0,
nRenderd:0,
lpOverlayPos:new Array(),
lpDragTargets:0,
curTimer:0,
curVideo:-1,


FilterToplinks:function ( tl)
{
    var count = tl.length;
    var lwr = this.curFilter.toLowerCase();
    for (var j=0; j<count; j++)
    {
        if ( tl[j].type == "f")
            this.FilterToplinks( tl[j].Toplinks);
        else
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        }
    } 
},
        
SetVideoFilter:function ( txt)
{
    this.curFilter = txt;
    fr.checkAddButtons();
    this.FilterList = new Array();
    this.FilterListCount = 0;
    
    
    var videofolder = fr.FindToplinkType( 0, "v");
    if ( txt=="")
    {
        fr.doSetFolder( videofolder.id);
    }
    else
    {
        var tl = videofolder.Toplinks;
        var count = tl.length;
        var lwr = this.curFilter.toLowerCase();
        for (var j=0; j<count; j++)
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        } 
        this.lpCurFolder = new Object();
        this.lpCurFolder.id=0;
        this.lpCurFolder.type="v";
        this.lpCurFolder.Toplinks = this.FilterList;
        this.nCurPage=0;
    }
    this.doResize();
},

SetFilter:function ( txt)
{
    fr.SetVideoFilter(txt);
    return;
},

doSetFolder:function ( id)
{
    if ( this.lpCurFolder && id == this.lpCurFolder.id)
        return;
    
    fr.curTimer++;
    if ( id<0) // one level up
    {        
        if ( this.nCurFolderLevel>0)
            this.nCurFolderLevel--;
        this.nCurPage = this.lpFolderStack[this.nCurFolderLevel].page;
        var tl = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel].id);
        if ( tl)
            this.lpCurFolder = tl;
        else
            this.lpCurFolder = 0;
        this.doResizeHome();   
        
        fr.doShowHelp();
        fr.checkAddButtons();
        return;
    }
    
    var tl = fr.FindToplink( 0, id);
    
    this.ReloadFolder( tl);
    fr.checkAddButtons();
    fr.doShowHelp();
},

checkAddButtons:function()
{
    if ( !fr.curFilter && fr.settings.fShowToplinks && ( !fr.lpCurFolder || fr.lpCurFolder.type=="f"))
    {
        $("#idAddFolder").show();
        $("#idAddUrl").show();
    }
    else
    {
        $("#idAddFolder").hide();
        $("#idAddUrl").hide();
    }
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        fr.CreateVideoBar();
        $("#idVideobar").show();
        
    }
    else
    {
        $("#idVideobar").hide();
        
    }
},
ReloadFolder:function( folder)
{        
    if ( folder.type == "f")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.nCurPage=0;
        fr.doResizeHome();
    }
    else if ( fVideo && folder.type == "v")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        var dataitems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();            
            if ( fr.startvideoid)
            {
                var tl = fr.FindToplinkType( 0, "v");
                if(tl)
                for ( var i = 0; i < tl.Toplinks.length; i++)
                {
                    var o = tl.Toplinks[i];
                    if ( o.video_id == fr.startvideoid)
                    {
                        fr.PlayVideo(o);
                        fr.startvideoid = false;
                        break;
                    }
                }
            }
        }); 
        
        if (typeof(dataitems) != 'undefined')
            if ( dataitems)
                fr.ConvertVideoData( dataitems);
        fr.nCurPage=0;
        fr.doResizeHome();        
    }
},

 
ConvertVideoData:function( dataitems)
{
    fr.lpCurFolder.Toplinks = new Array();
    for (var i=0; i<dataitems.length; i++) 
    {
        var item = dataitems[i];
    
        var o = new Object();
        o.playhtml = item.html;
        o.searchurl="";
        o.type="video"
        o.url = item.video_url;
        //alert( i+": "+print_r(item));
        o.thumb=item.thumbnail_url;
        o.name = item.title;
        o.video_id = item.video_id;
        
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( fr.lpCurFolder && fr.lpCurFolder.Toplinks && fr.lpCurFolder.type=="v")
            fr.lpCurFolder.Toplinks.push(o);
    }
},

resizeIFrame:function( )
{
    var o1 = document.getElementById("idPlayVideoThumbs"); 
    var o2 = document.getElementById("idPlayVideoInner"); 
    var o3 = o2.firstChild;
    if ( !o3)
        return;
    var o4 = document.getElementById("idSlideshow"); 
    if ( !o4)
        return;
    if ( o4)
    {
        var dx = o4.offsetWidth;
        var dy = o4.offsetHeight;
        o3.id="idPV";
        o2.style.left="16px";
        o2.style.top="100px";
        o3.width=dx-300;
        o3.height=dy-60-18;
        o1.style.height=(dy-36)+"px";
    }
},


videoPlaying:false,
PlayVideo:function( o)
{
    if ( !fVideo)
        return;
    if ( !o)
    {
        fr.videoPlaying=false;
        $("#idPlayVideoInner").html("");
        $("#idPlayVideoThumbs").html("");
        $("#idPlayVideo").hide();        
        fr.ShowToplinks(fr.settings.fShowToplinks);
        fr.doResize();
        fr.doShowHelp();
        document.title = fr.title;
        chrome.extension.sendMessage({msg: "OnSP24PlayVideo",url:false}, function(response) { });
        return;
    }
    document.title = o.name;
    fr.videoPlaying=true;
    fr.doShowHelp();
    var s="<a href='"+o.url+"'>"+t["original"]+"</a>";
    $("#idVideoTitle").html(s);
    $("#idVideoClose").html(t["close"]);
    fr.myBindClick("#idVideoTitle", { }, function(ev) {$("#idPlayVideoInner").html("");window.location.replace( o.url);return false;});
         
    chrome.extension.sendMessage({msg: "OnSP24PlayVideo",url:o.url,title:o.name}, function(response) { });
    
    if ( o.playhtml)    
    {        
        var i = o.playhtml.indexOf( "<iframe");
        if ( i >= 0)
        {
            i = o.playhtml.indexOf( "src=",i);
            if ( i >= 0)
            {
                if ( o.playhtml[i+4] == '"')
                    i2 = o.playhtml.indexOf( '"',i+5);
                else if ( o.playhtml[i+4] == '\'')
                    i2 = o.playhtml.indexOf( '\'',i+5);
                if ( i2 >=i)
                {
                    src = o.playhtml.substr(i+5,i2-i-5);
                    if ( src.indexOf("//")== 0)
                        src = "http:"+src;
                    o.playhtml = src;
                }
            }
        }
        
        if ( o.playhtml.indexOf("http")==0)
        {
            var sInner = "<iframe id='idPV' src='"+o.playhtml+"'></iframe>";
            $("#idPlayVideoInner").html(sInner);
        }        
        fr.resizeIFrame();        
    }
    $("#idPlayVideo").show();
    //fr.myBindClick("#idPlayVideo", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idVideoClose", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoBg", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoThumbs", { }, function(ev) {fr.PlayVideo(0);return false;});
    
    
    
    $("#idToplinks").hide();
    
    $("#idPlayVideoThumbs").html("");
    if ( !fr.curvideolist)
        return;
        
    var j = 0;
    var y=0;
    
    var a = new Array();
    var m = 0;
    var len=fr.curvideolist.length;
    for ( var i = 0; i < len; i++)
    {
        var cur = fr.curvideolist[i];
        if ( cur.url == o.url)
        {
            if ( i > 0)
                a.push( fr.curvideolist[i-1]);
            else
            {
                len--;
                a.push( fr.curvideolist[len]);
            }
            for ( var j = i+1; j < len; j++)
                a.push(fr.curvideolist[j]);
            for ( j=0; j+1 < i; j++)
                a.push(fr.curvideolist[j]);
            break;
        }
    }
    for ( var i = 0; i < a.length; i++)
    {
        var cur = a[i];
        if ( cur.type != "video")
            continue;        
            
        var sInner = "";
        sInner+= '<div style="top:'+y+'px;background:#000" id="idv_'+j+'" class="clVideo"><a>';
        y+=136;
        var thumb = fr.GetToplinkThumb(cur);
        var si = GetImageSize(thumb);
        
        sInner+= fr.createVideoItemHtml(j,cur,thumb, 224,126,si); 
        
        sInner+= '</a><div id="id4v_'+j+'"  class="clOverlay"><a>'+cur.name+'</a></div>';
        sInner+= '</div>';
        
        $("#idPlayVideoThumbs").append(sInner);
        
        fr.myBindClick("#idv_"+j, { param: cur }, function(ev) {
            fr.PlayVideo(ev.data.param);
            return false;});
        fr.myBindIn("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
               $("#"+ev.data.param).css("visibility","visible");
            });
        fr.myBindOut("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
            $("#"+ev.data.param).css("visibility","hidden");
            });
        j++;
    }
},
 
doSetPage:function ( p)
{
    this.nCurPage=p;
    this.doResizeHome();
},
 
doNav:function ( url)
{
    $("#idAll").show();
    if ( url.indexOf("chrome://")>=0)
        L64P.browser.navigateChromeURL({url:url});     
    else
        window.location.replace( url);
},

doChangePage:function ( d)
{
    if ( d == -1)
    {
        if ( this.nCurPage>0)
            this.nCurPage--;
        else
            this.nCurPage= this.nPages-1;
        fr.doResizeHome();   
    }
    else if ( d == 1)
    {
        if ( this.nCurPage+1<this.nPages)
            this.nCurPage++;
        else
            this.nCurPage=0;
        fr.doResizeHome();
    }
},

doShowName:function ( id)
{
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "visible";
        
    
    if ( !fr.idCurrentEdit)
    {
        $('#'+id.replace("id4_", "idback_")).css( "opacity","1.0"); // Chrome
        $('#'+id.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 100)");
    }
    
    //if ( this.fEditMode)
    {
        var o = document.getElementById(id.replace("id4_", "idBlack_")); 
        if ( o)
            o.style.visibility = "visible";
    }
},

doShowNameHome:function ( idText, idToplink, jpg)
{ 
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    if ( !jpg)
        return;
    jpg = jpg.replace("_224", "_448");
    fr.curTimer++;
    //setTimeout( fr.doShowScreenshot, 500, idToplink,jpg,fr.curTimer);
    setTimeout( function ( idToplink, url, timer){
                fr.doShowScreenshot(idToplink, url, timer);
                }, 500, idToplink,jpg,fr.curTimer);
    var o = document.getElementById(idText); 
    if ( o)
        o.style.visibility = "visible";
        
    var o = document.getElementById(idText.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "visible";
        
    if ( !fr.idCurrentEdit)
    {
        $('#'+idText.replace("id4_", "idback_")).css( "opacity","1.0"); // Chrome
        $('#'+idText.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 100)");
    }
},

doShowScreenshot:function ( idToplink, url, timer)
{   
    if ( timer != fr.curTimer)
        return;
    var o2 = document.getElementById("idOverlay"); 
    var o3 = document.getElementById( "id_"+idToplink); 
    if ( o2 && o3)
    {
        var x = fr.lpOverlayPos[idToplink].x;
        o2.style.left = x+"px";
        var y = fr.lpOverlayPos[idToplink].y;
        o2.style.top = y+"px";
        var dx = fr.lpOverlayPos[idToplink].dx;
        o2.style.width = dx+"px";
        var dy = fr.lpOverlayPos[idToplink].dy;
        o2.style.height = dy+"px";
        
        var si = GetImageSize(url);
        if ( si )
            o2.innerHTML=fr.createVideoOverlayHtml( url, dx, dy,si);
        else
            o2.innerHTML="<img width='100%' height='100%' src='"+url+"'></img>";                 
        o2.style.visibility = "visible";
    }
},

doHideName:function ( id)
{
    fr.curTimer++;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "hidden";
    
    var o = document.getElementById(id.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "hidden";
    
    if ( !fr.idCurrentEdit)
        if ( !this.lpCurFolder || this.lpCurFolder.type != "v")
            $('#'+id.replace("id4_", "idback_")).css( "opacity", fr.settings.trans); // Chrome
            
    //$('#'+id.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 80)");
    
    var o2 = document.getElementById("idOverlay"); 
    if ( o2)
        o2.style.visibility = "hidden";
},
 

doResize:function () 
{
    fr.resizeIFrame();
    fr.doResizeHome();
},

slideDX:0,
slideDY:0,
positionSlideshow:function()
{
    this.slideDX=0;
    this.slideDY=0;
    var o = document.getElementById("idSlide"); 
    if ( o && o.width && o.height)
    {
        fr.doResizeHome();
        $("#body").css("visibility","visible");
    }
    else
        setTimeout( function(){fr.positionSlideshow(1);} , 50);        
},

myBind:function( id, what, ob, callback)
{
    if (typeof(callback) != "function")
        return;
    $(id).unbind(what); // avoid calling it twice
    //ob.callback = callback;
    $(id).bind(what, ob, function(ev) { 
        return callback(ev);
        });
},

myBindIn:function( id, ob, callback)
{
    fr.myBind( id, "mouseenter", ob, callback);
},
myBindOut:function( id, ob, callback)
{
    fr.myBind( id, "mouseleave", ob, callback);
},
myBindClick:function( id, ob, callback)
{
    fr.myBind( id, "click", ob, callback);
},

curvideolist:0,
transToplinks:0,
doResizeHome:function ( ) 
{       
    var editAfterResize = fr.idCurrentEdit;
    fr.closeEdit( 2);
    
    var bkcolor = fr.GetBackgroundColor();
    if ( bkcolor != -1)
    {
        $("#idSlideshow").html("");
        $("#idSlideshow").css("background", bkcolor);
        $("#idSlideshow").css("visibility","visible");
        var b1 = bkcolor;
        var b2 = fr.GetGradientColor(b1);
        
        $("#idSlideshow").css("background", "-webkit-linear-gradient(top left, "+b1+" 0%, "+b2+" 100%)");
    }
     
    o = document.getElementById("idSearchButton"); 
    x = o.offsetWidth;
    var xx = o.offsetLeft;
    if ( x < 10)
        x = 10;           
    //o = document.getElementById("idInput"); 
    //o.style.width = x-10+"px";
    
    var o2 = document.getElementById("idSearchButton2"); 
    o2.style.left = xx+x+"px";
    
    
    //-------------------------------- PrepareToplinks for drawing--------------------------------
    o = document.getElementById("toplinks"); 
    dx = o.offsetWidth;
    dy = o.offsetHeight;
    
    if ( dx < 860)
        $("#langKey_addfolder").hide();
    else 
        $("#langKey_addfolder").show();
       
    if ( dx < 750)
        $("#langKey_editToplinks-2").hide();
    else 
        $("#langKey_editToplinks-2").show();
        
    if ( dx < 800)
        $("#langKey_addToplink").hide();
    else 
        $("#langKey_addToplink").show();
        
    dy-=5;
    dy1 = (dy-20)/3;
    if ( dy1 > 126)
        dy1 = 126;
        
    dx1 = 224*dy1/126;
    nCols = Math.floor((dx+10)/(dx1+10));
    
    var bottom2 = this.lpCurFolder ? this.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var bottom = new Array();
     
    for ( var j = 0; j < bottom2.length; j++)
    {
        var cur = bottom2[j];
        if ( !cur)
            continue;        
        if ( !(fr.settings.folder&8) && cur.type == "v")
            continue;
        bottom.push(cur);           
    }
                       
    fr.curvideolist = 0;
    if ( this.lpCurFolder && this.lpCurFolder.type =="v")
    {
        fr.curvideolist = bottom;
        if ( this.fEditMode)
            fr.fVideosChanged=true; // we are in videofolder in edit mode
    }

    this.nToplinks=bottom.length;
    
    this.nToplinksPerPage=nCols*3;
    if ( this.nToplinksPerPage<1)
        this.nPages = 0;
    else
        this.nPages=Math.floor((this.nToplinks+this.nToplinksPerPage-1)/this.nToplinksPerPage);

    if ( this.nCurPage+1>this.nPages)
        this.nCurPage = this.nPages-1;
    if ( this.nCurPage<0)
        this.nCurPage = 0;
        
    ofs = this.nCurPage*this.nToplinksPerPage;
    
    var nTotal = this.nToplinks;
    count = this.nToplinksPerPage;
    
    if ( count+ofs > nTotal)
    {
        count = nTotal-ofs;
        nCols = Math.floor((count+2)/3);
    }
    
    var sInner="";
    for ( var j = 0; j<count; j++)
    {
        i = j+ofs;
        var cur = bottom[i];
        if ( !cur)
            continue;
        if ( !cur.screenshotURL)
        {
            this.GetScreenshotUrl( cur, !cur.thumb);
        }        
        var thumb = fr.GetToplinkThumb(cur);
        sInner+= '<img class="clThumbBase" src="'+thumb+'"></img>';      
        
       
    }   
    $ ("#idHiddenThumbs").html( sInner);
    fr.transToplinks = new Object();
    //-------------------------------- DrawToplinks --------------------------------    
    for ( m = 0; m<2; m++) // Beim 2ten Mal die Events setzen
    {
        sInner=""
        for ( var j = 0; j<count; j++)
        {
            i = j+ofs;
            
            var cur = bottom[i];
            if ( !cur)
                continue;
                
            var fFolder = ( cur.type == "f" || cur.type == "v");            
            var fShowTitle = ( cur.def && cur.url);
            if ( m)
            {
                fr.myBindClick("#idback_"+j, { }, function(ev) {return false;});
                
                if ( fFolder)
                {
                    fr.myBindClick("#id_"+j, { param: cur.id }, function(ev) {fr.doSetFolder( ev.data.param);return false;});
                }
                else if ( !this.fEditMode)
                {
                    
                    if ( cur.type == "video")
                        fr.myBindClick("#id_"+j, { param: cur }, function(ev) {fr.PlayVideo(ev.data.param);return false;});
                    else
                        fr.myBindClick("#id_"+j, { param: cur.url }, function(ev) {fr.doNav(ev.data.param);return false;});
                }
                if ( cur.screenshotURL && cur.screenshotURL != "*" && !fFolder && !fShowTitle && !this.fEditMode && cur.type != "downloads")
                    fr.myBindIn("#id_"+j, { param1: 'id4_'+j,param2: j, param3: cur.screenshotURL }, 
                                     function(ev) {fr.doShowNameHome( ev.data.param1, ev.data.param2, ev.data.param3);});
                else
                    fr.myBindIn("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doShowName( ev.data.param);});
                    
                fr.myBindOut("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doHideName( ev.data.param);});
                                              
                if ( this.fEditMode)
                {
                    fr.myBind("#id_"+j,'mousedown', { param: "#id_"+j, param2:cur.id}, function(ev) {fr.HandleDrag( 1,ev.data.param,ev.data.param2);});
                    fr.myBind("#id_"+j,'mouseup', { }, function(ev) {fr.HandleDrag( 0);});
                                        
                    $("#id5_"+j).unbind('click');
                    
                    //fr.myBindClick("#idbegin_"+j, { param: cur.id }, function(ev) {fr.MoveBegin( ev.data.param);return false;});
                    //fr.myBindClick("#idend_"+j, { param: cur.id }, function(ev) {fr.MoveEnd( ev.data.param);return false;});
                }
                fr.myBindClick("#idedit_"+j, { param: cur.id }, function(ev) {fr.EditUrl( ev.data.param,false);return false;});
                fr.myBindClick("#iddel_"+j, { param: cur.id }, function(ev) {fr.DelToplink( ev.data.param);return false;});
                
                
            }
            else
            {
                var thumb = fr.GetToplinkThumb(cur);
                fr.transToplinks[cur.id] = 'idback_'+j;
                if ( fr.idCurrentEdit == cur.id || cur.type == "video")
                    sInner+= '<div id="idback_'+j+'" class="clToplinkBack" >'; // aaaaaaaaaaaaaaaaa
                else
                    sInner+= '<div id="idback_'+j+'" class="clToplinkBack" style="opacity:'+fr.settings.trans+'">'; // aaaaaaaaaaaaaaaaa
                if ( fr.drag==2 && fr.dragToplinkId == cur.id) // Resize during D&D: Set new divId and make item hidden
                {
                    fr.dragId="id_"+j;
                    sInner+= '<div style="visibility:hidden;cursor:default" id="id_'+j+'" class="clToplink"></div>';
                }
                else if ( fFolder)
                {
                    sInner+= '<div id="id_'+j+'" class="clToplink" ><a><img draggable=false  class="clThumb" width="100%" height="100%" src="'+thumb+'"></img></a>';
                    if ( cur.type == "f")
                        sInner+= '<div class="clOverlayFolder"><a style="font-size:18px;font-weight:bold;color:#666;">'+cur.name+'</a></div>';
                    
                    sInner+= '<div id="id4_'+j+'" class="clOverlay"><a>'+cur.name+'</a></div>';

                    sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                    //if ( this.fEditMode)
                    {
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                        
                    }
                    sInner+= '</div>';
                }
                else
                {
                    if ( this.fEditMode)
                    {                
                        
                        {
                            if ( cur.type == "video")
                                sInner+= '<div style="cursor:default;background:#000" id="id_'+j+'" class="clToplink"><a>';
                            else
                                sInner+= '<div style="cursor:default" id="id_'+j+'" class="clToplink"><a>';
                            if ( cur.type == "app")
                            {
                                var si = new Object();
                                si.w = si.h = 90;
                            }
                            else
                                var si = GetImageSize(thumb);
                                
                            if ( cur.type == "video")
                            {
                                sInner+= fr.createVideoItemHtml(j,cur,thumb, dx1, dy1,si);                                 
                            } 
                            else if ( si)
                                sInner+= '<img draggable=false  class="clThumb" style="width:'+si.w*dx1/224+'px;height:'+si.h*dx1/224+'px; margin-left:'+(224-si.w)*dx1/224/2+'px;margin-top:'+(126-si.h)*dx1/224/2+'px;" src="'+thumb+'"></img>';
                            else
                                sInner+= '<img draggable=false  class="clThumb" width=100% height=100%  src="'+thumb+'"></img>';                         
                            sInner+= '</a><div id="id4_'+j+'" class="clOverlay"><a>'+cur.name+'</a></div>';
                            sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                        }
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                    }
                    else
                    {                        
                        {
                            if ( cur.type == "video")
                                sInner+= '<div id="id_'+j+'" style="background:#000" class="clToplink" ';
                            else
                                sInner+= '<div id="id_'+j+'" class="clToplink" ';
                            if ( cur.type == "app")
                            {
                                var si = new Object();
                                si.w = si.h = 90;
                                if ( cur.name.indexOf( "Web Store")>=0)
                                    sInner+= 'style="background:#bbb"';
                            }
                            else
                                var si = GetImageSize(thumb);
                            sInner+= '><a href="'+cur.url+'">';
                            
                            if ( cur.type == "video")
                            {
                                sInner+= fr.createVideoItemHtml(j,cur,thumb, dx1,dy1,si);                                 
                            } 
                            else if ( si)
                                sInner+= '<img draggable=false class="clThumb" style="width:'+si.w*dx1/224+'px;height:'+si.h*dx1/224+'px; margin-left:'+(224-si.w)*dx1/224/2+'px;margin-top:'+(126-si.h)*dx1/224/2+'px;" src="'+thumb+'"></img>';
                            else
                                sInner+= '<img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img>'; 
                            sInner+= '</a><div id="id4_'+j+'" class="clOverlay"><a href="'+cur.url+'">'+cur.name+'</a></div>'; 
                            sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                        }
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                    }
                    
                    sInner+= '</div>';
                }
                
                sInner+= '</div>';
            }
        }
        
        if ( !m)
        {
            sInner += "<div id='idOverlay'></div>";
            if ( this.slastInner != sInner)
            {
                this.slastInner= sInner;                 
                $("#toplinks").html(sInner);                
            }
        }
    }
    
    //-------------------------------- Toplink-Positionen berechnen --------------------------------
    x = (dx+10-(dx1+10)*nCols)/2;
    y = (dy-dy1*3-20)/2;
    row = 0;
    m = 2+5*dy1/126;
    var col = 0;
    
    
    var oParent = document.getElementById("toplinks"); 
    var xParent = parseInt(oParent.offsetLeft);
    var yParent = parseInt(oParent.offsetTop);  
        
    fr.lpDragTargets=0;
    var fdragitem=false;
    for (var j=0; j<count; j++)
    {
        var i = j+ofs;               
        
        s = "idback_"+j;
        o2 = document.getElementById(s); 
        if ( !o2)
            continue;
        o2.style.width = dx1+"px";
        o2.style.height = dy1+"px";
        o2.style.left = x+"px";
        o2.style.top = y+"px";   
                        
        if ( fr.drag)
        {
            
            var cur = i>=0?bottom[i]:0;
            if (!fr.lpDragTargets)
                fr.lpDragTargets = new Array();
            if ( cur)
            {
                if ( fr.dragToplinkId == cur.id)
                    fdragitem=true;    
                    
                var target = new Object(); // Insert before
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3;
                target.height = dy1*2/3;
                target.toplinkId = cur.id;
                target.divId = "#id_"+j;
                fr.lpDragTargets.push( target);
            }
            
            //if ( !cur || cur.type=="f")
            {
                var target = new Object(); // Insert into
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y+dy1/3;
                target.height = dy1/3;
                
                if ( !cur || cur.type=="f")
                {
                    target.toplinkId = cur ? cur.id : -1;
                    target.divId = "#id_"+j;
                    target.mode = 1;
                }
                else if ( fdragitem && i+1<bottom.length) // Lücke war schon, d.h. Mitte gehört dem nächsten
                {
                    target.toplinkId = bottom[i+1].id;
                    target.divId = "#id_"+(j+1);
                }
                else // Lücke kommt noch, d.h. Mitte gehört diesem
                {
                    target.toplinkId = cur.id;
                    target.divId = "#id_"+j;
                }
                fr.lpDragTargets.push( target);
            }
            
            if ( row == 2 && i+1<bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = bottom[i+1].id;
                target.divId = "#id_"+(j+1);
                fr.lpDragTargets.push( target);
            }
            else if ( i+1==bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = "end";
                target.divId = "#id_"+(j);
                target.mode = 2; // At the end
                fr.lpDragTargets.push( target);
            }
        }
        
        if ( !this.lpOverlayPos[j])
            this.lpOverlayPos[j] = new Object();
            
        if ( col*2+1 == nCols && nCols < 5) // exact in the middle
		{
		    
			if ( row != 1)
			    this.lpOverlayPos[j].x = x;
			else
			    this.lpOverlayPos[j].x = x+dx1+10;
				
			if ( row == 0)
				this.lpOverlayPos[j].y  = y+dy1+10;
			else if ( row == 2)
			    this.lpOverlayPos[j].y  = y-2*dy1-2*10;
		    else
				this.lpOverlayPos[j].y  = y;
		}
		else
		{
            if ( col>=nCols/2)
                this.lpOverlayPos[j].x = x-2*dx1-2*10;
            else
                this.lpOverlayPos[j].x = x+dx1+10;
            
            if ( j%3 == 2)
                this.lpOverlayPos[j].y  = y-dy1-10;
            else
                this.lpOverlayPos[j].y  = y;
        }
        this.lpOverlayPos[j].dx  = 2*dx1+16;
        this.lpOverlayPos[j].dy = 2*dy1+14;
        
        s = "id3_"+j;
        o2 = document.getElementById(s); 
        if ( o2)
        {
            o2.style.width = (dx1-10)+"px";
            o2.style.height = 24+"px";
            o2.style.left = (5)+"px";
            o2.style.top = (dy1-30)+"px";
        }
        
        row++;
        y+= dy1+10;
        if ( row > 2)
        {
            col++;
            y = (dy-dy1*3-20)/2;
            x+=dx1+10;
            row=0;
        }
    }
    
    sInner="";
    if ( this.nPages>1)
    {
        for (var i=0; i<this.nPages; i++)
        {
            if ( i == this.nCurPage)
                sInner+= '<a id="iddot_'+i+'" class="clDots"><img src="./png/dotSel.png"></img>  </a>';
            else
                sInner+= '<a id="iddot_'+i+'" class="clDots""><img src="./png/dot.png"></img>  </a>';
        }
    }
    document.getElementById("divDots").innerHTML = sInner; 
    if ( this.nCurFolderLevel>0)
        $("#idDotUp").click(function() {fr.doSetFolder(-1);return false;});
    for (var i=0; i<this.nPages; i++)
    {  
        fr.myBindClick("#iddot_"+i, { param: i}, function(ev) {fr.doSetPage( ev.data.param);return false;});
    }
    
    o3 = document.getElementById("divLeft"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
    o3 = document.getElementById("divRight"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
        
    if ( editAfterResize)
    {
        fr.EditUrl( editAfterResize, true);
    }    
},


drag:0,
dragId:0,
dragToplinkId:0,
dragX:0,dragY:0,
dragBefore:0,
dragAllowPage:true,
mousehandleradded:false,
HandleDrag:function( mode, divId, toplinkId)
{
    if ( fr.idCurrentEdit)
        return;
        
    if ( fr.lpCurFolder && fr.lpCurFolder.type != "f" && fr.lpCurFolder.type != "v")
        return;
    if ( mode == 1)
    {
        if ( !fr.mousehandleradded)
        {
            fr.mousehandleradded = true;
            // addEventListener only if user want to drag&drop toplinks
            document.addEventListener( "mousemove", this.myMouseMove,false); 
        }
    
        this.dragToplinkId = toplinkId; 
        this.dragId = divId;
        this.drag = 1;
        this.dragBefore = 0;
        this.dragX = parseInt( $("#idDrag").css("left"));
        this.dragY = parseInt( $("#idDrag").css("top"));
        fr.dragLastTarget = -1;
    }
    else if ( mode == 0)
    {
        if ( !this.drag)
            return;
        this.drag = 0;
        $("#idDrag").hide();
        $("#idDrag").html("");
        $(this.dragId).css("visibility","visible");
        if ( this.dragBefore)
        {
            if ( fr.dragBefore.toplinkId != fr.dragToplinkId)
                fr.MoveToplinkBefore( this.dragToplinkId, this.dragBefore, true);
        }
        fr.doResize();
    }
    else if ( this.drag)
    {
        var x = parseInt( $("#idDrag").css("left"));
        var y = parseInt( $("#idDrag").css("top"));
        if ( this.drag == 1) // Noch nicht gestartet
        {
            if ( Math.abs(x-this.dragX)>5 || Math.abs(y-this.dragY)>5)
            {
                $("#idDrag").show();
                fr.doResize();
                this.drag = 2; // Starte jetzt das D&D
                $(this.dragId).css("visibility","hidden");
                var s = $(this.dragId).html();
                $(this.dragId).html("");
                $("#idDrag").html(s);
            }
        }
        else if ( fr.lpDragTargets)
        {
            x+=224/2;
            y+=126/2;
            
            var oParent = document.getElementById("toplinks"); 
            var xParent = parseInt(oParent.offsetLeft);
            var dxParent = parseInt(oParent.offsetWidth);
    
            if ( x < xParent&& this.nCurPage>0)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage--;
                    fr.doResize();
                }
                return;
            }
            else if ( x > dxParent+xParent && this.nCurPage+1<this.nPages)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage++;
                    fr.doResize();
                }
                return;
            }
            
            fr.dragAllowPage = true;
            this.dragBefore = 0;
            $(".clToplink").css( "border","1px solid #fff");
            for ( var j = 0; j < fr.lpDragTargets.length;j++)
            {
                var target = fr.lpDragTargets[j];                
                if ( x>=target.x && y>=target.y && x < target.x+target.width && y < target.y+target.height)
                {
                    this.dragBefore = target;
                    if ( 1)
                    {
                        if ( fr.dragBefore.toplinkId != fr.dragLastTarget)
                        {
                            fr.dragLastTarget = fr.dragBefore.toplinkId;
                            //console.log("doResizeHome2 "+fr.dragBefore.toplinkId+ "-"+fr.dragToplinkId);
                            fr.MoveToplinkBefore( fr.dragToplinkId, fr.dragBefore, false);
                            fr.doResize();
                        }
                    }
                    if ( target.mode)
                        $(target.divId).css( "border","1px solid #f00");
                    else
                        $(target.divId).css( "border","1px solid #00f");                                        
                    break;
                }
            }
            
        }
    }
},

CreateEditModeButtons:function( j, tl, dy1)
{
    if (fr.drag)
        return "";
                
    var sInner = '<div id="idBlack_'+j+'" class="clBlackButton"><center>'
    var w = 49*dy1/126/2;
    var fFolder = ( tl.type == "f" || tl.type == "v");
    
    if ( !fr.lpCurFolder || fr.lpCurFolder.type == "f")
    {        
        if ( tl.type != "downloads")
            sInner+= '<img width='+w+' id="idedit_'+j+'" src="./png/editurl.png" title="'+(fFolder?t['ideditf']:t['idedit'])+'"/>';
    }
    sInner+= '<img width='+w+' id="iddel_'+j+'" src="./png/del.png" title="'+(fFolder?t['iddelf']:t['iddel'])+'"/>';
    sInner+= '</center></div>';
    return sInner;
},
 
createVideoItemHtml:function(j,cur,thumb, dx1, dy1,si)
{
    var sInner="";
    for ( var i = 0; i < VideoSites.length; i++)
    {
        if ( cur.url.toLowerCase().indexOf(VideoSites[i].filter)>=0)
        {
            if ( !si)
            {
                si = new Object();
                si.w = VideoSites[i].w;
                si.h = VideoSites[i].h;                
            }
            if ( si)
            {
                var w = dx1;
                var h = w*si.h/si.w;
                if ( h<dy1)
                {
                    h = dy1;
                    w = h*si.w/si.h;
                }
                var mx = (dx1-w)/2;
                var my = (dy1-h)/2;
                
                sInner+= '<div class="clThumb" style="overflow:hidden;padding:0px;height:100%;width:100%;" >'; 
                sInner+= '<img draggable=false style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';               
                sInner+= '</div>'; 
            }
            else
                sInner+= '<img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img>'; 
            sInner+= '<div style="position:absolute; right:0;top:0;"><img draggable=false class="clVideoStrip"  src="./png/movie.png"></img></div>';  
            sInner+= '<div style="position:absolute; right:-1px;bottom:0;height:24px;"><img draggable=false class="clVideoLogo"  src="'+VideoSites[i].thumb+'"></img></div>';  
            break;
        }
    }
    return sInner;
},

createVideoOverlayHtml:function( thumb, dx1, dy1,si)
{
    var sInner="";
    if ( !si)
        return "";
    
    var w = dx1;
    var h = w*si.h/si.w;
    if ( h<dy1)
    {
        h = dy1;
        w = h*si.w/si.h;
    }
    var mx = (dx1-w)/2;
    var my = (dy1-h)/2;
    
    sInner+= '<div class="clThumb" style="overflow:hidden;padding:0px;height:100%;width:100%;" >'; 
    sInner+= '<img draggable=false style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';
    sInner+= '</div>'; 
    return sInner;
},
 
onHistoryChange:function(ev)
{
    $("#idAll").hide();
    
    //$("#idInput").val("");
    var s = window.location.hash;
    for ( i = 0; i < s.length; i++)
    {
        if ( s.charAt(i)=='_') 
        {
            return;	            
        }
    }
},

prepareToplinksRecur: function( parent)
{
    for (var i=0; i<parent.length; i++)
    {
        if ((typeof(parent[i].url) != undefined) && (parent[i].url!= undefined))
        {
	        if  (parent[i].url.indexOf("http://")==-1)
	        if  (parent[i].url.indexOf("https://")==-1)
		        parent[i].url = "http://"+parent[i].url; 
        }
        
        
        parent[i].url = parent[i].url;
        parent[i].def = true;
        parent[i].thumb=this.GetThumb(parent[i].url, parent[i].name);
        if ( parent[i].Toplinks)
            this.prepareToplinksRecur( parent[i].Toplinks);
    }
},

 

hideHelp:function( id, bit)
{
    fr.settings.help|=bit;
    $("#"+id).hide();
    fr.SaveSettings();
},
 
 
ChangeLanguage:function( )
{
 
    if ( fr.settings.fChangeToplinks)
    {
        fr.DelDefaultToplinks(0);
        fr.prepareToplinksRecur( userContent.Toplinks);
        
        for ( var i = 0; i <userContent.Toplinks.length;i++)
        {
            var o = userContent.Toplinks[i];
            o.id=fr.nextfreeid++;
            fr.lpToplinkBottomFolder.push( o);
        }
        
    }
},

ResetTheme:function( )
{
    if ( !confirm(t["resethelp2"]))
        return;            
    fr.SetDefaultSettings();    
    fr.ChangeLanguage();    
    fr.ShowToplinks(fr.settings.fShowToplinks);
    fr.doResize();
    fr.doShowHelp();
    fr.ShowMsgDlg(0);
    fr.ShowMsgDlg(1);
},

SetDefaultSettings:function () 
{
    fr.settings = new Object();   
    fr.settings.fShowToplinks = true;
    
    fr.settings.fChangeToplinks = false;
    fr.settings.folder=fVideo?255:(255-8);
    fr.settings.special=255;
    
    fr.settings.trans= userContent.trans ? userContent.trans : "0.9";    
    fr.settings.mostVisitedFilter=",";
    fr.settings.fUseThemeDefaults = true;
    fr.settings.fShowSlideshow = false;
    fr.settings.lastSlide = "";
    
    fr.settings.country ="de";
    for(i=0; i< fr.aLanguages.length; i++)
    {
        var l = fr.aLanguages[i].toLowerCase();
        if ( l == "de-ch")
        {
            fr.settings.country ="ch";break;
        }
        else if ( l.indexOf("de")==0)
        {
            fr.settings.country ="de";break;
        }
        else if ( l == "en-us")
        {
            fr.settings.country = "us";break;
        }
        else if ( l.indexOf("en")==0)
        {
            fr.settings.country ="gb";break;
        }
        else if ( l.indexOf("fr")==0)
        {
            fr.settings.country ="fr";break;
        }
        else if ( l.indexOf("es")==0)
        {
            fr.settings.country ="es";break;
        }
        else if ( l.indexOf("it")==0)
        {
            fr.settings.country ="it";break;
        }
        else if ( l.indexOf("pl")==0)
        {
            fr.settings.country ="pl";break;
        }
        else if ( l.indexOf("tr")==0)
        {
            fr.settings.country ="tr";break;
        }
        else if ( l.indexOf("nl")==0)
        {
            fr.settings.country ="nl";break;
        }
    }
    
    fr.settings.sync=true;
    fr.settings.border=userContent.border;

    fr.settings.help=15;

    fr.SaveSettings();

},

FindToplinkType:function( parent, type)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.type == type)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkType( o, type);
            if ( result)
                return result;
        }
    }
    return 0;
},

FindToplinkByUrl:function( parent, url)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.url == url)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkByUrl( o, url);
            if ( result)
                return result;
        }
    }
    return 0;
},

doShowHelp:function () 
{
    $(".clHelp").hide();
   
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        if ( !(fr.settings.help&256) && !fr.videoPlaying)
            $("#idHelpVideo").show();
    }
    else
    {
        if ( fr.fEditMode)
        {
            if ( !fr.lpCurFolder || fr.lpCurFolder.type == "f")
                if ( !(fr.settings.help&32))
                    $("#idHelpDrag").show();
        }
        else
        {
            //if ( !(fr.settings.help&1))
            //    $("#idHelpEdit").show();
            
            if ( !(fr.settings.help&4))
                $("#idHelpSearch").show();
            if ( !(fr.settings.help&8))
                $("#idHelpSettings").show();
                
            if ( !fr.settings.fShowToplinks)
            {
                if ( !(fr.settings.help&128))
                    $("#idHelpToggle").show();
            }
            
            if ( !(fr.settings.help&64))
                $("#idHelpHomepage").show();
        }
    }
},
 
myGetLocalStorage:function( callback)
{
    if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        chrome.storage.sync.get('newToplinks', function(data)
        {
            //alert( languageList);
            callback(data);
        });
    }     
},    

myDelLocalStorage:function()
{
    if ( typeof(chrome)!= 'undefined')
        chrome.storage.sync.set({newToplinks: 0}, function(){});     
},

addNewToplinksFromList:function()
{
    fr.myGetLocalStorage( function(data)
    //chrome.storage.sync.get('newToplinks', function(data)
	{

	    var sitems = data.newToplinks; 
	    if ( !sitems)
	        return;
        if ( !sitems.length)
        {
            fr.myDelLocalStorage();          
	        return;
	       }
	    if ((sitems == null)||(typeof(sitems)=='undefined'))
		    return;
	    var fAdded = false;
	    for (var i =0; i<sitems.length; i++)
		{
		    var j = sitems[i].indexOf( '<->');
		    if ( j>=0)
		    {
    		    var title = sitems[i].substr(0,j);
    		    var url = sitems[i].substr(j+3);
            }
            else
            {
                var title = "";
                var url = sitems[i];
    		}   
    		
    		var tl = fr.FindToplinkByUrl( 0, url);
    		if ( !tl)
    		{
    		    var o = new Object();
                o.searchurl="";
                o.type="l"
                o.url = url;
                o.name = title;
                o.p1x1="";
                o.id=fr.nextfreeid++;
                fr.lpToplinkBottomFolder.splice(0,0,o);// = a.concat( fr.lpToplinkBottomFolder);
                fAdded=true;
    		}
			//alert( title+"   +   "+url);
		}
        if ( fAdded)
        {
            
            fr.doResizeHome();
        }
		fr.myDelLocalStorage();
    });
},
				
page:0,
startvideoid:false,
doInit:function () 
{

//var i = window.location.href;
    if ( window.location.href.indexOf( "page=video")>=0)
    {
        var i = window.location.href.indexOf( "&id=");
        if ( i >=0)
        {
            fr.startvideoid = window.location.href.substr( i+4);
            i = fr.startvideoid.indexOf( "&");
            if ( i>=0)
                fr.startvideoid = fr.startvideoid.substr( 0,i);
        }
        fr.page="video";
    }     
        
    fr.doShowHelp();
    // prevent Drag&Drop
    $(document).bind("dragstart", function(e) {
         if (e.target.nodeName.toUpperCase() == "IMG") 
             return false;
         else if (e.target.nodeName.toUpperCase() == "A") 
            return false;
         else
            alert( e.target.nodeName.toUpperCase());
    });
   
    //$("#idHelpEdit").click( function() { fr.hideHelp( "idHelpEdit",1);return false;});    
    
    $("#idHelpSearch").click( function() {fr.hideHelp( "idHelpSearch",4);return false;});    
    $("#idHelpSettings").click( function() {fr.hideHelp( "idHelpSettings",8);return false;});        
    $("#idHelpVideo").click( function() {fr.hideHelp( "idHelpVideo",256);return false;});
    $("#idHelpDrag").click( function() {fr.hideHelp( "idHelpDrag",32);return false;});    
    $("#idHelpHomepage").click( function() {fr.hideHelp( "idHelpHomepage",64);return false;});    
    $("#idHelpToggle").click( function() {fr.hideHelp( "idHelpToggle",128);return false;});    
    
    $("#idChromeSettings").click( function() {
        L64P.browser.showSettings({where:'newTab'});
        return false;
    });    
        
    $("#idyoutube").click( function() {
        window.location.replace( "http://youtube.com");
        return false;
    });    
    $("#idvimeo").click( function() {
        window.location.replace( "http://vimeo.com");
        return false;
    });    

    var b1 = fr.GetBorderColor();
    var b2 = fr.GetGradientColor(b1);
    
    
    $("#idBottombarGradient").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");
    $("#topbar").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");    
    
    //$("#body").css("background",fr.GetBorderColor());
    $(".clTextColor").css("color",fr.GetTextColor());
    
    {
        var o = new Object();
        o.searchurl="";
        o.type="v"
        o.name = t["videolist"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        fr.lpToplinkBottomFolder = new Array();
        fr.lpToplinkBottomFolder.splice(0,0,o);
        fr.doSetFolder( o.id);
        
        fr.doResize();        
        fr.onHistoryChange(0);
    }
    
    window.addEventListener( "resize",this.doResize,false);
    //window.onresize = this.doResize; 
    
   
    // ------------ Set Language text ------------ 
   
    
    $("#idInputFilter").keyup(function() { fr.SetFilter(this.value)});
    $("#idForm").submit(function(){fr.doSearch(-1)});     
    $("#idAddFolder").click( function() {fr.AddToplink(true);return false;});
    $("#idAddUrl").click( function() {fr.AddToplink(false);return false;});
    //$("#idDelAll").click( function() {fr.DelAllToplinks();});
    $("#idSettings").click( function() {fr.ShowMsgDlg( 1);return false;});    
    $("#idEditMode").click( function() {fr.doEditMode(1);return false;});
    $("#idEditModeDone").click( function() {fr.doEditMode(0);return false;});
    $("#idEditModeCancel").click( function() {fr.doEditMode(-1);return false;});
    
    $("#idSearchButton2").click( function() {fr.doSearch( -1);return false;});
    $("#divLeft").click( function() {fr.doChangePage( -1);return false;});
    $("#divRight").click( function() {fr.doChangePage( 1);return false;});
    

    
    $("#body").css("visibility","visible");
    setTimeout(function(){$("#body").css("idSlideshow","visible");},100);
    //setTimeout(function(){$('#idInput').focus().val("").scrollTop();},150);
    
    fr.myBind("#idDrag",'mouseup', { }, function(ev) {fr.HandleDrag( 0);return false;});    
       
    fr.ShowToplinks(fr.settings.fShowToplinks);
    
},


myMouseMove:function(ev) 
{
    if (!ev)
        ev = window.event;
    var xx = ev.pageX;
    var yy = ev.pageY;
    
    if ( !xx && !yy)
    {
        xx = ev.x;
        yy = ev.y;
    }
    var x = xx;     
    var y = yy;
    x-=224/2;
    y-=126/2;
    var scrY = document.documentElement.scrollTop;
    $("#idDrag").css({"left":x+"px"});
    $("#idDrag").css({"top":y+"px"});
    if ( fr.drag)
        fr.HandleDrag( 2);
},

createSlideshowControls:function () 
{ 
    var sInner="";
    sInner+="<div id='idPrev' style='margin-left:30px;float:left'><img src='./png/slide_prev"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    if ( fr.settings.fPauseSlide)
        sInner+="<div id='idPause' style='margin-left:10px;float:left'><img id='idPauseSlide' src='./png/slide_play"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    else
        sInner+="<div id='idPause' style='margin-left:10px;float:left'><img id='idPauseSlide' src='./png/slide_pause"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idNext' style='margin-left:10px;float:left'><img src='./png/slide_next"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idRotL' style='margin-left:10px;float:left'><img src='./png/slide_rotl"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idRotR' style='margin-left:10px;float:left'><img src='./png/slide_rotr"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div style='margin-top:0px;margin-left:20px;width:250px;float:left;'><a style='color:"+fr.GetTextColor()+";' href='"+this.SlideshowUrl+"'>"+this.SlideshowTitle+"</a></div>";
    $("#idSlideControls").html(sInner);
    
    $("#idPrev").click( function() {fr.prevSlide();return false;});
    $("#idPause").click( function() {fr.pauseSlide();return false;});
    $("#idNext").click( function() {fr.nextSlide();return false;});
    $("#idRotL").click( function() {fr.rotateSlide(-90);return false;});
    $("#idRotR").click( function() {fr.rotateSlide(90);return false;});
        
},

nPauseTimer:0,
SlideshowSec:20,
degree:0,
SlideshowTitle:"",
SlideshowUrl:"",
pauseSlide:function () 
{
    fr.settings.fPauseSlide = !fr.settings.fPauseSlide;
    if ( fr.settings.fPauseSlide)
    {
        this.nPauseTimer++;
        $("#idPauseSlide").attr( "src", "./png/slide_play"+(fr.fDarkIcons?"_dark.png":".png"));
    }
    else
    {
        $("#idPauseSlide").attr( "src", "./png/slide_pause"+(fr.fDarkIcons?"_dark.png":".png"));
        this.nPauseTimer++;
//        setTimeout( fr.autoSlide, this.SlideshowSec*1000, this.nPauseTimer);
        setTimeout( function( timer) { 
                fr.autoSlide(timer);
                }, this.SlideshowSec*1000, this.nPauseTimer);
    }
    fr.SaveSettings();
},


SaveSettings:function()
{
    L64P.settings.set({id:'settings', data:fr.settings});
},

ShowToplinks:function ( mode) 
{
    if ( mode == 2)
        fr.settings.fShowToplinks = !fr.settings.fShowToplinks;
    else
        fr.settings.fShowToplinks = mode;
    fr.SaveSettings();
    fr.doShowHelp();
    fr.checkAddButtons();
    if ( fr.settings.fShowToplinks)
    {
        
        $("#idFilterText").show();
        $("#idFilter").show();
        $("#idSlideControls").hide();
        $("#idToplinks").show();
        $("#idEditMode").show();
        this.doResize();
    }
    else
    {
        
        $("#idFilterText").hide();
        $("#idFilter").hide();
        $("#idToplinks").hide();
        $("#idSlideControls").show();
        $("#idEditMode").hide();
    }
},
   
fDarkIcons:false,
  
 
mySetFocus:function( id)
{
    var fIE8 = false;
    var o = document.getElementById(id);    
    if ( o && o.focus)
    {
        o.selectionStart = 0;
        o.selectionEnd = 1000;
        o.focus();        
    }
},

lastState:0,
fVideosChanged:false,
doEditMode:function ( on) 
{
    if ( !fr.settings.fShowToplinks)
       return;
    
    if ( on > 0)
    {        
        $("#idFilterText").hide();
        $("#idFilter").hide();        
        $("#idEditMode").hide();
        $(".clEditMode").show();
        
        $("#idSettings").hide();
        $("#idTextLinks").css( "right","320px");
        $("#idTextLinks").css( "left","260px");
        
        if ( fr.curFilter)
            fr.SetFilter( "");
            
        lastState = new Object();
        lastState.folder = this.lpCurFolder?this.lpCurFolder.id:0;
        lastState.page = fr.nCurPage;
        
        fr.fVideosChanged=false;
    }
    else
    {
        fr.closeEdit(2);
        $("#idFilterText").show();
        $("#idFilter").show();
        $("#idToplinks").show();        
        $("#idEditMode").show();
        
        $("#idEditMode").show();
        $(".clEditMode").hide();
        $("#idSettings").show();
        $("#idTextLinks").css( "right","130px");
        $("#idTextLinks").css( "left","380px");
        
        if ( on == -1) //Cancel edit mode
        {
            //alert("Cancel!");
            on = 0;
        }
        else
        {
            if ( fVideo && fr.fVideosChanged)
            {
                var tl = fr.FindToplinkType( 0, "v");
                if ( tl)
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < tl.Toplinks.length;i++) 
                    {
                        videoItemIds.push( tl.Toplinks[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds});  //.videoid
                }
            }            
        }        
    }

    this.fEditMode = on;
    fr.doShowHelp();
    this.doResize();
},

DelAllToplinks:function ( ) 
{
    fr.lpToplinkBottomFolder = new Array();
    this.lpCurFolder = 0;
    this.curFilter="";
    this.nCurFolderLevel = 0;
    fr.SetFilter( "");
},
 
AddToplink:function ( fFolder) 
{
    if ( fFolder)
    {
        var s=t["deffolder"];
    }
    else
    {
        var s="http://www.";
    }
    if ( !s)
        return;        
    var o = new Object();
    o.searchurl="";
    if ( fFolder)
    {
        o.type="f"
        o.name = s;
        o.Toplinks = new Array();
    }
    else
    {
        o.type="l"
        o.url = s;
       //o.thumb=this.GetThumb(o.url);
        o.name = t["newToplink"];

    }    
    o.p1x1="";
    o.id=this.nextfreeid++;
    
    //var a = new Array();
    //a.push( o);    
    
    if ( !this.lpCurFolder)
    {
        fr.lpToplinkBottomFolder.splice(0,0,o);// = a.concat( fr.lpToplinkBottomFolder);
	}
	else
    {
        fr.lpCurFolder.Toplinks.splice(0,0,o);//a.concat( this.lpCurFolder.Toplinks);
	}

    //if ( 
    //    this.AddToplinkToSubfolder( 0, this.lpCurFolder.id == lpToplinkBottomFolder, o)
    	
	fr.nCurPage = 0;
	this.doResize();
	fr.delOnCancel=o.id;
    fr.EditUrl( o.id,false);
},

 
GetThumb:function( url, name)
{

},

SetScreenshotUrl:function ( parent, url, screenshotURL)
{
    var j;
    var refresh = false;
    for( j = 0; j<parent.length;j++)
    {
        if ( parent[j].url == url && parent[j].screenshotURL != screenshotURL)
        {
            parent[j].screenshotURL = screenshotURL;
            refresh = true;
        }
        if ( parent[j].Toplinks)
            erg |= SetScreenshotUrl( parent[j].Toplinks, url, screenshotURL);
    }
    return refresh;
},

//ScreenshotWaiting:0,
GetScreenshotUrl:function ( o, frefresh)
{
    o.screenshotURL = o.thumb;
},

CreateVideoBar:function()
{
    if ( $("#idVideobar").html( ))
        return;
    var a = new Array();
    for ( var i1 = 0; i1 < VideoSites.length; i1++)
    {
        if ( VideoSites[i1].url)
            a.push(VideoSites[i1]);
    }
    
    a.sort(function(a,b){return Math.round(Math.random()*20-10);});
    while ( a.length < 30)
    {
        a = a.concat( a);
    }
    var sInner="";
    sInner += "<a style='font-size:12px;position:relative;top:-6px;'>"+t["supported"]+"</a>";
    for ( i1 = 0; i1 < a.length; i1++)
    {
        sInner += "<a href='"+a[i1].url+"'><img style='margin-left:5px;margin-top:3px; ' src='"+a[i1].thumb+"' height=24px/></a>"
    }
    $("#idVideobar").html( sInner);
},

foundSlides:0,
curSlide:0,
LoadSlides:function( what )
{
    q = new L64GSearch(); 
    q.getImages({query:what, num:24},function(data)
    {
        if (data.result)
        {
            fr.foundSlides = data.result;
            fr.foundSlides.sort(function(a,b){return Math.round(Math.random()*20-10);}); // Shuffle array
            fr.curSlide = Math.floor(Math.random()*fr.foundSlides.length);
            if ( fr.curSlide < fr.foundSlides.length)
            {
                var imageinfo = fr.foundSlides[fr.curSlide];
                                
                if ( !fr.settings.fPauseSlide) // Pause: Use the same slide next time
                {
                    fr.settings.NextSlide = imageinfo.url;
                    fr.settings.NextTitle = imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting;
                    fr.settings.NextUrl = imageinfo.originalContextUrl;
                    fr.SaveSettings();
                }
                if ( $("#idSlideshow").html() == "" || $("#idSlide").attr( "src") == "")
                {                                   
                    fr.setCurSlide( imageinfo.url, 0, imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting, imageinfo.originalContextUrl);
                    setTimeout(function(){fr.positionSlideshow(1);}, 200);
                }
                fr.cacheSlide( fr.curSlide+1);
                //else
                //    $("#idSlideHidden").attr( "src", imageinfo.url);
                fr.createSlideshowControls();
            }
        } 
    }); 
},
 
MoveBegin:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "begin");
    this.doResize();
},
MoveEnd:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "end");
    this.doResize();
},

idCurrentEdit:0,
delOnCancel:"",
closeEdit:function ( nApply)
{
    if ( nApply==1)
    {
        if (document.getElementById("idEditUrl")) // Not if editing a folder
        {
            var s = $("#idEditUrl").val();
            if ( !s || s == "http://www.")
            {
                alert( t["invalidUrl"]);
                return false;
            }
        }
    }
    $("#idAll").hide();
    if ( !fr.idCurrentEdit)
        return false;
        
    if ( fr.delOnCancel == fr.idCurrentEdit && nApply == 0)
    {
        this.ModifyToplinkRecur( 0, fr.idCurrentEdit, "del");
        fr.idCurrentEdit = 0;
        this.doResize();
        
        return true;
    }
    else if ( nApply)
    {
        if ( nApply==1)
            fr.delOnCancel=0;
        var tl = fr.FindToplink( fr.lpCurFolder, fr.idCurrentEdit);
        if ( tl)
        {
            tl.name = $("#idEditName").val();
            var old =tl.url;
            tl.url = $("#idEditUrl").val();
            if ( tl.url != old)
            {
                tl.thumb = "";
                tl.screenshotURL = "";
            }
            tl.thumb = fr.GetThumb(tl.url, tl.name);
            tl.searchurl = $("#idEditSearchUrl").val();
            
        }
    }
    $("#id5_"+fr.idCurrentEdit).css("visibility","hidden");
    $("#id5_"+fr.idCurrentEdit).html( "");
    fr.idCurrentEdit = 0;
    return true;
},

GetToplinkThumb:function( tl)
{
    if ( tl.thumb)
        return tl.thumb;
    
    if ( tl.screenshotURL && tl.screenshotURL != "*" && tl.screenshotURL.indexOf("invalid_224")< 0)
        return tl.screenshotURL;
        
    if ( tl.type == "v") 
        return "./png/folder_video.png";    
    else if ( tl.type == "f") 
        return "./png/folder.png";        
    return "./png/nothumb.png";
},   

EditUrl:function ( id, fNoAnimation)
{
    if ( fr.idCurrentEdit)
        return;
    //this.closeEdit();
        
    var j = fr.transToplinks[id];
    if ( j)
        $("#"+j).css("opacity","1.0");
        
    $("#id5_"+id).css("opacity","0");
    $("#id5_"+id).css("filter","alpha(opacity = 0)");
    
    var tl = fr.FindToplink( this.lpCurFolder, id);
    var fFolder = tl && ( tl.type == "f" || tl.type == "v");
    if ( tl)
    {
    }
    var sInner = "";
    sInner += "<span style='position:relative;top:20px;margin-left:32%;'>"+t["name"]+"</span><br><input style='position:relative;top:20px;left:32%;margin-bottom:10%;width:65%' id='idEditName' type='text'/><br>";
    if ( !fFolder)
    {
        sInner += "<span style='margin-left:3%'>"+t["url"]+"</span><br> <input style='margin-bottom:5%;width:94%;margin-left:3%;' id='idEditUrl' type='text'/><br>";
        sInner += "<span style='margin-left:3%'>"+t["searchurl"]+"</span><br> <input style='margin-left:3%;margin-bottom:5%;width:94%' id='idEditSearchUrl' type='text'/><br>";
        sInner += "<span style='position:relative;top:-15px;left:3%;font-size:10px;font-weight:normal'>"+t["searchurl2"]+"<br/></span>";
    }
    sInner += "<center><input id='idCloseEdit' type='button' value='"+t["apply"]+"' style='width:100px;'/><input id='idCancelEdit' type='button' value='"+t["cancel"]+"' style='width:100px;'/></center>";
    sInner += "<div style='position:absolute;left:5%;top:5%;height:25%;width:25%;'><img style='max-height:100%;max-Width:100%' id='idEditImg' /></div>";

    $("#id5_"+id).html( sInner);
    
    $("#idEditUrl").keyup(function(e) {
		
		var url = $("#idEditUrl").val();		
        $("#idEditImg").attr( "src","./png/nothumb.png");
        
    });
    
    if ( tl)
    {
        $("#idEditName").val( tl.name);
        $("#idEditUrl").val( tl.url);
        $("#idEditSearchUrl").val( tl.searchurl);
        var sImg = fr.GetToplinkThumb( tl);
        if ( sImg)
            $("#idEditImg").attr( "src", sImg);
        else
            $("#idEditImg").hide();
    } 
        
    $("#id5_"+id).css("visibility","visible");
    fr.idCurrentEdit = id;
    
    
    fr.myBindClick("#idCancelEdit", { param: 0 }, function(ev) {
        fr.closeEdit(0);        
        return false;
    });
    fr.myBindClick("#idCloseEdit", { param: 0 }, function(ev) {
        if ( fr.closeEdit(1))
            fr.doResize();
        return false;
    });
    
   
    
	//$("#id5_"+id).unbind('click'); 
	fr.myBindClick("#id5_"+id, { }, function(ev) {return false;}); // Eat this click                    
	
	if ( fNoAnimation)
	{
	    $("#id5_"+id).css("width","400px");
        $("#id5_"+id).css("height","240");
        $("#id5_"+id).css("left","-101px");
        $("#id5_"+id).css("right","0px");
        $("#id5_"+id).css("top","-65px");
        $("#id5_"+id).css("bottom","0px");
        $("#id5_"+id).css("z-index","500");
        $("#id5_"+id).css("opacity","1");
        $("#id5_"+id).css("filter","alpha(opacity = 100)");
	}
	else
	{
        $("#id5_"+id).css("width","");
        $("#id5_"+id).css("height","");
        $("#id5_"+id).css("left","0px");
        $("#id5_"+id).css("right","0px");
        $("#id5_"+id).css("top","0px");
        $("#id5_"+id).css("bottom","0px");
        $("#id5_"+id).css("z-index","500");
        $("#id5_"+id).animate({    
                width:"400px",
                height:"240px",
                left:"-101px",
                top:"-65px",
                opacity: "1",
	            filter: "alpha(opacity = 100)"
              }, 200, function() {
              
                    fr.mySetFocus( "idEditName");

              });        
    }
    $("#idAll").show();
    //$("#id5_"+id).css("visibility","visible");
},

FindToplink:function( parent, id)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplink( o, id);
            if ( result)
                return result;
        }
    }
    return 0;
},

GetToplinkIndex:function( bottom, toplinkId)
{
    for ( var j = 0; j < bottom.length; j++)
    {
        if ( bottom[j].id == toplinkId)
            return j;
    }   
    return-1;
},

MoveToplinkBefore:function ( toplinkId, target, fAllowIntoFolder)
{
    if (target.mode == 1 && !fAllowIntoFolder) // Not into Folder during D&D
        return;
    var bottom = fr.lpCurFolder ? fr.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var i = fr.GetToplinkIndex( bottom, toplinkId);
    if ( i<0)
        return;
    var o = bottom[i];

    if ( fr.lpCurFolder)
    {
        if ( target.toplinkId < 0 && target.mode == 1 && this.nCurFolderLevel>0) // Backbutton
        {
            if ( fr.lpCurFolder.type == "v") // Videos must not be move in any other folder
                return;
            bottom.splice(i,1); // Del 1 Element at i
            fr.lpCurFolder.Toplinks = bottom;
            var parent = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel-1].id);
            if ( parent)
                parent.Toplinks.push(o);
            else
                fr.lpToplinkBottomFolder.push(o);
            return;
        }
    }
    
    if (target.mode == 2)  // At the end
    {
        bottom.splice(i,1); // Del 1 Element at i
        bottom.push(o); // insert 1 element at before
    }
    else
    {
        var before = fr.GetToplinkIndex( bottom, target.toplinkId);
        if ( before<0)
            return;
        if (target.mode == 1) 
        {
            var oFolder = bottom[before];
            if ( oFolder && oFolder.type !="f")
                return;            
            bottom.splice(i,1); // Del 1 Element at i
            if ( !oFolder.Toplinks)
                oFolder.Toplinks = new Array();
            oFolder.Toplinks.push( o);
        }
        else
        {
            if ( i > before)
            {   
                bottom.splice(i,1); // Del 1 Element at i
                bottom.splice(before,0,o); // insert 1 element at before
               
            }     
            else if ( i < before)
            {                
                bottom.splice(before,0,o); // insert 1 element at before
                bottom.splice(i,1); // Del 1 Element at i
                 
            }  
        }
    }
    if ( fr.lpCurFolder)
        fr.lpCurFolder.Toplinks = bottom;
    else
        fr.lpToplinkBottomFolder = bottom;
},

DelDefaultToplinks:function ( parent)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.def == true)
        { 
            bottom.splice( i,1);
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
            else
                parent.Toplinks = bottom;
            i--;
            continue;
        }
        if ( o.Toplinks)
            this.DelDefaultToplinks( o);
    }
},

ModifyToplinkRecur:function ( parent, id, mode)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
        { 
            var a2 = bottom.slice( i+1);
            var a1 = bottom.slice( 0,i);
            bottom = a1.concat(a2);
            
            if ( mode == "begin")
            {
                a1 = new Array();
                a1.push( o);
                bottom = a1.concat(bottom);
            }
            else if ( mode == "end")
            {
                bottom.push(o);
            }
            else if ( mode == "del")
            {
                if ( o.type=="v")
                    fr.settings.folder &= (255-8);
                else if ( o.type=="downloads")
                    fr.settings.special &= (255-1);
                    
                if( parent && parent.type=="v" && !fr.fEditMode) // Video folder
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < bottom.length;i++) 
                    {
                        videoItemIds.push( bottom[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds}); 
                }                
            }
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
                
            else
                parent.Toplinks = bottom;
            //this.lpCurFolder = bottom;
            return true;
        }
        if ( o.Toplinks)
            if ( this.ModifyToplinkRecur( o, id,mode))
                return true;
    }
    return false;
},

DelToplink:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "del");
    this.doResize();
    
},

nextfreeid:1,
 
SetIds:function( parent) // Make sure every toplink has an own id
{
    for (var i=0; i <parent.length; i++)
    {
        if ( !parent[i].id)
            parent[i].id=this.nextfreeid++;
        if ( parent[i].Toplinks)
            this.SetIds( parent[i].Toplinks);
    }
},

colorclicked:function( id)
{
    var i = id.indexOf( '_');
    var def = id.slice(i+1);
    id = id.slice(0,i);
    fr.CreateColorSectors( id, '#'+def);
},

dlgbackgroundcolor:-1,
dlgbordercolor:-1,
dlgtextcolor:-1,
CreateColorSectors:function( id, def)
{
    if ( id == "idbackgroundcolors")
    {
        fr.dlgbackgroundcolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else if ( id == "idbordercolors")
    {
        fr.dlgbordercolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else
    {
        fr.dlgtextcolor = def;
        a = ["000","777","c0c0c0","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    if ( def == "#000000")
        def = "#000";
    var sInner="";
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        sInner +="<div id='"+id2+"' class='clColorSelect' style='background:#"+a[i]+"'>";
        if ( def == ('#'+a[i]))
            sInner += "<img style='position:relative;left:3px;top:3px;' src='./png/radio1.png'/>";
        sInner += "</div>";
    }    
    $("#"+id).html( sInner);
    
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        fr.myBindClick("#"+id2, { param: id2}, function(ev) {fr.colorclicked( ev.data.param);return false;});
    }
},



settings:0,
ShowMsgDlg:function( mode)
{
    if ( mode == 1)
    {            
        $("#b1").unbind('click'); 
        $("#b2").unbind('click'); 
        $("#b3").unbind('click'); 
        
        $("#b1").click(function() {fr.ShowMsgDlg(0);return false;});
        $("#b2").click(function() {fr.ShowMsgDlg(2);return false;});
        $("#b3").click(function() {fr.ShowMsgDlg(3);return false;});
            
        $("#b1").val(t['cancel']);
        $("#b2").val(t['ok']);
        $("#b3").val(t['apply']);
                
        if ( !fVideo)
        {
            fr.settings.folder&=(255-8);
            $("#idVideoSettings").hide();
        }
        
        $("#idresethelp").val(t['resethelp']);
        $("#idresettheme").val(t['resettheme']);
        
        $("#idresettheme").unbind('click');        
        $("#idresettheme").click(function() {fr.ResetTheme();return false;});
        
        $("#idresethelp").unbind('click'); 
        $("#idresethelp").click(function() {fr.settings.help=0; fr.doShowHelp();return false;});
                
        
        sInner="<option value='de'>"+t["langKey_de"]+"</option>";
        sInner+="<option value='gb'>"+t["langKey_gb"]+"</option>";
        sInner+="<option value='us'>"+t["langKey_us"]+"</option>";
        sInner+="<option value='fr'>"+t["langKey_fr"]+"</option>";
        sInner+="<option value='pl'>"+t["langKey_pl"]+"</option>";
        sInner+="<option value='es'>"+t["langKey_es"]+"</option>";
        sInner+="<option value='it'>"+t["langKey_it"]+"</option>";
        sInner+="<option value='ch'>"+t["langKey_ch"]+"</option>";
        sInner+="<option value='nl'>"+t["langKey_nl"]+"</option>";
        sInner+="<option value='tr'>"+t["langKey_tr"]+"</option>";
        sInner+="<option value=''>"+t["langKey_other"]+"</option>";
        $("#idSelectCountry").html(sInner);
        $("#idSelectCountry").val( fr.settings.country);
        
        $("#langKey_icon").hide();
        $("#idSelectIcon").hide();
        
        $("#idMsgDlg").show();
    }
    else if ( mode == 0) // cancel
        $("#idMsgDlg").hide();
    else if ( mode == 2 || mode == 3) // 2 == ok   3 == apply
    {
        if ( mode == 2)
            $("#idMsgDlg").hide();
                        
        var oldCountry = fr.settings.country;
        fr.settings.country = $("#idSelectCountry").val();
        
        fr.settings.folder = o;
        
        {
            fr.SaveSettings();
            
            if ( oldCountry != fr.settings.country)
            {                                
                fr.ChangeLanguage();
            }
            
            fr.createSlideshowControls();
            fr.doResize();
        }
    }
},
 
 

CopyArray:function( aOld, fSave)
{
    var a = new Array();
    for ( var i = 0; i < aOld.length; i++)
    {
        if (fSave)
        {            
            if ( aOld[i].type == "video") // save not all
                continue;
        }
        var o = fr.CopyObject(aOld[i], fSave);
        a.push(o);
    } 
    return a;
},

CopyObject:function(oOld, fSave)
{
    var o = new Object();
    for ( var name in oOld)
    {
        if ( name == "Toplinks")
        {
            o.Toplinks = fr.CopyArray(oOld.Toplinks,fSave);
        }
        else  
        {
            o[name] = oOld[name];
        }        
    } 
    return o;
},

GetBackgroundColor:function()
{
    return "#333";
},

GetTextColor:function()
{
    return "#fff";
},
GetBorderColor:function()
{
    return "#000";
},

GetGradientColor:function(b1)
{
    if ( !b1)
        b1 = "#000";
        
    if ( b1 == "#000" || b1 == "#000000")
        return "#333";
        
    var b2="";
    for ( var i = 0; i < b1.length; i++)
    {
        var c = b1.charAt(i);
        switch(c)
        {
        case '0':c='0';break;
        case '1':c='0';break;
        case '2':c='1';break;
        case '3':c='1';break;
        case '4':c='2';break;
        case '5':c='2';break;
        case '6':c='3';break;
        case '7':c='4';break;
        case '8':c='4';break;
        case '9':c='5';break;
        case 'a':c='6';break;
        case 'b':c='7';break;
        case 'c':c='8';break;
        case 'd':c='9';break;
        case 'e':c='a';break;
        case 'f':c='b';break;
        }
        b2 += c;
    }
    return b2;
},
 
curLang:"en",
needRefresh:false,
fShowSettingsOnly:false

} // end of fr

function SetLanguage( )
{
    $.each($(".langKey"), function()
    {
	    id = $(this).attr("id"); 
	    var j = id.indexOf( '-');
	    if ( j>=0)
		    $('#'+id).html(t[id.slice( 0,j)]);
        else
	        $('#'+id).html(t[id]);
    });	
    
    $("#idSearchButton2").html(t['search']);
    $("#idFilterText").html(t['filter']);
    $("#idButtonDone").val(t['done']);
    $("#idButtonCancel").val(t['cancel']);    
}

function GetCountry( callback)
{
    if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        chrome.i18n.getAcceptLanguages(function(languageList) 
        {
            //alert( languageList);
            callback(languageList);
        });
    }
}

function GetImageSize(url)
{
    var o = 0;
    $(".clThumbBase").each( function(){
        if ( $(this).attr( "src") == url)
        {   
            o = new Object();   
            o.w = this.naturalWidth;
            o.h = this.naturalHeight;
//            o.h = $(this).attr( "height");
            if ( !o.w)
            {
                o = 0;
            }
            else if ( o.w == 224 && o.h == 126)
                o = 0;
            else
                o = o;
        }
    });
    return o;        
}

L64P.events.onNewVideo = function(details)
{
    if ( !fVideo)
        return;
    if ( fr.lpCurFolder && fr.lpCurFolder.type=="v")
    {
        var videoItems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();
        }); 
        
        
        if ( videoItems)
        {
            fr.ConvertVideoData( videoItems);
            fr.doResizeHome();
        }
    }
}

L64P.events.onTopLinkChanged = function(details)
{
	
}

aLanguages:0,
$(document).ready(function() 
{    	
	var lang = chrome.i18n.getMessage("language");
	
    //var lang = chrome.i18n.getMessage("language");
    if ( lang.indexOf("de")>=0)
        fr.curLang = "de";
   
   
   fr.title = "Video Downloader professional";
   document.title = fr.title;
    
    chrome.extension.sendMessage({msg: "OnSP24SetLang",lang:fr.curLang,fVideoVersion:true}, function(response) { });
        
      
    if ( fr.curLang == "en")
        t = t_en; 
    SetLanguage( );
     
    VideoSites = defaults.VideoSites;
    
    GetCountry(function(languageList) 
    {
        fr.aLanguages = languageList;
        fr.settings = new Object(); 
        L64P.settings.get({id:'settings'}, function(data)
        {
            if ( data)
                fr.settings = data;   
            else
                fr.SetDefaultSettings();
            
            if ( !fVideo)
                fr.settings.folder&=(255-8);
            
            if ( !fr.settings.trans)
                fr.settings.trans = userContent.trans ? userContent.trans : "0.9";

            if ( window.location.href.indexOf( "options=1")>=0)
                fr.fShowSettingsOnly=true;
            if ( fr.fShowSettingsOnly)
            {
                fr.doInit(); 
                //$("#idUI").html("");
                //$("#body").css("visibility","visible");
                fr.ShowMsgDlg(1);
            }
            else
                fr.doInit(); 
        });
    });                        
});
