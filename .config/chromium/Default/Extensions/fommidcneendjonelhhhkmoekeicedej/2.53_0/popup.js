var site;
var key1;
var key2;
var appId = chrome.runtime.id;
var appURL = "chrome-extension://" + appId + "/firstLaunch.html";

function setRadio(name, value) {
  var radios = document.querySelectorAll('input[name="' + name + '"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value == value);
    radios[i].disabled = !getEnabled();
  }
}

function update() {
  document.body.className = getEnabled() ? '' : 'disabled';

  if (getEnabled()) {
    // is enabled
    // $('toggle').innerHTML = '<b><div class="pause"></div> Pause</b>';
    document.getElementById("checkbox1").checked = true;
    // $('subcontrols').style.display = 'block';
  } else {
    // disabled
    // $('toggle').innerHTML = '<b>Resume</b>';
    document.getElementById("checkbox1").checked = false;
    // $('subcontrols').style.display = 'none';
  }

  setRadio('keyaction', getKeyAction());
  if (site) {
    setRadio('scheme', getSiteScheme(site));
    $('make_default').disabled = (getSiteScheme(site) == getDefaultScheme());
  } else {
    setRadio('scheme', getDefaultScheme());
  }
  if (getEnabled()) {
    document.documentElement.setAttribute(
        'hv',
        site ? 'a' + getSiteScheme(site) : 'a' + getDefaultScheme());
  } else {
    document.documentElement.setAttribute('hv', 'a0');
  }
  chrome.extension.getBackgroundPage().updateTabs();
}

function onToggle() {
  // window.localStorage.setItem('hvStatus', onOff);
  setEnabled(!getEnabled());
  update();
}

function onForget() {
  resetSiteSchemes();
  update();
}

function onRadioChange(name, value) {
  switch(name) {
    case 'keyaction':
      setKeyAction(value);
      break;
    case 'apply':
      setApply(value);
      break;
    case 'scheme':
      if (site) {
        setSiteScheme(site, value);
      } else {
        setDefaultScheme(value);
      }
      break;
  }
  update();
}

function onMakeDefault() {
  setDefaultScheme(getSiteScheme(site));
  update();
}

function addRadioListeners(name) {
  var radios = document.querySelectorAll('input[name="' + name + '"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].addEventListener('change', function(evt) {
      onRadioChange(evt.target.name, evt.target.value);
    }, false);
    radios[i].addEventListener('click', function(evt) {
      onRadioChange(evt.target.name, evt.target.value);
    }, false);
  }
}

// function hideShow() {
//   var e = document.getElementById('hiddenQR');
//        if(e.style.display != 'none')
//           e.style.display = 'none';
//        else
//           e.style.display = 'block';
// }

function reInit() {
  // connect to CWS & get license again
  var backgroundPage = chrome.extension.getBackgroundPage();
  backgroundPage.getLicense();
  // get licStatus and toggle views
  var licStatus = window.localStorage.getItem('licStatus');
  var licCheck  = window.localStorage.getItem('licCheckComplete');
  var daysLeft  = Math.round(window.localStorage.getItem('daysLeftInTrial'));

  if ( (licStatus == 'FULL' || licStatus == 'FREE_TRIAL') && (daysLeft > 0) ){
    // no counter, no upgrade btn - simple & clean
    var c = '';
    if (licStatus == 'FULL') {
      c = 'none';
    } else {
      c = 'block';
    }
    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';

  }else if ( (licStatus == "FREE_TRIAL_EXPIRED") || (daysLeft <= 0) ) {
    // buy HV already!
    var test = '<div style="display:none;"><input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label></div><div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" class="upHead">Your free trial is up!</h2></center><div class="up">Your eyes thank you for the last 6 months we\'ve had together, but your free trial is up.<br><br> If you love browsing the internet with relaxed eyes, click below and unlock the full version for just $2.99/yr.<br></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i><div class="upOpen">(opens in a new tab)</div><div class="upInfo"><a href="'+ appURL +'#upgradeToPaid" target="_blank">info</a></div>';
  } else if ( (licCheck === null) || (licStatus == "error") ){
    // var test = '<div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><center><h2 id="title" tabindex="0" class="upHead">Update Available!</h2></center><div class="up">Thank you for supporting Hacker Vision!<br><br>We have just released a <b>major update</b> that we hope you\'ll love.<br><br>To get started using the new version, please click \'Update Now\' and \'Accept\' at the prompt. <br></div><center><div id="retryInit">Update Now</div></center><div style="text-align:right;font-size:10px;font-weight:700;padding:10px;padding-bottom:20px;"><a href="'+ appURL + '#chromeWebStorePopup" target="_blank">info</a></div>';
    var c = 'block';

    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';
  } else {
    // tell them to connect to internet and/or press "Accept"
    // var test = '<div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><div class="up">Sorry, there was an error connecting to the Google Chrome Web Store to read your license. <br><br> 1. Please make sure you are connected to the internet. <br><br> 2. When prompted, please press the "Accept" button to let us verify your license in the Chrome Web Store. </div><center><div id="retryInit">Retry</div></center><div class="upInfo"><a href="'+ appURL + '#chromeWebStorePopup" target="_blank">info</a></div>';

    // allow access
    var c = '';
    if (licStatus == 'FULL') {
      c = 'none';
    } else {
      c = 'block';
    }

    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';

    // keep checking
  }

  // Show and initialize
  document.getElementById("everything").innerHTML = test;
  init();
}

