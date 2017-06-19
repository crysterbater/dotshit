var mode;

function onExtensionMessage(request) {
  if (request.enabled) {
    document.documentElement.setAttribute('hv', mode + request.scheme)
  } else {
    document.documentElement.removeAttribute('hv')
  }
  if (request.custom) {
    document.body.setAttribute("style","-webkit-filter:hue-rotate(" + request.custom + "deg);");
  }
}
function onEvent(evt) {
  var disKey = localStorage['licStatus'];

  if(disKey !== 'FREE_TRIAL_EXPIRED') {
    if (evt.keyCode == 122 && evt.shiftKey) {
      chrome.extension.sendRequest({
        'toggle_global': true
      });
      evt.stopPropagation();
      evt.preventDefault();
      return false
    }
    if (evt.keyCode == 123 && evt.shiftKey) {
      chrome.extension.sendRequest({
        'toggle_site': true
      });
      evt.stopPropagation();
      evt.preventDefault();
      return false
    }
    return true
  }
}
function init() {
  if (window == window.top) {
    mode = 'a'
  } else {
    mode = 'b'
  }
  chrome.extension.onRequest.addListener(onExtensionMessage);
  chrome.extension.sendRequest({'init': true}, onExtensionMessage);
  document.addEventListener('keydown', onEvent, false);

  $('*').filter(function() {
    if (this.currentStyle) {
      return this.currentStyle['backgroundImage'] !== 'none';
    } else if (window.getComputedStyle) {
      return document.defaultView.getComputedStyle(this,null).getPropertyValue('background-image') !== 'none';
    }
  }).addClass('bg_found');
  
}

// var last_target = null;
// document.addEventListener('mousedown', function(event){
//   //possibility: check that the mouse button == 2
//   last_target = event.target;
// }, true);

// chrome.extension.onRequest.addListener(function(event){
//   // Fix selection
//   $(last_target).css("-webkit-filter", "contrast(80%) brightness(120%) contrast(85%) invert()");
//   // last_target.style
//   // save to localStorage here

// });


init();