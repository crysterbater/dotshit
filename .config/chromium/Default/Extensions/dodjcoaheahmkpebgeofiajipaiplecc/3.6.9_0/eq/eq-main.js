
//console.log('popup.js');
var eq;
var presets = GM_CONST.PRESETS;
var px = (window.devicePixelRatio > 1) ? 2 : 1;
//px=1;

var inputs;
//console.log(eq);

// initializing eq
chrome.storage.local.get(function(items) {
    //Default value
    if (!items['eq']) {
      // console.log("Default EQ");
        eq = GM_CONST.EQ;
        items['eq'] = eq;
        chrome.storage.local.set(items);
    } else {
      eq = items['eq'];
      // console.log("EQ from storage", eq);
    }

    // console.log("eq initialized to: ", eq);

    try {
      for (var j = 0; j < eq.length; j++){
        $('#ch-eq-slider-'+j).val(eq[j].gain);
        // set onchange listner
    	  $('#ch-eq-slider-'+j).change(onchange);
      }

    	//load EQ presets
    	for (var i = 0; i < presets.length; i++) {
    	  $('#eq-presets ul.dropdown-menu').append('<li><a href="#" value='+i+'>'+presets[i].name+'</a></li>');
    	}
    	$('#eq-presets .dropdown-menu li:eq(0)').after('<li class="divider"></li>');

      $('#eq-presets ul.dropdown-menu li a').each(function(index){
        $(this).click(function(ev){
          // console.log($(ev.target).attr('value'));
          eq[0].gain = 1;
          $('#ch-eq-slider-0').val(eq[0].gain);
          var preset = presets[parseInt($(ev.target).attr('value'), 10)];
        	for (var i = 1; i < eq.length; i++) {
        		eq[i].gain = preset.gains[i - 1];
        		$('#ch-eq-slider-'+i).val(eq[i].gain);
        	}
        	propagateData();
        });

      });

    } catch(e) {
    	console.error("EQ initialization error!", e);
    }

});



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // console.log("[MAIN] chrome.runtime.onMessage: ", request);
    //get settings reqest from page
    if (request.action === 'getEQ') {
      // console.log("eq-main.js getEQ");
      chrome.runtime.sendMessage({
  			action : 'setEQ',
  			eq : eq
  		});

  		sendResponse({eq: eq});
    }
    return true;
});

function propagateData() {
  chrome.storage.local.set({ "eq" : eq}, function(){
    // console.log("[MAIN] eq stored");
  });

	//send message
	try{
	 // console.log('[MAIN] PostMessage set', eq);
    document.getElementById("playMusicWV").contentWindow.postMessage({
			action : 'setEQ',
			eq : eq
		}, "*");
  }catch(error){
    console.log("[MAIN] setEQ postMessage error: ", error);
  }
}


function onchange() {
	var slider = this.getAttribute('eq');
	if (slider === 'master') {
		//master volume change
		eq[0].gain = $('#ch-eq-slider-0').val();
	} else {
		//eq settings change
		var index = getEqIndex(slider);
		eq[index].gain = this.value;

    for (var j = 1; j < eq.length; j++){
      $('#ch-eq-slider-'+j).val(eq[j].gain);
    }
	}

	propagateData();
}


function getEqIndex(f) {
	for (var l = eq.length, i = 0; i < l; i++) {
		if (eq[i].f && eq[i].f + '' === f) {
			return i;
		}
	}
	return false;
}
