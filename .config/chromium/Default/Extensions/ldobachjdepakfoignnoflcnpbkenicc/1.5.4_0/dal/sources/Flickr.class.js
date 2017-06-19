/*
Flickr extends OAuth
*/
(function() {
	var Flickr = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			Flickr.prototype.hasConnectivity(callback, attr, "https://secure.flickr.com/services/rest/");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var parameters = {
				method:	"GET",
				parameters:	{
					method:			"flickr.urls.getUserProfile",
					format:			"json",
					nojsoncallback:	1
				}
			}
			
			this.oauth.sendSignedRequest("https://secure.flickr.com/services/rest/", (function(data) {
				var data = JSON.parse(data);
				
				parameters.parameters.method = "flickr.people.getInfo";
				parameters.parameters.url = data.user.nsid;
				this.oauth.sendSignedRequest("https://secure.flickr.com/services/rest/", function(data) {
					var data = JSON.parse(data);
					
					if(callback) callback({
						name:	data.person.username._content, //data.person.realname._content
						image:	(data.person.iconfarm+data.person.iconserver=="00") ? "http://www.flickr.com/images/buddyicon.gif" : ["http://farm",data.person.iconfarm,".staticflickr.com/",data.person.iconserver,"/buddyicons/",data.person.nsid,".jpg"].join(""),
						url:	data.person.profileurl._content
					})
				}, parameters);
				//...
			}).bind(this), parameters);
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("flickr:photosets", function(books) {
				if(callback) callback("flickr", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "flickr") {
				if(callback) callback([
					{
						id:	"flickr:favorites",
						title:	chrome.i18n.getMessage("flickr_favorites")
					},
					{
						id:	"flickr:photosets",
						title:	chrome.i18n.getMessage("flickr_photosets")
					},
					{
						id:	"flickr:galleries",
						title:	chrome.i18n.getMessage("flickr_galleries")
					}
				]);
				return;
			}
			
			var singular = "";
			var item = "";
			var itemIdName = "";
			var method = "";
			var type = chromeid.replace(/^flickr:(.*)$/,"$1");
			switch(type) {
				case "favorites":
					method = "flickr.favorites.getList";
					type = "photos";
					singular = "photo";
					break;
				case "photosets":
					method = "flickr.photosets.getList";
					singular = "photoset";
					break;
				case "galleries":
					method = "flickr.galleries.getList";
					singular = "gallery";
					break;
				default:
					type = chromeid.replace(/^flickr:(.+?):(.*)$/, "$1");
					item = chromeid.replace(/^flickr:(.+?):(.*)$/, "$2");
					switch(type) {
						case "photosets":
							type = "photoset";
							method = "flickr.photosets.getPhotos";
							itemIdName = "photoset_id";
							break;
						case "galleries":
							type = "photos";
							method = "flickr.galleries.getPhotos";
							itemIdName = "gallery_id";
							break;
					}
					singular = "photo";
			}
			
			var parameters = {
				method:	"GET",
				parameters:	{
					method:			method,
					format:			"json",
					nojsoncallback:	1
				}
			}
			if(item) parameters.parameters[(itemIdName) ? itemIdName : singular+"_id"] = item;
			
			this.oauth.sendSignedRequest("https://secure.flickr.com/services/rest/", function(data) {
				data = JSON.parse(data);
				var books = [];
				
				var items = data[type][singular];
				for(var i in items) {
					books.push({
						id:		"flickr:"+type+":"+items[i].id,
						title:		items[i].title._content || items[i].title,
						url:		(singular!="photo") ? undefined : "https://secure.flickr.com/photos/"+(items[i].owner || "me")+"/"+items[i].id+"/in/photostream/lightbox/",
						image:	["https://farm",(items[i].primary_photo_farm || items[i].farm),".staticflickr.com/",(items[i].primary_photo_server || items[i].server),"/",(items[i].primary_photo_id || items[i].primary || items[i].id),"_",(items[i].primary_photo_secret || items[i].secret),"_m.jpg"].join(""),
						size:		"image"
					});
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
				parameters: {
					method:			"flickr.photos.search",
					format:				"json",
					nojsoncallback:	1,
					user_id:			"me",
					text:					query,
					per_page:			maxResults
				}
			}
			
			this.oauth.sendSignedRequest("https://secure.flickr.com/services/rest/", function(data) {
				data = JSON.parse(data);
				
				var items = data.photos.photo;
				for(var i in items) {
					books.push({
						id:		items[i].id,
						title:		items[i].title,
						url:		"https://secure.flickr.com/photos/"+(items[i].owner || "me")+"/"+items[i].id+"/in/photostream/lightbox/",
						image:	["https://farm",items[i].farm,".staticflickr.com/",items[i].server,"/",items[i].id,"_",items[i].secret,"_s.jpg"].join(""),
						size:		"image"
					});
				}
				
				if(callback) callback("flickr", books);
			}, parameters);
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", _this.NAME]);
		}
	});
	
	SourcePrototype.apply(Flickr, {
		id:				"flickr",
		name:			"Flickr",
		description:	chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("images"),
								"Flickr"
							]),
		image:			"img/flickr.png",
		connection: {
			type:		"internal",
			method:	"oauth",
			config: {
				"request_url":		"https://secure.flickr.com/services/oauth/request_token",
				"authorize_url":		"https://secure.flickr.com/services/oauth/authorize",
				"access_url":			"https://secure.flickr.com/services/oauth/access_token",
				"consumer_key":	"a237b436cef56cae126ef16816711088",
				"consumer_secret":"3f28efa94b0a2267",
				"scope":				"#https://*.flickr.com/*",
				"app_name":			"nexos"
			}
		},
		permissions: [
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
