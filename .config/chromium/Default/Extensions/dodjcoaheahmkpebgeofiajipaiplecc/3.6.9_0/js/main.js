
// frame style
var winWidth = 977, winWidthCompact = 325,
    winHeight = 500, winHeightCompact = 135,
    prevLeft = 0, prevTop = 0;

var currentPlayer;
var currentTheme;
var isMiniModeOn = false;
var playMusicWV = document.getElementById("playMusicWV");

if (/mac/i.test(navigator.platform))
    $("body").addClass("os-mac");
else if (/linux/i.test(navigator.platform)) {
    $("body").addClass("os-lnx");
} else {
    $("body").addClass("os-win");
}


chrome.app.window.current().resizeTo(winWidth, winHeight);

function init() {
  chrome.storage.local.get(function(items) {
    if (!items['settings'] || !items['settings'].player) {
      // console.log("No stored Settings", items);
      currentPlayer = GM_CONST.PLAYERS.GPM;
      currentTheme = GM_CONST.THEME.DEFAULT;
      saveSettings();
    } else {
      // console.log("Settings retrieved: ", items['settings']);
      var playerId = items['settings'].player;
      currentPlayer =  getPlayer(playerId) || GM_CONST.PLAYERS.GPM;
      currentTheme = items['settings'].theme || GM_CONST.THEME.DEFAULT;
    }
    updatePlayer();
    updateMenu();
  });
}

init();


function saveSettings(){
  // console.log("[MAIN] Saving settings: {" + currentPlayer.id + ', ' + currentTheme + '}');
  chrome.storage.local.set(
    { 'settings' : 
      { 'player' : currentPlayer.id,
        'theme' : currentTheme 
      }
    }, function(){
    // console.log("[MAIN] settings stored");
  });
}
 
function updatePlayer(newPlayerId){
  if (newPlayerId && getPlayer(newPlayerId)){
    currentPlayer = getPlayer(newPlayerId);
  } else {
    // console.log("No player with id: ", newPlayerId);
  }
  // console.log("Setting Player to ", currentPlayer.id, " CurrentTheme: ", currentTheme);
  playMusicWV.setAttribute('src', currentPlayer.url);
  document.getElementById("logoImg").setAttribute('src', currentPlayer.logo_url);
  document.getElementById("title-text").textContent = "- " + currentPlayer.name;
  
  if (currentTheme !== GM_CONST.THEME.DEFAULT){
    // console.log("Non-Default Theme");
    var contentloadListener = function(e) {
      applyTheme(currentTheme);
      playMusicWV.removeEventListener('contentload', contentloadListener);
    };
    
    playMusicWV.addEventListener('contentload', contentloadListener);
    
    
  }
  
  winHeightCompact = currentPlayer.mini_height;
  saveSettings();
}

function getPlayer(id){
  return GM_CONST.PLAYERS[id.toUpperCase()];
}


// frame control buttons

$('#window-expand').hide();
$('#window-restore').hide();

$('#window-expand').click(function(e) {
    expandWindow();
    isMiniModeOn = false;
    chrome.app.window.current().resizeTo(winWidth, winHeight);
    chrome.app.window.current().moveTo(prevLeft, prevTop);
});

$('#window-compact').click(function(e) {
    if (isMaximized()) {
        isMiniModeOn = true;
        restoreWindow();
    }
    minifyWindow();

});

$('#window-minimize').click(function(e) { chrome.app.window.current().minimize(); });
$('#window-close').click(function(e) { window.close(); });


$('#window-maximize').click(function(e) {
    maximizeWindow();
    chrome.app.window.current().maximize();
});

$('#window-restore').click(function(e) {
    restoreWindow();
    //chrome.app.window.current().resizeTo(winWidth, winHeight);
});


function minifyWindow() {
  // if (currentPlayer.id == GM_CONST.PLAYERS.GPM.id) {
  //   return;
  // }
    $('#window-compact').hide();
    $('#window-expand').show();

    $('body').addClass('mini-mode');

    if (chrome.app.window.current().isMaximized()) {
      restoreWindow();
    }
    playMusicWV.insertCSS({file: "/css/" + currentPlayer.id + "_min.css", runAt: "document_start"});
    isMiniModeOn = true;
    chrome.app.window.current().resizeTo(winWidthCompact, winHeightCompact);

    prevLeft = chrome.app.window.current().outerBounds.left;
    prevTop = chrome.app.window.current().outerBounds.top;
    chrome.app.window.current().moveTo(window.screen.availWidth,window.screen.availHeight);
}


