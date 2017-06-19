!function(e,t){"use strict";"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.autosize=t()}(this,function(){function e(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),e.style.wordWrap="break-word";var i=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=i,n="none"!==t.maxHeight?parseFloat(t.maxHeight):!1,r="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),o()}function o(){var t=e.style.height,o=document.documentElement.scrollTop,i=document.body.scrollTop;e.style.height="auto";var s=e.scrollHeight+r;if(n!==!1&&s>n?(s=n,"scroll"!==e.style.overflowY&&(e.style.overflowY="scroll")):"hidden"!==e.style.overflowY&&(e.style.overflowY="hidden"),e.style.height=s+"px",document.documentElement.scrollTop=o,document.body.scrollTop=i,t!==e.style.height){var d=document.createEvent("Event");d.initEvent("autosize.resized",!0,!1),e.dispatchEvent(d)}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!e.hasAttribute("data-autosize-on")){var n,r;"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",o),window.addEventListener("resize",o),e.addEventListener("input",o),e.addEventListener("autosize.update",o),e.addEventListener("autosize.destroy",function(t){window.removeEventListener("resize",o),e.removeEventListener("input",o),e.removeEventListener("keyup",o),e.removeEventListener("autosize.destroy"),Object.keys(t).forEach(function(o){e.style[o]=t[o]}),e.removeAttribute("data-autosize-on")}.bind(e,{height:e.style.height,overflow:e.style.overflow,overflowY:e.style.overflowY,wordWrap:e.style.wordWrap,resize:e.style.resize})),e.setAttribute("data-autosize-on",!0),e.style.overflow="hidden",e.style.overflowY="hidden",t()}}return"function"!=typeof window.getComputedStyle?function(e){return e}:function(t){return t&&t.length?Array.prototype.forEach.call(t,e):t&&t.nodeName&&e(t),t}});

(function($) {
  $.rand = function(arg) {
    if ($.isArray(arg)) {
        return arg[$.rand(arg.length)];
    } else if (typeof arg === "number") {
        return Math.floor(Math.random() * arg);
    } else {
        return 4;  // chosen by fair dice roll
    }
  };
})(jQuery);

function loadChanges() {
  chrome.storage.sync.get('todoText', function (result) {
    var todoList = result.todoText;

    if (todoList !== undefined){}

    $("#syncTodo").val(todoList);
    // size textarea to height of content on load
    $("textarea").height( $("textarea")[0].scrollHeight );
  });
}

$('#syncTodo').on('keyup keydown keypress', function () {
  var theValue = $('#syncTodo').val();
  chrome.storage.sync.set({'todoText': theValue}, function (result) {});
});

$(document).ready(function() {
  chrome.storage.sync.get('showTodo', function (showTodo) {
    if (showTodo.showTodo == false) {
      $('#syncTodo').css('display', 'block');
      $('#toggleTodo').text = '-';
    } else {
      $('#syncTodo').css('display', 'none');
      $('#toggleTodo').text = '+';
    }
  });

  chrome.storage.sync.get('showStamp', function (showStamp) {
    if (showStamp.showStamp == false) {
      $('#month').css('display', 'inline-block');
    } else {
      $('#month').css('display', 'none');
    }
  });

  $('#toggleTodo').click(function() {
    var showTodo = chrome.storage.sync.get('showTodo', function (showTodo) {
      if (showTodo.showTodo == undefined) {
        var showTodo = true;
        chrome.storage.sync.set({'showTodo': showTodo});
      }
      if (showTodo.showTodo == false) {
        chrome.storage.sync.set({'showTodo': true});
      } else {
        chrome.storage.sync.set({'showTodo': false});
      }
      $('#syncTodo').slideToggle('fast');
    });
  });

  $('#time').click(function() {
    var showStamp = chrome.storage.sync.get('showStamp', function (d) {
      if (d.showStamp == undefined) {
        var showStamp = false;
        chrome.storage.sync.set({'showStamp': showStamp});
      }
      if (d.showStamp == false) {
        chrome.storage.sync.set({'showStamp': true});
      } else {
        chrome.storage.sync.set({'showStamp': false});
      }
      $('#month').slideToggle('fast');
    });
  });

});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// display and update the clock on the new tab page.
function updateClock() {
  Date.getMinutesTwoDigits = function() {
    var retval = now.getMinutes();
    if (retval < 10) return ("0" + retval.toString());
    else return retval.toString();
  }
  Date.getHoursModTwelve = function() {
    var retval = now.getHours();
    retval = retval%12;
    if (retval == 0) retval = 12;
    return retval;
  }
  var now = new Date(),
      time = Date.getHoursModTwelve() + ':' + Date.getMinutesTwoDigits();

  document.getElementById('time').innerHTML = ["", time].join('');
  setTimeout(updateClock, 1000);
}

