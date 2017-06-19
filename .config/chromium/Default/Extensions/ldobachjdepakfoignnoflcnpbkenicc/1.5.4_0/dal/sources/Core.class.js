/*
Core extends SourcePrototype
*/
(function() {
	var Core = (function(config) {
		var _config = config;
		
		this.getChildren = function(chromeid, callback) {
			var content = chromeid.split(":")[1];
			
			//clear content
			while(Library.length > 0) {
				Library.elements[0].remove();
			}
			Main.dom.content.innerText = "";
			
			var noItem = document.createElement("span");
			noItem.innerText = chrome.i18n.getMessage("noItems")+" ";
			noItem.create("br");
				var options = noItem.create("a");
				options.href = "options.htm";
				options.innerText = "["+chrome.i18n.getMessage("addConnections")+"]";
			
			var isEmpty = true;
			var counter = SourceData.COUNT;

			SourceData.forEach(function(category, name, source) {
				if(!source.CONTENT || !source.hasContent(content)) {
					//check if empty
					if(--counter == 0 && isEmpty) Main.insertSubChapter(noItem, "small", true);
					return;
				}
				
				source.isEnabled(function(isEnabled) {
					if(isEnabled) {
						var title = Main.insertSubChapter(source.NAME, "small");
						var progress = Main.dom.content.create("img");
						progress.src = "img/loading_circle.gif";

						source.getContent(content, function(source, result) {
							title.remove();
							progress.remove();
							if(result && result.length > 0) {
								Main.insertSubChapter(SourceData.get(source).NAME, "small");
								for(var i in result) {
									result[i].source = source;
									var book = (result[i].url) ? new Mark(result[i]) : new Chapter(result[i]);
									book.build();
									isEmpty = false;
								}
							}

							//check if empty
							if(--counter == 0 && isEmpty) Main.insertSubChapter(noItem, "small", true);
						});
					} else {
						//check if empty
						if(--counter == 0 && isEmpty) Main.insertSubChapter(noItem, "small", true);
					}
				});
			});
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "browse", content]);
		}
		
		this.getNotifications = function(callback) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/notifications.json", true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var data = JSON.parse(xhr.responseText);
					callback(data);
				}
			}
			xhr.send();
		}
	});
	
	SourcePrototype.apply(Core, {
		id:				"core",
		name:			"Core", //chrome.i18n...
		image:			"img/core.png",
		connection: {
			type:		"internal",
			method:	"default"
		},
		entryPoints: [
			{
				id:		"core:images",
				title:	chrome.i18n.getMessage("sourceNameImages"),
				image:	"img/images.png"
			},
			{
				id:		"core:audio",
				title:	chrome.i18n.getMessage("sourceNameAudio"),
				image:	"img/audio.png"
			},
			{
				id:		"core:videos",
				title:	chrome.i18n.getMessage("sourceNameVideos"),
				image:	"img/videos.png"
			}
		],
		features: [
			"list",
			"notifications"
		]
	});
})();
