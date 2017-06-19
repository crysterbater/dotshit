/*
Facebook extends SourcePrototype
> ChromeExOAuth oauth
- connectToAccount()
- editConnectionWithAccount()
*/
(function() {
	var Facebook = (function(config) {
		var _this = this;
		var _config = config;
		
		this.__defineGetter__("oauth", function() {
			return {
				hasToken: function() {
					return (typeof(localStorage["token:facebook"]) != "undefined");
				}
			}
		});
		
		this.hasConnectivity = function(callback, attr) {
			Facebook.prototype.hasConnectivity(callback, attr, "https://api.facebook.com/method/fql.query");
		}
		
		this.isEnabled = function(callback) {
			if(callback) callback(this.oauth.hasToken());
		}
		
		this.getProfileInfo = function(callback) {
			if(!localStorage["token:facebook"]) {
				this.connectToAccount();
				return;
			}
			
			var query = "SELECT name, pic_small, profile_url FROM user WHERE uid=me()";
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://api.facebook.com/method/fql.query?"+unescape(localStorage["token:facebook"])+"&format=json&query="+query, true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var data = JSON.parse(xhr.responseText);
					if(!data || !data[0] || data.error_code) callback(null);
					
					if(callback) callback({
						name:	data[0].name,
						image:	data[0].pic_small,
						url:	data[0].profile_url
					});
				}
			}
			xhr.send();
		}
		
		this.getContent = function(content, callback) {
			var chromeid;
			switch(content) {
				case "images":
					chromeid = "facebook:albums";
					break;
				case "videos":
					chromeid = "facebook:videos";
					break;
			}
			if(chromeid) {
				this.getChildren(chromeid, function(books) {
					if(callback) callback("facebook", books);
				});
			}
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!localStorage["token:facebook"]) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid == "facebook") {
				if(callback) callback([
					{
						id:	"facebook:albums",
						title:	chrome.i18n.getMessage("facebook_albums")
					},
					{
						id:	"facebook:videos",
						title:	chrome.i18n.getMessage("facebook_videos")
					}
				]);
				return;
			}
			
			var query = "";
			chromeid = chromeid.split(":");
			switch(chromeid[1]) {
				case "albums":
					query = "SELECT aid, name, cover_pid FROM album WHERE owner=me()";
					break;
				case "videos":
					query = "SELECT vid, title, thumbnail_link FROM video WHERE owner=me()";
					break;
				case "photos":
					query = "SELECT link, caption, src FROM photo WHERE aid="+chromeid[2];
					break;
			}
			
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://api.facebook.com/method/fql.query?"+unescape(localStorage["token:facebook"])+"&format=json&query="+query, true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var data = JSON.parse(xhr.responseText);
					if (data.error_code) {
						callback(null);
						return;
					}
					var books = [];
					
					switch(chromeid[1]) {
						case "albums":
							var count = data.length;
							for(var i in data) {
								getThumbnail.bind(_this)("facebook:photos:"+data[i].aid, data[i].name, data[i].cover_pid, function(id, title, imageUrl) {
									books.push({
										id:		id,
										title:	title,
										image:	imageUrl,
										size:	"image"
									});

									if(--count == 0 && typeof(callback)=="function") callback(books);
								});
							}
							break;
						case "videos":
							for(var i in data) {
								books.push({
									id:		data[i].vid,
									title:	data[i].title,
									url:	"https://www.facebook.com/video/video.php?v="+data[i].vid,
									image:	data[i].thumbnail_link,
									size:	"image"
								});
							}

							if(callback) callback(books);
							break;
						case "photos":
							for(var i in data) {
								books.push({
									id:		data[i].link,
									title:	data[i].caption,
									url:	data[i].link,
									image:	data[i].src,
									size:	"image"
								});
							}

							if(callback) callback(books);
							break;
					}
				}
			}
			xhr.send();
		}

		function getThumbnail(videoId, videoTitle, thumbnailId, callback) {
			var query = "SELECT src FROM photo WHERE pid="+thumbnailId;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://api.facebook.com/method/fql.query?"+unescape(localStorage["token:facebook"])+"&format=json&query="+query, true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var data = JSON.parse(xhr.responseText);

					if(callback) callback(videoId, videoTitle, data[0] && data[0].src || "");
				}
			}
			xhr.send();
		}
		
		this.search = function(query, maxResults, callback) {
			var books = [];
			var queries = [
				"SELECT link, caption, src_big FROM photo WHERE aid IN (SELECT aid FROM album WHERE owner=me()) AND strpos(caption, lower('"+query+"'))>0",
				"SELECT vid, title, thumbnail_link FROM video WHERE owner=me() AND strpos(title, lower('"+query+"'))>0"
			];
			var counter = 0;
			for(var i in queries) {
				(function(){
					var xhr = new XMLHttpRequest();
					xhr.counter = i;
					xhr.open("GET", "https://api.facebook.com/method/fql.query?"+unescape(localStorage["token:facebook"])+"&format=json&query="+queries[i], true);
					xhr.onreadystatechange = function() {
						if(xhr.readyState == 4) {
							var data = JSON.parse(xhr.responseText);
							
							switch(this.counter) {
								case "0":
									for(var j in data) {
										books.push({
											id:		data[j].link,
											title:		data[j].caption,
											url:		data[j].link,
											image:	data[j].src_big,
											size:		"image"
										});
									}
									break;
								case "1":
									for(var j in data) {
										books.push({
											id:		data[j].vid,
											title:		data[j].title,
											url:		"https://www.facebook.com/video/video.php?v="+data[j].vid,
											image:	data[j].thumbnail_link,
											size:		"image"
										});
									}
									break;
							}
							
							if(++counter == queries.length && callback) callback("facebook", books);
						}
					}
					xhr.send();
				})();
			}
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "search", _this.NAME]);
		}
		
		this.connectToAccount = function() {
			var action = "connect";
			if(this.oauth.hasToken()) {
				action = "reconnect";
				Cache.clear(this.ID);
			}
			FormBuilder.build("info", "source:"+action, FormBuilder.sourceToBook(this, function(callback) {
				var successURL = /^https?:\/\/www\.facebook\.com\/connect\/login_success\.html/;
				
				function onFacebookLogin() {
					chrome.tabs.getAllInWindow(null, function(tabs) {
						for(var i = 0; i < tabs.length; i++) {
							if(tabs[i].url.match(successURL)) {
								var params = tabs[i].url.split('#')[1];
								localStorage["token:facebook"] = params;
								chrome.tabs.remove(tabs[i].id);
								chrome.tabs.onUpdated.removeListener(onFacebookLogin);
								
								chrome.tabs.getCurrent(function(tab) {
									chrome.tabs.update(tab.id, {
										selected: true
									});
								});
								
								if(callback) callback();
								return;
							}
						}
					});
				}
				chrome.tabs.onUpdated.addListener(onFacebookLogin);
				
				chrome.tabs.create({
					url: "https://www.facebook.com/dialog/oauth?client_id=95270418475&response_type=token&redirect_uri=http://www.facebook.com/connect/login_success.html&scope=user_photos,user_videos,offline_access"
				});
				
				if(_gaq) _gaq.push(["_trackEvent", "Features", action, _this.NAME]);
			}));
		}
		
		this.editConnectionWithAccount = function() {
			FormBuilder.build("info", "source:edit", FormBuilder.sourceToBook(this, function(callback) {
				localStorage.removeItem("token:facebook");
				
				if(callback) callback();
				
				if(_gaq) _gaq.push(["_trackEvent", "Features", "disconnect", _this.NAME]);
			}));
		}
		
		/*
		this.refreshToken = function() {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://www.facebook.com/dialog/oauth?client_id=95270418475&response_type=token&redirect_uri=http://www.facebook.com/connect/login_success.html&response_type=token", true);
			xhr.onreadystatechange = function() {
				console.log(xhr.readyState, xhr);
				if(xhr.readyState == 4) {
					//set up new timed refreshToken call depending on returned expires_in parameter
					//...
				}
			}
			xhr.send();
		}
		*/
	});
	
	SourcePrototype.apply(Facebook, {
		id:				"facebook",
		name:			"Facebook",
		description:	chrome.i18n.getMessage("requestAccess", [
								[chrome.i18n.getMessage("images"), chrome.i18n.getMessage("and"), chrome.i18n.getMessage("videos")].join(" "),
								"Facebook"
							]),
		image:			"img/facebook.png",
		connection: {
			type:		"internal",
			method:	"custom"
		},
		permissions:	[
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images"),
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("videos")
		],
		features: [
			"list",
			"search"
		],
		content: [
			"images",
			"videos"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
