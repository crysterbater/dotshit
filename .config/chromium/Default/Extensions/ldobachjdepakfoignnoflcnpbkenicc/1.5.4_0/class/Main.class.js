/*
Main
> Array<HTMLElement> dom								contains directly addressable HTMLElements in the DOM tree
> Array<Book> clipboard									contains Book(s) for pasting
- init()																constructor
- openAll(String where)										opens all Marks in Library in (current, new, incognito)
- search(HTMLElement searchbox)						search and build search results
- insertSubChapter(String text, String iconSize)	insert category headline
- paste()															paste content of clipboard into current Chapter
- share()
- showMenu(boolean setVisible)
- build()															build root elements
- buildBreadcrumbs()											build Breadcrumbs

	ChapterConfiguration
	> String source
	> String chromeid
	> String title
	> String image
	> boolean Function enabled()
*/
var Main = new (function() {
	var _root = [];
	this.dom = {
		header:				null,
		sidebar:			null,
		content:			null,
		chapterOptions:	null,
		box:					null
	}
	this.clipboard = [];
	
	this.init = function() {
		//init page layout
		document.title = chrome.i18n.getMessage("extName");
		GET("promobtn").innerText = chrome.i18n.getMessage("author");
		GET("promobtn").addEventListener("click", function() {
			chrome.tabs.create({url:'https://twitter.com/#!/ThomasGreiner'});
			if(_gaq) _gaq.push(['_trackEvent', 'Navigation', 'twitter', 'ref:main#promobtn']);
		});
		var searchbox = GET("searchbox");
		searchbox.placeholder = chrome.i18n.getMessage("search_verb");
		searchbox.insertAdjacentText("beforeBegin", chrome.i18n.getMessage("search_verb")+"...");
		searchbox.addEventListener("search", function() {
			Main.search(searchbox);
		});
		// SHARE TEST
		/*
		var shareBtn = GET("shareButton").create("button");
		shareBtn.className = "full";
		shareBtn.innerText = "share"; //chrome.i18n.getMessage("share");
		shareBtn.addEventListener("click", Main.share.bind(Main));
		*/
		var pasteBtn = GET("pasteButton").create("button");
		pasteBtn.className = "full";
		pasteBtn.innerText = chrome.i18n.getMessage("paste");
		pasteBtn.addEventListener("click", Main.paste.bind(Main));
		var createBtns = GET("createButtons");
		createBtns.innerText = chrome.i18n.getMessage("create")+"...";
		createBtns.create("br");
			var createBookmarkBtn = createBtns.create("button");
			createBookmarkBtn.innerText = chrome.i18n.getMessage("bookmark");
			createBookmarkBtn.addEventListener("click", function() {
				FormBuilder.build("add", "bookmark");
			});
			var createFolderBtn = createBtns.create("button");
			createFolderBtn.innerText = chrome.i18n.getMessage("folder");
			createFolderBtn.addEventListener("click", function() {
				FormBuilder.build("add", "folder");
			});
		var openBtns = GET("openButtons");
		openBtns.innerHTML = chrome.i18n.getMessage("openAllIn")+"...";
		openBtns.create("br");
			var openCurrentBtn = openBtns.create("button");
			openCurrentBtn.innerText = chrome.i18n.getMessage("windowCurrent");
			openCurrentBtn.addEventListener("click", function() {
				Main.openAll("current");
			});
			var openNewBtn = openBtns.create("button");
			openNewBtn.innerText = chrome.i18n.getMessage("windowNew");
			openNewBtn.addEventListener("click", function() {
				Main.openAll("new");
			});
			var openIncBtn = openBtns.create("button");
			openIncBtn.innerText = chrome.i18n.getMessage("windowIncognito");
			openIncBtn.addEventListener("click", function() {
				Main.openAll("incognito");
			});
		var specificBtns = GET("specific");
		specificBtns.create("b").innerText = chrome.i18n.getMessage("selection_uc");
		specificBtns.create("br");
			var clearBtn = specificBtns.create("button");
			clearBtn.className = "full";
			clearBtn.innerText = chrome.i18n.getMessage("selectionClear");
			clearBtn.addEventListener("click", function() {
				Selection.clear();
			});
			/*
			var archiveBtn = specificBtns.create("button");
			archiveBtn.className = "fourty";
			archiveBtn.innerText = "archive"; //... chrome.i18n.getMessage("selectionArchive");
			archiveBtn.addEventListener("click", function() {
				Selection.archiveAll();
			});
			*/
			var cutBtn = specificBtns.create("button");
			cutBtn.className = "fourty";
			cutBtn.innerText = chrome.i18n.getMessage("cut");
			cutBtn.addEventListener("click", function() {
				Selection.cutAll();
			});
			var removeBtn = specificBtns.create("button");
			removeBtn.className = "fourty";
			removeBtn.innerText = chrome.i18n.getMessage("remove");
			removeBtn.addEventListener("click", function() {
				Selection.removeAllBooks();
			});
			// SHARE TEST
			/*
			var shareBtn = specificBtns.create("button");
			shareBtn.className = "full";
			shareBtn.innerText = chrome.i18n.getMessage("share") || "share";
			shareBtn.addEventListener("click", function() {
				Main.share(Selection.elements);
			});
			*/
		GET("headerLogo").addEventListener("click", function() {
			History.get(0).navigateTo();
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-main", "ref:main#logo"]);
		}, false);
		GET("headerName").addEventListener("click", function() {
			History.get(0).navigateTo();
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-main", "ref:main#logo"]);
		}, false);
		GET("settings").title = chrome.i18n.getMessage("settings");
		GET("settings").addEventListener("click", function(e) {
			location.href = "options.htm";
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-options", "ref:main#settings"]);
			e.preventDefault();
		}, false);
		var feedbackUrl = "https://chrome.google.com/webstore/support/ldobachjdepakfoignnoflcnpbkenicc?hl="+chrome.i18n.getMessage("@@ui_locale");
		GET("feedback").parentNode.title = chrome.i18n.getMessage("feedback");
		GET("feedback").parentNode.href = feedbackUrl;
		GET("feedback").addEventListener("click", function(e) {
			chrome.tabs.create({url: feedbackUrl});
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-feedback", "ref:main#feedback"]);
			e.preventDefault();
		}, false);
		/*
		GET("translate").title = chrome.i18n.getMessage("translate");
		GET("translate").addEventListener("click", function(e) {
			if(_gaq) _gaq.push(["_trackEvent", "Navigation", "goto-translate", "ref:main#translate"]);
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

		this.dom.header = GET("header");
		this.dom.header.navigation = GET("navigation");
		this.dom.sidebar = GET("sidebar");
		this.dom.content = GET("content");
		this.dom.chapterOptions = GET("chapterOptions");
		this.dom.box = GET("box");
		
		//add root node
		var homeChapter = new Chapter({
			source:		"core",
			chromeid:	"home",
			title:			">"
		});
		History.add(new Breadcrumb(0, homeChapter));
		
		Main.buildBreadcrumbs();
		
		//add entry points
		Configuration.init();
		SourceData.init();
		Main.refreshRoot();

		//handle connection changes
		window.addEventListener("online", function() {
			if(History.cursor == 1) Main.build();
		}, false);
		window.addEventListener("offline", function() {
			if(History.cursor == 1) Main.build();
		}, false);
		
		//MainDropzone.init();
		/*
		reactivate Dropzone:
		 - remove above comment
		 - remove comment around <div> in main.htm
		 - remove comment around right-attribute of #content in style.css
		*/
		
		//show welcome message
		if(!localStorage["welcome"]) {
			FormBuilder.build("welcome", null, null);
			localStorage["welcome"] = true;
		}
		
		//init selection rectangle
		MouseHandler.register({
			down: function(x, y) {
				//draw selection rectangle
				//...
			},
			move: function(x, y) {
				//redraw selection rectangle
				//...
			},
			up: function(x, y) {
				//select books in selection rectangle (depending on if CTRL key is down)
				//...
			}
		});
		
		Notifications.init(GET("notifications"));
	}

	this.refreshRoot = function() {
		_root = [];
		SourceData.forEach(function(type, id, source) {
			if(!source.IS_LISTABLE) return;
			
			if(source.ENTRY_POINTS) {
				for(var i in source.ENTRY_POINTS) {
					var entryPoint = source.ENTRY_POINTS[i];
					if(localStorage["option:entry_"+id+"_"+entryPoint.id] == "true") {
						_root.push({
							source:		id,
							chromeid:	entryPoint.id,
							title:			entryPoint.title,
							image:		entryPoint.image
						});
					}
				}
			} else {
				if(localStorage["option:entry_"+id] == "true") {
					_root.push({
						source:		id,
						chromeid:	id,
						title:			source.NAME,
						image:		source.IMAGE
					});
				}
			}
		});
		if(Main.dom.content) Main.build();
	}
	
	this.openAll = function(where) {
		var list;
		if(Selection.length > 0) {
			list = Selection;
		} else {
			list = Library;
		}
		
		if(list.length > 10) {
			var counter = 0;
			for(i in list.elements) {
				if(list.elements[i].url != "") counter++;
			}
			var answer = confirm(chrome.i18n.getMessage("warningOpenTabs", [counter]));
			if(!answer) return;
		}
		
		if(where=="current") {
			for(i in list.elements) {
				if(list.elements[i].url != "") {
					list.elements[i].open(where);
				}
			}
		} else {
			var tabs = [];
			var j = 0;
			for(i in list.elements) {
				if(list.elements[i].url != "") {
					tabs[j++] = list.elements[i].url;
				}
			}
			
			chrome.windows.create({
				url: 			tabs,
				incognito:	(where=="incognito")
			});
		}
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "open", "all"]);
	}
	
	this.search = function(searchbox) {
		if(searchbox.value == "") {
			History.elements[History.cursor-1].chapter.buildChapter(false);
		} else {
			//clear content
			while(Library.length > 0) {
				Library.elements[0].remove();
			}
			Main.dom.content.innerText = "";
			
			SourceData.searchAll(searchbox.value, function(source, result) {
				if(!result || result.length == 0) {
					//search finished
					return;
				}
				
				if(SourceData.get(source).IMAGE) {
					var sourceTitle = document.createDocumentFragment();
					var sourceIcon = sourceTitle.create("img");
					sourceIcon.src = SourceData.get(source).IMAGE;
					var sourceName = sourceTitle.create("span");
					sourceName.innerText = SourceData.get(source).NAME;
					Main.insertSubChapter(sourceTitle, "small");
				} else {
					Main.insertSubChapter(SourceData.get(source).NAME, "small");
				}
				
				for(var i in result) {
					result[i].source = source;
					var book = (result[i].url) ? new Mark(result[i]) : new Chapter(result[i]);
					book.build();
				}
			});
		}
	}
	
	this.insertSubChapter = function(text,iconSize,noStyle) {
		var element = this.dom.content.create("div");
		if(!noStyle) element.classList.add("subchapter");
		if(iconSize != "large") element.classList.add("nofloat");
		
		switch(typeof(text)) {
			case "string":
				element.innerText = text;
				break;
			case "object":
				element.appendChild(text);
				break;
		}

		return element;
	}
	
	this.paste = function() {
		var inLibrary = true;
		var counter = Main.clipboard.length;
		
		//get from clipboard
		for(i in Main.clipboard) {
			var book = Main.clipboard[i];
			
			if(Library.elements.indexOf(book) == -1) {
				inLibrary = false;
				ISource.update(book.chromeid, {
					parentId:	History.elements[History.cursor-1].chapter,
					where:		Library.length
				}, function() {
					counter--;
					
					if(counter == 0) {
						for(j in Main.clipboard) {
							Main.clipboard[j].build();
						}
						
						//remove from clipboard
						Main.clipboard = [];
					}
				});
			} else {
				book.dom.classList.remove("cut");
			}
		}
		
		if(inLibrary) {
			//remove from clipboard
			Main.clipboard = [];
		}
		
		//remove paste button from general menu
		GET("pasteButton").style.display = "none";
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "paste"]);
	}
	
	this.share = function(books) {
		if(!(books instanceof Array)) books = [books];

		if(books.length == 1) {
			//share url
			//...
		} else {
			var data = [];
			for(var i in books) {
				data.push({
					id:		books[i].chromeid,
					title:	books[i].title,
					url:	books[i].url,
					size:	books[i].size,
					source:	books[i].source,
					image:	books[i].image,
					type:	(books[i].url) ? "mark" : "chapter"
				});
			}
			console.log("share", data);
			
			/*
			//get url from extensions-hub.appspot.com
			var params = "action=share&data="+encodeURIComponent(JSON.stringify(data));
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "https://extensions-hub.appspot.com/extensionhub", true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var data = JSON.parse(xhr.responseText);
					console.log(data);

					//share url
					//...
				}
			}
			xhr.send(params);
			*/
			
			// SHARE TEST
			/*
			var params = "callback=Main.onShared&data="+encodeURIComponent(JSON.stringify(data));
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "http://localhost:8080/api/nexos/share.json?"+params;
			s.onload = function() {
				document.head.removeChild(s);
			}
			document.head.appendChild(s);
			*/
		}
	}
	
	/*
	this.onShared = function(data) {
		console.log("success", data);
	}
	*/

	this.showMenu = function(setVisible) {
		if(typeof(setVisible)=="undefined") setVisible = !this.dom.content.classList.contains("showmenu");

		if(setVisible) this.dom.content.classList.add("showmenu");
		else this.dom.content.classList.remove("showmenu");
	}
	
	this.build = function() {
		//clear content
		while(Library.length > 0) {
			Library.elements[0].remove();
		}
		Main.dom.content.innerText = "";
		
		var noEntryPoints = document.createElement("span");
		noEntryPoints.innerText = chrome.i18n.getMessage("noEntryPoints")+" ";
		noEntryPoints.create("br");
			var options = noEntryPoints.create("a");
			options.href = "options.htm";
			options.innerText = "["+chrome.i18n.getMessage("addEntryPoints")+"]";
		
		var isEmpty = true;
		var counter = SourceData.COUNT;
		
		var element;
		for(var i in _root) {
			element = _root[i];
			
			SourceData.get(element.source).isEnabled(function(isEnabled) {
				if(!isEnabled) {
					if(--counter && isEmpty) Main.insertSubChapter(noEntryPoints, "small", true);
					return;
				}
				
				var chapter = new Chapter({
					source:		element.source,
					chromeid:	element.chromeid,
					title:			element.title,
					image:		element.image
				});
				chapter.build("large");
				isEmpty = false;
				
				SourceData.get(element.source).hasConnectivity(function(isConnected, attr) {
					if(!isConnected) {
						attr.chapter.dom.classList.add("disabled");
					} else {
						attr.chapter.refreshBadgeText();
					}
				}, {
					chapter: chapter
				});
			});
		}
	}
	
	this.buildBreadcrumbs = function() {
		//clear content
		Main.dom.header.navigation.innerText = "";
		
		for(i in History.elements) {
			History.elements[i].build();
		}
	}
	
	this.buildRefresh = function() {
		History.get("pos",1)[0].chapter.buildChapter(false);
	}
})();
document.addEventListener("DOMContentLoaded", Main.init.bind(Main));