// Good default colors
var colors = new Array(
  [62,35,255],
  [128,255,212],
  [255,35,98],
  [45,175,230],
  [255,0,255],
  [255,128,0]);

// ios7
// var colors = new Array(
//   [142,142,147],
//   [255,45,85],
//   [255,59,48],
//   [255,149,0],
//   [255,204,0],
//   [76,217,100],
//   [90,200,250],
//   [52,170,220],
//   [0,122,255],
//   [88,86,214]);


// Van gogh pallette
// var colors = new Array(
//   [0,0,0],
//   [120,144,168],
//   [48,72,120],
//   [24,24,72],
//   [240,168,24]);

// roygbiv (minus primary rgb)
// var colors = new Array(
//   [255,0,128],
//   [255,128,0],
//   [255,255,0],
//   [128,255,0],
//   [0,255,128],
//   [0,255,255],
//   [0,128,255],
//   [128,0,255],
//   [255,0,255]);

shuffle(colors);

var northSouth = new Array('0', '100');
var eastWest = new Array('0', '100');

var startSpot  = $.rand(eastWest) + '% ' + $.rand(northSouth) + '% ';
var startSpot2 = $.rand(eastWest) + '% ' + $.rand(northSouth) + '% ';

if((startSpot == startSpot2)){
  startSpot2 = $.rand(eastWest) + '% ' + $.rand(northSouth) + '% ';
}

var step = 0;
// color table indices for: 
// current color left
// next color left
// current color right
// next color right
var colorIndices = [0,1,2,3];

// transition speed
// 0.010 and 100 interval duration is 
// a good trade-off for performance
var gradientSpeed = 0.010;

function updateGradient(){
  
  if ( $===undefined ) return;
  
  var c0_0 = colors[colorIndices[0]];
  var c0_1 = colors[colorIndices[1]];
  var c1_0 = colors[colorIndices[2]];
  var c1_1 = colors[colorIndices[3]];

  var istep = 1 - step;
  var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
  var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
  var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
  var color1 = "rgb("+r1+","+g1+","+b1+")";

  var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
  var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
  var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
  var color2 = "rgb("+r2+","+g2+","+b2+")";

  var r3 = Math.round(istep * c0_0[0] + step * c0_1[0]);
  var g3 = Math.round(istep * c1_0[1] + step * c1_1[1]);
  var b3 = Math.round(istep * c0_0[2] + step * c0_1[2]);
  var color3 = "rgb("+r3+","+g3+","+b3+")";


  $('#gradient').css({
    "background-image": "-webkit-gradient(linear,"+ startSpot +", " + startSpot2 + ",color-stop(0, "+ color1 + "),color-stop(1, " + color2 + "))"});
  
  step += gradientSpeed;
  if (color1 == color2){
    shuffle(northSouth);
    shuffle(eastWest);
    $('#fluidBackground').css({"background-color": color1});
    startSpot = $.rand(eastWest) + '% ' + $.rand(northSouth) + '% ';
  }
  if((startSpot == startSpot2)){
      startSpot2 = $.rand(eastWest) + '% ' + $.rand(northSouth) + '% ';
      // console.log('+' + startSpot);
  }
  if ( step >= 1 ){
    step %= 1;
    colorIndices[0] = colorIndices[1];
    colorIndices[2] = colorIndices[3];
    
    // pick two new target color indices
    // do not pick the same as the current one
    colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
  }
}

setInterval(updateGradient,100);
updateClock();
var now = new Date();
var monthNames = ["January", "February", "March", "April", "May", 
      "June", "July", "August", "September", "October", "November", 
      "December"];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
      'Friday', 'Saturday'];      

      day   = dayNames[now.getDay()];
      month = monthNames[now.getMonth()];
      date  = now.getDate();

  // show the name of day too
  document.getElementById('month').innerHTML = day + ', ' + month + " " + date;

  // document.getElementById('month').innerHTML = month + " " + date;

  // var triangles = document.createElement('script');
  // triangles.src = 'trianglify.js';
  // document.head.appendChild(triangles);

autosize($('#syncTodo'));
loadChanges();
