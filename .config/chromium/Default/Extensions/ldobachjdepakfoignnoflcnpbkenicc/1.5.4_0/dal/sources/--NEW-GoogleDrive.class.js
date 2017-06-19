/*
GoogleDrive extends OAuth
*/
(function() {
	var GoogleDrive = (function(config) {
		var _this = this;
		var _config = config;
		
		this.hasConnectivity = function(callback, attr) {
			//GoogleDrive.prototype.hasConnectivity(callback, attr, "https://docs.google.com");
		}

		this.getContent = function(content, callback) {
			//...
		}
		
		this.getChildren = function(chromeid, callback) {
			//...
		}
		
		this.search = function(query, maxResults, callback) {
			//...
		}
	});
	
	SourcePrototype.apply(GoogleDrive, {
		id:				"gdrive",
		name:			"Google Drive",
		description:	chrome.i18n.getMessage("requestAccess", [
								chrome.i18n.getMessage("files"),
								"Google Drive"
							]),
		image:			"img/gdrive.png",
		connection: {
			type:		"internal",
			method:	"oauth2",
			config: {
				"name":				"gdrive",
				"redirect_uri":		"https://accounts.google.com/o/oauth2/auth",
				"client_id":		"anonymous",
				"client_secret":	"anonymous",
				"scope":			"https://www.googleapis.com/auth/drive",
				"response_type":	"token"
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
			"audio",
			"images",
			"videos"
		],
		switches: [
			"subchapterTitle"
		]
	});
})();
