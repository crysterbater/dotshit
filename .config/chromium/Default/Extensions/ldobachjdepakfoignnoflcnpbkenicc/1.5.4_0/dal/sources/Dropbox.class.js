/*
Dropbox extends OAuth
*/
(function() {
	var Dropbox = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			var xhr = new XMLHttpRequest();
			xhr.open("HEAD", "https://api.dropbox.com", true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					if(callback) callback(xhr.status != 0, attr);
				}
			}
			try {
				xhr.send();
			} catch(err) {
				//do nothing
			}
		}
		
		this.getChildren = function(chromeid, callback) {
			console.log("getChildren");
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			if(chromeid=="dropbox") chromeid = "/";
			
			console.log(chromeid);
			this.oauth.sendSignedRequest("https://api.dropbox.com/1/metadata/dropbox"+chromeid, function(data) {
				console.log(data);
				data = JSON.parse(data);
				console.log(data);
				
				var nodes = [];
				for(i in data.contents) {
					var item = data.contents[i];
					nodes.push({
						id:	item.path,
						title:	item.path.substr(item.path.lastIndexOf("/")+1),
						url:	""//(item.is_dir) ? "" : "javascript:Dropbox.downloadFile('"+item.path+"');"//"download.htm?file="+item.path//"https://dl-web.dropbox.com/get/"+item.path+"?w=..."
					});
				}
				if(callback) callback(nodes);
			});
			/*
			if(chromeid=="dropbox") chromeid = "/";
			this.oauth.sendSignedRequest("https://api.dropbox.com/0/metadata/dropbox"+chromeid,function(data) {
				var data = JSON.parse(data);
				
				var nodes = [];
				for(i in data.contents) {
					var item = data.contents[i];
					nodes.push({
						id:	item.path,
						title:	item.path.substr(item.path.lastIndexOf("/")+1),
						url:	""//(item.is_dir) ? "" : "javascript:Dropbox.downloadFile('"+item.path+"');"//"download.htm?file="+item.path//"https://dl-web.dropbox.com/get/"+item.path+"?w=..."
					});
				}
				if(callback) callback(nodes);
			}, {});
			*/
		}
	});
	
	SourcePrototype.apply(Dropbox, {
		id:				"dropbox",
		name:			"Dropbox",
		description:	"Access your Files on Dropbox through MARKive.", //i18n!
		image:			"img/dropbox.png",
		connection: {
			type:		"internal",
			method:	"oauth",
			config: {
				"request_url":		"https://api.getdropbox.com/1/oauth/request_token",
				"authorize_url":		"https://api.getdropbox.com/1/oauth/authorize",
				"access_url":			"https://api.getdropbox.com/1/oauth/access_token",
				"consumer_key":	"iubzuu2kdy8z5hb",
				"consumer_secret":"cyoi5bynzk66u93",
				"scope":				"#https://*.getdropbox.com/*"
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
			"images",
			"videos"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();