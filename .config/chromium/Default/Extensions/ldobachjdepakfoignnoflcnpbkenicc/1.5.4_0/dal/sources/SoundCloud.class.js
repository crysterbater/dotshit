/*
Soundcloud extends OAuth2
*/
(function() {
	var SoundCloud = (function(config) {
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			SoundCloud.prototype.hasConnectivity(callback, attr, "https://api.soundcloud.com/tracks?client_id="+_config.connection.config.client_id);
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			this.oauth.sendRequest("https://api.soundcloud.com/me.json", function(data) {
				data = JSON.parse(data);
				
				if(callback) callback({
					name:	data.username,
					image:	data.avatar_url,
					url:	data.permalink_url
				})
			});
		}

		this.getContent = function(content, callback) {
			this.getChildren("soundcloud:tracks", function(books) {
				if(callback) callback("soundcloud", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}

			if(chromeid == "soundcloud") {
				if(callback) callback([
					{
						id:		"soundcloud:favorites",
						title:	chrome.i18n.getMessage("soundcloud_favorites")
					},
					{
						id:		"soundcloud:sets",
						title:	chrome.i18n.getMessage("soundcloud_sets")
					},
					{
						id:		"soundcloud:groups",
						title:	chrome.i18n.getMessage("soundcloud_groups")
					},
					{
						id:		"soundcloud:tracks",
						title:	chrome.i18n.getMessage("soundcloud_tracks")
					}
				]);
				return;
			}

			var params = chromeid.split(":");

			var itemType = "track";
			var url = "";
			var type = params[1];
			var item = params[2];
			switch(type) {
				case "favorites":
					url = "/users/me/favorites";
					break;
				case "sets":
					if(item) {
						url = "/playlists/"+item+"/tracks";
					} else {
						itemType = "list";
						url = "/users/me/playlists";
					}
					break;
				case "groups":
					if(item) {
						url = "/groups/"+item+"/tracks";
					} else {
						itemType = "list";
						url = "/users/me/groups";
					}
					break;
				case "tracks":
					url = "/users/me/tracks";
					break;
			}
			
			this.oauth.sendRequest("https://api.soundcloud.com"+url+".json", function(data) {
				data = JSON.parse(data);

				var books = [];
				if(itemType == "track") {
					for(var i in data) {
						books.push({
							id:		data[i].id,
							title:	data[i].title,
							url:	data[i].permalink_url,
							image:	data[i].artwork_url || "img/audio.png",
							size:	"image"
						})
					}
				} else {
					for(var i in data) {
						books.push({
							id:		["soundcloud", type, data[i].id].join(":"),
							title:	data[i].title || data[i].name,
							image:	data[i].artwork_url || "img/audio.png",
							size:	"image"
						});
					}
				}

				if(callback) callback(books);
			});
		}
	});
	
	SourcePrototype.apply(SoundCloud, {
		id:				"soundcloud",
		name:			"SoundCloud",
		description:	chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("audio"),
								"SoundCloud"
							]),
		image:			"img/soundcloud.png",
		connection: {
			type:		"internal",
			method:	"oauth2",
			config: {
				"name":				"soundcloud",
				"redirect_uri":		"https://soundcloud.com/connect",
				"access_uri":			"https://api.soundcloud.com/oauth2/token",
				"client_id":			"b58ff49f8c7f657465eb8868057eacab",
				"scope":			"non-expiring",
				"response_type":	"token",
				tmp: {
					tokenParamName:	"oauth_token"
				}
			}
		},
		permissions: [
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("audio")
		],
		features: [
			"list"
			//"search"
		],
		content: [
			"audio"
		],
		menu: [],
		switches: []
	});
})();
