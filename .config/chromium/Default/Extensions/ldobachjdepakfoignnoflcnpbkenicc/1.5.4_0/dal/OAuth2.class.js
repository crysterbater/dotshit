/*
OAuth2 extends SourcePrototype
> ChromeExOAuth2 oauth
- connectToAccount()
- editConnectionWithAccount()
	
	OAuth2Config
	> String name
	> String client_id
	> String client_secret
	> String redirect_uri
	> String access_uri
	> String scope
*/

var OAuth2 = (function(config, oauthConfig) {
	this.__proto__ = new SourcePrototype(config);
	var _this = this;
	
	this.__defineGetter__("oauth", function() {return ChromeExOAuth2.getInstance(oauthConfig);});
	
	this.isEnabled = function(callback) {
		if(typeof(callback)=="function") callback(_this.oauth.hasToken());
	}
	
	this.connectToAccount = function() {
		var action = "connect";
		if(this.oauth.hasToken()) {
			action = "reconnect";
			Cache.clear(this.ID);
		}
		FormBuilder.build("info", "source:"+action, FormBuilder.sourceToBook(this, function(callback) {
			chrome.extension.onConnect.addListener(function(port) {
				console.assert(port.name == "oauth2");
				port.onMessage.addListener(function(msg, sender) {
					switch(msg.method) {
						case "SET_TOKEN":
							_this.oauth.finish(msg.data);
							break;
					}
				});
				
				port.postMessage({
					method:	"GET_CONFIG",
					data:		oauthConfig
				});
			});
			
			_this.oauth.authorize(function() {
				chrome.tabs.getCurrent(function(tab) {
					chrome.tabs.update(tab.id, {
						selected: true
					});
				});
				
				Main.buildRefresh();
				
				if(callback) callback();
				
				if(_gaq) _gaq.push(["_trackEvent", "Features", action, _this.NAME]);
			});
		}));
	}
	
	this.editConnectionWithAccount = function() {
		FormBuilder.build("info", "source:edit", FormBuilder.sourceToBook(this, function(callback) {
			_this.oauth.clearTokens();
			
			if(callback) callback();
			
			if(_gaq) _gaq.push(["_trackEvent", "Features", "disconnect", _this.NAME]);
		}));
	}
});
