var PREV = 'previous-track';
var PLAY = 'play-pause';
var NEXT = 'next-track';
var SCROLL_FIXED = 0;

// console.log("Loading Gmusic script into webview");

var messageHandler = function(request) {
  // console.log("keys window.onMessage: ", request);

  if(request.data === NEXT) {
      var nextButton = document.querySelector('[data-id=forward]');
      simulateClick(nextButton);
  } else if(request.data === PLAY) {
      var playPauseButton = document.querySelector('[data-id=play-pause]');
      simulateClick(playPauseButton);
  } else if(request.data === PREV) {
      var backButton = document.querySelector('[data-id=rewind]');
      simulateClick(backButton);
  } else if(request.data === "FIXSCROLL") {
    // console.log("###### message fixScrollbarStyle");
    fixScrollbarStyle();
  }
};

window.addEventListener('message', messageHandler, false);


function simulateClick(element) {
    if(!element){
        console.log('Cannot simulate click, element undefined');
        return false;
    }

    var click = document.createEvent('MouseEvents');
    click.initMouseEvent('click', true, false,  document, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return element.dispatchEvent(click);
}

function fixScrollbarStyle(){
  // console.log("########### fixScrollbarStyle");
  
  
  var nav = document.getElementById("nav-container");
  var mc = document.getElementById("content-container");
  
  if (!nav || !mc){
    // console.log("########### Els with scrollbars not available: ", nav, mc);
  }
  
  function step(timestamp) {
    if (SCROLL_FIXED === 0){
      SCROLL_FIXED = 1;
      nav.style.display = 'none';
      mc.style.display = 'none';
      // console.log("########### requestAnimationFrame hidden: ", timestamp);
      window.requestAnimationFrame(step);
    } else if (SCROLL_FIXED === 1) {
      SCROLL_FIXED = 2;
      nav.style.display = 'flex';
      mc.style.display = 'flex';
      // console.log("########### requestAnimationFrame auto: ", timestamp);
    } else {
      // console.log("########### requestAnimationFrame SCROLL_FIXED: ", SCROLL_FIXED);
    }
  }
  
  window.requestAnimationFrame(step);
  
  
  // var readyStateCheckInterval = setInterval(function() {
  //     if (document.readyState === "complete") {
  //         console.log("############################## document READY");
  //         console.log("### ", document.querySelector('#nav'));
  //         window.requestAnimationFrame(step);
  //         clearInterval(readyStateCheckInterval);
  //     }
  //   }, 10);
  
}

