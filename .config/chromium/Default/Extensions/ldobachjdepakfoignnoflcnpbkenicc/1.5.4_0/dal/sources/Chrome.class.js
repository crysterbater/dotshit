/*
ChromeApps extends SourcePrototype
ChromeBookmarks extends SourcePrototype
ChromeHistory extends SourcePrototype
*/
(function() {
	var ChromeApps = (function(config) {
		var _config = config;
		
		this.remove = chrome.management.uninstall;
		this.get = chrome.management.get;
		this.getChildren = function(chromeid, callback) {
			var books = [];
			
			// TODO: should not build books itself -> needs to be extracted
			this.getAll(function(apps) {
				//clear content
				while(Library.length > 0) {
					Library.elements[0].remove();
				}
				Main.dom.content.innerText = "";
				
				if (chromeid == "chromeApps") {
					//add link to Webstore
					var webstore = new Mark({
						title:	chrome.i18n.getMessage("webstoreName"),
						url:	"https://chrome.google.com/webstore"
					});
					webstore.selectable = false;
					webstore.build();
					
					//add filters/sorting
					var groupOffline = new Chapter({
						id: "chromeApps:group:offline",
						title: chrome.i18n.getMessage("chromeApps_groupOffline"),
						size: "tiny"
					});
					groupOffline.build();
					
					var groupBackground = new Chapter({
						id: "chromeApps:group:background",
						title: chrome.i18n.getMessage("chromeApps_groupBackground"),
						size: "tiny"
					});
					groupBackground.build();
					
					var groupRequest = new Chapter({
						id: "chromeApps:group:request",
						title: chrome.i18n.getMessage("chromeApps_groupRequest"),
						size: "tiny"
					});
					groupRequest.build();
					
					var groupBookmarks = new Chapter({
						id: "chromeApps:group:bookmark",
						title: chrome.i18n.getMessage("chromeApps_groupBookmark"),
						size: "tiny"
					});
					groupBookmarks.build();
					
					var groupHistory = new Chapter({
						id: "chromeApps:group:history",
						title: chrome.i18n.getMessage("chromeApps_groupHistory"),
						size: "tiny"
					});
					groupHistory.build();
					
					var groupManagement = new Chapter({
						id: "chromeApps:group:management",
						title: chrome.i18n.getMessage("chromeApps_groupManagement"),
						size: "tiny"
					});
					groupManagement.build();
					
					/*
					var sortUpdate = new Chapter({
						id: "chromeApps:sort:update",
						title: "sort: recent update",
						size: "tiny"
					});
					sortUpdate.build();
					
					var sortAlphabet = new Chapter({
						id: "chromeApps:sort:alphabet",
						title: "sort: alphabetic",
						size: "tiny"
					});
					sortAlphabet.build();
					*/
					
					//Main.showMenu(false);
					
					for (var i in apps) {
						books.push(apps[i]);
					}
				} else {
					var type = chromeid.split(":");
					switch (type[1]) {
						case "group":
							switch (type[2]) {
								case "background":
									for (var i in apps) {
										if (apps[i].permissions.indexOf("background") > -1) {
											books.push(apps[i]);
										}
									}
									break;
								case "bookmark":
									for (var i in apps) {
										if (apps[i].permissions.indexOf("bookmarks") > -1) {
											books.push(apps[i]);
										}
									}
									break;
								case "history":
									for (var i in apps) {
										if (apps[i].permissions.indexOf("history") > -1) {
											books.push(apps[i]);
										}
									}
									break;
								case "management":
									for (var i in apps) {
										if (apps[i].permissions.indexOf("management") > -1) {
											books.push(apps[i]);
										}
									}
									break;
								case "offline":
									//add link to Webstore
									var webstore = new Mark({
										title:	chrome.i18n.getMessage("chromeApps_groupOffline_webstore"),
										url:	"https://chrome.google.com/webstore/category/collection/offline_enabled"
									});
									webstore.selectable = false;
									webstore.build();
									
									for (var i in apps) {
										if (apps[i].isApp && apps[i].offlineEnabled) {
											books.push(apps[i]);
										}
									}
									break;
								case "request":
									for (var i in apps) {
										if (
											apps[i].permissions.indexOf("webRequest") > -1
											|| apps[i].permissions.indexOf("webRequestBlocking") > -1
										) {
											books.push(apps[i]);
										}
									}
									break;
							}
							break;
					}
				}
				
				if (books.length == 0) {
					callback([]);
					return;
				}
				
				var hasApp = false;
				var fragment = document.createDocumentFragment();
				for(var i in books) {
					if (!books[i].isApp) continue;
					
					var app = new App(books[i]);
					app.build("large", null, null, fragment);
					hasApp = true;
				}
				if (hasApp) {
					Main.insertSubChapter(chrome.i18n.getMessage("apps_uc"), "large");
					Main.dom.content.appendChild(fragment);
				}
				
				var hasExt = false;
				var fragment = document.createDocumentFragment();
				for(var i in books) {
					if (books[i].isApp) continue;
					
					var ext = new App(books[i]);
					ext.build("large", null, null, fragment);
					hasExt = true;
				}
				if (hasExt) {
					Main.insertSubChapter(chrome.i18n.getMessage("extensions_uc"), "large");
					Main.dom.content.appendChild(fragment);
				}
			});
		}
		this.getAll = chrome.management.getAll;
		this.launch = chrome.management.launchApp;
		this.toggleEnable = chrome.management.setEnabled
	});

	var ChromeBookmarks = (function(config) {
		var _config = config;
		var _eventHandlers = {};
		
		//get chromeid for Other Bookmarks -> should be replaced with static id when available
		chrome.bookmarks.getTree(function(tree) {
			_config.entryPoints[1].id = tree[0].children[1].id;
			Main.refreshRoot();
		});
		
		this.create = function(parentId, attr, callback) {
			createAttr = {};
			createAttr.parentId = parentId;
			createAttr.title = attr.title;
			createAttr.index = (typeof(attr.index) != "undefined")?attr.index:0;
			if(attr.url) createAttr.url = attr.url;
			
			chrome.bookmarks.create(createAttr, callback);
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "create", "ChromeBookmarks"]);
		}
		
		this.update = function(chromeid, attr, callback) {
			var r = {};
			var counter = 0;
			var destroyAt = 0;
			
			if(attr.title || attr.url) {
				var updateAttr = {}
				if(attr.title) updateAttr.title = attr.title;
				if(attr.url) updateAttr.url = attr.url;
				destroyAt++;
			}
			if(typeof(attr.where) != "undefined") destroyAt++;
			
			//no update
			if(destroyAt == 0) {
				if(callback) callback(r);
				return;
			}
			
			//add event listener
			_eventHandlers.update = function() {
				if(counter == destroyAt) {
					document.removeEventListener("update", _eventHandlers.update);
					
					if(callback) callback(r);
				}
			}
			document.addEventListener("update", _eventHandlers.update);
			
			if(attr.title || attr.url) {
				//chrome.update
				chrome.bookmarks.update(chromeid, updateAttr, function(bookmark) {
					if(attr.title) r.title = bookmark.title;
					if(attr.url) r.url = bookmark.url;
					
					counter++;
					//dispatch event
					var e = document.createEvent("Event");
					e.initEvent("update",true,true);
					document.dispatchEvent(e);
				});
			}
			
			if(typeof(attr.where) != "undefined") {
				var currentIndex;
				for(i in Library.elements) {
					if(Library.elements[i].chromeid == chromeid) {
						currentIndex = i;
						break;
					}
				}
				//chrome.move
				chrome.bookmarks.move(chromeid, {
					parentId:	History.elements[History.cursor-1].chapter.chromeid,
					index:		attr.where+((attr.where > currentIndex)?1:0)
				}, function(bookmark) {
					//console.log("attr.where: "+attr.where+", bookmark.pos: "+bookmark.index);
					r.pos = attr.where;
					//r.pos = bookmark.index;//-((attr.where > currentIndex)?1:0); //Konvertierung funktioniert noch nicht
					
					counter++;
					//dispatch event
					var e = document.createEvent("Event");
					e.initEvent("update",true,true);
					document.dispatchEvent(e);
				});
			}
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "update", "ChromeBookmarks"]);
		}
		
		this.remove = function(chromeid, callback) {
			this.get(chromeid, function(books) {
				if(books[0].url) {
					chrome.bookmarks.remove(chromeid, callback);
				} else {
					chrome.bookmarks.removeTree(chromeid, callback);
				}
			});
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "remove", "ChromeBookmarks"]);
		}
		
		this.get = chrome.bookmarks.get;
		
		this.getContent = function(content, callback) {
			var urlExt;
			switch(content) {
				case "images":
					urlExt = [".bmp", ".gif", ".jpeg", ".jpg", ".png", ".webp"];
					break;
				case "videos":
					urlExt = [".mp4", ".ogv", ".webm"];
					break;
				case "audio":
					urlExt = [".mp3", ".ogg", ".wav"];
					break;
			}
			var books = [];
			var count = urlExt.length;
			var regex = new RegExp("("+urlExt.join("|").replace(".", "\.")+")$");

      //let search run asynchronously to prevent lag
      setTimeout(function() {
			  for(var i in urlExt) {
  				chrome.bookmarks.search(urlExt[i], function(results) {
  					for(var i in results) {
  						if(results[i].url.search(regex) > -1) {
  							books.push({
  								id:		results[i].id,
  								title:		results[i].title,
  								url:		results[i].url,
  								image:	(content != "audio") ? results[i].url : "img/audio.png",
  								size:		"image"
  							});
  						}
  					}
  					if(--count == 0 && callback) callback("chromeBookmarks", books);
  				});
			  }
      }, 100);
		}
		
		this.getChildren = chrome.bookmarks.getChildren;
		
		this.getAll = chrome.bookmarks.getTree;
		
		this.search = function(query, maxResults, callback) {
			chrome.bookmarks.search(query, function(results) {
				results = results.slice(0,maxResults);
				if(callback) callback("chromeBookmarks", results);
			});
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", "ChromeBookmarks"]);
		}
	});

	var ChromeHistory = (function(config) {
		var _config = config;
		
		this.search = function(query, maxResults, callback) {
			chrome.history.search({
				text:				query,
				maxResults:	maxResults
			}, function(results) {
				if(callback) callback("chromeHistory", results);
			});
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", "ChromeHistory"]);
		}
	});
	
	SourcePrototype.apply(ChromeApps, {
		id:				"chromeApps",
		name:			chrome.i18n.getMessage("rootNameAppsExtensions"),//chrome.i18n.getMessage("sourceNameApps"),
		image:			"img/apps.png",
		connection: {
			type:		"internal",
			method:	"default"
		},
		features: [
			"list"
		]
	});
	
	SourcePrototype.apply(ChromeBookmarks, {
		id:				"chromeBookmarks",
		name:			chrome.i18n.getMessage("sourceNameBookmarks"),
		image:			"img/bookmarks.png",
		connection: {
			type:		"internal",
			method:	"default"
		},
		entryPoints: [
			{
				id:		"1",
				title:		chrome.i18n.getMessage("bookmarksBar"),
				image:	"img/bookmarks.png"
			},
			{
				//id:		"", //determined in ChromeBookmarks constructor
				title:		chrome.i18n.getMessage("otherBookmarks"),
				image:	"img/other.png"
			}
		],
		features: [
			"list",
			"search"
		],
		content: [
			"audio",
			"images",
			"videos"
		],
		menu: [
			"create",
			"update",
			"remove"
		],
		switches: [
			"subchapterTitle",
			"selectableItems"
		]
	});
	
	SourcePrototype.apply(ChromeHistory, {
		id:				"chromeHistory",
		name:			chrome.i18n.getMessage("sourceNameHistory"),
		connection: {
			type:		"internal",
			method:	"default"
		},
		features: [
			"search"
		]
	});
})();
