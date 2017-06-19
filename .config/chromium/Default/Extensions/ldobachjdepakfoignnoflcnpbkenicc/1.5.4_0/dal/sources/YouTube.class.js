/*
YouTube extends OAuth
*/
(function() {
	var YouTube = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			//YouTube.prototype.hasConnectivity(callback, attr, "https://gdata.youtube.com");
			YouTube.prototype.hasConnectivity(callback, attr, "https://gdata.youtube.com/feeds/api/standardfeeds/top_rated");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var parameters = {
				method:	"GET",
				parameters:	{
					"v":		2,
					"alt":		"json",
					"fields":	"yt:username(@display,text()),media:thumbnail(@url)",
					"key":		"AI39si6mEYHLSkT_srUoJtsOBswhWpFlf4s6SvovXMgA-9kosJhkOnUAlt28s-k7WCKZchKyfG3FxjTnhXvNpJPl5UYPZJ9vQQ"
				}
			}

			this.oauth.sendSignedRequest("https://gdata.youtube.com/feeds/api/users/default", function(data) {
				data = JSON.parse(data);
				
				if(callback) callback({
					name:	data.entry.yt$username.display,
					image:	data.entry.media$thumbnail.url,
					url:	"https://www.youtube.com/user/"+data.entry.yt$username.$t
				});
			}, parameters);
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("youtube:uploads", function(books) {
				if(callback) callback("youtube", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "youtube") {
				if(callback) callback([
					{
						id:	"youtube:subscriptions",
						title:	chrome.i18n.getMessage("youtube_subscriptions")
					},
					{
						id:	"youtube:watchlater",
						title:	chrome.i18n.getMessage("youtube_watchLater")
					},
					{
						id:	"youtube:favorites",
						title:	chrome.i18n.getMessage("youtube_favorites")
					},
					{
						id:	"youtube:playlists",
						title:	chrome.i18n.getMessage("youtube_playlists")
					},
					{
						id:	"youtube:recommendations",
						title:	chrome.i18n.getMessage("youtube_recommendations")
					},
					{
						id:	"youtube:uploads",
						title:	chrome.i18n.getMessage("youtube_uploads")
					}
				]);
				return;
			}
			
			var url = "https://gdata.youtube.com/feeds/api/users/default";
			var type = chromeid.replace(/^youtube:(.*)$/,"$1");
			switch(type) {
				case "subscriptions":
					url += "/newsubscriptionvideos";
					break;
				case "watchlater":
					url += "/watch_later";
					break;
				case "favorites":
					url += "/favorites";
					break;
				case "playlists":
					url += "/playlists";
					break;
				case "recommendations":
					url += "/recommendations";
					break;
				case "uploads":
					url += "/uploads";
					break;
				default:
					type = chromeid.replace(/^youtube:(.+?):(.*)$/, "$1");
					var item = chromeid.replace(/^youtube:(.+?):(.*)$/, "$2");
					switch(type) {
						case "playlists":
							type = "playlist";
							url = "https://gdata.youtube.com/feeds/api/playlists/"+item;
							break;
						default:
							return;
					}
			}
			
			var parameters;
			switch(type) {
				case "playlists":
					parameters = {
						method:	"GET",
						parameters:	{
							"v":			2,
							"format":	5,
							"alt":			"json",
							"fields":		"entry(title(text()),media:group(media:thumbnail(@url,@yt:name)),yt:playlistId)",
							"key":		"AI39si6mEYHLSkT_srUoJtsOBswhWpFlf4s6SvovXMgA-9kosJhkOnUAlt28s-k7WCKZchKyfG3FxjTnhXvNpJPl5UYPZJ9vQQ"
						}
					}
					break;
				default:
					parameters = {
						method:	"GET",
						parameters:	{
							"v":			2,
							"format":	5,
							"alt":			"json",
							"fields":		"entry(title(text()),media:group(media:thumbnail(@url),yt:videoid))",
							"time":		"this_week",
							"max-results":	30,
							"key":		"AI39si6mEYHLSkT_srUoJtsOBswhWpFlf4s6SvovXMgA-9kosJhkOnUAlt28s-k7WCKZchKyfG3FxjTnhXvNpJPl5UYPZJ9vQQ"
						}
					}
					if(type=="uploads") delete parameters.parameters.format;
			}

			this.oauth.sendSignedRequest(url, function(data) {
				data = JSON.parse(data);
				var books = [];
				
				var entries = data.feed.entry;
				switch(type) {
					case "playlists":
						for(var i in entries) {
							var thumbnails = entries[i].media$group.media$thumbnail;
							if(!thumbnails) continue;
							
							var thumbnail;
							for(var j in thumbnails) {
								if(thumbnails[j].yt$name == "default") thumbnail = thumbnails[j].url;
							}
							thumbnail = thumbnail || thumbnails[0].url;

							books.push({
								id:	"youtube:playlists:"+entries[i].yt$playlistId.$t,
								title:	entries[i].title.$t,
								image:	thumbnail,
								size:	"image"
							});
						}
						break;
					default:
						for(var i in entries) {
							if(!entries[i].media$group.media$thumbnail) continue;
							
							var vid = entries[i].media$group.yt$videoid.$t;
							books.push({
								id:		vid,
								title:		entries[i].title.$t,
								url:		"http://www.greinr.com/webapps/mytab/?ref=nexos#/v:"+vid+"/",
								image:	"https://i.ytimg.com/vi/"+vid+"/default.jpg",
								size:		"image"
							});
						}
				}
				
				if(callback) callback(books);
			}, parameters);
		}
	});
	
	SourcePrototype.apply(YouTube, {
		id:				"youtube",
		name:			"YouTube",
		description:	chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("videos"),
								"YouTube"
							]),
		image:			"img/youtube.png",
		connection: {
			type:		"internal",
			method:	"oauth",
			cacheDuration: 180,
			config: {
				"request_url":		"https://www.google.com/accounts/OAuthGetRequestToken",
				"authorize_url":		"https://www.google.com/accounts/OAuthAuthorizeToken",
				"access_url":			"https://www.google.com/accounts/OAuthGetAccessToken",
				"consumer_key":	"anonymous",
				"consumer_secret":"anonymous",
				"scope":				"https://gdata.youtube.com",
				"app_name":			"nexos"
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
