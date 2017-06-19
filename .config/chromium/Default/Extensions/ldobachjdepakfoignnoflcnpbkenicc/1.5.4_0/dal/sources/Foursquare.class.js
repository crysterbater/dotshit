/*
Foursquare extends OAuth2

https://developer.foursquare.com/overview/versioning
*/
(function() {
	var Foursquare = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			Foursquare.prototype.hasConnectivity(callback, attr, "https://foursquare.com");
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			var parameters = {
				method: "GET",
				parameters: {
					v: "20130208"
				}
			}
			
			this.oauth.sendRequest("https://api.foursquare.com/v2/users/self", function(data) {
				var user = JSON.parse(data).response.user;
				
				var name = user.firstName;
				if(name) {
					name += " ";
				}
				if(user.lastName) {
					name += user.lastName;
				}
				
				if(callback) callback({
					name: name,
					image: user.photo.prefix + "100x100" + user.photo.suffix,
					url: "https://foursquare.com/user/"+user.id
				});
			}, parameters);
		}
		
		this.getContent = function(content, callback) {
			this.getChildren("foursquare", function(books) {
				if(callback) callback("foursquare", books);
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			var parameters = {
				method: "GET",
				parameters: {
					limit: 50,
					v: "20130208"
				}
			}
			
			this.oauth.sendRequest("https://api.foursquare.com/v2/users/self/photos", function(data, resp) {
				var items = JSON.parse(data).response.photos.items;
				
				var books = [];
				for(var i in items) {
					var item = items[i];
					
					var image = item.prefix + "100x100" + item.suffix;
					
					books.push({
						id: item.id,
						title: item.venue.name,
						image: image,
						url: "https://foursquare.com/view_photo?id="+item.id,
						size: "image"
					});
				}
				if(callback) callback(books);
			}, parameters);
		}
	});
	
	SourcePrototype.apply(Foursquare, {
		id: "foursquare",
		name: "Foursquare",
		description: chrome.i18n.getMessage("requestAccess", [
			chrome.i18n.getMessage("images"),
			"Foursquare"
		]),
		image: "img/foursquare.png",
		connection: {
			type: "internal",
			method: "oauth2",
			config: {
				"name": "foursquare",
				"redirect_uri": "https://foursquare.com/oauth2/authorize",
				"access_uri": "https://foursquare.com/oauth2/access_token",
				"client_id": "NENBJXSD5GY2NABGYZFVOWFJLTIO3DECRFP1ZQO2IRU4RSWH",
				"scope": "basic",
				"response_type": "token",
				tmp: {
					tokenParamName:	"oauth_token"
				}
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
