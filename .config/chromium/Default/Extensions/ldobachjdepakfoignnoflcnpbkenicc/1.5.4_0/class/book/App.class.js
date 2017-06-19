/*
App(ExtensionInfo app) extends Book
> String version															App version
> String description													App description
> String options															options page URL (only for extensions with options page)
> Array<String> permissions										contains permissions
> boolean enabled														is App enabled?
- launch()																	launch App (only for webapps)
- toggleEnable()															enable/disable App
- uninstall()																uninstall App (like removeBook)
*/
var App = (function(app) {
	var _this = this;
	var _launchBtn;
	var _toggleEnableBtn;
	
	//find icon
	var _icon;
	if(app.icons) {
		var found = false;
		for(i in app.icons) {
			if(app.icons[i].size == 128) {
				_icon = app.icons[i].url;
				found = true;
			}
		}
		if(!found) {
			_icon = app.icons[app.icons.length-1].url;
		}
	} else {
		_icon = "img/blank.png";
	}
	
	this.__proto__ = new Book({
		chromeid:	app.id,
		title:			app.name,
		image:		_icon
	});
	
	var _launchUrl = app.appLaunchUrl;
	this.version = app.version;
	this.description = app.description;
	if(app.optionsUrl) this.options = app.optionsUrl;
	this.permissions = app.permissions.concat(app.hostPermissions);
	this.enabled = app.enabled;
	
	this.launch = function() {
		if(!_this.enabled) _this.toggleEnable();
		ISource.launch(_this.chromeid);
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "launch", "app"]);
	}
	
	this.toggleEnable = function() {
		ISource.toggleEnable(_this.chromeid, !_this.enabled, function() {
			_this.enabled = !_this.enabled;
			
			if(_this.enabled) {
				_toggleEnableBtn.innerText = chrome.i18n.getMessage("disable");
				_this.dom.classList.remove("disabled");
				if(_gaq) _gaq.push(["_trackEvent", "Features", "enable", "app"]);
			} else {
				_toggleEnableBtn.innerText = chrome.i18n.getMessage("enable");
				_this.dom.classList.add("disabled");
				if(_gaq) _gaq.push(["_trackEvent", "Features", "disable", "app"]);
			}
			
			_this.update();
		});
	}
	
	this.uninstall = function() {
		ISource.remove(_this.chromeid, function() {
			_this.remove();
		});
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "uninstall", "app"]);
	}
	
	this.build = function(iconSize, replace, pos, parentElement) {
		var element = this.__proto__.build.bind(this)(iconSize, replace, pos, parentElement);
		
		element.classList.add("app");
		if(!this.enabled) element.classList.add("disabled");
		
		var back = element.create("back","div");
		back.className = "back";
		
		if(_launchUrl) {
			_launchBtn = back.create("button");
			_launchBtn.className = "full";
			_launchBtn.innerText = chrome.i18n.getMessage("launch");
			_launchBtn.onclick = function(e) {
				_this.launch();
				e.stopPropagation();
			}
		} else if(this.options) {
			var optionsBtn = back.create("button");
			optionsBtn.className = "full";
			optionsBtn.innerText = chrome.i18n.getMessage("options");
			var optionsUrl = this.options;
			optionsBtn.onclick = function(e) {
				if(_this.enabled) {
					chrome.tabs.create({url:optionsUrl});
				} else {
					if(confirm(chrome.i18n.getMessage("enableForOptions"))) {
						_toggleEnableBtn.innerText = chrome.i18n.getMessage((!_this.enabled)?"disable":"enable");
						_this.toggleEnable();
						chrome.tabs.create({url:optionsUrl});
					}
				}
				e.stopPropagation();
			}
		}
		
		_toggleEnableBtn = back.create("button");
		_toggleEnableBtn.className = "full";
		_toggleEnableBtn.innerText = chrome.i18n.getMessage((this.enabled)?"disable":"enable");
		_toggleEnableBtn.onclick = function(e) {
			_this.toggleEnable();
			e.stopPropagation();
		}
		
		var infoBtn = back.create("button");
		infoBtn.className = "full";
		infoBtn.innerText = chrome.i18n.getMessage("moreInfo");
		infoBtn.onclick = function(e) {
			FormBuilder.build("info","app",_this);
			e.stopPropagation();
		}
	}
});
