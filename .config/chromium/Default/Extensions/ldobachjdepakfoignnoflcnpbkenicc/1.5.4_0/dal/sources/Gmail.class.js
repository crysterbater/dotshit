/*
Gmail extends OAuth
*/
(function() {
	var Gmail = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			Gmail.prototype.hasConnectivity(callback, attr, "https://mail.google.com/mail/feed/atom");
		}
		
		this.getBadgeText = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			this.oauth.sendSignedRequest("https://mail.google.com/mail/feed/atom", function(data) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(data, "text/xml");
				
				var mailCounter = xmlDoc.getElementsByTagName("fullcount")[0].childNodes[0].nodeValue;
				if(callback) callback(mailCounter);
			});
		}
		
		this.getProfileInfo = function(callback) {
			if(!this.oauth.hasToken()) {
				return;
			}
			
			this.oauth.sendSignedRequest("https://mail.google.com/mail/feed/atom", function(data) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(data, "text/xml");
				
				var name = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue.match(/[\-\w]+@[\-\w]+\.\w+/)[0];
				
				if(callback) callback({
					name:	name
				});
			});
		}
		
		this.getChildren = function(chromeid, callback) {
			if(!this.oauth.hasToken()) {
				this.connectToAccount();
				return;
			}
			
			var books = [];
			
			this.oauth.sendSignedRequest("https://mail.google.com/mail/feed/atom", function(data) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(data, "text/xml");
				
				var entries = xmlDoc.getElementsByTagName("entry");
				
				books.push({
					title:	chrome.i18n.getMessage("gmail_inbox"),
					url:	"https://mail.google.com/mail/"
				});
				
				for(var i in entries) {
					if(typeof(entries[i]) == "object") {
						var title = entries[i].getElementsByTagName("title")[0].childNodes[0];
						books.push({
							title:	title && title.nodeValue,
							url:	entries[i].getElementsByTagName("link")[0].attributes.getNamedItem("href").nodeValue
						});
					}
				}
		
				if(callback) callback(books);
			});
		}
	});

	SourcePrototype.apply(Gmail, {
		id:					"gmail",
		name:				"Gmail",
		description:		chrome.i18n.getMessage("requestAccess", [
									chrome.i18n.getMessage("emails"),
									"Gmail"
								]),
		image:				"img/gmail.png",
		badgeColor:		"#D55",
		connection: {
			type:		"internal",
			method:	"oauth",
			cacheDuration: 30,
			config: {
				"request_url":		"https://www.google.com/accounts/OAuthGetRequestToken",
				"authorize_url":		"https://www.google.com/accounts/OAuthAuthorizeToken",
				"access_url":			"https://www.google.com/accounts/OAuthGetAccessToken",
				"consumer_key":	"anonymous",
				"consumer_secret":"anonymous",
				"scope":				"https://mail.google.com/mail/feed/atom/",
				"app_name":			"nexos"
			}
		},
		permissions:		[
			chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("emailSubjects")
		],
		features: [
			"badge",
			"list"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
