/*
FormBuilder
> Form form
> HTMLElement dialogue
> String action
> String item
- destroy()
- build(String action, String item, Book book)
*/
var FormBuilder = new (function() {
	this.form = null;
	this.dialogue = null;
	this.action = "";
	this.item = "";
	
	this.destroy = function() {
		FormBuilder.dialogue.classList.remove(FormBuilder.action);
		FormBuilder.dialogue.classList.remove(FormBuilder.item);
		FormBuilder.form = FormBuilder.form.destroy();
		FormBuilder.dialogue.style.display = "none";
	}
	
	this.sourceToBook = function(source, callback) {
		return {
			source: source,
			title: source.NAME,
			image: source.IMAGE,
			description: source.DESCRIPTION,
			permissions: source.PERMISSIONS,
			features: source.FEATURES,
			content: source.CONTENT,
			callback: callback
		}
	}
	
	this.build = function(action, item, book) {
		this.action = action;
		this.item = item;
		
		this.dialogue = document.getElementById("dialogue");
		this.dialogue.style.display = "inline";
		this.dialogue.classList.add(action);
		this.dialogue.classList.add(item);
		
		var title = (book && book.title) ? book.title : chrome.i18n.getMessage(action+(item && item.substr(0,1).toUpperCase()+item.substr(1)));
		if(book && book.version) {
			title += " (v"+book.version+")";
		}
		if(action && item) this.form = new Form(Main.dom.box, title);
		
		switch(action) {
			case "add":
				this.form.addAttribute(chrome.i18n.getMessage("name"));
				this.form.addField("text", "title", "", {
					autofocus: true,
					required: true,
					placeholder: "my "+item.substr(0,1).toUpperCase()+item.substr(1)
				},function() {
					return !(this.value=="");
				});
				if(item == "bookmark") {
					this.form.addAttribute("URL...");
					this.form.addField("url", "url", "", {
						required: true,
						placeholder: "http://www.google.com"
					}, function() {
						return !(this.value=="");
					});
				}
				
				this.form.addAttribute(chrome.i18n.getMessage("where"));
				var whereOptions = [
					{
						text: chrome.i18n.getMessage("atTheBeginning"),
						value: -1
					},
					{
						text: chrome.i18n.getMessage("atTheEnd"),
						value: Library.length-1
					},
					"hr"
				];
				for(i in Library.elements) {
					if(i != Library.elements.length-1) {
						whereOptions[whereOptions.length] = {
							text: chrome.i18n.getMessage("after")+" | "+Library.elements[i].title.substr(0,40)+((Library.elements[i].title.length>40)?"...":""),
							value: i
						}
					}
				}
				this.form.addField("select", "where", whereOptions,{});
				
				this.form.setSubmit(chrome.i18n.getMessage("add"), true, function() {
					var url = "";
					if(FormBuilder.form.data.url) {
						url = FormBuilder.form.data.url.value;
						if(url.search("://") == -1) url = "http://"+url;
					}
					var pos = FormBuilder.form.data.where.value*1+1;
					
					ISource.create(
						History.elements[History.cursor-1].chapter.chromeid,
						{
							index: pos,
							title: FormBuilder.form.data.title.value,
							url: url
						}, function(bookmark) {
							var book;
							if(FormBuilder.form.data.url) {
								book = new Mark({
									chromeid: bookmark.id,
									title: FormBuilder.form.data.title.value,
									url: url
								});
							} else {
								book = new Chapter({
									title: FormBuilder.form.data.title.value
								});
							}
							book.build("small", false, pos);
							FormBuilder.destroy();
					});
				});
				break;
			case "edit":
				this.form.addAttribute(chrome.i18n.getMessage("name"));
				this.form.addField("text","title",book.title,{
					autofocus: true
				}, function() {
					return !(this.value=="");
				});
				
				if(item == "bookmark") {
					this.form.addAttribute("URL...");
					this.form.addField("url","url",book.url,{}, function() {
						return !(this.value=="");
					});
				}
				
				this.form.addAttribute(chrome.i18n.getMessage("where"));
				var whereOptions = [
					{
						text: chrome.i18n.getMessage("atTheBeginning"),
						value: -1
					},
					{
						text: chrome.i18n.getMessage("atTheEnd"),
						value: Library.length-2
					},
					"hr"
				];
				j = 0;
				for(i in Library.elements) {
					if(i != Library.elements.length) {
						if(Library.elements[i] != book) {
							whereOptions[whereOptions.length] = {
								text: chrome.i18n.getMessage("after")+" | "+Library.elements[i].title.substr(0,40)+((Library.elements[i].title.length>40)?"...":""),
								value: j
							}
							j++;
						}
					}
				}
				this.form.addField("select","where",whereOptions,{
					value: Library.elements.indexOf(book)-1
				});
				
				this.form.setSubmit(chrome.i18n.getMessage("save"), true, function() {
					//what needs to be changed?
					var toUpdate = {}
					if(FormBuilder.form.data.title.value != book.title) toUpdate.title = FormBuilder.form.data.title.value;
					if(FormBuilder.form.data.url)
						if(FormBuilder.form.data.url.value != book.url) {
							toUpdate.url = FormBuilder.form.data.url.value;
							if(toUpdate.url.search("://") == -1) toUpdate.url = "http://"+toUpdate.url;
						}
					if(FormBuilder.form.data.where.value*1+1 != Library.elements.indexOf(book)) toUpdate.where = FormBuilder.form.data.where.value*1+1;
					
					ISource.update(book.chromeid, toUpdate, function(changes) {
						if(changes.title) book.edit("title", changes.title);
						if(changes.url) book.edit("url", changes.url);
						book.update();
						
						if(typeof(changes.pos) != "undefined") {
							book.remove();
							book.build("small",false,changes.pos);
						}
						
						FormBuilder.destroy();
					});
				});
				break;
			case "remove":
				var box = document.getElementById("box");
				box.book = book;
				
				box.create("br");
				var warning = box.create("span");
				warning.className = "smallText warning";
				warning.innerText = chrome.i18n.getMessage("warningAllBookmarks");
				box.create("br");
				box.create("br");
				
				var yesBtn = box.create("button");
				yesBtn.className = "half";
				yesBtn.innerText = chrome.i18n.getMessage("remove");
				yesBtn.onclick = function() {
					switch(item) {
						case "folder":
							book.removeBook();
							break;
						case "selection":
							for(i in Selection.elements) {
								Selection.elements[i].removeBook();
							}
							Selection.clear();
							break;
					}
					FormBuilder.destroy();
				}
				
				var noBtn = box.create("button");
				noBtn.className = "half";
				noBtn.innerText = chrome.i18n.getMessage("cancel");
				noBtn.onclick = FormBuilder.destroy;
				break;
			case "info":
				var box = document.getElementById("box");
				box.create("br");
				box.book = book;
				
				var left = box.create("div");
				left.className = "column";
					left.create("br");
					
					var imgContainer = left.create("div");
					imgContainer.className = "center";
					
						var img = imgContainer.create("img");
						img.src = book.image;
					
					left.create("br");
					left.create("br");
					
					if(item=="app") {
						var hasSecondBtn = false;
						
						if(book.url != "") {
							var launchBtn = left.create("button");
							launchBtn.className = "half";
							launchBtn.innerText = chrome.i18n.getMessage("launch");
							launchBtn.onclick = book.launch;
							
							hasSecondBtn = true;
						} else if(book.options) {
							var optionsBtn = left.create("button");
							optionsBtn.className = "half";
							optionsBtn.innerText = chrome.i18n.getMessage("options");
							optionsBtn.onclick = function() {
								if(book.enabled) {
									chrome.tabs.create({url:book.options});
								} else {
									if(confirm(chrome.i18n.getMessage("enableForOptions"))) {
										toggleEnableBtn.innerText = chrome.i18n.getMessage((!book.enabled)?"disable":"enable");
										book.toggleEnable();
										chrome.tabs.create({url:book.options});
									}
								}
							}
							
							hasSecondBtn = true;
						}
				
						var toggleEnableBtn = left.create("button");
						toggleEnableBtn.className = (hasSecondBtn) ? "half" : "full";
						toggleEnableBtn.innerText = chrome.i18n.getMessage((book.enabled)?"disable":"enable");
						toggleEnableBtn.onclick = (function() {
							toggleEnableBtn.innerText = chrome.i18n.getMessage((!book.enabled)?"disable":"enable");
							book.toggleEnable();
						}).bind(this);
						
						var uninstallBtn = left.create("button");
						uninstallBtn.className = "full";
						uninstallBtn.innerText = chrome.i18n.getMessage("uninstall");
						uninstallBtn.onclick = function() {
							book.uninstall();
							FormBuilder.destroy();
						}
					}
				
				var middle = box.create("div");
				middle.className = "scrollable column";
				
					var showDescr = true;
					
					if(item=="source:edit") {
						//show profile info
						var profile = middle.create("div");
						
						var img = profile.create("div");
						img.className = "profile-image";
							
						var name = profile.create("div");
						name.className = "profile-name smallText";
						
						var nameTitle = name.create("div");
						nameTitle.innerText = chrome.i18n.getMessage("loading")+"...";
						
						profile.create("br");
						profile.create("br");
						
						book.source.getProfileInfo(function(info) {
							if(info) {
								img.style.backgroundImage = "url("+(info.image || book.image)+")";
								
								nameTitle.innerText = chrome.i18n.getMessage("connectedAs");
								
								var nameText = name.create("a");
								nameText.title = info.name;
								nameText.target = "_blank";
								if(info.url) nameText.href = info.url;
								nameText.innerText = info.name;
							} else {
								middle.removeChild(profile);
							}
						});
						
						//if has options
						/*
							//show source-specific options
							middle.create("b").innerText = "Options";
							middle.create("br");
							
							var options = middle.create("div");
							options.className = "smallText";
							options.innerText = "[OPTIONS]";
							
							showDescr = false;
						*/
					} else if(item=="source:reconnect") {
						var warning = middle.create("span");
						warning.className = "warning";
						warning.innerText = chrome.i18n.getMessage("warningConnectionExpired");
						
						showDescr = false;
					}
					
					if(showDescr) {
						var description = middle.create("span");
						description.className = "smallText";
						description.innerText = book.description;
					}
				
				var right = box.create("div");
				right.className = "scrollable column";
					
					if(item=="source:connect" || item=="source:edit") {
						//content
						if(book.content && book.content.length > 0) {
							var contentTitle = right.create("b");
							contentTitle.innerText = chrome.i18n.getMessage("contents")+":";

							right.create("br");

							for(var i in book.content) {
								var content = right.create("span");
								content.className = "list-item smallText";
								content.innerText = chrome.i18n.getMessage(book.content[i]);

								right.create("br");
							}

							right.create("br");
						}
						
						//features
						var featuresTitle = right.create("b");
						featuresTitle.innerText = chrome.i18n.getMessage("features");
						
						right.create("br");
						
						for(var i in book.features) {
							var feature = right.create("span");
							feature.className = "list-item smallText";
							feature.innerText = chrome.i18n.getMessage(book.features[i]);
							
							right.create("br");
						}
						
						right.create("br");
					}
					
					//permissions
					var permissionsTitle = right.create("b");
					permissionsTitle.innerText = chrome.i18n.getMessage("permissions");
					
					right.create("br");
					
					var hasPerm = false;
					if(book.permissions.length > 0) {
						var hasHostPerm = false;
						var hostPerm = [];
						
						for(var i in book.permissions) {
							var perm = book.permissions[i];
							if(perm.search(/^chrome:\/\//) > -1) continue;
							if(perm.search("://") > -1) hasHostPerm = true;
							if(perm=="<all_urls>") perm = "allurls";
							
							if(hasHostPerm) {
								hostPerm.push(perm);
							} else {
								var permission = right.create("span");
								permission.className = "list-item smallText";
								permission.innerText = (chrome.i18n.getMessage("permission_"+perm) || perm);
								
								right.create("br");
							}

							hasPerm = true;
						}
						
						if(hasHostPerm) {
							var permission = right.create("span");
							permission.className = "smallText";
							permission.title = hostPerm.join("\n");
							permission.innerText = "> "+(
								(hostPerm.length == 1) ?
								chrome.i18n.getMessage("permission_accessWebsite")
								: chrome.i18n.getMessage("permission_accessWebsites", [hostPerm.length])
							);
						}
					}

					if(!hasPerm) {
						var noPermission = right.create("span");
						noPermission.className = "smallText";
						noPermission.innerText = chrome.i18n.getMessage("none");
					}
				
				
				if(item=="app") {
					this.form.setSubmit(chrome.i18n.getMessage("back"), false, FormBuilder.destroy);
					
					var visit = box.create("a");
					visit.target = "_blank";
					visit.href = "https://chrome.google.com/webstore/detail/"+book.chromeid;
					visit.innerText = chrome.i18n.getMessage("visitOnWebstore");
				} else {
					if(item=="source:edit") {
						this.form.setSubmit(chrome.i18n.getMessage("disconnect"), true, function() {
							book.callback();
							
							History.remove(History.get("pos",1)[0], History.length-1);
							History.get("pos",0)[0].chapter.buildChapter(false);
							
							FormBuilder.destroy();
						});
					} else  if(item=="source:connect" || item=="source:reconnect") {
						this.form.setSubmit(chrome.i18n.getMessage(item.replace(/^source:(.+)$/, "$1")), false, function() {
							book.callback();
							
							FormBuilder.destroy();
						});
						
						var cancel = box.create("a");
						cancel.innerText = chrome.i18n.getMessage("cancel");
						cancel.href = "#";
						cancel.addEventListener("click", function() {
							if(typeof(History) != "undefined") {
								if(item=="source:reconnect") {
									History.setCursor(History.length-1);
									History.get("pos", History.length-2)[0].chapter.buildChapter(false);
								} else {
									History.get("pos",1)[0].remove();
								}
							}
							FormBuilder.destroy();
						});
					}
				}
				break;
			case "welcome":
				this.form = new Form(Main.dom.box, "");
				this.form.dom.style.textAlign = "center";
				
				var logo = this.form.dom.create("div");
				logo.style.height = "210px";
					var img = logo.create("img");
					img.src = "img/logo_title.png";
					img.style.width = "auto";
				
				//create tutorial elements
				var tutorial = [];
				
				function createTutorialElement(id, pos) {
					var element = document.getElementById(id);
					
					var div = element.parentNode.create("div");
					div.className = "tutorial";
					div.innerText = chrome.i18n.getMessage("tutorial_"+id);
					
					switch(pos) {
						case "left":
							div.style.borderRight = "5px solid #AAA";
							div.style.top = element.offsetTop;
							div.style.left = element.offsetLeft-div.offsetWidth-8;
							break;
						case "right":
							div.style.borderLeft = "5px solid #AAA";
							div.style.top = element.offsetTop;
							div.style.left = element.offsetLeft+element.offsetWidth;
							break;
						case "bottom":
							div.style.borderTop = "5px solid #AAA";
							div.style.top = element.offsetTop+element.offsetHeight;
							div.style.left = element.offsetLeft;
							break;
					}
					
					tutorial.push(div);
				}
				
				setTimeout(function() {
					createTutorialElement("navigation", "bottom");
					createTutorialElement("searchbox", "right");
					createTutorialElement("settings", "left");
				}, 100);
				
				this.form.setSubmit(chrome.i18n.getMessage("continue"), false, function() {
					//localStorage["welcome"] = "dismissed";
					
					for(var i in tutorial) {
						tutorial[i].parentNode.removeChild(tutorial[i]);
					}
					
					FormBuilder.destroy();
				});
				break;
			case "notification":
				this.form = new Form(Main.dom.box, "");
				
				var content = this.form.dom.create("div");
				content.innerHTML = book.content;
				
				this.form.setSubmit(chrome.i18n.getMessage("dismiss"), true, function() {
					FormBuilder.destroy();
				});
				break;
		}
		
		if(_gaq) _gaq.push(["_trackEvent", "Dialogues", action, "main-"+item]);
	}
})();
