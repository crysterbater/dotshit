/*
GoogleDrive extends OAuth
*/
(function() {
	var GoogleDrive = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			GoogleDrive.prototype.hasConnectivity(callback, attr, "https://docs.google.com");
		}

		this.getContent = function(content, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			var books = [];
			var types = [];
			var placeholder;
			switch(content) {
				case "audio":
					types = [
						"audio/mpeg"
					];
					placeholder = "img/audio.png";
					break;
				case "images":
					types = [
						//"drawing",
						"image/jpeg",
						"image/png",
						"image/webp",
						"image/gif"
					];
					break;
				case "videos":
					types = [
						"video/webm",
						"video/mp4",
						"video/ogg"
					];
					break;
			}
			
			var query = [];
			for(var i in types) {
				query.push("type:"+types[i]);
			}

			var parameters = {
				method:	"GET",
				parameters: {
					"alt":		"json",
					"v":		"3",
					//"fields":	"entry(link(@href),title(text()))", //not supported yet
					"q":		query.join(" OR ")
				}
			}

			this.oauth.sendSignedRequest("https://docs.google.com/feeds/default/private/full", function(data) {
				data = JSON.parse(data);
				var item;
				var link;
				var image;
				for(i in data.feed.entry) {
					item = data.feed.entry[i];
					link = "";
					image = placeholder || "";
					for(j in item.link) {
						if(item.link[j].rel == "alternate") {
							link = item.link[j].href;
						}
						else if(!placeholder && item.link[j].rel == "http://schemas.google.com/docs/2007/thumbnail") {
							image = item.link[j].href;
						}
					}
					
					books.push({
						id:		item.gd$etag,
						title:	item.title.$t,
						url:	link,
						image:	image,
						size:	"image"
					});
				}

				if(callback) callback("gdocs", books);
			}, parameters);
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			var books = [];
			if(chromeid=="gdocs") {
				books = [
					{
						id:	"gdocs:root:starred",
						title:	chrome.i18n.getMessage("gdocs_starred")
					},
					{
						id:	"gdocs:root:folder",
						title:	chrome.i18n.getMessage("gdocs_collections")
					},
					{
						id:	"gdocs:root:document",
						title:	chrome.i18n.getMessage("gdocs_documents")
					},
					{
						id:	"gdocs:root:spreadsheet",
						title:	chrome.i18n.getMessage("gdocs_spreadsheets")
					},
					{
						id:	"gdocs:root:presentation",
						title:	chrome.i18n.getMessage("gdocs_presentations")
					},
					{
						id:	"gdocs:root:drawing",
						title:	chrome.i18n.getMessage("gdocs_drawings")
					}
				];
			}
			
			var url = "";
			var type = chromeid.replace(/^gdocs:(.+?):.*$/,"$1");
			switch(type) {
				case "gdocs":
					url = "https://docs.google.com/feeds/default/private/full/folder%3Aroot/contents";
					break;
				case "root":
					url = "https://docs.google.com/feeds/default/private/full/-/"+chromeid.substr(11);
					//fields = "entry(link(@rel,@href),title(text()),gd:resourceId(text()),gd:etag)";
					break;
				case "folder":
					url = "https://docs.google.com/feeds/default/private/full/folder%3A"+chromeid.substr(13)+"/contents";
					//fields = "entry(link(@rel,@href),title(text()),gd:resourceId(text()))";
					break;
			}
			
			var parameters = {
				method:	"GET",
				parameters: {
					"alt":		"json",
					"v":		"3"/*,
					"fields":	fields*/
				}
			}
			
			this.oauth.sendSignedRequest(url, function(data) {
				data = JSON.parse(data);
				
				for(i in data.feed.entry) {
					item = data.feed.entry[i];
					link = "";
					for(j in item.link) {
						if(item.link[j].rel == "alternate") {
							link = item.link[j].href;
							break;
						}
					}
					
					var node = {
						title:	item.title.$t
					}
					if(item.gd$resourceId.$t.substr(0,7) != "folder:") {
						node.id = item.gd$etag;
						node.url = link;
					} else {
						node.id = "gdocs:"+item.gd$resourceId.$t;
					}
					books.push(node);
				}
				
				if(callback) callback(books);
			}, parameters);
		}
		
		this.search = function(query, maxResults, callback) {
			if(!this.oauth.hasToken()) {
				callback([]);
				return;
			}
			
			var parameters = {
				method:	"GET",
				parameters: {
					"alt":					"json",
					"v":					"3",
					"showfolders":	true,
					"q":					query,
					"max-results":	maxResults
				}
			};
			
			this.oauth.sendSignedRequest("https://docs.google.com/feeds/default/private/full", function(data) {
				data = JSON.parse(data);
				
				var nodes = [];
				for(var i in data.feed.entry) {
					var item = data.feed.entry[i];
					var link = "";
					for(j in item.link) {
						if(item.link[j].rel == "alternate") {
							link = item.link[j].href;
							break;
						}
					}
					
					var node = {
						title:	item.title.$t
					}
					if(item.gd$resourceId.$t.substr(0,7) != "folder:") {
						node.id = item.gd$etag;
						node.url = link;
					} else {
						node.id = "gdocs:"+item.gd$resourceId.$t;
					}
					nodes.push(node);
				}
				
				if(callback) callback("gdocs", nodes);
			}, parameters);
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", _this.NAME]);
		}
	});
	
	SourcePrototype.apply(GoogleDrive, {
		id:				"gdocs",
		name:			"Google Drive",
		description:	chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("files"),
								"Google Drive"
							]),
		image:			"img/gdrive.png",
		connection: {
			type:		"internal",
			method:	"oauth",
			config: {
				"request_url":		"https://www.google.com/accounts/OAuthGetRequestToken",
				"authorize_url":	"https://www.google.com/accounts/OAuthAuthorizeToken",
				"access_url":		"https://www.google.com/accounts/OAuthGetAccessToken",
				"consumer_key":		"anonymous",
				"consumer_secret":	"anonymous",
				"scope":			"https://docs.google.com/feeds",
									//https://www.googleapis.com/auth/drive
				"app_name":			"nexos"
			}
		},
		permissions:	[
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("items")
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
		switches: [
			"subchapterTitle"
		]
	});
})();
