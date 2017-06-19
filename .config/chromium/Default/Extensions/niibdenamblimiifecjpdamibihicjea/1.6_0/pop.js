$(document).ready(function(){
		var Ctarget = document.querySelector(".color-list");
		Ctarget.addEventListener("click", function(e){   
		    //console.log(e.target.innerHTML);
		    //console.log(e.target);
		    var Node = e.target;
		    var range = document.createRange(); 
		    range.selectNode(Node); 
		    window.getSelection().addRange(range); 
		    //console.log(Node);
		    //console.log(range);
		    try {  
			    var successful = document.execCommand('copy');  
			    var msg = successful ? 'successful' : 'unsuccessful';  
			    //console.log('Copy ' + msg);  
			    var t = $(e.target).offset().top;
				var l = $(e.target).offset().left - 15;
				if (l == 9) {
					var l = 29
				}
				if (l == 225) {
					var l = 195
				}
				if (l == 201) {
					var l = 190
				}
				
				$("#tooltip").html(e.target.innerHTML + ' copied').css({top:t,left:l-4});
				$("#tooltip").fadeIn();
				//console.log(t);
				//console.log(l);
				setTimeout(function(){
					$("#tooltip").fadeOut();
				}, 1000);
		  	} 
		  	catch(err) {  
		    	
		 	}  
			
			window.getSelection().removeAllRanges(); 
		});

		
		




		$('.wsk-shadow--z1').hover(function(){
			$('.wsk-shadow--z1 span').hide().html("box-shadow: 0 1px 1.5px 0 rgba(0,0,0,.12),   0 1px 1px 0 rgba(0,0,0,.24);").fadeIn(150);
			$(this).addClass('shadow-box-css');
		});
		$('.wsk-shadow--z1').mouseleave(function(){
			$('.wsk-shadow--z1 span').hide().html("z=1").fadeIn(150);
			$(this).removeClass('shadow-box-css');
		});

		$('.wsk-shadow--z2').hover(function(){
			$('.wsk-shadow--z2 span').hide().html("box-shadow: 0 2px 5px 0 rgba(0,0,0,.16),  0 2px 5px 0 rgba(0,0,0,.23);").fadeIn(150);
			$(this).addClass('shadow-box-css');
		});
		$('.wsk-shadow--z2').mouseleave(function(){
			$('.wsk-shadow--z2 span').hide().html("z=2").fadeIn(150);
			$(this).removeClass('shadow-box-css');
		});

		$('.wsk-shadow--z3').hover(function(){
			$('.wsk-shadow--z3 span').hide().html("box-shadow: 0 10px 10px 0 rgba(0,0,0,.19),  0 6px 3px 0 rgba(0,0,0,.23);").fadeIn(150);
			$(this).addClass('shadow-box-css');
		});
		$('.wsk-shadow--z3').mouseleave(function(){
			$('.wsk-shadow--z3 span').hide().html("z=3").fadeIn(150);
			$(this).removeClass('shadow-box-css');
		});

		$('.wsk-shadow--z4').hover(function(){
			$('.wsk-shadow--z4 span').hide().html("box-shadow: 0 14px 14px 0 rgba(0,0,0,.25), 0 10px 5px 0 rgba(0,0,0,.22);").fadeIn(150);
			$(this).addClass('shadow-box-css');
		});
		$('.wsk-shadow--z4').mouseleave(function(){
			$('.wsk-shadow--z4 span').hide().html("z=4").fadeIn(150);
			$(this).removeClass('shadow-box-css');
		});

		$('.wsk-shadow--z5').hover(function(){
			$('.wsk-shadow--z5 span').hide().html("box-shadow: 0 19px 19px 0 rgba(0,0,0,.3),  0 15px 6px 0 rgba(0,0,0,.22);").fadeIn(150);
			$(this).addClass('shadow-box-css');
		});
		$('.wsk-shadow--z5').mouseleave(function(){
			$('.wsk-shadow--z5 span').hide().html("z=5").fadeIn(150);
			$(this).removeClass('shadow-box-css');
		});
		




		var Starget = document.querySelector(".shadow-list");
		Starget.addEventListener("click", function(e){   
		    //console.log(e.target.innerHTML);
		    //console.log(e.target);
		    var Node = e.target;
		    var range = document.createRange(); 
		    range.selectNode(Node); 
		    window.getSelection().addRange(range); 
		    console.log(Node);
		   


		    try {  
			    var successful = document.execCommand('copy');  
			    var msg = successful ? 'successful' : 'unsuccessful';  
			    //console.log('Copy ' + msg);  
			    var t = $(e.target).offset().top;
				var l = 116;
				console.log(l);
				console.log(t);
				if (t == 72 || t == 90) {
					$("#tooltip-s1").fadeIn();
			
				};
				if (t == 168 || t == 186) {
					
					$("#tooltip-s2").fadeIn();
				};
				if (t == 264 || t == 282) {
				
					$("#tooltip-s3").fadeIn();
				};
				if (t == 360 || t == 378) {
					
					$("#tooltip-s4").fadeIn();
				};
				if (t == 456 || t == 474) {
					
					$("#tooltip-s5").fadeIn();
				};
				//console.log(t);
				//console.log(l);
				setTimeout(function(){
					$(".tooltip-s").fadeOut();
				}, 1000);
		  	} 
		  	catch(err) {  
		    	
		 	}  
			
			window.getSelection().removeAllRanges(); 
		});
		
});