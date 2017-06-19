/*
GooglePlus extends OAuth
*/
(function() {
	var GooglePlus = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			GooglePlus.prototype.hasConnectivity(callback, attr, "https://picasaweb.google.com/data/feed/api/user/default?alt=json");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var parameters = {
				method:	"GET",
				parameters: {
					"alt":		"json",
					"v":		"2",
					"fields":	"author(name(text()),uri(text()))"
				}
			}
			
			this.oauth.sendSignedRequest("https://picasaweb.google.com/data/feed/api/user/default", function(data) {
				data = JSON.parse(data);
				
				var id = data.feed.author[0].uri.$t.match(/[0-9]+$/)[0];
				
				if(callback) callback({
					name:	data.feed.author[0].name.$t,
					url:	"https://plus.google.com/"+id
				})
			}, parameters);
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("gplus:albums", function(books) {
				if(callback) callback("gplus", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "gplus") {
				chromeid = "gplus:albums";
			}
			
			var query = "";
			var fields = "entry";
			chromeid = chromeid.split(":");
			switch(chromeid[1]) {
				case "albums":
					query = "data/feed/api/user/default";
					fields = "entry(title(text()),gphoto:id(text()),media:group(media:thumbnail(@url,@height)))";
					break;
				case "photos":
					query = "data/feed/api/user/default/albumid/"+chromeid[2];
					fields = "entry(id(text()),summary(text()),media:group(media:thumbnail(@url,@height)))";
					break;
			}
			
			var parameters = {
				method:	"GET",
				parameters: {
					"alt":		"json",
					"v":		"2",
					"fields":	fields
				}
			}
			
			this.oauth.sendSignedRequest("https://picasaweb.google.com/"+query, function(data) {
				data = JSON.parse(data);
				var books = [];
				
				var entries = data.feed.entry;
				switch(chromeid[1]) {
					case "albums":
						var entries = data.feed.entry;
						for(var i in entries) {
							var thumbnail = "";
							var list = entries[i].media$group.media$thumbnail;
							for(var j in list) {
								if(list[j].height > 100 && list[j].height < 200) thumbnail = list[j].url;
							}
							
							books.push({
								id:		"gplus:photos:"+entries[i].gphoto$id.$t,
								title:		entries[i].title.$t,
								image:	thumbnail,
								size:		"image"
							});
						}
						break;
					case "photos":
						for(var i in entries) {
							var link = entries[i].id.$t.replace(/^https:\/\/picasaweb.google.com\/data\/entry\/user\/(.+?)\/albumid\/(.+?)\/photoid\/(.+?)$/, "https://plus.google.com/photos/$1/albums/$2/$3");
							
							var thumbnail = "";
							var list = entries[i].media$group.media$thumbnail;
							for(var j in list) {
								if(list[j].height > 100 && list[j].height < 200) thumbnail = list[j].url;
							}
							
							books.push({
								id:		link,
								title:		entries[i].summary.$t,
								url:		link,
								image:	thumbnail,
								size:		"image"
							});
						}
						break;
				}
				if(callback) callback(books);
			}, parameters);
		}
		
		this.search = function(query, maxResults, callback) {
			var books = [];
			if(!this.oauth.hasToken()) {
				if(callback) callback(books);
				return;
			}
			
			var parameters = {
				method:	"GET",
				parameters:	{
					"alt":					"json",
					"kind":				"photo",
					"q":					escape(query),
					"max-results":	maxResults,
					"v":					"2",
					"fields":				"entry(link(@rel,@href),summary(text()),media:group(media:thumbnail(@url,@height)))"
				}
			}
			
			this.oauth.sendSignedRequest("https://picasaweb.google.com/data/feed/api/user/default", function(data) {
				data = JSON.parse(data);
				
				var entries = data.feed.entry;
				for(var i in entries) {
					var link = "";
					var list = entries[i].link;
					for(var j in list) {
						if(list[j].rel == "alternate") link = list[j].href;
					}
					
					var thumbnail = "";
					var list = entries[i].media$group.media$thumbnail;
					for(var j in list) {
						if(list[j].height > 100) thumbnail = list[j].url;
					}
					if(!thumbnail && list.length > 0) thumbnail = list[list.length-1].url
					
					books.push({
						id:		link,
						title:		entries[i].summary.$t,
						url:		link,
						image:	thumbnail,
						size:		"image"
					});
				}
				
				if(callback) callback("gplus", books);
			}, parameters);
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", _this.NAME]);
		}
	});
	
	SourcePrototype.apply(GooglePlus, {
		id:				"gplus",
		name:			"Google+",
		description:	chrome.i18n.getMessage("requestAccess", [
								[chrome.i18n.getMessage("images"), chrome.i18n.getMessage("and"), chrome.i18n.getMessage("videos")].join(" "),
								"Google+"
							]),
		image:			"img/gplus.png",
		connection: {
			type:		"internal",
			method:	"oauth",
			config: {
				"request_url":		"https://www.google.com/accounts/OAuthGetRequestToken",
				"authorize_url":		"https://www.google.com/accounts/OAuthAuthorizeToken",
				"access_url":			"https://www.google.com/accounts/OAuthGetAccessToken",
				"consumer_key":	"anonymous",
				"consumer_secret":"anonymous",
				"scope":				"https://picasaweb.google.com/data/",
				"app_name":			"nexos"
			}
		},
		permissions:	[
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images")
			//chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("videos")
		],
		features: [
			"list",
			"search"
		],
		content: [
			"images"
			//videos?
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
