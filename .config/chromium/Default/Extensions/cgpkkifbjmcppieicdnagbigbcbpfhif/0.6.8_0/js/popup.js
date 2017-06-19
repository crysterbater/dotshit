var buttons;
var intros;
var introm;
var outros;
var outrom;
var shorts;
var shortm;
var inputs;
var maxValue;

function init(){
    cacheElements();
    attachEvents();
    getSettings();
}

function cacheElements(){
    buttons = $(".menu > li > label");
    intros = $(".start.seconds");
    introm = $(".start.minutes");
    outros = $(".end.seconds");
    outrom = $(".end.minutes");
    shortm = $(".short.minutes");
    shorts = $(".short.seconds");
    inputs = $(".user-time");
    maxValue = parseInt(intros.attr("max"));
}

function attachEvents(){
    buttons.on("click", onBtnClick);
    inputs.on("change", saveIntroOutro);
    inputs.on("keyup", saveIntroOutro);
    inputs.on("keydown", validateKeyPress);
}

function onBtnClick(){
    var name = $(this).attr("for");
    setSettings({
        "mode":name
    });
}

function validateKeyPress(e){
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
         // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function saveIntroOutro(e){
    var elem = $(this);
    var val = elem.val();
    //Ensure that the value is in boundries
    if(val == ""){
        elem.val("0");
    } else if(parseInt(val) > maxValue){
        elem.val(maxValue);
    }
    var i = parseInt(intros.val()) + (parseInt(introm.val())*60);
    var o = parseInt(outros.val()) + (parseInt(outrom.val())*60);
    var s = parseInt(shorts.val()) + (parseInt(shortm.val())*60);
    chrome.storage.sync.set({
        "intro":i,
        "outro":o,
        "shortVid":s
    });
}

function getSettings(){
    var get = [
        "mode",
        "intro",
        "outro",
        "shortVid"
    ];
    chrome.storage.sync.get(get,gotSettings);
}

function gotSettings(data){
    s = data;
    //console.log(data.mode, data.intro, data.outro, data);
    if(!data.mode){
        s.mode = "adaptive";
        if(!s.intro){
            s.intro = 0;
        }
        if(!s.outro){
            s.outro = 0;
        }
        if(!s.shortVid){
            s.shortVid = 0;
        }
        setSettings(s);
        checkOption(s);
    } else {
        checkOption(s);
    }
}

function setSettings(data){
    chrome.storage.sync.set(data,onSettingsSaved);
}

function onSettingsSaved(){
    console.log("settings saved.");
}

function checkOption(data){
    var name = data.mode;
    var i = data.intro;
    var o = data.outro;
    var s = data.shortVid;
    $("#"+name).prop('checked', true);
    intros.val(i%60);
    introm.val((i - i%60) / 60);
    outros.val(o%60);
    outrom.val((o - o%60) / 60);
    shorts.val(s%60);
    shortm.val((s - s%60) / 60);
}

$(document).ready(init);