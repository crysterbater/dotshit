// $( document ).load(function() {
	// $('head').prepend('<style> html { background-color: black; }</style>');
// });

// $( document ).ready(function() {
	// $('html[hv="a3"] > *, html[hv="b3"] > *').not('body').filter(function() {
	//     if (this.currentStyle) 
	//               return this.currentStyle['backgroundImage'] !== 'none';
	//     else if (window.getComputedStyle)
	//               return document.defaultView.getComputedStyle(this,null)
	//                              .getPropertyValue('background-image') !== 'none';
	// }).css('-webkit-filter', 'invert()');
// });

$( document ).ready(function() {
	// fix gawker site full-height html bug
	$('.lifehacker, .jalopnik, .io9, .deadspin, .gawker, .gizmodo, .kotaku, .jezebel').parent().css('height', "inherit");
});

document.addEventListener("webkitfullscreenchange", function() {
	// highly undocumented pain in the ass
		if (document.webkitFullscreenElement) {
			$(document.webkitFullscreenElement).addClass('spookyFull');
		}else {
			$('html[hv="a3"] .spookyFull').removeClass('spookyFull');
		}
		
});