function init() {
  // var backgroundPage = chrome.extension.getBackgroundPage();
  // backgroundPage.getLicense();
  addRadioListeners('keyaction');
  addRadioListeners('apply');
  addRadioListeners('scheme');
  $('retryInit').addEventListener('click', reInit);
  // $('toggle').addEventListener('click', onToggle, false);
  document.getElementById('slider').addEventListener('input', updateHue);

  $('checkbox1').addEventListener('change', onToggle, false);
  $('make_default').addEventListener('click', onMakeDefault, false);
  $('forget').addEventListener('click', onForget, false);
  // $('donateLink').addEventListener('click', hideShow);

  if (navigator.appVersion.indexOf("Mac") != -1) {
    key1 = '&#x2318;+Shift+F11';
    key2 = '&#x2318;+Shift+F12';
  } else {
    key1 = 'Shift+F11';
    key2 = 'Shift+F12';
  }

  chrome.windows.getLastFocused({'populate': true}, function(window) {
    for (var i = 0; i < window.tabs.length; i++) {
      var tab = window.tabs[i];
      if (tab.active) {
        if (isDisallowedUrl(tab.url)) {
          $('scheme_title').innerHTML = '<div class="siteName">Set Global Default</div><div class="defaultText">Choose how you want to open all pages by default.</div>';
          // $('make_default').style.display = 'none';
          // $('fieldset').style.display = 'none';
        } else {
          site = siteFromUrl(tab.url);
          $('scheme_title').innerHTML = '<div class="siteName">' + site + '</div>';
          // $('make_default').style.display = 'block';
          // $('fieldset').style.display = 'none';
        }
        update();
        return;
      }
    }
    site = 'unknown site';
    update();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // get licStatus and toggle views
  var licStatus = window.localStorage.getItem('licStatus');
  var licCheck  = window.localStorage.getItem('licCheckComplete');
  var daysLeft  = Math.round(window.localStorage.getItem('daysLeftInTrial'));
  var backgroundPage = chrome.extension.getBackgroundPage();

  if ( (licStatus == 'FULL' || licStatus == 'FREE_TRIAL') ){
    // no counter, no upgrade btn - simple & clean
    var c = '';
    if (licStatus == 'FULL') {
      c = 'none';
    } else {
      c = 'block';
    }
    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';
  } else if ( (licStatus == "FREE_TRIAL_EXPIRED") ) {
    // buy HV already!
    var test = '<div style="display:none;"><input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label></div><div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" class="upHead">Your free trial is up!</h2></center><div class="up">Your eyes thank you for the last 6 months we\'ve had together, but your free trial is up.<br><br> If you love browsing the internet with relaxed eyes, click below and unlock the full version for just $2.99/yr.<br></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i><div class="upOpen">(opens in a new tab)</div><div class="upInfo"><a href="'+ appURL +'#upgradeToPaid" target="_blank">info</a></div>';

    setInterval(function(){ 
      backgroundPage.getLicense();
    }, 7200000);
  } else if ( (licCheck === null) || (licStatus == "error") ){
    // var test = '<div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><center><h2 id="title" tabindex="0" class="upHead">Update Available!</h2></center><div class="up">Thank you for supporting Hacker Vision!<br><br>We have just released a <b>major update</b> that we hope you\'ll love.<br><br>To get started using the new version, please click \'Update Now\' and \'Accept\' at the prompt. <br></div><center><div id="retryInit">Update Now</div></center><div style="text-align:right;font-size:10px;font-weight:700;padding:10px;padding-bottom:20px;"><a href="'+ appURL + '#chromeWebStorePopup" target="_blank">info</a></div>';
    var c = 'block';

    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';

    setInterval(function(){ 
      backgroundPage.getLicense();
    }, 7200000);
  } else {
    // tell them to connect to internet and/or press "Accept"
    // var test = '<div id="toggle" style="display:none;"></div><div id="forget" style="display:none;"></div><div id="make_default" style="display:none;"></div><div id="subcontrols" style="display:none;"></div><div id="scheme_title" style="display:none;"></div><div id="donateLink" style="display:none;"></div><div class="up">Sorry, there was an error connecting to the Google Chrome Web Store to read your license. <br><br> 1. Please make sure you are connected to the internet. <br><br> 2. When prompted, please press the "Accept" button to let us verify your license in the Chrome Web Store. </div><center><div id="retryInit">Retry</div></center><div class="upInfo"><a href="'+ appURL + '#chromeWebStorePopup" target="_blank">info</a></div>';

    // allow access
    var c = '';
    if (licStatus == 'FULL') {
      c = 'none';
    } else {
      c = 'block';
    }

    var test = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label><div id="retryInit" style="display:none;"></div><center><h2 id="title" tabindex="0" style="display:none;"></h2><!--<button id="toggle"></button> --></center><div class="mainPortion"><div id="subcontrols"><fieldset><center><legend id="scheme_title"></legend></center><section><input id="radio1" name="scheme" type="radio" value="3"><label class="rd" for="radio1">Dark</label><input id="radio2" name="scheme" type="radio" value="0"><label class="rd" for="radio2">Normal</label><input id="radio3" name="scheme" type="radio" value="2"><label class="rd"  id="r3">Custom</label></section></fieldset><center><form style="display:none; padding-top:10px;"><button id="make_default" style="float:left; margin:10px;">Save</button><button id="forget" style="float:right; margin:10px;">Forget</button></form></center></div><center><button id="toggle" title="temporarily disables for all sites" style="margin-top:20px;"></button></center><span style="display:inline;"><center><div class="awesomeText"><span>Spread the love: </span></div><div class="helpText"><a href="'+ appURL + '" target="_blank">help</a></div></div><div class="holdSocial"><a class="mySocial" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="facebookIcon"></div></a><a class="mySocial" href="https://plus.google.com/share?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="gplusIcon"></div></a><a class="mySocial" href="https://twitter.com/intent/tweet?text=%23hackervision%20--%20Save%20your%20eyes%20with%20a%20dark%20theme%20for%20the%20web.&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fhacker-vision%2Ffommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="twitterIcon"></div></a><a class="mySocial" href="mailto:?subject=Check out this awesome Chrome extension... Hacker Vision&amp;body=Hi, I thought you\'d love this- it\'s an awesome Chrome extension to relax your eyes and read in low-light conditions. Plus it can extend the battery life on your laptop. Check it out at: https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="mailIcon"></div></a></div><div style="display:' + c + ';"><div class="awesomeUpgradeText"><center>' + daysLeft + ' days remaining in your trial</center></div><center><a href="https://chrome.google.com/webstore/detail/hacker-vision/fommidcneendjonelhhhkmoekeicedej" target="_blank"><div class="donateBtn"><div class="btnBoldText">Upgrade Now</div><div>Only $2.99/yr</div></div></a></center><i id="donateLink"></i></center></span></div>';

    setInterval(function(){ 
      backgroundPage.getLicense();
    }, 7200000);
  }

  // Show and initialize
  // var toggleSwitch = '<input class="checkbox" id="checkbox1" type="checkbox" checked="checked"/><label for="checkbox1" class="checkbox-label" title="Toggle On/Off for all sites"><span class="on">Active</span><span class="off">Disabled</span></label>';
  document.getElementById("everything").innerHTML = test;
  // document.getElementById("everything").insertAdjacentHTML("afterbegin", toggleSwitch);
  init();

});

