
var appArr = [],
	appList = '',
	dragsort,
	isDraggable = false,
	appCounter = 0;



function $(el) {
	return document.getElementById(el);
}


function init(extArr) {
	var i;
	for(i = 0; i < extArr.length; i++) {
		if(extArr[i].isApp && extArr[i].enabled) {
			appArr.push(extArr[i]);
			appCounter++;
		}
	}

	sortApps();
	renderAppTable();
}


function sortApps() {
	
	var appOrder = [],
		tArr = appArr,
		s = localStorage.getItem('appOrder'),
		newArr = [],
		i, n, appID;

	if(s)
		var appOrder = s.split(',');

	if(appOrder.length > 0) {
		for(i = 0; i < appOrder.length; i++) {
			appID = appOrder[i];
			for(n = 0; n < tArr.length; n++) {
				if(appID == tArr[n].id)
					newArr.push(tArr.splice(n, 1)[0]);
			}
		}
	}

	// Now put the rest of the apps list..	
	appArr = newArr.concat(tArr);
}


function renderAppTable() {
	if(appCounter == 0) {
		/* we don't have installed and enabled apps ... so tell the user*/
		var msg = '<div id="noApps"><img src="img/box_empty_64.png">';
		msg += 'It looks like you don\'t have any installed apps yet. <a id="goToWS" href="#"> Go get some</a></div>';

		$('content').innerHTML = msg;

		$('goToWS').addEventListener('click', function(){gotoWebStore();});

		$('goWebStore').style.visibility = 'hidden';
		$('editButton').style.visibility = 'hidden';
	} else {
		/* Print all apps*/
		$('content').innerHTML = buildAppTable();

		for (var i = 0; i < appArr.length; i++) {
			$(appArr[i].id).addEventListener('click', function(ev){
				launchApp(ev.target.parentNode.id);
			});
		}
	}	
}


function buildAppTable() {

	var app;
	var appTable = '';
	var appLink = '';
	var i;
	var appName = '';

	for(i = 0; i < appArr.length; i++) {
		app = appArr[i];

		var biggest = getIcon(app.icons);
	
		if(app.name.length > 12)  	 // truncate application name after 12th simbol
			appName = app.name.substring(0,10)+"..";
		else 
			appName = app.name;

		appLink = '<a href="#" class="appLink" id=\'' + app.id + '\'';
		if(app.name.length > 12)
				appLink += ' title="'+ app.name +' "';
		appLink += '><img class="appIcon" src="'+ app.icons[biggest].url +'">';
		appLink += '<span><br>'+ appName +'</span></a>';

		appTable += appLink;
	}
	
	return appTable;
}




/* Find the {best} image from the App - (64px is the best size for us) */
function getIcon(icons) {
	var biggest = 0;
	var size = 0;
	var i;
	for(i = 0; i < icons.length; i++) {
		if(size < 64 && icons[i].size > size) {
			size = icons[i].size;
			biggest = i;
		}	
	}
	return biggest;
}


function launchApp(appID) {
	chrome.management.launchApp(appID);
	window.close(); //??
}


function initDD() {
	$('content').innerHTML = buildSortableTable();

	dragsort = ToolMan.dragsort();
	//dragsort.makeListSortable($("apps"), saveOrder);
	dragsort.makeListSortable($("apps"));
}


function buildSortableTable() {
	var app;
	var appTable = '<ul id="apps">';
	var appLink = '';
	var i;
	var appName = '';

	for(i = 0; i < appArr.length; i++) {
		app = appArr[i];

		var biggest = getIcon(app.icons);
	
		if(app.name.length > 12)  	 // truncate application name after 12th simbol
			appName = app.name.substring(0,10)+"..";
		else 
			appName = app.name;

		appLink = '<li class="apps" id="'+ app.id +'"';
		if(app.name.length > 12)
				appLink += ' title="'+ app.name +' "';
		appLink += '><img class="appIcon" src="'+ app.icons[biggest].url +'">';
		appLink += '<br><span>'+ appName +'</span></li>';

		appTable += appLink;
	}
	appTable += '</ul>';
	
	return appTable;
}


function saveOrder(item) {
	var appList = $('apps').getElementsByTagName('li');
	var appOrder = [];
	var i;
	for(i = 0; i < appList.length; i++) {
		appOrder.push(appList[i].id);
	}

	localStorage.setItem('appOrder', appOrder);
}


function editApps() {
	if(isDraggable){
		saveOrder();
		sortApps();
		$('content').innerHTML = buildAppTable();
		$('editButton').innerHTML = 'edit';
		isDraggable = false;
	} else {
		$('editButton').innerHTML = 'done';
		initDD();
		isDraggable = true;
	}
}


function gotoWebStore() {
	chrome.tabs.create({'url': 'https://chrome.google.com/webstore/'});
}

$('goWebStore').addEventListener('click', function() {
	gotoWebStore();
});


$('editButton').addEventListener('click', function() {
	editApps();
});



chrome.management.getAll(function(extArray){
	init(extArray);
});


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20122115-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


