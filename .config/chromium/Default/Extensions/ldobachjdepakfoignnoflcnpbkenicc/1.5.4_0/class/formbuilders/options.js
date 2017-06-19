/*
FormBuilder
- Object data
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
		
		if(book.title) this.form = new Form(Option.dom.box, book.title);
		else if(action && item) this.form = new Form(Option.dom.box, item.substr(0,1).toUpperCase()+item.substr(1));
		
		switch(action) {
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
						if(book.url != "") {
							var launchBtn = left.create("button");
							launchBtn.className = "half";
							launchBtn.innerText = chrome.i18n.getMessage("launch");
							launchBtn.onclick = book.launch;
						} else if(book.options) {
							var optionsBtn = left.create("button");
							optionsBtn.className = "half";
							optionsBtn.innerText = chrome.i18n.getMessage("options");
							optionsBtn.onclick = function() {
								chrome.tabs.create({url:book.options});
							}
						}
				
						var toggleEnableBtn = left.create("button");
						toggleEnableBtn.className = "half";
						toggleEnableBtn.innerText = chrome.i18n.getMessage((book.enabled)?"disable":"enable");
						toggleEnableBtn.onclick = book.toggleEnable;
						
						var uninstallBtn = left.create("button");
						uninstallBtn.className = "full";
						uninstallBtn.innerText = chrome.i18n.getMessage("uninstall");
						uninstallBtn.onclick = function() {
							book.uninstall();
							FormBuilder.destroy();
						}
					}
				
				var middle = box.create("div");
				middle.className = "column";
					
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
					}
					
					if(showDescr) {
						var description = middle.create("span");
						description.className = "smallText";
						description.innerText = book.description;
					}
				
				var right = box.create("div");
				right.className = "column";
					
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
						featuresTitle.innerText = chrome.i18n.getMessage("features")+":";
						
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
					permissionsTitle.innerText = chrome.i18n.getMessage("permissions")+":";
					
					right.create("br");
					
					for(i in book.permissions) {
						var permission = right.create("span");
						permission.className = "list-item smallText";
						permission.innerText = book.permissions[i].replace("http://","");
						
						right.create("br");
					}
				
				
				if(item=="app") {
					this.form.setSubmit("back", false, FormBuilder.destroy);
					
					var visit = box.create("a");
					visit.target = "_blank";
					visit.href = "https://chrome.google.com/webstore/detail/"+book.chromeid;
					visit.innerText = chrome.i18n.getMessage("visitOnWebstore");
				} else {
					if(item=="source:edit") {
						this.form.setSubmit(chrome.i18n.getMessage("disconnect"), true, function() {
							book.callback(function() {
								Option.buildTab("connections");
								FormBuilder.destroy();
							});
						});
					} else if(item=="source:connect") {
						this.form.setSubmit(chrome.i18n.getMessage("connect"), false, function() {
							book.callback(function() {
								Option.buildTab("connections");
								FormBuilder.destroy();
							});
						});
						
						var cancel = box.create("a");
						cancel.innerText = chrome.i18n.getMessage("cancel");
						cancel.href = "#";
						cancel.addEventListener("click", function() {
							if(typeof(History) != 'undefined') {
								History.get('pos',1)[0].remove();
							}
							FormBuilder.destroy();
						})
					}
				}
				break;
		}
		
		if(_gaq) _gaq.push(["_trackEvent", "Dialogues", action, "options-"+item]);
	}
})();
