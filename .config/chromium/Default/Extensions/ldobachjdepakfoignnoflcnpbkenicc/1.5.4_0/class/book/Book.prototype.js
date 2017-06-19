/*
Book(BookConfig config) extends Draggable
> boolean selectable													can the Book be selected?
> String source															source of Book
> String chromeid														unique identifier
> String title																title
> String url																URL (except for Chapter)
> String image															image URL
> String size																small, medium, large, image
> String badgeText
> boolean selected														is the Book selected?
> HTMLElement dom													Book representation in DOM tree
- refreshBadgeText()													refresh text on badge
- select()																	add Book to Selection / remove Book from Selection
- cut()																		copy Book to clipboard
- edit(String key, Object value)									replace attribute's value
- archive()																	archive Mark/Chapter to increase Chrome's performance
- update()																	update/refresh Book in DOM tree
- remove()																remove Book from DOM tree
- Book clone()															returns a copy of the Book
- build(String iconSize, boolean  replace, Number pos)	add Book to DOM tree (iconSize: icon, tiny, small, large)
- [abstract] removeBook()											remove Book from Chrome
- [abstract] onClick()													handler for onclick-event
- [abstract] onDblClick()												handler for ondblclick-event

	BookConfig (all optional)
	> String source
	> String chromeid
	> String title
	> String url
	> String image
	> String size
		icon|tiny|small|large|image
*/
var Book = (function(config) {
	this.__proto__ = new Draggable(this);
	
	//apply config
	config = config || {};
	var _source = config.source || "";
	var _chromeid = config.chromeid || config.id || "";
	var _title = config.title || "";
	var _url = config.url || "";
	var _image = config.image || "";
	var _size = config.size || "";
	
	var _selectable = true; //useless?
	var _badgeText = "";
	var _selected = false;
	var _dom = null;
	
	this.__defineGetter__("source", function() {return _source;});
	this.__defineGetter__("chromeid", function() {return _chromeid;});
	this.__defineGetter__("title", function() {return _title;});
	this.__defineGetter__("url", function() {return _url;});
	this.__defineGetter__("image", function() {return _image;});
	this.__defineGetter__("dom", function() {return _dom;});
	this.__defineGetter__("size", function() {return _size;});

	this.__defineSetter__("title", function(title) {_title = title;});
	this.__defineSetter__("url", function(url) {_url = url;});
	this.__defineSetter__("image", function(image) {_image = image;});
	this.__defineSetter__("size", function(size) {_size = size;});
	
	this.refreshBadgeText = function() {
		SourceData.get(_source).getBadgeText(function(text) {
			_badgeText = text;
			if(_badgeText && _dom) {
				var badge = _dom.create("span");
				badge.className = "badge";
				if(SourceData.get(_source).BADGE_COLOR) {
					badge.style.backgroundColor = SourceData.get(_source).BADGE_COLOR;
				}
				badge.innerText = _badgeText;
			}
		});
	}
	
	this.select = function() {
		if(!ISource.HAS_SELECTABLE_ITEMS) return;
		if(!_selectable) return;
		
		if(!Selection.inProgress && KeyHandler.map[16]) {
			Selection.selectTo(Library.elements.indexOf(this));
			return;
		}
		
		_dom.classList.toggle("selected");
		if(!_selected) {
			if(Selection.length == 0) {
				Main.showMenu(false);
				document.getElementById("specific").style.display = "block";
				var b = document.getElementById("all_selection").create("b").innerText = chrome.i18n.getMessage("selection");
			}
			Selection.add(this);
			_selected = true;
		} else {
			if(Selection.length == 1) {
				document.getElementById("all_selection").innerText = chrome.i18n.getMessage("all");
				document.getElementById("specific").style.display = "none";
				Main.showMenu(true);
			}
			Selection.remove(this);
			_selected = false;
		}
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "select"]);
	}
	
	this.cut = function() {
		//copy to clipboard
		for(i in Main.clipboard) {
			Main.clipboard[i].dom.classList.remove("cut");
		}
		Main.clipboard = [this.parentNode.parentNode.book];
		
		//add paste button to general menu
		document.getElementById("pasteButton").style.display = "block";
		
		//apply cut style
		this.parentNode.parentNode.classList.add("cut");
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "cut"]);
	}
	
	this.edit = function(key, value) {
		this[key] = value;
		if(key == "url") {
			_image = "chrome://favicon/"+value;
		}
	}
	
	this.archive = function() {
		//console.log("archive...");
		//save to database
		//Database.insert(this.chromeid, function(tx, rs) {
			//...
		//});
		ISource.exchange(_chromeid, "archive");
		//...
		//remove from bookmarks
		//...
		//rebuild
		//...
		//track event with _gaq
		//...
	}
	
	this.update = function() {
		if(_dom.classList.contains("icon")) iconSize = "icon";
		if(_dom.classList.contains("tiny")) iconSize = "tiny";
		if(_dom.classList.contains("small")) iconSize = "small";
		if(_dom.classList.contains("large")) iconSize = "large";
		this.build(iconSize, true);
		
		//var oldBook = Library.get("chromeid", this.chromeid);
		//Library.replace(oldBook, this);
	}
	
	this.removeBook = function() {
		var _this = this;
		ISource.remove(_chromeid, function() {
			//remove Breadcrumbs
			if(!_url) {
				var inHistory = -1;
				for(i in History.elements) {
					if(History.elements[i].chapter.chromeid == _chromeid) {
						inHistory = i;
						break;
					}
				}
				
				if(inHistory > -1) {
					History.remove(History.elements[inHistory], History.length-inHistory);
					History.cursor = inHistory;
					Main.buildBreadcrumbs();
				}
			}
			
			//remove Book
			_this.remove();
		});
	}
	
	this.remove = function() {
		_dom.remove();
		Library.remove(this);
	}
	
	//... untested if needed
	/*
	this.clone = function() {
		var clone = new Object();
		for(i in this) {
			clone[i] = this[i];
		}
		return clone;
	}
	*/
	
	this.build = function(iconSize, replace, pos, parentElement) {
		_source = _source || SourceData.CURRENT_ID;
		
		_size = _size || iconSize || "small";
		if(!parentElement) parentElement = Main.dom.content;
		var bookType = (_url == "") ? "chapter" : "mark";
		
		var element = (replace) ? _dom.replace("div") : parentElement.create("div",pos);
		element.classList.add("book");
		element.classList.add(_size);
		element.onselectstart = function() {return false;}
		
		//drag&drop
		/*
		var dragBefore = element.create("div");
		dragBefore.className = "drag-before";
		dragBefore.addEventListener("drop", function(e) {
			//...
		}, false);
		var dragHere = element.create("div");
		dragHere.className = "drag-here";
		dragHere.addEventListener("drop", function(e) {
			//...
		}, false);
		var dragAfter = element.create("div");
		dragAfter.className = "drag-after";
		dragAfter.addEventListener("drop", function(e) {
			//...
		}, false);
		*/
		
		//build menu
		if(SourceData.getCurrent().SHOW_MENU) {
			var menu = element.create("menu","div");
				menu.className = "menu";
				var b = menu.create("b");
				if(bookType == "mark") {
					//mark
					b.innerText = chrome.i18n.getMessage("bookmark_uc");
				} else {
					//chapter
					b.innerText = chrome.i18n.getMessage("folder_uc");
				}
				menu.create("br");
				/*
				var archiveBtn = menu.create("archive","button");
				archiveBtn.className = "half";
				archiveBtn.innerText = "archive";
				archiveBtn.onclick = function() {
					element.book.archive();
				}
				*/
				
				var cutBtn = menu.create("cut","button");
				cutBtn.className = "half";
				cutBtn.innerText = chrome.i18n.getMessage("cut");
				cutBtn.onclick = this.cut;
				
				var editBtn = menu.create("edit","button");
				editBtn.className = "half";
				editBtn.innerText = chrome.i18n.getMessage("edit");
				editBtn.onclick = function() {
					FormBuilder.build("edit",(bookType=="chapter")?"folder":"bookmark",this.parentNode.parentNode.book);
				}
				
				var removeBtn = menu.create("remove","button");
				removeBtn.className = "half";
				removeBtn.innerText = chrome.i18n.getMessage("remove");
				if(bookType == "mark") {
					removeBtn.onclick = function() {
						element.book.removeBook();
					}
				} else {
					removeBtn.onclick = function() {
						FormBuilder.build("remove","folder",element.book);
					}
				}
				
				// SHARE TEST
				/*
				var shareBtn = menu.create("share","button");
				shareBtn.className = "full";
				shareBtn.innerText = chrome.i18n.getMessage("share") || "share";
				shareBtn.addEventListener("click", function() {
					Main.share(element.book);
				});
				*/
		}
		
		//build main element
		switch(_size) {
			case "icon":
				element.classList.add(bookType);
				var icon = element.create("icon","img");
				icon.src = "chrome://favicon/"+_url;
				break;
			case "tiny":
				element.classList.add(bookType);
				var icon = element.create("icon","img");
				icon.src = "chrome://favicon/"+_url;
				var link = element.create("link","a");
				link.href = _url || "#";
				if(_url != "") {
					link.onclick = function() {
						//element.book.open("current");
						element.book.open();
						element.book.select();
						return false;
					}
				} else {
					link.onclick = function() {
						element.book.buildChapter();
						element.book.select();
						return false;
					}
				}
				link.innerText = _title || "("+chrome.i18n.getMessage("noTitle")+")";
				break;
			case "small":
				element.classList.add(bookType);
				var icon = element.create("icon","img");
				icon.src = "chrome://favicon/"+_url;
				var link = element.create("link","a");
				link.href = _url || "#";
				if(_url != "") {
					link.onclick = function() {
						//element.book.open("current");
						element.book.open();
						element.book.select();
						return false;
					}
				} else {
					link.onclick = function() {
						element.book.buildChapter();
						element.book.select();
						return false;
					}
				}
				link.innerText = _title || "("+chrome.i18n.getMessage("noTitle")+")";
				
				if(_url != "") {
					var selectBtn = element.create("div");
					selectBtn.className = "select";
					selectBtn.innerText = chrome.i18n.getMessage("openIn")+" >";
					
						var selectNew = selectBtn.create("button");
						selectNew.innerText = chrome.i18n.getMessage("windowNew");
						selectNew.onclick = function() {
							element.book.open("new");
							element.book.select();
						}
						
						var selectIncognito = selectBtn.create("button");
						selectIncognito.innerText = chrome.i18n.getMessage("windowIncognito");
						selectIncognito.onclick = function() {
							element.book.open("incognito");
							element.book.select();
						}
				}
				break;
			case "image":
				if(bookType=="chapter") {
					element.style.backgroundImage = "-webkit-linear-gradient(top, rgba(254,243,147,1) 20%, rgba(255,255,255,0) 100%), url("+_image+")";
				} else {
					if(_title) {
						var back = element.create("div");
						back.classList.add("back");
						back.innerText = _title;
					}
				}
			case "large":
				if(!element.style.backgroundImage) element.style.backgroundImage = "url("+_image+")";
				if(_size != "image" || bookType == "chapter") {
					var link = element.create("link","a");
					link.innerText = _title;
				}
				this.onClick = (_url) ? function() {
					element.book.open();
				} : function() {
					element.book.buildChapter();
				};
				break;
		}
		
		//set handlers
		element.onclick = function(e) {
			if(!e.srcElement.classList.contains("menu") && !e.srcElement.parentNode.classList.contains("menu")) {
				this.book.onClick();
			}
		}
		element.ondblclick = this.onDblClick;
		
		//set references
		element.book = this;
		_dom = element;
		
		//add to library
		//if(parentElement === Main.dom.content) {
			if(!replace) {
				if(typeof(pos) == "number") {
					Library.insert(pos,this);
				} else {
					Library.add(this);
				}
			}
		//}
		
		return element;
	}
	
	this.onClick = function() {};
	this.onDblClick = function() {};
});