function expandWindow() {
    $('#window-expand').hide();
    $('#window-compact').show();
    $('body').removeClass('mini-mode');
    playMusicWV.insertCSS({file: "/css/" + currentPlayer.id + "_max.css", runAt: "document_start"});
}

function restoreWindow() {
    chrome.app.window.current().restore();
    $('#window-restore').hide();
    $('#window-maximize').show();
}

function maximizeWindow() {
    $('#window-maximize').hide();
    $('#window-restore').show();
    if (isMiniModeOn) {
        expandWindow();
    }
}


function isMaximized() {
    return chrome.app.window.current().isMaximized();
}

function isMinimized() {
    return chrome.app.window.current().isMinimized();
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(window).resize(function() {
    delay(function(){
      // console.log('Resize activated');
      if (isMiniModeOn 
        && (chrome.app.window.current().outerBounds.width > 375 || chrome.app.window.current().outerBounds.height > winHeightCompact) 
        && !isMaximized()) {
        expandWindow();
        chrome.app.window.current().resizeTo(winWidth, winHeight);
        isMiniModeOn = false;
      }
    }, 100);
});

chrome.app.window.current().onRestored.addListener(function() {
    $('#window-restore').hide();
    $('#window-maximize').show();
    // case when demaximize a previous mini mode
    // isMinimized check required to avoid the case in which restored is fired when minimizing from maximized state, clear as mud right?
    if (isMiniModeOn && !isMaximized() && !isMinimized()) {
        minifyWindow();
    }
});

chrome.app.window.current().onMaximized.addListener(function() {
  maximizeWindow();
});


// Global Media Keys

playMusicWV.addEventListener('contentload', function(e) {
  playMusicWV.executeScript({file: "/js/const.js", runAt: "document_end"});
  // console.log("currentPlayer.eq_enabled: ", currentPlayer.eq_enabled);
  if (currentPlayer.eq_enabled){
    playMusicWV.executeScript({file: "/eq/eq-page.js", runAt: "document_end"});
  } 
  playMusicWV.executeScript({file: currentPlayer.media_keys_url, runAt: "document_end"});
  playMusicWV.insertCSS({file: currentPlayer.css_init, runAt: "document_end"});
});

chrome.commands.onCommand.addListener(function(cmd) {
  try{
    // console.log("Sending command: ", cmd);
    playMusicWV.contentWindow.postMessage(cmd, "*");
  }catch(error){
    console.log("postMessage error: " + error);
  }
});

// Menu Stuff

$('.main-menu').hover(function(e){
  if (!$('.eq-container').hasClass('visible'))
    $('.main-menu ul').addClass('visible');
},function(e){
  $('.main-menu ul').removeClass('visible');
});

$('.main-menu li').click(function(e){
  switch (this.id) {
    case "m_gpm":
    case "m_sc":
      updatePlayer($(this).data('player'));
      updateMenu();
      break;
    case "m_eq": 
      $('.eq-container').addClass('visible');
      break;
    case "m_feedback":
      window.open('https://chrome.google.com/webstore/detail/gmusic/dodjcoaheahmkpebgeofiajipaiplecc/reviews');
      break;
    case "m_dark":
      updateTheme(GM_CONST.THEME.DARK);
      break;
    case "m_default":
      updateTheme(GM_CONST.THEME.DEFAULT);
      break;
    case "m_reload":
      playMusicWV.reload();
      init();
      break;
  }
  $('.main-menu ul').removeClass('visible');
});

function updateMenu(){
  $('.main-menu li').show();
  $('#m_' + currentPlayer.id).hide();
  $('#m_' + currentTheme).hide();
  
  if (currentPlayer.eq_enabled){
    $('#m_eq').show();
  } else {
    $('#m_eq').hide();
  }
}

function updateTheme(theme){
  // console.log("Update Theme: ", currentTheme , " -> ", theme );
  currentTheme = theme;
  applyTheme(theme);
  updateMenu();
  saveSettings();
}

function applyTheme(theme){
  // console.log("Apply Theme: ", theme );
  playMusicWV.insertCSS({file: "/css/" + currentPlayer.id + "_"+ theme +".css", runAt: "document_end"});
  playMusicWV.contentWindow.postMessage("FIXSCROLL", "*");
}


$('.eq-container').click(function(e) {
  if (e.target == this)
    $('.eq-container').removeClass('visible');
});

$('.eq-close img').click(function(e) {
  $('.eq-container').removeClass('visible');
});
