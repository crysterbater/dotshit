/*
Vimeo extends OAuth
*/
(function() {
	var Vimeo = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			Vimeo.prototype.hasConnectivity(callback, attr, "https://vimeo.com/api/rest/v2");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var parameters = {
				method: "GET",
				parameters: {
					format: "json",
					method: "vimeo.people.getInfo"
				}
			}
			
			this.oauth.sendSignedRequest("https://vimeo.com/api/rest/v2", function(data) {
				data = JSON.parse(data);
				
				var username = data.person.username;
				if(/^user[0-9]+$/.test(username)) {
					username = data.person.display_name;
				}
				
				if(callback) callback({
					name: username,
					image: data.person.portraits.portrait[0] && data.person.portraits.portrait[0]._content,
					url: data.person.profileurl
				})
			}, parameters);
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("vimeo:uploads", function(books) {
				if(callback) callback("vimeo", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "vimeo") {
				if(callback) callback([
					{
						id: "vimeo:subscriptions",
						title: chrome.i18n.getMessage("vimeo_subscriptions")
					},
					{
						id: "vimeo:likes",
						title: chrome.i18n.getMessage("vimeo_likes")
					},
					{
						id: "vimeo:albums",
						title: chrome.i18n.getMessage("vimeo_albums")
					},
					{
						id: "vimeo:channels",
						title: chrome.i18n.getMessage("vimeo_channels")
					},
					{
						id: "vimeo:groups",
						title: chrome.i18n.getMessage("vimeo_groups")
					},
					{
						id: "vimeo:uploads",
						title: chrome.i18n.getMessage("vimeo_uploads")
					}
				]);
				return;
			}
			
			var singular = "";
			var item = "";
			var url = "https://vimeo.com/api/rest/v2";
			var method = "vimeo.";
			var type = chromeid.replace(/^vimeo:(.*)$/, "$1");
			switch(type) {
				case "subscriptions":
					method += "videos.getSubscriptions";
					break;
				case "albums":
					method += "albums.getAll";
					singular = "album";
					break;
				case "channels":
					method += "channels.getAll";
					singular = "channel";
					break;
				case "groups":
					method += "groups.getAll";
					singular = "group";
					break;
				case "likes":
					method += "videos.getLikes";
					break;
				case "uploads":
					method += "videos.getUploaded";
					break;
				default:
					type = chromeid.replace(/^vimeo:(.+?):(.*)$/, "$1");
					item = chromeid.replace(/^vimeo:(.+?):(.*)$/, "$2");
					switch(type) {
						case "albums":
							method += "albums.getVideos";
							singular = "album";
							break;
						case "channels":
							method += "channels.getVideos";
							singular = "channel";
							break;
						case "groups":
							method += "groups.getVideos";
							singular = "group";
							break;
					}
					type = "videos";
			}
			
			var parameters = {
				method: "GET",
				parameters: {
					format: "json",
					per_page: 30,
					method: method
				}
			}
			if(item) parameters.parameters[singular+"_id"] = item;
			
			this.oauth.sendSignedRequest(url, function(data) {
				data = JSON.parse(data);
				var books = [];
				
				switch(type) {
					case "albums":
					case "channels":
					case "groups":
						var items = data[type][singular];

						for(var i in items) {
							var thumbnail = items[i].thumbnail_url;
							if(!thumbnail && items[i].thumbnail_video) {
								var thumbnails = items[i].thumbnail_video.thumbnails.thumbnail;
								for(var j in thumbnails) {
									if(thumbnails[j].width > 150) {
										thumbnail = thumbnails[j]._content;
										break;
									}
								}
								if(!thumbnail) thumbnail = thumbnails[0]._content;
							}

							books.push({
								id: "vimeo:"+type+":"+items[i].id,
								title: items[i].title || items[i].name,
								image: thumbnail,
								size: "image"
							});
						}
						
						if(typeof(callback)=="function") callback(books); 
						break;
					default:
						var videos = data.videos.video;
						if(videos) {
							var count = videos.length;
							for(var i in videos) {
								getThumbnail.bind(_this)(videos[i].id, videos[i].title, function(id, title, imageUrl) {
									books.push({
										id: id,
										title: title,
										url: "https://vimeo.com/"+id,
										image: imageUrl,
										size: "image"
									});
									
									if(--count == 0 && typeof(callback)=="function") callback(books); 
								});
							}
						}
				}
			}, parameters);
		}
		
		function getThumbnail(videoId, videoTitle, callback) {
			var parameters = {
				method: "GET",
				parameters: {
					format: "json",
					method: "vimeo.videos.getThumbnailUrls",
					video_id: videoId
				}
			}
			
			this.oauth.sendSignedRequest("https://vimeo.com/api/rest/v2", function(data) {
				data = JSON.parse(data);

				var thumbnail;
				var thumbnails = data.thumbnails.thumbnail;
				for(var i in thumbnails) {
					if(thumbnails[i].width > 150) {
						thumbnail = thumbnails[i]._content;
						break;
					}
				}
				if(!thumbnail) thumbnail = thumbnails[0]._content;

				if(typeof(callback) == "function") callback(videoId, videoTitle, thumbnail);
			}, parameters);
		}
	});
	
	SourcePrototype.apply(Vimeo, {
		id: "vimeo",
		name: "Vimeo",
		description: chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("videos"),
								"Vimeo"
							]),
		image: "img/vimeo.png",
		connection: {
			type: "internal",
			method: "oauth",
			cacheDuration: 180,
			config: {
				"request_url": "https://vimeo.com/oauth/request_token",
				"authorize_url": "https://vimeo.com/oauth/authorize",
				"access_url": "https://vimeo.com/oauth/access_token",
				"consumer_key": "c32b916b2e3d459271334f8344843283",
				"consumer_secret":"e9e36cd851d30acd",
				"scope": "https://vimeo.com",
				"app_name": "nexos"
			}
		},
		permissions: [
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("videos")
		],
		features: [
			"list"
		],
		content: [
			"videos"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
