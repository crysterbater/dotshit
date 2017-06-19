/*
OAuth extends SourcePrototype
> ChromeExOAuth oauth
- connectToAccount()
- editConnectionWithAccount()
	
	OAuthConfig
	> String request_url
	> String authorize_url
	> String access_url
	> String consumer_key
	> String consumer_secret
	> String scope
	> String app_name
*/

var OAuth = (function(config, oauthConfig) {
	this.__proto__ = new SourcePrototype(config);
	var _this = this;
	
	this.__defineGetter__("oauth", function() {
		return ChromeExOAuth.initBackgroundPage(oauthConfig);
	});
	
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
			//console.log("initiate OAuth...");
			
			//open port listener
			chrome.extension.onConnect.addListener(function(port) {
				_this.port = port;
				
				console.assert(port.name == "oauth");
				port.onMessage.addListener(function(msg) {
					//console.log(msg.method, msg);
					switch(msg.method) {
						case "GET":
							port.postMessage({
								id:		msg.id,
								method:"GET",
								object:	msg.object,
								value:	window[msg.object]
							});
							break;
						case "SET":
							window[msg.object] = msg.value;
							
							port.postMessage({
								id:	msg.id
							});
							break;
						case "EXEC":
							switch(msg.object) {
								case "chromeExOAuthOnAuthorize":
									window.chromeExOAuthOnAuthorize(msg.param.token, msg.param.secret);
									break;
							}
							
							port.postMessage({
								id:	msg.id
							});
							break;
						case "LOG":
							console.log(msg.value);
							break;
					}
				});
			});
			
			_this.oauth.authorize(function() {
				chrome.tabs.getCurrent(function(tab) {
					chrome.tabs.update(tab.id, {
						selected: true
					});
				});
				
				Main.buildRefresh();
				//_this.port.disconnect();
				
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
