/*
Chapter(BookConfig config) extends Book
- add(Book book)														add Book to Chapter
- buildChapter()
*/
var Chapter = (function(config) {
	this.__proto__ = new Book(config);
	
	this.buildChapter = function(addToHistory) {
		//set source
		SourceData.set(this.source);
		
		var _this = this;
		ISource.hasConnectivity(function(isConnected) {
			if(!isConnected) return;
			
			Main.showMenu(SourceData.getCurrent().SHOW_MENU);
			
			//add to history
			if(addToHistory != false) {
				var inHistory = false;
				for(i in History.elements) {
					if(History.elements[i].chapter.chromeid == _this.chromeid) {
						inHistory = true;
						break;
					}
				}
				
				if(!inHistory) {
					History.add(new Breadcrumb(History.cursor,_this));
				} else {
					History.cursor++;
				}
			}
			Main.buildBreadcrumbs();
			
			if(_this.chromeid == "home" || !SourceData.getCurrent().SHOW_OPTIONS) {
				Main.dom.chapterOptions.style.display = "none";
			} else {
				Main.dom.chapterOptions.style.display = "inline";
			}
			switch(_this.chromeid) {
				case "home":
					Main.build();
					break;
				case "archive":
					//clear content
					while(Library.length > 0) {
						Library.elements[0].remove();
					}
					Main.dom.content.innerText = "";
					
					ISource.getAll(function(tree) {
						var fragment = document.createDocumentFragment();
						for(i in tree) {
							//create book
							var book;
							if(tree[i].url) {
								book = new Mark({
									chromeid:	tree[i].id,
									title:			tree[i].title,
									url:			tree[i].url
								});
							} else {
								book = new Chapter({
									chromeid:	tree[i].id,
									title:			tree[i].title
								});
							}
							
							//display book
							book.build(null, null, null, fragment);
						}
						Main.dom.content.appendChild(fragment);
					});
					break;
				default:
					//clear content
					while(Library.length > 0) {
						Library.elements[0].remove();
					}
					Main.dom.content.innerText = "";
					
					var conn = SourceData.getCurrent().CONNECTION.method;
					
					//show loading indicator
					if(conn != "default") {
						var title = document.createDocumentFragment();
							var icon = title.create("img");
							icon.src = SourceData.getCurrent().IMAGE;
							
							var name = title.create("span");
							name.innerText = SourceData.getCurrent().NAME;
						
						Main.insertSubChapter(title, "small");
					}
					var loading = Main.dom.content.create("img");
					loading.src = "img/loading_circle.gif";
					
					ISource.getChildren(_this.chromeid, function(tree) {
						if(!tree) {
							if(conn != "default") SourceData.getCurrent().connectToAccount();
							Main.insertSubChapter(
								"["+chrome.i18n.getMessage("noConnection")+"]",
								"small",
								true
							);
							loading.parentNode.removeChild(loading);
							return;
						}
						
						//remove loading indicator
						Main.dom.content.innerText = "";
						
						if(conn != "default") {
							var title = document.createDocumentFragment();
								var icon = title.create("img");
								icon.src = SourceData.getCurrent().IMAGE;
								
								var name = title.create("span");
								name.innerText = SourceData.getCurrent().NAME;
								
								var edit = title.create("a");
								edit.href = "#";
								edit.innerText = "["+chrome.i18n.getMessage("editConnection")+"]";
								edit.addEventListener("click", function() {
									SourceData.getCurrent().editConnectionWithAccount();
								});
							
							Main.insertSubChapter(title, "small");
						}

						var fragment = document.createDocumentFragment();
						for(var i=0, len=tree.length; i<len; i++) {
							//create book
							var config = {
								chromeid:	tree[i].id,
								title:			tree[i].title,
								url:			tree[i].url,
								image:		tree[i].image,
								size:			tree[i].size
							}
							var book = (tree[i].url) ? new Mark(config) : new Chapter(config);
							if(SourceData.getCurrent().HIDE_MENU) book.selectable = false;
							
							//display book
							book.build(null, null, null, fragment);
						}
						Main.dom.content.appendChild(fragment);
						
						if(tree.length == 0) {
							Main.insertSubChapter(
								chrome.i18n.getMessage("noItems"),
								"small",
								true
							);
						}
					});
			}
			
			Selection.clear();
		});
	}
	
	if(History.cursor == 1) {
		this.onClick = this.buildChapter;
	} else {
		this.onClick = this.select;
	}
});
