/*
DeviantArt extends OAuth2
*/
(function() {
	var DeviantArt = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			DeviantArt.prototype.hasConnectivity(callback, attr, "https://www.deviantart.com");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			this.oauth.sendRequest("https://www.deviantart.com/api/draft15/user/whoami", function(data) {
				var data = JSON.parse(data);
				
				if(callback) {
					if (data.error) {
						callback(null);
					} else {
						callback({
							name: data.username,
							image: data.usericonurl,
							url: "http://"+data.username.toLowerCase()+".deviantart.com"
						});
					}
				}
			});
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("deviantart:uploads", function(books) {
				if(callback) callback("deviantart", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "deviantart") {
				if(callback) callback([
					{
						id: "deviantart:uploads",
						title: chrome.i18n.getMessage("deviantart_uploads")
					},
					{
						id: "deviantart:favorites",
						title: chrome.i18n.getMessage("deviantart_favorites")
					},
					{
						id: "deviantart:popular",
						title: chrome.i18n.getMessage("deviantart_popular")
					}
				]);
				return;
			}
			var params = chromeid.split(":");
			switch(params[1]) {
				case "uploads":
					path = "+sort%3Atime+by%3A:username:";
					break;
				case "favorites":
					path = "favby%3A:username:";
					break;
				case "popular":
					path = "boost%3Apopular+max_age%3A24h";
					break;
			}
			
			sendRequest.bind(this)(path, callback);
		}
		
		this.search = function(query, maxResults, callback) {
			sendRequest.bind(this)("+sort%3Atime+"+query+"+by%3A:username:", function(books) {
				callback("deviantart", books);
			});
		}
		
		function sendRequest(path, callback) {
			this.oauth.sendRequest("https://www.deviantart.com/api/draft15/user/whoami", function(data, resp) {
				if(resp.status == 401) {
					callback(null);
					return;
				}
				
				var username = JSON.parse(data).username;
				
				if(!username) {
					callback([]);
					return;
				}
				
				path = path.replace(/:username:/g, username);
				
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "https://backend.deviantart.com/rss.xml?type=deviation&q="+path, false);
				xhr.onreadystatechange = function() {
					if(xhr.readyState == 4 && callback) {
						var parser = new DOMParser();
						var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
						
						var books = [];
						var items = xmlDoc.getElementsByTagName("item");
						for(var i in items) {
							if(!items[i].querySelector)
								continue;
							
							var item = items[i];
							var id = item.querySelector("guid");
							var title = item.querySelector("title");
							var url = item.querySelector("link");
							var images = item.querySelectorAll("thumbnail");
							var image = null;
							var min = Infinity;
							for(var j in images) {
								if(!images[j].getAttribute)
									continue;
								
								var width = images[j].getAttribute("width");
								var height = images[j].getAttribute("height");
								if(width > 100 && height > 100 && width < 400 && height < 400) {
									var resolution = width * height;
									if(resolution < min) {
										min = resolution;
										image = images[j];
									}
								}
							}
							
							if(image) {
								books.push({
									id: id && id.textContent,
									title: title && title.textContent,
									url: url && url.textContent,
									image: image && image.getAttribute("url"),
									size: "image"
								});
							}
						}
						if(callback) callback(books);
					}
				}
				xhr.send();
			}.bind(this));
		}
	});
	
	SourcePrototype.apply(DeviantArt, {
		id: "deviantart",
		name: "deviantART",
		description: chrome.i18n.getMessage("requestAccess", [
			chrome.i18n.getMessage("images"),
			"deviantART"
		]),
		image: "img/deviantart.png",
		connection: {
			type: "internal",
			method: "oauth2",
			cacheDuration: 180,
			config: {
				"name": "deviantart",
				"redirect_uri": "https://www.deviantart.com/oauth2/draft15/authorize",
				"access_uri": "https://www.deviantart.com/oauth2/draft15/token",
				"client_id": "312",
				"client_secret": "557d870a35d162364e7f74f21a361d3f"
			}
		},
		permissions: [
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images")
		],
		features: [
			"list",
			"search"
		],
		content: [
			"images"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
