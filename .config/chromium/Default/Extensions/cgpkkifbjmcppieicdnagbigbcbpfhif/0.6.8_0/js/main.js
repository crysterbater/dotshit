var ytPlayer;
var $ = $ || undefined;
var playerLastState = -1;
var preset; //Strict, Adaptive, User, Off\
var outroTimer;
var outroTime = 0;

function init(){
    var ready = yt.player.getPlayerByElement("player-api").isReady();
    if(!ready){
        setTimeout(init, 100);
        return;
    }
    // ytPlayer is ready for manipulation!!! Hooray!!!
    cacheElements();
}

function cacheElements(){
    ytPlayer = yt.player.getPlayerByElement("player-api");
    ytPlayer.addEventListener("onStateChange", onPlayerStateChange);
    skipIntro();
}

function onPlayerStateChange(state){
    //console.log("state changed to: "+state);
    if(state == 3 && playerLastState == -1){
        // console.log(ytPlayer);
        //video started
        skipIntro();
    }
    if(state == -1 || state == 1){
        playerLastState = state;
    }
}

function skipIntro(){
    //console.log("attempting hyper jump!");
    //console.log("space ad state: "+ytPlayer.getAdState());
    preset = $("body").attr("ytskipper");
    var shortVidTime = parseInt($("body").attr("ytSkipper-shortVid"));
    var bytesLoaded = ytPlayer.getVideoBytesLoaded();
    if(bytesLoaded < 0.001 /*|| ytPlayer.getAdState() > 0*/){
        //console.log(bytesLoaded);
        setTimeout(skipIntro,10);
        return;
    }
    //console.log("jumping!");
    var duration = ytPlayer.getDuration();
    if(shortVidTime > duration && preset == "u"){
        return;
    }
    // console.log(ytPlayer.isReady());
    outroTime = null;
    
    var currentTime = ytPlayer.getCurrentTime() || 0;
    var skipToTime = getSkipTimes();
    if(preset == "o"){
        //Off
        return;
    } else if(preset == "u"){
        //user
        var introTime = $("body").attr("ytSkipper-intro");
        outroTime = $("body").attr("ytSkipper-outro");
        skipToTime = introTime;
        setOutroTimer();
    }
    
    if(currentTime < skipToTime){
        ytPlayer.seekTo(skipToTime,true);
    }
}

function setOutroTimer(){
    var currentTime = ytPlayer.getCurrentTime();
    var duration = ytPlayer.getDuration();
    var timeRemaining = duration - currentTime;
    if(timeRemaining < outroTime){
        ytPlayer.seekTo(duration);
    } else {
        outroTimer = setTimeout(setOutroTimer,50);
    }
}

function getSkipTimes(){
    var time = ytPlayer.getDuration();
    var p = 0.3;
    if(preset == "s"){
        //strict
        p=0.3;
    } else if(preset == "a"){
        //adaptive
        if(time<300){
            p=0.3;
        } else if(time <= 1800){
            p=0.2;
        } else if(time <= 3600){
            p=0.1;
        } else {
            p=0.05;
        }
    }

    var wadsworthConst = time * p;

    return wadsworthConst;
}

function refresh(f) {
  if(document.readyState !== 'complete' || !window.yt || !$) {
    setTimeout('refresh(' + f + ')', 100);
  } else {
    $(document).ready(f);
  }
}
refresh(init);