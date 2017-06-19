/*
Option
> Array<HTMLElement> dom
> String currentTab
> Array<TabElement> options
- init()
- buildNavigation()

	TabElement
	> HTMLElement dom
	> Array<SettingsElement> content
	
	SettingsElement
	> String title
	> String name
	> String image
	> String type
	> String getText()
	> Array<OptionElement> options
	> Function onclick(MouseEvent e)
	
	OptionElement
	> String title
	> String value
*/
var Option = new (function() {
	this.dom = {
		navigation:	null,
		content:	null,
		box:		null
	}
	var _options = {
		connections: {
			title:	chrome.i18n.getMessage("optionsTabConnections"),
			dom:	null,
			content: []
		},
		homescreen: {
			title:	chrome.i18n.getMessage("optionsTabHomescreen"),
			dom:	null,
			content: [
				{
					title:		chrome.i18n.getMessage("entryPoints_uc"),
					type:		"checkbox",
					options:	[]
				}
			]
		},
		search: {
			title:	chrome.i18n.getMessage("optionsTabSearch"),
			dom:	null,
			content: [
				{
					title:		chrome.i18n.getMessage("searchIn_uc"),
					type:		"checkbox",
					options:	[]
				}
			]
		},
		info: {
			title:		chrome.i18n.getMessage("optionsTabInfo"),
			dom:	null,
			content: [
				{
					title:	"About nexos",
					type:	"plaintext",
					text:	"Version "+chrome.app.getDetails().version,
					sites: [
						{
							title:	"Website",
							image:	"img/ext-greinr.png",
							url:	"http://www.greinr.com/projects/nexos"
						},
						{
							title:	"Support",
							url:	"https://chrome.google.com/webstore/support/ldobachjdepakfoignnoflcnpbkenicc?hl="+chrome.i18n.getMessage("@@ui_locale")
						},
						{
							title:	"Changelog",
							image:	"img/logo16.png",
							url:	"log.txt"
						}
					]
				},
				{
					title:	chrome.i18n.getMessage("developer_uc"),
					type:	"plaintext",
					text:	"Thomas Greiner",
					sites: [
						{
							title:	"Homepage",
							image:	"img/ext-greinr.png",
							url:	"http://www.greinr.com"
						},
						{
							title:	"@ThomasGreiner",
							image:	"img/ext-twitter.png",
							url:	"https://twitter.com/ThomasGreiner"
						},
						{
							title:	"+Thomas Greiner",
							image:	"img/ext-gplus.png",
							url:	"https://plus.google.com/116243472612414704935/about"
						}
					]
				},
				{
					title:	chrome.i18n.getMessage("otherExtensions_uc"),
					type:	"plaintext",
					sites: [
						{
							title:	"PanicButton",
							image:	"img/ext-panicbutton.png",
							url:	"http://www.greinr.com/extensions/panicbutton"
							//url:	"https://chrome.google.com/webstore/detail/faminaibgiklngmfpfbhmokfmnglamcm"
						},
						{
							title:	"myTab",
							image:	"img/ext-mytab.png",
							url:	"http://www.greinr.com/projects/mytab"
							//url:	"https://chrome.google.com/webstore/detail/alpdogcggfhbnngmbofllomggojkjlom"
						}
					]
				}/*,
				{
					title:		"Version",
					type:	"plaintext",
					text:		chrome.app.getDetails().version
				},
				{
					title:		"Versions",
					type:	"plaintext",
					text:		"0.2\n- added Google Docs\n- added Gmail\n- added badges\n- added welcome-popup\n\n"
								+ "0.1\n- first release\n- options added\n- german added"
				}*/
			]
		}
	}
	
	this.init = function() {
		//init page layout
		document.title = chrome.i18n.getMessage("optionsTitle");
		GET("promobtn").innerText = chrome.i18n.getMessage("author");
		GET("promobtn").addEventListener("click", function() {
			chrome.tabs.create({url:"https://twitter.com/#!/ThomasGreiner"});
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "twitter", "ref:options#promobtn"]);
		}, false);
		GET("headerLogo").addEventListener("click", function() {
			location.href = "main.htm";
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-main", "ref:options#logo"]);
		}, false);
		GET("headerName").addEventListener("click", function() {
			location.href = "main.htm";
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-main", "ref:options#logo"]);
		}, false);
		GET("settings").title = chrome.i18n.getMessage("backToMainPage");
		GET("settings").addEventListener("click", function(e) {
			location.href = "main.htm";
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-main", "ref:options#settings"]);
			e.preventDefault();
		}, false);
		var feedbackUrl = "https://chrome.google.com/webstore/support/ldobachjdepakfoignnoflcnpbkenicc?hl="+chrome.i18n.getMessage("@@ui_locale");
		GET("feedback").parentNode.title = chrome.i18n.getMessage("feedback");
		GET("feedback").parentNode.href = feedbackUrl;
		GET("feedback").addEventListener("click", function(e) {
			chrome.tabs.create({url: feedbackUrl});
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-feedback", "ref:options#feedback"]);
			e.preventDefault();
		}, false);
		/*
		GET("translate").title = chrome.i18n.getMessage("translate");
		GET("translate").addEventListener("click", function(e) {
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-translate", "ref:options#translate"]);
		}, false);
		*/

		window._gaq = window._gaq || [];
		_gaq.push(["_setAccount", "UA-3721290-16"]);
		_gaq.push(["_setSiteSpeedSampleRate", 25]);
		_gaq.push(["_trackPageview"]);
		_gaq.push(["_trackPageLoadTime"]);
		(function() {
			var ga = document.createElement("script");
			ga.type = "text/javascript";
			ga.async = true;
			ga.src = "https://ssl.google-analytics.com/ga.js";
			var s = document.getElementsByTagName("script")[0];
			s.parentNode.insertBefore(ga, s);
		})();

		this.dom.navigation = GET("navigation");
		this.dom.content = GET("content");
		this.dom.box = GET("box");
		
		//init options page
		Configuration.init();
		SourceData.init();
		
		//gather sources
		SourceData.forEach(function(type, id, source) {
			if(source.CONNECTION.method == "default") return;
			
			_options.connections.content.push({
				title:			source.NAME,
				name:		id,
				image:		source.IMAGE,
				type:		"button",
				getText:	function(callback) {
					SourceData.get(this.name).isEnabled(function(isEnabled) {
						if(typeof(callback) == "function") {
							callback((isEnabled) ? chrome.i18n.getMessage("editConnection") : chrome.i18n.getMessage("connect"));
						}
					});
				},
				onclick:		function() {
					var source = SourceData.get(this.name);
					source.isEnabled(function(isEnabled) {
						if(isEnabled) source.editConnectionWithAccount();
						else source.connectToAccount();
					});
				}
			});
		});
		
		Registration.init(function(data) {
			//add connections to page
			//...
		});
		//...
		
		//build
		this.buildNavigation();
		this.buildTab("connections");
		
		Notifications.init(GET("notifications"));
		
		//load external ressources for share buttons
		if(navigator.onLine) {
			this.loadExternalContent("script", "https://platform.twitter.com/widgets.js");
			this.loadExternalContent("script", "https://apis.google.com/js/plusone.js");
			this.loadExternalContent("iframe", [
				"https://www.facebook.com/plugins/like.php",
				"?href=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fldobachjdepakfoignnoflcnpbkenicc",
				"&layout=box_count",
				"&show_faces=true",
				"&width=90",
				"&action=like",
				"&font=arial",
				"&colorscheme=light",
				"&height=90",
				"&locale=en_US"
			].join(""), GET("facebook-like-button"));
		}
	}

	this.refreshRoot = function() {}
	
	this.refreshSources = function() {
		_options.homescreen.content[0].options = [];
		_options.search.content[0].options = [];
		
		SourceData.forEach(function(type, id, source) {
			source.isEnabled(function(isEnabled) {
				if(isEnabled) {
					if(source.IS_LISTABLE) {
						if(source.ENTRY_POINTS) {
							for(var i in source.ENTRY_POINTS) {
								_options.homescreen.content[0].options.push({
									title:		source.ENTRY_POINTS[i].title,
									name:	"entry_"+id+"_"+source.ENTRY_POINTS[i].id,
									image:	source.ENTRY_POINTS[i].image
								});
							}
						} else {
							_options.homescreen.content[0].options.push({
								title:		source.NAME,
								name:	"entry_"+id,
								image:	source.IMAGE
							});
						}
					}
					
					//gather searchable sources
					if(source.IS_SEARCHABLE) {
						_options.search.content[0].options.push({
							title:		source.NAME,
							name:	"search_"+id,
							image:	source.IMAGE
						});
					}
				}
			});
		});
		//...
	}
	
	this.loadExternalContent = function(method, url, parent) {
		switch(method) {
			case "script":
				var s = document.createElement("script");
				s.async = true;
				s.src = url;
				document.body.appendChild(s);
				break;
			case "iframe":
				var i = document.createElement("iframe");
				i.src = url;
				i.scrolling = "no";
				i.frameBorder = "0";
				i.style.border = "none";
				i.style.overflow = "hidden";
				i.style.width = "90px";
				i.style.height = "90px";
				i.allowTransparency = "true";
				parent.appendChild(i);
				break;
		}
	}
	
	this.set = function(name, value) {
		localStorage["option:"+name] = (typeof(value)=="object") ? JSON.stringify(value) : value;
		
		if(_gaq) _gaq.push(["_trackEvent", "Settings", value, name]);
	}
	
	this.get = function(name) {
		var value = localStorage["option:"+name];
		//if(!value) value = Configuration.options[name];
		if(!value) value = "false";
		return value;
	}
	
	this.buildNavigation = function() {
		for(i in _options) {
			var tab = Option.dom.navigation.create("div");
			tab.classList.add("breadcrumb");
			tab.dataset.title = i;
			tab.innerText = _options[i].title;
			tab.onclick = Option.buildTab;
			
			_options[i].dom = tab;
		}
	}
	
	this.buildTab = function(tab) {
		Option.refreshSources();
		
		if(typeof(tab) == "object") {
			tab = tab.srcElement.dataset.title;
		}
		tab = _options[tab];
		
		for(i in _options) {
			_options[i].dom.classList.remove("selected");
		}
		tab.dom.classList.add("selected");
		
		Option.dom.content.innerText = "";
		
		for(i in tab.content) {
			var content = tab.content[i];
			
			var option = Option.dom.content.create("div");
			option.classList.add("group");
			if(content.image) option.style.backgroundImage = "url('"+content.image+"')";
			
			var title = option.create("b");
			title.innerText = content.title;
			
			option.create("br");
			option.create("br");
			
			switch(content.type) {
				case "plaintext":
					var div = option.create("div");
					
					if(content.text) {
						div.innerText = content.text;
						option.create("br");
					}
					
					for(i in content.sites) {
						var ext = option.create("div");
						ext.className = "external-link";

						var icon = ext.create("img");
						icon.src = content.sites[i].image || "chrome://favicon/"+content.sites[i].url;

						var url = content.sites[i].url;
						var link = ext.create("a");
						link.target = "_blank";
						link.href = url + ((url.indexOf("?")==-1)?"?":"&") + "ref=nexos";
						link.innerText = content.sites[i].title;
						link.onclick = function(e) {
							if(_gaq) _gaq.push([
								'_trackEvent',
								'Navigation',
								e.target.href.replace(/^.*:\/\/(.*)\?.*/, "$1"),
								'ref:options#info'
							]);
						}
						ext.create("br");
					}
					break;
				case "select":
					var select = option.create("select");
					select.name = content.name;
					
					for(j in content.options) {
						var opt = select.create("option");
						opt.value = content.options[j].value;
						opt.innerText = content.options[j].title;
					}

					select.value = Option.get(content.name);
					select.onchange = function(e) {
						Option.set(e.srcElement.name, e.srcElement.value);
					}
					break;
				case "checkbox":
					for(j in content.options) {
						var label = option.create("label");
							var opt = label.create("input");
							opt.type = "checkbox";
							opt.name = content.options[j].name;
							opt.checked = (Option.get(content.options[j].name)=="true");
							
							if(content.options[j].image) {
								var image = label.create("img");
								image.className = "option-img"
								image.src = content.options[j].image;
							}
							
							var title = label.create("span");
							title.innerText = content.options[j].title;
						label.onchange = function(e) {
							Option.set(e.srcElement.name, e.srcElement.checked);
						}
						option.create("br");
					}
					break;
				case "button":
					var btn = option.create("button");
					btn.name = content.name;
					btn.onclick = content.onclick;
					content.getText(function(text) {
						btn.innerText = text;
						
						if(text == chrome.i18n.getMessage("connect")) {
							option.classList.add("disabled");
						} else {
							if(content.options) {
								option.create("br");
								option.create("br");
								for(j in content.options) {
									switch(content.options[j].type) {
										case "range":
											var description = option.create("span");
											description.innerText = content.options[j].title+" ";
											var display = option.create("span");
											display.id = content.options[j].name+"_range";
											display.innerText = (localStorage["option:"+content.options[j].name]) ? localStorage["option:"+content.options[j].name]*3 : content.options[j].value*3;
											var units = option.create("span");
											units.innerText = " "+content.options[j].unit;
											
											option.create("br");
											
											var range = option.create("input");
											range.type = "range";
											range.name = content.options[j].name;
											range.value = (localStorage["option:"+content.options[j].name]) ? localStorage["option:"+content.options[j].name] : content.options[j].value;
											range.min = content.options[j].min;
											range.max = content.options[j].max;
											range.onchange = function(e) {
												//change FileSystem space
												//...
												GET(e.srcElement.name+"_range").innerText = e.srcElement.value*3;
												Option.set(e.srcElement.name, e.srcElement.value);
											}
									}
								}
							}
						}
					});
					break;
			}
		}
	}
	
	this.buildRefresh = function() {
		Option.buildTab("connections");
	}
})();
var Main = Option;
document.addEventListener("DOMContentLoaded", Option.init.bind(Option));
