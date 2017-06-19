/*
Instagram extends OAuth2
*/
(function() {
	var Instagram = (function(config) {
		var _this = this;
		var _config = config;
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			this.oauth.sendRequest("https://api.instagram.com/v1/users/self", function(data) {
				data = JSON.parse(data).data;
				
				if(callback) callback({
					name:  data.username, //data.full_name
					image: data.profile_picture,
					url: "https://instagram.com/"+data.username
				});
			});
		}

		this.getContent = function(content, callback) {
			this.getChildren("instagram:uploads", function(books) {
				if(callback) callback("instagram", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "instagram") {
				if(callback) callback([
					{
						id: "instagram:uploads",
						title: chrome.i18n.getMessage("instagram_uploads")
					},
					{
						id: "instagram:likes",
						title: chrome.i18n.getMessage("instagram_likes")
					},
					{
						id: "instagram:popular",
						title: chrome.i18n.getMessage("instagram_popular")
					}
				]);
				return;
			}
			
			var path;
			var params = chromeid.split(":");
			switch(params[1]) {
				case "popular":
					path = "media/popular";
					break;
				case "likes":
					path = "users/self/media/liked";
					break;
				case "uploads":
					path = "users/self/media/recent";
					break;
			}
			
			var parameters = {
				method: "GET",
				parameters: {
					count: 50
				}
			}
			
			this.oauth.sendRequest("https://api.instagram.com/v1/"+path, function(data) {
				data = JSON.parse(data).data;
				
				var books = [];
				for(var i in data) {
					books.push({
						id: data[i].id,
						title: data[i].caption && data[i].caption.text,
						url: data[i].link,
						image: data[i].images.thumbnail.url,
						size: "image"
					});
				}
				callback(books);
			}, parameters);
		}
	});
	
	SourcePrototype.apply(Instagram, {
		id: "instagram",
		name: "Instagram",
		description: chrome.i18n.getMessage("requestAccess", [
			chrome.i18n.getMessage("images"),
			"Instagram"
		]),
		image: "img/instagram.png",
		connection: {
			type: "internal",
			method: "oauth2",
			cacheDuration: 180,
			config: {
				"name": "instagram",
				"redirect_uri": "https://api.instagram.com/oauth/authorize/",
				"access_uri": "https://api.instagram.com/oauth/access_token",
				"client_id": "da0015180dbe404eb46bffb301ae5784",
				"scope": "basic",
				"response_type": "token"
			}
		},
		permissions: [
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images")
		],
		features: [
			"list"
		],
		content: [
			"images"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
