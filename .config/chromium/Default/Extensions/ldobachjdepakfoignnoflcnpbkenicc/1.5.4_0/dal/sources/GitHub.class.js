/*
GitHub extends OAuth2
*/
(function() {
	var GitHub = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			GitHub.prototype.hasConnectivity(callback, attr, "https://github.com");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var url = "https://api.github.com/user";
			this.oauth.sendRequest(url, function(data) {
				data = JSON.parse(data);
				
				if(callback) callback({
					name:	data.login, //data.name
					image:	data.avatar_url,
					url:	data.html_url
				});
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			var books = [];
			
			var iParams = chromeid.split(":");
			
			var type = "github";
			var user;
			var repo;
			var branch;
			var path;
			var url = "https://api.github.com";
			if(chromeid == "github") {
				url += "/user/repos";
			} else {
				type = iParams[1];
				user = iParams[2];
				repo = iParams[3];
				branch = iParams[4];
				path = iParams[5];
				switch(type) {
					case "branches":
						url += "/repos/"+user+"/"+repo+"/branches";
						break;
					case "tree":
						url += "/repos/"+user+"/"+repo+"/git/trees/"+branch;
						break;
				}
			}
			
			this.oauth.sendRequest(url, function(data) {
				data = JSON.parse(data);
				
				switch(type) {
					case "github":
						for(var i in data) {
							books.push({
								id:	"github:branches:"+data[i].owner.login+":"+data[i].name,
								title:	data[i].name
							});
						}
						break;
					case "branches":
						for(var i in data) {
							books.push({
								id:	"github:tree:"+user+":"+repo+":"+data[i].commit.sha+":"+data[i].name,
								title:	data[i].name
							});
						}
						break;
					case "tree":
						var items = data.tree;
						for(var i in items) {
							books.push({
								id:	(items[i].type == "blob") ? "" : "github:tree:"+user+":"+repo+":"+items[i].sha+":"+path+"/"+items[i].path,
								title:	items[i].path,
								url:	(items[i].type == "tree") ? "" : "https://github.com/"+user+"/"+repo+"/blob/"+path+"/"+items[i].path
							});
						}
						break;
				}
				
				if(typeof(callback) == "function") callback(books);
			});
		}
	});
	
	SourcePrototype.apply(GitHub, {
		id:					"github",
		name:				"GitHub",
		description:		chrome.i18n.getMessage("requestAccess", [
									chrome.i18n.getMessage("repositories"),
									"GitHub"
								]),
		image:				"img/github.png",
		connection: {
			type:		"internal",
			method:	"oauth2",
			config: {
				"name":				"github",
				"redirect_uri":		"https://github.com/login/oauth/authorize",
				"access_uri":			"https://github.com/login/oauth/access_token",
				"client_id":			"99fc10b9b460cf3456c4",
				"client_secret":		"7bbf95aaae511f80f25c6a0c0935a4d3d4332a2e",
				"scope":				"repo,user"
			}
		},
		permissions: [
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("repositories")
		],
		features: [
			"list"
		],
		content: [
			//???
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
