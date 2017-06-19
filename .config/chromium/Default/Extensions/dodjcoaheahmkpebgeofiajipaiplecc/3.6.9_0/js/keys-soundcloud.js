var PREV = 'previous-track';
var PLAY = 'play-pause';
var NEXT = 'next-track';

// console.log("Loading Soundcloud script into webview");

var messageHandler = function(request) {
  // console.log("keys window.onMessage: ", request);

  if(request.data === NEXT) {
      var nextButton = document.querySelector('.skipControl__next');
      simulateClick(nextButton);
  } else if(request.data === PLAY) {
      var playPauseButton = document.querySelector('.playControl');
      simulateClick(playPauseButton);
  } else if(request.data === PREV) {
      var backButton = document.querySelector('.skipControl__previous');
      simulateClick(backButton);
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


var loginButtons = document.querySelectorAll('button.loginButton');
forEach(loginButtons, function (index, value) {
  value.onclick = function(e){
    window.location.href = "https://soundcloud.com/login";
    e.stopPropagation();
  };
});

var signupButtons = document.querySelectorAll('button.signupButton');
forEach(signupButtons, function (index, value) {
  console.log(index, value);
  value.onclick = function(e){
    window.location.href = "https://soundcloud.com/signup";
    e.stopPropagation();
  };
});


function forEach(array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); 
  }
}
